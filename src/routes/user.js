const express = require('express');
const { registeruser, loginuser, logoutuser, refreshAccessToken, avatarupdateuser, changecurrectpassword, coverImageupdateuser, getcurrentuser, updateAccountdetails, channelprofileofuser, getwatchhistory } = require('../controllers/user');
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
router.patch('/updateavatar', verifyjwt, upload.single("avatar"), avatarupdateuser);
router.post('/changepassword', verifyjwt, changecurrectpassword);
router.patch('/updatecoverImage', verifyjwt, upload.single("coverImage"), coverImageupdateuser);
router.get('/getcurrentuser', verifyjwt, getcurrentuser);
router.patch('/updateaccount', verifyjwt, updateAccountdetails);
router.get('/profile', verifyjwt, channelprofileofuser);
router.get('/history', verifyjwt, getwatchhistory);




module.exports = router;