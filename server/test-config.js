#!/usr/bin/env node

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? '***' + process.env.MONGODB_URI.substring(process.env.MONGODB_URI.length - 20) : 'NOT SET'}`);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    return false;
  }

  try {
    // Attempt to connect
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Ready state: ${conn.connection.readyState}`);
    
    // Check connection status
    const isConnected = mongoose.connection.readyState === 1;
    console.log(`✅ Connection active: ${isConnected}`);
    
    // Disconnect after test
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
}

function testJWTFunctionality() {
  console.log('\n🔍 Testing JWT functionality...');
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '***' + process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 10) : 'NOT SET'}`);
  console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'NOT SET'}`);
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not set');
    return false;
  }

  try {
    // Test payload
    const payload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      isVerified: true,
      role: 'user'
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    
    console.log(`✅ Token generated: ${token.substring(0, 20)}...`);
    console.log(`✅ Token length: ${token.length} characters`);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified successfully`);
    console.log(`✅ Decoded payload:`);
    console.log(`   - userId: ${decoded.userId}`);
    console.log(`   - email: ${decoded.email}`);
    console.log(`   - exp: ${decoded.exp} (${new Date(decoded.exp * 1000).toISOString()})`);
    console.log(`   - iat: ${decoded.iat} (${new Date(decoded.iat * 1000).toISOString()})`);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    console.log(`✅ Token expires in: ${expiresIn} seconds (${Math.floor(expiresIn / 86400)} days)`);
    
    return true;
  } catch (error) {
    console.error(`❌ JWT Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting configuration tests...\n');
  
  let allPassed = true;
  
  // Test database connection
  const dbPassed = await testDatabaseConnection();
  allPassed = allPassed && dbPassed;
  
  // Test JWT functionality
  const jwtPassed = testJWTFunctionality();
  allPassed = allPassed && jwtPassed;
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Database connection: ${dbPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ JWT functionality: ${jwtPassed ? 'PASS' : 'FAIL'}`);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '❌ Some tests failed.'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});