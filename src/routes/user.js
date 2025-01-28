const express = require('express');
const { registeruser, loginuser, logoutuser } = require('../controllers/user');
const router = express.Router();
const upload = require('../middlewares/multermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');

router.post('/register', upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registeruser);
router.post('/loginIn', loginuser);
router.post('/logout', verifyjwt, logoutuser)

module.exports = router;