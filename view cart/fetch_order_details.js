let pdata;

$.ajax({
    url: "C: \\Users\\harih\\Downloads\\FigmaSetup.exe\\data.json",
    dataType: "json",
    success: function (data) {
        pdata = data;
        let checkEmpty=0;
        for (let index = 0; index < pdata.length; index++) {
            if (pdata[index].count != 0) {
                checkEmpty = 1;
                break;
            }
        }
        if (checkEmpty != 0) {
            var tot = 0;
            $("#table").append("<tr><th>Item</th><th>Price</th><th>Quantity</th><th>Rate</th></tr>")
            for (let index = 0; index < pdata.length; index++) {
                if (pdata[index].count != 0) {
                    var img = "<img class='item-image img-circle' src=" + pdata[index].img + ">";
                    var price = "<p>" + pdata[index].price + "</p>";
                    var quantity = "<p>" + pdata[index].count + "</p>";
                    var rate = "<p>" + pdata[index].price * pdata[index].count + "</p>";
                    tot = tot + (pdata[index].price * pdata[index].count);
                    $("#table").append("<tr><td class='item'>" + img + "<p class='name'>" + pdata[index].name.toUpperCase() + "</p>" + "</td>" + "<td>" + price + "</td>" + "<td>" + quantity + "</td>" + "<td>" + rate + "</td>" + "</tr>");
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
    },
    error: function (xhr, textStatus, errorThrown) {
        console.log("Error retrieving JSON data:", errorThrown);
    }
});




