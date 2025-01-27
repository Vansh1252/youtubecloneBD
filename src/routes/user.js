const express = require('express');
const { registeruser } = require('../controllers/user');
const router = express.Router();
const upload = require('../middlewares/multermiddlewares');

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

module.exports = router;