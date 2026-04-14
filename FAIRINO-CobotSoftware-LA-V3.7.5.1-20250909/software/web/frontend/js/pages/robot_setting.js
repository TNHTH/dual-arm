"use strict";

angular
    .module('frApp')
    .controller('settingCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$http', settingCtrlFn])

function settingCtrlFn($scope, $modal, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    $scope.initRobotViewFlag();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let rsDynamicTags;
    rsDynamicTags = langJsonData.robot_setting;
    // 获取导航栏对象页面显示
    $scope.rsSettingNavList = rsDynamicTags.navbar;    
    // 获取变量对象
    $scope.wobjMethodData = rsDynamicTags.var_object.wobjMethodData;
    $scope.freeDegreeData = rsDynamicTags.var_object.freeDegreeData;
    $scope.DegreePositionData = rsDynamicTags.var_object.DegreePositionData;
    $scope.ExternaAxisDirData = rsDynamicTags.var_object.ExternaAxisDirData;
    $scope.ExternaAxisTypData = rsDynamicTags.var_object.ExternaAxisTypData;
    $scope.ZeroModeData = rsDynamicTags.var_object.ZeroModeData;
    $scope.DragFrictionData = rsDynamicTags.var_object.DragFrictionData;
    $scope.DOCfgData = rsDynamicTags.var_object.DOCfgData;
    $scope.DICfgData = rsDynamicTags.var_object.DICfgData;
    $scope.reduceModeDict = rsDynamicTags.var_object.reduceModeDict;
    $scope.EndDICfgData = rsDynamicTags.var_object.EndDICfgData;
    $scope.digitvalid = rsDynamicTags.var_object.digitvalid;
    $scope.mountTypeData = rsDynamicTags.var_object.mountTypeData;
    $scope.ExternaAxisCompany = rsDynamicTags.var_object.ExternaAxisCompany;
    $scope.ExternaAxisHCFAType = rsDynamicTags.var_object.ExternaAxisHCFAType;
    $scope.ExternaAxisINOVANCEType = rsDynamicTags.var_object.ExternaAxisINOVANCEType;
    $scope.ExternaAxisPANASONICType = rsDynamicTags.var_object.ExternaAxisPANASONICType;
    $scope.ExternaAxisModel = rsDynamicTags.var_object.ExternaAxisModel;
    $scope.LaserLocationData = rsDynamicTags.var_object.LaserLocationData;
    $scope.protocolData = rsDynamicTags.var_object.protocolData;
    $scope.LaserDataUsage = rsDynamicTags.var_object.LaserDataUsage;
    $scope.outputResetData = rsDynamicTags.var_object.outputResetData;
    $scope.AuxAIport = rsDynamicTags.var_object.AuxAIport;
    $scope.toolTypeData = rsDynamicTags.var_object.toolTypeData;
    $scope.mountingLocationData = rsDynamicTags.var_object.mountingLocationData;
    $scope.collideModeData = rsDynamicTags.var_object.collideModeData;
    $scope.fr5collideGradeData = rsDynamicTags.var_object.fr5collideGradeData;
    $scope.fr3collideGradeData = rsDynamicTags.var_object.fr3collideGradeData;
    $scope.fr10collideGradeData = rsDynamicTags.var_object.fr10collideGradeData;
    $scope.collideStrategyData = rsDynamicTags.var_object.collideStrategyData;
    $scope.emergencyStopStrategyData = rsDynamicTags.var_object.emergencyStopStrategyData;
    $scope.endLoadVersion = rsDynamicTags.var_object.endLoadVersionData;
    $scope.CIOptions = langJsonData.peripheral_setting.var_object.diOptionsDictData;
    /* 初始化 */
    // 机器人负载范围初始化
    if (g_robotType.type == 1 || g_robotType.type == 6) {   // FR3 & ART3
        $scope.robotPayloadRangeMax = 3;
    } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802 || g_robotTypeCode == 901) {    // FR5 & ART5 & 901(FR3机型但负载要求为5KG)
        $scope.robotPayloadRangeMax = 5;
    } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {     // FR10 & 902
        $scope.robotPayloadRangeMax = 10;
    } else if (g_robotType.type == 4) {              // FR16
        $scope.robotPayloadRangeMax = 16;
    } else if (g_robotType.type == 5) {              // FR20
        $scope.robotPayloadRangeMax = 20;
    } else if (g_robotType.type == 11) {              // FR30
        $scope.robotPayloadRangeMax = 30;
    }
    //工具坐标系设置变量初始化
    $scope.toolTCPWizardType = -1;
    $scope.selectedToolCoorde = {};
    $scope.selectedToolExTCF = [{}];
    $scope.toolCorrectionCoord = {};
    $scope.computeToolCoorde = {};
    $scope.xDI = $scope.CIOptions[1];
    $scope.yDI = $scope.CIOptions[0];
    $scope.showTCPCorrectionDeviceConfig = false;
    $scope.isConfigCorrectionDevice = false;
    $scope.isSuccessSetIO = false;
    $scope.isSuccessSetCP = false;
    $scope.isSuccessSetParam = false;
    $scope.isSuccessRunProgram = false;
    //外部工具TCP变量初始化
    $scope.computeExTCFdata = {
        "x":"0",
        "y":"1",
        "z":"2",
        "rx":"0",
        "ry":"0",
        "rz":"1"
    }
    $scope.computeToolExTCFdata = {
        "x":"0",
        "y":"1",
        "z":"2",
        "rx":"0",
        "ry":"0",
        "rz":"1"
    }
    //工件坐标变量初始化
    $scope.computeWObjCoorde = {
        "x":"0",
        "y":"1",
        "z":"2",
        "rx":"0",
        "ry":"0",
        "rz":"1"
    }
    $scope.selectedWobjMethod = $scope.wobjMethodData[0];
    //扩展轴坐标变量初始化
    $scope.REAxisDistance = 50;
    $scope.REAxisSpeed = 100;
    $scope.REAxisacc = 100;
    $scope.HomeSearchVel = 5;
    $scope.HomeLatchVel = 1;
    $scope.RExternaAxisIdData = [
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
    $scope.selectedEAxisTest1ID = $scope.RExternaAxisIdData[0];
    $scope.selectedEAxisTest2ID = $scope.RExternaAxisIdData[0];
    $scope.selectedEAxisTest3ID = $scope.RExternaAxisIdData[0];
    $scope.selectedEAxisTest4ID = $scope.RExternaAxisIdData[0];
    $scope.selectedEAxisCfgID = $scope.RExternaAxisIdData[0];
    $scope.selectedFreeDegree = $scope.freeDegreeData[0];
    $scope.selectedDegreePosition = $scope.DegreePositionData[0];
    $scope.selectedSetEAxisLead = 0;
    $scope.ExternaAxisCfgData = [{}]
    $scope.selectedEAxisZeroMode = $scope.ZeroModeData[0];
    //碰撞等级设置变量初始化
    $scope.collideGradeData = [{}];
    if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
        $scope.collideGradeData = $scope.fr3collideGradeData;
    } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
        $scope.collideGradeData = $scope.fr5collideGradeData;
    } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
        $scope.collideGradeData = $scope.fr10collideGradeData;
    } else {
        $scope.collideGradeData = $scope.fr10collideGradeData;
    };
    $scope.reboundFactorDict = [
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
        },
        {
            id:"8"
        },
        {
            id:"9"
        },
        {
            id:"10"
        }
    ];
    $scope.reboundSafeTime = '1000';
    $scope.reboundSafeDistance = '150';
    $scope.selectedJ1ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedJ2ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedJ3ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedJ4ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedJ5ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedJ6ReboundFactor = $scope.reboundFactorDict[4];
    $scope.selectedGrade = $scope.collideGradeData[0];
    $scope.selectedCollideStrategy = $scope.collideStrategyData[0];
    $scope.selectedGradeMode = $scope.collideModeData[0];
    //软限位设置变量初始化
    $scope.j1MinLimit = 0;
    $scope.j2MinLimit = 0;
    $scope.j3MinLimit = 0;
    $scope.j4MinLimit = 0;
    $scope.j5MinLimit = 0;
    $scope.j6MinLimit = 0;
    $scope.j1MaxLimit = 0;
    $scope.j2MaxLimit = 0;
    $scope.j3MaxLimit = 0;
    $scope.j4MaxLimit = 0;
    $scope.j5MaxLimit = 0;
    $scope.j6MaxLimit = 0;
    if (g_robotType.type == 1) {    // FR3
        $scope.j1SoftLimitRangeMin = -175;
        $scope.j1SoftLimitRangeMax = 175;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -150;
        $scope.j3SoftLimitRangeMax = 150;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = -175;
        $scope.j5SoftLimitRangeMax = 175;
        $scope.j6SoftLimitRangeMin = -175;
        $scope.j6SoftLimitRangeMax = 175;
    } else if (g_robotType.type == 6) {    // ART3(1,5,7关节无硬限位)
        $scope.j1SoftLimitRangeMin = -360;
        $scope.j1SoftLimitRangeMax = 360;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -150;
        $scope.j3SoftLimitRangeMax = 150;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = -360;
        $scope.j5SoftLimitRangeMax = 360;
        $scope.j6SoftLimitRangeMin = -360;
        $scope.j6SoftLimitRangeMax = 360;
    } else if (g_robotType.type == 7) {     // ART5(1,5,7关节无硬限位)
        $scope.j1SoftLimitRangeMin = -360;
        $scope.j1SoftLimitRangeMax = 360;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -160;
        $scope.j3SoftLimitRangeMax = 160;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = -360;
        $scope.j5SoftLimitRangeMax = 360;
        $scope.j6SoftLimitRangeMin = -360;
        $scope.j6SoftLimitRangeMax = 360;
    } else if (g_robotTypeCode == 802) {    // FR5WM
        $scope.j1SoftLimitRangeMin = -175;
        $scope.j1SoftLimitRangeMax = 175;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -135;
        $scope.j3SoftLimitRangeMax = 135;
        $scope.j4SoftLimitRangeMin = -175;
        $scope.j4SoftLimitRangeMax = 175;
        $scope.j5SoftLimitRangeMin = -85;
        $scope.j5SoftLimitRangeMax = 265;
        $scope.j6SoftLimitRangeMin = -175;
        $scope.j6SoftLimitRangeMax = 175;
    } else if (g_robotTypeCode == 901) {    // FR3MT
        $scope.j1SoftLimitRangeMin = -175;
        $scope.j1SoftLimitRangeMax = 175;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -150;
        $scope.j3SoftLimitRangeMax = 150;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = 0;
        $scope.j5SoftLimitRangeMax = 355;
        $scope.j6SoftLimitRangeMin = -175;
        $scope.j6SoftLimitRangeMax = 175;
    } else if (g_robotTypeCode == 902) {    // FR10YD
        $scope.j1SoftLimitRangeMin = -175;
        $scope.j1SoftLimitRangeMax = 175;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -160;
        $scope.j3SoftLimitRangeMax = 160;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = 0;
        $scope.j5SoftLimitRangeMax = 355;
        $scope.j6SoftLimitRangeMin = -175;
        $scope.j6SoftLimitRangeMax = 175;
    } else {                                 // FR5 & FR10 & FR16 & FR20 & FR30
        $scope.j1SoftLimitRangeMin = -175;
        $scope.j1SoftLimitRangeMax = 175;
        $scope.j2SoftLimitRangeMin = -265;
        $scope.j2SoftLimitRangeMax = 85;
        $scope.j3SoftLimitRangeMin = -160;
        $scope.j3SoftLimitRangeMax = 160;
        $scope.j4SoftLimitRangeMin = -265;
        $scope.j4SoftLimitRangeMax = 85;
        $scope.j5SoftLimitRangeMin = -175;
        $scope.j5SoftLimitRangeMax = 175;
        $scope.j6SoftLimitRangeMin = -175;
        $scope.j6SoftLimitRangeMax = 175;
    }
    //负载设置变量初始化
    $scope.jointfifth = 30;
    $scope.jointthird = 30;
    $scope.jointsix = 30;
    $scope.loadSpeed = 10;
    $scope.sampleTime = 300;
    //速度缩放变量初始化
    $scope.automodeSpeed = 100;
    $scope.manualmodeSpeed = 100;
    //运动参数变量初始化
    $scope.doneRange = 100;
    //摩擦力补偿
    $scope.friLevel = 0.5;
    $scope.friWall = 0.5;
    $scope.friCeiling = 0.5;
    $scope.selectedFriction = $scope.DragFrictionData[0];
    //IO滤波变量初始化
    $scope.controlDiTime = 0;
    $scope.toolDiTime = 0;
    $scope.controlAi0Time = 0;
    $scope.controlAi1Time = 0;
    $scope.toolAi0Time = 0;
    //机器人安装设置变量初始化
    $scope.selectedMountType = $scope.mountTypeData[0];
    // 初始化通用DO高低电平有效
    $scope.selectedValidDO0 = $scope.digitvalid[0];
    $scope.selectedValidDO1 = $scope.digitvalid[0];
    $scope.selectedValidDO2 = $scope.digitvalid[0];
    $scope.selectedValidDO3 = $scope.digitvalid[0];
    $scope.selectedValidDO4 = $scope.digitvalid[0];
    $scope.selectedValidDO5 = $scope.digitvalid[0];
    $scope.selectedValidDO6 = $scope.digitvalid[0];
    $scope.selectedValidDO7 = $scope.digitvalid[0];
    // 初始化可配置DO高低电平有效
    $scope.selectedValidDO8 = $scope.digitvalid[0];
    $scope.selectedValidDO9 = $scope.digitvalid[0];
    $scope.selectedValidDO10 = $scope.digitvalid[0];
    $scope.selectedValidDO11 = $scope.digitvalid[0];
    $scope.selectedValidDO12 = $scope.digitvalid[0];
    $scope.selectedValidDO13 = $scope.digitvalid[0];
    $scope.selectedValidDO14 = $scope.digitvalid[0];
    $scope.selectedValidDO15 = $scope.digitvalid[0];
    // 初始化通用DI高低电平有效
    $scope.selectedValidDI0 = $scope.digitvalid[0];
    $scope.selectedValidDI1 = $scope.digitvalid[0];
    $scope.selectedValidDI2 = $scope.digitvalid[0];
    $scope.selectedValidDI3 = $scope.digitvalid[0];
    $scope.selectedValidDI4 = $scope.digitvalid[0];
    $scope.selectedValidDI5 = $scope.digitvalid[0];
    $scope.selectedValidDI6 = $scope.digitvalid[0];
    $scope.selectedValidDI7 = $scope.digitvalid[0];
    // 初始化可配置DI高低电平有效
    $scope.selectedValidDI8 = $scope.digitvalid[0];
    $scope.selectedValidDI9 = $scope.digitvalid[0];
    $scope.selectedValidDI10 = $scope.digitvalid[0];
    $scope.selectedValidDI11 = $scope.digitvalid[0];
    $scope.selectedValidDI12 = $scope.digitvalid[0];
    $scope.selectedValidDI13 = $scope.digitvalid[0];
    $scope.selectedValidDI14 = $scope.digitvalid[0];
    $scope.selectedValidDI15 = $scope.digitvalid[0];
    $scope.selectedEndValidDI1 = $scope.digitvalid[0];
    $scope.selectedEndValidDI2 = $scope.digitvalid[0];
    $scope.selectedemergencyStopStrategy = $scope.emergencyStopStrategyData[0];
    // 初始化DO功能配置
    $scope.selectedCfgDO8 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO9 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO10 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO11 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO12 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO13 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO14 = $scope.DOCfgData[1].value;
    $scope.selectedCfgDO15 = $scope.DOCfgData[1].value;
    // 初始化DI功能配置
    $scope.selectedCfgDI8 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI9 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI10 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI11 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI12 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI13 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI14 = $scope.DICfgData[1].value;
    $scope.selectedCfgDI15 = $scope.DICfgData[1].value;
    $scope.selectedEndCfgDI1 = $scope.EndDICfgData[1].value;
    $scope.selectedEndCfgDI2 = $scope.EndDICfgData[1].value;
    /* 初始化IO别名配置列表 */
    $scope.aliasNameText = rsDynamicTags.info_messages[47];
    $scope.ctrlDIArr = langJsonData.IOlists.clDI;
    $scope.ctrlDOArr = langJsonData.IOlists.clDO;
    $scope.ctrlAIArr = langJsonData.IOlists.clAI;
    $scope.ctrlAOArr = langJsonData.IOlists.clAO;
    $scope.ctrlDIAliasData = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    $scope.ctrlDOAliasData = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    $scope.ctrlAIAliasData = ["", ""];
    $scope.ctrlAOAliasData = ["", ""];
    $scope.endDIArr = langJsonData.IOlists.toolDI;
    $scope.endDOArr = langJsonData.IOlists.toolDO;
    $scope.endAIArr = langJsonData.IOlists.toolAI;
    $scope.endAOArr = langJsonData.IOlists.toolAO;
    $scope.endDIAliasData = ["", ""];
    $scope.endDOAliasData = ["", ""];
    $scope.endAIAliasData = [""];
    $scope.endAOAliasData = [""];
    const robotDIList = ['selectedCfgDI8', 'selectedCfgDI9', 'selectedCfgDI10', 'selectedCfgDI11', 'selectedCfgDI12', 'selectedCfgDI13', 'selectedCfgDI14', 'selectedCfgDI15'];
    const robotDOList = ['selectedCfgDO8', 'selectedCfgDO9', 'selectedCfgDO10', 'selectedCfgDO11', 'selectedCfgDO12', 'selectedCfgDO13', 'selectedCfgDO14', 'selectedCfgDO15'];
    const robotEndDIList = ['selectedEndCfgDI1', 'selectedEndCfgDI2'];
    // 初始化缩减模式配置
    $scope.selectedReduceMode = $scope.reduceModeDict[0];
    // 负载辨识版本选择
    $scope.currentEndLoadVersion = $scope.endLoadVersion[0];  

    // 判断子页面是否有权限
    $scope.userAuthData = getUserAuthority();

    /* 获取机器人当前配置 */
    function getRobotdata(){
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                if($scope.ToolCoordeData == undefined || $scope.ExToolCoordeData == undefined){
                    getRobotdata();
                    return;
                }
                if(data.tool_num <= $scope.toolCoordeTotal){
                    $scope.selectedToolCoorde = $scope.ToolCoordeData[~~data.tool_num];   
                    $scope.selectedToolExTCF = $scope.ExToolCoordeData.etoolcoord0;
                }else{
                    data.tool_num = ~~data.tool_num - $scope.toolCoordeTotal;
                    $scope.selectedToolCoorde = $scope.ToolCoordeData[0];
                    $scope.selectedToolExTCF = $scope.ExToolCoordeData["etoolcoord"+~~data.tool_num];
                }
                $scope.selectedGradeMode = $scope.collideModeData[~~data.collision_level_type];
                if($scope.selectedGradeMode.id == 1){
                    $scope.customCollisionJ1 = parseFloat(data.j1_collision_level*10).toFixed(3);
                    $scope.customCollisionJ2 = parseFloat(data.j2_collision_level*10).toFixed(3);
                    $scope.customCollisionJ3 = parseFloat(data.j3_collision_level*10).toFixed(3);
                    $scope.customCollisionJ4 = parseFloat(data.j4_collision_level*10).toFixed(3);
                    $scope.customCollisionJ5 = parseFloat(data.j5_collision_level*10).toFixed(3);
                    $scope.customCollisionJ6 = parseFloat(data.j6_collision_level*10).toFixed(3);
                    $scope.selectedJ1Grade = $scope.collideGradeData[4];
                    $scope.selectedJ2Grade = $scope.collideGradeData[4];
                    $scope.selectedJ3Grade = $scope.collideGradeData[4];
                    $scope.selectedJ4Grade = $scope.collideGradeData[4];
                    $scope.selectedJ5Grade = $scope.collideGradeData[4];
                    $scope.selectedJ6Grade = $scope.collideGradeData[4];
                }else{
                    if(~~data.j1_collision_level == 100){
                        $scope.selectedJ1Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ1Grade = $scope.collideGradeData[~~(data.j1_collision_level-1)];
                    }
                    if(~~data.j2_collision_level == 100){
                        $scope.selectedJ2Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ2Grade = $scope.collideGradeData[~~(data.j2_collision_level-1)];
                    }
                    if(~~data.j3_collision_level == 100){
                        $scope.selectedJ3Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ3Grade = $scope.collideGradeData[~~(data.j3_collision_level-1)];
                    }
                    if(~~data.j4_collision_level == 100){
                        $scope.selectedJ4Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ4Grade = $scope.collideGradeData[~~(data.j4_collision_level-1)];
                    }
                    if(~~data.j5_collision_level == 100){
                        $scope.selectedJ5Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ5Grade = $scope.collideGradeData[~~(data.j5_collision_level-1)];
                    }
                    if(~~data.j6_collision_level == 100){
                        $scope.selectedJ6Grade = $scope.collideGradeData[10];
                    }else{
                        $scope.selectedJ6Grade = $scope.collideGradeData[~~(data.j6_collision_level-1)];
                    }
                    $scope.customCollisionJ1 = 50;
                    $scope.customCollisionJ2 = 50;
                    $scope.customCollisionJ3 = 50;
                    $scope.customCollisionJ4 = 50;
                    $scope.customCollisionJ5 = 50;
                    $scope.customCollisionJ6 = 50;
                }
                $scope.changeCollisionMode();
                
                $scope.selectedCollideStrategy = $scope.collideStrategyData[~~(data.collision_pause)];
                $scope.reboundSafeTime = data.collision_safetime;
                $scope.reboundSafeDistance = data.collision_safedistance;
                $scope.selectedJ1ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin1) - 1] ;
                $scope.selectedJ2ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin2) - 1];
                $scope.selectedJ3ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin3) - 1];
                $scope.selectedJ4ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin4) - 1];
                $scope.selectedJ5ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin5) - 1];
                $scope.selectedJ6ReboundFactor = $scope.reboundFactorDict[~~(data.collision_safemargin6) - 1];
                
                if (g_robotType.type == 1) {
                    $scope.j1MaxLimit = ~~data.j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.fr3_j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.fr3_j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.j6_min_joint_limit;
                } else if (g_robotType.type == 6) {
                    $scope.j1MaxLimit = ~~data.art_j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.art_j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.fr3_j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.fr3_j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.art_j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.art_j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.art_j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.art_j6_min_joint_limit;
                } else if (g_robotType.type == 7) {
                    $scope.j1MaxLimit = ~~data.art_j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.art_j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.art_j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.art_j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.art_j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.art_j6_min_joint_limit;
                } else if (g_robotTypeCode == 802) {
                    $scope.j1MaxLimit = ~~data.j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.wm_j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.wm_j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.wm_j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.wm_j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.wm_j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.wm_j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.j6_min_joint_limit;
                } else if (g_robotTypeCode == 901) {
                    $scope.j1MaxLimit = ~~data.j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.fr3_j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.fr3_j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.mt3_j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.mt3_j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.j6_min_joint_limit;
                } else if (g_robotTypeCode == 902) {
                    $scope.j1MaxLimit = ~~data.j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.yd10_j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.yd10_j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.j6_min_joint_limit;
                } else {
                    $scope.j1MaxLimit = ~~data.j1_max_joint_limit;
                    $scope.j1MinLimit = ~~data.j1_min_joint_limit;
                    $scope.j2MaxLimit = ~~data.j2_max_joint_limit;
                    $scope.j2MinLimit = ~~data.j2_min_joint_limit;
                    $scope.j3MaxLimit = ~~data.j3_max_joint_limit;
                    $scope.j3MinLimit = ~~data.j3_min_joint_limit;
                    $scope.j4MaxLimit = ~~data.j4_max_joint_limit;
                    $scope.j4MinLimit = ~~data.j4_min_joint_limit;
                    $scope.j5MaxLimit = ~~data.j5_max_joint_limit;
                    $scope.j5MinLimit = ~~data.j5_min_joint_limit;
                    $scope.j6MaxLimit = ~~data.j6_max_joint_limit;
                    $scope.j6MinLimit = ~~data.j6_min_joint_limit;
                }
                $scope.loadWeight = parseFloat(data.load_weight).toFixed(3);
                $scope.loadLocationx = parseFloat(data.load_coord_x).toFixed(3);
                $scope.loadLocationy = parseFloat(data.load_coord_y).toFixed(3);
                $scope.loadLocationz = parseFloat(data.load_coord_z).toFixed(3);
                $scope.loadWeight_ft = parseFloat(data.forcesensor_loadweight).toFixed(3);
                $scope.loadLocationx_ft = parseFloat(data.forcesensor_loadcoordx).toFixed(3);
                $scope.loadLocationy_ft = parseFloat(data.forcesensor_loadcoordy).toFixed(3);
                $scope.loadLocationz_ft = parseFloat(data.forcesensor_loadcoordz).toFixed(3);
                if("1" == $scope.controlMode){
                    $scope.Speed = ~~(data.speedscale_manual*100);
                }else{
                    $scope.Speed = ~~(data.speedscale_auto*100);
                }
                $scope.controlDiTime = ~~data.ctl_di_filtertime;
                $scope.toolDiTime = ~~data.axle_di_filtertime;
                $scope.controlAi0Time = ~~data.ctl_ai0_filtertime;
                $scope.controlAi1Time = ~~data.ctl_ai1_filtertime;
                $scope.toolAi0Time = ~~data.axle_ai0_filtertime;
                $scope.toolBoxDiTime = ~~data.tb_di_filtertime;
                $scope.AuxDIFilterTime = ~~data.ext_di_filtertime;
                $scope.AuxAI0FilterTime = ~~data.ext_ai0_filtertime;
                $scope.AuxAI1FilterTime = ~~data.ext_ai1_filtertime;
                $scope.AuxAI2FilterTime = ~~data.ext_ai2_filtertime;
                $scope.AuxAI3FilterTime = ~~data.ext_ai3_filtertime;
                $scope.smartToolDiFilterTime = ~~data.smart_tool_di_filtertime;
                $scope.selectedCfgDO8 = ~~data.ctl_do8_config + "";
                $scope.selectedCfgDO9 = ~~data.ctl_do9_config + "";
                $scope.selectedCfgDO10 = ~~data.ctl_do10_config + "";
                $scope.selectedCfgDO11 = ~~data.ctl_do11_config + "";
                $scope.selectedCfgDO12 = ~~data.ctl_do12_config + "";
                $scope.selectedCfgDO13 = ~~data.ctl_do13_config + "";
                $scope.selectedCfgDO14 = ~~data.ctl_do14_config + "";
                $scope.selectedCfgDO15 = ~~data.ctl_do15_config + "";
                $scope.selectedCfgDI8 = ~~data.ctl_di8_config + "";
                $scope.selectedCfgDI9 = ~~data.ctl_di9_config + "";
                $scope.selectedCfgDI10 = ~~data.ctl_di10_config + "";
                $scope.selectedCfgDI11 = ~~data.ctl_di11_config + "";
                $scope.selectedCfgDI12 = ~~data.ctl_di12_config + "";
                $scope.selectedCfgDI13 = ~~data.ctl_di13_config + "";
                $scope.selectedCfgDI14 = ~~data.ctl_di14_config + "";
                $scope.selectedCfgDI15 = ~~data.ctl_di15_config + "";
                $scope.selectedEndCfgDI1 = ~~data.tool_di1_config + "";
                $scope.selectedEndCfgDI2 = ~~data.tool_di2_config + "";
                robotDIList.forEach((item, index) => {
                    if ($scope[item] == "18") {
                        $scope.xDI = $scope.DICfgData[index + 1];
                    }
                    if ($scope[item] == "19") {
                        $scope.yDI = $scope.DICfgData[index + 1];
                    }
                });
                if ($scope.xDI.id != -1 && $scope.yDI.id != -1) {
                    $scope.isSuccessSetIO = true;
                }
                // 激光标定设备坐标
                $scope.toolCorrectionCoord.x = data.tcp_coord_x;
                $scope.toolCorrectionCoord.y = data.tcp_coord_y;
                $scope.toolCorrectionCoord.z = data.tcp_coord_z;
                $scope.toolCorrectionCoord.rx = data.tcp_coord_a;
                $scope.toolCorrectionCoord.ry = data.tcp_coord_b;
                $scope.toolCorrectionCoord.rz = data.tcp_coord_c;
                if (data.tcp_coord_x == 0 && data.tcp_coord_y == 0 && data.tcp_coord_z == 0 && data.tcp_coord_a == 0 && data.tcp_coord_b == 0 && data.tcp_coord_c == 0) {
                    $scope.isConfigCorrectionDevice = false;
                } else {
                    $scope.isConfigCorrectionDevice = true;
                }
                // 获取IO别名
                getIOAliasData();
                $scope.selectedValidDO0 = $scope.digitvalid[~~data.ctl_do0_level];
                $scope.selectedValidDO1 = $scope.digitvalid[~~data.ctl_do1_level];
                $scope.selectedValidDO2 = $scope.digitvalid[~~data.ctl_do2_level];
                $scope.selectedValidDO3 = $scope.digitvalid[~~data.ctl_do3_level];
                $scope.selectedValidDO4 = $scope.digitvalid[~~data.ctl_do4_level];
                $scope.selectedValidDO5 = $scope.digitvalid[~~data.ctl_do5_level];
                $scope.selectedValidDO6 = $scope.digitvalid[~~data.ctl_do6_level];
                $scope.selectedValidDO7 = $scope.digitvalid[~~data.ctl_do7_level];
                $scope.selectedValidDO8 = $scope.digitvalid[~~data.ctl_do8_level];
                $scope.selectedValidDO9 = $scope.digitvalid[~~data.ctl_do9_level];
                $scope.selectedValidDO10 = $scope.digitvalid[~~data.ctl_do10_level];
                $scope.selectedValidDO11 = $scope.digitvalid[~~data.ctl_do11_level];
                $scope.selectedValidDO12 = $scope.digitvalid[~~data.ctl_do12_level];
                $scope.selectedValidDO13 = $scope.digitvalid[~~data.ctl_do13_level];
                $scope.selectedValidDO14 = $scope.digitvalid[~~data.ctl_do14_level];
                $scope.selectedValidDO15 = $scope.digitvalid[~~data.ctl_do15_level];
                $scope.selectedValidDI0 = $scope.digitvalid[~~data.ctl_di0_level];
                $scope.selectedValidDI1 = $scope.digitvalid[~~data.ctl_di1_level];
                $scope.selectedValidDI2 = $scope.digitvalid[~~data.ctl_di2_level];
                $scope.selectedValidDI3 = $scope.digitvalid[~~data.ctl_di3_level];
                $scope.selectedValidDI4 = $scope.digitvalid[~~data.ctl_di4_level];
                $scope.selectedValidDI5 = $scope.digitvalid[~~data.ctl_di5_level];
                $scope.selectedValidDI6 = $scope.digitvalid[~~data.ctl_di6_level];
                $scope.selectedValidDI7 = $scope.digitvalid[~~data.ctl_di7_level];
                $scope.selectedValidDI8 = $scope.digitvalid[~~data.ctl_di8_level];
                $scope.selectedValidDI9 = $scope.digitvalid[~~data.ctl_di9_level];
                $scope.selectedValidDI10 = $scope.digitvalid[~~data.ctl_di10_level];
                $scope.selectedValidDI11 = $scope.digitvalid[~~data.ctl_di11_level];
                $scope.selectedValidDI12 = $scope.digitvalid[~~data.ctl_di12_level];
                $scope.selectedValidDI13 = $scope.digitvalid[~~data.ctl_di13_level];
                $scope.selectedValidDI14 = $scope.digitvalid[~~data.ctl_di14_level];
                $scope.selectedValidDI15 = $scope.digitvalid[~~data.ctl_di15_level];
                $scope.selectedEndValidDI1 = $scope.digitvalid[~~data.tool_di1_level];
                $scope.selectedEndValidDI2 = $scope.digitvalid[~~data.tool_di2_level];
                $scope.selectedEndCfgDI2 = ~~data.tool_di2_config + "";
                $scope.selectedExtAIChannel = $scope.AuxAIport[~~data.ext_ai_arcweldtrace]; 
                $scope.selectedemergencyStopStrategy = $scope.emergencyStopStrategyData[~~(data.safety_stop_pause)];
                $scope.doneRange = parseFloat(data.poscmd_donerange).toFixed(3);
                $scope.selectedFriction = $scope.DragFrictionData[~~data.fric_compensation];
                /* 摩擦力补偿页面初始化 */
                $scope.selectedFrictionType = $scope.mountTypeData[~~data.install_pos];
                $scope.frictionPosChange();
                $scope.friLevel1 = parseFloat(data.fric_value_level_j1).toFixed(3);
                $scope.friLevel2 = parseFloat(data.fric_value_level_j2).toFixed(3);
                $scope.friLevel3 = parseFloat(data.fric_value_level_j3).toFixed(3);
                $scope.friLevel4 = parseFloat(data.fric_value_level_j4).toFixed(3);
                $scope.friLevel5 = parseFloat(data.fric_value_level_j5).toFixed(3);
                $scope.friLevel6 = parseFloat(data.fric_value_level_j6).toFixed(3);
                $scope.friWall1 = parseFloat(data.fric_value_wall_j1).toFixed(3);
                $scope.friWall2 = parseFloat(data.fric_value_wall_j2).toFixed(3);
                $scope.friWall3 = parseFloat(data.fric_value_wall_j3).toFixed(3);
                $scope.friWall4 = parseFloat(data.fric_value_wall_j4).toFixed(3);
                $scope.friWall5 = parseFloat(data.fric_value_wall_j5).toFixed(3);
                $scope.friWall6 = parseFloat(data.fric_value_wall_j6).toFixed(3);
                $scope.friCeiling1 = parseFloat(data.fric_value_ceiling_j1).toFixed(3);
                $scope.friCeiling2 = parseFloat(data.fric_value_ceiling_j2).toFixed(3);
                $scope.friCeiling3 = parseFloat(data.fric_value_ceiling_j3).toFixed(3);
                $scope.friCeiling4 = parseFloat(data.fric_value_ceiling_j4).toFixed(3);
                $scope.friCeiling5 = parseFloat(data.fric_value_ceiling_j5).toFixed(3);
                $scope.friCeiling6 = parseFloat(data.fric_value_ceiling_j6).toFixed(3);
                $scope.friFree1 = parseFloat(data.fric_value_free_j1).toFixed(3);
                $scope.friFree2 = parseFloat(data.fric_value_free_j2).toFixed(3);
                $scope.friFree3 = parseFloat(data.fric_value_free_j3).toFixed(3);
                $scope.friFree4 = parseFloat(data.fric_value_free_j4).toFixed(3);
                $scope.friFree5 = parseFloat(data.fric_value_free_j5).toFixed(3);
                $scope.friFree6 = parseFloat(data.fric_value_free_j6).toFixed(3);
                /* ./摩擦力补偿页面初始化 */
                $scope.selectedMountType = $scope.mountTypeData[~~data.install_pos];
                $scope.selectedEAxisCoorde = $scope.EAxisCoordeData["exaxis"+~~data.externalaxis_n_coord];
                $scope.selectedWObjCoorde = $scope.WObjCoordeData["wobjcoord"+~~data.workpiece_num];
                $scope.selectedWObjReference = $scope.WObjCoordeData[`wobjcoord${~~$scope.selectedWObjCoorde.reference}`];
                /* 输出复位配置界面配置项获取 */
                $scope.selectedOutputCtrlDOReset = $scope.outputResetData[~~data.ctl_do_output_reset];
                $scope.selectedOutputCtrlAOReset = $scope.outputResetData[~~data.ctl_ao_output_reset];
                $scope.selectedOutputEndDOReset = $scope.outputResetData[~~data.axle_do_output_reset];
                $scope.selectedOutputEndAOReset = $scope.outputResetData[~~data.axle_ao_output_reset];
                $scope.selectedOutputExtendDOReset = $scope.outputResetData[~~data.ext_do_output_reset];
                $scope.selectedOutputExtendAOReset = $scope.outputResetData[~~data.ext_ao_output_reset];
                $scope.selectedOutputSmartDOReset = $scope.outputResetData[~~data.smarttool_do_output_reset];
                /* ./输出复位配置界面配置项获取 */
                $scope.sampleTime = ~~data.load_identify_time;
                $scope.loadIdentifyDyn = ~~data.load_identify_dyn;
                // 缩减模式配置数据获取
                if ($scope.selectedReduceMode.id == "0") {
                    $scope.reduceJ1Speed = parseInt(data.reducemode1_j1_v);
                    $scope.reduceJ2Speed = parseInt(data.reducemode1_j2_v);
                    $scope.reduceJ3Speed = parseInt(data.reducemode1_j3_v);
                    $scope.reduceJ4Speed = parseInt(data.reducemode1_j4_v);
                    $scope.reduceJ5Speed = parseInt(data.reducemode1_j5_v);
                    $scope.reduceJ6Speed = parseInt(data.reducemode1_j6_v);
                    $scope.reduceTCPSpeed = parseInt(data.reducemode1_tcp_v);
                } else if ($scope.selectedReduceMode.id == "1") {
                    $scope.reduceJ1Speed = parseInt(data.reducemode2_j1_v);
                    $scope.reduceJ2Speed = parseInt(data.reducemode2_j2_v);
                    $scope.reduceJ3Speed = parseInt(data.reducemode2_j3_v);
                    $scope.reduceJ4Speed = parseInt(data.reducemode2_j4_v);
                    $scope.reduceJ5Speed = parseInt(data.reducemode2_j5_v);
                    $scope.reduceJ6Speed = parseInt(data.reducemode2_j6_v);
                    $scope.reduceTCPSpeed = parseInt(data.reducemode2_tcp_v);
                }
                // 获取末端负载编号
                getEndLoadData();
                hidePageLoading();
                // 获取静态下碰撞检测开关
                $scope.selectEnableCollisionDetect = parseInt(~~data.collision_static);
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[0]);
                hidePageLoading();
                /* test */
                if (g_testCode) {
                    $scope.loadIdentifyDyn = ~~testRobotData.load_identify_dyn;
                }
                /* ./test */
            });
    }

    /** CI对应功能disable下拉框 */
    $scope.ctrlCIOptionsDisabled = function (selectedValue) {
        if (selectedValue == '-1' 
            || (selectedValue == '20' && g_systemFlag)
            || (selectedValue == '21' && g_systemFlag)
            || (selectedValue == '22' && g_systemFlag)
            || (selectedValue == '23' && g_systemFlag)
            || (selectedValue == '24' && g_systemFlag)) {
            return true;
        } else {
            return false;
        }
    }

    /** End-CI对应功能disable下拉框 */
    $scope.ctrlEndCIOptionsDisabled = function (selectedValue) {
        if (selectedValue == '-1') {
            return true;
        } else {
            return false;
        }
    }

    /** CO对应功能disable下拉框 */
    $scope.ctrlCOOptionsDisabled = function (selectedValue) {
        if (selectedValue == '-1' 
            || (selectedValue == '20' && g_systemFlag)
            || (selectedValue == '21' && g_systemFlag)
            || (selectedValue == '23' && g_systemFlag)
            || (selectedValue == '24' && g_systemFlag)
            || (selectedValue == '25' && g_systemFlag)
            || (selectedValue == '26' && g_systemFlag)
            || (selectedValue == '27' && g_systemFlag)) {
            return true;
        } else {
            return false;
        }
    }

    //根据二级菜单切换对应设置界面
    $('.setting-menu').tree();
    $scope.switchSettingPage = function(id){
        $(".navItem").removeClass("item-selected");
        $(".navItem" + id).addClass("item-selected");
        $(".childrenItem").removeClass("childItem-selected");
        $(".childrenItem" + id).addClass("childItem-selected");
        changeMountingBottomBarWidth();
        changeVRobotWidth();
        $scope.switchVirtualFunc(0);
        $scope.show_ToolCoord = false;
        $scope.show_ExTCPCoord = false;
        $scope.show_WObjCoord = false;
        $scope.show_EAxisCoord = false;
        $scope.show_Collide = false;
        $scope.show_Limit = false;
        $scope.show_Load = false;
        $scope.show_ftLoad = false;
        $scope.show_Motion = false;
        $scope.show_Friction = false;
        $scope.show_Speed = false;
        $scope.show_iofilter = false;
        $scope.show_Robotcfg = false;
        $scope.show_Set_Point = false;
        $scope.show_Set_ExTCP = false;
        $scope.show_SetWObj_Point = false;
        $scope.show_cfg_DI = false;
        $scope.show_cfg_DO = false;
        $scope.show_IO_alias = false;
        $scope.show_cfg_AI = false;
        $scope.show_out_put = false;
        switch(id){
            case "tool_coord":
                $scope.show_ToolCoord = true;
                break;
            case "external_tool_coord":
                $scope.show_ExTCPCoord = true;
                break;
            case "workpiece_coord":
                $scope.show_WObjCoord = true;
                break;
            case "extended_axis_coord":
                $scope.show_EAxisCoord = true;
                break;
            case "collision_level":
                $scope.show_Collide = true;
                break;
            case "soft_limit":
                $scope.show_Limit = true;
                break;
            case "end_load":
                $scope.show_Load = true;
                break;
            case "ft_load":
                $scope.show_ftLoad = true;
                break;
            case "friction_compensation":
                $scope.show_Friction = true;
                break;
            case "speed_scaling":
                $scope.show_Speed = true;
                break;
            case "io_filtering":
                $scope.show_iofilter = true;
                break;
            case "di_config":
                $scope.show_cfg_DI = true;
                break;
            case "do_config":
                $scope.show_cfg_DO = true;
                break;
            case "io_alias":
                $scope.show_IO_alias = true;
                break;
            case "ai_config":
                $scope.show_cfg_AI = true;
                break;
            case "out_put_reset":
                $scope.show_out_put = true;
                break;
            case "file_import_export":
                $scope.show_Robotcfg = true;
                break;
            case "free_mount":
                $scope.switchVirtualFunc(1);
                changeMountingWidth();
                break;
            case "fixed_mount":
                $scope.switchVirtualFunc(2);
                changeMountingWidth();
                break;
            default:
                break;
        }
    }

    /**工具坐标系设置 */
    /** 完成或返回后更新数据 */
    function updateTCPCorrectionData() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.selectedCfgDI8 = ~~data.ctl_di8_config + "";
                $scope.selectedCfgDI9 = ~~data.ctl_di9_config + "";
                $scope.selectedCfgDI10 = ~~data.ctl_di10_config + "";
                $scope.selectedCfgDI11 = ~~data.ctl_di11_config + "";
                $scope.selectedCfgDI12 = ~~data.ctl_di12_config + "";
                $scope.selectedCfgDI13 = ~~data.ctl_di13_config + "";
                $scope.selectedCfgDI14 = ~~data.ctl_di14_config + "";
                $scope.selectedCfgDI15 = ~~data.ctl_di15_config + "";
                robotDIList.forEach((item, index) => {
                    if ($scope[item] == "18") {
                        $scope.xDI = $scope.DICfgData[index + 1];
                    }
                    if ($scope[item] == "19") {
                        $scope.yDI = $scope.DICfgData[index + 1];
                    }
                });
                if ($scope.xDI.id != -1 && $scope.yDI.id != -1) {
                    $scope.isSuccessSetIO = true;
                }
                $scope.toolCorrectionCoord.x = data.tcp_coord_x;
                $scope.toolCorrectionCoord.y = data.tcp_coord_y;
                $scope.toolCorrectionCoord.z = data.tcp_coord_z;
                $scope.toolCorrectionCoord.rx = data.tcp_coord_a;
                $scope.toolCorrectionCoord.ry = data.tcp_coord_b;
                $scope.toolCorrectionCoord.rz = data.tcp_coord_c;
                if (data.tcp_coord_x == 0 && data.tcp_coord_y == 0 && data.tcp_coord_z == 0 && data.tcp_coord_a == 0 && data.tcp_coord_b == 0 && data.tcp_coord_c == 0) {
                    $scope.isConfigCorrectionDevice = false;
                } else {
                    $scope.isConfigCorrectionDevice = true;
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 返回工具坐标系向导类型选择页 */
    $scope.returnToolTCPWizard = function () {
        $scope.toolTCPWizardType = -1;
    }

    /** 进入激光校准设备配置页 */
    $scope.enterTCPCorrectionDeviceConfig = function () {
        $scope.showTCPCorrectionDeviceConfig = true;
    }

    /** 返回激光校准页 */
    $scope.returnTCPCorrectionPage = function () {
        $scope.showTCPCorrectionDeviceConfig = false;
        updateTCPCorrectionData();
    }

    /** CI对应功能disable下拉框 */
    $scope.tcpCIOptionsDisabled = function (selectedValue) {
        if (selectedValue != '0' && selectedValue != '18' && selectedValue != '19') {
            return true;
        } else {
            return false;
        }
    }

    /** 运行TCP校准程序 */
    $scope.calibrateToolTCP = function () {
        //生成lua程序
        let initProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: "FR_CalibrateTheToolTcp.lua"
            }
        }
        dataFactory.actData(initProgramCmd)
            .then(() => {
                g_fileNameForUpload = "FR_CalibrateTheToolTcp.lua";
                $scope.runFlag = 1;
                $scope.index_uploadProgName();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 计算工具TCP XYZ */
    $scope.computeXYZ = function () {
        let setCmd = {
            cmd: 647,
            data: {
                content: `TCPComputeXYZ(3,0,{0,0,0},{0,0,0},{0,0,0},{0,0,0})`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('robotSetting').addEventListener('647', e => {
        let arr = e.detail.split(',');
        $scope.computeToolCoorde.x = arr[0];
        $scope.computeToolCoorde.y = arr[1];
        $scope.computeToolCoorde.z = arr[2];
    });

    /** 计算工具TCP RPY */
    $scope.computeRPY = function () {
        let setCmd = {
            cmd: 646,
            data: {
                content: `TCPComputeRPY(0,10000,{0,0},{0,0})`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('robotSetting').addEventListener('646', e => {
        let arr = e.detail.split(',');
        $scope.computeToolCoorde.rx = arr[0];
        $scope.computeToolCoorde.ry = arr[1];
        $scope.computeToolCoorde.rz = arr[2];
    });
    

    /** 初始化程序并记录TCP中心点 */
    $scope.recordCorrectionCenterPoint = function () {
        //生成lua程序
        let initProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: "FR_CalibrateTheSensorCoodinateSystem.lua"
            }
        }
        dataFactory.actData(initProgramCmd)
            .then(() => {
                g_fileNameForUpload = "FR_CalibrateTheSensorCoodinateSystem.lua";
                let savePointCmd = {
                    cmd: "save_local_point",
                    data: {
                        "local": g_fileNameForUpload,
                        "name": "FR_CalibrateTeachingCenterPose",
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
                        $scope.isSuccessSetCP = true;
                    }, (status) => {
                        $scope.isSuccessSetCP = false;
                        toastFactory.error(status);
                    });
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 设置参数 */
    $scope.setCorrectionParam = function () {
        if ($scope.correctionRadius == '' || $scope.correctionRadius == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[51]);
            return;
        }
        if ($scope.correctionAngularSpeed == '' || $scope.correctionAngularSpeed == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[51]);
            return;
        }
        if ($scope.correctionDepth == '' || $scope.correctionDepth == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[51]);
            return;
        }
        $scope.setSysVarValue(1, $scope.correctionRadius);
        $scope.setSysVarValue(2, $scope.correctionAngularSpeed);
        $scope.setSysVarValue(3, $scope.correctionDepth);
        $scope.isSuccessSetParam = true;
    }

    /** 运行激光设备标定程序 */
    $scope.runCorrectionProgram = function () {
        if (!$scope.isSuccessSetIO && !$scope.isSuccessSetCP && !$scope.isSuccessSetParam) {
            toastFactory.info(rsDynamicTags.info_messages[52]);
            return;
        }
        $scope.runFlag = 0;
        $scope.index_uploadProgName();
    }
    /** 运行完成处理 */
    document.getElementById('robotSetting').addEventListener('program-completion', e => {
        if (e.detail == 1) {
            switch ($scope.runFlag) {
                case 0:
                    $scope.isSuccessRunProgram = true;
                    updateTCPCorrectionData();
                    break;
                case 1:
                    $scope.computeXYZ();
                    $scope.computeRPY();
                    break;
                default:
                    break;
            }
            $scope.runFlag = -1;
        }
    });

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
			} else if(9 == valuelength){
				for(let j=2; j<valuelength-1; j++){
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
    
    //工具坐标系数据保留三位小数
	function toolHandledecimal(data){ 
		for(let i=0; i<data.length; i++){
			let valuearr = Object.keys(data[i]);
            var valuelength = valuearr.length;
            for(let j=2; j<valuelength-2; j++){
                if (valuearr[j] == 'x' || valuearr[j] == 'y' || valuearr[j] == 'z' || valuearr[j] == 'rx' || valuearr[j] == 'ry' || valuearr[j] == 'rz' || valuearr[j] == 'precisionX' || valuearr[j] == 'precisionY' || valuearr[j] == 'precisionZ' || valuearr[j] == 'precision') {
                    data[i][valuearr[j]] = parseFloat(data[i][valuearr[j]]).toFixed(3);
                }
            }
		}
	}
    
    //计算出的结果保留三位小数
	function handlecompute(data){
		let temparr = Object.keys(data);
		var templength = temparr.length;
        for (let i = 0; i < templength; i++) {
            if ((data[temparr[i]] == "nan") || (data[temparr[i]] == "-nan")) {
                data[temparr[i]] = 0.000;
            } else {
                data[temparr[i]] = parseFloat(data[temparr[i]]).toFixed(3);
            }
        }
		return data;
    }
    
    //获取六点法计算坐标系数据
    document.getElementById('robotSetting').addEventListener('314', e => {
        $scope.nextPointSet(8);
        $scope.computeToolCoorde = handlecompute(JSON.parse(e.detail));
    })

    //获取四点法计算坐标系数据
    document.getElementById('robotSetting').addEventListener('557', e => {
        $scope.nextToolSixPointSet(6);
        $scope.computeToolCoorde = handlecompute(JSON.parse(e.detail));
    })

    //重命名工具坐标系名称
    $scope.renameToolCoordBtn = function(){
        if(0 == $scope.selectedToolCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        document.getElementById("renameToolCoord").value = $scope.selectedToolCoorde.name;
        $('#renameToolCoordModal').modal();
    }

    //工具坐标系六点法设置向导界面切换
    $scope.nextPointSet = function(id){
        $scope.show_Set_Point1 = false;
        $scope.show_Set_Point2 = false;
        $scope.show_Set_Point3 = false;
        $scope.show_Set_Point4 = false;
        $scope.show_Set_Point5 = false;
        $scope.show_Set_Point6 = false;
        $scope.show_Set_Point7 = false;
        $scope.show_Set_Point8 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_Set_Point1 = true;
                break;
            case 2:
                $scope.show_Set_Point2 = true;
                break;
            case 3:
                $scope.show_Set_Point3 = true;
                break;
            case 4:
                $scope.show_Set_Point4 = true;
                break;
            case 5:
                $scope.show_Set_Point5 = true;
                break;
            case 6:
                $scope.show_Set_Point6 = true;
                break;
            case 7:
                $scope.show_Set_Point7 = true;
                break;
            case 8:
                $scope.show_Set_Point8 = true;
                break;
            default:
                break;
        }
    }

    //工具坐标系四点法设置向导界面切换
    $scope.nextToolSixPointSet = function(id){
        $scope.show_Set_Tool_Four_Point1 = false;
        $scope.show_Set_Tool_Four_Point2 = false;
        $scope.show_Set_Tool_Four_Point3 = false;
        $scope.show_Set_Tool_Four_Point4 = false;
        $scope.show_Set_Tool_Four_Point5 = false;
        $scope.show_Set_Tool_Four_Point6 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_Set_Tool_Four_Point1 = true;
                break;
            case 2:
                $scope.show_Set_Tool_Four_Point2 = true;
                break;
            case 3:
                $scope.show_Set_Tool_Four_Point3 = true;
                break;
            case 4:
                $scope.show_Set_Tool_Four_Point4 = true;
                break;
            case 5:
                $scope.show_Set_Tool_Four_Point5 = true;
                break;
            case 6:
                $scope.show_Set_Tool_Four_Point6 = true;
            default:
                break;
        }
    }

    //设置点提示
    $scope.repeatMessage = function(){
        toastFactory.info(rsDynamicTags.info_messages[1]);
    }

    //检查工具坐标系
    $scope.checkToolCoord = function(index) {
        switch(index){
            case 1:
                var originalTool = $scope.originToolCoordeData[$scope.selectedToolCoorde.id];
                if((parseFloat(originalTool.x) != parseFloat($scope.selectedToolCoorde.x)) || (parseFloat(originalTool.y) != parseFloat($scope.selectedToolCoorde.y))
                || (parseFloat(originalTool.z) != parseFloat($scope.selectedToolCoorde.z)) || (parseFloat(originalTool.rx) != parseFloat($scope.selectedToolCoorde.rx))
                || (parseFloat(originalTool.ry) != parseFloat($scope.selectedToolCoorde.ry)) || (parseFloat(originalTool.rz) != parseFloat($scope.selectedToolCoorde.rz))
                || (parseFloat(originalTool.type) != parseFloat($scope.selectedToolCoorde.type)) || (parseFloat(originalTool.installation_site) != parseFloat($scope.selectedToolCoorde.installation_site))
                || (parseFloat(originalTool.tool_id_no) != parseFloat($scope.selectedToolCoorde.tool_id_no) && g_systemFlag)
                || (parseFloat(originalTool.load_id) != parseFloat($scope.selectedToolCoorde.load_id) && g_systemFlag)) {
                    $('#toolModal').modal();
                } else{
                    applyToolCoord();
                }
                break;
            case 2:
                var originalTool = $scope.originWObjCoordeData[$scope.selectedWObjCoorde.name];
                if((parseFloat(originalTool.x) != parseFloat($scope.selectedWObjCoorde.x))||(parseFloat(originalTool.y) != parseFloat($scope.selectedWObjCoorde.y))
                ||(parseFloat(originalTool.z) != parseFloat($scope.selectedWObjCoorde.z))||(parseFloat(originalTool.rx) != parseFloat($scope.selectedWObjCoorde.rx))
                ||(parseFloat(originalTool.ry) != parseFloat($scope.selectedWObjCoorde.ry))||(parseFloat(originalTool.rz) != parseFloat($scope.selectedWObjCoorde.rz)) ){
                    $('#wobjModal').modal();
                } else{
                    $scope.applyWObjCoord();
                }
                break;
        }    
    }

    //应用工具坐标系
    function applyToolCoord(){
        var toolCoordString = "";
        if (g_systemFlag == 0) {
            toolCoordString = "SetToolCoord("+$scope.selectedToolCoorde.id+","+$scope.selectedToolCoorde.x+","+$scope.selectedToolCoorde.y+","+$scope.selectedToolCoorde.z+","+$scope.selectedToolCoorde.rx+","+
		        $scope.selectedToolCoorde.ry+","+$scope.selectedToolCoorde.rz+","+$scope.selectedToolCoorde.type+","+$scope.selectedToolCoorde.installation_site+")";
        } else {
            toolCoordString = "SetToolCoord("+$scope.selectedToolCoorde.id+","+$scope.selectedToolCoorde.x+","+$scope.selectedToolCoorde.y+","+$scope.selectedToolCoorde.z+","+$scope.selectedToolCoorde.rx+","+
		        $scope.selectedToolCoorde.ry+","+$scope.selectedToolCoorde.rz+","+$scope.selectedToolCoorde.type+","+$scope.selectedToolCoorde.installation_site+","+$scope.selectedEndLoad.id+","+$scope.selectedMountLocation.id+")";
        }
         
        let setToolCoordCmd = {
            cmd: 316,
            data: {
                content:toolCoordString,
            },
        };
        dataFactory.setData(setToolCoordCmd)
            .then(() => {
                getToolCoordData();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //修改工具坐标系
    $scope.modifyToolCoord = function() {
        $('#toolModal').modal('hide');
        if(0 == $scope.selectedToolCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        let saveCmd = {
            cmd: "modify_tool_cdsystem",
            data: $scope.selectedToolCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                applyToolCoord();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清空当前坐标系
    let clearToolCoordFlg = 0;
    $scope.clearToolCoord = function(){
        if (clearToolCoordFlg == 0) {
            toastFactory.info(rsDynamicTags.info_messages[2]);
            clearToolCoordFlg = 1;
        } else {
            clearToolCoordFlg = 0;
            var senddata = {
                "name":$scope.selectedToolCoorde.name,
                "id":$scope.selectedToolCoorde.id,
                "x":"0",
                "y":"0",
                "z":"0",
                "rx":"0",
                "ry":"0",
                "rz":"0",
				"type":"0",
				"installation_site":"0"
            }
            if (g_systemFlag) {
                senddata["tool_id_no"] = '0';
                senddata["load_id"] = '0';
            }
            let saveCmd = {
                cmd: "modify_tool_cdsystem",
                data: senddata,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    
                    getToolCoordData();
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //修改当前坐标系名称
    $scope.renameToolCoordName = function(){
        $scope.inputToolCoordName = document.getElementById("renameToolCoord").value;
        for(let i=0;i<$scope.ToolCoordeData.length;i++){
            if($scope.inputToolCoordName == $scope.ToolCoordeData[i].name){
                toastFactory.info(rsDynamicTags.info_messages[3]);
                return;
            }
        }
        if ($scope.inputToolCoordName === "" || $scope.inputToolCoordName == null) {
            toastFactory.info(rsDynamicTags.info_messages[4]);
        } else {
            $scope.selectedToolCoorde.name = $scope.inputToolCoordName;
            let saveCmd = {
                cmd: "modify_tool_cdsystem",
                data: $scope.selectedToolCoorde,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    $('#renameToolCoordModal').modal('hide');
                    getToolCoordData();
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //获取工具坐标系数据
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                toolHandledecimal(data);
                $scope.ToolCoordeData = JSON.parse(JSON.stringify(data));
                $scope.toolCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                $scope.originToolCoordeData = JSON.parse(JSON.stringify(data));
				if(null != $scope.selectedToolCoorde.id){
                    $scope.selectedToolCoorde = $scope.ToolCoordeData[$scope.selectedToolCoorde.id];
				} else{
                    $scope.selectedToolCoorde = $scope.ToolCoordeData[0];
                }
                $scope.toolTypeData.forEach(item => {
                    if (item.id == $scope.selectedToolCoorde.type) {
                        $scope.selectedToolType = item;
                    }
                });
                $scope.mountingLocationData.forEach(item => {
                    if (item.id == $scope.selectedToolCoorde.installation_site) {
                        $scope.selectedMountLocation = item;
                    }
                });
                if (g_systemFlag) {
                    // 处理负载编号的数据
                    let getLoadCmd = {
                        cmd: 'get_load'
                    }
                    dataFactory.getData(getLoadCmd).then((data) => {
                        $scope.endLoadData = data;
                        $scope.endLoadData.forEach(item => {
                            if (item.id == $scope.selectedToolCoorde.load_id) {
                                $scope.selectedEndLoad = item;
                            }
                        });
                    }, (status) => {
                        $scope.endLoadData = [];
                    });
                }
                document.dispatchEvent(new CustomEvent('saveToolCoordData', { bubbles: true, cancelable: true, composed: true }));
				
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[1]);
                /*test */
                if (g_testCode) {
                    $scope.currentCoord = 0;
                    toolHandledecimal(testToolCoordeData);
                    $scope.ToolCoordeData = JSON.parse(JSON.stringify(testToolCoordeData));
                    $scope.originToolCoordeData = JSON.parse(JSON.stringify(testToolCoordeData));
                    if(null != $scope.selectedToolCoorde.id){
                        $scope.selectedToolCoorde = $scope.ToolCoordeData[$scope.selectedToolCoorde.id];
                    } else{
                        $scope.selectedToolCoorde = $scope.ToolCoordeData[0];
                    }
                    $scope.toolTypeData.forEach(item => {
                        if (item.id == $scope.selectedToolCoorde.type) {
                            $scope.selectedToolType = item;
                        }
                    });
                    $scope.mountingLocationData.forEach(item => {
                        if (item.id == $scope.selectedToolCoorde.installation_site) {
                            $scope.selectedMountLocation = item;
                        }
                    });
                    if (g_systemFlag) {
                        // 处理负载编号的数据
                        let getLoadCmd = {
                            cmd: 'get_load'
                        }
                        dataFactory.getData(getLoadCmd).then((data) => {
                            $scope.endLoadData = data;
                            $scope.endLoadData.forEach(item => {
                                if (item.id == $scope.selectedToolCoorde.load_id) {
                                    $scope.selectedEndLoad = item;
                                }
                            });
                        }, (status) => {
                            $scope.endLoadData = [];
                            $scope.endLoadData = testEndLoadList;
                            $scope.endLoadData.forEach(item => {
                                if (item.id == $scope.selectedToolCoorde.load_id) {
                                    $scope.selectedEndLoad = item;
                                }
                            });
                        });
                    }
                }
                /* ./test */
            });
    };

    /**
     * 修改工具类型时，同步修改工具坐标系数据中的type字段
     * @param {string} toolType 工具类型的id
     */
    $scope.modifyToolType = function(toolType) {
        $scope.selectedToolCoorde.type = toolType;
    }

    /**
     * 修改安装位置时，同步修改工具坐标系数据中的installation_site字段
     * @param {string} mountLocation 安装位置的id
     */
    $scope.modifyMountLocation = function(mountLocation) {
        $scope.selectedToolCoorde.installation_site = mountLocation;
    }
    
    /**
     * 修改负载编号时，同步修改工具坐标系数据中的load_id字段
     * @param {string} endLoad 负载编号的id
     */
    $scope.modifyEndLoad = function(endLoad) {
        $scope.selectedToolCoorde.load_id = endLoad;
    }

    //新建工具坐标系按键响应
    $scope.setToolPoint = function(index) {
        $scope.nextPointIndex = index + 1;
        var toolPointString = "SetToolPoint("+index+")";
        let setToolPointCmd = {
            cmd: 313,
            data: {
                content:toolPointString,
            },
        };
        dataFactory.setData(setToolPointCmd)
            .then(() => {
           }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('313', e => {
        if (e.detail == 1) {
            $scope.nextPointSet($scope.nextPointIndex);
        }
    })

    //计算坐标系
    $scope.computeToolCoord = function() {
        var computeToolString = "ComputeTool()";
        let computeToolCmd = {
            cmd: 314,
            data: {
                content:computeToolString,
            },
        };
        dataFactory.setData(computeToolCmd)
            .then(() => {
	    }, (status) => {
                toastFactory.error(status);
            });
    }

    //四点法新建工具坐标系按键响应
    $scope.setToolFourPoint = function(index) {
        $scope.nextToolSixPointIndex = index + 1;
        var toolPointString = "SetTcp4RefPoint("+index+")";
        let setToolPointCmd = {
            cmd: 556,
            data: {
                content:toolPointString,
            },
        };
        dataFactory.setData(setToolPointCmd)
            .then(() => {
           }, (status) => {
                toastFactory.error(status);
            });
    }
    
    document.getElementById('robotSetting').addEventListener('556', e => {
        if (e.detail == 1) {
            $scope.nextToolSixPointSet($scope.nextToolSixPointIndex);
        }
    })

    //四点法计算坐标系
    $scope.computeToolFourCoord = function() {
        var computeToolString = "ComputeTcp4()";
        let computeToolCmd = {
            cmd: 557,
            data: {
                content:computeToolString,
            },
        };
        dataFactory.setData(computeToolCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //保存坐标系
    $scope.saveToolCoord = function() {
        if(0 === $scope.selectedToolCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        $scope.selectedToolCoorde.x = $scope.computeToolCoorde.x+"";
        $scope.selectedToolCoorde.y = $scope.computeToolCoorde.y+"";
        $scope.selectedToolCoorde.z = $scope.computeToolCoorde.z+"";
        $scope.selectedToolCoorde.rx = $scope.computeToolCoorde.rx+"";
        $scope.selectedToolCoorde.ry = $scope.computeToolCoorde.ry+"";
        $scope.selectedToolCoorde.rz = $scope.computeToolCoorde.rz+"";
        $scope.selectedToolCoorde.type = $scope.selectedToolCoordType.id+"";
        if (g_systemFlag && $scope.modifyToolId) {
            $scope.selectedToolCoorde.tool_id_no = $scope.modifyToolId;
        }
        if (g_systemFlag && $scope.modifyEndLoad) {
            $scope.selectedToolCoorde.load_id = $scope.modifyEndLoad.id;
        }

        let saveCmd = {
            cmd: "modify_tool_cdsystem",
            data: $scope.selectedToolCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(rsDynamicTags.success_messages[0]);
                getToolCoordData();
                applyToolCoord();
                $scope.cancelToolCoord();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 切换坐标系后判断id为0，则将修改向导隐藏
     * @param {int} coordID 坐标系ID（工具，外部工具，工件，扩展轴）
     */
    $scope.changeCoord = function (coordID) {
        if (coordID == 0) {
            $scope.show_Set_Point = false;
            $scope.show_Set_ExTCP = false;
            $scope.show_SetWObj_Point = false;
            $scope.show_SetEAxis_Point = false;
        }
        $scope.toolTypeData.forEach(item => {
            if (item.id == $scope.selectedToolCoorde.type) {
                $scope.selectedToolType = item;
            }
        });
        $scope.mountingLocationData.forEach(item => {
            if (item.id == $scope.selectedToolCoorde.installation_site) {
                $scope.selectedMountLocation = item;
            }
        });
        if (g_systemFlag) {
            $scope.endLoadData.forEach(item => {
                if (item.id == $scope.selectedToolCoorde.load_id) {
                    $scope.selectedEndLoad = item;
                }
            });
        }
    }

    //修改工具坐标系操作显示
    $scope.newToolCoord = function() {
        if($scope.selectedToolCoorde.id == 0){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        if($scope.currentCoord != 0){
            toastFactory.info(rsDynamicTags.info_messages[49]);
            return;
        }
        $scope.show_Set_Point = true;
    }

    /** 取消修改工具坐标系 */
    $scope.cancelToolCoord = function () {
        $scope.show_Set_Point = false;
        $scope.show_Set_Normal_Tool = false;
        $scope.show_Set_Sensor_Tool = false;
        $scope.selectedToolCoordType = null;
        $scope.show_Set_Sensor_Tool_Inside = false;
        $scope.show_Set_Sensor_Tool_External = false;
        $scope.selectedLaserLocation = null;
        var toolwayarr = document.getElementsByName("toolpointway");
        toolwayarr[1].checked = false;
        toolwayarr[0].checked = true;
        var laserwayarr = document.getElementsByName("laserpointway");
        laserwayarr[1].checked = false;
        laserwayarr[0].checked = true;
    }

    //普通工具坐标系标定方法切换
    $scope.SetToolCoordMethod = function(id){
        $scope.show_toolcoord_four = false;
        $scope.show_toolcoord_six = false;
        switch(id){
            case 1:
                $scope.show_toolcoord_four = true;
                $scope.nextToolSixPointSet(1);
                break;
            case 2:
                $scope.show_toolcoord_six = true;
                $scope.nextPointSet(1);
                break;
            default:
                break;
        }
    }

    //选择工具类型
    $scope.changeToolType = function(index){
        if(index == 1){
            $scope.show_Set_Normal_Tool = false;
            $scope.show_Set_Sensor_Tool = true;
            $scope.show_Set_Sensor_Tool_Inside = false;
            $scope.show_Set_Sensor_Tool_External = false;
            $scope.selectedLaserLocation = null;
        }else{
            $scope.show_Set_Normal_Tool = true;
            $scope.show_Set_Sensor_Tool = false;
            $scope.SetToolCoordMethod(1);
        }
    }

    //选择传感器安装方式
    $scope.changeLaserSensorlocation = function(index){
        if(index == 1){
            $scope.show_Set_Sensor_Tool_Inside = false;
            $scope.show_Set_Sensor_Tool_External = true;
            $scope.SetExternalSensor(1);
        }else{
            $scope.show_Set_Sensor_Tool_Inside = true;
            $scope.show_Set_Sensor_Tool_External = false;
            $scope.SetInsideSensor(1);

        }
    }

    //传感器末端安装标定方法切换
    $scope.SetInsideSensor = function(id){
        $scope.show_eight_point = false;
        $scope.show_six_point = false;
        $scope.show_five_point = false;
        switch(id){
            case 1:
                $scope.show_six_point = true;
                $scope.nextsixPointSet(1);
                break;
            case 2:
                $scope.show_eight_point = true;
                $scope.nextEightPointSet(1);
                break;
            case 3:
                $scope.show_five_point = true;
                $scope.nextFivePointSet(1);
                break;
            default:
                break;
        }
    }

    //传感器外部安装标定方法切换
    $scope.SetExternalSensor = function(){
        $scope.nextThreePointSet(1);
    }

    //传感器参考点六点法设置向导
    $scope.nextsixPointSet = function(id){
        $scope.show_Sensor_six_Point1 = false;
        $scope.show_Sensor_six_Point2 = false;
        $scope.show_Sensor_six_Point3 = false;
        $scope.show_Sensor_six_Point4 = false;
        $scope.show_Sensor_six_Point5 = false;
        $scope.show_Sensor_six_Point6 = false;
        $scope.show_Sensor_six_Point7 = false;
        $scope.show_Sensor_six_Point8 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_Sensor_six_Point1 = true;
                break;
            case 2:
                $scope.show_Sensor_six_Point2 = true;
                break;
            case 3:
                $scope.show_Sensor_six_Point3 = true;
                break;
            case 4:
                $scope.show_Sensor_six_Point4 = true;
                break;
            case 5:
                $scope.show_Sensor_six_Point5 = true;
                break;
            case 6:
                $scope.show_Sensor_six_Point6 = true;
                break;
            case 7:
                $scope.show_Sensor_six_Point7 = true;
                break;
            case 8:
                $scope.show_Sensor_six_Point8 = true;
                break;
            default:
                break;
        }
    }


    //传感器参考点八点法设置向导
    $scope.nextEightPointSet = function(id){
        $scope.show_Sensor_Eight_Point1 = false;
        $scope.show_Sensor_Eight_Point2 = false;
        $scope.show_Sensor_Eight_Point3 = false;
        $scope.show_Sensor_Eight_Point4 = false;
        $scope.show_Sensor_Eight_Point5 = false;
        $scope.show_Sensor_Eight_Point6 = false;
        $scope.show_Sensor_Eight_Point7 = false;
        $scope.show_Sensor_Eight_Point8 = false;
        $scope.show_Sensor_Eight_Point9 = false;
        $scope.show_Sensor_Eight_Point10 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_Sensor_Eight_Point1 = true;
                break;
            case 2:
                $scope.show_Sensor_Eight_Point2 = true;
                break;
            case 3:
                $scope.show_Sensor_Eight_Point3 = true;
                break;
            case 4:
                $scope.show_Sensor_Eight_Point4 = true;
                break;
            case 5:
                $scope.show_Sensor_Eight_Point5 = true;
                break;
            case 6:
                $scope.show_Sensor_Eight_Point6 = true;
                break;
            case 7:
                $scope.show_Sensor_Eight_Point7 = true;
                break;
            case 8:
                $scope.show_Sensor_Eight_Point8 = true;
                break;
            case 9:
                $scope.show_Sensor_Eight_Point9 = true;
                break;
            case 10:
                $scope.show_Sensor_Eight_Point10 = true;
                break;
            default:
                break;
        }
    }

    //传感器参考点五点法设置向导
    $scope.nextFivePointSet = function(id){
        $scope.show_Sensor_five_Point1 = false;
        $scope.show_Sensor_five_Point2 = false;
        $scope.show_Sensor_five_Point3 = false;
        $scope.show_Sensor_five_Point4 = false;
        $scope.show_Sensor_five_Point5 = false;
        $scope.show_Sensor_five_Point6 = false;
        $scope.show_Sensor_five_Point7 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.fiveTPointList = [
                    {
                        x: null,
                        y: null,
                        z: null
                    },
                    {
                        x: null,
                        y: null,
                        z: null
                    },
                    {
                        x: null,
                        y: null,
                        z: null
                    },
                    {
                        x: null,
                        y: null,
                        z: null
                    },
                    {
                        x: null,
                        y: null,
                        z: null
                    }
                ];
                $scope.show_Sensor_five_Point1 = true;
                break;
            case 2:
                $scope.show_Sensor_five_Point2 = true;
                break;
            case 3:
                $scope.show_Sensor_five_Point3 = true;
                break;
            case 4:
                $scope.show_Sensor_five_Point4 = true;
                break;
            case 5:
                $scope.show_Sensor_five_Point5 = true;
                break;
            case 6:
                $scope.show_Sensor_five_Point6 = true;
                break;
            case 7:
                $scope.show_Sensor_five_Point7 = true;
                break;
            default:
                break;
        }
    }

    //传感器参考点三点法设置向导
    $scope.nextThreePointSet = function(id){
        $scope.show_Sensor_Three_Point1 = false;
        $scope.show_Sensor_Three_Point2 = false;
        $scope.show_Sensor_Three_Point3 = false;
        $scope.show_Sensor_Three_Point4 = false;
        $scope.show_Sensor_Three_Point5 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_Sensor_Three_Point1 = true;
                break;
            case 2:
                $scope.show_Sensor_Three_Point2 = true;
                break;
            case 3:
                $scope.show_Sensor_Three_Point3 = true;
                break;
            case 4:
                $scope.show_Sensor_Three_Point4 = true;
                break;
            case 5:
                $scope.show_Sensor_Three_Point5 = true;
                break;
            default:
                break;
        }
    }

    $scope.repeatMessage = function(){
        toastFactory.info(rsDynamicTags.info_messages[9]);
    }

    // 六点法配置传感器位姿点
    $scope.setLTPoint = function (index) {
        if (index == 0) {
            $scope.nextsixPointSet(1);
        } else {
            $scope.nextSixPointIndex = index + 1;
            var LTPointString = "SetLaserTrackingPoint(" + index + ")";
            let setLTPointCmd = {
                cmd: 261,
                data: {
                    content: LTPointString,
                },
            };
            dataFactory.setData(setLTPointCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        }
    }

    document.getElementById('robotSetting').addEventListener('261', e => {
        if (e.detail == 1) {
            $scope.nextsixPointSet($scope.nextSixPointIndex);
        }
    })

    // 八点法配置传感器位姿点
    $scope.setEightLTPoint = function (index) {
        if (index == 0) {
            $scope.nextEightPointSet(1);
        } else {
            $scope.nextEightPointIndex = index + 1;
            var EightLTPointString = "SetLaserSensorPoint_EightPoint(" + index + ")";
            let setEightLTPointCmd = {
                cmd: 273,
                data: {
                    content: EightLTPointString,
                },
            };
            dataFactory.setData(setEightLTPointCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        }
    }

    document.getElementById('robotSetting').addEventListener('273', e => {
        if (e.detail == 1) {
            $scope.nextEightPointSet($scope.nextEightPointIndex);
        }
    })

    // 五点法配置传感器位姿点
    $scope.setFiveTPoint = function (index) {
        if (index == 0) {
            $scope.nextFivePointSet(1);
        } else {
            $scope.nextFivePointIndex = index + 1;
            var FiveLTPointString = "SetLaserSensorPoint_FivePoint(" + index + ")";
            let setFiveLTPointCmd = {
                cmd: 658,
                data: {
                    content: FiveLTPointString,
                },
            };
            dataFactory.setData(setFiveLTPointCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        }
    }

    document.getElementById('robotSetting').addEventListener('658', e => {
        if (e.detail) {
            const fivePointResult = JSON.parse(e.detail);
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].x = parseFloat(fivePointResult.x).toFixed(2);
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].y = parseFloat(fivePointResult.y).toFixed(2);
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].z = parseFloat(fivePointResult.z).toFixed(2);
            $scope.nextFivePointSet($scope.nextFivePointIndex);
        } else {
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].x = null;
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].y = null;
            $scope.fiveTPointList[$scope.nextFivePointIndex - 2].z = null;
        }
    })

    //三点法配置传感器位姿点
    $scope.setThreeLTPoint = function (index) {
        $scope.nextThreePointIndex = index + 1;
        var ThreeLTPointString = "SetLaserSensorPoint_ThreePoint(" + index + ")";
        let setThreeLTPointCmd = {
            cmd: 276,
            data: {
                content: ThreeLTPointString,
            },
        };
        dataFactory.setData(setThreeLTPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('276', e => {
        if (e.detail == 1) {
            $scope.nextThreePointSet($scope.nextThreePointIndex);
        }
    })

    //六点法计算传感器位姿
    $scope.setComputesixLT = function () {
        let computesixLTCmd = {
            cmd: 262,
            data: {
                content: "ComputeLaserTracking()",
            },
        };
        dataFactory.setData(computesixLTCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[2]);
            });
    }

    //八点法计算传感器位姿
    $scope.setComputeEightLT = function () {
        let computetEightLTCmd = {
            cmd: 274,
            data: {
                content: "ComputeLaserSensorTCP_EightPoint()",
            },
        };
        dataFactory.setData(computetEightLTCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[3]);
            });
    }

    //五点法计算传感器位姿
    $scope.setComputefiveLT = function () {
        let computetFiveLTCmd = {
            cmd: 659,
            data: {
                content: "ComputeLaserSensorTCP_FivePoint()",
            },
        };
        dataFactory.setData(computetFiveLTCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[18]);
            });
    }

    //三点法计算传感器位姿
    $scope.setComputeThreeLT = function () {
        let computeThreeLTCmd = {
            cmd: 277,
            data: {
                content: "ComputeLaserSensorTCP_ThreePoint()",
            },
        };
        dataFactory.setData(computeThreeLTCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[4]);
            });
    }

    document.getElementById('robotSetting').addEventListener('262', e => {
        $scope.nextsixPointSet(8);
        $scope.computeLTCoord = handlecompute(JSON.parse(e.detail));
    })

    document.getElementById('robotSetting').addEventListener('274', e => {
        $scope.nextEightPointSet(10);
        $scope.computeLTCoord = handlecompute(JSON.parse(e.detail));
    })

    document.getElementById('robotSetting').addEventListener('277', e => {
        $scope.nextThreePointSet(5);
        $scope.computeLTCoord = handlecompute(JSON.parse(e.detail));
    })

    document.getElementById('robotSetting').addEventListener('659', e => {
        $scope.nextFivePointSet(7);
        $scope.computeLTCoord = handlecompute(JSON.parse(e.detail));
    })

    //保存坐标系
    $scope.saveLaserCoord = function() {
        if(0 === $scope.selectedToolCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        $scope.selectedToolCoorde.x = $scope.computeLTCoord.x+"";
        $scope.selectedToolCoorde.y = $scope.computeLTCoord.y+"";
        $scope.selectedToolCoorde.z = $scope.computeLTCoord.z+"";
        $scope.selectedToolCoorde.rx = $scope.computeLTCoord.rx+"";
        $scope.selectedToolCoorde.ry = $scope.computeLTCoord.ry+"";
        $scope.selectedToolCoorde.rz = $scope.computeLTCoord.rz+"";
        $scope.selectedToolCoorde.type = $scope.selectedToolCoordType.id+"";
        $scope.selectedToolCoorde.installation_site = $scope.selectedLaserLocation.id+"";
        if (g_systemFlag && $scope.modifyToolId) {
            $scope.selectedToolCoorde.tool_id_no = $scope.modifyToolId;
        }
        if (g_systemFlag && $scope.modifyEndLoad) {
            $scope.selectedToolCoorde.load_id = $scope.modifyEndLoad.id;
        }

        let saveCmd = {
            cmd: "modify_tool_cdsystem",
            data: $scope.selectedToolCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(rsDynamicTags.success_messages[0]);
                getToolCoordData();
                applyToolCoord();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**外部工具坐标系设置 */
    //获取外部工具坐标系数据
    function getExToolCoordData() {
        let getCmd = {
            cmd: "get_ex_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
				handledecimal(data);
                $scope.ExToolCoordeData = data;
                if(null != $scope.selectedToolExTCF){
					$scope.selectedToolExTCF = $scope.ExToolCoordeData[$scope.selectedToolExTCF.name];
					
				} else{
					$scope.selectedToolExTCF = $scope.ExToolCoordeData.etoolcoord0;
					
				}
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.success_messages[5]);
            });
    };

    //获取计算外部TCP数据
    document.getElementById('robotSetting').addEventListener('327', e => {    
        $scope.computeExTCFdata = handlecompute(JSON.parse(e.detail));
    })

    //获取计算外部TCP工具数据
    document.getElementById('robotSetting').addEventListener('329', e => {
        $scope.computeToolExTCFdata = handlecompute(JSON.parse(e.detail));
    })

    //外部工具TCP设置界面切换
    $scope.nextExTCPPointSet = function(id){
        $scope.show_ExTCP_Point1 = false;
        $scope.show_ExTCP_Point2 = false;
        $scope.show_ExTCP_Point3 = false;  
        $scope.show_ExTCP_Point4 = false;
        $scope.show_ExTCP_Point5 = false;
        $scope.show_ExTCP_Point6 = false;
        $scope.show_ToolExTCP_Point1 = false;
        $scope.show_ToolExTCP_Point2 = false;
        $scope.show_ToolExTCP_Point3 = false;  
        $scope.show_ToolExTCP_Point4 = false;
        $scope.show_ToolExTCP_Point5 = false;
        $scope.show_ToolExTCP_Point6 = false;
        $scope.show_Compute_ExTCP = false;
        $scope.show_Compute_ToolExTCP = false;
        $scope.show_Compute_ExTCP_Result = false;
        $scope.show_Compute_ToolExTCP_Result = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_ExTCP_Point1 = true;
                break;
            case 2:
                $scope.show_ExTCP_Point2 = true;
                break;
            case 3:
                $scope.show_ExTCP_Point3 = true;
                break;
            case 4:
                $scope.show_ExTCP_Point4 = true;
                break;
            case 5:
                $scope.show_ExTCP_Point5 = true;
                break;
            case 6:
                $scope.show_ExTCP_Point6 = true;
                break;
            case 7:
                $scope.show_ToolExTCP_Point1 = true;
                break;
            case 8:
                $scope.show_ToolExTCP_Point2 = true;
                break;
            case 9:
                $scope.show_ToolExTCP_Point3 = true;
                break;
            case 10:
                $scope.show_ToolExTCP_Point4 = true;
                break;
            case 11:
                $scope.show_ToolExTCP_Point5 = true;
                break;
            case 12:
                $scope.show_ToolExTCP_Point6 = true;
                break;
            case 13:
                $scope.show_Compute_ExTCP = true;
                break;
            case 14:
                $scope.show_Compute_ToolExTCP = true;
                break;
            case 15:
                $scope.show_Compute_ExTCP_Result = true;
                break;
            case 16:
                $scope.show_Compute_ToolExTCP_Result = true;
                break;
            default:
                break;
        }
    }

    //应用外部工具坐标系
    $scope.applyToolExTCFCoord = function() {
        var extoolCoordString = "SetExToolCoord(" + (~~($scope.selectedToolExTCF.id) + $scope.toolCoordeTotal) + ","
            + $scope.selectedToolExTCF.ex + "," + $scope.selectedToolExTCF.ey + "," + $scope.selectedToolExTCF.ez + ","
            + $scope.selectedToolExTCF.erx + "," + $scope.selectedToolExTCF.ery + "," + $scope.selectedToolExTCF.erz + ","
            + $scope.selectedToolExTCF.tx + "," + $scope.selectedToolExTCF.ty + "," + $scope.selectedToolExTCF.tz + ","
            + $scope.selectedToolExTCF.trx + "," + $scope.selectedToolExTCF.try + "," + $scope.selectedToolExTCF.trz + ")";
        let setexToolCoordCmd = {
            cmd: 330,
            data: {
                content:extoolCoordString,
            },
        };
        dataFactory.setData(setexToolCoordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清空当前外部工具坐标系
    let clearToolExTCFCoordFlg = 0;
    $scope.clearToolExTCFCoord = function(){
        if (clearToolExTCFCoordFlg == 0) {
            toastFactory.info(rsDynamicTags.info_messages[2]);
            clearToolExTCFCoordFlg = 1;
        } else {
            clearToolExTCFCoordFlg = 0;
            let senddata = {
                "name":$scope.selectedToolExTCF.name,
                "user_name":$scope.selectedToolExTCF.user_name,
                "id":$scope.selectedToolExTCF.id,
                "ex":"0",
                "ey":"0",
                "ez":"0",
                "erx":"0",
                "ery":"0",
                "erz":"0",    
                "tx":"0",
                "ty":"0",
                "tz":"0",
                "trx":"0",
                "try":"0",
                "trz":"0"   
            }
            let saveCmd = {
                cmd: "modify_ex_tool_cdsystem",
                data: senddata,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    
                    getExToolCoordData();
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //新建外部TCF工具参考点
    $scope.setExTCPPoint = function(index) {
        var exTCPString = "SetExTCPPoint("+index+")";
        let setExTCPCmd = {
            cmd: 326,
            data: {
                content:exTCPString,
            },
        };
        dataFactory.setData(setExTCPCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //新建工具TCF工具参考点
    $scope.setExTCPToolPoint = function(index) {
        var ExTCPToolString = "SetExTCPToolPoint("+index+")";
        let setExTCPToolCmd = {
            cmd: 328,
            data: {
                content:ExTCPToolString,
            },
        };
        dataFactory.setData(setExTCPToolCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //计算外部TCF
    $scope.computeExTCF = function() {
        var computeExTCFString = "ComputeExTCF()";
        let computeExTCFCmd = {
            cmd: 327,
            data: {
                content:computeExTCFString,
            },
        };
        dataFactory.setData(computeExTCFCmd)
            .then(() => {
                $scope.nextExTCPPointSet(15);
	    }, (status) => {
            toastFactory.error(status);
            });
    }

    //计算工具TCF
    $scope.computeToolExTCF = function() {
        var computeToolExTCFString = "ComputeToolExTCF()";
        let computeToolExTCFCmd = {
            cmd: 329,
            data: {
                content:computeToolExTCFString,
            },
        };
        dataFactory.setData(computeToolExTCFCmd)
            .then(() => {
                $scope.nextExTCPPointSet(16);
	    }, (status) => {
            toastFactory.error(status);
            });
    }

    //保存外部和工具坐标系
    $scope.saveExToolCoord = function() {
        $scope.ExToolname = document.getElementById("rextoolname").value;
        if((null === $scope.ExToolname) || (undefined === $scope.ExToolname)){
            toastFactory.info(rsDynamicTags.info_messages[10]);
            return;
        }
        if(0 === $scope.selectedToolExTCF.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        $scope.selectedToolExTCF.ex = $scope.computeExTCFdata.x+"";
        $scope.selectedToolExTCF.ey = $scope.computeExTCFdata.y+"";
        $scope.selectedToolExTCF.ez = $scope.computeExTCFdata.z+"";
        $scope.selectedToolExTCF.erx = $scope.computeExTCFdata.rx+"";
        $scope.selectedToolExTCF.ery = $scope.computeExTCFdata.ry+"";
        $scope.selectedToolExTCF.erz = $scope.computeExTCFdata.rz+"";
        $scope.selectedToolExTCF.tx = $scope.computeToolExTCFdata.x+"";
        $scope.selectedToolExTCF.ty = $scope.computeToolExTCFdata.y+"";
        $scope.selectedToolExTCF.tz = $scope.computeToolExTCFdata.z+"";
        $scope.selectedToolExTCF.trx = $scope.computeToolExTCFdata.rx+"";
        $scope.selectedToolExTCF.try = $scope.computeToolExTCFdata.ry+"";
        $scope.selectedToolExTCF.trz = $scope.computeToolExTCFdata.rz+"";
        $scope.selectedToolExTCF.user_name = $scope.ExToolname;

        let saveCmd = {
            cmd: "modify_ex_tool_cdsystem",
            data: $scope.selectedToolExTCF,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                getExToolCoordData();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //修改外部TCP坐标系操作显示
    $scope.newExTCPCoord = function() {
        if($scope.selectedToolExTCF.id == 0){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        if($scope.show_Set_ExTCP) {
            $scope.show_Set_ExTCP = false;
            $scope.nextExTCPPointSet(0);
        } else{
            $scope.show_Set_ExTCP = true;
            $scope.nextExTCPPointSet(1);
        }
    }


    /**工件坐标系设置 */
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
					$scope.selectedWObjReference = $scope.WObjCoordeData[`wobjcoord${~~$scope.selectedWObjCoorde.reference}`];
				} else{
					$scope.selectedWObjCoorde = $scope.WObjCoordeData.wobjcoord0;
				}
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[6]);
            });
    };

    //获取计算工件TCP工具数据
    document.getElementById('robotSetting').addEventListener('250', e => {
        $scope.computeWObjCoorde = handlecompute(JSON.parse(e.detail));
    })

    //工件坐标系设置向导界面切换
    $scope.nextWObjPointSet = function(id){
        $scope.show_SetWObj_Point1 = false;
        $scope.show_SetWObj_Point2 = false;
        $scope.show_SetWObj_Point3 = false;
        $scope.show_SetWObj_Point4 = false;
        $scope.show_SetWObj_Point5 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_SetWObj_Point1 = true;
                break;
            case 2:
                $scope.show_SetWObj_Point2 = true;
                break;
            case 3:
                $scope.show_SetWObj_Point3 = true;
                break;
            case 4:
                $scope.show_SetWObj_Point4 = true;
                break;
            case 5:
                $scope.show_SetWObj_Point5 = true;
                break;
            default:
                break;
        }
    }

    //根据所选标定方式显示图片
    $scope.wobjPictureChange = function(){
        $scope.show_Wobj3_Picture = false;
        $scope.show_Wobj4_Picture = false;
        switch(~~($scope.selectedWobjMethod.id)){
            case 0:
                $scope.show_Wobj3_Picture = true;
                break;
            case 1:
                $scope.show_Wobj4_Picture = true;
                break;
            default:
                break;
        }
    }

    //应用工件坐标系
    $scope.applyWObjCoord = function() {
        let WObjCoordString;
        if (g_systemFlag) {
            WObjCoordString = "SetWObjCoord("+$scope.selectedWObjCoorde.id+","+$scope.selectedWObjCoorde.x+","+$scope.selectedWObjCoorde.y+","+$scope.selectedWObjCoorde.z+","+$scope.selectedWObjCoorde.rx+","+$scope.selectedWObjCoorde.ry+","+$scope.selectedWObjCoorde.rz+","+$scope.selectedWObjReference.id+")";
        } else {
            WObjCoordString = "SetWObjCoord("+$scope.selectedWObjCoorde.id+","+$scope.selectedWObjCoorde.x+","+$scope.selectedWObjCoorde.y+","+$scope.selectedWObjCoorde.z+","+$scope.selectedWObjCoorde.rx+","+$scope.selectedWObjCoorde.ry+","+$scope.selectedWObjCoorde.rz+")";
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

    //修改工件坐标系
    $scope.modifyWObjCoord = function() {
        $('#wobjModal').modal('hide');
        if(0 == $scope.selectedWObjCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        let saveCmd = {
            cmd: "modify_wobj_tool_cdsystem",
            data: $scope.selectedWObjCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                $scope.applyWObjCoord();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清空当前工件坐标系
    let clearWObjCoordFlg = 0;
    $scope.clearWObjCoord = function(){
        if (clearWObjCoordFlg == 0) {
            toastFactory.info(rsDynamicTags.info_messages[2]);
            clearWObjCoordFlg = 1;
        } else {
            clearWObjCoordFlg = 0;
            var senddata = {
                "name":$scope.selectedWObjCoorde.name,
                "id":$scope.selectedWObjCoorde.id,
                "x":"0",
                "y":"0",
                "z":"0",
                "rx":"0",
                "ry":"0",
                "rz":"0" 
            }
            if (g_systemFlag) {
                senddata['reference'] = $scope.selectedWObjCoorde.name;
            }
            let saveCmd = {
                cmd: "modify_wobj_tool_cdsystem",
                data: senddata,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    
                    getWObjCoordData();
                    document.dispatchEvent(new CustomEvent('update_wobjCoord_data', { bubbles: true, cancelable: true, composed: true }));
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //新建工件坐标系参考点
    $scope.setWObjPoint = function(index) {
        if ($scope.currentCoord == 0) {
            toastFactory.info(rsDynamicTags.info_messages[11]);
            return
        }
        $scope.nextWObjPointSet(index+1);
        var WObjPointString = "SetWObjCoordPoint("+index+")";
        let setWObjPointCmd = {
            cmd: 249,
            data: {
                content:WObjPointString,
            },
        };
        dataFactory.setData(setWObjPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 计算工件TCF
     * @param {int} methodId 标定方法，0-原点-x轴-z轴，1-原点-x轴-xy+平面
     * @param {int} refFrame 参考工件坐标系，范围[0~19]
     */
    $scope.computeWObjCoord = function(methodId,refFrame) {
        $scope.nextWObjPointSet(5);

        let content;
        if (g_systemFlag) {
            content = "ComputeWObjCoord("+ methodId + "," + refFrame +")"
        } else {
            content = "ComputeWObjCoord("+ methodId +")";
        }
        let computeWObjCoordCmd = {
            cmd: 250,
            data: {
                content:content
            },
        };
        dataFactory.setData(computeWObjCoordCmd)
            .then(() => {
                // $scope.nextWObjPointSet(5);
	    }, (status) => {
                toastFactory.error(status);
            });
    }

    //保存工件坐标系
    $scope.saveWObjCoord = function() {
        if($scope.selectedWObjCoorde.id == 0){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        $scope.selectedWObjCoorde.x = $scope.computeWObjCoorde.x+"";
        $scope.selectedWObjCoorde.y = $scope.computeWObjCoorde.y+"";
        $scope.selectedWObjCoorde.z = $scope.computeWObjCoorde.z+"";
        $scope.selectedWObjCoorde.rx = $scope.computeWObjCoorde.rx+"";
        $scope.selectedWObjCoorde.ry = $scope.computeWObjCoorde.ry+"";
        $scope.selectedWObjCoorde.rz = $scope.computeWObjCoorde.rz+"";
        $scope.selectedWObjCoorde.reference = $scope.selectedWObjReference.id+"";

        let saveCmd = {
            cmd: "modify_wobj_tool_cdsystem",
            data: $scope.selectedWObjCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(rsDynamicTags.success_messages[1]);
                getWObjCoordData();
                document.dispatchEvent(new CustomEvent('update_wobjCoord_data', { bubbles: true, cancelable: true, composed: true }));
                $scope.applyWObjCoord();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //修改工件坐标系操作显示
    $scope.newWObjCoord = function() {
        if($scope.selectedWObjCoorde.id == 0){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        if($scope.show_SetWObj_Point) {
            $scope.show_SetWObj_Point = false;
            $scope.nextWObjPointSet(0);
        } else{
            $scope.show_SetWObj_Point = true;
            $scope.nextWObjPointSet(1);
        }
    }

    /**扩展轴坐标系设置 */
    //获取外部轴工具坐标系数据
    function getEAxisCoordData() {
        let getCmd = {
            cmd: "get_exaxis_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
				handledecimal(data);
                $scope.EAxisCoordeData = data;
                if(null != $scope.selectedEAxisCoorde){
					$scope.selectedEAxisCoorde = $scope.EAxisCoordeData[$scope.selectedEAxisCoorde.name];
					
				} else{
					$scope.selectedEAxisCoorde = $scope.EAxisCoordeData.exaxis0;
					
				}
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[7]);
            });
    };

    //获取计算外部轴TCP工具数据
    document.getElementById('robotSetting').addEventListener('289', e => {
        $scope.computeEAxisCoord = handlecompute(JSON.parse(e.detail));
    })

    //获取计算外部轴TCP工具数据
    document.getElementById('robotSetting').addEventListener('390', e => {
        $scope.computeEAxisCoord = handlecompute(JSON.parse(e.detail));
    })
        
    //外部轴坐标系设置向导界面切换
    $scope.nextEAxisPointSet = function(id){
        $scope.show_SetEAxis_Point1 = false;
        $scope.show_SetEAxis_Point2 = false;
        $scope.show_SetEAxis_Point3 = false;
        $scope.show_SetEAxis_Point4 = false;
        $scope.show_SetEAxis_Point5 = false;
        $scope.show_SetEAxis_Point6 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_SetEAxis_Point1 = true;
                break;
            case 2:
                $scope.show_SetEAxis_Point2 = true;
                break;
            case 3:
                $scope.show_SetEAxis_Point3 = true;
                break;
            case 4:
                $scope.show_SetEAxis_Point4 = true;
                break;
            case 5:
                $scope.show_SetEAxis_Point5 = true;
                break;
            case 6:
                $scope.show_SetEAxis_Point6 = true;
                break;
            default:
                break;
        }
    }

    //外部轴坐标系变位机设置向导界面切换
    $scope.nextPositionerSet = function(id){
        $scope.show_Positioner_Point1 = false;
        $scope.show_Positioner_Point2 = false;
        $scope.show_Positioner_Point3 = false;
        $scope.show_Positioner_Point4 = false;
        $scope.show_Positioner_Point5 = false;
        $scope.show_Positioner_Point6 = false;
        $scope.show_Positioner_Point7 = false;
        switch(id){
            case 0:
                $scope.show_Positioner_Point = false;
                break;
            case 1:
                $scope.show_Positioner_Point1 = true;
                break;
            case 2:
                $scope.show_Positioner_Point2 = true;
                break;
            case 3:
                $scope.show_Positioner_Point3 = true;
                break;
            case 4:
                $scope.show_Positioner_Point4 = true;
                break;
            case 5:
                $scope.show_Positioner_Point5 = true;
                break;
            case 6:
                $scope.show_Positioner_Point6 = true;
                break;
            case 7:
                $scope.show_Positioner_Point7 = true;
                break;
            default:
                break;
        }
    }

    $scope.turnpagetoPoisitioner = function(){
        $scope.show_Eaxis_Set1 = false;
        $scope.show_Eaxis_Set2 = false;
        $scope.show_Eaxis_Set3 = false;
        $scope.show_Eaxis_Set4 = false;
        $scope.show_Eaxis_Set5 = false;
        if($scope.selectedFreeDegree.id==0){
            $scope.show_Eaxis_Set1 = true;
        }else if($scope.selectedFreeDegree.id==1){
            $scope.show_Eaxis_Set2 = true;
            $scope.show_Positioner_Point = true;
            $scope.nextPositionerSet(1);
        }else if($scope.selectedFreeDegree.id==2){
            $scope.show_Eaxis_Set3 = true;
        }else if($scope.selectedFreeDegree.id==3){
            $scope.show_Eaxis_Set4 = true;
        }else if($scope.selectedFreeDegree.id==4){
            $scope.show_Eaxis_Set5 = true;
            $scope.show_Eaxis_Set2 = true;
            $scope.show_Positioner_Point = true;
            $scope.nextPositionerSet(1);
            $scope.positionerReferencex = 0;
            $scope.positionerReferencey = 0;
            $scope.positionerReferencez = 0;
            $scope.positionerReferencerx = 0;
            $scope.positionerReferencery = 0;
            $scope.positionerReferencerz = 0;
        }
    }

    //激活去激活外部轴坐标系
    $scope.activeEAxisCoord = function(index){
        $scope.activeexaxisid = 0;
        var tempArr = $scope.selectedEAxisCoorde.exaxisid.split(",");
        for(var i=0;i<tempArr.length;i++){
            if(tempArr[i] == 1){
                $scope.activeexaxisid = $scope.activeexaxisid+1;
            } else if(tempArr[i] == 2){
                $scope.activeexaxisid = $scope.activeexaxisid+2;
            }
            else if(tempArr[i] == 3){
                $scope.activeexaxisid = $scope.activeexaxisid+4;
            }
            else if(tempArr[i] == 4){
                $scope.activeexaxisid = $scope.activeexaxisid+8;
            }
        }
        var activeEAxisCoordString = "ExtAxisActiveECoordSys("+$scope.activeexaxisid+","+$scope.selectedEAxisCoorde.id+","+$scope.selectedEAxisCoorde.x+","+$scope.selectedEAxisCoorde.y+","+$scope.selectedEAxisCoorde.z+","+$scope.selectedEAxisCoorde.rx+","+$scope.selectedEAxisCoorde.ry+","+$scope.selectedEAxisCoorde.rz+","+$scope.selectedEAxisCoorde.flag+")";
        let activeEAxisCoordCmd = {
            cmd: 287,
            data: {
                content:activeEAxisCoordString,
            },
        };
        dataFactory.setData(activeEAxisCoordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[8]);
            });
    }

    //清空当前外部轴坐标系
    let clearEAxisCoordFlg = 0;
    $scope.clearEAxisCoord = function(){
        if (clearEAxisCoordFlg == 0) {
            toastFactory.info(rsDynamicTags.info_messages[2]);
            clearEAxisCoordFlg = 1;
        } else {            
            clearEAxisCoordFlg = 0;
            if($scope.selectedEAxisCoorde.id != 0){
                var sendexaxisid = $scope.selectedEAxisCoorde.exaxisid;
            } else{
                var sendexaxisid = "0";
            }
            var senddata = {
                "name":$scope.selectedEAxisCoorde.name,
                "exaxisid":"0",
                "id":$scope.selectedEAxisCoorde.id,
                "x":"0",
                "y":"0",
                "z":"0",
                "rx":"0",
                "ry":"0",
                "rz":"0" ,
                "flag":"0"
            }
            let saveCmd = {
                cmd: "modify_exaxis_cdsystem",
                data: senddata,
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    
                    getEAxisCoordData();
                    document.dispatchEvent(new CustomEvent('update_eaxisCoord_data', { bubbles: true, cancelable: true, composed: true }));
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //新建外部轴坐标系参考点
    $scope.setEAxisPoint = function(index) {
        $scope.nextEAxisPointSet(index+1);
        var setEAxisPointString = "ExtAxisSetRefPoint("+index+")";
        let setEAxisPointCmd = {
            cmd: 288,
            data: {
                content:setEAxisPointString,
            },
        };
        dataFactory.setData(setEAxisPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //计算外部轴TCF
    $scope.setComputeEAxisCoord = function() {
        $scope.nextEAxisPointSet(6);
        let computeEAxisCoordCmd = {
            cmd: 289,
            data: {
                content:"ExtAxisComputeECoordSys()",
            },
        };
        dataFactory.setData(computeEAxisCoordCmd)
            .then(() => {

	    }, (status) => {
            toastFactory.error(status);
            });
    }

    //变位机参考点标定
    $scope.setRefPointInExAxisEnd = function(){
        $scope.nextPositionerSet(2);
        let setRefPointInExAxisEndCmd = {
            cmd: 388,
            data: {
                content:"SetRefPointInExAxisEnd("+$scope.positionerReferencex+","+$scope.positionerReferencey+","+$scope.positionerReferencez+","
                +$scope.positionerReferencerx+","+$scope.positionerReferencery+","+$scope.positionerReferencerz+")",
            },
        };
        dataFactory.setData(setRefPointInExAxisEndCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //变位机四点法标定
    $scope.setPositionerPoint = function(index){
        $scope.nextPositionerSet(index+2);
        var setPositionorSetRefPointString = "PositionorSetRefPoint("+index+")";
        let setPositionorSetRefPointCmd = {
            cmd: 389,
            data: {
                content:setPositionorSetRefPointString,
            },
        };
        dataFactory.setData(setPositionorSetRefPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //计算变位机坐标系
    $scope.computePositionerCoord = function(){
        $scope.nextPositionerSet(7);
        let setPositionorComputeECoordSysCmd = {
            cmd: 390,
            data: {
                content:"PositionorComputeECoordSys()",
            },
        };
        dataFactory.setData(setPositionorComputeECoordSysCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //保存外部轴工具坐标系
    $scope.applyEAxisCoord = function(index) {
        if(index == 1){
            $scope.nextEAxisPointSet(0);
        } else if(index == 2){
            $scope.show_Positioner_Point = false;
            $scope.nextPositionerSet(0);
        }
        $scope.show_SetEAxis_Point = false;
        if(0 === $scope.selectedEAxisCoorde.id){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        $scope.selectedEAxisCoorde.x = $scope.computeEAxisCoord.x+"";
        $scope.selectedEAxisCoorde.y = $scope.computeEAxisCoord.y+"";
        $scope.selectedEAxisCoorde.z = $scope.computeEAxisCoord.z+"";
        $scope.selectedEAxisCoorde.rx = $scope.computeEAxisCoord.rx+"";
        $scope.selectedEAxisCoorde.ry = $scope.computeEAxisCoord.ry+"";
        $scope.selectedEAxisCoorde.rz = $scope.computeEAxisCoord.rz+"";
        $scope.selectedEAxisCoorde.flag = "1";
        switch(~~$scope.selectedFreeDegree.id){
            case 0:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id;
                break;
            case 1:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id;
                break;
            case 2:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id + "," +$scope.selectedEAxisTest3ID.id;
                break;
            case 3:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id + "," +$scope.selectedEAxisTest3ID.id + "," +$scope.selectedEAxisTest4ID.id;
                break;
            case 4:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id;
                break;
            default:
                break;
        }

        let saveCmd = {
            cmd: "modify_exaxis_cdsystem",
            data: $scope.selectedEAxisCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                getEAxisCoordData();
                toastFactory.success(rsDynamicTags.success_messages[0]);
                document.dispatchEvent(new CustomEvent('update_eaxisCoord_data', { bubbles: true, cancelable: true, composed: true }));
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //未标定外部轴保存外部轴工具坐标系
    $scope.testapplyEAxisCoord = function() {
        switch(~~$scope.selectedFreeDegree.id){
            case 0:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id;
                break;
            case 1:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id;
                break;
            case 2:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id + "," +$scope.selectedEAxisTest3ID.id;
                break;
            case 3:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id + "," +$scope.selectedEAxisTest2ID.id + "," +$scope.selectedEAxisTest3ID.id + "," +$scope.selectedEAxisTest4ID.id;
                break;
            case 4:
                $scope.selectedEAxisCoorde.exaxisid = $scope.selectedEAxisTest1ID.id;
                break;
            default:
                break;
        }
        $scope.selectedEAxisCoorde.flag = "0";

        let saveCmd = {
            cmd: "modify_exaxis_cdsystem",
            data: $scope.selectedEAxisCoorde,
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                getEAxisCoordData();
                toastFactory.success(rsDynamicTags.success_messages[0]);
                document.dispatchEvent(new CustomEvent('update_eaxisCoord_data', { bubbles: true, cancelable: true, composed: true }));
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //选择自由度数切换显示
    $scope.show_Free_Degree1 = true;
    $scope.showFreeDegree = function(){
        $scope.show_Free_Degree1 = false;
        $scope.show_Free_Degree2 = false;
        $scope.show_Free_Degree3 = false;
        $scope.show_Free_Degree4 = false;
        $scope.show_Free_Degree5 = false;
        $scope.show_Eaxis_Set1 = false;
        $scope.show_Eaxis_Set2 = false;
        $scope.show_Eaxis_Set3 = false;
        $scope.show_Eaxis_Set4 = false;
        $scope.show_Eaxis_Set5 = false;
        $scope.axis_d1 = 0;
        $scope.axis_d2 = 0;
        $scope.axis_d3 = 0;
        $scope.axis_d4 = 0;
        $scope.axis_a1 = 0;
        $scope.axis_a2 = 0;
        $scope.axis_a3 = 0;
        $scope.axis_a4 = 0;
        switch(~~$scope.selectedFreeDegree.id){
            case 0:
                $scope.show_Free_Degree1 = true;
                // $scope.show_Eaxis_Set1 = true;
                break;
            case 1:
                $scope.axis_d1 = 128.5;
                $scope.axis_d2 = 206.4;
                $scope.axis_a1 = 0;
                $scope.axis_a2 = 0;
                $scope.show_Free_Degree1 = true;
                $scope.show_Free_Degree2 = true;
                // $scope.show_Eaxis_Set2 = true;
                break;
            case 2:
                $scope.show_Free_Degree1 = true;
                $scope.show_Free_Degree2 = true;
                $scope.show_Free_Degree3 = true;
                // $scope.show_Eaxis_Set3 = true;
                break;
            case 3:
                $scope.show_Free_Degree1 = true;
                $scope.show_Free_Degree2 = true;
                $scope.show_Free_Degree3 = true;
                $scope.show_Free_Degree4 = true;
                // $scope.show_Eaxis_Set4 = true;
                break;
            case 4:
                $scope.show_Free_Degree1 = true;
                // $scope.show_Eaxis_Set5 = true;
                break;
            default:
                break;
        }
    }

    //修改外部轴坐标系操作显示
    $scope.newEAxisCoord = function() {
        if($scope.selectedEAxisCoorde.id == 0){
            toastFactory.info(rsDynamicTags.info_messages[0]);
            return;
        }
        if($scope.show_SetEAxis_Point) {
            $scope.show_SetEAxis_Point = false;
            $scope.nextEAxisPointSet(0);
            $scope.nextPositionerSet(0);
        } else{
            $scope.show_SetEAxis_Point = true;
            $scope.nextEAxisPointSet(1);
            $scope.nextPositionerSet(1);
        }
        $scope.show_Eaxis_Set1 = false;
        $scope.show_Eaxis_Set2 = false;
        $scope.show_Eaxis_Set3 = false;
        $scope.show_Eaxis_Set4 = false;
        $scope.show_Eaxis_Set5 = false;
    }

    //处理外部轴配置参数
	function handelEAxisCfgData(tempdata){
        $scope.ExternaAxisCfgData = tempdata.cfg;
		let length = $scope.ExternaAxisCfgData.length;
        for(let i=0;i<length;i++){
            $scope.ExternaAxisCfgData[i].axis_id = ~~($scope.ExternaAxisCfgData[i].axis_id);
			$scope.ExternaAxisCfgData[i].axis_type = ~~($scope.ExternaAxisCfgData[i].axis_type);
			$scope.ExternaAxisCfgData[i].axis_direction = ~~($scope.ExternaAxisCfgData[i].axis_direction);
			$scope.ExternaAxisCfgData[i].axis_possoftlimit = ~~($scope.ExternaAxisCfgData[i].axis_possoftlimit);
			$scope.ExternaAxisCfgData[i].axis_negsoftlimit = ~~($scope.ExternaAxisCfgData[i].axis_negsoftlimit);
			$scope.ExternaAxisCfgData[i].axis_speed = ~~($scope.ExternaAxisCfgData[i].axis_speed);
			$scope.ExternaAxisCfgData[i].axis_acc = ~~($scope.ExternaAxisCfgData[i].axis_acc);
			$scope.ExternaAxisCfgData[i].axis_enres = ~~($scope.ExternaAxisCfgData[i].axis_enres);
            $scope.ExternaAxisCfgData[i].axis_lead = parseFloat($scope.ExternaAxisCfgData[i].axis_lead).toFixed(3);
            $scope.ExternaAxisCfgData[i].axis_offset = ~~($scope.ExternaAxisCfgData[i].axis_offset);
            $scope.ExternaAxisCfgData[i].axis_company = ~~($scope.ExternaAxisCfgData[i].axis_company);
            $scope.ExternaAxisCfgData[i].axis_model = ~~($scope.ExternaAxisCfgData[i].axis_model);
            $scope.ExternaAxisCfgData[i].axis_enctype = ~~($scope.ExternaAxisCfgData[i].axis_enctype);
		}
    }

    //读取外部轴参数配置文件
    function getEAxiscfg(){
        let getEAxiscfgCmd = {
            cmd: "get_exaxis_cfg",
        };
        dataFactory.getData(getEAxiscfgCmd)
            .then((data) => {
                handelEAxisCfgData(data);    
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[9]);
            });
    }

    //外部轴选择不同厂商对应参数选择改变
    $scope.changeExAxisCompany = function(num){
        if(0 == num){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }else if(1 == num){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisINOVANCEType;
        }else if(2 == num){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisPANASONICType;
        }else {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }
        $scope.selectedEAxisCompanyType = $scope.ExternaAxisCompanyType[0];
    }

    //扩展轴配置参数显示
    function showEaxisCfg(){
        $scope.setEAxisCfgData  = $scope.ExternaAxisCfgData[$scope.selectedEAxisCfgID.id-1];
        $scope.selectedSetEAxisTyp = $scope.ExternaAxisTypData[$scope.setEAxisCfgData.axis_type];
        $scope.selectedSetEAxisDir = $scope.ExternaAxisDirData[$scope.setEAxisCfgData.axis_direction];
        $scope.selectedSetEAxisLead = $scope.setEAxisCfgData.axis_lead;
        $scope.selectedEAxisCompany = $scope.ExternaAxisCompany[$scope.setEAxisCfgData.axis_company];
        if(0 == $scope.selectedEAxisCompany.id){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }else if(1 == $scope.selectedEAxisCompany.id){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisINOVANCEType;
        }else if(2 == $scope.selectedEAxisCompany.id){
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisPANASONICType;
        }else{
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }
        $scope.selectedEAxisCompanyType = $scope.ExternaAxisCompanyType[$scope.setEAxisCfgData.axis_model];
        $scope.selectedEAxisCompanyModel = $scope.ExternaAxisModel[$scope.setEAxisCfgData.axis_enctype];
    }
    
    //扩展轴配置窗口1
    $("#RConveyorcfg1").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest1ID;
        showEaxisCfg();
       
        $('#RConverCfgModal').modal();
    });

    //扩展轴配置窗口2
    $("#RConveyorcfg2").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest2ID;
        showEaxisCfg();
        $('#RConverCfgModal').modal();
    });

    //扩展轴配置窗口3
    $("#RConveyorcfg3").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest3ID;
        showEaxisCfg();
        $('#RConverCfgModal').modal();
    });

    //扩展轴配置窗口4
    $("#RConveyorcfg4").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest4ID;
        showEaxisCfg();
        $('#RConverCfgModal').modal();
    });


    //处理扩展轴号
    function handleexaxisid(index){
        $scope.exaxisidTrabsfer = 0;
        if(index == 1){
            $scope.exaxisidTrabsfer = 1;
        } else if(index == 2){
            $scope.exaxisidTrabsfer = 2;
        } else if(index == 3){
            $scope.exaxisidTrabsfer = 4;
        } else if(index == 4){
            $scope.exaxisidTrabsfer = 8;
        }
    }

    //扩展轴参数配置
    $scope.setEAxisParamCfg = function(){
        handleexaxisid($scope.selectedEAxisCfgID.id);
        var EAxisParamCfgString = "ExtAxisParamConfig("+$scope.exaxisidTrabsfer+","+
		$scope.selectedSetEAxisTyp.id+","+
		$scope.selectedSetEAxisDir.id+","+
		$scope.setEAxisCfgData.axis_possoftlimit+","+
		$scope.setEAxisCfgData.axis_negsoftlimit+","+
		$scope.setEAxisCfgData.axis_speed+","+
		$scope.setEAxisCfgData.axis_acc+","+
		$scope.selectedSetEAxisLead+","+
		$scope.setEAxisCfgData.axis_enres+","+
        $scope.setEAxisCfgData.axis_offset+
        ","+
		$scope.selectedEAxisCompany.id+","+
		$scope.selectedEAxisCompanyType.id+","+
        $scope.selectedEAxisCompanyModel.id+
        ")";
        let EAxisParamCfgCmd = {
            cmd: 291,
            data: {
                content:EAxisParamCfgString,
            },
        };		
        dataFactory.setData(EAxisParamCfgCmd)
            .then(() => {
				setTimeout(getEAxiscfg,1000);
                $("#ConverCfgModal").modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //扩展轴零点配置窗口
    $("#RConveyorZero1").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest1ID;
        $('#RConverZeroModal').modal();
    });

    $("#RConveyorZero2").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest2ID;
        $('#RConverZeroModal').modal();
    });

    $("#RConveyorZero3").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest3ID;
        $('#RConverZeroModal').modal();
    });

    $("#RConveyorZero4").click(function () {
        $scope.selectedEAxisCfgID = $scope.selectedEAxisTest4ID;
        $('#RConverZeroModal').modal();
    });

    //设定外部轴零点
    $scope.setEAxisZero = function(){
        if($scope.EAxisRDY[$scope.selectedEAxisCfgID.id-1] != 1){
            toastFactory.info(rsDynamicTags.info_messages[12]);
            $('#ConverZeroModal').modal('hide');
            return;
        }
        handleexaxisid($scope.selectedEAxisCfgID.id);
        var SetEAxisZeroString = "ExtAxisSetHoming("+$scope.selectedEAxisCfgID.id+","+$scope.selectedEAxisZeroMode.id+","+$scope.HomeSearchVel+","+$scope.HomeLatchVel+")";
        let SetEAxisZeroCmd = {
            cmd: 290,
            data: {
                content:SetEAxisZeroString,
            },
        };
        dataFactory.setData(SetEAxisZeroCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 处理外部轴零点数据
     * @param {array} zeroData 
     */
    function handleZeroStateData(zeroData) {
        if (zeroData[$scope.selectedEAxisCfgID.id-1] == 0) {
            $scope.zeroStateText = "";
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 1) {
            $scope.zeroStateText = rsDynamicTags.info_messages[13];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 2) {
            $scope.zeroStateText = rsDynamicTags.info_messages[14];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 3) {
            $scope.zeroStateText = rsDynamicTags.info_messages[15];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 4) {
            $scope.zeroStateText = rsDynamicTags.info_messages[16];
        }
    }

    $scope.zeroStateText = "";
    if (g_zeroStateInit) {
        handleZeroStateData(g_zeroStateInit);
    }
    // 监听外部轴零点数据
    document.getElementById('robotSetting').addEventListener('EAxisZero', function (e) {
        handleZeroStateData(e.detail);
    });

    $scope.GetExaxisDrive = function(index){
        $scope.show_ExaxisDriveText1 = false;
        $scope.show_ExaxisDriveText2 = false;
        $scope.show_ExaxisDriveText3 = false;
        $scope.show_ExaxisDriveText4 = false;
        switch(index){
            case 1:
                $scope.show_ExaxisDriveText1 = true;
                break;
            case 2:
                $scope.show_ExaxisDriveText2 = true;
                break;
            case 3:
                $scope.show_ExaxisDriveText3 = true;
                break;
            case 4:
                $scope.show_ExaxisDriveText4 = true;
                break;
            default:
                break;
        }
        handleexaxisid($scope.selectedEAxisCfgID.id);
        let getExaxisDriveCmd = {
            cmd: 393,
            data: {
                content:"GetExAxisDriverConfig("+$scope.exaxisidTrabsfer+")",
            },
        };
        dataFactory.setData(getExaxisDriveCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[10]);
            });
    }

    document.getElementById('robotSetting').addEventListener('393', function (e) {
        $scope.ExaxisDriveText1 = "";
        $scope.ExaxisDriveText2 = "";
        $scope.ExaxisDriveText3 = "";
        $scope.ExaxisDriveText4 = "";
        var driverInfo = JSON.parse(e.detail);
        if($scope.show_ExaxisDriveText1){
            $scope.zeroStateText1 += $scope.ExternaAxisCompany[driverInfo.company].name;
            if(0 == driverInfo.company){
                $scope.zeroStateText1 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }else if(1 == driverInfo.company){
                $scope.zeroStateText1 += $scope.ExternaAxisINOVANCEType[driverInfo.model].name;
            }else if(2 == driverInfo.company){
                $scope.zeroStateText1 += $scope.ExternaAxisPANASONICType[driverInfo.model].name;
            }else{
                $scope.zeroStateText1 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }
            $scope.zeroStateText1 += $scope.ExternaAxisModel[driverInfo.encType].name;
        } else if($scope.show_ExaxisDriveText2){
            $scope.zeroStateText2 += $scope.ExternaAxisCompany[driverInfo.company].name;
            if(0 == driverInfo.company){
                $scope.zeroStateText2 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }else if(1 == driverInfo.company){
                $scope.zeroStateText2 += $scope.ExternaAxisINOVANCEType[driverInfo.model].name;
            }else if(2 == driverInfo.company){
                $scope.zeroStateText2 += $scope.ExternaAxisPANASONICType[driverInfo.model].name;
            }else{
                $scope.zeroStateText2 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }
            $scope.zeroStateText2 += $scope.ExternaAxisModel[driverInfo.encType].name;
        } else if($scope.show_ExaxisDriveText2){
            $scope.zeroStateText3 += $scope.ExternaAxisCompany[driverInfo.company].name;
            if(0 == driverInfo.company){
                $scope.zeroStateText3 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }else if(1 == driverInfo.company){
                $scope.zeroStateText3 += $scope.ExternaAxisINOVANCEType[driverInfo.model].name;
            }else if(2 == driverInfo.company){
                $scope.zeroStateText3 += $scope.ExternaAxisPANASONICType[driverInfo.model].name;
            }else{
                $scope.zeroStateText3 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }
            $scope.zeroStateText3 += $scope.ExternaAxisModel[driverInfo.encType].name;
        } else if($scope.show_ExaxisDriveText2){
            $scope.zeroStateText4 += $scope.ExternaAxisCompany[driverInfo.company].name;
            if(0 == driverInfo.company){
                $scope.zeroStateText4 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }else if(1 == driverInfo.company){
                $scope.zeroStateText4 += $scope.ExternaAxisINOVANCEType[driverInfo.model].name;
            }else if(2 == driverInfo.company){
                $scope.zeroStateText4 += $scope.ExternaAxisPANASONICType[driverInfo.model].name;
            }else{
                $scope.zeroStateText4 += $scope.ExternaAxisHCFAType[driverInfo.model].name;
            }
            $scope.zeroStateText4 += $scope.ExternaAxisModel[driverInfo.encType].name;
        }
        toastFactory.success(rsDynamicTags.success_messages[2]);
    });

    //设置外部轴连杆
    $scope.setAxisDHParaConfig = function(){
        var axisDHParaConfigStr;
        switch(~~$scope.selectedFreeDegree.id){
            case 0:
                axisDHParaConfigStr = "SetAxisDHParaConfig(" + $scope.selectedFreeDegree.id+","+$scope.axis_d1+",0,0,0,"+$scope.axis_a1+",0,0,0)";
                break;
            case 1:
                axisDHParaConfigStr = "SetAxisDHParaConfig(" + $scope.selectedFreeDegree.id+","+$scope.axis_d1+","+$scope.axis_d2+",0,0,"+$scope.axis_a1+","+$scope.axis_a2+",0,0)";
                break;
            case 2:
                axisDHParaConfigStr = "SetAxisDHParaConfig(" + $scope.selectedFreeDegree.id+","+$scope.axis_d1+","+$scope.axis_d2+","+$scope.axis_d3+",0,"+$scope.axis_a1+","+$scope.axis_a2+","+$scope.axis_a3+",0)";
                break;
            case 3:
                axisDHParaConfigStr = "SetAxisDHParaConfig(" + $scope.selectedFreeDegree.id+","+$scope.axis_d1+","+$scope.axis_d2+","+$scope.axis_d3+","+$scope.axis_d4+","+$scope.axis_a1+","+$scope.axis_a2+","+$scope.axis_a3+","+$scope.axis_a4+")";
                break;
            case 4:
                axisDHParaConfigStr = "SetAxisDHParaConfig(" + $scope.selectedFreeDegree.id+","+$scope.axis_d1+",0,0,0,"+$scope.axis_a1+",0,0,0)";
                break;
            default:
                break;
        }
        let axisDHParaConfigCmd = {
            cmd: 293,
            data: {
                content:axisDHParaConfigStr,
            },
        };
        dataFactory.setData(axisDHParaConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置机器人相对扩展轴位置
    $scope.setRobotPosToAxis = function(){
        let setRobotPosToAxisCmd = {
            cmd: 294,
            data: {
                content:"SetRobotPosToAxis("+$scope.selectedDegreePosition.id+")",
            },
        };
        dataFactory.setData(setRobotPosToAxisCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //选择碰撞设置类型
    $scope.show_Collision_Standard = true;
    $scope.show_Collision_Custom = false;
    $scope.changeCollisionMode = function(){
        if($scope.selectedGradeMode.id == 1){
            $scope.show_Collision_Standard = false;
            $scope.show_Collision_Custom = true;
        }else{
            $scope.show_Collision_Standard = true;
            $scope.show_Collision_Custom = false;
        }
    }

    //设置碰撞等级
    $scope.applycollision = function() {
        var collisionString;
        if($scope.selectedGradeMode.id == 1){
            collisionString = "SetAnticollision("+$scope.selectedGradeMode.id+",{"+$scope.customCollisionJ1/10+","+$scope.customCollisionJ2/10+","+$scope.customCollisionJ3/10+","
            +$scope.customCollisionJ4/10+","+$scope.customCollisionJ5/10+","+$scope.customCollisionJ6/10+"},1)";
        }else{
            collisionString = "SetAnticollision("+$scope.selectedGradeMode.id+",{"+$scope.selectedJ1Grade.id+","+$scope.selectedJ2Grade.id+","+$scope.selectedJ3Grade.id+","
            +$scope.selectedJ4Grade.id+","+$scope.selectedJ5Grade.id+","+$scope.selectedJ6Grade.id+"},1)";
        }
        let setcollisionCmd = {
            cmd: 305,
            data: {
                content:collisionString,
            },
        };
        dataFactory.setData(setcollisionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置碰撞策略
    $scope.applyCollisionStrategy = function() {
        let setcollisionStrategyCmd = {
            cmd: 569,
            data: {
                content: `SetCollisionStrategy(${$scope.selectedCollideStrategy.id},${$scope.reboundSafeTime},${$scope.reboundSafeDistance},{${$scope.selectedJ1ReboundFactor.id},${$scope.selectedJ2ReboundFactor.id},${$scope.selectedJ3ReboundFactor.id},${$scope.selectedJ4ReboundFactor.id},${$scope.selectedJ5ReboundFactor.id},${$scope.selectedJ6ReboundFactor.id}})`,
            },
        };
        dataFactory.setData(setcollisionStrategyCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 静态下碰撞检测
     * @param {int} enable 
     */
    $scope.setStaticCollisionOnOff = function(enable) {
        let setCmd = {
            cmd: 960,
            data: {
                content:"SetStaticCollisionOnOff("+enable+")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 设置成功后再次获取数据
    document.getElementById('robotSetting').addEventListener('960', () => {
        getRobotdata();
    })

    //机器人限位设置应用下发指令函数
    $scope.applyLimit = function() {
        if ($scope.j1MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[17]);
        } else if ($scope.j2MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[18]);
        } else if ($scope.j3MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[19]);
        } else if ($scope.j4MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[20]);
        } else if ($scope.j5MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[21]);
        } else if ($scope.j6MaxLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[22]);
        } else if ($scope.j1MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[23]);
        } else if ($scope.j2MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[24]);
        } else if ($scope.j3MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[25]);
        } else if ($scope.j4MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[26]);
        } else if ($scope.j5MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[27]);
        } else if ($scope.j6MinLimit === "") {
            toastFactory.info(rsDynamicTags.info_messages[28]);
        } else {
            let positiveLimitString = "SetLimitPositive("+$scope.j1MaxLimit+","+$scope.j2MaxLimit+","+$scope.j3MaxLimit+","+$scope.j4MaxLimit+","+$scope.j5MaxLimit+","+$scope.j6MaxLimit+")";
            let setPositiveLimitCmd = {
                cmd: 308,
                data: {
                    content:positiveLimitString,
                },
            };
            dataFactory.setData(setPositiveLimitCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[11]);
                });
    
            let negativeLimitString = "SetLimitNegative("+$scope.j1MinLimit+","+$scope.j2MinLimit+","+$scope.j3MinLimit+","+$scope.j4MinLimit+","+$scope.j5MinLimit+","+$scope.j6MinLimit+")";
            let setNegativeLimitCmd = {
                cmd: 309,
                data: {
                    content:negativeLimitString,
                }
            };
            dataFactory.setData(setNegativeLimitCmd)
                .then(() => {
                    
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[12]);
                });
        }
    }

    //机器人限位恢复应用下发指令函数
    $scope.resumeLimit = function() {
        let positiveLimitString;
        let negativeLimitString;
        if (g_robotType.type == 1) {
            positiveLimitString = "SetLimitPositive(175,85,150,85,175,175)";
            negativeLimitString = "SetLimitNegative(-175,-265,-150,-265,-175,-175)";
        } else if (g_robotType.type == 6) {
            positiveLimitString = "SetLimitPositive(360,85,150,85,360,360)";
            negativeLimitString = "SetLimitNegative(-360,-265,-150,-265,-360,-360)";
        } else if (g_robotType.type == 7) {
            positiveLimitString = "SetLimitPositive(360,85,160,85,360,360)";
            negativeLimitString = "SetLimitNegative(-360,-265,-160,-265,-360,-360)";
        } else if (g_robotTypeCode == 802) {
            positiveLimitString = "SetLimitPositive(175,85,135,175,265,175)";
            negativeLimitString = "SetLimitNegative(-175,-265,-135,-175,-85,-175)";
        } else if (g_robotTypeCode == 901) {
            positiveLimitString = "SetLimitPositive(175,85,150,85,355,175)";
            negativeLimitString = "SetLimitNegative(-175,-265,-150,-265,0,-175)";
        } else if (g_robotTypeCode == 902) {
            positiveLimitString = "SetLimitPositive(175,85,160,85,355,175)";
            negativeLimitString = "SetLimitNegative(-175,-265,-160,-265,0,-175)";
        } else {
            positiveLimitString = "SetLimitPositive(175,85,160,85,175,175)";
            negativeLimitString = "SetLimitNegative(-175,-265,-160,-265,-175,-175)";
        }
        // 下发默认正限位
        let setPositiveLimitCmd = {
            cmd: 308,
            data: {
                content: positiveLimitString
            }
        }
        dataFactory.setData(setPositiveLimitCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[11]);
            });
        // 下发默认负限位
        let setNegativeLimitCmd = {
            cmd: 309,
            data: {
                content: negativeLimitString
            }
        }
        dataFactory.setData(setNegativeLimitCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[12]);
            });
    }

    //机器人限位恢复后，获取结果
    document.getElementById('robotSetting').addEventListener('309', () => {
        getRobotdata();
    });

    // 获取末端负载列表
    function getEndLoadData() {
        let getLoadCmd = {
            cmd: 'get_load'
        }
        dataFactory.getData(getLoadCmd).then((data) => {
            $scope.endLoadList = data;
            $scope.currentEndLoad = $scope.currentEndLoad ? $scope.endLoadList.find(item => item.id == $scope.currentEndLoad.id) : $scope.endLoadList[0];
            if (g_systemFlag) {
                $scope.selectEndLoad($scope.currentEndLoad);
            }
        }, (status) => {
            $scope.endLoadList = [];
            toastFactory.error(status, rsDynamicTags.error_messages[21]);
            /* test */
            if (g_testCode) {
                $scope.endLoadList = testEndLoadList;
                $scope.currentEndLoad = $scope.currentEndLoad ? $scope.currentEndLoad : $scope.endLoadList[0];
                $scope.selectEndLoad($scope.currentEndLoad);
                console.log($scope.endLoadList, '$scope.endLoadList');
            }
            /* ./test */
        });
    }

    /**
     * 切换末端负载
     * @param {Object} value 当前末端负载的信息
     */
    $scope.selectEndLoad = function(value) {
        $scope.loadLocationx = value.x;
        $scope.loadLocationy = value.y;
        $scope.loadLocationz = value.z;
        $scope.loadWeight = value.weight;
    }

    /**负载名称编辑 */
    $scope.renameEndLoadBtn = function() {
        if (!$scope.currentEndLoad) {
            toastFactory.info(rsDynamicTags.info_messages[48]);
        } else {
            $scope.inputEndLoadName = $scope.currentEndLoad.name;
            $('#renameEndLoad').modal();
        }
    }

    /*确认修改末端负载名称 */
    $scope.renameEndLoadName = function() {
        $scope.setEndLoadData($scope.inputEndLoadName);
        $('#renameEndLoad').modal('hide');
    }

    /**
     * 修改末端负载
     * @param {String} loadName 末端负载名称
     */
    $scope.setEndLoadData = function(loadName) {
        if (loadName == "" || loadName == null || loadName == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[48]);
        } else if ($scope.loadWeight == "" || $scope.loadWeight == null || $scope.loadWeight == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[29]);
        } else if ($scope.loadLocationx == "" || $scope.loadLocationx == null || $scope.loadLocationx == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[30]);
        } else if ($scope.loadLocationy == "" || $scope.loadLocationy == null || $scope.loadLocationy == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[31]);
        } else if ($scope.loadLocationz == "" || $scope.loadLocationz == null || $scope.loadLocationz == undefined) {
            toastFactory.info(rsDynamicTags.info_messages[32]);
        } else {
            let setLoadWeightCmd = {
                cmd: 'modify_load',
                data: {
                    name: loadName,
                    id: $scope.currentEndLoad.id,
                    x: $scope.loadLocationx,
                    y: $scope.loadLocationy,
                    z: $scope.loadLocationz,
                    weight: $scope.loadWeight
                }
            };
            dataFactory.actData(setLoadWeightCmd).then(() => {
                getEndLoadData();
                if ($scope.currentEndLoad.name == loadName) {
                    toastFactory.success(rsDynamicTags.success_messages[7]);
                } else {
                    $scope.currentEndLoad.name = loadName
                    toastFactory.success(rsDynamicTags.success_messages[8]);
                }
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[22]);
            });
        }
    }

    //清空负载辨识结果
    $scope.clearLoadLocation = function(){
        $scope.loadWeight = "0";
        $scope.loadLocationx = "0";
        $scope.loadLocationy = "0";
        $scope.loadLocationz = "0";
        $scope.setEndLoadData($scope.currentEndLoad.name);
    }

    // 打开负载辨识页面
    $scope.setLoadIdent = function() {
        if ($scope.loadIdentifyDyn == 0) {
            if ($scope.show_load_ident) {
                $scope.show_load_ident = false;
            } else {
                $scope.show_load_ident = true;
            }
        } else {
            toastFactory.info(rsDynamicTags.info_messages[45]);
        }
    }

    //新工具数据测量
    $scope.new_tool_pytest_point = 0;
    $scope.show_New_Tool_Measure = false;
    $scope.setNewToolData = function(){
        if (g_robotType.type != 2) {   // 该功能目前只适用于FR5
            toastFactory.info(rsDynamicTags.info_messages[46]);
            return;
        }
        $scope.show_New_Tool_Measure = true;
        $scope.new_tool_pytest_point = 1;
        let jointsData = {
            "j1":"-72.365",
            "j2":"-64.691",
            "j3":"61.602",
            "j4":"35.486",
            "j5":"-67.450",
            "j6":"18.045"
        }
        let loadclacTCFCmd = {
            "cmd": 320,
            "data": jointsData,
        }
        dataFactory.setData(loadclacTCFCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
        $scope.newToolMeasure(1);
    }

    //负载辨识设置界面切换
    $scope.newToolMeasure = function(id){
        $scope.show_New_Tool_Measure1 = false;
        $scope.show_New_Tool_Measure2 = false;
        switch(id){
            case 0:
                $scope.show_New_Tool_Measure = false;
                break;
            case 1:
                $scope.show_New_Tool_Measure1 = true;
                break;
            case 2:
                $scope.show_New_Tool_Measure2 = true;
                break;
            default:
                break;
        }
    }

    //负载辨识慢速运动
    var Load_SlowMotion_File = "";
    $scope.newSlowMotion = function(){
        if("0" != $scope.controlMode){
            toastFactory.warning(rsDynamicTags.warning_messages[1]);
            return;
        } 
        g_fileDataForUpload = "";
        g_fileDataForUpload = Load_SlowMotion_File;
        var speedString = "SetSpeed("+$scope.loadSpeed+")";
        let setSpeedCmd = {
            cmd: 206,
            data: {
                content:speedString,
            },
        };
        dataFactory.setData(setSpeedCmd)
            .then(() => {
                
                $scope.index_uploadProgName();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //负载辨识正常运动
    var Load_NormalMotion_File = "";
    $scope.newNormalMotion = function(){
        if("0" != $scope.controlMode){
            toastFactory.warning(rsDynamicTags.warning_messages[1]);
            return;
        } 
        g_fileDataForUpload = "";
        g_fileDataForUpload = Load_NormalMotion_File;
        var speedString = "SetSpeed("+$scope.loadSpeed+")";
        let setSpeedCmd = {
            cmd: 206,
            data: {
                content:speedString,
            },
        };
        dataFactory.setData(setSpeedCmd)
            .then(() => {
                $scope.index_uploadProgName();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //负载辨识正常运动
    var Load_NormalMotion_File = "";
    $scope.displayNewLoadResult = function(){
        if($scope.programStatus != "Stopped"){
            toastFactory.info(rsDynamicTags.info_messages[39]);
            return;
        } 
        $scope.newToolMeasure(2);
        var loadIdentifyGetResultString = "LoadIdentifyGetResult({1,1,1,1,1.05,1,1,1,1,1,1,1})";
        let setLoadIdentifyGetResultCmd = {
            cmd: 663,
            data: {
                content:loadIdentifyGetResultString,
            },
        };
        dataFactory.setData(setLoadIdentifyGetResultCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('663', e => {
        var getLoadDate = JSON.parse(e.detail);
        $scope.IDentNewWeight = parseFloat(getLoadDate.weight).toFixed(3);
        $scope.IDentNewX = parseFloat(getLoadDate.x).toFixed(3);
        $scope.IDentNewY = parseFloat(getLoadDate.y).toFixed(3);
        $scope.IDentNewZ = parseFloat(getLoadDate.z).toFixed(3);
    });

    //应用负载辨识结果
    $scope.setIdentifyNewLoad = function(){
        $scope.loadWeight = $scope.IDentNewWeight;
        $scope.loadLocationx = $scope.IDentNewX;
        $scope.loadLocationy = $scope.IDentNewY;
        $scope.loadLocationz = $scope.IDentNewZ;
        $scope.setEndLoadData($scope.currentEndLoad.name);
    }

    //工具数据测量
    $scope.show_Tool_Measure = false;
    $scope.setToolData = function(){
        if("0" != $scope.controlMode){
            toastFactory.warning(rsDynamicTags.warning_messages[1]);
            return;
        } 
        if($scope.currentWobjCoord != 0 || $scope.currentCoord != 0){
            toastFactory.info(rsDynamicTags.info_messages[33]);
            return;
        }
        $scope.show_Tool_Measure = true;
        $scope.toolMeasure(1);
        $scope.confirmQualityRange();
    }

    //确定负载质量范围
    $scope.confirmQualityRange = function(){
        if(g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901){
            $scope.jointthird = 30;
        }else{
            $scope.jointthird = 50;
        }
        $scope.jointfifth = 5;
        $scope.jointsix = 30;
        $scope.loadSpeed = 5;
        // $scope.LoadIdentifySetJointRange(0);
    }

    //设置负载辨识关节运动范围并根据关节计算TCF
    $scope.jointthird_flag = 0;
    $scope.jointthird_flag1 = 0;
    $scope.jointthird_flag2 = 0;
    $scope.jointthird_flag3 = 0;
    $scope.jointfifth_flag = 0;
    $scope.jointfifth_flag0 = 0;
    $scope.jointfifth_flag1 = 0;
    $scope.jointfifth_flag2 = 0;
    $scope.jointfifth_flag3 = 0;
    $scope.jointsix_flag = 0;
    $scope.jointsix_flag1 = 0;
    $scope.jointsix_flag2 = 0;
    $scope.jointsix_flag3 = 0;
    $scope.LoadIdentifySetJointRange = function(index) {
        if($scope.currentWobjCoord != 0 || $scope.currentCoord != 0){
            toastFactory.info(rsDynamicTags.info_messages[33]);
            return;
        }
	let idjointsData = {
            "j1":"-134.571",
            "j2":"-89.884",
            "j3":"-90.035",
            "j4":"-179.990",
            "j5":"0.084",
            "j6":"0.020"
        }
        switch(index) {
            case 0:
                $scope.jointfifth_flag0 = 1;
                let loadj5_0clacTCFCmd = {
                    "cmd": 320,
                    "data": idjointsData,
                }
                dataFactory.setData(loadj5_0clacTCFCmd)
                    .then(() => {
                    }, (status) => {
                        toastFactory.error(status, rsDynamicTags.error_messages[13]);
                    })
                break;
            case 1:
                $scope.jointfifth_flag1 = 1;
                idjointsData.j5 = "0";
                let loadj5clacTCFCmd = {
                    "cmd": 320,
                    "data": idjointsData,
                }
                dataFactory.setData(loadj5clacTCFCmd)
                    .then(() => {
                    }, (status) => {
                        toastFactory.error(status, rsDynamicTags.error_messages[13]);
                    })
                break;
            case 2:
                if(!$scope.jointfifth_flag){
                    toastFactory.info(rsDynamicTags.info_messages[35]);
                    return;
                }
                $scope.jointthird_flag1 = 1;
                idjointsData.j3 = "-90";
                let loadj3clacTCFCmd = {
                    "cmd": 320,
                    "data": idjointsData,
                }
                dataFactory.setData(loadj3clacTCFCmd)
                    .then(() => {
                    }, (status) => {
                        toastFactory.error(status, rsDynamicTags.error_messages[14]);
                    })
                break;
            case 3:
                if(!$scope.jointfifth_flag){
                    toastFactory.info(rsDynamicTags.info_messages[35]);
                    return;
                } else if(!$scope.jointthird_flag){
                    toastFactory.info(rsDynamicTags.info_messages[36]);
                    return;
                }
                $scope.jointsix_flag1 = 1;
                idjointsData.j6 = "0";
                let loadj6clacTCFCmd = {
                    "cmd": 320,
                    "data": idjointsData,
                }
                dataFactory.setData(loadj6clacTCFCmd)
                    .then(() => {   
                    }, (status) => {
                        toastFactory.error(status, rsDynamicTags.error_messages[15]);
                    })
                break;
            default:
                break;
        }
    }
    
    let load_moveJ_data = {};
    /** 获取TCF数据并组成程序示教文件 */
    document.getElementById('robotSetting').addEventListener('320', e => {
        let idjointsData = {
            "j1":"-134.571",
            "j2":"-89.884",
            "j3":"-90.035",
            "j4":"-179.990",
            "j5":"0.084",
            "j6":"0.020"
        }
        load_moveJ_data["speed"] = $scope.speed.toString();
        load_moveJ_data["acc"] = $scope.acceleration;
        load_moveJ_data["ovl"] = "50"; // 50-150
        load_moveJ_data["joints"] = $scope.idjointsData;
        load_moveJ_data["tcf"] = JSON.parse(e.detail);
        
        if ($scope.jointfifth_flag0) {
            g_fileDataForUpload = "";
            $scope.jointfifth_flag0 = 0;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+idjointsData.j5+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            $scope.LoadIdentifySetJointRange(1);
        } else if ($scope.jointfifth_flag1) {
            $scope.jointfifth_flag1 = 0;
            $scope.jointfifth_flag2 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+"0"+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j5 = 0-$scope.jointfifth + "";
            let loadj5clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj5clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[13]);
                })
        } else if ($scope.jointfifth_flag2) {
            $scope.jointfifth_flag2 = 0;
            $scope.jointfifth_flag3 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+(-$scope.jointfifth)+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j5 = $scope.jointfifth + "";
            let loadj5clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj5clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[13]);
                })
        } else if ($scope.jointfifth_flag3) {
            $scope.jointfifth_flag3 = 0;
            $scope.jointfifth_flag = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+$scope.jointfifth+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            $scope.LoadIdentifySetJointRange(2);
        } else if ($scope.jointthird_flag1) {
            $scope.jointthird_flag1 = 0;
            $scope.jointthird_flag2 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+"-90"+","+idjointsData.j4+","+idjointsData.j5+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j3 = -90-$scope.jointthird + "";
            let loadj3clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj3clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[14]);
                })
        } else if ($scope.jointthird_flag2) {
            $scope.jointthird_flag2 = 0;
            $scope.jointthird_flag3 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+(-90-$scope.jointthird+"")+","+idjointsData.j4+","+idjointsData.j5+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j3 = $scope.jointthird-90 + "";
            let loadj3clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj3clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[14]);
                })
        } else if ($scope.jointthird_flag3) {
            $scope.jointthird_flag3 = 0;
            $scope.jointthird_flag = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+($scope.jointthird-90+"")+","+idjointsData.j4+","+idjointsData.j5+","+idjointsData.j6+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            $scope.LoadIdentifySetJointRange(3);
        } else if ($scope.jointsix_flag1) {
            $scope.jointsix_flag1 = 0;
            $scope.jointsix_flag2 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+idjointsData.j5+","+"0"+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j6 = 0-$scope.jointsix + "";
            let loadj6clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj6clacTCFCmd)
                .then(() => {
                    
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[15]);
                })
        } else if ($scope.jointsix_flag2) {
            $scope.jointsix_flag2 = 0;
            $scope.jointsix_flag3 = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+idjointsData.j5+","+(-$scope.jointsix)+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            idjointsData.j6 = $scope.jointsix + "";
            let loadj6clacTCFCmd = {
                "cmd": 320,
                "data": idjointsData,
            }
            dataFactory.setData(loadj6clacTCFCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[15]);
                })
        } else if ($scope.jointsix_flag3) {
            $scope.jointsix_flag3 = 0;
            $scope.jointsix_flag = 1;
            g_fileDataForUpload += "MoveJ("+idjointsData.j1+","+idjointsData.j2+","+idjointsData.j3+","+idjointsData.j4+","+idjointsData.j5+","+$scope.jointsix+","+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            g_fileNameForUpload = "loadweight.lua";
        } else if ($scope.new_tool_pytest_point) {
            g_fileNameForUpload = "loadweight.lua";
            Load_SlowMotion_File = "";
            Load_NormalMotion_File = "";
            $scope.jointfifth_flag0 = 0;
            Load_SlowMotion_File += "file = assert(io.open(\"/root/web/file/user/Trace.lua\", \"r\"))\n"+
            "io.input(file)\n"+
            "ourline = {}\n"+
            "for i = 1, 10000 do\n"+
                "ourline[i] = io.read()\n"+
            "end\n";
            Load_NormalMotion_File += "file = assert(io.open(\"/root/web/file/user/Trace.lua\", \"r\"))\n"+
            "io.input(file)\n"+
            "ourline = {}\n"+
            "for i = 1, 10000 do\n"+
                "ourline[i] = io.read()\n"+
            "end\n";
            Load_SlowMotion_File += "MoveJ(-72.365,-64.691,61.602,35.486,-67.450,18.045,"+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            Load_NormalMotion_File += "MoveJ(-72.365,-64.691,61.602,35.486,-67.450,18.045,"+
            JSON.parse(e.detail).x+","+JSON.parse(e.detail).y+","+JSON.parse(e.detail).z+","+JSON.parse(e.detail).rx+","+JSON.parse(e.detail).ry+","+JSON.parse(e.detail).rz+","+
            $scope.currentCoord+","+$scope.currentWobjCoord+","+$scope.speed+","+$scope.acceleration+","+30+","+"0,0,0,0,0,0,0,0,0,0,0,0"+")"+"\n";
            Load_SlowMotion_File += "WaitMs(1000)\n"+
            "LoadIdentifyDynFilterInit()\n"+
            "LoadIdentifyDynVarInit()\n"+
            "for j = 1,10000 do\n"+
                "str1 = ourline[j]\n"+
                "res = str_split(str1,\",\")\n"+
                "j1 = -72.362\n"+
                "j2 =  -64.691\n"+
                "j3 = 61.605\n"+
                "j4 = tonumber(res[4])\n"+
                "j5 = tonumber(res[5])\n"+
                "j6 = tonumber(res[6])\n"+
                "ServoJ(j1,j2,j3,j4,j5,j6,0,0,0.024,0,0)\n"+
                "ja1,ja2,ja3,ja4,ja5,ja6 = GetActualJointPosDegree(1)\n"+
                "T1,T2,T3,T4,T5,T6 = GetJointTorques(1)\n"+
                "joint_pos = {ja1,ja2,ja3,ja4,ja5,ja6}\n"+
                "tau= {T1,T2,T3,T4,T5,T6}\n"+
                "LoadIdentifyMain(tau,joint_pos,10)\n"+
            "end\n"+
            "LoadIdentifyDynFilterInit()\n";
            Load_NormalMotion_File += "WaitMs(1000)\n"+
            "LoadIdentifyDynFilterInit()\n"+
            "LoadIdentifyDynVarInit()\n"+
            "for j = 1,10000 do\n"+
                "str1 = ourline[j]\n"+
                "res = str_split(str1,\",\")\n"+
                "j1 = -72.362\n"+
                "j2 =  -64.691\n"+
                "j3 = 61.605\n"+
                "j4 = tonumber(res[4])\n"+
                "j5 = tonumber(res[5])\n"+
                "j6 = tonumber(res[6])\n"+
                "ServoJ(j1,j2,j3,j4,j5,j6,0,0,0.001,0,0)\n"+
                "ja1,ja2,ja3,ja4,ja5,ja6 = GetActualJointPosDegree(1)\n"+
                "T1,T2,T3,T4,T5,T6 = GetJointTorques(1)\n"+
                "joint_pos = {ja1,ja2,ja3,ja4,ja5,ja6}\n"+
                "tau= {T1,T2,T3,T4,T5,T6}\n"+
                "LoadIdentifyMain(tau,joint_pos,10)\n"+
            "end\n"+
            "LoadIdentifyDynFilterInit()\n";
        }
    })

    /** 停止负载辨识运动 */
    $scope.stopSlowMotion = function(){
        let stopCmd = {
            cmd: 102,
            data: {},
        };
        dataFactory.setData(stopCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /** 负载辨识慢速运动 */
    $scope.SlowMotion = function() {
        if ("0" != $scope.controlMode) {
            toastFactory.warning(rsDynamicTags.warning_messages[1]);
            return;
        } 
        if ($scope.jointfifth_flag && $scope.jointthird_flag && $scope.jointsix_flag) {
            if ($scope.loadSpeed == "" || $scope.loadSpeed == null) {
                toastFactory.info(rsDynamicTags.info_messages[37]);
            } else {
                var speedString = "SetSpeed(" + $scope.loadSpeed + ")";
                let setSpeedCmd = {
                    cmd: 206,
                    data: {
                        content:speedString,
                    },
                };
                let checkCmd = {
                    cmd: "check_lua_file",
                    data: {
                        name: g_fileNameForUpload,
                        type: '1'
                    },
                };
                dataFactory.getData(checkCmd).then((data) => {
                    switch (data.same_name) {
                        case '0':
                        case '1':
                            dataFactory.setData(setSpeedCmd).then(() => {
                                let saveCmd = {
                                    cmd: "save_lua_file",
                                    data: {
                                        name: g_fileNameForUpload,
                                        pgvalue: g_fileDataForUpload,
                                        type: "1"
                                    },
                                };
                                dataFactory.actData(saveCmd).then(() => {
                                    var SetSlowMotion = "LoadIdentifyStartEnd(1)";
                                    let SetSlowMotionCmd = {
                                        cmd: 357,
                                        data: {
                                            content:SetSlowMotion,
                                        }
                                    };
                                    dataFactory.setData(SetSlowMotionCmd).then(() => {
                                    }, (status) => {
                                        toastFactory.error(status);
                                    });
                                    }, (status) => {
                                        toastFactory.error(status);
                                });
                            });
                            break;
                        case '2':
                            toastFactory.warning(rsDynamicTags.warning_messages[2] + rsDynamicTags.warning_messages[4]);
                            break;
                        case '3':
                            toastFactory.warning(rsDynamicTags.warning_messages[3] + rsDynamicTags.warning_messages[4]);
                            break;
                        default:
                            break;
                    }
                }, (status) => {
                    toastFactory.error(status, rsDynamicTags.error_messages[42]);
                });
            }
        } else{
            toastFactory.info(rsDynamicTags.info_messages[38]);
            return;
        }
    }

    //标准运动结束后，获取结果
    document.getElementById('robotSetting').addEventListener('357', e => {
        $scope.index_uploadProgName();
    });

    //应用负载辨识结果
    $scope.setIdentifyLoad = function(){
        $scope.loadWeight = String($scope.IDentWeight);
        $scope.loadLocationx = String($scope.IDentX);
        $scope.loadLocationy = String($scope.IDentY);
        $scope.loadLocationz = String($scope.IDentZ);
        $scope.setEndLoadData($scope.currentEndLoad.name);
    }
    
    /**
     * 设置空载或满载运行
     * @param {int} index 0-空载 1-满载
     */
    $scope.setCurrentLoadIdentify = function(index){
        if("0" != $scope.controlMode){
            toastFactory.warning(rsDynamicTags.warning_messages[1]);
            return;
        } 
        if ($scope.programStatus != "Stopped") {
            toastFactory.info(rsDynamicTags.info_messages[50]);
            return;
        }

        let setCmd = {
            cmd: 990,
            data: {
                content: "SetCurrentLoadIdentifyFlag(" + index + ")" ,
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
                $scope.nextToolDataSet(index + 3);
                $scope.index_uploadProgName();
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.nextToolDataSet(index + 3);
                }
                /* ./test */
            });
    }

    /**末端负载计算主函数*/
    $scope.computCurrentLoadIdentify = function(){
        let setCmd = {
            cmd: 992,
            data: {
                content: "ComputCurrentLoadIdentify()" ,
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('robotSetting').addEventListener('992', e => {
        var loadDate = e.detail.split(",");
        $scope.IDentWeight = parseFloat(loadDate[0]).toFixed(3);
        $scope.IDentX = parseFloat(loadDate[1]).toFixed(3);
        $scope.IDentY = parseFloat(loadDate[2]).toFixed(3);
        $scope.IDentZ = parseFloat(loadDate[3]).toFixed(3);
        $scope.toolMeasure(2);
        $scope.nextToolDataSet(1);
    });

    /**记录传感器初始位置数据记录 */
    $scope.recordLaserInitialPosition = function(){
        //生成lua程序
        let applyInternalProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: "SimpleLoadIdentify.lua"
            }
        }
        dataFactory.actData(applyInternalProgramCmd)
            .then(() => {
                g_fileNameForUpload = "SimpleLoadIdentify.lua";

                let savePointCmd = {
                    cmd: "save_local_point",
                    data: {
                        "local": g_fileNameForUpload,
                        "name":"SimpleLoadIdentify",
                        "speed":$scope.velocity,
                        "elbow_speed":$scope.velocity,
                        "acc":$scope.acceleration,
                        "elbow_acc":$scope.acceleration,
                        "toolnum":$scope.currentCoord + "",
                        "workpiecenum":$scope.currentWobjCoord + "",
                        "update_programfile": 1
                    },
                };
                dataFactory.actData(savePointCmd)
                    .then(() => {
                        $scope.nextToolDataSet(2);
                    }, (status) => {
                        toastFactory.error(status);
                    });
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.nextToolDataSet(2);
                }
                /* ./test */
            });
    }
    
    //工具数据测定方法
    $scope.show_toolDataFunc1 = true;
    $scope.nextToolDataSet = function(id){
        $scope.show_toolDataFunc1 = false;
        $scope.show_toolDataFunc2 = false;
        $scope.show_toolDataFunc3 = false;
        $scope.show_toolDataFunc4 = false;
        switch(id){
            case 1:
                $scope.show_toolDataFunc1 = true;
                break;
            case 2:
                $scope.show_toolDataFunc2 = true;
                break;
            case 3:
                $scope.show_toolDataFunc3 = true;
                break;
            case 4:
                $scope.show_toolDataFunc4 = true;
                break;
            default:
                break;
        }
    }

    //显示负载辨识结果
    $scope.displayLoadResult = function(){
        if($scope.programStatus != "Stopped"){
            toastFactory.info(rsDynamicTags.info_messages[39]);
            return;
        } 
        $scope.computCurrentLoadIdentify();
    }

    //负载辨识设置界面切换
    $scope.toolMeasure = function(id){
        $scope.show_Tool_Measure1 = false;
        $scope.show_Tool_Measure2 = false;
        switch(id){
            case 0:
                $scope.show_Tool_Measure = false;
                $scope.nextToolDataSet(1);
                break;
            case 1:
                $scope.show_Tool_Measure1 = true;
                break;
            case 2:
                $scope.show_Tool_Measure2 = true;
                break;
            default:
                break;
        }
    }

    /**力/扭矩传感器负载辨识 */
    //负载重量设置应用下发指令函数
    $scope.applyLoadWeight_ft = function() {
        if ($scope.loadIdentifyDyn == 0) {
            if ($scope.loadWeight_ft == "" || $scope.loadWeight_ft == null) {
                toastFactory.info(rsDynamicTags.info_messages[29]);
            } else {
                var loadWeightString = "SetForceSensorPayload("+$scope.loadWeight_ft+")";
                let setLoadWeightCmd = {
                    cmd: 692,
                    data: {
                        content:loadWeightString,
                    }
                };
                dataFactory.setData(setLoadWeightCmd)
                    .then(() => {
                    }, (status) => {
                        toastFactory.error(status);
                    });
            }
        } else {
            toastFactory.info(rsDynamicTags.info_messages[45]);
        }
    }

    //负载质心坐标设置应用下发指令函数
    $scope.applyLoadLocation_ft = function() {
        if ($scope.loadIdentifyDyn == 0) {
            if ($scope.loadLocationx_ft == "" || $scope.loadLocationx_ft == null) {
                toastFactory.info(rsDynamicTags.info_messages[30]);
            } else if ($scope.loadLocationy_ft == "" || $scope.loadLocationy_ft == null) {
                toastFactory.info(rsDynamicTags.info_messages[31]);
            } else if ($scope.loadLocationz_ft == "" || $scope.loadLocationz_ft == null) {
                toastFactory.info(rsDynamicTags.info_messages[32]);
            } else {
                var loadLocationString = "SetForceSensorPayloadCog("+$scope.loadLocationx_ft+","+$scope.loadLocationy_ft+","+$scope.loadLocationz_ft+")";
                let setLoadLocationCmd = {
                    cmd: 693,
                    data: {
                        content:loadLocationString,
                    }
                };
                dataFactory.setData(setLoadLocationCmd)
                    .then(() => {
                    }, (status) => {
                        toastFactory.error(status);
                    });
            }
        } else {
            toastFactory.info(rsDynamicTags.info_messages[45]);
        }
    }

    //坐标系数据保留三位小数
    function rot_Screen_Sensor(data) {
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

    // 获取工具坐标系数据
    function getFTToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                rot_Screen_Sensor(data);
                $scope.rot_SensorCoordeData = JSON.parse(JSON.stringify(data));
                $scope.selectedFTLoadSensorCoorde = $scope.rot_SensorCoordeData[0];
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[1]);
            });
    };

    // 重量辨识数据记录
    $scope.FT_pdIdenRecord = function() {
        var FT_pdIdenRecordString = "FT_PdIdenRecord("+$scope.selectedFTLoadSensorCoorde.id+")";
            let FT_pdIdenRecordCmd = {
                cmd: 529,
                data: {
                    content:FT_pdIdenRecordString,
                },
            };
            dataFactory.setData(FT_pdIdenRecordCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
    }

    // 重量辨识数据计算
    $scope.FT_pdIdenCompute = function() {
            let FT_pdIdenComputeCmd = {
                cmd: 530,
                data: {
                    content:"FT_PdIdenCompute()",
                },
            };
            dataFactory.setData(FT_pdIdenComputeCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
    }

    // 获取计算坐标系数据
    document.getElementById('robotSetting').addEventListener('530', e => {
        $scope.FT_loadWeight = parseFloat(JSON.parse(e.detail).weight).toFixed(3);
    })

    //质心辨识数据记录
    $scope.FT_pdCogIdenRecord = function(index) {
        var FT_pdCogIdenRecordString = "FT_PdCogIdenRecord("+$scope.selectedFTLoadSensorCoorde.id+","+index+")";
            let FT_pdCogIdenRecordCmd = {
                cmd: 531,
                data: {
                    content:FT_pdCogIdenRecordString,
                },
            };
            dataFactory.setData(FT_pdCogIdenRecordCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
    }

    // 质心辨识数据计算
    $scope.FT_pdCogIdenCompute = function() {
            let FT_pdCogIdenComputeCmd = {
                cmd: 532,
                data: {
                    content:"FT_PdCogIdenCompute()",
                },
            };
            dataFactory.setData(FT_pdCogIdenComputeCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
    }

    // 获取计算坐标系数据
    document.getElementById('robotSetting').addEventListener('532', e => {
        $scope.FT_loadLocationx = parseFloat(JSON.parse(e.detail).x).toFixed(3);
        $scope.FT_loadLocationy = parseFloat(JSON.parse(e.detail).y).toFixed(3);
        $scope.FT_loadLocationz = parseFloat(JSON.parse(e.detail).z).toFixed(3);
    })

    // 应用负载辨识结果
    $scope.FT_pdIdenApply = function(){
        $scope.loadWeight_ft = $scope.FT_loadWeight;
        $scope.loadLocationx_ft = $scope.FT_loadLocationx;
        $scope.loadLocationy_ft = $scope.FT_loadLocationy;
        $scope.loadLocationz_ft = $scope.FT_loadLocationz;
        $scope.applyLoadWeight_ft();
        $scope.applyLoadLocation_ft();
    }

    // 清空负载辨识结果
    $scope.clearLoadLocation_ft = function(){
        $scope.loadWeight_ft = "0";
        $scope.loadLocationx_ft = "0";
        $scope.loadLocationy_ft = "0";
        $scope.loadLocationz_ft = "0";
        $scope.applyLoadWeight_ft();
        $scope.applyLoadLocation_ft();
    }

    // 负载动态辨识开闭
    $scope.setLoadIdentifyDynOnOff = function(index) {
        let setLoadIdentifyDynOnOffCmd = {
            cmd: 651,
            data: {
                content:"LoadIdentifyDynOnOff("+index+")",
            },
        };
        dataFactory.setData(setLoadIdentifyDynOnOffCmd)
            .then(() => {

            }, (status) => {
                getRobotdata();
                toastFactory.error(status);
            });
    }

    //负载动态辨识开闭后，获取结果
    document.getElementById('robotSetting').addEventListener('651', () => {
        getRobotdata();
    });

    //负载动态辨识参数设置
    $scope.setLoadIdentifySetParam = function(){
        let setLoadIdentifySetParamCmd = {
            cmd: 652,
            data: {
                content:"LoadIdentifySetParam("+$scope.sampleTime+")",
            },
        };
        dataFactory.setData(setLoadIdentifySetParamCmd)
            .then(() => {
    
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**记录传感器自动校零数据记录 */
    $scope.recordInitialPosition = function(){
        //生成lua程序
        let applyInternalProgramCmd = {
            cmd: "apply_internal_program",
            data: {
                name: "ForceSensorAutoZero.lua"
            }
        }
        dataFactory.actData(applyInternalProgramCmd)
            .then(() => {
                g_fileNameForUpload = "ForceSensorAutoZero.lua";

                let savePointCmd = {
                    cmd: "save_local_point",
                    data: {
                        "local": g_fileNameForUpload,
                        "name":"ForceSensorAutoZero",
                        "speed":$scope.velocity,
                        "elbow_speed":$scope.velocity,
                        "acc":$scope.acceleration,
                        "elbow_acc":$scope.acceleration,
                        "toolnum":$scope.currentCoord + "",
                        "workpiecenum":$scope.currentWobjCoord + "",
                        "update_programfile": 1
                    },
                };
                dataFactory.actData(savePointCmd)
                    .then(() => {
                        
                    }, (status) => {
                        toastFactory.error(status);
                    });
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //运动参数应用下发指令函数
    $scope.applyDoneRange = function()
    {
        if ($scope.doneRange === "" || $scope.doneRange === null) {
            toastFactory.info(rsDynamicTags.info_messages[40]);
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

    //摩擦力补偿显示切换
    $scope.frictionPosChange = function(){
        $scope.show_friLevel = false;
        $scope.show_friWall = false;
        $scope.show_friCeiling = false;
        $scope.show_friFree = false;
        if($scope.selectedFrictionType.id == 0){
            $scope.show_friLevel = true;
        }else if($scope.selectedFrictionType.id == 1){
            $scope.show_friWall = true;
        }else if($scope.selectedFrictionType.id == 2){
            $scope.show_friCeiling = true;
        }else if($scope.selectedFrictionType.id == 3){
            $scope.show_friFree = true;
        }
    }

    //设置摩擦力补偿系数
    $scope.applyFrictionValue = function() {
        let FrictionValueCmd;
        var FrictionValueString
        if($scope.selectedFrictionType.id == 0){
            if(($scope.friLevel1 === "")||($scope.friLevel2 === "")||($scope.friLevel3 === "")||($scope.friLevel4 === "")||($scope.friLevel5 === "")||($scope.friLevel6 === "")){
                toastFactory.info(rsDynamicTags.info_messages[41]);
                return;
            }
            FrictionValueString = "SetFrictionValue_level("+$scope.friLevel1+","+$scope.friLevel2+","+$scope.friLevel3+
                ","+$scope.friLevel4+","+$scope.friLevel5+","+$scope.friLevel6+")";
            FrictionValueCmd = {
                cmd: 541,
                data: {
                    content:FrictionValueString,
                },
            };
        }else if($scope.selectedFrictionType.id == 1){
            if(($scope.friWall1 === "")||($scope.friWall2 === "")||($scope.friWall3 === "")||($scope.friWall4 === "")||($scope.friWall5 === "")||($scope.friWall6 === "")){
                toastFactory.info(rsDynamicTags.info_messages[41]);
                return;
            }
            FrictionValueString = "SetFrictionValue_wall("+$scope.friWall1+","+$scope.friWall2+","+$scope.friWall3+
                ","+$scope.friWall4+","+$scope.friWall5+","+$scope.friWall6+")";
            FrictionValueCmd = {
                cmd: 542,
                data: {
                    content:FrictionValueString,
                },
            };
        }else if($scope.selectedFrictionType.id == 2){
            if(($scope.friCeiling1 === "")||($scope.friCeiling2 === "")||($scope.friCeiling3 === "")||($scope.friCeiling4 === "")||($scope.friCeiling5 === "")||($scope.friCeiling6 === "")){
                toastFactory.info(rsDynamicTags.info_messages[41]);
                return;
            }
            FrictionValueString = "SetFrictionValue_ceiling("+$scope.friCeiling1+","+$scope.friCeiling2+","+$scope.friCeiling3+
                ","+$scope.friCeiling4+","+$scope.friCeiling5+","+$scope.friCeiling6+")";
            FrictionValueCmd = {
                cmd: 543,
                data: {
                    content:FrictionValueString,
                },
            };
        }else if($scope.selectedFrictionType.id == 3){
            if(($scope.friFree1 === "")||($scope.friFree2 === "")||($scope.friFree3 === "")||($scope.friFree4 === "")||($scope.friFree5 === "")||($scope.friFree6 === "")){
                toastFactory.info(rsDynamicTags.info_messages[41]);
                return;
            }
            FrictionValueString = "SetFrictionValue_freedom("+$scope.friFree1+","+$scope.friFree2+","+$scope.friFree3+
                ","+$scope.friFree4+","+$scope.friFree5+","+$scope.friFree6+")";
            FrictionValueCmd = {
                cmd: 637,
                data: {
                    content:FrictionValueString,
                },
            };
        }
        
        dataFactory.setData(FrictionValueCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置摩擦力补偿开关
    $scope.applyDragFriction = function() {
        var dragFrictionString = "FrictionCompensationOnOff("+$scope.selectedFriction.id+")";
        let dragFrictionCmd = {
            cmd: 338,
            data: {
                content:dragFrictionString,
            },
        };
        dataFactory.setData(dragFrictionCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //速度设置应用下发指令函数
    $scope.applySpeed = function()
    {
        if ($scope.Speed == "" || $scope.Speed == null) {
            toastFactory.info(rsDynamicTags.info_messages[42]);
        } else {
            var speedString = "SetSpeed("+$scope.Speed+")";
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


    //IO滤波指令下发
    //控制箱DI
    $scope.setControlDi = function(){
        if ($scope.controlDiTime === ""   || $scope.controlDiTime === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var controlDiString = "SetDIFilterTime("+~~$scope.controlDiTime+")";
            let setControlDiCmd = {
                cmd: 222,
                data: {
                    content:controlDiString,
                },
            };
            dataFactory.setData(setControlDiCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //工具DI
    $scope.setToolDi = function(){
        if ($scope.toolDiTime === "" || $scope.toolDiTime === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var toolDiString = "SetAxleDIFilterTime("+~~$scope.toolDiTime+")";
            let settoolDiCmd = {
                cmd: 223,
                data: {
                    content:toolDiString,
                },
            };
            dataFactory.setData(settoolDiCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //控制箱AI0
    $scope.setControlAi0 = function(){ 
        if ($scope.controlAi0Time === "" || $scope.controlAi0Time === null ) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var controlAi0String = "SetAIFilterTime(0,"+~~$scope.controlAi0Time+")";
            let setControlAi0Cmd = {
                cmd: 224,
                data: {
                    content:controlAi0String,
                },
            };
            dataFactory.setData(setControlAi0Cmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //控制箱AI1
    $scope.setControlAi1 = function(){
        if ($scope.controlAi1Time === "" || $scope.controlAi1Time === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var controlAi1String = "SetAIFilterTime(1,"+~~$scope.controlAi1Time+")";
            let setControlAi1Cmd = {
                cmd: 224,
                data: {
                    content:controlAi1String,
                },
            };
            dataFactory.setData(setControlAi1Cmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //工具AI0
    $scope.setToolAi0 = function(){
        if ($scope.toolAi0Time === "" || $scope.toolAi0Time === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var toolAi0String = "SetAxleAIFilterTime(0,"+~~$scope.toolAi0Time+")";
            let settoolAi0Cmd = {
                cmd: 225,
                data: {
                    content:toolAi0String,
                },
            };
            dataFactory.setData(settoolAi0Cmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //按钮盒DI
    $scope.setToolBoxDi = function(){
        if ($scope.toolBoxDiTime === "" || $scope.toolBoxDiTime === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var toolboxString = "SetToolBoxDIFilterTime("+~~$scope.toolBoxDiTime+")";
            let settoolboxCmd = {
                cmd: 665,
                data: {
                    content:toolboxString,
                },
            };
            dataFactory.setData(settoolboxCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //扩展DI
    $scope.setAuxDIFilter = function(){
        if ($scope.AuxDIFilterTime === "" || $scope.AuxDIFilterTime === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var AuxDIString = "SetAuxDIFilterTime("+~~$scope.AuxDIFilterTime+")";
            let setAuxDICmd = {
                cmd: 669,
                data: {
                    content:AuxDIString,
                },
            };
            dataFactory.setData(setAuxDICmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //扩展AI
    $scope.setAuxAIFilter = function(index){
        var AuxAIString;
        if(index == 0){
            if ($scope.AuxAI0FilterTime === "" || $scope.AuxAI0FilterTime === null) {
                toastFactory.info(rsDynamicTags.info_messages[43]);
            } else {
                var AuxAIString = "SetAuxAIFilterTime(0,"+~~$scope.AuxAI0FilterTime+")";    
            }
        }else if(index == 1){
            if ($scope.AuxAI1FilterTime === "" || $scope.AuxAI1FilterTime === null) {
                toastFactory.info(rsDynamicTags.info_messages[43]);
            } else {
                var AuxAIString = "SetAuxAIFilterTime(1,"+~~$scope.AuxAI1FilterTime+")";    
            }
        }else if(index == 2){
            if ($scope.AuxAI2FilterTime === "" || $scope.AuxAI2FilterTime === null) {
                toastFactory.info(rsDynamicTags.info_messages[43]);
            } else {
                var AuxAIString = "SetAuxAIFilterTime(2,"+~~$scope.AuxAI2FilterTime+")";    
            }
        }else if(index == 3){
            if ($scope.AuxAI3FilterTime === "" || $scope.AuxAI3FilterTime === null) {
                toastFactory.info(rsDynamicTags.info_messages[43]);
            } else {
                var AuxAIString = "SetAuxAIFilterTime(3,"+~~$scope.AuxAI3FilterTime+")";    
            }
        }
        
        let setAuxAICmd = {
            cmd: 670,
            data: {
                content:AuxAIString,
            },
        };
        dataFactory.setData(setAuxAICmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //Smart Tool DI
    $scope.setAxleExtDIFilter = function(){
        if ($scope.smartToolDiFilterTime === "" || $scope.smartToolDiFilterTime === null) {
            toastFactory.info(rsDynamicTags.info_messages[43]);
        } else {
            var AxleExtDIString = "SetAxleExtDIFilterTime("+~~$scope.smartToolDiFilterTime+")";
            let setAxleExtDICmd = {
                cmd: 679,
                data: {
                    content:AxleExtDIString,
                },
            };
            dataFactory.setData(setAxleExtDICmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //配置DI功能函数
    $scope.setDICfg = function(){
        var diCfgString = "SetDIConfig("+$scope.selectedCfgDI8+","+$scope.selectedCfgDI9+","+$scope.selectedCfgDI10+","+$scope.selectedCfgDI11+","+
        $scope.selectedCfgDI12+","+$scope.selectedCfgDI13+","+$scope.selectedCfgDI14+","+$scope.selectedCfgDI15+")";
        let setDiCfgCmd = {
            cmd: 323,
            data: {
                content:diCfgString,
            },
        };
        dataFactory.setData(setDiCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('323', (e) => {
        if (e.detail == '1') {
            if ($scope.showTCPCorrectionDeviceConfig) {
                $scope.isSuccessSetIO = true;
                updateTCPCorrectionData();
            } else {
                getRobotdata();
            }
            getIOConfigContent();
        }
    });

    //配置末端DI功能函数
    $scope.setEndDICfg = function(){
        var diCfgString = "SetToolDIConfig("+$scope.selectedEndCfgDI1+","+$scope.selectedEndCfgDI2+")";
        let setEndDiCfgCmd = {
            cmd: 369,
            data: {
                content:diCfgString,
            },
        };
        dataFactory.setData(setEndDiCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('369', (e) => {
        if (e.detail == '1') {
            getRobotdata();
            getIOConfigContent();
        }
    });

    //配置可配置DI有效状态
    $scope.setDIValid = function(){
        var diCfgLevelString = "SetDIConfigLevel("+$scope.selectedValidDI8.value+","+$scope.selectedValidDI9.value+","+$scope.selectedValidDI10.value+","+$scope.selectedValidDI11.value+","+
        $scope.selectedValidDI12.value+","+$scope.selectedValidDI13.value+","+$scope.selectedValidDI14.value+","+$scope.selectedValidDI15.value+")";
        let setDiCfgLevelCmd = {
            cmd: 335,
            data: {
                content:diCfgLevelString,
            },
        };
        dataFactory.setData(setDiCfgLevelCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 配置通用DI有效状态
     * @param {string} di0Valid DI0高低电平有效值
     * @param {string} di1Valid DI1高低电平有效值
     * @param {string} di2Valid DI2高低电平有效值
     * @param {string} di3Valid DI3高低电平有效值
     * @param {string} di4Valid DI4高低电平有效值
     * @param {string} di5Valid DI5高低电平有效值
     * @param {string} di6Valid DI6高低电平有效值
     * @param {string} di7Valid DI7高低电平有效值
     */
    $scope.setCommonDIValid = function (di0Valid, di1Valid, di2Valid, di3Valid, di4Valid, di5Valid, di6Valid, di7Valid) {
        let setCommonDIValidCmd = {
            cmd: 836,
            data: {
                content: `SetStandardDILevel({${di0Valid},${di1Valid},${di2Valid},${di3Valid},${di4Valid},${di5Valid},${di6Valid},${di7Valid}})`
            }
        }
        dataFactory.setData(setCommonDIValidCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //配置末端DI有效电平功能函数
    $scope.setEndDIValid = function(){
        var diCfgLevelString = "SetToolDIConfigLevel("+$scope.selectedEndValidDI1.value+","+$scope.selectedEndValidDI2.value+")";
        let setEndDiCfgLevelCmd = {
            cmd: 371,
            data: {
                content:diCfgLevelString,
            },
        };
        dataFactory.setData(setEndDiCfgLevelCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置安全停止策略
    $scope.setSafetyStopStrategy = function() {
        var setSafetyStopStrategyString = "SetSafetyStopStrategy("+$scope.selectedemergencyStopStrategy.id+")";
        let setSafetyStopStrategyCmd = {
            cmd: 584,
            data: {
                content:setSafetyStopStrategyString,
            },
        };
        dataFactory.setData(setSafetyStopStrategyCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 缩减模式配置 */
    /**
     * 获取当前的缩减模式对象值
     * @param {object} reduceMode 已选择的缩减模式对象
     */
    $scope.changeReduceMode = function () {
        getRobotdata();
    }

    /**
     * 设置缩减模式速度配置（6个关节和TCP）
     * @param {object} reduceMode 已选择的缩减模式对象
     * @param {int} j1Speed 关节1速度
     * @param {int} j2Speed 关节2速度
     * @param {int} j3Speed 关节3速度
     * @param {int} j4Speed 关节4速度
     * @param {int} j5Speed 关节5速度
     * @param {int} j6Speed 关节6速度
     * @param {int} tcpSpeed TCP速度
     */
    $scope.setReduceModeConfig = function (reduceMode, j1Speed, j2Speed, j3Speed, j4Speed, j5Speed, j6Speed, tcpSpeed) {
        let cmd;
        let api;
        // 判断缩减模式使用不同指令
        if (reduceMode.id == "0") {
            // 一级缩减
            cmd = 744;
            api = "SetReduceMode1Speed";
        } else if (reduceMode.id == "1") {
            // 二级缩减
            cmd = 745;
            api = "SetReduceMode2Speed";
        }
        // 判断所有输入值是否为空
        if (!j1Speed || !j2Speed || !j3Speed || !j4Speed || !j5Speed || !j6Speed || !tcpSpeed) {
            let arr = [j1Speed, j2Speed, j3Speed, j4Speed, j5Speed, j6Speed, tcpSpeed];
            arr.forEach((item, i) => {
                $(`#reduceSpeed${i+1}`).removeClass("input-error-status");
                if (!item) {
                    $(`#reduceSpeed${i+1}`).addClass("input-error-status");
                }
            });
            return;
        }
        // 通过输入值为空判断后去除所有输入框error状态
        for (let i = 0; i < 7; i++) {
            $(`#reduceSpeed${i+1}`).removeClass("input-error-status");
        }
        // 组合指令并下发
        let setCfgCmd = {
            cmd: cmd,
            data: {
                content: `${api}({${j1Speed},${j2Speed},${j3Speed},${j4Speed},${j5Speed},${j6Speed}},${tcpSpeed})`
            }
        }
        dataFactory.setData(setCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    // 设置一级缩减模式速度成功后重新获取配置数据
    document.getElementById('robotSetting').addEventListener('744', () => {
        getRobotdata();
    })
    // 设置二级缩减模式速度成功后重新获取配置数据
    document.getElementById('robotSetting').addEventListener('745', () => {
        getRobotdata();
    })
    /* ./缩减模式配置 */

    //配置DO功能函数
    $scope.setDOCfg = function(){
        var doCfgString = "SetDOConfig("+$scope.selectedCfgDO8+","+$scope.selectedCfgDO9+","+$scope.selectedCfgDO10+","+$scope.selectedCfgDO11+","+
        $scope.selectedCfgDO12+","+$scope.selectedCfgDO13+","+$scope.selectedCfgDO14+","+$scope.selectedCfgDO15+")";
        let setDoCfgCmd = {
            cmd: 324,
            data: {
                content:doCfgString,
            },
        };
        dataFactory.setData(setDoCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('robotSetting').addEventListener('324', (e) => {
        if (e.detail == '1') {
            getRobotdata();
            getIOConfigContent();
        }
    });

    //配置可配置DO有效状态
    $scope.setDOValid = function(){
        var doCfgLevelString = "SetDOConfigLevel("+$scope.selectedValidDO8.value+","+$scope.selectedValidDO9.value+","+$scope.selectedValidDO10.value+","+$scope.selectedValidDO11.value+","+
        $scope.selectedValidDO12.value+","+$scope.selectedValidDO13.value+","+$scope.selectedValidDO14.value+","+$scope.selectedValidDO15.value+")";
        let setDoCfgLevelCmd = {
            cmd: 336,
            data: {
                content:doCfgLevelString,
            },
        };
        dataFactory.setData(setDoCfgLevelCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 配置通用DO有效状态
     * @param {string} do0Valid DO0高低电平有效值 
     * @param {string} do1Valid DO1高低电平有效值 
     * @param {string} do2Valid DO2高低电平有效值 
     * @param {string} do3Valid DO3高低电平有效值 
     * @param {string} do4Valid DO4高低电平有效值 
     * @param {string} do5Valid DO5高低电平有效值 
     * @param {string} do6Valid DO6高低电平有效值 
     * @param {string} do7Valid DO7高低电平有效值 
     */
    $scope.setCommonDOValid = function (do0Valid, do1Valid, do2Valid, do3Valid, do4Valid, do5Valid, do6Valid, do7Valid) {
        let setCommonDOValidCmd = {
            cmd: 837,
            data: {
                content: `SetStandardDOLevel({${do0Valid},${do1Valid},${do2Valid},${do3Valid},${do4Valid},${do5Valid},${do6Valid},${do7Valid}})`
            }
        }
        dataFactory.setData(setCommonDOValidCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 配置控制箱DO停止/暂停输出状态 */
    $scope.setOutputCtrlDOReset = function(){
        let setOutputResetCmd = {
            cmd: 898,
            data: {
                content:"SetOutputResetCtlBoxDO("+$scope.selectedOutputCtrlDOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置控制箱DO停止/暂停输出状态 */

    /* 配置控制箱AO停止/暂停输出状态 */
    $scope.setOutputCtrlAOReset = function(){
        let setOutputResetCmd = {
            cmd: 899,
            data: {
                content:"SetOutputResetCtlBoxAO("+$scope.selectedOutputCtrlAOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置控制箱AO停止/暂停输出状态 */

    /* 配置末端板DO停止/暂停输出状态 */
    $scope.setOutputEndDOReset = function(){
        let setOutputResetCmd = {
            cmd: 900,
            data: {
                content:"SetOutputResetAxleDO("+$scope.selectedOutputEndDOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置末端板DO停止/暂停输出状态 */

    /* 配置末端板AO停止/暂停输出状态 */
    $scope.setOutputEndAOReset = function(){
        let setOutputResetCmd = {
            cmd: 901,
            data: {
                content:"SetOutputResetAxleAO("+$scope.selectedOutputEndAOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置末端板AO停止/暂停输出状态 */

    /* 配置扩展轴DO停止/暂停输出状态 */
    $scope.setOutputExtendDOReset = function(){
        let setOutputResetCmd = {
            cmd: 902,
            data: {
                content:"SetOutputResetExtDO("+$scope.selectedOutputExtendDOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置扩展轴DO停止/暂停输出状态 */

    /* 配置扩展轴AO停止/暂停输出状态 */
    $scope.setOutputExtendAOReset = function(){
        let setOutputResetCmd = {
            cmd: 903,
            data: {
                content:"SetOutputResetExtAO("+$scope.selectedOutputExtendAOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置扩展轴AO停止/暂停输出状态 */

    /* 配置SmartTool DO停止/暂停输出状态 */
    $scope.setOutputSmartDOReset = function(){
        let setOutputResetCmd = {
            cmd: 904,
            data: {
                content:"SetOutputResetSmartToolDO("+$scope.selectedOutputSmartDOReset.id+")",
            },
        };
        dataFactory.setData(setOutputResetCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./配置SmartTool DO停止/暂停输出状态 */
    
    /*I/O别名配置 */
    /*获取I/O别名数据 */
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
            judgeIOConfigContent();
        }, (status) => {
            toastFactory.error(status, rsDynamicTags.error_messages[19]);
        });
    };
    /**./获取I/O别名数据 */

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
    $scope.setIOAlias = function(ctrlDIArr, ctrlDOArr, ctrlAIArr, ctrlAOArr, endDIArr, endDOArr, endAIArr, endAOArr) {
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
            toastFactory.error(status, rsDynamicTags.error_messages[20]);
        });
    };
    /**./配置I/O别名 */

    /**
     * 控制箱输入已配置时,禁用别名配置界面对应输入框；反之不禁用
     * @param {string} aliasDIItem 控制箱输入名称
     * @returns 是否禁用
     */
    $scope.setIOCtrlAliasDisabled = function(aliasDIItem) {
        switch (aliasDIItem) {
            case 'CI0':
                return $scope.selectedCfgDI8 != '0';
            case 'CI1':
                return $scope.selectedCfgDI9 != '0';
            case 'CI2':
                return $scope.selectedCfgDI10 != '0';
            case 'CI3':
                return $scope.selectedCfgDI11 != '0';
            case 'CI4':
                return $scope.selectedCfgDI12 != '0';
            case 'CI5':
                return $scope.selectedCfgDI13 != '0';
            case 'CI6':
                return $scope.selectedCfgDI14 != '0';
            case 'CI7':
                return $scope.selectedCfgDI15 != '0';
            case 'CO0':
                return $scope.selectedCfgDO8 != '0';
            case 'CO1':
                return $scope.selectedCfgDO9 != '0';
            case 'CO2':
                return $scope.selectedCfgDO10 != '0';
            case 'CO3':
                return $scope.selectedCfgDO11 != '0';
            case 'CO4':
                return $scope.selectedCfgDO12 != '0';
            case 'CO5':
                return $scope.selectedCfgDO13 != '0';
            case 'CO6':
                return $scope.selectedCfgDO14 != '0';
            case 'CO7':
                return $scope.selectedCfgDO15 != '0';
            default:
                break;
        }
    };
    /**./控制箱输入已配置时,禁用别名配置界面对应输入框；反之不禁用 */
    /**
     * 末端输入已配置时,禁用别名配置界面对应输入框；反之不禁用
     * @param {string} aliasDIItem 末端输入名称
     * @returns 是否禁用
     */
    $scope.setIOEndAliasDisabled = function(aliasDIItem) {
        switch (aliasDIItem) {
            case 'DI0':
                return $scope.selectedEndCfgDI1 != '0';
            case 'DI1':
                return $scope.selectedEndCfgDI2 != '0';
            default:
                break;
        }
    };
    /**./末端输入已配置时,禁用别名配置界面对应输入框；反之不禁用 */

    /* 判断机器人配置IO内容和配置的IO别名是否相同,只要存在不同就下发配置IO别名*/
    function judgeIOConfigContent() {
        const robotDIResult = robotDIList.find((item, index) => {
            return $scope.ctrlDIAliasData[index + 8] != $scope.DICfgData[Number($scope[item]) + 1].name && $scope[item] != '0';
        });
        const robotDOResult = robotDOList.find((item, index) => {
            return $scope.ctrlDOAliasData[index + 8] != $scope.DOCfgData[Number($scope[item]) + 1].name && $scope[item] != '0';
        });
        const robotEndDIResult = robotEndDIList.find((item, index) => {
            return $scope.endDIAliasData[index] != $scope.EndDICfgData[Number($scope[item]) + 1].name && $scope[item] != '0';
        });
        if (robotDIResult || robotDOResult || robotEndDIResult) {
            getIOConfigContent();
        }
    };

    /* 获取DI、DO配置的文字内容*/
    function getIOConfigContent() {
        // CtrlBox————CI0-7
        robotDIList.forEach((item, index) => {
            if ($scope[item] == '0') {
                if ($scope.ctrlDIAliasData[index + 8]) {
                    if ($scope.DICfgData.find(element => element.name == $scope.ctrlDIAliasData[index + 8])) {
                        if ($scope.DICfgData[Number($scope[item]) + 1].name == $scope.DICfgData[1].name) {
                            $scope.ctrlDIAliasData[index + 8] = '';
                        } else {
                            $scope.ctrlDIAliasData[index + 8] = $scope.DICfgData[Number($scope[item]) + 1].name;
                        }
                    } else {
                        $scope.ctrlDIAliasData[index + 8] = $scope.ctrlDIAliasData[index + 8];
                    }
                } else {
                    $scope.ctrlDIAliasData[index + 8] = '';
                }
            } else {
                $scope.ctrlDIAliasData[index + 8] = $scope.DICfgData[Number($scope[item]) + 1].name;
            }
        });
        // CtrlBox————CO0-7
        robotDOList.forEach((item, index) => {
            if ($scope[item] == '0') {
                if ($scope.ctrlDOAliasData[index + 8]) {
                    if ($scope.DOCfgData.find(element => element.name == $scope.ctrlDOAliasData[index + 8])) {
                        if ($scope.DOCfgData[Number($scope[item]) + 1].name == $scope.DOCfgData[1].name) {
                            $scope.ctrlDOAliasData[index + 8] = '';
                        } else {
                            $scope.ctrlDOAliasData[index + 8] = $scope.DOCfgData[Number($scope[item]) + 1].name;
                        }
                    } else {
                        $scope.ctrlDOAliasData[index + 8] = $scope.ctrlDOAliasData[index + 8];
                    }
                } else {
                    $scope.ctrlDOAliasData[index + 8] = '';
                }
            } else {
                $scope.ctrlDOAliasData[index + 8] = $scope.DOCfgData[Number($scope[item]) + 1].name;
            }
        });
        // EndEff————DI
        robotEndDIList.forEach((item, index) => {
            if ($scope[item] == '0') {
                if ($scope.endDIAliasData[index]) {
                    if ($scope.EndDICfgData.find(element => element.name == $scope.endDIAliasData[index])) {
                        if ($scope.EndDICfgData[Number($scope[item]) + 1].name == $scope.EndDICfgData[1].name) {
                            $scope.endDIAliasData[index] = '';
                        } else {
                            $scope.endDIAliasData[index] = $scope.EndDICfgData[Number($scope[item]) + 1].name;
                        }
                    } else {
                        $scope.endDIAliasData[index] = $scope.endDIAliasData[index];
                    }
                } else {
                    $scope.endDIAliasData[index] = '';
                }
            } else {
                $scope.endDIAliasData[index] = $scope.EndDICfgData[Number($scope[item]) + 1].name;
            }
        });
        $scope.setIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
    };
    /**./I/O别名配置 */

    //电弧跟踪扩展AI通道选择
    $scope.setArcWeldTraceExtAIChannelConfig = function(){
        let setArcWeldTraceExtAIChannelConfigCmd = {
            cmd: 691,
            data: {
                content:"ArcWeldTraceExtAIChannelConfig("+$scope.selectedExtAIChannel.num+")",
            },
        };
        dataFactory.setData(setArcWeldTraceExtAIChannelConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    // 导出控制器数据库文件
    $scope.exportCtrSqlData = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/controller/fr_controller_data.db";
        }else{
            window.location.href = "/action/download?pathfilename=/root/robot/fr_controller_data.db";
        }
    };

    //导入控制器数据库文件
    $scope.robot_sql_restart_tips = "";
    $scope.importCtrSqlData = function(){
        var formData = new FormData();
        var file = document.getElementById("ctrSqlDataImported").files[0];
        if(null == file){
            toastFactory.info(rsDynamicTags.info_messages[44]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    showPageRestart(rsDynamicTags.success_messages[3]);
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }

     // 导出机器人配置文件
     $scope.exportRobotcfg = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/controller/user.config";
        }else{
            window.location.href = "/action/download?pathfilename=/root/robot/user.config";  
        }
    };

    //导入机器人配置文件
    $scope.importRobotcfg = function(){
        var formData = new FormData();
        var file = document.getElementById("robotcfgImported").files[0];
        if(null == file){
            toastFactory.info(rsDynamicTags.info_messages[44]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    checkCfgData(1);
                }
            }, (status) => {
                toastFactory.error(status, rsDynamicTags.error_messages[16]);
            });
    }

    /* 检查配置文件数据 */
    function checkCfgData(index){
        let checkCfgCmd = {
            cmd: 345,
            data: {
                content:"CheckCFG("+index+")",
            },
        };
        dataFactory.setData(checkCfgCmd)
        .then((data) => {
            $scope.robot_check_user_cfg = 1;
        }, (status) => {
            toastFactory.error(status, rsDynamicTags.error_messages[17]);
        });
    }
    //根据机器人配置文件内容初始化界面显示数据
    $scope.robot_restart_tips = "";
    document.getElementById('robotSetting').addEventListener('345', e => {
        if($scope.robot_check_user_cfg == 1){
            $scope.robot_check_user_cfg = 0;
            if(e.detail == 1){
                $scope.index_cfg_check_tips = "";
                $scope.robot_restart_tips = rsDynamicTags.success_messages[3];
                toastFactory.success(rsDynamicTags.success_messages[3]);
            }
        }
    })

    /* 获取一系列数据初始化页面 */
    getExToolCoordData();
    getToolCoordData();
    getWObjCoordData();
    getEAxisCoordData();
    getEAxiscfg();
    getFTToolCoordData();
    //读取配置文件初始化页面内容
    getRobotdata();
    $scope.wobjPictureChange();
    $scope.showFreeDegree();
    $scope.changeExAxisCompany(0);
    /* ./初始化 */
};