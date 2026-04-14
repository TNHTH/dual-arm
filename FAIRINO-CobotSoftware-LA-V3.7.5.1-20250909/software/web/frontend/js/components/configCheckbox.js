(function (angular) {
    'use strict';
    function configCheckboxController($scope) {

        function genRandomID(length) {
            return Number(Math.random().toString().substring(2, length) + Date.now()).toString(36);
        }

        this.$onInit = function () {
            $scope.checkboxID = genRandomID(7);
        }

    }
    
    angular.module('frApp').component('configCheckbox', {
        templateUrl: `./pages/components/configCheckbox.html?v=${new Date().getTime()}`,
        controller: configCheckboxController,
        bindings: {
            label: '<',
            val: '='
        }
    })
})(window.angular);