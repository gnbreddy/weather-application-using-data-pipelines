# Weather Data Pipeline Web Application

A modern, responsive web application for monitoring and managing AWS-enabled weather data pipelines with machine learning capabilities.

## Features

- **Real-time Dashboard**: Monitor weather data, pipeline status, and system metrics
- **Weather Predictions**: Generate forecasts using trained ML models
- **Data Pipeline Monitoring**: Track data ingestion, processing, and storage
- **Analytics & Visualization**: Interactive charts and data insights
- **Settings Management**: Configure AWS services and pipeline parameters
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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
