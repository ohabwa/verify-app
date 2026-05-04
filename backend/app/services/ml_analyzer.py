"""ML-based text analyzer using transformer models.

This module provides an ML-based analyzer that uses a pre-trained transformer
model for AI text detection. The interface is compatible with the statistical
analyzer for easy switching.
"""

import os
import time
from typing import Dict, Any, Optional
from functools import lru_cache

# Import transformers only when available
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    torch = None


class MLTextAnalyzer:
    """
    Transformer-based text analyzer for AI detection.
    
    Uses a pre-trained model (roberta-base-openai-detector or similar)
    to detect AI-generated text. Falls back to statistical analysis
    if the model is not available.
    """
    
    def __init__(self, model_name: str = "roberta-base-openai-detector"):
        """
        Initialize the ML analyzer.
        
        Args:
            model_name: HuggingFace model name or local path
        """
        self.model_name = model_name
        self._model = None
        self._tokenizer = None
        self._pipeline = None
        self._device = "cuda" if TRANSFORMERS_AVAILABLE and torch.cuda.is_available() else "cpu"
        
    def load_model(self):
        """Load the transformer model and tokenizer."""
        if not TRANSFORMERS_AVAILABLE:
            raise RuntimeError("transformers library not installed")
            
        if self._model is None:
            print(f"Loading model {self.model_name} on {self._device}...")
            start = time.time()
            
            self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self._model.to(self._device)
            self._model.eval()
            
            print(f"Model loaded in {time.time() - start:.2f}s")
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze text using the ML model.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with ai_probability, confidence, signals, etc.
        """
        if len(text) < 50:
            return self._short_text_response(text)
        
        if len(text) > 10000:
            text = text[:10000]
        
        # Run inference
        inputs = self._tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self._device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self._model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            
            # Model outputs: [0] = real/human, [1] = AI-generated
            ai_probability = probs[0][1].item()
            human_probability = probs[0][0].item()
        
        # Calculate confidence based on prediction strength
        max_prob = max(ai_probability, human_probability)
        if max_prob > 0.9:
            confidence = "high"
        elif max_prob > 0.7:
            confidence = "medium"
        else:
            confidence = "low"
        
        return {
            "ai_probability": ai_probability,
            "confidence": confidence,
            "signals": [
                {
                    "name": "ml_score",
                    "value": ai_probability,
                    "description": "Transformer model probability of AI generation"
                },
                {
                    "name": "human_score",
                    "value": human_probability,
                    "description": "Transformer model probability of human generation"
                }
            ],
            "model_name": self.model_name,
            "device": self._device,
            "text_length": len(text),
            "word_count": len(text.split())
        }
    
    def _short_text_response(self, text: str) -> Dict[str, Any]:
        """Handle text that's too short for reliable ML analysis."""
        return {
            "ai_probability": 0.5,
            "confidence": "low",
            "signals": [
                {
                    "name": "length",
                    "value": len(text) / 100,
                    "description": f"Text too short ({len(text)} chars) for reliable ML analysis"
                }
            ],
            "text_length": len(text),
            "word_count": len(text.split())
        }


@lru_cache(maxsize=1)
def get_ml_analyzer(model_name: str = "roberta-base-openai-detector") -> Optional[MLTextAnalyzer]:
    """
    Get a cached ML analyzer instance.
    
    Returns None if transformers is not available.
    """
    if not TRANSFORMERS_AVAILABLE:
        return None
    
    analyzer = MLTextAnalyzer(model_name)
    try:
        analyzer.load_model()
        return analyzer
    except Exception as e:
        print(f"Failed to load ML model: {e}")
        return None


class EnsembleAnalyzer:
    """
    Ensemble analyzer combining statistical and ML approaches.
    
    This provides the best accuracy by combining signals from multiple
    detection methods.
    """
    
    def __init__(
        self,
        statistical_weight: float = 0.4,
        ml_weight: float = 0.6,
        model_name: str = "roberta-base-openai-detector"
    ):
        """
        Initialize ensemble analyzer.
        
        Args:
            statistical_weight: Weight for statistical analysis (0-1)
            ml_weight: Weight for ML model (0-1)
            model_name: HuggingFace model for ML component
        """
        self.statistical_weight = statistical_weight
        self.ml_weight = ml_weight
        
        # Import statistical analyzer
        from app.services.text_analyzer import TextAnalyzer
        self.statistical_analyzer = TextAnalyzer()
        
        # Try to load ML analyzer
        self.ml_analyzer = get_ml_analyzer(model_name)
        
        if self.ml_analyzer is None:
            # Fall back to statistical only if ML not available
            self.statistical_weight = 1.0
            self.ml_weight = 0.0
            print("Warning: ML model not available, using statistical analysis only")
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Perform ensemble analysis combining statistical and ML signals.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with combined ai_probability, confidence, signals
        """
        # Get statistical analysis
        stat_result = self.statistical_analyzer.analyze(text)
        
        # Get ML analysis if available
        ml_result = None
        if self.ml_analyzer is not None:
            try:
                ml_result = self.ml_analyzer.analyze(text)
            except Exception as e:
                print(f"ML analysis failed: {e}")
        
        # Combine signals
        if ml_result is not None:
            # Weighted ensemble
            combined_prob = (
                stat_result["ai_probability"] * self.statistical_weight +
                ml_result["ai_probability"] * self.ml_weight
            )
            
            signals = stat_result.get("signals", []) + ml_result.get("signals", [])
            
            # Confidence is higher when both methods agree
            stat_ai = stat_result["ai_probability"] > 0.5
            ml_ai = ml_result["ai_probability"] > 0.5
            
            if stat_ai == ml_ai:
                base_confidence = "high"
            else:
                base_confidence = "medium"
        else:
            combined_prob = stat_result["ai_probability"]
            signals = stat_result.get("signals", [])
            base_confidence = stat_result.get("confidence", "medium")
        
        # Ensure probability is in valid range
        combined_prob = max(0.0, min(1.0, combined_prob))
        
        return {
            "ai_probability": combined_prob,
            "confidence": base_confidence,
            "signals": signals,
            "model_version": f"ensemble-v1.0(statistical={self.statistical_weight}, ml={self.ml_weight})",
            "text_length": len(text),
            "word_count": len(text.split())
        }


# Singleton instance
_ensemble_analyzer: Optional[EnsembleAnalyzer] = None


def get_ensemble_analyzer() -> EnsembleAnalyzer:
    """Get or create the ensemble analyzer singleton."""
    global _ensemble_analyzer
    if _ensemble_analyzer is None:
        _ensemble_analyzer = EnsembleAnalyzer()
    return _ensemble_analyzer


def analyze_with_ensemble(text: str) -> Dict[str, Any]:
    """
    Convenience function for ensemble analysis.
    
    Args:
        text: Text to analyze
        
    Returns:
        Analysis result dictionary
    """
    return get_ensemble_analyzer().analyze(text)