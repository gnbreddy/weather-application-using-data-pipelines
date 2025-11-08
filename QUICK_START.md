# Quick Start Guide

## 🚀 Getting Your Weather Data Pipeline Web App Running

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Option 1: Using the Start Scripts

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### 🎯 What You'll See

The application includes:

- **Dashboard**: Real-time weather metrics and pipeline status
- **Weather Prediction**: ML-powered weather forecasting interface
- **Data Pipeline**: AWS pipeline monitoring and management
- **Analytics**: Interactive charts and data visualization
- **Settings**: Configuration management for AWS services

### 🔧 Configuration

1. **Environment Variables:**
   - Copy `env.example` to `.env`
   - Update with your AWS credentials and API keys

2. **AWS Setup:**
   - Configure your AWS region and S3 bucket
   - Set up Lambda functions for data processing
   - Deploy SageMaker endpoints for ML inference

### 📱 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data from your weather pipeline
- **Interactive Charts**: Beautiful data visualizations
- **ML Integration**: Weather prediction using your trained models
- **AWS Integration**: Full AWS services monitoring

### 🐳 Docker Deployment

For production deployment:

```bash
docker-compose up --build
```

### 📊 Sample Data

The application includes mock data for demonstration. Replace with real API calls in the `src/services/api.js` file.

### 🆘 Troubleshooting

- **Port 3000 in use**: The app will automatically use the next available port
- **Dependencies issues**: Run `npm install --force` if needed
- **Build errors**: Check that all environment variables are set

### 📚 Next Steps

1. Connect to your real AWS services
2. Implement actual API endpoints
3. Customize the UI to match your brand
4. Add authentication and user management
5. Deploy to AWS or your preferred cloud platform

Happy coding! 🌤️


