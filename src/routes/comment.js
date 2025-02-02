const express = require('express');
const router = express.Router();
const verifyjwt = require('../middlewares/authmiddlewares');
const { deletecomment, getvideocomment, save } = require('../controllers/comments');


router.post('/save', verifyjwt, save);
router.get('/', verifyjwt, getvideocomment);
router.post('/delete', verifyjwt, deletecomment);

module.exports = router;