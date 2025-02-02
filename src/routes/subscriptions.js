const express = require('express');
const router = express.Router();
const { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } = require('../controllers/subscription');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/c/:channelId', verifyjwt, getSubscribedChannels);
router.get('/u/:subscriberId', verifyjwt, getUserChannelSubscribers);
router.post('/c/:channelId', verifyjwt, toggleSubscription);



module.exports = router;