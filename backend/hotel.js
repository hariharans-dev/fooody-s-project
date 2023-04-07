const mongoose = require('mongoose')
const express = require('express')
const fs = require('fs')
const cheerio = require('cheerio')
const path = require('path')
const app=express()

mongoose.connect('mongodb://127.0.0.1:27017/foodlogin',{useNewUrlParser: true, useUnifiedTopology: true})
const db=mongoose.connection
db.on('error',(err)=>{throw err})
db.once('open',()=>{
    console.log('db connected')
})


var userSchema=new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
},{collection:'hotelusers'})

var user=mongoose.model("user",userSchema)


app.listen(8080,()=>{
    console.log('hotel server is up')
})

app.get('/',(req,res)=>{
    const html = fs.readFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), 'utf-8')
    const $ = cheerio.load(html)
    const pTag = $('#replace')
    pTag.text('')
    fs.writeFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), $.html())

    console.log('login page is loaded')
    const staticpath1 = path.join(__dirname,"../hotel/public")
    app.use(express.static(staticpath1))
    res.sendFile(path.join(__dirname,"../hotel/public/hotellogin.html"))
})

var hname

app.get('/hotellogin',(req,res)=>{

    const hotelname=req.query['user']
    const password=req.query['password']

    console.log(hotelname+" "+password)

    var found=0
    var index


    user.find({username:hotelname},{_id:0,username:1,password:1})
        .then((result)=>{
            console.log(result)
            for(let i=0;i<result.length;i++){
                if(hotelname===result[i]['username']){
                    found=1
                    index=i
                    break
                }
            }

            if((found===1)&&(password===result[index]['password'])){
                console.log('can login')
                hname=hotelname

                var menuschema=new mongoose.Schema({
                    hotel:{type:String},
                    parotta: {type:Number},
                    dosa: {type:Number},
                    tandoori: {type:Number},
                    pasta: {type:Number},
                    panner: {type:Number}
                },{collection:'costoffoods'})

                var menuuser=mongoose.model("menuuser",menuschema)
                var prices
                var items


                menuuser.find({hotel: hotelname},{_id:0,__v:0,hotel:0})
                    .then((result)=>{
                        jsonstring=JSON.stringify(result)
                        jsonobj=JSON.parse(jsonstring)
                        prices=Object.values(jsonobj[0])
                        items=Object.keys(jsonobj[0])
                        console.log(prices)
                        console.log(items)
                        const staticpath3 = path.join(__dirname,"../hotel/public")

                        const html = fs.readFileSync(path.join(__dirname,"../hotel/public/costchanges.html"), 'utf-8')
                        const $ = cheerio.load(html)
                        $('#table').text('')
                        $('#replace').text('')

                        $('#table').append("<tr><th class='th'>Item</th><th class='th'>Price</th></tr>")

                        for (let index = 0; index < prices.length; index++) {
                            // var img = "<img class='item-image img-circle' src=" + imageslinks[index] + ">"
                            var price = "<p>" + prices[index] + "</p>"
                            $("#table").append("<tr><td class='item th'>" + "<p class='name'>" + items[index].toUpperCase() + "</p>" + "</td>" + "<td class='th'>" + price + "</td>" + "</tr>");
                        }
                        fs.writeFileSync(path.join(__dirname,"../hotel/public/costchanges.html"), $.html());
                        app.use(express.static(staticpath3))
                        res.sendFile(path.join(__dirname,"../hotel/public/costchanges.html"))

                    })
                    .catch(err=>{console.log('error in finding old items and prices')})

            }
            else if(found===1){
                console.log('invalid password')

                const staticpath1 = path.join(__dirname,"../hotel/public")
                app.use(express.static(staticpath1))

                const html = fs.readFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), 'utf-8')
                const $ = cheerio.load(html)
                $('#replace').text('Invalid Password!')
                fs.writeFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), $.html());

                res.sendFile(path.join(__dirname,"../hotel/public/hotellogin.html"))
            }
            else{
                console.log('invalid username')

                const staticpath1 = path.join(__dirname,"../hotel/public")
                app.use(express.static(staticpath1))

                const html = fs.readFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), 'utf-8')
                const $ = cheerio.load(html)
                $('#replace').text('Invalid User ID!')
                fs.writeFileSync(path.join(__dirname,"../hotel/public/hotellogin.html"), $.html());

                res.sendFile(path.join(__dirname,"../hotel/public/hotellogin.html"))
            }
        })
        .catch(err=>{console.log('error in finding')})
})

app.get('/changes',(req,res)=>{
    var obj=req.query
    console.log(obj)

    var menuschema=new mongoose.Schema({
        hotel:{type:String},
        parotta: {type:Number},
        dosa: {type:Number},
        tandoori: {type:Number},
        pasta: {type:Number},
        panner: {type:Number}
    },{collection:'costoffoods'})

    var menuupdate=mongoose.model("menuupdate",menuschema)

    menuupdate.updateOne({hotel:hname},{$set:{
        parotta:obj['parotta'],
        dosa:obj['dosa'],
        tandoori:obj['tandoori'],
        panner:obj['panner'],
        pasta:obj['pasta']
    }})
    .then(()=>{
        console.log('costs are updated')
        var menuschema=new mongoose.Schema({
            hotel:{type:String},
            parotta: {type:Number},
            dosa: {type:Number},
            tandoori: {type:Number},
            pasta: {type:Number},
            panner: {type:Number}
        },{collection:'costoffoods'})

        var menuuser1=mongoose.model("menuuser1",menuschema)
        var prices
        var items


        menuuser1.find({hotel: hname},{_id:0,__v:0,hotel:0})
            .then((result)=>{
                jsonstring=JSON.stringify(result)
                jsonobj=JSON.parse(jsonstring)
                prices=Object.values(jsonobj[0])
                items=Object.keys(jsonobj[0])
                console.log(prices)
                console.log(items)
                const staticpath3 = path.join(__dirname,"../hotel/public")

                const html = fs.readFileSync(path.join(__dirname,"../hotel/public/costchanges.html"), 'utf-8')
                const $ = cheerio.load(html)
                $('#table').text('')
                $('#replace').text('Costs updated')

                $('#table').append("<tr><th class='th'>Item</th><th class='th'>Price</th></tr>")

                for (let index = 0; index < prices.length; index++) {
                    // var img = "<img class='item-image img-circle' src=" + imageslinks[index] + ">"
                    var price = "<p>" + prices[index] + "</p>"
                    $("#table").append("<tr><td class='item th'>" + "<p class='name'>" + items[index].toUpperCase() + "</p>" + "</td>" + "<td class='th'>" + price + "</td>" + "</tr>");
                }
                fs.writeFileSync(path.join(__dirname,"../hotel/public/costchanges.html"), $.html());
                app.use(express.static(staticpath3))
                res.sendFile(path.join(__dirname,"../hotel/public/costchanges.html"))
            })
    })
                .catch(err=>{
        console.log(err)
    })


})


