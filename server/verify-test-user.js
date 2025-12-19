#!/usr/bin/env node

/**
 * 验证测试用户脚本
 * 查询数据库确认用户是否成功创建
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

// 加载环境变量
dotenv.config();

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mss_ai_coder';

async function verifyTestUser() {
  console.log('🔍 验证测试用户...');
  console.log('='.repeat(50));
  
  try {
    // 连接数据库
    console.log('连接数据库...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log('✅ 数据库连接成功');
    
    // 查询 test@example.com 用户
    const testEmail = 'test@example.com';
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log(`❌ 用户 ${testEmail} 未找到`);
      return false;
    }
    
    console.log(`✅ 用户 ${testEmail} 找到`);
    console.log('\n📋 用户详细信息:');
    console.log(`   ID: ${user._id}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   验证状态: ${user.isVerified ? '已验证' : '未验证'}`);
    console.log(`   推荐码: ${user.myReferralCode || '无'}`);
    console.log(`   创建时间: ${user.createdAt ? user.createdAt.toISOString() : '未记录'}`);
    console.log(`   最后登录: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : '从未登录'}`);
    console.log(`   引用推荐码: ${user.referralCode || '无'}`);
    
    // 验证字段完整性
    console.log('\n🔍 字段完整性检查:');
    const requiredFields = ['email', 'isVerified'];
    const allFields = ['email', 'isVerified', 'verificationCode', 'verificationCodeExpires', 
                      'referralCode', 'myReferralCode', 'lastLoginAt', 'createdAt'];
    
    let allValid = true;
    for (const field of requiredFields) {
      if (user[field] === undefined || user[field] === null) {
        console.log(`   ❌ ${field}: 缺失或为空`);
        allValid = false;
      } else {
        console.log(`   ✅ ${field}: ${user[field]}`);
      }
    }
    
    // 检查自动生成的字段
    console.log('\n🔍 自动生成字段检查:');
    if (user.myReferralCode && user.myReferralCode.length >= 6) {
      console.log(`   ✅ 推荐码已自动生成: ${user.myReferralCode}`);
    } else {
      console.log(`   ❌ 推荐码未生成或格式不正确: ${user.myReferralCode}`);
      allValid = false;
    }
    
    if (user.createdAt instanceof Date) {
      console.log(`   ✅ 创建时间有效: ${user.createdAt.toISOString()}`);
    } else {
      console.log(`   ❌ 创建时间无效: ${user.createdAt}`);
      allValid = false;
    }
    
    // 检查索引
    console.log('\n🔍 数据库索引检查:');
    try {
      const indexes = await User.collection.indexes();
      const emailIndex = indexes.find(idx => idx.key && idx.key.email === 1);
      if (emailIndex && emailIndex.unique) {
        console.log('   ✅ 邮箱唯一索引存在');
      } else {
        console.log('   ⚠️  邮箱唯一索引可能不存在');
      }
    } catch (error) {
      console.log(`   ⚠️  无法检查索引: ${error.message}`);
    }
    
    // 查询所有用户
    console.log('\n👥 数据库中的所有用户:');
    const allUsers = await User.find().sort({ createdAt: -1 }).select('email createdAt isVerified myReferralCode');
    
    if (allUsers.length === 0) {
      console.log('   无用户');
    } else {
      allUsers.forEach((u, i) => {
        const status = u.email === testEmail ? '[测试用户]' : '[其他用户]';
        console.log(`   ${i + 1}. ${u.email} ${status}`);
        console.log(`      创建: ${u.createdAt.toISOString().split('T')[0]}`);
        console.log(`      验证: ${u.isVerified ? '是' : '否'}`);
        console.log(`      推荐码: ${u.myReferralCode || '无'}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
      console.log('🎉 用户验证成功！数据库操作功能正常。');
      return true;
    } else {
      console.log('⚠️  用户创建成功，但部分字段验证失败。');
      return false;
    }
    
  } catch (error) {
    console.error(`❌ 验证失败: ${error.message}`);
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ 数据库连接已断开');
    }
  }
}

// 执行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyTestUser()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('验证过程中出错:', error);
      process.exit(1);
    });
}