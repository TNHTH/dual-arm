"use strict";

angular
    .module('frApp')
    .controller('auxCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$http', auxCtrlFn])

function auxCtrlFn($scope, $modal, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    $('.setting-menu').tree();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let auxsDynamicTags;
    let temparr;
    auxsDynamicTags = langJsonData.auxiliary;
    // 获取导航栏对象页面显示
    $scope.auxiliaryNavList = auxsDynamicTags.navbar;
    // 判断子页面是否有权限
    function judgeAuxiliarySetAuth() {
        $scope.userAuthData = getUserAuthority();
    }
    // 获取参数列表
    temparr = langJsonData.varlists[0].varlist.concat(langJsonData.varlists[1].varlist).concat(langJsonData.varlists[2].varlist.concat(langJsonData.varlists[3].varlist));
    $scope.currentVarList = {
        varlist: temparr
    }
    // 获取变量对象
    $scope.LTRecordData = auxsDynamicTags.var_object.LTRecordData;
    $scope.InterfereMethodData = auxsDynamicTags.var_object.InterfereMethodData;
    $scope.interfereCheckMethodData = auxsDynamicTags.var_object.interfereCheckMethodData;
    $scope.interfereReferenceCoordData = auxsDynamicTags.var_object.interfereReferenceCoordData;
    $scope.interfereMotionData = auxsDynamicTags.var_object.interfereMotionData;
    $scope.cubeMethodData = auxsDynamicTags.var_object.cubeMethodData;
    $scope.interfereCheckModeData = auxsDynamicTags.var_object.interfereCheckModeData;
    $scope.interfereCheckJointEnableData = auxsDynamicTags.var_object.interfereCheckJointEnableData;
    $scope.ledColourdData = auxsDynamicTags.var_object.ledColourdData;
    $scope.ptnboxNameData = auxsDynamicTags.var_object.ptnboxNameData;
    $scope.customAgreeLoadData = auxsDynamicTags.var_object.customAgreeLoadData;
    $scope.whetherData = auxsDynamicTags.var_object.whetherData;
    $scope.mainProgramIOData = [
        {
            name: "CI0",
            num: 8,
            disable: false
        },
        {
            name: "CI1",
            num: 9,
            disable: false
        },
        {
            name: "CI2",
            num: 10,
            disable: false
        },
        {
            name: "CI3",
            num: 11,
            disable: false
        },
        {
            name: "CI4",
            num: 12,
            disable: false
        },
        {
            name: "CI5",
            num: 13,
            disable: false
        },
        {
            name: "CI6",
            num: 14,
            disable: false
        },
        {
            name: "CI7",
            num: 15,
            disable: false
        }
    ];
    $scope.startPointIOData = [
        {
            name: "CI0",
            num: 8,
            disable: false
        },
        {
            name: "CI1",
            num: 9,
            disable: false
        },
        {
            name: "CI2",
            num: 10,
            disable: false
        },
        {
            name: "CI3",
            num: 11,
            disable: false
        },
        {
            name: "CI4",
            num: 12,
            disable: false
        },
        {
            name: "CI5",
            num: 13,
            disable: false
        },
        {
            name: "CI6",
            num: 14,
            disable: false
        },
        {
            name: "CI7",
            num: 15,
            disable: false
        }
    ];
    $scope.DICfgData = langJsonData.robot_setting.var_object.DICfgData;
    $scope.externalAgreeData = auxsDynamicTags.var_object.externalAgreeData;
    $scope.dragLockEnableData = auxsDynamicTags.var_object.dragLockEnableData;
    $scope.forceDragLockstatusData = auxsDynamicTags.var_object.forceDragLockstatusData;
    $scope.smarttoolData = auxsDynamicTags.var_object.smarttoolData;
    $scope.smarttoolDOData = [
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
          "id": "6",
          "name": "DO6"
        },
        {
          "id": "7",
          "name": "DO7"
        },
        {
          "id": "8",
          "name": "CO0"
        },
        {
          "id": "9",
          "name": "CO1"
        },
        {
          "id": "10",
          "name": "CO2"
        },
        {
          "id": "11",
          "name": "CO3"
        },
        {
          "id": "12",
          "name": "CO4"
        },
        {
          "id": "13",
          "name": "CO5"
        },
        {
          "id": "14",
          "name": "CO6"
        },
        {
          "id": "15",
          "name": "CO7"
        },
        {
          "id": "16",
          "name": "End-DO0"
        },
        {
          "id": "17",
          "name": "End-DO1"
        },
        {
            "id":"18",
            "name":"Aux-DO0"
        },
        {
            "id":"19",
            "name":"Aux-DO1"
        },
        {
            "id":"20",
            "name":"Aux-DO2"
        },
        {
            "id":"21",
            "name":"Aux-DO3"
        },
        {
            "id":"22",
            "name":"Aux-DO4"
        },
        {
            "id":"23",
            "name":"Aux-DO5"
        },
        {
            "id":"24",
            "name":"Aux-DO6"
        },
        {
            "id":"25",
            "name":"Aux-DO7"
        },
        {
            "id":"26",
            "name":"Aux-DO8"
        },
        {
            "id":"27",
            "name":"Aux-DO9"
        },
        {
            "id":"28",
            "name":"Aux-DO10"
        },
        {
            "id":"29",
            "name":"Aux-DO11"
        },
        {
            "id":"30",
            "name":"Aux-DO12"
        },
        {
            "id":"31",
            "name":"Aux-DO13"
        },
        {
            "id":"32",
            "name":"Aux-DO14"
        },
        {
            "id":"33",
            "name":"Aux-DO15"
        },
        {
            "id":"34",
            "name":"Aux-DO16"
        },
        {
            "id":"35",
            "name":"Aux-DO17"
        },
        {
            "id":"36",
            "name":"Aux-DO18"
        },
        {
            "id":"37",
            "name":"Aux-DO19"
        },
        {
            "id":"38",
            "name":"Aux-DO20"
        },
        {
            "id":"39",
            "name":"Aux-DO21"
        },
        {
            "id":"40",
            "name":"Aux-DO22"
        },
        {
            "id":"41",
            "name":"Aux-DO23"
        },
        {
            "id":"42",
            "name":"Aux-DO24"
        },
        {
            "id":"43",
            "name":"Aux-DO25"
        },
        {
            "id":"44",
            "name":"Aux-DO26"
        },
        {
            "id":"45",
            "name":"Aux-DO27"
        },
        {
            "id":"46",
            "name":"Aux-DO28"
        },
        {
            "id":"47",
            "name":"Aux-DO29"
        },
        {
            "id":"48",
            "name":"Aux-DO30"
        },
        {
            "id":"49",
            "name":"Aux-DO31"
        },
        {
            "id":"50",
            "name":"Aux-DO32"
        },
        {
            "id":"51",
            "name":"Aux-DO33"
        },
        {
            "id":"52",
            "name":"Aux-DO34"
        },
        {
            "id":"53",
            "name":"Aux-DO35"
        },
        {
            "id":"54",
            "name":"Aux-DO-36"
        },
        {
            "id":"55",
            "name":"Aux-DO37"
        },
        {
            "id":"56",
            "name":"Aux-DO38"
        },
        {
            "id":"57",
            "name":"Aux-DO39"
        },
        {
            "id":"58",
            "name":"Aux-DO40"
        },
        {
            "id":"59",
            "name":"Aux-DO41"
        },
        {
            "id":"60",
            "name":"Aux-DO42"
        },
        {
            "id":"61",
            "name":"Aux-DO43"
        },
        {
            "id":"62",
            "name":"Aux-DO44"
        },
        {
            "id":"63",
            "name":"Aux-DO45"
        },
        {
            "id":"64",
            "name":"Aux-DO46"
        },
        {
            "id":"65",
            "name":"Aux-DO47"
        },
        {
            "id":"66",
            "name":"Aux-DO-48"
        },
        {
            "id":"67",
            "name":"Aux-DO49"
        },
        {
            "id":"68",
            "name":"Aux-DO50"
        },
        {
            "id":"69",
            "name":"Aux-DO51"
        },
        {
            "id":"70",
            "name":"Aux-DO52"
        },
        {
            "id":"71",
            "name":"Aux-DO53"
        },
        {
            "id":"72",
            "name":"Aux-DO54"
        },
        {
            "id":"73",
            "name":"Aux-DO55"
        },
        {
            "id":"74",
            "name":"Aux-DO56"
        },
        {
            "id":"75",
            "name":"Aux-DO57"
        },
        {
            "id":"76",
            "name":"Aux-DO58"
        },
        {
            "id":"77",
            "name":"Aux-DO59"
        },
        {
            "id":"78",
            "name":"Aux-DO60"
        },
        {
            "id":"79",
            "name":"Aux-DO61"
        },
        {
            "id":"80",
            "name":"Aux-DO62"
        },
        {
            "id":"81",
            "name":"Aux-DO63"
        },
        {
            "id":"82",
            "name":"Aux-DO64"
        },
        {
            "id":"83",
            "name":"Aux-DO65"
        },
        {
            "id":"84",
            "name":"Aux-DO66"
        },
        {
            "id":"85",
            "name":"Aux-DO67"
        },
        {
            "id":"86",
            "name":"Aux-DO68"
        },
        {
            "id":"87",
            "name":"Aux-DO69"
        },
        {
            "id":"88",
            "name":"Aux-DO70"
        },
        {
            "id":"89",
            "name":"Aux-DO71"
        },
        {
            "id":"90",
            "name":"Aux-DO72"
        },
        {
            "id":"91",
            "name":"Aux-DO73"
        },
        {
            "id":"92",
            "name":"Aux-DO74"
        },
        {
            "id":"93",
            "name":"Aux-DO75"
        },
        {
            "id":"94",
            "name":"Aux-DO76"
        },
        {
            "id":"95",
            "name":"Aux-DO77"
        },
        {
            "id":"96",
            "name":"Aux-DO78"
        },
        {
            "id":"97",
            "name":"Aux-DO79"
        },
        {
            "id":"98",
            "name":"Aux-DO80"
        },
        {
            "id":"99",
            "name":"Aux-DO81"
        },
        {
            "id":"100",
            "name":"Aux-DO82"
        },
        {
            "id":"101",
            "name":"Aux-DO83"
        },
        {
            "id":"102",
            "name":"Aux-DO84"
        },
        {
            "id":"103",
            "name":"Aux-DO85"
        },
        {
            "id":"104",
            "name":"Aux-DO86"
        },
        {
            "id":"105",
            "name":"Aux-DO87"
        },
        {
            "id":"106",
            "name":"Aux-DO88"
        },
        {
            "id":"107",
            "name":"Aux-DO89"
        },
        {
            "id":"108",
            "name":"Aux-DO90"
        },
        {
            "id":"109",
            "name":"Aux-DO91"
        },
        {
            "id":"110",
            "name":"Aux-DO92"
        },
        {
            "id":"111",
            "name":"Aux-DO93"
        },
        {
            "id":"112",
            "name":"Aux-DO94"
        },
        {
            "id":"113",
            "name":"Aux-DO95"
        },
        {
            "id":"114",
            "name":"Aux-DO96"
        },
        {
            "id":"115",
            "name":"Aux-DO97"
        },
        {
            "id":"116",
            "name":"Aux-DO98"
        },
        {
            "id":"117",
            "name":"Aux-DO99"
        },
        {
            "id":"118",
            "name":"Aux-DO100"
        },
        {
            "id":"119",
            "name":"Aux-DO101"
        },
        {
            "id":"120",
            "name":"Aux-DO102"
        },
        {
            "id":"121",
            "name":"Aux-DO103"
        },
        {
            "id":"122",
            "name":"Aux-DO104"
        },
        {
            "id":"123",
            "name":"Aux-DO105"
        },
        {
            "id":"124",
            "name":"Aux-DO106"
        },
        {
            "id":"125",
            "name":"Aux-DO107"
        },
        {
            "id":"126",
            "name":"Aux-DO108"
        },
        {
            "id":"127",
            "name":"Aux-DO109"
        },
        {
            "id":"128",
            "name":"Aux-DO110"
        },
        {
            "num":"129",
            "name":"Aux-DO111"
        },
        {
            "id":"130",
            "name":"Aux-DO112"
        },
        {
            "id":"131",
            "name":"Aux-DO113"
        },
        {
            "id":"132",
            "name":"Aux-DO114"
        },
        {
            "id":"133",
            "name":"Aux-DO115"
        },
        {
            "id":"134",
            "name":"Aux-DO116"
        },
        {
            "id":"135",
            "name":"Aux-DO117"
        },
        {
            "id":"136",
            "name":"Aux-DO118"
        },
        {
            "id":"137",
            "name":"Aux-DO119"
        },
        {
            "id":"138",
            "name":"Aux-DO120"
        },
        {
            "id":"139",
            "name":"Aux-DO121"
        },
        {
            "id":"140",
            "name":"Aux-DO122"
        },
        {
            "id":"141",
            "name":"Aux-DO123"
        },
        {
            "id":"142",
            "name":"Aux-DO124"
        },
        {
            "id":"143",
            "name":"Aux-DO125"
        },
        {
            "id":"144",
            "name":"Aux-DO126"
        },
        {
            "id":"145",
            "name":"Aux-DO127"
        }
    ];
    $scope.weldingOptions = auxsDynamicTags.var_object.weldingOptions;
    $scope.doOutputgData = $scope.smarttoolDOData.slice(0, -138);
    $scope.interfereDragStrategyData = auxsDynamicTags.var_object.interfereDragStrategyData;
    $scope.queryTypeDict = auxsDynamicTags.var_object.queryTypeDict;
    $scope.fullvarsContainer = auxsDynamicTags.var_object.fullvarsContainer;
    $scope.emptyvarsContainer = auxsDynamicTags.var_object.emptyvarsContainer;
    /* 初始化 */
    //显示设置页面标志位初始化
    $scope.show_upgrade = false;
    $scope.show_robot_pack = false;
    $scope.selectedLTRecord = $scope.LTRecordData[0];
    //启动配置
    $scope.whetherStartProgram = $scope.whetherData[0];
    //编码器配置
    $scope.show_switch_encode_state = false;
    $scope.show_password = false;
    //干涉区
    $scope.selectedInterfereMethod = $scope.InterfereMethodData[0];
    $scope.selectedInterfereJointCheckMethod = $scope.interfereCheckMethodData[0];
    $scope.selectedInterfereCubeCheckMethod = $scope.interfereCheckMethodData[0];
    $scope.selectedInterfereReferenceCoord = $scope.interfereReferenceCoordData[0];
    $scope.selectedInterfereMotion = $scope.interfereMotionData[0];
    $scope.selectedInterfereDragStrategy = $scope.interfereDragStrategyData[0];
    $scope.selectedInterfereCubeTeachMethod = $scope.cubeMethodData[0];
    $scope.show_interfere_wobj = false;
    $scope._Interfere_Cube_Calib = false;
    $scope._Interfere_Joint_Calib = true;
    $scope.show_cube_two_point = true;
    $scope.show_cube_center_point = false;
    $scope.interfereCubeCenterPoint = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.interfereCubeMin = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.interfereCubeMax = {
        "x": "0",
        "y": "0",
        "z": "0",
        "rx": "0",
        "ry": "0",
        "rz": "0"
    }
    $scope.interfereJointMin = {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }
    $scope.interfereJointMax = {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }

    //作业原点
    $scope.workHomePoint= {
        "j1": "0",
        "j2": "0",
        "j3": "0",
        "j4": "0",
        "j5": "0",
        "j6": "0"
    }
    //拖动示教锁定
    $scope.selectedDragLockEnable = $scope.dragLockEnableData[0];
    $scope.selectedForceDragLockStatus = $scope.forceDragLockstatusData[0];
    $scope.selectedAdjustStatus = $scope.forceDragLockstatusData[0];
    //六维力和关节阻抗的混合拖动
    $scope.selectedControlStatus = $scope.forceDragLockstatusData[0];
    $scope.selectedImpedanceStatus = $scope.forceDragLockstatusData[0];
    //设定DH参数采集点
    $scope.DHFlag = 1;
    $scope.displayBtnBoxEnableInfo = auxsDynamicTags.info_messages[0];
    $scope.displayExternalAgreeInfo = auxsDynamicTags.info_messages[1];
    /**固件升级 */
    $scope.drvSlaveflag = 0;
    // 拖动锁定
    $scope.forceDragMax = 50;
    $scope.jointSpeedMax = 180;

    /* 获取一系列数据初始化页面 */
    //读取配置文件初始化页面内容
    getWObjCoordData();
    getUserFiles();
    getIP();
    getExDevProtocol();
    getGenkuCubeSpaceData();
    getRobotDOAndAuxDOCfg();
    /* ./初始化 */

    /* 本地时间获取显示1秒刷新一次 */
    function refreshTime() {
        setInterval(() => {
            displayEncoder();
        }, 1000);
    }
    refreshTime();


    //获取工件坐标系数据
    //机器人矫正变量初始化
    let enableflag = 0;
    
    
    //根据二级菜单切换对应设置界面
    $scope.switchApplicationPage = function(id){
        $(".navItem").removeClass("item-selected");
        $(".navItem" + id).addClass("item-selected");
        $(".childrenItem").removeClass("childItem-selected");
        $(".childrenItem" + id).addClass("childItem-selected");
        $scope.show_upgrade = false;
        $scope.show_robot_pack = false;
        $scope.show_encoder = false;
        $scope.show_backup = false;
        $scope.show_query = false;
        $scope.show_ptnbox = false;
        $scope.show_workpoint = false;
        $scope.show_start_robot = false;
        $scope.show_interfere = false;
        $scope.show_led = false;
        $scope.show_custom_agree = false;
        $scope.show_external_agree = false;
        $scope.show_start_robot = false;
        $scope.show_drag_lock = false;
        $scope.show_smart_tool = false;
        $scope.show_gengku_ganshe = false;
        switch(id){
            case "robotic_corrention":
                $scope.show_robot_pack = true;
                break;
            case "encoder_config":
                $scope.show_encoder = true;
                break;
            case "system_upgrade":
                $scope.show_upgrade = true;
                break;
            case "data_backup":
                $scope.show_backup = true;
                break;
            case "ten_data_record":
                $scope.show_query = true;
                break;
            case "tp_config":
                $scope.show_ptnbox = true;
                break;
            case "starting_point":
                $scope.show_workpoint = true;
                getIOAliasData();
                break;
            case "inter_zone":
                $scope.show_interfere = true;
                break;
            case "end_led":
                $scope.show_led = true;
                break;
            case "custom_protocol":
                $scope.show_custom_agree = true;
                break;
            case "peripheral_protocol":
                $scope.show_external_agree = true;
                break;
            case "main_program":
                $scope.show_start_robot = true;
                getIOAliasData();
                break;
            case "drag_lock":
                $scope.show_drag_lock = true;
                getForceSensorAutoFlag();
                getForceAndTorqueDragState();
                break;
            case "smart_tool":
                $scope.show_smart_tool = true;
                getIOAliasData();
                getSmartToolCfg(); 
                break;
            case "multi_inter_zone":
                $scope.show_gengku_ganshe = true;
                break;
            default:
                break;
        }
    }

    //去使能
    $scope.enableRobot = function(){
        var enableString = "RobotEnable(0)";
        let enableCmd = {
            cmd: 302,
            data: {
                content:enableString,
            },
        };
        dataFactory.setData(enableCmd)
            .then(() => {
                enableflag = 1;
            }, (status) => {
                toastFactory.error(status);
            });
    }
    
    //移至原点
    $scope.moveToOrigin = function(){
        if("1" != $scope.controlMode){
            toastFactory.warning(auxsDynamicTags.warning_messages[1]);
        } else {
            let transitPointCmd = {
                cmd: 201,
                data: {
                    "joints":{
                        "j1":"-174.346",
                        "j2":"-91.881",
                        "j3":"1.171",
                        "j4":"-111.953",
                        "j5":"-173.887",
                        "j6":"113.982",
                    },
                    "tcf":{
                        "x":"-50.762",
                        "y":"23.673",
                        "z":"1073.033",
                        "rx":"86.766",
                        "ry":"43.427",
                        "rz":"9.074",
                    },
                    "speed":"20",
                    "acc":"180",
                    "ovl":"50"
                }
            };
            dataFactory.setData(transitPointCmd)
                .then(() => {
                    let packPointCmd = {
                        cmd: 201,
                        data: {
                            "joints":{
                                "j1":"0.084",
                                "j2":"-0.005",
                                "j3":"0.004",
                                "j4":"-0.003",
                                "j5":"-0.016",
                                "j6":"0.008",
                            },
                            "tcf":{
                                "x":"-819.582",
                                "y":"-233.195",
                                "z":"52.997",
                                "rx":"89.998",
                                "ry":"0.004",
                                "rz":"0.118",
                            },
                            "speed":"20",
                            "acc":"180",
                            "ovl":"50"
                        }
                    };
                    dataFactory.setData(packPointCmd)
                        .then(() => {
                            
                        }, (status) => {
                            toastFactory.error(status);
                        })
                }, (status) => {
                    toastFactory.error(status);
                })
        }
	}

    /**移至机械零点 */
    let robotJoints; //robot各轴数据
    let zerpTcfData; //tcf数据
    $scope.moveToZero = function() {
        if("1" != $scope.controlMode){
            toastFactory.warning(auxsDynamicTags.warning_messages[1]);
        } else {
            robotJoints ={
                "j1":"0",
                "j2":"0",
                "j3":"0",
                "j4":"0",
                "j5":"0.02",
                "j6":"0",
            };
            //计算出tcf
            let tcfJointCmd = {
                cmd: 320,
                data: robotJoints
            };
    
            dataFactory.setData(tcfJointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        }
    }

    //移至打包点
    $scope.moveToPack = function(){
        let transitPointCmd;
        if("1" != $scope.controlMode){
            toastFactory.warning(auxsDynamicTags.warning_messages[1]);
        } else { 
            if(g_robotTypeCode == 1 || g_robotType.type == 6 || g_robotTypeCode == 901){  // FR3-V5.0 | FR3MT
                robotJoints = {
                    "j1":"172.969",
                    "j2":"0.911",
                    "j3":"-141.361",
                    "j4":"-126.898",
                    "j5":"-89.816",
                    "j6":"-169.303"
                }
            } else if(g_robotTypeCode == 101 || g_robotTypeCode == 102 || g_robotType.type == 7){  // FR5-V4.0 | FR5-V5.0 
                robotJoints = {
                    "j1":"174.358",
                    "j2":"0.265",
                    "j3":"-158.169",
                    "j4":"-113.687",
                    "j5":"-174.564",
                    "j6":"-16.422"
                }
            } else if (g_robotTypeCode == 201) {        // FR10 V5.0
                robotJoints = {
                    "j1":"174.314",
                    "j2":"0.849",
                    "j3":"-164.762",
                    "j4":"-104.419",
                    "j5":"-178.714",
                    "j6":"-31.675"
                }
            } else if (g_robotTypeCode == 2){           // FR3 V6.0
                robotJoints = {
                    "j1":"45",
                    "j2":"0",
                    "j3":"-148",
                    "j4":"-122",
                    "j5":"0.02",
                    "j6":"0"
                }
            } else if (g_robotTypeCode == 103) {        // FR5 V6.0
                robotJoints = {
                    "j1":"95",
                    "j2":"0",
                    "j3":"-158",
                    "j4":"-122",
                    "j5":"0.02",
                    "j6":"0"
                }
            } else if (g_robotTypeCode == 202) {        // FR10 V6.0
                robotJoints = {
                    "j1":"-110",
                    "j2":"0",
                    "j3":"-159",
                    "j4":"-120",
                    "j5":"0.02",
                    "j6":"0"
                }
            } else if (g_robotTypeCode == 302) {        // FR16 V6.0
                robotJoints = {
                    "j1":"-125",
                    "j2":"10",
                    "j3":"-158",
                    "j4":"-122",
                    "j5":"0.02",
                    "j6":"0"
                }
            } else if (g_robotTypeCode == 402) {        // FR20 V6.0
                robotJoints = {
                    "j1":"-103",
                    "j2":"5",
                    "j3":"-159",
                    "j4":"-120",
                    "j5":"0.02",
                    "j6":"0",
                }              
            } else if (g_robotTypeCode == 1001) {        // FR30 V6.0
                robotJoints = {
                    "j1":"-80",
                    "j2":"5",
                    "j3":"-159",
                    "j4":"70",
                    "j5":"0.02",
                    "j6":"0",
                }              
            } else {
                // type=3,4,5,typeCode=902(FR10,FR16,FR20,FR10YD)暂无打包点功能
                return;
            }
            transitPointCmd = {
                cmd: 320,
                data: robotJoints
            };
            dataFactory.setData(transitPointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                })
        }
    }

    document.getElementById('auxiliaryApplication').addEventListener('320', e => {
        let result = JSON.parse(e.detail);
        if (!$.isEmptyObject(result)) {
            zerpTcfData = result;
            let packPointCmd = {
                cmd: 201,
                data: {
                    "joints":robotJoints,
                    "tcf":zerpTcfData,
                    "speed":$scope.speed.toString(),
                    "acc":$scope.acceleration,
                    "ovl":"50"
                }
            };
            dataFactory.setData(packPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        }
    });


    //切换编码器类型
    $scope.setEncoderConfig = function(){
        if(1 != enableflag){
            toastFactory.info(auxsDynamicTags.info_messages[2]);
        }else{
            let setEncoderConfigCmd = {
                cmd: 391,
                data: {
                    content:"SetEncoderType()",
                },
            };
            dataFactory.setData(setEncoderConfigCmd)
                .then(() => {
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }   
    }

    //切换编码器类型刷新显示
    document.getElementById('auxiliaryApplication').addEventListener('391', () => {
        $scope.show_switch_encode_state = true;
    });

    function displayEncoder(){
        if(undefined == $scope.curEncoderType){
            return;
        }
        if($scope.encoder_type_flag == 0){
            $scope.encodeState = auxsDynamicTags.info_messages[46]+auxsDynamicTags.info_messages[47];
        }else if($scope.encoder_type_flag == 1){
            $scope.encodeState = auxsDynamicTags.info_messages[46]+auxsDynamicTags.info_messages[48];
        }else if($scope.encoder_type_flag == 2){
            $scope.encodeState = auxsDynamicTags.info_messages[46]+auxsDynamicTags.info_messages[49];
        }

        if(parseInt($scope.curEncoderType.curencodertype1) == 0){
            $scope.encoderMode = "1"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype1) == 1){
            $scope.encoderMode = "1"+auxsDynamicTags.info_messages[51]+"\n";
        } 
        if(parseInt($scope.curEncoderType.curencodertype2) == 0){
            $scope.encoderMode += "2"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype2) == 1){
            $scope.encoderMode += "2"+auxsDynamicTags.info_messages[51]+"\n";
        } 
        if(parseInt($scope.curEncoderType.curencodertype3) == 0){
            $scope.encoderMode += "3"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype3) == 1){
            $scope.encoderMode += "3"+auxsDynamicTags.info_messages[51]+"\n";
        } 
        if(parseInt($scope.curEncoderType.curencodertype4) == 0){
            $scope.encoderMode += "4"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype4) == 1){
            $scope.encoderMode += "4"+auxsDynamicTags.info_messages[51]+"\n";
        } 
        if(parseInt($scope.curEncoderType.curencodertype5) == 0){
            $scope.encoderMode += "5"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype5) == 1){
            $scope.encoderMode += "5"+auxsDynamicTags.info_messages[51]+"\n";
        } 
        if(parseInt($scope.curEncoderType.curencodertype6) == 0){
            $scope.encoderMode += "6"+auxsDynamicTags.info_messages[50]+"\n";
        }else if(parseInt($scope.curEncoderType.curencodertype6) == 1){
            $scope.encoderMode += "6"+auxsDynamicTags.info_messages[51]+"\n";
        }  
    }

    


    /* 系统升级 */
    // 上传Web升级包
    $scope.updateWebPkg = function () {
        if ($scope.uploadFlg == 1) {
            toastFactory.info(auxsDynamicTags.info_messages[4]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("webpkgImported").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            $scope.uploadFlg = 0;
            return;
        }
        if ("software.tar.gz" != file.name) {
            toastFactory.info(auxsDynamicTags.info_messages[6]);
            $scope.uploadFlg = 0;
            return;
        }
        formData.append('file', file);
        $scope.progressFlg = 1;
        $scope.uploadFlg = 1;
        document.getElementById('update').value = 0;
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    $scope.webProgressText = auxsDynamicTags.info_messages[42];
                    $scope.uploadFlg = 0;
                }
            }, (status) => {
                $('#updatePage').css("display", "none");
                if (status == 403) {
                    $scope.webProgressText = auxsDynamicTags.info_messages[43];
                } else if (status == 501) {
                    $scope.webProgressText = auxsDynamicTags.info_messages[44];
                } else {
                    toastFactory.error(status);
                }
                $scope.uploadFlg = 0;
            });
    };

    /**固件升级 */
    //检查驱动器升级选择框
    $scope.selectDrvSlave = function(index){
        $scope.drvSlaveID = index;
    }
    $scope.selectDrvSlave(0);

    // 上传驱动器升级包
    $scope.updateDrvPkg = function () {
        if($scope.ecat_boot_flag == 0){
            toastFactory.info(auxsDynamicTags.info_messages[7]);
            return;
        }
        if ($scope.uploadFlg == 1) {
            toastFactory.info(auxsDynamicTags.info_messages[4]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("drvpkgImported").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            $scope.uploadFlg = 0;
            return;
        }
        var fileform = file.name.indexOf(".bin");
        if (fileform == -1) {
            toastFactory.info(auxsDynamicTags.info_messages[8]);
            return;
        }
        var filenametype;
        //检查是否为控制箱文件
        var filenametype = file.name.indexOf("FR_CTRL");
        if($scope.drvSlaveID == 0){
            //检查是否为控制箱文件
            var filenametype = file.name.indexOf("FR_CTRL");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[9]);
                return;
            }
        }else if($scope.drvSlaveID == 7){
            //检查是否为末端文件
            var filenametype = file.name.indexOf("FR_END");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[10]);
                return;
            }
        }else{
            //检查是否为关节文件
            var filenametype = file.name.indexOf("FR_SERVO");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[11]);
                return;
            }
        }
        $scope.progressFlg = 4;
        $scope.uploadFlg = 1;
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let inBootCmd = {
                        cmd: 620,
                        data: {
                            content: "SlaveFileWrite(1,"+$scope.drvSlaveID+",\"/tmp/"+file.name+"\")",
                        },
                    }
                    dataFactory.setData(inBootCmd)
                        .then(() => {
                            $scope.drvSlaveflag = 1;
                            $scope.drvUploadTips = $scope.drvSlaveID;
                        }, (status) => {
                            toastFactory.error(status);
                        })
                    $scope.uploadFlg = 0;
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.drvProgressText = auxsDynamicTags.info_messages[43];
                }
                $scope.uploadFlg = 0;
            });
    };

    /** 安全板固件升级*/
    $scope.updateSafeBoard = function () {
        var formData = new FormData();
        var file = document.getElementById("safeBoardImported").files[0];

        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            return;
        }
        if (file.name.substring(0, 11) != 'FR_SAFE_H7_') {
            toastFactory.info(auxsDynamicTags.info_messages[62]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let inBootCmd = {
                        cmd: 954,
                        data: {
                            content: "SetSafetyFirmUpgrade(\""+file.name+"\")"
                        }
                    }
                    dataFactory.setData(inBootCmd)
                        .then(() => {
                            $scope.safeBoardProgressText = auxsDynamicTags.info_messages[18];
                        }, (status) => {
                            toastFactory.error(status);
                        })
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.safeBoardProgressText = auxsDynamicTags.error_messages[3];
                }
            });
    };
    //获取驱动器升级状态
    document.getElementById('auxiliaryApplication').addEventListener('954', function (e) {
        $scope.safeBoardProgressText = auxsDynamicTags.info_messages[42];
    })

    /**从站配置文件升级 */
    //检查从站选择框
    $scope.selectSlaveConfig = function(index){
        $scope.slaveConfigID = index;
    }
    $scope.selectSlaveConfig(0);
    

    // 上传从站配置bin文件
    $scope.updateSlaveConfig = function () {
        if(1 != enableflag){
            toastFactory.info(auxsDynamicTags.info_messages[2]);
            return;
        }
        if ($scope.uploadFlg == 1) {
            toastFactory.info(auxsDynamicTags.info_messages[4]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("slaveConfigImported").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            $scope.uploadFlg = 0;
            return;
        }
        var fileform = file.name.indexOf(".bin");
        if (fileform == -1) {
            toastFactory.info(auxsDynamicTags.info_messages[8]);
            return;
        }
        var filenametype;
        //检查是否为控制箱文件
        if($scope.slaveConfigID == 0){
            //检查是否为控制箱文件
            var filenametype = file.name.indexOf("FAIR_Cobot_Cbd");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[9]);
                return;
            }
        }else if($scope.slaveConfigID == 7){
            //检查是否为末端文件
            var filenametype = file.name.indexOf("FAIR_Cobot_Axle");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[10]);
                return;
            }
        }else{
            //检查是否为关节文件
            var filenametype = file.name.indexOf("FAIR_Cobot_Servo");
            if (filenametype == -1) {
                toastFactory.info(auxsDynamicTags.info_messages[11]);
                return;
            }
        }
        $scope.progressFlg = 5;
        $scope.uploadFlg = 1;
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let inBootCmd = {
                        cmd: 620,
                        data: {
                            content: "SlaveFileWrite(2,"+$scope.slaveConfigID+",\"/tmp/"+file.name+"\")",
                        },
                    }
                    dataFactory.setData(inBootCmd)
                        .then(() => {
                            $scope.drvSlaveflag = 2;
                            $scope.slaveConfigTips = $scope.slaveConfigID;
                        }, (status) => {
                            toastFactory.error(status);
                        })
                    $scope.uploadFlg = 0;
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[43];
                }
                $scope.uploadFlg = 0;
            });
    };

    /**编码器升级 */
    //检查编码器升级选择框
    $scope.selectEncoderSlave = function(index){
        $scope.encoderSlaveID = index+1;
    }
    $scope.selectEncoderSlave(0);

    // 上传编码器升级包
    $scope.updateEncoderPkg = function () {
        if($scope.ecat_boot_flag == 0){
            toastFactory.info(auxsDynamicTags.info_messages[7]);
            return;
        }
        if ($scope.uploadFlg == 1) {
            toastFactory.info(auxsDynamicTags.info_messages[4]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("encoderpkgImported").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            $scope.uploadFlg = 0;
            return;
        }
        var fileform = file.name.indexOf(".bin");
        if (fileform == -1) {
            toastFactory.info(auxsDynamicTags.info_messages[8]);
            return;
        }

        //检查是否为关节文件
        var filenametype = file.name.indexOf("FR_ENCODER");
        if (filenametype == -1) {
            toastFactory.info(auxsDynamicTags.info_messages[11]);
            return;
        }

        $scope.progressFlg = 6;
        $scope.uploadFlg = 1;
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let inBootCmd = {
                        cmd: 620,
                        data: {
                            content: "SlaveFileWrite(1,"+$scope.encoderSlaveID+",\"/tmp/"+file.name+"\")",
                        },
                    }
                    dataFactory.setData(inBootCmd)
                        .then(() => {
                            $scope.drvSlaveflag = 3;
                            $scope.drvUploadTips = $scope.encoderSlaveID;
                        }, (status) => {
                            toastFactory.error(status);
                        })
                    $scope.uploadFlg = 0;
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.encoderProgressText = auxsDynamicTags.info_messages[43];
                }
                $scope.uploadFlg = 0;
            });
    };

    //获取驱动器升级状态
    document.getElementById('auxiliaryApplication').addEventListener('620', function (e) {
        $scope.upgradeData = JSON.parse(e.detail);
        console.log($scope.upgradeData);
        if ($scope.upgradeData.ret == "0") {
            if ($scope.drvSlaveflag == 1) {
                $scope.drvProgressText = auxsDynamicTags.info_messages[43];
            } else if ($scope.drvSlaveflag == 2) {
                $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[43];
            } else if ($scope.drvSlaveflag == 3) {
                $scope.encoderProgressText = auxsDynamicTags.info_messages[43];
            }
        } else {
            if ($scope.drvSlaveflag == 1) {
                if ($scope.drvUploadTips == 0) {
                    //控制箱文件升级成功
                    $scope.drvProgressText = auxsDynamicTags.info_messages[13];
                } else if ($scope.drvUploadTips == 7) {
                    //末端文件升级成功
                    $scope.drvProgressText = auxsDynamicTags.info_messages[14];
                } else {
                    //关节文件升级成功
                    $scope.drvProgressText = auxsDynamicTags.info_messages[15]+$scope.drvUploadTips+auxsDynamicTags.info_messages[16];
                }
            } else if ($scope.drvSlaveflag == 2) {
                if($scope.slaveConfigTips == 0){
                    //控制箱文件升级成功
                    $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[13];
                } else if ($scope.slaveConfigTips == 7) {
                    //末端文件升级成功
                    $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[14];
                } else {
                    //关节文件升级成功
                    $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[15]+$scope.slaveConfigTips+auxsDynamicTags.info_messages[16];
                }
            } else if ($scope.drvSlaveflag == 3) {
                $scope.encoderProgressText = auxsDynamicTags.info_messages[15]+$scope.drvUploadTips+auxsDynamicTags.info_messages[16];
            }
        }
    });

    /** 设置末端文件传输类型-MCU固件升级*/
    $scope.setEndFileType = function(){
        let setCmd = {
            cmd: 947,
            data: {
                content: "SetAxleFileType(1)"
            },
        }
        dataFactory.setData(setCmd)
            .then(() => {
                $scope.inboot();
            }, (status) => {
                toastFactory.error(status);
            })
    };

    document.getElementById('auxiliaryApplication').addEventListener('947', () => {
        $scope.inboot();
    });

    //进入BOOT模式
    $scope.inboot = function(){
        let inBootCmd = {
            cmd: 332,
            data: {
                content: "SetSysServoBootMode()",
            },
        }
        dataFactory.setData(inBootCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            })
    };

    //获取BOOT模式
    $scope.ecat_boot_flag = 0;
    document.getElementById('auxiliaryApplication').addEventListener('332', () => {
        $scope.ecat_boot_flag = 1;
    });
    
    //设置升级为编码器固件升级
    $scope.setEncoderMode = function(){
        let setEncoderCmd = {
            cmd: 702,
            data: {
                content: "SetEncoderUpgrade()",
            },
        }
        dataFactory.setData(setEncoderCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            })
    };

    //获取状态是否成功
    $scope.encoderBootFlag = 0;
    document.getElementById('auxiliaryApplication').addEventListener('702', () => {
        $scope.encoderBootFlag = 1;
        $scope.inboot();
    });

    document.getElementById('auxiliaryApplication').addEventListener('uploadprogress', function (e) {

        let progressValue = ~~e.detail;
        if ($scope.progressFlg == 1) {
        $scope.webProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
        if (progressValue == 100) {
            $scope.webProgressText = auxsDynamicTags.info_messages[18];
        }
        } else if ($scope.progressFlg == 2) {
            $scope.clProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
            if (progressValue == 100) {
                $scope.clProgressText = auxsDynamicTags.info_messages[18];
            }
        } else if ($scope.progressFlg == 3) {
            $scope.buProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
            if (progressValue == 100) {
                $scope.buProgressText = auxsDynamicTags.info_messages[19];
            }
        } else if ($scope.progressFlg == 4) {
            $scope.drvProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
            if (progressValue == 100) {
                $scope.drvProgressText = auxsDynamicTags.info_messages[18];
            }
        } else if ($scope.progressFlg == 5) {
            $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
            if (progressValue == 100) {
                $scope.slaveConfigProgressText = auxsDynamicTags.info_messages[18];
            }
        } else if ($scope.progressFlg == 6) {
            $scope.encoderProgressText = auxsDynamicTags.info_messages[17] + progressValue + "%";
            if (progressValue == 100) {
                $scope.encoderProgressText = auxsDynamicTags.info_messages[18];
            }
        }
        
    });

    //创建系统版本号
    $scope.createVersion = function(){
        $scope.downloadProgressText = auxsDynamicTags.info_messages[60];
        let creatVersionCmd = {
            cmd: "create_allversions_file",
            data: {},
        };
        dataFactory.actData(creatVersionCmd)
            .then(() => {
                $scope.downloadProgressText = auxsDynamicTags.success_messages[7];
                $scope.downloadUserData();
            }, (status) => {
                $scope.downloadProgressText = "";
                $scope.downloadUserData();   // 版本文件创建失败也导出备份包
                toastFactory.error(status, auxsDynamicTags.error_messages[3]);
            });  
    }

    // 下载用户数据文件
    $scope.downloadUserData = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/fr_user_data.tar.gz";
        }else{
            window.location.href = "/action/download?pathfilename=/fr_user_data.tar.gz";
        }
        
    };

    // 上传用户数据文件
    $scope.uploadUserData = function () {
        if ($scope.uploadFlg == 1) {
            toastFactory.info(auxsDynamicTags.info_messages[4]);
            return;
        }
        $scope.progressFlg = 3;
        $scope.uploadFlg = 1;
        var formData = new FormData();
        var file = document.getElementById("userDataImported").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            $scope.uploadFlg = 0;
            return;
        }
        if ("fr_user_data.tar.gz" != file.name) {
            toastFactory.info(auxsDynamicTags.info_messages[20]);
            $scope.uploadFlg = 0;
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    checkCfgData(1);
                    $scope.uploadFlg = 0;
                    $scope.buProgressText = "";
                    showPageRestart(auxsDynamicTags.info_messages[61]);
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.buProgressText = auxsDynamicTags.info_messages[52];
                }
                $scope.uploadFlg = 0;
            });
    };
    //检查配置文件
    function checkCfgData(index){
        let checkCfgCmd = {
            cmd: 345,
            data: {
                content:"CheckCFG("+index+")",
            },
        };
        dataFactory.setData(checkCfgCmd)
        .then((data) => {
            if(index == 1){
                $scope.aux_check_user_cfg = 0;
            }else if(index == 2){
                $scope.aux_check_eaxis_cfg = 0;
            }else if(index == 3){
                $scope.aux_check_external_cfg = 0;
            }
        }, (status) => {
            toastFactory.error(status, auxsDynamicTags.error_messages[4]);
        });
    }

    //配置文件检查提示
    $scope.aux_restart_tips = "";
    document.getElementById('auxiliaryApplication').addEventListener('345', e => {
        if(e.detail == 1){
            $scope.aux_check_user_cfg = 1;
            checkCfgData(2);
        } else if(e.detail == 2){
            $scope.aux_check_eaxis_cfg = 1;
            checkCfgData(3);
        } else if(e.detail == 3){
            $scope.aux_check_external_cfg = 1;
        }
        if(($scope.aux_check_user_cfg == 1)&&($scope.aux_check_eaxis_cfg == 1)&&($scope.aux_check_external_cfg == 1)){
            $scope.index_cfg_check_tips = "";
            $scope.aux_restart_tips = auxsDynamicTags.info_messages[53];
        }
    })

    $scope.changeQueryType = function () {

        $scope.containerSelected = undefined;

        if ($scope.queryTypeSelected.code == 2) {
            $scope.varsContainer = $scope.fullvarsContainer;
        } else if ($scope.queryTypeSelected.code == 3) {
            $scope.varsContainer = $scope.emptyvarsContainer;
        }
    }

    // 点击参数列表
    $scope.clickVarList = function (listIndex) {
        var vars = document.getElementById("vars"+listIndex)
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
        $("."+varElement.varindex).addClass("active");
    }

    // 选择图表中的参数
    $scope.selectChartVar = function (chartVarIndex) {
        $scope.chartVarIndexSelected = chartVarIndex;
        $(".chart-varitem").removeClass("active");
        $(".chartVar"+chartVarIndex).addClass("active");
    }

    // 选择图表
    $scope.selectChart = function (containerItem) {
        $scope.containerSelected = containerItem;
        $(".containeritem").removeClass("active");
        $("."+containerItem.name).addClass("active");
    }
    
    // 将选中的参数添加到选中的图表中
    $scope.setVar2Chart = function () {
        if ($scope.containerSelected != undefined && $scope.varElementSelected != undefined) {
            let isExist = $scope.containerSelected.vars.findIndex(varItem => {
                return varItem.varindex == $scope.varElementSelected.varindex;
            });
            if ($scope.containerSelected.vars.length < 15) {
                if (isExist == -1) {
                    $scope.containerSelected.vars.push($scope.varElementSelected);
                } else {
                    toastFactory.info(auxsDynamicTags.info_messages[21]);
                }
            } else {
                toastFactory.info(auxsDynamicTags.info_messages[22]);
            }
        } else {
            toastFactory.info(auxsDynamicTags.info_messages[23]);
        }
    }

    // 删除图表中选中的参数
    $scope.delectVarInChart = function () {
        if ($scope.chartVarIndexSelected == null) {
            toastFactory.info(auxsDynamicTags.info_messages[24]);
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

    //下载记录的数据文件
    $scope.downloadQueryData = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/statefb/statefb10.txt";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/statefb/statefb10.txt"
        }
    }
    
    let startQueryCmd = {
        "cmd": 231,
        "data": {
            "flag":"1"
        }
    };

    let stopQueryCmd = {
        "cmd": 231,
        "data": {
            "flag":"0"
        }
    };
    
    // 开始/停止查询功能
    $scope.startQuery = function () {
        if(window.entireQueryStatus == 1){
            toastFactory.info(auxsDynamicTags.info_messages[25]);
            return;
        } else{
            let varsIDArr = [];
            if(($scope.varsContainer == undefined)||($scope.varsContainer[0].vars.length == 0)){
                toastFactory.info(auxsDynamicTags.info_messages[26]);
                return;
            }
            for (let i = 0; i < $scope.varsContainer[0].vars.length; i++) {
                varsIDArr.push($scope.varsContainer[0].vars[i].varindex);
            }
            let setVarsCmd = {
                "cmd": 230,
                "data": {
                    "type": parseInt($scope.queryTypeSelected.code),
                    "id": varsIDArr
                }
            }
            dataFactory.setData(setVarsCmd)
                .then(() => {
                    if ($scope.queryState == 0) {
                        dataFactory.setData(startQueryCmd)
                            .then(() => {
                                window.entireQueryStatus = 2;
                        }, (status) => {
                            toastFactory.error(status);
                        });
                    } else if ($scope.queryState == 1) {
                        toastFactory.warning(auxsDynamicTags.warning_messages[2]);
                    }
                }, (status) => {
                    toastFactory.error(status);
                })
            
        }
    };

    // 开始/停止查询功能
    $scope.stopQuery = function () {
        if ($scope.queryState == 0) {
            toastFactory.info(auxsDynamicTags.info_messages[27]);
        } else if(window.entireQueryStatus == 1){
            toastFactory.info(auxsDynamicTags.info_messages[25]);
            return;
        } else if ($scope.queryState == 1) {
            dataFactory.setData(stopQueryCmd)
                .then(() => {
                    window.entireQueryStatus = 0;
                }, (status) => {
                    toastFactory.error(status);
                })
        }
    };

    //获取示教点配置文件
    function getSysCfg() {
        let getSysCfgCmd = {
            cmd: "get_ptn_cfg",
        };
        dataFactory.getData(getSysCfgCmd)
            .then((data) => {
                $scope.prefixName = data.name;
                $scope.limitNumber = data.number;
                $scope.selectedLTRecord = $scope.LTRecordData[~~(data.laser)];
                $scope.luaname_flag = data.flag;
                $scope.selectedPtnboxNameMthod = $scope.ptnboxNameData[$scope.luaname_flag];
                $scope.changePtnboxNmae();
            }, (status) => {
                $scope.prefixName = "P";
                $scope.limitNumber = 3;
                $scope.selectedLTRecord = $scope.LTRecordData[0];
                $scope.luaname_flag = 0;
                $scope.selectedPtnboxNameMthod = $scope.ptnboxNameData[$scope.luaname_flag];
                $scope.changePtnboxNmae();
                toastFactory.error(status, auxsDynamicTags.error_messages[5]);
            });
    }

    $scope.changePtnboxNmae = function(){
        if(~~$scope.selectedPtnboxNameMthod.id == 0){
            $scope.show_ptn_custom = true;
        } else{ 
            $scope.show_ptn_custom = false;
        }
    }
    getSysCfg();

    //设置示教点配置
    $scope.setptnboxcfg = function () {
        $scope.prefixName = document.getElementById("ptnboxname").value;
        if ($scope.prefixName == "" || $scope.prefixName == null || $scope.prefixName == undefined) {
            toastFactory.info(auxsDynamicTags.info_messages[28]);
        } else if ($scope.limitNumber == "" || $scope.limitNumber == null || $scope.limitNumber == undefined) {
            toastFactory.info(auxsDynamicTags.info_messages[29]);
        } else{
            let setptnboxNameCmd = {
                cmd: "set_ptn_cfg",
                data: {
                    "name": $scope.prefixName,
                    "number": parseInt($scope.limitNumber),
                    "laser": parseInt($scope.selectedLTRecord.id),
                    "flag": parseInt($scope.selectedPtnboxNameMthod.id)
                }
            };
            dataFactory.actData(setptnboxNameCmd)
                .then(() => {
                    
                    document.dispatchEvent(new CustomEvent('updataptnboxcfg', { bubbles: true, cancelable: true, composed: true, detail: {name: $scope.prefixName, number: $scope.limitNumber, laser:$scope.selectedLTRecord.id, flag:$scope.selectedPtnboxNameMthod.id}}));
                }, (status) => {
                    toastFactory.error(status);
                });
        }
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
                let userDataNameArr = Object.keys($scope.userData);
                $scope.selectedStartProgram = $scope.userData[userDataNameArr[0]];
                hidePageLoading();
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[7]);
                hidePageLoading();
                /* test */
                if (g_testCode) {
                    $scope.userData = testData;
                    let userDataNameArr = Object.keys($scope.userData);
                    $scope.selectedStartProgram = $scope.userData[userDataNameArr[0]];
                }
                /* ./test */
            });
    };

    /* 主程序配置 */
    // 获取启动项配置文件
    function getExDeviceCfg() {
        let getCmd = {
            cmd: "get_ex_device_cfg",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.whetherStartProgram = $scope.whetherData[~~data.tm_auto_load_prog_flag];
                if(~~($scope.whetherStartProgram.id) == 1){
                    $scope.displayProgramInfo = auxsDynamicTags.info_messages[54]+(data.tm_auto_load_prog_name).substring(8);
                } else{
                    $scope.displayProgramInfo = auxsDynamicTags.info_messages[55];
                }
                $scope.displayStartPorgram();
                $scope.show_set_program_io = $scope.show_set_program;
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[7]);
                /* test */
                if (g_testCode) {
                    $scope.displayStartPorgram();
                    $scope.show_set_program_io = $scope.show_set_program;
                }
                /* ./test */
            });
    };

    // 显示配置启动程序
    $scope.displayStartPorgram = function(){
        switch(~~($scope.whetherStartProgram.id)){
            case 0:
                $scope.show_set_program = false;
                break;
            case 1:
                $scope.show_set_program = true;
                break;
            default:
                break;
        }
    }
    $scope.selectSlaveConfig(0);
    getExDeviceCfg();
    
    // 设置启动配置
    $scope.setStartProgram = function(){
        var cmdString;
        if(g_systemFlag == 1){
            cmdString = "LoadDefaultProgConfig("+$scope.whetherStartProgram.id+",\""+"/usr/local/etc/controller/lua/"+$scope.selectedStartProgram.name+"\")";
        }else{
            cmdString = "LoadDefaultProgConfig("+$scope.whetherStartProgram.id+",\""+"/fruser/"+$scope.selectedStartProgram.name+"\")";
        }
        let setStartProgramCmd = {
            cmd: 384,
            data: {
                    content:cmdString,
                
            },
        };
        dataFactory.setData(setStartProgramCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    getExDeviceCfg();
                }
                /* ./test */
            });
    }

    // 配置后，同步配置信息
    document.getElementById('auxiliaryApplication').addEventListener('384', e => {
        getExDeviceCfg();
    });

    // 配置主程序DI信号
    $scope.show_set_program_io = false;
    $scope.selectedMainProgramIO = '0';
    $scope.selectedCfgDI8 = 0;
    $scope.selectedCfgDI9 = 0;
    $scope.selectedCfgDI10 = 0;
    $scope.selectedCfgDI11 = 0;
    $scope.selectedCfgDI12 = 0;
    $scope.selectedCfgDI13 = 0;
    $scope.selectedCfgDI14 = 0;
    $scope.selectedCfgDI15 = 0;
    $scope.selectedCfgDI16 = 0;
    $scope.setDICfg = function() {
        switch ($scope.selectedMainProgramIO) {
            case '8':
            case 8:
                $scope.selectedCfgDI8 = 15;
                break;
            case '9':
            case 9:
                $scope.selectedCfgDI9 = 15;
                break;
            case '10':
            case 10:
                $scope.selectedCfgDI10 = 15;
                break;
            case '11':
            case 11:
                $scope.selectedCfgDI11 = 15;
                break;
            case '12':
            case 12:
                $scope.selectedCfgDI12 = 15;
                break;
            case '13':
            case 13:
                $scope.selectedCfgDI13 = 15;
                break;
            case '14':
            case 14:
                $scope.selectedCfgDI14 = 15;
                break;
            case '15':
            case 15:
                $scope.selectedCfgDI15 = 15;
                break;
            default:
                break;
        }
        switch ($scope.selectedStartPointIO) {
            case '8':
            case 8:
                $scope.selectedCfgDI8 = 11;
                break;
            case '9':
            case 9:
                $scope.selectedCfgDI9 = 11;
                break;
            case '10':
            case 10:
                $scope.selectedCfgDI10 = 11;
                break;
            case '11':
            case 11:
                $scope.selectedCfgDI11 = 11;
                break;
            case '12':
            case 12:
                $scope.selectedCfgDI12 = 11;
                break;
            case '13':
            case 13:
                $scope.selectedCfgDI13 = 11;
                break;
            case '14':
            case 14:
                $scope.selectedCfgDI14 = 11;
                break;
            case '15':
            case 15:
                $scope.selectedCfgDI15 = 11;
                break;
            default:
                break;
        }
        $scope.ctrlDIAliasData[$scope.selectedMainProgramIO] = $scope.DICfgData[16].name;
        $scope.ctrlDIAliasData[$scope.selectedStartPointIO] = $scope.DICfgData[12].name;
        var diCfgString = "SetDIConfig(" + $scope.selectedCfgDI8 + "," + $scope.selectedCfgDI9 + "," + $scope.selectedCfgDI10 + "," + $scope.selectedCfgDI11 + "," +
            $scope.selectedCfgDI12 + "," + $scope.selectedCfgDI13 + "," + $scope.selectedCfgDI14 + "," + $scope.selectedCfgDI15 + ")";
        let setDiCfgCmd = {
            cmd: 323,
            data: {
                content:diCfgString,
            },
        };
        dataFactory.setData(setDiCfgCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
            /* test */
            if (g_testCode) {
                setRobotIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
            }
            /* test */
        });
    }

    // 配置后，同步配置信息
    document.getElementById('auxiliaryApplication').addEventListener('323', e => {
        getRobotDOAndAuxDOCfg();
        setRobotIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
    });
    /* ./主程序配置 */

    /* 作业原点 */
    $scope.setHomePoint_flag = false;
    // 设置机器人作业原点
    $scope.setRobotWorkHomePoint = function() {
        let setRobotWorkHomePointCmd = {
            cmd: "save_point",
            data: {
                "name": "pHome",
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(setRobotWorkHomePointCmd)
            .then(() => {
                $scope.setHomePoint_flag = true;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 收到设置机器人作业原点成功后获取状态
    document.getElementById('auxiliaryApplication').addEventListener('428', () => {
        if($scope.setHomePoint_flag) {
            $scope.setHomePoint_flag = false;
            getRobotWorkHomePoint();
        }
    });
    

    // 获取机器人作业原点
    function getRobotWorkHomePoint(){
        let getRobotWorkHomePointCmd = {
            cmd: 429,
            data: {
                content:"GetRobotWorkHomePoint()",
            },
        };
        dataFactory.setData(getRobotWorkHomePointCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 收到设置机器人作业原点成功后获取状态
    document.getElementById('auxiliaryApplication').addEventListener('429', function (e) {
        var workHomePointData = JSON.parse(e.detail);
        $scope.display_Homepoint_Flag = ~~workHomePointData.flag;
        workHomePointData.joints.j1 = parseFloat(workHomePointData.joints.j1).toFixed(3);
        workHomePointData.joints.j2 = parseFloat(workHomePointData.joints.j2).toFixed(3);
        workHomePointData.joints.j3 = parseFloat(workHomePointData.joints.j3).toFixed(3);
        workHomePointData.joints.j4 = parseFloat(workHomePointData.joints.j4).toFixed(3);
        workHomePointData.joints.j5 = parseFloat(workHomePointData.joints.j5).toFixed(3);
        workHomePointData.joints.j6 = parseFloat(workHomePointData.joints.j6).toFixed(3);
        $scope.workHomePoint = workHomePointData.joints;
    });

    // 移至机器人作业原点
    $scope.moveWorkHomePoint = function(){
        let moveWorkHomePointCmd = {
            cmd: "move_to_home_point",
            data: {
                ovl:"30",
            },
        };
        dataFactory.actData(moveWorkHomePointCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /* ./作业原点 */

    //切换干涉方法显示
    $scope.displayInterfereMthod = function(){
        if($scope.selectedInterfereMethod.id == 1){
            $scope._Interfere_Cube_Calib = true;
            $scope._Interfere_Joint_Calib = false;
            if($scope.interfere_cube_setflag == 1){
                $scope.interfere_setflag = auxsDynamicTags.info_messages[56];
            }else{
                $scope.interfere_setflag = auxsDynamicTags.info_messages[57];
            }
        } else{ 
            $scope._Interfere_Cube_Calib = false;
            $scope._Interfere_Joint_Calib = true;
            if($scope.interfere_joint_setflag == 1){
                $scope.interfere_setflag = auxsDynamicTags.info_messages[56];
            }else{
                $scope.interfere_setflag = auxsDynamicTags.info_messages[57];
            }
        }
        $scope.changeInterfereDragStrategy();
    }

    //切换显示坐标系
    $scope.displayWobjCoord = function(){
        if($scope.selectedInterfereReferenceCoord.id == 1){
            $scope.show_interfere_wobj = true;
        } else{ 
            $scope.show_interfere_wobj = false;
        }
    }

    //切换立方体干涉示教方法
    $scope.displayCubeTeachMethod = function(){
        if($scope.selectedInterfereCubeTeachMethod.id == 1){
            $scope.show_cube_two_point = false;
            $scope.show_cube_center_point = true;
        } else{ 
            $scope.show_cube_two_point = true;
            $scope.show_cube_center_point = false;
        }
    }

    //关闭干涉区
    $scope.setInterfereClose = function(){
        let setInterfereOff;
        if($scope.selectedInterfereMethod.id == 0){
            setInterfereOff = {
                cmd: 430,
                data: {
                    content:"JointInterfereOnOff(0)",
                },
            };
        }else{
            setInterfereOff = {
                cmd: 432,
                data: {
                    content:"CubeInterfereOnOff(0)",
                },
            };
        }
        dataFactory.setData(setInterfereOff)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //开启干涉区
    $scope.setInterfereOpen = function(){
        let setInterfereOn;
        if($scope.selectedInterfereMethod.id == 0){
            setInterfereOn = {
                cmd: 430,
                data: {
                    content:"JointInterfereOnOff(1)",
                },
            };
        }else{
            setInterfereOn = {
                cmd: 432,
                data: {
                    content:"CubeInterfereOnOff(1)",
                },
            };
        }
        dataFactory.setData(setInterfereOn)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置干涉区开启关闭后获取状态
    document.getElementById('auxiliaryApplication').addEventListener('430', () => {
        getRobotdata();
    });

    //设置干涉区开启关闭后获取状态
    document.getElementById('auxiliaryApplication').addEventListener('432', () => {
        getRobotdata();
    });

    //进入干涉区是否停止
    $scope.interfereStopSet = function(){
        let interfereStopSetCmd = {
            cmd: 436,
            data: {
                content:"InterfereStopSet("+$scope.selectedInterfereMotion.id+")",
            },
        };
        dataFactory.setData(interfereStopSetCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //拖动策略阻抗回调显示
    $scope.show_Interfere_Impedance = false;
    $scope.changeInterfereDragStrategy = function(){
        console.log($scope.selectedInterfereDragStrategy);
        if($scope.selectedInterfereDragStrategy.id == 1){
            $scope.show_Interfere_Impedance = true;
            if($scope.selectedInterfereMethod.id == 1){
                $scope.show_Interfere_Impedance_Der = true;
                $scope.show_Interfere_Impedance_Joint = false;
            }else{
                $scope.show_Interfere_Impedance_Der = false;
                $scope.show_Interfere_Impedance_Joint = true;
            }
        } else{
            $scope.show_Interfere_Impedance = false;
        }
    }

    //设置拖动策略
    $scope.interfereDragStrategy = function(){
        let interfereDragStrategyCmd = {
            cmd: 618,
            data: {
                content:"InterfereSetDragStrategy("+$scope.selectedInterfereDragStrategy.id+")",
            },
        };
        dataFactory.setData(interfereDragStrategyCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置轴干涉关节最大范围
    $scope.setInterfereJointMax = function(){
        $scope.interfereJointMax = JSON.parse(JSON.stringify($scope.jointsData));
    }

    //设置轴干涉关节最小范围
    $scope.setInterfereJointMin = function(){
        $scope.interfereJointMin = JSON.parse(JSON.stringify($scope.jointsData));
    }

    //轴干涉区参数设置
    $scope.jointInterfereParamSet = function(){
        let jointInterfereParamSetCmd = {
            cmd: 431,
            data: {
                content:"JointInterfereParamSet("+$scope.selectedInterfereJointCheckMethod.id+","+$scope.interfereJointMin.j1+","+$scope.interfereJointMin.j2+","+$scope.interfereJointMin.j3
                +","+$scope.interfereJointMin.j4+","+$scope.interfereJointMin.j5+","+$scope.interfereJointMin.j6+","+$scope.interfereJointMax.j1+","+$scope.interfereJointMax.j2+","+$scope.interfereJointMax.j3
                +","+$scope.interfereJointMax.j4+","+$scope.interfereJointMax.j5+","+$scope.interfereJointMax.j6+","+$scope.selectedInterfereJointCheckMode.id
                +","+$scope.selectedInterfereJoint1Enable.id+","+$scope.selectedInterfereJoint2Enable.id+","+$scope.selectedInterfereJoint3Enable.id
                +","+$scope.selectedInterfereJoint4Enable.id+","+$scope.selectedInterfereJoint5Enable.id+","+$scope.selectedInterfereJoint6Enable.id+")",
            },
        };
        dataFactory.setData(jointInterfereParamSetCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //立方体干涉区参数设置
    $scope.cubeInterfereParamSet = function(){
        let cubeInterfereParamSetCmd
        if($scope.selectedInterfereReferenceCoord.id == 0){
            var WObjCoordString = g_systemFlag ? "SetWObjCoord(0,0,0,0,0,0,0,0)" : "SetWObjCoord(0,0,0,0,0,0,0)";
            let setWObjCoordCmd = {
                cmd: 251,
                data: {
                    content:WObjCoordString,
                },
            };
            dataFactory.setData(setWObjCoordCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
            cubeInterfereParamSetCmd = {
                cmd: 431,
                data: {
                    content:"CubeInterfereParamSet("+$scope.selectedInterfereReferenceCoord.id+",0,0,0,0,0,0,0,"+$scope.selectedInterfereCubeCheckMethod.id+","+$scope.selectedInterfereCubeCheckMode.id+")",
                },
            };
        }else{
            $scope.applyWObjCoord();
            cubeInterfereParamSetCmd = {
                cmd: 431,
                data: {
                    content:"CubeInterfereParamSet("+$scope.selectedInterfereReferenceCoord.id+","+$scope.selectedWObjCoorde.id+","+$scope.selectedWObjCoorde.x+","+$scope.selectedWObjCoorde.y
                    +","+$scope.selectedWObjCoorde.z+","+$scope.selectedWObjCoorde.rx+","+$scope.selectedWObjCoorde.ry+","+$scope.selectedWObjCoorde.rz+","+$scope.selectedInterfereCubeCheckMethod.id
                    +","+$scope.selectedInterfereCubeCheckMode.id+")",
                },
            };
        }
        dataFactory.setData(cubeInterfereParamSetCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //坐标系数据保留三位小数
	function handledecimal(data){ 
		let namearr = Object.keys(data);
		let namelength = namearr.length;
		for(let i=0; i<namelength; i++){
			let valuearr = Object.keys(data[namearr[i]]);
			var valuelength = valuearr.length;
			if(8 == valuelength){
				for(let j=2; j<valuelength; j++){
					data[namearr[i]][valuearr[j]] = parseFloat(data[namearr[i]][valuearr[j]]).toFixed(3);
				}
			} else if(10 == valuelength){
				for(let j=2; j<valuelength-1; j++){
					data[namearr[i]][valuearr[j]] = parseFloat(data[namearr[i]][valuearr[j]]).toFixed(3);
				}
			} else{
				for(let j=3; j<valuelength; j++){
					data[namearr[i]][valuearr[j]] = parseFloat(data[namearr[i]][valuearr[j]]).toFixed(3);
				}
			}
		}
	}

    //获取工件坐标系数据
    function getWObjCoordData() {
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                handledecimal(data);
                $scope.WObjCoordeData = JSON.parse(JSON.stringify(data));
                $scope.originWObjCoordeData = JSON.parse(JSON.stringify(data));
				if(null != $scope.selectedWObjCoorde){
					$scope.selectedWObjCoorde = $scope.WObjCoordeData[$scope.selectedWObjCoorde.name];
					
				} else{
					$scope.selectedWObjCoorde = $scope.WObjCoordeData.wobjcoord0;
				}
				
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[8]);

            });
    };

    //应用工件坐标系
    $scope.applyWObjCoord = function() {
        var WObjCoordString;
        if (g_systemFlag) {
            WObjCoordString = "SetWObjCoord("+ $scope.selectedWObjCoorde.id + "," + $scope.selectedWObjCoorde.x + "," + $scope.selectedWObjCoorde.y + "," + $scope.selectedWObjCoorde.z + "," + $scope.selectedWObjCoorde.rx + "," + $scope.selectedWObjCoorde.ry + "," + $scope.selectedWObjCoorde.rz + "," + $scope.selectedWObjCoorde.reference + ")";
        } else {
            WObjCoordString = "SetWObjCoord("+ $scope.selectedWObjCoorde.id + "," + $scope.selectedWObjCoorde.x + "," + $scope.selectedWObjCoorde.y + "," + $scope.selectedWObjCoorde.z + "," + $scope.selectedWObjCoorde.rx + "," + $scope.selectedWObjCoorde.ry + "," + $scope.selectedWObjCoorde.rz + ")";
        }
        let setWObjCoordCmd = {
            cmd: 251,
            data: {
                content:WObjCoordString,
            },
        };
        dataFactory.setData(setWObjCoordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    

    //设置立方体干涉两点法最大范围
    $scope.setInterfereCubeMax = function(){
        $scope.interfereCubeMax = JSON.parse(JSON.stringify($scope.currentTCP));
    }

    //设置立方体干涉两点法最小范围
    $scope.setInterfereCubeMin = function(){
        $scope.interfereCubeMin = JSON.parse(JSON.stringify($scope.currentTCP));
    }

    //立方体干涉区两点法设置
    $scope.setCubeInterfereCalib_twoPoint = function(){
        let setCubeInterfereCalib_twoPointCmd = {
            cmd: 434,
            data: {
                content:"CubeInterfereCalib_twoPoint("+$scope.interfereCubeMin.x+","+$scope.interfereCubeMin.y+","+$scope.interfereCubeMin.z+","+$scope.interfereCubeMax.x+","+$scope.interfereCubeMax.y+","+$scope.interfereCubeMax.z+")",
            },
        };
        dataFactory.setData(setCubeInterfereCalib_twoPointCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置立方体干涉区中心点
    $scope.setInterfereCubeCenterPoint = function(){
        $scope.interfereCubeCenterPoint = JSON.parse(JSON.stringify($scope.currentTCP));
    }

    //立方体干涉区点+边长设置
    $scope.setCubeInterfereCalib_onePoint = function(){
        let setCubeInterfereCalib_onePointCmd = {
            cmd: 435,
            data: {
                content:"CubeInterfereCalib_onePoint("+$scope.interfereCubeCenterPoint.x+","+$scope.interfereCubeCenterPoint.y+","+$scope.interfereCubeCenterPoint.z+","+
                $scope.interfereCubeLength_x+","+$scope.interfereCubeLength_y+","+$scope.interfereCubeLength_z+")",
            },
        };
        dataFactory.setData(setCubeInterfereCalib_onePointCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //获取机器人配置文件
    function getRobotdata(){
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.selectedInterfereMotion = $scope.interfereMotionData[~~data.interfere_stop];
                $scope.selectedInterfereDragStrategy = $scope.interfereDragStrategyData[~~data.interfere_drag];
                $scope.changeInterfereDragStrategy();
                $scope.selectedInterfereJointCheckMethod = $scope.interfereCheckMethodData[~~data.interfere_joint_datacheck];
                $scope.interfereJointMin.j1 = parseFloat(data.interfere_j1_min).toFixed(3);
                $scope.interfereJointMin.j2 = parseFloat(data.interfere_j2_min).toFixed(3);
                $scope.interfereJointMin.j3 = parseFloat(data.interfere_j3_min).toFixed(3);
                $scope.interfereJointMin.j4 = parseFloat(data.interfere_j4_min).toFixed(3);
                $scope.interfereJointMin.j5 = parseFloat(data.interfere_j5_min).toFixed(3);
                $scope.interfereJointMin.j6 = parseFloat(data.interfere_j6_min).toFixed(3);
                $scope.interfereJointMax.j1 = parseFloat(data.interfere_j1_max).toFixed(3);
                $scope.interfereJointMax.j2 = parseFloat(data.interfere_j2_max).toFixed(3);
                $scope.interfereJointMax.j3 = parseFloat(data.interfere_j3_max).toFixed(3);
                $scope.interfereJointMax.j4 = parseFloat(data.interfere_j4_max).toFixed(3);
                $scope.interfereJointMax.j5 = parseFloat(data.interfere_j5_max).toFixed(3);
                $scope.interfereJointMax.j6 = parseFloat(data.interfere_j6_max).toFixed(3);
                $scope.selectedInterfereJointCheckMode = $scope.interfereCheckModeData[~~data.interfere_joint_mode];
                $scope.selectedInterfereJoint1Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j1_enable];
                $scope.selectedInterfereJoint2Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j2_enable];
                $scope.selectedInterfereJoint3Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j3_enable];
                $scope.selectedInterfereJoint4Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j4_enable];
                $scope.selectedInterfereJoint5Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j5_enable];
                $scope.selectedInterfereJoint6Enable = $scope.interfereCheckJointEnableData[~~data.interfere_j6_enable];
                //六维力和关节阻抗的混合拖动
                $scope.selectedImpedanceStatus = $scope.forceDragLockstatusData[~~data.impedance_sign];
                $scope.lamdaGainJoint1 = parseFloat(data.lamdagain1).toFixed(3);
                $scope.lamdaGainJoint2 = parseFloat(data.lamdagain2).toFixed(3);
                $scope.lamdaGainJoint3 = parseFloat(data.lamdagain3).toFixed(3);
                $scope.lamdaGainJoint4 = parseFloat(data.lamdagain4).toFixed(3);
                $scope.lamdaGainJoint5 = parseFloat(data.lamdagain5).toFixed(3);
                $scope.lamdaGainJoint6 = parseFloat(data.lamdagain6).toFixed(3);
                $scope.kGainJoint1 = parseFloat(data.kgain1).toFixed(3);
                $scope.kGainJoint2 = parseFloat(data.kgain2).toFixed(3);
                $scope.kGainJoint3 = parseFloat(data.kgain3).toFixed(3);
                $scope.kGainJoint4 = parseFloat(data.kgain4).toFixed(3);
                $scope.kGainJoint5 = parseFloat(data.kgain5).toFixed(3);
                $scope.kGainJoint6 = parseFloat(data.kgain6).toFixed(3);
                $scope.bGainJoint1 = parseFloat(data.bgain1).toFixed(3);
                $scope.bGainJoint2 = parseFloat(data.bgain2).toFixed(3);
                $scope.bGainJoint3 = parseFloat(data.bgain3).toFixed(3);
                $scope.bGainJoint4 = parseFloat(data.bgain4).toFixed(3);
                $scope.bGainJoint5 = parseFloat(data.bgain5).toFixed(3);
                $scope.bGainJoint6 = parseFloat(data.bgain6).toFixed(3);
                $scope.terminalLinearSpeed = parseFloat(data.dragmaxtcpvel).toFixed(3);
                $scope.angularSpeedLimit = parseFloat(data.dragmaxtcporivel).toFixed(3);


                $scope.interfere_joint_setflag = ~~data.interfere_joint_setflag;
                $scope.interfere_cube_setflag = ~~data.interfere_cube_setflag;
                $scope.displayInterfereMthod();

                
                $scope.selectedInterfereCubeCheckMethod = $scope.interfereCheckMethodData[~~data.interfere_cube_datacheck];
                $scope.selectedInterfereReferenceCoord = $scope.interfereReferenceCoordData[~~data.interfere_cube_refcoord];
                if(null != $scope.WObjCoordeData){
                    $scope.selectedWObjCoorde = $scope.WObjCoordeData["wobjcoord"+~~data.interfere_cube_coordnum];
                }
                $scope.selectedInterfereCubeTeachMethod = $scope.cubeMethodData[~~data.interfere_cube_method];
                $scope.displayWobjCoord();
                $scope.displayCubeTeachMethod();
                $scope.interfereCubeMin.x = parseFloat(data.interfere_x_min).toFixed(3);
                $scope.interfereCubeMin.y = parseFloat(data.interfere_y_min).toFixed(3);
                $scope.interfereCubeMin.z = parseFloat(data.interfere_z_min).toFixed(3);
                $scope.interfereCubeMax.x = parseFloat(data.interfere_x_max).toFixed(3);
                $scope.interfereCubeMax.y = parseFloat(data.interfere_y_max).toFixed(3);
                $scope.interfereCubeMax.z = parseFloat(data.interfere_z_max).toFixed(3);
                $scope.selectedInterfereCubeCheckMode = $scope.interfereCheckModeData[~~data.interfere_cube_mode];
                $scope.interfereCubeCenterPoint.x = parseFloat(data.interfere_x_center).toFixed(3);
                $scope.interfereCubeCenterPoint.y = parseFloat(data.interfere_y_center).toFixed(3);
                $scope.interfereCubeCenterPoint.z = parseFloat(data.interfere_z_center).toFixed(3);
                $scope.interfereCubeLength_x = parseFloat(data.interfere_x_length).toFixed(3);
                $scope.interfereCubeLength_y = parseFloat(data.interfere_y_length).toFixed(3);
                $scope.interfereCubeLength_z = parseFloat(data.interfere_z_length).toFixed(3);
                $scope.selectedAutoColour = $scope.ledColourdData[~~data.auto_mode_colour-1];
                $scope.selectedManualColour = $scope.ledColourdData[~~data.manual_mode_colour-1];
                $scope.selectedDragColour = $scope.ledColourdData[~~data.drag_mode_colour-1];
                $scope.display_Homepoint_Flag = ~~data.origin_setflag;
                $scope.workHomePoint.j1 = parseFloat(data.origin_j1).toFixed(3);
                $scope.workHomePoint.j2 = parseFloat(data.origin_j2).toFixed(3);
                $scope.workHomePoint.j3 = parseFloat(data.origin_j3).toFixed(3);
                $scope.workHomePoint.j4 = parseFloat(data.origin_j4).toFixed(3);
                $scope.workHomePoint.j5 = parseFloat(data.origin_j5).toFixed(3);
                $scope.workHomePoint.j6 = parseFloat(data.origin_j6).toFixed(3);

                $scope.selectedDragLockEnable = $scope.dragLockEnableData[~~data.draglock_enable];
                $scope.dragParamX = parseFloat(data.draglock_p_x).toFixed(3);
                $scope.dragParamY = parseFloat(data.draglock_p_y).toFixed(3);
                $scope.dragParamZ = parseFloat(data.draglock_p_z).toFixed(3);
                $scope.dragParamRX = parseFloat(data.draglock_p_a).toFixed(3);
                $scope.dragParamRY = parseFloat(data.draglock_p_b).toFixed(3);
                $scope.dragParamRZ = parseFloat(data.draglock_p_c).toFixed(3);
                $scope.dragThresholdX = parseFloat(data.forcesensor_enddragfx).toFixed(3);
                $scope.dragThresholdY = parseFloat(data.forcesensor_enddragfy).toFixed(3);
                $scope.dragThresholdZ = parseFloat(data.forcesensor_enddragfz).toFixed(3);
                $scope.dragThresholdRX = parseFloat(data.forcesensor_enddragmx).toFixed(3);
                $scope.dragThresholdRY = parseFloat(data.forcesensor_enddragmy).toFixed(3);
                $scope.dragThresholdRZ = parseFloat(data.forcesensor_enddragmz).toFixed(3);
                $scope.inertiaCoefficientX = parseFloat(data.forcesensor_inertia_x).toFixed(3);
                $scope.inertiaCoefficientY = parseFloat(data.forcesensor_inertia_y).toFixed(3);
                $scope.inertiaCoefficientZ = parseFloat(data.forcesensor_inertia_z).toFixed(3);
                $scope.inertiaCoefficientRX = parseFloat(data.forcesensor_inertia_mx).toFixed(3);
                $scope.inertiaCoefficientRY = parseFloat(data.forcesensor_inertia_my).toFixed(3);
                $scope.inertiaCoefficientRZ = parseFloat(data.forcesensor_inertia_mz).toFixed(3);
                $scope.dampCoefficientX = parseFloat(data.forcesensor_damp_x).toFixed(3);
                $scope.dampCoefficientY = parseFloat(data.forcesensor_damp_y).toFixed(3);
                $scope.dampCoefficientZ = parseFloat(data.forcesensor_damp_z).toFixed(3);
                $scope.dampCoefficientRX = parseFloat(data.forcesensor_damp_mx).toFixed(3);
                $scope.dampCoefficientRY = parseFloat(data.forcesensor_damp_my).toFixed(3);
                $scope.dampCoefficientRZ = parseFloat(data.forcesensor_damp_mz).toFixed(3);
                $scope.stiffnessCoefficientX = parseFloat(data.forcesensor_stiffness_x).toFixed(3);
                $scope.stiffnessCoefficientY = parseFloat(data.forcesensor_stiffness_y).toFixed(3);
                $scope.stiffnessCoefficientZ = parseFloat(data.forcesensor_stiffness_z).toFixed(3);
                $scope.stiffnessCoefficientRX = parseFloat(data.forcesensor_stiffness_mx).toFixed(3);
                $scope.stiffnessCoefficientRY = parseFloat(data.forcesensor_stiffness_my).toFixed(3);
                $scope.stiffnessCoefficientRZ = parseFloat(data.forcesensor_stiffness_mz).toFixed(3);
                $scope.selectedAdjustStatus = $scope.forceDragLockstatusData[~~data.forcesensor_adaptive_sign];
                $scope.selectedInterferenceStatus = $scope.forceDragLockstatusData[~~data.forcesensor_interfere_sign];
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[9]);
            });
    }
    getRobotdata();

    /**末端LED灯设置 */
    //末端LED灯颜色配置
    $scope.setModeAxleLEDColour = function(){
        if(($scope.selectedAutoColour.id == $scope.selectedManualColour.id) || ($scope.selectedAutoColour.id == $scope.selectedDragColour.id)
        || ($scope.selectedManualColour.id == $scope.selectedDragColour.id)){
            toastFactory.info(auxsDynamicTags.info_messages[37]);
            return;
        }
        let setModeAxleLEDColourCmd = {
            cmd: 544,
            data: {
                content:"SetModeAxleLEDColour("+$scope.selectedAutoColour.id+","+$scope.selectedManualColour.id+","+$scope.selectedDragColour.id+")",
            },
        };
        dataFactory.setData(setModeAxleLEDColourCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**自定义协议设置 */
    // 下载用户数据文件
    $scope.downloadCustomAgreeData = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/controller/RTDEConfig.lua";
        }else{
            window.location.href = "/action/download?pathfilename=/root/robot/RTDEConfig.lua";
        }
    };

    // 上传用户数据文件
    $scope.uploadCustomAgreeData = function () {
        var formData = new FormData();
        var file = document.getElementById("customAgreeFile").files[0];
        if (null == file) {
            toastFactory.info(auxsDynamicTags.info_messages[5]);
            return;
        }
        if ("RTDEConfig.lua" != file.name) {
            toastFactory.info(auxsDynamicTags.info_messages[38]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    toastFactory.success(auxsDynamicTags.success_messages[1]);
                }
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[10]);

            });
    };

    //加载/卸载协议
    $scope.setCustomAgreeLoad = function(index){
        let setCustomAgreeLoadCmd;
        if(index == 0){
            setCustomAgreeLoadCmd = {
                cmd: 558,
                data: {
                    content:"RTDEFrameLoad()",
                },
            };

        }else{
            setCustomAgreeLoadCmd = {
                cmd: 559,
                data: {
                    content:"RTDEFrameUnload()",
                },
            };
        }
        dataFactory.setData(setCustomAgreeLoadCmd)
        .then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /* 获取IP */
    $scope.type = 0;
    function getIP() {
        let cmdContent = {
            cmd: "get_customcfg"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.port = data.port;
                $scope.type = data.type;
            }, (status) => {
                toastFactory.error(status);
            });
    }
    

    /* 系统IP设置 */
    $scope.setSystemIP = function (port) {
        if (port == "" || port == undefined) {
            toastFactory.warning(auxsDynamicTags.warning_messages[5]);
            return;
        } else if (port < 10000 || port > 11000) {
            toastFactory.warning(auxsDynamicTags.warning_messages[6]);
            return;
        }
        let cmdContent = {
            cmd: "modify_customcfg",
            data: {
                "port": port,
                "type": $scope.type,
            }
        };
        $scope.setIPTips = auxsDynamicTags.info_messages[41];
        dataFactory.actData(cmdContent).then(() => {
            showPageRestart(auxsDynamicTags.info_messages[58]);
            
        }, (status) => {
            $scope.setIPTips = "";
            toastFactory.error(status);
        });
    }



    /**外设协议 */
    //设置外设协议
    $scope.setExDevProtocol = function(index){
        let setExDevProtocolCmd = {
            cmd: 571,
            data: {
                content:"SetExDevProtocol("+$scope.selectedExternalAgree.id+")",
            },
        };
        dataFactory.setData(setExDevProtocolCmd)
        .then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    //获取外设协议
    document.getElementById('auxiliaryApplication').addEventListener('571', () => {
        getExDevProtocol();
    });

    //获取外设协议
    function getExDevProtocol(){
        let getExDevProtocolCmd = {
            cmd: 572,
            data: {
                content:"GetExDevProtocol()",
            },
        };
        dataFactory.setData(getExDevProtocolCmd)
        .then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }


    //获取外设协议
    document.getElementById('auxiliaryApplication').addEventListener('572', (e) => {
        $scope.selectedExternalAgree = $scope.externalAgreeData[~~e.detail-4096];
        $scope.displayExternalAgreeInfo = auxsDynamicTags.info_messages[59]+$scope.selectedExternalAgree.name;
    });

    /**拖动示教锁定功能 */

    //设置摩擦力补偿系数
    $scope.applyDragLockParam = function() {
        if(($scope.dragParamX == "")||($scope.dragParamY == "")||($scope.dragParamZ == "")||($scope.dragParamRX == "")||($scope.dragParamRY == "")||($scope.dragParamRZ == "")){
            toastFactory.info(auxsDynamicTags.info_messages[39]);
            return;
        }
        let DragLockParamString = "SetDragLockParam("+$scope.dragParamX+","+$scope.dragParamY+","+$scope.dragParamZ+
            ","+$scope.dragParamRX+","+$scope.dragParamRY+","+$scope.dragParamRZ+")";
        let setDragLockParamCmd = {
            cmd: 575,
            data: {
                content:DragLockParamString,
            },
        };
        dataFactory.setData(setDragLockParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //拖动示教功能使能
    $scope.applyDragLockEnable = function(){
        let setDragLockEnableCmd = {
            cmd: 574,
            data: {
                content:"DragLockEnable("+$scope.selectedDragLockEnable.id+")",
            },
        };
        dataFactory.setData(setDragLockEnableCmd)
        .then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    //拖动示教功能使能
    $scope.applyEndForceDragControl = function(){
        let setEndForceDragControlCmd = {
            cmd: 676,
            data: {
                content:"EndForceDragControl("
                    + $scope.selectedForceDragLockStatus.id + ","
                    + $scope.selectedAdjustStatus.id + ","
                    + $scope.selectedInterferenceStatus.id + ","
                    + $scope.inertiaCoefficientX + ","
                    + $scope.inertiaCoefficientY + ","
                    + $scope.inertiaCoefficientZ + ","
                    + $scope.inertiaCoefficientRX + ","
                    + $scope.inertiaCoefficientRY + ","
                    + $scope.inertiaCoefficientRZ + ","
                    + $scope.dampCoefficientX + ","
                    + $scope.dampCoefficientY + ","
                    + $scope.dampCoefficientZ + ","
                    + $scope.dampCoefficientRX + ","
                    + $scope.dampCoefficientRY + ","
                    + $scope.dampCoefficientRZ + ","
                    + $scope.stiffnessCoefficientX + ","
                    + $scope.stiffnessCoefficientY + ","
                    + $scope.stiffnessCoefficientZ + ","
                    + $scope.stiffnessCoefficientRX + ","
                    + $scope.stiffnessCoefficientRY + ","
                    + $scope.stiffnessCoefficientRZ + ","
                    + $scope.dragThresholdX + ","
                    + $scope.dragThresholdY + ","
                    + $scope.dragThresholdZ + ","
                    + $scope.dragThresholdRX + ","
                    + $scope.dragThresholdRY + ","
                    + $scope.dragThresholdRZ + ","
                    + $scope.forceDragMax + ","
                    + $scope.jointSpeedMax
                    +")",
            },
        };
        dataFactory.setData(setEndForceDragControlCmd)
        .then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /*获取报错清除后力传感器自动开启配置 */
    function getForceSensorAutoFlag() {
        const getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd).then((data) => {
            $scope.forceSensorEnable = ~~data.forcesensor_enddragautoflag;
        },(status) => {
            toastFactory.error(status, auxsDynamicTags.error_messages[12]);
        });
    };
    /**获取报错清除后力传感器自动开启配置 */

    /*报错清除后力传感器自动开启 */
    $scope.enableForceSensor = function() {
        let setEnableCmd = {
            cmd: 801,
            data: {
                content: `SetForceSensorDragAutoFlag(${$scope.forceSensorEnable})`
            }
        };
        dataFactory.setData(setEnableCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };
    document.getElementById('auxiliaryApplication').addEventListener('801', () => {
        getForceSensorAutoFlag();
    });
    /*报错清除后力传感器自动开启 */

    /** 六维力和关节阻抗的混合拖动*/

    /**
     * 设置六维力和关节阻抗混合拖动开关及参数
     * @param {int} controlStatus 控制状态，0-关闭，1-开启
     * @param {int} impedanceStatus 阻抗开启标志，0-关闭，1-开启
     * @param {int} lineSpeed 末端线速度
     * @param {int} angularSpeed 角速度限制
     */
    $scope.setForceAndJointImpedance = function(controlStatus,impedanceStatus,lineSpeed,angularSpeed) {
        let setCmd = {
            cmd: 943,
            data: {
                content: impedanceStatus == 1 
                ? `ForceAndJointImpedanceStartStop(${controlStatus},${impedanceStatus},{${$scope.lamdaGainJoint1},${$scope.lamdaGainJoint2},${$scope.lamdaGainJoint3},${$scope.lamdaGainJoint4},${$scope.lamdaGainJoint5},${$scope.lamdaGainJoint6}},{${$scope.kGainJoint1},${$scope.kGainJoint2},${$scope.kGainJoint3},${$scope.kGainJoint4},${$scope.kGainJoint5},${$scope.kGainJoint6}},{${$scope.bGainJoint1},${$scope.bGainJoint2},${$scope.bGainJoint3},${$scope.bGainJoint4},${$scope.bGainJoint5},${$scope.bGainJoint6}},${lineSpeed},${angularSpeed})` 
                : `ForceAndJointImpedanceStartStop(${controlStatus},${impedanceStatus},{${$scope.lamdaGainJoint1},${$scope.lamdaGainJoint2},${$scope.lamdaGainJoint3},${$scope.lamdaGainJoint4},${$scope.lamdaGainJoint5},${$scope.lamdaGainJoint6}},{0,0,0,0,0,0},{0,0,0,0,0,0},${lineSpeed},${angularSpeed})`
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };

    /**获取拖动开关的状态 */
    function getForceAndTorqueDragState() {
        let getCmd = {
            cmd: 944,
            data: {
                content: "GetForceAndTorqueDragState()"
            }
        };
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };
    document.getElementById('auxiliaryApplication').addEventListener('944', function (e) {
        let stateData = e.detail.split(',');
        $scope.selectedForceDragLockStatus = $scope.forceDragLockstatusData[stateData[0]];
        $scope.selectedControlStatus = $scope.forceDragLockstatusData[stateData[1]];
    });
    /** 六维力和关节阻抗的混合拖动*/

    /**更酷多干涉区功能 */
    //设置更酷最大范围
    $scope.setInterfereCubegengku = function(index){
        var currtnytcp = JSON.parse(JSON.stringify($scope.currentTCP));
        if(index == 1){
            $scope.selectedGenkuCubeSpace.x1 = currtnytcp.x+"";
            $scope.selectedGenkuCubeSpace.y1 = currtnytcp.y+"";
            $scope.selectedGenkuCubeSpace.z1 = currtnytcp.z+"";
        }else if(index == 2){
            $scope.selectedGenkuCubeSpace.x2 = currtnytcp.x+"";
            $scope.selectedGenkuCubeSpace.y2 = currtnytcp.y+"";
            $scope.selectedGenkuCubeSpace.z2 = currtnytcp.z+"";
        }
    }

    //获取更酷干涉区数据
    function getGenkuCubeSpaceData() {
        let getCmd = {
            cmd: "get_gengku_cubespace",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                genkuHandledecimal(data);
                $scope.genkuCubeSpaceData = JSON.parse(JSON.stringify(data));
				if(null != $scope.selectedGenkuCubeSpace){
                    $scope.selectedGenkuCubeSpace = $scope.genkuCubeSpaceData[$scope.selectedGenkuCubeSpace.id-1];
				} else{
                    $scope.selectedGenkuCubeSpace = $scope.genkuCubeSpaceData[0];
                }	
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[11]);

            });
    };

    //修改更酷干涉区
    $scope.modifyGenkuCubeSpaceData = function() {
        let saveCmd = {
            cmd: "set_gengku_cubespace",
            data: $scope.selectedGenkuCubeSpace,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(auxsDynamicTags.success_messages[2]);
                getGenkuCubeSpaceData()
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清空更酷干涉区
    let clearGenkuCubeSpaceFlg = 0;
    $scope.clearGenkuCubeSpaceData = function(){
        if (clearGenkuCubeSpaceFlg == 0) {
            toastFactory.info(auxsDynamicTags.info_messages[40]);
            clearGenkuCubeSpaceFlg = 1;
        } else {
            clearGenkuCubeSpaceFlg = 0;
            var senddata = {
                "id":$scope.selectedGenkuCubeSpace.id,
                "x1":"0",
                "y1":"0",
                "z1":"0",
                "x2":"0",
                "y2":"0",
                "z2":"0",
            }
            let saveCmd = {
                cmd: "set_gengku_cubespace",
                data: senddata,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    getGenkuCubeSpaceData()
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //数据保留三位小数
	function genkuHandledecimal(data){ 
		for(let i=0; i<data.length; i++){
			let valuearr = Object.keys(data[i]);
            var valuelength = valuearr.length;
            for(let j=1; j<valuelength; j++){
                data[i][valuearr[j]] = parseFloat(data[i][valuearr[j]]).toFixed(3);
            }
		}
    }
    
    /* Smart Tool */

    $scope.changeSmartToolFunction = function(index){
        if (index == 1) {
            if ($scope.selectedSmartToolA.id <= 2) {
                $scope.show_smart_tool_a_speed = true;
            } else {
                $scope.show_smart_tool_a_speed = false;
            }
        } else if (index == 2) {
            if ($scope.selectedSmartToolB.id <= 2) {
                $scope.show_smart_tool_b_speed = true;
            } else {
                $scope.show_smart_tool_b_speed = false;
            }
        } else if (index == 3) {
            if ($scope.selectedSmartToolC.id <= 2) {
                $scope.show_smart_tool_c_speed = true;
            } else {
                $scope.show_smart_tool_c_speed = false;
            }
        } else if (index == 4) {
            if ($scope.selectedSmartToolD.id <= 2) {
                $scope.show_smart_tool_d_speed = true;
            } else {
                $scope.show_smart_tool_d_speed = false;
            }
        } else if (index == 5) {
            if ($scope.selectedSmartToolE.id <= 2) {
                $scope.show_smart_tool_e_speed = true;
            } else {
                $scope.show_smart_tool_e_speed = false;
            }
        } else if (index == 6) {
            if (($scope.selectedSmartToolio.id > 7 && $scope.selectedSmartToolio.id < 15 && $scope.ctrlDOArr[$scope.selectedSmartToolio.id - 8] == 6) || ($scope.selectedSmartToolio.id > 17 && $scope.selectedSmartToolio.id - 18 == $scope.extArcstart)) {
                $scope.show_smart_tool_io_type = true;
                if ($scope.selectedSmartToolIoType && ($scope.selectedSmartToolIoType.id == 1 || $scope.selectedSmartToolIoType.id == 2)) {
                    $scope.show_smart_tool_io_speed = true;
                } else {
                    $scope.show_smart_tool_io_speed = false;
                }
            } else {
                $scope.show_smart_tool_io_type = false;
                $scope.selectedSmartToolIoType = $scope.weldingOptions[0];
                $scope.show_smart_tool_io_speed = false;
            }
        }
    }

    /* 获取CO0~CO7配置和扩展I/O配置 */
    function getRobotDOAndAuxDOCfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd).then((data) => {
            $scope.selectedCfgDI8 = ~~data.ctl_di8_config + "";
            $scope.selectedCfgDI9 = ~~data.ctl_di9_config + "";
            $scope.selectedCfgDI10 = ~~data.ctl_di10_config + "";
            $scope.selectedCfgDI11 = ~~data.ctl_di11_config + "";
            $scope.selectedCfgDI12 = ~~data.ctl_di12_config + "";
            $scope.selectedCfgDI13 = ~~data.ctl_di13_config + "";
            $scope.selectedCfgDI14 = ~~data.ctl_di14_config + "";
            $scope.selectedCfgDI15 = ~~data.ctl_di15_config + "";
            $scope.mainProgramIOData[0].disable = $scope.selectedCfgDI8 != '0' && $scope.selectedCfgDI8 != '15';
            $scope.mainProgramIOData[1].disable = $scope.selectedCfgDI9 != '0' && $scope.selectedCfgDI9 != '15';
            $scope.mainProgramIOData[2].disable = $scope.selectedCfgDI10 != '0' && $scope.selectedCfgDI10 != '15';
            $scope.mainProgramIOData[3].disable = $scope.selectedCfgDI11 != '0' && $scope.selectedCfgDI11 != '15';
            $scope.mainProgramIOData[4].disable = $scope.selectedCfgDI12 != '0' && $scope.selectedCfgDI12 != '15';
            $scope.mainProgramIOData[5].disable = $scope.selectedCfgDI13 != '0' && $scope.selectedCfgDI13 != '15';
            $scope.mainProgramIOData[6].disable = $scope.selectedCfgDI14 != '0' && $scope.selectedCfgDI14 != '15';
            $scope.mainProgramIOData[7].disable = $scope.selectedCfgDI15 != '0' && $scope.selectedCfgDI15 != '15';
            $scope.startPointIOData[0].disable = $scope.selectedCfgDI8 != '0' && $scope.selectedCfgDI8 != '11';
            $scope.startPointIOData[1].disable = $scope.selectedCfgDI9 != '0' && $scope.selectedCfgDI9 != '11';
            $scope.startPointIOData[2].disable = $scope.selectedCfgDI10 != '0' && $scope.selectedCfgDI10 != '11';
            $scope.startPointIOData[3].disable = $scope.selectedCfgDI11 != '0' && $scope.selectedCfgDI11 != '11';
            $scope.startPointIOData[4].disable = $scope.selectedCfgDI12 != '0' && $scope.selectedCfgDI12 != '11';
            $scope.startPointIOData[5].disable = $scope.selectedCfgDI13 != '0' && $scope.selectedCfgDI13 != '11';
            $scope.startPointIOData[6].disable = $scope.selectedCfgDI14 != '0' && $scope.selectedCfgDI14 != '11';
            $scope.startPointIOData[7].disable = $scope.selectedCfgDI15 != '0' && $scope.selectedCfgDI15 != '11';
            if ($scope.selectedCfgDI8 == '15') {
                $scope.selectedMainProgramIO = '8';
            }
            if ($scope.selectedCfgDI9 == '15') {
                $scope.selectedMainProgramIO = '9';
            }
            if ($scope.selectedCfgDI10 == '15') {
                $scope.selectedMainProgramIO = '10';
            }
            if ($scope.selectedCfgDI11 == '15') {
                $scope.selectedMainProgramIO = '11';
            }
            if ($scope.selectedCfgDI12 == '15') {
                $scope.selectedMainProgramIO = '12';
            }
            if ($scope.selectedCfgDI13 == '15') {
                $scope.selectedMainProgramIO = '13';
            }
            if ($scope.selectedCfgDI14 == '15') {
                $scope.selectedMainProgramIO = '14';
            }
            if ($scope.selectedCfgDI15 == '15') {
                $scope.selectedMainProgramIO = '15';
            }
            if ($scope.selectedCfgDI8 == '11') {
                $scope.selectedStartPointIO = '8';
            }
            if ($scope.selectedCfgDI9 == '11') {
                $scope.selectedStartPointIO = '9';
            }
            if ($scope.selectedCfgDI10 == '11') {
                $scope.selectedStartPointIO = '10';
            }
            if ($scope.selectedCfgDI11 == '11') {
                $scope.selectedStartPointIO = '11';
            }
            if ($scope.selectedCfgDI12 == '11') {
                $scope.selectedStartPointIO = '12';
            }
            if ($scope.selectedCfgDI13 == '11') {
                $scope.selectedStartPointIO = '13';
            }
            if ($scope.selectedCfgDI14 == '11') {
                $scope.selectedStartPointIO = '14';
            }
            if ($scope.selectedCfgDI15 == '11') {
                $scope.selectedStartPointIO = '15';
            }
            $scope.ctrlDO8 = ~~data.ctl_do8_config + "";
            $scope.ctrlDO9 = ~~data.ctl_do9_config + "";
            $scope.ctrlDO10 = ~~data.ctl_do10_config + "";
            $scope.ctrlDO11 = ~~data.ctl_do11_config + "";
            $scope.ctrlDO12 = ~~data.ctl_do12_config + "";
            $scope.ctrlDO13 = ~~data.ctl_do13_config + "";
            $scope.ctrlDO14 = ~~data.ctl_do14_config + "";
            $scope.ctrlDO15 = ~~data.ctl_do15_config + "";
            $scope.ctrlDOArr = [$scope.ctrlDO8, $scope.ctrlDO9, $scope.ctrlDO10, $scope.ctrlDO11, $scope.ctrlDO12, $scope.ctrlDO13, $scope.ctrlDO14, $scope.ctrlDO15];
            // 焊机起弧配置的扩展DO编号
            $scope.extArcstart = ~~data.ext_num_arcstart;
        }, (status) => {
            toastFactory.error(status);
            /* test */
            if (g_testCode) {
                const data = {
                    ctl_di8_config: 0,
                    ctl_di9_config: 11,
                    ctl_di10_config: 0,
                    ctl_di11_config: 0,
                    ctl_di12_config: 15,
                    ctl_di13_config: 0,
                    ctl_di14_config: 0,
                    ctl_di15_config: 0
                }
                $scope.selectedCfgDI8 = ~~data.ctl_di8_config + "";
                $scope.selectedCfgDI9 = ~~data.ctl_di9_config + "";
                $scope.selectedCfgDI10 = ~~data.ctl_di10_config + "";
                $scope.selectedCfgDI11 = ~~data.ctl_di11_config + "";
                $scope.selectedCfgDI12 = ~~data.ctl_di12_config + "";
                $scope.selectedCfgDI13 = ~~data.ctl_di13_config + "";
                $scope.selectedCfgDI14 = ~~data.ctl_di14_config + "";
                $scope.selectedCfgDI15 = ~~data.ctl_di15_config + "";
                $scope.mainProgramIOData[0].disable = $scope.selectedCfgDI8 != '0' && $scope.selectedCfgDI8 != '15';
                $scope.mainProgramIOData[1].disable = $scope.selectedCfgDI9 != '0' && $scope.selectedCfgDI9 != '15';
                $scope.mainProgramIOData[2].disable = $scope.selectedCfgDI10 != '0' && $scope.selectedCfgDI10 != '15';
                $scope.mainProgramIOData[3].disable = $scope.selectedCfgDI11 != '0' && $scope.selectedCfgDI11 != '15';
                $scope.mainProgramIOData[4].disable = $scope.selectedCfgDI12 != '0' && $scope.selectedCfgDI12 != '15';
                $scope.mainProgramIOData[5].disable = $scope.selectedCfgDI13 != '0' && $scope.selectedCfgDI13 != '15';
                $scope.mainProgramIOData[6].disable = $scope.selectedCfgDI14 != '0' && $scope.selectedCfgDI14 != '15';
                $scope.mainProgramIOData[7].disable = $scope.selectedCfgDI15 != '0' && $scope.selectedCfgDI15 != '15';
                $scope.startPointIOData[0].disable = $scope.selectedCfgDI8 != '0' && $scope.selectedCfgDI8 != '11';
                $scope.startPointIOData[1].disable = $scope.selectedCfgDI9 != '0' && $scope.selectedCfgDI9 != '11';
                $scope.startPointIOData[2].disable = $scope.selectedCfgDI10 != '0' && $scope.selectedCfgDI10 != '11';
                $scope.startPointIOData[3].disable = $scope.selectedCfgDI11 != '0' && $scope.selectedCfgDI11 != '11';
                $scope.startPointIOData[4].disable = $scope.selectedCfgDI12 != '0' && $scope.selectedCfgDI12 != '11';
                $scope.startPointIOData[5].disable = $scope.selectedCfgDI13 != '0' && $scope.selectedCfgDI13 != '11';
                $scope.startPointIOData[6].disable = $scope.selectedCfgDI14 != '0' && $scope.selectedCfgDI14 != '11';
                $scope.startPointIOData[7].disable = $scope.selectedCfgDI15 != '0' && $scope.selectedCfgDI15 != '11';
                if ($scope.selectedCfgDI8 == '15') {
                    $scope.selectedMainProgramIO = '8';
                }
                if ($scope.selectedCfgDI9 == '15') {
                    $scope.selectedMainProgramIO = '9';
                }
                if ($scope.selectedCfgDI10 == '15') {
                    $scope.selectedMainProgramIO = '10';
                }
                if ($scope.selectedCfgDI11 == '15') {
                    $scope.selectedMainProgramIO = '11';
                }
                if ($scope.selectedCfgDI12 == '15') {
                    $scope.selectedMainProgramIO = '12';
                }
                if ($scope.selectedCfgDI13 == '15') {
                    $scope.selectedMainProgramIO = '13';
                }
                if ($scope.selectedCfgDI14 == '15') {
                    $scope.selectedMainProgramIO = '14';
                }
                if ($scope.selectedCfgDI15 == '15') {
                    $scope.selectedMainProgramIO = '15';
                }
                if ($scope.selectedCfgDI8 == '11') {
                    $scope.selectedStartPointIO = '8';
                }
                if ($scope.selectedCfgDI9 == '11') {
                    $scope.selectedStartPointIO = '9';
                }
                if ($scope.selectedCfgDI10 == '11') {
                    $scope.selectedStartPointIO = '10';
                }
                if ($scope.selectedCfgDI11 == '11') {
                    $scope.selectedStartPointIO = '11';
                }
                if ($scope.selectedCfgDI12 == '11') {
                    $scope.selectedStartPointIO = '12';
                }
                if ($scope.selectedCfgDI13 == '11') {
                    $scope.selectedStartPointIO = '13';
                }
                if ($scope.selectedCfgDI14 == '11') {
                    $scope.selectedStartPointIO = '14';
                }
                if ($scope.selectedCfgDI15 == '11') {
                    $scope.selectedStartPointIO = '15';
                }
            }
            /* ./test */
        });
    }
    /** 获取CO0~CO7配置和扩展I/O配置 */

    //获取Smart Tool配置文件
    function getSmartToolCfg() {
        let getSmartToolCfgCmd = {
            cmd: "get_Smart_Tool_function",
        };
        dataFactory.getData(getSmartToolCfgCmd)
            .then((data) => {
                var smartArr = eval(data.smart_tool_cfg.cfg);
                console.log(smartArr);
                $scope.selectedSmartToolA = $scope.smarttoolData.filter(item => item.id == smartArr[0][0])[0];
                if (smartArr[0][0] == 14) {
                    $scope.selectedDoA = $scope.doOutputgData[smartArr[0][1]]
                } else {
                    $scope.smart_tool_a_speed = smartArr[0][1];
                }
                $scope.changeSmartToolFunction(1);
                $scope.selectedSmartToolB = $scope.smarttoolData.filter(item => item.id == smartArr[1][0])[0];
                if (smartArr[1][0] == 14) {
                    $scope.selectedDoB = $scope.doOutputgData[smartArr[1][1]]
                } else {
                    $scope.smart_tool_b_speed = smartArr[1][1];
                }
                $scope.changeSmartToolFunction(2);
                $scope.selectedSmartToolC = $scope.smarttoolData.filter(item => item.id == smartArr[2][0])[0];
                if (smartArr[2][0] == 14) {
                    $scope.selectedDoC = $scope.doOutputgData[smartArr[2][1]]
                } else {
                    $scope.smart_tool_c_speed = smartArr[2][1];
                }
                $scope.changeSmartToolFunction(3);
                $scope.selectedSmartToolD = $scope.smarttoolData.filter(item => item.id == smartArr[3][0])[0];
                if (smartArr[3][0] == 14) {
                    $scope.selectedDoD = $scope.doOutputgData[smartArr[3][1]]
                } else {
                    $scope.smart_tool_d_speed = smartArr[3][1];
                }
                $scope.changeSmartToolFunction(4);
                $scope.selectedSmartToolE = $scope.smarttoolData.filter(item => item.id == smartArr[4][0])[0];
                if (smartArr[4][0] == 14) {
                    $scope.selectedDoE = $scope.doOutputgData[smartArr[4][1]]
                } else {
                    $scope.smart_tool_e_speed = smartArr[4][1];
                }
                $scope.changeSmartToolFunction(5);
                $scope.selectedSmartToolio = $scope.smarttoolDOData[smartArr[5][1]];
                if (typeof(smartArr[5][2]) == 'number') {
                    $scope.selectedSmartToolIoType = $scope.weldingOptions.filter(item => item.id == smartArr[5][2])[0];
                    $scope.smartToolIoSpeed = smartArr[5][3];
                }
                $scope.changeSmartToolFunction(6);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置Smart Tool配置
    $scope.setSmartToolcfg = function () {
        console.log($scope.index_smartArr_count );
        var smartArr = [[0,0],[0,0],[0,0],[0,0],[0,0],[7,0,-1,0]];
        smartArr[0][0] = parseInt($scope.selectedSmartToolA.id);
        if ($scope.selectedSmartToolA.id == 14) {
            smartArr[0][1] = parseInt($scope.selectedDoA.id);
        } else {
            smartArr[0][1] = parseInt($scope.smart_tool_a_speed);
        }
        smartArr[1][0] = parseInt($scope.selectedSmartToolB.id);
        if ($scope.selectedSmartToolB.id == 14) {
            smartArr[1][1] = parseInt($scope.selectedDoB.id);
        } else {
            smartArr[1][1] = parseInt($scope.smart_tool_b_speed);
        }
        smartArr[2][0] = parseInt($scope.selectedSmartToolC.id);
        if ($scope.selectedSmartToolC.id == 14) {
            smartArr[2][1] = parseInt($scope.selectedDoC.id);
        } else {
            smartArr[2][1] = parseInt($scope.smart_tool_c_speed);
        }
        smartArr[3][0] = parseInt($scope.selectedSmartToolD.id);
        if ($scope.selectedSmartToolD.id == 14) {
            smartArr[3][1] = parseInt($scope.selectedDoD.id);
        } else {
            smartArr[3][1] = parseInt($scope.smart_tool_d_speed);
        }
        smartArr[4][0] = parseInt($scope.selectedSmartToolE.id);
        if ($scope.selectedSmartToolE.id == 14) {
            smartArr[4][1] = parseInt($scope.selectedDoE.id);
        } else {
            smartArr[4][1] = parseInt($scope.smart_tool_e_speed);
        }
        smartArr[5][1] = parseInt($scope.selectedSmartToolio.id);
        smartArr[5][2] = parseInt($scope.selectedSmartToolIoType.id);
        if ($scope.smartToolIoSpeed != undefined && $scope.smartToolIoSpeed != null && $scope.smartToolIoSpeed != '') {
            smartArr[5][3] = parseInt($scope.smartToolIoSpeed);
        }
        var smartString = JSON.stringify(smartArr);
        let setSmartToolCmd = {
            cmd: "set_Smart_Tool_function",
            data: {
				"cfg": smartString,
				"p_index": $scope.index_smartArr_count + ""
            }
        };
        dataFactory.actData(setSmartToolCmd)
            .then(() => {
                toastFactory.success(auxsDynamicTags.success_messages[4]);
                document.dispatchEvent(new CustomEvent('updatasmartcfg', { bubbles: true, cancelable: true, composed: true, detail: smartArr}));
            }, (status) => {
                toastFactory.error(status);
            });
    }

    function getString(objarr){
        var typeNO = objarr.length;
        var tree = "[";
        for(var i=0;i<typeNO;i++){
            tree += "[";
            tree += "'"+objarr[i][0]+"',";
            tree += "'"+objarr[i][1]+"'";
            tree += "]";
            if(i<typeNO-1){
                tree+=",";
            }
        }
        tree += "]";
        return tree;
    }

    /*获取IO别名配置数据 */
    function getIOAliasData() {
        const getAliasCmd = {
            cmd: 'get_IO_alias_cfg'
        };
        dataFactory.getData(getAliasCmd).then(data => {
            $scope.ctrlDIAliasData = data.CtrlBox.DI;
            $scope.ctrlDOAliasData = data.CtrlBox.DO;
            $scope.ctrlAIAliasData = data.CtrlBox.AI;
            $scope.ctrlAOAliasData = data.CtrlBox.AO;
            $scope.endDIAliasData = data.EndEff.DI;
            $scope.endDOAliasData = data.EndEff.DO;
            $scope.endAIAliasData = data.EndEff.AI;
            $scope.endAOAliasData = data.EndEff.AO;
            $scope.smarttoolDOData.forEach((item, index) => {
                switch (index) {
                    case 16:
                        item['aliasName'] = $scope.endDOAliasData[0] ? `(${$scope.endDOAliasData[0]})` : '';
                        break;
                    case 17:
                        item['aliasName'] = $scope.endDOAliasData[1] ? `(${$scope.endDOAliasData[1]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlDOAliasData[index] ? `(${$scope.ctrlDOAliasData[index]})` : '';
                        break;
                }
            });
        }, (status) => {
            toastFactory.error(status, auxsDynamicTags.error_messages[13]);
            /* test */
            if (g_testCode) {
                $scope.ctrlDIAliasData = testAliasData.CtrlBox.DI;
                $scope.ctrlDOAliasData = testAliasData.CtrlBox.DO;
                $scope.ctrlAIAliasData = testAliasData.CtrlBox.AI;
                $scope.ctrlAOAliasData = testAliasData.CtrlBox.AO;
                $scope.endDIAliasData = testAliasData.EndEff.DI;
                $scope.endDOAliasData = testAliasData.EndEff.DO;
                $scope.endAIAliasData = testAliasData.EndEff.AI;
                $scope.endAOAliasData = testAliasData.EndEff.AO;
            }
            /* ./test */
        });
    };

    /* Smart Tool */

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
    function setRobotIOAlias(ctrlDIArr, ctrlDOArr, ctrlAIArr, ctrlAOArr, endDIArr, endDOArr, endAIArr, endAOArr) {
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
            document.dispatchEvent(new CustomEvent('setIOAliasData', { bubbles: true, cancelable: true, composed: true }));
        }, (status) => {
            // toastFactory.error(status, pesDynamicTags.error_messages[20]);
        });
    };
};