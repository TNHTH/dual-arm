"use strict";

angular
    .module('frApp')
    .controller('weldguideCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$http', weldguideCtrlFn])

function weldguideCtrlFn($scope, $modal, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    $('.setting-menu').tree();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let weldDynamicTags;
    weldDynamicTags = langJsonData.weldguide;
    // 获取导航栏对象页面显示
    $scope.weldguideNavList = weldDynamicTags.navbar;
    // 获取变量对象
    $scope.WeaveTypeData = weldDynamicTags.var_object.WeaveTypeData;
    $scope.multiPointsTypeData = weldDynamicTags.var_object.multiPointsTypeData;
    $scope.weaveWaitTimeData = weldDynamicTags.var_object.weaveWaitTimeData;
    $scope.weaveLocationWaitData = weldDynamicTags.var_object.weaveLocationWaitData;
    $scope.weldTraceIsuplowData = weldDynamicTags.var_object.weldTraceIsuplowData;
    $scope.weldTraceAxisselectData = weldDynamicTags.var_object.weldTraceAxisselectData;
    $scope.weldTraceReferenceTypeData = weldDynamicTags.var_object.weldTraceReferenceTypeData;
    $scope.traceIsleftrightData = weldDynamicTags.var_object.traceIsleftrightData;
    $scope.IOTypeDict = langJsonData.commandlist.IOTypeDict;
    /* 初始化 */
    //焊接专家库
    $scope.selectedSetMultiMotionType = $scope.multiPointsTypeData[0];
    $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[0];
    $scope.selectedWeaveLocationWait= $scope.weaveLocationWaitData[0];
    $scope.WEAxisDistance = 50;
    $scope.WEAxisSpeed = 100;
    $scope.WEAxisacc = 100;
    $scope.modeSpeed = $scope.currentSpeed+"";
    $scope.arcpointSpeed = "";
    $scope.linepointSpeed = "";
    $scope.debugSpeed = "";
    // $scope.weldguideSpeed = 0;
    $scope.weldguideSpeed = 10;
    $scope.debugSpeed = 10;
    $scope.weldVoltage = 200;
    $scope.weldElectric = 200;
    $scope.WExternaAxisIdData = [
        {
            id:"1"
        },
        {
            id:"2"
        },
        {
            id:"3"
        },
        {
            id:"4"
        }
    ]
    $scope.selectedWEAxisTestID = $scope.WExternaAxisIdData[0];
    $scope.SerachDistData = langJsonData.commandlist.SerachDistData;
    $scope.selectedSetWeaveType = $scope.WeaveTypeData[0];
    $scope.WeavecfgData = [
        {
            id:"0"
        },
        {
            id:"1"
        },
        {
            id:"2"
        },
        {
            id:"3"
        },
        {
            id:"4"
        },
        {
            id:"5"
        },
        {
            id:"6"
        },
        {
            id:"7"
        }
    ]
    $scope.selectedSetWeave = $scope.WeavecfgData[0];
    $scope.weaveSetDisable = true;
    $scope.multiSeamData = [
        {
            id:"2",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"3",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"4",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"5",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"6",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"7",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"8",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"9",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"10",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"11",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"12",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"13",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"14",
            x:"0",
            z:"0",
            b:"0"
        },
        {
            id:"15",
            x:"0",
            z:"0",
            b:"0"
        }
    ];
    $scope.weldTraceType = 'UD';
    $scope.selectedWeldTraceIsuplow = $scope.weldTraceIsuplowData[1];
    $scope.selectedWeldTraceAxisselect = $scope.weldTraceAxisselectData[0];
    $scope.selectedWeldTraceReferenceType = $scope.weldTraceReferenceTypeData[0];
    $scope.selectedTraceIsleftright = $scope.traceIsleftrightData[1];
    $scope.selectedArcStartType = $scope.IOTypeDict[1];
    $scope.WeldTraceLagTime = 0;
    $scope.WeldTraceKud = -0.06;
    $scope.WeldTraceKlr = 0.06;
    $scope.WeldTraceTstartud = 5;
    $scope.WeldTraceStepmaxud = 5;
    $scope.WeldTraceTstartlr = 5;
    $scope.WeldTraceStepmaxlr = 5;
    $scope.WeldTraceSummaxud = 300;
    $scope.WeldTraceSummaxlr = 300;
    $scope.WeldTraceReferenceStartSampCurrent = 4;
    $scope.WeldTraceReferenceSampCurrent = 1;
    $scope.WeldTraceReferenceCurrent = 10;
    //函数初始化
    getWeavecfg(0);
    getUserFiles();
    getToolCoordData();
    getOptionsData();
    /* ./初始化 */

    //根据二级菜单切换对应设置界面
    $scope.switchWeldPage = function (id) {
        $(".navItem").removeClass("item-selected");
        $(".navItem" + id).addClass("item-selected");
        $(".childrenItem").removeClass("childItem-selected");
        $(".childrenItem" + id).addClass("childItem-selected");
        $scope.show_line_seam = false;
        $scope.show_arc_seam = false;
        $scope.show_multi_line_seam = false;
        switch (id) {
            case 0:
                $scope.lineseamfile = "";
                $scope.show_line_seam = true;
                break;
            case 1:
                $scope.arcseamfile = "";
                $scope.show_arc_seam = true;
                break;
            case 2:
                $scope.arcseamfile = "";
                $scope.show_multi_line_seam = true;
                break;
            default:
                break;
        }
    }


    /**直线焊缝 */
    /** *************************** */
    
    // 获取工具坐标系数据
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.proSensorCoordeData = JSON.parse(JSON.stringify(data)).filter(item => item.type == 1);
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.proSensorCoordeData = JSON.parse(JSON.stringify(testToolCoordeData)).filter(item => item.type == 1);
                }
                /* ./test */
            });
    };

    //line-seam设置步骤页面切换
    $scope.lineseamset = function(id){
        $scope.show_lineseam_set1 = false;
        $scope.show_lineseam_set2 = false;
        $scope.show_lineseam_set3 = false;
        $scope.show_lineseam_set4 = false;
        $scope.show_lineseam_set5 = false;
        $scope.show_eaxis_set = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.lineseamfile = "";
                $scope.show_lineseam_set1 = true;
                break;
            case 2:
                $scope.show_lineseam_set2 = true;
                break;
            case 3:
                $scope.show_lineseam_set3 = true;
                break;
            case 4:
                if($scope.eaxis_flag){
                    $scope.lineseamset(5);
                    $scope.noLTandWeave();
                    return;
                }
                $scope.show_lineseam_set4 = true;
                break;
            case 5:
                $scope.show_lineseam_set5 = true;
                break;
            default:
                break;
        }
    }
    $scope.lineseamset(1);
    


    //line-seam设置外部轴
    $scope.eaxis_flag = 0;
    $scope.eaxisset = function(index){
        $scope.lineseamset(2); 
        if(index){
            $scope.eaxis_flag = 1;
            $scope.show_eaxis_set = true;
        } else{
            $scope.eaxis_flag = 0;
            $scope.show_eaxis_set = false;
        }
          
    }

    //外部轴伺服使能
    $scope.wsetEAxisServoOn = function(index){
        let EAxisServoOnCmd = {
            cmd: 296,
            data: {
                content:"ExtAxisServoOn("+$scope.selectedWEAxisTestID.id+","+index+")",
            },
        };
        dataFactory.setData(EAxisServoOnCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //外部轴点动
    $scope.wstartEAxisJog = function(index){
        var StartEAxisJogString = "ExtAxisStartJog("+"6"+","+$scope.selectedWEAxisTestID.id+","+index+","+$scope.WEAxisSpeed+","+$scope.WEAxisacc+","+$scope.WEAxisDistance+")";
        let StartEAxisJogCmd = {
            cmd: 292,
            data: {
                content:StartEAxisJogString,
            },
        };
        dataFactory.setData(StartEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //外部轴停止点动
    $scope.wstopEAxisJog = function(){
        var StopEAxisJogString = "StopExtAxisJog";
        let StopEAxisJogCmd = {
            cmd: 240,
            data: {
                content:StopEAxisJogString,
            },
        };
        dataFactory.setData(StopEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //line-seam设置起点安全点
    $scope.linestarttransitpoint_flag = 0;
    $scope.linestarttransitpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"lineseamstarttransit",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.linestarttransitpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //line-seam设置起点
    $scope.startpoint_flag = 0;
    $scope.linestartpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"lineseamstart",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.startpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //line-seam设置终点
    $scope.endpoint_flag = 0;
    $scope.lineendpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"lineseamend",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.linepointSpeed = $scope.velocity+"",
                $scope.calculatWeldLineSpeed();
                $scope.endpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //line-seam设置终点安全点
    $scope.lineendtransitpoint_flag = 0;
    $scope.lineendtransitpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"lineseamendtransit",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                getOptionsData();
                $scope.lineendtransitpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置好点后切换下一个界面
    $scope.nextLTEAxis = function(){
        if(($scope.linestarttransitpoint_flag && $scope.endpoint_flag && $scope.startpoint_flag && $scope.lineendtransitpoint_flag) != 1){
            toastFactory.error(status, weldDynamicTags.error_messages[0]);
            return;
        } 
        $scope.lineseamset(3);
    }

    //line-seam传感器跟踪
    $scope.lineseamLT = function(){
        if ((null == $scope.selectedSerachDist) || (null == $scope.tserachSpeed) || (null == $scope.tsearchLen) || (null == $scope.tsearchTime) || ($scope.selectedSerachDist.num == '6' && $scope.selectedSearchDistPoint == null)) {
            toastFactory.warning(weldDynamicTags.warning_messages[0]);
        } else {
            if ($scope.eaxis_flag) {
                $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamstarttransit,1)" + "\n";
                $scope.lineseamfile += "PTP(lineseamstarttransit,10,-1,0)" + "\n";
                $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamstart,1)" + "\n";
                $scope.lineseamfile += "PTP(lineseamstart,10,-1,0)" + "\n";
                if ($scope.selectedSerachDist.num != '6') {
                    $scope.lineseamfile += "LTSearchStart(" + $scope.selectedSerachDist.num + ",0," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedToolCoorde.id + ")" + "\n";
                } else {
                    $scope.lineseamfile += "LTSearchStart(" + $scope.selectedSerachDist.num + "," + $scope.selectedSearchDistPoint.name + "," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedToolCoorde.id + ")" + "\n";
                }
                $scope.lineseamfile += "LTSearchStop()" + "\n";
                $scope.lineseamfile += "EXT_AXIS_PTP(1,seamPos,1)" + "\n";
                $scope.lineseamfile += "Lin(seamPos,20,-1,1,1,0)" + "\n";
                $scope.lineseamfile += "LTTrackOn(" + $scope.selectedToolCoorde.id + ")" + "\n";
                $scope.lineseamfile += "ARCStart(0,0,1000)" + "\n";
                $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamend,1)" + "\n";
                $scope.lineseamfile += "Lin(lineseamend,10,-1,0,0)" + "\n";
                $scope.lineseamfile += "ARCEnd(0,0,1000)" + "\n";
                $scope.lineseamfile += "LTTrackOff()" + "\n";
                $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamendtransit,1)" + "\n";
                $scope.lineseamfile += "PTP(lineseamendtransit,10,-1,0)" + "\n";
            } else {
                $scope.lineseamfile += "PTP(lineseamstarttransit,10,-1,0)" + "\n";
                $scope.lineseamfile += "PTP(lineseamstart,10,-1,0)" + "\n";
                if ($scope.selectedSerachDist.num != '6') {
                    $scope.lineseamfile += "LTSearchStart(" + $scope.selectedSerachDist.num + ",0," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedToolCoorde.id + ")" + "\n";
                } else {
                    $scope.lineseamfile += "LTSearchStart(" + $scope.selectedSerachDist.num + "," + $scope.selectedSearchDistPoint.name + "," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedToolCoorde.id + ")" + "\n";
                }
                $scope.lineseamfile += "LTSearchStop()" + "\n";
                $scope.lineseamfile += "Lin(seamPos,20,-1,1,1,0)" + "\n";
                $scope.lineseamfile += "LTTrackOn(" + $scope.selectedToolCoorde.id + ")" + "\n";
                $scope.lineseamfile += "ARCStart(0,0,1000)" + "\n";
                $scope.lineseamfile += "Lin(lineseamend,10,-1,0,0)" + "\n";
                $scope.lineseamfile += "ARCEnd(0,0,1000)" + "\n";
                $scope.lineseamfile += "LTTrackOff()" + "\n";
                $scope.lineseamfile += "PTP(lineseamendtransit,10,-1,0)" + "\n";
            }
            $scope.lineseamset(5);
        }
    }

    // 读取摆焊参数配置文件
    function getWeavecfg(index) {
        let getRobotCfgCmd = {
            cmd: "get_weave",
        };
        dataFactory.getData(getRobotCfgCmd).then((data) => {
            let tempData = JSON.parse(JSON.stringify(data));
            tempData.forEach(item => {
                let itemKeys = Object.keys(item);
                itemKeys.forEach(element => {
                    item[element] = Math.trunc(item[element]);
                })
            });
            $scope.WeavecfgData = tempData;
            if (index) {
                $scope.selectedSetWeave = $scope.WeavecfgData[index];
            } else {
                $scope.selectedSetWeave = $scope.WeavecfgData[0];
            }
            $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedSetWeave.type)];
            $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)].name;
            $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)].name;
            $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)];
            $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)];
        }, (status) => {
            toastFactory.error(status, weldDynamicTags.error_messages[1]);
            /*test */
            if (g_testCode) {
                $scope.WeavecfgData = testWeavecfgData;
                console.log($scope.WeavecfgData, '$scope.WeavecfgData');
                if (index) {
                    $scope.selectedSetWeave = $scope.WeavecfgData[index];
                } else {
                    $scope.selectedSetWeave = $scope.WeavecfgData[0];
                }
                $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedSetWeave.type)];
                $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)].name;
                $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)].name;
                $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)];
                $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)];
            }
            /**test */
        });
    }

    // 根据选择编号显示摆动类型
    $scope.weaveTypeChange = function (selectWeave) {
        $scope.selectedSetWeave = selectWeave;
        $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedSetWeave.type)];
        $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)].name;
        $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)].name;
        $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedSetWeave.inctime)];
        $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedSetWeave.stationary)];
    }

    // 摆焊参数配置
    $scope.weaveSetPara = function() {
        var weaveSetParaString = "WeaveSetPara(" + $scope.selectedSetWeave.id + "," + $scope.selectedSetWeaveType.id + "," + $scope.selectedSetWeave.freq
            + "," + $scope.selectedWeaveWaitTime.id + "," + $scope.selectedSetWeave.range + "," + $scope.selectedSetWeave.leftrange + ","
            + $scope.selectedSetWeave.rightrange + "," + $scope.selectedSetWeave.origintime + "," + $scope.selectedSetWeave.ltime + ","
            + $scope.selectedSetWeave.rtime + "," + $scope.selectedSetWeave.circleratio + "," + $scope.selectedWeaveLocationWait.id + "," + $scope.selectedSetWeave.yawangle + ")";
        let weaveSetParaCmd = {
            cmd: 252,
            data: {
                content: weaveSetParaString,
            },
        };
        dataFactory.setData(weaveSetParaCmd).then(() => {
            getWeavecfg(0);
            $scope.lineseamfile += "PTP(lineseamstarttransit,10,-1,0)"+"\n";
            $scope.lineseamfile += "PTP(lineseamstart,10,-1,0)"+"\n";
            $scope.lineseamfile += "ARCStart(0,0,1000)"+"\n";
            $scope.lineseamfile += "WeaveStart("+$scope.selectedSetWeave.id+")"+"\n";
            $scope.lineseamfile += "Lin(lineseamend,10,-1,0,0)"+"\n";
            $scope.lineseamfile += "ARCEnd(0,0,1000)"+"\n";
            $scope.lineseamfile += "WeaveEnd("+$scope.selectedSetWeave.id+")"+"\n";
            $scope.lineseamfile += "PTP(lineseamendtransit,10,-1,0)"+"\n";
            $scope.lineseamset(5);
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 电弧跟踪页面切换
     * @param {string} type 上下补偿：'UD';左右补偿：'LR'
     */
    $scope.toggleUDLRType = function (type) {
        $scope.weldTraceType = type;
        $(".weld-title").removeClass('active');
        $(".weld-title-" + type).addClass('active');
    }

    //未使用跟踪和摆焊
    $scope.noLTandWeave = function(){
        if($scope.eaxis_flag){
            $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamstarttransit,1)"+"\n";
            $scope.lineseamfile += "PTP(lineseamstarttransit,10,-1,0)"+"\n";
            $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamstart,1)"+"\n";
            $scope.lineseamfile += "PTP(lineseamstart,10,-1,0)"+"\n";
            $scope.lineseamfile += "ARCStart(0,0,1000)"+"\n";
            $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamend,1)"+"\n";
            $scope.lineseamfile += "Lin(lineseamend,10,-1,0,0)"+"\n";
            $scope.lineseamfile += "ARCEnd(0,0,1000)"+"\n";
            $scope.lineseamfile += "EXT_AXIS_PTP(1,lineseamendtransit,1)"+"\n";
            $scope.lineseamfile += "PTP(lineseamendtransit,10,-1,0)"+"\n";
        } else{
            $scope.lineseamfile += "PTP(lineseamstarttransit,10,-1,0)"+"\n";
            $scope.lineseamfile += "PTP(lineseamstart,10,-1,0)"+"\n";
            $scope.lineseamfile += "ARCStart(0,0,1000)"+"\n";
            $scope.lineseamfile += "Lin(lineseamend,10,-1,0,0)"+"\n";
            $scope.lineseamfile += "ARCEnd(0,0,1000)"+"\n";
            $scope.lineseamfile += "PTP(lineseamendtransit,10,-1,0)"+"\n";
        }
        $scope.lineseamset(5);
    }

    //获取用户文件
    function getUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.userData = data;
                hidePageLoading();
            }, (status) => {
                toastFactory.error(status, weldDynamicTags.error_messages[2]);
                hidePageLoading();
            });
    };
    

    /**保存直焊缝示教文件 */
    function saveLineseamFile() {
        var newFileName = document.getElementById("lineseamName").value + ".lua";
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: newFileName,
                pgvalue: $scope.lineseamfile,
                type: "1"
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(weldDynamicTags.success_messages[0]+newFileName+weldDynamicTags.success_messages[1]);      
                getUserFiles();
                /*保存文件内容程序示教直接打开*/
                let weldtempname = newFileName;
                let weldtemppgvalue = $scope.lineseamfile;
                sessionStorage.setItem('weldtempname', weldtempname);
                sessionStorage.setItem('weldtemppgvalue', weldtemppgvalue);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 导出直线焊缝工艺文件
    $scope.exportlineseamcfg = function () {
        window.location.href = "/action/download?pathfilename=/root/web/file/weld/lineseam.txt";   
    };

    //计算焊接速度
    $scope.calculatWeldLineSpeed = function(){
        if (($scope.modeSpeed == "" || $scope.modeSpeed == null)||($scope.linepointSpeed == "" || $scope.linepointSpeed == null)||($scope.debugSpeed == "" || $scope.debugSpeed == null)) {
            toastFactory.warning(weldDynamicTags.warning_messages[3]);

        } else{
            $scope.weldguideSpeed = $scope.modeSpeed*$scope.linepointSpeed*$scope.debugSpeed/1000;
        }
    }

    //修改工艺参数
    $scope.applyLineSeamSpeed = function(){
        if($scope.lineseamfile == ""||$scope.lineseamfile == null){
            toastFactory.info(weldDynamicTags.info_messages[0]);
        } else if (($scope.modeSpeed == "" || $scope.modeSpeed == null)||($scope.linepointSpeed == "" || $scope.linepointSpeed == null)||($scope.debugSpeed == "" || $scope.debugSpeed == null)) {
            toastFactory.warning(weldDynamicTags.warning_messages[3]);
        } else if("0" != $scope.controlMode){
            toastFactory.warning(weldDynamicTags.warning_messages[4]);
        } else{
            /**更改程序示教文件内容 */
            let arcdebug = "lineseamend,"+$scope.debugSpeed;
            $scope.lineseamfile = $scope.lineseamfile.replace(/lineseamend,10/,arcdebug);
            var  newFileName = sessionStorage.getItem('weldtempname');
            let saveCmd = {
                cmd: "save_lua_file",
                data: {
                    name: newFileName,
                    pgvalue: $scope.lineseamfile,
                    type: "1"
                },
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    /*保存文件内容程序示教直接打开*/
                    let weldtempname = newFileName;
                    let weldtemppgvalue = $scope.lineseamfile;
                    sessionStorage.setItem('weldtempname', weldtempname);
                    sessionStorage.setItem('weldtemppgvalue', weldtemppgvalue);
                }, (status) => {
                    toastFactory.error(status, weldDynamicTags.error_messages[3]);
                });
            /**更改焊接点速度 */
            $scope.pointsData.lineseamend.speed = $scope.linepointSpeed;
            let modifyPointCmd = {
                cmd: "modify_point",
                data: $scope.pointsData.lineseamend,
            };
            dataFactory.actData(modifyPointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
            /**更改模式速度 */
            var speedString = "SetSpeed("+$scope.modeSpeed+")";
            let setSpeedCmd = {
                cmd: 206,
                data: {
                    content:speedString,
                },
            };
            dataFactory.setData(setSpeedCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
        
    }


    /**圆弧焊缝 */
    /** *************************** */
   //arc-seam设置步骤页面切换
    $scope.arcseamset = function(id){
        $scope.show_arcseam_set1 = false;
        $scope.show_arcseam_set2 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.arcseamfile = "";
                $scope.show_arcseam_set1 = true;
                break;
            case 2:
                $scope.show_arcseam_set2 = true;
                break;
            default:
                break;
        }
    }
    $scope.arcseamset(1);
    

    //arc-seam设置起点安全点
    $scope.arcstarttransitpoint_flag = 0;
    $scope.arcstarttransitpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"arcseamstarttransit",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.arcstarttransitpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //arc-seam设置起点
    $scope.arcstartpoint_flag = 0;
    $scope.arcstartpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"arcseamstart",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.arcstartpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //arc-seam设置圆弧中间点
    $scope.arcbetweenpoint_flag = 0;
    $scope.arcbetweenpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"arcseambetween",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.arcbetweenpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //arc-seam设置终点
    $scope.arcendpoint_flag = 0;
    $scope.arcendpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"arcseamend",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.arcpointSpeed = $scope.velocity+"",
                $scope.calculatWeldArcSpeed();
                $scope.arcendpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //arc-seam设置终点安全点
    $scope.arcendtransitpoint_flag = 0;
    $scope.arcendtransitpoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"arcseamendtransit",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                getOptionsData();
                $scope.arcendtransitpoint_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置好点后切换下一个界面
    $scope.nextsavefile = function(){
        if(($scope.arcstarttransitpoint_flag && $scope.arcstartpoint_flag && $scope.arcbetweenpoint_flag && $scope.arcendpoint_flag && $scope.arcendtransitpoint_flag) != 1){
            toastFactory.warning(weldDynamicTags.warning_messages[5]);
            return;
        }
        $scope.arcseamset(2);
    }

    //保存圆弧焊缝示教文件
    function saveArcseamFile() {
        var newFileName = document.getElementById("arcseamName").value + ".lua";
        $scope.arcseamfile += "PTP(arcseamstarttransit,10,-1,0)"+"\n";
        $scope.arcseamfile += "PTP(arcseamstart,10,-1,0)"+"\n";
        $scope.arcseamfile += "ARCStart(0,0,1000)"+"\n";
        $scope.arcseamfile += "ARC(arcseambetween,0,0,0,0,0,0,0,arcseamend,0,0,0,0,0,0,0,10,0)"+"\n";
        $scope.arcseamfile += "ARCEnd(0,0,1000)"+"\n";
        $scope.arcseamfile += "PTP(arcseamendtransit,10,-1,0)"+"\n";
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: newFileName,
                pgvalue: $scope.arcseamfile,
                type: '1'
            }
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(weldDynamicTags.success_messages[0]+newFileName+weldDynamicTags.success_messages[1]);      
                getUserFiles();
                /*保存文件内容程序示教直接打开*/
                let weldtempname = newFileName;
                let weldtemppgvalue = $scope.arcseamfile;
                sessionStorage.setItem('weldtempname', weldtempname);
                sessionStorage.setItem('weldtemppgvalue', weldtemppgvalue);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 导出圆弧焊缝工艺文件
    $scope.exportarcseamcfg = function () {
        window.location.href = "/action/download?pathfilename=/root/web/file/weld/arcseam.txt";   
    };


    //计算焊接速度
    $scope.calculatWeldArcSpeed = function(){
        if (($scope.modeSpeed == "" || $scope.modeSpeed == null)||($scope.arcpointSpeed == "" || $scope.arcpointSpeed == null)||($scope.debugSpeed == "" || $scope.debugSpeed == null)) {
            toastFactory.warning(weldDynamicTags.warning_messages[3]);

        } else{
            $scope.weldguideSpeed = $scope.modeSpeed*$scope.arcpointSpeed*$scope.debugSpeed/1000*6;
        }
    }

    //修改工艺参数
    $scope.applyArcSeamSpeed = function(){
        if($scope.arcseamfile == ""||$scope.arcseamfile == null){
            toastFactory.info(weldDynamicTags.info_messages[0]);
        } else if (($scope.modeSpeed == "" || $scope.modeSpeed == null)||($scope.arcpointSpeed == "" || $scope.arcpointSpeed == null)||($scope.debugSpeed == "" || $scope.debugSpeed == null)) {
            toastFactory.warning(weldDynamicTags.warning_messages[3]);
        } else if("0" != $scope.controlMode){
            toastFactory.warning(weldDynamicTags.warning_messages[4]);
        } else{
            /**更改程序示教文件内容 */
            let arcdebug = "arcseamend,"+$scope.debugSpeed;
            $scope.arcseamfile = $scope.arcseamfile.replace(/arcseamend,10/,arcdebug);
            var  newFileName = sessionStorage.getItem('weldtempname');
            let saveCmd = {
                cmd: "save_lua_file",
                data: {
                    name: newFileName,
                    pgvalue: $scope.arcseamfile,
                    type: "1"
                },
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    /*保存文件内容程序示教直接打开*/
                    let weldtempname = newFileName;
                    let weldtemppgvalue = $scope.arcseamfile;
                    sessionStorage.setItem('weldtempname', weldtempname);
                    sessionStorage.setItem('weldtemppgvalue', weldtemppgvalue);
                }, (status) => {
                    toastFactory.error(status, weldDynamicTags.error_messages[3]);
                });
            /**更改焊接点速度 */
            $scope.pointsData.arcseamend.speed = $scope.arcpointSpeed;
            let modifyPointCmd = {
                cmd: "modify_point",
                data: $scope.pointsData.arcseamend
            };
            dataFactory.actData(modifyPointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
            /**更改模式速度 */
            var speedString = "SetSpeed("+$scope.modeSpeed+")";
            let setSpeedCmd = {
                cmd: 206,
                data: {
                    content:speedString,
                },
            };
            dataFactory.setData(setSpeedCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
        
    }

    //获取示教点数据
    function getOptionsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.pointsData = data;
            }, (status) => {
                toastFactory.error(status, weldDynamicTags.error_messages[4]);
                /* test */
                if (g_testCode) {
                    $scope.pointsData = testLimitPointData;
                    console.log($scope.pointsData, 'pointsData');
                }
                /* ./test */
            });
    };


    /* 多层多道焊缝 */
    // multiline-seam设置步骤页面切换
    $scope.nextmulitiline = function (id) {
        $scope.show_save_multi_file = false;
        $scope.show_multi_lineseam_basic_set = false;
        $scope.show_multi_lineseam_set1 = false;
        $scope.show_multi_lineseam_set2 = false;
        $scope.show_multi_lineseam_set3 = false;
        $scope.show_multi_lineseam_set4 = false;
        $scope.show_multi_lineseam_set5 = false;
        $scope.show_multi_lineseam_para_set = false;
        switch (id) {
            case 0:
                $scope.show_multi_lineseam_basic_set = true;
                $scope.multiTeachingPointsList = [];
                $scope.mulitilineorigin_flag = 0;
                $scope.mulitilineX_flag = 0;
                $scope.mulitilineZ_flag = 0;
                $scope.multiseamfile = "";
                break;
            case 1:
                $scope.selectedSetMultiMotionType = $scope.multiPointsTypeData[0];
                $scope.multiTeachingPointsList = [];
                $scope.show_multi_lineseam_set1 = true;
                break;
            case 2:
                $scope.multiTeachingPointsList = [];
                $scope.show_multi_lineseam_set2 = true;
                break;
            case 3:
                $scope.show_multi_lineseam_set3 = true;
                break;
            case 4:
                $scope.show_multi_lineseam_set4 = true;
                break;
            case 5:
                $scope.show_multi_lineseam_set5 = true;
                break;
            default:
                break;
        }
        if (id > 2 && $scope.multiTeachingPointsList.length == id - 1) {
            $scope.multiTeachingPointsList = $scope.multiTeachingPointsList.slice(0, $scope.multiTeachingPointsList.length - 1);
        }
        if (id > 0 && $scope.mulitilineorigin_flag == id) {
            $scope.mulitilineorigin_flag = id - 1;
        }
        if (id > 0 && $scope.mulitilineX_flag == id) {
            $scope.mulitilineX_flag = id - 1;
        }
        if (id > 0 && $scope.mulitilineZ_flag == id) {
            $scope.mulitilineZ_flag = id - 1;
        }
    }
    $scope.nextmulitiline(0);
    

    //焊接点设置完成
    $scope.applyMultiLinePoint = function(index){

        if($scope.mulitilineorigin_flag == index && $scope.mulitilineX_flag == index && $scope.mulitilineZ_flag == index){
            if(index == 1){
                if($scope.mulitilinesafe_flag == 1){

                }else{
                    toastFactory.warning(weldDynamicTags.warning_messages[6]);

                    return;
                }
            }
        }else{
            toastFactory.warning(weldDynamicTags.warning_messages[7]);

            return;
        }
        //该点为圆弧终点，需要检查上一点是否设置为圆弧中间点
        if($scope.selectedSetMultiMotionType.id == 2){
            if($scope.multiTeachingPointsList.length < 1 || $scope.multiTeachingPointsList[index-3].type != 1){
                toastFactory.warning(weldDynamicTags.warning_messages[8]);

                return;
            }
        }
        //该点为圆弧中间点，不可完成，需要继续设置圆弧终点
        if($scope.selectedSetMultiMotionType.id == 1){
            toastFactory.warning(weldDynamicTags.warning_messages[9]);

            return;
        }
        //检查成功，填入数组，切换显示
        let multiElement = {
            type: $scope.selectedSetMultiMotionType.id,
            name: "mulitilineorigin"+index,
            namex: "mulitilineX"+index,
            namez: "mulitilineZ"+index,
        };
        $scope.multiTeachingPointsList.push(multiElement);
        $scope.selectedSetMultiMotionType = $scope.multiPointsTypeData[0];
        $scope.show_save_multi_file = false;
        $scope.show_multi_lineseam_set1 = false;
        $scope.show_multi_lineseam_set2 = false;
        $scope.show_multi_lineseam_set3 = false;
        $scope.show_multi_lineseam_set4 = false;
        $scope.show_multi_lineseam_set5 = false;
        $scope.show_multi_lineseam_para_set = true;
    }

    // //显示摆焊参数设置页面
    // $scope.showMultiLineWeaveSet = function(){
    //     $scope.nextmulitiline(0);
    //     $scope.show_multi_lineseam_weave = true;
    // }

    // 配置摆动参数
    $scope.setMultiLineWeave = function () {
        var weaveSetParaString = "WeaveSetPara(" + $scope.selectedSetWeave.id + "," + $scope.selectedSetWeaveType.id + "," + $scope.selectedSetWeave.freq
            + "," + $scope.selectedWeaveWaitTime.id + "," + $scope.selectedSetWeave.range + "," + $scope.selectedSetWeave.leftrange + ","
            + $scope.selectedSetWeave.rightrange + "," + $scope.selectedSetWeave.origintime + "," + $scope.selectedSetWeave.ltime + ","
            + $scope.selectedSetWeave.rtime + "," + $scope.selectedSetWeave.circleratio + "," + $scope.selectedWeaveLocationWait.id + "," + $scope.selectedSetWeave.yawangle + ")";
        let weaveSetParaCmd = {
            cmd: 252,
            data: {
                content: weaveSetParaString,
            },
        };
        dataFactory.setData(weaveSetParaCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    document.getElementById('weldguide').addEventListener('252', e => {
        if (e.detail == '1') {
            getWeavecfg($scope.selectedSetWeave.id);
        }
    })
    

    //显示保存文件页面
    $scope.applyMultiLineFile = function () {
        for (let i = 0; i < $scope.multiItemsArray.length; i++) {
            $scope.multiSeamData[i].x = document.getElementById("tbMultiLineData").rows[i + 1].cells[2].innerText;
            $scope.multiSeamData[i].z = document.getElementById("tbMultiLineData").rows[i + 1].cells[3].innerText;
            $scope.multiSeamData[i].b = document.getElementById("tbMultiLineData").rows[i + 1].cells[4].innerText;
        }
        $scope.multiseamfile += "PTP(mulitilinesafe,10,-1,0)" + "\n";
        $scope.multiseamfile += "PTP(mulitilineorigin1,10,-1,0)" + "\n";
        $scope.multiseamfile += "ARCStart(" + $scope.selectedArcStartType.id + ",0,1000)" + "\n";
        if ($scope.weaveEnabled == 1) {
            $scope.multiseamfile += "WeaveStart(" + $scope.selectedSetWeave.id + ")" + "\n";
        }
        for (let j = 0; j < $scope.multiTeachingPointsList.length; j++) {
            if ($scope.multiTeachingPointsList[j].type == 0) {
                //处理直线运动
                if ($scope.arcEnabled == 1) {
                    $scope.multiseamfile += "ArcWeldTraceControl(1," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
                        + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
                        + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")"  + "\n";
                }
                $scope.multiseamfile += "Lin(" + $scope.multiTeachingPointsList[j].name + ",10,-1,0,0)" + "\n";
                if ($scope.arcEnabled == 1) {
                    $scope.multiseamfile += "ArcWeldTraceControl(0," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
                        + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
                        + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")"  + "\n";
                }
            } else if ($scope.multiTeachingPointsList[j].type == 1) {
                //处理圆弧运动
                if (j + 1 <= $scope.multiTeachingPointsList.length) {
                    if ($scope.arcEnabled == 1) {
                        $scope.multiseamfile += "ArcWeldTraceControl(1," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
                            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
                            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")"  + "\n";
                    }
                    $scope.multiseamfile += "ARC(" + $scope.multiTeachingPointsList[j].name + ",0,0,0,0,0,0,0," + $scope.multiTeachingPointsList[j + 1].name + ",0,0,0,0,0,0,0,10,-1)" + "\n";
                    if ($scope.arcEnabled == 1) {
                        $scope.multiseamfile += "ArcWeldTraceControl(0," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
                            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
                            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")"  + "\n";
                    }
                    j = j + 1;
                } else {
                    //报错
                }
            } else if ($scope.multiTeachingPointsList[j].type == 2) {
                //报错
            }
        }
        $scope.multiseamfile += "ARCEnd(" + $scope.selectedArcStartType.id + ",0,1000)" + "\n";
        if ($scope.weaveEnabled == 1) {
            $scope.multiseamfile += "WeaveEnd(" + $scope.selectedSetWeave.id + ")" + "\n";
        }
        $scope.multiseamfile += "PTP(mulitilinesafe,10,-1,0)" + "\n";
        for (let i = 0; i < $scope.multiItemsArray.length; i++) {
            $scope.multiseamfile += "offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz = MultilayerOffsetTrsfToBase(mulitilineorigin1,mulitilineX1,mulitilineZ1," + $scope.multiSeamData[i].x + "," + $scope.multiSeamData[i].z + "," + $scope.multiSeamData[i].b + ")" + "\n";
            $scope.multiseamfile += "PTP(mulitilineorigin1,10,-1,1,offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz)" + "\n";
            $scope.multiseamfile += "ARCStart(" + $scope.selectedArcStartType.id + ",0,1000)" + "\n";
            for (let j = 0; j < $scope.multiTeachingPointsList.length; j++) {
                if ($scope.multiTeachingPointsList[j].type == 0) {
                    //处理直线运动
                    $scope.multiseamfile += "offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz = MultilayerOffsetTrsfToBase("
                        + $scope.multiTeachingPointsList[j].name + "," + $scope.multiTeachingPointsList[j].namex + "," + $scope.multiTeachingPointsList[j].namez
                        + "," + $scope.multiSeamData[i].x + "," + $scope.multiSeamData[i].z + "," + $scope.multiSeamData[i].b + ")" + "\n";
                    if ($scope.arcEnabled == 1) {
                        $scope.multiseamfile += "ArcWeldTraceReplayStart()" + "\n";
                    }
                    $scope.multiseamfile += "Lin(" + $scope.multiTeachingPointsList[j].name + ",10,-1,0,1,offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz)" + "\n";
                    if ($scope.arcEnabled == 1) {
                        $scope.multiseamfile += "ArcWeldTraceReplayEnd()" + "\n";
                    }
                } else if ($scope.multiTeachingPointsList[j].type == 1) {
                    //处理圆弧运动
                    if (j + 1 <= $scope.multiTeachingPointsList.length) {
                        $scope.multiseamfile += "offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz = MultilayerOffsetTrsfToBase("
                            + $scope.multiTeachingPointsList[j].name + "," + $scope.multiTeachingPointsList[j].namex + "," + $scope.multiTeachingPointsList[j].namez
                            + "," + $scope.multiSeamData[i].x + "," + $scope.multiSeamData[i].z + "," + $scope.multiSeamData[i].b + ")" + "\n";
                        $scope.multiseamfile += "offset_x_2,offset_y_2,offset_z_2,offset_rx_2,offset_ry_2,offset_rz_2 = MultilayerOffsetTrsfToBase("
                            + $scope.multiTeachingPointsList[j + 1].name + "," + $scope.multiTeachingPointsList[j + 1].namex + "," + $scope.multiTeachingPointsList[j + 1].namez
                            + "," + $scope.multiSeamData[i].x + "," + $scope.multiSeamData[i].z + "," + $scope.multiSeamData[i].b + ")" + "\n";
                        if ($scope.arcEnabled == 1) {
                            $scope.multiseamfile += "ArcWeldTraceReplayStart()" + "\n";
                        }
                        $scope.multiseamfile += "ARC(" + $scope.multiTeachingPointsList[j].name + ",1,offset_x,offset_y,offset_z,offset_rx,offset_ry,offset_rz,"
                            + $scope.multiTeachingPointsList[j + 1].name + ",1,offset_x_2,offset_y_2,offset_z_2,offset_rx_2,offset_ry_2,offset_rz_2,10,-1)" + "\n";
                        if ($scope.arcEnabled == 1) {
                            $scope.multiseamfile += "ArcWeldTraceReplayEnd()" + "\n";
                        }
                        j = j + 1;
                    } else {

                    }
                } else if ($scope.multiTeachingPointsList[i].type == 2) {

                }
            }
            $scope.multiseamfile += "ARCEnd(" + $scope.selectedArcStartType.id + ",0,1000)" + "\n";
            $scope.multiseamfile += "PTP(mulitilinesafe,10,-1,0)" + "\n";
        }
        $scope.nextmulitiline();
        $scope.show_save_multi_file = true;
    }

    /**点设置 */
    //multiline设置原点
    $scope.mulitilineorigin_flag = 0;
    $scope.mulitilinestart_originpoint = function(index){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"mulitilineorigin"+index,
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                $scope.mulitilineorigin_flag = index;
            toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //multiline设置X点
    $scope.mulitilineX_flag = 0;
    $scope.mulitilinestart_xpoint = function(index){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"mulitilineX"+index,
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
            $scope.mulitilineX_flag = index;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //multiline设置Z点
    $scope.mulitilineZ_flag = 0;
    $scope.mulitilinestart_zpoint = function(index){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"mulitilineZ"+index,
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
            $scope.mulitilineZ_flag = index;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //multiline设置安全点
    $scope.mulitilinesafe_flag = 0;
    $scope.mulitilinestart_safepoint = function(){
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name":"mulitilinesafe",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
            $scope.mulitilinesafe_flag = 1;
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    $scope.multiTeachingPointsList = [];
    // 切换到下一组点设置
    $scope.checkMultiPoint = function (index) {
        if ($scope.mulitilineorigin_flag == index && $scope.mulitilineX_flag == index && $scope.mulitilineZ_flag == index) {
            if (index == 1) {
                if ($scope.mulitilinesafe_flag != 1) {
                    toastFactory.warning(weldDynamicTags.warning_messages[6]);
                    return;
                }
            }
        } else {
            toastFactory.warning(weldDynamicTags.warning_messages[7]);
            return;
        }
        // 该点为圆弧终点，需要检查上一点是否设置为圆弧中间点
        if ($scope.selectedSetMultiMotionType.id == 2) {
            if ($scope.multiTeachingPointsList.length < 1 || $scope.multiTeachingPointsList[index - 3].type != 1) {
                toastFactory.warning(weldDynamicTags.warning_messages[8]);
                return;
            }
        }
        // 该点为直线点，检查上一点是否为圆弧中间点
        if ($scope.selectedSetMultiMotionType.id == 0) {
            if ($scope.multiTeachingPointsList.length > 0 && $scope.multiTeachingPointsList[index - 3].type == 1) {
                toastFactory.warning(weldDynamicTags.warning_messages[10]);
                return;
            }
        }
        // 第一组不需要填入该数组
        if (index > 1) {
            let multiElement = {
                type: $scope.selectedSetMultiMotionType.id,
                name: "mulitilineorigin" + index,
                namex: "mulitilineX" + index,
                namez: "mulitilineZ" + index,
            };
            $scope.multiTeachingPointsList.push(multiElement);
        }
        $scope.nextmulitiline(index + 1);
        if ($scope.selectedSetMultiMotionType.id == 1) {
            $scope.selectedSetMultiMotionType = $scope.multiPointsTypeData[2];
        } else {
            $scope.selectedSetMultiMotionType = $scope.multiPointsTypeData[0];
        }
    }

    // 旋转焊道
    $scope.multiItemsArray = [];
    $scope.clickCbItem = function (itemId) {
        console.log(itemId, 'itemId');
        console.log($scope.multiItemsArray, '$scope.multiItemsArray--before');
        let cbItem = document.getElementById("cbItem" + itemId);
        if (cbItem.checked == true) {
            $scope.multiItemsArray.push(itemId);
            console.log($scope.multiItemsArray, '$scope.multiItemsArray--after-checked');
            if ($scope.multiItemsArray.length > itemId - 1) {
                cbItem.checked = true;
                toastFactory.info(weldDynamicTags.info_messages[1]);
                return;
            } else if ($scope.multiItemsArray.length < itemId - 1) {
                cbItem.checked = false;
                $scope.multiItemsArray.pop();
                toastFactory.info(weldDynamicTags.info_messages[1]);
                return;
            }
        } else {
            if ($scope.multiItemsArray.length == itemId - 1) {
                $scope.multiItemsArray.pop();
                return;
            } else {
                cbItem.checked = true;
                toastFactory.info(weldDynamicTags.info_messages[1]);
                return;
            }
        };
    };

    //保存多层多道焊缝文件
    function saveMultiLineFile() {
        var newFileName = document.getElementById("multiseamName").value + ".lua";
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: newFileName,
                pgvalue: $scope.multiseamfile,
                type: "1"
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(weldDynamicTags.success_messages[0]+newFileName+weldDynamicTags.success_messages[1]);      
                getUserFiles();
                /*保存文件内容程序示教直接打开*/
                let weldtempname = newFileName;
                let weldtemppgvalue = $scope.multiseamfile;
                sessionStorage.setItem('weldtempname', weldtempname);
                sessionStorage.setItem('weldtemppgvalue', weldtemppgvalue);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 保存文件时同名校验
     * @param {String} weldId multiseamName：多层多道焊缝；arcseamName：圆弧焊缝；lineseamName：直焊缝；
     */
    $scope.checkWeldLuaSameName = function (weldId) {
        var newFileName = document.getElementById(weldId).value + ".lua";
        if (document.getElementById(weldId).value === "" || document.getElementById("multiseamName").value === undefined) {
            toastFactory.warning(weldDynamicTags.warning_messages[1]);
        } else {
            let checkCmd = {
                cmd: "check_lua_file",
                data: {
                    name: newFileName,
                    type: '1'
                },
            };
            dataFactory.getData(checkCmd).then((data) => {
                switch (data.same_name) {
                    case '0':
                        switch (weldId) {
                            case 'multiseamName':
                                saveMultiLineFile();
                                break;
                            case 'arcseamName':
                                saveArcseamFile();
                                break;
                            case 'lineseamName':
                                saveLineseamFile();
                                break;
                            default:
                                break;
                        }
                        break;
                    case '1':
                        toastFactory.warning(weldDynamicTags.warning_messages[2]);
                        break;
                    case '2':
                        toastFactory.warning(weldDynamicTags.warning_messages[11] + weldDynamicTags.warning_messages[13]);
                        break;
                    case '3':
                        toastFactory.warning(weldDynamicTags.warning_messages[12] + weldDynamicTags.warning_messages[13]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, weldDynamicTags.error_messages[5]);
                /* ./test */
                switch ('multiseamName') {
                    case 'multiseamName':
                        saveMultiLineFile();
                        break;
                    case 'arcseamName':
                        saveArcseamFile();
                        break;
                    case 'lineseamName':
                        saveLineseamFile();
                        break;
                    default:
                        break;
                }
                /* test */
            });
        }
    }
};