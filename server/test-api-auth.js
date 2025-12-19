#!/usr/bin/env node

/**
 * API 认证测试脚本
 * 测试 test@example.com 用户的 API 访问
 */

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/User.js';

// 加载环境变量
dotenv.config();

// 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mss_ai_coder';
const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 获取测试用户的 JWT 令牌
 */
async function getTestUserToken() {
  console.log('🔐 获取测试用户令牌...');
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 环境变量未设置');
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
      throw new Error(`测试用户 ${TEST_EMAIL} 未找到`);
    }
    
    console.log(`✅ 找到测试用户: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   推荐码: ${user.myReferralCode}`);
    
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
    
    console.log(`✅ 令牌生成成功`);
    console.log(`   令牌长度: ${token.length} 字符`);
    console.log(`   令牌前50字符: ${token.substring(0, 50)}...`);
    
    // 验证令牌
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`✅ 令牌验证成功`);
      console.log(`   用户ID: ${decoded.userId}`);
      console.log(`   邮箱: ${decoded.email}`);
      console.log(`   过期时间: ${new Date(decoded.exp * 1000).toISOString()}`);
    } catch (verifyError) {
      console.error(`❌ 令牌验证失败: ${verifyError.message}`);
    }
    
    await mongoose.disconnect();
    
    return {
      token,
      user,
      payload
    };
    
  } catch (error) {
    console.error(`❌ 获取用户令牌失败: ${error.message}`);
    throw error;
  }
}

/**
 * 测试 API 端点
 */
async function testApiEndpoint(url, method = 'GET', token = null, data = null) {
  console.log(`\n🌐 测试 API: ${method} ${url}`);
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.ok) {
      console.log(`   ✅ 请求成功`);
      if (typeof responseData === 'object') {
        console.log(`   响应数据: ${JSON.stringify(responseData, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`   响应: ${responseData.substring(0, 200)}...`);
      }
    } else {
      console.log(`   ❌ 请求失败`);
      console.log(`   错误详情: ${responseText.substring(0, 300)}`);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
    
  } catch (error) {
    console.error(`   ❌ 请求异常: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 主测试函数
 */
async function runApiTests() {
  console.log('🚀 开始 API 认证测试');
  console.log('='.repeat(60));
  
  let tokenData = null;
  
  try {
    // 1. 获取测试用户令牌
    tokenData = await getTestUserToken();
    const { token, user } = tokenData;
    
    // 2. 测试健康检查端点（无需认证）
    console.log('\n📋 测试健康检查端点:');
    await testApiEndpoint(`${API_BASE_URL}/health`);
    await testApiEndpoint(`${API_BASE_URL}/health/email`);
    
    // 3. 测试认证端点（需要令牌）
    console.log('\n🔐 测试认证端点:');
    
    // 测试 /api/auth/me (需要认证)
    const meResult = await testApiEndpoint(`${API_BASE_URL}/api/auth/me`, 'GET', token);
    
    if (meResult.success) {
      console.log(`\n✅ 用户认证测试通过！`);
      console.log(`   用户: ${user.email}`);
      console.log(`   用户ID: ${user._id}`);
      console.log(`   可以通过 API 正常访问用户数据`);
    } else {
      console.log(`\n❌ 用户认证测试失败`);
      console.log(`   可能原因:`);
      console.log(`   1. 令牌无效或过期`);
      console.log(`   2. 用户不存在或状态异常`);
      console.log(`   3. 认证中间件配置问题`);
    }
    
    // 4. 测试发送验证码端点（无需认证，但受频率限制）
    console.log('\n📧 测试验证码发送端点（可能受频率限制）:');
    const sendCodeData = {
      email: TEST_EMAIL,
      type: 'login'
    };
    await testApiEndpoint(`${API_BASE_URL}/api/auth/send-code`, 'POST', null, sendCodeData);
    
    // 5. 测试未认证访问 /api/auth/me
    console.log('\n🚫 测试未认证访问 /api/auth/me (应返回 401/403):');
    await testApiEndpoint(`${API_BASE_URL}/api/auth/me`, 'GET', null);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 API 测试总结:');
    
    if (meResult.success) {
      console.log('🎉 所有关键测试通过！');
      console.log('\n✅ 验证结果:');
      console.log('   1. 数据库连接正常');
      console.log('   2. 测试用户存在且可访问');
      console.log('   3. JWT 令牌生成和验证正常');
      console.log('   4. API 认证端点正常工作');
      console.log('   5. 用户可以通过认证 API 访问数据');
      
      return true;
    } else {
      console.log('⚠️  部分测试失败，但用户已成功创建');
      console.log('\n📋 用户信息:');
      console.log(`   邮箱: ${user.email}`);
      console.log(`   用户ID: ${user._id}`);
      console.log(`   推荐码: ${user.myReferralCode}`);
      console.log(`   创建时间: ${user.createdAt.toISOString()}`);
      
      console.log('\n💡 后续步骤:');
      console.log('   1. 检查服务器日志确认认证中间件配置');
      console.log('   2. 验证 JWT_SECRET 环境变量是否正确');
      console.log('   3. 检查 auth.js 中的认证逻辑');
      
      return false;
    }
    
  } catch (error) {
    console.error(`\n❌ API 测试失败: ${error.message}`);
    console.error('堆栈:', error.stack);
    return false;
  }
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runApiTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试运行器错误:', error);
      process.exit(1);
    });
}