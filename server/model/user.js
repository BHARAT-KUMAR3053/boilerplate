const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const userSchema = mongoose.Schema({
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique: 1
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type:Number,
        default: 0
    },
    token:{
        type:String,
    },
    tokenExp:{
        type:Number,
    }
})

userSchema.pre("save", function(next){
    var user = this;
    if(user.isModified("password")){
        bcrypt.genSalt(saltRounds,(err,salt)=> {
            if(err) return next(err);
            bcrypt.hash(user.password,salt,(err,hash)=> {
                user.password = hash;
                next();
            })
        })
    } else{
        next();
    }
});

userSchema.methods.comparePassword = function(plainPassword,cb){
    bcrypt.compare(plainPassword,this.password,(err,isMatch)=> {
        if(!isMatch) return cb(err)
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),"password");
    user.token = token;
    user.save((err,data)=>{
        if(err) return cb(err);
        cb(null,data);
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;
    jwt.verify(token,"password",(err, id)=> {
        if(err) return res.status(400).json({message:"token not able to decode"})
        user.findOne({"_id":id,"token":token},(err,user)=>{
            if(err) return cb(err);
            cb(null,user);
        })
    })
}

const User = mongoose.model("User", userSchema);

module.exports = { User }