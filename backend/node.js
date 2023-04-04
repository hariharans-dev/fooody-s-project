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

mongoose.connect('mongodb://127.0.0.1:27017/foodlogin',{useNewUrlParser: true, useUnifiedTopology: true})
const db=mongoose.connection
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

var customer


app.get('/loginform',(req,res)=>{

    const username=req.query['user']
    const password=req.query['password']

    var found=0
    customer=username
    var index

    user.find({},{_id:0,username:1,password:1})
    .then((result)=>{
        for(let i=0;i<result.length;i++){
            if(username===result[i]['username']){
                found=1
                index=i
                break
            }
        }

        if((found===1)&&(password===result[index]['password'])){
            console.log('can login')

            const staticpath3 = path.join(__dirname,"../menu/public")
            app.use(express.static(staticpath3))

            const html = fs.readFileSync(path.join(__dirname,"../menu/public/menu.html"), 'utf-8')
            const $ = cheerio.load(html)
            $('#replace').text('Welcome '+customer)
            fs.writeFileSync(path.join(__dirname,"../menu/public/menu.html"), $.html());

            res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
        }
        else if(found===1){
            console.log('invalid password')

            const staticpath1 = path.join(__dirname,"../loginpage/public")
            app.use(express.static(staticpath1))

            const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
            const $ = cheerio.load(html)
            $('#replace').text('Invalid Password!')
            fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

            res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
        }
        else{
            console.log('invalid username')

            const staticpath1 = path.join(__dirname,"../loginpage/public")
            app.use(express.static(staticpath1))

            const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
            const $ = cheerio.load(html)
            $('#replace').text('Invalid User ID!')
            fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html());

            res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
        }
    })
    .catch(err=>{console.log('error in finding')})
})

let obj;

app.get('/menu',(req,res)=>{

    console.log('menu page')

    const html = fs.readFileSync(path.join(__dirname,"../viewcart/public/cart.html"), 'utf-8')
    const $ = cheerio.load(html)

    const pdata=req.query

    const count=Object.values(pdata)

    let Empty=1;
    for (let index = 0; index < count.length; index++) {
        if (count[index] != '0') {
            Empty = 0;
            break;
        }
    }

    $('#table').text('')

    if (Empty != 1) {
        var tot = 0
        const items=Object.keys(pdata)
        const prices=[50,70,350,200,280]
        const imageslinks=['resources/parotta.png','resources/dosa.png','resources/tandoori.png','resources/pasta.png','resources/panner.png']
        $("#table").append("<tr><th>Item</th><th>Price</th><th>Quantity</th><th>Rate</th></tr>")
        for (let index = 0; index < count.length; index++) {
            if (count[index] != '0') {
                // var img = "<img src='backend/resources/arvind.png'>";
                // console.log(img)
                var price = "<p>" + prices[index] + "</p>";
                var quantity = "<p>" + count[index] + "</p>";
                var rate = "<p>" + prices[index] * count[index] + "</p>";
                tot = tot + (prices[index] * count[index]);
                $("#table").append("<tr><td class='item'>" + "<p class='name'>" + items[index].toUpperCase() + "</p>" + "</td>" + "<td>" + price + "</td>" + "<td>" + quantity + "</td>" + "<td>" + rate + "</td>" + "</tr>");
            }
        }
        $("#table").append("<tr><td colspan='4' class='total'>Total: "+tot+".00</td></tr>")
    }
    else {
        $("#table").hide();
        $("#main-area").append("<img src='/resources/emptycart.png' class='empty-cart'>");
        $("#main-area").append("<p class='ecart-p'>Your Cart Is Empty 😞  </p>")
        $(".ecart-p").append("<a href='/menu selection/menu.html'><button class='glow-on-hover' type='button'>Menu</button></a>");
    }

    const staticpath1 = path.join(__dirname,"../viewcart/public")
    app.use(express.static(staticpath1))

    fs.writeFileSync(path.join(__dirname,"../viewcart/public/cart.html"),$.html());
    res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))

    var userSchema=new mongoose.Schema({
        username:{type:String, required:true, unique:true},
        parotta:{type:Number},
        dosa:{type:Number},
        tandoori:{type:Number},
        panner:{type:Number},
        pasta:{type:Number}
    },{collection:'previousorders'})
    
    var prev=mongoose.model("prev",userSchema)

    prev.create({
        username: customer,
        parotta: count[0],
        dosa: count[1],
        tandoori: count[2],
        pasta: count[3],
        panner: count[4],
    })
    .then(()=>{
        console.log('previous data stored')
    })
    .catch(err=>{
        console.log('error in adding data in perivous orders')
    })
})

app.get('/signout',(req,res)=>{
    const html = fs.readFileSync(path.join(__dirname,"../loginpage/public/login.html"), 'utf-8')
    const $ = cheerio.load(html)
    const pTag = $('#replace')
    pTag.text('successfully signed out')
    fs.writeFileSync(path.join(__dirname,"../loginpage/public/login.html"), $.html())

    console.log('login page is loaded')
    const staticpath1 = path.join(__dirname,"../loginpage/public")
    app.use(express.static(staticpath1))
    res.sendFile(path.join(__dirname,"../loginpage/public/login.html"))
})

app.get('/updatepass',(req,res)=>{

    const oldpass=req.query['oldpass']
    const newpass=req.query['newpass']

    

    const staticpath2 = path.join(__dirname,"../menu/public")
    res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
})

