const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

//JWT Secret
const jwtSecret = "93871117968720437458VGUbydzubGYduiuuiD0435267931"; 

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim : true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
})

// Instance
UserSchema.method.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // Return le doc mais pas le password et la session
    return _.omit(userObject, ['password', 'sessions']);

}

UserSchema.method.generateAccesAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        //JSON WebToken et return
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "13min"}, (err, token) => {
            if (!err){
                resolve(token);
            } else {
                reject();
            }
        })
    })
}

UserSchema.method.generateRefreshAuthToken = function() {
    // Genère une string 64bit hex, ne save pas dans la bdd
    return new Promise((resolve, reject) =>{
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}



UserSchema.method.createSessions = function() {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionsToDataBase(user, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.' + e);
    })
}


UserSchema.statics.findByIdAndToken = function(_id, token) {
    const User = this;

    return User.findOne({ _id, 'session.token': token });
}

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user);
                else {
                    reject();
                }
            })
        }) 
    })
}


UserSchema.statics.hashRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        //non expirée
        return false;
    } else {
        //expirée
        return true;
    }
}

//Middleware

UserSchema.pre('save', function(next) {
    let user = this;
    let costFactor = 10;

    if(user.isModified('password')) {
        //si le mdp change alors on run ce code
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})


let saveSessionsToDataBase = (user, refreshToken) => {
    return new Promise((resolve, reject) =>{
        let expiresAt = generateRefreshTokenExpiryTime();
        user.sessions.push({ 'token': refreshToken, expiresAt });
        user.save().then(() => {
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User }