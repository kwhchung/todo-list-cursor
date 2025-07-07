# Todo List Frontend

This is the frontend application for the Todo List project, built with React, TypeScript, and Material-UI.

## Environment Setup

### Development
Create a `.env` file in the frontend directory with the following content:

```env
REACT_APP_API_HOST=http://localhost:8080
```

### Production
For production deployment, set the environment variable to point to your deployed backend:

```env
REACT_APP_API_HOST=https://your-backend-url.com
```

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## API Configuration

The frontend uses environment variables to configure API endpoints. The configuration is centralized in `src/config/api.ts`.

### Environment Variables

- `REACT_APP_API_HOST` - The base URL of your backend API (defaults to `http://localhost:8080`)

### API Endpoints

The following endpoints are used:
- Tasks: `${API_HOST}/api/tasks`
- Tags: `${API_HOST}/api/tags`
- Tabs: `${API_HOST}/api/tabs`

## Deployment

### Vercel
1. Set the environment variable `REACT_APP_API_HOST` in your Vercel project settings
2. Deploy the frontend directory
3. Ensure your backend is deployed and accessible

### Other Platforms
1. Set the `REACT_APP_API_HOST` environment variable
2. Build the project with `npm run build`
3. Deploy the `build` directory