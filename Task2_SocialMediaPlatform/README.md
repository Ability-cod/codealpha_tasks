# Pulse Connect

A full-stack social media web application built for the **CodeAlpha Full Stack Development Internship (Task 2: Social Media Platform)**.

Users can share posts (text, images or videos), like and comment, follow other users, and get real-time-style notifications. Security is strengthened with optional two-factor authentication using an authenticator app.

## Features

- Register and log in (JWT authentication, hashed passwords, 90-day session)
- Optional **two-factor authentication** (TOTP via Google Authenticator or similar apps)
- Editable profile: name, bio, avatar
- Create posts with text, images, or videos
- Like and comment on posts
- Follow / unfollow other users
- Personalized feed (posts from people you follow) and an Explore page (all posts)
- User search
- Notifications for likes, comments, and new followers

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, plain CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (mysql2) |
| Auth | JSON Web Tokens, bcryptjs, speakeasy (TOTP), qrcode |
| Uploads | Multer (images and videos) |

## Project structure

```
Task2_SocialMediaPlatform/
├── backend/
├── frontend/
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
   The API runs on http://localhost:5001.

3. **Start the frontend** (second terminal)
```bash
   cd frontend
   npm install
   npm run dev
```

4. **Enable two-factor authentication (optional)**: log in, go to **Security** in the navbar, and follow the setup using Google Authenticator or any TOTP app.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in (or start 2FA flow) |
| POST | `/api/auth/verify-2fa` | Public | Complete login with a 2FA code |
| POST | `/api/auth/2fa/setup` | Private | Generate a 2FA secret and QR code |
| POST | `/api/auth/2fa/confirm` | Private | Confirm and enable 2FA |
| POST | `/api/auth/2fa/disable` | Private | Disable 2FA (requires password) |
| GET | `/api/users/:username` | Private | View a profile |
| PUT | `/api/users/me/profile` | Private | Update name, bio, avatar |
| GET | `/api/users/search` | Private | Search users |
| POST/DELETE | `/api/users/:username/follow` | Private | Follow / unfollow a user |
| GET | `/api/posts/feed` | Private | Posts from people you follow |
| GET | `/api/posts/explore` | Private | All posts |
| GET | `/api/posts/user/:username` | Private | Posts by a user |
| POST | `/api/posts` | Private | Create a post (text, image, or video) |
| DELETE | `/api/posts/:id` | Private | Delete your own post |
| POST/DELETE | `/api/posts/:id/like` | Private | Like / unlike a post |
| GET/POST | `/api/posts/:id/comments` | Private | List / add comments |
| DELETE | `/api/posts/:id/comments/:commentId` | Private | Delete your own comment |
| GET | `/api/notifications` | Private | List notifications |
| GET | `/api/notifications/unread-count` | Private | Unread count |
| PUT | `/api/notifications/mark-read` | Private | Mark all as read |

## Author

**Ability Mbeki Johnbosco**, CodeAlpha Full Stack Development Intern (October 2026)