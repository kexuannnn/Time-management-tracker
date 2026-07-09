#!/bin/bash

# StudyFlow Timetable Feature - Quick Setup Script

echo "🚀 StudyFlow Timetable Customization - Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is installed or accessible
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB found locally"
else
    echo "⚠️  MongoDB not found locally. Using MongoDB Atlas (cloud)?"
    echo "   Update MONGODB_URI in .env file"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Error installing backend dependencies"
    exit 1
fi

# Back to root
cd ..

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/studyflow
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
NODE_ENV=development
EOF
    echo "✅ .env file created"
    echo "⚠️  Update MONGODB_URI if using MongoDB Atlas"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=============================================="
echo "🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start MongoDB (if using locally):"
echo "   mongod"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "3. Open frontend in browser:"
echo "   frontend/timetable-customizer.html"
echo ""
echo "📖 For detailed instructions, see README.md"
