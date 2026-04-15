(function (angular) {
    'use strict';
    function configDeviceController($scope) {}

    angular.module('frApp').component('configDevice', {
        templateUrl: `./pages/components/configDevice.html?v=${new Date().getTime()}`,
        controller: configDeviceController,
        bindings: {
            icon: '<',
            icon2: '<',
            icon3: '<',
            label: '<',
            id: '<',
            configs: '<',
            title1: '<',
            title2: '<',
            title3: '<',
            title4: '<',
            value1: '<',
            value2: '<',
            value3: '<',
            value4: '<',
            clickToggle1: '<',
            clickToggle2: '<'
        }
    })
})(window.angular)