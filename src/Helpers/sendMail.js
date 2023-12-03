const sgMail = require('@sendgrid/mail');
const appError = require('./appError'); 
const asyncHandler = require('express-async-handler');

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateOtp = () =>{
    let otp = '';
    for(let i = 0; i < 4; i++){
        otp += Math.floor(Math.random() * 10);
    }
    return Number(otp);
};

const sendEmail = (msg, res, next) =>{
    sgMail.send(msg).then(() => {
        console.log('Email sent')
        return res.status(200).json({   
            status: 'success',
            message: 'Email sent successfully 😄'
        })
    }).catch((error) => {    
        console.error(error)
        return next(new appError('Error sending email 😢, try again later', 500));
    });
};

exports.verifyEmail = asyncHandler( async(user, res, next) =>{
    const Otp = generateOtp();
    user.otp = Otp;
    await user.save();

    setTimeout(() => {
        user.otp = null;
         user.save();
     }, 90*1000); //expires after 1:30 hours

    const msg = {
        to: user.email, 
        from: process.env.EMAIL,
        subject : "My  Residence",
        html : `<h2>Hello ${user.userName} </h2>
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="margin-top: 20px;">
            <p style="color: #666;">Your verification code is:</p>
            <p style="color: #333; font-size: 24px; font-weight: bold;">${Otp}</p>
            <p style="color: #666;">Please note that for added security this link becomes invalid after 1:30 hours.</p>
        </div>
    </div>`
    }
    sendEmail(msg, res, next);     
});

exports.resetPassEmail = asyncHandler( async(link, user, res, next) =>{
    const msg = {
        to: user.email, 
        from: process.env.EMAIL,
        subject : "My  Residence",
        html : `<h2>Hello ${user.userName} </h2>
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="margin-top: 20px;">
            <p style="color: #666;">you can reset your password by clicking the link below:</p>
            <a href="${link}" >reset password link</a>
            <p style="color: #666;">Please note that for added security this link becomes invalid after 15 minutes.</p>
        </div>
    </div>`
    }
    sendEmail(msg, res, next);     

})