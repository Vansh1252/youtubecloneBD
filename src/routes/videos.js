const express = require('express');
const router = express.Router();
const { getallvideos, publishAVideo, deleteVideo, getVideoById, togglePublishStatus, updateVideo } = require('../controllers/videos');
const upload = require('../middlewares/multermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');
const { registerVideoView, toggleVideoLike, checkLikeStatus } = require('../controllers/video.controller');

router.post('/', verifyjwt, getallvideos);
router.post('/save', verifyjwt, upload.fields([
    {
        name: "videofile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishAVideo);
router.post('/delete', verifyjwt, deleteVideo);
router.get('/publish', verifyjwt, togglePublishStatus);
router.put('/update', verifyjwt, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    }
]), updateVideo);
router.post('/details', verifyjwt, getVideoById);
router.post('/view', verifyjwt, registerVideoView);
router.post('/like', verifyjwt, toggleVideoLike);
router.get('/:videoId/like-status', verifyjwt, checkLikeStatus);

module.exports = router;