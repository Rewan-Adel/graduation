const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const ErrorHandler = require('./Controllers/errCtr');
const appError = require('./Helpers/appError');

app.use(cors());
app.use(helmet());

app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.all('*', (req, res, next)=>{   
    return next(new appError(`Can't find ${req.originalUrl} on this server!`, 404)) 
});

app.use(ErrorHandler);

module.exports = app;