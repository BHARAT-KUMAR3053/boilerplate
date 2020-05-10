const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://bharat:309132920053@bharat-hmskc.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("DB connected"))
.catch((err)=>console.error("err occured"));

app.get("/",(req,res)=>{
    res.send("hi hello");
});

app.listen(5000);