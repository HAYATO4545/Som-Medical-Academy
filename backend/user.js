const mongoose = require('mongoose');

// تعريف الـ Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { 
        type: String, 
        required: true
    },
    isPay: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    token: { type: String } // إضافة حقل التوكن
});

// إنشاء الموديل
const User = mongoose.model('User', userSchema);

// تصدير الموديل
module.exports = User;