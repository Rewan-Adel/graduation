const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    userName : { type : String, required : true},
    email    : { type : String, required : true, unique : true, trim: true },
    password : { type : String, required : true, trim: true},

    firstName : { type : String},
    lastName : { type : String},
    gender   : { type : String, enum : ['male', 'female'] },
    phone    : { type : String},
    
    role     : { type : String, default   : 'user', enum: [] },
    image    : {
        url :{ type : String},
        public_id :{ type : String}
    },
    location : { type : String},

    otp         : { type : Number},
    counter     : { type : Number, default : 0},
    isVerified  : { type : Boolean, default : false},
    resetToken  : { type : String},
    expireToken : { type : Date},
},{
    timestamps : true
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({
        _id  : this._id,
        role : this.role
    },
     process.env.JWT_SECRET,
    { 
        expiresIn : process.env.JWT_EXPIRES_IN
    });
    
    return token;
};

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.methods.passwordMatch = async function(userPassword){
    return await bcrypt.compare(userPassword, this.password);
}

module.exports = mongoose.model('Users', userSchema);