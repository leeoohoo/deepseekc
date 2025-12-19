#!/usr/bin/env node

/**
 * MongoDB认证诊断脚本
 * 检查用户deepseek_user是否存在、权限是否正确
 */

import { MongoClient } from 'mongodb';

// 从.env文件读取连接字符串，或者使用默认值
const connectionString = process.env.MONGODB_URI || 'mongodb://deepseek_user:KY4mWEbDFoIpk3JU@localhost:27017/deepseek_cli_website?authSource=admin';

console.log('🔍 MongoDB认证诊断');
console.log('======================');
console.log(`连接字符串: ${connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
console.log();

async function diagnose() {
  let client;
  
  try {
    // 1. 测试连接
    console.log('1. 测试连接...');
    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('✅ 连接成功');
    
    // 2. 获取admin数据库中的用户信息
    console.log('\n2. 检查admin数据库中的用户信息...');
    const adminDb = client.db('admin');
    
    try {
      const users = await adminDb.command({ usersInfo: 1 });
      const deepseekUser = users.users.find(user => user.user === 'deepseek_user');
      
      if (deepseekUser) {
        console.log('✅ 找到用户 deepseek_user');
        console.log(`   数据库: ${deepseekUser.db}`);
        console.log(`   角色: ${JSON.stringify(deepseekUser.roles)}`);
        console.log(`   认证机制: ${deepseekUser.mechanisms || 'default'}`);
      } else {
        console.log('❌ 未在admin数据库中找到用户 deepseek_user');
        console.log('   现有用户:', users.users.map(u => u.user).join(', ') || '无');
      }
    } catch (err) {
      console.log('❌ 无法获取用户信息:', err.message);
    }
    
    // 3. 检查deepseek_cli_website数据库的权限
    console.log('\n3. 检查deepseek_cli_website数据库权限...');
    const targetDb = client.db('deepseek_cli_website');
    
    try {
      // 尝试列出集合（需要读权限）
      const collections = await targetDb.listCollections().toArray();
      console.log(`✅ 可以访问deepseek_cli_website数据库`);
      console.log(`   现有集合数: ${collections.length}`);
      
      // 尝试插入测试文档（需要写权限）
      const testCollection = targetDb.collection('auth_test');
      const testDoc = { test: '诊断脚本插入', timestamp: new Date() };
      const insertResult = await testCollection.insertOne(testDoc);
      console.log(`✅ 插入测试文档成功，ID: ${insertResult.insertedId}`);
      
      // 清理测试文档
      await testCollection.deleteOne({ _id: insertResult.insertedId });
      console.log(`✅ 清理测试文档成功`);
    } catch (err) {
      console.log(`❌ deepseek_cli_website数据库操作失败: ${err.message}`);
      console.log(`   错误代码: ${err.code}`);
      console.log(`   错误名称: ${err.name}`);
    }
    
    // 4. 检查其他可能的原因
    console.log('\n4. 检查其他配置...');
    
    // 检查是否启用了认证
    try {
      const adminStatus = await adminDb.command({ connectionStatus: 1 });
      console.log(`✅ 认证已启用: ${adminStatus.authInfo.authenticatedUsers ? '是' : '否'}`);
      if (adminStatus.authInfo.authenticatedUsers) {
        console.log(`   已认证用户: ${adminStatus.authInfo.authenticatedUsers.map(u => u.user).join(', ')}`);
      }
    } catch (err) {
      console.log('❌ 无法检查认证状态:', err.message);
    }
    
    console.log('\n======================');
    console.log('诊断完成');
    
  } catch (error) {
    console.error('\n❌ 诊断过程中出现错误:');
    console.error(`   错误: ${error.message}`);
    console.error(`   代码: ${error.code || 'N/A'}`);
    console.error(`   名称: ${error.name || 'N/A'}`);
    
    // 提供常见错误的解决方案
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 建议解决方案:');
      console.error('   1. 检查用户名和密码是否正确');
      console.error('   2. 确认用户在admin数据库中是否存在');
      console.error('   3. 运行修复脚本创建用户: node fix-mongodb-auth.js');
    } else if (error.message.includes('command find requires authentication')) {
      console.error('\n💡 建议解决方案:');
      console.error('   用户缺少对数据库的读取权限');
      console.error('   需要为用户添加readWrite角色');
    } else if (error.message.includes('command insert requires authentication')) {
      console.error('\n💡 建议解决方案:');
      console.error('   用户缺少对数据库的写入权限');
      console.error('   需要为用户添加readWrite角色');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n连接已关闭');
    }
  }
}

// 执行诊断
diagnose().catch(console.error);