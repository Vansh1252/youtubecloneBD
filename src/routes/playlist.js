const express = require('express');
const router = express.Router();
const { getPlaylistById, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist } = require('../controllers/playlist');
const uploads = require('../middlewares/videomultermiddlewares');
const verifyjwt = require('../middlewares/authmiddlewares');


router.get('/:playlistId', verifyjwt, getUserPlaylists);
router.post('/save', verifyjwt, createPlaylist);
router.get('/delete/:playlistId', verifyjwt, deletePlaylist);
router.get('/video/:videoId/:playlistId', verifyjwt, getPlaylistById);
router.get('/getone', verifyjwt, getPlaylistById);
router.get('/remove//:videoId/:playlistId', verifyjwt, removeVideoFromPlaylist);



module.exports = router;