const router = require('express').Router();
const {isValidUser} = require('../MiddleWares/isValideUser');
const {verifyToken, isValidResetToken} = require('../Helpers/authToken');
const upload = require('../Helpers/multer');
const {
    signUp,
    verifyEmail,
    resendCode,
    completeSignup,
    setLocation, uploadImage, logIn, resetPassword, forgotPassword
} = require('../Controllers/authCtr');



router.post('/signup', isValidUser, signUp);
router.post('/login', logIn);

router.post('/forgot-pass', forgotPassword);

router.get('/verify-token/:token/:id', isValidResetToken);
router.patch('/reset-pass/:token/:id', resetPassword);

router.use(verifyToken);

router.post('/verification', verifyEmail)
router.get('/resend-code', resendCode)

router.post('/upload', upload, uploadImage);
router.post('/complete-signup',completeSignup);
router.post('/location', setLocation);


module.exports = router;