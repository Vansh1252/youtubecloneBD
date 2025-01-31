const express = require('express');
const router = express.Router();
const { getallvideos, publishAVideo, deleteVideo, getVideoById, togglePublishStatus, updateVideo } = require('../controllers/videos');
const uploads = require('../middlewares/videomultermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/', verifyjwt, getallvideos);
router.post('/save', verifyjwt, uploads.single("videofile"), publishAVideo);
router.get('/delete', verifyjwt, deleteVideo);
router.get('/publish', verifyjwt, togglePublishStatus);
router.put('/update', verifyjwt, updateVideo);
router.get('/details', verifyjwt, getVideoById);



module.exports = router;