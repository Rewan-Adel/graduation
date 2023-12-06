const User = require('../Models/userModel');
const asyncHandler = require('express-async-handler');
const appError = require('../Helpers/appError');
const {verifyEmail, resetPassEmail} = require('../Helpers/sendMail');
const crypto = require('crypto');
const { 
    uploadImage
} = require('./globalFun');


exports.signUp = asyncHandler( async(req, res, next) =>{
    let user = await User.findOne({email: req.body.email});
    if(user)
       return  next(new appError('User already exists', 400));
    
    if(req.body.password !== req.body.confirmPass) 
        return  next(new appError("Passwords do not match", 400));

    user = await User.create(req.body);

    let sending = await verifyEmail(user, res, next);
    if(!sending){
        await user.deleteOne();
        return next(new appError('Something went wrong', 500));
    }
    
    return res.status(200).json({
        status: 'success',
        message: 'Verification code has been sent',
        user
    });
});

exports.verifyEmail = asyncHandler( async(req, res, next) =>{
    let user = await User.findById(req.params.id);
    if(!user)
        return next(new appError('User not found', 404));
    
    let otp = req.body.otp;
    if(otp !== user.otp)
        return next(new appError('Invalid verification code', 400));

    user.isVerified = true;
    user.otp = null;
    await user.save();

    let token =  user.generateAuthToken();
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,
        maxAge: 7*60*60*1000
    });
    return res.status(200).json({
        status: 'success',
        token,
        user
    });
})

exports.resendCode = asyncHandler( async(req, res, next) =>{
    let user = await User.findById(req.params.id);
    if(!user)
        return next(new appError('User not found', 404));
     
    user.counter++;

    if(user.counter > 3){
        setTimeout(() => {
            user.counter = 0
            user.save()
        }, 90*1000)
        return next(new appError('You have exceeded the maximum number of attempts', 400));
    }
    let sending = await verifyEmail(user, res, next);
    if(!sending){
        return next(new appError('Something went wrong', 500));
    }
    
    return res.status(200).json({
        status: 'success',
        message: 'Verification code has been sent',
        user
    });
})

exports.completeSignup = asyncHandler( async(req, res, next) =>{
    let user = await User.findById(req.user._id);
    if(!user)
        return next(new appError('User not found', 404));

    if(!user.isVerified) 
        return next(new appError('Please verify your email first', 400));

    user.firstName = req.body.firstName;
    user.lastName  = req.body.lastName;
    user.gender    = req.body.gender;
    user.phone     = req.body.phone;

    await user.save();
    return res.status(200).json({
        status: 'success',
        user,
    })
});


exports.setLocation = asyncHandler( async(req, res, next) =>{
    let user = await User.findById(req.user._id);
    if(!user)
        return next(new appError('User not found', 404));

    if(!user.isVerified) 
        return next(new appError('Please verify your email first', 400));

    user.location = req.body.location;

    await user.save();
    return res.status(200).json({
        status: 'success',
        user
    })
 });

exports.uploadImage = uploadImage(User);

exports.logIn = asyncHandler( async(req, res, next) =>{
    let user = await User.findOne({email : req.body.email});
    if(!user)
        return next(new appError('Invalid email or password', 400));
    
    let isPassMatch = await user.passwordMatch(req.body.password);
    if(!isPassMatch)
        return next(new appError('Invalid email or password', 400));

     let token = await user.generateAuthToken();
     res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,
        maxAge: 7*60*60*1000
    });
    
    res.json({
        status:'success',
        token,
        user
    })
 });



 exports.forgotPassword = asyncHandler( async(req, res, next) =>{
    let user = await User.findOne({email : req.body.email});
    if(!user)
        return next(new appError('Invalid Email', 404));

    let token = crypto.randomBytes(4).toString('hex'); 
    user.resetToken = token;
    user.expireToken = Date.now() + (15*60*1000) //token will expire after 15 minutes
    await user.save();

    let link = `http://${req.headers.host}${req.baseUrl}/verify-token/${token}/${user._id}`;
    
    let sending = await  resetPassEmail(link, user, res, next);
    if(!sending){
        return next(new appError('Something went wrong', 500));
    }
    
    return res.status(200).json({
        status: 'success',
        message: 'Verification code has been sent',
        user
    });
   
 });



 exports.resetPassword = asyncHandler( async(req, res, next) =>{
    let user = await User.findById(req.params.id);
    if(!user)
        return next(new appError('User not found', 404));
    
    if(user.resetToken !== req.params.token || user.expireToken < Date.now())
        return next(new appError('Token has been expired', 400));
        
    if(req.body.password !== req.body.confirmPass) 
       return  next(new appError("Passwords do not match", 400));
        
    user.password = req.body.password;
    user.resetToken = null;
    user.expireToken = null;

    await user.save();
    return res.status(200).json({
        status: 'success',
        user
    })
 });

exports.logout = asyncHandler( async(req, res, next) =>{
    res.cookie('jwt', 'loggedout', {
        httpOnly: true,
        secure: true,
        maxAge: 1
    });
    return res.status(200).json({
        status: 'success'
    })
})
