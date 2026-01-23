// MongoDB Initialization Script
// Creates database, collections, and indexes

db = db.getSiblingDB('civic_issues');

// Create collections
db.createCollection('users');
db.createCollection('wards');
db.createCollection('issues');
db.createCollection('issuelogs');
db.createCollection('issuetypes');

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ ward_id: 1 });

// Create indexes for wards collection
db.wards.createIndex({ ward_number: 1 }, { unique: true });
db.wards.createIndex({ boundary: '2dsphere' });

// Create indexes for issues collection
db.issues.createIndex({ location: '2dsphere' });
db.issues.createIndex({ status: 1, priority: -1 });
db.issues.createIndex({ ward_id: 1 });
db.issues.createIndex({ assigned_to: 1 });
db.issues.createIndex({ submitted_by: 1 });
db.issues.createIndex({ created_at: -1 });

// Create indexes for issue logs collection
db.issuelogs.createIndex({ issue_id: 1, created_at: -1 });
db.issuelogs.createIndex({ created_by: 1 });

// Create indexes for issue types collection
db.issuetypes.createIndex({ name: 1 }, { unique: true });
db.issuetypes.createIndex({ is_active: 1 });

print('MongoDB initialization complete');
