const joi = require('joi');

exports.userValidation = function(user){
    const userSchema = joi.object({
    userName : joi.string().min(6).required(),
    email    : joi.string().email().min(5).max(50).required(),
    password : joi.string().min(8).required(),
    confirmPass : joi.string().min(8).required(),
    });

    return userSchema.validate(user);
}