# Taskly

A full-stack project management tool (Trello/Asana style) built for the **CodeAlpha Full Stack Development Internship (Task 3: Project Management Tool)**.

Teams can create projects, organize work into customizable boards with drag-and-drop task cards, assign tasks to members, discuss progress through comments, and stay updated in real time.

## Features

- Register and log in (JWT authentication, hashed passwords, 90-day session)
- Editable profile: name, avatar
- Create projects and invite members by email
- Role-based access: project owners manage members and settings, members collaborate on tasks
- Kanban-style boards with customizable lists (columns)
- Drag-and-drop tasks between lists, with position persisted in the database
- Task cards with priority levels, due dates, and assignees
- Comments on tasks for team communication
- Real-time updates across all project members using Socket.io — new tasks, moved tasks, and comments appear instantly without refreshing
- Notifications for task assignments, comments, and project invitations
- Delete projects, lists, and tasks (owner-controlled where appropriate)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Socket.io client, plain CSS |
| Backend | Node.js, Express.js, Socket.io |
| Database | MySQL (mysql2) |
| Auth | JSON Web Tokens, bcryptjs |
| Uploads | Multer (avatars) |

## Project structure

```
Task3_ProjectManagementTool/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
└── database/
    └── schema.sql
```

## Getting started

**Requirements:** Node.js 18+ and MySQL (XAMPP recommended).

1. **Create the database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   Fill in your database credentials and generate a secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Then run:
   ```bash
   npm run dev
   ```
   The API runs on http://localhost:5002.

3. **Start the frontend** (second terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in |
| PUT | `/api/users/me/profile` | Private | Update name and avatar |
| GET | `/api/users/search` | Private | Search users |
| POST | `/api/projects` | Private | Create a project |
| GET | `/api/projects` | Private | List my projects |
| GET | `/api/projects/:id` | Member | View project details and members |
| PUT / DELETE | `/api/projects/:id` | Owner | Update / delete a project |
| POST | `/api/projects/:id/invite` | Owner | Invite a member by email |
| DELETE | `/api/projects/:id/members/:memberId` | Owner | Remove a member |
| POST | `/api/projects/:id/leave` | Member | Leave a project |
| GET | `/api/lists/project/:projectId` | Member | Get the board (lists with tasks) |
| POST | `/api/lists` | Member | Create a list |
| PUT | `/api/lists/:id` | Member | Rename a list |
| PUT | `/api/lists/reorder` | Member | Reorder lists |
| DELETE | `/api/lists/:id` | Owner | Delete a list |
| POST | `/api/tasks` | Member | Create a task |
| PUT | `/api/tasks/:id` | Member | Update a task |
| PUT | `/api/tasks/:id/move` | Member | Move a task between lists |
| DELETE | `/api/tasks/:id` | Member | Delete a task |
| GET / POST | `/api/tasks/:taskId/comments` | Member | List / add comments |
| DELETE | `/api/tasks/:taskId/comments/:commentId` | Author | Delete own comment |
| GET | `/api/notifications` | Private | List notifications |
| GET | `/api/notifications/unread-count` | Private | Unread count |
| PUT | `/api/notifications/mark-read` | Private | Mark all as read |

## Author

**Ability Mbeki Johnbosco**, CodeAlpha Full Stack Development Intern (October 2026)