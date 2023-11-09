const appError = require('../Helpers/appError');

const devErrorHandler  = (error, res)=>{
    res.status(error.statusCode).json({
        status  : error.status,
        message : error.message,
        stack   : error.stack
    })
}

const prodErrorHandler = (error, res)=>{
    if(error.isOperational){
        res.status(error.statusCode).json({
            status : error.status,
            message : error.message
        }) 
    }else{
        return res.status(500).json({
            status : 'error',
            message : 'Something went wrong'
        })
    }
}

const castErrorHandler = (error)=>{
    const message = `Invalid value ${error.value} for field ${error.path}`;
    return new appError(message, 400);
}

module.exports = (error, req, res, next)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        devErrorHandler(error, res);
    }
    else if(process.env.NODE_ENV === 'production'){
        if(error.name === 'CastError') error = castErrorHandler(error);
        prodErrorHandler(error, res);
    }
}