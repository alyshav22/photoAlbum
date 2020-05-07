var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var path = require('path');
var config = require('../config');
var thumb = require('node-thumbnail').thumb;

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var VerifyToken = require('../auth/VerifyToken');
var Album = require('./Album');
var User = require('../user/User');
var Photo = require('../photo/Photo');

var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

router.get('/', VerifyToken, function(req, res, next) {
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        Album.find({ username: user.username }, { id: 1, name: 1, description: 1, time: 1, _id: 0, coverid: 1 }, function(err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send("There was a problem finding the album .")
            };
            res.status(200).send(result);
        })
    });
});

router.post('/', VerifyToken, function(req, res, next) {
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        var id_ = uuidv1();
        var dir = path.join(__dirname, '/../data/', id_);
        fs.mkdirSync(dir, 0777);
        var coverid = id_ + '.jpg';
        fs.createReadStream(path.join(__dirname, '../data/cover.jpg')).pipe(fs.createWriteStream(dir + '/' + coverid));
        var NewAlbum = {
            id: id_,
            username: user.username,
            photos: [],
            name: 'My Album',
            description: 'New album ',
            state: 'private',
            likes: 0,
            coverid: coverid
        };
        NewAlbum.photos.push(coverid);
        Album.create(NewAlbum, function(err, res_) {
            if (err) {
                console.log(err);
                return res.status(500).send("There was a problem creating the album .")
            };
            thumb({
                source: path.join(dir, '/', coverid), // could be a filename: dest/path/image.jpg
                destination: dir,
                prefix: 'thumb-',
                suffix: '',
                width: 10
            }, function(files, err, stdout, stderr) {
                if (err)
                    console.log(err);
                console.log('All done!');
            });
            var newPhoto = {
                name: 'cover',
                id: coverid,
                username: user.username,
                albumid: id_,
                description: 'Cover',
                likes: 0,
                state: 'private'
            };
            Photo.create(newPhoto, function(err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send("There was a problem addiing Cover.");
                }
                res.status(200).send(NewAlbum);
            });

        });
    });
});

router.get('/:id', function(req, res, next) {
    var id_ = req.params.id;
    Album.findOne({ id: id_ }, function(err, album) {
        if (err) return res.status(500).send("There was a problem finding the album .");
        if (album.state == 'public' || album.state == 'only-url') return res.send(album);
        next();
    });
}, VerifyToken, function(req, res, next) {
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        Album.findOne({ id: req.params.id }, function(err, album) {
            if (err) return res.status(500).send("There was a problem finding the album .");
            if (album.state == 'public' || album.state == 'only-url') return res.send(album);
            if (user.username == album.username) return res.send(album);
            else return res.status(405).send('not-allowed');
        });
    });
});

router.put('/:id', function(req, res, next) {
    var id = req.params.id;
    var main_state = req.body.state;

    Album.findOne({ id: id }, function(err, album) {
        if (err) return res.status(500).send("There was a problem finding the album.");
        if (!album) return res.status(404).send("No album found.");
        if (album.state == 'public' && req.body.state == 'public') {
            Album.updateOne({ id: id, }, { $set: req.body }, function(err, result) {
                if (err) return res.status(500).send("There was a problem finding the album.");
                if (!result) return res.status(404).send("No album found.");
                res.send('updated-successfully');
            });
        } else {
            next();
        }
    });

}, VerifyToken, function(req, res, next) {
    var id = req.params.id;
    console.log(req.body);
    var main_state = req.body.state;
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        Album.findOne({ id: id }, function(err, album) {
            if (err) return res.status(500).send("There was a problem finding the album.");
            if (!album) return res.status(404).send("No album found.");
            if (album.username == user.username) {
                Album.updateOne({ id: id, username: user.username }, { $set: req.body }, function(err, result) {
                    if (err) return res.status(500).send("There was a problem finding the album.");
                    if (!result) return res.status(404).send("No album found.");
                    if (main_state) {
                        Album.findOne({ id: id, username: user.username }, function(err, album) {
                            if (err) return res.status(500).send("There was a problem finding the album.");
                            if (!result) return res.status(404).send("No album found.");
                            var count = album.photos.length;
                            album.photos.forEach(element => {
                                Photo.updateOne({ id: element }, { state: main_state }, function(err, presult) {
                                    if (err) return res.status(500).send("There was a problem finding the photo.");
                                    count--;
                                    if (count == 0) return res.send('updated-successfully');
                                });
                            });
                        });
                    }
                });
            } else if (album.state == 'public') {
                req.body.state = album.state;
                Album.updateOne({ id: id, username: user.username }, { $set: req.body }, function(err, result) {
                    if (err) return res.status(500).send("There was a problem finding the album.");
                    if (!result) return res.status(404).send("No album found.");
                    res.send('updated-successfully');
                });
            }
        });
    });
});

router.delete('/:id', VerifyToken, function(req, res, next) {
    var id = req.params.id;
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        Album.findOne({ id: id, username: user.username }, function(err, result) {
            if (err) return res.status(500).send("There was a problem deleting the album.");
            if (!result) return res.status(404).send("No album found.");
            var name = result.id;
            var photos = result.photos;
            Album.deleteOne({ id: id, username: user.username }, function(err, result) {
                if (err) return res.status(500).send("There was a problem deleting the album.");
                if (!result) return res.status(404).send("No album found.");
                res.status(200).send('album-deleted-successfully');
            });
            var dir = path.join(__dirname, '../data/', id);
            deleteFolderRecursive(dir);
            Photo.deleteMany({ albumid: id, username: user.username }, function(err, dres) {
                if (err) return res.status(500).send("There was a problem deleting the album.");
            });
        });
    });
});

module.exports = router;