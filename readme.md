<h1 align="center">VideoTube – YouTube Clone Backend</h1>

<p align="center">
  A production-style backend for a YouTube-like video platform: videos, channels, subscriptions, playlists, comments, likes and short "tweet" posts.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</p>

---

## Features

- **Auth:** register and log in with access and refresh tokens (JWT) stored in cookies, plus bcrypt password hashing
- **Users and channels:** avatar and cover image uploads, profile updates, channel pages and watch history
- **Videos:** upload videos and thumbnails to Cloudinary, publish or unpublish, update and delete
- **Engagement:** comments, likes on videos, comments and tweets, and channel subscriptions
- **Playlists:** create playlists and add or remove videos
- **Tweets:** short text posts for a channel's community tab
- **Dashboard:** channel stats such as total views, subscribers, videos and likes
- **Pagination:** aggregation pipelines with mongoose-aggregate-paginate
- **Health check** endpoint for uptime monitoring

## Tech stack

| Layer | Tools |
|---|---|
| Runtime | Node.js (ES modules) |
| Framework | Express |
| Database | MongoDB with Mongoose and aggregation pipelines |
| Auth | JWT access and refresh tokens, bcrypt, cookie-parser |
| Media | Multer, Cloudinary, fluent-ffmpeg |
| Code style | Prettier |

## API modules

| Base path | Purpose |
|---|---|
| `/users` | Register, login, logout, refresh token, profile, channel, watch history |
| `/videos` | Upload, list, get, update, delete, toggle publish |
| `/comment` | Comments on videos |
| `/likes` | Toggle likes on videos, comments and tweets |
| `/subscription` | Subscribe, unsubscribe, list subscribers |
| `/playlist` | Playlist CRUD |
| `/tweets` | Tweet CRUD |
| `/dashboard` | Channel stats and videos |
| `/healthcheck` | Service health |

## Project structure

~~~text
src/
├── index.js         # Entry point: connects to the DB and starts the server
├── app.js           # Express app, middleware and routes
├── constants.js
├── controllers/     # Business logic for each module
├── db/              # MongoDB connection
├── middlewares/     # Auth and Multer middleware
├── models/          # User, Video, Comment, Like, Playlist, Subscription, Tweet
├── routes/          # Express routers
└── utils/           # ApiError, ApiResponse, asyncHandler, Cloudinary helpers
~~~

## Getting started

**Prerequisites:** Node.js 18+, MongoDB and a Cloudinary account

~~~bash
git clone https://github.com/Vansh1252/youtubecloneBD.git
cd youtubecloneBD
npm install
~~~

Create a `.env` file:

~~~env
PORT=8000
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>
DB_NAME=videotube
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
~~~

Start the server:

~~~bash
npm start
~~~

## Author

**Vansh Jain**: [GitHub](https://github.com/Vansh1252) · sanklechav65@gmail.com
