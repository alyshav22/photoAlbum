var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('./User');
var bcrypt = require('bcryptjs');
var config = require('../config');

// CREATES A NEW USER
router.post('/', function(req, res) {
    User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        },
        function(err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function(req, res) {
    User.findOne({ username: req.params.id }, { password: 0, _id: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User: " + user.name + " was deleted.");
    });
});

// UPDATES A SINGLE USER IN THE DATABASE
// Added VerifyToken middleware to make sure only an authenticated user can put to this route
router.put('/:id', VerifyToken, function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, user) {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
});

router.put('/update/:id', VerifyToken, function(req, res, next) {
    User.findById(req.userId, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found");
        if (user.username == req.params.id) {
            User.updateOne({ username: user.username }, { $set: { email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname, gender: req.body.gender } }, function(err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send("There was a problem updating the user.")
                };
                res.status(200).send("updated-successfully");
            });
        } else {
            return res.status(405).send('Not Allowed');
        }
    });
});

router.put('/updatepass/:id', VerifyToken, function(req, res, next) {
    console.log(req.body);
    User.findById(req.userId, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found");
        if (user.username == req.params.id) {
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (passwordIsValid) {
                var hashedPassword = bcrypt.hashSync(req.body.npass, 8);
                User.updateOne({ username: user.username }, { $set: { password: hashedPassword } }, function(err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("There was a problem updating the user.")
                    };
                    res.status(200).send("updated-successfully");
                });
            } else {
                return res.status(401).send('Password mismatch');
            }
        } else {
            return res.status(405).send('Not Allowed');
        }
    });
});




module.exports = router;