const express = require('express');
const router = express.Router();
const { getallvideos, publishAVideo, deleteVideo, getVideoById, togglePublishStatus, updateVideo } = require('../controllers/videos');
const upload = require('../middlewares/multermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/', verifyjwt, getallvideos);
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
router.put('/update', verifyjwt, upload.single({
    name: "thumbnail",
    maxCount: 1
}), updateVideo);
router.get('/details', verifyjwt, getVideoById);



module.exports = router;