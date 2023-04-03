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


app.get('/loginform',(req,res)=>{

    const username=req.query['user']
    const password=req.query['password']
    let found = 0;
    let index;

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
            const pTag = $('#replace')
            pTag.text('Welcome '+username)
            fs.writeFileSync(path.join(__dirname,"../menu/public/menu.html"), $.html());

            res.sendFile(path.join(__dirname,"../menu/public/menu.html"))
        }
        else if(found===1){
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

let obj;

app.get('/menu',(req,res)=>{
    console.log('menu page')
    obj=req.query

    const staticpath1 = path.join(__dirname,"../viewcart/public")
    app.use(express.static(staticpath1))



    // function insertion_data(data) {
    //     const pdata = data
    //     let checkEmpty=0

    //     const html = fs.readFileSync(path.join(__dirname,"../viewcart/public/cart.html"), 'utf-8')
    //     const $ = cheerio.load(html)

    //     for (let index = 0; index < pdata.length; index++) {
    //         if (pdata[index].count != 0) {
    //             checkEmpty = 1;
    //             break;
    //         }
    //     }
    //     if (checkEmpty != 0) {
    //         var tot = 0;
    //         $("#table").append("<tr><th>Item</th><th>Price</th><th>Quantity</th><th>Rate</th></tr>")
    //         for (let index = 0; index < pdata.length; index++) {
    //             if (pdata[index].count != 0) {
    //                 var img = "<img class='item-image img-circle' src=" + pdata[index].img + ">";
    //                 var price = "<p>" + pdata[index].price + "</p>";
    //                 var quantity = "<p>" + pdata[index].count + "</p>";
    //                 var rate = "<p>" + pdata[index].price * pdata[index].count + "</p>";
    //                 tot = tot + (pdata[index].price * pdata[index].count);
    //                 $("#table").append("<tr><td class='item'>" + img + "<p class='name'>" + pdata[index].name.toUpperCase() + "</p>" + "</td>" + "<td>" + price + "</td>" + "<td>" + quantity + "</td>" + "<td>" + rate + "</td>" + "</tr>");
    //             }
    //         }
    //         $("#table").append("<tr><td colspan='4' class='total'>Total: "+tot+".00</td></tr>")
    //     }
    //     else {
    //         $("#table").hide();
    //         $("#main-area").append("<img src='/resources/emptycart.png' class='empty-cart'>");
    //         $("#main-area").append("<p class='ecart-p'>Your Cart Is Empty 😞  </p>")
    //         $(".ecart-p").append("<a href='/menu selection/menu.html'><button class='glow-on-hover' type='button'>Menu</button></a>");
    //     }
    // }
    // insertion_data(obj)



    fs.writeFileSync(path.join(__dirname,"../viewcart/public/cart.html"), $.html());
    res.sendFile(path.join(__dirname,"../viewcart/public/cart.html"))
})

