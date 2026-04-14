"use strict";

angular
    .module('frApp')
    .controller('frcapCtrl', ['$scope', 'dataFactory', 'toastFactory', '$sce', frcapCtrlFn])

function frcapCtrlFn ($scope, dataFactory, toastFactory, $sce) {
    $scope.halfBothView();
    /* 信任srcURL：24.02.02新增内容 */
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }
    // 获取FRCap页面动态内容
    let frcapDynamicTags = langJsonData.frcap;
    /**
     * 获取FRCap的三级导航栏菜单
     * @author zjq
     * @date 2024.03.08
     */
    let tampfacapNavList = [];
    function createFRCapsNavList() {
        let getPluginCmd = {
            cmd: "get_plugin_nav",
        };
        dataFactory.getData(getPluginCmd)
            .then((data) => {
                data.forEach(element => {
                    // 仅在当前插件为配置类时才允许插入FRCap导航栏，0-配置，1-应用
                    if (element.category == "0") {
                        // 24.02.02修改：判断逻辑临时性修改，element.url改为"http://192.168.58.2:3000/index.html"
                        // if (tampfacapNavList.every(item => item.url != "http://192.168.58.2:3000/index.html")) {
                        if (tampfacapNavList.every(item => item.url != element.url)) {
                            let tempNavItem = {
                                "name": '',
                                "icon": "frfont frwaishechajian",
                                "url": ""
                            };
                            tempNavItem.name = element.name;
                            tempNavItem.url = element.url;
                            // tempNavItem.url = "http://192.168.58.2:3000/index.html";  // 24.02.02修改
                            tampfacapNavList.push(tempNavItem);
                        }
                    }
                });
                $scope.frcapNavList = tampfacapNavList;
            },(status) => {
                toastFactory.error(status, frcapDynamicTags.error_messages[0]);
                $scope.frcapNavList = tampfacapNavList;
            });
    }

    /**
     * 根据二级菜单切换对应设置界面
     * @author zjq
     * @date 2024.03.08
     * @param {int} index 插件应用序号
     * @param {string} pluginUrl 插件应用路径
     */
    $scope.switchFRCaps = function (index, pluginUrl) {
        $(".navItem").removeClass("item-selected");
        $(".navItem" + index).addClass("item-selected");

        $scope.show_plugin = true;
        $scope.pluginUrl = pluginUrl;
    }

    /** 初始化 */
    createFRCapsNavList();     // 获取当前的插件应用导航栏列表
    $scope.show_plugin = false;
}