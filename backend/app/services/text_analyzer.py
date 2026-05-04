"""Text analysis service for AI detection.

This module implements statistical analysis for text verification:
- Perplexity: Measures text complexity/uniformity
- Burstiness: Measures sentence length variation

The service is designed to be extensible - real ML models can be swapped in later.
"""

import re
import math
from typing import List, Tuple, Dict, Any
import numpy as np


class TextAnalyzer:
    """
    Statistical text analysis for AI detection.
    
    Uses perplexity and burstiness metrics to detect AI-generated content.
    These metrics capture patterns that tend to differ between AI and human writing.
    """
    
    def __init__(self):
        """Initialize the text analyzer."""
        self.min_text_length = 50  # Minimum text for reliable analysis
        self.max_text_length = 50000  # Maximum text to process
        
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Perform comprehensive text analysis.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary containing analysis results and signals
        """
        if len(text) < self.min_text_length:
            return self._short_text_response(text)
        
        if len(text) > self.max_text_length:
            text = text[:self.max_text_length]
        
        # Calculate signals
        perplexity_score = self._calculate_perplexity(text)
        burstiness_score = self._calculate_burstiness(text)
        
        # Calculate overall AI probability
        ai_probability = self._calculate_ai_probability(perplexity_score, burstiness_score)
        
        # Determine confidence level
        confidence = self._calculate_confidence(perplexity_score, burstiness_score, len(text))
        
        # Build signals list
        signals = [
            {
                "name": "perplexity",
                "value": round(perplexity_score, 3),
                "description": self._perplexity_description(perplexity_score)
            },
            {
                "name": "burstiness",
                "value": round(burstiness_score, 3),
                "description": self._burstiness_description(burstiness_score)
            }
        ]
        
        return {
            "ai_probability": round(ai_probability, 3),
            "confidence": confidence,
            "signals": signals,
            "text_length": len(text),
            "word_count": len(text.split())
        }
    
    def _calculate_perplexity(self, text: str) -> float:
        """
        Calculate perplexity score (text complexity/uniformity).
        
        AI-generated text tends to have:
        - Lower perplexity (more predictable, uniform word choices)
        - Less variation in sentence structure
        - More "perfect" grammar and spelling
        
        Returns:
            Score between 0.0 (indicates AI) and 1.0 (indicates human)
        """
        # Tokenize text into words
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        if len(words) < 10:
            return 0.5  # Not enough data
        
        # Calculate word frequency distribution
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Calculate entropy (normalized)
        total_words = len(words)
        entropy = 0.0
        
        for freq in word_freq.values():
            p = freq / total_words
            if p > 0:
                entropy -= p * math.log2(p)
        
        # Normalize entropy to 0-1 range
        # Higher entropy = more diverse vocabulary = more human-like
        max_entropy = math.log2(len(word_freq)) if word_freq else 1
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0.5
        
        # Calculate vocabulary richness
        vocabulary_richness = len(word_freq) / len(words)
        
        # Combine metrics
        # Low vocabulary richness + low entropy = more likely AI
        perplexity_score = (normalized_entropy * 0.7 + vocabulary_richness * 0.3)
        
        # Invert so low complexity = low score = AI indicator
        # AI text tends to be "too perfect" - low entropy, low variation
        return 1.0 - perplexity_score
    
    def _calculate_burstiness(self, text: str) -> float:
        """
        Calculate burstiness score (sentence length variation).
        
        AI-generated text tends to have:
        - More uniform sentence lengths
        - Less variation in paragraph structure
        - "Bursts" of similar-length sentences
        
        Returns:
            Score between 0.0 (indicates AI) and 1.0 (indicates human)
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 3:
            return 0.5  # Not enough sentences
        
        # Calculate sentence lengths (in words)
        sentence_lengths = [len(s.split()) for s in sentences]
        
        # Calculate mean and standard deviation
        mean_length = np.mean(sentence_lengths)
        std_length = np.std(sentence_lengths)
        
        # Coefficient of variation (CV) - measure of variability
        cv = std_length / mean_length if mean_length > 0 else 0
        
        # Human text typically has higher CV (more variation)
        # AI text typically has lower CV (more uniform)
        
        # Normalize CV to 0-1 range
        # CV > 1.0 indicates high burstiness (human-like)
        # CV < 0.3 indicates low burstiness (AI-like)
        if cv > 1.5:
            burstiness = 0.9
        elif cv < 0.2:
            burstiness = 0.1
        else:
            # Linear mapping between 0.2 and 1.5 to 0.1 and 0.9
            burstiness = 0.1 + (cv - 0.2) * (0.8 / 1.3)
        
        return burstiness
    
    def _calculate_ai_probability(self, perplexity: float, burstiness: float) -> float:
        """
        Calculate overall AI probability from individual signals.
        
        Args:
            perplexity: Perplexity score (0-1, higher = more human)
            burstiness: Burstiness score (0-1, higher = more human)
            
        Returns:
            AI probability (0-1, higher = more likely AI)
        """
        # Weights for different signals
        PERPLEXITY_WEIGHT = 0.6
        BURSTINESS_WEIGHT = 0.4
        
        # Combine scores (perplexity and burstiness are inverted for AI detection)
        human_score = perplexity * PERPLEXITY_WEIGHT + burstiness * BURSTINESS_WEIGHT
        
        # Convert to AI probability
        ai_probability = 1.0 - human_score
        
        # Apply confidence adjustments based on score extremes
        if human_score > 0.85:
            # Very confident human
            ai_probability = min(ai_probability, 0.05)
        elif human_score < 0.25:
            # Very confident AI
            ai_probability = max(ai_probability, 0.95)
        
        return ai_probability
    
    def _calculate_confidence(
        self, 
        perplexity: float, 
        burstiness: float, 
        text_length: int
    ) -> str:
        """
        Determine confidence level based on analysis quality.
        
        Args:
            perplexity: Perplexity score
            burstiness: Burstiness score
            text_length: Length of input text
            
        Returns:
            Confidence level: "low", "medium", or "high"
        """
        # Higher confidence for longer texts
        length_factor = min(text_length / 500, 1.0)  # Cap at 500 words
        
        # Higher confidence when signals agree
        signal_agreement = abs(perplexity - burstiness)  # Low = agree
        agreement_factor = 1.0 - (signal_agreement / 2)  # Normalize to 0-1
        
        # Combined confidence score
        confidence_score = (length_factor * 0.4 + agreement_factor * 0.6)
        
        if confidence_score > 0.7:
            return "high"
        elif confidence_score > 0.4:
            return "medium"
        else:
            return "low"
    
    def _short_text_response(self, text: str) -> Dict[str, Any]:
        """Handle text that's too short for reliable analysis."""
        length = len(text)
        
        # Very short text - return uncertain result
        return {
            "ai_probability": 0.5,
            "confidence": "low",
            "signals": [
                {
                    "name": "length",
                    "value": length / 100,
                    "description": f"Text too short ({length} chars) for reliable analysis"
                }
            ],
            "text_length": length,
            "word_count": len(text.split())
        }
    
    def _perplexity_description(self, score: float) -> str:
        """Generate human-readable description of perplexity score."""
        if score < 0.3:
            return "High vocabulary uniformity - text uses similar word patterns repeatedly"
        elif score < 0.5:
            return "Moderately uniform vocabulary"
        elif score < 0.7:
            return "Moderately diverse vocabulary"
        else:
            return "High vocabulary diversity - varied word choices throughout"
    
    def _burstiness_description(self, score: float) -> str:
        """Generate human-readable description of burstiness score."""
        if score < 0.3:
            return "Very uniform sentence lengths - consistent structure"
        elif score < 0.5:
            return "Somewhat uniform sentence lengths"
        elif score < 0.7:
            return "Moderately varied sentence lengths"
        else:
            return "Highly varied sentence lengths - natural writing pattern"


# Singleton instance for use across requests
text_analyzer = TextAnalyzer()


def analyze_text(text: str) -> Dict[str, Any]:
    """
    Convenience function for text analysis.
    
    Args:
        text: Text to analyze
        
    Returns:
        Analysis result dictionary
    """
    return text_analyzer.analyze(text)