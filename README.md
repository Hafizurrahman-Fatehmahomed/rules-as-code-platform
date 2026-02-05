# Pensioen Beslissingstool - Rules as Code Platform

Een volledig functioneel webplatform waarmee Nederlandse burgers verschillende pensioenbijdragescenario's kunnen vergelijken en de gecombineerde effecten op belastingen, toeslagen en nettoinkomen kunnen begrijpen.

## 🔗 Live Demo

**Probeer nu:** [https://rules-as-code-platform.vercel.app/](https://rules-as-code-platform.vercel.app/)

Backend API: `https://rules-as-code-production.up.railway.app` (Production)

## 🎯 Projectoverzicht

Dit platform lost een kritiek probleem op: burgers begrijpen niet hoe pensioenbeslissingen hun totale financiële situatie beïnvloeden. Een pensioenbijdrage van 5% beïnvloedt niet alleen de nettoloon—het beïnvloedt inkomstenbelasting, huurtoeslag, zorgverzekeringsteun en meer. Deze complexe regelinteracties zijn momenteel onzichtbaar.

## ✨ Kernfunctionaliteiten

### 1. Scenario's Vergelijken
- Vergelijking van pensioenbijdrageprocenten (0%, 5%, 10%, 15%, 20%)
- Realtime herberekening bij parameterwijzigingen
- Opslaan en delen van scenariovergleking
- Multiple parameters tegelijk aanpasbaar

### 2. Impact op Belastingen, Toeslagen & Nettoinkomen
- Berekening Nederlandse inkomstenbelasting (2025 brackets)
- Sociale zekerheidscontributen (AOW, WW, enz.)
- Huurtoeslag berekening
- Zorgtoeslag berekening
- Kindgebonden budget
- Netto beschikbaar inkomen na alle aftrekkingen en toeslagen

### 3. Transparantie: Welke Regels Veroorzaken Welke Effecten
- Elke berekening traceren naar specifieke wetartikel
- Visuele flowcharts toont regelafhankelijkheden
- Interactieve regel-uitlegpanelen
- Destacering van cross-domain interacties

### 4. Geïnformeerde Besluitvorming Ondersteunen
- Optimale scenarioaanbevelingen
- Waarschuwingen bij drempelverschuivingen
- Gepersonaliseerde inzichten
- PDF-export van rapporten

## 🏗️ Technische Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+ met TypeScript
- Tailwind CSS
- shadcn/ui componenten
- Recharts voor visualisaties
- React Hook Form + Zod validatie
- Zustand state management

### Backend
- Python 3.11+
- FastAPI
- OpenFisca (rules engine)
- Pydantic validatie
- PostgreSQL database
- Redis caching

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Pytest testing
- ESLint & Prettier code quality

## 🚀 Snelle Start

### Vereisten
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Installatie

```bash
# Clone repository
git clone [repo-url]
cd rules-as-code-platform

# Copy environment file
cp .env.example .env

# Start alle services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Lokale Ontwikkeling (zonder Docker)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
# http://localhost:8000/docs
```

## 📊 Project Structuur

```
rules-as-code-platform/
├── frontend/                    # Next.js 14 applicatie
│   ├── src/
│   │   ├── app/               # App Router pagina's
│   │   ├── components/        # React componenten
│   │   ├── lib/               # Utilities & API client
│   │   └── store/             # Zustand state
│   └── package.json
│
├── backend/                     # FastAPI applicatie
│   ├── src/
│   │   ├── api/               # API routes
│   │   ├── rules_engine/      # Berekeningslogica
│   │   ├── rules/             # Nederlandse regelregels
│   │   ├── models/            # Pydantic modellen
│   │   └── services/          # Business logic
│   ├── tests/                 # Pytest tests
│   └── requirements.txt
│
├── database/                    # Database schema
├── docs/                        # Documentatie
└── docker-compose.yml
```

## 🎯 Gebruiksscenario

### Typische Gebruikersstroom

1. Gebruiker voert situatie in (inkomen, huur, huishoudsamenstelling)
2. Platform genereert automatisch 4 scenario's
3. Dashboard toont vergelijking met visualisaties
4. Gebruiker klikt op verschillen voor uitleg
5. Systeem toont regel-keten en wettelijke verwijzingen
6. Drempel-waarschuwingen verschijnen waar relevant
7. Aanbevelingen gegeven op basis van situatie
8. Gebruiker exporteert PDF-rapport

## 📐 Nederlandse Regelgeving (2025)

### Inkomstenbelasting
- Schijven: 36,97% (tot €38.098), 36,97% (tot €75.624), 49,50%+
- Heffingskortingen en arbeidskorting
- Pensioenbijdrage aftrekbaar

### Sociale Premies
- AOW: 17,90% tot €38.098
- WW: ~2,64% (gemiddeld)
- Wlz: 9,65% tot €38.098

### Toeslagen
- **Huurtoeslag**: €265-€880 huurrange, inkomensafhankelijk
- **Zorgtoeslag**: Tot ~€150/maand, inkomensafhankelijk
- **Kindgebonden budget**: Afhankelijk van aantal kinderen

## 🧪 Testen

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📚 Documentação

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architectuuroverzicht
- [API.md](docs/API.md) - API-documentatie
- [RULES.md](docs/RULES.md) - Regelimplementatiegids
- [GEBRUIKERSHANDLEIDING.md](docs/GEBRUIKERSHANDLEIDING.md) - Eindgebruikerdocumentatie

### 📊 Presentatie

<div align="center">

**[Download Presentatie](Rules_as_Code.pptx)** | **[View Online](https://view.officeapps.live.com/op/view.aspx?src=https://raw.githubusercontent.com/Hafizurrahman-Fatehmahomed/rules-as-code-platform/master/Rules_as_Code.pptx)**

[![Rules as Code Presentation](https://img.shields.io/badge/PowerPoint-Presentatie-orange?style=flat-square&logo=microsoftpowerpoint)](Rules_as_Code.pptx)

</div>

## 🎨 UI/UX Features

- Modern glassmorphism design
- Donker/licht thema toggle
- Volledig responsief (mobiel-eerste)
- WCAG 2.1 AA toegankelijkheid
- Interactieve visualisaties
- Real-time berekeningen
- Touch-vriendelijk interface

## 🔐 Privacy & Veiligheid

- Geen gegevens opgeslagen zonder toestemming
- HTTPS alleen in productie
- Geen tracking van persoonlijke informatie
- Reproduceerbare berekeningen
- Transparante wettelijke bronnen

## 📊 Demo Persona's

1. **Maria** - 32, €45k, alleenstaand, €850 huur
2. **Jan & Petra** - 40 & 38, €65k gecombineerd, 2 kinderen, €950 huur
3. **Ahmed** - 28, €25k, alleenstaand, €750 huur
4. **Femke** - 55, €80k, eigenaar woning, voorbereiding pensioen
5. **Familie De Vries** - 42 & 40, €120k, eigenaar, 1 kind

## 🤝 Bijdragen

Dit is een proof-of-concept project voor de GovTech Netherlands Challenge.

## 📄 Licentie

MIT License - zie LICENSE bestand

## 👥 Team

Gebouwd met aandacht voor het maken van regering transparanter en toegankelijker.

---

**Gebouwd met ❤️ voor Nederlandse burgers**
