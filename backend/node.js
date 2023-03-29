const mongoose = require('mongoose')
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const app=express()


var userSchema=new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    email:{type:String},
    password:{type:String, required:true},
},{collection:'users'})

var user=mongoose.model("user",userSchema)

mongoose.connect('mongodb://127.0.0.1:27017/foodlogin',{useNewUrlParser: true, useUnifiedTopology: true});
const db=mongoose.connection;
db.on('error',(err)=>{throw err})
db.once('open',()=>{
    console.log('db connected')
})


app.listen(8000,(req,res)=>{
    console.log('server is up')
})


app.get('/',(req,res)=>{
    const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
    const $ = cheerio.load(html)
    const pTag = $('#replace')
    pTag.text('')
    fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html())

    console.log('login page is loaded')
    const staticpath1 = path.join(__dirname,"../loginpage/public")
    app.use(express.static(staticpath1))
    res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
})


app.get('/signup',(req,res)=>{

    const obj=req.query
    console.log('signup page details is processed')


    user.create({
        username: obj['user'],
        email: obj['email'],
        password: obj['password']
    })
    .then(()=>{
        console.log('data created')
        const staticpath1 = path.join(__dirname,"../loginpage/public")
        app.use(express.static(staticpath1))


        const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
        const $ = cheerio.load(html)
        const pTag = $('#replace')
        pTag.text('New user created!')
        fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

        res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))

    })
    .catch(err=>{
        console.log('data not created')
        const staticpath1 = path.join(__dirname,"../loginpage/public")
        app.use(express.static(staticpath1))


        const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
        const $ = cheerio.load(html)
        const pTag = $('#replace')
        pTag.text('user name already taken!')
        fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

        res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
    })

})


// app.get('/',(req,res)=>{
//     const staticpath3 = path.join(__dirname,"../viewcart/public")
//     app.use(express.static(staticpath3))
//     res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))
// })

app.get('/loginform',(req,res)=>{

    const username=req.query['user']
    const password=req.query['password']
    var found=0
    var index
    // res.send(username+" "+password)
    user.find({},{_id:0,username:1,password:1})
    .then((result)=>{
        for(let i=0;i<result.length;i++){
            if(username==result[i]['username']){
                found=1
                index=i
                break
            }
        }
        if((found==1)&&(password==result[index]['password'])){
            console.log('can login')

            const staticpath3 = path.join(__dirname,"../menu/public")
            app.use(express.static(staticpath3))

            const html = fs.readFileSync(path.join(__dirname,"../menu/public/menu.html"), 'utf-8')
            const $ = cheerio.load(html)
            const pTag = $('#replace')
            pTag.text('Welcome '+username)
            fs.writeFileSync(path.join(__dirname,"../menu/public/menu.html"), $.html());


            res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
        }
        else if(found==1){
            console.log('invalid password')

            const staticpath1 = path.join(__dirname,"../loginpage/public")
            app.use(express.static(staticpath1))

            const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
            const $ = cheerio.load(html)
            const pTag = $('#replace')
            pTag.text('Invalid Password!')
            fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

            res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
        }
        else{
            console.log('invalid username')

            const staticpath1 = path.join(__dirname,"../loginpage/public")
            app.use(express.static(staticpath1))

            const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
            const $ = cheerio.load(html)
            const pTag = $('#replace')
            pTag.text('Invalid User ID!')
            fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

            res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
        }
    })
    .catch(err=>{console.log('error in finding')})

})