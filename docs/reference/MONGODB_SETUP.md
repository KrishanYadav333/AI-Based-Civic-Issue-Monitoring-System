# MongoDB Setup and Usage

## Quick Start

### 1. Install MongoDB

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Verify installation
mongosh --version
```

**Linux:**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2. Install Dependencies

```bash
cd backend
npm install mongoose
```

### 3. Configure Environment

Update `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=27017
DB_NAME=civic_issues
DB_USER=
DB_PASSWORD=
```

### 4. Initialize Database

```bash
# Start MongoDB
mongod

# In another terminal, run seed script
cd scripts
node seed-mongodb.js
```

### 5. Start Application

```bash
# Start backend
cd backend
npm start

# Start AI service
cd ai-service
python app.py

# Start frontend
cd frontend
npm run dev
```

## Docker Setup

```bash
# Start all services with MongoDB
docker-compose up -d

# Initialize database
docker exec -it civic-issues-db mongosh civic_issues /docker-entrypoint-initdb.d/mongo-init.js

# Seed data
docker exec -it civic-issues-backend node /app/scripts/seed-mongodb.js
```

## MongoDB Commands

### Connect to Database
```bash
mongosh civic_issues
```

### View Collections
```javascript
show collections
```

### Query Examples
```javascript
// Find all users
db.users.find().pretty()

// Find engineers
db.users.find({ role: 'engineer' })

// Find issues in a ward
db.issues.find({ ward_id: ObjectId("...") })

// Find nearby issues (within 1km)
db.issues.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [73.18, 22.31] },
      $maxDistance: 1000
    }
  }
})
```

### Create Indexes
```javascript
// Already created by initialization script
// To recreate manually:
db.issues.createIndex({ location: "2dsphere" })
db.users.createIndex({ email: 1 }, { unique: true })
```

## MongoDB Atlas (Cloud)

For production, use MongoDB Atlas free tier:

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add IP address to whitelist (or use 0.0.0.0/0 for all)
4. Create database user
5. Get connection string
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic_issues
   ```

## Test Credentials

After running seed script:
- **Admin**: admin@civic.com / admin123
- **Engineer**: engineer1@civic.com / admin123
- **Surveyor**: surveyor1@civic.com / admin123

## Troubleshooting

### Connection Refused
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
# Check Services app on Windows
```

### Permission Errors
```bash
# Linux: Fix data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port 27017
# Windows
netstat -ano | findstr :27017

# Linux/macOS
lsof -i :27017

# Kill process
# Windows: taskkill /PID <pid> /F
# Linux/macOS: kill -9 <pid>
```

## Backup and Restore

### Backup
```bash
mongodump --db civic_issues --out ./backup
```

### Restore
```bash
mongorestore --db civic_issues ./backup/civic_issues
```

## Performance Tips

1. **Indexes**: Ensure indexes are created (run mongo-init.js)
2. **Connection Pooling**: Already configured (maxPoolSize: 10)
3. **Query Optimization**: Use projections to limit returned fields
   ```javascript
   db.issues.find({}, { title: 1, status: 1 })
   ```
4. **Aggregation Pipeline**: For complex queries
   ```javascript
   db.issues.aggregate([
     { $match: { status: 'pending' } },
     { $group: { _id: '$ward_id', count: { $sum: 1 } } }
   ])
   ```

## Migration from PostgreSQL

See [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md) for detailed migration guide.
