const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");
const cheerio = require("cheerio");
const app = express();
const { DateTime } = require("luxon");

var userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    address: { type: String },
    password: { type: String, required: true },
  },
  { collection: "users" }
);

var user = mongoose.model("user", userSchema);

mongoose.connect("mongodb://127.0.0.1:27017/foodlogin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => {
  throw err;
});
db.once("open", () => {
  console.log("db connected");
});

var customer;
var prices;
var menu = 1;

var menuschema = new mongoose.Schema(
  {
    hotel: { type: String },
    parotta: { type: Number },
    dosa: { type: Number },
    tandoori: { type: Number },
    pasta: { type: Number },
    panner: { type: Number },
  },
  { collection: "costoffoods" }
);

var itemuser = mongoose.model("itemuser", menuschema);

itemuser.create(
  {
    hotel: "Fortune",
    parotta: 200,
    dosa: 200,
    tandoori: 200,
    pasta: 100,
    panner: 250
  }
);

itemuser
  .findOne({}, { _id: 0, __v: 0, hotel: 0 })
  .then((result) => {
    function fn() {
      var jsonstring = JSON.stringify(result);
      var jsobj = JSON.parse(jsonstring);
      prices = Object.values(jsobj);
    }

    fn();
  })
  .catch((err) => {
    console.log("error in getting the costs of items");
  });

app.listen(8000, (req, res) => {
  console.log("server is up");
});

app.get("/", (req, res) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../loginpage/public/login.html"),
    "utf-8"
  );
  const $ = cheerio.load(html);
  const pTag = $("#replace");
  pTag.text("");
  fs.writeFileSync(
    path.join(__dirname, "../loginpage/public/login.html"),
    $.html()
  );

  console.log("login page is loaded");
  const staticpath1 = path.join(__dirname, "../loginpage/public");
  app.use(express.static(staticpath1));
  res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
});

app.get("/signup", (req, res) => {
  const obj = req.query;
  console.log("signup page details is processed");

  user
    .create({
      username: obj["user"],
      address: obj["address"],
      password: obj["password"],
    })
    .then(() => {
      console.log("data created");
      const staticpath1 = path.join(__dirname, "../loginpage/public");
      app.use(express.static(staticpath1));

      const html = fs.readFileSync(
        path.join(__dirname, "../loginpage/public/login.html"),
        "utf-8"
      );
      const $ = cheerio.load(html);
      const pTag = $("#replace");
      pTag.text("New user created!");
      fs.writeFileSync(
        path.join(__dirname, "../loginpage/public/login.html"),
        $.html()
      );

      res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
    })
    .catch((err) => {
      console.log("data not created");
      const staticpath1 = path.join(__dirname, "../loginpage/public");
      app.use(express.static(staticpath1));

      const html = fs.readFileSync(
        path.join(__dirname, "../loginpage/public/login.html"),
        "utf-8"
      );
      const $ = cheerio.load(html);
      const pTag = $("#replace");
      pTag.text("user name already taken!");
      fs.writeFileSync(
        path.join(__dirname, "../loginpage/public/login.html"),
        $.html()
      );

      res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
    });
});

app.get("/loginform", (req, res) => {
  const username = req.query["user"];
  const password = req.query["password"];

  console.log(Object.values(req.query));

  var found = 0;
  var index;

  user
    .find({}, { _id: 0, username: 1, password: 1 })
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        if (username === result[i]["username"]) {
          found = 1;
          index = i;
          break;
        }
      }

      if (found === 1 && password === result[index]["password"]) {
        customer = username;
        console.log("can login");

        const staticpath3 = path.join(__dirname, "../menu/public");
        app.use(express.static(staticpath3));

        const html = fs.readFileSync(
          path.join(__dirname, "../menu/public/menu.html"),
          "utf-8"
        );
        const $ = cheerio.load(html);
        $("#replace").text("Welcome " + customer);
        $("#passres").text("");

        $("#parottaprice").text("Rs. {{" + prices[0] + "*paro}}");
        $("#dosaprice").text("Rs. {{" + prices[1] + "*dos}}");
        $("#tandooriprice").text("Rs. {{" + prices[2] + "*tand}}");
        $("#pastaprice").text("Rs. {{" + prices[3] + "*past}}");
        $("#pannerprice").text("Rs. {{" + prices[4] + "*pann}}");
        fs.writeFileSync(
          path.join(__dirname, "../menu/public/menu.html"),
          $.html()
        );

        menu = 1;
        res.sendFile(path.join(__dirname, "../menu/public/menu.html"));
      } else if (found === 1) {
        console.log("invalid password");

        const staticpath1 = path.join(__dirname, "../loginpage/public");
        app.use(express.static(staticpath1));

        const html = fs.readFileSync(
          path.join(__dirname, "../loginpage/public/login.html"),
          "utf-8"
        );
        const $ = cheerio.load(html);
        $("#replace").text("Invalid Password!");
        fs.writeFileSync(
          path.join(__dirname, "../loginpage/public/login.html"),
          $.html()
        );

        res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
      } else {
        console.log("invalid username");

        const staticpath1 = path.join(__dirname, "../loginpage/public");
        app.use(express.static(staticpath1));

        const html = fs.readFileSync(
          path.join(__dirname, "../loginpage/public/login.html"),
          "utf-8"
        );
        const $ = cheerio.load(html);
        $("#replace").text("Invalid User ID!");
        fs.writeFileSync(
          path.join(__dirname, "../loginpage/public/login.html"),
          $.html()
        );

        res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
      }
    })
    .catch((err) => {
      console.log("error in finding");
    });
});

app.get("/menu", (req, res) => {
  console.log("view page");
  menu = 0;

  const html = fs.readFileSync(
    path.join(__dirname, "../viewcart/public/cart.html"),
    "utf-8"
  );
  const $ = cheerio.load(html);

  var pdata = req.query;

  var count = Object.values(pdata);

  let Empty = 1;
  for (let index = 0; index < count.length; index++) {
    if (count[index] !== "0") {
      Empty = 0;
      break;
    }
  }
  $("#ord-summary").css("display", "none");
  $("#title").css("display", "none");
  $("#table").text("");
  $("#main-area").text("");
  $("#menubutton").text("");

  if (Empty !== 1) {
    console.log("it is not empty");
    var tot = 0;
    var items = Object.keys(pdata);
    var imageslinks = [
      "resources/parotta.png",
      "resources/dosa.png",
      "resources/tandoori.png",
      "resources/pasta.png",
      "resources/panner.png",
    ];
    $("#title").css("display", "block");
    $("#ord-summary").css("display", "inline");
    $("#table").append(
      "<tr>" +
        "<th>S.no</th>" +
        "<th>Item</th>" +
        "<th>Rate</th>" +
        "<th>Quantity</th>" +
        "<th>Price</th>" +
        "</tr>"
    );
    var sno = 0;
    for (let index = 0; index < count.length; index++) {
      if (count[index] !== "0") {
        sno += 1;
        var img =
          "<img class='item-image img-circle' src=" + imageslinks[index] + ">";
        var price = "<p>₹ " + prices[index] + "</p>";
        var quantity = "<p>" + count[index] + "</p>";
        var rate = "<p>" + prices[index] * count[index] + "</p>";
        tot = tot + prices[index] * count[index];
        $("#table").append(
          "<tr>" +
            "<td>" +
            sno +
            ".</td>" +
            "<td class='item th'>" +
            img +
            "</td>" +
            "<td>" +
            "<p class='name'>" +
            items[index].toUpperCase() +
            "</p>" +
            price +
            "</td>" +
            "<td class='th'>" +
            "<p>" +
            quantity +
            "</p>" +
            "</td>" +
            "<td class='th'>" +
            "<p>" +
            rate +
            "</p>" +
            "</td>" +
            "</tr>"
        );
      }
      $("#price").text(tot);
      let tax = tot * 0.18;
      $("#tax").text(tax.toFixed(1));
      let payamt = tot + tax;
      $("#total").text(Math.round(payamt));
    }
  } else {
    console.log("it is empty");
    $("#main-area").append(
      "<img src='resources/emptycart.png' class='empty-cart'>"
    );
    $("#main-area").append(
      "<div class='ecart-p'>Your Cart Is Empty 😞 " +
        "<form action='http://localhost:8000/menufile' style='display: inline'>" +
        "        <button id='menubutton' class='glow-on-hover'>Menu</button>" +
        "      </form>" +
        " </div>"
    );
  }
  const staticpath1 = path.join(__dirname, "../viewcart/public");
  app.use(express.static(staticpath1));

  fs.writeFileSync(
    path.join(__dirname, "../viewcart/public/cart.html"),
    $.html()
  );
  res.sendFile(path.join(__dirname, "../viewcart/public/cart.html"));
});

app.get("/signout", (req, res) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../loginpage/public/login.html"),
    "utf-8"
  );
  const $ = cheerio.load(html);
  const pTag = $("#replace");
  pTag.text("successfully signed out");
  fs.writeFileSync(
    path.join(__dirname, "../loginpage/public/login.html"),
    $.html()
  );

  console.log("login page is loaded");
  const staticpath1 = path.join(__dirname, "../loginpage/public");
  app.use(express.static(staticpath1));
  res.sendFile(path.join(__dirname, "../loginpage/public/login.html"));
});

app.get("/updatepass", (req, res) => {
  const oldpass = req.query["oldpass"];
  const newpass = req.query["newpass"];

  user.findOne({ username: customer }).then((result) => {
    if (oldpass == result["password"]) {
      user
        .updateOne({ username: customer }, { $set: { password: newpass } })
        .then((result) => {
          console.log("password is updated");
          const staticpath5 = path.join(__dirname, "../menu/public");
          app.use(express.static(staticpath5));

          const html = fs.readFileSync(
            path.join(__dirname, "../menu/public/menu.html"),
            "utf-8"
          );
          const $ = cheerio.load(html);
          $("#passres").text("Password is updated!");
          fs.writeFileSync(
            path.join(__dirname, "../menu/public/menu.html"),
            $.html()
          );

          res.sendFile(path.join(__dirname, "../menu/public/menu.html"));
        })
        .catch((err) => {
          console.log("error in updating the password");
        });
    } else {
      const staticpath5 = path.join(__dirname, "../menu/public");
      app.use(express.static(staticpath5));

      const html = fs.readFileSync(
        path.join(__dirname, "../menu/public/menu.html"),
        "utf-8"
      );
      const $ = cheerio.load(html);
      $("#passres").text("Old password is invalid!");
      fs.writeFileSync(
        path.join(__dirname, "../menu/public/menu.html"),
        $.html()
      );

      res.sendFile(path.join(__dirname, "../menu/public/menu.html"));
    }
  });
});

app.get("/menufile", (req, res) => {
  const staticpath1 = path.join(__dirname, "../menu/public");
  app.use(express.static(staticpath1));
  res.sendFile(path.join(__dirname, "../menu/public/menu.html"));
});

app.get("/addresspage", (req, res) => {
  console.log("address is loaded");

  var addressuser = mongoose.model("addressuser", userSchema);
  addressuser.findOne({ username: customer }, { _id: 0 }).then((result) => {
    var address = result["address"];
    const staticpath9 = path.join(__dirname, "../address/public");
    app.use(express.static(staticpath9));
    const html = fs.readFileSync(
      path.join(__dirname, "../address/public/address.html"),
      "utf-8"
    );
    const $ = cheerio.load(html);
    $("#replace").text("Your address: " + address);
    $("#customer").text("Thanks for ordering Mr./Mrs. " + customer);
    fs.writeFileSync(
      path.join(__dirname, "../address/public/address.html"),
      $.html()
    );
  });
  res.sendFile(path.join(__dirname, "../address/public/address.html"));
});
