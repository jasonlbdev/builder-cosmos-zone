# Dexter - AI-Powered Email Management

A modern email management platform with AI-powered categorization, task management, and calendar integration.

## 🚀 Live Application

**Production URL**: https://dexter-cosmos-1kcivlwnj-jasonlbdevs-projects.vercel.app

## 📁 Data Configuration System

This application uses an external data configuration system that follows the house rule: **"No mock, example or truncated code - Production only!"**

### Data Structure

All mock data is stored in external JSON configuration files located in:
- `config/data/` - Source configuration files
- `public/config/data/` - Files served to the frontend

### Configuration Files

1. **`config/data/tasks.json`** - Task management data
2. **`config/data/calendar.json`** - Calendar events data  
3. **`config/data/settings.json`** - Email categories and AI rules
4. **`config/data/conversations.json`** - Message conversation data

### Data Service

The application uses `shared/services/dataService.ts` to load data from external files. This service:
- Loads data asynchronously from JSON files
- Provides fallback handling for missing files
- Can be easily replaced with API calls in production
- Maintains type safety with TypeScript interfaces

### Production Migration

To migrate to production:
1. **Remove config files**: Delete `config/data/` and `public/config/data/` directories
2. **Replace data service**: Update `shared/services/dataService.ts` to make API calls
3. **Deploy**: The application will automatically use real data sources

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

### Vercel (Recommended)
```bash
vercel --prod
```

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy `dist/spa/` to your static hosting provider
3. Configure your server to serve the SPA

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
- **Deployment**: Vercel

## 📝 House Rules

1. **No mock data in production code** - All mock data is externalized to configuration files
2. **Scope all work and track progress** - Use TODO system for task management
3. **Full testing before moving on** - Zero bugs policy for new commits

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `VITE_API_URL`: API endpoint for production data

### Data Configuration
Edit the JSON files in `config/data/` to modify application data:
- Add/remove tasks in `tasks.json`
- Update calendar events in `calendar.json`
- Modify email categories in `settings.json`
- Change conversation data in `conversations.json`

## 📄 License

This project is proprietary software. All rights reserved. 