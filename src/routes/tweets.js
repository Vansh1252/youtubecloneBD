const express = require('express');
const router = express.Router();
const verifyjwt = require('../middlewares/authmiddlewares');
const { deletetweet, getUsertweets, save } = require('../controllers/tweets');

router.post('/save', verifyjwt, save);
router.get('/', verifyjwt, getUsertweets);
router.get('/delete', verifyjwt, deletetweet);


module.exports = router;