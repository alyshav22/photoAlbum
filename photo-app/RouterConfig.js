var express = require('express');
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, '/public/')));

router.get('/register', function(req, res) {
    res.status(200).sendFile(path.join(__dirname, '/public/html/', 'register.html'));
});

router.get('/profile/:id', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'profile.html')));
});

router.get('/', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'index.html')));
});


router.get('/album/:id', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'album.html')));
});

router.get('/photo/:aid/:pid', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'photo.html')));
});

router.get('/logout', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'logout.html')));
});

router.get('/login', function(req, res) {
    res.status(200).sendFile((path.join(__dirname, '/public/html/', 'login.html')));
})

module.exports = router;