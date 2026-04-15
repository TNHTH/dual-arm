"use strict";

let frapp = angular
    .module("frApp", ['ngRoute', 'ngDragDrop', 'ngWebSocket', 'pascalprecht.translate', 'ui.bootstrap', 'ui.uploader'/*'ui.ng-uploader'*/])
    .config(['$routeProvider', routeConfigFn])
    .config(['$translateProvider', translateConfigFn])
    .controller("indexCtrl", ['$scope', '$location', '$http', 'dataFactory', 'toastFactory', '$translate', '$websocket', indexCtrlFn])
    .factory("dataFactory", ["$http", "$q", dataFactoryFn])
    .factory("toastFactory", ["$http", "$q", toastFactoryFn])
    .directive("ngTouchstart", ngTouchstartFn)
    .directive("ngTouchend", ngTouchendFn)
    .directive("limitInput", limitInputFn)


/** WebApp检测和禁用等逻辑 */
// 禁用网页右键
document.oncontextmenu = function () {
    return false;
};

// 检测浏览器是否支持visibility API
if (typeof document.addEventListener === undefined || typeof document[hidden] === undefined) {
    console.log("当前页面不支持visibility API");
}

// 页面是否可视（当浏览器最小化或者在浏览器tab之间切换）
var hidden, visibilityChange;
if (typeof document.hidden !== undefined) {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document.mshidden !== undefined) {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== undefined) {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}
/* ./WebApp检测和禁用等逻辑 */


/* 自定义指令 */
/**
 * 触控屏长按开始自定义指令
 * @returns 
 */
function ngTouchstartFn() {
    return {
        controller: ["$scope", "$element", function ($scope, $element) {

            $element.bind("touchstart", onTouchStart);
            function onTouchStart(event) {
                var method = $element.attr("ng-touchstart");
                $scope.$apply(method);
            }

        }]
    }
};

/**
 * 触控屏长按结束自定义指令
 * @returns 
 */
function ngTouchendFn() {
    return {
        controller: ["$scope", "$element", function ($scope, $element) {

            $element.bind("touchend", onTouchEnd);
            function onTouchEnd(event) {
                var method = $element.attr("ng-touchend");
                $scope.$apply(method);
            }

        }]
    }
};

/**
 * 限制输入方法自定义指令（目前仅在组件内使用）
 * @returns 
 */
function limitInputFn() {
    return function (scope, elem, attrs) {
        scope.$watch(attrs.limitInput, function (newValue) {
            if (newValue != undefined) {
                switch (scope.$ctrl.typeof) {
                    case 'int':
                        // 限制输入小数点
                        scope.$ctrl.val = String(scope.$ctrl.val).replace(/[^\d-]/g, '');
                        // 限制开始多个0的输入
                        scope.$ctrl.val = String(scope.$ctrl.val).replace(/((?<=^0)0+)/g, '');
                        // 只允许输入一个负号且负号不允许出现在数字之间
                        scope.$ctrl.val = String(scope.$ctrl.val).replace(/\-{2,}/g, '-').replace('-', '$#$').replace(/\-/g, '').replace('$#$', '-').replace(/(?<=\d)-$|(?<=\.)-$/g, '');
                        break;
                    case 'float':
                        // 限制开始多个0的输入
                        scope.$ctrl.val = String(scope.$ctrl.val).replace(/((?<=^0)0+)/g, '');
                        // 只允许输入一个负号且负号不允许出现在数字之间
                        scope.$ctrl.val = String(scope.$ctrl.val).replace(/\-{2,}/g, '-').replace('-', '$#$').replace(/\-/g, '').replace('$#$', '-').replace(/(?<=\d)-$|(?<=\.)-$/g, '');
                        break;
                    case 'double':
                        
                        break;
                    case 'special':
                        
                        break;
                    case 'special_title':
                        
                        break;
                
                    default:
                        break;
                }
            }
        })
    }
}
/* ./自定义指令 */


/* 页面显示区域控制 */
/**
 * 调整机器人安装方式按钮条宽度
 */
var changeMountingBottomBarWidth = function () {
    $("#mounting-bottom-bar1").removeClass("full");
    $("#mounting-bottom-bar2").removeClass("full");
    $("#mounting-bottom-bar1").removeClass("calc");
    $("#mounting-bottom-bar2").removeClass("calc");
    $("#mounting-bottom-bar1").addClass("half");
    $("#mounting-bottom-bar2").addClass("half");
}

/**
 * 调整机器人安装方式页面宽度
 */
var changeMountingWidth = function () {
    $("#vRobot-view").removeClass("vRobot-55");
    $("#vRobot-view").addClass("vRobot-col-calc");
    $("#mounting-bottom-bar1").removeClass("half");
    $("#mounting-bottom-bar2").removeClass("half");
    $("#mounting-bottom-bar1").removeClass("full");
    $("#mounting-bottom-bar2").removeClass("full");
    $("#mounting-bottom-bar1").addClass("calc");
    $("#mounting-bottom-bar2").addClass("calc");
}

/**
 * 调整三维虚拟机器人页面宽度
 */
var changeVRobotWidth = function () {
    $("#vRobot-view").removeClass("vRobot-col-calc");
    $("#vRobot-view").removeClass("vRobot-col-calc");
    $("#vRobot-view").addClass("vRobot-55");
    $("#vRobot-view").addClass("vRobot-55");
}

/**
 * 显示状态查询中的机器人TCP、单轴点动、多轴联动和点位移动；同时更新多轴联动的元素内容
 */
 var showRobotSettingFixed = function () {
    document.getElementById('robot-setting-fixed').style.display = 'block';
    document.getElementById('robot-setting-info-fixed').style.display = 'block';
    document.querySelector('#slider-list-fixed').appendChild(document.querySelector('#robot-setting-info ul.slider-list'));
}

/**
 * 隐藏状态查询中的机器人TCP、单轴点动、多轴联动和点位移动；同时更新多轴联动的元素内容
 */
var hideRobotSettingFixed = function () {
    document.getElementById('robot-setting-fixed').style.display = 'none';
    document.getElementById('robot-setting-info-fixed').style.display = 'none';
    if (document.querySelector('#slider-list-fixed ul')) {
        document.querySelector('#slider-list').appendChild(document.querySelector('#slider-list-fixed ul'));
    }
}
/* ./页面显示区域控制 */


/* 输入控件范围限制、格式处理等 */
/**
 * 页面输入框输入浮点数限制
 * @param {object} element DOM元素
 */
var limitInput_float = function (element) {
    // 只允许输入数字和小数点
    element.value = element.value.replace(/[^\d\.-]/g, '');
    // 只允许输入一个小数点
    element.value = element.value.replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    // 只允许输入一个负号且负号不允许出现在数字之间
    element.value = element.value.replace(/\-{2,}/g, '-').replace('-', '$#$').replace(/\-/g, '').replace('$#$', '-').replace(/(?<=\d)-$|(?<=\.)-$/g, '');
    // 只允许输入最多三位小数
    // element.value = element.value.replace(/^(\-)*(\d+)\.(\d\d\d).*$/, '$1$2.$3');

    // 输入框输入数值最小范围限制
    if (element.value != "") {
        if (element.min != "" && Number(element.value) < Number(element.min)) {
            element.value = element.min;
        }
        // 输入框输入数值最大范围限制
        if (element.max != "" && Number(element.value) > Number(element.max)) {
            element.value = element.max;
        }
        if (element.value == '-0') {
            element.value = 0
        }
    }
}

/**
 * 页面输入框输入double类型限制
 * @param {object} element DOM元素
 * @param {int} controlScopeFlag 范围类型 0-左右开区间, 1-左闭右开，2-左开右闭
 */
var limitInput_double = function (element, controlScopeFlag) {
    // 只允许输入数字和小数点
    element.value = element.value.replace(/[^\d\.-]/g, '');
    // 只允许输入一个小数点
    element.value = element.value.replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    // 只允许输入一个负号且负号不允许出现在数字之间
    element.value = element.value.replace(/\-{2,}/g, '-').replace('-', '$#$').replace(/\-/g, '').replace('$#$', '-').replace(/(?<=\d)-$|(?<=\.)-$/g, '');

    // 输入框输入数值最小范围限制
    if (element.value != "") {
        if (element.min != "" && Number(element.value) <= Number(element.min)) {
            if (controlScopeFlag == 1) {
                element.value = element.min;
            } else {
                element.value = parseInt(element.min) + 1;
            }
        }
        // 输入框输入数值最大范围限制
        if (element.max != "" && Number(element.value) >= Number(element.max)) {
            if (controlScopeFlag == 2) {
                element.value = element.max;
            } else {
                element.value = parseInt(element.max) - 1;
            }
        }
    }
}

/**
 * 页面输入框输入整数限制
 * @param {object} element DOM元素
 */
var limitInput_int = function (element) {
    // 限制输入小数点
    element.value = element.value.replace(/[^\d-]/g, '');
    // 限制开始多个0的输入
    element.value = element.value.replace(/((?<=^0)0+)/g, '');
    // 只允许输入一个负号且负号不允许出现在数字之间
    element.value = element.value.replace(/\-{2,}/g, '-').replace('-', '$#$').replace(/\-/g, '').replace('$#$', '-').replace(/(?<=\d)-$|(?<=\.)-$/g, '');

    // 输入框输入数值最小范围限制
    if (element.value != "") {
        if (element.min != "" && Number(element.value) < Number(element.min)) {
            element.value = element.min;
        }
        // 输入框输入数值最大范围限制
        if (element.max != "" && Number(element.value) > Number(element.max)) {
            element.value = element.max;
        }
        if (element.value == '-0' && Number(element.min) == 0) {
            element.value = 0
        }
    }
}

/**
 * 页面输入框禁止输入特殊字符
 * @param {object} element DOM元素
 */
var limitInput_special = function (element) {
    // 不允许输入特殊字符
    element.value = element.value.replace(/[^'\a-\z\A-\Z0-9\u4E00-\u9FA5]|[\^\_]/g, '');
}

/**
 * 页面输入框禁止输入特殊字符,只允许输入下划线“_”
 * @param {object} element DOM元素
 */
var limitInput_special_title = function (element) {
    // 不允许输入特殊字符
    element.value = element.value.replace(/[^'\a-\z\A-\Z0-9\u4E00-\u9FA5\_]/g, '');
}

/**
 * 上传文件后清空文件
 * @param {string} id DOM元素id
 */
var clearImportFile = function(id) {
    document.getElementById(id).outerHTML = document.getElementById(id).outerHTML;
}

/**
 * 日期格式
 * @param {object} date 标准的日期对象
 * @param {string} format 日期格式（2024-04-09的format为“-”；2024/04/09的format为“/”）
 * @returns 
 */
var getFormatDate = function(date, format) {
    const dateYear = new Date(date).getFullYear();
    const dateMonth = new Date(date).getMonth() > 8 ? new Date(date).getMonth() + 1 : `0${new Date(date).getMonth() + 1}`;
    const dateDate = new Date(date).getDate() > 9 ? new Date(date).getDate() : `0${new Date(date).getDate()}`;
    return `${dateYear}${format}${dateMonth}${format}${dateDate}`
}

/**
 * 零点时间判断
 * @param {object} date 标准的日期对象
 * @returns 
 */
var isMidNight = function(date) {
    const dateHours = new Date(date).getHours();
    const dateMinutes = new Date(date).getMinutes();
    const dateSeconds = new Date(date).getSeconds();
    const dateMilliseconds = new Date(date).getMilliseconds();
    return dateHours === 0 && dateMinutes === 0 && dateSeconds === 0 && dateMilliseconds === 0;
}
/* ./输入控件范围限制、格式处理等 */


/* 加载蒙板控制 */
// 方法弃用，暂时保留
var showPageLoading = function () {
    return; 
    if (g_teachPendantEnableFlg) {
        let pageLoading = document.getElementById("pageLoading");
        pageLoading.style.display = "block";
    }
}

// 方法弃用，暂时保留
var hidePageLoading = function () {
    return;
    if (g_teachPendantEnableFlg) {
        let pageLoading = document.getElementById("pageLoading");
        pageLoading.style.display = "none";
    }
}
/* ./加载蒙板控制 */


/* 主页面导航栏相关 */
/**
 * 机器人退出状态页面时，导航栏更新
 * @param {string} type peripheral-退出码垛状态监控页面
 */
function refreshSidebarMenu(type) {
    $('.sidebar-menu').tree();
    $('.sidebar-menu').find('.menu-open').removeClass('menu-open');
    $('.sidebar-menu').find('.active').removeClass('active');
    $('.sidebar-menu').find('ul').css('display', 'none');
    let openMenu;
    $('.sidebar-menu a').each(function() {
        if ($(this).attr('href') && $(this).attr('href').endsWith(type)) {
            openMenu = $(this);
        }
    });
    openMenu.parent().addClass('active');
    openMenu.parent().parent().css('display', 'block');
    openMenu.parent().parent().parent().addClass('menu-open');
}

/**
 * 导航栏返回子页面
 * @param {string} itemUrl 导航栏路由
 */
function gobackItemNavbar(itemUrl) {
    $('.sidebar-menu').tree();
    $('.sidebar-menu').find('.active').removeClass('active');
    if (itemUrl) {
        let openMenu;
        $('.sidebar-menu a').each(function() {
            if ($(this).attr('href') && $(this).attr('href').endsWith(itemUrl)) {
                openMenu = $(this);
                openMenu.parent().addClass('active');
                openMenu.parent().parent().parent().addClass('active');
            }
        });
    }
}
/* ./主页面导航栏相关 */


/**
 * WebApp路由配置
 */
function routeConfigFn($routeProvider) {
    // 导航栏路由，处理index.html中的ng-view的视图导入。
    $routeProvider
        .when('/nodeeditor', {
            templateUrl: './pages/node_editor.html',
            controller: 'nodeeditorCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/safeset', {
            templateUrl: './pages/safeset.html',
            controller: 'safesetCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/weldguide', {
            templateUrl: './pages/weldguide.html',
            controller: 'weldguideCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/monitor', {
            templateUrl: './pages/monitor.html',
            controller: 'monitorCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                    showRobotSettingFixed();
                }
            }
        })
        .when('/programteach', {
            templateUrl: './pages/program_teach.html',
            controller: 'programteachCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/teachingmanagement', {
            templateUrl: './pages/teaching_management.html',
            controller: 'teachingmanagementCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/graphicalprogramming', {
            templateUrl: './pages/graphical_programming.html',
            controller: 'graphicalprogrammingCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/log', {
            templateUrl: './pages/log.html',
            controller: 'logCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/robotsetting', {
            templateUrl: './pages/robot_setting.html',
            controller: 'settingCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/systemsetting', {
            templateUrl: './pages/system_setting.html',
            controller: 'systemCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/auxiliary', {
            templateUrl: './pages/auxiliary_application.html',
            controller: 'auxCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }
            }
        })
        .when('/peripheral', {
            templateUrl: './pages/peripheral_setting.html',
            controller: 'perCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                    hideRobotSettingFixed();
                }   
            }
        })
        .when('/frcap', {
            templateUrl: './pages/frcap.html',
            controller: 'frcapCtrl',
            resolve: {
                resolved: function () {
                    changeMountingBottomBarWidth();
                    showPageLoading();
                }
            }
        })
        .when('/frcap-app/:id', {
            templateUrl: './pages/frcap_app.html',
            controller: 'frcapAppCtrl',
            resolve: {
                resolved: function () {
                    showPageLoading();
                }
            }
        })
        .otherwise({
            redirectTo: '',
            resolve: {
                resolved: function () {}
            }
        });
};


/**
 * WebApp页面翻译配置
 */
function translateConfigFn($translateProvider) {
    let storage = window.sessionStorage;
    let langCode = storage.getItem("langCode");
    let language = JSON.parse(storage.getItem("langJsonData"));
    $translateProvider.translations(langCode, language);
    $translateProvider.preferredLanguage(langCode);
    // 初始化页面时，图形化编程语法包引入
    var script = document.createElement('script');
    if (langCode == 'zh') {
        langCode = 'zh-hans';
    }
    script.src =  `./plugins/blockly/msg/js/${langCode}.js?v=${new Date().getTime()}`
    document.head.appendChild(script);
    
    //更改系统语言字体
    if (langCode == 'ja') {
        $("body").css("font-family","'MS Gothic', '-apple-system', BlinkMacSystemFont, 'Yu Gothic', '游ゴシック', YuGothic, '游ゴシック体', 'Noto Sans Japanese', 'ヒラギノ角ゴ Pro W3', 'メイリオ', 'Hiragino Kaku Gothic ProN', 'MS PGothic', Osaka, sans-serif");
    } else if (langCode == 'en') {
        $("body").css("font-family","'Verdana', 'Geneva', sans-serif");
    } else {
        $("body").css("font-family","'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif");
    }
};


/* 系统全局变量 */
/**
 * 系统语言包全局变量
 * 存储语言包key值frontend下全部内容
 */
let langJsonData;

/**
 * 系统语言全局变量
 */
let g_lang_code;

/**
 * 系统语言代码字典
 */
let g_lang_dict = {
    "zh": {
        lang_name: "中文",
        lang_code: "zh"
    },
    "en": {
        lang_name: "English",
        lang_code: "en"
    },
    "ja": {
        lang_name: "日本語",
        lang_code: "ja"
    },
    "fr": {
        lang_name: "français",
        lang_code: "fr"
    }
};

/**
 * 系统语言参考代码字典
 */
let g_ref_lang_dict = {
    "zh": {
        lang_name: "中文",
        lang_code: "zh"
    },
    "en": {
        lang_name: "English",
        lang_code: "en"
    },
    "ja": {
        lang_name: "日本語",
        lang_code: "ja"
    },
    "fr": {
        lang_name: "français",  // 法语
        lang_code: "fr"
    },
    "es": {
        lang_name: "Español",   // 西班牙语
        lang_code: "es"
    },
    "ru": {
        lang_name: "Русский",   // 俄语
        lang_code: "ru"
    },
    "ar": {
        lang_name: "العربية",   // 阿拉伯语
        lang_code: "ar"
    },
    "de": {
        lang_name: "Deutsch",   // 德语
        lang_code: "de"
    },
    "pt": {
        lang_name: "Protuguês",     // 葡萄牙语
        lang_code: "pt"
    },
    "hi": {
        lang_name: "हिंदी",    // 印度语
        lang_code: "hi"
    },
    "it": {
        lang_name: "Italiano",  // 意大利语
        lang_code: "it"
    },
    "ko": {
        lang_name: "한국의",    // 韩语
        lang_code: "ko"
    },
    "bn": {
        lang_name: "বাংলা",    // 孟加拉语
        lang_code: "bn"
    },
    "tr": {
        lang_name: "Türkçe",    // 土耳其语
        lang_code: "tr"
    }
};

/**
 * 程序未保存运行程序标志
 * 1-示教程序页面 2-图形化编程页面 3-正常运行程序
 */
let g_programChangeFlag;

/**
 * 程序运行错误标志
 * 1-阻止运行 0-正常运行
 */
let g_programErrorFlag;

/**
 * 示教点前缀全局变量
 */
let g_tpPrefix = "";

/**
 * 机器人控制器全局变量
 * 0：机器人本体（QNX/Linux）
 * 1：机器人控制器虚拟机SimMachine
 */
let g_simmachineFlag = 0;

/**
 * 机器人控制箱系统区分全局变量
 * 0：qnx系统
 * 1：linux系统
 */
let g_systemFlag = 1;

/**
 * 康养运动组数全局变量
 */
let g_kangYangCycleIndex = [];

/**
 * 机器人型号全局变量
 * type=1：代表FR3
 * type=2：代表FR5
 * type=3：代表FR10
 */
let g_robotType = {
    type: 0,
    major_ver: 0,
    minor_ver: 0,
    load_range_max: 0
};

/**
 * 机器人类型代码全局变量
 * 代码直接指代机器人的具体型号
 */
let g_robotTypeCode = 0;

/**
 * 示教器启用标志
 * 0-关闭，1-启用，默认关闭
 */
let g_teachPendantEnableFlg = 0;

/**
 * 机器人使能/去使能全局变量
 * 0-使能，1-去使能，默认机器人使能
 */
let g_robotEnableFlg = 0;

// 涉及webSocket全局变量命名规范：“g_socket_变量名”
/**
 * webSocket全局变量
 */
let g_socketStream;

/**
 * webSocket连接状态全局变量
 * 0-断开连接，1-连接成功，默认断开连接
 */
let g_socketStatus = 0;

/**
 * 登出全局变量
 */
let g_socketLogoutFlag = 0;

/**
 * 外部轴零点数据初始化全局变量
 */
let g_zeroStateInit;

/**
 * 已应用点位表名称全局变量
 */
let g_appliedPointTableName;

/**
 * 测试代码控制全局变量
 * 0-关 1-开，默认0
 */
let g_testCode = 0;

/**
 * DIO功能安全数组全局变量
 */
let g_safetyCIFuncArr = [20, 21, 22, 23, 24];
let g_safetyCOFuncArr = [20, 21, 23, 24, 25, 26, 27];

/**
 * 当前选择程序名称
 */
let g_fileNameForUpload;

/**
 * 当前选择程序的lua程序内容
 */
let g_fileDataForUpload;

/**
 * 当前选择程序的lua程序内容
 */
let soFlg = 0;

/**
 * 程序编程——NewDofile子程序是否存在报错，0-不存在报错，1-存在报错
 */
let g_programErr = 0;

/**
 * 程序编程——NewDofile子程序验证的报错信息
 */
let g_programErrString = "";

/**
 * 是否为单步执行标志位，0-程序运行，1-单步执行
 */
let g_isRunStepOver = 0;

/**
 * 图形化编程——NewDofile子程序是否存在报错，false-不存在报错，true-存在报错
 */
let g_graphicalErr = false;

/**
 * 图形化编程——NewDofile子程序验证的报错信息
 */
let g_graphicalErrString = '';

/**
 * 节点图编程报错提示全局变量
 * false-关 true-开，默认false
 */
let g_nodeLuaError = false;

/**
 * 节点图编程报错节点类型名称全局变量
 * 默认为空
 */
let g_nodeLuaErrorType = '';

/**
 * 节点图编程报错信息全局变量
 * 默认为空
 */
let g_nodeLuaErrorString = '';

/**
 * 节点图编程节点类型是否为Get类型全局变量
 * false-否 true-是，默认false
 */
let g_isGetNodeGraph = false;

/**
 * 节点图编程当前NewDofile内容是否可以保存全局变量
 * false-否 true-是，默认false
 */
let g_nodeEditorErr = false;

/**
 * 节点图编程NewDofile指令报错信息全局变量
 * 默认为空
 */
let g_nodeEditorErrString = '';

/**
 * 节点图编程中工具坐标系全局变量
 */
let g_nodeToolCoorde = [];

/**
 * 节点图编程中工具+外部工具坐标系全局变量
 */
let g_nodeToolCoordeTotal = [];

/**
 * 节点图编程中工件坐标系全局变量
 */
let g_nodeWobjToolCoorde = [];

/**
 * 修改示教点后获取计算数据全局变量
 */
let g_modifyPointFlag;

/**
 * 每次修改示教点后刷新数据全局变量
 */
let g_refreshTableFlag;

/* ./系统全局变量 */


/* WebApp初始化及通用方法 */
/**
 * 获取url参数（即时函数）
 * 功能：存在debug参数且值为1，则为dev环境。
 */
(function getUrlParam() {
    let paramStr = window.location.search.substring(1);
    let paramArr = paramStr.split('?');
    if (paramArr.length) {
        for (let i = 0; i < paramArr.length; i++) {
            const temp = paramArr[i].split('=');
            if (temp[0] == 'debug' && temp[1] == 1) {
                g_testCode = 1;
            } else {
                g_testCode = 0;
            }
        }
    }
})();

/**
 * 获取用户权限
 * @returns 成功返回权限对象，失败重定向登录页面
 */
var getUserAuthority = function() {
    if (sessionStorage.getItem('userAuthority')) {
        return JSON.parse(sessionStorage.getItem('userAuthority'));
    } else {
        location = './login.html';
    }
}

/**
 * 操作事件提示语
 * @param {string} restarTtext 例如：上传备份包完成、升级完成、导入DH配置文件成功
 */
var showPageRestart = function(restarTtext) {
    $("#restartText").text(restarTtext);
    $('#restartPage').css("display", "block");
}

/**
 * 示教点前缀输入栏处理-设置
 * @param {string} prefix 前缀字符串
 */
function setTPPrefix(prefix) {
    g_tpPrefix = prefix;
    $("#tpPrefix").val(prefix);
}
/**
 * 示教点前缀输入栏处理-输入
 */
function entryPrefix() {
    g_tpPrefix = $("#tpPrefix").val();
}

/**
 * 获取机器人型号文本
 * @param {int} type 机器人型号代码
 * @returns 
 */
function getRobotTypeText (type) {
    let resultType = '';
    if (type == 1) {
        resultType = 'FR3 V5.0';
    } else if (type == 2) {
        resultType = 'FR3 V6.0';
    } else if (type == 101) {
        resultType = 'FR5 V4.0';
    } else if (type == 102) {
        resultType = 'FR5 V5.0';
    } else if (type == 103) {
        resultType = 'FR5 V6.0';
    } else if (type == 201) {
        resultType = 'FR10 V5.0';
    } else if (type == 202) {
        resultType = 'FR10 V6.0';
    } else if (type == 301) {
        resultType = 'FR16 V5.0';
    } else if (type == 302) {
        resultType = 'FR16 V6.0';
    } else if (type == 401) {
        resultType = 'FR20 V5.0';
    } else if (type == 402) {
        resultType = 'FR20 V6.0';
    } else if (type == 501) {
        resultType = 'FR3 V6.0';
    } else if (type == 601) {
        resultType = 'FR3 V6.0';
    } else if (type == 802) {
        resultType = 'FR5WM';
    } else if (type == 901) {
        resultType = 'FR3MT';
    } else if (type == 902) {
        resultType = 'FR10YD';
    } else if (type == 1001) {
        resultType = 'FR30 V6.0';
    }
    return resultType;
}
/* ./WebApp初始化及通用方法 */


/**
 * 首页控制器函数
 */
function indexCtrlFn($scope, $location, $http, dataFactory, toastFactory, $translate, $websocket) {
    $scope.fullFlag = 1;
    // 100%的内容显示区
    $scope.fullContentView = function () {
        $scope.fullFlag = 1;
        $("#content-view").removeClass("content-col-md-0");
        $("#content-view").removeClass("content-45");
        $("#content-view").addClass("col-md-12");
        $("#content-view").addClass("col-md-12");
        document.getElementById("vRobot-view").style.zIndex = -1;
    }

    // 45%的内容显示区，55%的三维模型操作显示区
    $scope.halfBothView = function () {
        $("#content-view").removeClass("content-col-md-0");
        $("#content-view").removeClass("col-md-12");
        $("#content-view").addClass("content-45");
        $("#vRobot-view").removeClass("col-md-12");
        $("#vRobot-view").removeClass("vRobot-col-calc");
        $("#vRobot-view").addClass("vRobot-55");
        if ($scope.fullFlag) {
            $scope.fullFlag = 0;
            $("#robot-setting").removeAttr('style');
            $("#robot-object").removeAttr('style');
            $("#robot-status").removeAttr('style');
            $("#robot-support").removeAttr('style');
            $scope.clickRobotSetting();
            $scope.toggleDataDisplay();
            $scope.clickRobotSupport();
        }
        document.getElementById("vRobot-view").style.zIndex = 0;
    }

    $scope.setProgramUrdf = function(value) {
        $scope.programUrdf = value;
        document.getElementById('robot-object').style.top = $scope.programUrdf ? '58px' : '10px';
    }

    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let indexDynamicTags;
    let setErrorDict;
    let tpd_record_state;
    let programStatusDict;
    let referenceCoord;
    let torqueSysUnitList;
    let torqueSysControlModeList;
    let torqueSysWorkingStatusList;
    let torqueSysLockResultList;
    let storage = window.sessionStorage;
    // 如果语言包为空，重定向至login页面
    if ($.isEmptyObject(JSON.parse(storage.getItem("langJsonData")))) {
        if (g_testCode) {
            location = './login.html?debug=1';
        } else {
            location = './login.html';
        }
    }
    langJsonData = JSON.parse(storage.getItem("langJsonData")).frontend;
    g_lang_code = storage.getItem("langCode");
    indexDynamicTags = langJsonData.index;
    setErrorDict = langJsonData.setErrorDict;
    $scope.errorDictData = setErrorDict["500"];
    /* 初始化IO列表 */
    $scope.clDOArr = langJsonData.IOlists.clDO;
    $scope.clDIArr = langJsonData.IOlists.clDI;
    $scope.palletizingDOArr = [
        {
            "name": "CO0",
            "num": 8
        },
        {
            "name": "CO1",
            "num": 9
        }
    ];
    $scope.palletizingDIArr = [
        {
            "name": "CI0",
        }
    ];
    $scope.palletizingAuxDOArr = [
        {
            "id": "0",
            "name": "DO0"
        },
        {
            "id": "1",
            "name": "DO1"
        },
        {
            "id": "2",
            "name": "DO2"
        },
        {
            "id": "3",
            "name": "DO3"
        },
        {
            "id": "4",
            "name": "DO4"
        },
        {
            "id": "5",
            "name": "DO5"
        },
        {
            "id": "5",
            "name": "DO5"
        },
        {
            "id": "6",
            "name": "DO6"
        },
        {
            "id": "7",
            "name": "DO7"
        }
    ];
    $scope.palletizingAuxDIArr = [
        {
            "id": "0",
            "name": "DI0"
        },
        {
            "id": "1",
            "name": "DI1"
        },
        {
            "id": "2",
            "name": "DI2"
        },
        {
            "id": "3",
            "name": "DI3"
        },
        {
            "id": "4",
            "name": "DI4"
        },
        {
            "id": "5",
            "name": "DI5"
        },
        {
            "id": "5",
            "name": "DI5"
        },
        {
            "id": "6",
            "name": "DI6"
        },
        {
            "id": "7",
            "name": "DI7"
        }
    ];
    $scope.toolDOArr = langJsonData.IOlists.toolDO;
    $scope.toolDIArr = langJsonData.IOlists.toolDI;
    $scope.AuxclDOArr = [
        {
            "name": "DO0"
        },
        {
            "name": "DO1"
        },
        {
            "name": "DO2"
        },
        {
            "name": "DO3"
        },
        {
            "name": "DO4"
        },
        {
            "name": "DO5"
        },
        {
            "name": "DO6"
        },
        {
            "name": "DO7"
        },
        {
            "name": "DO8"
        },
        {
            "name": "DO9"
        },
        {
            "name": "DO10"
        },
        {
            "name": "DO11"
        },
        {
            "name": "DO12"
        },
        {
            "name": "DO13"
        },
        {
            "name": "DO14"
        },
        {
            "name": "DO15"
        },
        {
            "name": "DO16"
        },
        {
            "name": "DO17"
        },
        {
            "name": "DO18"
        },
        {
            "name": "DO19"
        },
        {
            "name": "DO20"
        },
        {
            "name": "DO21"
        },
        {
            "name": "DO22"
        },
        {
            "name": "DO23"
        },
        {
            "name": "DO24"
        },
        {
            "name": "DO25"
        },
        {
            "name": "DO26"
        },
        {
            "name": "DO27"
        },
        {
            "name": "DO28"
        },
        {
            "name": "DO29"
        },
        {
            "name": "DO30"
        },
        {
            "name": "DO31"
        },
        {
            "name": "DO32"
        },
        {
            "name": "DO33"
        },
        {
            "name": "DO34"
        },
        {
            "name": "DO35"
        },
        {
            "name": "DO36"
        },
        {
            "name": "DO37"
        },
        {
            "name": "DO38"
        },
        {
            "name": "DO39"
        },
        {
            "name": "DO40"
        },
        {
            "name": "DO41"
        },
        {
            "name": "DO42"
        },
        {
            "name": "DO43"
        },
        {
            "name": "DO44"
        },
        {
            "name": "DO45"
        },
        {
            "name": "DO46"
        },
        {
            "name": "DO47"
        },
        {
            "name": "DO48"
        },
        {
            "name": "DO49"
        },
        {
            "name": "DO50"
        },
        {
            "name": "DO51"
        },
        {
            "name": "DO52"
        },
        {
            "name": "DO53"
        },
        {
            "name": "DO54"
        },
        {
            "name": "DO55"
        },
        {
            "name": "DO56"
        },
        {
            "name": "DO57"
        },
        {
            "name": "DO58"
        },
        {
            "name": "DO59"
        },
        {
            "name": "DO60"
        },
        {
            "name": "DO61"
        },
        {
            "name": "DO62"
        },
        {
            "name": "DO63"
        },
        {
            "name": "DO64"
        },
        {
            "name": "DO65"
        },
        {
            "name": "DO66"
        },
        {
            "name": "DO67"
        },
        {
            "name": "DO68"
        },
        {
            "name": "DO69"
        },
        {
            "name": "DO70"
        },
        {
            "name": "DO71"
        },
        {
            "name": "DO72"
        },
        {
            "name": "DO73"
        },
        {
            "name": "DO74"
        },
        {
            "name": "DO75"
        },
        {
            "name": "DO76"
        },
        {
            "name": "DO77"
        },
        {
            "name": "DO78"
        },
        {
            "name": "DO79"
        },
        {
            "name": "DO80"
        },
        {
            "name": "DO81"
        },
        {
            "name": "DO82"
        },
        {
            "name": "DO83"
        },
        {
            "name": "DO84"
        },
        {
            "name": "DO85"
        },
        {
            "name": "DO86"
        },
        {
            "name": "DO87"
        },
        {
            "name": "DO88"
        },
        {
            "name": "DO89"
        },
        {
            "name": "DO90"
        },
        {
            "name": "DO91"
        },
        {
            "name": "DO92"
        },
        {
            "name": "DO93"
        },
        {
            "name": "DO94"
        },
        {
            "name": "DO95"
        },
        {
            "name": "DO96"
        },
        {
            "name": "DO97"
        },
        {
            "name": "DO98"
        },
        {
            "name": "DO99"
        },
        {
            "name": "DO100"
        },
        {
            "name": "DO101"
        },
        {
            "name": "DO102"
        },
        {
            "name": "DO103"
        },
        {
            "name": "DO104"
        },
        {
            "name": "DO105"
        },
        {
            "name": "DO106"
        },
        {
            "name": "DO107"
        },
        {
            "name": "DO108"
        },
        {
            "name": "DO109"
        },
        {
            "name": "DO110"
        },
        {
            "name": "DO111"
        },
        {
            "name": "DO112"
        },
        {
            "name": "DO113"
        },
        {
            "name": "DO114"
        },
        {
            "name": "DO115"
        },
        {
            "name": "DO116"
        },
        {
            "name": "DO117"
        },
        {
            "name": "DO118"
        },
        {
            "name": "DO119"
        },
        {
            "name": "DO120"
        },
        {
            "name": "DO121"
        },
        {
            "name": "DO122"
        },
        {
            "name": "DO123"
        },
        {
            "name": "DO124"
        },
        {
            "name": "DO125"
        },
        {
            "name": "DO126"
        },
        {
            "name": "DO127"
        }
    ];
    $scope.AuxclDIArr = [
        {
            "name": "DI0"
        },
        {
            "name": "DI1"
        },
        {
            "name": "DI2"
        },
        {
            "name": "DI3"
        },
        {
            "name": "DI4"
        },
        {
            "name": "DI5"
        },
        {
            "name": "DI6"
        },
        {
            "name": "DI7"
        },
        {
            "name": "DI8"
        },
        {
            "name": "DI9"
        },
        {
            "name": "DI10"
        },
        {
            "name": "DI11"
        },
        {
            "name": "DI12"
        },
        {
            "name": "DI13"
        },
        {
            "name": "DI14"
        },
        {
            "name": "DI15"
        },
        {
            "name": "DI16"
        },
        {
            "name": "DI17"
        },
        {
            "name": "DI18"
        },
        {
            "name": "DI19"
        },
        {
            "name": "DI20"
        },
        {
            "name": "DI21"
        },
        {
            "name": "DI22"
        },
        {
            "name": "DI23"
        },
        {
            "name": "DI24"
        },
        {
            "name": "DI25"
        },
        {
            "name": "DI26"
        },
        {
            "name": "DI27"
        },
        {
            "name": "DI28"
        },
        {
            "name": "DI29"
        },
        {
            "name": "DI30"
        },
        {
            "name": "DI31"
        },
        {
            "name": "DI32"
        },
        {
            "name": "DI33"
        },
        {
            "name": "DI34"
        },
        {
            "name": "DI35"
        },
        {
            "name": "DI36"
        },
        {
            "name": "DI37"
        },
        {
            "name": "DI38"
        },
        {
            "name": "DI39"
        },
        {
            "name": "DI40"
        },
        {
            "name": "DI41"
        },
        {
            "name": "DI42"
        },
        {
            "name": "DI43"
        },
        {
            "name": "DI44"
        },
        {
            "name": "DI45"
        },
        {
            "name": "DI46"
        },
        {
            "name": "DI47"
        },
        {
            "name": "DI48"
        },
        {
            "name": "DI49"
        },
        {
            "name": "DI50"
        },
        {
            "name": "DI51"
        },
        {
            "name": "DI52"
        },
        {
            "name": "DI53"
        },
        {
            "name": "DI54"
        },
        {
            "name": "DI55"
        },
        {
            "name": "DI56"
        },
        {
            "name": "DI57"
        },
        {
            "name": "DI58"
        },
        {
            "name": "DI59"
        },
        {
            "name": "DI60"
        },
        {
            "name": "DI61"
        },
        {
            "name": "DI62"
        },
        {
            "name": "DI63"
        },
        {
            "name": "DI64"
        },
        {
            "name": "DI65"
        },
        {
            "name": "DI66"
        },
        {
            "name": "DI67"
        },
        {
            "name": "DI68"
        },
        {
            "name": "DI69"
        },
        {
            "name": "DI70"
        },
        {
            "name": "DI71"
        },
        {
            "name": "DI72"
        },
        {
            "name": "DI73"
        },
        {
            "name": "DI74"
        },
        {
            "name": "DI75"
        },
        {
            "name": "DI76"
        },
        {
            "name": "DI77"
        },
        {
            "name": "DI78"
        },
        {
            "name": "DI79"
        },
        {
            "name": "DI80"
        },
        {
            "name": "DI81"
        },
        {
            "name": "DI82"
        },
        {
            "name": "DI83"
        },
        {
            "name": "DI84"
        },
        {
            "name": "DI85"
        },
        {
            "name": "DI86"
        },
        {
            "name": "DI87"
        },
        {
            "name": "DI88"
        },
        {
            "name": "DI89"
        },
        {
            "name": "DI90"
        },
        {
            "name": "DI91"
        },
        {
            "name": "DI92"
        },
        {
            "name": "DI93"
        },
        {
            "name": "DI94"
        },
        {
            "name": "DI95"
        },
        {
            "name": "DI96"
        },
        {
            "name": "DI97"
        },
        {
            "name": "DI98"
        },
        {
            "name": "DI99"
        },
        {
            "name": "DI100"
        },
        {
            "name": "DI101"
        },
        {
            "name": "DI102"
        },
        {
            "name": "DI103"
        },
        {
            "name": "DI104"
        },
        {
            "name": "DI105"
        },
        {
            "name": "DI106"
        },
        {
            "name": "DI107"
        },
        {
            "name": "DI108"
        },
        {
            "name": "DI109"
        },
        {
            "name": "DI110"
        },
        {
            "name": "DI111"
        },
        {
            "name": "DI112"
        },
        {
            "name": "DI113"
        },
        {
            "name": "DI114"
        },
        {
            "name": "DI115"
        },
        {
            "name": "DI116"
        },
        {
            "name": "DI117"
        },
        {
            "name": "DI118"
        },
        {
            "name": "DI119"
        },
        {
            "name": "DI120"
        },
        {
            "name": "DI121"
        },
        {
            "name": "DI122"
        },
        {
            "name": "DI123"
        },
        {
            "name": "DI124"
        },
        {
            "name": "DI125"
        },
        {
            "name": "DI126"
        },
        {
            "name": "DI127"
        }
    ];
    $scope.clDOSelected = $scope.clDOArr[0];
    $scope.toolDOSelected = $scope.toolDOArr[0];
    // 获取导航栏对象页面显示
    let tempnNavbar = indexDynamicTags.navbar;
    let frcapConfigCategoryCount = 0;
    $scope.createFRCapsNavList = function () {
        // 每次进入直接深拷贝原始的导航栏数据，避免改动影响原始数据。
        $scope.navbarObjects = JSON.parse(JSON.stringify(tempnNavbar));
        // 每次进入先清空配置类FRCap计数
        frcapConfigCategoryCount = 0;
        // Linux系统获取FRCap导航栏
        if (g_systemFlag) {
            let getPluginCmd = {
                cmd: "get_plugin_nav",
            };
            dataFactory.getData(getPluginCmd)
                .then((data) => {
                    data.forEach(element => {
                        // 仅在当前插件为应用类时才允许插入辅助应用导航栏，0-配置，1-应用
                        if (element.category == "1") {
                            if ($scope.navbarObjects[3].children.every(item => item.url != element.url)) {
                                let tempNavItem = {
                                    "id": "frcap_plugin",
                                    "name": "",
                                    "icon": "",
                                    "url": ""
                                };
                                tempNavItem.name = element.name;
                                tempNavItem.url = `#/frcap-app/${element.url.split('/')[4]}`;
                                $scope.navbarObjects[3].children.push(tempNavItem);
                            }
                        } else if (element.category == "0") {
                            frcapConfigCategoryCount += 1;
                        }
                    });
                    getAccountInfo();
                },(status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[64]);
                    getAccountInfo();
                });
        // QNX系统没有FRCap功能
        } else {
            getAccountInfo();
        }
    };
    // 获取变量对象
    $scope.consArray = indexDynamicTags.var_object.consArray;
    $scope.modeArray = indexDynamicTags.var_object.modeArray;
    $scope.setTPDLocation = indexDynamicTags.var_object.setTPDLocation;
    $scope.FTReferenceCoordData = indexDynamicTags.var_object.FTReferenceCoordData;
    $scope.selectedFTCoord = {
        x: null,
        y: null,
        z: null,
        rx: null,
        ry: null,
        rz: null
    };
    $scope.TPDCfgDI = indexDynamicTags.var_object.TPDCfgDI;
    $scope.TPDCfgDO = indexDynamicTags.var_object.TPDCfgDO;
    referenceCoord = indexDynamicTags.var_object.referenceCoord;
    $scope.torqueIOList = indexDynamicTags.var_object.torqueIOList;
    torqueSysUnitList = indexDynamicTags.var_object.torqueSysUnitList;
    torqueSysControlModeList = indexDynamicTags.var_object.torqueSysControlModeList;
    torqueSysWorkingStatusList = indexDynamicTags.var_object.torqueSysWorkingStatusList;
    torqueSysLockResultList = indexDynamicTags.var_object.torqueSysLockResultList;
    $scope.ZeroModeData = indexDynamicTags.var_object.ZeroModeData;
    $scope.polishModeData = indexDynamicTags.var_object.polishMode; //打磨设备控制模式
    $scope.shoulderModeData = indexDynamicTags.var_object.shoulderModeData; //机器人肩配置
    $scope.elbowModeData = indexDynamicTags.var_object.elbowModeData; //机器人肘配置
    $scope.wristModeData = indexDynamicTags.var_object.wristModeData; //机器人腕配置
    $scope.controllerProtocolModeData = indexDynamicTags.var_object.controllerProtocolModeData; //控制器从站协议
    $scope.toolTypeData = langJsonData.robot_setting.var_object.toolTypeData;
    $scope.mountingLocationData = langJsonData.robot_setting.var_object.mountingLocationData;
    $scope.DOCfgData = langJsonData.robot_setting.var_object.DOCfgData;
    $scope.DICfgData = langJsonData.robot_setting.var_object.DICfgData;
    $scope.EndDICfgData = langJsonData.robot_setting.var_object.EndDICfgData;
    
    /* 初始化 */
    // 机器人型号字典表
    $scope.robotModelUrlDict = {
        "1": "./data/cobots/urdf/fr3_robot.urdf",    // FR3 V5.0
        "2": "./data/cobots/urdf/fr3v6.urdf",        // FR3 V6.0

        "101": "./data/cobots/urdf/fr5_robot.urdf",  // FR5 V4.0
        "102": "./data/cobots/urdf/fr5_robot.urdf",  // FR5 V5.0
        "103": "./data/cobots/urdf/fr5v6.urdf",      // FR5 V6.0

        "201": "./data/cobots/urdf/fr10_robot.urdf", // FR10 V5.0
        "202": "./data/cobots/urdf/fr10v6.urdf",     // FR10 V6.0

        "301": "./data/cobots/urdf/fr16_robot.urdf", // FR16 V5.0
        "302": "./data/cobots/urdf/fr16v6.urdf",     // FR16 V6.0

        "401": "./data/cobots/urdf/fr20_robot.urdf", // FR20 V5.0
        "402": "./data/cobots/urdf/fr20v6.urdf",     // FR20 V6.0

        "501": "./data/cobots/urdf/fr3v6.urdf",      // 暂无模型，FR3 V6.0替代

        "601": "./data/cobots/urdf/fr5v6.urdf",      // 暂无模型，FR3 V6.0替代

        "802": "./data/cobots/urdf/FR5WM.urdf",      // 焊接防护增强系列机器人FR5WM-V6.0

        "901": "./data/cobots/urdf/FR3MT.urdf",      // FR定制机器人
        "902": "./data/cobots/urdf/FR10YD.urdf",     // FR定制机器人

        "1001": "./data/cobots/urdf/fr30v6.urdf",     // FR30 V6.0
    }
    $scope.robotModelDict = [
        {
            rt_index: 1,
            robot_type: "FR3",
            load_range_max: 3,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                },
                {
                    mi_index: 1,
                    mi_name: "001"
                }
            ]
        },
        {
            rt_index: 2,
            robot_type: "FR5",
            load_range_max: 5,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                },
                {
                    mi_index: 1,
                    mi_name: "001"
                },
                {
                    mi_index: 2,
                    mi_name: "002"
                }
            ]
        },
        {
            rt_index: 3,
            robot_type: "FR10",
            load_range_max: 10,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                },
                {
                    mi_index: 1,
                    mi_name: "001"
                }
            ]
        },
        {
            rt_index: 4,
            robot_type: "FR16",
            load_range_max: 16,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                },
                {
                    mi_index: 1,
                    mi_name: "001"
                }
            ]
        },
        {
            rt_index: 5,
            robot_type: "FR20",
            load_range_max: 20,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                },
                {
                    mi_index: 1,
                    mi_name: "001"
                }
            ]
        },
        {
            rt_index: 6,
            robot_type: "ART3",
            load_range_max: 3,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                }
            ]
        },
        {
            rt_index: 7,
            robot_type: "ART5",
            load_range_max: 5,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "000"
                }
            ]
        },
        {
            rt_index: 9,
            robot_type: "FRCustom(8)",
            load_range_max: 5,
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                },
            ],
            minor_ver: [
                {
                    mi_index: 1,
                    mi_name: "001(FR5WM)"
                }
            ]
        },
        {
            rt_index: 10,
            robot_type: "FRCustom(9)",
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                }
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "001(FR3MT)",
                    load_range_max: 5
                },
                {
                    mi_index: 1,
                    mi_name: "001(FR10YD)",
                    load_range_max: 10
                }
            ]
        },
        {
            rt_index: 11,
            robot_type: "FR30",
            major_ver: [
                {
                    ma_index: 1,
                    ma_name: "V01"
                }
            ],
            minor_ver: [
                {
                    mi_index: 0,
                    mi_name: "001",
                    load_range_max: 30
                }
            ]
        }
    ];
    // 机器人模式及连接状态
    $scope.controlMode = 1;
    $scope.modeName = $scope.modeArray[$scope.controlMode].mode_name;
    $scope.connectionStatus = 0;
    $scope.connectionText = $scope.consArray[$scope.connectionStatus];
    // 机器人手动切为自动时，全局速度百分比自动调整为1%功能是否开启
    $scope.vitesseGlobale = '0';
    $scope.globalSpeed = 1;
    // 示教点
    $scope.recordPointsMode = 0;
    $scope.quickRecordPointsName = '';
    $scope.quickRecordPointsState = -1;
    // TPD option
    tpd_record_state = 0;
    // TPD位姿类型
    $scope.selectedTPDLocation = $scope.setTPDLocation[0];
    $scope.selectedTPDDI = $scope.TPDCfgDI[0];
    $scope.selectedTPDDO  = $scope.TPDCfgDO[0];
    // 扩展轴初始化
    $scope.selectedEAxisZeroMode = $scope.ZeroModeData[0];
    // 初始化程序状态
    programStatusDict = {
        0: "Stopped",
        1: "Stopped",
        2: "Running",
        3: "Pause",
        4: "Drag"
    };
    $scope.pointErrorNew = 0;
    $scope.reWeldEnableOpen = 0; //焊接中断再恢复使能
    $scope.protmpstate = 0;//机器人临时运行状态
    $scope.programStatus = programStatusDict[1];
    $scope.currentCoordDis = "Tool1";
    $scope.currentWobjCoordDis = "Wobj1";
    $scope.currentSpeed = "100";
    $scope.speed = $scope.currentSpeed;
    $("#index_speed")[0].value = $scope.speed;
    $scope.currentEAxisCoordDis = "ExAxis1";
    $scope.checkGlobalCoverPoint = 1;
    // 初始化IO状态
    $scope.clDO = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.clDI = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.toolDO = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.toolDI = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.analog_output = [0, 0, 0, 0, 0, 0];
    $scope.analog_input = [0, 0, 0, 0, 0, 0];
    $scope.vir_clDI = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.vir_toolDI = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.vir_analog_input = [0, 0, 0];
    $scope.dragMode = 0;
    $scope.dragModeName = indexDynamicTags.info_messages[20];
    $scope.AuxclDO = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.AuxclDI = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.aux_analog_output = [0, 0, 0, 0];
    $scope.aux_analog_input = [0, 0, 0, 0];
    // 远程控制模式
    $scope.remoteControlMode = 0;
    $scope.profinetErrorData = langJsonData.IOlists.profinetErrorData;
    $scope.fciModeList = indexDynamicTags.var_object.fciModeData;
    $scope.fciFirmList = [
        {
            name: 'HMS',
            id: 1
        },
        {
            name: 'Hilscher',
            id: 2
        }
    ];
    $scope.gSystemFlag = g_systemFlag;
    $scope.createFRCapsNavList();
    getTeachDevice();
    getStatusPageFlag();
    getIOAlias();
    getWObjCoordData();     // 初始化工件坐标系数据
    getEAxisCoordData();    // 初始化外部轴坐标系数据
    index_getToolCoordData();
    getSafecfg();
    getDOcfg();
    getFTcfg();
    getUserFiles();
    getRCMcfg();
    getSysCfg();
    getSmartToolCfg();
    getRobotLock();
    getWebVersion();
    if (g_systemFlag) {
        getSlaveProtocol();
    }
    /* ./初始化 */

    // 获取用户信息
    function getAccountInfo() {
        // 登录成功后，进入index.html页面获取登录的用户信息
        dataFactory.getData({ cmd: "get_account_info" })
            .then((data) => {
                $scope.userID = data.user_id;
                $scope.userName = data.user_name;
                $scope.authorityID = data.auth_id;
                $scope.authorityName = data.auth_name;
                // g_authFlg = data.auth_id;
                getUserAuthData();
                if ($scope.authorityID != '0' && $scope.authorityID != '1') {
                    getRobotParamsRange('1'); //全局安全参数范围设置获取 --如果非管理员和超级管理员则使用管理管理员设定的范围
                } else {
                    getRobotParamsRange($scope.authorityID);
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[0]);
                /* test */
                if (g_testCode) {
                    $scope.authorityID = '0';
                    getUserAuthData();
                    sessionStorage.setItem('controlMode', 1);
                }
                /* ./test */
            });
    }

    /* test */
    let authConfigObject;
    if (g_testCode) {
        authConfigObject = {
            "views": {
                "robot_setting": "1",
                "peripheral_setting": "1",
                "teaching_program": "1",
                "nodegraph_program": "1",
                "graphical_program": "1",
                "node_editor": "1",
                "teaching_management": "1",
                "system_log": "1",
                "status_query": "1",
                "auxiliary_application": "1",
                "welding_library": "1",
                "security_setting": "1",
                "general_setting": "1",
                "account_setting": "1",
                "plugins_setting": "1",
                "custom_info": "1",
                "maintenance_mode": "1"
            },
            "funcs": {
                "state_switch": {
                    "start_stop_pause": "1",
                    "speed_scaling_config": "1",
                    "manual_auto_switch": "1",
                    "drag_switch": "1",
                    "remote_control_switch": "1"
                },
                "robot_operation": {
                    "joint": "1",
                    "base": "1",
                    "tool": "1",
                    "wobj": "1",
                    "move": "1",
                    "eaxis": "1",
                    "io": "1",
                    "tpd": "1",
                    "ft": "1",
                    "rcm": "1",
                    "tp_record": "1",
                    "sp_record": "1",
                    "bcs_display": "1",
                    "tcs_display": "1",
                    "wcs_display": "1",
                    "eacs_display": "1",
                    "trajectory_drawing": "1",
                    "import_tool_model": "1"
                },
                "robot_setting": {
                    "world_coord": "1",
                    "tool_coord": "1",
                    "external_tool_coord": "1",
                    "workpiece_coord": "1",
                    "extended_axis_coord": "1",
                    "free_mount": "1",
                    "fixed_mount": "1",
                    "collision_level": "1",
                    "soft_limit": "1",
                    "end_load": "1",
                    "ft_load": "1",
                    "friction_compensation": "1",
                    "speed_scaling": "1",
                    "io_filtering": "1",
                    "di_config": "1",
                    "do_config": "1",
                    "io_alias": "1",
                    "ai_config": "1",
                    "out_put_reset": "1",
                    "file_import_export": "1"
                },
                "peripheral_setting": {
                    "peripheral_config": "1",
                    "lua_end_protocol_config": "1",
                    "control_protocol_config": "1",
                    "spay_config": "1",
                    "welder_config": "1",
                    "sensor_tracking": "1",
                    "extended_axis": "1",
                    "conveyor_tracking": "1",
                    "track_pose": "1",
                    "torque_sys": "1",
                    "health_sys": "1",
                    "palletizing_sys": "1",
                    "polishing_device": "1",
                    "remote_control": "1"
                },
                "teaching_management": {
                    "import": "1",
                    "export": "1",
                    "modify": "1",
                    "delete": "1"
                },
                "system_log": {
                    "export_log": "1"
                },
                "auxiliary_application": {
                    "robotic_corrention": "1",
                    "encoder_config": "1",
                    "system_upgrade": "1",
                    "data_backup": "1",
                    "ten_data_record": "1",
                    "tp_config": "1",
                    "matrix_move": "1",
                    "starting_point": "1",
                    "inter_zone": "1",
                    "end_led": "1",
                    "custom_protocol": "1",
                    "peripheral_protocol": "1",
                    "main_program": "1",
                    "drag_lock": "1",
                    "smart_tool": "1",
                    "multi_inter_zone": "1"
                },
                "security_setting": {
                    "safe_stop": "1",
                    "safe_speed": "1",
                    "safe_dio": "1",
                    "safe_emergency_stop": "1",
                    "safe_protective_stop": "1",
                    "safe_plane": "1",
                    "safe_daemon": "1",
                    "safe_tooldirection": "1",
                    "safe_robotlimit": "1",
                    "joint_torque_detection": "1",
                },
                "general_setting": {
                    "time_setting": "1",
                    "network_setting": "1",
                    "teach_pendant": "1",
                    "system_lang": "1",
                    "log_manage": "1",
                    "logout_timeout": "1",
                    "system_file_export": "1"
                },
                "account_setting": {
                    "auth_manage": "1",
                    "user_manage": "1"
                },
                "custom_info": {
                    "info_package_upload": "1",
                    "type_name_modify": "1",
                    "teach_program_encryption": "1"
                }
            }
        }
    }    
    /* ./test */

    // 根据用户的职能代号获取对应的职能
    function getUserAuthData() {
        const getAuthorityConfigParams = {
            cmd: "get_auth_config",
            data: {
                auth_id: $scope.authorityID
            }
        };
        dataFactory.getData(getAuthorityConfigParams).then((data) => {
            $scope.userAuthData = data;
            $scope.judgeAuth();
            sessionStorage.setItem('userAuthority', JSON.stringify(data));
            // 刷新浏览器后，更新导航栏的界面
            if (window.location.href.split('#/')[1]) {
                refreshSidebarMenu(window.location.href.split('#/')[1]);
                if (window.location.href.split('#/')[1] == 'programteach') {
                    $scope.setProgramUrdf(true);
                } else {
                    $scope.setProgramUrdf(false);
                }
            }
        }, (status) => {
            toastFactory.error(status, indexDynamicTags.error_messages[0]);
            /* test */
            if (g_testCode) {
                $scope.userAuthData = authConfigObject;
                $scope.judgeAuth();	
                sessionStorage.setItem('userAuthority', JSON.stringify(authConfigObject));
                // 刷新浏览器后，更新导航栏的界面
                if (window.location.href.split('#/')[1]) {
                    refreshSidebarMenu(window.location.href.split('#/')[1]);
                    if (window.location.href.split('#/')[1] == 'programteach') {
                        $scope.setProgramUrdf(true)
                    } else {
                        $scope.setProgramUrdf(false)
                    }
                }
            }
            /* ./test */
        });
    }

    /**
     * 导航栏选项依据权限展示
     * @param {strubg} type 导航栏类型
     * @param {object} nav 导航栏选项对象
     * @returns True || False
     */
    $scope.navAuthShow = function (type, nav) {
        let authShow;

        if ($scope.userAuthData != undefined) {
            if (nav.hasOwnProperty('children')) {
                if (nav.children.length == 0) {
                    authShow = (nav.id && $scope.userAuthData.funcs[type][nav.id] == '1') || !nav.id;
                } else {
                    authShow = false;
                    for (let i = 0; i < nav.children.length; i++) {
                        if ($scope.userAuthData.funcs[type][nav.children[i].id] == '1') {
                            authShow = true;
                        }
                    }
                }
            } else {
                authShow = (nav.id && $scope.userAuthData.funcs[type][nav.id] == '1') || !nav.id;
            }
    
            return authShow;
        }
    }

    // 机器人三维操作的权限key
    $scope.robotObjectKey = ['base', 'tool', 'wobj', 'joint', 'move'];
    $scope.robotObjectIndex = [];
    // 机器人配套功能的权限key
    $scope.robotSupportKey = ['tp_record ', 'sp_record ', 'io', 'tpd', 'eaxis', 'ft', 'rcm'];
    $scope.robotSupportIndex = [];
    // 判断是否有权限
    $scope.judgeAuth = function() {
        if (g_systemFlag == 0) {
            $scope.userAuthData.funcs.peripheral_setting.remote_control = '0';
        }
        $scope.navbarObjects.forEach(item => {
            item.children = item.children.filter(element => element.id == "frcap_plugin" || (element.id == "frcap" && frcapConfigCategoryCount && g_systemFlag) || $scope.userAuthData.views[element.id] == '1');
        })
        $scope.stateSwitchAuth = $scope.userAuthData.funcs.state_switch;
        $scope.robotOperationAuth = $scope.userAuthData.funcs.robot_operation;
        $scope.robotObjectKey.forEach((item, index) => {
            if ($scope.userAuthData.funcs.robot_operation[item] == '1') {
                $scope.robotObjectIndex.push(index);
            }
        })
        $scope.robotSupportKey.forEach((item, index) => {
            if ($scope.userAuthData.funcs.robot_operation[item] == '1') {
                $scope.robotSupportIndex.push(index);
            }
        })
    }

    // 页面路由刷新完成
    $scope.$on('$locationChangeSuccess', function() {
        // 导航栏关闭再打开，高亮当前页面背景色
        gobackItemNavbar($location.path().split('/')[1]);
    })

    /* 导航栏关闭再打开，高亮当前页面背景色 */
    $scope.openNavbar = function() {
        gobackItemNavbar(window.location.href.split('#/')[1]);
    }

    //获取Smart Tool配置文件
    function getSmartToolCfg() {
        let getSmartToolCfgCmd = {
            cmd: "get_Smart_Tool_function",
        };
        dataFactory.getData(getSmartToolCfgCmd)
            .then((data) => {
                var smartArr = eval(data.smart_tool_cfg.cfg);
                $scope.index_smartArr = smartArr;
                $scope.index_smartArr_count = parseInt(data.smart_tool_cfg.p_index);
            }, (status) => {

                //toastFactory.error(status, auxsDynamicTags.error_messages[5]);
            });
    }

    

    /**
     * 获取示教器是否启用
     */
    function getTeachDevice() {
        let cmdContent = {
            cmd: "get_PI_cfg"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                if (data.enable == 1) {
                    g_teachPendantEnableFlg = 1;
                } else {
                    g_teachPendantEnableFlg = 0;
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 加载页面载入进度 */
    document.addEventListener("load-percentage", e => {
        $("#loadPercentage").text(e.detail);
    });

    /* 嘉宝扭矩系统状态展示页 */
    let time;
    /* 展示系统时间 */
    function displayTime() {
        time = new Date();
        $("#tsTime").text(time.toLocaleString());
        $("#kysTime").text(time.toLocaleString());
        $("#psTime").text(time.toLocaleString());
    }
    setInterval(displayTime, 1000);

    /* 嘉宝状态页面进入扭矩设置 */
    $scope.entryWebAPP = function () {
        refreshSidebarMenu('peripheral');
        // 管理员和程序员可以进入扭矩配置
        $("#torqueStatusPage").hide();
        // 扭矩系统状态展示页面一键直达设置
        let id = setTimeout(() => {
            if (document.getElementById('peripheral') != null) {
                document.getElementById('peripheral').dispatchEvent(new CustomEvent('open_torque_setting', { bubbles: true, cancelable: true, composed: true }));
            }
            clearTimeout(id);
        }, 1000);
    }

    /* 康养状态页面进入康养设置 */
    $scope.kangyangEntryWebAPP = function () {
        refreshSidebarMenu('peripheral');
        $("#kangyangStatusPage").hide();
        let id = setTimeout(() => {
            if (document.getElementById('peripheral') != null) {
                document.getElementById('peripheral').dispatchEvent(new CustomEvent('open_kangyang_setting', { bubbles: true, cancelable: true, composed: true }));
            }
            clearTimeout(id);
        }, 1000);
    }

    /* 码垛状态页面进入码垛设置 */
    $scope.palletizingEntryWebAPP = function () {
        refreshSidebarMenu('peripheral');
        $("#palletizingStatusPage").hide();
        let id = setTimeout(() => {
            if (document.getElementById('peripheral') != null) {
                document.getElementById('peripheral').dispatchEvent(new CustomEvent('open_palletizing_setting', { bubbles: true, cancelable: true, composed: true }));
            }
            clearTimeout(id);
        }, 1000);
        clearTimeout(layer_time);
        $scope.selectedPalletizingProgram = {};
    }

    /* 退出远程模式 */
    $scope.remoteControlEntryWebAPP = function () {
        refreshSidebarMenu('peripheral');
        $scope.remoteControlSwitch(0);
    }

    /* 码垛监控页监听 */
    document.addEventListener('open-palletizing-monitor', () => {
        // 遍历所有userData选出码垛示教程序
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                let programNameList = Object.keys(data);
                $scope.palletizingProgramList = [];
                for (let i = 0; i < programNameList.length; i++) {
                    if (programNameList[i].indexOf("palletizing_") != -1) {
                        $scope.palletizingProgramList.push(data[programNameList[i]]);
                    }
                }
            }, (status) => {
                toastFactory.error(status);
            });
    });

    /* 码垛状态监控页面选择码垛示教程序 */
    $scope.selectPalletizingProgram = function (selectedProgram) {
        g_fileNameForUpload = selectedProgram.name;
        g_fileDataForUpload = selectedProgram.pgvalue;
        $scope.loadPalletizingFormula();
        clearTimeout(layer_time);
    }

    /* 清空码垛生产数据 */
    $scope.clearPalletizingProductionInfo = function () {
        let cmdContent = {
            cmd: "clear_palletizing_info",
            data: {}
        };
        dataFactory.actData(cmdContent)
            .then(() => {
                
                let patternCanvasMarch = document.getElementById('canvas');
                let patternCanvasMarchCtx = patternCanvasMarch.getContext('2d');
                patternCanvasMarchCtx.clearRect(0, 0, patternCanvasMarch.clientWidth, patternCanvasMarch.clientHeight);
                patternCanvasMarchCtx.restore();
                let patternCanvas = document.getElementById('palletCanvas');
                let patternCanvasCtx = patternCanvas.getContext('2d');
                patternCanvasCtx.clearRect(0, 0, patternCanvas.clientWidth, patternCanvas.clientHeight);
                patternCanvasCtx.restore();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 清空码垛生产数据 */
    $scope.clearPalletizingWarningInfo = function () {
        $scope.palletizingCurrentErrorList = [];
    }

    /* 创建码垛状态页面错误列表 */
    function createPalletizingErrorList(time, errordata) {
        let errorList = [];
        errordata.forEach(errorInfo => {
            let item = {
                time: time,
                error: errorInfo
            };
            errorList.push(item);
        });
        $scope.palletizingCurrentErrorList = errorList;
    }

    /* 清空左右工位数据 */
    $scope.clearJiabaoTorqueStatusInfo = function (station) {
        let cmdContent = {
            cmd: "clear_product_info",
            data: {
                station: station
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /**码垛监控页面Canvas动态展示 */
    /** 加载码垛配方*/
    let originPattern;
    let originPatternA;
    let originPatternB;
    let patternSequence;
    let monitorLayer;
    let monitorLayerArea;
    let palletPosition; // 码垛位置 1-左工位 2-右工位
    $scope.loadPalletizingFormula = function() {
        let loadFormulaCmd = {
            cmd: "get_palletizing_formula",
            data: {
                name: $scope.selectedPalletizingProgram.name.split('.lua')[0]
            }
        }
        dataFactory.getData(loadFormulaCmd)
            .then((data) => {
                //码垛配方初始位置
                originPatternA = JSON.parse(data.pattern_config.origin_pattern_a);
                originPatternB = JSON.parse(data.pattern_config.origin_pattern_b);
                patternSequence = data.pattern_config.sequence.split(',');
                monitorLayer = data.pattern_config.layers;
                monitorLayerArea = data.pallet_config;
                march();
            
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**码垛层级展示 */
    var canvas = document.getElementById("canvas");
    let layerLength;
    function drawLevel() {
        if (canvas.getContext) {
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            layerLength = 158 / monitorLayer;
            
            for(let i=0; i<monitorLayer; i++) {
                ctx.save();
                ctx.beginPath();
                if (i >= monitorLayer - $scope.palletizingLayerIndex + 1){
                    ctx.fillStyle = "#91C028";
                }
                ctx.strokeStyle = "#c5c0c0"
                ctx.strokeRect(6, 6 + layerLength * i, canvas.clientWidth - 12, layerLength);
                ctx.fillRect(6, 6 + layerLength * i, canvas.clientWidth - 12, layerLength);
                ctx.font = `${24-monitorLayer}px Arial`
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText(monitorLayer - i, (canvas.clientWidth - 12) / 2, 12 + 0.5 * layerLength + layerLength * i);
                ctx.restore();
            }

            let currentLevel = monitorLayer - $scope.palletizingLayerIndex;
            setTimeout(() => {
                ctx.fillStyle = "#91C028";
                ctx.strokeStyle = "#c5c0c0"
                ctx.strokeRect(6, 6 + layerLength * currentLevel, canvas.clientWidth - 12, layerLength);
                ctx.fillRect(6, 6 + layerLength * currentLevel, canvas.clientWidth - 12, layerLength);
                ctx.font = `${24-monitorLayer}px Arial`
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText(monitorLayer - currentLevel, (canvas.clientWidth - 12) / 2, 12 + 0.5 * layerLength + layerLength * currentLevel);
                ctx.restore();
            }, 800);
        }
    }
    
    let layer_time;
    function march() {
        drawLevel();
        drawMonitorBox();
        layer_time = setTimeout(march, 1500);
    }

    /**码垛放置位展示 */
    class monitorPalletPosition {
        /**
         * 码垛模式配置构造函数
         * @param {object} originPattern 初始位置数据
         * @param {object} monitorLayerArea 初始托盘数据
         * @param {object} ctx canvas context（可选）
         */
        constructor(originPattern, monitorLayerArea, ctx) {
            // 画布默认宽为400，高为350
            this.canvasWidth = 400;
            this.canvasHeight = 350;
            this.coe = 0.25;
            this.canvasCoe = 1;
            let canvasDiv = document.getElementById('monitor-pallet').clientWidth;
            if (canvasDiv > 400) {
                this.canvasWidth = 400
                this.canvasHeight = 350;
                this.coe = 0.25;
                this.canvasCoe = 1;
            } else {
                this.canvasWidth = canvasDiv;
                this.canvasCoe = this.canvasWidth / 400;
                this.canvasHeight = 350 * this.canvasCoe;
                this.coe = 0.25 * this.canvasCoe;
            }
            this.originPattern = originPattern;
            this.monitorLayerArea = monitorLayerArea;
            this.layerCanvas = document.getElementById('canvas');
            this.patternCanvas = document.getElementById('palletCanvas');
            this.ctx = ctx || this.patternCanvas.getContext('2d');
            this.palletColor = "#ffff";
            this.boxColor = "#66ccff";
            this.originPoint = {x: 0, y: 0};
            this.layerCanvas.setAttribute('width', this.canvasWidth);
            this.patternCanvas.setAttribute('width', this.canvasWidth);
            this.patternCanvas.setAttribute('height', this.canvasHeight);
        }

        /** 托盘模式区域初始化 */
        init() {
            this.originPoint.x = (this.canvasWidth - this.monitorLayerArea.front * this.coe) / 2;
            this.originPoint.y = (this.canvasHeight - this.monitorLayerArea.side * this.coe) / 2;
            this.drawPallet(this.originPoint.x, this.originPoint.y, this.monitorLayerArea.front * this.coe, this.monitorLayerArea.side * this.coe);       //绘制码垛托盘
        }

        /**
         * 绘制托盘
         * @param {int} x 托盘绘制点x，单位px
         * @param {int} y 托盘绘制点y，单位px
         * @param {int} f 托盘前边长度，单位px
         * @param {int} s 托盘侧边长度，单位px
         */
        drawPallet(x, y, f, s) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#c5c0c0";
            this.ctx.fillStyle = this.palletColor;
            this.ctx.strokeRect(x, y, f, s);
            this.ctx.fillRect(x, y, f, s);
            this.ctx.restore();
        }

        /**
         * 绘制工件方块
         * @param {object} boxx 工件方块绘制点x，单位px
         * @param {int} x 工件方块绘制点x，单位px
         * @param {int} y 工件方块绘制点y，单位px
         * @param {int} fl 工件方块平行托盘前边长度，单位px
         * @param {int} sw 工件方块平行托盘侧边宽度，单位px
         */
        drawBox(box, color) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#c5c0c0";
            this.ctx.fillStyle = color || this.boxColor;
            this.ctx.strokeRect(box.x, box.y, box.fl, box.sw);
            this.ctx.fillRect(box.x, box.y, box.fl, box.sw);
            this.ctx.restore();
        }

        /** BoxsGroup状态改变时重新绘制 */
        redraw() {
            // 清空画布
            this.ctx.save();
            this.ctx.clearRect(0, 0, 400, 350);
            this.ctx.restore();
        }

        /**
         * 根据右工位canvas镜像计算左工位方块的原始点位数据
         * @param {array} rightArray 右工位原始点位数据
         * @returns 
         */
        createPatternLeftPoint(rightArray) {
            let leftArray = [];
            rightArray.forEach(item => {
                leftArray.push({
                    fl: item.fl * this.canvasCoe,
                    index: item.index,
                    isRotated: item.isRotated,
                    sw: item.sw * this.canvasCoe,
                    type: item.type,
                    x: palletPosition == 1 ? (this.canvasWidth/2 + (this.canvasWidth/2 - item.x) -item.fl) * this.canvasCoe : item.x * this.canvasCoe,
                    y: item.y * this.canvasCoe
                })
            });
            return leftArray;
        }
    }

    /**码垛每层码垛放置位置展示 */
    function drawMonitorBox() {
        if ($scope.palletizingLayerIndex == 0) return;
        if (patternSequence[$scope.palletizingLayerIndex - 1] == 'A') {
            originPattern = originPatternA
        } else {
            originPattern = originPatternB
        }
        let patternEditCanvas = new monitorPalletPosition(
            originPattern,
            monitorLayerArea
        );
        //绘制码垛托盘
        patternEditCanvas.init();
        // 处理原始点位数据，左工位时（palletPosition == 1），点位数据x需要改变；右工位不需要改变。
        originPattern = patternEditCanvas.createPatternLeftPoint(originPattern);
        
        originPattern.forEach((item, i) => {
            if (i < $scope.palletizingBoxIndex - 1) {
                patternEditCanvas.drawBox(item, "#91C028");     
            } else {
                patternEditCanvas.drawBox(item, "#fff");
            }
            if (i == $scope.palletizingBoxIndex - 1) {
                setTimeout(() => {
                    patternEditCanvas.drawBox(item, "#91C028");
                }, 800);
            }
        })
    }
    /** ./ 码垛监控页面Canvas动态展示 */

    /*获取远程控制通讯参数 */
    function getRobotFCIMode() {
        let getFCIModeCmd = {
            cmd: 815,
            data: {
                content: "RCIGetComParam()",
            }
        };
        dataFactory.setData(getFCIModeCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    if (g_systemFlag == 1) {
        document.addEventListener('815', e => {
            const fciResult = e.detail.split(',');
            $scope.fciMode = $scope.fciModeList.find(item => item.id == fciResult[0]);
            if (fciResult[0] == 1) {
                $scope.fciPort = fciResult[1];
            }
            if (fciResult[0] == 2) {
                $scope.fciFirm = $scope.fciFirmList.find(item => item.id == fciResult[2]);
                $scope.fciPeriod = fciResult[1];
            }
        })
    }
    /** ./获取远程控制通讯参数 */

    /* 嘉宝状态页面错误列表 */
    function createJiabaoErrorList(time, errordata) {
        let jiabaoErrorList = [];
        errordata.forEach(errorInfo => {
            let item = {
                time: time,
                error: errorInfo
            };
            jiabaoErrorList.push(item);
        });
        $scope.tsCurrentErrorList = jiabaoErrorList;
    }

    /* 获取IO别名 */
    function getIOAlias() {
        let cmdContent = {
            cmd: "get_DIO_cfg",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.DIAliasListForDisplay = data.DI;
                $scope.DOAliasListForDisplay = data.DO;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 更新嘉宝状态页数据
    document.addEventListener('update_torque_status_data', () => {
        getIOAlias();
    });

    /* 获取系统状态页面标志位 */
    function getStatusPageFlag() {
        let cmdContent = {
            cmd: "get_status_flag",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                if (data.page_flag == 3) {
                    $("#palletizingStatusPage").show();
                    document.dispatchEvent(new CustomEvent('open-palletizing-monitor', { bubbles: true, cancelable: true, composed: true}));
                } else if (data.page_flag == 2) {
                    $("#kangyangStatusPage").show();
                } else if (data.page_flag == 1) {
                    $("#torqueStatusPage").show();
                } else {
                    $("#torqueStatusPage").hide();
                    $("#kangyangStatusPage").hide();
                    $("#palletizingStatusPage").hide();
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 使用stopPropagation方法来阻止click事件的向下传播，阻止dropdown-menu点击后消失
    $('[data-stopPropagation]').on('click', function (e) {
        e.stopPropagation();
    });

    /* 机器人型号出厂配置 */
    //去使能
    $scope.enableRobot = function () {
        var enableString = "RobotEnable(0)";
        let enableCmd = {
            cmd: 302,
            data: {
                content: enableString,
            },
        };
        dataFactory.setData(enableCmd)
            .then(() => {
                g_robotEnableFlg = 1;
                $('#enableRobotModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取当前机器人型号数据 */
    function getCurrentRobotType() {
        let cmdContent = {
            cmd: "get_robot_type"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                // 判断robot_type参数值决定是进行出厂设置还是开始加载模型
                if (data.type == 0) {
                    // 隐藏主页机器人三维模型加载动画
                    removeIndexLoading();
                    // 显示机器人型号出厂配置对话框
                    $("#robotTypeSetting").show();
                } else {
                    // 显示主页机器人三维模型加载动画
                    loadIndexLoading();
                    // 隐藏机器人型号出厂配置对话框
                    $("#robotTypeSetting").hide();
                    // 机器人模型初始化
                    g_robotType = data;
                    g_robotTypeCode = 100 * (data.type - 1) + 10 * (data.major_ver - 1) + (data.minor_ver + 1);
                    viewer.real = $scope.robotModelUrlDict[g_robotTypeCode];
                    // viewer.virtual = $scope.robotModelUrlDict[g_robotTypeCode];
                }
                // 机器人基坐标系初始化
                viewer.displayCoordinateSystem(0);
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    let data = {
                        type: 11,
                        major_ver: 1,
                        minor_ver: 0
                    };
                    // 判断robot_type参数值决定是进行出厂设置还是开始加载模型
                    if (data.type == 0) {
                        // 隐藏主页机器人三维模型加载动画
                        removeIndexLoading();
                        // 显示机器人型号出厂配置对话框
                        $("#robotTypeSetting").show();
                    } else {
                        // 显示主页机器人三维模型加载动画
                        loadIndexLoading();
                        // 隐藏机器人型号出厂配置对话框
                        $("#robotTypeSetting").hide();
                        // 机器人模型初始化
                        g_robotType = data;
                        g_robotTypeCode = 100 * (data.type - 1) + 10 * (data.major_ver - 1) + (data.minor_ver + 1);
                        console.log(g_robotTypeCode, $scope.robotModelUrlDict[g_robotTypeCode]);
                        viewer.real = $scope.robotModelUrlDict[g_robotTypeCode];
                        // viewer.virtual = $scope.robotModelUrlDict[g_robotTypeCode];
                    }
                    viewer.displayCoordinateSystem(0);      // 机器人基坐标系初始化
                }
                /* ./test */
            });
    }

    /* 设置机器人型号数据 */
    $scope.setRobotType = function () {
        if (g_robotEnableFlg != 1) {
            toastFactory.info(indexDynamicTags.info_messages[0]);
        } else if ($scope.pwdForRTS == undefined || $scope.pwdForRTS == "") {
            toastFactory.info(indexDynamicTags.info_messages[1]);
        } else if ($scope.selectedRobotType == undefined) {
            toastFactory.info(indexDynamicTags.info_messages[2]);
        } else if ($scope.selectedMajorVer == undefined) {
            toastFactory.info(indexDynamicTags.info_messages[3]);
        } else if ($scope.selectedMinorVer == undefined) {
            toastFactory.info(indexDynamicTags.info_messages[4]);
        } else {
            let cmdContent = {
                cmd: 425,
                data: {
                    pwd: $scope.pwdForRTS,
                    content: {
                        type: $scope.selectedRobotType.rt_index,
                        major_ver: $scope.selectedMajorVer.ma_index,
                        minor_ver: $scope.selectedMinorVer.mi_index,
                    }
                }
            };
            dataFactory.setData(cmdContent)
                .then((data) => {
                    
                    if (data == "success") {
                        saveRobotType();
                    } else if (data == "pwd_error") {
                        toastFactory.error(403, indexDynamicTags.error_messages[2]);
                    }
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 保存机器人型号数据至WebAPP后台 */
    function saveRobotType() {
        $scope.showConfiguringInfo = true;
        let loadRangeMax = 0;
        if ($scope.selectedRobotType.rt_index == 10) {
            loadRangeMax = $scope.selectedMinorVer.load_range_max;
        } else {
            loadRangeMax = $scope.selectedRobotType.load_range_max;
        }
        let cmdContent = {
            cmd: "save_robot_type",
            data: {
                type: $scope.selectedRobotType.rt_index,
                major_ver: $scope.selectedMajorVer.ma_index,
                minor_ver: $scope.selectedMinorVer.mi_index,
                load_range_max: loadRangeMax
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                $scope.showConfiguringInfo = false;
                alert(indexDynamicTags.success_messages[0]);
            }, (status) => {
                $scope.showConfiguringInfo = false;
                toastFactory.error(status);
            });
    }
    /* ./机器人型号出厂配置 */

    // 获取当前时间
    function getTimeNow() {
        let now = new Date();
        return now.getTime();
    }

    let refreshTimeStart;
    window.onbeforeunload = function () {
        // 获取onbeforeunload时间戳，作为刷新和关闭页面的开始时间
        refreshTimeStart = getTimeNow();
    }

    // 刷新时向后台发送刷新命令阻止后台清除session
    window.onunload = function () {
        // 获取onunload时间戳，作为刷新或者关闭页面的结束时间
        let refreshTimeEnd = getTimeNow();
        // 当开始时间和结束时间差大于5ms时，则认为浏览器在执行刷新操作
        // 认为刷新操作时向后台发送refresh指令使得后台清除超时定时器，以防止清除sessionID
        if (refreshTimeEnd - refreshTimeStart > 5) {
            let refreshCmd = {
                cmd: "refresh"
            };
            $.ajax({
                url: 'action/sta',
                type: 'POST',
                data: JSON.stringify(refreshCmd),
                async: true,
                contentType: 'application/json',
                dataType: 'json'
            })
        }
    };

    // 注册urdf-viewer自定义元素
    if (customElements.get('urdf-viewer') !== undefined) {
        console.log("customElements:urdf-viewer already exists!");
    } else {
        customElements.define('urdf-viewer', URDFManipulator);
        console.log("customElements:urdf-viewer is created!");
    }

    // 三维虚拟机器人相关数据初始化
    var viewer = document.querySelector('urdf-viewer');
    // const limitsToggle = document.getElementById('ignore-joint-limits');
    // const upSelect = document.getElementById('up-select');
    const sliderList = document.querySelector('#robot-setting-info ul.slider-list');
    // const controlsel = document.getElementById('controls');
    // const controlsToggle = document.getElementById('toggle-controls');
    const DEG2RAD = Math.PI / 180;
    const RAD2DEG = 1 / DEG2RAD;
    let sliders = {};
    let joints = {};
    let moveJ_data = {};

    // 获取机器人配置文件初始化
    function getRobotcfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg"
        };

        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                document.dispatchEvent(new CustomEvent('mounting-changed', { bubbles: true, cancelable: true, composed: true, detail: data.install_pos }));
                document.dispatchEvent(new CustomEvent('jointslimit-update', { bubbles: true, cancelable: true, composed: true, detail: data }));
                // 机器人型号文字展示
                $scope.stiffnessText = langJsonData.system_setting.var_object.stiffnessList[~~data.fric_jointstiffnesstype].name;
                $scope.robotTypeText = getRobotTypeText(data.robot_type);
            }, (status) => {
                $scope.stiffnessText = '';
                $scope.robotTypeText = '';
                toastFactory.error(status, indexDynamicTags.error_messages[3]);
                /* test */
                // const data = {
                //     robot_type: '1001.0000000000',
                //     fric_jointstiffnesstype: '1.00000'
                // }
                // $scope.stiffnessText = langJsonData.system_setting.var_object.stiffnessList[~~data.fric_jointstiffnesstype].name;
                // $scope.robotTypeText = getRobotTypeText(data.robot_type);
                /* ./test */
            });
    }

    // 获取当前机器人安装方式角度(初始化)
    function getFreeMountingAngle () {
        var getString = "GetRobotInstallAngle()";
        let getCmd = {
            cmd: 639,
            data: {
                content:getString,
            },
        };
        dataFactory.setData(getCmd)
            .then(() => {
                // 639指令状态反馈
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.addEventListener('639', e => {
        $scope.curYAngle = parseFloat(JSON.parse(e.detail).yangle);
        $scope.curZAngle = parseFloat(JSON.parse(e.detail).zangle);
        lastYAngle = $scope.curYAngle;
        lastZAngle = $scope.curZAngle;
        $scope.yAngle = $scope.curYAngle;
        $scope.zAngle = $scope.curZAngle;
        if (!modifyFlg) {
            viewer.changeFreeMounting($scope.curYAngle, $scope.curZAngle);
        }
        modifyFlg = 0;
    });

    // 修改三维模型机器人安装方式
    let mountingTypeID;
    document.addEventListener('mounting-changed', e => {
        mountingTypeID = e.detail;
        if (mountingTypeID == 3) {
            getFreeMountingAngle();
        } else {
            viewer.resetFreeMounting(lastYAngle, lastZAngle);
            viewer.changeFixedMounting(mountingTypeID);
        }
    });

    // Global Functions
    window.setColor = color => {

        document.body.style.backgroundColor = color;
        viewer.highlightColor = '#' + (new THREE.Color(0xffffff)).lerp(new THREE.Color(color), 0.35).getHexString();

    };

    // Events
    // controlsToggle.addEventListener('click', () => controlsel.classList.toggle('hidden'));

    // viewer.addEventListener('angle-change', e => {

    //     if (sliders[e.detail]) sliders[e.detail].update();

    // });

    viewer.addEventListener('virtual-angle-change', e => {

        if (sliders[e.detail]) sliders[e.detail].update();

    });

    viewer.addEventListener('joint-mouseover', e => {

        const j = document.querySelector(`li[joint-name="${e.detail}"]`);
        if (j) j.setAttribute('robot-hovered', true);

    });

    viewer.addEventListener('joint-mouseout', e => {

        const j = document.querySelector(`li[joint-name="${e.detail}"]`);
        if (j) j.removeAttribute('robot-hovered');

    });

    let originalNoAutoRecenter;
    viewer.addEventListener('manipulate-start', e => {

        const j = document.querySelector(`li[joint-name="${e.detail}"]`);
        if (j) {
            j.scrollIntoView({ block: 'nearest' });
            window.scrollTo(0, 0);
        }

        originalNoAutoRecenter = viewer.noAutoRecenter;
        viewer.noAutoRecenter = true;

    });

    viewer.addEventListener('manipulate-end', e => {

        viewer.noAutoRecenter = originalNoAutoRecenter;

    });
    // create the sliders
    viewer.addEventListener('urdf-processed', () => {

        // 模型加载完毕之后移除加载动画
        removeIndexLoading();
        // 获取机器人配置
        getRobotcfg();

        const vr = viewer.virtualRobot;

        Object
            .keys(vr.joints)

            .sort((a, b) => {
                const da = a.split(/[^\d]+/g).filter(v => !!v).pop();
                const db = b.split(/[^\d]+/g).filter(v => !!v).pop();

                if (da !== undefined && db !== undefined) {
                    const delta = parseFloat(da) - parseFloat(db);
                    if (delta !== 0) return delta;
                }

                if (a > b) return 1;
                if (b > a) return -1;
                return 0;

            })
            .map(key => vr.joints[key])
            .forEach(joint => {

                /* create li element for each joint */
                const li = document.createElement('li');
                li.style.height = "30px";
                li.innerHTML =
                    `
				<span name="joint-title" title="${joint.name}" style="display: inline-block;">${joint.name}</span>
				<input name="${joint.name}" type="range" class="ne-range multi-move" value="0" step="0.01"/>
				<input type="text" name="jointNum"/>
				`;

                li.setAttribute('joint-type', joint.jointType);
                li.setAttribute('joint-name', joint.name);

                sliderList.appendChild(li);
                /* end */


                // update the joint display
                const jointTitle = li.querySelector('span[name="joint-title"]');
                const slider = li.querySelector('input[type="range"]');
                const input = li.querySelector('input[name="jointNum"]');
                li.update = () => {

                    let degVal = joint.angle;

                    if (joint.jointType === 'revolute' || joint.jointType === 'continuous') {
                        degVal *= RAD2DEG;
                        degVal = degVal.toFixed(3);
                    }

                    // if (Math.abs(degVal) > 1) {
                    // 	degVal = degVal.toFixed(3);
                    // } else {
                    // 	degVal = degVal.toPrecision(2);
                    // }

                    input.value = parseFloat(degVal);
                    joints[joint.name] = input.value;
                    // directly input the value
                    slider.value = joint.angle;


                    // if (viewer.ignoreLimits || joint.jointType === 'continuous') {
                    // 	slider.min = -6.28;
                    // 	slider.max = 6.28;

                    // 	input.min = -6.28 * RAD2DEG;
                    // 	input.max = 6.28 * RAD2DEG;
                    // } else {
                    // 	// slider.min = joint.limit.lower;
                    // 	// slider.max = joint.limit.upper;

                    // 	input.min = -joint.limit.lower * RAD2DEG;
                    // 	input.max = joint.limit.lower * RAD2DEG;
                    // }
                };

                switch (joint.jointType) {

                    case 'continuous':
                    case 'prismatic':
                    case 'revolute':
                        break;
                    default:
                        li.update = () => { };
                        jointTitle.remove();
                        input.remove();
                        slider.remove();
                        li.remove();

                }

                slider.addEventListener('input', () => {
                    viewer.setVirtualAngle(joint.name, slider.value);
                    li.update();
                });

                input.addEventListener('change', () => {
                    viewer.setVirtualAngle(joint.name, input.value * DEG2RAD);
                    li.update();
                });

                li.update();

                sliders[joint.name] = li;

            });
    });

    document.addEventListener('WebComponentsReady', () => {

        viewer.loadMeshFunc = (path, manager, done) => {

            new THREE.ModelLoader(manager).load(path, res => done(res.model), null, err => done(null, err));

        };

    });

    // 虚拟机器人参数
    let virtualFlg = 1;       // 虚拟机器人是否跟随实际位置运行，0-不跟随，1-跟随
    let virtualJoints = {};   // 目标关节位置（虚拟机器人位置）
    let deviation = 1;        // 目标关节位置和实际关节位置偏差值

    /* 页面加载模型参数 */
    const color = "#ffffff";
    // const urdf = "./data/cobots/urdf/fr5_robot.urdf";
    getCurrentRobotType();
    viewer.up = "+Z";
    // viewer.urdf = urdf;
    setColor(color);
    /* 页面加载模型参数 */

    // 全局加载动画移除
    function removeIndexLoading() {
        $("#indexLoading").addClass('ng-hide');
    }
    // 全局加载动画加载
    function loadIndexLoading() {
        $("#indexLoading").removeClass('ng-hide');
    }
    // 急停动画移除
    $("#carshstop").click(function () {
        var mychar = document.getElementById("carshstop");
        mychar.style.display = "none";
    });

    //调试标志位
    $scope.debug_flag = 1;

    // 控制区部分参数
    $scope.velocity = "100";
    $scope.acceleration = "180"
    $scope.pointName = "";
    $scope.bindpointName = "";
    window.entireQueryStatus = 0;

    var apply_joint_flag = 0;
    $scope.applyJoints = function () {
        if ("1" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else if (joints.j5 <= 0.01 && joints.j5 >= -0.01) {
            toastFactory.warning(indexDynamicTags.warning_messages[1]);
        } else {
            let clacTCFCmd = {
                "cmd": 320,
                "data": joints,
            }
            dataFactory.setData(clacTCFCmd)
                .then(() => {
                    virtualFlg = 0;
                    virtualJoints = joints;
                    apply_joint_flag = 1;
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[4]);
                })
        }
    }

    document.addEventListener('320', e => {
        if (apply_joint_flag) {
            apply_joint_flag = 0;
            moveJ_data["joints"] = joints;
            moveJ_data["tcf"] = JSON.parse(e.detail);
            moveJ_data["speed"] = $scope.speed.toString();
            moveJ_data["acc"] = $scope.acceleration;
            moveJ_data["ovl"] = "50"; // 50-150
            let JointsCmd = {
                cmd: 201,
                data: moveJ_data
            };
            dataFactory.setData(JointsCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[5]);
                })
        }
    })


    /* 笛卡尔点位移动 */
    // 移动还原
    var updatedescartesFlg;
    $scope.restoreDescartesJoints = function () {
        updatedescartesFlg = 1;
    };

    // 笛卡尔计算关节
    $scope.computeJoint = function () {
        if ("1" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else {
            let clacJointCmd = {
                "cmd": 325,
                "data": {
                    content: "TCFToJoint(" + $scope.moveDescartesJoint.j1 + "," + $scope.moveDescartesJoint.j2 + "," + $scope.moveDescartesJoint.j3 + "," + $scope.moveDescartesJoint.j4
                        + "," + $scope.moveDescartesJoint.j5 + "," + $scope.moveDescartesJoint.j6 + "," + $scope.moveDescartesTcp.x + "," + $scope.moveDescartesTcp.y
                        + "," + $scope.moveDescartesTcp.z + "," + $scope.moveDescartesTcp.rx + "," + $scope.moveDescartesTcp.ry
                        + "," + $scope.moveDescartesTcp.rz + "," + $scope.currentCoord + "," + $scope.currentWobjCoord + "," + $scope.exAxisPos[0]
                        + "," + $scope.exAxisPos[1] + "," + $scope.exAxisPos[2] + "," + $scope.exAxisPos[3] + ")",
                }
            }
            dataFactory.setData(clacJointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[4]);
                })
        }
    }

    document.addEventListener('325', e => {
        $scope.moveDescartesJoint = JSON.parse(e.detail);
        $scope.moveDescartesJoint = {
            "j1": parseFloat($scope.moveDescartesJoint.j1).toFixed(3),
            "j2": parseFloat($scope.moveDescartesJoint.j2).toFixed(3),
            "j3": parseFloat($scope.moveDescartesJoint.j3).toFixed(3),
            "j4": parseFloat($scope.moveDescartesJoint.j4).toFixed(3),
            "j5": parseFloat($scope.moveDescartesJoint.j5).toFixed(3),
            "j6": parseFloat($scope.moveDescartesJoint.j6).toFixed(3)
        }
        for (const name in $scope.moveDescartesJoint) {
            viewer.setVirtualAngle(name, $scope.moveDescartesJoint[name] * DEG2RAD);
        }
    })

    // 移动至该点
    $scope.moveToDescartesPoint = function () {
        if ("1" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else {
            moveJ_data["joints"] = {
                "j1": $scope.moveDescartesJoint.j1 + "",
                "j2": $scope.moveDescartesJoint.j2 + "",
                "j3": $scope.moveDescartesJoint.j3 + "",
                "j4": $scope.moveDescartesJoint.j4 + "",
                "j5": $scope.moveDescartesJoint.j5 + "",
                "j6": $scope.moveDescartesJoint.j6 + "",
            }
            moveJ_data["tcf"] = {
                "x": $scope.moveDescartesTcp.x + "",
                "y": $scope.moveDescartesTcp.y + "",
                "z": $scope.moveDescartesTcp.z + "",
                "rx": $scope.moveDescartesTcp.rx + "",
                "ry": $scope.moveDescartesTcp.ry + "",
                "rz": $scope.moveDescartesTcp.rz + ""
            };
            moveJ_data["speed"] = $scope.speed.toString();
            moveJ_data["acc"] = $scope.acceleration;
            moveJ_data["ovl"] = "50"; // 50-150
            let JointsCmd = {
                cmd: 201,
                data: moveJ_data
            };
            dataFactory.setData(JointsCmd)
                .then(() => {
                    virtualFlg = 0;
                    virtualJoints = moveJ_data["joints"];
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[5]);
                })
        }
    }
    /** 笛卡尔点位移动 */

    //变量显示函数
    $scope.variableValueArr1 = ["n","m","k"];
    $scope.variableValueArr2 = [1,2,5];
    $scope.variableValueArr3 = ["str1","str2"];
    $scope.variableValueArr4 = ["socket1","socket2"];
    $scope.variableValueJson = [];

    function queryKangyangIndex(){
        if ((sessionStorage.getItem("g_kangYangCycleIndex") != null) && (sessionStorage.getItem("g_kangYangCycleIndex") != "")) {
            g_kangYangCycleIndex = JSON.parse(sessionStorage.getItem("g_kangYangCycleIndex"));
        } 
    }
    queryKangyangIndex();
    //变量查询处理函数
    function combineVar(length1,var1,var2,length2,var3,var4){
        $scope.variableValueJson = [];
        $scope.kangyangVariableValueJson = [];
        if(length1>0 || length2>0){
            $scope.show_Var_State = true;
            for(let i=0;i<length1;i++){
                let varNumberArr = {
                    name: var1[i],
                    value: parseFloat(var2[i]).toFixed(3)
                };
                $scope.variableValueJson.push(varNumberArr);
                if(g_kangYangCycleIndex.length >0 && i <= g_kangYangCycleIndex.length){
                    let kangyangVarNumberArr = {
                        name: var1[i],
                        value: parseFloat(var2[i]).toFixed(3),
                        limit: g_kangYangCycleIndex[i]
                    };
                    $scope.kangyangVariableValueJson.push(kangyangVarNumberArr);
                }
            }
            for(let i=0;i<length2;i++){
                let varCharArr = {
                    name: var3[i],
                    value: var4[i]
                };
                $scope.variableValueJson.push(varCharArr);
            }
        }else{

        }
    }

    //使能/去使能机器人
    $scope.index_enableRobot = function (index) {
        // 远程模式下无法操作使能按钮
        if ($scope.remoteControlMode) return;

        if(index == 0){
            if($scope.indexSafeStopMode == 1 && "0" != $scope.controlMode){
                toastFactory.info(indexDynamicTags.info_messages[5]);
                return;
            }
            $('#enableRobotModal').modal();
        }else{
            if (g_systemFlag) {
                $('#enableRobotModal').modal();
            } else {
                toastFactory.info(indexDynamicTags.info_messages[6]);
            }
        }
    };

    /**使能机器人指令 */
    $scope.indexEnableRobot = function(){
        var enableString = "RobotEnable";
        let enableCmd = {
            cmd: 301,
            data: {
                content: enableString,
            },
        };
        dataFactory.setData(enableCmd)
            .then(() => {
                $('#enableRobotModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //运行程序
    $scope.startProgram = function () {
        if ("0" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[2]);
        } else {
            if ("Stopped" == $scope.programStatus) {
                if ($scope.runptnboxflag) {
                    $scope.runptnboxflag = 0;
                    $scope.runProgram();
                } else {
                    //运行程序前程序发生改动,自动触发对应页面保存按钮  g_programChangeFlag  1-示教程序页面 2-图形化编程页面
                    if (g_programChangeFlag == 1) {
                        if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('save-teach-program'));
                        }
                    } else if (g_programChangeFlag == 2) {
                        if (g_graphicalErr){
                            toastFactory.warning(indexDynamicTags.warning_messages[4] + g_graphicalErrString);
                            return;
                         }
                        if (document.getElementById('graphicalProgramming') != null && document.getElementById('graphicalProgramming') != undefined) {
                            document.getElementById('graphicalProgramming').dispatchEvent(new CustomEvent('save-graphical-program'));
                        }
                    }
                    //程序保存前错误,阻止程序运行
                    if (g_programErrorFlag == 1) return;
                    $('#startProgramModal').modal();
                }
            } else {
                toastFactory.info(indexDynamicTags.info_messages[7]);
            };
        };
    };

    //主页面上传文件内容
    $scope.index_uploadProgName = function () {
        // 远程模式下无法操作运行按钮
        if ($scope.remoteControlMode) return;
        if ($scope.stateSwitchAuth.start_stop_pause == '0') {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
            return;
        }
        if (g_programErr == 1){
            toastFactory.warning(indexDynamicTags.warning_messages[4] + g_programErrString);
            return;
        }
        if (g_graphicalErr){
            toastFactory.warning(indexDynamicTags.warning_messages[4] + g_graphicalErrString);
            return;
        }
        if (g_nodeEditorErr){
            toastFactory.warning(indexDynamicTags.warning_messages[4] + g_nodeEditorErrString);
            return;
        }
        if ("Stopped" != $scope.programStatus) {
            toastFactory.info(indexDynamicTags.info_messages[7]);
            return;
        }
        if (g_fileNameForUpload != undefined && g_fileNameForUpload != '' && g_fileNameForUpload != null) {
            // 判断当前程序是否中断
            if ($scope.programRunStatus.status == 1 && $scope.programRunStatus.name == g_fileNameForUpload) {
                $('#continueProgramModal').modal();
            } else {
                g_isRunStepOver = 0;       // 0-程序运行，用于105指令状态反馈判断
                $scope.sendProgramName();
            }
        } else {
            toastFactory.info(indexDynamicTags.info_messages[8]);
        };
    }

    /** 运行机器人示教程序（发送程序名称） */
    $scope.sendProgramName = function() {
        let sendFileNameCmd = {
            cmd: 105,
            data: {
                name: g_fileNameForUpload
            }
        };
        dataFactory.setData(sendFileNameCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[6]);
            });
    }
    document.addEventListener('105', e => {
        if (e.detail == "1") {
            // 示教程序名称上传成功后上传程序内容
            if (g_fileDataForUpload == "") {
                toastFactory.warning(g_fileNameForUpload + indexDynamicTags.warning_messages[5]);
            } else {
                $scope.startProgram();
            };
            //运行程序后，清除单步运行高亮状态
            soFlg = 0;
        } else {
            toastFactory.error(403, indexDynamicTags.error_messages[8]);
        };
    });

    /*程序接续/重新开始(0-重新开始；1-接续执行) */
    $scope.isRestartProgram = function(isRestart) {
        let isRestartCmd = {
            cmd: 'program_interrupt_execute',
            data: {
                flag: isRestart,
            },
        };
        dataFactory.actData(isRestartCmd).then(() => {
            $scope.sendProgramName();
            $('#continueProgramModal').modal('hide');
            }, (status) => {
                if (isRestart == 1) {
                    toastFactory.error(status, indexDynamicTags.error_messages[61]);
                } else {
                    toastFactory.error(status, indexDynamicTags.error_messages[62]);
                }
            });
    }
    /**程序接续/重新开始 */

    /** 示教程序运行指令（101） */
    $scope.runptnboxflag = 0;
    $scope.runProgram = function () {
        // 系统存在报错禁止运行程序
        if (!$scope.errorMessageTotal) {
            $('#startProgramModal').modal('hide');
            let startCmd = {
                cmd: 101,
                data: {},
            };
            dataFactory.setData(startCmd)
                .then(() => {
                    // 清除上一次程序运行轨迹
                    // if (DrawTrackFlg) {
                        clearTrack();
                    // };
                    // 进行当前程序轨迹绘制
                    DrawTrackFlg = true;
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[9]);
                });
        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[26]);
        }
    }

    /**
     * 暂停恢复按钮功能
     * @param {int} type 511-暂停指令弹窗功能权限豁免
     * @returns 
     */
    $scope.pauseResumeProgram = function (type) {
        // 远程模式下无法操作暂停恢复按钮
        if ($scope.remoteControlMode) return;

        if ($scope.stateSwitchAuth.start_stop_pause == '0' && type != '511') {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
            return;
        }
        // 示教程序（机器人）暂停状态执行恢复 || 外部轴（异步模式）3-暂停完成状态执行恢复
        if (("Pause" == $scope.programStatus) || ($scope.exAxisMotionStatus == 3)) {
            let resumeCmd = {
                cmd: 104,
                data: {},
            };
            dataFactory.setData(resumeCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[10]);
                });
        // 示教程序（机器人）运动状态执行暂停 || 外部轴（异步模式）1-运动中状态执行暂停
        } else if (("Running" == $scope.programStatus) || ($scope.exAxisMotionStatus == 1)) {
            let pauseCmd = {
                cmd: 103,
                data: {},
            };
            dataFactory.setData(pauseCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[11]);
                });
        }
    };

    $scope.stopProgram = function () {
        // 远程模式下无法操作停止运行按钮
        if ($scope.remoteControlMode) return;

        if ($scope.stateSwitchAuth.start_stop_pause == '0') {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
            return;
        }
        let stopCmd = {
            cmd: 102,
            data: {},
        };
        dataFactory.setData(stopCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[12]);
            });
    };

    /**退出气缸恢复 */
    $scope.closeCylinderModal = function() {
        $("#PauseFunction2Modal").modal('hide');
    }

    /**焊接中断再恢复 */
    $scope.setWeldingStartReWeld= function() {
        let weldingStartReWeldCmd = {
            cmd: 806,
            data: {
                content: "WeldingStartReWeldAfterBreakOff()"
            }
        }
        dataFactory.setData(weldingStartReWeldCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**焊接中断后退出焊接程序 */
    $scope.setWeldingAbortWeld= function() {
        let weldingAbortWeldCmd = {
            cmd: 807,
            data: {
                content: "WeldingAbortWeldAfterBreakOff()"
            }
        }
        dataFactory.setData(weldingAbortWeldCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**UDP异常断开后关闭通讯 */
    $scope.unloadExtAxisModbusUDPDriver = function () {
        let setExtAxisUnloadModbusUDPDriverCmd = {
            cmd: 908,
            data: {
                content: "ExtDevUDPClientComClose()",
            }
        };
        dataFactory.setData(setExtAxisUnloadModbusUDPDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**UDP异常断开后恢复连接 */
    $scope.restoreCommunicateConnect = function () {
        let setExtAxisUnloadModbusTCPDriverCmd = {
            cmd: 907,
            data: {
                content: "ExtDevUDPClientComReset()",
            }
        };
        dataFactory.setData(setExtAxisUnloadModbusTCPDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 末端LUA文件异常错误恢复
     * @param {int} enable 0-不恢复 1-恢复
     */
    $scope.setRecoverAxleLuaErr = function (enable) {
        let setCmd = {
            cmd: 949,
            data: {
                content: "SetRecoverAxleLuaErr(" + enable + ")",
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 显示/隐藏机器人模型的相关操作
    $scope.robotSettingShow = true;
    $scope.showOrHideRobotSetting = function() {
        $scope.robotSettingShow = !$scope.robotSettingShow;
    };

    //单步执行另一条指令清除上一条指令轨迹
    document.addEventListener('clearTrack_1001', e => {
        clearTrack();
    })

    /* 轨迹绘制 */
    // 轨迹绘制标志
    let DrawTrackFlg = false;
    // 开始进行轨迹绘制
    function startDrawTrack(x, y, z) {
        viewer.drawTrack(x, y, z);
    };
    // 停止进行轨迹绘制
    function clearTrack() {
        viewer.clearTrack();
    };
    // 轨迹绘制开关
    $scope.controlTrack = false;
    $scope.controlTrackCS = function () {
        $scope.controlTrack = !$scope.controlTrack;
        if ($scope.controlTrack) {
            DrawTrackFlg = true;
        } else {
            DrawTrackFlg = false;
            clearTrack()
        };
    };
    /* ./轨迹绘制 */

    // 基坐标系三维展示控制开关
    $scope.controlBase = true;
    $scope.controlBaseCS = function () {
        $scope.controlBase = !$scope.controlBase;
        if ($scope.controlBase) {
            viewer.displayCoordinateSystem(0);
        } else {
            viewer.clearCoordinateSystem(0);
        };
    };

    // 末端/工具坐标系三维展示控制开关
    $scope.controlTool = true;
    $scope.controlToolCS = function () {
        $scope.controlTool = !$scope.controlTool;
        if ($scope.controlTool) {
            // 在状态反馈中进行创建
        } else {
            viewer.clearCoordinateSystem(1);
        };
    };

    //定时器获取工具/工件/负载相关信息
    function repeatRefreshData() {
        index_getToolCoordData();
    }

    //获取工件坐标系数据
    let enableWorkpieceControl = 0;
    let forceRenderingWorkpieceCS = 0;
    function getWObjCoordData() {
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.WObjCoordeData_Display = JSON.parse(JSON.stringify(data));
                
                let wobjCoordeData = JSON.parse(JSON.stringify(data));
                let wobjCoordeKeys = Object.keys(wobjCoordeData);
                let wobjArray = [];
                wobjCoordeKeys.forEach(item => {
                    wobjArray.push(wobjCoordeData[item]);
                });
                $scope.wObjCoordeNewData = wobjArray;
                //更新工具坐标系数据
                if ($scope.selectWObjCoordeDataDisplay) {
                    $scope.selectWObjCoordeDataDisplay = $scope.wObjCoordeNewData[$scope.selectWObjCoordeDataDisplay.id];
                }
                enableWorkpieceControl = 1;
                $scope.controlWorkpieceCSOnorOff = "";
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[13]);
                $scope.controlWorkpieceCSOnorOff = "N/A";
            });
    };
    // 在设置新的工件坐标系后更新数据
    document.addEventListener("update_wobjCoord_data", e => {
        getWObjCoordData();
    })

    // 工件坐标系三维展示控制开关
    $scope.controlWorkpiece = false;
    $scope.controlWorkpieceCS = function () {
        if (enableWorkpieceControl) {
            $scope.controlWorkpiece = !$scope.controlWorkpiece;
            if ($scope.controlWorkpiece) {
                // 在状态反馈中进行创建
                forceRenderingWorkpieceCS = 1;
            } else {
                viewer.clearCoordinateSystem(2);
            };
            
        }
    };

    // 获取外部轴工具坐标系数据
    let enableExAxisControl = 0;
    $scope.controlExAxis = false;
    let forceRenderingExAxisCS = 0;
    $scope.controlExAxisCSOnorOff = "ON";
    function getEAxisCoordData() {
        let getCmd = {
            cmd: "get_exaxis_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.EAxisCoordeData_Display = JSON.parse(JSON.stringify(data));
                enableExAxisControl = 1;
                $scope.controlExAxisCSOnorOff = "";
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[14]);
                $scope.controlExAxisCSOnorOff = "N/A";
            });
    };
    // 在设置了新的扩展轴坐标系后更新数据
    document.addEventListener("update_eaxisCoord_data", e => {
        getEAxisCoordData();
    })

    // 扩展轴坐标系三维展示控制开关
    $scope.controlExAxis = false;
    $scope.controlExAxisCS = function () {
        if (enableExAxisControl) {
            $scope.controlExAxis = !$scope.controlExAxis;
            if ($scope.controlExAxis) {
                // 在状态反馈中进行创建
                forceRenderingExAxisCS = 1;
            } else {
                viewer.clearCoordinateSystem(3);
            };
            
        }

    };

    // 导入机器人工具模型
    $scope.submitTool = false;
    $scope.importToolModel = function () {
        // 清空文件内容
        var toolImportInterface = document.getElementById("toolModelImported");
        toolImportInterface.value = '';
        // 打开模态窗
        $('#importToolModal').modal();
    };

    // 上传工具模型文件
    $scope.submitToolModel = function () {

        var formData = new FormData();
        var file = document.getElementById("toolModelImported").files[0];

        if (file !== undefined) {

            formData.append('file', file);
            dataFactory.uploadData(formData)
                .then((data) => {
                    if (typeof(data) != "object") {
                        toastFactory.success(indexDynamicTags.success_messages[1] + file.name);
                        $("#importToolModal").modal('hide');
                        viewer.tool = data;
                    }
                    $scope.submitTool = true;
                }, (status) => {
                    $scope.submitTool = false;
                    toastFactory.error(status, indexDynamicTags.error_messages[15]);
                });

        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[7]);
        }
    };

    /**获取控制器从站协议*/
    function getSlaveProtocol() {
        let cmdContent = {
            cmd: "get_slave_protocol"
        };
        dataFactory.getData(cmdContent).then((data) => {
            $scope.slaveProtocolDisable = ~~data.slave_protocol;
            $scope.selectControllerProtocol = $scope.controllerProtocolModeData.filter(item => item.id == ~~data.slave_protocol)[0];
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 启动控制器从站协议应用
     * @param {int} id  //1-profinet西门子、2-cc-link法奥自定义、3-ethercat法奥自定义、4-ethernet/IP法奥自定义

     */
    $scope.startSlaveProtocol = function(id) {
        let cmdContent = {
            cmd: "start_slave_protocol",
            data: {
                slave_protocol: id
            }
        };
        dataFactory.actData(cmdContent).then(() => {
            $scope.slaveProtocolDisable = id;
            toastFactory.info(indexDynamicTags.info_messages[40]);
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**导出控制器从站协议日志 */
    $scope.exportControllerSlaveLog = function () {
        window.location.href = "/action/download?pathfilename=/usr/local/etc/slave_station/interpret_log.tar.gz";
    };

    /* 清空错误信息列表 */
    $scope.clearErrorWarningInfo = function () {
        $scope.errorWarningInfoList = [];
    }

    /**
     * 错误接收数据
     * @param {*} errordata 错误数据
     * @param {*} infodata 提示信息
     * @param {*} time 错误时间
     */
    $scope.showTotalTip = false;
    function creatErrorList(errordata, infodata, time) {
        $scope.errorPrefix = indexDynamicTags.info_messages[9];
        $scope.alarmPrefix = indexDynamicTags.info_messages[10];
        if (errordata != null) {
            $scope.errorMessageArray = errordata;
            for (let i = 0; i < $scope.errorMessageArray.length; i++) {
                $scope.errorMessageArray[i] = $scope.errorPrefix + $scope.errorMessageArray[i]
            }
        }
        if (infodata != null) {
            $scope.infoMessageArray = infodata;
            for (let j = 0; j < $scope.infoMessageArray.length; j++) {
                $scope.infoMessageArray[j] = $scope.alarmPrefix + $scope.infoMessageArray[j]
            }
        }
        $scope.errorMessageTotal = $scope.errorMessageArray.length + $scope.infoMessageArray.length;
        if ($scope.errorMessageTotal != 0) {
            $(".frbaojingtishi").addClass('frfont-danger');
            if ($("#errorlist")[0].attributes[5] == undefined || $("#errorlist")[0].attributes[5].value == 'false') {
                $("#errorlist").click();
            }
            $scope.showTotalTip = true;
        } else {
            $(".frbaojingtishi").removeClass('frfont-danger');
            if ($("#errorlist")[0].attributes[5] == undefined || $("#errorlist")[0].attributes[5].value == 'true') {
                $("#errorlist").click();
            }
            $scope.showTotalTip = false;
        }
        
        //Linux系统创建远程模式状态页面错误列表
        if (g_systemFlag) {
            let errorList = [];
            if (errordata != null) {
                errordata.forEach(errorInfo => {
                    let item = {
                        time: time,
                        error: errorInfo
                    };
                    errorList.push(item);
                });
            }
            if (infodata != null) {
                infodata.forEach(errorInfo => {
                    let item2 = {
                        time: time,
                        error: errorInfo
                    };
                    errorList.push(item2);
                });
            }
            $scope.errorWarningInfoList = errorList;
        }
    }

    /**
     * 速度设置应用下发指令函数
     * @param {string} speed 机器人全局速度百分比
     * @returns 
     */
    $scope.setRobotSpeed = function (speed) {
        if (typeof speed == 'number') {
            speed = String(speed);
        }
        if (!speed) {
            speed = $("#index_speed")[0].value;
            $scope.speed = Number(speed);
        }
        if ($scope.stateSwitchAuth.speed_scaling_config !='1') {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
            return;
        }
        if ("1" == $scope.controlMode && $scope.indexSafeStopMode == 1) {
            if (speed > 8) {
                //手动高速提示
                $('#amnuslhighspeed').modal();
                return;
            }
        }
        if (speed == "" || speed == null) {
            toastFactory.info(indexDynamicTags.info_messages[11]);
        } else {
            var speedString = "SetSpeed(" + speed + ")";
            let setSpeedCmd = {
                cmd: 206,
                data: {
                    content: speedString,
                },
            };
            dataFactory.setData(setSpeedCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[16]);
                });
        }
    }

    /** 滑块改变全局速度 */
    $scope.rangeChangeSpeed = function () {
        $("#index_speed")[0].value = $scope.speed;
    }

    /**
     * 全局速度操作
     * @param {int} type 0-减，1-增
     */
    $scope.actSpeed = function (type) {
        $scope.speed = Number($scope.speed);
        switch (type) {
            case 0:
                if ($scope.speed > 0) {
                    $scope.speed -= 1;
                }
                break;
            case 1:
                if ($scope.speed < 100) {
                    $scope.speed += 1;
                }
                break;
            default:
                break;
        }
        $("#index_speed")[0].value = $scope.speed;
    }
    // 阻止speedAct区域内点击事件继续传播
    document.getElementById('speedAct').addEventListener('click', e => {
        e.stopPropagation();
    })

    $scope.indexSafeStopMode = 0;
    //读取安全停止模式配置文件内容
    function getSafecfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.indexSafeStopMode = ~~data.safetystop_enable;
                // if($scope.indexSafeStopMode == 1){
                //     var index_enable_mychar = document.getElementById("index_enable_robot");
                //     index_enable_mychar.style.display = "none";
                // }else{
                //     var index_enable_mychar = document.getElementById("index_enable_robot");
                //     index_enable_mychar.style.display = "";
                // }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[17]);
            });
    }

    //其他页面配置安全后，同步安全配置信息
    document.addEventListener('567', () => {
        getSafecfg();
    });

    /**获取"手动切自动后速度自动为1%"功能是否开启 */
    function getModeSwitchSpeedConfig() {
        const getSpeedCmd = {
            cmd: 751,
            data: {
                content: `GetCustSpeedManualToAuto()`
            }
        }
        dataFactory.setData(getSpeedCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    document.addEventListener('751', e => {
        if (e && e.detail) {
            $scope.vitesseGlobale = JSON.parse(e.detail).status;
            $scope.globalSpeed = JSON.parse(e.detail).speed.split('.')[0];
        } else {
            toastFactory.error(403, indexDynamicTags.error_messages[56]);
        }
    });
    
    /**
     * 获取参数范围配置
     * @param {string} type authorityID类型
     */
    function getRobotParamsRange(type) { 
        let getRobotParamsRangeCmd = {
            cmd: "get_robot_params_range",
            data: {
                auth_id: type
            }
        };
        dataFactory.getData(getRobotParamsRangeCmd)
            .then((data) => {
                //如果参数范围配置中管理员参数范围配置为空或部分为空则使用上一级超级管理员配置
                if (!$.isEmptyObject(data)) {
                    $scope.robotParamsRangeData = data;
                } else {
                    getRobotParamsRange('0');
                }  
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[57]);
            });
    }

    /**配置"手动切自动后速度自动为1%"功能是否开启 */
    $scope.setModeSwitchSpeed = function() {
        if ($scope.stateSwitchAuth.manual_auto_switch !='1') {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
            return;
        }
        $scope.globalSpeed = $('#global-speed')[0].value;
        if (!$scope.globalSpeed) {
            toastFactory.info(indexDynamicTags.info_messages[33]);
            return;
        }
        const setSpeedParams = {
            cmd: 750,
            data: {
                content: `SetCustSpeedManualToAuto(${Number($scope.vitesseGlobale)},${Number($scope.globalSpeed)})`
            }
        }
        dataFactory.setData(setSpeedParams).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    document.addEventListener('750', e => {
        if (e.detail == '1') {
            if ($scope.vitesseGlobale == '1') {
                toastFactory.success(indexDynamicTags.success_messages[13]);
            } else {
                toastFactory.success(indexDynamicTags.success_messages[14]);
            }
        } else {
            if ($scope.vitesseGlobale == '1') {
                toastFactory.error(403, indexDynamicTags.error_messages[55]);
            } else {
                toastFactory.error(403, indexDynamicTags.error_messages[58]);
            }
            getModeSwitchSpeedConfig();
        }
    });

    //切换机器人模式
    function setMode(modecode) {
        let modeCmd = {};
        modeCmd.cmd = 303;
        modeCmd.data = { mode: modecode }
        dataFactory.setData(modeCmd)
            .then(() => {
                if (modecode == '0' && $scope.vitesseGlobale == '1') {
                    $scope.setRobotSpeed($scope.globalSpeed);
                }
                sessionStorage.setItem('controlMode', JSON.stringify($scope.controlMode));
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[18]);
                /* test */
                if (g_testCode) {
                    if ($scope.controlMode == 0) {
                        $scope.controlMode = 1;
                    } else {
                        $scope.controlMode = 0;
                    }
                    sessionStorage.setItem('controlMode', JSON.stringify($scope.controlMode));
                }
                /* ./test */
            })
    }

    /**
     * 直接切换机器人模式
     * @param {int} modeCode 模式代码[0-自动,1-手动,2-拖动]
     */
    $scope.switchRobotModeDirectly = function (modeCode) {
        switch (modeCode) {
            case 0:
                setMode($scope.modeArray[0].mode_code);
                break;
            case 1:
                setMode($scope.modeArray[1].mode_code);
                break;
            case 2:
                setMode($scope.modeArray[2].mode_code);
                break;
            default:
                break;
        }
    }

    //切换机器人模式
    $scope.modeSwitch = function () {
        if ($scope.stateSwitchAuth.manual_auto_switch =='1') {
            if ($scope.controlMode) {
                setMode($scope.modeArray[0].mode_code);
            } else {
                setMode($scope.modeArray[1].mode_code);
            }
        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
        }
    }

    /**
     * 设置系统状态页面标志位
     * @param {number} statusFlag 0-不进入状态页面；1-扭矩状态页面；2-康养系统状态页面；3-码垛状态页面；
     */
    function setStatusPageFlag(statusFlag) {
        let cmdContent = {
            cmd: "set_status_flag",
            data: {
                page_flag: statusFlag
            }
        };
        dataFactory.actData(cmdContent).then(() => {
            getStatusPageFlag();
            
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 切换机器人本地/远程模式
     * @param {int} modeValue 0-本地模式；1—远程模式
     */
    let repeatFlag; // 远程模式定时器标志
    $scope.remoteControlSwitch = function(modeValue) {
        if ("Drag" === $scope.programStatus) {
            toastFactory.info(indexDynamicTags.info_messages[38]);
            return;
        }
        /* test */
        // $scope.halfBothView();
        // $('#vRobot-view').css('z-index', 1048);
        // $('#remoteControlStatusPage').show();
        /* ./test */
        if ($scope.stateSwitchAuth.remote_control_switch =='1') {
            $scope.remoteControlMode = modeValue;
            let setRemoteCmd = {
                cmd: 813,
                data: {
                    content: "SetRobotFCIMode(" + $scope.remoteControlMode + ")",
                },
            };
            dataFactory.setData(setRemoteCmd).then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[60]);
            })
        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
        }
    }
    document.addEventListener("813", e => {
        if (e.detail == '1') {
            // 切换远程模式时，设置远程模式下末端灯色。退出远程模式，下发手动切换按钮，切换成手自动模式下末端灯色。
            if ($scope.remoteControlMode) {
                setStatusPageFlag(0);
                setRciAxleLedColour();
                getSlaveProtocol();
            } else {
                $scope.modeSwitch();
            }
        }
    });

    /** 设置远程模式下末端灯色，默认黄色常亮 */
    function setRciAxleLedColour() {
        let cmdContent = {
            cmd: 930,
            data: {
                content: "RCISetAxleLEDColour()"
            }
        };
        dataFactory.setData(cmdContent).then(() => {
            
        }, (status) => {
            toastFactory.error(status);
        });
    }

    //切换拖动模式
    $scope.dragModeSwitch = function () {
        if ($scope.stateSwitchAuth.drag_switch =='1') {
            if ("0" == $scope.controlMode) {
                toastFactory.warning(indexDynamicTags.warning_messages[0]);
                return;
            }
            if ("Drag" === $scope.programStatus) {
                setdragMode(0);
            } else {
                setdragMode(1);
            }
        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[6]);
        }
    }

    //切换拖动模式
    function setdragMode(dragcode) {
        let setDragCmd = {
            cmd: 333,
            data: {
                content: "DragTeachSwitch(" + dragcode + ")",
            },
        };
        dataFactory.setData(setDragCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[19]);
            })
    }

    //清除控制器报错
    $scope.resetAllError = function () {
        let resetAllErrorCmd = {
            cmd: 107,
            data: {
                content: "ResetAllError()",
            },
        };
        dataFactory.setData(resetAllErrorCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[20]);
            })
    }

    function dispatchSavePoints() {
        if (document.getElementById('auxiliaryApplication') != null && document.getElementById('auxiliaryApplication') != undefined) {
            document.getElementById('auxiliaryApplication').dispatchEvent(new CustomEvent('savepoints', { bubbles: true, cancelable: true, composed: true }));
        } else if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
            document.getElementById('peripheral').dispatchEvent(new CustomEvent('savepoints', { bubbles: true, cancelable: true, composed: true }));
        } else if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
            document.getElementById('programTeach').dispatchEvent(new CustomEvent('savepoints', { bubbles: true, cancelable: true, composed: true }));
        } else if (document.getElementById('blocklyDiv') != null && document.getElementById('blocklyDiv') != undefined) {
            document.getElementById('blocklyDiv').dispatchEvent(new CustomEvent('savepoints', { bubbles: true, cancelable: true, composed: true }));
        }
    }

    //检查示教点是否已存在
    $scope.checkPoint = function () {
        if ($scope.recordPointsMode == '1') {
            // 命名记录点
            $scope.pointName = document.getElementById("savePoint").value;
            if (g_tpPrefix != "") {
                $scope.bindpointName = g_tpPrefix + $scope.pointName;
            } else {
                $scope.bindpointName = $scope.pointName;
            }
        } else {
            // 快速记录点
            $scope.bindpointName = '';
        }
        
        let checkPointCmd = {
            cmd: "get_checkpoint",
            data: {
                name: $scope.bindpointName
            }
        }
        dataFactory.getData(checkPointCmd)
            .then((data) => {
                if ($scope.recordPointsMode == '1') {
                    if (~~data.result) {
                        $scope.checkGlobalCoverPoint = 1;
                        $('#pointExitedModal').modal();
                    } else {
                        $scope.checkGlobalCoverPoint = 0;
                        $scope.savePoint();
                    }
                } else {
                    $scope.quickRecordPointsName = data.name;
                    $scope.savePoint($scope.quickRecordPointsName);
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[21]);
            })
    }

    /**
     * 保存示教点
     * @param {string} name 示教点名称
     */
    $scope.savePoint = function (name) {
        if (name != undefined) {
            $scope.bindpointName = name;
        }
        if ($scope.bindpointName.trim().length == 0 && $scope.recordPointsMode == '1') {
            toastFactory.info(indexDynamicTags.info_messages[12]);
        } else if (($scope.controlMode != "1") && $scope.debug_flag) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else {
            let savePointCmd = {
                cmd: "save_point",
                data: {
                    "name": $scope.bindpointName,
                    "update_allprogramfile": $scope.checkGlobalCoverPoint
                }
            };
            // 更新示教程序时弹出Loading
            $('#pageLoading').css("display", "block");
            dataFactory.actData(savePointCmd)
                .then(() => {
                    if ($scope.recordPointsMode == '1') {
                        $scope.pointName = "";
                        $('#pointExitedModal').modal('hide');
                        toastFactory.success(indexDynamicTags.success_messages[2]);
                    } else {
                        $scope.quickRecordPointsState = 1;
                    }
                    dispatchSavePoints();
                    $('#pageLoading').css("display", "none");
                }, (status) => {
                    if ($scope.recordPointsMode == '0') {
                        $scope.quickRecordPointsState = 0;
                    }
                    $('#pageLoading').css("display", "none");
                    toastFactory.error(status, indexDynamicTags.error_messages[22]);
                });
        }
    }

    /** 码垛设置工件抓取点事件监听 */
    document.addEventListener("set-palletizing-grip-point", e => {
        document.getElementById("savePoint").value = e.detail;
        $scope.checkPoint();
    });

    /** 码垛设置工位过渡点事件监听 */
    document.addEventListener("set-palletizing-transition-point", e => {
        document.getElementById("savePoint").value = e.detail;
        $scope.checkPoint();
    });


    //传感器检查示教点是否已存在
    $scope.checkLaserPoint = function (index) {
        $scope.pointLaserName = document.getElementById("laserPoint").value;
        if (0 == $scope.pointLaserName.trim().length) {
            toastFactory.info(indexDynamicTags.info_messages[12]);
            return;
        }else if (null == $scope.index_selectedSensorCoorde) {
            toastFactory.info(indexDynamicTags.info_messages[13]);
            return;
        }
        let checkPointCmd = {
            cmd: "get_checkpoint",
            data: {
                name: $scope.pointLaserName
            }
        }
        dataFactory.getData(checkPointCmd)
            .then((data) => {
                if (~~data.result) {
                    $('#LpointExitedModal').modal();
                } else {
                    $scope.setLaserRecord();
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[23]);
            })
    }

    //坐标系数据保留三位小数
    function index_Screen_Sensor(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].type == 0) {
                data.splice(i, 1);
                i = i - 1;
            } else {
                let valuearr = Object.keys(data[i]);
                var valuelength = valuearr.length;
                for (let j = 2; j < valuelength - 2; j++) {
                    data[i][valuearr[j]] = parseFloat(data[i][valuearr[j]]).toFixed(3);
                }
            }
        }
    }

    //获取工具坐标系数据
    function index_getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.index_ToolCoordeData = JSON.parse(JSON.stringify(data));
                $scope.indexToolCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                index_Screen_Sensor(data);
                $scope.index_SensorCoordeData = JSON.parse(JSON.stringify(data));
                $scope.index_selectedSensorCoorde = $scope.index_SensorCoordeData[0];
                if ($scope.selectIndexToolCoorde) {
                    $scope.selectIndexToolCoorde = $scope.index_ToolCoordeData.filter(item => item.id == $scope.selectIndexToolCoorde.id)[0];
                }
                if (g_systemFlag) {
                    // 处理负载编号的数据
                    let getLoadCmd = {
                        cmd: 'get_load'
                    }
                    dataFactory.getData(getLoadCmd).then((data) => {
                        $scope.indexEndLoadData = data;
                        if ($scope.selectIndexToolCoorde) {
                            $scope.selectedindexEndLoad = $scope.indexEndLoadData[$scope.selectIndexToolCoorde.load_id];
                        }
                        getWObjCoordData();
                    }, () => {
                        $scope.indexEndLoadData = [];
                    });
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[24]);
            });
    };
    //修改工具数据库数据后更新数据
    document.addEventListener('saveToolCoordData', e => {
        index_getToolCoordData();
    })

    //下发传感器记录指令
    $scope.btn_LTRecord = 0;
    $scope.setLaserRecord = function () {
        $scope.btn_LTRecord = 1;
        let LaserRecordCmd = {
            cmd: 278,
            data: {
                content: "PosSensorPointRecord(" + $scope.index_selectedSensorCoorde.id + "," + $scope.index_selectedSensorCoorde.installation_site + "," + $scope.index_selectedSensorCoorde.x + "," + $scope.index_selectedSensorCoorde.y + "," +
                    $scope.index_selectedSensorCoorde.z + "," + $scope.index_selectedSensorCoorde.rx + "," + $scope.index_selectedSensorCoorde.ry + "," + $scope.index_selectedSensorCoorde.rz + ")",
            },
        };
        dataFactory.setData(LaserRecordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[25]);
            });
    }

    //获取传感器示教点数据
    document.addEventListener('278', e => {
        $scope.saveLaserPoint(JSON.parse(e.detail));
    });

    //保存传感器示教点
    $scope.saveLaserPoint = function (lpointdata) {
        if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
            return;
        }
        //计算出的结果保留三位小数
        let temparr = Object.keys(lpointdata);
        var templength = temparr.length;
        for (let i = 0; i < templength; i++) {
            lpointdata[temparr[i]] = parseFloat(lpointdata[temparr[i]]).toFixed(3);
        }
        if ($scope.btn_LTRecord) {
            $scope.btn_LTRecord = 0;
            if (0 == $scope.pointLaserName.trim().length) {
                toastFactory.info(indexDynamicTags.info_messages[12]);
                return;
            } else {
                let savePointCmd = {
                    cmd: "save_laser_point",
                    data: {
                        "name": $scope.pointLaserName,
                        "speed": "100",
                        "elbow_speed": "100",
                        "acc": $scope.acceleration,
                        "elbow_acc": $scope.acceleration,
                        "toolnum": $scope.currentCoord + "",
                        "workpiecenum": $scope.currentWobjCoord + "",
                        "j1": lpointdata.j1,
                        "j2": lpointdata.j2,
                        "j3": lpointdata.j3,
                        "j4": lpointdata.j4,
                        "j5": lpointdata.j5,
                        "j6": lpointdata.j6,
                        "x": lpointdata.x,
                        "y": lpointdata.y,
                        "z": lpointdata.z,
                        "rx": lpointdata.rx,
                        "ry": lpointdata.ry,
                        "rz": lpointdata.rz,
                        "E1": lpointdata.E1,
                        "E2": lpointdata.E2,
                        "E3": lpointdata.E3,
                        "E4": lpointdata.E4
                    },
                };
                dataFactory.actData(savePointCmd)
                    .then(() => {
                        $scope.pointLaserName = "";
                        $('#LpointExitedModal').modal('hide');
                        toastFactory.success(indexDynamicTags.success_messages[3] + $scope.pointLaserName + indexDynamicTags.success_messages[4]);
                        dispatchSavePoints();
                    }, (status) => {
                        toastFactory.error(status, indexDynamicTags.success_messages[3] + $scope.pointLaserName + indexDynamicTags.error_messages[26]);
                    });
            }
        } else {
            let savePointCmd = {
                cmd: "save_laser_point",
                data: {
                    "name": $scope.ptnboxPointName,
                    "speed": "100",
                    "elbow_speed": "100",
                    "acc": $scope.acceleration,
                    "elbow_acc": $scope.acceleration,
                    "toolnum": $scope.currentCoord + "",
                    "workpiecenum": $scope.currentWobjCoord + "",
                    "j1": lpointdata.j1,
                    "j2": lpointdata.j2,
                    "j3": lpointdata.j3,
                    "j4": lpointdata.j4,
                    "j5": lpointdata.j5,
                    "j6": lpointdata.j6,
                    "x": lpointdata.x,
                    "y": lpointdata.y,
                    "z": lpointdata.z,
                    "rx": lpointdata.rx,
                    "ry": lpointdata.ry,
                    "rz": lpointdata.rz,
                    "E1": lpointdata.E1,
                    "E2": lpointdata.E2,
                    "E3": lpointdata.E3,
                    "E4": lpointdata.E4
                },
            };
            dataFactory.actData(savePointCmd)
                .then(() => {
                    toastFactory.success(indexDynamicTags.success_messages[3] + $scope.ptnboxPointName + indexDynamicTags.success_messages[4]);
                    dispatchSavePoints();
                    if (($scope.ptnboxPointsFlag + 1) > $scope.limitNumber) {
                        toastFactory.info(indexDynamicTags.info_messages[14]);
                    }
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.success_messages[3] + $scope.ptnboxPointName + indexDynamicTags.error_messages[26]);
                });
        }
    }

    //显示或隐藏IO状态控件
    $scope.iomenu_up = false;
    $scope.iomenu_down = true;
    $scope.rmenu_up = false;
    $scope.rmenu_down = true;
    $scope.show_robotMenu = true;

    $scope.auxiomenu_up = true;
    $scope.auxiomenu_down = false;
    $scope.show_Aux_IOMenu = false;
    $scope.showRobotMenu = function () {
        $scope.rmenu_up = !$scope.rmenu_up;
        $scope.rmenu_down = !$scope.rmenu_down;
        $scope.show_robotMenu = !$scope.show_robotMenu;
    }

    $scope.showAuxIOMenu = function () {
        $scope.auxiomenu_up = !$scope.auxiomenu_up;
        $scope.auxiomenu_down = !$scope.auxiomenu_down;
        $scope.show_Aux_IOMenu = !$scope.show_Aux_IOMenu;
    }

    /* 判断显示关节位置和TCP姿态 */
    function checkCoord() {
        if ((1 == $scope.selectedCoordSys.value) || (2 == $scope.selectedCoordSys.value)) {
            $scope.pointMove1 = "X";
            $scope.pointMove2 = "Y";
            $scope.pointMove3 = "Z";
            $scope.pointMove4 = "RX";
            $scope.pointMove5 = "RY";
            $scope.pointMove6 = "RZ";
            $scope.pointMove1Data = $scope.currentBaseTCP.x;
            $scope.pointMove2Data = $scope.currentBaseTCP.y;
            $scope.pointMove3Data = $scope.currentBaseTCP.z;
            $scope.pointMove4Data = $scope.currentBaseTCP.rx;
            $scope.pointMove5Data = $scope.currentBaseTCP.ry;
            $scope.pointMove6Data = $scope.currentBaseTCP.rz;
        } else if (0 == $scope.selectedCoordSys.value) {
            $scope.pointMove1 = "J1";
            $scope.pointMove2 = "J2";
            $scope.pointMove3 = "J3";
            $scope.pointMove4 = "J4";
            $scope.pointMove5 = "J5";
            $scope.pointMove6 = "J6";
            $scope.pointMove1Data = $scope.jointsData.j1;
            $scope.pointMove2Data = $scope.jointsData.j2;
            $scope.pointMove3Data = $scope.jointsData.j3;
            $scope.pointMove4Data = $scope.jointsData.j4;
            $scope.pointMove5Data = $scope.jointsData.j5;
            $scope.pointMove6Data = $scope.jointsData.j6;
        } else if (3 == $scope.selectedCoordSys.value) {
            $scope.pointMove1 = "X";
            $scope.pointMove2 = "Y";
            $scope.pointMove3 = "Z";
            $scope.pointMove4 = "RX";
            $scope.pointMove5 = "RY";
            $scope.pointMove6 = "RZ";
            $scope.pointMove1Data = $scope.currentTCP.x;
            $scope.pointMove2Data = $scope.currentTCP.y;
            $scope.pointMove3Data = $scope.currentTCP.z;
            $scope.pointMove4Data = $scope.currentTCP.rx;
            $scope.pointMove5Data = $scope.currentTCP.ry;
            $scope.pointMove6Data = $scope.currentTCP.rz;
        }
    }

    /* IO设置功能区 */
    $scope._CtrlBox = "CtrlBox";
    $scope._CtrlBox_DO = "DO";
    $scope._CtrlBox_AO = "AO";
    $scope._EndEff = "EndEff";
    $scope._EndEff_DO = "DO";
    $scope._EndEff_AO = "AO";
    $scope._EndEff_AO = "AO";
    $scope.ctrlDOOnorOff = "OFF";
    $scope.ctrlBoxDO = false;
    $scope.toolDOOnorOff = "OFF";
    $scope.endEffDO = false;

    // CtrlBox AOArray
    $scope.clAOArr = [
        {
            name: "Aout0",
            num: 0
        },
        {
            name: "Aout1",
            num: 1
        }
    ];
    $scope.clAOSelected = $scope.clAOArr[0];

    // EndEff AOArray
    $scope.toolAOArr = [
        {
            name: "Aout0",
            num: 0
        }
    ];
    $scope.toolAOSelected = $scope.toolAOArr[0];

    //读取DO配置文件
    $scope.indexDOcfgArr = [];
    function getDOcfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.indexDOcfgArr[0] = (~~data.ctl_do8_config);
                $scope.indexDOcfgArr[1] = (~~data.ctl_do9_config);
                $scope.indexDOcfgArr[2] = (~~data.ctl_do10_config);
                $scope.indexDOcfgArr[3] = (~~data.ctl_do11_config);
                $scope.indexDOcfgArr[4] = (~~data.ctl_do12_config);
                $scope.indexDOcfgArr[5] = (~~data.ctl_do13_config);
                $scope.indexDOcfgArr[6] = (~~data.ctl_do14_config);
                $scope.indexDOcfgArr[7] = (~~data.ctl_do15_config);
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[27]);
            });
    }

    //其他页面配置DO后，同步DO配置信息
    document.addEventListener('324', e => {
        getDOcfg();
    });

    // 在选择控制箱DO时，根据其状态对按钮显示的ON和OFF进行改变
    let changeCtrlDOOnorOff = function (selectedclDONum) {
        if ($scope.clDO[selectedclDONum]) {
            $scope.ctrlDOOnorOff = "OFF";
            $scope.ctrlBoxDO = true;
        } else {
            $scope.ctrlDOOnorOff = "ON";
            $scope.ctrlBoxDO = false;
        }

    }
    // 在选择工具DO时，根据其状态对按钮显示的ON和OFF进行改变
    let changeToolDOOnorOff = function (selectedtoolDONum) {
        if ($scope.toolDO[selectedtoolDONum]) {
            $scope.toolDOOnorOff = "OFF";
            $scope.endEffDO = true;
        } else {
            $scope.toolDOOnorOff = "ON";
            $scope.endEffDO = false;
        }

    }

    // 设置控制箱DO状态
    $scope.setCtrlBoxDO = function (DONum) {
        if (DONum == null) {
            toastFactory.warning(indexDynamicTags.warning_messages[8]);
            return;
        };
        if (DONum > 7) {
            if (0 != $scope.indexDOcfgArr[DONum - 8]) {
                toastFactory.warning("DO" + DONum + indexDynamicTags.warning_messages[9]);
                return;
            }
        }
        let setDOString = "SetDO(" + DONum + "," + (1 ^ $scope.clDO[DONum]) + "," + 0 + ")";
        let setDOCmd = {
            cmd: 204,
            data: {
                content: setDOString
            }
        };

        dataFactory.setData(setDOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[28]);
            });
    }
    // 设置控制箱AO状态
    $scope.setCtrlBoxAO = function (AONum) {
        if (AONum == null) {
            toastFactory.warning(indexDynamicTags.warning_messages[10]);
            return;
        };
        if ($scope.clAOValue == undefined || $scope.clAOValue == "") {
            toastFactory.warning(indexDynamicTags.warning_messages[11]);
            return;
        };
        let setAOString = "SetAO(" + AONum + "," + $scope.clAOValue * 40.95 + ")";
        let setAOCmd = {
            cmd: 209,
            data: {
                content: setAOString
            }
        };

        dataFactory.setData(setAOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[29]);
            });
    }
    // 设置末端工具DO状态
    $scope.setEndEffDO = function (toolDONum) {
        if (toolDONum == null) {
            toastFactory.warning(indexDynamicTags.warning_messages[12]);
            return;
        };
        let setToolDOString = "SetToolDO(" + toolDONum + "," + (1 ^ $scope.toolDO[toolDONum]) + "," + 0 + ")";
        let setToolDOCmd = {
            cmd: 210,
            data: {
                content: setToolDOString
            }
        };

        dataFactory.setData(setToolDOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[30]);
            });
    }
    // 设置末端工具AO状态
    $scope.setEndEffAO = function (toolAONum) {
        if (toolAONum == null) {
            toastFactory.warning(indexDynamicTags.warning_messages[13]);
            return;
        };
        if ($scope.toolAOValue == undefined || $scope.toolAOValue == "") {
            toastFactory.warning(indexDynamicTags.warning_messages[14]);
            return;
        };
        let setToolAOString = "SetToolAO(" + toolAONum + "," + $scope.toolAOValue * 40.95 + ")";
        let setToolAOCmd = {
            cmd: 211,
            data: {
                content: setToolAOString
            }
        };

        dataFactory.setData(setToolAOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[31]);
            });
    }

    /* TPD功能区 */
    //TPD周期
    $scope.setTPDPeriod = [
        {
            num: "2",
        },
        {
            num: "4",
        },
        {
            num: "8",
        }
    ]
    $scope.selectedTPDPeriod = $scope.setTPDPeriod[0];

    //开始记录TPD轨迹指令
    $scope.startTPDRecord = function () {
        if (null == $scope.writeTPDName) {
            toastFactory.warning(indexDynamicTags.warning_messages[15]);
        } else if ($scope.writeTPDName.length >= 20) {
            toastFactory.warning(indexDynamicTags.warning_messages[16]);
        } else if (1 == tpd_record_state) {
            toastFactory.warning(indexDynamicTags.warning_messages[18]);
        } else {
            var startTPDString = "SetTPDStart(" + $scope.selectedTPDLocation.num + ",\"" + $scope.writeTPDName + "\"," + $scope.selectedTPDPeriod.num + "," + $scope.selectedTPDDI.id + "," + $scope.selectedTPDDO.id + ")";
            let startTPDRecordCmd = {
                cmd: 315,
                data: {
                    content: startTPDString,
                },
            };
            dataFactory.setData(startTPDRecordCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[32]);
                });
        }
    }

    //参数设置
    $scope.SetTPDParam = function () {
        if (null == $scope.writeTPDName) {
            toastFactory.warning(indexDynamicTags.warning_messages[15]);
        } else if ($scope.writeTPDName.length >= 20) {
            toastFactory.warning(indexDynamicTags.warning_messages[16]);
        } else if (1 == tpd_record_state) {
            toastFactory.warning(indexDynamicTags.warning_messages[18]);
        } else {
            var setTPDParamString = "SetTPDParam(" + $scope.selectedTPDLocation.num + ",\"" + $scope.writeTPDName + "\"," + $scope.selectedTPDPeriod.num + "," + $scope.selectedTPDDI.id + "," + $scope.selectedTPDDO.id + ")";
            let setTPDParamCmd = {
                cmd: 341,
                data: {
                    content: setTPDParamString,
                },
            };
            dataFactory.setData(setTPDParamCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[33]);
                });
        }
    }

    //停止记录TPD轨迹指令
    $scope.stopTPDRecord = function () {
        if (null == $scope.writeTPDName) {
            toastFactory.warning(indexDynamicTags.warning_messages[19]);
        } else if (0 == tpd_record_state) {
            toastFactory.warning(indexDynamicTags.warning_messages[21]);
        } else {
            var stopTPDString = "SetWebTPDStop(" + $scope.selectedTPDLocation.num + ",\"" + $scope.writeTPDName + "\"," + $scope.selectedTPDPeriod.num + "," + $scope.selectedTPDDI.id + "," + $scope.selectedTPDDO.id + ")";
            let stopTPDRecordCmd = {
                cmd: 317,
                data: {
                    content: stopTPDString,
                },
            };
            dataFactory.setData(stopTPDRecordCmd)
                .then(() => {
                    getTPDName();
                    $scope.writeTPDName = null;
                    $scope.tpdState = indexDynamicTags.info_messages[22];
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[34]);
                });
        }
    }

    //获取TPD轨迹指令
    function getTPDName() {
        let getTPDNameCmd = {
            cmd: "get_tpd_name",
        };
        dataFactory.getData(getTPDNameCmd)
            .then((data) => {
                $scope.GetTPDName = data;
                $scope.selectedTPDName = $scope.GetTPDName[0];
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[35]);
            });
    }

    document.addEventListener('tpdget', e => {
        toastFactory.success(indexDynamicTags.success_messages[6]);
        getTPDName();
    });

    //删除TPD轨迹
    $scope.deleteTPDRecord = function () {
        if (null == $scope.selectedTPDName) {
            toastFactory.warning(indexDynamicTags.warning_messages[22]);
        }
        else {
            var deleteTPDString = "SetTPDDelete(\"" + $scope.selectedTPDName + "\")";
            let deleteTPDRecordCmd = {
                cmd: 318,
                data: {
                    content: deleteTPDString,
                },
            };
            dataFactory.setData(deleteTPDRecordCmd)
                .then(() => {
                    getTPDName();
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[36]);
                });
        }
    }

    /* TPD可视化编辑功能 */
    // 获取轨迹点
    let samplingPeriod = 100;
	let tpdPointsArrayLastIndex = 0;
    $scope.getTPDPoints = function () {
        if ($scope.selectedTPDNameForEdit) {
            let getCmd = {
                cmd: "get_TPD_points",
                data: {
                    name: $scope.selectedTPDNameForEdit + ".txt"
                }
            };
            toastFactory.info(indexDynamicTags.info_messages[15]);
            let pageLoading = document.getElementById("pageLoading");
            pageLoading.style.display = "block";
            
            dataFactory.getData(getCmd)
                .then((data) => {
    
                    viewer.clearTrack();
                    $scope.tpdPointsArray = data;
                    $scope.tpdPointsArrayForTrack = [];
                    let tpdPointsArrayLen = data.length;
                    tpdPointsArrayLastIndex = tpdPointsArrayLen - 1;
                    let samplingPointsNum = ~~(tpdPointsArrayLen / samplingPeriod);
    
                    // 轨迹点采样
                    for (let i = 0; i < samplingPointsNum; i++) {
                        
                        $scope.tpdPointsArrayForTrack.push($scope.tpdPointsArray[tpdPointsArrayLastIndex - (i * samplingPeriod)]);
                        
                    }
                    $scope.tempTPDPointsArray = $scope.tpdPointsArrayForTrack;
    
                    //  采样点渲染轨迹
                    $scope.tpdPointsArrayForTrack.forEach(element => {
                        viewer.drawTrack(element.x / 1000, element.y / 1000, element.z / 1000);
                    });
    
                    // 设置轨迹起止点滑块最大值和序号
                    let tpdstart = document.querySelector('input[name="tpdstart"]');
                    let tpdend = document.querySelector('input[name="tpdend"]');
                    tpdstart.max = tpdPointsArrayLastIndex;
                    tpdend.max = tpdPointsArrayLastIndex;
                    $scope.tpdStartIndex = 0;
                    $scope.tpdEndIndex = tpdPointsArrayLastIndex;
    
                    let pageLoading = document.getElementById("pageLoading");
                    pageLoading.style.display = "none";
                    toastFactory.success(indexDynamicTags.success_messages[7]);
                }, (status) => {
                    toastFactory.error(status);
                    let pageLoading = document.getElementById("pageLoading");
                    pageLoading.style.display = "none";
                });
        } else {
            toastFactory.info(indexDynamicTags.info_messages[37]);
        }
    }

    $scope.changeTPDStartEndPoint = function (sp, ep) {
        if (~~ep > ~~sp) {
			let tempsp = ~~(sp / samplingPeriod);
			let tempep = ~~(ep / samplingPeriod);
			let periodNum = ~~($scope.tpdPointsArray.length / samplingPeriod);
			if (tempep !=  periodNum) {
				tempep += 1;
			}
            
            $scope.tempTPDPointsArray = $scope.tpdPointsArrayForTrack.slice(tempsp, tempep);
            viewer.clearTrack();
            $scope.tempTPDPointsArray.forEach(element => {
                viewer.drawTrack(element.x / 1000, element.y / 1000, element.z / 1000);
            });

        } else {
            toastFactory.warning(indexDynamicTags.warning_messages[23]);
        }
    }

    // 模拟复现TPD轨迹
	let stid = 0;
    $scope.simulationTPD = function () {
        let count = 0;
        if ($scope.tempTPDPointsArray && $scope.tempTPDPointsArray.length > 0) {
            let len = $scope.tempTPDPointsArray.length;
            toastFactory.info(indexDynamicTags.info_messages[16]);
            if (stid == 0) {
                stid = setInterval(() => {
                    //viewer.clearPoints();
                    let element = $scope.tempTPDPointsArray[count];
                    //viewer.drawPoints(element.x / 1000, element.y / 1000, element.z / 1000);
                    viewer.setVirtualAngle("j1", element["j1"] * DEG2RAD);
                    viewer.setVirtualAngle("j2", element["j2"] * DEG2RAD);
                    viewer.setVirtualAngle("j3", element["j3"] * DEG2RAD);
                    viewer.setVirtualAngle("j4", element["j4"] * DEG2RAD);
                    viewer.setVirtualAngle("j5", element["j5"] * DEG2RAD);
                    viewer.setVirtualAngle("j6", element["j6"] * DEG2RAD);
                    count++;
                    if (count == len) {
                        //viewer.clearPoints();
                        clearInterval(stid);
                        stid = 0;
                        toastFactory.success(indexDynamicTags.success_messages[8]);
                    }
                }, 60);
            } else {
                toastFactory.warning(indexDynamicTags.warning_messages[24]);
            }
        } else {
            toastFactory.info(indexDynamicTags.info_messages[37]);
        }
    }

    // 完成TPD轨迹编辑
    $scope.completeTPDEditing = function () {
        let cmd = {
            cmd: "cfg_TPD_start_end",
            data: {
                tpd_name: $scope.selectedTPDNameForEdit + ".txt",
                start_point: ~~($scope.tpdStartIndex),
                end_point: ~~($scope.tpdEndIndex)
            }
        };
        dataFactory.actData(cmd)
            .then(() => {
                let savePointCmd = {
                    cmd: "save_TPD_point",
                    data: {
                        "name": $scope.selectedTPDNameForEdit + "start",
                        "speed": "100",
                        "elbow_speed": "100",
                        "acc": $scope.acceleration + "",
                        "elbow_acc": $scope.acceleration + "",
                        "toolnum": $scope.currentCoord + "",
                        "workpiecenum": $scope.currentWobjCoord + "",
                        "j1": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j1 + "",
                        "j2": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j2 + "",
                        "j3": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j3 + "",
                        "j4": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j4 + "",
                        "j5": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j5 + "",
                        "j6": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].j6 + "",
                        "x": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].x + "",
                        "y": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].y + "",
                        "z": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].z + "",
                        "rx": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].rx + "",
                        "ry": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].ry + "",
                        "rz": $scope.tpdPointsArray[tpdPointsArrayLastIndex - ~~($scope.tpdStartIndex)].rz + ""
                    },
                };
                dataFactory.actData(savePointCmd)
                    .then(() => {
                        toastFactory.success(indexDynamicTags.success_messages[9]);
                        dispatchSavePoints();
                    }, (status) => {
                        toastFactory.error(status, indexDynamicTags.error_messages[37]);
                    });

                // clear
                viewer.clearTrack();
                $scope.tpdPointsArray = [];
                $scope.tempTPDPointsArray = [];
                $scope.tpdPointsArrayForTrack = [];
                $scope.selectedTPDNameForEdit = null;
                toastFactory.success(indexDynamicTags.success_messages[10]);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* ./TPD可视化编辑功能 */

    /**夹爪显示 */
    $scope.gripperidArr = [
        {
            "name": "ID1"
        },
        {
            "name": "ID2"
        },
        {
            "name": "ID3"
        },
        {
            "name": "ID4"
        },
        {
            "name": "ID5"
        },
        {
            "name": "ID6"
        },
        {
            "name": "ID7"
        },
        {
            "name": "ID8"
        }
    ],


    /* EAxis功能区 */
    // EAxis option
    $scope.Index_EAxisSpeed = 100;
    $scope.Index_EAxisDistance = 50;
    $scope.Index_EAxisacc = 100;

    $scope.Index_ExternaAxisIdData = [
        {
            id: "1"
        },
        {
            id: "2"
        },
        {
            id: "3"
        },
        {
            id: "4"
        }
    ]
    $scope.Index_selectedEAxisTestID = $scope.Index_ExternaAxisIdData[0];

    function handleexaxisid() {
        $scope.exaxisidTrabsfer = 0;
        if ($scope.Index_selectedEAxisTestID.id == 1) {
            $scope.exaxisidTrabsfer = 1;
        } else if ($scope.Index_selectedEAxisTestID.id == 2) {
            $scope.exaxisidTrabsfer = 2;
        } else if ($scope.Index_selectedEAxisTestID.id == 3) {
            $scope.exaxisidTrabsfer = 4;
        } else if ($scope.Index_selectedEAxisTestID.id == 4) {
            $scope.exaxisidTrabsfer = 8;
        }
    }

    //扩展轴零点配置窗口
    $("#IConveyorZero").click(function () {
        $('#IConverZeroModal').modal();
    });

    
    $scope.HomeSearchVel = 5;
    $scope.HomeLatchVel = 1;

    //设定外部轴零点
    $scope.index_setEAxisZero = function () {
        if ($scope.EAxisRDY[$scope.Index_selectedEAxisTestID.id - 1] != 1) {
            toastFactory.info(indexDynamicTags.info_messages[32]);
            $('#IConverZeroModal').modal('hide');
            return;
        }
        handleexaxisid($scope.Index_selectedEAxisTestID.id);
        var SetEAxisZeroString = "ExtAxisSetHoming(" + $scope.exaxisidTrabsfer + "," + $scope.selectedEAxisZeroMode.id + "," + $scope.HomeSearchVel + "," + $scope.HomeLatchVel  + ")";
        let SetEAxisZeroCmd = {
            cmd: 290,
            data: {
                content: SetEAxisZeroString,
            },
        };
        dataFactory.setData(SetEAxisZeroCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    $scope.zeroStateText = "";

    document.addEventListener('EAxisZero', function (e) {

        let zeroState = e.detail;
        if (zeroState[$scope.Index_selectedEAxisTestID.id - 1] == 0) {
            $scope.zeroStateText = "";
        } else if (zeroState[$scope.Index_selectedEAxisTestID.id - 1] == 1) {
            $scope.zeroStateText = indexDynamicTags.info_messages[28];
        } else if (zeroState[$scope.Index_selectedEAxisTestID.id - 1] == 2) {
            $scope.zeroStateText = indexDynamicTags.info_messages[29];
        } else if (zeroState[$scope.Index_selectedEAxisTestID.id - 1] == 3) {
            $scope.zeroStateText = indexDynamicTags.info_messages[30];
        } else if (zeroState[$scope.Index_selectedEAxisTestID.id - 1] == 4) {
            $scope.zeroStateText = indexDynamicTags.info_messages[31];
        }
    });

    //外部轴伺服使能
    $scope.Index_setEAxisServoOn = function (index) {
        handleexaxisid();
        let EAxisServoOnCmd = {
            cmd: 296,
            data: {
                content: "ExtAxisServoOn(" + $scope.exaxisidTrabsfer + "," + index + ")",
            },
        };
        dataFactory.setData(EAxisServoOnCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[38]);
            });
    }

    //外部轴点动
    $scope.Index_startEAxisJog = function (index) {
        if ($scope.EAxisRDY[$scope.Index_selectedEAxisTestID.id - 1] === 0) {
            toastFactory.info(indexDynamicTags.info_messages[17]);
            return;
        }
        handleexaxisid();
        var StartEAxisJogString = "ExtAxisStartJog(" + "6" + "," + $scope.exaxisidTrabsfer + "," + index + "," + $scope.Index_EAxisSpeed + "," + $scope.Index_EAxisacc + "," + $scope.Index_EAxisDistance + ")";
        let StartEAxisJogCmd = {
            cmd: 292,
            data: {
                content: StartEAxisJogString,
            },
        };
        dataFactory.setData(StartEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[39]);
            });
    }

    //外部轴停止点动
    $scope.Index_stopEAxisJog = function () {
        var StopEAxisJogString = "StopExtAxisJog";
        let StopEAxisJogCmd = {
            cmd: 240,
            data: {
                content: StopEAxisJogString,
            },
        };
        dataFactory.setData(StopEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[40]);
            });
    }

    /* FT功能区 */
    $scope.FT_gain = 10;
    $scope.FT_Control_Fx = 0;
    $scope.FT_Control_Fy = 0;
    $scope.FT_Control_Fz = 0;
    $scope.FT_Control_Tx = 0;
    $scope.FT_Control_Ty = 0;
    $scope.FT_Control_Tz = 0;
    /** 读取FT坐标系配置文件 */
    function getFTcfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.Index_selectedFTCoord = $scope.FTReferenceCoordData[~~data.forcesensor_refcoord];
                if (~~data.forcesensor_refcoord == 0) {
                    $scope.currentFTCoord = "Tool";
                } else if (~~data.forcesensor_refcoord == 1) {
                    $scope.currentFTCoord = "Base";
                } else {
                    $scope.currentFTCoord = "Custom";
                    $scope.selectedFTCoord.x = parseFloat(data.forcesensor_coord_x).toFixed(3);
                    $scope.selectedFTCoord.y = parseFloat(data.forcesensor_coord_y).toFixed(3);
                    $scope.selectedFTCoord.z = parseFloat(data.forcesensor_coord_z).toFixed(3);
                    $scope.selectedFTCoord.rx = parseFloat(data.forcesensor_coord_a).toFixed(3);
                    $scope.selectedFTCoord.ry = parseFloat(data.forcesensor_coord_b).toFixed(3);
                    $scope.selectedFTCoord.rz = parseFloat(data.forcesensor_coord_c).toFixed(3);
                }
                // 获取机器人IO配置项
                $scope.DOCfgArr = [~~data.ctl_do8_config, ~~data.ctl_do9_config, ~~data.ctl_do10_config, ~~data.ctl_do11_config,
                    ~~data.ctl_do12_config, ~~data.ctl_do13_config, ~~data.ctl_do14_config, ~~data.ctl_do15_config];
                $scope.DICfgArr = [~~data.ctl_di8_config, ~~data.ctl_di9_config, ~~data.ctl_di10_config, ~~data.ctl_di11_config,
                    ~~data.ctl_di12_config, ~~data.ctl_di13_config, ~~data.ctl_di14_config, ~~data.ctl_di15_config];
                $scope.endDICfgArr = [~~data.tool_di1_config, ~~data.tool_di2_config];
                getTempIOAliasData();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 读取FT自定义坐标系配置文件 */
    function getFTCustomCfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.selectedFTCoord.x = parseFloat(data.forcesensor_coord_x).toFixed(3);
                $scope.selectedFTCoord.y = parseFloat(data.forcesensor_coord_y).toFixed(3);
                $scope.selectedFTCoord.z = parseFloat(data.forcesensor_coord_z).toFixed(3);
                $scope.selectedFTCoord.rx = parseFloat(data.forcesensor_coord_a).toFixed(3);
                $scope.selectedFTCoord.ry = parseFloat(data.forcesensor_coord_b).toFixed(3);
                $scope.selectedFTCoord.rz = parseFloat(data.forcesensor_coord_c).toFixed(3);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 选择自定义坐标系时，读取上次配置的FT坐标系配置文件 */
    $scope.getFTCoord = function() {
        locateContent($scope.ftEvent, "#robot-support-info");
        if ($scope.Index_selectedFTCoord.id == '2') {
            getFTCustomCfg();
        }
    }

    /** 设置外部轴坐标系 */
    $scope.FT_SetRCS = function () {
        let setRCSContent;
        let tempFTCoord;
        switch ($scope.Index_selectedFTCoord.id) {
            case '0':
                setRCSContent = `FT_SetRCS(${$scope.Index_selectedFTCoord.id},{0,0,0,0,0,0})`;
                tempFTCoord = 'Tool';
                break;
            case '1':
                setRCSContent = `FT_SetRCS(${$scope.Index_selectedFTCoord.id},{0,0,0,0,0,0})`;
                tempFTCoord = 'Base';
                break;
            case '2':
                if (Object.keys($scope.selectedFTCoord).some(item => $scope.selectedFTCoord[item] == null || $scope.selectedFTCoord[item] == undefined || $scope.selectedFTCoord[item] == '')) {
                    toastFactory.info(indexDynamicTags.info_messages[39]);
                    return;
                }
                setRCSContent = `FT_SetRCS(${$scope.Index_selectedFTCoord.id},{${$scope.selectedFTCoord.x},${$scope.selectedFTCoord.y},${$scope.selectedFTCoord.z},${$scope.selectedFTCoord.rx},${$scope.selectedFTCoord.ry},${$scope.selectedFTCoord.rz}})`;
                tempFTCoord = 'Custom';
                break;
            default:
                break;
        }
        let FT_SetRCSCmd = {
            cmd: 525,
            data: {
                content: setRCSContent,
            }
        };
        dataFactory.setData(FT_SetRCSCmd)
            .then(() => {
                $scope.currentFTCoord = tempFTCoord;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //牵引示教
    $scope.currentFT = [0, 0, 0, 0, 0, 0];
    $scope.FT_Jog = function (index) {
        let FT_JogCmd = {
            cmd: 523,
            data: {
                content: "FT_Jog(" + index + "," + $scope.index_selectedFTSensorCoorde.id + "," + $scope.FT_Control_Fx + "," + $scope.FT_Control_Fy + "," + $scope.FT_Control_Fz
                    + "," + $scope.FT_Control_Tx + "," + $scope.FT_Control_Ty + "," + $scope.FT_Control_Tz + "," + $scope.FT_gain + ")",
            },
        };
        dataFactory.setData(FT_JogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }


    /**获取当前正在运行的程序文件并显示 */
    $scope.getlastprog_flag = 1;
    //获取用户文件
    function getUserFiles() {
        if ($scope.getlastprog_flag) {
            let getCmd = {
                cmd: "get_user_data",
                data: {
                    type: '1'
                }
            };
            dataFactory.getData(getCmd)
                .then((data) => {
                    $scope.lasetproguserData = data;
                    getExDeviceCfg();
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    };

    //获取启动项配置文件
    function getExDeviceCfg() {
        $scope.getlastprog_flag = 0;
        let getCmd = {
            cmd: "get_ex_device_cfg",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                if (data.tm_last_prog_name != undefined) {
                    let lastprogname = (data.tm_last_prog_name).substring(8);
                    if (lastprogname in $scope.lasetproguserData) {
                        let lastprogpgvalue = $scope.lasetproguserData[lastprogname].pgvalue;
                        sessionStorage.setItem('lastprogname', lastprogname);
                        sessionStorage.setItem('lastprogpgvalue', lastprogpgvalue);
                    }
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[41]);
            });

    };

    /* 远心不动点（RCM） */
    // init RCM
    function getRCMcfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.RCMEnableStatus = ~~data.rcm_enable;
                if ($scope.RCMEnableStatus == 1) {
                    $scope.RCMEnable = true;
                } else {
                    $scope.RCMEnable = false;
                }
                $scope.RCMCoordX = data.rcm_coord_x;
                $scope.RCMCoordY = data.rcm_coord_y;
                $scope.RCMCoordZ = data.rcm_coord_z;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // [580] 设置参考点
    $scope.setRCMRefPoint = function (pointIndex) {
        let setCmd = {
            cmd: 580,
            data: {
                content: "RCMSetRefPoint("+ pointIndex +")"
            }
        };
        dataFactory.setData(setCmd)
            .then((data) => {
                if (pointIndex == 1) {
                    $scope.show_RCM_Edit1 = false;
                    $scope.show_RCM_Edit2 = true;
                    $scope.show_RCM_Edit3 = false;
                    $scope.show_RCM_Edit4 = false;
                } else if (pointIndex == 2) {
                    $scope.show_RCM_Edit1 = false;
                    $scope.show_RCM_Edit2 = false;
                    $scope.show_RCM_Edit3 = true;
                    $scope.show_RCM_Edit4 = false;
                } else if (pointIndex == 3) {
                    $scope.show_RCM_Edit1 = false;
                    $scope.show_RCM_Edit2 = false;
                    $scope.show_RCM_Edit3 = false;
                    $scope.show_RCM_Edit4 = true;
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[42]);
            });
    }

    // [581] 远心不动点计算
    $scope.calculateRCMCoord = function () {
        let setCmd = {
            cmd: 581,
            data: {
                content: "RCMCoordCalculate()"
            }
        };
        dataFactory.setData(setCmd)
            .then((data) => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[43]);
            });
    }

    document.addEventListener('581', e => {
        $scope.RCMCoordX = JSON.parse(e.detail).x;
        $scope.RCMCoordY = JSON.parse(e.detail).y;
        $scope.RCMCoordZ = JSON.parse(e.detail).z;
        $scope.show_RCM_Edit = false;
        $scope.show_RCM_Edit1 = false;
        $scope.show_RCM_Edit2 = false;
        $scope.show_RCM_Edit3 = false;
        $scope.show_RCM_Edit4 = false;
        locateContent($scope.rcmEvent, "#robot-support-info");
    });

    // [582] 远心不动点清除
    $scope.clearRCMCoord = function () {
        let setCmd = {
            cmd: 582,
            data: {
                content: "RCMCoordClear()"
            }
        };
        dataFactory.setData(setCmd)
            .then((data) => {
                $scope.RCMCoordX = "";
                $scope.RCMCoordY = "";
                $scope.RCMCoordZ = "";
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[44]);
            });
    }

    // [583] 远心不动点功能开关
    $scope.enableRCMCoord = function () {
        let tempStatus = 1 ^ $scope.RCMEnableStatus;
        let setCmd = {
            cmd: 583,
            data: {
                content: "RCMEnable(" + tempStatus + ")"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
                $scope.RCMEnableStatus = 1 ^ $scope.RCMEnableStatus;
                if ($scope.RCMEnableStatus) {
                    $scope.RCMEnable = true;
                } else {
                    $scope.RCMEnable = false;
                }
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[45]);
            });

    }

    // 开始编辑远心不动点流程
    $scope.editRCMCoord = function () {
        $scope.show_RCM_Edit = true;
        $scope.show_RCM_Edit1 = true;
        locateContent($scope.rcmEvent, "#robot-support-info");
    }

    // 远心不动点上一步功能
    $scope.backEditRCMCoord = function (stepIndex) {
        if (stepIndex == 1) {
            $scope.show_RCM_Edit1 = true;
            $scope.show_RCM_Edit2 = false;
            $scope.show_RCM_Edit3 = false;
        } else if (stepIndex == 2) {
            $scope.show_RCM_Edit1 = false;
            $scope.show_RCM_Edit2 = true;
            $scope.show_RCM_Edit3 = false;
        } else if (stepIndex == 3) {
            $scope.show_RCM_Edit1 = false;
            $scope.show_RCM_Edit2 = false;
            $scope.show_RCM_Edit3 = true;
        }
    }


    /* 触摸点按长按点动 */
    let t_actFlag = -1;
    let mouseDownTime;
    let mouseUpTime;
    let touchStartTime;
    var t_timeID;
    var timeID;
    let mouseupFlag = -1;

    $scope.actTouchStart = function (jointNum, direction) {
        if ("1" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else {
            touchStartTime = getTimeNow();
            if (t_timeID != null) {
                clearInterval(t_timeID);
                t_timeID = null;
            }
            t_timeID = setInterval(() => {

                let t_timeEnd = getTimeNow();
                if (t_timeEnd - touchStartTime > 400) {
                    startJOG(jointNum, direction);
                    clearInterval(t_timeID);
                }
            }, 100);
        }
    }

    $scope.actTouchEnd = function () {
        stopJOG();
        clearInterval(t_timeID);
    }

    $scope.actMouseDown = function (jointNum, direction) {
        if ("1" != $scope.controlMode) {
            toastFactory.warning(indexDynamicTags.warning_messages[0]);
        } else {
            $scope.jointNum = jointNum;
            $scope.direction = direction;
            mouseupFlag = 0;
            mouseDownTime = getTimeNow();
            if (timeID != null) {
                clearInterval(timeID);
                timeID = null;
            }
            timeID = setInterval(() => {
                let timeEnd = getTimeNow();
                if (timeEnd - mouseDownTime >= 400) {
                    startJOG(jointNum, direction);
                    clearInterval(timeID);
                    timeID = null;
                }
            }, 100);
        }
    }

    document.addEventListener("mouseup", function () {

        switch (mouseupFlag) {
            case 0:
                if (timeID != null) {
                    clearInterval(timeID);
                    timeID = null;
                }
                if (2 == $scope.selectedCoordSys.value) {
                    stopTool();
                } else {
                    stopJOG();
                };
                mouseupFlag = -1;
                break;
            default:
                break;
        }
    }, false);

    function startJOG(jointNum, direction) {
        if ($("#maxDistance")[0].value == null || $("#maxDistance")[0].value == undefined || $("#maxDistance")[0].value == '') {
            toastFactory.info(indexDynamicTags.info_messages[34]);
            return;
        }
        if ($scope.maxDistance == null || $scope.maxDistance == '' || $scope.maxDistance == undefined) {
            $scope.maxDistance = $("#maxDistance")[0].value;
        }
        let startJOGString;
        if (1 == $scope.selectedCoordSys.value) {
            startJOGString = "StartJOG(" + 2 + "," + jointNum + "," + direction + "," + $scope.speed + "," + $scope.acceleration + "," + $scope.maxDistance + ")";
        } else if (0 == $scope.selectedCoordSys.value) {
            startJOGString = "StartJOG(" + 0 + "," + jointNum + "," + direction + "," + $scope.speed + "," + $scope.acceleration + "," + $scope.maxDistance + ")";
        } else if (2 == $scope.selectedCoordSys.value) {
            startJOGString = "StartJOG(" + 4 + "," + jointNum + "," + direction + "," + $scope.speed + "," + $scope.acceleration + "," + $scope.maxDistance + ")";
        } else if (3 == $scope.selectedCoordSys.value) {
            startJOGString = "StartJOG(" + 8 + "," + jointNum + "," + direction + "," + $scope.speed + "," + $scope.acceleration + "," + $scope.maxDistance + ")";
        }
        let startJOGCmd = {
            cmd: 232,
            data: {
                content: startJOGString
            }
        };

        dataFactory.setData(startJOGCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[46]);
            });
    }

    function stopTool() {
        let stopToolString = "stopTool";
        let stopToolCmd = {
            cmd: 235,
            data: {
                content: stopToolString
            }
        };

        dataFactory.setData(stopToolCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[47]);
            });
    }

    function stopJOG() {
        let stopJOGString = "StopJOG";
        let stopJOGCmd = {
            cmd: 233,
            data: {
                content: stopJOGString
            }
        };

        dataFactory.setData(stopJOGCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[48]);
            });
    }

    let jointsData;
    let lastJointsData;
    $scope.moveDescartesTcp;
    $scope.moveDescartesJoint;
    var reconnectID;
    var reconnectTimeID;
    let temp_handlej;
    let temp_updatej;
    let temp_handletcp;
    let temp_updatetcp;
    let temp_handlebasetcp;
    let temp_updatebasetcp;

    $scope.conveyor_encoder_pos = 0;
    $scope.EAxisRDY = [0, 0, 0, 0];
    $scope.EAxisINPOS = [0, 0, 0, 0];
    $scope.exAxisPos = [1, 0, 0, 0];
    $scope.exAxisSpeed = [1, 0, 0, 0];
    $scope.weldTrackSpeed = 7.132;
    $scope.moveDescartesJoint = {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }
    $scope.updateJointsData = {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }
    $scope.jointsData = {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }

    $scope.updateTCPData = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.currentTCP = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.updateBaseTCPData = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.currentBaseTCP = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }

    /*小数位点后一位发生变化时更新页面显示数据*/
    //处理用于判断更新数据，保留一位小数
    function handleJointData() {
        //joints数据处理
        $scope.updateJointsData.j1 = parseInt(temp_handlej.j1 * 100) / 100;
        $scope.updateJointsData.j2 = parseInt(temp_handlej.j2 * 100) / 100;
        $scope.updateJointsData.j3 = parseInt(temp_handlej.j3 * 100) / 100;
        $scope.updateJointsData.j4 = parseInt(temp_handlej.j4 * 100) / 100;
        $scope.updateJointsData.j5 = parseInt(temp_handlej.j5 * 100) / 100;
        $scope.updateJointsData.j6 = parseInt(temp_handlej.j6 * 100) / 100;
        //工件tcp数据处理
        $scope.updateTCPData.x = parseInt(temp_handletcp.x * 100) / 100;
        $scope.updateTCPData.y = parseInt(temp_handletcp.y * 100) / 100;
        $scope.updateTCPData.z = parseInt(temp_handletcp.z * 100) / 100;
        $scope.updateTCPData.rx = parseInt(temp_handletcp.rx * 100) / 100;
        $scope.updateTCPData.ry = parseInt(temp_handletcp.ry * 100) / 100;
        $scope.updateTCPData.rz = parseInt(temp_handletcp.rz * 100) / 100;
        //工具TCP数据处理
        $scope.updateBaseTCPData.x = parseInt(temp_handlebasetcp[0] * 100) / 100;
        $scope.updateBaseTCPData.y = parseInt(temp_handlebasetcp[1] * 100) / 100;
        $scope.updateBaseTCPData.z = parseInt(temp_handlebasetcp[2] * 100) / 100;
        $scope.updateBaseTCPData.rx = parseInt(temp_handlebasetcp[3] * 100) / 100;
        $scope.updateBaseTCPData.ry = parseInt(temp_handlebasetcp[4] * 100) / 100;
        $scope.updateBaseTCPData.rz = parseInt(temp_handlebasetcp[5] * 100) / 100;
    }

    //判断是否更新数据
    function updateJointData() {
        //joints数据处理
        if (($scope.updateJointsData.j1 != parseFloat(temp_updatej.j1).toFixed(2)) || ($scope.updateJointsData.j1 != parseFloat($scope.jointsData.j1).toFixed(2))) {
            $scope.jointsData.j1 = temp_updatej.j1;
        }
        if (($scope.updateJointsData.j2 != parseFloat(temp_updatej.j2).toFixed(2)) || ($scope.updateJointsData.j2 != parseFloat($scope.jointsData.j2).toFixed(2))) {
            $scope.jointsData.j2 = temp_updatej.j2;
        }
        if (($scope.updateJointsData.j3 != parseFloat(temp_updatej.j3).toFixed(2)) || ($scope.updateJointsData.j3 != parseFloat($scope.jointsData.j3).toFixed(2))) {
            $scope.jointsData.j3 = temp_updatej.j3;
        }
        if (($scope.updateJointsData.j4 != parseFloat(temp_updatej.j4).toFixed(2)) || ($scope.updateJointsData.j4 != parseFloat($scope.jointsData.j4).toFixed(2))) {
            $scope.jointsData.j4 = temp_updatej.j4;
        }
        if (($scope.updateJointsData.j5 != parseFloat(temp_updatej.j5).toFixed(2)) || ($scope.updateJointsData.j5 != parseFloat($scope.jointsData.j5).toFixed(2))) {
            $scope.jointsData.j5 = temp_updatej.j5;
        }
        if (($scope.updateJointsData.j6 != parseFloat(temp_updatej.j6).toFixed(2)) || ($scope.updateJointsData.j6 != parseFloat($scope.jointsData.j6).toFixed(2))) {
            $scope.jointsData.j6 = temp_updatej.j6;
        }

        //tcp数据处理
        if (($scope.updateTCPData.x != parseFloat(temp_updatetcp.x).toFixed(2)) || ($scope.updateTCPData.x != parseFloat($scope.currentTCP.x).toFixed(2))) {
            $scope.currentTCP.x = temp_updatetcp.x;
        }
        if (($scope.updateTCPData.y != parseFloat(temp_updatetcp.y).toFixed(2)) || ($scope.updateTCPData.y != parseFloat($scope.currentTCP.y).toFixed(2))) {
            $scope.currentTCP.y = temp_updatetcp.y;
        }
        if (($scope.updateTCPData.z != parseFloat(temp_updatetcp.z).toFixed(2)) || ($scope.updateTCPData.z != parseFloat($scope.currentTCP.z).toFixed(2))) {
            $scope.currentTCP.z = temp_updatetcp.z;
        }
        if (($scope.updateTCPData.rx != parseFloat(temp_updatetcp.rx).toFixed(2)) || ($scope.updateTCPData.rx != parseFloat($scope.currentTCP.rx).toFixed(2))) {
            $scope.currentTCP.rx = temp_updatetcp.rx;
        }
        if (($scope.updateTCPData.ry != parseFloat(temp_updatetcp.ry).toFixed(2)) || ($scope.updateTCPData.ry != parseFloat($scope.currentTCP.ry).toFixed(2))) {
            $scope.currentTCP.ry = temp_updatetcp.ry;
        }
        if (($scope.updateTCPData.rz != parseFloat(temp_updatetcp.rz).toFixed(2)) || ($scope.updateTCPData.rz != parseFloat($scope.currentTCP.rz).toFixed(2))) {
            $scope.currentTCP.rz = temp_updatetcp.rz;
        }

        //tcp数据处理
        if (($scope.updateBaseTCPData.x != parseFloat(temp_updatebasetcp[0]).toFixed(2)) || ($scope.updateBaseTCPData.x != parseFloat($scope.currentBaseTCP.x).toFixed(2))) {
            $scope.currentBaseTCP.x = temp_updatebasetcp[0];
        }
        if (($scope.updateBaseTCPData.y != parseFloat(temp_updatebasetcp[1]).toFixed(2)) || ($scope.updateBaseTCPData.y != parseFloat($scope.currentBaseTCP.y).toFixed(2))) {
            $scope.currentBaseTCP.y = temp_updatebasetcp[1];
        }
        if (($scope.updateBaseTCPData.z != parseFloat(temp_updatebasetcp[2]).toFixed(2)) || ($scope.updateBaseTCPData.z != parseFloat($scope.currentBaseTCP.z).toFixed(2))) {
            $scope.currentBaseTCP.z = temp_updatebasetcp[2];
        }
        if (($scope.updateBaseTCPData.rx != parseFloat(temp_updatebasetcp[3]).toFixed(2)) || ($scope.updateBaseTCPData.rx != parseFloat($scope.currentBaseTCP.rx).toFixed(2))) {
            $scope.currentBaseTCP.rx = temp_updatebasetcp[3];
        }
        if (($scope.updateBaseTCPData.ry != parseFloat(temp_updatebasetcp[4]).toFixed(2)) || ($scope.updateBaseTCPData.ry != parseFloat($scope.currentBaseTCP.ry).toFixed(2))) {
            $scope.currentBaseTCP.ry = temp_updatebasetcp[4];
        }
        if (($scope.updateBaseTCPData.rz != parseFloat(temp_updatebasetcp[5]).toFixed(2)) || ($scope.updateBaseTCPData.rz != parseFloat($scope.currentBaseTCP.rz).toFixed(2))) {
            $scope.currentBaseTCP.rz = temp_updatebasetcp[5];
        }
    }

    /*模拟量数据显示处理*/
    //处理AO模拟量数据
    function handleAoData(Aodata) {
        let length = Aodata.length;
        for (let i = 0; i < length; i++) {
            $scope.analog_output[i] = Aodata[i].toFixed(1);
        }
        $scope.clAOValue = $scope.analog_output[$scope.clAOSelected.num];
        $scope.toolAOValue = $scope.analog_output[4];
    }

    $scope.selectedCtrlAO = function() {
        $scope.clAOValue = $scope.analog_output[$scope.clAOSelected.num];
    }

    //处理AI模拟量数据
    function handleAiData(Aidata) {
        let length = Aidata.length;
        for (let i = 0; i < length; i++) {
            $scope.analog_input[i] = Aidata[i].toFixed(1);
        }
    }

    //配置文件检查提示
    $scope.index_cfg_check_tips = "";

    /* 前后端连接状态心跳确认（断线重连） */
    let consCount = 1;
    function checkCons() {
        $("#consLoading").text(indexDynamicTags.info_messages[18] + consCount);
        let cmdContent = {
            cmd: "cons"
        };
        dataFactory.staData(cmdContent)
            .then(() => {
                viewer.dispatchEvent(new CustomEvent('geometry-loaded', { bubbles: true, cancelable: true, composed: true }));
                let consLoadingPage = document.getElementById("consLoadingPage");
                consLoadingPage.style.display = "none";
                consCount = 0;
                $("#loadPercentage").text("");
            }, () => {
                consCount++;
                checkCons();
            });
    }

    /** web界面锁屏信息获取 */
    function getRobotLock() {
        let getRobotLockCmd = {
            cmd: "get_lock_cfg"
        };
        dataFactory.getData(getRobotLockCmd).then((data) => {
            if (data.day == -1) {
                $scope.isSetLock = false;
            } else if (data.day == 0) {
                $scope.logout();
            } else if (data.day > 0) {
                $scope.isSetLock = true;
                $scope.usageDays = data.day;
                if (data.day < 6) {
                    $('#lockRemindModal').modal();
                } else {
                    $('#lockRemindModal').modal('hide');
                }
            }
        }, (status) => {
            toastFactory.error(status, indexDynamicTags.error_messages[65]);
            /* test */
            // const data = {
            //     day: 6,
            //     date: '2024-04-30'
            // };
            // if (data.day == -1) {
            //     $scope.isSetLock = false;
            // } else if (data.day == 0) {
            //     $scope.logout();
            // } else if (data.day > 0) {
            //     $scope.isSetLock = true;
            //     $scope.usageDays = data.day;
            //     if (data.day < 6) {
            //         $('#lockRemindModal').modal();
            //     } else {
            //         $('#lockRemindModal').modal('hide');
            //     }
            // }
            /* ./test */
        });
    }

    /* After model loaded, updata jointsData */
    viewer.addEventListener('geometry-loaded', () => {
        let setFBJson;
        let PositiveLimitFlg;
        let NegativeLimitFlg;
        let lastProgramState = 0;
        let lastPauseParameter;
        let currPauseParameter;
        let jiabaoLeftStationInfo;
        let jiabaoRightStationInfo;
        let piStatusData;
        let lastKeySwitchArr;
        let currKeySwitchArr;
        let lastStartBtn;
        let currStartBtn;
        let lastStopBtn;       // 默认1-未按下
        let currStopBtn;
        let lastPlusBtnsArr;   // 默认1-未按下
        let currPlusBtnsArr;
        let lastMinusBtnsArr;  // 默认1-未按下
        let currMinusBtnsArr;
        let lastWorkpieceCSIndex;  // 工件坐标系序号
        let currWorkpieceCSIndex;
        let lastExAxisCSIndex;  // 扩展轴坐标系序号
        let currExAxisCSIndex;
        let lastCons = 0;
        let socketError = 0;
        let lastPointTableName; //上次点位表名称
        let currPointTableName; //当前点位表名称
        let lastToolName; //上次工具坐标系名称
        let currToolName; //当前工具坐标系名称
        let lastWobjName; //上次工件坐标系名称
        let currWobjName; //当前工件坐标系名称
        let pointErrorFlag; //记录指令点关节位置与末端位姿不符错误
        let lastRobotCtrlMode; // 记录机器人上次模式（本地/远程），用于判断当前机器人模式与上次模式不一样时，处理业务的场景
        let setTimeFlag;//远程模式定时器开/关状态
        $scope.ptData = {
            line_number: 0,
            ndf_layer: 0,
            ndf_id: 0,
            ndf_row: 0,
            currentRunningProgram: ''
        };
        $scope.recordState = 0; //记录焊接中断状态反馈 breakoff
        $scope.upgradeProcess = 0; // 系统升级进度
        let updateInterval;
        function getBasic(socketData) {
            if (!$.isEmptyObject(socketData)) {
                /* basic数据处理 */
                const data = socketData;
                // 实时数据——笛卡尔坐标：tcp；关节角度：joints；系统时间：time_now；:tl_cur_pos_base;
                jointsData = data.joints;
                temp_handlej = data.joints;
                temp_updatej = data.joints;
                temp_handletcp = data.tcp;
                temp_updatetcp = data.tcp;
                $scope.qnxSysTime = data.time_now;
                if (isMidNight($scope.qnxSysTime)) {
                    getRobotLock();
                }
                // 系统升级进度
                if (data['upgrade_info'] != undefined && data['upgrade_info'] != null) {
                    if (!$.isEmptyObject(data['upgrade_info'])) {
                        $scope.upgradeProcess = data.upgrade_info.upgrade_process;
                        $scope.upgradeError = data.upgrade_info.upgrade_error;
                        if (updateInterval) {
                            clearInterval(updateInterval);
                        }
                        updateInterval = setInterval(() => {
                            if (document.getElementById('update').value < 60 && $scope.upgradeProcess < 60) {
                                document.getElementById('update').value = Number(document.getElementById('update').value) + Number(1);
                            } else {
                                clearInterval(updateInterval);
                            }
                        }, 1000);
                    }
                }
                if ($scope.upgradeProcess > 0 && $scope.upgradeProcess < 100) {
                    // 升级中
                    $('#updatePage').css("display", "block");
                    $('#updateLog').css("display", "block");
                    $('#updateText').css("display", "none");
                    $('#updateError').css("display", "none");
                    $('#updateClose').css("display", "none");
                    if (Number(document.getElementById('update').value) < $scope.upgradeProcess) {
                        document.getElementById('update').value = $scope.upgradeProcess;
                    }
                } else if ($scope.upgradeProcess == 100) {
                    // 升级成功
                    $('#updatePage').css("display", "block");
                    $('#updateLog').css("display", "none");
                    $('#updateText').css("display", "block");
                    $('#updateError').css("display", "none");
                    $('#updateClose').css("display", "none");
                } else if ($scope.upgradeProcess == 0) {
                    // 未升级
                    $('#updatePage').css("display", "none");
                    $('#updateLog').css("display", "none");
                    $('#updateText').css("display", "none");
                    $('#updateError').css("display", "none");
                    $('#updateClose').css("display", "none");
                } else {
                    // 升级失败
                    $('#updatePage').css("display", "block");
                    $('#updateLog').css("display", "none");
                    $('#updateText').css("display", "none");
                    $scope.updateError = $scope.upgradeError;
                    $('#updateError').css("display", "block");
                    $('#updateClose').css("display", "block");
                }
                if (data['tl_cur_pos_base'] != undefined && data['tl_cur_pos_base'] != null) {
                    temp_handlebasetcp = data.tl_cur_pos_base;
                    temp_updatebasetcp = data.tl_cur_pos_base;
                    handleJointData();
                    updateJointData();
                }
                // 非实时数据
                // 程序运行状态
                if (data['pre_program'] != undefined && data['pre_program'] != null) {
                    $scope.programRunStatus = data.pre_program;
                }
                // 当前应用的点位表名称
                if (data['point_table'] != undefined && data['point_table'] != null) {
                    g_appliedPointTableName = data.point_table;
                }
                // 控制箱数字输出
                if (data['cl_do'] != undefined && data['cl_do'] != null) {
                    $scope.clDO = data.cl_do;
                }
                // 控制箱数字输入
                if (data['cl_di'] != undefined && data['cl_di'] != null) {
                    $scope.clDI = data.cl_di;
                }
                // 末端工具数字输出
                if (data['tl_do'] != undefined && data['tl_do'] != null) {
                    $scope.toolDO = data.tl_do;
                }
                // 末端工具数字输入
                if (data['tl_di'] != undefined && data['tl_di'] != null) {
                    $scope.toolDI = data.tl_di;
                }
                // 控制箱模拟 DI 输入
                if (data['vir_cl_di'] != undefined && data['vir_cl_di'] != null) {
                    $scope.vir_clDI = data.vir_cl_di;
                }
                // 末端工具模拟 DI 输入
                if (data['vir_tl_di'] != undefined && data['vir_tl_di'] != null) {
                    $scope.vir_toolDI = data.vir_tl_di;
                }
                // 模拟 AI 输入，2个控制箱， 1个末端工具
                if (data['vir_ai'] != undefined && data['vir_ai'] != null) {
                    $scope.vir_analog_input = data.vir_ai;
                }
                // 外部控制箱数字输出
                if (data['ext_do'] != undefined && data['ext_do'] != null) {
                    $scope.AuxclDO = data.ext_do;
                }
                // 外部控制箱数字输入
                if (data['ext_di'] != undefined && data['ext_di'] != null) {
                    $scope.AuxclDI = data.ext_di;
                }
                // 外部模拟输出
                if (data['ext_ao'] != undefined && data['ext_ao'] != null) {
                    $scope.aux_analog_output = data.ext_ao;
                }
                // 外部模拟输入
                if (data['ext_ai'] != undefined && data['ext_ai'] != null) {
                    $scope.aux_analog_input = data.ext_ai;
                }
                // 模拟输出，4个控制箱，2个末端工具
                if (data['ao'] != undefined && data['ao'] != null) {
                    handleAoData(data.ao);
                }
                // 模拟输入，4个控制箱，2个末端工具
                if (data['ai'] != undefined && data['ai'] != null) {
                    handleAiData(data.ai);
                }
                // 当前机器人模式
                if (data['mode'] != undefined && data['mode'] != null) {
                    $scope.controlMode = data.mode;
                    $scope.modeName = $scope.modeArray[data.mode].mode_name;
                    sessionStorage.setItem('controlMode', JSON.stringify($scope.controlMode));
                }
                // 当前工具号
                if (data['toolnum'] != undefined && data['toolnum'] != null) {
                    $scope.currentCoord = data.toolnum;
                }
                // 远程模式机器人配置信息数据处理————工具坐标系参数 上次和当前工具坐标系，若不同则触发
                if (lastToolName == undefined) {
                    lastToolName = $scope.currentCoord;
                    currToolName = $scope.currentCoord;
                    $scope.selectIndexToolCoorde = $scope.index_ToolCoordeData.filter(item => item.id == lastToolName)[0];
                    if (g_systemFlag) {
                        $scope.selectedindexEndLoad = $scope.indexEndLoadData[$scope.selectIndexToolCoorde.load_id];
                    }
                } else {
                    lastToolName = currToolName;
                    currToolName = $scope.currentCoord;
                    if (currToolName != lastToolName) {
                        $scope.selectIndexToolCoorde = $scope.index_ToolCoordeData.filter(item => item.id == currToolName)[0];
                        //负载坐标系参数
                        if (g_systemFlag) {
                            $scope.selectedindexEndLoad = $scope.indexEndLoadData[$scope.selectIndexToolCoorde.load_id];
                        }
                    }
                }
                // 当前工件号
                if (data['workpiecenum'] != undefined && data['workpiecenum'] != null) {
                    $scope.currentWobjCoord = data.workpiecenum;
                    // 示教管理中工件坐标系名称
                    $scope.currentWobjCoordDis = "Wobj" + data.workpiecenum;
                }
                // 远程模式机器人配置信息数据处理————工件坐标系参数 上次和当前工具坐标系，若不同则触发
                if (lastWobjName == undefined) {
                    lastWobjName = $scope.currentWobjCoord;
                    currWobjName = $scope.currentWobjCoord;
                    $scope.selectWObjCoordeDataDisplay = $scope.wObjCoordeNewData[lastWobjName];
                } else {
                    lastWobjName = currWobjName;
                    currWobjName = $scope.currentWobjCoord;
                    if (currWobjName != lastWobjName) {
                        $scope.selectWObjCoordeDataDisplay = $scope.wObjCoordeNewData[currWobjName];
                    }
                } 
                if ($scope.controlWorkpiece) {
                    if (forceRenderingWorkpieceCS) {
                        viewer.displayCoordinateSystem(2,
                            (($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['x']) / 1000).toFixed(4),
                            (($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['y']) / 1000).toFixed(4),
                            (($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['z']) / 1000).toFixed(4),
                            (parseInt($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['rx'])).toFixed(1),
                            (parseInt($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['ry'])).toFixed(1),
                            (parseInt($scope.WObjCoordeData_Display["wobjcoord" + $scope.currentWobjCoord]['rz'])).toFixed(1),
                            0.3
                        );
                        forceRenderingWorkpieceCS = 0;
                        if (lastWorkpieceCSIndex == undefined) {
                            lastWorkpieceCSIndex = $scope.currentWobjCoord;
                            currWorkpieceCSIndex = $scope.currentWobjCoord;
                        }
                    } else {
                        if (lastWorkpieceCSIndex == undefined) {
                            lastWorkpieceCSIndex = $scope.currentWobjCoord;
                            currWorkpieceCSIndex = $scope.currentWobjCoord;
                            // 初始化工件坐标系三维模型
                            viewer.displayCoordinateSystem(2,
                                (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['x']) / 1000).toFixed(4),
                                (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['y']) / 1000).toFixed(4),
                                (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['z']) / 1000).toFixed(4),
                                (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['rx'])).toFixed(1),
                                (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['ry'])).toFixed(1),
                                (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['rz'])).toFixed(1),
                                0.3
                            );
                        } else {
                            lastWorkpieceCSIndex = currWorkpieceCSIndex;
                            currWorkpieceCSIndex = $scope.currentWobjCoord;
                            if (currWorkpieceCSIndex != lastWorkpieceCSIndex) {
                                // 更新工件坐标系三维模型
                                viewer.clearCoordinateSystem(2);
                                viewer.displayCoordinateSystem(2,
                                    (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['x']) / 1000).toFixed(4),
                                    (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['y']) / 1000).toFixed(4),
                                    (($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['z']) / 1000).toFixed(4),
                                    (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['rx'])).toFixed(1),
                                    (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['ry'])).toFixed(1),
                                    (parseInt($scope.WObjCoordeData_Display["wobjcoord" + currWorkpieceCSIndex]['rz'])).toFixed(1),
                                    0.3
                                );
                            }
                        }
                    }
                }
                // 绘制轨迹
                if (data['tl_cur_pos_base'] != undefined && data['tl_cur_pos_base'] != null) {
                    if (DrawTrackFlg && $scope.controlTrack) {
                        startDrawTrack((data.tl_cur_pos_base[0]).toFixed(1) / 1000, (data.tl_cur_pos_base[1]).toFixed(1) / 1000, (data.tl_cur_pos_base[2]).toFixed(1) / 1000);
                    }
                }
                //  示教管理中工具坐标系名称处理
                if (data['tl_cur_pos_base'] != undefined && data['tl_cur_pos_base'] != null) {
                    if ($scope.currentCoord < $scope.indexToolCoordeTotal) {
                        $scope.currentCoordDis = "Tool" + $scope.currentCoord;
                        if ($scope.controlTool) {
                            viewer.clearCoordinateSystem(1);
                            viewer.displayCoordinateSystem(1,
                                (data.tl_cur_pos_base[0]).toFixed(1) / 1000,
                                (data.tl_cur_pos_base[1]).toFixed(1) / 1000,
                                (data.tl_cur_pos_base[2]).toFixed(1) / 1000,
                                (data.tl_cur_pos_base[3]).toFixed(1),
                                (data.tl_cur_pos_base[4]).toFixed(1),
                                (data.tl_cur_pos_base[5]).toFixed(1),
                                0.2
                            );
                        }
                    } else {
                        viewer.clearCoordinateSystem(1);
                        $scope.currentCoord = $scope.currentCoord - $scope.indexToolCoordeTotal;
                        $scope.currentCoordDis = "Etool" + $scope.currentCoord;
                    }
                }
                // $scope.robotTypeCode = data.robot_type;
                // $scope.robotType = $scope.robotTypeDict[data.robot_type].typename;
                // 设定后检查零点是否设定成功
                if (data['flag_zero_set'] != undefined && data['flag_zero_set'] != null) {
                    $scope.zeroFlag = ~~(data.flag_zero_set);
                }
                if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                    document.getElementById('systemSetting').dispatchEvent(new CustomEvent('zeroset', { bubbles: true, cancelable: true, composed: true, detail: $scope.zeroFlag }));
                }
                // 外部轴位置
                if (data['exAxisPos'] != undefined && data['exAxisPos'] != null) {
                    $scope.exAxisPos = data.exAxisPos;
                    document.dispatchEvent(new CustomEvent('exaxisstate', { bubbles: true, cancelable: true, composed: true, detail: data.exAxisPos }));
                }
                // 外部轴速度
                if (data['exAxisSpeedBack'] != undefined && data['exAxisSpeedBack'] != null) {
                    $scope.exAxisSpeed = data.exAxisSpeedBack;
                }
                // 外部轴伺服准备好
                if (data['exAxisRDY'] != undefined && data['exAxisRDY'] != null) {
                    $scope.EAxisRDY = data.exAxisRDY;
                }
                // 外部轴伺服到位
                if (data['exAxisINPOS'] != undefined && data['exAxisINPOS'] != null) {
                    $scope.EAxisINPOS = data.exAxisINPOS;
                }
                // 外部轴回零状态
                if (data['exAxisHomeStatus'] != undefined && data['exAxisHomeStatus'] != null) {
                    g_zeroStateInit = data.exAxisHomeStatus;
                    document.dispatchEvent(new CustomEvent('EAxisZero', { bubbles: true, cancelable: true, composed: true, detail: data.exAxisHomeStatus }));
                    if (document.getElementById("peripheral") != null && document.getElementById("peripheral") != undefined) {
                        document.getElementById("peripheral").dispatchEvent(new CustomEvent('EAxisZero', { bubbles: true, cancelable: true, composed: true, detail: data.exAxisHomeStatus }));
                    } else if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('EAxisZero', { bubbles: true, cancelable: true, composed: true, detail: data.exAxisHomeStatus }));
                    }
                }
                // 当前外部轴运动状态，0-完成，1-运动中，2-暂停中，3-暂停完成
                if (data['exAxisMotionStatus'] != undefined && data['exAxisMotionStatus'] != null) {
                    $scope.exAxisMotionStatus = data.exAxisMotionStatus;
                }
                // Register var
                if (data['var'] != undefined && data['var'] != null) {
                    combineVar(data.var.num_total,data.var.num_name,data.var.num_value,data.var.str_total,data.var.str_name,data.var.str_value)
                }
                // 暂停功能
                if (data['pause_parameter'] != undefined && data['pause_parameter'] != null) {
                    $scope.pauseParameter = data.pause_parameter;
                }
                if (lastPauseParameter == undefined) {
                    lastPauseParameter = $scope.pauseParameter;
                    currPauseParameter = $scope.pauseParameter;
                } else {
                    lastPauseParameter = currPauseParameter;
                    currPauseParameter = $scope.pauseParameter;
                }
                if (lastPauseParameter == 0 && currPauseParameter != 0) {
                    document.dispatchEvent(new CustomEvent('pauseFunc', { bubbles: true, cancelable: true, composed: true, detail: currPauseParameter }));
                    // lastPauseParameter = currPauseParameter;
                } else if (lastPauseParameter != 0 && currPauseParameter == 0) {
                    document.dispatchEvent(new CustomEvent('pauseFunc', { bubbles: true, cancelable: true, composed: true, detail: currPauseParameter }));
                    // lastPauseParameter = currPauseParameter;
                }
                // modbus 数据状态
                if (data['modbus'] != undefined && data['modbus'] != null) {
                    if (!$.isEmptyObject(data.modbus)) {
                        $scope.modbusStateData = data.modbus;
                    } else {
                        $scope.modbusStateData = {
                            slaveDI: [],
                            slaveDO: [],
                            slaveAI: [],
                            slaveAO: [],
                            masterstate: [],
                            mastervalue: [],
                            slaveFuncDIState: [],//从站功能DI输入状态
                            slaveDOCtrlDIState: [],//从站控制DO输出功能的DI输入状态
                            slaveConnect: 0,//modbus从站连接状态
                        }
                    }
                }
                // 扩展轴伺服驱动器状态反馈
                if (data['aux_servo_state'] != undefined && data['aux_servo_state'] != null) {
                    $scope.auxServoData = data.aux_servo_state;
                }
                // 打磨设备状态反馈
                if (data['polishing_state'] != undefined && data['polishing_state'] != null) {
                    $scope.polishData = data.polishing_state;
                    $scope.polishPosInfo = ($scope.polishData.pos).toFixed(2);
                    if ($scope.polishData.operationmode != 0) {
                        $scope.polishModeInfo = $scope.polishModeData.filter(item => item.id == $scope.polishData.operationmode)[0].name;
                    }
                }
                //控制器开放协议运行状态
                if (data['ctrl_openlua'] != undefined && data['ctrl_openlua'] != null) {
                    $scope.ctrlOpenluaData = data.ctrl_openlua;
                    //bit0-bit3对应协议编号0-3的运行状态，0-未运行，1-运行中
                    $scope.ctrlOpenLuaRunningData = $scope.ctrlOpenluaData.ctrlOpenLuaRunningState;
                    //4个控制器外设协议错误码
                    $scope.ctrlOpenLuaErrCodeData = $scope.ctrlOpenluaData.ctrlOpenLuaErrCode.split(",");
                }
                //安全板通信健康检测数据
                if (data['safetyBoardComSendCount'] != undefined && data['safetyBoardComSendCount'] != null) {
                    $scope.safetyBoardCount = data.safetyBoardComSendCount;
                }
                if (data['safetyBoardComRecvCount'] != undefined && data['safetyBoardComRecvCount'] != null) {
                    $scope.safetyBoardRecvCount = data.safetyBoardComRecvCount;
                }
                // 机器人远程模式状态反馈
                if (g_systemFlag == 1) {
                    if (data['remote_ctrl_interface'] != undefined && data['remote_ctrl_interface'] != null) {
                        $scope.robotControlMode = data.remote_ctrl_interface;
                        $scope.remoteControlMode = data.remote_ctrl_interface.robot_ctrl_mode;
                        $scope.robotControlModeName = data.remote_ctrl_interface.robot_ctrl_mode == 0 ? indexDynamicTags.info_messages[35] : indexDynamicTags.info_messages[36];
                        // 机器人肩状态
                        $scope.shoulderConfigData = $scope.shoulderModeData[~~data.remote_ctrl_interface.shoulderconfig].name;
                        // 机器人肘状态
                        $scope.elbowConfigData = $scope.elbowModeData[~~data.remote_ctrl_interface.elbowconfig].name;
                        // 机器人腕状态
                        $scope.wristConfigData = $scope.wristModeData[~~data.remote_ctrl_interface.wristconfig].name;
                        // 机器人本地/远程模式状态
                        if (lastRobotCtrlMode != $scope.robotControlMode.robot_ctrl_mode) {
                            if ($scope.robotControlMode.robot_ctrl_mode == 1) {
                                getRobotFCIMode();
                                $scope.halfBothView();
                                $('#vRobot-view').css('z-index', 1048);
                                $('#remoteControlStatusPage').show();
                            } else {
                                $('#remoteControlStatusPage').hide();
                                if (document.getElementById('peripheral') != null) {
                                    document.getElementById('peripheral').dispatchEvent(new CustomEvent('open_remote_setting', { bubbles: true, cancelable: true, composed: true }));
                                }
                            }
                            lastRobotCtrlMode = $scope.robotControlMode.robot_ctrl_mode;
                        }
                    }
                    if ($scope.remoteControlMode) {
                        // 如果在远程模式,开启定时器
                        if (setTimeFlag != 1) {
                            clearInterval(repeatFlag);
                            repeatFlag = setInterval(repeatRefreshData, 10000);
                            setTimeFlag = 1;
                        }
                    } else {
                        clearInterval(repeatFlag); //退出远程模式，关闭定时器
                        setTimeFlag = 0;
                    }
                }
                // 焊机设备状态反馈
                if (data['weld_state'] != undefined && data['weld_state'] != null) {
                    $scope.weldStatusData = data.weld_state;
                }
                // 焊接中断状态反馈
                if (data['reweld_break_off_state'] != undefined && data['reweld_break_off_state'] != null) {
                    $scope.reweldBreakData = data.reweld_break_off_state;
                    if ($scope.reweldBreakData.breakoff == 0) {
                        if ($scope.recordState != 0) {
                            $scope.recordState = 0;
                        }
                    } else {
                        if ($scope.recordState == 0 && $scope.reWeldEnableOpen == 1) {
                            $scope.recordState = 1;
                        }
                    }
                }

                // 通讯
                if (data['cmdpointerror'] != undefined && data['cmdpointerror'] != null) {
                    $scope.pointError = data.cmdpointerror; // 0-正常 83：UDP通讯异常 84:通讯丢包异常
                    if ($scope.pointError == 83 || $scope.pointError == 84) {
                        if (pointErrorFlag != true) {
                            $("#errorlist").click();
                            pointErrorFlag = true;
                        }
                    } else {
                        pointErrorFlag = false;
                    }
                }

                // 末端Lua文件异常
                if (data['endLuaErrCode'] != undefined && data['endLuaErrCode'] != null) {
                    $scope.pointErrorNew = data.endLuaErrCode; // 0-正常；1-异常
                    if ($scope.pointErrorNew == 1) {
                        if (pointErrorFlag != true) {
                            $("#errorlist").click();
                            pointErrorFlag = true;
                        }
                    } else {
                        pointErrorFlag = false;
                    }
                }
                // 判断按钮盒状态
                if (data['pushBtnBoxState'] != undefined && data['pushBtnBoxState'] != null) {
                    $scope.pushBtnBoxState = ~~data.pushBtnBoxState;
                }
                if ($scope.indexSafeStopMode == 1) {
                    if ($scope.pushBtnBoxState == 1) {
                        var mainbody_mychar = document.getElementById("indexmainbody");
                        if (mainbody_mychar) {
                            mainbody_mychar.style.display = "none";
                        }
                        var mainbodytips_mychar = document.getElementById("indexmaintips");
                        if (mainbodytips_mychar) {
                            mainbodytips_mychar.style.display = "";
                        }
                    } else {
                        var mainbody_mychar = document.getElementById("indexmainbody");
                        if (mainbody_mychar) {
                            mainbody_mychar.style.display = "";
                        }
                        var mainbodytips_mychar = document.getElementById("indexmaintips");
                        if (mainbodytips_mychar) {
                            mainbodytips_mychar.style.display = "none";
                        }
                    }
                } else {
                    var mainbody_mychar = document.getElementById("indexmainbody");
                    if (mainbody_mychar) {
                        mainbody_mychar.style.display = "";
                    }
                    var mainbodytips_mychar = document.getElementById("indexmaintips");
                    if (mainbodytips_mychar) {
                        mainbodytips_mychar.style.display = "none";
                    }
                }
                // 机器人使能状态
                if (data['rbtEnableState'] != undefined && data['rbtEnableState'] != null) {
                    if (~~data.rbtEnableState == 1) {
                        $scope.showEnable = true;
                        $scope.showDisEnable = false;
                    } else {
                        $scope.showEnable = false;
                        $scope.showDisEnable = true;
                    }
                }
                // 焊缝跟踪速度
                if (data['weldTrackSpeed'] != undefined && data['weldTrackSpeed'] != null) {
                    $scope.weldTrackSpeed = data.weldTrackSpeed.toFixed(3);
                }
                // 传送带速度
                if (data['conveyor_speed'] != undefined && data['conveyor_speed'] != null) {
                    $scope.conveyorSpeed = data.conveyor_speed.toFixed(3);
                }
                // 传送带工件当前位置
                if (data['conveyorWorkPiecePos'] != undefined && data['conveyorWorkPiecePos'] != null) {
                    $scope.conveyorWorkPiecePos = data.conveyorWorkPiecePos.toFixed(3);
                }
                // 传送带编码器位置
                if (data['conveyor_encoder_pos'] != undefined && data['conveyor_encoder_pos'] != null) {
                    $scope.conveyor_encoder_pos = data.conveyor_encoder_pos;
                }
                // 负载辨识结果
                if (data['loadidentifydata'] != undefined && data['loadidentifydata'] != null && data['loadidentifydata'].length) {
                    $scope.IDentWeight = data.loadidentifydata[0];
                    $scope.IDentX = data.loadidentifydata[1];
                    $scope.IDentY = data.loadidentifydata[2];
                    $scope.IDentZ = data.loadidentifydata[3];
                }
                // 操作区
                if ($scope.clDOSelected != undefined && $scope.clDOSelected != null) {
                    changeCtrlDOOnorOff($scope.clDOSelected.num);
                }
                // 控制区
                if ($scope.toolDOSelected != undefined && $scope.toolDOSelected != null) {
                    changeToolDOOnorOff($scope.toolDOSelected.num);
                }
                // 扩展轴坐标系
                if (data['exaxisnum'] != undefined && data['exaxisnum'] != null) {
                    $scope.currentEAxisCoordDis = "ExAxis" + data.exaxisnum;
                    $scope.exaxisNum = data.exaxisnum;
                }
                if ($scope.controlExAxis) {
                    if (forceRenderingExAxisCS) {
                        viewer.displayCoordinateSystem(3,
                            (($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['x']) / 1000).toFixed(4),
                            (($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['y']) / 1000).toFixed(4),
                            (($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['z']) / 1000).toFixed(4),
                            (parseInt($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['rx'])).toFixed(1),
                            (parseInt($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['ry'])).toFixed(1),
                            (parseInt($scope.EAxisCoordeData_Display["exaxis" + $scope.exaxisNum]['rz'])).toFixed(1),
                            0.3
                        );
                        forceRenderingExAxisCS = 0;
                        if (lastExAxisCSIndex == undefined) {
                            lastExAxisCSIndex = $scope.exaxisNum;
                            currExAxisCSIndex = $scope.exaxisNum;
                        }
                    } else {
                        if (lastExAxisCSIndex == undefined) {
                            lastExAxisCSIndex = $scope.exaxisNum;
                            currExAxisCSIndex = $scope.exaxisNum;
                            viewer.displayCoordinateSystem(3,
                                (($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['x']) / 1000).toFixed(4),
                                (($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['y']) / 1000).toFixed(4),
                                (($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['z']) / 1000).toFixed(4),
                                (parseInt($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['rx'])).toFixed(1),
                                (parseInt($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['ry'])).toFixed(1),
                                (parseInt($scope.EAxisCoordeData_Display["exaxis" + currExAxisCSIndex]['rz'])).toFixed(1),
                                0.3
                            );
                        } else {
                            lastExAxisCSIndex = currExAxisCSIndex;
                            currExAxisCSIndex = $scope.exaxisNum;
                            if (currExAxisCSIndex != lastExAxisCSIndex) {
                                viewer.clearCoordinateSystem(3);
                                viewer.displayCoordinateSystem(3,
                                    (($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['x']) / 1000).toFixed(4),
                                    (($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['y']) / 1000).toFixed(4),
                                    (($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['z']) / 1000).toFixed(4),
                                    (parseInt($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['rx'])).toFixed(1),
                                    (parseInt($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['ry'])).toFixed(1),
                                    (parseInt($scope.EAxisCoordeData_Display["exaxis"+currExAxisCSIndex]['rz'])).toFixed(1),
                                    0.3
                                );
                            }
                        }
                    }
                }
                // 编码器类型切换完成标志
                if (data['encoder_type_flag'] != undefined && data['encoder_type_flag'] != null) {
                    $scope.encoder_type_flag = parseInt(data.encoder_type_flag);
                }
                // 当前各轴编码器类型
                if (data['curencodertype'] != undefined && data['curencodertype'] != null) {
                    $scope.curEncoderType = data.curencodertype;
                }
                // 机器人运行速度比例
                if (data['vel_radio'] != undefined && data['vel_radio'] != null) {
                    $scope.currentSpeed = parseInt(data.vel_radio * 100);
                    $scope.speed = $scope.currentSpeed;
                    $("#index_speed")[0].value = $scope.speed;
                }
                // 当前程序运行状态
                if (data['program_state'] != undefined && data['program_state'] != null) {
                    $scope.programStatus = programStatusDict[data.program_state];
                }
                if ("Drag" === $scope.programStatus) {
                    $scope.dragModeName = indexDynamicTags.info_messages[19];
                    $scope.dragMode = 1;
                } else {
                    $scope.dragModeName = indexDynamicTags.info_messages[20];
                    $scope.dragMode = 0;
                }
                // TPD记录状态
                if (data['tpd_record_state'] != undefined && data['tpd_record_state'] != null) {
                    tpd_record_state = ~~data.tpd_record_state;
                    if (0 == tpd_record_state) {
                        $scope.tpdState = indexDynamicTags.info_messages[22];
                    }
                }
                // TPD记录进度百分比
                if (data['tpd_record_scale'] != undefined && data['tpd_record_scale'] != null) {
                    if (1 == tpd_record_state) {
                        $scope.tpdState = indexDynamicTags.info_messages[21] + ~~data.tpd_record_scale + "%";
                    }
                }
                // 力/扭矩传感器数据
                if (data['FT_data'] != undefined && data['FT_data'] != null) {
                    for (let i = 0; i < data.FT_data.length; i++) {
                        if (null == data.FT_data[i]) {
                        } else {
                            $scope.currentFT[i] = data.FT_data[i].toFixed(3);
                        }
                    }
                }
                // 检查机器人连接状态
                if (data['cons'] != undefined && data['cons'] != null) {
                    $scope.connectionStatus = data.cons;
                    $scope.connectionText = $scope.consArray[data.cons];
                }
                if (!lastCons && $scope.connectionStatus) {
                    getModeSwitchSpeedConfig();
                }
                if (lastCons != $scope.connectionStatus) {
                    lastCons = $scope.connectionStatus;
                }
                // 单步执行时，当运行状态是2时，设置lastProgramState为2
                if (soFlg == 1) {
                    if (data.program_state == 2) {
                        DrawTrackFlg = true;
                        if (lastProgramState != 2) {
                            lastProgramState = 2;
                        }
                    }
                }
                // dofile对应层数
                if (data['ndf_layer'] != undefined && data['ndf_layer'] != null) {
                    $scope.ptData.ndf_layer = ~~data.ndf_layer;
                }
                // NewDofile 所在文件层编号
                if (data['ndf_id'] != undefined && data['ndf_id'] != null) {
                    $scope.ptData.ndf_id = ~~data.ndf_id;
                }
                // NewDofile 所在文件程序行行号
                if (data['ndf_row'] != undefined && data['ndf_row'] != null) {
                    $scope.ptData.ndf_row = ~~data.ndf_row;
                }
                // 机器人程序运行行
                if (data['line_number'] != undefined && data['line_number'] != null) {
                    $scope.ptData.line_number = ~~data.line_number;
                }
                //机器人停止状态与最后一行行号同时发送过来需要处理
                if (data.program_state == 2) {
                    $scope.protmpstate = 1;
                }
                // 根据机器人是否是运行状态且单步执行soFlg标志为0更新命令行高亮
                if ($scope.protmpstate == 1 && soFlg == 0) {
                    // if ($scope.trackNumber !== data.line_number) {
                    //     $scope.trackNumber = data.line_number;
                    //     clearTrack();
                    //   DrawTrackFlg = true;
                    // }
                    $scope.ptData.currentRunningProgram = g_fileNameForUpload;
                    if (document.getElementById('programTeach')) {
                        document.getElementById('programTeach').dispatchEvent(new CustomEvent('RL_Highlight', { bubbles: true, cancelable: true, composed: true, detail: $scope.ptData }));   
                    }
                    lastProgramState = 2;
                }
                // 如果上次是程序运行状态并且当前是程序停止状态，则清除所有程序命令行高亮状态
                if (lastProgramState == 2 && data.program_state == 1) {
                    //不清除命令行高亮状态
                    //document.dispatchEvent(new CustomEvent('No_Highlight', { bubbles: true, cancelable: true, composed: true }));
                    lastProgramState = 0;
                    $scope.protmpstate = 0;
                    if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('program-completion', { bubbles: true, cancelable: true, composed: true, detail: data.program_state }));   
                    }
                }
                // 按钮盒急停信号
                if (data['btn_box_stop_signal'] != undefined && data['btn_box_stop_signal'] != null) {
                    if (data.btn_box_stop_signal == 1) {
                        if ($scope.btn_gif_flag) {
                            $scope.btn_gif_flag = 0;
                            var mychar = document.getElementById("carshstop");
                            if (mychar) {
                                mychar.style.display = "block";
                            }
                        }
                    } else if (data.btn_box_stop_signal == 0) {
                        $scope.btn_gif_flag = 1;
                    }
                }
                // 夹爪激活状态
                if (data['gripper_state'] != undefined && data['gripper_state'] != null) {
                    $scope.gripper_state =  data.gripper_state;
                }
                if (document.getElementById("peripheral") != null && document.getElementById("peripheral") != undefined) {
                    document.getElementById('peripheral').dispatchEvent(new CustomEvent('gripperstate', { bubbles: true, cancelable: true, composed: true, detail: $scope.gripper_state }));   
                }
                // 力/扭矩传感器激活状态
                if (data['FT_ActStatus'] != undefined && data['FT_ActStatus'] != null) {
                    $scope.FT_ActStatus = ~~data.FT_ActStatus;
                    //document.dispatchEvent(new CustomEvent('FTstate', { bubbles: true, cancelable: true, composed: true, detail: data.FT_ActStatus }));
                }
                // 状态查询标志：0-未查询；1-查询中
                if (data['state'] != undefined && data['state'] != null) {
                    $scope.queryState = data['state'];
                }
                if (data['set_feedback'] != undefined && data['set_feedback'] != null) {
                    setFBJson = data.set_feedback;
                    if (!$.isEmptyObject(setFBJson)) {
                        for (const name in setFBJson) {
                            // 指令失败提示和处理
                            if (setFBJson[name] == "0") {
                                if (setErrorDict[name] != undefined && setErrorDict[name] != null) {
                                    toastr.error(setErrorDict[name].description + setErrorDict[name][~~setFBJson[name]]);
                                }
                                switch (name) {
                                    case '708':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('708', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '740':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('740', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '742':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('742', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '750':
                                        document.dispatchEvent(new CustomEvent('750', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    default:
                                        break;
                                }
                            // 指令成功处理
                            } else if ((setFBJson[name] == "1") && (name != "105") && (name != "345")) {
                                switch (name) {
                                    case '102':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('102', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '206':
                                        if (document.getElementById("programTeach") != null && document.getElementById("programTeach") != undefined) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('206', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '261':
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('261', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '273':
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('273', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '276':
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('276', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '303':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('303', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '309':
                                        if (document.getElementById("robotSetting") != null || document.getElementById("robotSetting") != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('309', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '313':
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('313', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '323':
                                        document.dispatchEvent(new CustomEvent('323', { bubbles: true, cancelable: true, composed: true }));
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('323', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        if (document.getElementById("safeSet") != null && document.getElementById("safeSet") != undefined) {
                                            document.getElementById("safeSet").dispatchEvent(new CustomEvent('323', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name]}));
                                        }
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('323', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name]}));
                                        }
                                        break;
                                    case '324':
                                        document.dispatchEvent(new CustomEvent('324', { bubbles: true, cancelable: true, composed: true }));
                                        if (document.getElementById("peripheral") != null && document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('324', { bubbles: false, cancelable: true, composed: true }));
                                        }
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('324', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        if (document.getElementById("safeSet") != null && document.getElementById("safeSet") != undefined) {
                                            document.getElementById("safeSet").dispatchEvent(new CustomEvent('324', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name]}));
                                        }
                                        break;
                                    case '332':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('332', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        if (document.getElementById("systemSetting") != null && document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('332', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        if (document.getElementById("peripheral") != null && document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('332', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '337':
                                        document.dispatchEvent(new CustomEvent('337', { bubbles: true, cancelable: true, composed: true }));
                                        break;
                                    case '357':
                                        if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('357', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '369':
                                        if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('369', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '384':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('384', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '391':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('391', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '428':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('428', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '430':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('430', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '432':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('432', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '511':
                                        document.dispatchEvent(new CustomEvent('511', { bubbles: true, cancelable: true, composed: true }));
                                        break;
                                    case '556':
                                        if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                            document.getElementById("robotSetting").dispatchEvent(new CustomEvent('556', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '567':
                                        document.dispatchEvent(new CustomEvent('567', { bubbles: true, cancelable: true, composed: true }));
                                        break;
                                    case '571':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('571', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '631':
                                        document.dispatchEvent(new CustomEvent('631', { bubbles: true, cancelable: true, composed: true }));
                                        break;
                                    case '651':
                                        if (document.getElementById("robotSetting") != null || document.getElementById("robotSetting") != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('651', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '702':
                                        if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('702', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '708':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('708', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '728':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('728', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '741':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('741', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '742':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('742', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        break;
                                    case '743':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('743', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '744':
                                        if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('744', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '745':
                                        if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('745', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '746':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('746', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '748':
                                        if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                            document.getElementById('safeSet').dispatchEvent(new CustomEvent('748', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '750':
                                        document.dispatchEvent(new CustomEvent('750', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case '752':
                                        if (document.getElementById("systemSetting") != null && document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('752', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '754':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('754', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '780':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('780', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '782':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('782', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '783':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('783', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '784':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('784', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '786':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('786', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    // case '787':
                                    //     if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                    //         document.getElementById("peripheral").dispatchEvent(new CustomEvent('787', { bubbles: true, cancelable: true, composed: true }));
                                    //     }
                                    //     break;
                                    case '788':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('788', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '789':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('789', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '790':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('790', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '801':
                                        if (document.getElementById('auxiliaryApplication') != null && document.getElementById('auxiliaryApplication') != undefined) {
                                            document.getElementById('auxiliaryApplication').dispatchEvent(new CustomEvent('801', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '813':
                                        document.dispatchEvent(new CustomEvent('813', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case '814':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('814', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '827':
                                        if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('827', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '828':
                                        if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('828', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '834':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('834', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '947':
                                        if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                            document.getElementById("peripheral").dispatchEvent(new CustomEvent('947', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        if (document.getElementById("auxiliaryApplication") != null || document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('947', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '954':
                                        if (document.getElementById("auxiliaryApplication") != null || document.getElementById("auxiliaryApplication") != undefined) {
                                            document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('954', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                    case '955':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('955', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '966':
                                        if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                            document.getElementById("systemSetting").dispatchEvent(new CustomEvent('966', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '1021':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1021', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '1022':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1022', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '1024':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1024', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '1025':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1025', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    case '1026':
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1026', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                            // 指令数据或处理（不论成功失败）
                            switch (name) {
                                case '105':
                                    if (!g_isRunStepOver) {
                                        document.dispatchEvent(new CustomEvent('105', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    } else {
                                        if (document.getElementById("programTeach") != null && document.getElementById("programTeach") != undefined) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('105', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                    }
                                    break;
                                case '229':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('229', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '250':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('250', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '252':
                                    if (document.getElementById('weldguide') != null && document.getElementById('weldguide') != undefined) {
                                        document.getElementById('weldguide').dispatchEvent(new CustomEvent('252', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '262':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('262', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '274':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('274', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '277':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('277', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '278':
                                    document.dispatchEvent(new CustomEvent('278', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '289':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('289', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '283':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('283', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '314':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('314', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '320':
                                    if (apply_joint_flag) {
                                        document.dispatchEvent(new CustomEvent('320', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    } else {
                                        if (document.getElementById('auxiliaryApplication') != null && document.getElementById('auxiliaryApplication') != undefined) {
                                            document.getElementById('auxiliaryApplication').dispatchEvent(new CustomEvent('320', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                            document.getElementById('peripheral').dispatchEvent(new CustomEvent('320', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                            document.getElementById('robotSetting').dispatchEvent(new CustomEvent('320', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }
                                        if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                            document.getElementById('systemSetting').dispatchEvent(new CustomEvent('320', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        }

                                    }
                                    break;
                                case '325':
                                    document.dispatchEvent(new CustomEvent('325', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '327':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('327', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '329':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('329', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '345':
                                    // 机器人设置事件
                                    if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                        document.getElementById("robotSetting").dispatchEvent(new CustomEvent('345', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    // 机器人本体
                                    if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                        document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('345', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    // 系统设置事件
                                    if (document.getElementById("systemSetting") != null && document.getElementById("systemSetting") != undefined) {
                                        document.getElementById("systemSetting").dispatchEvent(new CustomEvent('345', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '380':
                                    if (document.getElementById('teachingManagement') != null && document.getElementById('teachingManagement') != undefined) {
                                        g_modifyPointFlag = 1;
                                        g_refreshTableFlag = 1;
                                        document.getElementById('teachingManagement').dispatchEvent(new CustomEvent('380', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '386':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('386', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '390':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('390', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '393':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('393', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('393', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '400':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('400', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '423':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('423', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '424':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('424', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '429':
                                    if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                        document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('429', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '500':
                                    var error_500_index = setFBJson[name].indexOf(":");//判断是否是整条错误
                                    let record_500_error;
                                    if (error_500_index != -1) {//不是整条错误
                                        let errorCodeArr = setFBJson[name].split(':');//判断能分割成几段
                                        if (errorCodeArr.length == 4) {
                                            if (errorCodeArr[3] == 88 || errorCodeArr[3] == 90 || errorCodeArr[3] == 91) {
                                                $scope.index_cfg_check_tips = indexDynamicTags.error_messages[49];
                                            }
                                            var luafileindex = errorCodeArr[0].indexOf("fruser");
                                            if (luafileindex != -1) {
                                                //判断是不是lua报错是否需要提供行号
                                                //日志记录500错误
                                                record_500_error = {
                                                    cmd: "record_500_error",
                                                    data: {
                                                        "error_info": setErrorDict[name].description + setErrorDict[name][~~errorCodeArr[3]] + indexDynamicTags.error_messages[54] + errorCodeArr[1],
                                                    }
                                                };
                                                toastr.error(setErrorDict[name].description + setErrorDict[name][~~errorCodeArr[3]] + indexDynamicTags.error_messages[54] + errorCodeArr[1]);
                                            } else {
                                                record_500_error = {
                                                    cmd: "record_500_error",
                                                    data: {
                                                        "error_info": setErrorDict[name].description + setErrorDict[name][~~errorCodeArr[3]],
                                                    }
                                                };
                                                toastr.error(setErrorDict[name].description + setErrorDict[name][~~errorCodeArr[3]]);
                                            }
                                        } else if (errorCodeArr.length == 3) {
                                            var luafileindex = errorCodeArr[0].indexOf("fruser");
                                            if (luafileindex != -1) {//判断是不是lua报错是否需要提供行号
                                                //日志记录500错误
                                                record_500_error = {
                                                    cmd: "record_500_error",
                                                    data: {
                                                        "error_info": setErrorDict[name].description + errorCodeArr[2] + indexDynamicTags.error_messages[54] + errorCodeArr[1],
                                                    }
                                                };
                                                toastr.error(setErrorDict[name].description + errorCodeArr[2] + indexDynamicTags.error_messages[54] + errorCodeArr[1]);
                                            } else {
                                                record_500_error = {
                                                    cmd: "record_500_error",
                                                    data: {
                                                        "error_info": setErrorDict[name].description + errorCodeArr[2],
                                                    }
                                                };
                                                toastr.error(setErrorDict[name].description + errorCodeArr[2]);
                                            }
                                        }
                                    } else {//整条错误
                                        record_500_error = {
                                            cmd: "record_500_error",
                                            data: {
                                                "error_info": setErrorDict[name].description + setFBJson[name],
                                            }
                                        };
                                        toastr.error(setErrorDict[name].description + setFBJson[name]);
                                    }
                                    //日志记录500错误
                                    dataFactory.actData(record_500_error);
                                    break;
                                case '501':
                                    if (setFBJson[name] == "2") {
                                        toastr.warning(setErrorDict[name].description);
                                    }
                                    break;
                                case '502':
                                    if (setFBJson[name] == "2") {
                                        document.dispatchEvent(new CustomEvent('ptnboxpoint', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    } else if (setFBJson[name] == "3") {
                                        $scope.runptnboxflag = 1;
                                        $scope.index_uploadProgName();
                                    } else if (setFBJson[name] == "4") {
                                        if (document.getElementById('programTeach')) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('No_Highlight', { bubbles: true, cancelable: true, composed: true }));
                                        }
                                    } else if (setFBJson[name] == "5") {
                                        toastFactory.warning(indexDynamicTags.warning_messages[25]);
                                    } else if (setFBJson[name] == "11") {
                                        document.dispatchEvent(new CustomEvent('tpdget', { bubbles: true, cancelable: true, composed: true }));
                                    }  else if (setFBJson[name] == "21") {//撤销键按下
                                        if (document.getElementById('programTeach')) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: 10, speed: 0, index: $scope.index_smartArr_count }}));
                                        }
                                    } else if (setFBJson[name] == "22") {//清空键按下
                                        if (document.getElementById('programTeach')) {
                                            document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: 11, speed: 0, index: $scope.index_smartArr_count }}));
                                        }
                                    } else if (setFBJson[name] == "23") {//A键按下
                                        if (document.getElementById('programTeach')) {
                                            if($scope.index_smartArr[0][0] < 3){
                                                document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                            } else {
                                                handleSmartToolSingle(setFBJson[name]);
                                            }
                                        }
                                    } else if (setFBJson[name] == "24") {//B键按下
                                        if (document.getElementById('programTeach')) {
                                            if($scope.index_smartArr[1][0] < 3){
                                                document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                            } else {
                                                handleSmartToolSingle(setFBJson[name]);
                                            }
                                        }
                                    } else if (setFBJson[name] == "25") {//C键按下
                                        if (document.getElementById('programTeach')) {
                                            if($scope.index_smartArr[2][0] < 3){
                                                document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                            } else {
                                                handleSmartToolSingle(setFBJson[name]);
                                            }
                                        }
                                    } else if (setFBJson[name] == "26") {//D键按下
                                        if (document.getElementById('programTeach')) {
                                            if($scope.index_smartArr[3][0] < 3){
                                                document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                            } else {
                                                handleSmartToolSingle(setFBJson[name]);
                                            }
                                        }
                                    } else if (setFBJson[name] == "27") {//E键按下
                                        if (document.getElementById('programTeach')) {
                                            if($scope.index_smartArr[4][0] < 3){
                                                document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                            } else {
                                                handleSmartToolSingle(setFBJson[name]);
                                            }
                                        }
                                    } else if (setFBJson[name] == "28") {//IO键按下
                                        if($scope.index_smartArr[5][2] == 1 || $scope.index_smartArr[5][2] == 2){
                                            document.dispatchEvent(new CustomEvent('smarttoolpoint', { bubbles: true, cancelable: true, composed: true, detail: { type: setFBJson[name] } }));
                                        } else {
                                            handleSmartToolSingle(setFBJson[name]);
                                        }
                                    } else if (setFBJson[name] == "29") {
                                        $scope.modeSwitch();//切换机器人模式
                                    } else if (setFBJson[name] == "30") {
                                        $scope.runptnboxflag = 1;
                                        $scope.index_uploadProgName();//运行程序
                                    }
                                    break;
                                case '527':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('527', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '530':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('530', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '532':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('532', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '546':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('546', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]}));
                                    }
                                    break;
                                case '557':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('557', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '572':
                                    if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                        document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('572', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '579':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('579', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '581':
                                    document.dispatchEvent(new CustomEvent('581', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '620':
                                    if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                        document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('620', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    if (document.getElementById("peripheral") != null && document.getElementById("peripheral") != undefined) {
                                        document.getElementById("peripheral").dispatchEvent(new CustomEvent('620', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '633':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('633', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '639':
                                    document.dispatchEvent(new CustomEvent('639', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '646':
                                    if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                        document.getElementById("robotSetting").dispatchEvent(new CustomEvent('646', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '647':
                                    if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                        document.getElementById("robotSetting").dispatchEvent(new CustomEvent('647', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '657':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('657', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '658':
                                    if (document.getElementById("robotSetting") != null && document.getElementById("robotSetting") != undefined) {
                                        document.getElementById("robotSetting").dispatchEvent(new CustomEvent('658', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '659':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('659', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '663':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('663', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '664':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('664', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '675':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('675', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '682':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('682', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '685':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('685', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '703':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('703', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '709':
                                    if (document.getElementById("systemSetting") != null || document.getElementById("systemSetting") != undefined) {
                                        document.getElementById("systemSetting").dispatchEvent(new CustomEvent('709', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '729':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('729', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '730':
                                    // 机器人从站健康状态数据反馈
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('730', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '747':
                                    if (document.getElementById('safeSet') != null && document.getElementById('safeSet') != undefined) {
                                        document.getElementById('safeSet').dispatchEvent(new CustomEvent('747', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '751':
                                    document.dispatchEvent(new CustomEvent('751', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '753':
                                    if (document.getElementById("systemSetting") != null && document.getElementById("systemSetting") != undefined) {
                                        document.getElementById("systemSetting").dispatchEvent(new CustomEvent('753', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '761':
                                    if (document.getElementById('pollishingSystem') != null && document.getElementById('pollishingSystem') != undefined) {
                                        document.getElementById('pollishingSystem').dispatchEvent(new CustomEvent('761', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '781':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('781', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '803':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('803', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '805':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('805', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    document.dispatchEvent(new CustomEvent('805', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    break;
                                case '815':
                                    document.dispatchEvent(new CustomEvent('815', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('815', { bubbles: false, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '829':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('829', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '830':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('830', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '833':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('833', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '852':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('852', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '853':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('853', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '854':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('854', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '873':
                                    if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                        document.getElementById('programTeach').dispatchEvent(new CustomEvent('873', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '886':
                                    if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                        document.getElementById('programTeach').dispatchEvent(new CustomEvent('886', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    if (document.getElementById('nodeEditor') != null && document.getElementById('nodeEditor') != undefined) {
                                        document.getElementById('nodeEditor').dispatchEvent(new CustomEvent('886', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    if (document.getElementById('graphicalProgramming') != null && document.getElementById('graphicalProgramming') != undefined) {
                                        document.getElementById('graphicalProgramming').dispatchEvent(new CustomEvent('886', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '889':
                                    if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                        document.getElementById('programTeach').dispatchEvent(new CustomEvent('889', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    if (document.getElementById('nodeEditor') != null && document.getElementById('nodeEditor') != undefined) {
                                        document.getElementById('nodeEditor').dispatchEvent(new CustomEvent('889', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    if (document.getElementById('graphicalProgramming') != null && document.getElementById('graphicalProgramming') != undefined) {
                                        document.getElementById('graphicalProgramming').dispatchEvent(new CustomEvent('889', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '912':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('912', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '924':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('924', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '928':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('928', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '929':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('929', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '934':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('934', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '935':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('935', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '939':
                                    if (document.getElementById('programTeach') != null && document.getElementById('programTeach') != undefined) {
                                        document.getElementById('programTeach').dispatchEvent(new CustomEvent('939', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '944':
                                    if (document.getElementById("auxiliaryApplication") != null && document.getElementById("auxiliaryApplication") != undefined) {
                                        document.getElementById("auxiliaryApplication").dispatchEvent(new CustomEvent('944', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '945':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('945', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '948':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('948', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '956':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('956', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                case '960':
                                    if (document.getElementById("robotSetting") != null || document.getElementById("robotSetting") != undefined) {
                                        document.getElementById("robotSetting").dispatchEvent(new CustomEvent('960', { bubbles: true, cancelable: true, composed: true }));
                                    }
                                    break;
                                case '965':
                                    if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                        document.getElementById("peripheral").dispatchEvent(new CustomEvent('965', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '968':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('968', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '977':
                                    if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                        document.getElementById("peripheral").dispatchEvent(new CustomEvent('977', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '978':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('978', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '979':
                                    if (document.getElementById("peripheral") != null || document.getElementById("peripheral") != undefined) {
                                        document.getElementById("peripheral").dispatchEvent(new CustomEvent('979', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '981':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('981', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '982':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('982', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name]  }));
                                    }
                                    break;
                                case '985':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('985', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '989':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('989', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '992':
                                    if (document.getElementById('robotSetting') != null && document.getElementById('robotSetting') != undefined) {
                                        document.getElementById('robotSetting').dispatchEvent(new CustomEvent('992', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '994':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('994', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '1023':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1023', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '1027':
                                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('1027', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '1031':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('1031', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                case '1032':
                                    if (document.getElementById('peripheral') != null && document.getElementById('peripheral') != undefined) {
                                        document.getElementById('peripheral').dispatchEvent(new CustomEvent('1032', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                    }
                                    break;
                                default:
                                    break;
                            }
                            // 当页面存在时且指令执行成功，发布事件
                            if (document.getElementById("torqueSystem") != null) {
                                switch (name) {
                                    case "401":
                                        // 获取起子程序名数组
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('401', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "402":
                                        // 获取起子程序内容
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('402', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "403":
                                        // 保存起子程序
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('403', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "411":
                                        // 设置扭矩系统开关
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('411', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "412":
                                        // 获取扭矩系统开关状态
                                        if (JSON.parse(setFBJson[name]).enable == 1) {
                                            $scope.show_TorqueState = true;
                                            $scope.showTorqueStatus = true;
                                        } else if (JSON.parse(setFBJson[name]).enable == 0) {
                                            $scope.show_TorqueState = false;
                                            $scope.showTorqueStatus = false;
                                        }
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('412', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "413":
                                        // 获取当前扭矩型号参数范围
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('413', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    case "414":
                                        // 获取当前扭矩型号
                                        document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('414', { bubbles: true, cancelable: true, composed: true, detail: setFBJson[name] }));
                                        break;
                                    default:
                                        break;
                                }
                            }
        
                            // 软限位设置成功后更新页面joints slider范围
                            if (name == "308" && setFBJson[name] == "1") {
                                PositiveLimitFlg = true;
                            }
                            if (name == "309" && setFBJson[name] == "1") {
                                NegativeLimitFlg = true;
                            }
                            if (PositiveLimitFlg && NegativeLimitFlg) {
                                getRobotcfg();
                                PositiveLimitFlg = false;
                                NegativeLimitFlg = false;
                            }
                        }
                    }
                }
                // 单关节模型辨识图表数据
                if (data['joint_identify_data'] != undefined && data['joint_identify_data'] != null) {
                    if (document.getElementById('systemSetting') != null && document.getElementById('systemSetting') != undefined) {
                        document.getElementById('systemSetting').dispatchEvent(new CustomEvent('sji-data', { bubbles: true, cancelable: true, composed: true, detail: data.joint_identify_data }));
                    }
                }
                //从站健康监测数据（方法弃用，暂时保留）
                // document.dispatchEvent(new CustomEvent('hal_slave_count', { bubbles: true, cancelable: true, composed: true, detail: {slave_INErr: data.slave_INErr, slave_OUTErr: data.slave_OUTErr} }));
                // 法奥扭矩系统状态反馈
                if (data['torque_sys_state'] != undefined && data['torque_sys_state'] != null) {
                    if (!$.isEmptyObject(data.torque_sys_state)) {
                        document.dispatchEvent(new CustomEvent('torque_state', { bubbles: true, cancelable: true, composed: true, detail: data.torque_sys_state }));
                    }
                }
                // 嘉宝扭矩系统状态反馈
                if (data['jiabao_torque_sys_state'] != undefined && data['jiabao_torque_sys_state'] != null) {
                    if (!$.isEmptyObject(data.jiabao_torque_sys_state)) {
                        jiabaoLeftStationInfo = data.jiabao_torque_sys_state.left_station;
                        jiabaoRightStationInfo = data.jiabao_torque_sys_state.right_station;

                        $scope.leftModel = jiabaoLeftStationInfo.workpiece_id;
                        $scope.leftYield = jiabaoLeftStationInfo.product_count;
                        $scope.leftNGCount = jiabaoLeftStationInfo.NG_count;
                        $scope.leftWorkingTime = jiabaoLeftStationInfo.work_time;

                        $scope.rightModel = jiabaoRightStationInfo.workpiece_id;
                        $scope.rightYield = jiabaoRightStationInfo.product_count;
                        $scope.rightNGCount = jiabaoRightStationInfo.NG_count;
                        $scope.rightWorkingTime = jiabaoRightStationInfo.work_time;
                    }
                }
                /** 码垛系统状态反馈 */
                if (data['palletizing_sys_state'] != undefined && data['palletizing_sys_state'] != null) {
                    if (!$.isEmptyObject(data.palletizing_sys_state)) {
                        $scope.palletizingProductionTimes = data.palletizing_sys_state.times;
                        $scope.palletizingProductionTime = data.palletizing_sys_state.total_time;
                        $scope.palletizingSingleProductionTime = data.palletizing_sys_state.single_time;
                        $scope.palletizingLayerIndex = data.palletizing_sys_state.layer_index;
                        $scope.palletizingBoxIndex = data.palletizing_sys_state.box_index;
                        palletPosition = data.palletizing_sys_state.pallet;
                    }
                }
                /* 示教器IO状态反馈（薄膜按键等） */
                if (data['PI_IO'] != undefined && data['PI_IO'] != null) {
                    if (!$.isEmptyObject(data.PI_IO)) {
                        $scope.show_robotModeSwitchBtn = true;
                        piStatusData = data.PI_IO;
                        // 钥匙开关，自动模式：[0,1]，手动模式：[0,0]   //手自动按钮切换3.7.3
                        if (lastKeySwitchArr == undefined) {
                            // 初始化
                            lastKeySwitchArr = piStatusData.switch;
                            currKeySwitchArr = piStatusData.switch;
                            if (currKeySwitchArr[0] == 0) {
                                if (currKeySwitchArr[1] == 1) {
                                    setMode($scope.modeArray[0].mode_code);
                                } else {
                                    setMode($scope.modeArray[1].mode_code);
                                }
                            }
                        } else {
                            lastKeySwitchArr = currKeySwitchArr;
                            currKeySwitchArr = piStatusData.switch;
                            if (currKeySwitchArr[0] == 0 && lastKeySwitchArr[0] == 0) {
                                if (currKeySwitchArr[1] == 1 && lastKeySwitchArr[1] == 0) {
                                    setMode($scope.modeArray[0].mode_code);
                                } else if (currKeySwitchArr[1] == 0 && lastKeySwitchArr[1] == 1) {
                                    setMode($scope.modeArray[1].mode_code);
                                }
                            }
                        }
                        // 开始按钮，1:按下，默认为0
                        if (lastStartBtn == undefined) {
                            lastStartBtn = piStatusData.start;
                            currStartBtn = piStatusData.start;
                        } else {
                            lastStartBtn = currStartBtn;
                            currStartBtn = piStatusData.start;
                            if (lastStartBtn == 0 && currStartBtn == 1) {
                                $scope.index_uploadProgName();
                            }
                        }
                        // 停止按钮，0:按下，默认为1
                        if (lastStopBtn == undefined) {
                            lastStopBtn = piStatusData.stop;
                            currStopBtn = piStatusData.stop;
                        } else {
                            lastStopBtn = currStopBtn;
                            currStopBtn = piStatusData.stop;
                            if (lastStopBtn == 1 && currStopBtn == 0) {
                                $scope.stopProgram();
                            }
                        }
                        // 轴增，0:按下，默认都为1
                        if (lastPlusBtnsArr == undefined) {
                            lastPlusBtnsArr = piStatusData.axis_plus;
                            currPlusBtnsArr = piStatusData.axis_plus;
                        } else {
                            lastPlusBtnsArr = currPlusBtnsArr;
                            currPlusBtnsArr = piStatusData.axis_plus;
                            for (let i = 0; i < lastPlusBtnsArr.length; i++) {
                                if (currPlusBtnsArr[i] == 0 && lastPlusBtnsArr[i] == 1) {
                                    document.dispatchEvent(new CustomEvent('pi_plus', { bubbles: true, cancelable: true, composed: true, detail: i }));
                                }
                                if (currPlusBtnsArr[i] == 1 && lastPlusBtnsArr[i] == 0) {
                                    document.dispatchEvent(new CustomEvent('pi_stop', { bubbles: true, cancelable: true, composed: true }));
                                }
                            }
                        }

                        // 轴减，0:按下，默认都为1
                        if (lastMinusBtnsArr == undefined) {
                            lastMinusBtnsArr = piStatusData.axis_minus;
                            currMinusBtnsArr = piStatusData.axis_minus;
                        } else {
                            lastMinusBtnsArr = currMinusBtnsArr;
                            currMinusBtnsArr = piStatusData.axis_minus;
                            for (let i = 0; i < lastMinusBtnsArr.length; i++) {
                                if (currMinusBtnsArr[i] == 0 && lastMinusBtnsArr[i] == 1) {
                                    // startJOG
                                    // startJOG(i + 1, 0);
                                    document.dispatchEvent(new CustomEvent('pi_minus', { bubbles: true, cancelable: true, composed: true, detail: i }));
                                }
                                if (currMinusBtnsArr[i] == 1 && lastMinusBtnsArr[i] == 0) {
                                    // stopJOG
                                    document.dispatchEvent(new CustomEvent('pi_stop', { bubbles: true, cancelable: true, composed: true }));
                                }
                            }
                        }
                    } else {
                        $scope.show_robotModeSwitchBtn = false;
                    }
                }
                // 记录点位表名称：上次和当前点位表，若不同则触发
                if (lastPointTableName == undefined) {
                    lastPointTableName = g_appliedPointTableName;
                    currPointTableName = g_appliedPointTableName;
                } else {
                    lastPointTableName = currPointTableName;
                    currPointTableName = g_appliedPointTableName;
                    if (currPointTableName != lastPointTableName) {
                        if (document.getElementById('teachingManagement') != null && document.getElementById('teachingManagement') != undefined) {
                            document.getElementById("teachingManagement").dispatchEvent(new CustomEvent('table_name', { bubbles: true, cancelable: true, composed: true, detail: { last: lastPointTableName, current: currPointTableName} }));
                        }
                    }
                }
                // 多轴联动
                if (lastJointsData == undefined) {
                    lastJointsData = jointsData;
                    document.dispatchEvent(new CustomEvent('joints-update', { bubbles: true, cancelable: true, composed: true, detail: { last: 0, now: jointsData } }));
                } else if (updateJointsFlg == 1) {
                    document.dispatchEvent(new CustomEvent('joints-update', { bubbles: true, cancelable: true, composed: true, detail: { last: -1, now: jointsData } }));
                    updateJointsFlg = 0;
                } else {
                    for (const name in jointsData) {
                        let jointDiff = Math.abs(jointsData[name] - lastJointsData[name]);
                        if (jointDiff > 0.1) {
                            lastJointsData = jointsData;
                            document.dispatchEvent(new CustomEvent('joints-update', { bubbles: true, cancelable: true, composed: true, detail: { last: lastJointsData, now: jointsData } }));
                            break;
                        }
                    }
                }
                // 笛卡尔移动
                if ($scope.moveDescartesTcp == undefined) {
                    $scope.moveDescartesJoint = data.joints;
                    $scope.moveDescartesTcp = data.tcp;
                    document.dispatchEvent(new CustomEvent('joints-update', { bubbles: true, cancelable: true, composed: true, detail: { last: 0, now: $scope.moveDescartesJoint, tcp: $scope.moveDescartesTcp } }));
                } else if (updatedescartesFlg == 1) {
                    $scope.moveDescartesJoint = data.joints;
                    $scope.moveDescartesTcp = data.tcp;
                    document.dispatchEvent(new CustomEvent('joints-update', { bubbles: true, cancelable: true, composed: true, detail: { last: -1, now: $scope.moveDescartesJoint, tcp: $scope.moveDescartesTcp } }));
                    updatedescartesFlg = 0;
                }
                // 根据权限控制机器人三维操作中的TCP、单轴点动和多轴联动的参数名称显示
                if ($scope.robotObjectIndex.length) {
                    checkCoord();
                }
                // error_info：错误信息；alarm_info：警告信息
                if (data['error_info'] != undefined && data['error_info'] != null && data['alarm_info'] != undefined && data['alarm_info'] != null) {
                    creatErrorList(data.error_info, data.alarm_info, data.time_now);
                } else if (data['error_info'] != undefined && data['error_info'] != null && (data['alarm_info'] == undefined || data['alarm_info'] == null)) {
                    creatErrorList(data.error_info, null, data.time_now);
                } else if ((data['error_info'] == undefined && data['error_info'] == null) && data['alarm_info'] != undefined && data['alarm_info'] != null) {
                    creatErrorList(null, data.alarm_info, data.time_now);
                }
                if (data['error_info'] != undefined && data['error_info'] != null) {
                    createJiabaoErrorList(data.time_now, data.error_info);
                    createPalletizingErrorList(data.time_now, data.error_info);
                }
            }
        };
        // websocket发起连接
        if (g_socketStatus == 0) {
            const host = window.location.host;
            g_socketStream = $websocket(`ws://${host}:9999`);   
        }
        // websocket连接成功
        g_socketStream.onOpen(function() {
            socketError = 0;
            if (reconnectID) {
                clearTimeout(reconnectID);
                reconnectID = null;
            }
            if (reconnectTimeID) {
                clearInterval(reconnectTimeID);
                reconnectTimeID = null;
            }
        })
        // websocket连接成功后接受反馈
        g_socketStream.onMessage(function(message) {
            if (message.data == 'websocket close') {
                location = '/login.html';
                g_socketLogoutFlag = 1;
                g_socketStatus = 0;
            } else {
                // 连接成功后，登出标志恢复初始化（置0）
                g_socketLogoutFlag = 0;
                let consLoadingPage = document.getElementById("consLoadingPage");
                if (consLoadingPage) {
                    consCount = 0;
                    consLoadingPage.style.display = "none";
                    $("#consLoading").text('');
                }
                // 连接成功后，返回数据不是对象格式，跳转到登录界面
                if (typeof (JSON.parse(message.data)) != "object") {
                    location = '/login.html';
                    g_socketLogoutFlag = 1;
                    g_socketStatus = 0;
                } else {
                    getBasic(JSON.parse(message.data));
                    g_socketStatus = 1;
                }
            }
        })
        // websocket连接失败
        g_socketStream.onError(function() {
            socketError = 1;
        })
        // websocket断开连接
        g_socketStream.onClose(function() {
            $('#restartPage').css("display", "none");
            g_socketStatus = 0;
            if (reconnectID) {
                clearTimeout(reconnectID);
                reconnectID = null;
            }
            if (reconnectTimeID) {
                clearInterval(reconnectTimeID);
                reconnectTimeID = null;
            }
            if (!g_socketLogoutFlag) {
                let consLoadingPage = document.getElementById("consLoadingPage");
                if (consLoadingPage && !socketError) {
                    consLoadingPage.style.display = "block";
                }
                // 断开连接后读秒
                if (g_socketStatus == 0 && !reconnectTimeID && !socketError) {
                    reconnectTimeID = setInterval(() => {
                        consCount++;
                        $("#consLoading").text(indexDynamicTags.info_messages[18] + consCount);
                    }, 1000);
                }
                // 断开连接后发起重连
                reconnectID = setTimeout(() => {
                    viewer.dispatchEvent(new CustomEvent('geometry-loaded', { bubbles: true, cancelable: true, composed: true }));
                }, 500);
            }
        })
    });

    document.addEventListener('getReweld', () => {
        getWeldingReWeldAfterBreakOffParam();
    })

    /**焊接中断再恢复参数获取*/
    getWeldingReWeldAfterBreakOffParam();
    function getWeldingReWeldAfterBreakOffParam() {
        let getWeldAfterBreakCmd = {
            cmd: 805,
            data: {
                content: "WeldingGetReWeldAfterBreakOffParam()"
            }
        };
        dataFactory.setData(getWeldAfterBreakCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.addEventListener('805', e => {
        let reWeldAfterBreakParam = JSON.parse(e.detail);
        $scope.reWeldEnableOpen = reWeldAfterBreakParam.enable;
    })

    /* 示教器轴增 */
    document.addEventListener("pi_plus", (e) => {
        $scope.actMouseDown(e.detail + 1, 1);
    });

    /* 示教器轴增 */
    document.addEventListener("pi_minus", (e) => {
        $scope.actMouseDown(e.detail + 1, 0);
    });

    /* 示教器轴停止 */
    document.addEventListener("pi_stop", () => {
        switch (mouseupFlag) {
            case 0:
                if (timeID != null) {
                    clearInterval(timeID);
                    timeID = null;
                }
                if (2 == $scope.selectedCoordSys.value) {
                    stopTool();
                } else {
                    stopJOG();
                };
                mouseupFlag = -1;
                break;
            default:
                break;
        }
    });

    document.addEventListener('joints-update', e => {
        let joints = e.detail;
        if (joints != null) {
            if (joints['last'] == 0 || joints['last'] == -1) {
                for (const name in joints['now']) {
                    viewer.setAngle(name, joints['now'][name] * DEG2RAD);
                    viewer.setVirtualAngle(name, joints['now'][name] * DEG2RAD);
                }
                virtualFlg = 1;
            } else {
                viewer.ExecuteSmoothMotion(virtualFlg, joints['last'], joints['now'], 15);
                if (virtualFlg == 0) {
                    let isOver = 0;
                    for (const name in joints['now']) {
                        let diff = Math.abs(parseFloat(joints['now'][name]) - parseFloat(virtualJoints[name]));
                        if (diff > deviation) {
                            isOver = 1;
                        }
                    }
                    if (isOver == 0) {
                        virtualFlg = 1;
                        updateJointsFlg = 1;
                    }
                }
            }
        }
    });

    /* 暂停功能 */
    document.addEventListener('pauseFunc', (e) => {
        let currentPauseParameter = e.detail;
        if (currentPauseParameter != 0) {
            //关闭call显示的modal
            $('#singalCallModal').modal('hide');
            switch (currentPauseParameter) {
                case 1:
                    $scope.customPauseFuncDialogTitle1 = $scope.customPausesArr["1"]["modal_title"];
                    $scope.customPauseTips1 = $scope.customPausesArr["1"]["modal_content"];
                    $("#PauseFunction1Modal").modal();
                    break;
                case 2:
                    $scope.pauseFuncDialogTitle = indexDynamicTags.info_messages[23];
                    $("#PauseFunction2Modal").modal();
                    break;
                case 3:
                    $scope.pauseFuncDialogTitle = indexDynamicTags.info_messages[24];
                    $("#PauseFunction3Modal").modal();
                    break;
                case 4:
                    $scope.pauseFuncDialogTitle = indexDynamicTags.info_messages[25];
                    $("#PauseFunction4Modal").modal();
                    break;
                case 5:
                    $scope.pauseFuncDialogTitle = indexDynamicTags.info_messages[26];
                    $("#PauseFunction5Modal").modal();
                    break;
                case 10:
                    $scope.customPauseFuncDialogTitle10 = $scope.customPausesArr["10"]["modal_title"];
                    $scope.customPauseTips10 = $scope.customPausesArr["10"]["modal_content"];
                    $("#PauseFunction10Modal").modal();
                    break;
                case 11:
                    $scope.customPauseFuncDialogTitle11 = $scope.customPausesArr["11"]["modal_title"];
                    $scope.customPauseTips11 = $scope.customPausesArr["11"]["modal_content"];
                    $("#PauseFunction11Modal").modal();
                    break;
                case 12:
                    $scope.customPauseFuncDialogTitle12 = $scope.customPausesArr["12"]["modal_title"];
                    $scope.customPauseTips12 = $scope.customPausesArr["12"]["modal_content"];
                    $("#PauseFunction12Modal").modal();
                    break;
                case 13:
                    $scope.customPauseFuncDialogTitle13 = $scope.customPausesArr["13"]["modal_title"];
                    $scope.customPauseTips13 = $scope.customPausesArr["13"]["modal_content"];
                    $("#PauseFunction13Modal").modal();
                    break;
                case 14:
                    $scope.customPauseFuncDialogTitle14 = $scope.customPausesArr["14"]["modal_title"];
                    $scope.customPauseTips14 = $scope.customPausesArr["14"]["modal_content"];
                    $("#PauseFunction14Modal").modal();
                    break;
                default:
                    break;
            }
        } else if (currentPauseParameter == 0) {
            $("#PauseFunction1Modal").modal('hide');
            $("#PauseFunction2Modal").modal('hide');
            $("#PauseFunction3Modal").modal('hide');
            $("#PauseFunction4Modal").modal('hide');
            $("#PauseFunction5Modal").modal('hide');
            $("#PauseFunction10Modal").modal('hide');
            $("#PauseFunction11Modal").modal('hide');
            $("#PauseFunction12Modal").modal('hide');
            $("#PauseFunction13Modal").modal('hide');
            $("#PauseFunction14Modal").modal('hide');
        }
    });


    /* 获取所有自定义暂停 */
    function getAllCustomPause() {
        let cmdContent = {
            cmd: "torque_get_all_custom_pause",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.customPausesArr = data;
            }, (status) => {
                toastFactory.error(status);
            });
    }
    getAllCustomPause();

    document.addEventListener('updatePauseData', () => {
        getAllCustomPause();
    });

    /* setSysVarValue */
    $scope.setSysVarValue = function (varID, varValue) {
        let cmdContent = {
            cmd: 511,
            data: {
                content: "SetSysVarValue(" + varID + "," + varValue + ")"
            }
        };
        dataFactory.setData(cmdContent)
            .then((data) => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 511反馈 */
    document.addEventListener('511', () => {
        $scope.pauseResumeProgram('511');
    });

    /* ./暂停功能 */


    /**外设相关记录示教点功能 */
    //获取示教点配置文件
    function getSysCfg() {
        let getSysCfgCmd = {
            cmd: "get_ptn_cfg",
        };
        dataFactory.getData(getSysCfgCmd)
            .then((data) => {
                $scope.prefixName = data.name;
                $scope.limitNumber = data.number;
                $scope.LTRecord_flag = data.laser;
                $scope.luaname_flag = data.flag;
            }, (status) => {
                $scope.prefixName = "P";
                $scope.limitNumber = 3;
                $scope.LTRecord_flag = 0;
                $scope.luaname_flag = 0;
                toastFactory.error(status, indexDynamicTags.error_messages[51]);
            });
    }

    document.addEventListener('updataptnboxcfg', e => {
        $scope.prefixName = e.detail['name'];
        $scope.limitNumber = e.detail['number'];
        $scope.LTRecord_flag = parseInt(e.detail['laser']);
        $scope.luaname_flag = e.detail['flag'];
        $scope.ptnboxPointsFlag = 0;
    });

    //下发传感器记录点指令
    function laserRecord() {
        let LaserRecordCmd = {
            cmd: 278,
            data: {
                content: "LaserTrackDataRecord()",
            },
        };
        dataFactory.setData(LaserRecordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[52]);
            });
    }

    //按钮盒信号记录点
    $scope.ptnboxPointsFlag = 0;
    document.addEventListener('ptnboxpoint', e => {
        if($scope.luaname_flag == 1){
            if (g_fileNameForUpload != undefined && g_fileNameForUpload != '' && g_fileNameForUpload != null) {
                var length = g_fileNameForUpload.length;
                if(null == $scope.ptnboxLuaName){
                    $scope.ptnboxPointsFlag = 0;
                    $scope.ptnboxLuaName = g_fileNameForUpload.substring(0, length-4);
                }else if($scope.ptnboxLuaName == g_fileNameForUpload.substring(0, length-4)){

                }else{
                    $scope.ptnboxPointsFlag = 0;
                    $scope.ptnboxLuaName = g_fileNameForUpload.substring(0, length-4)
                } 
                $scope.ptnboxPointsFlag += 1;
                if ($scope.ptnboxPointsFlag > $scope.limitNumber) {
                    $scope.ptnboxPointsFlag = 1;
                }
                $scope.ptnboxPointName = $scope.ptnboxLuaName + $scope.ptnboxPointsFlag;
            } else {
                toastFactory.info(indexDynamicTags.info_messages[8]);
                return;
            };
        }else{
            if (null == $scope.prefixName) {
                toastFactory.info(indexDynamicTags.info_messages[27]);
                return;
            }
            $scope.ptnboxPointsFlag += 1;
            if ($scope.ptnboxPointsFlag > $scope.limitNumber) {
                $scope.ptnboxPointsFlag = 1;
            }
            $scope.ptnboxPointName = $scope.prefixName + $scope.ptnboxPointsFlag;
        }
        
        if (1 == $scope.LTRecord_flag) {
            window.setTimeout(laserRecord, 2000);
        } else {
            let savePointCmd = {
                cmd: "save_point",
                data: {
                    "name": $scope.ptnboxPointName,
                    "update_allprogramfile": 0
                },
            };
            dataFactory.actData(savePointCmd)
                .then(() => {
                    toastFactory.success(indexDynamicTags.success_messages[11] + $scope.ptnboxPointName);
                    dispatchSavePoints();
                    if (($scope.ptnboxPointsFlag + 1) > $scope.limitNumber) {
                        toastFactory.info(indexDynamicTags.info_messages[14]);
                    }
                }, (status) => {
                    toastFactory.error(status, indexDynamicTags.error_messages[53] + $scope.ptnboxPointName);
                });
        }
    });

    //Smart Tool信号记录点
    document.addEventListener('smarttoolpoint', e => {
        $scope.smartPointName = "smartPointP"+$scope.index_smartArr_count;
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name": $scope.smartPointName,
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                // Smart Tool信号记录点成功后，添加示教程序(必须放在$scope.index_smartArr_count += 1这一步之前，否则点位名称会解析报错)
                handleSmartToolSingle(e.detail.type);
                dispatchSavePoints();
                $scope.index_smartArr_count += 1;
                // 修改配置文件
                setSmartToolcfg($scope.index_smartArr,$scope.index_smartArr_count);
                toastFactory.success(indexDynamicTags.success_messages[11] + $scope.smartPointName);
            }, (status) => {
                toastFactory.error(status, indexDynamicTags.error_messages[53] + $scope.smartPointName);
            });
    });

    /**
     * Smart Tool信号记录点成功后，添加示教程序
     * @param {string} type 23:A键；24：B键；25：C键；26：D键；27：E键；28：IO键；
     */
    function handleSmartToolSingle(type) {
        switch (type) {
            case 23:
            case '23':
                document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[0][0], speed: $scope.index_smartArr[0][1], index: $scope.index_smartArr_count }}));
                break;
            case 24:
            case '24':
                document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[1][0], speed: $scope.index_smartArr[1][1], index: $scope.index_smartArr_count }}));
                break;
            case 25:
            case '25':
                document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[2][0], speed: $scope.index_smartArr[2][1], index: $scope.index_smartArr_count }}));
                break;
            case 26:
            case '26':
                document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[3][0], speed: $scope.index_smartArr[3][1], index: $scope.index_smartArr_count }}));
                break;
            case 27:
            case '27':
                document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[4][0], speed: $scope.index_smartArr[4][1], index: $scope.index_smartArr_count }}));
                break;
            case 28:
            case '28':
                if (document.getElementById('programTeach')) {
                    document.getElementById('programTeach').dispatchEvent(new CustomEvent('smarttoolsingle', { bubbles: true, cancelable: true, composed: true, detail: {function: $scope.index_smartArr[5][0], speed: $scope.index_smartArr[5][3], index: $scope.index_smartArr_count, auxId: $scope.index_smartArr[5][1], type: $scope.index_smartArr[5][2] }}));
                }
                break;
            default:
                break;
        }
    }

    //设置Smart Tool配置
    function setSmartToolcfg(arr,index) {
		var smartString = JSON.stringify(arr)
        let setSmartToolCmd = {
            cmd: "set_Smart_Tool_function",
            data: {
                "cfg": smartString,
                "p_index": index+""
            }
        };
        dataFactory.actData(setSmartToolCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.addEventListener('updatasmartcfg', e => {
        getSmartToolCfg();
    })

    $scope.J1Slider = {
        min: -10,
        max: 10
    };
    $scope.J2Slider = {
        min: -10,
        max: 10
    };
    $scope.J3Slider = {
        min: -10,
        max: 10
    };
    $scope.J4Slider = {
        min: -10,
        max: 10
    };
    $scope.J5Slider = {
        min: -10,
        max: 10
    };
    $scope.J6Slider = {
        min: -10,
        max: 10
    };
    document.addEventListener('jointslimit-update', e => {
        let jointslimit = e.detail;
        let j1Slider = document.querySelector('input[name="j1"]');
        let j2Slider = document.querySelector('input[name="j2"]');
        let j3Slider = document.querySelector('input[name="j3"]');
        let j4Slider = document.querySelector('input[name="j4"]');
        let j5Slider = document.querySelector('input[name="j5"]');
        let j6Slider = document.querySelector('input[name="j6"]');
        // 机器人操作(MoveJ) joints slider数值范围
        if (j1Slider != null && j2Slider != null && j3Slider != null && j4Slider != null && j5Slider != null && j6Slider != null) {
            if (g_robotType.type == 1) {
                j1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            } else if (g_robotType.type == 6) {
                j1Slider.max = ~~jointslimit.art_j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.art_j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.art_j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.art_j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.art_j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.art_j6_min_joint_limit * DEG2RAD;
            } else if (g_robotType.type == 7) {
                j1Slider.max = ~~jointslimit.art_j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.art_j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.art_j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.art_j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.art_j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.art_j6_min_joint_limit * DEG2RAD;
            } else if (g_robotTypeCode == 802) {
                j1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.wm_j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.wm_j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.wm_j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.wm_j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.wm_j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.wm_j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            } else if (g_robotTypeCode == 901) {
                j1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.mt3_j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.mt3_j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            } else if (g_robotTypeCode == 902) {
                j1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.yd10_j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.yd10_j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            } else {
                j1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                j1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                j2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                j2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                j3Slider.max = ~~jointslimit.j3_max_joint_limit * DEG2RAD;
                j3Slider.min = ~~jointslimit.j3_min_joint_limit * DEG2RAD;
                j4Slider.max = ~~jointslimit.j4_max_joint_limit * DEG2RAD;
                j4Slider.min = ~~jointslimit.j4_min_joint_limit * DEG2RAD;
                j5Slider.max = ~~jointslimit.j5_max_joint_limit * DEG2RAD;
                j5Slider.min = ~~jointslimit.j5_min_joint_limit * DEG2RAD;
                j6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                j6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            }
        }
        // 机器人操作(点动) joints slider数值范围
        if ($scope.J1Slider != null && $scope.J2Slider != null && $scope.J3Slider != null && $scope.J4Slider != null && $scope.J5Slider != null && $scope.J6Slider != null) {
            if (g_robotType.type == 1) {
                $scope.J1Slider.max = ~~jointslimit.j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.j5_min_joint_limit;
                $scope.J6Slider.max = ~~jointslimit.j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.j6_min_joint_limit;
            } else if (g_robotType.type == 6) {
                $scope.J1Slider.max = ~~jointslimit.art_j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.art_j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.art_j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.art_j5_min_Jjoint_limit;
                $scope.J6Slider.max = ~~jointslimit.art_j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.art_j6_min_joint_limit;
            } else if (g_robotType.type == 7) {
                $scope.J1Slider.max = ~~jointslimit.art_j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.art_j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.art_j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.art_j5_min_joint_limit;
                $scope.J6Slider.max = ~~jointslimit.art_j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.art_j6_min_joint_limit;
            } else if (g_robotTypeCode == 802) {
                $scope.J1Slider.max = ~~jointslimit.j1_max_joint_limit * DEG2RAD;
                $scope.J1Slider.min = ~~jointslimit.j1_min_joint_limit * DEG2RAD;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit * DEG2RAD;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit * DEG2RAD;
                $scope.J3Slider.max = ~~jointslimit.wm_j3_max_joint_limit * DEG2RAD;
                $scope.J3Slider.min = ~~jointslimit.wm_j3_min_joint_limit * DEG2RAD;
                $scope.J4Slider.max = ~~jointslimit.wm_j4_max_joint_limit * DEG2RAD;
                $scope.J4Slider.min = ~~jointslimit.wm_j4_min_joint_limit * DEG2RAD;
                $scope.J5Slider.max = ~~jointslimit.wm_j5_max_joint_limit * DEG2RAD;
                $scope.J5Slider.min = ~~jointslimit.wm_j5_min_joint_limit * DEG2RAD;
                $scope.J6Slider.max = ~~jointslimit.j6_max_joint_limit * DEG2RAD;
                $scope.J6Slider.min = ~~jointslimit.j6_min_joint_limit * DEG2RAD;
            } else if (g_robotTypeCode == 901) {
                $scope.J1Slider.max = ~~jointslimit.j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.fr3_j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.fr3_j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.mt3_j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.mt3_j5_min_joint_limit;
                $scope.J6Slider.max = ~~jointslimit.j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.j6_min_joint_limit;
            } else if (g_robotTypeCode == 902) {
                $scope.J1Slider.max = ~~jointslimit.j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.yd10_j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.yd10_j5_min_joint_limit;
                $scope.J6Slider.max = ~~jointslimit.j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.j6_min_joint_limit;
            } else {
                $scope.J1Slider.max = ~~jointslimit.j1_max_joint_limit;
                $scope.J1Slider.min = ~~jointslimit.j1_min_joint_limit;
                $scope.J2Slider.max = ~~jointslimit.j2_max_joint_limit;
                $scope.J2Slider.min = ~~jointslimit.j2_min_joint_limit;
                $scope.J3Slider.max = ~~jointslimit.j3_max_joint_limit;
                $scope.J3Slider.min = ~~jointslimit.j3_min_joint_limit;
                $scope.J4Slider.max = ~~jointslimit.j4_max_joint_limit;
                $scope.J4Slider.min = ~~jointslimit.j4_min_joint_limit;
                $scope.J5Slider.max = ~~jointslimit.j5_max_joint_limit;
                $scope.J5Slider.min = ~~jointslimit.j5_min_joint_limit;
                $scope.J6Slider.max = ~~jointslimit.j6_max_joint_limit;
                $scope.J6Slider.min = ~~jointslimit.j6_min_joint_limit;
            }
        }

    });

    //多轴联动还原
    var updateJointsFlg;
    $scope.restoreJoints = function () {
        updateJointsFlg = 1;
    };

    // 用户登出
    $scope.logout = function () {
        dataFactory.logout();
    };

    /* 扭矩系统配置状态反馈 */
    /* 切换数据显示区域 */
    $scope.showRobotInfo = false;
    $scope.robotPoseText = "Robot";
    $scope.toggleDataDisplay = function (event, index) {
        locateContent(event, "#robot-status-info");
        $scope.dataDisplayEvent = event;
        $scope.showRobotPoseStatus = false;
        $scope.showProgramStatus = false;
        $scope.showIOStatus = false;
        $scope.showExaxisStatus = false;
        $scope.showGripperStatus = false;
        $scope.showFTStatus = false;
        $scope.showConveryStatus = false;
        $scope.showAuxServoStatus = false;
        $scope.showPolishingStatus = false;
        $scope.showWeldStatus = false;
        $scope.showTorqueStatus = false;
        if ($scope.showRobotInfo && $scope.lastRobotStatusIndex == index) {
            $scope.showRobotInfo = false;
        } else {
            $scope.showRobotInfo = true;
            switch (index) {
                case 0:
                    $scope.showRobotPoseStatus = true;
                    $scope.robotPoseText = "Robot";
                    break;
                case 1:
                    $scope.showProgramStatus = true;
                    $scope.robotPoseText = "Program";
                    break;
                case 2:
                    $scope.showIOStatus = true;
                    $scope.robotPoseText = "I/O";
                    break;
                case 3:
                    $scope.showExaxisStatus = true;
                    $scope.robotPoseText = "ExAxis";
                    break;
                case 4:
                    $scope.showGripperStatus = true;
                    $scope.robotPoseText = "Gripper";
                    break;
                case 5:
                    $scope.showFTStatus = true;
                    $scope.robotPoseText = "FT";
                    break;
                case 6:
                    $scope.showConveryStatus = true;
                    $scope.robotPoseText = "Convery";
                    break;
                case 7:
                    $scope.showAuxServoStatus = true;
                    $scope.robotPoseText = "Servo";
                    break;
                case 8:
                    $scope.showPolishingStatus = !$scope.showPolishingStatus;
                    $scope.robotPoseText = "Polish";
                    break;
                case 9:
                    $scope.showWeldStatus = true;
                    $scope.robotPoseText = "Weld";
                    break;
                case 10:
                    $scope.showTorqueStatus = true;
                    $scope.robotPoseText = "Torque";
                    break;
                default:
                    $scope.showRobotInfo = false;
                    break;
            }
        }
        $scope.lastRobotStatusIndex = index;
    }

    document.querySelectorAll("#robot-object > ul > li").forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        })
    })

    document.querySelectorAll("#robot-setting > ul > li").forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        })
    })

    document.querySelectorAll("#robot-support > ul > li").forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        })
    })

    document.querySelectorAll("#robot-status > ul > li").forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        })
    })

    /* 状态反馈 */
    $scope.torqueSysDO = [0, 0, 0, 0];
    $scope.torqueSysDI = [0, 0, 0, 0];
    document.addEventListener('torque_state', e => {
        let torqueState = e.detail;
        $scope.torqueSysMotionState = torqueState.motion_state;
        $scope.torqueSysDO = torqueState.input_io_state;
        $scope.torqueSysDI = torqueState.onput_io_state;
        $scope.torqueSysRunningTime = torqueState.task_runtime;
        $scope.torqueSysWorkingStatus = torqueSysWorkingStatusList[torqueState.work_state].ws_name;
        $scope.torqueSysControlMode = torqueSysControlModeList[torqueState.control_mode].cm_name;
        $scope.torqueSysRevolutions = torqueState.feed_turns;
        $scope.torqueSysRPM = torqueState.feed_rev;
        $scope.torqueSysTorque = torqueState.feed_torque;
        $scope.torqueSysLockResult = torqueSysLockResultList[torqueState.lock_result].lr_name;
        $scope.torqueSysErrorCode = torqueState.error_code;
        $scope.torqueSysCurrentTorqueUnit = torqueSysUnitList[torqueState.current_unit].unit_name;
        // 状态传递到配置页面
        let torqueStateFeedback = {
            "control_mode": torqueState.control_mode,
            "current_unit": torqueState.current_unit
        };
        if (document.getElementById("torqueSystem") != null) {
            document.getElementById("torqueSystem").dispatchEvent(new CustomEvent('torque_state_feedback', { bubbles: true, cancelable: true, composed: true, detail: torqueStateFeedback }));
        }
    });
    /* ./扭矩系统配置状态反馈 */

    document.addEventListener('vc-dragging', e => {

        viewer.disableDragging = e.detail;

    });

    document.addEventListener('calc-move', e => {

        let mesh = e.detail;
        let p = mesh.position;
        let r = mesh.rotation;
        $scope.moveDescartesTcp.x = (p.x * 1000).toFixed(2);
        $scope.moveDescartesTcp.y = (p.y * 1000).toFixed(2);
        $scope.moveDescartesTcp.z = (p.z * 1000).toFixed(2);
        $scope.moveDescartesTcp.rx = (r._x * RAD2DEG).toFixed(2);
        $scope.moveDescartesTcp.ry = (r._y * RAD2DEG).toFixed(2);
        $scope.moveDescartesTcp.rz = (r._z * RAD2DEG).toFixed(2);

        $scope.computeJoint();

    });

    /* 切换机器人虚拟控制功能 */
    $scope.lab0 = true;
    $scope.lab1 = false;
    $scope.lab2 = false;
    $scope.switchVirtualFunc = function (funcFlg) {
        $(".vc").removeClass('active');
        $(".vc-" + funcFlg).addClass('active');
        // viewer.setTransformMode(modeFlg);
        switch (funcFlg) {
            case 0:
                if (mountingTypeID != 3) {
                    viewer.changeFixedMounting(mountingTypeID);
                }
                $scope.lab0 = true;
                $scope.lab1 = false;
                $scope.lab2 = false;
                break;
            case 1:
                if (mountingTypeID != 3) {
                    if ($scope.curYAngle == undefined) {
                        $scope.yAngle = 0;
                        $scope.zAngle = 0;
                        lastYAngle = 0;
                        lastZAngle = 0;
                        viewer.changeFixedMounting(0);
                    } else {
                        $scope.yAngle = $scope.curYAngle;
                        $scope.zAngle = $scope.curZAngle;
                        viewer.changeFixedMounting(0);
                        viewer.changeFreeMounting($scope.curYAngle, $scope.curZAngle);
                    }
                }
                $scope.lab0 = false;
                $scope.lab1 = true;
                $scope.lab2 = false;
                break;
            case 2:
                if (mountingTypeID != 3) {
                    viewer.changeFixedMounting(mountingTypeID);
                }
                $scope.lab0 = false;
                $scope.lab1 = false;
                $scope.lab2 = true;
                break;
            default:
                break;
        }
    }
    /* ./切换机器人虚拟控制功能 */

    /* 三维界面悬浮功能栏拖动功能 */
    $scope.robotObjectFlag = true;
    $scope.robotSettingFlag = true;
    $scope.robotSupportFlag = true;
    $scope.robotStatusFlag = true;
    // 打开三维界面浮窗
    $scope.openRobotContent = function(dragId) {
        switch (dragId) {
            case 0:
                $scope.robotObjectFlag = true;
                document.getElementById('robot-object').style.top = $scope.programUrdf ? '58px' : '10px';
                document.getElementById('robot-object').style.left = 'calc(50% - 150px)';
                break;
            case 1:
                $scope.robotSettingFlag = true;
                document.getElementById('robot-setting').style.top = '55px';
                document.getElementById('robot-setting').style.left = '10px';
                break;
            case 2:
                $scope.robotSupportFlag = true;
                document.getElementById('robot-support').style.top = 'calc(100% - 60px)';
                document.getElementById('robot-support').style.left = 'calc(50% - 126px)';
                break;
            case 3:
                $scope.robotStatusFlag = true;
                document.getElementById('robot-status').style.top = '55px';
                document.getElementById('robot-status').style.left = 'calc(100% - 60px)';
                break;
            default:
                break;
        }
    }
    // 开始拖动三维浮窗
    $scope.startCallback = function (event, ui) {
        $scope.limitTopVal = ui.position.top;
        $scope.limitLeftVal = ui.position.left;
        $scope.$apply();
    }
    // 结束拖动三维浮窗
    $scope.dragCallback = function (event, ui, offsetEnable, dragId) {
        // ui.position drag ui左上角相对于父元素位置
        // ui.offset drag ui左上角相对于document位置
        // ui.originalPosition drag ui拖动之前左上角相对于父元素位置，在拖动过程中不会改变
        let top = ui.position.top;
        let left = ui.position.left;
        let selfWidth = ui.helper[0].offsetWidth;
        let selfHeight = ui.helper[0].offsetHeight;
        let parentWidth = ui.helper[0].parentElement.offsetWidth;
        let parentHeight = ui.helper[0].parentElement.offsetHeight;
        let offsetLeftX, offsetRightX, offsetTopY, offsetButtomY, limitTop, limitLeft;
        if (offsetEnable) {
            if (dragId == 0) {
                offsetLeftX = (selfWidth / parentWidth) < 0.8 ? parentWidth * 0.1 : parentWidth * ((1 - (selfWidth / parentWidth)) / 2);
                offsetRightX = offsetLeftX;
                offsetTopY = 0;
                offsetButtomY = parentHeight * 0.5;
            } else if (dragId == 1) {
                offsetLeftX = 0;
                offsetRightX = parentHeight * 0.6;
                offsetTopY = 55;
                offsetButtomY = parentHeight * 0.55;
            } else if (dragId == 2) {
                offsetLeftX = (selfWidth / parentWidth) < 0.8 ? parentWidth * 0.24 : parentWidth * ((1 - (selfWidth / parentWidth)) / 2);
                offsetRightX = offsetLeftX;
                if (((selfHeight + 370) / parentHeight) < 0.8) {
                    offsetTopY = selfHeight + 370;
                } else {
                    limitTop = true;
                }
                offsetButtomY = 0;
            } else if (dragId == 3) {
                offsetLeftX = parentHeight * 0.6;
                offsetRightX = 0;
                offsetTopY = 55;
                if ((540 / parentHeight) < 0.8) {
                    offsetButtomY = parentHeight * 0.3;
                } else {
                    limitTop = true;
                }
            }
            if (!limitLeft) {
                ui.position.left = left < 10 + offsetLeftX ? offsetLeftX : left + selfWidth + 10 > parentWidth - offsetRightX ? parentWidth - selfWidth - offsetRightX : left;
            } else {
                ui.position.left = $scope.limitLeftVal;
            }
            if (!limitTop) {
                ui.position.top = top < 10 + offsetTopY ? offsetTopY : top + selfHeight + 10 > parentHeight - offsetButtomY ? parentHeight - selfHeight - offsetButtomY : top;
            } else {
                ui.position.top = $scope.limitTopVal;
            }
        } else {
            ui.position.top = top < 10 ? 0 : top + selfHeight + 10 > parentHeight ? parentHeight - selfHeight : top;
            ui.position.left = left < 10 ? 0 : left + selfWidth + 10 > parentWidth ? parentWidth - selfWidth : left;
        }
        // 三维功能栏贴边隐藏和info窗口拖动跟随
        switch (dragId) {
            case 0:
                if (top <= ($scope.programUrdf ? 48 : 0)) {
                    $scope.robotObjectFlag = false;
                }
                break;
            case 1:
                if (left <= 0) {
                    $scope.robotSettingFlag = false;
                    $scope.clickRobotSetting();
                } else {
                    locateContent($scope.robotSettingEvent, "#robot-setting-info");
                }
                break;
            case 2:
                if (top + selfHeight >= parentHeight - offsetButtomY) {
                    $scope.robotSupportFlag = false;
                    $scope.clickRobotSupport();
                } else {
                    locateContent($scope.robotSupportEvent, "#robot-support-info");
                }
                break;
            case 3:
                if (left + selfWidth >= parentWidth - offsetRightX) {
                    $scope.robotStatusFlag = false;
                    $scope.toggleDataDisplay();
                } else {
                    locateContent($scope.dataDisplayEvent, "#robot-status-info");
                }
                break;
            default:
                break;
        }
        $scope.$apply();
    }
    /* ./三维界面悬浮功能栏拖动功能 */

    /* 机器人360度安装功能 */
    let modifyFlg = 0;
    let lastYAngle = 0;
    let lastZAngle = 0;
    $scope.curYAngle = 0;
    $scope.curZAngle = 0;
    $scope.yAngle = 0;
    $scope.zAngle = 0;
    // 快捷安装
    $scope.quickRobotMounting = function (index) {
        modifyFlg = 1;
        $(".qmbtn").removeClass('active');
        $(".qmbtn-" + index).addClass('active');
        switch (index) {
            case 0:
                $scope.yAngle = 0;
                $scope.zAngle = 0;
                viewer.resetFreeMounting(lastYAngle, lastZAngle);
                viewer.changeFreeMounting($scope.yAngle, $scope.zAngle);
                lastYAngle = $scope.yAngle;
                lastZAngle = $scope.zAngle;
                break;
            case 1:
                $scope.yAngle = 90;
                $scope.zAngle = 0;
                viewer.resetFreeMounting(lastYAngle, lastZAngle);
                viewer.changeFreeMounting($scope.yAngle, $scope.zAngle);
                lastYAngle = $scope.yAngle;
                lastZAngle = $scope.zAngle;
                break;
            case 2:
                $scope.yAngle = 180;
                $scope.zAngle = 0;
                viewer.resetFreeMounting(lastYAngle, lastZAngle);
                viewer.changeFreeMounting($scope.yAngle, $scope.zAngle);
                lastYAngle = $scope.yAngle;
                lastZAngle = $scope.zAngle;
                break;
            default:
                break;
        }
    }

    // 机器人基座倾斜角度
    $scope.tiltRobotBaseMounting = function (angle) {
        modifyFlg = 1;
        if ($scope.yAngle + angle > 180) {
            $scope.yAngle = 180;
        } else if ($scope.yAngle + angle < -180) {
            $scope.yAngle = -180;
        } else {
            $scope.yAngle = parseFloat(($scope.yAngle + angle).toFixed(1));
            $("#tiltVar").val($scope.yAngle).trigger('change');
        }
        viewer.resetFreeMounting(lastYAngle, lastZAngle);
        viewer.changeFreeMounting($scope.yAngle, $scope.zAngle);
        lastYAngle = $scope.yAngle;
    }

    // 机器人基座旋转角度
    $scope.rotateRobotBaseMounting = function (angle) {
        modifyFlg = 1;
        if ($scope.zAngle + angle > 180) {
            $scope.zAngle = 180;
        } else if ($scope.zAngle + angle < -180) {
            $scope.zAngle = -180;
        } else {
            $scope.zAngle = parseFloat(($scope.zAngle + angle).toFixed(1));
            $("#rotationVar").val($scope.zAngle).trigger('change');
        }
        viewer.resetFreeMounting(lastYAngle, lastZAngle);
        viewer.changeFreeMounting($scope.yAngle, $scope.zAngle);
        lastZAngle = $scope.zAngle;
    }


    // 倾斜角长按
    let longPressTimeout = 200;
    let tiltTimeoutID;
    let tiltIntervalID;
    $scope.longPressTilt = function (angle) {
        tiltTimeoutID = setTimeout(() => {
            modifyFlg = 1;
            tiltIntervalID = setInterval(() => {
                $scope.tiltRobotBaseMounting(angle);
            }, 10);
        }, longPressTimeout); 
    }
    // 清除长按
    $scope.clearBtnTilt = function () {
        clearTimeout(tiltTimeoutID);
        clearInterval(tiltIntervalID);
    }

    // 旋转角长按
    let rotateTimeoutID;
    let rotateIntervalID;
    $scope.longPressRotate = function (angle) {
        rotateTimeoutID = setTimeout(() => {
            modifyFlg = 1;
            rotateIntervalID = setInterval(() => {
                $scope.rotateRobotBaseMounting(angle);
            }, 10);
        }, longPressTimeout);
    }
    // 清除长按
    $scope.clearBtnRotate = function () {
        clearTimeout(rotateTimeoutID);
        clearInterval(rotateIntervalID);
    }

    // 应用安装设置
    let robotInstallPos;
    $scope.applyMounting = function () {
        robotInstallPos = 3;
        let robotMountString = "SetRobotInstallPos(3)";
        let robotMountCmd = {
            cmd: 337,
            data: {
                content:robotMountString,
            },
        };
        dataFactory.setData(robotMountCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.addEventListener('337', () => {
        if (robotInstallPos == 0 || robotInstallPos == 1 || robotInstallPos == 2) {
            // 固定安装改变安装方式
            document.dispatchEvent(new CustomEvent('mounting-changed', {bubbles: true, cancelable: true, composed: true, detail: $scope.fixedMountingType}));
        } else if (robotInstallPos == 3) {
            // 自由安装继续下发安装角度
            let setString = "SetRobotInstallAngle("+$scope.yAngle+","+$scope.zAngle+")";
            let setCmd = {
                cmd: 631,
                data: {
                    content: setString,
                },
            };
            dataFactory.setData(setCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    })
    document.addEventListener('631', () => {
        modifyFlg = 1;
        document.dispatchEvent(new CustomEvent('mounting-changed', {bubbles: true, cancelable: true, composed: true, detail: 3}));
        $("#robot-mounting-confirm").modal('hide');
    })
    
    // 取消安装设置
    $scope.cancelMounting = function () {
        if (modifyFlg) {
            $("#robot-mounting-confirm").modal();
        } else {
            $scope.switchVirtualFunc(0);
        }
    }
    
    // 直接退出机器人安装方式设置
    $scope.quitSetMounting = function () {
        modifyFlg = 0;
        viewer.resetFreeMounting(lastYAngle, lastZAngle);
        viewer.changeFreeMounting($scope.curYAngle, $scope.curZAngle);
        lastYAngle = $scope.curYAngle;
        lastZAngle = $scope.curZAngle;
        $scope.cancelMounting();
        $("#robot-mounting-confirm").modal('hide');
        $scope.initRobotViewFlag();
    }
    /* ./机器人360度自由安装设置 */

    /* 机器人固定安装设置 */
    $scope.changeFixedMounting = function (mountingType) {
        $(".qmbtn").removeClass('active');
        $(".qmbtn-" + mountingType).addClass('active');
        $scope.fixedMountingType = mountingType;
    }
    $scope.applyFixedMounting = function () {
        if ($scope.fixedMountingType == undefined || $scope.fixedMountingType == null) {
            return;
        } else {
            robotInstallPos = $scope.fixedMountingType;
            var robotMountingString = "SetRobotInstallPos(" + $scope.fixedMountingType + ")";
            let robotMountingCmd = {
                cmd: 337,
                data: {
                    content: robotMountingString,
                },
            };
            dataFactory.setData(robotMountingCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }
    /* ./机器人固定安装设置 */

    
    /* resize workspace */
    $scope.showFRLogo = false;
    $scope.resizeBlocklyWorkspace = function () {
        if ($scope.showFRLogo) {
            $scope.showFRLogo = false;
        } else {
            $scope.showFRLogo = true;
        }
        let id = setTimeout(() => {
            if (document.getElementById("graphicalProgramming") != null) {
                document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('resize-workspace', { bubbles: true, cancelable: true, composed: true }));
            }
            clearTimeout(id);
        }, 1200);
    }
    
    /*获取IO别名配置数据 */
    function getTempIOAliasData() {
        const getAliasCmd = {
            cmd: 'get_IO_alias_cfg'
        };
        dataFactory.getData(getAliasCmd).then(data => {
            $scope.tempCtrlDIAliasList = data.CtrlBox.DI;
            $scope.tempCtrlDOAliasList = data.CtrlBox.DO;
            $scope.tempCtrlAIAliasList = data.CtrlBox.AI;
            $scope.tempCtrlAOAliasList = data.CtrlBox.AO;
            $scope.tempEndDIAliasList = data.EndEff.DI;
            $scope.tempEndDOAliasList = data.EndEff.DO;
            $scope.tempEndAIAliasList = data.EndEff.AI;
            $scope.tempEndAOAliasList = data.EndEff.AO;
            getIOConfigContent();
        }, (status) => {
            toastFactory.error(status, indexDynamicTags.error_messages[59]);
        });
    }

    /* 获取DI、DO配置的文字内容*/
    function getIOConfigContent() {
        // CtrlBox————CI0-7
        $scope.DICfgArr.forEach((item, index) => {
            if (item > 0) {
                $scope.tempCtrlDIAliasList[index + 8] = $scope.DICfgData[item].name;
            }
        });
        // CtrlBox————CO0-7
        $scope.DOCfgArr.forEach((item, index) => {
            if (item > 0) {
                $scope.tempCtrlDOAliasList[index + 8] = $scope.DOCfgData[item].name;
            }
        });
        // EndEff————DI
        $scope.endDICfgArr.forEach((item, index) => {
            if (item > 0) {
                $scope.tempEndDIAliasList[index] = $scope.EndDICfgData[item].name;
            }
        });
        $scope.setIOAliasCfg($scope.tempCtrlDIAliasList, $scope.tempCtrlDOAliasList, $scope.tempCtrlAIAliasList, $scope.tempCtrlAOAliasList, $scope.tempEndDIAliasList, $scope.tempEndDOAliasList, $scope.tempEndAIAliasList, $scope.tempEndAOAliasList);
    };

    /**
     * 配置I/O别名
     * @param {array} ctrlDIArr 控制箱DI别名
     * @param {array} ctrlDOArr 控制箱DO别名
     * @param {array} ctrlAIArr 控制箱AI别名
     * @param {array} ctrlAOArr 控制箱AO别名
     * @param {array} endDIArr 末端DI别名
     * @param {array} endDOArr 末端DO别名
     * @param {array} endAIArr 末端AI别名
     * @param {array} endAOArr 末端AO别名
     */
    $scope.setIOAliasCfg = function(ctrlDIArr, ctrlDOArr, ctrlAIArr, ctrlAOArr, endDIArr, endDOArr, endAIArr, endAOArr) {
        const setAliasParams = {
            cmd: 'set_IO_alias_cfg',
            data: {
                CtrlBox: {
                    DI: ctrlDIArr,
                    DO: ctrlDOArr,
                    AI: ctrlAIArr,
                    AO: ctrlAOArr
                },
                EndEff: {
                    DI: endDIArr,
                    DO: endDOArr,
                    AI: endAIArr,
                    AO: endAOArr
                }
            }
        };
        dataFactory.actData(setAliasParams).then(() => {
            getIOAliasData();
        }, (status) => {
            toastFactory.error(status);
        });
    };
    /**./配置I/O别名 */

    function getIOAliasData() {
        const getAliasCmd = {
            cmd: 'get_IO_alias_cfg'
        };
        dataFactory.getData(getAliasCmd).then(data => {
            $scope.ctrlDIAliasList = data.CtrlBox.DI;
            $scope.ctrlDOAliasList = data.CtrlBox.DO;
            $scope.ctrlAIAliasList = data.CtrlBox.AI;
            $scope.ctrlAOAliasList = data.CtrlBox.AO;
            $scope.endDIAliasList = data.EndEff.DI;
            $scope.endDOAliasList = data.EndEff.DO;
            $scope.endAIAliasList = data.EndEff.AI;
            $scope.endAOAliasList = data.EndEff.AO;
            // 操作区IO
            $scope.clDIArr.forEach((item, index) => {
                if ($scope.ctrlDIAliasList[index]) {
                    item['aliasName'] = `(${$scope.ctrlDIAliasList[index]})`;
                } else {
                    item['aliasName'] = '';
                }
            });
            $scope.clDOArr.forEach((item, index) => {
                if ($scope.ctrlDOAliasList[index]) {
                    item['aliasName'] = `(${$scope.ctrlDOAliasList[index]})`;
                } else {
                    item['aliasName'] = '';
                }
            });
            $scope.clAOArr.forEach((item, index) => {
                if ($scope.ctrlAOAliasList[index]) {
                    item['aliasName'] = `(${$scope.ctrlAOAliasList[index]})`;
                } else {
                    item['aliasName'] = '';
                }
            });
            $scope.toolDIArr.forEach((item, index) => {
                if ($scope.endDIAliasList[index]) {
                    item['aliasName'] = `(${$scope.endDIAliasList[index]})`;
                } else {
                    item['aliasName'] = '';
                }
            });
            $scope.toolDOArr.forEach((item, index) => {
                if ($scope.endDOAliasList[index]) {
                    item['aliasName'] = `(${$scope.endDOAliasList[index]})`;
                } else {
                    item['aliasName'] = '';
                }
            });
            $scope.toolAOArr[0]['aliasName'] = $scope.endAOAliasList[0] ? `(${$scope.endAOAliasList[0]})` : '';
            // 操作区TPD（TPDCfgDI、TPDCfgDO）
            $scope.TPDCfgDI.forEach((item, index) => {
                switch (index) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        if ($scope.ctrlDIAliasList[index - 1]) {
                            item['aliasName'] = `(${$scope.ctrlDIAliasList[index - 1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 9:
                        if ($scope.endDIAliasList[0]) {
                            item['aliasName'] = `(${$scope.endDIAliasList[0]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 10:
                        if ($scope.endDIAliasList[1]) {
                            item['aliasName'] = `(${$scope.endDIAliasList[1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    default:
                        break;
                }
            });
            $scope.TPDCfgDO.forEach((item, index) => {
                switch (index) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        if ($scope.ctrlDOAliasList[index - 1]) {
                            item['aliasName'] = `(${$scope.ctrlDOAliasList[index - 1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 9:
                        if ($scope.endDOAliasList[0]) {
                            item['aliasName'] = `(${$scope.endDOAliasList[0]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 10:
                        if ($scope.endDOAliasList[1]) {
                            item['aliasName'] = `(${$scope.endDOAliasList[1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    default:
                        break;
                }
            });
        }, (status) => {
            toastFactory.error(status, indexDynamicTags.error_messages[59]);
        });
    };

    document.addEventListener('setIOAliasData', () => {
        getIOAliasData();
    })

    // 状态查询——停止查询
    $scope.stopQueryFunc = function() {
        if (document.getElementById("monitor") != null && document.getElementById("monitor") != undefined) {
            document.getElementById("monitor").dispatchEvent(new CustomEvent('stopQuery', { bubbles: true, cancelable: true, composed: true }));
        }
    }

    // 取消状态查询的是否停止模态框后，刷新导航栏样式
    $scope.cancelStopQuery = function() {
        refreshSidebarMenu('monitor');
    }

    /**机器人模型铺开 */
    // 机器人模型铺开按钮的初始化判断
    if (window.location.href.split('#/')[1]) {
        $scope.robotViewFlag = true;
    } else {
        $scope.robotViewFlag = false;
    }
    $scope.initRobotViewFlag = function() {
        $scope.robotViewFlag = true;
    }
    $scope.resizeRobotView = function() {
        $location.path('/');
        $('.sidebar-menu').tree();
        $('.sidebar-menu').find('.menu-open').removeClass('menu-open');
        $('.sidebar-menu').find('.active').removeClass('active');
        $('.sidebar-menu').find('ul').css('display', 'none');
        $("#vRobot-view").addClass("col-md-12");
        $("#vRobot-view").removeClass("vRobot-55");
        $("#robot-setting").removeAttr('style');
        $("#robot-object").removeAttr('style');
        $("#robot-status").removeAttr('style');
        $("#robot-support").removeAttr('style');
        $scope.clickRobotSetting();
        $scope.toggleDataDisplay();
        $scope.clickRobotSupport();
        $scope.fullFlag = 1;
        $scope.robotViewFlag = false;
        $scope.setProgramUrdf(false);
    }

    /**获取当前版本 */
    function getWebVersion() {
        dataFactory.getData({ cmd: "get_webversion" }).then((data) => {
            $scope.webVersion = data.version;
        }, (status) => {
            $scope.webVersion = '';
            toastFactory.error(status, indexDynamicTags.error_messages[66]);
        });
    }

    /* 三维操作栏内容页定位展示 */
    function locateContent(e, id) {
        // robot-setting-info展示位置
        if (e != undefined) {
            let parentLeft = e.currentTarget.offsetParent.offsetLeft;
            let parentTop = e.currentTarget.offsetParent.offsetTop;
            let parentWidth = e.currentTarget.offsetParent.offsetWidth;
            let leftOffset =  0;
            let topOffset =  0;
            let zIndex =  0;
            if (id == "#robot-setting-info") {
                leftOffset = parentLeft + parentWidth;  
                topOffset = parentTop + 25;
                zIndex = 2;
            } else if (id == "#robot-status-info") {
                leftOffset = parentLeft - 278;
                topOffset = parentTop + 25;
                zIndex = 1;
            }
            if (id == "#robot-support-info") {
                $(document).ready(function () {
                    leftOffset = parentLeft + (parentWidth / 2) - (document.querySelector(id).offsetWidth / 2) - 5;
                    topOffset = parentTop - document.querySelector(id).offsetHeight - 10;
                    document.querySelector(id).style.left = `${leftOffset}px`;
                    document.querySelector(id).style.top = `${topOffset}px`;
                    document.querySelector(id).style.zIndex = 2;
                })
            } else {
                document.querySelector(id).style.left = `${leftOffset}px`;
                document.querySelector(id).style.top = `${topOffset}px`;
                document.querySelector(id).style.zIndex = zIndex;
            }
        }
    }

    /**三维对象的图标切换 */
    $scope.maxDistance = 30;
    $scope.showTcp = false;
    $scope.showJointSingle = false;
    $scope.showJointMult = false;
    $scope.showMove = false;
    $scope.robotSettingTcp = true;
    $scope.clickRobotSetting = function(event, index) {
        updatedescartesFlg = 1;
        $scope.robotSettingEvent = event;
        // robot-setting-info展示位置
        locateContent(event, "#robot-setting-info");
        // robot-setting-info内容依据选项index切换
        $scope.showTcp = false;
        $scope.showJointSingle = false;
        $scope.showJointMult = false;
        $scope.showMove = false;
        if ($scope.showRobotSetting && $scope.lastRobotSettingIndex == index) {
            $scope.showRobotSetting = false;
        } else {
            $scope.showRobotSetting = true;
            switch (index) {
                case 0:
                    $scope.selectCoordSys(1);
                    $scope.selectedCoordSys = referenceCoord[1];
                    $scope.showTcp = !$scope.showTcp;
                    $scope.maxDistanceUnit = "(mm)(°)";
                    updateJointsFlg = 1;
                    $(document).ready(function () {
                        if ($('#robot-setting-info').height() > 500 || $('#urdf-container').width() < 570) {
                            $scope.robotSettingTcp = true;
                        } else {
                            $scope.robotSettingTcp = false;
                        }
                        $scope.$apply();
                    })
                    break;
                case 1:
                    $scope.selectedCoordSys = referenceCoord[0];
                    $scope.showJointSingle = !$scope.showJointSingle;
                    $scope.maxDistanceUnit = "(°)";
                    updateJointsFlg = 1;
                    break;
                case 2:
                    $scope.selectedCoordSys = referenceCoord[0];
                    $scope.showJointMult = !$scope.showJointMult;
                    $scope.maxDistanceUnit = "(°)";
                    break;
                case 3:
                    $scope.showMove = !$scope.showMove;
                    break;
                default:
                    $scope.showRobotSetting = false;
                    break;
            }
        }
        $scope.lastRobotSettingIndex = index;
        if (index != undefined) {
            if (document.querySelector('#vRobot-view').offsetWidth < 710) {
                $scope.clickRobotSupport();
            }
        }
    }

    /**
     * TCP切换：
     * @param {int} index 1:base, 2:tool, 3:wobj
     */
    $scope.selectedCoordSys = referenceCoord[0];
    $scope.selectCoordSys = function(index) {
        $('.tcp-switch').find('.select').removeClass('select');
        $scope.selectedCoordSys = referenceCoord[index];
        switch (index) {
            case 1:
                $('.tcp-switch-base').addClass('select');
                break;
            case 2:
                $('.tcp-switch-tool').addClass('select');
                break;
            case 3:
                $('.tcp-switch-wobj').addClass('select');
                break;
            default:
                break;
        }
    };

    /**配套功能的图标切换 */
    $scope.showPoint = false;
    $scope.showIO = false;
    $scope.showTPD = false;
    $scope.showEaxis = false;
    $scope.showFT = false;
    $scope.showRCM = false;
    $scope.clickRobotSupport = function(event, index) {
        updatedescartesFlg = 1;
        $scope.robotSupportEvent = event;
        $scope.showPoint = false;
        $scope.showIO = false;
        $scope.showTPD = false;
        $scope.showEaxis = false;
        $scope.showFT = false;
        $scope.showRCM = false;
        if ($scope.showRobotSupport && $scope.lastRobotSupportIndex == index) {
            $scope.showRobotSupport = false;
        } else {
            $scope.showRobotSupport = true;
            switch (index) {
                case 0:
                    $scope.showPoint = !$scope.showPoint;
                    break;
                case 1:
                    $scope.showIO = !$scope.showIO;
                    break;
                case 2:
                    getTPDName();
                    $scope.showTPD = !$scope.showTPD;
                    break;
                case 3:
                    $scope.showEaxis = !$scope.showEaxis;
                    break;
                case 4:
                    $scope.showFT = !$scope.showFT;
                    $scope.ftEvent = event;
                    break;
                case 5:
                    $scope.showRCM = !$scope.showRCM;
                    $scope.show_RCM_Edit = false;
                    $scope.rcmEvent = event;
                    break;
                default:
                    $scope.showRobotSupport = false;
                    break;
            }
        }
        $scope.lastRobotSupportIndex = index;
        document.querySelector("#robot-support-info").style.zIndex = -1;
        locateContent(event, "#robot-support-info");
        if (index != undefined) {
            if (document.querySelector('#vRobot-view').offsetWidth < 710) {
                $scope.clickRobotSetting();
            }
        }
    }

    /* 检测页面缩放调整页面 */
    window.addEventListener('resize', function () {
        $scope.robotSettingTcp = true;
        $("#robot-setting").removeAttr('style');
        $("#robot-object").removeAttr('style');
        $("#robot-status").removeAttr('style');
        $("#robot-support").removeAttr('style');
        $scope.clickRobotSetting();
        $scope.toggleDataDisplay();
        $scope.clickRobotSupport();
        if (document.getElementById('btn-expand')) {
            document.getElementById('btn-expand').style.width = `${document.getElementById('urdf-container').offsetWidth}px`;
        }
        if (window.location.href.split('#/')[1] == 'programteach') {
            $scope.setProgramUrdf(true);
        } else {
            $scope.setProgramUrdf(false);
        }
        $scope.$apply();
    });

    /* 升级失败的关闭按钮 */
    document.getElementById("updateClose").addEventListener("click", (e) => {
        $('#updatePage').css("display", "none");
        $('#updateLog').css("display", "none");
        $('#updateText').css("display", "none");
        $('#updateError').css("display", "none");
        $('#updateClose').css("display", "none");
        $scope.upgradeProcess = 0;
    });

};

/**
 * 数据接口封装
 * @returns 
 */
function dataFactoryFn($http, $q) {
    var service = {};
    service.getData = function (cmdObject) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: "/action/get",
            data: cmdObject
        }).success(function (data, status) {
            if (status == 302) {
                location = '/login.html';
            } else {
                deferred.resolve(data);
            }
        }).error(function (data, status) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    service.setData = function (dataObject) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: "/action/set",
            data: dataObject
        }).success(function (data, status) {
            if (data != "success") {
                toastr.error(data);
                return;
            }
            deferred.resolve(data);
        }).error(function (data, status) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    //act: use to save, delete and rename file. 
    service.actData = function (dataObject) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: "/action/act",
            data: dataObject
        }).success(function (data, status) {
            if (data != "success") {
                toastr.error(data);
                return;
            }
            deferred.resolve(data);
        }).error(function (data, status) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    service.staData = function (dataObject) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: "/action/sta",
            data: dataObject
        }).success(function (data, status) {
            // 如果返回的数据类型不是object(例如：login.html内容)，则进行跳转Login.html
            if (typeof (data) != "object") {
                location = '/login.html';
            }
            deferred.resolve(data);
        }).error(function (data, status) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    // 文件上传服务
    service.uploadData = function (dataObject) {
        var deferred = $q.defer();
        $http({
            method: "POST",
            url: "/action/upload",
            data: dataObject,
            headers: { 'Content-type': undefined },
            uploadEventHandlers: {
                progress: function (e) {
                    if (document.getElementById('auxiliaryApplication') != null && document.getElementById('auxiliaryApplication') != undefined) {
                        document.getElementById('auxiliaryApplication').dispatchEvent(new CustomEvent('uploadprogress', { bubbles: true, cancelable: true, composed: true, detail: e.loaded / e.total * 100 }))
                    }
                }
            }
        }).success(function (data, status) {
            if (typeof(data) == "object") {
                let uploadInfo = JSON.parse(JSON.stringify(data));
                deferred.resolve(uploadInfo);
                if (!$.isEmptyObject(uploadInfo)) {
                    if (uploadInfo.hasOwnProperty("error_info")) {
                        toastr.error(data.error_info);
                    }
                } else {
                    console.error("[Error]: The data returned by upload service does not exist 'error_info' property.");
                }
            } else {
                deferred.resolve(data);
            }
        }).error(function (data, status) {
            deferred.reject(status);
        });
        return deferred.promise;
    };

    // 登出
    service.logout = function () {
        $http({
            method: "POST",
            url: "/action/logout",
        }).success(function () {
            location = '/login.html';
            if (g_socketStream) {
                g_socketStream.close();
            }
            g_socketLogoutFlag = 1;
        }).error(function () {
            toastr.error("Failed to logout");
        });
    };

    return service;
};

/**
 * 指令交互提示服务
 * @returns 
 */
function toastFactoryFn($http, $q) {
    let toastrDynamicTags;
    if (!$.isEmptyObject(JSON.parse(window.sessionStorage.getItem("langJsonData")))) {
        toastrDynamicTags = JSON.parse(window.sessionStorage.getItem("langJsonData")).frontend.toastr;
    }
    var service = {};
    // 提示消息提示
    service.info = function (message) {
        if (message == null || message == undefined || message == "") {
            toastr.info(toastrDynamicTags.default[0]);
        } else {
            toastr.info(message);
        }
    }
    // 警告消息提示
    service.warning = function (message) {
        if (message == null || message == undefined || message == "") {
            toastr.warning(toastrDynamicTags.default[1]);
        } else {
            toastr.warning(message);
        }
    }
    // 成功消息提示
    service.success = function (message) {
        if (message == null || message == undefined || message == "") {
            toastr.success(toastrDynamicTags.default[2]);
        } else {
            toastr.success(message);
        }
    }
    // 失败消息提示
    service.error = function (status, message) {
        if (status == 400) {
            if (message == null || message == undefined || message == "") {
                toastr.error(toastrDynamicTags.default[3]);
            } else {
                toastr.error(message);
            }
        } else if (status == 403) {
            if (message == null || message == undefined || message == "") {
                toastr.error(toastrDynamicTags.default[4]);
            } else {
                toastr.error(message);
            }
        } else if (status == 404) {
            if (message == null || message == undefined || message == "") {
                toastr.error(toastrDynamicTags.default[5]);
            } else {
                toastr.error(message);
            }
        }
    }
    return service;
}
