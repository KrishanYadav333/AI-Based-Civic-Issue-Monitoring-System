/**
 * Debug notification issue - check user IDs
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugUserIds() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        
        // 1. Get admin user from database
        const admin = await User.findOne({ username: 'admin' });
        console.log('\n📍 Admin user in database:');
        console.log('   _id:', admin._id);
        console.log('   id field:', admin.id);
        console.log('   _id type:', typeof admin._id);
        console.log('   _id toString:', admin._id.toString());
        
        // 2. Check what's in JWT
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const payload = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        };
        const token = jwt.sign(payload, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log('\n🔑 JWT payload:');
        console.log('   id:', decoded.id);
        console.log('   username:', decoded.username);
        
        // 3. Check notifications
        const notifsByObjectId = await Notification.find({ user_id: admin._id });
        console.log(`\n📋 Notifications with user_id = admin._id: ${notifsByObjectId.length}`);
        
        const notifsById = await Notification.find({ user_id: admin.id });
        console.log(`📋 Notifications with user_id = admin.id: ${notifsById.length}`);
        
        const notifsAsString = await Notification.find({ user_id: admin._id.toString() });
        console.log(`📋 Notifications with user_id = admin._id.toString(): ${notifsAsString.length}`);
        
        // 4. Check what's actually in notifications collection
        const allNotifs = await Notification.find();
        console.log(`\n📊 Total notifications: ${allNotifs.length}`);
        if (allNotifs.length > 0) {
            const firstNotif = allNotifs[0];
            console.log('\n🔍 First notification:');
            console.log('   user_id:', firstNotif.user_id);
            console.log('   user_id type:', typeof firstNotif.user_id);
            console.log('   title:', firstNotif.title);
            
            console.log('\n🔍 Comparison:');
            console.log('   firstNotif.user_id == admin._id:', firstNotif.user_id == admin._id);
            console.log('   firstNotif.user_id.equals(admin._id):', firstNotif.user_id.equals(admin._id));
            console.log('   firstNotif.user_id.toString() === admin._id.toString():', 
                firstNotif.user_id.toString() === admin._id.toString());
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

debugUserIds();
