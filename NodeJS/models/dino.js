const mongoose = require('mongoose')

let Dino = mongoose.model('Dino',{
    fullName: {
        type: String
    },
    age: {
        type: String
    },
    famille: {
        type: Number
    },
    race: {
        type: String
    },
    nourriture: {
        type: String
    }
})

module.exports = { Dino }