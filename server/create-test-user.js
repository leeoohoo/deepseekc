#!/usr/bin/env node

/**
 * 创建测试用户脚本
 * 用于验证数据库操作功能
 * 
 * 使用方法：
 * node create-test-user.js
 * 
 * 这将创建测试用户 test@example.com 并显示结果
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import VerificationCode from './src/models/VerificationCode.js';

// 加载环境变量
dotenv.config();

// 测试用户配置
const TEST_USER = {
  email: 'test@example.com',
  isVerified: true,
  verificationCode: null,
  verificationCodeExpires: null,
  referralCode: null,
  // myReferralCode 将在保存时自动生成
};

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mss_ai_coder';

/**
 * 连接数据库
 */
async function connectDB() {
  try {
    console.log('🔌 连接数据库...');
    console.log(`数据库URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log(`✅ 数据库连接成功`);
    console.log(`   主机: ${conn.connection.host}`);
    console.log(`   数据库: ${conn.connection.name}`);
    console.log(`   状态: ${conn.connection.readyState === 1 ? '已连接' : '未连接'}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ 数据库连接失败: ${error.message}`);
    throw error;
  }
}

/**
 * 检查用户是否已存在
 */
async function checkUserExists(email) {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  用户 ${email} 已存在`);
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   创建时间: ${existingUser.createdAt}`);
      console.log(`   验证状态: ${existingUser.isVerified ? '已验证' : '未验证'}`);
      console.log(`   推荐码: ${existingUser.myReferralCode || '无'}`);
      return existingUser;
    }
    console.log(`✅ 用户 ${email} 不存在，可以创建`);
    return null;
  } catch (error) {
    console.error(`❌ 检查用户存在性失败: ${error.message}`);
    throw error;
  }
}

/**
 * 创建测试用户
 */
async function createTestUser(userData) {
  try {
    console.log(`\n👤 创建测试用户: ${userData.email}`);
    
    // 创建用户实例
    const user = new User(userData);
    
    // 保存用户
    await user.save();
    
    console.log(`✅ 用户创建成功`);
    console.log(`   ID: ${user._id}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   验证状态: ${user.isVerified ? '已验证' : '未验证'}`);
    console.log(`   推荐码: ${user.myReferralCode || '无'}`);
    console.log(`   创建时间: ${user.createdAt}`);
    console.log(`   最后登录: ${user.lastLoginAt || '从未登录'}`);
    
    return user;
  } catch (error) {
    console.error(`❌ 用户创建失败: ${error.message}`);
    
    // 处理唯一约束错误
    if (error.code === 11000) {
      console.error(`   错误详情: 唯一约束冲突 (可能是邮箱或推荐码重复)`);
      console.error(`   重复字段: ${JSON.stringify(error.keyValue)}`);
    }
    
    throw error;
  }
}

/**
 * 清理验证码数据
 */
async function cleanupVerificationCodes(email) {
  try {
    const result = await VerificationCode.deleteMany({ email });
    console.log(`🧹 清理验证码数据: 删除了 ${result.deletedCount} 条 ${email} 的验证码记录`);
    return result;
  } catch (error) {
    console.error(`❌ 清理验证码数据失败: ${error.message}`);
    // 不抛出错误，因为这不是主要操作
  }
}

/**
 * 显示数据库统计信息
 */
async function showDatabaseStats() {
  try {
    const userCount = await User.countDocuments();
    const verificationCodeCount = await VerificationCode.countDocuments();
    
    console.log(`\n📊 数据库统计信息:`);
    console.log(`   用户总数: ${userCount}`);
    console.log(`   验证码记录数: ${verificationCodeCount}`);
    
    // 显示最近的几个用户
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('email createdAt isVerified myReferralCode');
    
    console.log(`\n📝 最近创建的用户:`);
    if (recentUsers.length === 0) {
      console.log('   无用户数据');
    } else {
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.createdAt.toISOString().split('T')[0]}) - ${user.isVerified ? '已验证' : '未验证'} - 推荐码: ${user.myReferralCode || '无'}`);
      });
    }
  } catch (error) {
    console.error(`❌ 获取数据库统计信息失败: ${error.message}`);
  }
}

/**
 * 断开数据库连接
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ 数据库连接已断开');
  } catch (error) {
    console.error(`❌ 断开数据库连接失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始创建测试用户...');
  console.log('='.repeat(60));
  
  let conn = null;
  let createdUser = null;
  
  try {
    // 1. 连接数据库
    conn = await connectDB();
    
    // 2. 检查用户是否已存在
    const existingUser = await checkUserExists(TEST_USER.email);
    
    if (existingUser) {
      console.log(`\n📋 使用现有用户: ${existingUser.email}`);
      createdUser = existingUser;
    } else {
      // 3. 清理旧的验证码数据
      await cleanupVerificationCodes(TEST_USER.email);
      
      // 4. 创建测试用户
      createdUser = await createTestUser(TEST_USER);
    }
    
    // 5. 显示数据库统计信息
    await showDatabaseStats();
    
    // 6. 输出用户信息摘要
    console.log('\n✅ 操作完成');
    console.log('='.repeat(60));
    console.log('📋 测试用户信息:');
    console.log(`   邮箱: ${createdUser.email}`);
    console.log(`   用户ID: ${createdUser._id}`);
    console.log(`   推荐码: ${createdUser.myReferralCode || '无'}`);
    console.log(`   验证状态: ${createdUser.isVerified ? '已验证' : '未验证'}`);
    console.log(`   创建时间: ${createdUser.createdAt.toISOString()}`);
    console.log(`\n🔗 数据库: ${conn.connection.name}`);
    console.log(`📁 集合: users`);
    
    console.log('\n💡 提示:');
    console.log('   1. 验证数据库连接: node test-config.js');
    console.log('   2. 运行集成测试: node test-integration.js');
    console.log('   3. 启动服务器: npm run dev');
    
    return {
      success: true,
      user: createdUser,
      isNewUser: !existingUser
    };
    
  } catch (error) {
    console.error('\n❌ 创建测试用户失败');
    console.error(`错误详情: ${error.message}`);
    
    if (error.stack) {
      console.error('\n堆栈跟踪:');
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    // 7. 断开数据库连接
    if (mongoose.connection.readyState === 1) {
      await disconnectDB();
    }
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('未捕获的错误:', error);
      process.exit(1);
    });
}

// 导出函数供其他模块使用
export { 
  connectDB, 
  disconnectDB, 
  checkUserExists, 
  createTestUser, 
  cleanupVerificationCodes,
  showDatabaseStats 
};