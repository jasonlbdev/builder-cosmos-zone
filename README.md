# Dexter - AI-Powered Email Management

A modern email management platform with AI-powered categorization, task management, and calendar integration.

## 🚀 Live Application

**Production URL**: Will be updated after Netlify deployment

## 📁 Data Configuration System

This application follows the house rule: **"No mock, example or truncated code - Production only!"**

### Data Structure

All mock data is centralized in a single file:
- `shared/data/mockData.ts` - Contains all mock data and helper functions

### Data Management

The application uses `shared/data/mockData.ts` which:
- Contains all mock data in one place
- Provides helper functions to access data
- Can be easily deleted for production
- Maintains type safety with TypeScript interfaces

### Production Migration

To migrate to production:
1. **Delete mock data file**: Remove `shared/data/mockData.ts`
2. **Replace with API calls**: Update components to fetch from real APIs
3. **Deploy**: The application will use real data sources

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Access at: http://localhost:8080

### Production Build
```bash
npm run build
npm start
```
Access at: http://localhost:3000

## 🚀 Deployment

### Netlify (Recommended)
1. **Connect GitHub**: Link your repository to Netlify
2. **Auto-deploy**: Configured via `netlify.toml` - deploys automatically on push
3. **Serverless Functions**: API routes handled via `netlify/functions/`

### Manual Deployment
1. Build the application: `npm run build:client`
2. Deploy `dist/spa/` to your static hosting provider
3. Configure serverless functions for API endpoints

## 📋 Features

### ✅ Implemented
- **Email Management**: AI-powered categorization and filtering
- **Task Management**: Enhanced with team member support and follow-up automation
- **Calendar Integration**: Multi-platform sync with account status indicators
- **Settings Management**: Configurable email categories and AI rules
- **Responsive Design**: Mobile-friendly interface
- **Production Ready**: External data configuration system

### 🔄 In Progress
- **Follow-up Automation**: Automatic message scheduling for incomplete tasks
- **API Integration**: Real email platform connections

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Deployment**: Netlify

## 📝 House Rules

1. **No mock data in production code** - All mock data is externalized to configuration files
2. **Scope all work and track progress** - Use TODO system for task management
3. **Full testing before moving on** - Zero bugs policy for new commits

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `VITE_API_URL`: API endpoint for production data

### Data Configuration
Edit `shared/data/mockData.ts` to modify application data:
- Add/remove tasks in the `mockTasks` array
- Update calendar events in the `mockEvents` array
- Modify email categories in the `mockEmailCategories` array
- Change conversation data in the `mockConversations` object

## 📄 License

This project is proprietary software. All rights reserved. 