const express = require('express');
const router = express.Router();
const verifyjwt = require('../middlewares/authmiddlewares');
const healthcheck = require('../controllers/healthcheck');

router.get('/', verifyjwt, healthcheck);


module.exports = router;