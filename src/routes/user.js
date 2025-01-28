const express = require('express');
const { registeruser, loginuser, logoutuser, refreshAccessToken, avatarupdateuser, changecurrectpassword, coverImageupdateuser, getcurrentuser, updateAccountdetails } = require('../controllers/user');
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
router.post('/logout', verifyjwt, logoutuser);
router.post('/refresh-token', refreshAccessToken);
router.post('/updateavatar', avatarupdateuser);
router.post('/changepassword', changecurrectpassword);
router.post('/updatecoverImage', coverImageupdateuser);
router.get('/getcurrentuser', getcurrentuser);
router.post('/updateaccount', updateAccountdetails);




module.exports = router;