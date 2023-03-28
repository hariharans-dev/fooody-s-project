const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const app=express()


var userSchema=new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    email:{type:String},
    password:{type:String, required:true},
},{collection:'users'})

var user=mongoose.model("user",userSchema)


app.listen(8000,(req,res)=>{
    console.log('server is up')
})


app.get('/',(req,res)=>{
    console.log('login page is loaded')
    const staticpath1 = path.join(__dirname,"../loginpage/public")
    app.use(express.static(staticpath1))
    res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
})


app.get('/signup',(req,res)=>{

    const obj=req.query
    console.log('signup page details is processed')

    mongoose.connect('mongodb://127.0.0.1:27017/foodlogin',{useNewUrlParser: true, useUnifiedTopology: true});
    const db=mongoose.connection;
    db.on('error',(err)=>{throw err})
    db.once('open',()=>{
        console.log('db connected')
    })


    user.create({
        username: obj['user'],
        email: obj['email'],
        password: obj['password']
    })
    .then(()=>{
        console.log('data created')
        const staticpath2 = path.join(__dirname,"../menu/public")
        app.use(express.static(staticpath2))
        res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
    })
    .catch(err=>{
        console.log('data not created')
        const staticpath1 = path.join(__dirname,"../loginpage/public")
        app.use(express.static(staticpath1))
        res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
    })

})


// app.get('/',(req,res)=>{
//     const staticpath3 = path.join(__dirname,"../viewcart/public")
//     app.use(express.static(staticpath3))
//     res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))
// })

app.get('/loginform',(req,res)=>{
    res.send(req.query['userid']+" "+req.query['password'])
})