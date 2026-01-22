# 🎯 TEAM ONBOARDING GUIDE

**Last Updated**: January 22, 2026  
**Status**: Production Ready ✅  
**Current Branch**: dev-anuj

---

## 📋 Quick Reference for Team Members

### After Forking/Cloning This Repository

#### 1️⃣ Install Prerequisites (One Time)
- Node.js 16+ → https://nodejs.org/
- Python 3.8+ → https://www.python.org/
- PostgreSQL 14+ → https://www.postgresql.org/
- Redis 6+ → https://redis.io/

#### 2️⃣ Run Setup Script (Automated)
```bash
# Windows
.\scripts\setup.ps1

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### 3️⃣ Manual Setup (If Script Fails)
```bash
# Database
createdb civic_issues
psql -d civic_issues -f database/schema.sql
psql -d civic_issues -f database/seed_data.sql

# Backend
cd backend && npm install && cp .env.example .env
# Edit .env with your database credentials

# AI Service
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Train AI model (5-10 minutes)
python train_model_improved.py

# Frontend
cd frontend && npm install && cp .env.example .env
```

#### 4️⃣ Start Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: AI Service
cd ai-service && source venv/bin/activate && python app_ml.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

#### 5️⃣ Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **AI Service**: http://localhost:5000

---

## ⚠️ IMPORTANT: Files NOT in Repository

### Large Files Excluded from Git (You Must Generate Locally)

#### 1. AI Model File (~10 MB)
**File**: `ai-service/models/best_model.keras`

**How to Generate**:
```bash
cd ai-service
python train_model_improved.py
# Takes 5-10 minutes
# Creates: models/best_model.keras (10 MB)
#          models/class_indices.json
#          training_data/ (300 images)
```

**Alternative**: Use feature-based classifier (no training needed)
```bash
python app.py  # Instead of app_ml.py
```

#### 2. Training Data (~50 MB)
**Directory**: `ai-service/training_data/`
- Auto-generated when you run `train_model_improved.py`
- Contains 300 synthetic images (50 per class × 6 classes)

#### 3. Dependencies (~500 MB)
**Directories**: `node_modules/`, `venv/`, `__pycache__/`
- Installed via `npm install` and `pip install`
- Never committed to Git

#### 4. Logs & Uploads (Variable Size)
**Directories**: `backend/logs/`, `backend/uploads/`, `ai-service/uploads/`
- Generated at runtime
- `.gitkeep` files included to preserve directory structure

---

## 🔑 Default Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@vmc.gov.in | Admin@123 | All dashboards |
| Engineer | engineer1@vmc.gov.in | Engineer@123 | Assigned issues |
| Surveyor | surveyor1@vmc.gov.in | Surveyor@123 | Create issues |

⚠️ **MUST CHANGE** these passwords before production deployment!

---

## 📚 Essential Documentation (Read in Order)

### For Getting Started (5 mins)
1. **[QUICKSTART.md](./QUICKSTART.md)** - Get running immediately
2. **[PRODUCTION_OPTIMIZATION_SUMMARY.md](./PRODUCTION_OPTIMIZATION_SUMMARY.md)** - What's configured

### For Understanding System (15 mins)
3. **[plans/architecture.md](./plans/architecture.md)** - How system works
4. **[plans/api_list.md](./plans/api_list.md)** - All API endpoints
5. **[plans/database_schema.md](./plans/database_schema.md)** - Database tables

### For Development (30 mins)
6. **[README.md](./README.md)** - Complete project documentation
7. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - How to test code
8. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### For Deployment (15 mins)
9. **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-deployment checks
10. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment steps

---

## 🎯 AI Model Information

### Current Model Status
- **Architecture**: MobileNetV2 + Custom Layers
- **Accuracy**: 100% (60/60 test samples, 30/30 endpoint tests)
- **Model File**: `models/best_model.keras` (10.02 MB)
- **Training Time**: 5-10 minutes on CPU
- **Inference Time**: ~150ms per image

### Issue Types Detected
1. 🕳️ Pothole
2. 🗑️ Garbage  
3. 🛣️ Broken Road
4. ⚠️ Open Manhole
5. 🧱 Debris
6. 🐄 Stray Cattle

### Model Files
```
ai-service/
├── models/
│   ├── best_model.keras    # 10MB (NOT in Git - generate locally)
│   └── class_indices.json  # 500 bytes (IN Git)
└── training_data/          # 300 images (NOT in Git - auto-generated)
```

---

## 🛠️ Common Tasks for Developers

### Task 1: Fix a Bug
```bash
git checkout -b fix/issue-description
# Make changes
npm test  # Run tests
git commit -m "fix: description"
git push origin fix/issue-description
# Create Pull Request
```

### Task 2: Add New Feature
```bash
git checkout -b feature/feature-name
# Develop feature
npm test  # Ensure tests pass
git commit -m "feat: description"
git push origin feature/feature-name
# Create Pull Request
```

### Task 3: Update AI Model
```bash
cd ai-service
# Add more training images to training_data/
python train_model_improved.py
python test_cnn_accuracy.py  # Verify accuracy > 90%
# If good, commit class_indices.json (not model file)
```

### Task 4: Add API Endpoint
```bash
# 1. Add route in backend/src/routes/
# 2. Add validation schema in middleware/validation.js
# 3. Update swagger.json
# 4. Write tests in backend/tests/
# 5. Test with: npm test
```

### Task 5: Database Migration
```bash
# Create migration file
echo "ALTER TABLE issues ADD COLUMN new_field TEXT;" > database/migrations/v1.1.0.sql
# Apply migration
psql -d civic_issues -f database/migrations/v1.1.0.sql
# Update schema.sql with new changes
```

---

## 🆘 Troubleshooting Common Issues

### "Model file not found"
```bash
cd ai-service
python train_model_improved.py
# OR use feature-based classifier
python app.py
```

### "Database connection error"
```bash
# Check PostgreSQL running
pg_isready
# Check credentials in backend/.env
# Recreate database
createdb civic_issues
psql -d civic_issues -f database/schema.sql
```

### "Port already in use"
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
```bash
# Backend/Frontend
npm install

# AI Service
pip install -r requirements.txt
```

### "Tests failing"
```bash
# Reset test database
psql -d civic_issues_test -f database/schema.sql
psql -d civic_issues_test -f database/seed_data.sql

# Run tests
cd backend && npm test
```

---

## 📊 System Architecture Quick View

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│  Frontend   │─────▶│   Backend   │─────▶│  PostgreSQL  │
│ React:3001  │      │ Express:3000│      │  PostGIS     │
└─────────────┘      └─────────────┘      └──────────────┘
                           │                      │
                           ▼                      │
                     ┌─────────────┐              │
                     │ AI Service  │              │
                     │ Flask:5000  │              │
                     └─────────────┘              │
                           │                      │
                           ▼                      ▼
                     ┌─────────────┐      ┌──────────────┐
                     │ ML Model    │      │    Redis     │
                     │ TensorFlow  │      │  Caching     │
                     └─────────────┘      └──────────────┘
```

---

## 🔐 Security Reminders

### Before Production:
- [ ] Change all default passwords
- [ ] Generate new JWT_SECRET (32+ random characters)
- [ ] Restrict CORS to production domains only
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Review rate limits
- [ ] Check file upload restrictions

---

## 🎓 Learning Resources

### Code Structure
- **Backend**: Express.js REST API with JWT auth
- **Frontend**: React with Context API for state
- **AI Service**: Flask with TensorFlow/Keras
- **Database**: PostgreSQL with PostGIS for geographic queries

### Key Technologies
- **Authentication**: JWT tokens (24h expiry)
- **Validation**: Joi schemas
- **Rate Limiting**: Redis-backed
- **File Uploads**: Multer (10MB max)
- **Logging**: Winston with daily rotation
- **Testing**: Jest (backend), Pytest (AI service)

### Geographic Features
- Ward boundaries using PostGIS polygons
- `ST_Contains` for point-in-polygon queries
- Automatic engineer assignment by ward
- Spatial indexes for fast lookups

---

## 📞 Getting Help

### For Technical Issues
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and discussions
- **Documentation**: Check docs/ folder and markdown files

### For Development Help
- **API Documentation**: http://localhost:3000/api-docs (Swagger)
- **Database Schema**: plans/database_schema.md
- **Architecture**: plans/architecture.md

---

## ✅ Pre-Push Checklist

Before pushing code:
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Update documentation if APIs changed
- [ ] Test locally with all services running
- [ ] Check no sensitive data in commits
- [ ] Verify .env files not committed

---

## 🚀 Ready to Start!

```bash
# 1. Clone repo
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System

# 2. Run setup
.\scripts\setup.ps1  # Windows
# OR
./scripts/setup.sh  # Linux/Mac

# 3. Start coding!
```

**Happy Coding! 🎉**

---

**Project**: Vadodara Municipal Corporation - Civic Issue Monitoring System  
**Version**: 1.0.0  
**License**: MIT  
**Repository**: https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System
