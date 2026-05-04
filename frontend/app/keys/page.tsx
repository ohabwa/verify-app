'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'

interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  last_used?: string
  usage_count: number
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Development Key',
      key: 'verify_sk_dev_abc123def456',
      created_at: '2025-01-10T10:00:00Z',
      last_used: '2025-01-14T15:30:00Z',
      usage_count: 156,
    },
    {
      id: '2',
      name: 'Production Key',
      key: 'verify_sk_prod_xyz789ghi012',
      created_at: '2025-01-08T08:00:00Z',
      last_used: '2025-01-14T12:00:00Z',
      usage_count: 2847,
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)

  const generateKey = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newKey = `verify_sk_${Math.random().toString(36).substring(2, 18)}`
    const keyObj: ApiKey = {
      id: crypto.randomUUID(),
      name: 'New Key',
      key: newKey,
      created_at: new Date().toISOString(),
      usage_count: 0,
    }
    setKeys([keyObj, ...keys])
    setNewKeyValue(newKey)
    setShowNewKey(true)
    setIsGenerating(false)
  }

  const revokeKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      setKeys(keys.filter((k) => k.id !== id))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-200 px-8 py-4">
          <h2 className="text-2xl font-semibold text-neutral-900">API Keys</h2>
          <p className="text-sm text-neutral-500">Manage your API credentials</p>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl">
            {/* New Key Modal */}
            {showNewKey && newKeyValue && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">API Key Created</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Copy this key now — you won't be able to see it again.
                    </p>
                    <div className="flex items-center gap-2 mt-3 bg-white p-3 rounded-lg border border-green-200">
                      <code className="flex-1 text-sm font-mono">{newKeyValue}</code>
                      <button
                        onClick={() => copyToClipboard(newKeyValue)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewKey(false)}
                    className="text-green-700 hover:text-green-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-neutral-600">
                API keys grant access to the Verify API. Keep them secure.
              </p>
              <button
                onClick={generateKey}
                disabled={isGenerating}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Generating...' : '+ Generate New Key'}
              </button>
            </div>

            {/* Keys List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Key</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Usage</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Created</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">Last Used</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4">
                        <span className="font-medium text-neutral-900">{key.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-neutral-600">
                          {key.key.slice(0, 12)}...{key.key.slice(-6)}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {key.usage_count.toLocaleString()} calls
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {key.last_used
                            ? new Date(key.last_used).toLocaleString()
                            : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {keys.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  No API keys yet. Generate one to get started.
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800">Security Best Practices</h4>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Never expose API keys in client-side code</li>
                <li>• Use environment variables to store keys</li>
                <li>• Rotate keys regularly</li>
                <li>• Use separate keys for development and production</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}