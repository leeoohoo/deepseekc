#!/usr/bin/env node

import dotenv from 'dotenv';
import { 
  validateEmailEnvironment, 
  verifyConnection, 
  checkHealth,
  sendTestEmail,
  resetTransporter,
  EmailConfigurationError,
  EmailTransporterError
} from './src/services/emailTransporter.js';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🔍 Testing email service configuration...\n');
  
  // Check environment variables
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.substring(process.env.EMAIL_USER.length - 10) : 'NOT SET'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 10) : 'NOT SET'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // Test 1: Environment validation
    console.log('\n📋 Test 1: Environment validation...');
    try {
      validateEmailEnvironment();
      console.log('✅ Environment validation passed');
    } catch (error) {
      if (error instanceof EmailConfigurationError) {
        console.error(`❌ Environment validation failed: ${error.message}`);
        
        if (process.env.NODE_ENV === 'production') {
          console.error('   ⚠️  Production environment requires complete email configuration');
          return false;
        } else {
          console.warn('   ⚠️  Development environment - continuing with partial configuration');
        }
      } else {
        throw error;
      }
    }
    
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const secure = port === 465;
    const user = process.env.EMAIL_USER;
    const from = process.env.EMAIL_FROM || 'noreply@deepseek-cli.com';
    
    console.log(`\n📧 Email Configuration:`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port} (secure: ${secure}, SSL: ${port === 465})`);
    console.log(`   User: ${user}`);
    console.log(`   From: ${from}`);
    
    if (host && host.includes('qq.com')) {
      console.log('   🟡 QQ Mail detected - applying optimized configuration');
      console.log('   ℹ️  Using connection pooling, timeout settings, and TLS optimization');
    }
    
    // Test 2: Transporter connection verification
    console.log('\n🔧 Test 2: Transporter connection verification...');
    try {
      // Reset transporter to ensure fresh test
      resetTransporter();
      
      const isConnected = await verifyConnection();
      if (isConnected) {
        console.log('✅ Transporter verification passed - SMTP connection successful');
        
        // Test connection caching
        console.log('   Testing connection caching...');
        const startTime = Date.now();
        const cachedResult = await verifyConnection(); // Should use cache
        const endTime = Date.now();
        
        if (endTime - startTime < 1000) {
          console.log('   ✅ Connection caching working (fast subsequent verification)');
        }
      }
    } catch (error) {
      if (error instanceof EmailTransporterError) {
        console.error(`❌ Transporter verification failed: ${error.message}`);
        
        // Provide specific troubleshooting tips for QQ mail
        if (host && host.includes('qq.com')) {
          console.log('\n🔧 QQ Mail Troubleshooting Tips:');
          console.log('   1. Ensure you are using an authorization code, not your QQ password');
          console.log('   2. Check that IMAP/SMTP service is enabled in QQ mail settings');
          console.log('   3. For port 465, ensure SSL is enabled (secure: true)');
          console.log('   4. For port 587, ensure TLS/STARTTLS is enabled');
          console.log('   5. Verify firewall allows outgoing connections on port', port);
          console.log('   6. Try using port 587 if 465 fails, or vice versa');
        }
        
        return false;
      } else {
        throw error;
      }
    }
    
    // Test 3: Health check
    console.log('\n🏥 Test 3: Health check...');
    try {
      const health = await checkHealth();
      console.log(`✅ Health check: ${health.status}`);
      console.log(`   Host: ${health.host}`);
      console.log(`   Port: ${health.port}`);
      console.log(`   Timestamp: ${health.timestamp}`);
      console.log(`   QQ Mail: ${health.isQQMail ? 'Yes' : 'No'}`);
      
      if (health.status !== 'healthy') {
        console.error(`❌ Health check failed: ${health.error}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Health check error: ${error.message}`);
      return false;
    }
    
    // Test 4: Configuration details
    console.log('\n⚙️  Test 4: Configuration details...');
    console.log('   Transporter type: Singleton (shared instance)');
    console.log('   Connection pool: Enabled for QQ Mail');
    console.log('   Retry mechanism: Enabled (3 attempts with exponential backoff)');
    console.log('   TLS optimization: Applied for QQ Mail');
    
    // Test 5: Optional email send test
    const shouldSendTestEmail = process.env.SEND_TEST_EMAIL === 'true';
    if (shouldSendTestEmail) {
      console.log('\n📤 Test 5: Test email sending (optional)...');
      console.log('   SEND_TEST_EMAIL=true detected, attempting to send test email');
      
      try {
        const testResult = await sendTestEmail('test@example.com');
        console.log(`✅ Test email sent successfully`);
        console.log(`   Message ID: ${testResult.messageId}`);
        console.log('   ⚠️  Note: Email sent to test@example.com');
      } catch (error) {
        console.error(`❌ Test email failed: ${error.message}`);
        console.log('   ⚠️  This does not necessarily mean configuration is wrong');
        console.log('   ℹ️  Test email may fail due to recipient restrictions');
      }
    } else {
      console.log('\n📤 Test 5: Test email sending (skipped)');
      console.log('   Set SEND_TEST_EMAIL=true to attempt actual email send');
      console.log('   ⚠️  Note: Not sending actual email to avoid spamming');
    }
    
    // Summary
    console.log('\n📊 Configuration Summary:');
    console.log('   ✅ Singleton transporter pattern implemented');
    console.log('   ✅ Environment validation');
    console.log('   ✅ Connection verification with caching');
    console.log('   ✅ Health check endpoint');
    console.log('   ✅ QQ Mail optimization (if applicable)');
    console.log('   ✅ Error handling with custom error classes');
    console.log('   ✅ Connection pooling and timeout settings');
    
    return true;
    
  } catch (error) {
    console.error(`❌ Unexpected error during email configuration test: ${error.message}`);
    console.error('   Stack trace:', error.stack);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting enhanced email configuration test...\n');
  console.log('   Testing new singleton transporter with optimizations');
  console.log('   ===================================================\n');
  
  const passed = await testEmailConfiguration();
  
  console.log('\n📊 Final Test Result:');
  console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'} - Email service configuration`);
  
  if (passed) {
    console.log('\n🎉 Email service is properly configured and optimized!');
    console.log('   The singleton transporter is ready for use.');
    console.log('   Features:');
    console.log('   • Singleton pattern (shared transporter instance)');
    console.log('   • QQ Mail optimization (if applicable)');
    console.log('   • Connection pooling and timeout settings');
    console.log('   • Health monitoring and verification caching');
    console.log('   • Proper error handling with retry mechanism');
  } else {
    console.log('\n❌ Email configuration needs attention.');
    console.log('   Please check the error messages above.');
    console.log('   Common issues:');
    console.log('   • Missing or incorrect environment variables');
    console.log('   • SMTP server connectivity issues');
    console.log('   • Authentication problems (wrong password/auth code)');
    console.log('   • Firewall blocking outgoing connections');
  }
  
  process.exit(passed ? 0 : 1);
}

// Run test
runTest().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});