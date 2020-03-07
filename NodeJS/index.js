const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors')



let dinoController = require('./controllers/dinoController');


let app = express();
app.use(bodyparser.json())
app.use(cors({ origin: 'http://localhost:4200' }));

app.listen(4000, () => console.log('Server started at port : 4000'))

app.use('/dinos', dinoController);