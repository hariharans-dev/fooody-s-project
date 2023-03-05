var cart = angular.module('cartpage', []);
cart.controller('data-fetch', function ($scope, $http) {
    $http.get('C:/Users/shari/Downloads/data.json')
        .then(function (response) {
            console.log(response.data[0].count);
            for (let index = 0; index < response.data.length; index++) {
                
                if (response.data[index].count > 0) {
                    $scope.name = response.data[index].name;
                    $scope.count = response.data[index].count;
                }
                else {
                    continue;
                }
            }
            
        });
});
