const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const { mongoose } = require('../db');

let { Dino } = require('../models/dino')
let { User } = require('../models/user.model')


/* MIDDLEWARE  */



// CORS HEADERS MIDDLEWARE
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */



router.get('/', (req, res) => {
    Dino.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving Dinos :' + JSON.stringify(err, undefined, 2)) }
    })
})

router.get('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`)

    Dino.findById(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Retriving Dino :' + JSON.stringify(err, undefined, 2)) }
    });
});

router.post('/', (req, res) => {
    let di = new Dino({
        fullName: req.body.fullName,
        age: req.body.age,
        famille: req.body.famille,
        race: req.body.race,
        nourriture: req.body.nourriture
    })
    di.save((err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Dino Save :' + JSON.stringify(err, undefined, 2)) }
    });
})

router.put('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`)

    let di = {
        fullName: req.body.fullName,
        age: req.body.age,
        famille: req.body.famille,
        race: req.body.race,
        nourriture: req.body.nourriture
    };
    Dino.findByIdAndUpdate(req.params.id, { $set: di }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Dino update :' + JSON.stringify(err, undefined, 2)) }
    })
})

router.delete('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`)
    Dino.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Dino delete :' + JSON.stringify(err, undefined, 2)) }
    })
})


/*ROUTE USER */

router.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken }
        })
    }).then((authToken) => {
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

router.post('users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken }
            })
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(newUser);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


module.exports = router;

