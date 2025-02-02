const express = require('express');
const router = express.Router();
const verifyjwt = require('../middlewares/authmiddlewares');
const { getChannelStats, getChannelVideos } = require('../controllers/dashboard');


router.get('/', verifyjwt, getChannelStats);
router.get('/video', verifyjwt, getChannelVideos);



module.exports = router;