const express = require('express');
const router = express.Router();
const { getallvideos, publishAVideo } = require('../controllers/videos');
const uploads = require('../middlewares/videomultermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/', verifyjwt, getallvideos);
router.post('/save', verifyjwt, uploads.single("videofile"), publishAVideo);


module.exports = router;