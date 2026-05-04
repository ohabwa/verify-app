import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface VerifyTextRequest {
  text: string
  return_signals?: boolean
  model_version?: string
}

export interface VerifyTextResponse {
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
  created_at: string
}

export interface BatchVerifyRequest {
  texts: string[]
  return_signals?: boolean
}

export interface BatchVerifyResponse {
  batch_id: string
  results: VerifyTextResponse[]
  total_count: number
  processing_time_ms: number
}

export interface UsageStats {
  total_verifications: number
  api_calls_today: number
  quota_remaining: number
}

export class VerifyApiClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private getClient() {
    return axios.create({
      baseURL: API_URL,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })
  }

  async verifyText(request: VerifyTextRequest): Promise<VerifyTextResponse> {
    const response = await this.getClient().post<VerifyTextResponse>(
      '/v1/verify/text',
      request
    )
    return response.data
  }

  async verifyBatch(request: BatchVerifyRequest): Promise<BatchVerifyResponse> {
    const response = await this.getClient().post<BatchVerifyResponse>(
      '/v1/verify/batch',
      request
    )
    return response.data
  }

  async getUsage(): Promise<UsageStats> {
    const response = await this.getClient().get<UsageStats>('/v1/usage')
    return response.data
  }
}

// API key management
export interface ApiKey {
  id: string
  key: string
  name: string
  created_at: string
  last_used?: string
  usage_count: number
}

// Mock API key management for MVP
// In production, this would call backend API
export async function generateApiKey(name: string): Promise<ApiKey> {
  // Simulate API call
  return {
    id: crypto.randomUUID(),
    key: `verify_${Math.random().toString(36).substring(2, 15)}`,
    name,
    created_at: new Date().toISOString(),
    usage_count: 0,
  }
}

export async function listApiKeys(): Promise<ApiKey[]> {
  // Mock data for MVP
  return [
    {
      id: '1',
      key: 'verify_abc123...',
      name: 'Development Key',
      created_at: '2025-01-10T00:00:00Z',
      last_used: '2025-01-14T12:00:00Z',
      usage_count: 150,
    },
  ]
}

export async function revokeApiKey(id: string): Promise<void> {
  // Simulate API call
  console.log('Revoking key:', id)
}