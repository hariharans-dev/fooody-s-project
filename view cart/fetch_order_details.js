var cart = angular.module('cartpage', []);
cart.controller('data-fetch', function ($scope, $http) {
    $http.get('data.json')
        .then(function (response) {
            for (let index = 0; index < response.data.length; index++) {
                console.log(response.data[index].count);
                if (response.data[index].count > 0) {
                    $scope.name = response.data[index].name;
                    $scope.count = response.data[index].count;
                }
                else {
                    $scope.name = "";
                    $scope.count = "";
                }
            }
            
        });
});
