const express = require('express');
const router = express.Router();
const verifyjwt = require('../middlewares/authmiddlewares');
const { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } = require('../controllers/likes');

router.post('/video', verifyjwt, toggleVideoLike);
router.post('/comment', verifyjwt, toggleCommentLike);
router.post('/tweet', verifyjwt, toggleTweetLike);
router.post('/', verifyjwt, getLikedVideos);


module.exports = router;