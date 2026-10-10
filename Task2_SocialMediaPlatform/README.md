# Pulse Connect

A full-stack social media web application built for the **CodeAlpha Full Stack Development Internship (Task 2: Social Media Platform)**.

Users can share posts with text, images, or videos, like and comment, follow other users, message each other in real time, and receive notifications — with optional two-factor authentication for added account security.

## Features

**Core social features**
- Register and log in (JWT authentication, hashed passwords, 90-day session)
- Editable profile: name, bio, avatar
- Create posts with text, images, or videos
- Like and comment on posts
- Follow / unfollow other users
- Personalized feed (posts from people you follow) and an Explore page (all posts)
- User search
- Notifications for likes, comments, and new followers

**Messaging**
- One-on-one direct messaging
- Real-time message delivery using Socket.io (no page refresh needed)
- Unread message counts per conversation

**Security**
- Optional two-factor authentication (TOTP) using an authenticator app such as Google Authenticator
- Password confirmation required to disable two-factor authentication
- Role-aware route protection on both frontend and backend

**Interface**
- Light and dark theme toggle, saved per device
- Responsive design with loading states and toast notifications

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Socket.io client, plain CSS |
| Backend | Node.js, Express.js, Socket.io |
| Database | MySQL (mysql2) |
| Auth | JSON Web Tokens, bcryptjs, speakeasy (TOTP), qrcode |
| Uploads | Multer (images and videos) |

## Project structure

```
Task2_SocialMediaPlatform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
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

**Requirements:** Node.js 18+ and MySQL (XAMPP recommended for local development).

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
   Open `.env`, set your database credentials, and generate a secret:
```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
   Then run:
```bash
   npm run dev
```
   The API runs on http://localhost:5001.

3. **Start the frontend** (second terminal)
```bash
   cd frontend
   npm install
   npm run dev
```
   The app runs on http://localhost:5173 (or the next available port).

4. **Enable two-factor authentication (optional)**: log in, open the profile menu in the top right, go to **Security**, and follow the setup using Google Authenticator or any TOTP-compatible app.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, or start the 2FA flow |
| POST | `/api/auth/verify-2fa` | Public | Complete login with a 2FA code |
| POST | `/api/auth/2fa/setup` | Private | Generate a 2FA secret and QR code |
| POST | `/api/auth/2fa/confirm` | Private | Confirm and enable 2FA |
| POST | `/api/auth/2fa/disable` | Private | Disable 2FA (requires password) |
| GET | `/api/users/:username` | Private | View a profile |
| PUT | `/api/users/me/profile` | Private | Update name, bio, avatar |
| GET | `/api/users/search` | Private | Search users |
| POST / DELETE | `/api/users/:username/follow` | Private | Follow / unfollow a user |
| GET | `/api/posts/feed` | Private | Posts from people you follow |
| GET | `/api/posts/explore` | Private | All posts |
| GET | `/api/posts/user/:username` | Private | Posts by a user |
| POST | `/api/posts` | Private | Create a post (text, image, or video) |
| DELETE | `/api/posts/:id` | Private | Delete your own post |
| POST / DELETE | `/api/posts/:id/like` | Private | Like / unlike a post |
| GET / POST | `/api/posts/:id/comments` | Private | List / add comments |
| DELETE | `/api/posts/:id/comments/:commentId` | Private | Delete your own comment |
| GET | `/api/notifications` | Private | List notifications |
| GET | `/api/notifications/unread-count` | Private | Unread notification count |
| PUT | `/api/notifications/mark-read` | Private | Mark all notifications as read |
| GET | `/api/messages/conversations` | Private | List conversations |
| GET / POST | `/api/messages/:username` | Private | Get / send messages with a user |
| GET | `/api/messages/unread-count` | Private | Unread message count |

## Author

**Ability Mbeki Johnbosco**, CodeAlpha Full Stack Development Intern (October 2026)