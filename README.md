# Weather Data Pipeline Web Application

A modern, responsive web application for monitoring and managing AWS-enabled weather data pipelines with machine learning capabilities.

## Features

- **Real-time Dashboard**: Monitor weather data, pipeline status, and system metrics
- **Weather Predictions**: Generate forecasts using trained ML models
- **Indian Cities Weather Grid**: Live weather data for 10 major Indian cities with 3 decimal precision
- **Dual API Key System**: Automatic fallback between WeatherAPI.com keys for reliability
- **Data Pipeline Monitoring**: Track data ingestion, processing, and storage
- **Analytics & Visualization**: Interactive charts and data insights
- **Admin Settings**: Secure configuration management (admin-only access)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Location Services**: Automatic location detection for personalized weather

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Docker, Nginx

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-data-pipeline-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 🔐 Admin Access & Production Deployment

### For Free Public Service Deployment

When deploying as a free public service, the Settings page should be **disabled** for security reasons:

```bash
# In .env.production
REACT_APP_ENABLE_SETTINGS=false
REACT_APP_ADMIN_MODE=false
REACT_APP_ENABLE_EXPORT=false
```

**Why Settings are Restricted:**
- AWS credentials should never be exposed to end users
- Data pipeline configurations affect all users
- Configuration changes could break the service for everyone
- Maintains security and operational integrity

### For Admin/Development Access

To enable admin features during development:

```bash
# In .env (development only)
REACT_APP_ADMIN_MODE=true
REACT_APP_ENABLE_SETTINGS=true
```

### Environment Configuration

The application supports multiple environment configurations:

- **`.env`** - Development settings
- **`.env.production`** - Production settings (settings disabled)
- **`env.example`** - Template for environment variables

### API Key Management

The application uses a dual API key system for WeatherAPI.com:

- **Primary Key**: `19978c5b839242f3bb355837251710`
- **Fallback Key**: `CWOJitI265oS65Urb3fKjQsJmvjBHcoI`

The system automatically switches to the fallback key if the primary key fails due to rate limits or other issues.

## 🚀 Deployment Options

### Option 1: Free Hosting (Recommended for Public Service)

Deploy to platforms like Vercel, Netlify, or GitHub Pages:

1. Set environment variables in your hosting platform
2. Use `.env.production` settings
3. Settings page will be automatically hidden
4. Users get weather data without configuration access

### Option 2: Docker Deployment
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.js       # Main layout with navigation
│   ├── MetricCard.js   # Metric display component
│   ├── StatusIndicator.js # Status display component
│   └── WeatherChart.js # Weather data visualization
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── WeatherPrediction.js # ML prediction interface
│   ├── DataPipeline.js # Pipeline monitoring
│   ├── Analytics.js    # Data analytics
│   └── Settings.js     # Configuration management
├── services/           # API integration
│   └── api.js         # API client and utilities
├── App.js             # Main application component
├── index.js           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## API Integration

The application integrates with several AWS services:

- **S3**: Data storage and retrieval
- **Lambda**: Data processing functions
- **SageMaker**: ML model training and inference
- **CloudWatch**: Monitoring and logging
- **Glue**: ETL data transformation
- **QuickSight**: Data visualization

### API Endpoints

- `GET /weather/current` - Current weather data
- `GET /weather/historical` - Historical weather data
- `POST /weather/predict` - Weather predictions
- `GET /pipeline/status` - Pipeline status
- `GET /pipeline/logs` - Pipeline logs
- `GET /ml/model-info` - ML model information
- `PUT /settings` - Update configuration

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `https://api.weather-pipeline.com` |
| `REACT_APP_AWS_REGION` | AWS region | `us-west-2` |
| `REACT_APP_S3_BUCKET` | S3 bucket name | `weather-data-pipeline-bucket` |
| `REACT_APP_ML_MODEL_ENDPOINT` | ML model endpoint | - |
| `REACT_APP_NOAA_API_KEY` | NOAA API key | - |

### AWS Configuration

1. Set up AWS credentials
2. Configure S3 bucket for data storage
3. Deploy Lambda functions for data processing
4. Set up SageMaker endpoints for ML inference
5. Configure CloudWatch for monitoring

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Write meaningful component names

## Deployment

### Production Build

```bash
npm run build
```

### Docker Build

```bash
docker build -t weather-pipeline-webapp .
docker run -p 3000:80 weather-pipeline-webapp
```

### AWS Deployment

1. Build the application
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Set up Route 53 for custom domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Acknowledgments

- NOAA for weather data APIs
- AWS for cloud infrastructure
- React and open-source community
- San Jose State University Data 225 course
