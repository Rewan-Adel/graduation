const multer = require('multer');
const appError = require('./appError');

const Storage = multer.diskStorage({
    filename: (req, file, cb)=>{
        cb(null, file.originalname);
    }
});
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new appError('allow only jpeg, jpg and png', 400), false);
    }
    cb(null, true);
};

module.exports = multer({storage: Storage, fileFilter: imageFilter}).single('image');