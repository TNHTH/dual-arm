(function (angular) {
    'use strict';
    function configSwitchController($scope) {

        function genRandomID(length) {
            return Number(Math.random().toString().substring(2, length) + Date.now()).toString(36);
        }

        this.$onInit = function () {
            $scope.swtichID = genRandomID(7);
        }

    }
    
    angular.module('frApp').component('configSwitch', {
        templateUrl: `./pages/components/configSwitch.html?v=${new Date().getTime()}`,
        controller: configSwitchController,
        bindings: {
            label: '<',
            val: '=',
            toggle: '<',
            type: '<'
        }
    })
})(window.angular);