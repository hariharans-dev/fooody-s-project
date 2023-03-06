$.ajax({
    url: "",
    dataType: "json",
    success: function (data) {
        // data is a JavaScript object representing the parsed JSON
        console.log(data);
    },
    error: function (xhr, textStatus, errorThrown) {
        console.log("Error retrieving JSON data:", errorThrown);
    }
});

