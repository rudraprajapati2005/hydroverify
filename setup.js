#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Green Hydrogen Credits Project...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  try {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created successfully');
    console.log('⚠️  Please edit .env file with your configuration before starting the app\n');
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message);
    console.log('📝 Please manually copy env.example to .env and configure it\n');
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed successfully\n');
} catch (error) {
  console.log('❌ Failed to install backend dependencies:', error.message);
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('npm run install:all', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed successfully\n');
} catch (error) {
  console.log('❌ Failed to install frontend dependencies:', error.message);
  console.log('💡 Try running manually: cd client && npm install');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  try {
    fs.mkdirSync(uploadsDir);
    console.log('✅ Uploads directory created successfully\n');
  } catch (error) {
    console.log('❌ Failed to create uploads directory:', error.message);
  }
} else {
  console.log('✅ Uploads directory already exists\n');
}

console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Edit .env file with your MongoDB connection and JWT secret');
console.log('2. Start MongoDB service');
console.log('3. Run the application:');
console.log('   - Development mode: npm run dev:full');
console.log('   - Backend only: npm run dev');
console.log('   - Frontend only: npm run client');
console.log('\n🌐 Access the application at:');
console.log('   - Frontend: http://localhost:3000');
console.log('   - Backend API: http://localhost:5000');
console.log('\n📚 Check README.md for detailed documentation');
