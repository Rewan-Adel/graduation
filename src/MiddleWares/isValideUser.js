const {userValidation} = require('../Helpers/validation');
const appError = require('../Helpers/appError');

exports.isValidUser = (req, res, next) => {
    const validationResult = userValidation(req.body);

    if (validationResult.error) 
        return next(new appError(validationResult.error.details[0].message, 400));
    
    next();
};
