var express = require('express');
var app = express();
var db = require('./db');
global.__root = __dirname + '/';

app.get('/api', function(req, res) {
    res.status(200).send('API works.');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var PhotoController = require(__root + 'photo/PhotoController');
app.use('/api/photos', PhotoController);

var AlbumController = require(__root + 'album/AlbumController');
app.use('/api/album', AlbumController);

var RouterController = require(__root + 'RouterConfig');
app.use('/', RouterController);

module.exports = app;