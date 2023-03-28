const mongoose = require('mongoose')
const express = require('express')
const app=express()

app.listen(8000,(req,res)=>{
    console.log('server is up')
    res.sendFile(__dirname+"/loginpage/login.html")
})


app.get('/loginform',(req,res)=>{
    res.send(req.query['userid']+" "+req.query['password'])
})