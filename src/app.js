const express = require('express');
const cors = require('cors');
const path =require('path')
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app