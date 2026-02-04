# Production Deployment Guide

## 🚀 Deploying Rules-as-Code Platform to Production

This guide covers deploying the platform to production environments (AWS, Azure, GCP, or on-premises).

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`, `pytest`)
- [ ] Code reviewed and merged to main branch
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificates obtained
- [ ] Secrets management configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Load Balancer (HTTPS)            │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    ┌───▼────────┐   ┌─────▼────────┐
    │ Backend 1  │   │  Backend 2   │  (Replicas)
    │ (FastAPI)  │   │  (FastAPI)   │
    └───────┬────┘   └────┬─────────┘
            │             │
        ┌───┴─────────────┴────┐
        │   Connection Pool    │
        └───┬─────────────┬────┘
            │             │
    ┌───────▼──┐   ┌─────▼──────┐
    │PostgreSQL│   │   Redis    │  (Primary + Replica)
    │Database  │   │   Cache    │
    └──────────┘   └────────────┘

Frontend: CDN + Static Hosting
```

## 1. Database Setup

### PostgreSQL on Cloud

#### AWS RDS
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier pensioen-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --backup-retention-period 30
```

#### Azure Database for PostgreSQL
```bash
# Create Azure Database
az postgres server create \
  --name pensioen-db \
  --resource-group mygroup \
  --location eastus \
  --admin-user postgres \
  --admin-password <strong-password> \
  --sku-name B_Gen5_1 \
  --storage-size 102400
```

### Initialize Database Schema

```bash
# Connect and run migrations
psql postgresql://user:pass@host:5432/rules_engine < database/init.sql

# Or using Python:
python -m alembic upgrade head
```

### Create Backups

```bash
# Daily automated backups
# AWS: Configure automated backup in RDS console
# Azure: Configure backup in portal

# Manual backup
pg_dump -h host -U postgres rules_engine > backup.sql
```

## 2. Cache Setup (Redis)

### AWS ElastiCache
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id pensioen-cache \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --engine-version 7.0 \
  --num-cache-nodes 1
```

### Azure Cache for Redis
```bash
az redis create \
  --name pensioen-cache \
  --resource-group mygroup \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### Production Redis Configuration

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
requirepass <strong-password>
```

## 3. Containerization

### Build Production Images

```bash
# Backend image
docker build -f backend/Dockerfile -t pensioen-backend:1.0.0 .
docker push your-registry/pensioen-backend:1.0.0

# Frontend image
docker build -f frontend/Dockerfile -t pensioen-frontend:1.0.0 .
docker push your-registry/pensioen-frontend:1.0.0
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  backend:
    image: your-registry/pensioen-backend:1.0.0
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - ENVIRONMENT=production
      - DEBUG=false
    replicas: 2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/ecs/backend"
        awslogs-region: "us-east-1"

  frontend:
    image: your-registry/pensioen-frontend:1.0.0
    environment:
      - NEXT_PUBLIC_API_URL=https://api.pensioen-beslissingstool.nl
    replicas: 2
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/ecs/frontend"
        awslogs-region: "us-east-1"
```

## 4. Kubernetes Deployment

### Deployment Manifest

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: pensioen-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pensioen-backend
  template:
    metadata:
      labels:
        app: pensioen-backend
    spec:
      containers:
      - name: backend
        image: your-registry/pensioen-backend:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: connection-string
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        - name: ENVIRONMENT
          value: production
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Service and Ingress

```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: pensioen-backend
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pensioen-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.pensioen-beslissingstool.nl
    secretName: pensioen-tls
  rules:
  - host: api.pensioen-beslissingstool.nl
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic db-secrets \
  --from-literal=connection-string='postgresql://...'

# Deploy
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods
kubectl logs deployment/backend
```

## 5. Environment Configuration

### Production .env

```env
# Application
ENVIRONMENT=production
DEBUG=false

# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/rules_engine

# Redis
REDIS_URL=redis://:password@redis-host:6379

# Frontend
NEXT_PUBLIC_API_URL=https://api.pensioen-beslissingstool.nl

# Security
SECRET_KEY=<generate-with: openssl rand -hex 32>
CORS_ORIGINS=https://pensioen-beslissingstool.nl,https://www.pensioen-beslissingstool.nl

# SSL/TLS
SSL_CERT=/etc/ssl/certs/cert.pem
SSL_KEY=/etc/ssl/private/key.pem
```

### Secrets Management

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name pensioen/db \
  --secret-string '{"username":"postgres","password":"..."}'

# Azure Key Vault
az keyvault secret set \
  --vault-name pensioen-kv \
  --name db-connection-string \
  --value "postgresql://..."

# Kubernetes Secrets
kubectl create secret generic db-secrets \
  --from-literal=connection-string='postgresql://...'
```

## 6. SSL/TLS Certificate

### Let's Encrypt (Automatic)

```bash
# Using Certbot
certbot certonly --standalone -d pensioen-beslissingstool.nl

# Using cert-manager in Kubernetes
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Self-Signed (Testing)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

## 7. Monitoring & Logging

### Application Monitoring

```python
# Integrate Prometheus in backend
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter('requests_total', 'Total requests')
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')

@app.middleware("http")
async def track_requests(request: Request, call_next):
    REQUEST_COUNT.inc()
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    REQUEST_DURATION.observe(duration)
    return response
```

### Log Aggregation

```bash
# ELK Stack
docker-compose -f docker-compose.elk.yml up

# CloudWatch (AWS)
aws logs create-log-group --log-group-name /pensioen/app

# Azure Monitor
az monitor log-analytics workspace create \
  --resource-group mygroup \
  --workspace-name pensioen-logs
```

### Example Monitoring Setup

```yaml
# docker-compose.monitoring.yml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
```

## 8. Scaling Strategy

### Horizontal Scaling

```bash
# Backend replicas
kubectl scale deployment backend --replicas=5

# Frontend replicas
kubectl scale deployment frontend --replicas=5

# Database connection pooling
# backend/src/config.py
SQLALCHEMY_POOL_SIZE=20
SQLALCHEMY_MAX_OVERFLOW=40
```

### Auto-Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 9. Performance Optimization

### Caching Headers

```python
@app.get("/api/v1/rules")
async def get_rules():
    # Cache rules for 24 hours
    return {
        "Cache-Control": "public, max-age=86400",
        "rules": [...]
    }
```

### Database Query Optimization

```python
# Use indexes
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);

# Connection pooling
SQLALCHEMY_POOL_SIZE=20
SQLALCHEMY_MAX_OVERFLOW=40
SQLALCHEMY_POOL_RECYCLE=3600
```

### CDN for Static Assets

```bash
# CloudFront (AWS)
aws cloudfront create-distribution \
  --origin-domain-name pensioen-frontend.s3.amazonaws.com

# Cloudflare
# Domain settings in Cloudflare dashboard
```

## 10. Health Checks & Alerts

### Health Check Endpoint

```python
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": await check_database(),
        "redis": await check_redis(),
        "timestamp": datetime.now().isoformat()
    }
```

### Alerting Rules

```yaml
# prometheus/rules.yml
groups:
- name: pensioen
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 1m
    annotations:
      summary: "Database is down"
      
  - alert: RedisDown
    expr: up{job="redis"} == 0
    for: 1m
    annotations:
      summary: "Redis cache is down"
```

## 11. Disaster Recovery

### Backup Strategy

```bash
# Daily database backups to S3
aws s3 sync /var/backups/postgres s3://backups/db/ --delete

# Point-in-time recovery
# AWS RDS: Automatic backups retained for 30 days
# Azure: Restore to any point in last 35 days
```

### Failover Configuration

```yaml
# Redis Sentinel for automatic failover
port 26379
sentinel monitor pensioen-redis 127.0.0.1 6379 1
sentinel down-after-milliseconds pensioen-redis 5000
sentinel failover-timeout pensioen-redis 10000
```

## 12. Security Hardening

### HTTPS Only

```python
# Force HTTPS redirect
@app.middleware("http")
async def force_https(request: Request, call_next):
    if request.url.scheme != "https":
        url = request.url.replace(scheme="https")
        return RedirectResponse(url=url)
    return await call_next(request)
```

### Rate Limiting

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/v1/scenarios")
@limiter.limit("100/minute")
async def list_scenarios(request: Request):
    return [...]
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pensioen-beslissingstool.nl"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```

## 13. Cost Optimization

| Component | Monthly Cost |
|-----------|------------|
| Database (RDS t3.small) | $30-50 |
| Cache (ElastiCache micro) | $20-30 |
| Load Balancer | $20 |
| CDN (100GB) | $10-20 |
| Compute (2x backend) | $50-100 |
| Monitoring | $10-20 |
| **Total** | **$150-220** |

### Cost Reduction Tips

1. Use auto-scaling instead of fixed replicas
2. Reserved instances for predictable load
3. Consolidate services on single host initially
4. Use CDN to reduce compute load
5. Archive old calculations after 90 days

## 14. Deployment Checklist

```
Pre-Deployment:
- [ ] Feature complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Security scan clean
- [ ] Performance tested

Deployment Day:
- [ ] Database backup taken
- [ ] New containers built and tested
- [ ] Secrets configured
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Runbook prepared

Post-Deployment:
- [ ] All services healthy
- [ ] API responding
- [ ] Database functional
- [ ] Logs flowing correctly
- [ ] Alerts triggering correctly
- [ ] No error spikes
- [ ] Documentation updated
```

## Emergency Contacts

```
On-Call Engineer: [contact info]
Database Admin: [contact info]
Security Lead: [contact info]
Product Manager: [contact info]
```

## Support & Escalation

- Critical Issues: PagerDuty alert → call on-call engineer
- Database Issues: Page database admin
- Security Issues: Page security lead
- General Questions: Slack #pensioen channel

---

**Last Updated**: February 2024
**Version**: 1.0.0

For additional help, contact: infrastructure@example.com
