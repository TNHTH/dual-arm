"use strict";

angular
    .module('frApp')
    .controller('systemCtrl', ['$scope', '$modal', '$translate', 'dataFactory', 'toastFactory', '$http', systemCtrlFn])

function systemCtrlFn($scope, $modal, $translate, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.fullContentView();
    $('.setting-menu').tree();
    $scope.showSettingNavItem = function (itemID, index) {
        let showFlag = false;
        // ID存在且权限为1
        if (itemID && $scope.userAuthData.views[itemID] == '1') {
            // Linux系统正常显示(虚拟机不显示)
            if (g_systemFlag && !g_simmachineFlag) {
                showFlag = true;
            // QNX系统
            } else {
                // 插件管理隐藏
                if (itemID == 'plugins_setting') {
                    showFlag = false;
                // 其余正常显示
                } else {
                    showFlag = true;
                }
            }
        // 关于页一直显示
        } else if (itemID == 'about') {
            showFlag = true;
        // 账户管理仅在管理员账号下显示
        } else if (!itemID && index == 1 && ($scope.authorityID == 0 || $scope.authorityID == 1)) {
            showFlag = true;
        }
        return showFlag;
    }
    // 获取本地时间 
    function getTime() {
        var myDate = new Date();
        var a = document.getElementById('sysdatetime');
        if (a != null) {
            document.getElementById('sysdatetime').value = myDate.toLocaleString('chinese', { hour12: false });
        }
    }
    //毫秒等待功能函数
    function sleep(time){
        var starttime = new Date().getTime();
        while(new Date().getTime() < starttime+time ){
        }
    }
    /* 本地时间获取显示1秒刷新一次 */
    function refreshTime () {
        setInterval(() => {
            getTime();
        }, 1000);
    } 
    refreshTime();
    // 非Linux系统的功能进行展示和隐藏  
    if (g_systemFlag) {
        $scope.show_LinuxFunc = 1;
    } else {
        $scope.show_LinuxFunc = 0;
    }
    // 机器人控制器虚拟机SimMachine的隐藏内容
    $scope.showSimMachineFunc = g_simmachineFlag;
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let ssDynamicTags;
    let authDict;
    ssDynamicTags = langJsonData.system_setting;
    // 获取导航栏对象页面显示
    $scope.sysSettingNavList = ssDynamicTags.navbar;    
    // 全参数配置hover提示
    $scope.syncToLocal = ssDynamicTags.info_messages[22];
    // 用户管理页面搜索框placeholder内容
    $scope.searchKeyword = ssDynamicTags.info_messages[30];
    // 获取变量对象
    $scope.modeSwitchTypeList = ssDynamicTags.var_object.modeSwitchTypeList;
    $scope.hardwareVersionList = ssDynamicTags.var_object.hardwareVersionList;
    $scope.encoderVersionList = ssDynamicTags.var_object.encoderVersionList;
    $scope.hardwareLogList = ssDynamicTags.var_object.hardwareLogList;
    $scope.ctrlLogLevelData = ssDynamicTags.var_object.ctrlLogLevelData;
    $scope.pidMethodData = ssDynamicTags.var_object.pidMethodData;
    $scope.robotSafeStopModeData = ssDynamicTags.var_object.robotSafeStopModeData;
    $scope.ctrlBoxDOModeData = ssDynamicTags.var_object.ctrlBoxDOModeData;
    $scope.slowDownStopModeData = ssDynamicTags.var_object.slowDownStopModeData;
    $scope.pidParameteData = ssDynamicTags.var_object.pidParameteData;
    $scope.halSlaveCountData = ssDynamicTags.var_object.halSlaveCountData;
    $scope.halSlaveCountList = ssDynamicTags.var_object.halSlaveCountList;
    $scope.ecatConfigList = ssDynamicTags.var_object.ecatConfigList;
    $scope.dynamicsMethodList = ssDynamicTags.var_object.dynamicsMethodList;
    $scope.pluginStateDict = ssDynamicTags.var_object.pluginStateDict;       // 插件启停状态字典
    $scope.selectAuthArray = ssDynamicTags.var_object.selectAuthArray;
    $scope.dhParamDict = ssDynamicTags.var_object.dhParamDict;
    $scope.jointFrictionParamDict = ssDynamicTags.var_object.jointFrictionParamDict;
    $scope.dhCalibrationMethodDict = ssDynamicTags.var_object.dhCalibrationMethodDict;
    $scope.dhCalibrationCoordinateDict = ssDynamicTags.var_object.dhCalibrationCoordinateDict;
    $scope.dhRecordModeDict = ssDynamicTags.var_object.dhRecordModeDict;
    $scope.applyScopeList = ssDynamicTags.var_object.applyScopeList;
    $scope.correctJointData = $scope.applyScopeList.slice(1,7);
    $scope.correctJointModeData = ssDynamicTags.var_object.correctJointMode;
    $scope.selectedCorrectMode = $scope.correctJointModeData[0];
    $scope.paramCommandList = ssDynamicTags.var_object.paramCommandList;
    $scope.paramTypeList = ssDynamicTags.var_object.paramTypeList;
    $scope.collocationMethodList = ssDynamicTags.var_object.collocationMethod;
    $scope.collocationMethod = ssDynamicTags.var_object.collocationMethod[0];
    $scope.stiffnessList = ssDynamicTags.var_object.stiffnessList;
    $scope.robotPowerOnData = ssDynamicTags.var_object.robotPowerOnData;
    $scope.selectRobotPowerOn = $scope.robotPowerOnData[0];
    $scope.collisionDetectionList = ssDynamicTags.var_object.collisionDetectionData;
    $scope.speedStrategyList = ssDynamicTags.var_object.speedStrategyData;
    $scope.dragStrategyList = ssDynamicTags.var_object.dragStrategyData;
    $scope.attitudeAngleData = ssDynamicTags.var_object.attitudeAngleData;
    $scope.selectedStiffness = $scope.stiffnessList[0];
    $scope.timeSyncModeDict = ssDynamicTags.var_object.timeSyncModeDict;
    $scope.selectedTimeSyncMode = $scope.timeSyncModeDict[0];
    authDict = ssDynamicTags.var_object.authDict;
    // 账户设置的面包屑i18内容
    let accountSettingLan =  ssDynamicTags.var_object.operate;
    //机器人参数范围设置数据
    $scope.setSafeScopeData = ssDynamicTags.var_object.robotParamsRangeData;
    /* 初始化 */
    getCurrentLangDict();
    getRobotType();
    getSafeModecfg();
    getTeachDevice();
    getIP();
    getSysCfg();
    resetAuthAssignSet();
    resetDHPointsCheckList();
    resetDHCheckResult();
    getDHfile();
    if (g_systemFlag) {
        getRobotDefaultSpeedPer();
        getRobotSpeedPerMin();
        getExtTimeSync();
    }
    getGripperPosData();
    getRobotLock();
    $scope.selectedHardwareVersion = $scope.hardwareVersionList[0];
    $scope.selectedFirmwareVersion = $scope.hardwareVersionList[0];
    $scope.selectedSlaveVersion = $scope.hardwareVersionList[0];
    $scope.selectedSlaveChipType =  $scope.hardwareVersionList[0];
    $scope.slaveChipTypeList = [
        {
            id:'LAN9252',
            name: 'FAIRINO_EC_A',
            value: 192
        },
        {
            id:'Ax58100',
            name: 'FAIRINO_EC_B',
            value: 200
        },
        {
            id:'FEC1353',
            name: 'FAIRINO_EC_C',
            value: 240
        }
    ];
    $scope.selectedEncoderVersion =  $scope.encoderVersionList[0];
    $scope.selectedHardwareLog = $scope.hardwareLogList[0];
    $scope.selectedRobotSafeModeStop = $scope.robotSafeStopModeData[0];
    $scope.selectedCtrlBoxDOMode = $scope.ctrlBoxDOModeData[0];
    $scope.selectedPidMethod = $scope.pidMethodData[0];
    $scope.selectedEcatConfig = $scope.ecatConfigList[0];
    $scope.selectedDHCalibrationMethod = $scope.dhCalibrationMethodDict[0];
    $scope.selectedDHCalibrationCoordinate = $scope.dhCalibrationCoordinateDict[0];
    $scope.selectedCheckCoordinate = $scope.dhCalibrationCoordinateDict[0];
    $scope.show_GetDHPointsTips = 0;
    $scope.selectedDHRecordMode = $scope.dhRecordModeDict[0];
    $scope.show_GetDHCheckPointsTips = false;
    $scope.selectedDHCheckRecordMode = $scope.dhRecordModeDict[0];
    $scope.selectedDragStrategy = $scope.dragStrategyList[0];
    $scope.pidFileSource = {
        "j1":[],
        "j2":[],
        "j3":[],
        "j4":[],
        "j5":[],
        "j6":[],
    };
    $scope.lockFlag = 0;
    $scope.lockDate = new Date($scope.qnxSysTime);
    let auxsDynamicTags = langJsonData.auxiliary;
    // 外部控制器时间同步接口
    $scope.timeSyncInterfaceDict = [
        {
            "id": 1,
            "name": "Eth0"
        },
        {
            "id": 2,
            "name": "Eth1"
        }
    ];
    $scope.selectedTimeSyncInterface = $scope.timeSyncInterfaceDict[0];
    //机器人矫正变量初始化
    $scope.HoleNumData = [
        {
            num:1
        },
        {
            num:2
        },
        {
            num:3
        },
        {
            num:4
        },
        {
            num:5
        },
        {
            num:6
        },
        {
            num:7
        },
        {
            num:8
        },
        {
            num:9
        },
        {
            num:10
        },
        {
            num:11
        },
        {
            num:12
        },
        {
            num:13
        },
        {
            num:14
        },
        {
            num:15
        },
        {
            num:16
        },
        {
            num:17
        },
        {
            num:18
        },
        {
            num:19
        },
        {
            num:20
        },
        {
            num:21
        },
        {
            num:22
        },
        {
            num:23
        },
        {
            num:24
        },
        {
            num:25
        },
        {
            num:26
        }
    ]
    $scope.selectedHoleNum = $scope.HoleNumData[0];
    $scope.loginTypeDict = [
        {
            "name": "FR",
            "id": "0"
        },
        {
            "name": "CATL",
            "id": "1"
        }
    ];
    // DH参数校准
    $scope.dhPointsList = [
        {
            "name": "Point1",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point2",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point3",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point4",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point5",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point6",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point7",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point8",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point9",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point10",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point11",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point12",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point13",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point14",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point15",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point16",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point17",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point18",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point19",
            "joints": {},
            "recordFlg": 0
        },
        {
            "name": "Point20",
            "joints": {},
            "recordFlg": 0
        },
    ];
    // DH参数校核
    function resetDHPointsCheckList() {
        $scope.dhPointsCheckList = [
            {
                "name": "Point1",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point2",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point3",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point4",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point5",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point6",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point7",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point8",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point9",
                "joints": {},
                "recordFlg": 0
            },
            {
                "name": "Point10",
                "joints": {},
                "recordFlg": 0
            }
        ];
    }
    // DH参数校核数据、偏差和结果、转换位姿、TCP位姿
    function resetDHCheckResult() {
        $scope.dhCheckResult = [
            {
                name: "Point1"
            },
            {
                name: "Point2"
            },
            {
                name: "Point3"
            },
            {
                name: "Point4"
            },
            {
                name: "Point5"
            },
            {
                name: "Point6"
            },
            {
                name: "Point7"
            },
            {
                name: "Point8"
            },
            {
                name: "Point9"
            },
            {
                name: "Point10"
            },
            {
                name: "average"
            },
            {
                name: "result"
            }
        ];
        $scope.transformPoseData = [];
        $scope.tcpPoseData = [];
    }
    // 机器人采样周期端口类型
    $scope.robotPeriodPort = [
        {
            id: 0,
            name: '20004'
        },
        {
            id: 1,
            name: '8083'
        }
    ];
    $scope.selectedPeriodPort = $scope.robotPeriodPort[0];
    let dhRecordFlg = 0;
    let dhCheckFlg = 0;
    let pointIndex = 0;
    let moveJData = {};
    let tempPointsArr = [];
    let isAuto = 0;
    let thetaDict = {};
    // 零点矫正
    $scope.zeroFinsh = 0;
    // 更新示教点数据类型标志位
    $scope.updatePointsFlag = 0;
    //true 显示关节全参数配置
    $scope.joint_param_on = true;
    // 判断子页面是否有权限（将值为1或者id不存在的页面展示）
    $scope.userAuthData = getUserAuthority();
    // 通用设置和自定义信息的权限是在页面上进行判断
    $scope.generalSetAuth = $scope.userAuthData.funcs.general_setting;
    $scope.customInfoAuth = $scope.userAuthData.funcs.custom_info;
    /* ./初始化 */

    /* 语言设置 */
    $scope.setLanguage = function (selectedLanguage) {
        let cmdContent = {
            cmd: "set_sys_language",
            data: {
                language: selectedLanguage.lang_code
            }
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                // 示教器设置语言返回提示信息,存储后在登录页使用
                let storage = window.sessionStorage;
                if (!$.isEmptyObject(data)) {
                    storage.setItem("loginTipFlag", true);
                    storage.setItem("loginTip", data.tip);
                } else {
                    storage.setItem("loginTipFlag", false);
                    storage.setItem("loginTip", "");
                }
                // 设置语言成功后登出
                dataFactory.logout();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取当前语言字典 */
    function getCurrentLangDict() {
    let cmdContent = {
        cmd: "get_lang_dict"
    };
    dataFactory.getData(cmdContent)
        .then((data) => {
            $scope.languageList = [];
            for (let i = 0; i < data.length; i++) {
                g_lang_dict[data[i]] = g_ref_lang_dict[data[i]];
                $scope.languageList.push(g_ref_lang_dict[data[i]]);
            }
            $scope.selectedLanguage = g_ref_lang_dict[g_lang_code];
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[30]);
        });
    }

    //获取控制器软件版本命令
    function getCtrVersion() {
        let getCtrVerCmd = {
            cmd: 400,
            data: {
                content: "GetMCVersion(1)"
            }
        };
        dataFactory.setData(getCtrVerCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[1]);
            });
    }
    document.getElementById('systemSetting').addEventListener('400', e => {
        $scope.controlVersion = e.detail;
    })

    //获取固件版本命令
    function getSlaveFirmVersion() {
        let getSlaveFirmVersionCmd = {
            cmd: 424,
            data: {
                content: "GetSlaveFirmVersion()"
            }
        };
        dataFactory.setData(getSlaveFirmVersionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[2]);
            });
    }
    document.getElementById('systemSetting').addEventListener('424', e => {
        $scope.firmwareData = JSON.parse(e.detail)
        $scope.displayFirmwareVersion($scope.selectedFirmwareVersion.id);
    })

    //获取硬件版本命令
    function getSlaveHardVersion() {
        let getSlaveHardVersionCmd = {
            cmd: 423,
            data: {
                content: "GetSlaveHardVersion()"
            }
        };
        dataFactory.setData(getSlaveHardVersionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[3]);
            });
    }
    document.getElementById('systemSetting').addEventListener('423', e => {
        $scope.hardwareData = JSON.parse(e.detail);
        $scope.displayHardwareVersion($scope.selectedHardwareVersion.id);
    })

    //获取驱动器版本命令
    function getEncoderVersion() {
        let getEncoderVersionCmd = {
            cmd: 703,
            data: {
                content: "GetEncoderVersion()"
            }
        };
        dataFactory.setData(getEncoderVersionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[33]);
            });
    }
    document.getElementById('systemSetting').addEventListener('703', e => {
        $scope.encoderData = JSON.parse(e.detail)
        $scope.displayEncoderVersion($scope.selectedEncoderVersion.id);
    })

    //硬件版本号显示
    $scope.displayHardwareVersion = function (index) {
        $scope.hardwareVersion = $scope.hardwareData[index];
    }

    //固件版本号显示
    $scope.displayFirmwareVersion = function (index) {
        if(index == 8) {
            $scope.getSafetyFirmVersion();
        } else {
            $scope.firmwareVersion = $scope.firmwareData[index];
        }
    }

    /**安全板固件版本显示 */
    $scope.getSafetyFirmVersion = function() {
        let setCmd = {
            cmd: 956,
            data: {
                content: "GetSafetyFirmVersion()"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('systemSetting').addEventListener('956', e => {
        $scope.firmwareVersion = e.detail;
    })

    //驱动器版本号显示
    $scope.displayEncoderVersion = function (index) {
        $scope.encoderVersion = $scope.encoderData[index];
    }

    //获取从站芯片类型
    $scope.displaySlaveConfigChipType = function (index) {
        let getSlaveConfigChipTypeCmd = {
            cmd: 664,
            data: {
                content: "SlaveGetChipType("+index+")"
            }
        };
        dataFactory.setData(getSlaveConfigChipTypeCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[31]);
            });
    }
    $scope.displaySlaveConfigChipType($scope.selectedSlaveChipType.id);

    document.getElementById('systemSetting').addEventListener('664', e => {
        $scope.tempSlaveChipTypeData = JSON.parse(e.detail);
        $scope.chipTypeValue = $scope.slaveChipTypeList.find(item => item.value == $scope.tempSlaveChipTypeData.chipTypeValue).name;
    })

    //从站配置文件信息显示
    $scope.displaySlaveConfigVersion = function (index) {
        let getSlaveConfigInfoCmd = {
            cmd: 633,
            data: {
                content: "SlaveConfigInfoRead("+index+")"
            }
        };
        dataFactory.setData(getSlaveConfigInfoCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[4]);
            });
    }
    $scope.displaySlaveConfigVersion($scope.selectedSlaveVersion.id);

    document.getElementById('systemSetting').addEventListener('633', e => {
        $scope.tempSlaveInfoData = JSON.parse(e.detail);
        $scope.slaveVendorID = $scope.tempSlaveInfoData.vendorID;
        $scope.slaveProductCode = $scope.tempSlaveInfoData.productCode;
        $scope.slaveRevisionNo = $scope.tempSlaveInfoData.revisionNo;
    })

    // 根据二级菜单切换对应设置界面
    $scope.switchSysSettingPage = function (id) {
        $(".navItem").removeClass("item-selected");
        $(".navItem" + id).addClass("item-selected");
        $(".childrenItem").removeClass("childItem-selected");
        $(".childrenItem" + id).addClass("childItem-selected");
        $scope.show_General = false;
        $scope.show_Account = false;
        $scope.userManagement = false;
        $scope.functionAuthority = false;
        $scope.accountUpDown = false;
        $scope.show_PluginsManagement = false;
        $scope.show_About = false;
        $scope.show_userInfoCfg = false;
        $scope.show_password = false;
        $scope.show_setUserinfocfg = false;
        $scope.show_robot_type = false;
        $scope.show_robot_type_password = false;
        $scope.show_sys_ConfiguringInfo = false;
        $scope.show_setRobotTypecfg = false;
        $scope.userManagement = false;
        $scope.functionAuthority = false;
        $scope.accountUpDown = false;
        $scope.accountBreadMenu[1].title = '';
        $scope.accountBreadMenu[2].title = '';
        switch (id) {
            case "general_setting":
                $scope.show_General = true;
                if ($scope.authorityID == '0' || $scope.authorityID == '1') {
                    getIndustrialComputerConfig();
                }
                break;
            case "plugins_setting":
                $scope.show_PluginsManagement = true;
                if (g_systemFlag) {
                    getPluginsInfo();
                }
                break;
            case "about":
                getCtrVersion();
                getSlaveFirmVersion();
                getSlaveHardVersion();
                getEncoderVersion();
                $scope.show_About = true;
                break;
            case "custom_info":
                $scope.show_password = true;
                $scope.show_userInfoCfg = true;
                if ($scope.authorityID == '0') {
                    getLoginType();
                }
                getTeachProgramEncryptData(); // 获取示教程序加密数据
                if ($scope.authorityID == '0' || $scope.authorityID == '1') {
                    getRobotParamsRange($scope.authorityID);
                    initRobotParamsRange();
                }
                getInternalProgramList(); //获取内部程序生成列表数据
                break;
            case "maintenance_mode":
                getCtrlBoxSN();
                getRobotActivateTime();
                getCtrlLogLevel();
                $scope.getRobotStateSamplePeriod($scope.selectedPeriodPort.id);
                getDHPoints();    // 获取DH点信息初始化
                getDHCheckPoints();  // 获取DH校核信息初始化
                $scope.show_robot_type_password = true;
                $scope.show_robot_type = true;
                getBtnBoxRobotModeChange(); // 获取组合键配置信息
                getEndDragBtnConfig();
                if (g_systemFlag) {
                    getCartMaxVelAcc();
                    getRobotSpeedMax();
                }
                break;
            case 'user_manage':
                $scope.show_Account = true;
                $scope.userManagement = true;
                $scope.accountBreadMenu[1].title = accountSettingLan._user_management;
                $scope.accountBreadMenu[2].title = '';
                $scope.show_user_authority_list = true;
                $scope.show_user_authority_operate = false;
                $scope.workNoFlag = 0; //工号状态 0-正常 1-已存在 2-非空 3-10位整数型
                $scope.userNameFlag = 0; //姓名状态 0-正常 1-非空
                $scope.userPasswordFlag = 0; //密码状态 0-正常 1-已存在 2-非空
                $scope.userAuthIdFlag = 0; //职能选择状态 0-正常 1-未选择
                getAuthorityFuncData('created');
                getLoginType();
                break;
            case 'auth_manage':
                $scope.show_Account = true;
                $scope.functionAuthority = true;
                getAuthorityFuncData();
                $scope.accountBreadMenu[1].title = accountSettingLan._authority_assignment;
                $scope.accountBreadMenu[2].title = '';
                $scope.goBackAuthDistribute();
                break;
            case 'up_down':
                $scope.show_Account = true;
                $scope.accountUpDown = true;
                $scope.accountBreadMenu[1].title = '';
                $scope.accountBreadMenu[2].title = '';
                $scope.goBackAuthDistribute();
                break;
            default:
                break;
        }
    }

    //获取系统配置文件
    function getSysCfg() {
        let getSysCfgCmd = {
            cmd: "get_syscfg",
        };
        dataFactory.getData(getSysCfgCmd)
            .then((data) => {
                $scope.selectedLogCount = parseInt(data.log_count);
                $scope.logoutTime = (parseInt(data.lifespan))/60;
                hidePageLoading();
            }, (status) => {
                $scope.selectedLogCount = 0;
                toastFactory.error(status, ssDynamicTags.error_messages[6]);
                hidePageLoading();
            });
    }

    //获取机器人型号
    function getRobotType() {
        let getRobotTypeCmd = {
            cmd: "get_ODM_cfg",
        };
        dataFactory.getData(getRobotTypeCmd)
            .then((data) => {
                $scope.sysRobotType = data.robot_model;
            }, (status) => {
                $scope.selectedLogCount = 0;
                toastFactory.error(status, ssDynamicTags.error_messages[7]);
            });
    }

    //设置日志保留份数
    $scope.setLogCount = function () {
        if ($scope.selectedLogCount < 1) {
            toastFactory.warning(ssDynamicTags.warning_messages[0]);
        } else {
            let setLogCountCmd = {
                cmd: "set_sys_logcount",
                data: {
                    "log_count": $scope.selectedLogCount+"",
                }
            };
            dataFactory.actData(setLogCountCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //设置超时登出时间
    $scope.setlogoutTime = function () {
        if ($scope.logoutTime < 5) {
            toastFactory.info(ssDynamicTags.info_messages[0]);
        } else {
            let setlogoutTimeCmd = {
                cmd: "set_sys_lifespan",
                data: {
                    "lifespan": $scope.logoutTime*60+"",
                }
            };
            dataFactory.actData(setlogoutTimeCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }

    }

    // 导出系统配置文件
    $scope.exportConfig = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/cfg/system.txt";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/cfg/system.txt";
        }
    };

    //导入系统配置文件
    $scope.importConfig = function () {
        var formData = new FormData();
        var file = document.getElementById("syscfgImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1])
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let getCmd = {
                        cmd: "get_syscfg",
                    };
                    dataFactory.getData(getCmd)
                        .then((data) => {
                            $scope.selectedLogCount = parseInt(data.log_count);
                            $scope.logoutTime = (parseInt(data.lifespan))/60;
                            // 登出
                            dataFactory.logout();
                        }, (status) => {
                            toastFactory.error(status, ssDynamicTags.error_messages[8]);
                        });
                }
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[9]);
            });
    };

    //检查配置文件
    function checkCfgData(index) {
        let checkCfgCmd = {
            cmd: 345,
            data: {
                content:"CheckCFG("+index+")",
            },
        };
        dataFactory.setData(checkCfgCmd)
        .then(() => {
            if (index == 1) {
                $scope.sys_check_user_cfg = 1;
            } else if (index == 2) {
                $scope.sys_check_eaxis_cfg = 1;
            } else if (index == 3) {
                $scope.sys_check_external_cfg = 1;
            }
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[10]);
        });
    }

    //配置文件检查提示
    $scope.sys_restart_tips = "";
    document.getElementById("systemSetting").addEventListener('345', e => {
        $("#recoverModal").modal('hide');
        if (e.detail == 1) {
            $scope.sys_check_user_cfg = 1;
        } else if (e.detail == 2) {
            $scope.sys_check_eaxis_cfg = 1;
        } else if (e.detail == 3) {
            $scope.sys_check_external_cfg = 1;
        }
        if(($scope.sys_check_user_cfg == 1) && ($scope.sys_check_eaxis_cfg == 1) && ($scope.sys_check_external_cfg == 1)){
            $scope.index_cfg_check_tips = "";
            $scope.sys_restart_tips = ssDynamicTags.success_messages[13];
            showPageRestart(ssDynamicTags.success_messages[13]);
        }
    })

    /* 弹出恢复出厂设置对话框 */
    $scope.openRecoverModal = function () {
        $("#recoverModal").modal();
    }

    /* 确认恢复出厂设置 */
    $scope.recoverSystem = function () {
        let recoverSysCmd = {
            cmd: "factory_reset",
            data: {
            }
        };
        $("#recoverModal").modal('hide');
        $('#pageLoading').css("display", "block");
        dataFactory.actData(recoverSysCmd)
            .then(() => {
                checkCfgData(1);
                checkCfgData(2);
                checkCfgData(3);
                $('#pageLoading').css("display", "none");
            }, (status) => {
                $('#pageLoading').css("display", "none");
                toastFactory.error(status);
            });
    }

    /**获取安全板日志文件 */
    let allversionsFlag;
    $scope.getSafetyBoardLog = function(index){
        allversionsFlag = index;
        
        let setCmd = {
            cmd: 955,
            data: {
                content: "GetSafetyBoardLog()",
            },
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    };
    document.getElementById('systemSetting').addEventListener('955', () => {
        window.location.href = "/action/download?pathfilename=/tmp/FR_SAFE_H7_LOG.tar.gz";
        //导出系统所有数据
        if (allversionsFlag) {
            $scope.createAllVersionText();
        }
    });
    
    /**更新最新的内核信息，便于研发分析 */
    let updateFlag;
    $scope.updateSystemKernelMsg = function(index) {
        updateFlag = index;

        let setCmd = {
            cmd: 966,
            data: {
                content: "UpdateSystemKernelMsg()",
            },
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('systemSetting').addEventListener('966', () => {
        if(updateFlag == 1) {
            $scope.exportControlLog();
        } else {
            $scope.getSafetyBoardLog(1);
        }
    });

    //导出控制器日志文件
    $scope.exportControlLog = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/controller/rblog.tar.gz";
        }else{
            window.location.href = "/action/download?pathfilename=/root/robot/rblog.tar.gz";
        }
    }

    //先生成allversions.txt后再导出系统所有数据
    $scope.createAllVersionText = function(){
        $scope.exportProgressText = ssDynamicTags.info_messages[40];
        let createAllVersionTextCmd = {
            cmd: "create_allversions_file",
            data: {},
        };
        dataFactory.actData(createAllVersionTextCmd)
            .then(() => {
                $scope.exportProgressText = ssDynamicTags.success_messages[29];
                exportAllDataSources();
            }, (status) => {
                $scope.exportProgressText = "";
                exportAllDataSources();
                toastFactory.error(status, ssDynamicTags.error_messages[25]);
            });  
    }

    //导出系统所有数据源数据
    function exportAllDataSources() {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/alldatasources.tar.gz";
        }else{
            window.location.href = "/action/download?pathfilename=/alldatasources.tar.gz";
        }
    }

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
    document.getElementById('systemSetting').addEventListener('332', () => {
        $scope.ecat_boot_flag = 1;
    });

    //从站日志生成
    $scope.setSlaveFileRead = function () {
        if($scope.ecat_boot_flag == 0){
            toastFactory.info(ssDynamicTags.info_messages[20]);
            return;
        }
        var slavefilename = "";
        if($scope.selectedHardwareLog.id == 0){
            if (g_systemFlag) {
                slavefilename = "\"/usr/local/etc/controller/rblog/FrCtrlLog.txt\"";
            } else {
                slavefilename = "\"/root/robot/rblog/FrCtrlLog.txt\"";
            }
        }else if($scope.selectedHardwareLog.id == 7){
            if (g_systemFlag) {
                slavefilename = "\"/usr/local/etc/controller/rblog/FrAxleLog.txt\"";
            } else {
                slavefilename = "\"/root/robot/rblog/FrAxleLog.txt\"";
            }
        }else{
            if (g_systemFlag) {
                slavefilename = "\"/usr/local/etc/controller/rblog/FrServoLog"+$scope.selectedHardwareLog.id+".txt\"";
            } else {
                slavefilename = "\"/root/robot/rblog/FrServoLog"+$scope.selectedHardwareLog.id+".txt\"";
            }
        }
        var setSlaveFileReadString = "SlaveFileRead("+$scope.selectedHardwareLog.id+","+slavefilename+")";
        let setSlaveFileReadCmd = {
            cmd: 675,
            data: {
                content: setSlaveFileReadString,
            },
        };
        dataFactory.setData(setSlaveFileReadCmd)
            .then(() => {
                $scope.hardwareLogText = "";
            }, (status) => {
                toastFactory.error(status);
            });
    }

    $scope.hardwareLogText = "";
    document.getElementById('systemSetting').addEventListener('675', function (e) {
        $scope.hardwareLogText = ssDynamicTags.success_messages[28]; 
    });


    // 打开用户管理模态窗
    $("#btnManageAccount").click(function () {
        getAccounts();
        switch2Default(-1);
        clearAllcbItems();
        $('#manageAccountModal').modal();
    });

    // 用户管理
    $scope.userManagement = false;
    $scope.show_user_authority_list = false;
    $scope.show_user_authority_operate = false;
    // 权限分配
    let accountAuthConfig;
    $scope.functionAuthority = false;
    $scope.authorityDistribute = true;
    $scope.functionAdd = false;
    $scope.functionEdit = false;
    $scope.functionSet = false;
    $scope.accountBreadMenu = [      
        {
            id: 0,
            title: accountSettingLan._account_manage
        },
        {
            id: 1,
            title: ''
        },
        {
            id: 2,
            title: ''
        },
    ]
    
    /**
     * 获取职能分配的表格数据
     * @param {String} type 'created':初始化页面；不传type代表打开页面后操作
     */
    function getAuthorityFuncData(type) {
        const getAuthorityFuncParams = {
            cmd: "get_auths"
        };
        dataFactory.getData(getAuthorityFuncParams).then((data) => {
            $scope.authorityFuncData = data;
            if (type == 'created') {
                getUserAccount();
            }
        }, (status) => {
            $scope.authorityFuncData = [];
            toastFactory.error(status, ssDynamicTags.error_messages[40]);
            /* test */
            if (g_testCode) {
                $scope.authorityFuncData = testAuthorityData;
            }
            /* ./test */
        });
    }

    /**从新增、编辑、设置职能权限页面返回到职能薪资表格页面 */
    $scope.goBackAuthDistribute = function() {
        // 用户管理点击面包屑返回显示内容处理
        $scope.show_user_authority_list = true;
        $scope.show_user_authority_operate = false;
        $scope.workNoFlag = 0;
        $scope.userNameFlag = 0;
        $scope.userPasswordFlag = 0;
        $scope.userAuthIdFlag = 0;
        // 权限管理点击面包屑返回显示内容处理
        $scope.authorityDistribute = true;
        $scope.functionAdd = false;
        $scope.functionEdit = false;
        $scope.functionSet = false;
        // 返回时，清空新增时填写的草稿
        $scope.addFunctionItem = {};
        // 返回时，面包屑清空三级标题
        $scope.accountBreadMenu[2].title = '';
    }
    
    /**新增一条职能数据 */
    $scope.addFunctionItem = {};
    $scope.addFunctionInfo = function() {
        $scope.authorityDistribute = false;
        $scope.functionAdd = true;
        $scope.functionEdit = false;
        $scope.functionSet = false;
        $scope.accountBreadMenu[2].title = accountSettingLan._add_newly;
    }

    /**保存新增的一条职能数据 */
    $scope.saveAuthAssignAdd = function() {
        $scope.addFunctionItem.auth_id = $('#add-auth-id')[0].value;
        if ($scope.addFunctionItem.auth_id == '0') {
            toastFactory.info(ssDynamicTags.info_messages[31]);
            return;
        }
        if ($scope.addFunctionItem.auth_id && $scope.addFunctionItem.auth_name && $scope.addFunctionItem.auth_description) {
            if ($scope.authorityFuncData.some(item => item.auth_id == $scope.addFunctionItem.auth_id)) {
                toastFactory.info(ssDynamicTags.info_messages[28]);
                return;
            }
            if ($scope.addFunctionItem.auth_id.length > 8) {
                toastFactory.info(ssDynamicTags.info_messages[32]);
                return;
            }
            const addAuthParams = {
                cmd: 'save_auth',
                data: {
                    auth_id: $scope.addFunctionItem.auth_id,
                    auth_name: $scope.addFunctionItem.auth_name,
                    auth_description: $scope.addFunctionItem.auth_description
                }
            }
            dataFactory.actData(addAuthParams).then(() => {
                $scope.goBackAuthDistribute();
                getAuthorityFuncData();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[38]);
            });
        } else {
            if (!$scope.addFunctionItem.auth_id) {
                toastFactory.info(ssDynamicTags.info_messages[25]);
            }
            if (!$scope.addFunctionItem.auth_name) {
                toastFactory.info(ssDynamicTags.info_messages[26]);
            }
            if (!$scope.addFunctionItem.auth_description) {
                toastFactory.info(ssDynamicTags.info_messages[27]);
            }
        }
    }

    $scope.editFunctionItem = {};
    /**
     * 编辑职能信息
     * @param {Object} editItem 当前编辑的职能信息
     */
    $scope.editAuthority = function(editItem) {
        $scope.currentEditFunctionItem = JSON.parse(JSON.stringify(editItem));
        $scope.editFunctionItem = JSON.parse(JSON.stringify(editItem));
        $scope.authorityDistribute = false;
        $scope.functionAdd = false;
        $scope.functionEdit = true;
        $scope.functionSet = false;
        $scope.accountBreadMenu[2].title = accountSettingLan._edit;
    }

    /**保存编辑修改过后的一条职能信息数据 */
    $scope.saveAuthAssignEdit = function() {
        if ($scope.editFunctionItem.auth_name && $scope.editFunctionItem.auth_description) {
            const editAuthParams = {
                cmd: 'save_auth',
                data: {
                    auth_id: $scope.editFunctionItem.auth_id,
                    auth_name: $scope.editFunctionItem.auth_name,
                    auth_description: $scope.editFunctionItem.auth_description
                }
            }
            dataFactory.actData(editAuthParams).then(() => {
                $scope.goBackAuthDistribute();
                getAuthorityFuncData();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[38]);
            });
        } else {
            if (!$scope.editFunctionItem.auth_name) {
                toastFactory.info(ssDynamicTags.info_messages[26]);
            }
            if (!$scope.editFunctionItem.auth_description) {
                toastFactory.info(ssDynamicTags.info_messages[27]);
            }
        }
    }

    /**
     * 删除职能权限前校验
     * @param {Object} deleteItem 删除的职能信息
     */
    $scope.checkAuthorityUsage = function(deleteItem) {
        const deleteAuthParams = {
            cmd: 'check_auth_usage',
            data: {
                auth_id: deleteItem.auth_id
            }
        }
        dataFactory.getData(deleteAuthParams).then((data) => {
            if (data.result == '0') {
                $scope.deleteAuthority(deleteItem);
            } else {
                toastFactory.info(ssDynamicTags.error_messages[43]);
            }
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[47]);
        });
    }

    /**
     * 删除职能权限
     * @param {Object} deleteItem 删除的职能信息
     */
    $scope.deleteAuthority = function(deleteItem) {
        const deleteAuthParams = {
            cmd: 'delete_auth',
            data: {
                auth_id: deleteItem.auth_id
            }
        }
        dataFactory.actData(deleteAuthParams).then(() => {
            getAuthorityFuncData();
        }, (status) => {
            getAuthorityFuncData();
            toastFactory.error(status, ssDynamicTags.error_messages[39]);
        });
    }

    /**
     * 获取职能权限信息表格————设置职能权限的数据
     * @param {Object} setItem 设置当前权限的职能信息
     * @param {String} type set:点击职能权限信息表格;get:设置当前权限的职能信息成功后更新全局权限
     */
    function getAuthorityConfig(setItem, type) {
        const getAuthorityConfigParams = {
            cmd: "get_auth_config",
            data: {
                auth_id: setItem.auth_id
            }
        };
        dataFactory.getData(getAuthorityConfigParams).then((data) => {
            switch (type) {
                case 'set':
                    accountAuthConfig = data;
                    // 处理可查看视图的数据
                    $scope.accessViewData.forEach(item => {
                        item.value = data.views[item.id]
                    })
                    $scope.chooseFunctinsOptions('views');
                    // 处理可操作指令的数据
                    $scope.functionOptionsData.forEach(item => {
                        item.children.forEach(element => {
                            element.value = data.funcs[item.id][element.id]
                        })
                        $scope.chooseFunctinsOptions(item.id);
                    });
                    break;
                case 'get':
                    $scope.userAuthData = data;
                    $scope.judgeAuth();
                    sessionStorage.setItem('userAuthority', JSON.stringify(data));
                    break;
                default:
                    break;
            }
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[41]);
            /* test */
            if (g_testCode) {
                // 处理可查看视图的数据
                accountAuthConfig = {
                    "views": {
                        "robot_setting": "1",
                        "peripheral_setting": "1",
                        "teaching_program": "1",
                        "graphical_program": "1",
                        "teaching_management": "1",
                        "system_log": "1",
                        "status_query": "1",
                        "auxiliary_application": "1",
                        "welding_library": "1",
                        "security_setting": "1",
                        "general_setting": "1",
                        "plugins_setting": "1",
                        "custom_info": "1",
                        "maintenance_mode": "1"
                    },
                    "funcs": {
                        "state_switch": {
                            "start_stop_pause": "1",
                            "speed_scaling": "1",
                            "manual_auto_switch": "1",
                            "drag_switch": "1",
                            "remote_control_switch": "1"
                        },
                        "robot_operation": {
                            "free_mount": "1",
                            "fixed_mount": "1",
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
                            "file_import_export": "1"
                        },
                        "peripheral_setting": {
                            "peripheral_config": "1",
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
                            "ten_data_record": "0",
                            "tp_config": "1",
                            "matrix_move": "1",
                            "starting_point": "0",
                            "inter_zone": "1",
                            "end_led": "1",
                            "custom_protocol": "1",
                            "peripheral_protocol": "1",
                            "main_program": "0",
                            "drag_lock": "1",
                            "smart_tool": "1",
                            "multi_inter_zone": "1"
                        },
                        "security_setting": {
                            "safe_speed": "1",
                            "safe_stop": "1",
                            "safe_plane": "1",
                            "safe_daemon": "1"
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
                        "custom_info": {
                            "info_package_upload": "1",
                            "type_name_modify": "1",
                            "teach_program_encryption": "1"
                        }
                    }
                }
                $scope.accessViewData.forEach(item => {
                    item.value = accountAuthConfig.views[item.id]
                })
                // 处理可操作指令的数据
                $scope.functionOptionsData.forEach(item => {
                    item.children.forEach(element => {
                        element.value = accountAuthConfig.funcs[item.id][element.id]
                    })
                    $scope.chooseFunctinsOptions(item.id);
                })
                $scope.chooseFunctinsOptions('views');
                console.log($scope.accessViewData, '$scope.accessViewData');
                console.log($scope.functionOptionsData, '$scope.functionOptionsData');
            }
            /* ./test */
        });
    }

    /**
     * 设置职能权限
     * @param {Object} setItem 设置当前权限的职能信息
     */
    $scope.setAuthority = function(setItem) {
        $scope.setFunctionItem = JSON.parse(JSON.stringify(setItem));
        getAuthorityConfig(setItem, 'set');
        $scope.authorityDistribute = false;
        $scope.functionAdd = false;
        $scope.functionEdit = false;
        $scope.functionSet = true;
        $scope.accountBreadMenu[2].title = accountSettingLan._set;
        resetAuthAssignSet();
    }

    /**重置设置界面的值 */
    function resetAuthAssignSet() {
        $scope.accessViewData = JSON.parse(JSON.stringify(ssDynamicTags.var_object.accessViews));
        $scope.functionOptionsData = JSON.parse(JSON.stringify(ssDynamicTags.var_object.operableFunction));
        // 远程控制接口配置只在Linux版本下可以使用
        if (g_systemFlag == 0) {
            $scope.functionOptionsData[3].children.splice(11, 1);
        }
        $scope.views_all = '0';
        $scope.state_switch_all = '0';
        $scope.robot_operation_all = '0';
        $scope.robot_setting_all = '0';
        $scope.peripheral_setting_all = '0';
        $scope.teaching_management_all = '0';
        $scope.system_log_all = '0';
        $scope.auxiliary_application_all = '0';
        $scope.security_setting_all = '0';
        $scope.general_setting_all = '0';
        $scope.account_setting_all = '0';
        $scope.custom_info_all = '0';
    }

    /**保存设置修改过后的职能权限 */
    $scope.saveAuthAssignSet = function() {;
        $scope.accessViewData.forEach(item => {
            accountAuthConfig.views[item.id] = item.value;
        })
        $scope.functionOptionsData.forEach(item => {
            item.children.forEach(element => {
                accountAuthConfig.funcs[item.id][element.id] = element.value;
            })
        })
        const setAuthParams = {
            cmd: "set_auth_config",
            data: {
                auth_id: $scope.setFunctionItem.auth_id,
                views: accountAuthConfig.views,
                funcs: accountAuthConfig.funcs
            }
        }
        dataFactory.actData(setAuthParams).then(() => {
            $scope.goBackAuthDistribute();
            getAuthorityFuncData();
            if ($scope.authorityID == $scope.setFunctionItem.auth_id) {
                getAuthorityConfig({ auth_id: $scope.authorityID }, 'get');
            };
        }, (status) => {
            getAuthorityConfig($scope.setFunctionItem, 'set');
            toastFactory.error(status, ssDynamicTags.error_messages[12]);
        });
    }

    /**复选框全选操作 */
    $scope.chooseAllFunctions = function(type) {
        switch (type) {
            case 'views':
                $scope.accessViewData.forEach(item => {
                    item.value = $scope[`${type}_all`];
                })
                // 可查看视图的全选操作与可操作指令中同类型的联动
                $scope.accessViewData.forEach(item => {
                    $scope.functionOptionsData.forEach(element => {
                        if (item.id == element.id) {
                            $scope[`${item.id}_all`] = $scope.views_all;
                            $scope.chooseAllFunctions(item.id);
                        }
                    })
                })
                break;
            case 'state_switch':
            case 'robot_operation':
            case 'robot_setting':
            case 'peripheral_setting':
            case 'teaching_management':
            case 'system_log':
            case 'auxiliary_application':
            case 'security_setting':
            case 'general_setting':
            case 'account_setting':
            case 'custom_info':
                $scope.functionOptionsData.forEach(item => {
                    if (item.id == type) {
                        item.children.forEach(element => {
                            element.value = $scope[`${type}_all`]
                        })
                    }
                })
                // 可操作指令的全选操作与可查看视图中同类型的联动
                $scope.accessViewData.forEach(accessItem => {
                    if (accessItem.id == type) {
                        accessItem.value = $scope[`${type}_all`];
                    }
                })
                $scope.views_all = $scope.accessViewData.every(item => item.value == '1') ? '1' : '0';
                break;
            default:
                break;
        }
    }

    /**
     * 复选框全选/取消全选
     * @param {String} type 可访问视图的具体项选择或者可操作指令的具体项类型
     * @param {Object} chooseItem 可访问视图的具体项选择的数据
     */
    function cancelAllFunctions(type, chooseItem) {
        switch (type) {
            // 可访问视图的全选
            case 'views':
                $scope[`${type}_all`] = $scope.accessViewData.every(item => item.value == '1') ? '1' : '0';
                // 可查看视图的子选项操作与可操作指令中同类型的联动
                if (chooseItem) {
                    $scope[`${chooseItem.id}_all`] = chooseItem.value;
                    $scope.functionOptionsData.forEach(element => {
                        if (chooseItem.id == element.id) {
                            $scope.chooseAllFunctions(chooseItem.id);
                        }
                    })
                }
                break;
            // 可操作指令的具体项的全选：状态切换、机器人操作、机器人设置、外设设置、示教管理、系统日志、辅助应用、安全设置、通用设置、账户权限管理、自定义信息
            case 'state_switch':
            case 'robot_operation':
            case 'robot_setting':
            case 'peripheral_setting':
            case 'teaching_management':
            case 'system_log':
            case 'auxiliary_application':
            case 'security_setting':
            case 'general_setting':
            case 'account_setting':
            case 'custom_info':
                $scope.functionOptionsData.forEach(item => {
                    if (item.id == type) {
                        $scope[`${type}_all`] = item.children.every(element => element.value == '1') ? '1' : '0';
                    }
                })
                $scope.functionOptionsData.forEach(item => {
                    if (item.id == type) {
                        $scope.accessViewData.forEach(element => {
                            if (element.id == type) {
                                element.value = item.children.find(ele => ele.value == '1') ? '1' : '0';
                            }
                        });
                        $scope.views_all = $scope.accessViewData.every(viewItem => viewItem.value == '1') ? '1' : '0';
                    }
                })
                break;
            default:
                break;
        }
    }

    /**
     * 勾选可访问视图或者可操作指令
     * @param {String} type 可访问视图的类型（views）或者可操作指令的具体项类型
     * @param {Object} chooseItem 可访问视图的具体项选择的数据
     */
    $scope.chooseFunctinsOptions = function(type, chooseItem) {
        cancelAllFunctions(type, chooseItem)
    }

    $scope.matchAuthDict = function (auth) {
        let authMatched;

        authDict.forEach(function (item, index, arr) {
            if (item.auth == auth) {
                authMatched = item;
                authMatched.index = index - 1;
            }
        });
        return authMatched;
    }

    // 导入账户管理数据模拟点击
    $scope.selectAccountManageFile = function () {
        $("#accountManageImport").click();
    }

    // 账户管理导入
    $scope.uploadAccountManageData = function() {
        var formData = new FormData();
        var file = document.getElementById("accountManageImport").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("account_authority.tar.gz" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('accountManageImport');
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData).then((data) => {
            clearImportFile('accountManageImport');
        }, (status) => {
            clearImportFile('accountManageImport');
            toastFactory.error(status, ssDynamicTags.error_messages[21]);
        });
    }

    // 账户管理导出
    $scope.downloadAccountManageData = function() {
        window.location.href = "/action/download?pathfilename=/tmp/account_authority.tar.gz";
    }

    $scope.changeAccountAuth = function (index, authSelected) {
        $scope.accounts[index].auth = authSelected.auth;
    }

    // 获取所有用户信息
    function getAccounts() {
        let getAccountsCmd = {
            cmd: "get_accounts"
        };
        dataFactory.getData(getAccountsCmd)
            .then((data) => {
                $scope.accounts = data;
                $scope.accounts.forEach(function (item, index, arr) {
                    if (item.auth == '0') {
                        $scope.adminOldPassword = item.password;
                    };
                });
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[11]);
            });
    };

    // 更新所有用户数据
    $scope.saveAccounts = function () {
        if (inputHasNull()) {
            toastFactory.warning(ssDynamicTags.warning_messages[2]);
        } else {
            let saveAccountsCmd = {
                cmd: "save_account",
                data: {
                    accounts: $scope.accounts
                }
            };
            dataFactory.actData(saveAccountsCmd)
                .then(() => {
                    switch2Default(-1);
                    clearAllcbItems();
                    $("#manageAccountModal").modal('hide');
                    $scope.accounts.forEach(function (item, index, arr) {
                        if (item.auth == "0") {
                            if (item.password == $scope.adminOldPassword) {
                                dataFactory.logout();
                            };
                        };
                    });
                }, (status) => {
                    switch2Default(-1);
                    clearAllcbItems();
                    toastFactory.error(status, ssDynamicTags.error_messages[12]);
                });
        };
    };

    $scope.newAccount = function () {
        let accountsNum = $scope.accounts.length;
        if (accountsNum >= 10) {
            toastFactory.info(ssDynamicTags.info_messages[2]);
        } else {
            let newAccount = {
                username: "",
                password: "",
                auth: "2"
            };
            $scope.accounts.push(newAccount);
        };
    };

    $scope.modifyAccount = function () {
        if ($scope.accountItemsArray.length == 0) {
            toastFactory.info(ssDynamicTags.info_messages[3]);
        } else {
            $scope.accountItemsArray.forEach(function (itemindex, index, arr) {
                let isBlock = document.getElementById("modifyPassword" + itemindex).style.display;
                if (isBlock == 'block') {
                    setShowModifyState(itemindex, 'block', 'none');
                } else {
                    setShowModifyState(itemindex, 'none', 'block');
                };
            });
        };
    };

    $scope.deleteAccount = function () {
        // 先给所勾选的待删除项进行从高到底的排序
        let ItemsArray = sortArray($scope.accountItemsArray);
        ItemsArray.forEach(function (itemindex, index, arr) {
            if ($scope.accounts[itemindex].auth == '0') {
                toastFactory.warning(ssDynamicTags.warning_messages[3]);
            } else {
                // 先清除所需删除项的编辑状态，以免导致删除后影响其余项的状态
                switch2Default(itemindex);
                // 按序删除
                $scope.accounts.splice(itemindex, 1);
            };
        });
        $scope.accountItemsArray = [];
        clearAllcbItems();
    };

    function inputHasNull() {
        let oInput = document.getElementsByName("input");
        let count = 0;
        oInput.forEach(function (item, index, arr) {
            if (item.value == "") {
                count++;
            };
        });
        return count;
    };

    function switch2Default(accIndex) {
        if (accIndex != -1) {
            setShowModifyState(accIndex, 'block', 'none');
        } else {
            $scope.accountItemsArray.forEach(function (itemindex, index, arr) {
                setShowModifyState(itemindex, 'block', 'none');
            });
        };
    };

    function setShowModifyState(index, showState, modifyState) {
        if ($scope.accounts[index].auth == '0') {
            document.getElementById("showPassword" + index).style.display = showState;
            document.getElementById("modifyPassword" + index).style.display = modifyState;
        } else {
            document.getElementById("showUsername" + index).style.display = showState;
            document.getElementById("showPassword" + index).style.display = showState;
            document.getElementById("showAuth" + index).style.display = showState;
            document.getElementById("modifyUsername" + index).style.display = modifyState;
            document.getElementById("modifyPassword" + index).style.display = modifyState;
            document.getElementById("modifyAuth" + index).style.display = modifyState;
        };
    };

    $scope.string2Number = function (stringData) {
        return ~~stringData;
    };

    // 对数组进行冒泡排序，从大到小，方便之后的账户删除操作
    function sortArray(arr) {
        const len = arr.length;
        for (let i = 0; i < len - 1; i++) {
            for (let j = 0; j < len - 1 - i; j++) {
                if (arr[j] < arr[j + 1]) {
                    const temp = arr[j + 1];
                    arr[j + 1] = arr[j];
                    arr[j] = temp;
                };
            };
        };
        return arr;
    };

    $scope.accountItemsArray = [];
    function clearAllcbItems() {
        let cbMain = document.getElementById("cbMain");
        let cbItems = document.getElementsByName("cbItem");
        cbMain.checked = false;
        cbItems.forEach(function (item, index, arr) {
            item.checked = false;
        });
        $scope.accountItemsArray = [];
    };

    $scope.setAllCbs = function () {
        let cbMain = document.getElementById("cbMain");
        let cbItems = document.getElementsByName("cbItem");
        if (cbMain.checked == false) {
            cbItems.forEach(function (item, index, arr) {
                item.checked = false;
            });
            $scope.accountItemsArray = [];
        } else {
            cbItems.forEach(function (item, index, arr) {
                item.checked = true;
                $scope.accountItemsArray.push(index);
            });
        };
    };

    $scope.clickCbItem = function (accIndex) {
        let cbItem = document.getElementById("cbItem" + accIndex);
        if (cbItem.checked == true) {
            $scope.accountItemsArray.push(accIndex);
        } else {
            $scope.accountItemsArray.forEach(function (item, index, arr) {
                if (item == accIndex) {
                    arr.splice(index, 1);
                    switch2Default(accIndex);
                };
            });
        };
    };

    /**用户列表复选框功能 -- 全选*/
    let userAuthAll = document.getElementById("userAuthAll");
    let userAuthItem = document.getElementsByName("userAuthItem");
    $scope.setAllUserAuth = function () {
        $scope.userAuthArray = [];
        if (userAuthAll.checked == false) {
            userAuthItem.forEach(item => {
                item.checked = false;
            });
        } else {
            userAuthItem.forEach((item)=> {
                item.checked = true;
                if (item.value == $scope.userID || item.value == '111') {
                    item.checked = false;
                    return;
                }
                $scope.userAuthArray.push(item.value);
            })
        }
    }

    /**用户列表复选框功能 -- 多选 */
    $scope.userAuthArray = [];
    $scope.clickUserAuthorityItem = function (userIndex) {
        let userAuthItem = document.getElementById("userAuthItem" + userIndex);
        if (userAuthItem.checked == true) {
            $scope.userAuthArray.push(userIndex);
        } else {
            $scope.userAuthArray.forEach((item, index, arr) => {
                if (item == userIndex) {
                    arr.splice(index, 1);
                }
            })
        }
    }

    //搜索框模糊搜索-按照工号、姓名、职能代号搜索
    $scope.searchUserAuth = function() {
        if ($scope.userAuthSearchConetent) {
            const pattern = new RegExp($scope.userAuthSearchConetent, 'i');//不区分大小写
            let data = [];
            $scope.userAccountList.forEach(item => {
                if (pattern.test(item.user_id) || pattern.test(item.user_name) || pattern.test(item.auth_id)) {
                    data.push(item);
                }
                $scope.userAccountList = data;
            })
        } else {
            getAuthorityFuncData('created');
        }
    }

    //新增/编辑按钮 0-新增保存 1-编辑保存 2-取消
    $scope.userAuthOperate = function(index, array) {
        if (index == 0) {
            $scope.show_user_authority_list = false;
            $scope.show_user_authority_operate = true;
            $scope.disableId = false;
            $scope.disableName = false;
            $scope.workNoContent = "";
            $scope.userNameContent = "";
            $scope.userPasswordContent = "";
            $scope.selectAuthId = "";
            $scope.judeg_operate = 0; //操作判断标志 0-新增 1-编辑
            $scope.accountBreadMenu[2].title = accountSettingLan._add_newly;
        } else if (index == 1) {
            $scope.show_user_authority_list = false;
            $scope.show_user_authority_operate = true;
            $scope.disableId = true;
            $scope.disableName = true;
            $scope.workNoContent = array.user_id;
            $scope.userNameContent = array.user_name;
            $scope.userPasswordContent = array.user_pwd;
            $scope.selectAuthId = $scope.authorityFuncData.filter(element => element.auth_id == array.auth_id)[0];
            $scope.judeg_operate = 1;
            $scope.accountBreadMenu[2].title = accountSettingLan._edit;
        } else {
            $scope.show_user_authority_list = true;
            $scope.show_user_authority_operate = false;
            $scope.workNoFlag = 0;
            $scope.userNameFlag = 0;
            $scope.userPasswordFlag = 0;
            $scope.userAuthIdFlag = 0;
            $scope.accountBreadMenu[2].title = '';
        }
    }
    
    //获取用户列表数据
    function getUserAccount() {
        let getUserAccountCmd = {
            cmd: "get_accounts"
        };
        dataFactory.getData(getUserAccountCmd)
            .then((data) => {
                $scope.userAccountList = data;
                $scope.userAccountList.forEach(item => {
                    if ($scope.authorityFuncData.filter(element => element.auth_id == item.auth_id).length) {
                        item['auth_name'] = $scope.authorityFuncData.filter(element => element.auth_id == item.auth_id)[0].auth_name;
                    } else {
                        item['auth_name'] = "N/A";
                    }
                    //当前登录的管理员数据无法修改和删除自己的信息/admin为111
                    if (item.user_id == $scope.userID || item.user_id == '111') {
                        $scope[`disable_operate${item.user_id}`] = true; //禁用按钮判断标志
                        $(function() {
                            $(`#userAuthItem${item.user_id}`).attr("disabled", true); //复选框禁用
                        })
                    }
                })
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }
    
    /**
     * 新增/编辑用户管理列表 
     * @param {int} index 标志位0-新增 1-编辑保存
     */
    $scope.saveUserAccount = function(index) {
        if (index == 0) {
            let check_workno;
            let check_name = checkWorkName();
            let check_pasd = checkUserPassword(0);
            let check_func = checkFuncName();
            if ($scope.selectedLoginType.id == '1') {
                check_workno = checkWorkNo();
            } else {
                $scope.workNoContent = $('#user-id')[0].value;
                if ($scope.workNoContent != undefined && $scope.workNoContent != "") {
                    $scope.workNoFlag = 0;
                    check_workno = true;
                } else {
                    $scope.workNoFlag = 2;
                    check_workno = false;
                }

                if ($scope.userAccountList && $scope.userAccountList.length) {
                    if ($scope.userAccountList.findIndex(item => item.user_id == $scope.workNoContent) != -1) {
                        $scope.workNoFlag = 1;
                        check_workno = false;
                    }
                }
            }
            if (!check_workno || !check_pasd || !check_name || !check_func) {
                return;
            }
        } else if (index == 1) {
            if ($scope.userPasswordContent != undefined && $scope.userPasswordContent != "") {
                let check_pasd = checkUserPassword(1);
                if (!check_pasd) {
                    return;
                }
                $scope.userPasswordFlag = 0;
            } else {
                $scope.userPasswordFlag = 2;
                return;
            }
        }

        let saveUserAccountCmd = {
            cmd: "save_account",
            data: {
                "user_id": $scope.workNoContent,
                "user_name": $scope.userNameContent,
                "user_pwd": $scope.userPasswordContent,
                "auth_id": $scope.selectAuthId.auth_id
            }
        };

        dataFactory.actData(saveUserAccountCmd)
            .then(() => {
                getAuthorityFuncData('created');
                $scope.show_user_authority_list = true;
                $scope.show_user_authority_operate = false;
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }

    /**用户工号校验（非空，数值长度10，唯一性）*/
    function checkWorkNo() {
        $scope.workNoContent = $('#user-id')[0].value;
        if ($scope.workNoContent != undefined && $scope.workNoContent != "") {
            let workNolen = $scope.workNoContent.toString().length;

            if (workNolen == 10) {
                let workno_result = -1;
                if ($scope.userAccountList && $scope.userAccountList.length) {
                    workno_result = $scope.userAccountList.findIndex(item => item.user_id == $scope.workNoContent);
                }
                if (workno_result != -1) {
                    $scope.workNoFlag = 1;
                    return false;
                } else {
                    $scope.workNoFlag = 0;
                    return true;
                }
            } else {
                $scope.workNoFlag = 3;
                return false;
            }
        } else {
            $scope.workNoFlag = 2;
            return false;
        }
    }
    
    /**姓名非空校验*/
    function checkWorkName() {
        if ($scope.userNameContent != undefined && $scope.userNameContent != "") {
            $scope.userNameFlag = 0;
            return true;
        } else {
            $scope.userNameFlag = 2;
            return false;
        }
    }
    
    /**
     * 用户密码校验（非空，唯一性）
     * @param {int} index 0-新增时 1-编辑时
     */
    function checkUserPassword(index) {
        if ($scope.userPasswordContent != undefined && $scope.userPasswordContent != "") {
            let pasword_result = -1;
            let value = $scope.userAccountList.filter(item => item.user_id != $scope.workNoContent) // 编辑时，密码校验时排除当前密码的数组
            if ($scope.userAccountList && $scope.userAccountList.length) {
                if (index == 0) {
                    pasword_result = $scope.userAccountList.findIndex(item => item.user_pwd == $scope.userPasswordContent)
                } else {
                    pasword_result = value.findIndex(item => item.user_pwd == $scope.userPasswordContent)
                }
            }
            if (pasword_result != -1) {
                $scope.userPasswordFlag = 1;
                return false;
            } else {
                $scope.userPasswordFlag = 0;
                return true;
            }
        } else {
            $scope.userPasswordFlag = 2;
            return false;
        }
    }

    /**职能非空校验 */
    function checkFuncName() {
        if (!$scope.selectAuthId) {
            $scope.userAuthIdFlag = 1;
            return false;
        } else {
            $scope.userAuthIdFlag = 0;
            return true;
        }
    }

    /**
     * 删除用户列表数据 
     * @param {int} index 标志位 0-单删 1-批量删除
     * @param {string} singleDelId 单删时的用户id
     */
    let deleteUserAuthFlag = 0;
    let deleteMultiUserAuthFlag = 0;
    let receiveID; //记录单独删除的id是否时上次操作的数据
    $scope.deleteUserAccount = function(index,singleDelId) {
        let deleteUserAccountCmd;
        if (index == 0) {
            if (deleteUserAuthFlag == 0) {
                receiveID = singleDelId;
                toastFactory.info(ssDynamicTags.info_messages[29]);
                deleteUserAuthFlag = 1;
                return;
            } else {
                if (receiveID != singleDelId) {
                    receiveID = singleDelId;
                    deleteUserAuthFlag = 1;
                    toastFactory.info(ssDynamicTags.info_messages[29]);
                    return;
                }
                deleteUserAuthFlag = 0;
                receiveID = "";
                deleteUserAccountCmd = {
                    cmd: "delete_accounts",
                    data: {
                        "user_id": singleDelId.split()
                    }
                };
            }
        } else if (index == 1) {
            if ($scope.userAuthArray.length > 0) {
                if (deleteMultiUserAuthFlag == 0) {
                    toastFactory.info(ssDynamicTags.info_messages[29]);
                    deleteMultiUserAuthFlag = 1;
                    return;
                } else {
                    deleteMultiUserAuthFlag = 0;
                    deleteUserAccountCmd = {
                        cmd: "delete_accounts",
                        data: {
                            "user_id": $scope.userAuthArray
                        }
                    };
                }
            } else {
                toastFactory.warning(ssDynamicTags.warning_messages[26]);
                return;
            }
        }
        dataFactory.actData(deleteUserAccountCmd)
            .then(() => {
                getAuthorityFuncData('created');
                userAuthItem.forEach(item => {
                    item.checked = false; //清空勾选状态
                });
                userAuthAll.checked = false;
                $scope.userAuthArray = [];
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }

    /* 插件管理模块 */
    // 控制按钮显示和隐藏
    $scope.ctrlBtnHide = function (enableFlg) {
        if (enableFlg == 1) {
            return true;
        } else {
            return false;
        }
    }

    // 获取插件信息表
    function getPluginsInfo() {
        let getCmd = {
            cmd: "get_plugin_info",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.pluginsInfoList = data;
                $scope.createFRCapsNavList();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[13]);
            });
    }

    // 导入插件包
    $scope.selectFRCap = function () {
        $("#frcapImport").click();
    }
    $scope.importFRCap = function () {
        var formData = new FormData();
        var file = document.getElementById("frcapImport").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                clearImportFile('frcapImport');
                if (typeof(data) != "object") {
                    getPluginsInfo();
                }
            }, (status) => {
                clearImportFile('frcapImport');
                toastFactory.error(status, ssDynamicTags.error_messages[14]);
            });
    };

    // 进入后台管理
    $scope.enterFRCapTools = function () {
        let IP = $scope.webappAddressFlag == 0 ? $scope.eth0IP : $scope.eth1IP;
        window.open(`http://${IP}:3000/frcap-tools/index.html`, "_blank");
    };

    // 启用插件
    $scope.enablePlugin = function (pluginUUID, enableFlg) {
        if (enableFlg == 1) {
            toastFactory.info(ssDynamicTags.info_messages[4]);
        } else if (enableFlg == 0) {
            let enableCmd = {
                cmd: "plugin_enable",
                data: {
                    uuid: pluginUUID,
                    value: 1 ^ enableFlg
                }
            };
            dataFactory.actData(enableCmd)
                .then(() => {
                    getPluginsInfo();
                }, (status) => {
                    toastFactory.error(status, ssDynamicTags.error_messages[15]);
                })
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[4]);
        }
    };

    // 停用插件
    $scope.disablePlugin = function (pluginUUID, enableFlg) {
        if (enableFlg == 0) {
            toastFactory.info(ssDynamicTags.info_messages[5]);
        } else if (enableFlg == 1) {
            let disableCmd = {
                cmd: "plugin_enable",
                data: {
                    uuid: pluginUUID,
                    value: 1 ^ enableFlg
                }
            };
            dataFactory.actData(disableCmd)
                .then(() => {
                    getPluginsInfo();
                }, (status) => {
                    toastFactory.error(status, ssDynamicTags.error_messages[17]);
                })
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[5]);
        }
    };

    $scope.openDeletePluginModal = function (pluginName, pluginUUID) {
        $scope.deletePluginName = pluginName;
        $scope.deletePluginUUID = pluginUUID;
        $('#deletePluginModal').modal();
    }

    // 删除插件
    $scope.deletePlugin = function (pluginUUID) {
        let deleteCmd = {
            cmd: "plugin_remove",
            data: {
                uuid: pluginUUID
            }
        };
        dataFactory.actData(deleteCmd)
            .then(() => {
                getPluginsInfo();
                $('#deletePluginModal').modal('hide');
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[19]);
                $('#deletePluginModal').modal('hide');
            })
    };

    // 设置同步系统时间
    $scope.setSysDate = function () {
        if ($scope.isSetLock) {
            toastFactory.warning(ssDynamicTags.warning_messages[36]);
            return;
        }
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var hour = myDate.getHours();
        var minute = myDate.getMinutes();
        var second = myDate.getSeconds();
        if (g_systemFlag) {
            // Linux时间格式
            if (month < 10) {
                if (day < 10) {
                    var sendDate = "\"" + year + "-0" + month + "-0" + day + "\"";
                } else {
                    var sendDate = "\"" + year + "-0" + month + "-" + day + "\"";
                }
            } else {
                if (day < 10) {
                    var sendDate = "\"" + year + "-" + month + "-0" + day + "\"";
                } else {
                    var sendDate = "\"" + year + "-" + month + "-" + day + "\"";
                }
            }
            if (hour < 10) {
                if (minute < 10) {
                    if (second < 10) {
                        var SendTime = "\"0" + hour + ":0" + minute + ":0" + second + "\"";
                    } else {
                        var SendTime = "\"0" + hour + ":0" + minute + ":" + second + "\"";
                    }
                } else {
                    if (second < 10) {
                        var SendTime = "\"0" + hour + ":" + minute + ":0" + second + "\"";
                    } else {
                        var SendTime = "\"0" + hour + ":" + minute + ":" + second + "\"";
                    }
                }
            } else {
                if (minute < 10) {
                    if (second < 10) {
                        var SendTime = "\"" + hour + ":0" + minute + ":0" + second + "\"";
                    } else {
                        var SendTime = "\"" + hour + ":0" + minute + ":" + second + "\"";
                    }
                } else {
                    if (second < 10) {
                        var SendTime = "\"" + hour + ":" + minute + ":0" + second + "\"";
                    } else {
                        var SendTime = "\"" + hour + ":" + minute + ":" + second + "\"";
                    }
                }
            }
        } else {
            // QNX时间格式
            var sendDate = "\"" + day + " " + month + " " + year + "\"";
            if (hour < 10) {
                if (minute < 10) {
                    var SendTime = "\"" + "0" + hour + "0" + minute + "\"";
                } else {
                    var SendTime = "\"" + "0" + hour + minute + "\"";
                }
            } else {
                if (minute < 10) {
                    var SendTime = "\"" + hour + "0" + minute + "\"";
                } else {
                    var SendTime = "\"" + hour + minute + "\"";
                }
            }
        }
        let setSysDateCmd = {
            cmd: 343,
            data: {
                content: "SetQNXSystemTime(" + sendDate + "," + SendTime + ")",
            },
        };
        dataFactory.setData(setSysDateCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    $().ready(() => {
        $('[data-mask]').inputmask();
    });

    /* 依据系统标志位判断修改网卡默认网关时是否需要联动修改 */
    $scope.changeGatewayBySystemFlag = function (ethType) {
        // if (!g_systemFlag) {
            // 只能设置一个默认网关，默认以网卡1配置的网关进行设置
            if (ethType) {
                $scope.eth0DefaultGateway = $scope.eth1DefaultGateway;
            } else {
                $scope.eth1DefaultGateway = $scope.eth0DefaultGateway;
            }
        // }
    }

    /* 依据系统标志位判断修改网卡DNS时是否需要联动修改 */
    $scope.changeDNSBySystemFlag = function (ethType) {
        // if (!g_systemFlag) {
            // 只能设置一个DNS，默认以网卡1配置的DNS进行设置
            if (ethType) {
                $scope.eth0DNSServer = $scope.eth1DNSServer;
            } else {
                $scope.eth1DNSServer = $scope.eth0DNSServer;
            }
        // }
    }

    /* 设置示教器启用/关闭功能（滑动按钮） */
    $scope.setTeachPendantEnableState = function(){
        let cmdContent = {
            cmd: "modify_PI_cfg",
            data: {
                enable: 1^g_teachPendantEnableFlg
            },
        };
        dataFactory.actData(cmdContent)
            .then(() => {
                getTeachDevice();
            }, (status) => {
                toastFactory.error(status); 
            });
    }

    /* 获取IP */
    function getIP() {
        let cmdContent = {
            cmd: "get_network"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.eth0IP = data.eth0.ip;
                $scope.eth0SubnetMask = data.eth0.netmask;
                $scope.eth0DefaultGateway = data.eth0.gateway;
                $scope.eth0DNSServer = data.eth0.dns;
                $scope.eth1IP = data.eth1.ip;
                $scope.eth1SubnetMask = data.eth1.netmask;
                $scope.eth1DefaultGateway = data.eth1.gateway;
                $scope.eth1DNSServer = data.eth1.dns;
                $scope.teachPendantIP = data.ip.teachpendant;
                $scope.webappAddressFlag = data.ip.webappflag;
                $scope.webrecoveryAddressFlag = data.ip.webrecoveryflag;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 网络设置 */
    $scope.setControlBoxNetwork = function (eth0IP, 
        eth0SubnetMask, 
        eth0DefaultGateway, 
        eth0DNSServer, 
        eth1IP, 
        eth1SubnetMask, 
        eth1DefaultGateway, 
        eth1DNSServer, 
        teachPendantIP, 
        webappAddressFlag, 
        webrecoveryAddressFlag) {
        if (eth0IP == "" || eth0IP == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[6]);
            return;
        } else if (eth1IP == "" || eth1IP == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[21]);
            return;
        } else if ((teachPendantIP == "" || teachPendantIP == undefined) && g_teachPendantEnableFlg) {
            toastFactory.warning(ssDynamicTags.warning_messages[7]);
            return;
        } else if (eth0SubnetMask == "" || eth0SubnetMask == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[8]);
            return;
        } else if (eth0DefaultGateway == "" || eth0DefaultGateway == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[9]);
            return;
        } else if (eth0DNSServer == "" || eth0DNSServer == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[10]);
            return;
        } else if (eth1SubnetMask == "" || eth1SubnetMask == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[8]);
            return;
        } else if (eth1DefaultGateway == "" || eth1DefaultGateway == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[9]);
            return;
        } else if (eth1DNSServer == "" || eth1DNSServer == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[10]);
            return;
        } else if (webappAddressFlag == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[22]);
            return;
        } else if (webrecoveryAddressFlag == undefined) {
            toastFactory.warning(ssDynamicTags.warning_messages[23]);
            return;
        }
        let eth0IPArr = eth0IP.split('.');
        let eth1IPArr = eth1IP.split('.');
        let eth0SubnetMaskArr = eth0SubnetMask.split('.');
        let eth0DefaultGatewayArr = eth0DefaultGateway.split('.');
        let eth0DNSServerArr = eth0DNSServer.split('.');
        let eth1SubnetMaskArr = eth1SubnetMask.split('.');
        let eth1DefaultGatewayArr = eth1DefaultGateway.split('.');
        let eth1DNSServerArr = eth1DNSServer.split('.');
        let teachPendantIPArr;
        let isTeachPendantIp;
        if (teachPendantIP) {
            teachPendantIPArr = teachPendantIP.split('.');
            isTeachPendantIp = eth0IPArr.length == 4
            && eth1IPArr.length == 4
            && teachPendantIPArr.length == 4
            && parseInt(eth0IPArr[0]) >= 0 && parseInt(eth0IPArr[0]) <= 255
            && parseInt(eth1IPArr[0]) >= 0 && parseInt(eth1IPArr[0]) <= 255
            && parseInt(teachPendantIPArr[0]) >= 0 && parseInt(teachPendantIPArr[0]) <= 255
            && parseInt(eth0IPArr[1]) >= 0 && parseInt(eth0IPArr[1]) <= 255
            && parseInt(eth1IPArr[1]) >= 0 && parseInt(eth1IPArr[1]) <= 255
            && parseInt(teachPendantIPArr[1]) >= 0 && parseInt(teachPendantIPArr[1]) <= 255
            && parseInt(eth0IPArr[2]) >= 0 && parseInt(eth0IPArr[2]) <= 255
            && parseInt(eth1IPArr[2]) >= 0 && parseInt(eth1IPArr[2]) <= 255
            && parseInt(teachPendantIPArr[2]) >= 0 && parseInt(teachPendantIPArr[2]) <= 255
            && parseInt(eth0IPArr[3]) >= 0 && parseInt(eth0IPArr[3]) <= 255
            && parseInt(eth1IPArr[3]) >= 0 && parseInt(eth1IPArr[3]) <= 255
            && parseInt(teachPendantIPArr[3]) >= 0 && parseInt(teachPendantIPArr[3]) <= 255
        }
            let isNotTeachPendantIp = eth0IPArr.length == 4
                                    && eth1IPArr.length == 4
                                    && parseInt(eth0IPArr[0]) >= 0 && parseInt(eth0IPArr[0]) <= 255
                                    && parseInt(eth1IPArr[0]) >= 0 && parseInt(eth1IPArr[0]) <= 255
                                    && parseInt(eth0IPArr[1]) >= 0 && parseInt(eth0IPArr[1]) <= 255
                                    && parseInt(eth1IPArr[1]) >= 0 && parseInt(eth1IPArr[1]) <= 255
                                    && parseInt(eth0IPArr[2]) >= 0 && parseInt(eth0IPArr[2]) <= 255
                                    && parseInt(eth1IPArr[2]) >= 0 && parseInt(eth1IPArr[2]) <= 255
                                    && parseInt(eth0IPArr[3]) >= 0 && parseInt(eth0IPArr[3]) <= 255
                                    && parseInt(eth1IPArr[3]) >= 0 && parseInt(eth1IPArr[3]) <= 255
        if (isTeachPendantIp || isNotTeachPendantIp) {
            if (eth0SubnetMaskArr.length == 4
                && eth0DefaultGatewayArr.length == 4
                && eth0DNSServerArr.length == 4
                && eth1SubnetMaskArr.length == 4
                && eth1DefaultGatewayArr.length == 4
                && eth1DNSServerArr.length == 4
                && parseInt(eth0SubnetMaskArr[0]) >= 0 && parseInt(eth0SubnetMaskArr[0]) <= 255
                && parseInt(eth0DefaultGatewayArr[0]) >= 0 && parseInt(eth0DefaultGatewayArr[0]) <= 255
                && parseInt(eth0DNSServerArr[0]) >= 0 && parseInt(eth0DNSServerArr[0]) <= 255
                && parseInt(eth0SubnetMaskArr[1]) >= 0 && parseInt(eth0SubnetMaskArr[1]) <= 255
                && parseInt(eth0DefaultGatewayArr[1]) >= 0 && parseInt(eth0DefaultGatewayArr[1]) <= 255
                && parseInt(eth0DNSServerArr[1]) >= 0 && parseInt(eth0DNSServerArr[1]) <= 255
                && parseInt(eth0SubnetMaskArr[2]) >= 0 && parseInt(eth0SubnetMaskArr[2]) <= 255
                && parseInt(eth0DefaultGatewayArr[2]) >= 0 && parseInt(eth0DefaultGatewayArr[2]) <= 255
                && parseInt(eth0DNSServerArr[2]) >= 0 && parseInt(eth0DNSServerArr[2]) <= 255
                && parseInt(eth0SubnetMaskArr[3]) >= 0 && parseInt(eth0SubnetMaskArr[3]) <= 255
                && parseInt(eth0DefaultGatewayArr[3]) >= 0 && parseInt(eth0DefaultGatewayArr[3]) <= 255
                && parseInt(eth0DNSServerArr[3]) >= 0 && parseInt(eth0DNSServerArr[3]) <= 255
                && parseInt(eth1SubnetMaskArr[0]) >= 0 && parseInt(eth1SubnetMaskArr[0]) <= 255
                && parseInt(eth1DefaultGatewayArr[0]) >= 0 && parseInt(eth1DefaultGatewayArr[0]) <= 255
                && parseInt(eth1DNSServerArr[0]) >= 0 && parseInt(eth1DNSServerArr[0]) <= 255
                && parseInt(eth1SubnetMaskArr[1]) >= 0 && parseInt(eth1SubnetMaskArr[1]) <= 255
                && parseInt(eth1DefaultGatewayArr[1]) >= 0 && parseInt(eth1DefaultGatewayArr[1]) <= 255
                && parseInt(eth1DNSServerArr[1]) >= 0 && parseInt(eth1DNSServerArr[1]) <= 255
                && parseInt(eth1SubnetMaskArr[2]) >= 0 && parseInt(eth1SubnetMaskArr[2]) <= 255
                && parseInt(eth1DefaultGatewayArr[2]) >= 0 && parseInt(eth1DefaultGatewayArr[2]) <= 255
                && parseInt(eth1DNSServerArr[2]) >= 0 && parseInt(eth1DNSServerArr[2]) <= 255
                && parseInt(eth1SubnetMaskArr[3]) >= 0 && parseInt(eth1SubnetMaskArr[3]) <= 255
                && parseInt(eth1DefaultGatewayArr[3]) >= 0 && parseInt(eth1DefaultGatewayArr[3]) <= 255
                && parseInt(eth1DNSServerArr[3]) >= 0 && parseInt(eth1DNSServerArr[3]) <= 255
            ) {
                    // 判断网卡0和网卡1是否在同一网段
                    if (!(eth0IPArr[0] == eth1IPArr[0] 
                        && eth0IPArr[1] == eth1IPArr[1] 
                        && eth0IPArr[2] == eth1IPArr[2]) 
                    ) {
                        let webappIPArr = [];
                        // 判断当前选择的WebAPP访问IP
                        if (Number(webappAddressFlag)) {
                            webappIPArr = eth1IPArr;
                        } else {
                            webappIPArr = eth0IPArr;
                        }
                        // 依据是否启用示教器判断是否需要示教器IP验证
                        if (g_teachPendantEnableFlg) {
                            // 示教器IP验证：判断WebAPP访问IP与示教器IP是否在同一网段下
                            if (webappIPArr[0] == teachPendantIPArr[0] 
                                && webappIPArr[1] == teachPendantIPArr[1] 
                                && webappIPArr[2] == teachPendantIPArr[2] 
                                && webappIPArr[3] != teachPendantIPArr[3] 
                            ) {
                                setNetwork();
                            } else {
                                toastFactory.warning(ssDynamicTags.warning_messages[11]);
                            }
                        } {
                            // 示教器关闭状态不进行示教器IP验证，直接设置网络
                            setNetwork();
                        }
                    } else {
                        toastFactory.warning(ssDynamicTags.warning_messages[24]);
                    }
            } else {
                toastFactory.warning(ssDynamicTags.warning_messages[12]);
            }
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[13]);
        }
        
        /**
         * 设置网络接口
         */
        function setNetwork() {
            //网卡0子网掩码--校验
            let checkMask0Valid = validateMask(eth0SubnetMask, eth0IPArr[0]);
            if (!checkMask0Valid) return;
            //网卡1子网掩码--校验
            let checkMask1Valid = validateMask(eth1SubnetMask, eth1IPArr[0]);
            if (!checkMask1Valid) return;
            
            $scope.setIPTips = ssDynamicTags.info_messages[6];
            let cmdContent = {
                cmd: "modify_network",
                data: {
                    "ip": {
                        webappflag: Number(webappAddressFlag),
                        webrecoveryflag: Number(webrecoveryAddressFlag),
                        teachpendant: teachPendantIP
                    },
                    "eth0": {
                        ip: eth0IP,
                        netmask: eth0SubnetMask,
                        gateway: eth0DefaultGateway,
                        dns: eth0DNSServer
                    },
                    "eth1": {
                        ip: eth1IP,
                        netmask: eth1SubnetMask,
                        gateway: eth1DefaultGateway,
                        dns: eth1DNSServer
                    }
                },
            };
            dataFactory.actData(cmdContent)
                .then(() => {
                    getIP();
                    showPageRestart(ssDynamicTags.info_messages[7]);
                }, (status) => {
                    $scope.setIPTips = "";
                    toastFactory.error(status);
                });
        }

        // 设置网络时子网掩码-复核校验
        function validateMask(maskStr, ethIPIndex) {
            if (maskStr) {
                var IPArray = maskStr.split(".");
                var ip1 = parseInt(IPArray[0]);
                var ip2 = parseInt(IPArray[1]);
                var ip3 = parseInt(IPArray[2]);
                var ip4 = parseInt(IPArray[3]);
    
                if ((ip1 < 0 || ip1 > 255) || (ip2 < 0 || ip2 > 255) || (ip3 < 0 || ip3 > 255) || (ip4 < 0 || ip4 > 255)) {
                    return false;
                }
                var ip_binary = _checkIput_fomartIP(ip1) + _checkIput_fomartIP(ip2) + _checkIput_fomartIP(ip3) + _checkIput_fomartIP(ip4);
    
                //不合法子网掩码情况（01），合法情况为二进制前面都是1，后面都是0
                if (ip_binary.indexOf("01") == -1) { 
                    if ( (ethIPIndex >= 1) && (ethIPIndex <= 127)) {
                        //A类验证
                        if ((ip1 == ip2) ||  (ip1 == ip3)) {
                            toastFactory.warning(ssDynamicTags.warning_messages[12]);
                            return false;
                        } else {
                            return true;
                        }
                    } else if ((ethIPIndex >= 128) && (ethIPIndex <= 191)) {
                        //B类验证
                        if ((ip1 != ip2) ||  (ip1 == ip3)) {
                            toastFactory.warning(ssDynamicTags.warning_messages[12]);
                            return false;
                        } else {
                            return true;
                        }
                    } else if ((ethIPIndex >= 192) && (ethIPIndex <= 223)) {
                        //C类验证
                        if ((ip1 != ip2) ||  (ip1 != ip3)) {
                            toastFactory.warning(ssDynamicTags.warning_messages[12]);
                            return false;
                        } else {
                            return true;
                        }
                    }
                } else {
                    toastFactory.warning(ssDynamicTags.warning_messages[12]);
                }
            }
        }

        function _checkIput_fomartIP(ip) {
            return (ip + 256).toString(2).substring(1); //格式化输出(补零) 
        }
    }

    /**实时检验子网掩码类型并自动填写 */
    $scope.autoCheckMask = function(checkSubIP, checkSubNetMaskFlag) {
        let autoArray = checkSubIP.split(".");
        let ip1 = parseInt(autoArray[0]);

        if ($scope.eth0IP || $scope.eth1IP) {
            if ( (ip1 >= 1) && (ip1 <= 127)) {
                if (checkSubNetMaskFlag == 0) {
                    $scope.eth0SubnetMask = "255.0.0.0"
                } else {
                    $scope.eth1SubnetMask = "255.0.0.0"
                }
            } else if ((ip1 >= 128) && (ip1 <= 191)) {
                if (checkSubNetMaskFlag == 0) {
                    $scope.eth0SubnetMask = "255.255.0.0"
                } else {
                    $scope.eth1SubnetMask = "255.255.0.0"
                }
            } else if ((ip1 >= 192) && (ip1 <= 223)) {
                if (checkSubNetMaskFlag == 0) {
                    $scope.eth0SubnetMask = "255.255.255.0"
                } else {
                    $scope.eth1SubnetMask = "255.255.255.0"
                }
            }
        } else {
            if (checkSubNetMaskFlag == 0) {
                $scope.eth0SubnetMask = ""
            } else {
                $scope.eth1SubnetMask = ""
            }
        }
    }

    /* 获取示教器启用状态参数 */
    function getTeachDevice() {
        let cmdContent = {
            cmd: "get_PI_cfg"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                if (data.enable == 1) {
                    $scope.show_TeachIP = true;
                    $scope.webappAddressFlag = 1;
                    g_teachPendantEnableFlg = 1;
                    $("#teachDeviceSwitch").prop("checked", true);
                } else {
                    $scope.show_TeachIP = false;
                    g_teachPendantEnableFlg = 0;
                    $("#teachDeviceSwitch").prop("checked", false);
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 示教器屏幕校准功能
    $scope.alignTouchScreen = function () {
        if (!g_teachPendantEnableFlg) {
            toastFactory.info(ssDynamicTags.info_messages[8]);
        } else {
            let cmdContent = {
                cmd: "screen_calibration",
                data: {}
            };
            dataFactory.actData(cmdContent)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 外设工控机配置 */
    /** 获取外设工控机配置参数 */
    function getIndustrialComputerConfig() {
        let cmdContent = {
            cmd: "get_industrial_computer_config",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.industrialComputerEnable = data.enable;
                $scope.industrialComputerIP = data.ip;
                if (data.enable == "1") {
                    $scope.show_industrialComputerIPConfig = true;
                } else {
                    $scope.show_industrialComputerIPConfig = false;
                }
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[49]);
            });
    }
    
    /**
     * 设置外设工控机配置
     * @param {string} IP 外设工控机IP
     */
    $scope.setIndustrialComputerConfig = function (IP) {
        let IPArr = IP.split('.');
        let isCurrentIP = IPArr.length == "4"
                            && parseInt(IPArr[0]) >= 0 && parseInt(IPArr[0]) <= 255
                            && parseInt(IPArr[1]) >= 0 && parseInt(IPArr[1]) <= 255
                            && parseInt(IPArr[2]) >= 0 && parseInt(IPArr[2]) <= 255
                            && parseInt(IPArr[3]) >= 0 && parseInt(IPArr[3]) <= 255
        if (isCurrentIP) {
            let cmdContent = {
                cmd: "set_industrial_computer_config",
                data: {
                    enable: $scope.industrialComputerEnable,
                    ip: IP
                }
            };
            dataFactory.actData(cmdContent)
                .then(() => {
                    getIndustrialComputerConfig();
                    $scope.ipc_setip_success_tip = ssDynamicTags.warning_messages[30];
                }, (status) => {
                    toastFactory.error(status, ssDynamicTags.error_messages[48]);
                });
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[29]);
        }
    }
    /* ./外设工控机配置 */

    /**用户信息自定义 */
    //密码输入
    $scope.ComfirmSetUserPassword = function () {
        if (document.getElementById("setUserCfgPassword").value === "" || document.getElementById("setUserCfgPassword").value === undefined) {
            toastFactory.info(ssDynamicTags.info_messages[9]);
            return;
        }
        var sysPassword = document.getElementById("setUserCfgPassword").value;
        let saveCmd = {
            cmd: "odm_password",
            data: {
                password: sysPassword + "",
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                $scope.show_password = false;
                $scope.show_setUserinfocfg = true;
                getRobotLock();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[20]);
                /* test */
                if (g_testCode) {
                    $scope.show_password = false;
                    $scope.show_setUserinfocfg = true;
                }
                /* ./test */
            });
        document.getElementById("setUserCfgPassword").value = "";
    }

    //导入信息包
    $scope.importUserInfo = function () {
        var formData = new FormData();
        var file = document.getElementById("sysUserInfocfgImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        } else if ("odm.tar.gz" != file.name) {
            toastFactory.warning(ssDynamicTags.warning_messages[15]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    }

    /**
     * 设置登录页面类型
     * @param {object} type 登录页面类型对象
     */
    $scope.setLoginType = function (type) {
        if (type == undefined) {
            return;
        }
        let setLoginTypeCmd = {
            cmd: "set_login_type",
            data: {
                type: type.id
            }
        }
        dataFactory.actData(setLoginTypeCmd)
            .then(() => {
            }), (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[45]);
            }
    }

    /* 获取登录页面类型配置 */
    function getLoginType() {
        let getLoginTypeCmd = {
            cmd: "get_login_type"
        }
        dataFactory.getData(getLoginTypeCmd)
            .then((data) => {
                $scope.selectedLoginType = $scope.loginTypeDict[parseInt(data.type)];
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[46]);
            })
    }


    //设置机器人型号
    $scope.importsysRobotType = function () {
        if (document.getElementById("sysRobotType").value === "" || document.getElementById("sysRobotType").value === undefined) {
            toastFactory.info(ssDynamicTags.info_messages[10]);
            return;
        }
        var sysRobotType = document.getElementById("sysRobotType").value;
        let saveCmd = {
            cmd: "set_ODM_cfg",
            data: {
                "robot_model": sysRobotType + ""
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                getRobotType();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[22]);
            });
        document.getElementById("sysRobotType").value = "";
    }

    /**导入内部程序文件 */
    $scope.importInternalProgramFile = function () {
        var formData = new FormData();
        var file = document.getElementById("internalProgramFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if (file.name.indexOf(".tar.gz") == -1 || file.name.substring(0, 17) != 'internal_program_') {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    getInternalProgramList();
                }
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };
    
    /**获取内部程序文件列表 */
    function getInternalProgramList() {
        let getInternalProgramListCmd = {
            cmd: "get_internal_program_list",
        }
        dataFactory.getData(getInternalProgramListCmd)
            .then((data) => {
                $scope.internalProgramList = data;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 删除内部程序文件名称
     * @param {string} name 内部程序名称
     */
    $scope.removeInternalProgramFileName = function(name) {
        if (!name) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        let removeInternalProgramFileNameCmd = {
            cmd: "remove_internal_program_file",
            data: {
                name: name
            }
        }
        dataFactory.actData(removeInternalProgramFileNameCmd)
            .then(() => {
                getInternalProgramList();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }

    /**
     * 生成内部程序文件
     * @param {string} name 内部程序名称
     */
    $scope.applyInternalProgram = function(name) {
        if (!name) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        let applyInternalProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: name
            }
        }
        dataFactory.actData(applyInternalProgramCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }  

    /** 
     * 获取参数范围配置 -- 初始化时默认显示管理员上次设定的数值
     * @param {string} type authorityID类型
    */
    let robotParamsRangeArray = {}
    function getRobotParamsRange(type) {
        let getRobotParamsRangeCmd = {
            cmd: "get_robot_params_range",
            data: {
                auth_id: type
            },
        };
        dataFactory.getData(getRobotParamsRangeCmd)
            .then((data) => {
                if (!$.isEmptyObject(data)) {
                    robotParamsRangeArray = data;
                    $scope.setSafeScopeData.forEach(item => {
                        //初始时显示之前设定的参数范围
                        $(`#paramInputMin${item.key}`).val(robotParamsRangeArray[item.key][0]);
                        $(`#paramInputMax${item.key}`).val(robotParamsRangeArray[item.key][1]);
                        $(`#paramRangeMin${item.key}`).val(robotParamsRangeArray[item.key][0]);
                        $(`#paramRangeMax${item.key}`).val(robotParamsRangeArray[item.key][1]);
                    })
                } else {
                    getRobotParamsRange('0');
                }
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[57]);
            });
        }

    /**初始化超级管理员设定的参数范围 */
    let initParamsRangeArray = {}
    function initRobotParamsRange() {
        let getRobotParamsRangeCmd = {
            cmd: "get_robot_params_range",
            data: {
                auth_id: '0'
            },
        };
        dataFactory.getData(getRobotParamsRangeCmd)
        .then((data) => {
            if (!$.isEmptyObject(data)) {
                initParamsRangeArray = data;
                $scope.setSafeScopeData.forEach(item => {
                    item.min = initParamsRangeArray[item.key][0];
                    item.max = initParamsRangeArray[item.key][1];
                })
            }
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[57]);
        });
    }

    /**
     * 安全范围设定
     * @param {string} min 安全范围设定最小值
     * @param {string} max 安全范围设定最大值
     * @param {string} item 安全范围设定参数的序号id, key
     */
    let updateRobotParamData; //更新后的数据
    let param_status; //设定参数的状态 0-错误 1-正确
    $scope.judgeScopeLimit = function(min, max, item) {
        if (min && max) {
            $scope.setSafeScopeData[item.id].value[0] = Number(min);
            $scope.setSafeScopeData[item.id].value[1] = Number(max);
        } else if (min && !max) {
            //未修改的值保持上次设定的值
            $scope.setSafeScopeData[item.id].value[0] = Number(min);
            $scope.setSafeScopeData[item.id].value[1] = Number(robotParamsRangeArray[item.key][1]);
        } else if (!min && max) {
            $scope.setSafeScopeData[item.id].value[0] = Number(robotParamsRangeArray[item.key][0]);
            $scope.setSafeScopeData[item.id].value[1] = Number(max);
        }

        //设定最小值大于等于设定最大值时提示
        if ($scope.setSafeScopeData[item.id].value[0] >= $scope.setSafeScopeData[item.id].value[1]) {
            toastFactory.warning(ssDynamicTags.warning_messages[27]);
            param_status = 0;
        } else {
            param_status = 1;
            updateRobotParamData = $scope.setSafeScopeData;
        }
    }

    /** 设置参数范围配置*/
    $scope.setRobotParamsRange = function() {
        let paramArray = {}; //参数范围数据的集合
        if (updateRobotParamData && param_status == 1) {
            $scope.setSafeScopeData.forEach(item => {
                paramArray[item.key] = [Number(item.value[0]), Number(item.value[1])];
            })
        } else if (param_status == 0) {
            toastFactory.warning(ssDynamicTags.warning_messages[27]);
            return;
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[28]);
            return;
        }

        let setRobotParamsRangeCmd = {
                cmd: "set_robot_params_range",
                data: {
                    auth_id: $scope.authorityID,
                    params_range: paramArray
                }
        };
        dataFactory.actData(setRobotParamsRangeCmd)
            .then(() => {
                getRobotParamsRange($scope.authorityID);
                initRobotParamsRange();
                setTimeout(() => {
                    location = './login.html'; 
                }, 3000);
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[44]);
            });
    }

    /** web界面锁屏信息获取 */
    function getRobotLock() {
        let getRobotLockCmd = {
            cmd: "get_lock_cfg"
        };
        dataFactory.getData(getRobotLockCmd).then((data) => {
            if (data.day == -1) {
                $scope.lockFlag = 0;
                $scope.isSetLock = false;
                $scope.lockDate = new Date($scope.qnxSysTime);
            } else if (data.day == 0) {
                $scope.logout();
            } else if (data.day > 0) {
                $scope.lockFlag = 1;
                $scope.isSetLock = true;
                $scope.lockDate = new Date(data.date);
            }
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[63]);
        });
    }

    /** web界面锁屏设置 */
    $scope.setRobotLock = function() {
        const sysTime = getFormatDate($scope.qnxSysTime, '-');
        const lockTime = getFormatDate($scope.lockDate, '-');
        if (document.getElementById('lockDate').value == '' || document.getElementById('lockDate').value == undefined || document.getElementById('lockDate').value == null) {
            toastFactory.info(ssDynamicTags.info_messages[55]);
            return;
        }
        if ($scope.isSetLock) {
            toastFactory.warning(ssDynamicTags.warning_messages[33]);
            return;
        }
        if (new Date(sysTime).getTime() >= new Date(lockTime).getTime() && $scope.lockFlag == 1) {
            toastFactory.warning(ssDynamicTags.warning_messages[34]);
            return;
        }
        let setRobotLockCmd = {
            cmd: "set_lock_cfg",
            data: {
                date: lockTime
            }
        };
        dataFactory.actData(setRobotLockCmd).then(() => {
            getRobotLock();
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[64]);
        });
    }

    /** 机器人型号出厂配置 */
    //密码输入
    $scope.ComfirmSetRobotTypePassword = function () {
        if (document.getElementById("setRobotTypeCfgPassword").value === "" || document.getElementById("setRobotTypeCfgPassword").value === undefined) {
            toastFactory.info(ssDynamicTags.info_messages[9]);
            return;
        }
        var roboTypePassword = document.getElementById("setRobotTypeCfgPassword").value;
        let saveCmd = {
            cmd: "robottype_password",
            data: {
                password: roboTypePassword + "",
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                $scope.show_robot_type_password = false;
                $scope.show_setRobotTypecfg = true;
                getEStopCtrlBoxDOMode();
                $scope.followPrompts();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[20]);
                /* test */
                if (g_testCode) {
                    $scope.show_robot_type_password = false;
                    $scope.show_setRobotTypecfg = true;
                    getEStopCtrlBoxDOMode();
                    $scope.followPrompts();
                }
                /* ./test */
            });
        document.getElementById("setRobotTypeCfgPassword").value = "";
    }

    //去使能
    $scope.sys_enableRobot = function () {
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
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置机器人型号数据 */
    $scope.sys_setRobotType = function () {
        if (g_robotEnableFlg != 1) {
            toastFactory.info(ssDynamicTags.info_messages[11]);
        } else if ($scope.sys_pwdForRTS == undefined || $scope.sys_pwdForRTS == "") {
            toastFactory.info(ssDynamicTags.info_messages[12]);
        } else if ($scope.selectedRobotType == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[13]);
        } else if ($scope.selectedMajorVer == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[14]);
        } else if ($scope.selectedMinorVer == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[15]);
        } else {
            let cmdContent = {
                cmd: 425,
                data: {
                    pwd: $scope.sys_pwdForRTS,
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
                        sys_saveRobotType();
                        setRobotStiffness();
                    } else if (data == "pwd_error") {
                        toastFactory.error(403, ssDynamicTags.error_messages[20]);
                    }
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    // 设置机器人刚度
    function setRobotStiffness() {
        let stiffnessCmd = {
            cmd: 822,
            data: {
                content: "SetJointStiffnessType(" + $scope.selectedStiffness.id + ")"
            }
        };
        dataFactory.setData(stiffnessCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /* 保存机器人型号数据至WebAPP后台 */
    function sys_saveRobotType() {
        $scope.show_sys_ConfiguringInfo = true;
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
                $scope.show_sys_ConfiguringInfo = false;
                showPageRestart(ssDynamicTags.warning_messages[16]);
            }, (status) => {
                $scope.show_sys_ConfiguringInfo = false;
                toastFactory.error(status);
            });
    }

    /** 机器人激活时间获取 */
    function getRobotActivateTime() {
        let getCmd = {
            cmd: "get_activation_time"
        };
        dataFactory.getData(getCmd).then((data) => {
            $scope.robotActivationDate = data.activation_time;
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[67]);
        });
    }
    
    /** SN码获取 */
    function getCtrlBoxSN() {
        let getCtrlBoxSNCmd = {
            cmd: "get_SN"
        };
        dataFactory.getData(getCtrlBoxSNCmd).then((data) => {
            $scope.ctrlBoxSN = data.CTLBox_SN;
            $scope.isSetCtrlBoxSN = $scope.ctrlBoxSN != '';
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[65]);
        });
    }

    /** SN码设置 */
    $scope.setCtrlBoxSN = function() {
        if ($scope.ctrlBoxSN == undefined || $scope.ctrlBoxSN == null || $scope.ctrlBoxSN == '') {
            toastFactory.info(ssDynamicTags.error_messages[52]);
        } else if ($scope.isSetCtrlBoxSN) {
            toastFactory.warning(ssDynamicTags.warning_messages[35]);
        } else {
            let setCtrlBoxSNCmd = {
                cmd: "set_SN",
                data: {
                    CTLBox_SN: $scope.ctrlBoxSN
                }
            };
            dataFactory.actData(setCtrlBoxSNCmd).then(() => {
                getCtrlBoxSN();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[66]);
            });
        }
    }

    // 获取示教程序数据
    function getTeachProgramEncryptData() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.teachEncryptList = JSON.parse(JSON.stringify(data));
                $scope.tmpTeachEncryptList = JSON.parse(JSON.stringify(data));
                if (document.getElementById("teachProNameFind").value) {
                    $scope.searchTeachProgramName()
                }
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[34]);
            });
    }

    /**
     * 设置按钮盒手自动切换组合键密码
     * @param {int} enable 组合键使能 0-关 1-开
     * @param {int} btnnum 组合键数量 2~10
     * @param {array} btns 组合键列表
     * @param {int} timeout 超时时间
     */
    let btnModeArr = [];
    $scope.setButtonBoxToggle = function(enable,btnnum,btns,timeout) {
        if (!timeout) {
            toastFactory.info(ssDynamicTags.info_messages[50]);
            return;
        }
        btnModeArr = JSON.parse(JSON.stringify(btns));
        btnModeArr.push(1); //组合键最后一位默认为1-手自动按钮键

        let setCmd = {
            cmd: 911,
            data: {
                content: "SetBtnBoxRobotModeChangePassward(" + enable + ',' + btnnum + ',{' + btnModeArr + '},' + timeout + ")"
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 设置机器人末端拖动按钮控制状态
     * @param {int} strategy 拖动启停方式：0-长按式；1-触发式
     * @param {int} overtime 进入/退出拖动状态超时时间s (1-10)
     * @param {array} btntime 进入/退出拖动状态按下末端按钮次数(1-10)
     * @param {int} state 超时未拖动自动退出拖动状态时间s (1-600)
     */
    $scope.setEndDragBtnConfig = function(strategy,overtime,btntime,state) {
        if ((!overtime || !btntime || !state) && strategy == 1) {
            toastFactory.info(ssDynamicTags.info_messages[58]);
            return;
        }

        let setCmd = {
            cmd: 988,
            data: {
                content: "SetEndDragBtnConfig(" + strategy + ',' +(overtime || 0) + ',' + (btntime || 0) + ',' + (state || 0) + ")"
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**获取机器人末端拖动按钮控制状态 */
    function getEndDragBtnConfig() {
        let getCmd = {
            cmd: 989,
            data: {
                content: "GetEndDragBtnConfig()"
            }
        };
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    document.getElementById('systemSetting').addEventListener('989', function (e) {
        let boxLockData = e.detail.split(",");
        $scope.selectedDragStrategy = $scope.dragStrategyList[Number(~~boxLockData[0])];
        $scope.dragDetechTime = boxLockData[1];
        $scope.dragBtnTimes = boxLockData[2];
        $scope.dragTimeoutExit = boxLockData[3];
    });

    /**获取按钮盒手自动切换组合键密码 */
    function getBtnBoxRobotModeChange() {
        let getCmd = {
            cmd: 912,
            data: {
                content: "GetBtnBoxRobotModeChangePassward()"
            }
        };
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    document.getElementById('systemSetting').addEventListener('912', function (e) {
        let boxRobotModeData = JSON.parse(e.detail);
        $scope.selectKeyCombineSwitch = Number(boxRobotModeData.enable);
        $scope.buttonBoxModeList = boxRobotModeData.btns.splice(0, boxRobotModeData.btns.length - 1);
        $scope.btnBoxTimeOut = boxRobotModeData.timeout;
    });

    /**减少组合键 */
    $scope.deleteKeyCombination = function() {
        if ($scope.buttonBoxModeList.length == 1) {
            toastFactory.info(ssDynamicTags.info_messages[48]);
            return;
        }
        $scope.buttonBoxModeList.pop();
    }

    /**增加组合键 */
    $scope.addKeyCombination = function() {
        if ($scope.buttonBoxModeList.length == 9) {
            toastFactory.info(ssDynamicTags.info_messages[49]);
            return;
        }
        $scope.buttonBoxModeList.push(1);
    }

    /**
     * 掉电去使能配置
     * @param {int} enable 去使能按钮 0-去使能 1-不去使能
     */
    $scope.setPowerOffDisable = function(enable) {
        let setCmd = {
            cmd: 962,
            data: {
                content: "SetPowerOffDisable(" + enable + ")"
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    //示教点搜索
    $scope.searchTeachProgramName = function () {
        const searchTeachName = document.getElementById("teachProNameFind").value;
        const teachDataName = Object.keys($scope.tmpTeachEncryptList);
        $scope.tmpTeachEncryptData = [];
        teachDataName.forEach(item => {
            if ($scope.tmpTeachEncryptList[item].name.toUpperCase().indexOf(searchTeachName.toUpperCase()) != -1) {
                $scope.tmpTeachEncryptData.push($scope.tmpTeachEncryptList[item]);
            }
        })
        $scope.teachEncryptList = $scope.tmpTeachEncryptData;
    }
    // 更新示教程序的加密状态
    $scope.setLuaLevel = function (item) {
        // item-当前点击行的数据对象
        const setProEncryptParams = {
            cmd: "set_lua_level",
            data: {
                name: item.name,
                level: item.level
            }
        }
        dataFactory.actData(setProEncryptParams)
            .then((data) => {
                getTeachProgramEncryptData()
            }, (status) => {
                getTeachProgramEncryptData()
                toastFactory.error(status, ssDynamicTags.error_messages[35]);
            });
    }

    /**
     * 设置位姿运动速度策略
     * @param {number} speedStrategyId 速度策略(0-位姿同步，1-以位置为主)
     */
    $scope.setPositionSpeedStrategy = function(speedStrategyId) {
        let speedStrategyCmd = {
            cmd: 910,
            data: {
                content: "SetPoseSyncStrategy(" + speedStrategyId + ")"
            }
        }
        dataFactory.setData(speedStrategyCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 设置圆弧与整圆姿态过渡策略
     * @param {number} type 姿态策略(0-不参与规划，1-参与规划)
     */
    $scope.setArcCirclePoseStrategy = function(type) {
        let setCmd = {
            cmd: 925,
            data: {
                content: "SetArcCirclePoseStrategy(" + type + ")"
            }
        }
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 选择使能关节组合
     * @param {int} index 关节joint id 1~6
     * @param {boolean} item 复选框勾选 true/false
     * @param {int} type 0-去使能 1-使能
     */
    let recordenableOnJoints = 0;
    let recordenableOffJoints = 0;
    $scope.chooseEnableOnJoints = function(index, item, type) {
        if (item) {
            if (type == 0) {
                recordenableOffJoints += Math.pow(2, index - 1);
            } else {
                recordenableOnJoints += Math.pow(2, index - 1);
            }
        } else {
            if (type == 0) {
                recordenableOffJoints -= Math.pow(2, index - 1);
            } else {
                recordenableOnJoints -= Math.pow(2, index - 1);
            }
        }
    }

    /**单独关节组合使能 关节号0x01~0x3F*/
    $scope.enableOnRobot = function() {
        let enableOnRobotCmd = {
            cmd: 820,
            data: {
                content: "RobotSingleJointEnable(" + recordenableOnJoints + ")"
            }
        }
        dataFactory.setData(enableOnRobotCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**单独关节组合去使能 关节号0x01~0x3F*/
    $scope.enableOffRobot = function() {
        let enableOffRobotCmd = {
            cmd: 821,
            data: {
                content: "RobotSingleJointDisable(" + recordenableOffJoints + ")"
            }
        }
        dataFactory.setData(enableOffRobotCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置碰撞检测方法
     * @param {int} method 方法id 0-电流检测 1-双编码器检测 2-电流和双编码器组合检测
     */
    $scope.setCollisionDetection = function(method) {
        let setCollisionDetectionCmd = {
            cmd: 846,
            data: {
                content: "SetCollisionDetectionMethod(" + method + ")"
            }
        }
        dataFactory.setData(setCollisionDetectionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* ./机器人型号出厂配置 */

    /* 机器人时间统计 */
    $scope.timeStatistics = {
        "standbyTime": {
            "hour": 0,
            "minute": 0,
        },
        "runningTime": {
            "hour": 0,
            "minute": 0,
        },
        "failureTime": {
            "hour": 0,
            "minute": 0,
        }
    }

    /*设置机器人使能策略 */
    $scope.setPowerOnEnable = function() {
        let setPowerOnCmd = {
            cmd: 847,
            data: {
                content: "SetPowerOnEnable(" + $scope.selectRobotPowerOn.id + ")"
            }
        }
        dataFactory.setData(setPowerOnCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        })
    }

    /**获取笛卡尔最大速度、最大加速度 */
    function getCartMaxVelAcc() {
        let getCmd = {
            cmd: 935,
            data: {
                content: "GetCartMaxVelAcc()"
            }
        }
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[61]);
        })
    }
    document.getElementById('systemSetting').addEventListener('935', function (e) {
        let maxValueArr = e.detail.split(',');
        $scope.max_vel = ~~maxValueArr[0];
        $scope.max_acc = ~~maxValueArr[1];
        $scope.cartVelTip = "0~" + $scope.max_vel;
        $scope.cartAccTip = "0~" + $scope.max_acc;
    });

    /*获取机器人最大速度和最大加速度 */
    function getRobotSpeedMax() {
        let getSpeedCmd = {
            cmd: 852,
            data: {
                content: "GetMaxCartVelAcc()"
            }
        }
        dataFactory.setData(getSpeedCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[56]);
        })
    }
    document.getElementById('systemSetting').addEventListener('852', function (e) {
        let max_cartvel = JSON.parse(e.detail).max_cartvel;
        let max_cartacc = JSON.parse(e.detail).max_cartacc;
        //若之前设定的最大速度/最大加速度超出能达到的最大值，则显示能达到的最大值
        if ($scope.max_vel && max_cartvel > $scope.max_vel) {
            $scope.robotSpeedMax = $scope.max_vel;
        } else {
            $scope.robotSpeedMax = max_cartvel;
        }
        if ($scope.max_acc && max_cartacc > $scope.max_acc) {
            $scope.robotAccSpeedMax = $scope.max_acc;
        } else {
            $scope.robotAccSpeedMax = max_cartacc;
        }
    });

    /*设置机器人最大速度和最大加速度 */
    $scope.setRobotSpeedMax = function() {
        if (!$scope.robotSpeedMax) {
            $scope.robotSpeedMax = $('#robotSpeedMax').val();
        }
        if (!$scope.robotAccSpeedMax) {
            $scope.robotAccSpeedMax = $('#robotAccSpeedMax').val();
        }
        if (!$scope.robotSpeedMax) {
            toastFactory.info(ssDynamicTags.info_messages[41]);
        } else if (!$scope.robotAccSpeedMax) {
            toastFactory.info(ssDynamicTags.info_messages[42]);
        } else {
            let setSpeedCmd = {
                cmd: 849,
                data: {
                    content: "SetMaxCartVelAcc(" + $scope.robotSpeedMax + "," + $scope.robotAccSpeedMax + ")"
                }
            }
            dataFactory.setData(setSpeedCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        }
    }

    /*获取机器人默认速度百分比和默认加速度百分比 */
    function getRobotDefaultSpeedPer() {
        let getSpeedCmd = {
            cmd: 853,
            data: {
                content: "GetDefaultVelAccRatio()"
            }
        }
        dataFactory.setData(getSpeedCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[57]);
        })
    }
    document.getElementById('systemSetting').addEventListener('853', function (e) {
        $scope.robotDefaultSpeedPer = JSON.parse(e.detail).def_velratio;
        $scope.robotDefaultAccSpeedPer = JSON.parse(e.detail).def_accratio;
    });

    /*设置机器人默认速度百分比和默认加速度百分比 */
    $scope.setRobotDefaultSpeedPer = function() {
        if (!$scope.robotDefaultSpeedPer) {
            $scope.robotDefaultSpeedPer = $('#robotDefaultSpeedPer').val();
        }
        if (!$scope.robotDefaultAccSpeedPer) {
            $scope.robotDefaultAccSpeedPer = $('#robotDefaultAccSpeedPer').val();
        }
        if (!$scope.robotDefaultSpeedPer) {
            toastFactory.info(ssDynamicTags.info_messages[43]);
        } else if (!$scope.robotDefaultAccSpeedPer) {
            toastFactory.info(ssDynamicTags.info_messages[44]);
        } else {
            let setSpeedCmd = {
                cmd: 850,
                data: {
                    content: "SetDefaultVelAccRatio(" + $scope.robotDefaultSpeedPer + "," + $scope.robotDefaultAccSpeedPer + ")"
                }
            }
            dataFactory.setData(setSpeedCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        }
    }

    /*获取机器人最小速度百分比和最小加速度百分比 */
    function getRobotSpeedPerMin() {
        let getSpeedCmd = {
            cmd: 854,
            data: {
                content: "GetMinVelAccRatio()"
            }
        }
        dataFactory.setData(getSpeedCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[58]);
        })
    }
    document.getElementById('systemSetting').addEventListener('854', function (e) {
        $scope.robotSpeedPerMin = JSON.parse(e.detail).min_velratio;
        $scope.robotAccSpeedPerMin = JSON.parse(e.detail).min_accratio;
    });

    /*设置机器人最小速度百分比和最小加速度百分比 */
    $scope.setRobotSpeedPerMin = function() {
        if (!$scope.robotSpeedPerMin) {
            $scope.robotSpeedPerMin = $('#robotSpeedPerMin').val();
        }
        if (!$scope.robotAccSpeedPerMin) {
            $scope.robotAccSpeedPerMin = $('#robotAccSpeedPerMin').val();
        }
        if (!$scope.robotSpeedPerMin) {
            toastFactory.info(ssDynamicTags.info_messages[45]);
        } else if (!$scope.robotAccSpeedPerMin) {
            toastFactory.info(ssDynamicTags.info_messages[46]);
        } else {
            let setSpeedCmd = {
                cmd: 851,
                data: {
                    content: "SetMinVelAccRatio(" + $scope.robotSpeedPerMin + "," + $scope.robotAccSpeedPerMin + ")"
                }
            }
            dataFactory.setData(setSpeedCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        }
    }

    /** 获取刷新当前机器人后台时间统计信息 */
    $scope.getRobotTimeStatistics = function () {
        let getTimeStatistics = {
            cmd: 833,
            data: {
                content: "GetRobotStatisticsTime()"
            }
        }
        dataFactory.setData(getTimeStatistics)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('systemSetting').addEventListener('833', e => {
        let timeStaArr = e.detail.split(',');
        $scope.timeStatistics.standbyTime.hour = timeStaArr[0];
        $scope.timeStatistics.standbyTime.minute = timeStaArr[1];
        $scope.timeStatistics.runningTime.hour = timeStaArr[2];
        $scope.timeStatistics.runningTime.minute = timeStaArr[3];
        $scope.timeStatistics.failureTime.hour = timeStaArr[4];
        $scope.timeStatistics.failureTime.minute = timeStaArr[5];
    })

    /** 点击复位按钮打开输入密码模态窗 */
    $scope.openTimeStatisticsPwdModal = function () {
        $("#timeStatisticsPwdModal").modal();
    }

    /**
     * 重置复位当前机器人后台时间统计信息
     * @param {string} pwd 复位密码
     * @returns 
     */
    $scope.resetRobotTimeStatistics = function (pwd) {
        if (pwd == "" || pwd == undefined || pwd == null) {
            toastFactory.info(ssDynamicTags.info_messages[9]);
            return;
        }
        if (pwd !== "jqrsjfw") {
            toastFactory.error("403", ssDynamicTags.error_messages[20]);
            return;
        } else {
            let resetTimeStatistics = {
                cmd: 834,
                data: {
                    content: "ResetRobotStatisticsTime()"
                }
            }
            dataFactory.setData(resetTimeStatistics)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }
    document.getElementById('systemSetting').addEventListener('834', () => {
        // 834指令执行成功后重新获取
        $scope.getRobotTimeStatistics();
    })
    /* ./机器人时间统计 */

    /* DH参数校准 */
    function getDHfile(){
        let getDHfileCmd = {
            cmd: "get_DH_file",
        }
        dataFactory.getData(getDHfileCmd)
            .then((data) => {
                $scope.recordPointArr = data;
                $scope.recordPoint = auxsDynamicTags.info_messages[45];
                
                for(let i=0;i<$scope.recordPointArr.length;i++){
                    $scope.recordPoint += $scope.recordPointArr[i]+";";
                }
            }, (status) => {
                toastFactory.error(status, auxsDynamicTags.error_messages[2]);
            })
    }

    //设定DH参数采集点
    $scope.setDHPoint = function(){
        for(let i=0;i<$scope.recordPointArr.length;i++){
            if(($scope.recordPointArr[i] == $scope.selectedHoleNum.num)&&$scope.DHFlag){
                toastFactory.info(auxsDynamicTags.info_messages[3])
                $scope.DHFlag = 0;
                return;
            }
        }
        let saveDHPointCmd = {
            cmd: "save_DH_point",
            data: {
                "no":$scope.selectedHoleNum.num+"",
            },
        };
        dataFactory.actData(saveDHPointCmd)
            .then(() => {
                getDHfile();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清空DH采集数据
    $scope.clearDHData = function(){
        let clearDHDataCmd = {
            cmd: "clear_DH_file",
            data: {
                "name":"DH_point.txt"
            },
        };
        dataFactory.actData(clearDHDataCmd)
            .then(() => {
                getDHfile();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //下载DH参数采集文件
    $scope.downloadDHData = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/points/DH_point.txt";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/points/DH_point.txt";
        }
    };

    /**切换DH补偿页面路径 */
    $scope.clickDHTitle = 0;
    $scope.toggleDHPage = function (index) {
        $scope.clickDHTitle = index;
        if (index == 0 || index == 1) {
            $scope.changeDataRecordMode($scope.dhPointsList);
        } else if (index == 3) {
            setChartOption(echartData);
        }
        $(".dhpage").removeClass('active');
        $(".dhpage-" + index).addClass('active');
    }

    $scope.selectimportDHPointsConfigFile = function() {
        $("#pointsConfigFileImported").click();
    }

    // 导入DH参数校准点配置文件
    $scope.importDHPointsConfigFile = function () {
        var formData = new FormData();
        var file = document.getElementById("pointsConfigFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("DH_point.txt" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('pointsConfigFileImported');
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    getDHPoints();
                    clearImportFile('pointsConfigFileImported');
                }
            }, (status) => {
                clearImportFile('pointsConfigFileImported');
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };

    /**导出DH参数校准点更新后的配置文件 */
    $scope.exportDHPointsConfigFile = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/points/DH_point.txt";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/points/DH_point.txt";
        }
    }

    /**导出记录数据文件 */
    $scope.exportDHPointsRecordFile = function () {
        //获取DH标定点记录指令执行情况,所有的点都记录成功后，导出按钮才可用
        if ($scope.dhPointsList.find(item => item.recordFlg == 0)) {
            toastFactory.info(ssDynamicTags.info_messages[33]);
            return;
        }
        window.location.href = '/action/download?pathfilename=/tmp/robot_point.txt';
    }
    
    $scope.selectImportDHPointsRecordFile = function() {
        $("#pointsRecordFileImported").click();
    }

    /**导入记录数据文件 */
    $scope.importDHPointsRecordFile = function () {
        var formData = new FormData();
        var file = document.getElementById("pointsRecordFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("robot_point.txt" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('pointsRecordFileImported');
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    $scope.isImportedRecordFile = true;
                    clearImportFile('pointsRecordFileImported');
                }
            }, (status) => {
                $scope.isImportedRecordFile = false;
                clearImportFile('pointsRecordFileImported');
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };

    /**标定误差折线图 */
    let echartData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var chart2 = echarts.init(document.getElementById('chart2'));
    // 配置表参数
    let tempOption = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            name: ssDynamicTags.info_messages[57],
            type: 'category', 
            boundaryGap: false, 
            data: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20']
        },
        yAxis: {
            name: ssDynamicTags.info_messages[56],
            type: 'value', 
        },
        series: [{
            data:[],
            type: 'line'
        }]
    };

    /**
     * 设置图表配置
     * @param {array} chartsArr 标定误差参数
    */
    function setChartOption(chartsArr) {
        tempOption['series'][0].data = chartsArr;
        let chartOptionSetting = $.extend(true, {}, tempOption);
        chart2.clear();
        chart2.setOption(chartOptionSetting, true);
    };
    setChartOption(echartData);//绘制折线图

    window.addEventListener("resize", function() {
        chart2.resize();//echart随屏幕大小自适应
    })
    /**./标定误差折线图 */

    // 获取DH点参数数据
    function getDHPoints() {
        $scope.dhPointsList.forEach(item => {
            item.recordFlg = 0;
        });
        $scope.show_GetDHPointsTips = 0;
        $scope.isImportedLaserFile = false;
        $scope.isImportedRecordFile = false;
        $scope.isCalculate = true;
        let getDHPointsCmd = {
            cmd: "get_DH_points",
        };
        dataFactory.getData(getDHPointsCmd)
            .then((data) => {
                if (data.length == 20) {
                    $scope.dhPointsList[0].recordFlg = 1;
                    $scope.dhPointsList.forEach((el, i) => {
                        el.joints = data[i];
                    });
                    $scope.show_GetDHPointsTips = 1;
                } else {
                    $scope.show_GetDHPointsTips = 0;
                }
            }, () => {
                // 失败显示未加载
                $scope.show_GetDHPointsTips = 0;
            });
    }

    /** 切换数据记录模式时清除点记录状态 */
    $scope.changeDataRecordMode = function (pointsArr) {
        const recordId = pointsArr.length == 20 ? '#dhPointCirclePrompt' : '#dhCheckPointCirclePrompt';
        pointsArr.forEach((el, i) => {
            if (pointsArr.length == 20) {
                if ($scope.show_GetDHPointsTips) {
                    if (i) {
                        el.recordFlg = 0;
                    } else {
                        el.recordFlg = 1;
                    }
                } else {
                    el.recordFlg = 0;
                }
            } else {
                if ($scope.show_GetDHCheckPointsTips) {
                    if (i) {
                        el.recordFlg = 0;
                    } else {
                        el.recordFlg = 1;
                    }
                } else {
                    el.recordFlg = 0;
                }
            }
            $(recordId + i).removeClass("warning");
            $(recordId + i).removeClass("success");
        });
    }

    /**
     * 手动运行DH记录点并记录数据
     * @param {int} index 点位序号
     */
    $scope.recordDHPointDataManual = function (index, pointsArr) {
        tempPointsArr = pointsArr
        let clacTCFCmd = {
            "cmd": 320,
            "data": tempPointsArr[index].joints,
        };
        dhRecordFlg = 1;
        pointIndex = index;
        dataFactory.setData(clacTCFCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    // 监听320事件获取关节位置正解，组合201下发机器人运行
    document.getElementById('systemSetting').addEventListener('320', e => {
        // 记录运行
        if (dhRecordFlg) {
            dhRecordFlg = 0;
            moveJData["joints"] = tempPointsArr[pointIndex].joints;
            moveJData["tcf"] = JSON.parse(e.detail);
            moveJData["speed"] = $scope.speed.toString();
            moveJData["acc"] = $scope.acceleration;
            moveJData["ovl"] = "50"; // 50-150
            let moveJCmd = {
                cmd: 201,
                data: moveJData
            };
            dataFactory.setData(moveJCmd)
                .then(() => {
                    setTimeout(() => {
                        getRobotStopStatus();
                    }, 1000);
                }, (status) => {
                    toastFactory.error(status);
                })
        }
        // 校验运行
        if (dhCheckFlg) {
            dhCheckFlg = 0;
            moveJData["joints"] = thetaDict;
            moveJData["tcf"] = JSON.parse(e.detail);
            moveJData["speed"] = $scope.speed.toString();
            moveJData["acc"] = $scope.acceleration;
            moveJData["ovl"] = "50"; // 50-150
            let moveJCmd = {
                cmd: 201,
                data: moveJData
            };
            dataFactory.setData(moveJCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                })
        }
    });

    /**
     * 更新测试点预运行DH参数数据
     * @param {int} index 
     */
    $scope.updateDHPointDataManual = function(index) {
        let saveDHPointCmd = {
            cmd: "save_DH_point",
            data: {
                "no":index + 1 +"",
            },
        };
        dataFactory.actData(saveDHPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 执行201指令后获取机器人是否已运动完成
    function getRobotStopStatus() {
        let getRobotStopCmd = {
            cmd: "get_robot_stop",
            data: {}
        };
        dataFactory.actData(getRobotStopCmd)
            .then(() => {
                recordDHPointData();
            }, () => {
                setTimeout(() => {
                    getRobotStopStatus();
                }, 1000);
            });
    }

    // 记录当前DH点位置数据成功后的操作
    function recordDHPointSuccess(recordId) {
        if (pointIndex < tempPointsArr.length - 1) {
            tempPointsArr[pointIndex + 1].recordFlg = 1;
        }
        $(recordId + pointIndex).removeClass("warning");
        $(recordId + pointIndex).addClass("success");
        if (isAuto) {
            if (pointIndex < tempPointsArr.length - 1) {
                setTimeout(() => {
                    $scope.recordDHPointDataManual(++pointIndex, tempPointsArr);
                }, 5000);
            } else if (pointIndex == tempPointsArr.length - 1) {
                isAuto = 0;
            }
        }
    }

    // 记录当前DH点位置数据
    function recordDHPointData() {
        const recordId = tempPointsArr.length == 20 ? '#dhPointCirclePrompt' : '#dhCheckPointCirclePrompt';
        switch (recordId) {
            case '#dhPointCirclePrompt':
                const recordDataCmd = {
                    cmd: 'record_robot_point',
                    data: {
                        "num": pointIndex + 1
                    }
                };
                dataFactory.actData(recordDataCmd).then(() => {
                        recordDHPointSuccess(recordId);
                    }, (status) => {
                        if (pointIndex < tempPointsArr.length - 1) {
                            tempPointsArr[pointIndex + 1].recordFlg = 0;
                        }
                        $(recordId + pointIndex).removeClass("success");
                        $(recordId + pointIndex).addClass("warning");
                        toastFactory.error(status);
                    });
                break;
            case '#dhCheckPointCirclePrompt':
                const recordTCPDataCmd = {
                    cmd: 'record_robot_TCP',
                    data: {
                        "num": pointIndex + 1
                    }
                };
                dataFactory.actData(recordTCPDataCmd).then(() => {
                    recordDHPointSuccess(recordId);
                }, (status) => {
                    if (pointIndex < tempPointsArr.length - 1) {
                        tempPointsArr[pointIndex + 1].recordFlg = 0;
                    }
                    $(recordId + pointIndex).removeClass("success");
                    $(recordId + pointIndex).addClass("warning");
                    toastFactory.error(status);
                });
                break;
            default:
                break;
        }
    }

    $scope.selectImportDHPointsLaserFile = function() {
        $("#pointsLaserFileImported").click();
    }

    /**上传激光跟踪仪数据文件 */
    $scope.importDHPointsLaserFile = function () {
        var formData = new FormData();
        var file = document.getElementById("pointsLaserFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("tracker.txt" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('pointsLaserFileImported');
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData).then((data) => {
            if (typeof(data) != "object") {
                $scope.isImportedLaserFile = true;
                clearImportFile('pointsLaserFileImported');
            }
        }, (status) => {
            $scope.isImportedLaserFile = false;
            clearImportFile('pointsLaserFileImported');
            toastFactory.error(status, ssDynamicTags.error_messages[21]);
        });
    };

    // 自动运行DH记录点并记录数据
    $scope.recordDHPointDataAuto = function (pointsArr) {
        const recordId = pointsArr.length == 20 ? '#dhPointCirclePrompt' : '#dhCheckPointCirclePrompt';
        if (($scope.show_GetDHPointsTips == 0 && recordId == '#dhPointCirclePrompt') || ($scope.show_GetDHCheckPointsTips == false && recordId == '#dhCheckPointCirclePrompt')) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        pointIndex = 0;
        isAuto = 1;
        pointsArr.forEach((el, i) => {
            if (i) {
                el.recordFlg = 0;
            } else {
                el.recordFlg = 1;
            }
            $(recordId + i).removeClass("warning");
            $(recordId + i).removeClass("success");
        });
        $scope.recordDHPointDataManual(pointIndex, pointsArr);
    }

    // 清除数据记录状态
    $scope.clearDHParam = function () {
        clearImportFile('pointsConfigFileImported');
        $scope.show_GetDHPointsTips = 0;
        $scope.dhPointsList.forEach((el, i) => {
            el.recordFlg = 0;
            $("#dhPointCirclePrompt" + i).removeClass("warning");
            $("#dhPointCirclePrompt" + i).removeClass("success");
        });
    }

    /**清除数据计算状态和计算结果 */
    $scope.clearDHCalculateParam = function () {
        //清除数据导入状态
        clearImportFile('pointsLaserFileImported');
        clearImportFile('pointsRecordFileImported');
        $scope.isImportedLaserFile = false;
        $scope.isImportedRecordFile = false;
        $scope.isCalculate = true;

        //清除DH参数补偿值
        $scope.dhParamDict.forEach((item, i) => {
            item.value = "";
            if (i > 6 && i < 13) {
                delete thetaDict["j"+(i-6)];
            }
        });

        //清除标定误差数据
        echartData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        setChartOption(echartData);
    }

    // 记录激光跟踪仪标定点数据
    $scope.recordTrackerData = function() {
        const trackerX = $('#trackerX')[0].value;
        const trackerY = $('#trackerY')[0].value;
        const trackerZ = $('#trackerZ')[0].value;
        if (trackerX == null || trackerX == undefined || trackerX == ''
            || trackerY == null || trackerY == undefined || trackerY == ''
            || trackerZ == null || trackerZ == undefined || trackerZ == '')
        {
            toastFactory.info(ssDynamicTags.info_messages[37]);
            return;
        }
        const recordTrackerCmd = {
            cmd: "record_tracker_data",
            data: {
                x: Number(trackerX),
                y: Number(trackerY),
                z: Number(trackerZ)
            }
        }
        dataFactory.actData(recordTrackerCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[54]);
        });
    }

    document.getElementById("systemSetting").addEventListener('754', () => {
        $scope.isCalculate = false;
    });

    /**
     * 计算机器人DH参数
     * @param {int} coordinate 计算坐标 0-基坐标系 1-外部坐标系
     * @param {int} mode 计算模式，0-正常标定12参数，1-敏感性分析ad，2-敏感性分析α，3-24参数辨识
     */
    $scope.calculateDHParam = function (coordinate,mode) {
        let calcuDHParamCmd = {
            cmd: 'robot_dh_compute',
            data: {
                "coordinate": Number(coordinate),
                "mode": Number(mode)
            }
        };
        dataFactory.actData(calcuDHParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 监听320事件获取关节位置正解，组合201下发机器人运行
    document.getElementById("systemSetting").addEventListener('709', e => {
        let dhParamArr = [];
        dhParamArr = e.detail.split(",");
        echartData = dhParamArr.splice(0,20); //标定误差数据
        setChartOption(echartData);//绘制折线图

        //DH参数补偿值
        dhParamArr.forEach((item, i) => {
            $scope.dhParamDict[i].value = item;
            //零位角参数
            if (i > 6 && i < 13) {
                thetaDict["j"+(i-6)] = dhParamArr[i];
            }
        });
    });

    // 校验零位角参数
    $scope.checkDHParam = function () {
        if (Object.keys(thetaDict).length) {
            let clacTCFCmd = {
                "cmd": 320,
                "data": thetaDict
            };
            dhCheckFlg = 1;
            dataFactory.setData(clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                }) 
        } else {
            toastFactory.info(ssDynamicTags.info_messages[34]);
        }
    }

    // 设置DH参数补偿值
    $scope.setDHParam = function () {
        if ($scope.dhParamDict.find((item, index) => ((index > 3 && index < 7) || (index > 13 && index < 16) || (index > 24 && index < 31) || index == 1) && item.value == '')) {
            toastFactory.info(ssDynamicTags.info_messages[35]);
            return;
        }
        let setDHParamCmd = {
            cmd: 624,
            data: {
                content: "SetDHCompensation({" 
                            + $scope.dhParamDict[1].value + ","
                            + $scope.dhParamDict[14].value + ","
                            + $scope.dhParamDict[15].value + ","
                            + $scope.dhParamDict[4].value + ","
                            + $scope.dhParamDict[5].value + ","
                            + $scope.dhParamDict[6].value + ","
                            + $scope.dhParamDict[25].value + ","
                            + $scope.dhParamDict[26].value + ","
                            + $scope.dhParamDict[27].value + ","
                            + $scope.dhParamDict[28].value + ","
                            + $scope.dhParamDict[29].value + ","
                            + $scope.dhParamDict[30].value
                            + "})"
            }
        };
        dataFactory.setData(setDHParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /* ./DH参数校准 */

    /* ./DH参数校核 */
    // 获取DH参数校核点数据
    function getDHCheckPoints() {
        $scope.dhPointsCheckList.forEach(item => {
            item.recordFlg = 0;
        });
        $scope.show_GetDHCheckPointsTips = false;
        $scope.isImportedCheckLaserFile = false;
        const getDHPointsCmd = {
            cmd: "get_DH_check_points",
        };
        dataFactory.getData(getDHPointsCmd).then((data) => {
            if (data.length == 10) {
                $scope.dhPointsCheckList[0].recordFlg = 1;
                $scope.dhPointsCheckList.forEach((item, index) => {
                    item.joints = data[index];
                });
                $scope.show_GetDHCheckPointsTips = true;
            } else {
                $scope.show_GetDHCheckPointsTips = false;
            }
        }, () => {
            // 失败显示未加载
            $scope.show_GetDHCheckPointsTips = false;
        });
    }
    /**导入DH参数校核点配置文件 */
    $scope.importDHCheckPointsConfigFile = function () {
        var formData = new FormData();
        var file = document.getElementById("pointsCheckConfigFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("DH_check_point.db" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            return;
        }
        resetDHPointsCheckList();
        resetDHCheckResult();
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    // 上传成功后获取DH参数校核10个点数据
                    getDHCheckPoints();
                }
            }, (status) => {
                $scope.show_GetDHCheckPointsTips = false;
                $scope.isImportedCheckLaserFile = false;
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };
    /**上传激光跟踪仪数据文件 */
    $scope.importDHCheckPointsLaserFile = function () {
        if ($scope.dhPointsCheckList.find(item => item.recordFlg == 0)) {
            toastFactory.info(ssDynamicTags.info_messages[36]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("pointsCheckLaserFileImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("tracker_check.txt" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData).then((data) => {
            if (typeof(data) != "object") {
                $scope.isImportedCheckLaserFile = true;
            }
        }, (status) => {
            $scope.isImportedCheckLaserFile = false;
            toastFactory.error(status, ssDynamicTags.error_messages[21]);
        });
    };

    /** 设置DH参数校核标准值*/
    $scope.setDHCheckStandardValue = function() {
        const standardValue = Number($('#DHCheckPointsStandard')[0].value);
        if (standardValue) {
            const setStandardCmd = {
                cmd: "set_DH_standard_value",
                data: {
                    value: standardValue,
                    coordinateMode: Number($scope.selectedCheckCoordinate.id),
                    x: Number($scope.baseCoordinateX) || 0,
                    y: Number($scope.baseCoordinateY) || 0,
                    z: Number($scope.baseCoordinateZ) || 0
                }
            };
            dataFactory.actData(setStandardCmd).then((data) => {
                getDHCheckResult();
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[52]);
            });
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[31]);
        }
    }
    /**获取DH参数校核结果 */
    function getDHCheckResult() {
        const getDHPointsCmd = {
            cmd: "get_DH_check_result",
        };
        dataFactory.getData(getDHPointsCmd).then((data) => {
            data.tracker.forEach((item, index) => {
                $scope.dhCheckResult[index]['trackerX'] = item[0];
                $scope.dhCheckResult[index]['trackerY'] = item[1];
                $scope.dhCheckResult[index]['trackerZ'] = item[2];
            })
            data.robot.forEach((item, index) => {
                $scope.dhCheckResult[index]['robotX'] = item[0];
                $scope.dhCheckResult[index]['robotY'] = item[1];
                $scope.dhCheckResult[index]['robotZ'] = item[2];
            })
            data.offset.forEach((item, index) => {
                $scope.dhCheckResult[index]['offsetX'] = item[0];
                $scope.dhCheckResult[index]['offsetY'] = item[1];
                $scope.dhCheckResult[index]['offsetZ'] = item[2];
            })
            $scope.dhCheckResult[10]['offsetX'] = data.average_value[0];
            $scope.dhCheckResult[10]['offsetY'] = data.average_value[1];
            $scope.dhCheckResult[10]['offsetZ'] = data.average_value[2];
            $scope.dhCheckResult[11]['offsetX'] = data.result[0];
            $scope.dhCheckResult[11]['offsetY'] = data.result[1];
            $scope.dhCheckResult[11]['offsetZ'] = data.result[2];
            $scope.transformPoseData = data.baseTrans;
            $scope.tcpPoseData = data.TCP;
        }, (status) => {
            toastFactory.error(status, ssDynamicTags.error_messages[53]);
        });
    }
    /**生成DH参数校核结果的EXCEL */
    $scope.exportDHCheckResult = function() {
        if ($scope.dhCheckResult.find(item => Object.keys(item).length < 3 )) {
            toastFactory.warning(ssDynamicTags.warning_messages[32]);
        } else {
            $('#report-table').tableExport({
                type:'excel',
                fileName: '机器人绝对精度校准数据' + new Date().getTime()
            }); 
        }
    }
    // 清除数据和状态
    $scope.clearDHCheck = function () {
        $scope.show_GetDHCheckPointsTips = false;
        clearImportFile('pointsCheckConfigFileImported');
        resetDHPointsCheckList();
        $scope.dhPointsCheckList.forEach((el, i) => {
            $("#dhCheckPointCirclePrompt" + i).removeClass("warning");
            $("#dhCheckPointCirclePrompt" + i).removeClass("success");
        });
        clearImportFile('pointsCheckLaserFileImported');
        $scope.isImportedCheckLaserFile = false;
        $('#DHCheckPointsStandard')[0].value = '';
        resetDHCheckResult();
    }

    /** DH配置文件导入 */
    $scope.selectDHCfgFile = function() {
        $("#jointDHCfgImported").click();
    }

    /** DH配置文件导入文件 */
    $scope.jointDHCfgImported = function () {
        var formData = new FormData();
        var file = document.getElementById("jointDHCfgImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("dhpara.config" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('jointDHCfgImported');
            return;
        }
        $scope.DHCfgText = ssDynamicTags.info_messages[53];
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then(() => {
                clearImportFile('jointDHCfgImported');
                $scope.DHCfgText = '';
                showPageRestart(ssDynamicTags.info_messages[54]);
            }, (status) => {
                clearImportFile('jointDHCfgImported');
                $scope.DHCfgText = '';
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };

    /** DH配置文件导出 */
    $scope.jointDHCfgExported = function() {
        if (g_systemFlag == 1) {
            window.location.href = "/action/download?pathfilename=/usr/local/etc/controller/dhpara.config";
        } else {
            window.location.href = "/action/download?pathfilename=/root/robot/dhpara.config";
        }
    }
    /* ./DH参数校核 */
    
    /* ./安全板通信状态监控设置 */
    /** 开始 */
    $scope.startSafeBoardMonitor = function() {
        let setCmd = {
            cmd: 957,
            data: {
                content: "SetSafetyComMonitorStart()"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 停止 */
    $scope.stopSafeBoardMonitor = function() {
        let setCmd = {
            cmd: 958,
            data: {
                content: "SetSafetyComMonitorStop()"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 清除 */
    $scope.clearSafeBoardMessage = function() {
        let setCmd = {
            cmd: 959,
            data: {
                content: "SetSafetyComMonitorClear()"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /* ./安全板通信状态监控设置 */

    /* ./关节摩擦力补偿配置 */
    $scope.SetJointFrictionGain = function() {
        let setJointFrictionGainCmd = {
            cmd: 906,
            data: {
                content: "SetJointFrictionGain({" + $scope.jointFrictionParamDict[0].joint + "},{" + $scope.jointFrictionParamDict[1].joint + "},{" + $scope.jointFrictionParamDict[2].joint + "},{" + $scope.jointFrictionParamDict[3].joint + "})"
            }
        };
        dataFactory.setData(setJointFrictionGainCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /* ./关节摩擦力补偿配置 */

    /* 零点矫正 */
    //设定零点 --全关节矫正
    $scope.setZero = function(){
        if(1 != g_robotEnableFlg){
            toastFactory.info(ssDynamicTags.info_messages[11])
        }else{
            var setZeroString = "SetZeroPoint()";
            let setZeroCmd = {
                cmd: 312,
                data: {
                    content:setZeroString,
                },
            };
            dataFactory.setData(setZeroCmd)
                .then(() => {
                    $scope.zeroFinsh = 1;
                }, (status) => {
                    toastFactory.error(status);
                });
        }   
    }

    // 选择单关节矫正Joint
    $scope.correctJointNameFlag = 1;
    $scope.chooseCorrectSingleJoint = function(id) {
        $scope.correctJointNameFlag = id
    }

    /**
     * 零点矫正 --单关节矫正
     * @param {int} jNum 矫正关节Joint1~6
     */
    $scope.setRobotSingleJointZero = function(jNum) {
        if(1 != g_robotEnableFlg){
            toastFactory.info(ssDynamicTags.info_messages[11]);
            return;
        }
        let setRobotSingleJointZeroCmd = {
            cmd: 800,
            data: {
                content: "SetRobotSingleJointZero(" + jNum + ")"
            }
        };
        dataFactory.setData(setRobotSingleJointZeroCmd)
            .then(() => {
                $scope.zeroFinsh = 1;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设定后检查零点是否设定成功
    document.getElementById('systemSetting').addEventListener('zeroset', function (e) {
        if(1 === $scope.zeroFinsh){
            $scope.zeroFinsh = 0;
            if(2 === e.detail){
                toastFactory.error(403, ssDynamicTags.error_messages[32]);
            }
        }
    });
    /* ./零点矫正 */


    /**
     * 更新示教点数据
     * @param {int} flag 示教点更新方式标志位, 0-JointToTCF，1-TCFToJoint
     */
    $scope.updateAllPoint = function (flag) {
        let setCmd = {};
        if (!parseInt(flag)) {
            setCmd = {
                cmd: "update_all_points",
                data: {}
            }
        } else {
            setCmd = {
                cmd: "update_all_points_TCFToJoint",
                data: {}
            }
        }
        $('#pageLoading').css("display", "block");
        dataFactory.actData(setCmd)
            .then(() => {
                $('#pageLoading').css("display", "none");
            }, (status) => {
                toastFactory.error(status);
            })
    }

    /**控制器日志等级 */
    //等级设置
    $scope.setCtrlLogLevel = function () {
        var setCtrlLogLevelString = "SetCtrlLogLevel("+$scope.selectedCtrlLogLevel.id+")";
        let setCtrlLogLevelCmd = {
            cmd: 578,
            data: {
                content: setCtrlLogLevelString,
            },
        };
        dataFactory.setData(setCtrlLogLevelCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //获取等级
    function getCtrlLogLevel() {
        var getCtrlLogLevelString = "GetCtrlLogLevel()";
        let getCtrlLogLevelCmd = {
            cmd: 579,
            data: {
                content: getCtrlLogLevelString,
            },
        };
        dataFactory.setData(getCtrlLogLevelCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('systemSetting').addEventListener('579', e => {
        $scope.selectedCtrlLogLevel = $scope.ctrlLogLevelData[~~e.detail-10];
    })

    /* 外部控制器系统时间同步 */
    /**
     * 设置外部控制系统时间同步
     * @param {int} syncMode 模式ID
     * @param {int} syncInterface 接口ID
     */
    $scope.setExtTimeSync = function (syncMode, syncInterface) {
        if (syncMode == 0) {
            syncInterface = 0;
        }
        let setCmd = {
            cmd: "set_time_syn_mode",
            data: {
                mode: syncMode,
                eth: syncInterface
            }
        };
        dataFactory.actData(setCmd)
            .then(() => {
                getExtTimeSync();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 获取外部控制系统时间同步配置 */
    function getExtTimeSync() {
        let getCmd = {
            cmd: "get_time_syn_mode"
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.selectedTimeSyncMode = $scope.timeSyncModeDict[data.mode];
                $scope.selectedTimeSyncInterface = $scope.timeSyncInterfaceDict[data.eth - 1];
            }, (status) => {
                toastFactory.error(status);
            });  
    }
    /* ./外部控制器系统时间同步 */

    /* 机器人状态采样周期 */
    /**
     * 周期设置
     * @param {string} type 0--20004;1--8083
     */
    $scope.setRobotStateSamplePeriod = function (type) {
        let setRobotSamplePeriodString;
        let setRobotSamplePeriodCmd;
        switch (type) {
            case 0:
                setRobotSamplePeriodString = "SetRobotRealtimeStateSamplePeriod(" + $scope.robotSamplePeriod + ")";
                setRobotSamplePeriodCmd = 984;
                break;
            case 1:
                setRobotSamplePeriodString = "SetRobotStateSamplePeriod(" + $scope.robotSamplePeriod + ")";
                setRobotSamplePeriodCmd = 684;
                break;
            default:
                break;
        }
        
        let setRobotStateSamplePeriodCmd = {
            cmd: setRobotSamplePeriodCmd,
            data: {
                content: setRobotSamplePeriodString,
            },
        };
        dataFactory.setData(setRobotStateSamplePeriodCmd).then(() => {
            showPageRestart(ssDynamicTags.info_messages[21]);
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 获取周期
     * @param {string} type 0--20004;1--8083
     */
    $scope.getRobotStateSamplePeriod = function(type) {
        let getRobotSamplePeriodString = "GetRobotStateSamplePeriod()";
        let getRobotSamplePeriodCmd = "GetRobotStateSamplePeriod()";
        switch (type) {
            case 0:
                getRobotSamplePeriodString = "GetRobotRealtimeStateSamplePeriod()"
                getRobotSamplePeriodCmd = 985;
                break;
            case 1:
                getRobotSamplePeriodString = "GetRobotStateSamplePeriod()"
                getRobotSamplePeriodCmd = 685;
                break;
            default:
                break;
        }
        let getRobotStateSamplePeriodCmd = {
            cmd: getRobotSamplePeriodCmd,
            data: {
                content: getRobotSamplePeriodString,
            },
        };
        dataFactory.setData(getRobotStateSamplePeriodCmd).then(() => {}, (status) => {
            toastFactory.error(status);
        });
    }

    document.getElementById('systemSetting').addEventListener('685', e => {
        $scope.robotSamplePeriod = ~~e.detail;
    })

    document.getElementById('systemSetting').addEventListener('985', e => {
        $scope.robotSamplePeriod = ~~e.detail;
    })

    /**安全停止设置 */
    //安全模式
    $scope.setSafetyStopSigMode = function () {
        var setSafetyStopSigModeString = "SetSafetyStopSigMode("+$scope.selectedRobotSafeModeStop.id+")";
        let setSafetyStopSigModeCmd = {
            cmd: 587,
            data: {
                content: setSafetyStopSigModeString,
            },
        };
        dataFactory.setData(setSafetyStopSigModeCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //读取配置文件内容
    function getSafeModecfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.selectedRobotSafeModeStop = $scope.robotSafeStopModeData[~~data.safety_open_close];
                $scope.velFeedJ1 = parseFloat(data.j1_v_ff_ratio).toFixed(3);
                $scope.velFeedJ2 = parseFloat(data.j2_v_ff_ratio).toFixed(3);
                $scope.velFeedJ3 = parseFloat(data.j3_v_ff_ratio).toFixed(3);
                $scope.velFeedJ4 = parseFloat(data.j4_v_ff_ratio).toFixed(3);
                $scope.velFeedJ5 = parseFloat(data.j5_v_ff_ratio).toFixed(3);
                $scope.velFeedJ6 = parseFloat(data.j6_v_ff_ratio).toFixed(3);
                $scope.accFeedJ1 = parseFloat(data.j1_a_ff_ratio).toFixed(3);
                $scope.accFeedJ2 = parseFloat(data.j2_a_ff_ratio).toFixed(3);
                $scope.accFeedJ3 = parseFloat(data.j3_a_ff_ratio).toFixed(3);
                $scope.accFeedJ4 = parseFloat(data.j4_a_ff_ratio).toFixed(3);
                $scope.accFeedJ5 = parseFloat(data.j5_a_ff_ratio).toFixed(3);
                $scope.accFeedJ6 = parseFloat(data.j6_a_ff_ratio).toFixed(3);
                $scope.dynFeedJ1 = parseFloat(data.j1_d_ff_ratio).toFixed(3);
                $scope.dynFeedJ2 = parseFloat(data.j2_d_ff_ratio).toFixed(3);
                $scope.dynFeedJ3 = parseFloat(data.j3_d_ff_ratio).toFixed(3);
                $scope.dynFeedJ4 = parseFloat(data.j4_d_ff_ratio).toFixed(3);
                $scope.dynFeedJ5 = parseFloat(data.j5_d_ff_ratio).toFixed(3);
                $scope.dynFeedJ6 = parseFloat(data.j6_d_ff_ratio).toFixed(3);
                $scope.selectedDynamicsMethod = $scope.dynamicsMethodList[~~data.new_teach_enable];
                $scope.selectedSlowDownStopMode = $scope.slowDownStopModeData[~~data.slowdownstop_mode];
                $scope.slowDownStopAcc = parseInt(data.slowdownstop_dcc);
                $scope.selectedCollisionDetection = $scope.collisionDetectionList[~~data.collision_mode];
                if (g_systemFlag) {
                    $scope.selectRobotPowerOn = $scope.robotPowerOnData[~~data.poweron_enable];
                }
                $scope.forDeadGain1 = parseFloat(data.fordead_gain1).toFixed(3);
                $scope.forDeadGain2 = parseFloat(data.fordead_gain2).toFixed(3);
                $scope.forDeadGain3 = parseFloat(data.fordead_gain3).toFixed(3);
                $scope.forDeadGain4 = parseFloat(data.fordead_gain4).toFixed(3);
                $scope.forDeadGain5 = parseFloat(data.fordead_gain5).toFixed(3);
                $scope.forDeadGain6 = parseFloat(data.fordead_gain6).toFixed(3);
                $scope.revDeadGain1 = parseFloat(data.revdead_gain1).toFixed(3);
                $scope.revDeadGain2 = parseFloat(data.revdead_gain2).toFixed(3);
                $scope.revDeadGain3 = parseFloat(data.revdead_gain3).toFixed(3);
                $scope.revDeadGain4 = parseFloat(data.revdead_gain4).toFixed(3);
                $scope.revDeadGain5 = parseFloat(data.revdead_gain5).toFixed(3);
                $scope.revDeadGain6 = parseFloat(data.revdead_gain6).toFixed(3);
                $scope.forFastGain1 = parseFloat(data.forfast_gain1).toFixed(3);
                $scope.forFastGain2 = parseFloat(data.forfast_gain2).toFixed(3);
                $scope.forFastGain3 = parseFloat(data.forfast_gain3).toFixed(3);
                $scope.forFastGain4 = parseFloat(data.forfast_gain4).toFixed(3);
                $scope.forFastGain5 = parseFloat(data.forfast_gain5).toFixed(3);
                $scope.forFastGain6 = parseFloat(data.forfast_gain6).toFixed(3);
                $scope.revFastGain1 = parseFloat(data.revfast_gain1).toFixed(3);
                $scope.revFastGain2 = parseFloat(data.revfast_gain2).toFixed(3);
                $scope.revFastGain3 = parseFloat(data.revfast_gain3).toFixed(3);
                $scope.revFastGain4 = parseFloat(data.revfast_gain4).toFixed(3);
                $scope.revFastGain5 = parseFloat(data.revfast_gain5).toFixed(3);
                $scope.revFastGain6 = parseFloat(data.revfast_gain6).toFixed(3);

                $scope.jointFrictionParamDict.forEach((item, index) => {
                    for (let i=1; i<=6; i++) {
                        item['joint'] = [];
                    }
                })
                $scope.jointFrictionParamDict.forEach((item, index) => {
                    for (let i=1; i<=6; i++) {
                        if (index == 0) {
                            item['joint'].push($scope[`forDeadGain${i}`]);
                        } else if (index == 1) {
                            item['joint'].push($scope[`revDeadGain${i}`]);
                        } else if (index == 2) {
                            item['joint'].push($scope[`forFastGain${i}`]);
                        } else {
                            item['joint'].push($scope[`revFastGain${i}`]);
                        }
                    }
                })
                $scope.selectedSpeedStrategy = $scope.speedStrategyList.filter(item => item.id == ~~data.positionposture_strategy)[0];
                $scope.selectedAttitudeAngleType = $scope.attitudeAngleData.filter(item => item.id == ~~data.arccircleposture_strategy)[0];
                $scope.robotMaxAcc = Number(data.maxacc_ratio) * 360;
                $scope.selectPowerOffEnableSwitch = parseInt(~~data.poweroff_disable); 
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[23]);
            });
    }

    /**
     * 更改数值时更新数据
     * @param {int} type 参数类型 0~3
     * @param {*} index 参数数值的位置 0~5
     */
    $scope.changeJointData = function(type,index) {
        let value = Number($(`#jointParamsData tbody tr #joint${index + 1}Data${type}`).text());
        if (value <= 1.5 && value >= 0.5) {
            $scope.jointFrictionParamDict[type]['joint'][index]= value;
        } else {
            toastFactory.info(ssDynamicTags.info_messages[47])
            $(`#jointParamsData tbody tr #joint${index + 1}Data${type}`).text($scope.jointFrictionParamDict[type]['joint'][index]);
        }
    }

    /* 急停后控制箱DO输出模式设置 */
    $scope.setEStopCtrlBoxDOMode = () => {
        let setCmd = {
            cmd: 752,
            data: {
                content: `SetEStopCtrlIOState(${$scope.selectedCtrlBoxDOMode.id})`,
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById("systemSetting").addEventListener("752", () => {
        getEStopCtrlBoxDOMode();
    })

    /* 获取急停后控制箱DO输出模式 */
    function getEStopCtrlBoxDOMode() {
        let setCmd = {
            cmd: 753,
            data: {
                content: `GetEStopCtrlIOState()`,
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById("systemSetting").addEventListener("753", (e) => {
        $scope.selectedCtrlBoxDOMode = $scope.ctrlBoxDOModeData[e.detail-11];
    })

    //定位完成阈值下发指令函数
    $scope.applyDoneRange = function()
    {
        if ($scope.doneRange == "" || $scope.doneRange == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[16]);
        } else {
            var setDoneRangeString = "SetPosCmdDoneRange("+$scope.doneRange+")";
            let setDoneRangeCmd = {
                cmd: 334,
                data: {
                    content:setDoneRangeString,
                },
            };
            dataFactory.setData(setDoneRangeCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //定位完成时间下发指令函数
    $scope.setPosCmdDoneTime = function()
    {
        if ($scope.motionSetTime == "" || $scope.motionSetTime == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[16]);
        } else {
            var setDoneTimeString = "SetPosCmdDoneTime("+$scope.motionSetTime+")";
            let setDoneTimeCmd = {
                cmd: 621,
                data: {
                    content:setDoneTimeString,
                },
            };
            dataFactory.setData(setDoneTimeCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //设置停止模式下发指令函数
    $scope.applySlowDownStopMode = function()
    {
        var setSlowDownStopModeString = "SetSlowDownStopMode("+$scope.selectedSlowDownStopMode.id+")";
        let setSlowDownStopModeCmd = {
            cmd: 710,
            data: {
                content:setSlowDownStopModeString,
            },
        };
        dataFactory.setData(setSlowDownStopModeCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置自由停机方式减速度下发指令函数
    $scope.setSlowDownStopAcc = function()
    {
        var setSlowDownStopDccRatioString = "SetSlowDownStopDccRatio("+$scope.slowDownStopAcc+")";
        let setSlowDownStopDccRatioCmd = {
            cmd: 711,
            data: {
                content:setSlowDownStopDccRatioString,
            },
        };
        dataFactory.setData(setSlowDownStopDccRatioCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置各轴速度前馈系数
    $scope.setVelFeedForwardRatio = function()
    {
        var setVelFeedForwardRatioString = "SetVelFeedForwardRatio ("+$scope.velFeedJ1+","+$scope.velFeedJ2+","+$scope.velFeedJ3+","+$scope.velFeedJ4+","+$scope.velFeedJ5+","+$scope.velFeedJ6+")";
        let setVelFeedForwardRatioCmd = {
            cmd: 660,
            data: {
                content:setVelFeedForwardRatioString,
            },
        };
        dataFactory.setData(setVelFeedForwardRatioCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置各轴加速度前馈系数
    $scope.setAccFeedForwardRatio = function()
    {
        var setAccFeedForwardRatioString = "SetAccFeedForwardRatio ("+$scope.accFeedJ1+","+$scope.accFeedJ2+","+$scope.accFeedJ3+","+$scope.accFeedJ4+","+$scope.accFeedJ5+","+$scope.accFeedJ6+")";
        let setAccFeedForwardRatioCmd = {
            cmd: 634,
            data: {
                content:setAccFeedForwardRatioString,
            },
        };
        dataFactory.setData(setAccFeedForwardRatioCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置各轴动力学前馈系数
    $scope.setDynFeedForwardRatio = function()
    {
        var setDynFeedForwardRatioString = "SetDynFeedForwardRatio ("+$scope.dynFeedJ1+","+$scope.dynFeedJ2+","+$scope.dynFeedJ3+","+$scope.dynFeedJ4+","+$scope.dynFeedJ5+","+$scope.dynFeedJ6+")";
        let setDynFeedForwardRatioCmd = {
            cmd: 635,
            data: {
                content:setDynFeedForwardRatioString,
            },
        };
        dataFactory.setData(setDynFeedForwardRatioCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置Ecat配置文件
    $scope.setEcatConfig = function () {
        let setEcatConfigCmd = {
            cmd: "config_ecat",
            data: {
                'name':$scope.selectedEcatConfig.name,
            },
        };
        dataFactory.actData(setEcatConfigCmd)
            .then(() => {
                showPageRestart(ssDynamicTags.success_messages[10]);
            }, (status) => {
                toastFactory.error(status, ssDynamicTags.error_messages[24]);
            });  
    };

    $scope.fullJointData = []
    // 处理获取到的Local和Joint全关节参数数据
    $scope.handleFullJointData = function(localData, jointData) {
        $scope.fullJointData = []
        for (const item in localData) {
            for (const element in jointData) {
                if (item == element) {
                    $scope.fullJointData.push({
                        'index': item,
                        'param': localData[item][1],
                        'joint1L': localData[item][2],
                        'joint1J': jointData[element][0],
                        'joint2L': localData[item][3],
                        'joint2J': jointData[element][1],
                        'joint3L': localData[item][4],
                        'joint3J': jointData[element][2],
                        'joint4L': localData[item][5],
                        'joint4J': jointData[element][3],
                        'joint5L': localData[item][6],
                        'joint5J': jointData[element][4],
                        'joint6L': localData[item][7],
                        'joint6J': jointData[element][5],
                        'predeterminedArea': localData[item][8],
                        'effectiveWay': localData[item][9],
                        'unit': localData[item][10]
                    })
                }
            }
        }
        if ($scope.paramtersTableItem.index == 2020) {
            if (
                $scope.fullJointData[$scope.fullJointData.length - 1].joint1L != $scope.fullJointData[$scope.fullJointData.length - 1].joint1J
                || $scope.fullJointData[$scope.fullJointData.length - 1].joint2L != $scope.fullJointData[$scope.fullJointData.length - 1].joint2J
                || $scope.fullJointData[$scope.fullJointData.length - 1].joint3L != $scope.fullJointData[$scope.fullJointData.length - 1].joint3J
                || $scope.fullJointData[$scope.fullJointData.length - 1].joint4L != $scope.fullJointData[$scope.fullJointData.length - 1].joint4J
                || $scope.fullJointData[$scope.fullJointData.length - 1].joint5L != $scope.fullJointData[$scope.fullJointData.length - 1].joint5J
                || $scope.fullJointData[$scope.fullJointData.length - 1].joint6L != $scope.fullJointData[$scope.fullJointData.length - 1].joint6J
            ) {
                toastFactory.info(ssDynamicTags.info_messages[24]);
            }
        }
    }
    // 导入全关节参数数据模拟点击
    $scope.selectJointDatabaseFile = function () {
        $("#jointDatabaseImported").click();
    }

    /**一键配置全关节参数 */
    $scope.setOneKeyParameters = function() {
        const oneKeyCmd = {
            cmd: 'onekey_config_allparameters',
            data: {}
        };
        $('#pageLoading').css({display: 'block'});
        dataFactory.actData(oneKeyCmd).then(() => {
            $('#pageLoading').css({display: 'none'});
        }, (status) => {
            $('#pageLoading').css({display: 'none'});
            toastFactory.error(status, ssDynamicTags.error_messages[55]);
        });
    }

    //同步数据到Local -- 保存当前机器人关节全参数到配置文件
    $scope.syncLocalData = function() {
        if ($scope.paramtersTableItem) {
            let syncJoint2LocalCmd = {
                cmd: "save_jointallparameters",
                data: {
                    index: $scope.paramtersTableItem.index,
                    nrow: $scope.fullJointData.length,
                    content: $scope.tempJointData
                }
            };
            dataFactory.actData(syncJoint2LocalCmd)
                .then(() => {
                    $scope.getAllJointData();
                }, (status) => {
                    toastFactory.error(status, ssDynamicTags.error_messages[36]);
                });
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[25]);
        }
    }

    //写入--设置关节驱动参数
    $scope.applyScopeFlag = '0';
    $scope.paramCommandFlag = 1;
    $scope.dbExportFlag = '0';
    $scope.setJointServoPara = function() {
        if ($scope.paramtersTableItem) {
            const dbExportType = $scope.dbExportFlag == 0 ? 'L' : 'J'
            const tempNum = $scope.fullJointData.length;
            let tempArr = [];
            for (let i = 0; i < 6; i++) {
                $scope.fullJointData.forEach(item => {
                    tempArr.push(item[`joint${i+1}${dbExportType}`])
                })
                for (let i = 0; i < 60 - tempNum; i++) {
                    tempArr.push('0')
                }
            }
            let setJointServoParaCmd = {
                cmd: 728,
                data: {
                    content: "SetJointServoPara(" + $scope.applyScopeFlag +  ',' + $scope.paramtersTableItem.id +  ',' + $scope.paramCommandFlag +  ',{' + tempArr.toString() + "})"
                }
            }
            dataFactory.setData(setJointServoParaCmd)
                .then(() => {
                    toastFactory.info(ssDynamicTags.info_messages[38]);
                }, (status) => {
                    toastFactory.error(status, ssDynamicTags.error_messages[37]);
                });
        } else {
            toastFactory.warning(ssDynamicTags.warning_messages[25]);
        }
    }
    document.getElementById('systemSetting').addEventListener('728', () => {
        $scope.getAllJointData();
    })

    // 导出全关节参数的数据
    $scope.jointDatabaseExported = function() {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/robot/jointallparameters.db";
        }else{
            window.location.href = "/action/download?pathfilename=/root/robot/jointallparameters.db";
        }
    }

    // 全关节参数数据导入文件
    $scope.jointDatabaseImported = function () {
        var formData = new FormData();
        var file = document.getElementById("jointDatabaseImported").files[0];
        if (null == file) {
            toastFactory.info(ssDynamicTags.info_messages[1]);
            return;
        }
        if ("jointallparameters.db" != file.name) {
            toastFactory.info(ssDynamicTags.info_messages[18]);
            clearImportFile('jointDatabaseImported');
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                clearImportFile('jointDatabaseImported');
                if (typeof(data) != "object") {
                    $scope.paramtersTableItem = $scope.paramTypeList[0];
                    $scope.getAllJointData();
                }
            }, (status) => {
                clearImportFile('jointDatabaseImported');
                toastFactory.error(status, ssDynamicTags.error_messages[21]);
            });
    };

    // 表格修改关节（Joint）数据时，更新$scope.fullJointData对应值
    $scope.changeJointJItem = function(index, changeItem, type) {
        $scope.fullJointData.forEach(item => {
            if (changeItem.index == item.index) {
                item[`joint${type}J`] =  $(`#tbParamsData tbody tr #joint${type}J${index}`).text()
            }
        })
    }

    // 全关节参数获取
    $scope.fullJointLoading = false;
    $scope.getAllJointData = function() {
        $scope.fullJointLoading = true;
        $scope.fullJointData = [];
        getAllLocalParameters();
    }

    // 获取全关节(Local)参数的表格数据
    function getAllLocalParameters() {
        const getAllLocalParames = {
            cmd: "get_jointallparameters",
            data: {
                index: $scope.paramtersTableItem.index
            }
        };
        dataFactory.getData(getAllLocalParames)
            .then((data) => {
                $scope.tempLocalData = data
                if (Object.keys(data).length) {
                    getAllJointParameters();
                } else {
                    $scope.fullJointLoading = false;
                    toastFactory.info(ssDynamicTags.info_messages[23]);
                }
            }, (status) => {
                $scope.fullJointLoading = false;
                $scope.fullJointData = [];
                toastFactory.error(status, ssDynamicTags.error_messages[27] + '(Local)');
            });
    }
    // 获取全关节(Joint)参数的表格数据
    function getAllJointParameters() {
        const getAllJointParames = {
            cmd: 729,
            data: {
                content: `GetJointServoPara(0,${$scope.paramtersTableItem.id})`
            }
        };
        dataFactory.setData(getAllJointParames)
            .then(() => {
            }, (status) => {
                $scope.fullJointData = [];
                toastFactory.error(status);
            });
    }

    // 获取全关节(Joint)参数的表格数据的监听事件
    document.getElementById('systemSetting').addEventListener('729', e => {
        $scope.tempJointData = JSON.parse(e.detail);
        $scope.handleFullJointData($scope.tempLocalData, $scope.tempJointData);
        $scope.fullJointLoading = false;
    })

    // 选择参数表的查看范围
    $scope.viewScopeFlag = '0';
    $scope.chooseViewScoped = function(id) {
        $scope.viewScopeFlag = id
    }
    
    // 选择指令设置--应用范围
    $scope.chooseApplyScopeId = function(id) {
        $scope.applyScopeFlag = id
    }

    // 选择指令设置--参数命令
    $scope.chooseParamCommandId = function(id) {
        $scope.paramCommandFlag = id
    }

    //切换数据源
    $scope.switchPidSource = function(){
        $scope.pid_Source_Flag = 0;
    }

    //Pid参数应用
    $scope.setJointPIDParam = function () {
        if($scope.showEnable == true){
            toastFactory.info(ssDynamicTags.info_messages[11]);
            return;
        }
        for(let i=0;i<$scope.pidParameteData.length;i++){
            $scope.pidParameteData[i].para = document.getElementById("tbPidData").rows[i+1].cells[2].innerText;
        }

        var setJointPIDParamString = "SetJointPIDParam(" + $scope.selectedPidMethod.id;
        for(let i=0;i<$scope.pidParameteData.length;i++){
            setJointPIDParamString += ",";
            setJointPIDParamString += $scope.pidParameteData[i].para;
        }
        setJointPIDParamString += ",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)";
        let setJointPIDParamCmd = {
            cmd: 585,
            data: {
                content: setJointPIDParamString,
            },
        };
        dataFactory.setData(setJointPIDParamCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**机器人网络健康监测 */
    //获取网络健康数据（方法弃用，暂时保留）
    // document.addEventListener('hal_slave_count', e => {
    //     var piddate = e.detail;
    //     for(let i=0;i<4;i++){
    //         $scope.halSlaveCountData[i].slave0 = piddate.slave_INErr[0][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[1].innerText = piddate.slave_INErr[0][i];
    //         $scope.halSlaveCountData[i].slave1 = piddate.slave_INErr[1][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[2].innerText = piddate.slave_INErr[1][i];
    //         $scope.halSlaveCountData[i].slave2 = piddate.slave_INErr[2][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[3].innerText = piddate.slave_INErr[2][i];
    //         $scope.halSlaveCountData[i].slave3 = piddate.slave_INErr[3][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[4].innerText = piddate.slave_INErr[3][i];
    //         $scope.halSlaveCountData[i].slave4 = piddate.slave_INErr[4][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[5].innerText = piddate.slave_INErr[4][i];
    //         $scope.halSlaveCountData[i].slave5 = piddate.slave_INErr[5][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[6].innerText = piddate.slave_INErr[5][i];
    //         $scope.halSlaveCountData[i].slave6 = piddate.slave_INErr[6][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[7].innerText = piddate.slave_INErr[6][i];
    //         $scope.halSlaveCountData[i].slave7 = piddate.slave_INErr[7][i];
    //         document.getElementById("tbSlaveData").rows[i+1].cells[8].innerText = piddate.slave_INErr[7][i];

    //         $scope.halSlaveCountData[i+4].slave0 = piddate.slave_OUTErr[0][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[1].innerText = piddate.slave_OUTErr[0][i];
    //         $scope.halSlaveCountData[i+4].slave1 = piddate.slave_OUTErr[1][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[2].innerText = piddate.slave_OUTErr[1][i];
    //         $scope.halSlaveCountData[i+4].slave2 = piddate.slave_OUTErr[2][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[3].innerText = piddate.slave_OUTErr[2][i];
    //         $scope.halSlaveCountData[i+4].slave3 = piddate.slave_OUTErr[3][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[4].innerText = piddate.slave_OUTErr[3][i];
    //         $scope.halSlaveCountData[i+4].slave4 = piddate.slave_OUTErr[4][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[5].innerText = piddate.slave_OUTErr[4][i];
    //         $scope.halSlaveCountData[i+4].slave5 = piddate.slave_OUTErr[5][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[6].innerText = piddate.slave_OUTErr[5][i];
    //         $scope.halSlaveCountData[i+4].slave6 = piddate.slave_OUTErr[6][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[7].innerText = piddate.slave_OUTErr[6][i];
    //         $scope.halSlaveCountData[i+4].slave7 = piddate.slave_OUTErr[7][i];
    //         document.getElementById("tbSlaveData").rows[i+5].cells[8].innerText = piddate.slave_OUTErr[7][i];
    //     }
    // })

    /* 获取机器人从站网络健康状态（从站端口错误帧数） */
    $scope.getSlaveNetworkHealthState = function () {
        let getSlaveNetworkHealthCmd = {
            cmd: 730,
            data: {
                content: "GetSlavePortErrCounter()",
            }
        }
        dataFactory.setData(getSlaveNetworkHealthCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('systemSetting').addEventListener('730', e => {
        let slaveHealth = JSON.parse(e.detail);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 4; j++) {
                $scope.halSlaveCountData[j]["slave"+i] = slaveHealth.slave_INErr[i][j];
                $scope.halSlaveCountData[j+4]["slave"+i] = slaveHealth.slave_OUTErr[i][j];
            }
        }
    })

    /* 从站端口错误帧数计数清零 */
    $scope.setSlavePortErrCounterClear = function (index) {
        var setSlavePortErrCounterCleartring;
        if(index == 8){
            for(let i=0;i<8;i++){
                $scope.setSlavePortErrCounterClear(i);
            }
        }else{
            setSlavePortErrCounterCleartring = "SlavePortErrCounterClear("+index+")";
            let setSlavePortErrCounterClearCmd = {
                cmd: 696,
                data: {
                    content: setSlavePortErrCounterCleartring,
                },
            };
            dataFactory.setData(setSlavePortErrCounterClearCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }
    /** ./机器人网络健康监测 */

    /**动力学设置 */
    //动力学
    $scope.setGravityNewTeachOnOff = function () {
        var setGravityNewTeachOnOffString = "SetGravityNewTeachOnOff("+$scope.selectedDynamicsMethod.id+")";
        let setGravityNewTeachOnOffCmd = {
            cmd: 638,
            data: {
                content: setGravityNewTeachOnOffString,
            },
        };
        dataFactory.setData(setGravityNewTeachOnOffCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 恢复用户配置文件接口
     */
    $scope.recoveryUserConfig = function () {
        let recoverUserCfgCmd = {
            cmd: "recover_usercfg",
            data: {}
        };
        dataFactory.actData(recoverUserCfgCmd)
            .then(() => {
                showPageRestart(ssDynamicTags.warning_messages[20]);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**设置夹爪位置检测阈值 */
    $scope.setGripperPosThreshold = function() {
        if (!$scope.gripperPosThreshold) {
            $scope.gripperPosThreshold = $('#gripperPosThreshold').val();
        }
        if ($scope.gripperPosThreshold == '' || $scope.gripperPosThreshold == null || $scope.gripperPosThreshold == undefined) {
            toastFactory.info(ssDynamicTags.info_messages[51])
        } else {
            let setGripperPosThresholdCmd = {
                cmd: 923,
                data: {
                    content: `SetGripperPosThreshold(${$scope.gripperPosThreshold})`
                }
            }
            dataFactory.setData(setGripperPosThresholdCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        }
    }

    /**获取夹爪位置检测阈值 */
    function getGripperPosData() {
        let getGripperPosThreCmd = {
            cmd: 924,
            data: {
                content: `GetGripperPosThreshold()`
            }
        }
        dataFactory.setData(getGripperPosThreCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    document.getElementById('systemSetting').addEventListener('924', function (e) {
        const thresholdResult = e.detail.split(',');
        if (thresholdResult[0] == 0) {
            $scope.gripperPosThreshold = 0;
            toastFactory.error('403', ssDynamicTags.error_messages[60]);
        } else {
            $scope.gripperPosThreshold = thresholdResult[1];
        }
    });

    /** 滑块跟随提示 */
    $scope.followPrompts = function() {
        const leftValue = (($scope.robotMaxAcc - 360) / 1080) * 100;
        let itemWidth = $('#accTips').width();
        if (itemWidth == 0) {
            itemWidth = $scope.robotMaxAcc >= 1000 ? 31.2 : 23.4;
        }
        if ($scope.robotMaxAcc >= 1200) {
            $('#accTips').css("left", `calc(${leftValue}% - ${itemWidth/2}px - 5px)`);
        } else if ($scope.robotMaxAcc >= 1000) {
            $('#accTips').css("left", `calc(${leftValue}% - ${itemWidth/2}px - 2px)`);
        } else if ($scope.robotMaxAcc > 600 && $scope.robotMaxAcc < 1000) {
            $('#accTips').css("left", `calc(${leftValue}% - ${itemWidth/2}px + 2px)`);
        } else {
            $('#accTips').css("left", `calc(${leftValue}% - ${itemWidth/2}px + 5px)`);
        }
    }

    /** 机器人加速度设置 */
    $scope.setRobotMaxAcc = function() {
        let setRobotMaxAccCmd = {
            cmd: 927,
            data: {
                content: `SetRobotJointMaxAccValue(${$scope.robotMaxAcc})`
            }
        }
        dataFactory.setData(setRobotMaxAccCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /* 单关节模型在线辨识 */

    /** 进入单关节在线辨识界面 */
    $scope.enterSingleJointIdentification = function () {
        $("#singleJointIdentification").modal();
        $scope.sjiJointID = '1';
        $scope.sjiStrategyID = '1';
        $scope.sjiChartVarID = '0';
        $scope.isSuccessStartPoint = false;
        $scope.isSuccessEndPoint = false;
        $scope.applySJIProgaram();
        // 切换为手动模式
        $scope.switchRobotModeDirectly(1);
        $(document).ready(() => {
            sjiChart = echarts.init(document.getElementById('sjiChart'));
        });
    }

    /** 打开单关节在线辨识说明 */
    $scope.openSJIInstruction = function () {
        $("#SJIInstruction").modal();
    }

    let sjiChart;
    let xAxisData;
    let sjiChartData = [];
    let tempSJIOption = {
        title: {
            left: 'left',
            text: 'Chart'
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
                data: sjiChartData
            }
        ]
    };

    /**
     * 设置图表配置
     * @param {string} chartVarID 图表参数选项
     */
    function setSJIChartOption(chartVarID) {
        let chartOptionSetting = $.extend(true, {}, tempSJIOption);
        let varName = '';
        switch (chartVarID) {
            case '1':
                varName = ssDynamicTags.info_messages[59];
                break;
            case '2':
                varName = ssDynamicTags.info_messages[60];
                break;
            case '3':
                varName = ssDynamicTags.info_messages[61];
                break;
            default:
                break;
        }
        chartOptionSetting.series[0].name = varName;
        chartOptionSetting.legend[0].data = [varName];
        xAxisData = [];
        sjiChartData = [];
        sjiChart.clear();
        sjiChart.setOption(chartOptionSetting, true);
    }

    /**
     * 创建X轴数据
     * @param {array} data 
     * @returns 
     */
    function getAxisData(data) {
        var temp_axis_data = [];
        for (let i = 0; i < data.length; i++) {
            temp_axis_data[i] = i;
        }
        return temp_axis_data;
    }

    // 图表数据获取处理
    document.getElementById('systemSetting').addEventListener('sji-data', function (e) {
        // 处理数据并显示
        sjiChartData = sjiChartData.concat(e.detail);
        xAxisData = getAxisData(sjiChartData);
        if (sjiChart != undefined) {
            sjiChart.setOption(
                {
                    xAxis: {
                        data: xAxisData,
                    },
                    series: [{
                        data: sjiChartData
                    }]
                }
            );
        }
    });

    /** 改变辨识策略 */
    $scope.changeSJIStrategy = function () {
        $scope.sjiJointID = '-1';
        $scope.sjiChartVarID = '-1';
        $scope.isSuccessStartPoint = false;
        $scope.isSuccessEndPoint = false;
        xAxisData = [];
        sjiChartData = [];
        sjiChart.clear();
        // 切换为手动模式
        $scope.switchRobotModeDirectly(1);
    }

    /** 应用内部程序 */
    $scope.applySJIProgaram = function () {
        // 切换为手动模式
        $scope.switchRobotModeDirectly(1);
        let luaName = '';
        switch ($scope.sjiStrategyID) {
            case '0':
                luaName = 'JointFricModelIdentify.lua'
                break;
            case '1':
                luaName = 'JointModelIdentify.lua'
                break;
        
            default:
                break;
        }
        //生成lua程序
        let initProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: luaName
            }
        }
        dataFactory.actData(initProgramCmd)
            .then(() => {
                g_fileNameForUpload = luaName;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 局部示教点记录
     * @param {string} pointName 局部点名称
     */
    $scope.recordSJIPoint = function (pointName) {
        let savePointCmd = {
            cmd: "save_local_point",
            data: {
                "local": g_fileNameForUpload,
                "name": pointName,
                "speed": $scope.velocity,
                "elbow_speed": $scope.velocity,
                "acc": $scope.acceleration,
                "elbow_acc": $scope.acceleration,
                "toolnum": $scope.currentCoord + "",
                "workpiecenum": $scope.currentWobjCoord + "",
                "update_programfile": 1
            }
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                if (pointName == 'StartPoint') {
                    $scope.isSuccessStartPoint = true;
                } else {
                    $scope.isSuccessEndPoint = true;
                }
            }, (status) => {
                if (pointName == 'StartPoint') {
                    $scope.isSuccessStartPoint = false;
                } else {
                    $scope.isSuccessEndPoint = false;
                }
                toastFactory.error(status);
            });
    }

    /**
     * 开始单关节模型在线辨识
     * @param {string} strategyID 策略编号
     * @param {string} jointID 关节编号
     */
    $scope.startSJI = function (strategyID, jointID) {
        let sjiStartCmd = {};
        switch (strategyID) {
            case '0':
                if ($scope.sjiJointID == '-1' || !$scope.isSuccessStartPoint || !$scope.isSuccessEndPoint) {
                    toastFactory.info(ssDynamicTags.info_messages[62]);
                    return;
                }
                // 摩擦辨识指令
                sjiStartCmd = {
                    cmd: 1021,
                    data: {
                        content: `JointFrictionIdentifyStart(${jointID})`
                    }
                }
                break;
            case '1':
                if ($scope.sjiJointID == '-1' || $scope.sjiChartVarID == '-1' || !$scope.isSuccessStartPoint || !$scope.isSuccessEndPoint) {
                    toastFactory.info(ssDynamicTags.info_messages[62]);
                    return;
                }
                // 单关节模型辨识先设置图表
                setSJIChartOption($scope.sjiChartVarID);
                // 模型辨识指令
                sjiStartCmd = {
                    cmd: 1024,
                    data: {
                        content: `JointModelIdentifyStart(${jointID})`
                    }
                }
                break;
            default:
                break;
        }
        dataFactory.setData(sjiStartCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 1021摩擦辨识开启成功
    document.getElementById('systemSetting').addEventListener('1021', function () {
        // 切换自动模式
        $scope.switchRobotModeDirectly(0);
    });
    // 1024单关节模型辨识开启成功
    document.getElementById('systemSetting').addEventListener('1024', function () {
        // 1026设置单关节辨识图表参数
        setSJIChartDataVar($scope.sjiChartVarID);
    });

    /**
     * 设置单关节模型辨识图表数据参数
     * @param {string} dataVar 数据参数
     */
    function setSJIChartDataVar (dataVar) {
        let sjiChartVarSetCmd = {
            cmd: 1026,
            data: {
                content: `SetJointModelIdentifyDisplay(${dataVar})`
            }
        }
        dataFactory.setData(sjiChartVarSetCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 1026参数设置成功
    document.getElementById('systemSetting').addEventListener('1026', function () {
        // 切换自动模式
        $scope.switchRobotModeDirectly(0);
    });
    // 1021,303/1024,1026,303切换模式成功
    document.getElementById('systemSetting').addEventListener('303', function () {
        sleep(1000);
        // 满足条件:界面打开,机器人自动模式
        if ($("#singleJointIdentification")[0].style.display == 'block' && $scope.controlMode == '0') {
            // 运行内部程序
            $scope.index_uploadProgName();
        }
    });

    /**
     * 停止单关节模型在线辨识
     * @param {string} strategyID 策略编号
     * @param {string} jointID 关节编号
     */
    $scope.stopSJI = function (strategyID, jointID) {
        let sjiStopCmd = {};
        switch (strategyID) {
            case '0':
                // 摩擦辨识停止指令
                sjiStopCmd = {
                    cmd: 1022,
                    data: {
                        content: `JointFrictionIdentifyEnd(${jointID})`
                    }
                }
                break;
            case '1':
                // 模型辨识停止指令
                sjiStopCmd = {
                    cmd: 1025,
                    data: {
                        content: `JointModelIdentifyEnd(${jointID})`
                    }
                }
                break;
            default:
                break;
        }
        dataFactory.setData(sjiStopCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 102停止机器人成功
    document.getElementById('systemSetting').addEventListener('102', function () {
        sleep(1000);
        // 满足条件:界面打开
        if ($("#singleJointIdentification")[0].style.display == 'block') {
            // 停止单关节辨识
            $scope.stopSJI($scope.sjiStrategyID, $scope.sjiJointID);
        }
    });
    // 1022摩擦辨识停止成功
    document.getElementById('systemSetting').addEventListener('1022', function () {
        $scope.getSJIResult($scope.sjiStrategyID);
    });
    // 1025单关节模型辨识停止成功
    document.getElementById('systemSetting').addEventListener('1025', function () {
        $scope.getSJIResult($scope.sjiStrategyID);
    });

    /**
     * 获取单关节辨识结果
     * @param {string} strategyID 策略编号
     */
    $scope.getSJIResult = function (strategyID) {
        let sjiResultCmd = {};
        switch (strategyID) {
            case '0':
                // 获取摩擦辨识结果指令
                sjiResultCmd = {
                    cmd: 1023,
                    data: {
                        content: `GetJointFrictionIdentifyResult()`
                    }
                }
                break;
            case '1':
                // 获取模型辨识结果指令
                sjiResultCmd = {
                    cmd: 1027,
                    data: {
                        content: `GetJointModelIdentifyResult()`
                    }
                }
                break;
            default:
                break;
        }
        dataFactory.setData(sjiResultCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 1023摩擦辨识开启成功
    document.getElementById('systemSetting').addEventListener('1023', function (e) {
        // 处理数据并显示
        let resultArr = e.detail.split('},');
        let meoFrictionArr = resultArr[0].split('{')[1].split(',');
        let realFrictionArr = resultArr[1].split('{')[1].split(',');
        let errFrictionArr = resultArr[2].split('{')[1].split(',');
        $scope.meoFriction0 = meoFrictionArr[0];
        $scope.meoFriction1 = meoFrictionArr[1];
        $scope.meoFriction2 = meoFrictionArr[2];
        $scope.meoFriction3 = meoFrictionArr[3];
        $scope.meoFriction4 = meoFrictionArr[4];
        $scope.meoFriction5 = meoFrictionArr[5];
        $scope.meoFriction6 = meoFrictionArr[6];
        $scope.meoFriction7 = meoFrictionArr[7];
        $scope.meoFriction8 = meoFrictionArr[8];
        $scope.meoFriction9 = meoFrictionArr[9];
        $scope.realFriction0 = realFrictionArr[0];
        $scope.realFriction1 = realFrictionArr[1];
        $scope.realFriction2 = realFrictionArr[2];
        $scope.realFriction3 = realFrictionArr[3];
        $scope.realFriction4 = realFrictionArr[4];
        $scope.realFriction5 = realFrictionArr[5];
        $scope.realFriction6 = realFrictionArr[6];
        $scope.realFriction7 = realFrictionArr[7];
        $scope.realFriction8 = realFrictionArr[8];
        $scope.realFriction9 = realFrictionArr[9];
        $scope.errFriction0 = errFrictionArr[0];
        $scope.errFriction1 = errFrictionArr[1];
        $scope.errFriction2 = errFrictionArr[2];
        $scope.errFriction3 = errFrictionArr[3];
        $scope.errFriction4 = errFrictionArr[4];
        $scope.errFriction5 = errFrictionArr[5];
        $scope.errFriction6 = errFrictionArr[6];
        $scope.errFriction7 = errFrictionArr[7];
        $scope.errFriction8 = errFrictionArr[8];
        $scope.errFriction9 = errFrictionArr[9];
        $scope.sjiStatus = resultArr[3];
    });
    // 1027单关节模型辨识开启成功
    document.getElementById('systemSetting').addEventListener('1027', function (e) {
        // 处理数据并显示
        let resultArr = e.detail.split(',');
        $scope.meoRigidity = resultArr[0];
        $scope.meoRodIner = resultArr[1];
        $scope.meoMotorIner = resultArr[2];
        $scope.realRigidity = resultArr[3];
        $scope.realRodIner = resultArr[4];
        $scope.realMotorIner = resultArr[5];
        $scope.errRigidity = resultArr[6];
        $scope.errRodIner = resultArr[7];
        $scope.errMotorIner = resultArr[8];
        $scope.sjiStatus = resultArr[9];
    });

    /* ./单关节模型在线辨识 */

};