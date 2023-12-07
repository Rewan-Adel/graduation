const cloudinary   = require('cloudinary').v2;

cloudinary.config({
    cloud_name : "dmlyrgni5",
    api_key    :"541583893544472 ",
    api_secret : "PRMJ43cz_zQsBIjOPHt_r5gBlGY",
    secure     : true 
});

module.exports = cloudinary;