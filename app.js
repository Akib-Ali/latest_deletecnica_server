const express = require('express');
let nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const app = express();
const port = 8090;
require('./db/conn')
const cors = require('cors')
const router = require('./routes/router')
const creds = require("./credential.json")


app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: TRUE }))
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('./uploads'))

app.use(router)





app.listen(port, () => {
    console.log(`your server start on port number ${port}`)

})