'use client'

import { Sidebar } from '@/components/Sidebar'

export default function DocsPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-200 px-8 py-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Documentation</h2>
          <p className="text-sm text-neutral-500">API reference and integration guides</p>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl">
            {/* API Base URL */}
            <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
              <div className="text-sm text-neutral-400 mb-2">Base URL</div>
              <code className="text-lg">https://api.verify.com/v1</code>
            </div>

            {/* Authentication */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Authentication</h3>
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <p className="text-neutral-600 mb-4">
                  All API requests require an API key passed in the <code className="bg-neutral-100 px-2 py-1 rounded">X-API-Key</code> header.
                </p>
                <div className="bg-neutral-900 text-white rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
{`curl -H "X-API-Key: verify_your_api_key" \\
  https://api.verify.com/v1/health`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Endpoints */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Endpoints</h3>
              
              {/* Health */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">GET</span>
                  <code className="text-sm font-mono">/health</code>
                </div>
                <p className="text-neutral-600 mb-4">Check API health status.</p>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-sm text-neutral-500 mb-2">Response</div>
                  <pre className="text-sm text-neutral-800">
{`{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2025-01-14T12:00:00Z"
}`}
                  </pre>
                </div>
              </div>

              {/* Verify Text */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">POST</span>
                  <code className="text-sm font-mono">/verify/text</code>
                </div>
                <p className="text-neutral-600 mb-4">Verify if text is AI-generated.</p>
                
                <div className="text-sm font-medium text-neutral-700 mb-2">Request Body</div>
                <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                  <pre className="text-sm text-neutral-800">
{`{
  "text": "Your text to verify...",
  "return_signals": true
}`}
                  </pre>
                </div>

                <div className="text-sm font-medium text-neutral-700 mb-2">Response</div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <pre className="text-sm text-neutral-800">
{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ai_probability": 0.85,
  "confidence": "high",
  "signals": [
    {
      "name": "perplexity",
      "value": 0.92,
      "description": "Low text complexity"
    }
  ],
  "model_version": "v0.1.0",
  "processing_time_ms": 234
}`}
                  </pre>
                </div>
              </div>

              {/* Batch Verify */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">POST</span>
                  <code className="text-sm font-mono">/verify/batch</code>
                </div>
                <p className="text-neutral-600 mb-4">Batch verify multiple texts.</p>
                
                <div className="text-sm font-medium text-neutral-700 mb-2">Request Body</div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <pre className="text-sm text-neutral-800">
{`{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "return_signals": false
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* SDK Examples */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">SDK Examples</h3>
              
              <div className="grid gap-4">
                {/* Python */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-neutral-700">Python</span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <pre className="text-sm text-neutral-800">
{`import requests

api_key = "verify_your_api_key"
url = "https://api.verify.com/v1/verify/text"

response = requests.post(url, json={
    "text": "Your text to verify",
    "return_signals": True
}, headers={"X-API-Key": api_key})

result = response.json()
print(f"AI Probability: {result['ai_probability']}")`}
                    </pre>
                  </div>
                </div>

                {/* Node.js */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-neutral-700">Node.js</span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <pre className="text-sm text-neutral-800">
{`const response = await fetch('https://api.verify.com/v1/verify/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'verify_your_api_key'
  },
  body: JSON.stringify({
    text: 'Your text to verify',
    return_signals: true
  })
});

const result = await response.json();
console.log(\`AI Probability: \${result.ai_probability}\`);`}
                    </pre>
                  </div>
                </div>

                {/* Go */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-neutral-700">Go</span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <pre className="text-sm text-neutral-800">
{`package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    body, _ := json.Marshal(map[string]interface{}{
        "text": "Your text to verify",
        "return_signals": true,
    })
    
    req, _ := http.NewRequest("POST", 
        "https://api.verify.com/v1/verify/text", 
        bytes.NewBuffer(body))
    req.Header.Set("X-API-Key", "verify_your_api_key")
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Error Codes */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Error Codes</h3>
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Code</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="px-6 py-3"><code className="text-sm text-red-600">400</code></td>
                      <td className="px-6 py-3 text-sm text-neutral-600">Invalid request (text too short, malformed JSON)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3"><code className="text-sm text-red-600">401</code></td>
                      <td className="px-6 py-3 text-sm text-neutral-600">Invalid or missing API key</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3"><code className="text-sm text-red-600">429</code></td>
                      <td className="px-6 py-3 text-sm text-neutral-600">Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3"><code className="text-sm text-red-600">500</code></td>
                      <td className="px-6 py-3 text-sm text-neutral-600">Internal server error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Rate Limits */}
            <section>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Rate Limits</h3>
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <p className="text-neutral-600 mb-4">
                  API requests are rate limited to ensure fair usage and system stability.
                </p>
                <ul className="space-y-2 text-neutral-700">
                  <li>• <strong>Starter plan:</strong> 100 requests/minute</li>
                  <li>• <strong>Pro plan:</strong> 1,000 requests/minute</li>
                  <li>• <strong>Enterprise:</strong> Custom limits</li>
                </ul>
                <p className="text-sm text-neutral-500 mt-4">
                  Rate limit information is included in response headers:
                </p>
                <div className="bg-neutral-50 p-4 rounded-lg mt-2">
                  <pre className="text-sm text-neutral-800">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705320000`}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}