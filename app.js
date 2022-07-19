const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env['PORT'];

app.use(express.json());
app.use(cors());


app.use('/', require('./routes/routes.js'))

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})