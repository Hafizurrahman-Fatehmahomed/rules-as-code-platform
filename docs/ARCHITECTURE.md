# Architecture Guide

## Rules-as-Code Platform Architecture

This document describes the technical architecture of the Rules-as-Code Platform, a production-ready system for transparent Dutch pension, tax, and benefits calculations.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Next.js)                 │
│         Scenario Builder | Comparison | Rule Explorer        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  FastAPI Backend (Python)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Routes                                             │  │
│  │  ├─ /api/v1/scenarios      (Create, Compare)           │  │
│  │  ├─ /api/v1/rules           (Rule definitions)         │  │
│  │  ├─ /api/v1/calculations    (Detailed calculations)    │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Rules Engine                                           │  │
│  │  ├─ Tax Calculations (2025 brackets)                   │  │
│  │  ├─ Social Security (AOW, WW)                          │  │
│  │  ├─ Benefits (Huurtoeslag, Zorgtoeslag, etc)          │  │
│  │  ├─ Pension Contributions                              │  │
│  │  └─ Net Income Calculation (All combined)              │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────┬───────────────────┬────────────────────────┘
                 │                   │
        ┌────────▼────────┐  ┌──────▼──────────┐
        │  PostgreSQL DB  │  │  Redis Cache    │
        │  (Persistence)  │  │  (Performance)  │
        └─────────────────┘  └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Visualization**: Recharts (for future charts)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn
- **Database**: PostgreSQL (for persistence)
- **Cache**: Redis (for performance)
- **ORM**: SQLAlchemy (async)
- **Validation**: Pydantic

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose (local development)
- **CI/CD**: GitHub Actions (can be configured)

## Core Components

### 1. Rules Engine (`backend/src/rules_engine/`)

The heart of the system - pure Python implementation of Dutch tax and benefits rules.

```
calculator.py
├─ TAX_BRACKETS_2025          # 2025 tax brackets with rates
├─ ALLOWANCES                 # Tax allowances
├─ AOW/WW RATES              # Social security rates
├─ calculate_income_tax_2025()      # Tax calculation with traceability
├─ calculate_huurtoeslag()          # Housing benefit
├─ calculate_zorgtoeslag()          # Healthcare subsidy
├─ calculate_kindgebonden_budget()  # Child benefits
└─ calculate_net_income()           # Complete calculation
```

**Key Features:**
- Each calculation function returns detailed steps and legal references
- All percentages and thresholds are configurable for future years
- Calculations are deterministic and testable
- Full calculation trace for transparency

### 2. API Layer (`backend/src/api/`)

RESTful endpoints organized by function:

```
scenarios.py
├─ POST /scenarios              # Create scenario
├─ GET /scenarios/{id}          # Get scenario
├─ GET /scenarios              # List scenarios
├─ POST /scenarios/compare      # Compare multiple
└─ DELETE /scenarios/{id}       # Delete

rules.py
├─ GET /rules                  # List all rules
├─ GET /rules/{id}             # Get rule details
├─ GET /rules/trace/{id}       # Trace rule calculation
├─ GET /rules/dependencies/{id} # Show rule dependencies
└─ GET /rules/impact-analysis   # Rule impact analysis

calculations.py
├─ POST /calculations/scenario       # Full scenario calc
├─ POST /calculations/tax-analysis   # Deep tax analysis
├─ POST /calculations/benefits-analysis # Benefits analysis
├─ POST /calculations/threshold-analysis # Threshold crossing
└─ POST /calculations/scenario-delta # Compare two scenarios
```

### 3. Frontend Components (`frontend/src/components/`)

React components for user interface:

```
ScenarioBuilder.tsx
├─ Input form for scenario parameters
├─ Real-time calculation
└─ Results visualization

ScenarioComparison.tsx
├─ Multi-scenario setup
├─ Side-by-side comparison
├─ Delta calculation
└─ Insights generation

RuleExplainer.tsx
├─ Rule catalog browser
├─ Interactive calculator
├─ Threshold analysis
└─ Legal reference links
```

## Data Flow

### Scenario Calculation Flow

```
1. User Input
   └─> ScenarioBuilder (Frontend)
       ├─ Gross income
       ├─ Pension %
       ├─ Housing costs
       ├─ Children
       └─ Marital status

2. HTTP Request
   └─> POST /api/v1/calculations/scenario

3. Backend Processing
   ├─ Validate input
   ├─ Calculate pension contribution
   ├─ Calculate taxable income
   ├─ Calculate income tax (with brackets)
   ├─ Calculate social security (AOW, WW)
   ├─ Check benefit eligibility
   ├─ Calculate benefits (housing, healthcare, children)
   └─ Calculate final net income

4. Response
   ├─ All calculations
   ├─ Calculation breakdown
   ├─ Tax bracket details
   ├─ Benefit eligibility
   └─ Effective tax rates

5. Frontend Display
   └─ Results in ScenarioBuilder
       ├─ Summary cards
       ├─ Breakdown table
       ├─ Benefits details
       └─ Tax bracket visualization
```

### Comparison Flow

```
1. User selects multiple scenarios
2. Each scenario is independently calculated
3. Deltas are computed for each field
4. Impacts are analyzed (which rules caused the difference)
5. Insights are generated (threshold crossings, etc.)
6. Results displayed in comparison view
```

## Rule Representation

Each rule follows this pattern:

```python
rule = {
    "id": "income_tax",
    "name": "Dutch Income Tax (Inkomstenbelasting)",
    "legal_reference": "Wet inkomstenbelasting 2001",
    "category": "tax",
    "year": 2025,
    "calculate": lambda params: calculation_function(params),
    "dependencies": ["other_rules"],
    "threshold_effects": True
}
```

## Calculation Transparency

Every calculation includes:

1. **Formula**: How the value was computed
2. **Legal Reference**: Which law/article applies
3. **Dependencies**: Which other rules were used
4. **Inputs**: What parameters were applied
5. **Steps**: Intermediate calculation steps
6. **Result**: Final value

Example:

```json
{
  "field": "income_tax",
  "steps": [
    {
      "step": 1,
      "description": "Apply general allowance",
      "value": 3107
    },
    {
      "step": 2,
      "description": "Apply labour allowance",
      "value": 1800
    },
    {
      "step": 3,
      "description": "Apply tax brackets",
      "brackets": [...]
    }
  ],
  "total_tax": 12345.67,
  "legal_reference": "Wet inkomstenbelasting 2001",
  "source": "Belastingdienst"
}
```

## Performance Optimization

### Caching Strategy

- **Redis Cache**: 
  - Cache rule definitions (TTL: 24h)
  - Cache tax bracket lookups (TTL: 24h)
  - Cache user scenarios (TTL: 30d)

- **Frontend Optimization**:
  - Lazy loading of components
  - Memoization of expensive calculations
  - Client-side caching of API responses

### Database Optimization

- **Indexes**:
  - User ID (for scenario queries)
  - Created date (for listing/sorting)
  - Scenario name (for search)

- **Query Optimization**:
  - Use parameterized queries
  - Batch operations where possible
  - Implement pagination for large result sets

## Security Considerations

1. **Input Validation**: All inputs validated with Pydantic
2. **CORS**: Configured for specific origins
3. **Rate Limiting**: Can be added at API level
4. **Data Privacy**: No personal data stored (calculation-only)
5. **HTTPS**: Required in production
6. **Error Handling**: Detailed errors in dev, generic in production

## Deployment Scenarios

### Local Development
```bash
docker-compose up
```
- All services run in containers
- Database initialized with schema
- Hot reload enabled for both frontend and backend

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```
- Optimized images
- No debug output
- Health checks enabled
- Persistent volumes for database

## Testing Strategy

```
├─ Unit Tests
│  ├─ Rule calculations (backend)
│  └─ Component rendering (frontend)
├─ Integration Tests
│  ├─ API endpoints
│  ├─ Rule dependencies
│  └─ E2E scenarios
└─ Performance Tests
   ├─ Calculation speed
   └─ API response times
```

## Extensibility

### Adding a New Rule

1. Add calculation function to `calculator.py`
2. Register in `RULES_CATALOG` in `rules.py`
3. Add dependencies in `RULE_DEPENDENCIES`
4. Create API endpoint if needed
5. Add tests
6. Update documentation

### Supporting a New Tax Year

1. Update tax brackets in `TAX_BRACKETS_2025`
2. Update allowances and thresholds
3. Update rates (AOW, WW, etc.)
4. Create new rule version with year=2026
5. Maintain backwards compatibility

### Multi-Country Support

The rules engine could be extended to:
1. Load rules by country parameter
2. Support multiple legal reference sources
3. Handle currency conversion
4. Account for regional variations

## Monitoring & Logging

- **Application Logs**: Structured logging to stdout (container-friendly)
- **Performance Metrics**: Can integrate with Prometheus
- **Health Checks**: `/health` endpoint for monitoring
- **Error Tracking**: Can integrate with Sentry

## Future Enhancements

1. **PDF Export**: Generate detailed reports
2. **Scenario Sharing**: Generate shareable links
3. **Historical Comparison**: Compare across years
4. **What-If Analysis**: Scenario optimization
5. **Mobile App**: React Native version
6. **AI Integration**: Recommendations engine
7. **Real-time Collaboration**: Multi-user scenarios
8. **Budget Planning**: Link to banking APIs

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For API documentation, see [API.md](./API.md)
