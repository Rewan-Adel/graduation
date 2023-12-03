const cloudinary   = require('cloudinary').v2;

require('dotenv').config()

cloudinary.config({
    cloud_name : "dt6idcgyw",
    api_key    : "731741717599726", 
    api_secret : "ySnFC-eUOalmFpKOm4SCdeWsEr0",
    secure     : true 
});

module.exports = cloudinary;