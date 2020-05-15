const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const { User } = require("./model/user");
const config = require("./config/key");
const { auth } = require("./middleware/auth.js");

mongoose.connect(config.mongoURI,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("DB connected"))
.catch((err)=>console.error("err occured"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/api/user/auth", auth, (req,res)=>{
    res.status(200).json({
        _id:req._id,
        isAuth:true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role
    })
});

app.post("/api/user/register",(req,res)=>{
    const user = new User(req.body)
    user.save((err,data)=>{
        if(err) return res.json({sucess:true,err})
        return res.status(200).json({sucess:true,userData:data})
    })
});

app.post("/api/user/login",(req,res)=>{
    User.findOne({email: req.body.email},(err,user)=>{
        if(!user) return res.status(400).json({success:false,message:"user auth failed"})
        user.comparePassword("req.body.password",(err,isMatch)=>{
            if(!isMatch) return res.status(400).json({success:false,message:"password doesn't match"})
            user.generateToken((err,user)=>{
                if(err) res.status(400).send(err)
                res.cookie("x_auth",user.token).status(200).json({loginSucess:true})
            })
        })   
    })
});

app.get("/api/user/logout",auth,(req,res)=>{
    User.findOneAndUpdate({_id:req.user._id,},{token:""},(err,doc)=>{
        if(err) return res.json({success:false,message:"not loggedout"});
        return res.status(200).send({success:true,message:"logged out"})
    })
});


app.get("/",(req,res)=>{
    res.send("hi hello");
});

const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log("server running at  " + port);
});
