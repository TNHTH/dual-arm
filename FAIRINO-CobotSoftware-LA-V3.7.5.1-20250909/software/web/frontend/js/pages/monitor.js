"use strict";

angular
    .module('frApp')
    .controller("chartSettingCtrl", ["$scope", "$modal", '$modalInstance', 'currentState', '$http', 'toastFactory', chartSettingCtrlFn])
    .controller("triggerSettingCtrl", ["$scope", "$modal", '$modalInstance', '$http', triggerSettingCtrlFn])
    .controller('monitorCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$q', '$http', monitorCtrlFn])

function chartSettingCtrlFn($scope, $modal, $modalInstance, currentState, $http, toastFactory) {
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let monsDynamicTags;
    let temparr;
    monsDynamicTags = langJsonData.monitor;
    $scope.queryTypeDict = monsDynamicTags.var_object.queryTypeDict;
    // 获取参数列表 
    temparr = langJsonData.varlists[0].varlist.concat(langJsonData.varlists[1].varlist).concat(langJsonData.varlists[2].varlist.concat(langJsonData.varlists[3].varlist.concat(langJsonData.varlists[4].varlist.concat(langJsonData.varlists[5].varlist.concat(langJsonData.varlists[6].varlist)))));
    $scope.currentVarList = {
        varlist: temparr
    }
    /* 初始化 */
    $scope._Title = monsDynamicTags.info_messages[0];
    /* ./初始化 */

    $scope.changeQueryType = function (queryTypeSelected) {

        $scope.containerSelected = undefined;

        if (queryTypeSelected.code == 1) {
            $scope.varsContainer = [
                {
                    name: monsDynamicTags.info_messages[5],
                    vars: [
                        {
                            "varname": "tc1_TCF(mm)",
                            "varindex": "19"
                        },
                        {
                            "varname": "tc2_TCF(mm)",
                            "varindex": "20"
                        },
                        {
                            "varname": "tc3_TCF(mm)",
                            "varindex": "21"
                        },
                        {
                            "varname": "tc4_TCF(°)",
                            "varindex": "22"
                        },
                        {
                            "varname": "tc5_TCF(°)",
                            "varindex": "23"
                        },
                        {
                            "varname": "tc6_TCF(°)",
                            "varindex": "24"
                        },
                        {
                            "varname": "exAxis1Cmd",
                            "varindex": "150"
                        }
                    ]
                }
            ];

        } else {

            // 初始化图表列表
            if (currentState == null) {
                $scope.varsContainer = [
                    {
                        name: "Chart1",
                        vars: []
                    }
                ];
            } else {
                $scope.varsContainer = currentState;
            };

        }
    }

    // 点击参数列表
    $scope.clickVarList = function (listIndex) {
        var vars = document.getElementById("vars" + listIndex)
        if (vars.style.display == "none") {
            vars.style.display = "";
        } else {
            vars.style.display = "none";
        }
    }

    // 选择参数列表中的参数
    $scope.selectVar = function (varElement) {
        $scope.varElementSelected = varElement;
        $(".varitem").removeClass("active");
        $("." + varElement.varindex).addClass("active");
    }

    // 选择图表中的参数
    $scope.selectChartVar = function (chartVarIndex) {
        $scope.chartVarIndexSelected = chartVarIndex;
        $(".chart-varitem").removeClass("active");
        $(".chartVar" + chartVarIndex).addClass("active");
    }

    // 选择图表
    $scope.selectChart = function (containerItem) {
        $scope.containerSelected = containerItem;
        $(".containeritem").removeClass("active");
        $("." + containerItem.name).addClass("active");
    }

    // 将选中的参数添加到选中的图表中
    $scope.setVar2Chart = function () {
        if ($scope.containerSelected != undefined && $scope.varElementSelected != undefined) {
            let isExist = $scope.containerSelected.vars.findIndex(varItem => {
                return varItem.varindex == $scope.varElementSelected.varindex;
            });
            if ($scope.containerSelected.vars.length < 4) {
                if (isExist == -1) {
                    $scope.containerSelected.vars.push($scope.varElementSelected);
                } else {
                    toastFactory.warning(monsDynamicTags.warning_messages[0]);
                }
            } else {
                toastFactory.info(monsDynamicTags.info_messages[4]);
            }
        } else {
            toastFactory.warning(monsDynamicTags.warning_messages[1]);
        }
    }

    // 删除图表中选中的参数
    $scope.delectVarInChart = function () {
        if ($scope.chartVarIndexSelected == null) {
            toastFactory.warning(monsDynamicTags.warning_messages[2]);
        } else {
            $scope.containerSelected.vars.splice($scope.chartVarIndexSelected, 1);
            $scope.chartVarIndexSelected = null;
        }
    }

    // 删除所有图表的所有参数
    $scope.clearAll = function () {
        $scope.varsContainer.forEach(function (item, index, arr) {
            item.vars = [];
        })
    }

   
    $scope.setCharts = function () {
        $modalInstance.close([$scope.queryTypeSelected.code, $scope.varsContainer]);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}


function triggerSettingCtrlFn($scope, $modal, $modalInstance, $http) {

    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let montDynamicTags;
    montDynamicTags = langJsonData.monitor;
    $scope.TriggerModeData = montDynamicTags.var_object.TriggerModeData;

    
    /* 初始化 */
    //变量赋值以及变量初始化
    $scope._Title = "触发设置";
    $scope._Trigger_Mode = "触发方式";
    $scope._Select_Mode = "选择方式";
    $scope._Time_Set = "时长设置";
    $scope._Auto_Trigger_Mode = "自动触发模式";
    $scope._Auto_Mode = "自动触发";
    $scope._Auto_Mode_Detail = "自动触发方式";
    $scope._Select_Signal = "选择信号";
    $scope.IOway = 0;
    $scope.TriggerContent = "触发条件";
    $scope._Confirm = "确定";
    $scope._set = "设置";
    $scope._cancel = "取消";
    $scope._Varable_Value = "变量值";
    $scope.AutoTrigger = true;
    $scope.VlaueTrigger = true;
    $scope.selectedTriggerMode = $scope.TriggerModeData[0];
    getLogName();
    /* ./初始化 */



    //返回数据
    $scope.ReturnTriggerArr = [
        {
            mode: 0,
            content: "",
            autoid: 0,
            signal: 0,
            UporDown: 0,
            value: 0,
        },
    ];

    //手动触发自动触发切换标志位
    $scope.modepage = function (option) {
        $scope.AutoTrigger = !option.num;
    }

    //自动触发方式切换标志位
    $scope.Autopage = function (option) {
        $scope.IOTrigger = false;
        $scope.VlaueTrigger = false;
        if (option.classname == "变量值触发") {
            initoptiondata(option);
            $scope.IOTrigger = false;
            $scope.VlaueTrigger = true;
        }
        else if (option.classname == "IO触发") {
            initoptiondata(option);
            $scope.IOTrigger = true;
            $scope.VlaueTrigger = false;
        }
    }

    //初始化默认选项函数
    function initoptiondata(data) {
        $scope.TriggerSignalType = data.varlist;
        $scope.selectedTriggerAutoType = data.varlist[0];    //默认第一个信号类型
        $scope.TriggerSignalData = data.varlist[0].vardata;
        $scope.selectedTriggerAutoSignal = data.varlist[0].vardata[0];           //默认第一个变量
    }

    //选择信号类型触发函数
    $scope.SignalType = function (option) {
        $scope.TriggerSignalData = option.vardata;
        $scope.selectedTriggerAutoSignal = option.vardata[0];           //默认第一个变量
    }

    //上升沿还是下降沿赋值
    $scope.UporDown = function (value) {
        $scope.IOway = value;
    }


    //返回触发条件数组数据
    function returndataarr(mode, content, autoid, signal, value) {
        $scope.ReturnTriggerArr.mode = mode;
        $scope.ReturnTriggerArr.content = content;
        $scope.ReturnTriggerArr.autoid = autoid;
        $scope.ReturnTriggerArr.signal = signal;
        $scope.ReturnTriggerArr.value = value;
    }

    // $http.get("./data/varlist.json").success(function (jsonData) {
    //     delete jsonData[2];
    //     $scope.allVarList = jsonData;
    //     $scope.allVarList[0].classname = "变量值触发";
    //     $scope.allVarList[1].classname = "IO触发";

    //     $scope.selectedTriggerAutoMode = $scope.allVarList[0];         //默认变量值触发        
    //     initoptiondata($scope.allVarList[0]);
    // });

    // //设置触发方式按键功能函数
    // $scope.setTrigger = function () {

    //     if (0 == $scope.selectedTriggerMode.num) {
    //         if ("变量值触发" == $scope.selectedTriggerAutoMode.classname) {
    //             if (undefined != $scope.VarableValue) {
    //                 $scope.TriggerContent = "触发方式：" + $scope.selectedTriggerMode.optionname + ";" + "自动触发方式：" + $scope.selectedTriggerAutoMode.classname + ";" + "\n" + "  触发信号: " + $scope.selectedTriggerAutoType.typename + $scope.selectedTriggerAutoSignal.varname + ";" + "  触发值: " + $scope.VarableValue + ";";
    //                 returndataarr($scope.selectedTriggerMode.num, $scope.TriggerContent, 0, $scope.selectedTriggerAutoSignal.varindex, $scope.VarableValue);
    //                 $modalInstance.close($scope.ReturnTriggerArr);
    //                 return;
    //             }
    //         }
    //         else if ("IO触发" == $scope.selectedTriggerAutoMode.classname) {
    //             $scope.TriggerContent = "触发方式：" + $scope.selectedTriggerMode.optionname + ";" + "自动触发方式：" + $scope.selectedTriggerAutoMode.classname + ";" + "\n" + "  触发信号: " + $scope.selectedTriggerAutoType.typename + $scope.selectedTriggerAutoSignal.varname + ";" + "  触发值: " + $scope.IOway + ";";
    //             returndataarr($scope.selectedTriggerMode.num, $scope.TriggerContent, 1, $scope.selectedTriggerAutoSignal.varindex, $scope.IOway);
    //             $modalInstance.close($scope.ReturnTriggerArr);
    //             return;
    //         }
    //     }
    //     else if (1 == $scope.selectedTriggerMode.num) {
    //         $scope.TriggerContent = "触发方式：" + $scope.selectedTriggerMode.optionname + ";\n";
    //         returndataarr($scope.selectedTriggerMode.num, $scope.TriggerContent, 0, 0, 0);
    //         $modalInstance.close($scope.ReturnTriggerArr);
    //         return;
    //     } else {
    //         if (g_langFlg == 0) {
    //             toastr.error("触发方式设置错误");
    //         } else if (g_langFlg == 1) {
    //             toastr.error("Trigger mode setting error");
    //         } else if (g_langFlg == 2) {
    //             toastr.error("触发方式设置错误");
    //         }
    //     }
    // };


    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}

function monitorCtrlFn($scope, $modal, dataFactory, toastFactory, $q, $http) {
    // 页面显示范围设置
    $scope.fullContentView();
    $scope.switchVirtualFunc(0);

    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let monDynamicTags;
    monDynamicTags = langJsonData.monitor;
    
    /* 初始化 */
    judgeflag();
    /* ./初始化 */

    var queryType;
    var varslist;
    var charts;
    var getData_ID;
    var xAxisData;
    var isFirstQuery;

    /*查询过程中退出界面，保存查询类型*/
    initializeMonitorPage();
    function initializeMonitorPage() {
        queryType = sessionStorage.getItem("queryType");
    }

    function setMonitorSessionStorage() {
        sessionStorage.setItem('queryType', queryType);
    }


    // 配置表参数
    var tempOption = {
        title: {
            left: 'left',
            text: ''
        },
        tooltip: {},
        xAxis: {
            type: 'category', // category为一级分类,适用于离散的类目数据   
            boundaryGap: false,  // 无间隙
        },
        yAxis: {
            type: 'value', // 'value' 数值轴，适用于连续数据。
            boundaryGap: ['20%', '20%'], // 分别表示数据最小值和最大值的延伸范围，可以直接设置数值或者相对的百分比，/
        },
        legend: [
            {
                left: '20%',
                itemGap: 15,
                itemWidth: 30,
                icon: "circle",
                data: []
            }
            , {
                left: '20%',
                top: '5%',
                itemGap: 15,
                itemWidth: 30,
                icon: "circle",
                data: []
            }
        ],
        series: [
            {
                name: '',
                type: 'line',
                itemStyle: {
                    color: 'rgb(255, 70, 131)'
                },
                data: var1
            },
            {
                name: '',
                type: 'line',
                itemStyle: {
                    color: 'rgb(36, 70, 131)'
                },
                data: var2
            },
            {
                name: '',
                type: 'line',
                itemStyle: {
                    color: 'rgb(36, 70, 15)'
                },
                data: var3
            },
            {
                name: '',
                type: 'line',
                itemStyle: {
                    color: 'rgb(36, 200, 15)'
                },
                data: var4
            }
        ]
    };

    // 获取所有表ID
    var chart1 = echarts.init(document.getElementById('chart1'));

    //表数组数据初始化
    var var1 = [];
    var var2 = [];
    var var3 = [];
    var var4 = [];

    // 设置图表配置
    function setChartOption(chartsArr) {
        let chartOptionSetting = $.extend(true, {}, tempOption);
        chartsArr.forEach(function (item, index, arr) {
            let legendArr = [];
            if (item.vars.length != 0) {
                chartOptionSetting.title.text = item.name;
                for (let i = 0; i < item.vars.length; i++) {
                    legendArr.push(item.vars[i].varname);
                    chartOptionSetting.series[i].name = item.vars[i].varname;
                }
                chartOptionSetting.legend[0].data = legendArr;
            }
        });
        var1 = [];
        var2 = [];
        var3 = [];
        var4 = [];
        chart1.clear();
        chart1.setOption(chartOptionSetting, true);
    };

    // 获取x轴范围数据
    function getAxisData(Data) {
        var temp_axis_data = [];
        for (let i = 0; i < Data.length; i++) {
            temp_axis_data[i] = i;
        }
        return temp_axis_data;
    };

    let getDataCmd = {
        "cmd": "vardata_feedback",
    }
    // 获取查询数据
    function getQueryData() {
        getData_ID = setInterval(() => {
            dataFactory.staData(getDataCmd)
                .then((data) => {
                    if (data.hasOwnProperty("empty_data")) {
                    } else if (data.hasOwnProperty("overflow")) {
                        clearInterval(getData_ID);
                        toastFactory.warning(monDynamicTags.warning_messages[3]);
                    } else {
                        if (charts[0].vars[0] != undefined) {
                            var1 = var1.concat(data.value[charts[0].vars[0].varindex]);
                            if (var1.length >= 11000) {
                                var1.splice(0, 1000);
                            }
                            xAxisData = getAxisData(var1);
                        }
                        if (charts[0].vars[1] != undefined) {
                            var2 = var2.concat(data.value[charts[0].vars[1].varindex]);
                            if (var2.length >= 11000) {
                                var2.splice(0, 1000);
                            }
                        }
                        if (charts[0].vars[2] != undefined) {
                            var3 = var3.concat(data.value[charts[0].vars[2].varindex]);
                            if (var3.length >= 11000) {
                                var3.splice(0, 1000);
                            }
                        }
                        if (charts[0].vars[3] != undefined) {
                            var4 = var4.concat(data.value[charts[0].vars[3].varindex]);
                            if (var4.length >= 11000) {
                                var4.splice(0, 1000);
                            }
                        }
                        chart1.setOption(
                            {
                                xAxis: {
                                    data: xAxisData,
                                },
                                series: [{
                                    data: var1
                                }, {
                                    data: var2
                                }, {
                                    data: var3
                                }, {
                                    data: var4
                                }]
                            }
                        );
                    }
                }, (status) => {
                    clearInterval(getData_ID);
                    toastFactory.error(status, monDynamicTags.error_messages[0]);
                });
        }, 900);
    };

    // 设置图表
    $scope.setCharts = function () {
        if ($scope.queryState == 1) {
            toastFactory.warning(monDynamicTags.warning_messages[4]);
        } else {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: "./pages/views/charts_setting.html",
                controller: 'chartSettingCtrl',
                windowClass: 'small-modal',
                resolve: {
                    currentState: function () {
                        return $scope.currentState;
                    },
                }
            });

            modalInstance.result.then(function (result) {

                queryType = parseInt(result[0]);
                let varsIDArr = [];
                $scope.chartsSetting = "";
                $scope.queryType = 0;

                if (queryType) {
                    chart1.clear();
                    varslist = result[1][0];
                    if (varslist.vars.length != 0) {
                        let varsNameString = "";
                        varslist.vars.forEach(function (item) {
                            varsNameString += item.varname + "，";
                            varsIDArr.push(item.varindex);
                        })
						$scope.chartsSetting += monDynamicTags.info_messages[3] + varsNameString;
                    }
                } else {
                    charts = result[1];
                    $scope.currentState = charts;
                    setChartOption(charts);
                    charts.forEach(function (item, index, arr) {
                        if (item.vars.length != 0) {
                            let itemVarsString = "";
                            for (let i = 0; i < item.vars.length; i++) {
                                itemVarsString += item.vars[i].varname + "，";
                                if (varsIDArr.indexOf(item.vars[i].varindex) == -1) {
                                    varsIDArr.push(item.vars[i].varindex);
                                }
                            }
                            $scope.chartsSetting += item.name + "：" + itemVarsString;
                        }
                    })
                }

                let setVarsCmd = {
                    "cmd": 230,
                    "data": {
                        "type": parseInt(queryType),
                        "id": varsIDArr
                    }
                }
                dataFactory.setData(setVarsCmd)
                    .then(() => {
                        isFirstQuery = true;
                        
                    }, (status) => {
                        toastFactory.error(status);
                    })
            })
        }
    };

    // 添加命令按键触发弹出触发方式选择界面
    $scope.setTrigger = function () {
        var modalInstance;
        modalInstance = $modal.open({
            templateUrl: "./pages/views/monitor_trigger.html",
            controller: 'triggerSettingCtrl',
            windowClass: 'small-modal',
            // resolve: {
            //     currentFilename: function () {
            //         return $scope.chartsArr;
            //     },
            // }
        });

        modalInstance.result.then(function (ReturnTriggerArr) {
            $scope.triggerSetting = ReturnTriggerArr.content;
            let triggersCmd = {
                "cmd": "set_trigger",
                "data": {
                    "triggerkey": ReturnTriggerArr.mode
                }
            }
            dataFactory.setData(triggersCmd)
                .then((data) => {
                    
                }, (status) => {
                    toastFactory.error(status);
                })
        })
    };

    let startQueryCmd = {
        "cmd": 231,
        "data": {
            "flag": "1"
        }
    };

    let stopQueryCmd = {
        "cmd": 231,
        "data": {
            "flag": "0"
        }
    };

    //判断当前是否需要显示停止按键标志
    function judgeflag() {
        if (window.entireQueryStatus == 1) {
            $scope.querystopflag = 1;
        } else {
            $scope.querystopflag = 0;
        }
        hidePageLoading();
    }
    

    // 开始/停止查询功能
    $scope.queryFunc = function () {
        if (charts && charts.length) {
            if (window.entireQueryStatus == 2) {
                toastFactory.info(monDynamicTags.info_messages[1]);
                return;
            } else {
                if ($scope.queryState == 0) {
                    $scope.queryType = 0;
                    dataFactory.setData(startQueryCmd)
                        .then(() => {
                            window.entireQueryStatus = 1;
                            judgeflag();
                            setMonitorSessionStorage();
                            if (!queryType) {
                                if (isFirstQuery == false) {
                                    setChartOption(charts);
                                };
                                isFirstQuery = false;
                                getQueryData();
                            }
                        }, (status) => {
                            toastFactory.error(status);
                        });
                } else if ($scope.queryState == 1) {
                    dataFactory.setData(stopQueryCmd)
                        .then(() => {
                            if (getData_ID) {
                                clearInterval(getData_ID);
                            }
                            window.entireQueryStatus = 0;
                            if (!queryType) {
                                chart1.setOption({
                                    // toolbox：这是ECharts中的工具栏。内置有导出图片、数据视图、动态类型切换、数据区域缩放、重置五个工具。
                                    toolbox: {
                                        // feature 各工具配置项: dataZoom 数据区域缩放;restore 配置项还原;saveAsImage下载为图片;magicType动态类型切换
                                        feature: {
                                            saveAsImage: {}
                                        }
                                    },
                                    tooltip: {
                                        // 当trigger为’item’时只会显示该点的数据，为’axis’时显示该列下所有坐标轴所对应的数据。
                                        trigger: 'axis',
                                        axisPointer: {
                                            type: 'shadow',
                                            label: {
                                                show: true
                                            }
                                        }
                                        // 提示框的位置
                                        // position: function (pt) {
                                        //     return [pt[0], '10%'];
                                        // }
                                    },
                                    dataZoom: [
                                        {
                                            type: 'slider',
                                            show: true,
                                            start: 0,
                                            end: 100,
                                        },
                                        {
                                            type: 'inside',
                                            start: 0,
                                            end: 100
                                        },
                                        {
                                            type: 'slider',
                                            show: true,
                                            yAxisIndex: 0,
                                            left: '93%',
                                            height: '75%',
                                            showDataShadow: false,
                                        }
                                    ]
                                });
                            } else {
                                $scope.queryType = queryType;
                            }
                            if (navigateUrl) {
                                location = navigateUrl;
                                $('#stopQuery').modal('hide');
                            }
                        }, (status) => {
                            toastFactory.error(status);
                        });
                }
            }
        } else {
            toastFactory.warning(monDynamicTags.warning_messages[1]);
        }
    };

    $scope.downloadVarsDataFile = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/statefb/statefb.txt";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/statefb/statefb.txt";
        }
    }

    // 当页面不可见时，如果正在图表查询则下发停止查询
    document.getElementById("monitor").addEventListener(visibilityChange, function () {
        if ($scope.queryState == 1 && queryType == 0) {
            $scope.queryFunc();
        }
    }, false);

    /**离开当前页面，路由发生改变时触发(停止状态查询) */
    let navigateUrl; //跳转页面的路径
    $scope.$on('$routeChangeStart', function(event, current, previous) {
        if (window.entireQueryStatus == 1) {
            if ($scope.queryState == 1 && queryType == 0) {
                event.preventDefault(); //拦截路由跳转
                $('#stopQuery').modal();
                navigateUrl = '#' + current.originalPath; //跳转暂存的路径
            }
        }
    })

    document.getElementById("monitor").addEventListener('stopQuery', () => {
        $scope.queryFunc();
    });

    /* Enter键绑定 */
    $(function () {
        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                if ($("#btn_setchart").is(":visible")) {
                    $("#btn_setchart").click();
                } else if ($("#btn_settrigger").is(":visible")) {
                    $("#btn_settrigger").click();
                }
            }
        });
    });
    /* Enter键绑定 */
}