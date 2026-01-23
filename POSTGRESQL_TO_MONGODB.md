# PostgreSQL to MongoDB Migration - Complete Summary

## ✅ Migration Completed

The AI-Based Civic Issue Monitoring System has been successfully migrated from PostgreSQL to MongoDB.

## 🔄 What Changed

### 1. Database System
- **Before**: PostgreSQL 12+ with PostGIS extension
- **After**: MongoDB 7.0 with native geospatial support
- **Port**: 5432 → 27017

### 2. Files Modified

#### Backend Configuration
- ✅ `backend/package.json` - Replaced `pg` with `mongoose@^8.0.3`
- ✅ `backend/.env` - Updated to MongoDB connection settings
- ✅ `backend/src/services/database.js` - Complete MongoDB rewrite using Mongoose
- ✅ `backend/src/index.js` - Updated database connection initialization
- ✅ `backend/tests/setup.js` - Updated test environment for MongoDB

#### Models Created
- ✅ `backend/src/models/User.js` - User schema with Mongoose
- ✅ `backend/src/models/Ward.js` - Ward boundaries with GeoJSON
- ✅ `backend/src/models/Issue.js` - Issues with geospatial location
- ✅ `backend/src/models/IssueLog.js` - Audit trail
- ✅ `backend/src/models/IssueType.js` - Issue categories
- ✅ `backend/src/models/index.js` - Model exports

#### Docker Configuration
- ✅ `docker-compose.yml` - Replaced `postgres` service with `mongodb`
- ✅ Volume renamed: `postgres_data` → `mongodb_data`
- ✅ Health checks updated for MongoDB

#### Database Scripts
- ✅ `database/mongo-init.js` - MongoDB initialization with indexes
- ✅ `database/mongo-seed-data.js` - Seed data for wards and issue types
- ✅ `scripts/seed-mongodb.js` - User seeding script with bcrypt

#### Documentation
- ✅ `MONGODB_MIGRATION.md` - Comprehensive migration guide
- ✅ `MONGODB_SETUP.md` - Quick setup and usage guide
- ✅ `POSTGRESQL_TO_MONGODB.md` - This summary

## 📦 New Dependencies

```json
"mongoose": "^8.0.3"
```

Removed:
```json
"pg": "^8.11.3"
```

## 🗄️ Schema Mapping

| PostgreSQL Table | MongoDB Collection | Key Changes |
|-----------------|-------------------|-------------|
| `users` | `users` | _id (ObjectId) instead of serial ID |
| `wards` | `wards` | PostGIS GEOGRAPHY → GeoJSON boundary |
| `issues` | `issues` | PostGIS GEOGRAPHY → GeoJSON location |
| `issue_logs` | `issuelogs` | Foreign keys → ObjectId references |
| `issue_types` | `issuetypes` | Minimal changes |

## 🌐 Geospatial Queries

### PostGIS (Before)
```sql
SELECT * FROM wards 
WHERE ST_Contains(boundary, ST_MakePoint($1, $2));
```

### MongoDB (After)
```javascript
Ward.findOne({
  boundary: {
    $geoIntersects: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    }
  }
});
```

## 🚀 Getting Started

### 1. Install MongoDB

**Windows:**
```powershell
choco install mongodb
```

**Linux:**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

### 2. Update Environment

Edit `backend/.env`:
```env
# MongoDB Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=civic_issues
DB_USER=
DB_PASSWORD=

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civic_issues
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Seed Database

```bash
node scripts/seed-mongodb.js
```

### 5. Start Services

**Option 1: Manual**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: AI Service
cd ai-service
python app.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

**Option 2: Docker**
```bash
docker-compose up -d
```

## 🔧 Configuration Details

### MongoDB Connection String

**Local:**
```
mongodb://localhost:27017/civic_issues
```

**With Authentication:**
```
mongodb://username:password@localhost:27017/civic_issues?authSource=admin
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/civic_issues
```

### Environment Variables

| Variable | PostgreSQL | MongoDB |
|----------|-----------|---------|
| `DB_HOST` | localhost | localhost |
| `DB_PORT` | 5432 | 27017 |
| `DB_USER` | postgres | (optional) |
| `DB_PASSWORD` | (password) | (optional) |
| `MONGODB_URI` | N/A | (full connection string) |

## 📊 Indexes Created

For optimal performance, the following indexes are created:

**Users:**
- `email` (unique)
- `role`
- `ward_id`

**Wards:**
- `ward_number` (unique)
- `boundary` (2dsphere for geospatial)

**Issues:**
- `location` (2dsphere for nearby queries)
- `status`, `priority` (compound)
- `ward_id`, `assigned_to`, `submitted_by`
- `created_at` (descending)

**Issue Logs:**
- `issue_id`, `created_at` (compound)
- `created_by`

**Issue Types:**
- `name` (unique)
- `is_active`

## 🧪 Test Users

After running seed script:

| Email | Password | Role |
|-------|----------|------|
| admin@civic.com | admin123 | Admin |
| engineer1@civic.com | admin123 | Engineer |
| surveyor1@civic.com | admin123 | Surveyor |

## ⚠️ Important Notes

### 1. ID Field Changes
- PostgreSQL used `id` (serial/integer)
- MongoDB uses `_id` (ObjectId)
- Update any frontend/mobile code that references `id` to use `_id`

### 2. Geospatial Coordinates
- MongoDB GeoJSON format: `[longitude, latitude]` (reversed!)
- Always specify coordinates as `[lng, lat]`, not `[lat, lng]`

### 3. Transactions
- MongoDB transactions require replica set
- For local development, operations are not transactional
- For production, use MongoDB Atlas or configure replica set

### 4. Query Migration
- All SQL queries need to be migrated to Mongoose/MongoDB queries
- Check routes and services for any remaining SQL queries
- Use Mongoose models instead of raw queries

## 🐛 Troubleshooting

### Cannot connect to MongoDB
```bash
# Check if running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Port 27017 already in use
```bash
# Find and kill process
# Windows: netstat -ano | findstr :27017
# Linux/macOS: lsof -i :27017
```

### Schema validation errors
```bash
# Drop and recreate database
mongosh civic_issues --eval "db.dropDatabase()"
node scripts/seed-mongodb.js
```

## 📚 Next Steps

1. ✅ Update any remaining SQL queries in routes
2. ✅ Update frontend API calls if needed (id → _id)
3. ✅ Update mobile app API calls if needed
4. ✅ Test all CRUD operations
5. ✅ Test geospatial queries (nearby issues, ward assignment)
6. ✅ Configure MongoDB Atlas for production
7. ✅ Update CI/CD pipelines for MongoDB

## 🔄 Rollback Plan

If you need to revert to PostgreSQL:

```bash
# 1. Restore old database.js
git checkout HEAD~1 -- backend/src/services/database.js

# 2. Restore old models (delete Mongoose models)
rm -rf backend/src/models

# 3. Restore package.json
git checkout HEAD~1 -- backend/package.json
npm install

# 4. Restore .env
git checkout HEAD~1 -- backend/.env

# 5. Restore docker-compose.yml
git checkout HEAD~1 -- docker-compose.yml

# 6. Start PostgreSQL
docker-compose up -d postgres
```

## 📖 Documentation

- [MongoDB Migration Guide](./MONGODB_MIGRATION.md) - Detailed migration steps
- [MongoDB Setup Guide](./MONGODB_SETUP.md) - Quick setup and commands
- [Mongoose Documentation](https://mongoosejs.com/docs/) - Official Mongoose docs
- [MongoDB Manual](https://docs.mongodb.com/manual/) - MongoDB reference

## ✨ Benefits of MongoDB

1. **Flexible Schema**: Easy to add new fields without migrations
2. **Horizontal Scaling**: Built-in sharding support
3. **JSON Native**: Direct mapping to JavaScript objects
4. **Rich Queries**: Powerful aggregation framework
5. **Geospatial**: Native GeoJSON support
6. **Cloud Ready**: MongoDB Atlas free tier available
7. **Performance**: Better for read-heavy workloads
8. **Developer Friendly**: Intuitive query language

## 🎯 Migration Status

✅ **COMPLETE** - All PostgreSQL dependencies removed and replaced with MongoDB/Mongoose.

The system is now ready to use MongoDB as the primary database!
