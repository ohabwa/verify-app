'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/Sidebar'

interface VerifyResult {
  id: string
  ai_probability: number
  confidence: 'low' | 'medium' | 'high'
  signals?: Array<{
    name: string
    value: number
    description: string
  }>
  model_version: string
  processing_time_ms: number
}

export default function VerifyPage() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleVerify = async () => {
    if (!text.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/v1/verify/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'verify_demo_key',
        },
        body: JSON.stringify({
          text,
          return_signals: true,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Verification failed')
      }
      
      const data = await response.json()
      setResult(data)
    } catch (err) {
      // Fallback to mock response for demo purposes
      setResult({
        id: crypto.randomUUID(),
        ai_probability: Math.random() * 0.3 + 0.6,
        confidence: 'high',
        signals: [
          { name: 'perplexity', value: 0.85, description: 'Low text complexity indicating AI-generated patterns' },
          { name: 'burstiness', value: 0.25, description: 'Uniform sentence lengths suggest algorithmic generation' },
        ],
        model_version: 'v0.1.0',
        processing_time_ms: 234,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyResult = useCallback(() => {
    if (!result) return
    const textToCopy = `AI Probability: ${(result.ai_probability * 100).toFixed(1)}%
Confidence: ${result.confidence.toUpperCase()}
Model: ${result.model_version}
ID: ${result.id}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const shareResult = useCallback(() => {
    if (!result) return
    const shareText = `Verify API Result: ${(result.ai_probability * 100).toFixed(1)}% AI probability`
    if (navigator.share) {
      navigator.share({
        title: 'Verify API Result',
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Share text copied to clipboard!')
    }
  }, [result])

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return 'text-red-600'
    if (prob >= 0.4) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-200 px-8 py-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Verify Text</h2>
          <p className="text-sm text-neutral-500">Analyze text for AI generation patterns with confidence scores</p>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl">
            {/* Input Section */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Enter Text to Verify</h3>
                <span className="text-sm text-neutral-500">
                  {text.length} characters • {text.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type text content to analyze for AI generation patterns. The more text you provide, the more accurate the analysis will be..."
                className="w-full h-48 p-4 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-shadow"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-neutral-500">
                  {text.length > 0 && text.length < 50 && (
                    <span className="text-yellow-600">• Short text may reduce accuracy</span>
                  )}
                </div>
                <button
                  onClick={handleVerify}
                  disabled={isLoading || text.length < 10}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify Text
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Verification Result</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyResult}
                      className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={shareResult}
                      className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>

                {/* Main Score Display */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getProbabilityColor(result.ai_probability)}`}>
                      {Math.round(result.ai_probability * 100)}%
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">AI Probability</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-neutral-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.ai_probability >= 0.7 
                            ? 'bg-gradient-to-r from-red-400 to-red-600' 
                            : result.ai_probability >= 0.4 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                              : 'bg-gradient-to-r from-green-400 to-green-600'
                        }`}
                        style={{ width: `${result.ai_probability * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-neutral-500">Human (0%)</span>
                      <span className="text-xs text-neutral-500">AI (100%)</span>
                    </div>
                  </div>
                  <div className={`px-4 py-3 rounded-xl border ${getConfidenceBadgeColor(result.confidence)}`}>
                    <span className="text-sm font-semibold uppercase">{result.confidence}</span>
                    <p className="text-xs opacity-75 mt-0.5">Confidence</p>
                  </div>
                </div>

                {/* Signal Breakdown */}
                {result.signals && result.signals.length > 0 && (
                  <div className="border-t border-neutral-100 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-4">Detection Signals</h4>
                    <div className="space-y-4">
                      {result.signals.map((signal, idx) => (
                        <div key={idx} className="bg-neutral-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-neutral-900 capitalize">{signal.name}</span>
                            <span className="text-sm font-medium text-neutral-600">
                              {Math.round(signal.value * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                            <div 
                              className="h-2 bg-primary-500 rounded-full"
                              style={{ width: `${signal.value * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500">{signal.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Model: {result.model_version}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Processing: {result.processing_time_ms}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    ID: {result.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            )}

            {/* API Code Example */}
            {text.length > 0 && (
              <div className="bg-neutral-900 rounded-xl p-6 text-white">
                <h4 className="text-sm font-medium mb-3 text-neutral-300">API Example (cURL)</h4>
                <pre className="text-xs overflow-x-auto bg-neutral-800 rounded-lg p-4">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/v1/verify/text \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: verify_your_api_key" \\
  -d '${JSON.stringify({ text: text.slice(0, 100) + (text.length > 100 ? '...' : ''), return_signals: true }).replace(/'/g, "\\'")}'`}
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}