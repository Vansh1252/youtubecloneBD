const express = require('express');
const router = express.Router();
const { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } = require('../controllers/subscription');
const verifyjwt = require('../middlewares/authmiddlewares');


router.post('/channel', verifyjwt, getSubscribedChannels);
router.get('/usersubscriber', verifyjwt, getUserChannelSubscribers);
router.post('/toggle', verifyjwt, toggleSubscription);



module.exports = router;