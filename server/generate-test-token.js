#!/usr/bin/env node

/**
 * 生成测试用户的 JWT 令牌
 */

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/User.js';

// 加载环境变量
dotenv.config();

// 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mss_ai_coder';
const TEST_EMAIL = 'test@example.com';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function generateTokenForTestUser() {
  if (!JWT_SECRET) {
    console.error('错误: JWT_SECRET 环境变量未设置');
    process.exit(1);
  }
  
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    // 查找测试用户
    const user = await User.findOne({ email: TEST_EMAIL });
    
    if (!user) {
      console.error(`错误: 测试用户 ${TEST_EMAIL} 未找到`);
      console.log('请先运行 create-test-user.js 创建测试用户');
      process.exit(1);
    }
    
    // 生成令牌（与 auth.js 中的 generateToken 函数一致）
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      isVerified: user.isVerified,
      myReferralCode: user.myReferralCode
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    // 输出令牌和用户信息
    console.log('✅ 测试用户令牌生成成功');
    console.log('='.repeat(50));
    console.log('\n📋 用户信息:');
    console.log(`   邮箱: ${user.email}`);
    console.log(`   用户ID: ${user._id}`);
    console.log(`   推荐码: ${user.myReferralCode}`);
    console.log(`   验证状态: ${user.isVerified ? '已验证' : '未验证'}`);
    
    console.log('\n🔐 JWT 令牌:');
    console.log(token);
    
    console.log('\n📝 令牌详情:');
    console.log(`   长度: ${token.length} 字符`);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`   用户ID: ${decoded.userId}`);
      console.log(`   邮箱: ${decoded.email}`);
      console.log(`   过期时间: ${new Date(decoded.exp * 1000).toISOString()}`);
      console.log(`   签发时间: ${new Date(decoded.iat * 1000).toISOString()}`);
    } catch (verifyError) {
      console.error(`   令牌验证失败: ${verifyError.message}`);
    }
    
    console.log('\n💡 使用方法:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/auth/me`);
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/auth/me | jq .`);
    
    console.log('\n⚠️  注意: 令牌包含敏感信息，请勿泄露！');
    
    await mongoose.disconnect();
    
    return token;
    
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTokenForTestUser()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('生成令牌失败:', error);
      process.exit(1);
    });
}