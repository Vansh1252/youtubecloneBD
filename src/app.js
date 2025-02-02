const express = require('express');
const cors = require('cors');
const path =require('path')
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


const userroutes = require('./routes/user.js');
const videoroutes = require('./routes/videos.js');
const likesroutes = require('./routes/likes.js');
const subscriptionroutes = require('./routes/subscriptions.js');
const tweetsroutes = require('./routes/tweets.js');
const playlistroutes = require('./routes/playlist.js');
const healthcheckroutes = require('./routes/healthcheck.js');
const dashboardroutes = require('./routes/dashboard.js');
const commentroutes = require('./routes/comment.js');


app.use('/users', userroutes);
app.use('/videos', videoroutes);
app.use('/likes', likesroutes);
app.use('/subscription', subscriptionroutes);
app.use('/tweets', tweetsroutes);
app.use('/playlist', playlistroutes);
app.use('/healthcheck', healthcheckroutes);
app.use('/dashboard', dashboardroutes);
app.use('/comment', commentroutes);


module.exports = app