const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring')
    .then(async () => {
        const users = await User.find();
        console.log(`\nTotal users: ${users.length}\n`);
        users.forEach(u => {
            console.log(`${u.username}: ${u._id}`);
        });
        await mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
