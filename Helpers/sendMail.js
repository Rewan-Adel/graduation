const sgMail = require('@sendgrid/mail');
const appError = require('./appError'); 
const asyncHandler = require('express-async-handler');

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateOtp = () => {
    let otp = '';
    do {
        otp = Math.floor(Math.random() * 10000).toString();
    } while (otp.length !== 4);
    return Number(otp);
};

const sendEmail = async (msg, res, next) => {
    try {
        await sgMail.send(msg);
        console.log('Email sent');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
exports.verifyEmail = asyncHandler( async(user, res, next) =>{
    const Otp = generateOtp();
    user.otp = Otp;
    await user.save();

    setTimeout(() => {
        user.otp = null;
        user.save();
     }, 90*60*1000); //expires after 1:30 hours

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
    let result =  await sendEmail(msg, res, next);
    return result;
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
    let result =  await sendEmail(msg, res, next);
    return result;

})