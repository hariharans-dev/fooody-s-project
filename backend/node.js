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



var customer
var previous
var price

var menuschema=new mongoose.Schema({
    parotta: {type:Number},
    dosa: {type:Number},
    tandoori: {type:Number},
    pasta: {type:Number},
    panner: {type:Number}
},{collection:'costoffoods'})

var itemuser= mongoose.model("itemuser",menuschema)

itemuser.findOne({},{_id:0,__v:0})
.then((result)=>{
    function fn(){
        var jsonstring=JSON.stringify(result)
        var jsobj=JSON.parse(jsonstring)
        global.price = Object.values(jsobj)
    }
    fn()
})
.catch(err=>{
    console.log('error in getting the costs of items')
})


console.log(global.price)


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



app.get('/loginform',(req,res)=>{

    const username=req.query['user']
    const password=req.query['password']

    console.log(Object.values(req.query))

    var found=0
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
            customer=username
            console.log('can login')

            const staticpath3 = path.join(__dirname,"../menu/public")
            app.use(express.static(staticpath3))

            const html = fs.readFileSync(path.join(__dirname,"../menu/public/menu.html"), 'utf-8')
            const $ = cheerio.load(html)
            $('#replace').text('Welcome '+customer)
            $('#passres').text('')
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



app.get('/menu',(req,res)=>{

    console.log('view page')

    const html = fs.readFileSync(path.join(__dirname,"../viewcart/public/cart.html"), 'utf-8')
    const $ = cheerio.load(html)

    var pdata=req.query

    var count=Object.values(pdata)

    let Empty=1;
    for (let index = 0; index < count.length; index++) {
        if (count[index] !== '0') {
            Empty = 0;
            break;
        }
    }

    $('#table').text('')
    $('#main-area').text('')

    if (Empty !== 1) {
        console.log('it is not empty')
        var tot = 0
        var items=Object.keys(pdata)
        var imageslinks=['resources/parotta.png','resources/dosa.png','resources/tandoori.png','resources/pasta.png','resources/panner.png']
        $("#table").append("<tr><th class='th'>Item</th><th class='th'>Price</th><th class='th'>Quantity</th><th class='th'>Rate</th></tr>")
        for (let index = 0; index < count.length; index++) {
            if (count[index] !== '0') {
                var img = "<img class='item-image img-circle' src=" + imageslinks[index] + ">";
                var price = "<p>" + prices[index] + "</p>";
                var quantity = "<p>" + count[index] + "</p>";
                var rate = "<p>" + prices[index] * count[index] + "</p>";
                tot = tot + (prices[index] * count[index]);
                $("#table").append("<tr><td class='item th'>" +img+ "<p class='name'>" + items[index].toUpperCase() + "</p>" + "</td>" + "<td class='th'>" + price + "</td>" + "<td class='th'>" + quantity + "</td>" + "<td class='th'>" + rate + "</td>" + "</tr>");
            }
        }
        $("#table").append("<tr><td colspan='4' class='total text-center'>Total: "+tot+".00</td></tr>")

        var userSchema=new mongoose.Schema({
            username:{type:String, required:true},
            parotta:{type:Number},
            dosa:{type:Number},
            tandoori:{type:Number},
            panner:{type:Number},
            pasta:{type:Number}
        },{collection:'previousorders'})

        var prev=mongoose.model("prev",userSchema)

        prev.find({username:customer})
            .then((result)=>{
                previous=result
            })

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

        console.log(previous)
    }
    else {
        console.log('it is empty')
        $("#main-area").append("<img src='resources/emptycart.png' class='empty-cart'>")
        $("#main-area").append("<p class='ecart-p'>Your Cart Is Empty 😞  </p>")
        $(".ecart-p").append("<a href='/menu selection/menu.html'><button class='glow-on-hover' type='button'>Menu</button></a>")
    }

    const staticpath1 = path.join(__dirname,"../viewcart/public")
    app.use(express.static(staticpath1))

    fs.writeFileSync(path.join(__dirname,"../viewcart/public/cart.html"),$.html());
    res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))
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

    user.findOne({username: customer})
        .then((result)=>{
            if(oldpass==result['password']) {
                user.updateOne({username: customer}, {$set: {password: newpass}})
                    .then((result) => {
                        console.log('password is updated')
                        const staticpath5 = path.join(__dirname, "../menu/public")
                        app.use(express.static(staticpath5))

                        const html = fs.readFileSync(path.join(__dirname, "../menu/public/menu.html"), 'utf-8')
                        const $ = cheerio.load(html)
                        $('#passres').text('Password is updated!')
                        fs.writeFileSync(path.join(__dirname, "../menu/public/menu.html"), $.html());

                        res.sendFile(path.join(__dirname, "../menu/public/menu.html"))
                    })
                    .catch(err => {
                        console.log('error in updating the password')
                    })
            }
            else{
                const staticpath5 = path.join(__dirname, "../menu/public")
                app.use(express.static(staticpath5))

                const html = fs.readFileSync(path.join(__dirname, "../menu/public/menu.html"), 'utf-8')
                const $ = cheerio.load(html)
                $('#passres').text('Old password is invalid!')
                fs.writeFileSync(path.join(__dirname, "../menu/public/menu.html"), $.html());

                res.sendFile(path.join(__dirname, "../menu/public/menu.html"))
            }
        })
})


