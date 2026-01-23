# MongoDB Migration Guide

## Overview
This project has been migrated from PostgreSQL to MongoDB for better scalability and flexible schema design.

## Changes Summary

### 1. Database Engine
- **Before**: PostgreSQL with PostGIS
- **After**: MongoDB with geospatial support (GeoJSON)

### 2. Connection String
- **Before**: `postgresql://user:password@host:5432/database`
- **After**: `mongodb://user:password@host:27017/database`

### 3. Port Changes
- **PostgreSQL**: 5432
- **MongoDB**: 27017

## Installation

### Install MongoDB Locally

#### Windows
```powershell
# Using Chocolatey
choco install mongodb

# Or download from https://www.mongodb.com/try/download/community
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### Install Node.js Dependencies
```bash
cd backend
npm install mongoose
```

## Configuration

### Environment Variables

Update your `.env` file:

```env
# MongoDB Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=civic_issues
DB_USER=
DB_PASSWORD=

# For MongoDB Atlas (cloud), use MONGODB_URI:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic_issues
```

### Docker Compose

The `docker-compose.yml` has been updated to use MongoDB:

```bash
# Start MongoDB with Docker
docker-compose up -d mongodb

# Initialize database
docker exec -it civic-issues-db mongosh civic_issues /docker-entrypoint-initdb.d/mongo-init.js
```

## Data Migration

### Export from PostgreSQL (if you have existing data)

```bash
# Export PostgreSQL data to JSON
node scripts/export-postgres-data.js
```

### Import to MongoDB

```bash
# Method 1: Using mongoimport
mongoimport --db civic_issues --collection users --file ./data/users.json --jsonArray

# Method 2: Using seed script
mongosh civic_issues < database/mongo-seed-data.js
```

## Geospatial Queries

### Before (PostGIS)
```sql
SELECT * FROM wards 
WHERE ST_Contains(boundary, ST_MakePoint($1, $2));
```

### After (MongoDB)
```javascript
db.wards.findOne({
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

## Mongoose Models

All models are defined in `backend/src/models/`:
- `User.js` - User accounts
- `Ward.js` - Ward boundaries (GeoJSON)
- `Issue.js` - Civic issues with location
- `IssueLog.js` - Audit trail
- `IssueType.js` - Issue categories

## Common Operations

### Find nearby issues
```javascript
const nearbyIssues = await Issue.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      $maxDistance: radiusInMeters
    }
  }
});
```

### Find ward by coordinates
```javascript
const ward = await Ward.findOne({
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

## Testing

```bash
# Install MongoDB for testing
# Then run tests
cd backend
npm test
```

## MongoDB Atlas (Cloud Option)

For production deployment, consider MongoDB Atlas free tier:

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic_issues
   ```

## Troubleshooting

### Connection Errors
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check logs
tail -f /var/log/mongodb/mongod.log  # Linux
# Windows: Check MongoDB service in Services app
```

### Performance Issues
```bash
# Check indexes
mongosh civic_issues --eval "db.issues.getIndexes()"

# Create missing indexes
mongosh civic_issues < database/mongo-init.js
```

## Rollback to PostgreSQL

If you need to rollback:

1. Install PostgreSQL
2. Restore from backup
3. Reinstall `pg` package: `npm install pg@^8.11.3`
4. Restore `database.js` from git: `git checkout HEAD~1 -- backend/src/services/database.js`
5. Update `.env` back to PostgreSQL settings

## Support

For MongoDB-specific questions:
- MongoDB Documentation: https://docs.mongodb.com
- Mongoose Documentation: https://mongoosejs.com/docs
