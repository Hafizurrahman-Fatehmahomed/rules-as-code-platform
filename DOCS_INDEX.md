# 📖 Documentation Index

Welcome to the Rules-as-Code Platform! This index will help you navigate all documentation.

## 🚀 Getting Started

**Start here if you want to...**

### Run It Immediately (5 minutes)
👉 **[QUICKSTART.md](./QUICKSTART.md)**
- Docker Compose setup
- Access URLs
- Basic troubleshooting
- Test the application

### Understand What Was Built
👉 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**
- Complete feature list
- Project structure
- Technology stack
- What you can do now
- Next steps

## 🏗️ Technical Documentation

### System Design & Architecture
👉 **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**
- System overview with diagrams
- Technology stack details
- Core components breakdown
- Data flow explanations
- Performance optimization
- Extensibility guide

### API Reference
👉 **[docs/API.md](./docs/API.md)**
- All 16 endpoints documented
- Request/response examples
- Error handling
- Data types
- Rate limiting
- Real-world examples

### Deployment Guide
👉 **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**
- Production deployment steps
- AWS/Azure/GCP instructions
- Kubernetes manifests
- Environment configuration
- Monitoring & alerting
- Disaster recovery
- Cost optimization

## 👨‍💻 Development

### Contributing Guidelines
👉 **[CONTRIBUTING.md](./CONTRIBUTING.md)**
- Development setup
- Workflow (branch → test → PR)
- Adding new rules
- Database migrations
- Testing standards
- Code review process

### Project README
👉 **[README.md](./README.md)**
- Project overview
- Core problem solved
- Key features
- Why "Rules as Code"

## 📚 Quick Reference

### Common Tasks

#### How do I...

**...start development?**
→ [QUICKSTART.md](./QUICKSTART.md) → "Option 2: Local Development"

**...add a new pension/tax rule?**
→ [CONTRIBUTING.md](./CONTRIBUTING.md) → "Adding New Rules"

**...deploy to production?**
→ [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) → "Step 1-14"

**...understand how calculations work?**
→ [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) → "Calculation Transparency"

**...test the API?**
→ [docs/API.md](./docs/API.md) → "Examples"

**...scale for production load?**
→ [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) → "8. Scaling Strategy"

**...debug issues?**
→ [QUICKSTART.md](./QUICKSTART.md) → "Common Issues"

## 📋 File Structure

```
rules-as-code-platform/
│
├── README.md                    # Main project overview
├── PROJECT_SUMMARY.md           # Complete feature summary ⭐ START HERE
├── QUICKSTART.md                # 5-minute setup guide
├── CONTRIBUTING.md              # Development guidelines
│
├── docs/
│   ├── ARCHITECTURE.md          # System design & components
│   ├── API.md                   # Complete API reference
│   └── DEPLOYMENT.md            # Production deployment
│
├── backend/                     # Python FastAPI backend
│   ├── src/
│   │   ├── main.py             # Application entry point
│   │   ├── rules_engine/       # 🎯 Core calculations
│   │   ├── api/                # REST endpoints
│   │   └── services/           # Database & cache
│   └── requirements.txt
│
├── frontend/                    # React Next.js frontend
│   ├── src/
│   │   ├── app/page.tsx        # Main dashboard
│   │   └── components/         # UI components
│   └── package.json
│
└── docker-compose.yml           # Local development
```

## 🎯 Choose Your Path

### Path 1: "I want to test it now"
1. Read: [QUICKSTART.md](./QUICKSTART.md)
2. Run: `docker-compose up`
3. Visit: http://localhost:3000

### Path 2: "I want to understand the system"
1. Read: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Read: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. Explore: http://localhost:8000/docs (API)

### Path 3: "I want to develop features"
1. Read: [QUICKSTART.md](./QUICKSTART.md) - Local setup
2. Read: [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Read: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Understand design

### Path 4: "I want to deploy to production"
1. Read: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
2. Choose platform (AWS/Azure/GCP/On-premises)
3. Follow step-by-step instructions

### Path 5: "I want to add a new rule"
1. Understand: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Rules Engine
2. Follow: [CONTRIBUTING.md](./CONTRIBUTING.md) - Adding New Rules
3. Implement in: `backend/src/rules_engine/calculator.py`

## 📊 Key Sections Summary

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | What was built, how to use it | 10 min |
| [QUICKSTART.md](./QUICKSTART.md) | Get it running locally | 5 min |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical deep dive | 20 min |
| [docs/API.md](./docs/API.md) | API reference | 15 min |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Go to production | 30 min |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development workflow | 15 min |

## 🔍 Finding Specific Information

### Frontend / UI
- Components location: `frontend/src/components/`
- Main page: `frontend/src/app/page.tsx`
- Styling: Tailwind CSS in `frontend/src/app/globals.css`
- Getting started: [QUICKSTART.md](./QUICKSTART.md)

### Backend / API
- Entry point: `backend/src/main.py`
- Calculations: `backend/src/rules_engine/calculator.py`
- Endpoints: `backend/src/api/`
- API docs: [docs/API.md](./docs/API.md)
- How it works: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

### Rules & Calculations
- All rules: `backend/src/rules_engine/calculator.py`
- Tax rules: Lines 1-100
- Benefits rules: Lines 200-350
- Net income: Lines 400-450
- Adding new rules: [CONTRIBUTING.md](./CONTRIBUTING.md)

### Database
- Schema: `database/init.sql`
- Connection: `backend/src/services/database.py`
- ORM setup: `backend/src/config.py`
- Migrations: See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Deployment
- Docker Compose: `docker-compose.yml`
- Production: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- Kubernetes: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Step 4
- Scaling: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Step 8

## 💡 Pro Tips

1. **API Exploration**: Visit http://localhost:8000/docs for interactive API browser
2. **Rule Tracing**: Click any number in the UI to see calculation details
3. **Performance**: Rules are cached in Redis for fast calculations
4. **Testing**: Use http://localhost:3000 to manually test scenarios
5. **Debugging**: Check `docker-compose logs backend` for errors

## 🆘 Getting Help

### Documentation Issues
1. Check the relevant guide above
2. Search within document (Ctrl+F)
3. Look in Project Summary for quick answers

### Technical Issues
1. Check [QUICKSTART.md](./QUICKSTART.md) - "Common Issues" section
2. Run health check: `curl http://localhost:8000/health`
3. Check logs: `docker-compose logs`

### Development Questions
1. See [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Check code comments
3. Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for design decisions

## 📞 Support Channels

- **Bug Reports**: Create GitHub issue
- **Documentation**: See [CONTRIBUTING.md](./CONTRIBUTING.md) - "Contributing Guidelines"
- **Questions**: GitHub Discussions

## ✅ Pre-Launch Checklist

Before going live:
- [ ] Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- [ ] Run [QUICKSTART.md](./QUICKSTART.md)
- [ ] Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [ ] Understand [docs/API.md](./docs/API.md)
- [ ] Follow [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🚀 Next Steps

**Choose one:**

```
Option A: Try It Now
└─ [QUICKSTART.md](./QUICKSTART.md) → docker-compose up

Option B: Understand It
└─ [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

Option C: Develop
└─ [QUICKSTART.md](./QUICKSTART.md) → [CONTRIBUTING.md](./CONTRIBUTING.md)

Option D: Deploy
└─ [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
```

---

## 📄 Document Metadata

| File | Purpose | Audience | Updated |
|------|---------|----------|---------|
| README.md | Project overview | Everyone | 2024-02 |
| PROJECT_SUMMARY.md | Features & capabilities | Everyone | 2024-02 |
| QUICKSTART.md | Local setup & testing | Developers | 2024-02 |
| CONTRIBUTING.md | Development workflow | Contributors | 2024-02 |
| docs/ARCHITECTURE.md | Technical design | Architects/Leads | 2024-02 |
| docs/API.md | API reference | Backend devs | 2024-02 |
| docs/DEPLOYMENT.md | Production operations | DevOps/SRE | 2024-02 |

---

**Last Updated**: February 2024
**Version**: 1.0.0

**Ready to start?** → [QUICKSTART.md](./QUICKSTART.md) ⚡
