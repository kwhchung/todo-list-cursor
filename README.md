# Todo List Application

A comprehensive todo list application built with TypeScript, React, Express, and MongoDB.

## Features

- Create, read, update, and delete tasks
- Add descriptions and due dates to tasks
- Tag tasks with predefined and custom tags
- Group tags into categories
- Create custom tabs to filter and sort tasks
- Sort tasks by due date or creation date
- Responsive and modern UI using Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-list-app
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/todo-list
PORT=5000
```

## Running the Application

1. Start the backend server:
```bash
npm run server
```

2. Start the frontend development server:
```bash
npm run client
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
todo-list-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Task.ts
│   │   │   ├── Tag.ts
│   │   │   └── Tab.ts
│   │   ├── routes/
│   │   │   ├── taskRoutes.ts
│   │   │   ├── tagRoutes.ts
│   │   │   └── tabRoutes.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TagManager.tsx
│   │   │   └── TabManager.tsx
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

## API Endpoints

### Tasks
- GET /api/tasks - Get all tasks
- GET /api/tasks/:id - Get a specific task
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task

### Tags
- GET /api/tags - Get all tags
- GET /api/tags/:id - Get a specific tag
- POST /api/tags - Create a new tag
- PUT /api/tags/:id - Update a tag
- DELETE /api/tags/:id - Delete a tag

### Tabs
- GET /api/tabs - Get all tabs
- GET /api/tabs/:id - Get a specific tab
- POST /api/tabs - Create a new tab
- PUT /api/tabs/:id - Update a tab
- DELETE /api/tabs/:id - Delete a tab

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 