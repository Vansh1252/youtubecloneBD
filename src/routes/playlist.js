const express = require('express');
const router = express.Router();
const { getPlaylistById, createPlaylist, deletePlaylist, getUserPlaylists, removeVideoFromPlaylist, addVideoToPlaylist } = require('../controllers/playlist');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/playlistId', verifyjwt, getUserPlaylists);
router.post('/save', verifyjwt, createPlaylist);
router.get('/delete', verifyjwt, deletePlaylist);
router.post('/addvideo', verifyjwt, addVideoToPlaylist);
router.get('/getone', verifyjwt, getPlaylistById);
router.post('/remove', verifyjwt, removeVideoFromPlaylist);



module.exports = router;