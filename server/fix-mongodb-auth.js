#!/usr/bin/env node

/**
 * MongoDB认证修复脚本
 * 修复用户deepseek_user的权限问题
 * 
 * 使用方法：
 * 1. 使用管理员账户： ADMIN_MONGODB_URI='mongodb://admin:password@localhost:27017/admin' node fix-mongodb-auth.js
 * 2. 或使用当前连接尝试修复： node fix-mongodb-auth.js
 */

import { MongoClient } from 'mongodb';

// 从环境变量获取管理员连接字符串，否则使用普通连接字符串
const adminConnectionString = process.env.ADMIN_MONGODB_URI;
const regularConnectionString = process.env.MONGODB_URI || 'mongodb://deepseek_user:KY4mWEbDFoIpk3JU@localhost:27017/deepseek_cli_website?authSource=admin';

const TARGET_DB = 'deepseek_cli_website';
const TARGET_USER = 'deepseek_user';
const TARGET_PASSWORD = 'KY4mWEbDFoIpk3JU';

console.log('🔧 MongoDB认证修复');
console.log('======================');
if (adminConnectionString) {
  console.log(`管理员连接: ${adminConnectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
}
console.log(`目标用户: ${TARGET_USER}`);
console.log(`目标数据库: ${TARGET_DB}`);
console.log();

async function withClient(connectionString, callback) {
  const client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  try {
    await client.connect();
    return await callback(client);
  } finally {
    await client.close();
  }
}

async function checkUserExists(client, dbName = 'admin') {
  try {
    const adminDb = client.db(dbName);
    const result = await adminDb.command({ usersInfo: TARGET_USER });
    return result.users && result.users.length > 0 ? result.users[0] : null;
  } catch (err) {
    // 可能没有权限
    return null;
  }
}

async function createOrUpdateUser(client) {
  console.log('1. 检查用户状态...');
  
  // 首先在admin数据库中检查
  let existingUser = await checkUserExists(client, 'admin');
  
  if (existingUser) {
    console.log(`✅ 用户 ${TARGET_USER} 存在于 admin 数据库`);
    console.log(`   角色: ${JSON.stringify(existingUser.roles)}`);
    
    // 检查是否对目标数据库有readWrite角色
    const hasReadWriteOnTarget = existingUser.roles.some(role => 
      role.role === 'readWrite' && role.db === TARGET_DB
    );
    
    if (!hasReadWriteOnTarget) {
      console.log(`⚠️  用户缺少对 ${TARGET_DB} 数据库的 readWrite 角色`);
      console.log('   正在更新角色...');
      
      try {
        const adminDb = client.db('admin');
        await adminDb.command({
          updateUser: TARGET_USER,
          pwd: TARGET_PASSWORD,
          roles: [
            ...existingUser.roles.filter(role => !(role.role === 'readWrite' && role.db === TARGET_DB)),
            { role: 'readWrite', db: TARGET_DB }
          ]
        });
        console.log(`✅ 已添加 readWrite 角色到 ${TARGET_DB} 数据库`);
      } catch (err) {
        console.log(`❌ 无法更新用户角色: ${err.message}`);
        return false;
      }
    } else {
      console.log(`✅ 用户已有对 ${TARGET_DB} 数据库的 readWrite 角色`);
    }
    
    // 检查是否有其他必要角色
    const hasDbAdmin = existingUser.roles.some(role => role.role === 'dbAdmin' && role.db === TARGET_DB);
    if (!hasDbAdmin) {
      console.log(`💡 建议: 为用户添加 dbAdmin 角色以获得更好的管理权限`);
    }
    
    return true;
  } else {
    console.log(`❌ 用户 ${TARGET_USER} 不存在于 admin 数据库`);
    
    // 尝试在目标数据库中检查
    const userInTargetDb = await checkUserExists(client, TARGET_DB);
    if (userInTargetDb) {
      console.log(`⚠️  用户存在于 ${TARGET_DB} 数据库，但认证数据库应为 admin`);
      console.log(`   请将用户迁移到 admin 数据库，或修改连接字符串的 authSource`);
      return false;
    }
    
    // 创建新用户
    console.log('2. 创建新用户...');
    try {
      const adminDb = client.db('admin');
      await adminDb.command({
        createUser: TARGET_USER,
        pwd: TARGET_PASSWORD,
        roles: [
          { role: 'readWrite', db: TARGET_DB },
          { role: 'dbAdmin', db: TARGET_DB }
        ]
      });
      console.log(`✅ 用户 ${TARGET_USER} 创建成功`);
      console.log(`   授予角色: readWrite, dbAdmin 在 ${TARGET_DB} 数据库`);
      return true;
    } catch (err) {
      console.log(`❌ 无法创建用户: ${err.message}`);
      console.log(`   需要管理员权限`);
      return false;
    }
  }
}

async function testConnection(client) {
  console.log('\n3. 测试连接...');
  try {
    const targetDb = client.db(TARGET_DB);
    const collections = await targetDb.listCollections().toArray();
    console.log(`✅ 可以访问 ${TARGET_DB} 数据库`);
    console.log(`   现有集合数: ${collections.length}`);
    
    // 测试写入
    const testCollection = targetDb.collection('auth_test');
    const testDoc = { test: '修复脚本测试', timestamp: new Date() };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ 插入测试文档成功，ID: ${insertResult.insertedId}`);
    
    // 清理
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`✅ 清理测试文档成功`);
    
    return true;
  } catch (err) {
    console.log(`❌ 测试失败: ${err.message}`);
    return false;
  }
}

async function main() {
  let success = false;
  
  // 首先尝试使用管理员连接
  if (adminConnectionString) {
    console.log('使用管理员连接进行修复...');
    success = await withClient(adminConnectionString, async (client) => {
      const userFixed = await createOrUpdateUser(client);
      if (userFixed) {
        return await testConnection(client);
      }
      return false;
    });
    
    if (success) {
      console.log('\n🎉 修复成功！');
    } else {
      console.log('\n❌ 使用管理员连接修复失败');
    }
  }
  
  // 如果管理员连接未提供或修复失败，尝试使用普通连接
  if (!success && !adminConnectionString) {
    console.log('\n尝试使用当前连接进行诊断...');
    success = await withClient(regularConnectionString, async (client) => {
      return await testConnection(client);
    });
    
    if (success) {
      console.log('\n✅ 当前连接工作正常，但用户权限可能需要调整');
      console.log('💡 建议: 使用管理员账户运行此脚本以修复权限');
      console.log('   命令: ADMIN_MONGODB_URI="mongodb://admin:password@localhost:27017/admin" node fix-mongodb-auth.js');
    } else {
      console.log('\n❌ 当前连接测试失败');
    }
  }
  
  // 提供配置建议
  console.log('\n📋 配置检查:');
  console.log(`   连接字符串: ${regularConnectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  console.log(`   authSource 参数: ${regularConnectionString.includes('authSource=admin') ? '✅ 已设置' : '❌ 未设置'}`);
  
  if (!regularConnectionString.includes('authSource=admin')) {
    console.log('💡 建议: 在连接字符串中添加 ?authSource=admin');
  }
  
  console.log('\n======================');
  console.log(success ? '✅ 修复完成' : '❌ 修复未完成');
  
  process.exit(success ? 0 : 1);
}

// 执行主函数
main().catch(error => {
  console.error('❌ 脚本执行错误:', error);
  process.exit(1);
});