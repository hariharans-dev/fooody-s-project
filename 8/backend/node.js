const express = require('express')
const mongoose=require('mongoose')
const app = express()
const path=require('path')

app.listen(8000,()=>{
    console.log('server is up')
})

app.get('/',(req,res)=>{
    console.log('form is displayed')
    app.use(express.static(path.join(__dirname,"../public")))
    res.sendFile(path.join(__dirname,"../public/index.html"))
})

app.get('/emp',(req,res)=>{

    console.log('form processing')
    const obj=req.query
    
    var userSchema=new mongoose.Schema({
        name:{type:String, required:true},
        empid:{type:Number,required:true},
        vehicleno:{type:Number, required:true},
        brand:{type:String,required:true},
        year:{type:Number,required:true}
    },{collection:'employees'})
    
    var user=mongoose.model("user",userSchema)
    
    mongoose.connect('mongodb://127.0.0.1:27017/companydb',{useNewUrlParser: true, useUnifiedTopology: true})
    const db=mongoose.connection
    db.on('error',(err)=>{throw err})
    db.once('open',()=>{
        console.log('db connected')
    })

    const changes=new user({
        name: obj['name'],
        empid: obj['empid'],
        vehicleno: obj['vehicleno'],
        brand: obj['brand'],
        year: obj['year']
    })

    user.deleteOne({empid:obj['empid']})
    changes.save()
    console.log(changes)

})