"use strict";

angular
    .module('frApp')
    .controller('frcapAppCtrl', ['$scope', '$routeParams', '$sce', frcapAppCtrlFn])

function frcapAppCtrlFn ($scope, $routeParams, $sce) {
    /* 信任srcURL */
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.fullContentView();
    $scope.frcapAppURL = `http://${window.location.hostname}:3000/frcap/${$routeParams.id}/index.html`;
}