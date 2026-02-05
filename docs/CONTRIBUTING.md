# Contributing Guidelines

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Setup

```bash
# Clone repository
git clone <repo-url>
cd rules-as-code-platform

# Start development environment
docker-compose up

# In another terminal, set up pre-commit hooks
pip install pre-commit
pre-commit install
```

## Code Structure

### Backend Architecture

```
backend/src/
├── main.py              # FastAPI app & middleware
├── config.py            # Configuration management
├── api/                 # REST endpoint handlers
├── rules_engine/        # Core calculation logic
├── models/              # Data validation schemas
└── services/            # Database & cache utilities
```

### Frontend Architecture

```
frontend/src/
├── app/                 # Next.js App Router pages
├── components/          # React components (page-level)
├── lib/                 # Utilities & helpers
└── styles/              # Tailwind CSS
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

#### Backend Changes

```python
# File: backend/src/rules_engine/calculator.py

# Add new calculation function:
def calculate_new_benefit(income: Decimal, params: Dict) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate new benefit amount
    
    Reference: [Legal article]
    """
    # Implementation
    return amount, calculation_steps
```

#### Frontend Changes

```typescript
// File: frontend/src/components/NewComponent.tsx

'use client';

import React, { useState } from 'react';

export default function NewComponent() {
  const [state, setState] = useState(initialState);
  
  // Implementation
  return <div>Component content</div>;
}
```

### 3. Test Your Changes

#### Backend Tests

```bash
cd backend

# Unit test
pytest tests/test_calculator.py

# Test specific function
pytest tests/test_calculator.py::test_income_tax_2025 -v

# Test with coverage
pytest --cov=src tests/
```

#### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Specific component
npm test ScenarioBuilder.tsx
```

#### Manual Testing

```bash
# Start services
docker-compose up

# Test locally
# Frontend: http://localhost:3000
# API: http://localhost:8000/docs
```

### 4. Lint & Format

```bash
# Backend
cd backend
black src/                          # Format
flake8 src/                         # Lint
mypy src/ --ignore-missing-imports # Type check

# Frontend
cd frontend
npm run lint                        # ESLint
npm run format                      # Prettier
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new benefit calculation"
# or
git commit -m "fix: correct tax bracket rounding"
```

**Commit Message Format:**
```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Maintenance

### 6. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Go to GitHub and create a pull request with:
- Clear description
- Link to related issue
- Screenshots (if UI changes)
- Test results

## Adding New Rules

### Step 1: Define the Rule

```python
# File: backend/src/rules_engine/calculator.py

NEW_BENEFIT_THRESHOLD = Decimal("30000")
NEW_BENEFIT_RATE = Decimal("0.05")

def calculate_new_benefit(
    gross_income: Decimal,
    household_size: int
) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate new benefit eligibility and amount
    
    Reference: Wet op de [benefit name]
    Article: [specific article]
    """
    steps = []
    
    # Check threshold
    if gross_income > NEW_BENEFIT_THRESHOLD:
        return Decimal(0), [{"type": "rejected", "reason": "income_threshold"}]
    
    # Calculate benefit
    benefit = (gross_income * NEW_BENEFIT_RATE).quantize(
        Decimal("0.01"), ROUND_HALF_UP
    )
    
    steps.append({
        "type": "calculated",
        "gross_income": float(gross_income),
        "rate": float(NEW_BENEFIT_RATE),
        "benefit": float(benefit)
    })
    
    return benefit, steps
```

### Step 2: Register in API

```python
# File: backend/src/api/rules.py

RULES_CATALOG = {
    "new_benefit": {
        "id": "new_benefit",
        "name": "New Benefit Name",
        "legal_reference": "Wet op de new benefit",
        "category": "benefits",
        "year": 2025,
        "description": "Description of the benefit",
        "url": "https://official-source.nl"
    }
}

RULE_DEPENDENCIES = {
    "new_benefit": ["income_tax"]  # If depends on other rules
}
```

### Step 3: Add Tests

```python
# File: backend/tests/test_calculator.py

def test_calculate_new_benefit_eligible():
    """Test benefit calculation for eligible income"""
    income = Decimal("25000")
    benefit, steps = calculate_new_benefit(income, 1)
    
    assert benefit == Decimal("1250.00")
    assert steps[0]["type"] == "calculated"

def test_calculate_new_benefit_ineligible():
    """Test benefit rejection for high income"""
    income = Decimal("35000")
    benefit, steps = calculate_new_benefit(income, 1)
    
    assert benefit == Decimal("0")
    assert steps[0]["reason"] == "income_threshold"
```

### Step 4: Update API Endpoint

```python
# File: backend/src/api/calculations.py

@router.post("/benefits-analysis")
async def analyze_benefits_impact(...):
    # Add new benefit calculation
    new_benefit, new_benefit_trace = calculate_new_benefit(...)
    
    return {
        "benefits": {
            # ... existing benefits
            "new_benefit": {
                "amount": float(new_benefit),
                "annual": float(new_benefit * 12),
                "trace": new_benefit_trace
            }
        }
    }
```

### Step 5: Update Frontend

```typescript
// File: frontend/src/components/ScenarioBuilder.tsx

{/* Add to results display */}
<div className="flex justify-between items-center py-2">
  <span className="text-gray-700">New Benefit Name</span>
  <span className="font-semibold text-green-600">
    €{results.new_benefit?.toLocaleString('nl-NL', { maximumFractionDigits: 2 })} /month
  </span>
</div>
```

## Database Migrations

### Creating New Tables

```sql
-- File: database/migrations/001_create_new_table.sql

CREATE TABLE new_table (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- columns here
);

CREATE INDEX idx_new_table_user_id ON new_table(user_id);
```

### Running Migrations

```bash
# Using Alembic
alembic revision --autogenerate -m "Add new table"
alembic upgrade head

# Manual
psql -h localhost -U postgres rules_engine < migrations/001_create_new_table.sql
```

## Performance Guidelines

### Backend

- Keep calculations under 100ms
- Cache tax brackets (daily)
- Use parameterized queries
- Connection pooling enabled
- Async/await for I/O

### Frontend

- Lazy load components
- Memoize expensive calculations
- Use React.memo for pure components
- Image optimization
- Code splitting enabled

## Security Guidelines

### Data Handling

```python
# ✅ DO: Use parameterized queries
result = await db.fetch("SELECT * FROM users WHERE id = $1", user_id)

# ❌ DON'T: String concatenation
result = await db.fetch(f"SELECT * FROM users WHERE id = {user_id}")
```

### Environment Variables

```python
# ✅ DO: Use config module
from config import settings
database_url = settings.database_url

# ❌ DON'T: Hardcode secrets
database_url = "postgresql://user:password@host:5432/db"
```

### Input Validation

```python
# ✅ DO: Validate all inputs
class ScenarioRequest(BaseModel):
    gross_income: Decimal = Field(..., gt=0, le=1000000)
    pension_pct: float = Field(..., ge=0, le=100)

# ❌ DON'T: Trust user input
gross_income = int(request.gross_income)  # No validation!
```

## Documentation Standards

### Code Comments

```python
def calculate_income_tax_2025(gross_income: Decimal) -> Tuple[Decimal, List[Dict]]:
    """
    Calculate Dutch income tax for 2025 with bracket details.
    
    Implements progressive tax brackets with general and labour allowances.
    Returns both total tax and breakdown by bracket for transparency.
    
    Args:
        gross_income: Annual gross income in euros
        
    Returns:
        (total_tax, bracket_details)
        - total_tax: Total calculated tax amount
        - bracket_details: List of dicts with bracket breakdown
        
    Reference:
        - Wet inkomstenbelasting 2001
        - Belastingdienst 2025 brackets
        
    Example:
        >>> tax, brackets = calculate_income_tax_2025(Decimal("50000"))
        >>> tax
        Decimal("8257.00")
    """
```

### Docstring Format
- Use triple quotes
- One-line summary
- Detailed description
- Args section
- Returns section
- Reference section
- Example section

## Release Process

### Version Bumping

```bash
# Check current version
grep version backend/setup.py

# Bump version
# backend/setup.py
# version="1.0.1"

git tag v1.0.1
git push origin v1.0.1
```

### Creating Release

1. Update CHANGELOG.md
2. Tag commit with version
3. Create GitHub release with notes
4. Build and push Docker images
5. Deploy to staging
6. Run integration tests
7. Deploy to production

## Code Review Checklist

### Reviewer Responsibilities

- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Database queries optimized
- [ ] Error handling appropriate
- [ ] Breaking changes documented

### Author Responsibilities

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code formatted (black, prettier)
- [ ] Lints pass
- [ ] Commits are clean
- [ ] PR description is clear

## Getting Help

### Resources

- **Documentation**: docs/ folder
- **API Reference**: /docs at localhost:8000
- **Architecture**: docs/ARCHITECTURE.md
- **Issues**: GitHub issues

### Common Problems

```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose build --no-cache

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

## Community

- **Discussion**: GitHub Discussions
- **Issues**: GitHub Issues
- **Pull Requests**: Submit and request review

## License

This project is licensed under MIT License. See LICENSE file for details.

---

**Questions?** Check docs/ or ask in GitHub Issues!

**Thank you for contributing!** 🙏
