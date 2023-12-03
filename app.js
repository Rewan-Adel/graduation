const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const ErrorHandler = require('./Helpers/Controllers/errCtr');
const appError = require('./src/Helpers/appError');

const authRouter = require('./Helpers/Routes/authRoute');
// const userRouter = require('./Routes/userRoute');

app.use(cors());
app.use(helmet());

app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 



app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next)=>{   
    return next(new appError(`Can't find ${req.originalUrl} on this server!`, 404)) 
});

app.use(ErrorHandler);

module.exports = app;