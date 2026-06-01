(function (angular) {
    'use strict';
    function configInputController($scope) {
        this.$onInit = function () {
            if (this.placeholder == undefined && this.min != undefined && this.max != undefined) {
                $scope.placeholder = this.min + '-' + this.max;
            } else if (this.placeholder == undefined && this.min != undefined) {
                $scope.placeholder = `>=${this.min}`;
            } else if (this.placeholder == undefined && this.max != undefined) {
                $scope.placeholder = `<=${this.min}`;
            } else {
                $scope.placeholder = this.placeholder;
            }
            if (!this.disable) {
                $scope.disable = false;
            } else {
                $scope.disable = this.disable;
            }
        }
        this.blurToggle = function() {
            // 输入框为空时,填默认值
            if (this.blurValue !== null && this.blurValue !== undefined && this.blurValue !== '') {
                if (this.val === null || this.val === undefined || this.val === '') {
                    this.val = this.blurValue;
                }
            }
            // 输入范围判断和特殊判断
            if (this.min !== null && this.min !== undefined && this.min != "" && Number(this.val) < Number(this.min)) {
                if (this.val !== null && this.val !== undefined && this.val !== '') {
                    this.val = String(this.min);
                }
            } else if (this.max !== null && this.max !== undefined && this.max != "" && Number(this.val) > Number(this.max)) {
                if (this.val !== null && this.val !== undefined && this.val !== '') {
                    this.val = String(this.max);
                }
            } else if (this.val == '-0' || this.val == '0.') {
                this.val = '0';
            }
        }
    }
    
    angular.module('frApp').component('configInput', {
        templateUrl: `./pages/components/configInput.html?v=${new Date().getTime()}`,
        controller: configInputController,
        bindings: {
            label: '<',
            type: '<',
            val: '=',
            min: '<',
            max: '<',
            limitFunc: '<',
            placeholder: '<',
            unit: '<',
            typeof: '<',
            disable: '<',
            blurValue: '<',
            styles: '<'
        }
    })
})(window.angular);