const jwt = require('jsonwebtoken');
const appError = require('./appError');
const asyncHandler = require('express-async-handler');
const User = require('../Models/userModel');

exports.verifyToken = asyncHandler(async(req, res, next)=>{
    let token ;
    if( req.headers.authorization && req.headers.authorization.startWith('Bearer'))
        token = req.headers.authorization;

    else 
        token = req.cookies.jwt;   
    
    if(!token) return next(new appError('You are not logged in! Please login for get access', 401));

    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user    = await User.findById(decoded?._id);

    if(  user.resetToken && user.resetToken != null)  //when user doesn't complete reset password steps
        return next(new appError('You are not logged in! Please login for get access', 401));

    if(!user) return next(new appError('Invalid token', 404));

    req.user = user;
    next();    
});

exports.isValidResetToken = asyncHandler(async(req, res, next)=>{
    let token = req.params.token;
    
    let user = await User.findOne({
        $and:[
            {resetToken: token},
            {expireToken: {
               $gt: Date.now()
            }
        }
    ]
    });

   if(!user) return next(new appError('Invalid token or expired', 404));
   return res.status(200).json({
       status: 'success',
       message: 'Valid token'
   })
});