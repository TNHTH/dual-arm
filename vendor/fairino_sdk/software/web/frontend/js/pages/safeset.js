"use strict";

angular
    .module('frApp')
    .controller('safesetCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$http', safesetCtrlFn])

function safesetCtrlFn($scope, $modal, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let safDynamicTags = langJsonData.safeset;
    // 获取导航栏对象
    $scope.safesetNavList = safDynamicTags.navbar;
    // 获取变量对象
    $scope.safetyStopModeDict = safDynamicTags.var_object.safetyStopModeDict;
    $scope.digitalIOSafetyDict = safDynamicTags.var_object.digitalIOSafetyDict;
    $scope.safeSpeedEnableData = safDynamicTags.var_object.safeSpeedEnableData;
    $scope.postOverSpeedData = safDynamicTags.var_object.postOverSpeedData;
    $scope.daemonAccidentsData = safDynamicTags.var_object.accidentsData;
    $scope.eStopModeDict = safDynamicTags.var_object.eStopModeDict;
    $scope.pStopModeDict = safDynamicTags.var_object.pStopModeDict;
    $scope.DICfgData = langJsonData.robot_setting.var_object.DICfgData;
    $scope.DOCfgData = langJsonData.robot_setting.var_object.DOCfgData;
    $scope.selectedCI0CI1Func = $scope.DICfgData[1].value;
    $scope.selectedCI2CI3Func = $scope.DICfgData[1].value;
    $scope.selectedCI4CI5Func = $scope.DICfgData[1].value;
    $scope.selectedCI6CI7Func = $scope.DICfgData[1].value;
    $scope.selectedCO0CO1Func = $scope.DOCfgData[1].value;
    $scope.selectedCO2CO3Func = $scope.DOCfgData[1].value;
    $scope.selectedCO4CO5Func = $scope.DOCfgData[1].value;
    $scope.selectedCO6CO7Func = $scope.DOCfgData[1].value;
    /* 初始化 */
    getSafetyCfg();
    if (g_systemFlag) {
        getIOAliasData();
    }
    $('.setting-menu').tree();
    /* ./初始化 */

    // 判断子页面是否有权限
    $scope.userAuthData = getUserAuthority();

    /**
     * 机器人安全二级导航栏选项功能切换
     * @param {string} id 二级导航栏选项id
     */
    $scope.switchSafeSetPage = function (id) {
        $(".navItem").removeClass("item-selected");
        $(".navItem_" + id).addClass("item-selected");
        $scope.show_safeStopCfg = false;
        $scope.show_safeSpeedCfg = false;
        $scope.show_safeDIOCfg = false;
        $scope.show_safeEmergencyStopCfg = false;
        $scope.show_safeProtectiveStopCfg = false;
        $scope.show_safePlaneCfg = false;
        $scope.show_safeDaemonCfg = false;
        $scope.show_safeToolDirectionCfg = 0;
        $scope.show_safeRobotLimitCfg = 0;
        $scope.show_jointtorquedetectionCfg = 0;
        switch (id) {
            case "safe_stop":
                $scope.show_safeStopCfg = true;
                break;
            case "safe_speed":
                $scope.show_safeSpeedCfg = true;
                break;
            case "safe_dio":
                $scope.show_safeDIOCfg = true;
                break;
            case "safe_emergency_stop":
                $scope.show_safeEmergencyStopCfg = true;
                break;
            case "safe_protective_stop":
                $scope.show_safeProtectiveStopCfg = true;
                break;
            case "safe_plane":
                $scope.show_safePlaneCfg = true;
                getSafetyPlaneConfig();
                break;
            case "safe_daemon":
                $scope.show_safeDaemonCfg = true;
                getUserFiles();
                getAccidentsData();
                break;
            case "safe_tooldirection":
                if (g_systemFlag) {
                    $scope.show_safeToolDirectionCfg = 1;
                } else {
                    $scope.show_safeToolDirectionCfg = 2;
                }
                break;
            case "safe_robotlimit":
                if (g_systemFlag) {
                    $scope.show_safeRobotLimitCfg = 1;
                } else {
                    $scope.show_safeRobotLimitCfg = 2;
                }
                break;
            case "joint_torque_detection":
                if (g_systemFlag) {
                    $scope.show_jointtorquedetectionCfg = 1;
                } else {
                    $scope.show_jointtorquedetectionCfg = 2;
                }
                break;
            default:
                break;
        }
    }


    /* 获取机器人安全相关配置参数值 */
    function getSafetyCfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                // 安全停止
                $scope.selectedSafetyStopMode = $scope.safetyStopModeDict[~~data.safetystop_enable];
                // 安全速度
                $scope.whetherSafeSpeedMode = $scope.safeSpeedEnableData[~~data.velreduce_enable];
                $scope.enableSafeSpeed = ~~data.velreduce_maxtcpvel;
                // DIO安全
                $scope.selectedSafetyValidDI0 = $scope.digitalIOSafetyDict[~~data.ctl_di0_safety_level];
                $scope.selectedSafetyValidDI1 = $scope.digitalIOSafetyDict[~~data.ctl_di1_safety_level];
                $scope.selectedSafetyValidDI2 = $scope.digitalIOSafetyDict[~~data.ctl_di2_safety_level];
                $scope.selectedSafetyValidDI3 = $scope.digitalIOSafetyDict[~~data.ctl_di3_safety_level];
                $scope.selectedSafetyValidDI4 = $scope.digitalIOSafetyDict[~~data.ctl_di4_safety_level];
                $scope.selectedSafetyValidDI5 = $scope.digitalIOSafetyDict[~~data.ctl_di5_safety_level];
                $scope.selectedSafetyValidDI6 = $scope.digitalIOSafetyDict[~~data.ctl_di6_safety_level];
                $scope.selectedSafetyValidDI7 = $scope.digitalIOSafetyDict[~~data.ctl_di7_safety_level];
                $scope.selectedSafetyValidDI8 = $scope.digitalIOSafetyDict[~~data.ctl_di8_safety_level];
                $scope.selectedSafetyValidDI9 = $scope.digitalIOSafetyDict[~~data.ctl_di9_safety_level];
                $scope.selectedSafetyValidDI10 = $scope.digitalIOSafetyDict[~~data.ctl_di10_safety_level];
                $scope.selectedSafetyValidDI11 = $scope.digitalIOSafetyDict[~~data.ctl_di11_safety_level];
                $scope.selectedSafetyValidDI12 = $scope.digitalIOSafetyDict[~~data.ctl_di12_safety_level];
                $scope.selectedSafetyValidDI13 = $scope.digitalIOSafetyDict[~~data.ctl_di13_safety_level];
                $scope.selectedSafetyValidDI14 = $scope.digitalIOSafetyDict[~~data.ctl_di14_safety_level];
                $scope.selectedSafetyValidDI15 = $scope.digitalIOSafetyDict[~~data.ctl_di15_safety_level];
                $scope.selectedSafetyValidDO0 = $scope.digitalIOSafetyDict[~~data.ctl_do0_safety_level];
                $scope.selectedSafetyValidDO1 = $scope.digitalIOSafetyDict[~~data.ctl_do1_safety_level];
                $scope.selectedSafetyValidDO2 = $scope.digitalIOSafetyDict[~~data.ctl_do2_safety_level];
                $scope.selectedSafetyValidDO3 = $scope.digitalIOSafetyDict[~~data.ctl_do3_safety_level];
                $scope.selectedSafetyValidDO4 = $scope.digitalIOSafetyDict[~~data.ctl_do4_safety_level];
                $scope.selectedSafetyValidDO5 = $scope.digitalIOSafetyDict[~~data.ctl_do5_safety_level];
                $scope.selectedSafetyValidDO6 = $scope.digitalIOSafetyDict[~~data.ctl_do6_safety_level];
                $scope.selectedSafetyValidDO7 = $scope.digitalIOSafetyDict[~~data.ctl_do7_safety_level];
                $scope.selectedSafetyValidDO8 = $scope.digitalIOSafetyDict[~~data.ctl_do8_safety_level];
                $scope.selectedSafetyValidDO9 = $scope.digitalIOSafetyDict[~~data.ctl_do9_safety_level];
                $scope.selectedSafetyValidDO10 = $scope.digitalIOSafetyDict[~~data.ctl_do10_safety_level];
                $scope.selectedSafetyValidDO11 = $scope.digitalIOSafetyDict[~~data.ctl_do11_safety_level];
                $scope.selectedSafetyValidDO12 = $scope.digitalIOSafetyDict[~~data.ctl_do12_safety_level];
                $scope.selectedSafetyValidDO13 = $scope.digitalIOSafetyDict[~~data.ctl_do13_safety_level];
                $scope.selectedSafetyValidDO14 = $scope.digitalIOSafetyDict[~~data.ctl_do14_safety_level];
                $scope.selectedSafetyValidDO15 = $scope.digitalIOSafetyDict[~~data.ctl_do15_safety_level];
                if (g_systemFlag) {
                    //设置降速模式参数,超速后的模式 0-超速后停止报警，1-超速后自动限速
                    $scope.postOverSpeedMode = $scope.postOverSpeedData[~~data.velreduce_strategy];

                    if (g_safetyCIFuncArr.indexOf(~~data.ctl_di8_config) != -1 && ~~data.ctl_di8_config == ~~data.ctl_di9_config) {
                        $scope.selectedCI0CI1Func = ~~data.ctl_di8_config + "";
                    }
                    if (g_safetyCIFuncArr.indexOf(~~data.ctl_di10_config) != -1 && ~~data.ctl_di10_config == ~~data.ctl_di11_config) {
                        $scope.selectedCI2CI3Func = ~~data.ctl_di10_config + "";
                    }
                    if (g_safetyCIFuncArr.indexOf(~~data.ctl_di12_config) != -1 && ~~data.ctl_di12_config == ~~data.ctl_di13_config) {
                        $scope.selectedCI4CI5Func = ~~data.ctl_di12_config + "";
                    }
                    if (g_safetyCIFuncArr.indexOf(~~data.ctl_di14_config) != -1 && ~~data.ctl_di14_config == ~~data.ctl_di15_config) {
                        $scope.selectedCI6CI7Func = ~~data.ctl_di14_config + "";
                    }
                    if (g_safetyCOFuncArr.indexOf(~~data.ctl_do8_config) != -1 && ~~data.ctl_do8_config == ~~data.ctl_do9_config) {
                        $scope.selectedCO0CO1Func = ~~data.ctl_do8_config + "";
                    }
                    if (g_safetyCOFuncArr.indexOf(~~data.ctl_do10_config) != -1 && ~~data.ctl_do10_config == ~~data.ctl_do11_config) {
                        $scope.selectedCO2CO3Func = ~~data.ctl_do10_config + "";
                    }
                    if (g_safetyCOFuncArr.indexOf(~~data.ctl_do12_config) != -1 && ~~data.ctl_do12_config == ~~data.ctl_do13_config) {
                        $scope.selectedCO4CO5Func = ~~data.ctl_do12_config + "";
                    }
                    if (g_safetyCOFuncArr.indexOf(~~data.ctl_do14_config) != -1 && ~~data.ctl_do14_config == ~~data.ctl_do15_config) {
                        $scope.selectedCO6CO7Func = ~~data.ctl_do14_config + "";
                    }
                    // 工具方向限制
                    $scope.toolEnableFlag = Number(~~data.tooldirection_enable);
                    $scope.toolDirectRx = ~~data.tooldirection_angle;
                    $scope.toolDirectRy = ~~data.tooldirection_rx;
                    $scope.toolDirectRz = ~~data.tooldirection_ry;
                    $scope.intersectionAngle = ~~data.tooldirection_rz;
                    // 机器人限值
                    $scope.robotLimitEnabledFlag = Number(~~data.momentumpower_enableflag);
                    $scope.robotMomentumLimit = ~~data.momentumpower_momentumlimit;
                    $scope.robotPowerLimit = ~~data.momentumpower_powerlimit;
                    // 机器人动量、功率根据型号设定最大值范围 type 1-fr3/2-fr5/3-fr10/4-fr16/5-fr20
                    if (g_robotType.type == 1) {
                        $scope.maxMomentumValue = 15;
                        $scope.maxPowerValue = 220;
                        $scope.momentumValueTip = '0 ~ 15';
                        $scope.momentumValueTip = '0 ~ 220';
                    } else if(g_robotType.type == 2) {
                        $scope.maxMomentumValue = 30;
                        $scope.maxPowerValue = 400;
                        $scope.momentumValueTip = '0 ~ 30';
                        $scope.momentumValueTip = '0 ~ 400';
                    } else if(g_robotType.type == 3) {
                        $scope.maxMomentumValue = 70;
                        $scope.maxPowerValue = 660;
                        $scope.momentumValueTip = '0 ~ 70';
                        $scope.momentumValueTip = '0 ~ 660';
                    } else if(g_robotType.type == 4) {
                        $scope.maxMomentumValue = 65;
                        $scope.maxPowerValue = 660;
                        $scope.momentumValueTip = '0 ~ 65';
                        $scope.momentumValueTip = '0 ~ 660';
                    } else if(g_robotType.type == 5) {
                        $scope.maxMomentumValue = 220;
                        $scope.maxPowerValue = 1200;
                        $scope.momentumValueTip = '0 ~ 220';
                        $scope.momentumValueTip = '0 ~ 1200';
                    } else {
                        $scope.maxMomentumValue = 220;
                        $scope.maxPowerValue = 1200;
                        $scope.momentumValueTip = '0 ~ 220';
                        $scope.momentumValueTip = '0 ~ 1200';
                    }
                }
                // 急停停机
                $scope.selectedEStopMode = $scope.eStopModeDict[~~data.safety_estop_mode];
                $scope.eStopTimeLimit = parseFloat(data.safety_estop_timelimit).toFixed(3);
                $scope.eStopDisLimit = parseFloat(data.safety_estop_dislimit).toFixed(3);
                // 保护性停机
                $scope.selectedPStopMode = $scope.pStopModeDict[~~data.safety_pstop_mode];
                //功率检测配置
                $scope.controlStatusEnabledFlag = parseInt(~~data.power_flag);
                $scope.powerDetectionLimit = ~~data.power_limit;
                hidePageLoading();
            }, (status) => {
                toastFactory.error(safDynamicTags.error_messages[0]);
                hidePageLoading();
            });
    }

    /* 安全停止模式 */
    /**
     * 设置机器人安全停止模式
     * @param {Object} safetyStopMode 安全停止模式对象
     */
    $scope.setSafetyStopMode = function (safetyStopMode) {
        if (safetyStopMode == undefined || safetyStopMode == null) {
            toastFactory.info(safDynamicTags.info_messages[4]);
        } else {
            let setSafetyModeCmd = {
                cmd: 567,
                data: {
                    content: `SetSafetyStopPara(${safetyStopMode.id})`
                }
            }
            dataFactory.setData(setSafetyModeCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                })
        }
    }
    /* ./安全停止模式 */


    /* 安全速度 */
    /* 配置安全速度参数值 */
    $scope.setVelReducePara = function() {
        let content;
        if (g_systemFlag) {
            content = `SetVelReducePara(${$scope.whetherSafeSpeedMode.id},${$scope.enableSafeSpeed},${$scope.postOverSpeedMode.id})`;
        } else {
            content = `SetVelReducePara(${$scope.whetherSafeSpeedMode.id},${$scope.enableSafeSpeed})`
        }
        if ($scope.enableSafeSpeed == "" || $scope.enableSafeSpeed == null) {
            toastFactory.info(safDynamicTags.info_messages[0]);
        } else {
            let setSafeSpeedCmd = {
                cmd: 568,
                data: {
                    content: content
                }
            };
            dataFactory.setData(setSafeSpeedCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }
    /* ./安全速度 */

    
    /* DIO安全 */
    /**
     * 配置DI安全有效状态
     * @param {Array} diSafetyValidArr DI安全有效值
     */
     $scope.setSafetyDIValid = function (diSafetyValidArr) {
        let setSafetyDIValidCmd = {
            cmd: 838,
            data: {
                content: `SetSafetyDILevel({${diSafetyValidArr}})`
            }
        }
        dataFactory.setData(setSafetyDIValidCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 配置DO安全有效状态
     * @param {Array} doSafetyValidArr DO安全有效值
     */
     $scope.setSafetyDOValid = function (doSafetyValidArr) {
        let setSafetyDOValidCmd = {
            cmd: 839,
            data: {
                content: `SetSafetyDOLevel({${doSafetyValidArr}})`
            }
        }
        dataFactory.setData(setSafetyDOValidCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 配置DIO安全功能
     * @param {Array} dioSafetyFunc DIO安全功能
     */
    $scope.setSafetyDIOFunc = function (diSafetyFunc, doSafetyFunc) {
        // 设置DI功能参数
        let setDiCfgCmd = {
            cmd: 323,
            data: {
                content: `SetDIConfig(${diSafetyFunc})`,
            },
        };
        dataFactory.setData(setDiCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        // 设置DO功能参数
        let setDoCfgCmd = {
            cmd: 324,
            data: {
                content: `SetDOConfig(${doSafetyFunc})`,
            },
        };
        dataFactory.setData(setDoCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    let safetyDISetFlag = 0;   // 设置DI安全功能成功与否标志位
    let safetyDOSetFlag = 0;   // 设置DO安全功能成功与否标志位
    document.getElementById('safeSet').addEventListener('323', (e) => {
        if (e.detail == '1' && safetyDOSetFlag) {
            getSafetyCfg();
            if (g_systemFlag) {
                setRobotIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
            }
        } else if (e.detail == '1') {
            safetyDISetFlag = 1;
        } else {
            safetyDISetFlag = 0;
        }
    });
    document.getElementById('safeSet').addEventListener('324', (e) => {
        if (e.detail == '1' && safetyDISetFlag) {
            getSafetyCfg();
            if (g_systemFlag) {
                setRobotIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
            }
        } else if (e.detail == '1') {
            safetyDOSetFlag = 1;
        } else {
            safetyDOSetFlag = 0;
        }
    });

    /* 获取IO别名配置数据 */
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
        }, (status) => {
            toastFactory.error(status);
        });
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
    function setRobotIOAlias(ctrlDIArr, ctrlDOArr, ctrlAIArr, ctrlAOArr, endDIArr, endDOArr, endAIArr, endAOArr) {
        if ($scope.selectedCI0CI1Func != 0) {
            ctrlDIArr[8] = $scope.DICfgData[Number($scope.selectedCI0CI1Func) + 1].name;
            ctrlDIArr[9] = $scope.DICfgData[Number($scope.selectedCI0CI1Func) + 1].name;
        } else {
            ctrlDIArr[8] = '';
            ctrlDIArr[9] = '';
        }
        if ($scope.selectedCI2CI3Func != 0) {
            ctrlDIArr[10] = $scope.DICfgData[Number($scope.selectedCI2CI3Func) + 1].name;
            ctrlDIArr[11] = $scope.DICfgData[Number($scope.selectedCI2CI3Func) + 1].name;
        } else {
            ctrlDIArr[10] = '';
            ctrlDIArr[11] = '';
        }
        if ($scope.selectedCI4CI5Func != 0) {
            ctrlDIArr[12] = $scope.DICfgData[Number($scope.selectedCI4CI5Func) + 1].name;
            ctrlDIArr[13] = $scope.DICfgData[Number($scope.selectedCI4CI5Func) + 1].name;
        } else {
            ctrlDIArr[12] = '';
            ctrlDIArr[13] = '';
        }
        if ($scope.selectedCI6CI7Func != 0) {
            ctrlDIArr[14] = $scope.DICfgData[Number($scope.selectedCI6CI7Func) + 1].name;
            ctrlDIArr[15] = $scope.DICfgData[Number($scope.selectedCI6CI7Func) + 1].name;
        } else {
            ctrlDIArr[14] = '';
            ctrlDIArr[15] = '';
        }
        if ($scope.selectedCO0CO1Func != 0) {
            ctrlDOArr[8] = $scope.DOCfgData[Number($scope.selectedCO0CO1Func) + 1].name;
            ctrlDOArr[9] = $scope.DOCfgData[Number($scope.selectedCO0CO1Func) + 1].name;
        } else {
            ctrlDOArr[8] = '';
            ctrlDOArr[9] = '';
        }
        if ($scope.selectedCO2CO3Func != 0) {
            ctrlDOArr[10] = $scope.DOCfgData[Number($scope.selectedCO2CO3Func) + 1].name;
            ctrlDOArr[11] = $scope.DOCfgData[Number($scope.selectedCO2CO3Func) + 1].name;
        } else {
            ctrlDOArr[10] = '';
            ctrlDOArr[11] = '';
        }
        if ($scope.selectedCO4CO5Func != 0) {
            ctrlDOArr[12] = $scope.DOCfgData[Number($scope.selectedCO4CO5Func) + 1].name;
            ctrlDOArr[13] = $scope.DOCfgData[Number($scope.selectedCO4CO5Func) + 1].name;
        } else {
            ctrlDOArr[12] = '';
            ctrlDOArr[13] = '';
        }
        if ($scope.selectedCO6CO7Func != 0) {
            ctrlDOArr[14] = $scope.DOCfgData[Number($scope.selectedCO6CO7Func) + 1].name;
            ctrlDOArr[15] = $scope.DOCfgData[Number($scope.selectedCO6CO7Func) + 1].name;
        } else {
            ctrlDOArr[14] = '';
            ctrlDOArr[15] = '';
        }
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
            toastFactory.error(status);
        });
    };

    /* ./DIO安全 */

    /* 急停停机 */
    /**
     * 配置急停停机参数
     * @param {int} eStopMode 停止类型：0-0类，1-1类
     * @param {float} eStopTimeLimit 停止时间限值
     * @param {float} eStopDisLimit 停止距离限值
     */
    $scope.setEmergencyStopParam = function (eStopMode, eStopTimeLimit, eStopDisLimit) {
        if (eStopTimeLimit == undefined || eStopTimeLimit == null || eStopTimeLimit == "" 
            || eStopDisLimit == undefined || eStopDisLimit == null || eStopDisLimit == "") {
            toastFactory.info(safDynamicTags.info_messages[4]);
        } else {
            let setEStopCmd = {
                cmd: 840,
                data: {
                    content: `SetEmergencyStopParam(${eStopMode},${eStopTimeLimit},${eStopDisLimit})`
                }
            }
            dataFactory.setData(setEStopCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }
    /* ./急停停机 */

    /* 保护性停机 */
    /**
     * 配置保护性停机参数
     * @param {int} pStopMode 停止类型：0-0类，1-1类，2-2类
     */
     $scope.setProtectiveStopParam = function (pStopMode) {
        let setPStopCmd = {
            cmd: 841,
            data: {
                content: `SetProtectiveStopParam(${pStopMode})`
            }
        }
        dataFactory.setData(setPStopCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /* ./保护性停机 */
    

    /* 安全墙 */
    $scope.choosesafetyPlaneArray = [
        {
            planeNum: '0',
            name: 'Plane1',
            status: 0
        },
        {
            planeNum: '1',
            name: 'Plane2',
            status: 0
        },
        {
            planeNum: '2',
            name: 'Plane3',
            status: 0
        },
        {
            planeNum: '3',
            name: 'Plane4',
            status: 0
        },
        {
            planeNum: '4',
            name: 'Plane5',
            status: 0
        },
        {
            planeNum: '5',
            name: 'Plane6',
            status: 0
        },
        {
            planeNum: '6',
            name: 'Plane7',
            status: 0
        },
        {
            planeNum: '7',
            name: 'Plane8',
            status: 0
        }
    ]

    /**
     * 获取安全墙配置
     */
    let safetyPlaneArray = {};
    function getSafetyPlaneConfig() {
        let getSafetyPlaneConfigCmd = {
            cmd: "get_robot_cfg"
        };
        dataFactory.getData(getSafetyPlaneConfigCmd)
            .then((data) => {
                safetyPlaneArray = data;
                // 获取数据时安全墙启用点显示
                $scope.choosesafetyPlaneArray.forEach((item, index) => {
                    item.status = Number(safetyPlaneArray[`safetyplane${index}_enable`]);
                });
            }, (status) => {
                toastFactory.error(status, safDynamicTags.error_messages[1]);
            });
    }

    /**
     * 安全墙启用开关 
     * @param {uint8_t} item.planeNum 平面序号，范围1~8
     * @param {uint8_t} item.status 0-关 1-开
     */
    let enableSwitch;
    $scope.enableSafetyPlane = function(item) {
        enableSwitch = item.planeNum;

        let enableSafetyPlaneCmd = {
            cmd: 740,
            data: {
                content: "SafetyPlaneOnOff(" + item.planeNum + "," + item.status + ")"
            }
        };
        dataFactory.setData(enableSafetyPlaneCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('safeSet').addEventListener('740', () => {
        $scope.choosesafetyPlaneArray[enableSwitch].status = 0; //启用失败，启用按钮关闭
    })

    /**
     * 选择安全墙
     * @param {uint8_t} planeNum 安全墙planeNum
     */
    $scope.selectSafetyPlane = function(planeNum) {
        if (safetyPlaneArray) {
            $scope.safetyLength = safetyPlaneArray[`safetyplane${planeNum}_safe_dis`];
            //切换安全墙后清空之前的状态
            for (let i=1; i<5; i++) {
                $(`#param${i}`).removeClass(("success"));
                $(`#param${i}`).removeClass(("warning"));
            }
            paramIdRecord = []; //清空记录设置安全墙数组
        }
    }

    /**
     * 设置安全墙参数 
     * @param {uint8_t} item 平面序号数组，item.planeNum 范围1~8 , 
     * @param {double} distance 安全距离单位mm
     */
    $scope.setSafetyPlanePara = function(item, distance) {
        if (!item) {
            toastFactory.warning(safDynamicTags.warning_messages[0]);
            return;
        }

        let setSafetyPlaneParaCmd = {
            cmd: 741,
            data: {
                content: "SafetyPlaneSetPara(" + item.planeNum + "," + ( distance || 0 ) + ")"
            }
        };
        dataFactory.setData(setSafetyPlaneParaCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('safeSet').addEventListener('741', e => {
        if (e.detail) {
            getSafetyPlaneConfig();
        }
    })

    /**
     * 设置安全墙参考点
     * @param {uint8_t} pointNum 点的序号，范围1~4
     */
    let setParamFlag;
    let paramIdRecord = [];
    $scope.setSafetyPlaneRefPoint = function(pointNum) {
        //设置参考点之前必须选择安全墙
        if (!$scope.chooseSafetyPlane) {
            toastFactory.warning(safDynamicTags.warning_messages[0]);
            return;
        }
        setParamFlag = pointNum; //是否选择参考点标志id
        let setSafetyPlaneRefPointCmd = {
            cmd: 742,
            data: {
                content: "SafetyPlaneSetRefPoint(" + pointNum + ")"
            }
        };
        dataFactory.setData(setSafetyPlaneRefPointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    /**
     * 安全墙参考点状态  
     * 0-失败 黄色 ,1-成功 绿色 
     * */
    document.getElementById('safeSet').addEventListener('742', e => {
        if (e.detail == '1') {
            $(`#param${setParamFlag}`).removeClass("warning");
            $(`#param${setParamFlag}`).addClass("success");
            //记录设置的安全墙参考点个数的数组
            if (paramIdRecord.findIndex(value => value == setParamFlag) != -1) {
                return;
            }
            paramIdRecord.push(setParamFlag);
        } else {
            $(`#param${setParamFlag}`).addClass("warning");
            $(`#param${setParamFlag}`).removeClass("success");
        }
    })

    /**
     * 安全墙计算
     * @param {uint8_t} planeNum 安全墙id
     * @returns 
     */
    $scope.solveSafetyPlane = function(planeNum) {
        //判断是否四个参考点都已设置成功
        if (paramIdRecord.length < 4) {
            toastFactory.warning(safDynamicTags.warning_messages[1]);
            return;
        }

        if (!planeNum) {
            toastFactory.warning(safDynamicTags.warning_messages[0]);
            return;
        }
        let solveSafetyPlaneCmd = {
            cmd: 743,
            data: {
                content: "SafetyPlaneSolve(" + planeNum + ")"
            }
        };
        dataFactory.setData(solveSafetyPlaneCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status,safDynamicTags.error_messages[2]);
            });
    }
    document.getElementById('safeSet').addEventListener('743', () => {
        //计算完成后，参考点设置状态恢复，颜色清空
        for (let i=1; i<5; i++) {
            $(`#param${i}`).removeClass(("success"));
        }
        paramIdRecord = []; //清空记录设置安全墙数组
    })
    /* ./安全墙 */

    /* 安全后台程序 */
    /**获取程序名 */
    function getUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd).then((data) => {
            $scope.daemonProgramData = Object.keys(data);
        }, (status) => {
            toastFactory.error(status, safDynamicTags.error_messages[2]);
        });
    }

    /**获取意外情况处理逻辑参数 */
    function getAccidentsData() {
        let getAccidentsCmd = {
            cmd: 747,
            data: {
                content: 'ExceptionsGetParam()'
            }
        };
        dataFactory.setData(getAccidentsCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    document.getElementById('safeSet').addEventListener('747', e => {
        if (Object.keys(e).length && e.detail) {
            const result = e.detail.split(',');
            $scope.daemonEnabled = Number(result[0]);
            $scope.daemonAccidentsData.forEach(item => {
                if (item.id == result[1]) {
                    $scope.selectAccidents = item;
                }
            });
            $scope.selectProgram = result[2].split('/')[result[2].split('/').length - 1];
        } else {
            toastFactory.info(safDynamicTags.info_messages[3]);
        }
    })

    /**功能启用*/
    $scope.enableSafetyDaemon = function() {
        if ($scope.daemonEnabled == false) {
            $scope.daemonEnabled = 0;
        }
        let setEnableCmd = {
            cmd: 748,
            data: {
                content: `ExceptionsHandleRoutineOnOff(${$scope.daemonEnabled})`
            }
        };
        dataFactory.setData(setEnableCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    document.getElementById('safeSet').addEventListener('748', () => {
        getAccidentsData();
    })

    /**配置意外情况处理逻辑参数*/
    $scope.setAccidentsData = function() {
        let setProgramName = '';
        if(g_systemFlag == 1){
            setProgramName = "/usr/local/etc/controller/lua/" + $scope.selectProgram;
        }else{
            setProgramName = "/fruser/" + $scope.selectProgram;
        }
        if ($scope.selectProgram && $scope.selectAccidents && $scope.selectAccidents.id) {
            let setEnableCmd = {
                cmd: 746,
                data: {
                    content: `ExceptionsSetParam(${$scope.selectAccidents.id},'${setProgramName}')`
                }
            };
            dataFactory.setData(setEnableCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            if (!$scope.selectProgram) {
                toastFactory.info(safDynamicTags.info_messages[2]);
            }
            if (!($scope.selectAccidents && $scope.selectAccidents.id)) {
                toastFactory.info(safDynamicTags.info_messages[1]);
            }
        }
    }
    document.getElementById('safeSet').addEventListener('746', () => {
        getAccidentsData();
    })
    /* ./安全后台程序 */

    /* 工具方向限制参数配置 */
    /**同步TCPrx、ry、rz参数 */
    $scope.syncToolDataParam = function() {
        $scope.toolDirectRx = $scope.currentTCP.rx;
        $scope.toolDirectRy = $scope.currentTCP.ry;
        $scope.toolDirectRz = $scope.currentTCP.rz;
    }

    /**
     * 工具方向限制
     * @param {int} enable 0-关 1-开
     * @param {float} rx 基准工具方向 rx
     * @param {float} ry 基准工具方向 ry
     * @param {float} rz 基准工具方向 rz
     * @param {int} angle 
     */
    $scope.setToolDirection = function(enable,rx,ry,rz,angle) {
        if (!angle) {
            toastFactory.info(safDynamicTags.info_messages[5]);
            return;
        }
        let setCmd = {
            cmd: 913,
            data: {
                content: `SetToolDirectionParam(${enable},${rx},${ry},${rz},${angle})`
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /* ./工具方向限制参数配置 */

    /**
     * 功能安全限制设置
     * @param {int} enable 0-关 1-开
     * @param {int} momentum 动量
     * @param {int} power 功率
     */
    $scope.setMomentumParam = function(enable,momentum,power) {
        if (!momentum) {
            toastFactory.info(safDynamicTags.info_messages[6]);
            return;
        }
        if (!power) {
            toastFactory.info(safDynamicTags.info_messages[7]);
            return;
        }
        let setCmd = {
            cmd: 914,
            data: {
                content: `SetMomentumPowerOnOff(${enable},${momentum},${power})`
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }

    /**
     * 功能安全限制设置
     * @param {int} enable 0-关 1-开
     * @param {int} power 设定功率
     */
    $scope.setPowerLimit = function(enable,power) {
        if (!power) {
            toastFactory.info(safDynamicTags.info_messages[8]);
            return;
        }
        let setCmd = {
            cmd: 961,
            data: {
                content: `SetPowerLimit(${enable},${power})`
            }
        };
        dataFactory.setData(setCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
}