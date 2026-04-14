(function (angular) {
    'use strict';
    function configSelectController($scope) {
        this.$onInit = function() {
            switch (this.optionsType) {
                case 'id':
                    $scope.optionsKey = 1;
                    break;
                case 'value':
                    $scope.optionsKey = 2;
                    break;
                default:
                    $scope.optionsKey = 0;
                    break;
            }
            if (!this.disable) {
                $scope.disable = false;
            } else {
                $scope.disable = this.disable;
            }
        }
    }
    
    angular.module('frApp').component('configSelect', {
        templateUrl: `./pages/components/configSelect.html?v=${new Date().getTime()}`,
        controller: configSelectController,
        bindings: {
            label: '<',
            val: '=',
            options: '<',
            unit: '<',
            changeToggle: '<',
            optionsType: '<',
            disable: '<',
            styles: '<'
        }
    })
})(window.angular);