# Quick Start Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development without Docker)
- Python 3.11+ (for backend development)

## Option 1: Docker Compose (Recommended for Local Testing)

### 1. Clone and Setup

```bash
cd c:/code/rules-as-code-platform
```

### 2. Start Services

```bash
docker-compose up
```

This will start:
- **Backend** (FastAPI): http://localhost:8000
- **Frontend** (Next.js): http://localhost:3000
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Option 2: Local Development (Without Docker)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
rules-as-code-platform/
├── backend/                    # FastAPI application
│   ├── src/
│   │   ├── main.py            # FastAPI app initialization
│   │   ├── api/               # REST endpoints
│   │   │   ├── scenarios.py
│   │   │   ├── rules.py
│   │   │   └── calculations.py
│   │   ├── rules_engine/      # Core calculations
│   │   │   ├── calculator.py  # Tax & benefits rules
│   │   │   └── loader.py
│   │   ├── models/            # Data models
│   │   │   └── schemas.py
│   │   ├── services/          # Database, cache
│   │   └── config.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   │   ├── ScenarioBuilder.tsx
│   │   │   ├── ScenarioComparison.tsx
│   │   │   └── RuleExplainer.tsx
│   │   ├── lib/              # Utilities
│   │   └── styles/           # CSS
│   ├── package.json
│   └── Dockerfile
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml         # Local development
└── README.md
```

## Key Features

### 1. Build Scenarios 📊
- Enter personal financial data
- Adjust pension contribution percentage
- See real-time calculations
- View detailed breakdown

### 2. Compare Scenarios 🔄
- Set up multiple scenarios
- See side-by-side comparison
- Analyze deltas
- Get insights

### 3. Understand Rules 🔍
- Browse all rules
- See legal references
- Understand thresholds
- Test calculations

## API Examples

### Create Scenario

```bash
curl -X POST http://localhost:8000/api/v1/calculations/scenario \
  -H "Content-Type: application/json" \
  -d '{
    "gross_income": 50000,
    "pension_contribution_percentage": 5,
    "housing_costs": 400,
    "children_count": 0,
    "marital_status": "single"
  }'
```

### Compare Scenarios

```bash
curl -X POST http://localhost:8000/api/v1/scenarios/compare \
  -H "Content-Type: application/json" \
  -d '{
    "scenarios": [
      {
        "name": "Conservative",
        "base_income": 50000,
        "pension_contribution_percentage": 0,
        "housing_costs": 400,
        "children_count": 0,
        "marital_status": "single"
      },
      {
        "name": "Aggressive",
        "base_income": 50000,
        "pension_contribution_percentage": 15,
        "housing_costs": 400,
        "children_count": 0,
        "marital_status": "single"
      }
    ]
  }'
```

### Get Rules

```bash
curl http://localhost:8000/api/v1/rules
```

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXT_PUBLIC_API_URL`: Frontend API endpoint
- `ENVIRONMENT`: development | production

## Running Tests

### Backend Tests

```bash
cd backend
pytest tests/
pytest tests/ -v  # Verbose
pytest tests/ --cov  # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 8000 (backend)
lsof -i :8000

# Find process using port 3000 (frontend)
lsof -i :3000

# Kill by PID
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker ps

# Restart services
docker-compose down
docker-compose up

# Check logs
docker-compose logs db
```

### Redis Connection Error

```bash
# Verify Redis container
docker-compose logs redis

# Clear cache and restart
docker-compose down -v
docker-compose up
```

## Performance Optimization

### Frontend
- Next.js automatic code splitting
- Component lazy loading
- Image optimization
- CSS-in-JS with Tailwind

### Backend
- Redis caching for rule definitions
- Database connection pooling
- Async/await for I/O operations
- Calculated responses cached

## Next Steps

1. **Understand the Rules**: Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. **Explore the API**: Visit http://localhost:8000/docs
3. **Test Scenarios**: Use the UI at http://localhost:3000
4. **Review the Code**: Check backend calculations in `backend/src/rules_engine/calculator.py`
5. **Add Your Changes**: Follow the contribution guidelines

## Deployment

For production deployment:
- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

For API reference:
- See [docs/API.md](./docs/API.md)

---

**Ready to go!** Start with Docker Compose and explore the platform. 🚀
