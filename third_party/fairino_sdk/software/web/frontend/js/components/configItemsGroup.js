(function (angular) {
    'use strict';
    function ConfigItemsGroupController($scope) {

        function genRandomID(length) {
            return Number(Math.random().toString().substring(2, length) + Date.now()).toString(36);
        }
        
        this.$onInit = function () {
            $scope.swtichID = genRandomID(7);
            if (this.openType == 'up-down') {
                $scope.upDownFlag = false;
            } else if (this.openType == 'up-down-open') {
                $scope.upDownFlag = true;
            }
        }

        this.toggleUpDown = function () {
            $scope.upDownFlag = !$scope.upDownFlag;
        }
    }

    angular.module('frApp').component('configItemsGroup', {
        transclude: true,
        templateUrl: `./pages/components/configItemsGroup.html?v=${new Date().getTime()}`,
        controller: ConfigItemsGroupController,
        bindings: {
            groupName: '<',
            openType: '<',
            switchVal: '=',
            switchToggle: '<'
        }
    });
})(window.angular);