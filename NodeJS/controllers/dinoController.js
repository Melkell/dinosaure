const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;

let { Dino } = require('../models/dino')


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


module.exports = router;

