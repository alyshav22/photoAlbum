var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var fs = require('fs');
const fileUpload = require('express-fileupload');
var path = require('path');
var thumb = require('node-thumbnail').thumb;

router.use(fileUpload());
// router.use(busboy());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var VerifyToken = require('../auth/VerifyToken');
var Album = require('../album/Album');
var User = require('../user/User');
var Photo = require('../photo/Photo');



router.post('/:id', function(req, res, next) {
    req.headers['x-access-token'] = req.body['x-access-token'];
    next();
}, VerifyToken, function(req, res, next) {
    var id = req.params.id;
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    let image = req.files.image;
    let img_name = image.name;
    let exten = image.name.split('.')[(image.name.split('.')).length - 1];
    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.Please Sign in");
        Album.findOne({ id: id, username: user.username }, function(err, album) {
            if (err) return res.status(500).send("There was a problem finding the album .");
            else if (!album) return res.status(404).send("Album not found.");
            else if (album.photos.length > 999) return res.status(405).send("not allowed");
            var uploadDir = path.join(__dirname, '/../data/', id, '/');
            var fileID = uuidv1() + '.' + exten;
            var path_ = uploadDir + fileID;
            image.mv(path_, function(err) {
                if (err) return res.status(500).send("There was a problem saving the image.");
                thumb({
                    source: path_, // could be a filename: dest/path/image.jpg
                    destination: uploadDir,
                    prefix: 'thumb-',
                    suffix: '',
                    width: 10
                }, function(files, err, stdout, stderr) {
                    console.log('All done!');
                });
                var newPhoto = {
                    name: img_name,
                    id: fileID,
                    username: user.username,
                    albumid: id,
                    description: 'A New Image inside ' + album.name,
                    likes: 0,
                    state: 'private'
                };
                Photo.create(newPhoto, function(err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("There was a problem addiing Image.");
                    }
                    Album.updateOne({ id: id, username: user.username }, { $push: { "photos": fileID } }, function(err, updateresult) {
                        if (err) {
                            // console.log(err);
                            return res.status(500).send("There was a problem updating Album.");
                        }
                        res.status(200).send('success-added-image');
                    });
                    //res.status(200).send('success-added-image');
                });
            })
        });
    });
});

router.get('/details/:aid/:pid', function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            res.status(200).send(photo);
        } else {
            next();
        }
    });
}, VerifyToken, function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            var img = fs.readFileSync('../data/' + albumID + '/' + photoID);
            res.writeHead(200, { 'Content-Type': 'image' });
            res.end(img, 'binary');
        } else {
            User.findById(req.userId, { password: 0 }, function(err, user) {
                if (err)
                    return res.status(500).send("There was a problem finding the user.");
                if (!user) return res.status(404).send("No User Found");
                if (user.username == photo.username) return res.status(200).send(photo);
                else return res.status(405).send("Not Allowed");
            });
        }
    });
});

router.get('/:aid/:pid', function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            var dir = path.join(__dirname, '../data/', albumID, '/', photoID);
            var img = fs.readFileSync(dir);
            res.writeHead(200, { 'Content-Type': 'image/gif' });
            res.end(img, 'binary');
        } else {
            next();
        }
    });
}, VerifyToken, function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            var img = fs.readFileSync('../data/' + albumID + '/' + photoID);
            res.writeHead(200, { 'Content-Type': 'image/gif' });
            res.end(img, 'binary');
        } else {
            User.findById(req.userId, { password: 0 }, function(err, user) {
                if (err)
                    return res.status(500).send("There was a problem finding the user.");
                if (!user) return res.status(404).send("No User Found");
                if (user.username == photo.username) {
                    var dir = path.join(__dirname, '../data/', albumID, '/', photoID);
                    var img = fs.readFileSync(dir);
                    res.writeHead(200, { 'Content-Type': 'image/gif' });
                    res.end(img, 'binary');
                } else return res.status(405).send("Not Allowed");
            });
        }
    });
});

router.put('/:aid/:pid', function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    var main_state = req.body.state;

    Photo.findOne({ id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the photo.");
        if (!photo) return res.status(404).send("No photo found.");
        if (photo.state == 'public' && req.body.state == 'public') {
            req.body.state = 'public';
            Photo.updateOne({ albumid: albumID, id: photoID }, { $set: req.body }, function(err, result) {
                if (err) return res.status(500).send("There was a problem finding the photo.");
                res.status(200).send('updated-successfully');
            });
        } else {
            next();
        }
    });

}, VerifyToken, function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    var main_state = req.body.state;

    User.findById(req.userId, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        Photo.findOne({ id: photoID }, function(err, photo) {
            if (err) return res.status(500).send("There was a problem finding the photo.");
            if (!photo) return res.status(404).send("No photo found.");
            if (photo.username == user.username) {
                req.body.username = photo.username;
                Photo.updateOne({ albumid: albumID, id: photoID }, { $set: req.body }, function(err, result) {
                    if (err) return res.status(500).send("There was a problem finding the photo.");
                    res.status(200).send('updated-successfully');
                });
            } else if (photo.state == 'public') {
                req.body.state = 'public';
                Photo.updateOne({ albumid: albumID, id: photoID }, { $set: req.body }, function(err, result) {
                    if (err) return res.status(500).send("There was a problem finding the photo.");
                    res.status(200).send('updated-successfully');
                });
            }
        });
    });

});

router.delete('/:aid/:pid', VerifyToken, function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    User.findById(req.userId, function(err, user) {
        Photo.findOne({ id: photoID, albumid: albumID }, function(err, photo) {
            if (err) return res.status(500).send("There was a problem finding the photo.");
            if (!photo) return res.status(404).send("No photo found.");
            if (photo.username == user.username) {
                var dir = path.join(__dirname + '/../data/' + albumID + '/' + photoID);
                Photo.deleteOne(photo, function(err, result) {
                    if (err) return res.status(500).send("There was a problem finding the photo.");
                    Album.updateOne({ id: albumID, username: user.username }, { $pull: { "photos": photoID } }, function(err, updateresult) {

                    });
                    res.status(200).send('success-deleted-image');
                });
                fs.unlinkSync(dir);
            }
        })
    });
});

router.get('/thumbnail/:aid/:pid', function(req, res, next) {
    console.log('GET-THUMB');
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            var dir = path.join(__dirname, '../data/', albumID, '/thumb-', photoID);
            var img = fs.readFileSync(dir);
            res.writeHead(200, { 'Content-Type': 'image/gif' });
            res.end(img, 'binary');
        } else {
            next();
        }
    });
}, VerifyToken, function(req, res, next) {
    var albumID = req.params.aid;
    var photoID = req.params.pid;
    Photo.findOne({ albumid: albumID, id: photoID }, function(err, photo) {
        if (err) return res.status(500).send("There was a problem finding the image.");
        if (!photo) return res.status(404).send("No Image Found");
        if (photo.state == 'public' || photo.state == 'only-url') {
            var img = fs.readFileSync('../data/' + albumID + '/thumb' + photoID);
            res.writeHead(200, { 'Content-Type': 'image/gif' });
            res.end(img, 'binary');
        } else {
            User.findById(req.userId, { password: 0 }, function(err, user) {
                if (err)
                    return res.status(500).send("There was a problem finding the user.");
                if (!user) return res.status(404).send("No User Found");
                if (user.username == photo.username) {
                    var dir = path.join(__dirname, '../data/', albumID, '/', photoID);
                    var img = fs.readFileSync(dir);
                    res.writeHead(200, { 'Content-Type': 'image/gif' });
                    res.end(img, 'binary');
                } else return res.status(405).send("Not Allowed");
            });
        }
    });
});

module.exports = router;