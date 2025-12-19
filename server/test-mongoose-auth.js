#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://deepseek_user:KY4mWEbDFoIpk3JU@localhost:27017/deepseek_cli_website?authSource=admin';

console.log('🔍 Testing mongoose authentication');
console.log('================================');
console.log(`连接字符串: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
console.log();

async function test() {
  try {
    // 使用与db.js相同的选项
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      authSource: 'admin'
    });
    
    console.log('✅ Mongoose连接成功');
    console.log(`   主机: ${conn.connection.host}`);
    console.log(`   数据库: ${conn.connection.name}`);
    console.log(`   状态: ${mongoose.connection.readyState === 1 ? '已连接' : '未连接'}`);
    
    // 测试查询用户
    console.log('\n📝 测试查询用户...');
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      console.log(`✅ 查询成功，找到用户: ${user.email}`);
      console.log(`   ID: ${user._id}`);
    } else {
      console.log('❌ 未找到测试用户');
    }
    
    // 测试插入新用户
    console.log('\n📝 测试插入用户...');
    const newUser = new User({
      email: 'mongoose-test@example.com',
      isVerified: true
    });
    await newUser.save();
    console.log(`✅ 插入成功，用户ID: ${newUser._id}`);
    
    // 清理
    await User.deleteOne({ _id: newUser._id });
    console.log(`✅ 清理测试用户`);
    
    await mongoose.disconnect();
    console.log('\n✅ 断开连接');
    
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
    console.error(`   代码: ${error.code || 'N/A'}`);
    console.error(`   名称: ${error.name || 'N/A'}`);
    if (error.stack) {
      console.error(`   堆栈: ${error.stack.split('\n')[0]}`);
    }
    process.exit(1);
  }
}

test();