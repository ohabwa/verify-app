# Verify - B2B AI Content Verification API

> **🚀 Deploy Now**: Follow [LAUNCH.md](LAUNCH.md) for step-by-step deployment in 15 minutes.

A high-accuracy AI content detection platform designed for enterprise B2B use cases. Verify helps content publishers, legal firms, and healthcare organizations detect AI-generated content with industry-leading low false positive rates.

## Features

- **Text Verification API** - Detect AI-generated text with ensemble ML (statistical + transformer)
- **Low False Positives** - Target <2% false positive rate (vs industry average 5-15%)
- **Developer Dashboard** - API key management, usage analytics, and code examples
- **REST API** - Easy integration with any platform or language
- **B2B First** - Built for enterprise requirements (SLA, rate limiting, API keys)
- **API Key Management** - Generate, list, revoke keys with rate limit tiers

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│   Dashboard │ Verify │ API Keys │ Usage │ Docs                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI/Python)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /v1/verify  │  │ /v1/keys    │  │ /v1/usage   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          │                                      │
│  ┌──────────────────────┼──────────────────────┐               │
│  │         Ensemble Analyzer                    │               │
│  │  ┌─────────────┐    ┌─────────────────┐    │               │
│  │  │ Statistical │ +  │ ML (RoBERTa)    │    │               │
│  │  │ Perplexity  │    │ Transformer     │    │               │
│  │  │ Burstiness  │    │ Detector        │    │               │
│  │  └─────────────┘    └─────────────────┘    │               │
│  └─────────────────────────────────────────────┘               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐          ┌──────────┐
   │PostgreSQL│        │  Redis   │          │   GPU    │
   │  (data)  │        │ (cache)  │          │ (ML inf) │
   └──────────┘        └──────────┘          └──────────┘
```

## Tech Stack

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy (async)
- **Frontend**: Next.js 14 / React / TypeScript / Tailwind CSS
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ML Models**: PyTorch + Transformers (RoBERTa-based ensemble)
- **Container**: Docker / Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/verify-app.git
cd verify-app

# Start all services
docker-compose up -d

# API will be available at http://localhost:8000
# Dashboard at http://localhost:3000
# API docs at http://localhost:8000/docs
```

### Local Development

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Configuration

### Environment Variables

**Backend (.env):**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgresql+asyncpg://postgres:postgres@localhost:5432/verify | PostgreSQL connection |
| `REDIS_URL` | redis://localhost:6379/0 | Redis connection |
| `SECRET_KEY` | change-me | JWT signing key |
| `API_KEY_HEADER` | X-API-Key | Header for API key auth |
| `APP_NAME` | Verify API | Application name |
| `APP_VERSION` | 0.1.0 | Version string |

**Frontend (.env.local):**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | Backend API URL |

### Rate Limiting Tiers

| Tier | Requests/Minute | Target Audience |
|------|-----------------|-----------------|
| Starter | 100 | Small teams, testing |
| Pro | 1,000 | Growing businesses |
| Enterprise | Unlimited | Large organizations |

## API Reference

### Authentication

All API requests require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: verify_your_api_key" \
  https://api.verify.com/v1/health
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/health` | GET | Health check |
| `/v1/verify/text` | POST | Verify single text |
| `/v1/verify/batch` | POST | Batch verify (up to 100) |
| `/v1/keys` | POST | Create new API key |
| `/v1/keys` | GET | List user's API keys |
| `/v1/keys/{id}` | DELETE | Revoke an API key |
| `/v1/usage` | GET | Get usage statistics |

### Example Request

```bash
curl -X POST http://localhost:8000/v1/verify/text \
  -H "X-API-Key: verify_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text to verify...",
    "return_signals": true
  }'
```

### Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ai_probability": 0.85,
  "confidence": "high",
  "signals": [
    {
      "name": "perplexity",
      "value": 0.92,
      "description": "Low text complexity"
    },
    {
      "name": "burstiness", 
      "value": 0.15,
      "description": "Uniform sentence length"
    },
    {
      "name": "ml_score",
      "value": 0.89,
      "description": "Transformer model probability of AI generation"
    }
  ],
  "model_version": "ensemble-v1.0(statistical=0.4, ml=0.6)",
  "processing_time_ms": 234
}
```

## Project Structure

```
verify-app/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   │   ├── verify.py
│   │   │   ├── keys.py
│   │   │   ├── usage.py
│   │   │   └── health.py
│   │   ├── core/         # Config, security
│   │   ├── db/           # Database models & connection
│   │   ├── models/       # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   │   ├── text_analyzer.py    # Statistical analysis
│   │   │   ├── ml_analyzer.py      # ML/Transformer analysis
│   │   │   ├── api_key_service.py  # API key management
│   │   │   └── rate_limiter.py     # Redis rate limiting
│   │   └── main.py       # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── verify/       # Text verification
│   │   ├── keys/         # API key management
│   │   ├── usage/        # Usage statistics
│   │   └── docs/         # Documentation
│   ├── components/       # React components
│   ├── lib/              # Utilities, API client
│   └── package.json
├── init.sql              # PostgreSQL schema
├── docker-compose.yml
└── README.md
```

## 🚀 Deploy Now

**New to deployment?** Start with [LAUNCH.md](LAUNCH.md) - a simple step-by-step guide that takes you through creating accounts and deploying in 15 minutes.

**For detailed technical documentation**, see [DEPLOY.md](DEPLOY.md).

### One-Click Deploy Buttons

**Railway (Backend):**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/YOUR_USERNAME/verify-app&directory=backend)

**Vercel (Frontend):**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/verify-app&directory=frontend)

### Required Secrets for GitHub Actions

| Secret | Where to Get |
|--------|--------------|
| `RAILWAY_TOKEN` | Railway.app → Account |
| `VERCEL_TOKEN` | Vercel.com → Account Tokens |
| `VERCEL_ORG_ID` | Vercel → Team Settings |
| `VERCEL_PROJECT_ID` | Vercel → Project Settings |

## Deployment

### Staging Deployment

1. **Backend (Railway/Render):**
   - Connect GitHub repo
   - Set environment variables (DATABASE_URL, REDIS_URL, SECRET_KEY)
   - Railway auto-detects Docker or use `uvicorn app.main:app`

2. **Frontend (Vercel):**
   - Import GitHub repo
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Auto-deploys on main branch

3. **Database (Supabase/Railway PostgreSQL):**
   - Create PostgreSQL instance
   - Run `init.sql` schema
   - Set connection URL in backend env

4. **Redis (Redis Cloud/Railway):**
   - Create Redis instance
   - Set URL in backend env

### Production Deployment (Tags)

```bash
# Create a release tag for production deployment
git tag v1.0.0
git push origin v1.0.0
```

### Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Configure CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy for PostgreSQL
- [ ] Set up domain/DNS

## Development Status

**MVP Complete:**
- [x] Text verification endpoint with ensemble ML
- [x] Statistical analysis (perplexity, burstiness)
- [x] ML analysis (RoBERTa transformer model)
- [x] API key authentication with hash storage
- [x] API key management (create, list, revoke)
- [x] Rate limiting by tier (Redis-based)
- [x] Usage tracking and logging
- [x] Developer dashboard (Next.js)
- [x] API key management UI
- [x] Usage statistics display
- [x] Docker Compose setup
- [x] PostgreSQL schema

**In Progress:**
- [ ] Image verification
- [ ] Video verification

**Planned (Phase 2):**
- [ ] Enterprise SSO (SAML)
- [ ] Webhook notifications
- [ ] Advanced analytics
- [ ] Custom model fine-tuning

## License

Proprietary - All rights reserved