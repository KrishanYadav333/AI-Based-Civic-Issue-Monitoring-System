const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring')
    .then(async () => {
        const users = await User.find().sort({ created_at: 1 });
        console.log(`\nTotal users: ${users.length}\n`);
        users.forEach((u, i) => {
            console.log(`${i+1}. ${u.username.padEnd(12)} | ${u._id} | Created: ${u.created_at}`);
        });
        await mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
