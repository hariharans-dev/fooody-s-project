const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const app=express()

app.listen(8000,(req,res)=>{
    console.log('server is up')
})

// app.get('/',(req,res)=>{
//     const staticpath1 = path.join(__dirname,"../loginpage/public")
//     app.use(express.static(staticpath1))
//     res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
// })



// app.get('/',(req,res)=>{
//     const staticpath2 = path.join(__dirname,"../menu/public")
//     app.use(express.static(staticpath2))
//     res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
// })


app.get('/',(req,res)=>{
    const staticpath3 = path.join(__dirname,"../viewcart/public")
    app.use(express.static(staticpath3))
    res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))
})

app.get('/loginform',(req,res)=>{
    res.send(req.query['userid']+" "+req.query['password'])
})