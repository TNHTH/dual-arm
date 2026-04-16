angular
    .module('frApp')
    .controller('graphicalprogrammingCtrl', ['$scope', '$http', '$modal', 'dataFactory', 'toastFactory', '$q', 'liveCode', graphicalprogrammingCtrlFn])

function graphicalprogrammingCtrlFn($scope, $http, $modal, dataFactory, toastFactory, $q, liveCode) {
    // 页面显示范围修改
    $scope.quitSetMounting();
    let viewFlg = 0;   //0-half,1-full
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    $scope.changeView = function () {
        if (viewFlg) {
            $scope.halfBothView();
            onresize();
            viewFlg = 0;
            $(".block-code-container").css('right','42rem');
            $(".block-code-container").css('transition','right 0.5s');
        } else {
            $scope.fullContentView();
            onresize();
            viewFlg = 1;
            $(".block-code-container").css('right','0rem');
            $(".block-code-container").css('transition','none');
        }
    }
    liveCode.initLiveCode();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let gpDynamicTags;
    // 获取数据标志位，只有在全部数据获取到的时候才进行blockly初始化
    let getPointsFlg = 0;
    let getTPDFlg = 0;
    let getSensorToolCoordFlg = 0;
    /* 获取DIO，AIO数据 */
    let tempItem = [];
    let userData =[];
    let diOptionsArr = [];
    let toolDiOptionsArr = [];
    let doModeOptionsArr = [];
    let PauseOptionsArr = [];
    let doOptionsArr = [];
    let toolDoOptionsArr = [];
    let aiOptionsArr = [];
    let aoOptionsArr = [];
    let toolCoordOptionsArr = [];
    let toolTrsfCoordeArr = [];
    let exToolCoordOptionsArr = [];
    let exToolCoordTrsOptionsArr = [];
    let wobjToolCoordOptionsArr = [];
    let wobjTrsCoordeDataArr = [];
    let waitMultiDIOptionArr = [];
    let blockDataArr = [];
    let whetherDataArr = [];
    let treatStrategyDataArr = [];
    let whetherSingleDataArr = [];
    let whetherMotionArr = [];
    let connectionDataArr = [];
    let comparationDataArr = [];
    let linModeDataArr = [];
    let whetherTruthDataArr = [];
    let layerIdDataArr = [];
    let functionTypeDataArr = [];
    let segmentModeDataArr = [];
    let functionModeDataArr = [];
    let functionIOTypeDataArr = [];
    let weaveModeDataArr = [];
    let roundingRuleDataArr = [];
    let loadPosSensorDriverDataArr = [];
    let hSprialDriectionArr = [];
    let offsetFlagDataArr = [];
    let offsetTypeDataArr = [];
    let newSplineModeDataArr = [];
    let nSpiralOffsetFlagDataArr = [];
    let spiralDirectionDataArr = [];
    let trajectoryJModeArr = [];
    let zeroModeDataArr = [];
    let servoZeroModeDataArr = [];
    let auxServoCommandModeArr = [];
    let servoEnableDataArr = [];
    let servoIdDataArr = [];
    let servoIdData = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'];
    let conTrackModeDataArr = [];
    let enableDataArr = [];
    let polishCommandModeArr = [];
    let collideModeDataArr = [];
    let traceIsleftrightDataArr = [];
    let weldTraceAxisselectDataArr = [];
    let weldTraceReferenceTypeDataArr = [];
    let FTControlAdjSignDataArr = [];
    let FTControlILCSignDataArr = [];
    let FTReferenceCoordDataArr = [];
    let FTRotOrnDataArr = [];
    let FTRotRotOrnDataArr = [];
    let wobjAxisDataArr = [];
    let torqueSmoothTypeDataArr = [];
    let AIcompareArr = [];
    let modbusRegReadFunctionCodeDataArr = [];
    let modbusRegWriteFunctionCodeDataArr = [];
    let lockXPointModeDataArr = [];
    let techPlateTypeArr = [];
    let techMotionDirectionArr = [];
    let infPointTypeArr = [];
    let wireSearchType1MethodDataArr = [];
    let wireSearchType2MethodDataArr = [];
    let outputMoveDOModeDataArr = [];
    let IOTypeDictArr = [];
    let wireRefPosDataArr = [];
    let wireSearchBackFlagDataArr = [];
    let wireSearchModeDataArr = [];
    let setTPDModeArr = [];
    let wireSearchRefPointDataArr = [];
    let wireSearchResPointDataArr = [];
    let weldRecordDataArr = [];
    let TplateTypeArr = [];
    let servoCModeDataArr = [];
    let collisionLevelArr = [];
    gpDynamicTags = langJsonData.graphical_programming;
    let commandNameData = langJsonData.commandlist["commandName"]; //代码块名称
    let descriptionData = langJsonData.commandlist["customContent"]; //代码块描述文本
    let paramCommandArray = langJsonData.program_teach.var_object["program_command_array"]; //代码块描述标题
    let graphInputTitles = langJsonData.commandlist.nodeEditorCommands
    let DinData = langJsonData.commandlist.DinData;
    let DoData = langJsonData.commandlist.DoData;
    let AIport = langJsonData.commandlist.AIport;
    let AOport = langJsonData.commandlist.AOport;
    let rsDynamicTags;
    rsDynamicTags = langJsonData.robot_setting;
    $scope.fr5collideGradeData = rsDynamicTags.var_object.fr5collideGradeData;
    $scope.fr3collideGradeData = rsDynamicTags.var_object.fr3collideGradeData;
    $scope.fr10collideGradeData = rsDynamicTags.var_object.fr10collideGradeData;
    /* 初始化 */
    getToolCoordData();
    getPointsData();
    getTPDName();
    getBlocklyWorkspaceNames();
    getIOAliasData();
    getUserFiles();
    getToolTrsfCoordData();
    getExToolCoordData();
    getWobjCoordData();
    getTrajectoryFileNameList();
    getModbusMasterConfig();
    getModbusSlaveAliasConfig();
    getPointTableModeList();
    g_programErr = 0; //清除示教程序Newdofile报错影响图形化编程程序运行
    g_nodeLuaError = false; //清除节点图编程Newdofile报错影响图形化编程程序运行
    /* ./初始化 */

    /* TODO: Change toolbox XML ID if necessary. Can export toolbox XML from Workspace Factory. */

    // Blockly.defineBlocksWithJsonArray([
    //     // Block for colour picker.
    //     {
    //         "type": "colour_picker",
    //         "message0": "%1",
    //         "args0": [
    //             {
    //                 "type": "field_colour",
    //                 "name": "COLOUR",
    //                 "colour": "#ff0000"
    //             }
    //         ],
    //         "output": "Colour",
    //         "helpUrl": "%{BKY_COLOUR_PICKER_HELPURL}",
    //         "style": "colour_blocks",
    //         "tooltip": "%{BKY_COLOUR_PICKER_TOOLTIP}",
    //         "extensions": ["parent_tooltip_when_inline"]
    //     },
    //     // Block for random colour.
    //     {
    //         "type": "colour_random",
    //         "message0": "%{BKY_COLOUR_RANDOM_TITLE}",
    //         "output": "Colour",
    //         "helpUrl": "%{BKY_COLOUR_RANDOM_HELPURL}",
    //         "style": "colour_blocks",
    //         "tooltip": "%{BKY_COLOUR_RANDOM_TOOLTIP}"
    //     }
    // ]);

    /* 获取示教程序名称 */
    // function getUserFiles() {
    //     let getCmd = {
    //         cmd: "get_user_data",
    //     };
    //     dataFactory.getData(getCmd)
    //         .then((data) => {
    //             $scope.programName = data;
    //         }, (status) => {
    //             if (g_langFlg == 0) {
    //                 toastr.error("获取用户程序文件失败");
    //             } else if (g_langFlg == 1) {
    //                 toastr.error("Failed to get user file");
    //             } else if (g_langFlg == 2) {
    //                 toastr.error("ユーザプログラムファイルの取得に失敗しました");
    //             }
    //         });
    // };

    //碰撞等级设置变量初始化
    let collisionLevelData = [];
    if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
        collisionLevelData = $scope.fr3collideGradeData;
    } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
        collisionLevelData = $scope.fr5collideGradeData;
    } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
        collisionLevelData = $scope.fr10collideGradeData;
    } else {
        collisionLevelData = $scope.fr10collideGradeData;
    }

    //获取工具坐标系数据
    let toolCoordTempItem = [];
    let sensorCoordTempItem = [];
    let toolCoordForLaserOptionsArr = [];
    let sensorCoordOptionsArr = [];
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                data.forEach(element => {
                    toolCoordTempItem = [];
                    toolCoordTempItem[0] = element.name;
                    toolCoordTempItem[1] = element.id;
                    toolCoordForLaserOptionsArr.push(toolCoordTempItem);
                    if (element.type == "1") {
                        sensorCoordTempItem = [];
                        sensorCoordTempItem[0] = element.name;
                        sensorCoordTempItem[1] = element.id;
                        sensorCoordOptionsArr.push(sensorCoordTempItem);
                    }
                });
                if (sensorCoordOptionsArr.length == 0) {
                    sensorCoordOptionsArr.push([gpDynamicTags.info_messages[0], "-1"]);
                }
                // success
                getSensorToolCoordFlg = 1;
                if (document.getElementById("graphicalProgramming") != null) {
                    document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                }
            }, (status) => {
                /* test */
                if (g_testCode) {
                    sensorCoordOptionsArr = [
                        ["toolCoord2", "2"]
                    ];
                    getSensorToolCoordFlg = 1;
                    if (document.getElementById("graphicalProgramming") != null) {
                        document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                    }
                }
                /* ./test */
                toastFactory.error(status, gpDynamicTags.error_messages[0]);
            });
    };

    /**获取系统内轨迹（traj、trajJ）文件名称列表 */
    let trajFileNameData = [];
    let trajFileNameArr = [];
    function getTrajectoryFileNameList() {
        let getTrajFileNameListCmd = {
            cmd: "get_traj_files",
        }
        dataFactory.getData(getTrajFileNameListCmd)
            .then((data) => {
                trajFileNameData = data;
                if (!$.isEmptyObject(trajFileNameData)) {
                    trajFileNameData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        trajFileNameArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    trajFileNameArr.push(tempItem);
                }
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    trajFileNameArr = [
                        ["轨迹文件1", "轨迹文件1"],
                        ["轨迹文件2", "轨迹文件2"]
                    ];
                }
                /* ./test */
            });
    }

    
    /**获取主站配置 */
    let modbusMasterAddressDataArr = [];
    function getModbusMasterConfig() {
        let modbusMasterConfigCmd = {
            cmd: 886,
            data: {
                content: "ModbusMasterGetConfig()"
            }
        }
        dataFactory.setData(modbusMasterConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.modbusMasterConfigData = [
                        {
                            id: 0,
                            ip: "192.168.58.33",
                            port: 8020,
                            slaveID: 0,
                            period: 200,
                            alias: "Modbus_1"
                        },
                        {
                            id: 1,
                            ip: "192.168.58.34",
                            port: 8021,
                            slaveID: 1,
                            period: 200,
                            alias: "Modbus_2"
                        }
                    ]
                    $scope.modbusMasterConfigData.forEach(item => {
                        tempItem = [];
                        tempItem[0] = item.alias;
                        tempItem[1] = item.alias;
                        modbusMasterAddressDataArr.push(tempItem);
                    });
                    getModbusMasterAddressConfig();
                }
                /* ./test */
            });
    }

    document.getElementById('graphicalProgramming').addEventListener('886', e => {
        $scope.modbusMasterConfigData = JSON.parse(e.detail);
        if (!$.isEmptyObject($scope.modbusMasterConfigData)) {
            $scope.modbusMasterConfigData.forEach(item => {
                tempItem = [];
                tempItem[0] = item.alias;
                tempItem[1] = item.alias;
                modbusMasterAddressDataArr.push(tempItem);
            });
        }else {
            tempItem = [];
            tempItem[0] = gpDynamicTags.info_messages[4];
            tempItem[1] = gpDynamicTags.info_messages[4];
            modbusMasterAddressDataArr.push(tempItem);
        }
        getModbusMasterAddressConfig();
    })

    /**获取主站寄存器配置 */
    let modbusMasterDIDataArr = [];
    let modbusMasterDODataArr = [];
    let modbusMasterAIDataArr = [];
    let modbusMasterAODataArr = [];
    function getModbusMasterAddressConfig() {
        let modbusMasterConfigCmd = {
            cmd: 889,
            data: {
                content: "ModbusMasterGetAddressConfig()"
            }
        }
        dataFactory.setData(modbusMasterConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    let data = [];
                    $scope.modbusMasterAddressData = [
                        {
                            id: 0,
                            addressnum: 3,
                            addresstype: [0,1,3],
                            address: [2000,2001,2002],
                            alias: ["Register_di1","Register_do2","Register_ai3"]
                        },
                        {
                            id: 1,
                            addressnum: 3,
                            addresstype: [2,1,3],
                            address: [2000,2001,2002],
                            alias: ["Register_ai1","Register_do2","Register_ai3"]
                        },
                        {
                            id: 2,
                            addressnum: 3,
                            addresstype: [0,4,3],
                            address: [2000,2001,2002],
                            alias: ["Register_di1","Register_ai2","Register_ai3"]
                        },
                        {
                            id: 3,
                            addressnum: 3,
                            addresstype: [7,5,6],
                            address: [2000,2001,2002],
                            alias: ["Register_ao1","Register_ao2","Register_ao3"]
                        }
                    ]
                    $scope.modbusMasterAddressData.forEach(item => {
                        for(let i=0; i<item.addressnum; i++) {
                            let array_new = {};
                            array_new = {
                                id: item.id,
                                addresstype: item.addresstype[i], 
                                address: item.address[i], 
                                alias: item.alias[i],
                            }
                            data.push(array_new);
                        }
                    });
                    $scope.modbusMasterNewData = data;
                    $scope.modbusMasterDIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 0);
                    $scope.modbusMasterDOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 1);
                    $scope.modbusMasterAIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 2 || item.addresstype == 3 || item.addresstype == 4);
                    $scope.modbusMasterAOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 5 || item.addresstype == 6 || item.addresstype == 7);
            
                    $scope.modbusMasterDIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element.alias;
                        tempItem[1] = element.alias;
                        modbusMasterDIDataArr.push(tempItem);
                    });
                    $scope.modbusMasterDOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element.alias;
                        tempItem[1] = element.alias;
                        modbusMasterDODataArr.push(tempItem);
                    });
                    $scope.modbusMasterAIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element.alias;
                        tempItem[1] = element.alias;
                        modbusMasterAIDataArr.push(tempItem);
                    });
                    $scope.modbusMasterAOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element.alias;
                        tempItem[1] = element.alias;
                        modbusMasterAODataArr.push(tempItem);
                    });
                }
                /* ./test */
            });
    }
    document.getElementById('graphicalProgramming').addEventListener('889', e => {
        $scope.modbusMasterAddressData = JSON.parse(e.detail);
        let data = [];
        $scope.modbusMasterAddressData.forEach(item => {
            for(let i=0; i<item.addressnum; i++) {
                let array_new = {};
                array_new = {
                    id: item.id,
                    addresstype: item.addresstype[i], 
                    address: item.address[i], 
                    alias: item.alias[i],
                }
                data.push(array_new);
            }
        });
        $scope.modbusMasterNewData = data;
        $scope.modbusMasterDIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 0);
        $scope.modbusMasterDOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 1);
        $scope.modbusMasterAIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 2 || item.addresstype == 3 || item.addresstype == 4);
        $scope.modbusMasterAOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 5 || item.addresstype == 6 || item.addresstype == 7);

        if (!$.isEmptyObject($scope.modbusMasterDIData)) {
            $scope.modbusMasterDIData.forEach(item => {
                tempItem = [];
                tempItem[0] = item.alias;
                tempItem[1] = item.alias;
                modbusMasterDIDataArr.push(tempItem);
            });
        }else {
            tempItem = [];
            tempItem[0] = gpDynamicTags.info_messages[4];
            tempItem[1] = gpDynamicTags.info_messages[4];
            modbusMasterDIDataArr.push(tempItem);
        }

        if (!$.isEmptyObject($scope.modbusMasterDOData)) {
            $scope.modbusMasterDOData.forEach(item => {
                tempItem = [];
                tempItem[0] = item.alias;
                tempItem[1] = item.alias;
                modbusMasterDODataArr.push(tempItem);
            });
        }else {
            tempItem = [];
            tempItem[0] = gpDynamicTags.info_messages[4];
            tempItem[1] = gpDynamicTags.info_messages[4];
            modbusMasterDODataArr.push(tempItem);
        }

        if (!$.isEmptyObject($scope.modbusMasterAIData)) {
            $scope.modbusMasterAIData.forEach(item => {
                tempItem = [];
                tempItem[0] = item.alias;
                tempItem[1] = item.alias;
                modbusMasterAIDataArr.push(tempItem);
            });
        }else {
            tempItem = [];
            tempItem[0] = gpDynamicTags.info_messages[4];
            tempItem[1] = gpDynamicTags.info_messages[4];
            modbusMasterAIDataArr.push(tempItem);
        }

        if (!$.isEmptyObject($scope.modbusMasterAOData)) {
            $scope.modbusMasterAOData.forEach(item => {
                tempItem = [];
                tempItem[0] = item.alias;
                tempItem[1] = item.alias;
                modbusMasterAODataArr.push(tempItem);
            });
        }else {
            tempItem = [];
            tempItem[0] = gpDynamicTags.info_messages[4];
            tempItem[1] = gpDynamicTags.info_messages[4];
            modbusMasterAODataArr.push(tempItem);
        }
        initialLoadProgram();
    })

    /**获取从站寄存器别名 */
    let slaveDIDataArr = [];
    let slaveDODataArr = [];
    let slaveAIDataArr = [];
    let slaveAODataArr = [];
    function getModbusSlaveAliasConfig() {
        let getModbusSlaveAliasCmd = {
            cmd: "get_modbusslave_IO_alias_cfg"
        }
        dataFactory.getData(getModbusSlaveAliasCmd)
            .then((data) => {
                $scope.modbusSlaveIOAliasData = data;
                $scope.slaveDIData = $scope.modbusSlaveIOAliasData["DI"];
                $scope.slaveDOData = $scope.modbusSlaveIOAliasData["DO"];
                $scope.slaveAIData = $scope.modbusSlaveIOAliasData["AI"];
                $scope.slaveAOData = $scope.modbusSlaveIOAliasData["AO"];

                if (!$.isEmptyObject($scope.slaveDIData)) {
                    $scope.slaveDIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveDIDataArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    slaveDIDataArr.push(tempItem);
                }

                if (!$.isEmptyObject($scope.slaveDOData)) {
                    $scope.slaveDOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveDODataArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    slaveDODataArr.push(tempItem);
                }

                if (!$.isEmptyObject($scope.slaveAIData)) {
                    $scope.slaveAIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveAIDataArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    slaveAIDataArr.push(tempItem);
                }

                if (!$.isEmptyObject($scope.slaveAOData)) {
                    $scope.slaveAOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveAODataArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    slaveAODataArr.push(tempItem);
                }
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    let data = {
                        "DI":["DI0","DI1","DI2","DI3","DI4","DI5","DI6","DI7","DI8","DI9","DI10","DI11","DI12","DI13","DI14","DI15","DI16"],
                        "DO":["DO0","DO1","DO2","DO3","DO4","DO5","DO6","DO7","DO8","DO9","DO10","DO11","DO12","DO13","DO14","DO15","DO16"],
                        "AI":["AI0","AI1","AI2","AI3","AI4","AI5","AI6","AI7","AI8","AI9","AI10","AI11","AI12","AI13","AI14","AI15","AI16"],
                        "AO":["AO0","AO1","AO2","AO3","AO4","AO5","AO6","AO7","AO8","AO9","AO10","AO11","AO12","AO13","AO14","AO15","AO16"],
                    }
                    $scope.modbusSlaveIOAliasData = data;
                    $scope.slaveDIData = $scope.modbusSlaveIOAliasData["DI"];
                    $scope.slaveDOData = $scope.modbusSlaveIOAliasData["DO"];
                    $scope.slaveAIData = $scope.modbusSlaveIOAliasData["AI"];
                    $scope.slaveAOData = $scope.modbusSlaveIOAliasData["AO"];

                    $scope.slaveDIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveDIDataArr.push(tempItem);
                    });

                    $scope.slaveDOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveDODataArr.push(tempItem);
                    });

                    $scope.slaveAIData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveAIDataArr.push(tempItem);
                    });

                    $scope.slaveAOData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        slaveAODataArr.push(tempItem);
                    });
                }
                /* ./test */
            });
    }

    /** 获取点位表列表*/
    let pointTableModeListArr = [];
    function getPointTableModeList() {
        let getPointTableListCmd = {
            cmd: "get_point_table_list"
        };
        dataFactory.getData(getPointTableListCmd)
            .then((data) => {
                $scope.pointTableModeList = JSON.parse(JSON.stringify(data));
                if (!$.isEmptyObject($scope.pointTableModeList)) {
                    $scope.pointTableModeList.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        pointTableModeListArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    pointTableModeListArr.push(tempItem);
                }
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.pointTableModeList = ["point_table_1.db","point_table_2.db","point_table_3.db"];
                    $scope.pointTableModeList.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element;
                        tempItem[1] = element;
                        pointTableModeListArr.push(tempItem);
                    });
                }
                /* ./test */
            });
    }

    /* 获取示教点数据 */
    let pointsArr = [];
    let pointItem = [];
    function getPointsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                let pointNameArr = Object.keys(data);
                pointNameArr.forEach(function (item, i) {
                    // 图形化代码块下拉框点数据
                    pointItem = [];
                    pointItem[0] = item;
                    pointItem[1] = item;
                    pointsArr[i] = pointItem;
                });
                getPointsFlg = 1;
                if (document.getElementById("graphicalProgramming") != null) {
                    if (recordSavePoint == 1) return;
                    document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                }
            }, (status) => {
                /* test */
                if (g_testCode) {
                    pointsArr = [
                        ["point1", "point1"],
                        ["point2", "point2"],
                        ["point3", "point3"]
                    ];
                    getPointsFlg = 1;
                    if (document.getElementById("graphicalProgramming") != null) {
                        document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                    }
                }
                /* ./test */
                toastFactory.error(status, gpDynamicTags.error_messages[1]);
            });
    };
    
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
            DinData.forEach((item, index) => {
                switch (index) {
                    case 16:
                        if ($scope.endDIAliasData[0]) {
                            item['aliasName'] = `(${$scope.endDIAliasData[0]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 17:
                        if ($scope.endDIAliasData[1]) {
                            item['aliasName'] = `(${$scope.endDIAliasData[1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    default:
                        if ($scope.ctrlDIAliasData[index]) {
                            item['aliasName'] = `(${$scope.ctrlDIAliasData[index]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                }
            });
            DoData.forEach((item, index) => {
                switch (index) {
                    case 16:
                        if ($scope.endDOAliasData[0]) {
                            item['aliasName'] = `(${$scope.endDOAliasData[0]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    case 17:
                        if ($scope.endDOAliasData[1]) {
                            item['aliasName'] = `(${$scope.endDOAliasData[1]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                    default:
                        if ($scope.ctrlDOAliasData[index]) {
                            item['aliasName'] = `(${$scope.ctrlDOAliasData[index]})`;
                        } else {
                            item['aliasName'] = '';
                        }
                        break;
                }
            });
            AIport.forEach((item, index) => {
                switch (index) {
                    case 2:
                        item['aliasName'] = $scope.endAIAliasData[0] ? `(${$scope.endAIAliasData[0]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlAIAliasData[index] ? `(${$scope.ctrlAIAliasData[index]})` : '';
                        break;
                }
            });
            AOport.forEach((item, index) => {
                switch (index) {
                    case 2:
                        item['aliasName'] = $scope.endAOAliasData[0] ? `(${$scope.endAOAliasData[0]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlAOAliasData[index] ? `(${$scope.ctrlAOAliasData[index]})` : '';
                        break;
                }
            });
            //SetDO端口号
            DoData.forEach(element => {
                tempItem = [];
                tempItem[0] = element.name + element.aliasName;
                tempItem[1] = element.num;
                toolDoOptionsArr.push(tempItem);
                if (element.num <= 15) {
                    doOptionsArr.push(tempItem);
                }
            });
            //GetDI端口号
            DinData.forEach(element => {
                tempItem = [];
                tempItem[0] = element.name + element.aliasName;
                tempItem[1] = element.num;
                toolDiOptionsArr.push(tempItem);
                if (element.num <= 15) {
                    diOptionsArr.push(tempItem);
                }
            });
            //SetAO端口号
            AOport.forEach(element => {
                tempItem = [];
                tempItem[0] = element.name + element.aliasName;
                tempItem[1] = element.num;
                aoOptionsArr.push(tempItem);
            });
            //GetAI端口号
            AIport.forEach(element => {
                tempItem = [];
                tempItem[0] = element.name + element.aliasName;
                tempItem[1] = element.num;
                aiOptionsArr.push(tempItem);
            });
        }, (status) => {
            /* test */
            if (g_testCode) {
                //SetDO端口号
                DoData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    toolDoOptionsArr.push(tempItem);
                    if (element.num <= 15) {
                        doOptionsArr.push(tempItem);
                    }
                });
                //GetDI端口号
                DinData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    toolDiOptionsArr.push(tempItem);
                    if (element.num <= 15) {
                        diOptionsArr.push(tempItem);
                    }
                });
                //SetAO端口号
                AOport.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    aoOptionsArr.push(tempItem);
                });
                //GetAI端口号
                AIport.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    aiOptionsArr.push(tempItem);
                });
                DoData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    toolCoordOptionsArr.push(tempItem);
                    toolTrsfCoordeArr.push(tempItem);
                });
                DoData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    exToolCoordOptionsArr.push(tempItem);
                });
                DoData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name + element.aliasName;
                    tempItem[1] = element.num;
                    wobjToolCoordOptionsArr.push(tempItem);
                    wobjTrsCoordeDataArr.push(tempItem);
                });
            }
            /* ./test */
            toastFactory.error(status, gpDynamicTags.error_messages[5]);
        });
    };

    /**获取dofile子程序 */
    let array_new = [];
    function getUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '2'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.graUserData = data;
                let array = Object.keys(data);
                userData = [];
                if (array.length != 0) {
                    array.forEach(item => {
                        array_new = [];
                        array_new = [item, item];
                        userData.push(array_new);
                    }) 
                } else {
                    array_new = [];
                    array_new[0] = descriptionData[33].name;
                    array_new[1] = descriptionData[33].name;
                    userData.push(array_new);
                }
            }, (status) => {
                /* test */
                if (g_testCode) {
                    userData = [
                        ["test.lua", "test.lua"],
                        ["test2.lua", "test2.lua"],
                    ]
                }
                /* ./test */
                toastFactory.error(status, gpDynamicTags.error_messages[4]);
            });
    };

    /**获取工具坐标系数据 */
    function getToolTrsfCoordData() {
        toolCoordOptionsArr = [];
        toolTrsfCoordeArr = [];
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.toolCoordData = JSON.parse(JSON.stringify(data));
                $scope.toolCoordData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name;
                    tempItem[1] = element.name;
                    toolCoordOptionsArr.push(tempItem);
                });
                $scope.toolTrsfCoordeData = JSON.parse(JSON.stringify(data)).filter(item => item.type == 1);
                if (!$.isEmptyObject($scope.toolTrsfCoordeData)) {
                    $scope.toolTrsfCoordeData.forEach(element => {
                        tempItem = [];
                        tempItem[0] = element.name;
                        tempItem[1] = element.id;
                        toolTrsfCoordeArr.push(tempItem);
                    });
                } else {
                    tempItem = [];
                    tempItem[0] = gpDynamicTags.info_messages[4];
                    tempItem[1] = gpDynamicTags.info_messages[4];
                    toolTrsfCoordeArr.push(tempItem);
                }
                getExToolCoordData();
            }, (status) => {
                toastFactory.error(status, gpDynamicTags.error_messages[0]);
            });
    };

    /*获取外部工具坐标系数据 */
    function getExToolCoordData() {
        exToolCoordOptionsArr = [];
        exToolCoordTrsOptionsArr = [];
        $scope.exToolCoordeData = [];
        let getCmd = {
            cmd: "get_ex_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                const tempExToolCoordeData = JSON.parse(JSON.stringify(data));
                const exToolCoordeKeys = Object.keys(tempExToolCoordeData);
                exToolCoordeKeys.forEach(item => {
                    $scope.exToolCoordeData.push(tempExToolCoordeData[item]);
                });
                $scope.exToolCoordeData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name;
                    tempItem[1] = element.name;
                    exToolCoordOptionsArr.push(tempItem);
                })
                $scope.exToolCoordeData.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name;
                    tempItem[1] = element.id;
                    exToolCoordTrsOptionsArr.push(tempItem);
                })
            }, (status) => {
                toastFactory.error(status, gpDynamicTags.error_messages[9]);
            });
    };

    /* 获取工件坐标系数据*/
    function getWobjCoordData() {
        wobjToolCoordOptionsArr = [];
        wobjTrsCoordeDataArr = [];
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                const wobjCoordeArr = [];
                const wobjCoordeData = JSON.parse(JSON.stringify(data));
                const wobjCoordeKeys = Object.keys(wobjCoordeData);
                wobjCoordeKeys.forEach(item => {
                    wobjCoordeArr.push(wobjCoordeData[item]);
                });
                wobjCoordeArr.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name;
                    tempItem[1] = element.name;
                    wobjToolCoordOptionsArr.push(tempItem);
                });
                wobjCoordeArr.forEach(element => {
                    tempItem = [];
                    tempItem[0] = element.name;
                    tempItem[1] = element.id;
                    wobjTrsCoordeDataArr.push(tempItem);
                });
            }, (status) => {
                toastFactory.error(status, gpDynamicTags.error_messages[10]);
            });
    };

    /**
     * 检测ID是否重复
     * @param {array} resultArr 当前dofile内容
     * @returns 
     */
    function checkNewDofileID(resultArr){
        for (let m=0; m < $scope.finallyGraNewDofileArr.length; m++ ) {
            if ($scope.finallyGraNewDofileArr[m][2] == resultArr[2]) {
                if ($scope.finallyGraNewDofileArr[m][0] == resultArr[0] && resultArr[1] == 2) {

                } else if ($scope.finallyGraNewDofileArr[m][1] != resultArr[1]) {

                } else {
                    return resultArr[1];
                }
            }
        }
        return -1;
    }

    function createCommandsArray(commandsData) {
        let commandsArray = commandsData.split('\n');
        return commandsArray;
    };

    // 当前NewDofile是第几个
    var graphicalOrder;

    /**
     * 处理程序中第一层NewDofile语句
     * @param {array} programArr 第一层NewDofile命令内容
     */
    function handleDofileArr(programArr) {
        graphicalOrder = 0;
        g_graphicalErr = false;//每次先置为0，程序无误
        g_graphicalErrString = "";//每次先置为空，无报错信息
        $scope.finallyGraNewDofileArr = new Array();
        $scope.finallyGraNewDofileArr_index = 0;
        let mainProgramLength = programArr.length;
        for(let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult != -1 && handleresult != -2) {
                var NewDofileName = handleresult[0];
                let fileElement = $scope.graUserData[NewDofileName];
                var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                let tempLen = singleLine_NewDofile_Arr.length;
                if (tempLen === 0) {
                    graphicalOrder++;
                    g_graphicalErrString = gpDynamicTags.warning_messages[1] + graphicalOrder + gpDynamicTags.warning_messages[2] + gpDynamicTags.warning_messages[7];
                    g_graphicalErr = true;
                } else {
                    graphicalOrder++;
                    if (handleresult[1] != 1) {
                        g_graphicalErrString = gpDynamicTags.warning_messages[1] + graphicalOrder + gpDynamicTags.warning_messages[4];
                        g_graphicalErr = true;
                    } else {
                        var checkidreturn = checkNewDofileID(handleresult);
                        if (checkidreturn != -1 && $scope.finallyGraNewDofileArr_index != 0) {
                            g_graphicalErrString = gpDynamicTags.warning_messages[1] + graphicalOrder + + gpDynamicTags.warning_messages[2] + gpDynamicTags.warning_messages[6];
                            g_graphicalErr = true;
                        } else {
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index] = new Array();
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][0] = handleresult[0];
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][1] = handleresult[1];
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][2] = handleresult[2];
                            $scope.finallyGraNewDofileArr_index = $scope.finallyGraNewDofileArr_index + 1;
                            handleDofileArr_second(singleLine_NewDofile_Arr, fileElement, graphicalOrder);
                        }
                    }
                }
            }
        }
    }

    /**
     * 处理程序中第二层NewDofile语句
     * @param {array} programArr 第二层NewDofile命令内容
     * @param {Object} lastfilename 第二层NewDofile上一层的命令内容
     * @param {number} n 第二层NewDofile是第几个
     */
    function handleDofileArr_second(programArr, lastfilename, n){
        let mainProgramLength = programArr.length;
        for (let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult != -1 && handleresult != -2) {
                var NewDofileName = handleresult[0];
                if (lastfilename.name == NewDofileName) {
                    g_graphicalErrString = gpDynamicTags.warning_messages[1] + n + gpDynamicTags.warning_messages[8] + (m + 1) + gpDynamicTags.warning_messages[10];
                    g_graphicalErr = true;
                } else {
                    let fileElement = $scope.graUserData[NewDofileName];
                    var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                    let tempLen = singleLine_NewDofile_Arr.length;
                    if (tempLen === 0) {
                        g_graphicalErrString = gpDynamicTags.warning_messages[1] + n + gpDynamicTags.warning_messages[8] + (m + 1) + gpDynamicTags.warning_messages[3] + gpDynamicTags.warning_messages[7];
                        g_graphicalErr = true;
                    } else {
                        if (handleresult[1] != 2) {
                            g_graphicalErrString = gpDynamicTags.warning_messages[1] + n + gpDynamicTags.warning_messages[8] + (m + 1) + gpDynamicTags.warning_messages[5];
                            g_graphicalErr = true;
                        } else {
                            var checkidreturn = checkNewDofileID(handleresult);
                            if (checkidreturn != -1 && $scope.finallyGraNewDofileArr_index != 0) {
                                g_graphicalErrString = gpDynamicTags.warning_messages[1] + n + gpDynamicTags.warning_messages[8] + (m + 1) + gpDynamicTags.warning_messages[3] + gpDynamicTags.warning_messages[6];
                                g_graphicalErr = true;
                            } else {
                                $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index] = new Array();
                                $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][0] = handleresult[0];
                                $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][1] = handleresult[1];
                                $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][2] = handleresult[2];
                                $scope.finallyGraNewDofileArr_index = $scope.finallyGraNewDofileArr_index+1;
                                handleDofileArr_Third(singleLine_NewDofile_Arr,n,m+1)
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 处理程序中第三层NewDofile语句
     * @param {array} programArr 第三层NewDofile的命令内容
     * @param {number} j 第三层NewDofile上一层的命令行号
     * @param {number} k 第二层NewDofile命令内容的行号
     */
    function handleDofileArr_Third(programArr, j, k){
        let mainProgramLength = programArr.length;
        for (let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult != -1 && handleresult != -2) {
                g_graphicalErrString = gpDynamicTags.warning_messages[1] + j + gpDynamicTags.warning_messages[8] + k + gpDynamicTags.warning_messages[9];
                g_graphicalErr = true;
            }
        }
    }

    /**
     * 提取出单行命令NewDofile信息
     * @param {string} command 单行命令NewDofile信息
     * @returns 
     */
    function handleDofileCommand(command) {
        command = command.trim();
        var dofile_index;
        if (g_systemFlag == 1) {
            dofile_index = command.indexOf("NewDofile(\"/usr/local/etc/controller/lua/");
        } else {
            dofile_index = command.indexOf("NewDofile(\"/fruser/");
        }
        if (dofile_index !== -1) {
            var resultArr = [];
            command = command.trim();
            var notes_flag = command.search(/--/i);  
            if (notes_flag == -1) {
                //指令不含lua自带注释--
                tempString = command.trim();
                var lua_index = tempString.indexOf(".lua");
                if (lua_index !== -1) {
                    //分割提取文件名
                    var NewDofileName;
                    if (g_systemFlag == 1) {
                        NewDofileName = tempString.substring(dofile_index + 41, lua_index + 4).replace(/[\r\n]/g,"");//去掉回车换行
                    } else {
                        NewDofileName = tempString.substring(dofile_index + 19, lua_index + 4).replace(/[\r\n]/g,"");//去掉回车换行
                    }
                    //分割提取层数和行号
                    var length = tempString.length;
                    let dofileParaArr = tempString.substring(0, length-1).replace(/[\r\n]/g,"").split(",");
                    var NewDofileLayer = dofileParaArr[1];
                    var NewDofileRow = dofileParaArr[2];
                    resultArr[0] = NewDofileName;
                    resultArr[1] = NewDofileLayer;
                    resultArr[2] = NewDofileRow;
                    return resultArr;
                } else {
                    return -2;
                }
            } else {
                //指令包含lua自带注释--
                if (notes_flag  == 0) {
                    return -1;
                } else {
                    //如果--在指令后面面，需要处理
                    var luaindex = command.indexOf("--");
                    let tempString;
                    if(luaindex != -1){
                        tempString = command.substring(0,luaindex);
                    }
                    tempString = tempString.trim();
                    var lua_index = tempString.indexOf(".lua");
                    if (lua_index !== -1) {
                        //分割提取文件名
                        var NewDofileName = tempString.substring(dofile_index+19, lua_index+4).replace(/[\r\n]/g,"");//去掉回车换行
                        //分割提取层数和行号
                        var length = tempString.length;
                        let dofileParaArr = tempString.substring(0, length-1).replace(/[\r\n]/g,"").split(",");
                        var NewDofileLayer = dofileParaArr[1];
                        var NewDofileRow = dofileParaArr[2];
                        resultArr[0] = NewDofileName;
                        resultArr[1] = NewDofileLayer;
                        resultArr[2] = NewDofileRow;
                        return resultArr;
                    } else {
                        return -2;
                    }
                }
            }
        } else {
            return -1;
        }
    }

    /**
     * 判断命令行是否有NewDofile
     * @param {string} command 单行命令NewDofile信息
     * @returns 
     */
    function judegCommandDofile(command) {
        command = command.trim();
        var judgeResult;
        if (g_systemFlag == 1) {
            judgeResult = command.indexOf("NewDofile(\"/usr/local/etc/controller/lua/");
        } else {
            judgeResult = command.indexOf("NewDofile(\"/fruser/");
        }
        return judgeResult;
    }

    /* 获取TPD轨迹指令 */
    let tpdNameItem = [];
    let tpdNamesArr = [];
    function getTPDName() {
        let getTPDNameCmd = {
            cmd: "get_tpd_name",
        };
        dataFactory.getData(getTPDNameCmd)
            .then((data) => {
                let tpdTemp = data;
                if (tpdTemp.length != 0) {
                    tpdTemp.forEach((item, index, arr) => {
                        tpdNameItem = [];
                        tpdNameItem[0] = item;
                        tpdNameItem[1] = item;
                        tpdNamesArr.push(tpdNameItem);
                    });
                } else {
                    tpdNameItem = [];
                    tpdNameItem[0] = descriptionData[34].name;
                    tpdNameItem[1] = descriptionData[34].name;
                    tpdNamesArr.push(tpdNameItem);
                }
                getTPDFlg = 1;
                if (document.getElementById("graphicalProgramming") != null) {
                    document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                }
            }, (status) => {
                /* test */
                if (g_testCode) {
                    tpdNamesArr = [
                        ["track1", "track1"],
                        ["track2", "track2"],
                        ["track3", "track3"]
                    ];
                    getTPDFlg = 1;
                    if (document.getElementById("graphicalProgramming") != null) {
                        document.getElementById("graphicalProgramming").dispatchEvent(new CustomEvent('init-blockly', { bubbles: true, cancelable: true, composed: true }));
                    }
                }
                /* ./test */
                toastFactory.error(status, gpDynamicTags.error_messages[2]);
            });
    }

    /**离开当前页面时触发 */
    let navigateUrl;//跳转页面的路径
    $scope.$on('$routeChangeStart', function(event, current, previous) {
        monitorContent = Blockly.Lua.workspaceToCode(workspace);
        if (monitorContent != code && $scope.workspaceNameForGP != "" && $scope.workspaceNameForGP != undefined && $scope.workspaceNameForGP != null && recordIndex != 4) {
            event.preventDefault(); //拦截路由跳转
            $("#confirmChangeModal").modal();
            navigateUrl = '#' + current.originalPath; //跳转暂存的路径
            recordIndex = 4;
        } else {
            workspace.clear();
        }
    })

    /**监测全局示教程序，发生改变时触发 */
    $scope.$watch(() => {
        if (workspace) {
            monitorContent = Blockly.Lua.workspaceToCode(workspace);
        }
        if (monitorContent != code && $scope.workspaceNameForGP != "" && $scope.workspaceNameForGP != undefined && $scope.workspaceNameForGP != null) {
            g_programChangeFlag = 2; // 图形化编程发生改变
        } else {
            g_programChangeFlag = 3; // 未发生改变
        }
    })

    /**点击Blockly代码块工作区时触发 */
    $scope.clickBlockDiv = function() {
        if(("1" != $scope.controlMode) && $scope.debug_flag){
            $(".blocklyFlyout").css("display", "none"); //隐藏代码块列表
            $(".blocklyScrollbarHandle").css("width", "0"); //隐藏空白滚动横条
            toastFactory.warning(gpDynamicTags.warning_messages[11]);
        }
    }

    /**移入Blockly代码块工作区时触发 */
    $scope.mouseOverDisable = function() {
        if(("1" != $scope.controlMode) && $scope.debug_flag){
            $(".blocklyDraggable").css("pointer-events", "none"); //自动模式下，禁止操作页面指令
            document.getElementById('graphicalProgramming').oncontextmenu = function() {
                $(".blocklyWidgetDiv .blocklyMenu").css("pointer-events","none");
            }
        } else {
            $(".blocklyDraggable").css("pointer-events", "auto");
            document.getElementById('graphicalProgramming').oncontextmenu = function() {
                $(".blocklyWidgetDiv .blocklyMenu").css("pointer-events","auto");
            }
        }
    }

    let errorWarning;
    let errorWarning2;
    /* 初始化自定义代码块 */
    function initBlocks() {

        /* custom block: PTP */
        Blockly.Blocks['gotofunction'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[0].name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(linModeDataArr), "DROPVALUE")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 499, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSET")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Blocks['ptp'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[0].name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(linModeDataArr), "DROPVALUE")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 499, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSET")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ptp'] = function (block) {
            var dropdown_pointname = block.getFieldValue('POINTNAME');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            var drop_value = block.getFieldValue('DROPVALUE');
            var number_radius = block.getFieldValue('RADIUS');
            var dropdown_isoffset = block.getFieldValue('ISOFFSET');
            // TODO: Assemble Lua into code variable.
            var code = "";
            if (drop_value == 0) {
                code = 'PTP(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_isoffset + ')\n';
            } else {
                code = 'PTP(' + dropdown_pointname + ',' + number_debugspeed + ',' + drop_value + ',' + dropdown_isoffset + ')\n';
            }
            return code;
        };

        /* LIN */
        Blockly.Blocks['lin'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[1].name)
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(linModeDataArr), "ISCHOICE")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ISPOSITION")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSET")
                this.appendDummyInput()
                    .appendField(descriptionData[42].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "JointProtect")
                this.appendDummyInput()
                    .appendField(descriptionData[43].name)
                    .appendField(new Blockly.FieldDropdown(treatStrategyDataArr), "TreatStrategy")
                this.appendDummyInput()
                    .appendField(descriptionData[44].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 1), "AllowSpeedThreshold")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lin'] = function (block) {
            var dropdown_pointname = block.getFieldValue('POINTNAME');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            var is_choice = block.getFieldValue('ISCHOICE');
            var number_radius = block.getFieldValue('RADIUS');
            var dropdown_position = block.getFieldValue('ISPOSITION');
            var dropdown_isoffset = block.getFieldValue('ISOFFSET');
            var joint_protect = block.getFieldValue('JointProtect');
            var treat_strategy = block.getFieldValue('TreatStrategy');
            var allow_speed_threshold = block.getFieldValue('AllowSpeedThreshold');
            // TODO: Assemble Lua into code variable.
            var code = "";
            if (joint_protect == 0) {
                if (is_choice == -1) {
                    code = 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + is_choice + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n';
                } else {
                    code = 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n';
                }
            } else {
                if (is_choice == -1) {
                    if (treat_strategy == 3) {
                        code = 'JointOverSpeedProtectStart(3,' + allow_speed_threshold + ')\n' 
                             + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + is_choice + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                             + 'JointOverSpeedProtectEnd()\n'; 
                    } else {
                        code = 'JointOverSpeedProtectStart(' + treat_strategy + ',0)\n' 
                             + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + is_choice + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                             + 'JointOverSpeedProtectEnd()\n';
                    }

                } else {
                    if (treat_strategy == 3) {
                        code = 'JointOverSpeedProtectStart(3,' + allow_speed_threshold + ')\n' 
                             + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                             + 'JointOverSpeedProtectEnd()\n'; 
                    } else {
                        code = 'JointOverSpeedProtectStart(' + treat_strategy + ',0)\n' 
                             + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                             + 'JointOverSpeedProtectEnd()\n'; 
                    }         
                }
            }
            return code;
        };

        /* LIN-过渡点角度调节 */
        Blockly.Blocks['lintranspointangle'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[1].name + "(" + descriptionData[45].name + ")")
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(linModeDataArr), "ISCHOICE")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ISPOSITION")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSET")
                this.appendDummyInput()
                    .appendField(descriptionData[45].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ANGLESPEEDENABLE")
                this.appendDummyInput()
                    .appendField(descriptionData[46].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 1), "ANGLESPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lintranspointangle'] = function (block) {
            var dropdown_pointname = block.getFieldValue('POINTNAME');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            var is_choice = block.getFieldValue('ISCHOICE');
            var number_radius = block.getFieldValue('RADIUS');
            var dropdown_position = block.getFieldValue('ISPOSITION');
            var dropdown_isoffset = block.getFieldValue('ISOFFSET');
            var angle_speed_enable = block.getFieldValue('ANGLESPEEDENABLE');
            var angle_speed = block.getFieldValue('ANGLESPEED');
            // TODO: Assemble Lua into code variable.
            var code = "";
            if (angle_speed_enable == 0) {
                if (is_choice == -1) {
                    code = 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + is_choice + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n';
                } else {
                    code = 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n';
                }
            } else {
                if (is_choice == -1) {
                        code = 'AngularSpeedStart(' + angle_speed + ')\n' 
                                + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + is_choice + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                                + 'AngularSpeedEnd()\n';
                } else {
                        code = 'AngularSpeedStart(' + angle_speed + ')\n' 
                                + 'Lin(' + dropdown_pointname + ',' + number_debugspeed + ',' + number_radius + ',' + dropdown_position + ',' + dropdown_isoffset + ')\n'
                                + 'AngularSpeedEnd()\n'; 
                }
            }
            return code;
        };

        /* LIN-seamPos */
        Blockly.Blocks['linseampos'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[1].name + '(seamPos)')
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._smooth_stop)
                    .appendField(new Blockly.FieldDropdown(setTPDModeArr), "STOP")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._smooth_ptp)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'SMOOTH')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._weld_record)
                    .appendField(new Blockly.FieldDropdown(weldRecordDataArr), "CHOICE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._tech_plate_type)
                    .appendField(new Blockly.FieldDropdown(TplateTypeArr), "TYPE")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "OFFSET")
                this.appendDummyInput()
                    .appendField('dx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINX')
                    .appendField(',')
                    .appendField('dy')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINY')
                    .appendField(',')
                    .appendField('dz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINZ')
                this.appendDummyInput()
                    .appendField('drx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINRX')
                    .appendField(',')
                    .appendField('dry')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINRY')
                    .appendField(',')
                    .appendField('drz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'LINRZ')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['linseampos'] = function (block) {
            var point = block.getFieldValue('POINTNAME');
            var speed = block.getFieldValue('DEBUGSPEED');
            var stop = block.getFieldValue('STOP');
            var smooth = block.getFieldValue('SMOOTH');
            var choice = block.getFieldValue('CHOICE');
            var type = block.getFieldValue('TYPE');
            var offset = block.getFieldValue('OFFSET');
            var x = block.getFieldValue('LINX');
            var y = block.getFieldValue('LINY');
            var z = block.getFieldValue('LINZ');
            var rx = block.getFieldValue('LINRX');
            var ry = block.getFieldValue('LINRY');
            var rz = block.getFieldValue('LINRZ');
            // TODO: Assemble Lua into code variable.
            var code = "";
            if (offset == 0) {
                code = `Lin(${point},${speed},${stop == 'true' ? -1 : smooth},${choice},${type},${offset})\n`;
            } else {
                code = `Lin(${point},${speed},${stop == 'true' ? -1 : smooth},${choice},${type},${offset},${x},${y},${z},${rx},${ry},${rz})\n`;
            }
            return code;
        };

        /* ARC */
        Blockly.Blocks['arc'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[0].name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME1")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED1")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 499, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSET1")
                this.appendDummyInput()
                    .appendField(commandNameData[2].name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME2")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME3")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED2")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['arc'] = function (block) {
            var dropdown_pointname1 = block.getFieldValue('POINTNAME1');
            var dropdown_pointname2 = block.getFieldValue('POINTNAME2');
            var dropdown_pointname3 = block.getFieldValue('POINTNAME3');
            var number_debugspeed1 = block.getFieldValue('DEBUGSPEED1');
            var number_debugspeed2 = block.getFieldValue('DEBUGSPEED2');
            var number_radius = block.getFieldValue('RADIUS');
            var dropdown_isoffset1 = block.getFieldValue('ISOFFSET1');
            // TODO: Assemble Lua into code variable. 
            var code = 'PTP(' + dropdown_pointname1 + ',' + number_debugspeed1 + ',' + number_radius + ',' + dropdown_isoffset1 + ')\n' 
                     + 'ARC(' + dropdown_pointname2 + ',0,0,0,0,0,0,0,' + dropdown_pointname3 + ',0,0,0,0,0,0,0,' + number_debugspeed2 + ',-1' + ')\n';
            return code;
        };

        /* SPLINE：SPTP */
        Blockly.Blocks['sptp'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("SplineStart()");
                this.appendDummyInput()
                    .appendField("SPTP")
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                this.appendDummyInput()
                    .appendField("SplineEnd()");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['sptp'] = function (block) {
            var dropdown_pointname = block.getFieldValue('POINTNAME');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            // TODO: Assemble Lua into code variable.
            var code = 'SplineStart()\n'
                + 'SPTP(' + dropdown_pointname + ',' + number_debugspeed + ')\n'
                + 'SplineEnd()\n';
            return code;
        };

        /* SPLINE：SLIN */
        Blockly.Blocks['slin'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("SplineStart()");
                this.appendDummyInput()
                    .appendField("SLIN")
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                this.appendDummyInput()
                    .appendField("SplineEnd()");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['slin'] = function (block) {
            var dropdown_pointname = block.getFieldValue('POINTNAME');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            // TODO: Assemble Lua into code variable.
            var code = 'SplineStart()\n'
                + 'SLIN(' + dropdown_pointname + ',' + number_debugspeed + ')\n'
                + 'SplineEnd()\n';
            return code;
        };

        /* SPLINE：SCIRC */
        Blockly.Blocks['scric'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("SplineStart()");
                this.appendDummyInput()
                    .appendField("SCIRC")
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME1")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME2")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                this.appendDummyInput()
                    .appendField("SplineEnd()");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['scric'] = function (block) {
            var dropdown_pointname1 = block.getFieldValue('POINTNAME1');
            var dropdown_pointname2 = block.getFieldValue('POINTNAME2');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            // TODO: Assemble Lua into code variable.
            var code = 'SplineStart()\n'
                + 'SCIRC(' + dropdown_pointname1 + ',' + dropdown_pointname2 + ',' + number_debugspeed + ')\n'
                + 'SplineEnd()\n';
            return code;
        };

        /* CIRCLE */
        Blockly.Blocks['circle'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[0].name)
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAMEPTP")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED")
                    .appendField(",")
                    .appendField(new Blockly.FieldNumber(0, 0, 499, 1), "RADIUS")
                    .appendField(",")
                    .appendField(new Blockly.FieldDropdown(whetherSingleDataArr), "ISOFFSETPTP")
                this.appendDummyInput()
                    .appendField(commandNameData[3].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset_type)
                    .appendField(new Blockly.FieldDropdown(offsetTypeDataArr), "OFFSETTYPE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._circle1_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME1")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(offsetFlagDataArr), "ISOFFSET1")
                this.appendDummyInput()
                    .appendField('dx')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEX1')
                    .appendField(',')
                    .appendField('dy')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEY1')
                    .appendField(',')
                    .appendField('dz')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEZ1')
                this.appendDummyInput()
                    .appendField('drx')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERX1')
                    .appendField(',')
                    .appendField('dry')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERY1')
                    .appendField(',')
                    .appendField('drz')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERZ1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._circle2_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME2")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(offsetFlagDataArr), "ISOFFSET2")
                this.appendDummyInput()
                    .appendField('dx')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEX2')
                    .appendField(',')
                    .appendField('dy')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEY2')
                    .appendField(',')
                    .appendField('dz')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLEZ2')
                this.appendDummyInput()
                    .appendField('drx')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERX2')
                    .appendField(",")
                    .appendField('dry')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERY2')
                    .appendField(',')
                    .appendField('drz')
                    .appendField(new Blockly.FieldNumber(0, 0, 300, 0), 'CIRCLERZ2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED2")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['circle'] = function (block) {
            var pointptp = block.getFieldValue('POINTNAMEPTP');
            var speed = block.getFieldValue('DEBUGSPEED');
            var number_radius = block.getFieldValue('RADIUS');
            var offset0 = block.getFieldValue('ISOFFSETPTP');
            var type = block.getFieldValue('OFFSETTYPE');
            var name1 = block.getFieldValue('POINTNAME1');
            var offset1 = block.getFieldValue('ISOFFSET1');
            var x1 = block.getFieldValue('CIRCLEX1');
            var y1 = block.getFieldValue('CIRCLEY1');
            var z1 = block.getFieldValue('CIRCLEZ1');
            var rx1 = block.getFieldValue('CIRCLERX1');
            var ry1 = block.getFieldValue('CIRCLERY1');
            var rz1 = block.getFieldValue('CIRCLERZ1');
            var name2 = block.getFieldValue('POINTNAME2');
            var offset2 = block.getFieldValue('ISOFFSET2');
            var x2 = block.getFieldValue('CIRCLEX2');
            var y2 = block.getFieldValue('CIRCLEY2');
            var z2 = block.getFieldValue('CIRCLEZ2');
            var rx2 = block.getFieldValue('CIRCLERX2');
            var ry2 = block.getFieldValue('CIRCLERY2');
            var rz2 = block.getFieldValue('CIRCLERZ2');
            var speed2 = block.getFieldValue('DEBUGSPEED2');
            // TODO: Assemble Lua into code variable. 
            //相同偏移量 -- 设置一个偏移量
            if (type == 1) {
                if (offset2 == 0) {
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},${name2},${speed2},${offset2})\n`;
                } else {
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},${name2},${speed2},${offset2},${x2},${y2},${z2},${rx2},${ry2},${rz2})\n`
                }
            } else {
                //不同偏移量 -- 分别设置两个偏移量
                if (offset1 == 0 && offset2 == 0) {
                    //点1、点2都不偏移
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},${name2},${speed2},${offset2})\n`;
                } else if (offset1 != 0 && offset2 == 0) {
                    //只有点1偏移
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},${offset1},${x1},${y1},${z1},${rx1},${ry1},${rz1},${name2},0,${speed2})\n`;
                } else if (offset1 == 0 && offset2 != 0) {
                    //只有点2偏移
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},0,${name2},${offset2},${x2},${y2},${z2},${rx2},${ry2},${rz2},${speed2})\n`;
                } else {
                    // 点1、点2都偏移
                    var code = 'PTP(' + pointptp + ',' + speed + ',' + number_radius + ',' + offset0 + ')\n' 
                             + `Circle(${name1},${offset1},${x1},${y1},${z1},${rx1},${ry1},${rz1},${name2},${offset2},${x2},${y2},${z2},${rx2},${ry2},${rz2},${speed2})\n`
                }
            }
            return code;
        };

        /* 螺旋Spiral */
        Blockly.Blocks['spiral'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[11].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral1_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral2_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral3_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT3")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(offsetFlagDataArr), "WHETHEROFFSET")
                this.appendDummyInput()
                    .appendField('dx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALX')
                    .appendField(',')
                    .appendField('dy')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALY')
                    .appendField(',')
                    .appendField('dz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALZ')
                this.appendDummyInput()
                    .appendField('drx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALRX')
                    .appendField(",")
                    .appendField('dry')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALRY')
                    .appendField(',')
                    .appendField('drz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'SPIRALRZ')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_circle_num)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "CIRCLENUMBER")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._angle_correct_rx)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "ANGLERX")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._angle_correct_ry)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "ANGLERY")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._angle_correct_rz)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "ANGLERZ")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_radius_add)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "ADDVALUE")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._spiral_rotaxis_add)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "TRANSVALUE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['spiral'] = function (block) {
            var point1 = block.getFieldValue('POINT1');
            var point2 = block.getFieldValue('POINT2');
            var point3 = block.getFieldValue('POINT3');
            var speed = block.getFieldValue('SPEED');
            var whether = block.getFieldValue('WHETHEROFFSET');
            var x = block.getFieldValue('SPIRALX');
            var y = block.getFieldValue('SPIRALY');
            var z = block.getFieldValue('SPIRALZ');
            var rx = block.getFieldValue('SPIRALRX');
            var ry = block.getFieldValue('SPIRALRY');
            var rz = block.getFieldValue('SPIRALRZ');
            var number = block.getFieldValue('CIRCLENUMBER');
            var angle_rx = block.getFieldValue('ANGLERX');
            var angle_ry = block.getFieldValue('ANGLERY');
            var angle_rz = block.getFieldValue('ANGLERZ');
            var add_value = block.getFieldValue('ADDVALUE');
            var trans_value = block.getFieldValue('TRANSVALUE');
            // TODO: Assemble Lua into code variable. 
            if (whether == 0) {
                var code = `Spiral(${point1},${point2},${point3},${speed},${whether},0,0,0,0,0,0,${number},${angle_rx},${angle_ry},${angle_rz},${add_value},${trans_value})\n`
            } else {
                var code = `Spiral(${point1},${point2},${point3},${speed},${whether},${x},${y},${z},${rx},${ry},${rz},${number},${angle_rx},${angle_ry},${angle_rz},${add_value},${trans_value})\n`
            }
            return code;
        };

        /* 新螺旋N-Spiral */
        Blockly.Blocks['nspiral'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[12].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT1")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(nSpiralOffsetFlagDataArr), "WHETHEROFFSET")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._spiral_circle_num)
                    .appendField(new Blockly.FieldNumber(5, 0, 100, 1), "CIRCLENUMBER")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_dip_angle)
                    .appendField(new Blockly.FieldNumber(30, 0, 100, 1), "ROATEANGLE")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._spiral_oringin_radius)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 1), "INITIALRADIUS")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_radius_add)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 1), "ADDVALUE")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._spiral_rotaxis_add)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 1), "ROTATEVALUE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spiral_direction)
                    .appendField(new Blockly.FieldDropdown(spiralDirectionDataArr), "ROTATEDIRECTION")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['nspiral'] = function (block) {
            var point1 = block.getFieldValue('POINT1');
            var speed = block.getFieldValue('SPEED');
            var whether = block.getFieldValue('WHETHEROFFSET');
            var number = block.getFieldValue('CIRCLENUMBER');
            var angle = block.getFieldValue('ROATEANGLE');
            var radius = block.getFieldValue('INITIALRADIUS');
            var add_value = block.getFieldValue('ADDVALUE');
            var rotate_value = block.getFieldValue('ROTATEVALUE');
            var rotate_direction = block.getFieldValue('ROTATEDIRECTION');
            // TODO: Assemble Lua into code variable. 
            var code = `PTP(${point1},${speed},0,${whether},${radius},0,0,-${angle},0,0)\n`
                     + `NewSpiral(${point1},${speed},${whether},${radius},0,0,-${angle},0,0,${number},${angle},${radius},${add_value},${rotate_value},${rotate_direction})\n`
            return code;
        };

        /* 样条Spline开始 */
        Blockly.Blocks['splinestart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spline_start)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['splinestart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'SplineStart()\n' 
            return code;
        };

        /* 样条Spline结束 */
        Blockly.Blocks['splineend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spline_end)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['splineend'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'SplineEnd()\n' 
            return code;
        };

        /* 样条Spline-SPTP */
        Blockly.Blocks['splinesptp'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._spline_start + '(SPTP)')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._point_name + '(SPL)')
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['splinesptp'] = function (block) {
            var point = block.getFieldValue('POINT');
            var speed = block.getFieldValue('SPEED');
            // TODO: Assemble Lua into code variable. 
            var code = 'SPTP(' + point + ',' + speed + ')\n' 
            return code;
        };

        /* 新样条Spline开始 */
        Blockly.Blocks['newsplinestart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[148].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._control_mode)
                    .appendField(new Blockly.FieldDropdown(newSplineModeDataArr), "MODE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._global_average_connect_time)
                    .appendField(new Blockly.FieldNumber(2000, 0, 2000, 1), "SPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['newsplinestart'] = function (block) {
            var model = block.getFieldValue('MODE');
            var speed = block.getFieldValue('SPEED');
            // TODO: Assemble Lua into code variable. 
            var code = 'NewSplineStart(' + model + ',' + speed + ')\n' 
            return code;
        };

        /* 新样条Spline结束 */
        Blockly.Blocks['newsplineend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[149].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['newsplineend'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'NewSplineEnd(' + ')\n' 
            return code;
        };

        /* 新样条Spline-SPL */
        Blockly.Blocks['newsplinespl'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[148].name + '(SPL)')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINT")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._smooth_radius)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "SMOOTHRADIUS")
                    .appendField(",")
                    .appendField(graphInputTitles.motion._new_spline_last_flag)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WHETHER")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['newsplinespl'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var point = block.getFieldValue('POINT');
            var speed = block.getFieldValue('SPEED');
            var smooth_radius = block.getFieldValue('SMOOTHRADIUS');
            var whether = block.getFieldValue('WHETHER');
            var code = 'NewSP(' + point + ',' + speed + ',' + smooth_radius + ',' + whether + ')\n' 
            return code;
        };
        
        /* 摆动仿真开始 */
        Blockly.Blocks['weavestartsim'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[139].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._exaxis_list_id)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weavestartsim'] = function (block) {
            var id = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable. 
            var code = 'WeaveStartSim(' + id + ')\n' 
            return code;
        };
        
        /* 摆动仿真结束 */
        Blockly.Blocks['weaveendsim'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[140].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._exaxis_list_id)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weaveendsim'] = function (block) {
            var id = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable. 
            var code = 'WeaveEndSim(' + id + ')\n' 
            return code;
        };
        
        /* 开始轨迹预警 */
        Blockly.Blocks['weaveinspectstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._weavesine_start_warning)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._exaxis_list_id)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weaveinspectstart'] = function (block) {
            var id = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable. 
            var code = 'WeaveInspectStart(' + id + ')\n' 
            return code;
        };
        
        /* 停止轨迹预警 */
        Blockly.Blocks['weaveinspectend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._weavesine_end_warning)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._exaxis_list_id)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weaveinspectend'] = function (block) {
            var id = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable. 
            var code = 'WeaveInspectEnd(' + id + ')\n' 
            return code;
        };
        
        /* 偏移开启 */
        Blockly.Blocks['pointsoffsetenable'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset_open)
                this.appendDummyInput()
                    .appendField('∆x')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE1")
                    .appendField(',')
                    .appendField('∆y')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE2")
                    .appendField(',')
                    .appendField('∆z')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE3")
                this.appendDummyInput()
                    .appendField('∆rx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE4")
                    .appendField(',')
                    .appendField('∆ry')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE5")
                    .appendField(',')
                    .appendField('∆rz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 1), "VALUE6")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['pointsoffsetenable'] = function (block) {
            var value1 = block.getFieldValue('VALUE1');
            var value2 = block.getFieldValue('VALUE2');
            var value3 = block.getFieldValue('VALUE3');
            var value4 = block.getFieldValue('VALUE4');
            var value5 = block.getFieldValue('VALUE5');
            var value6 = block.getFieldValue('VALUE6');
            // TODO: Assemble Lua into code variable. 
            var code = 'PointsOffsetEnable(0,' + value1 + ',' + value2 + ',' + value3 + ',' + value4 + ',' + value5 + ',' + value6 + ')\n' 
            return code;
        };
        
        /* 偏移结束 */
        Blockly.Blocks['pointsoffsetdisable'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset_close)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['pointsoffsetdisable'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PointsOffsetDisable()\n' 
            return code;
        };
        
        /* 伺服 */
        Blockly.Blocks['servocart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[18].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._motion_mode)
                    .appendField(new Blockly.FieldDropdown(servoCModeDataArr), "WEAVEMODE")
                    .appendField(',')
                    .appendField('X')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE1")
                    .appendField(',')
                    .appendField('Y')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE2")
                    .appendField(',')
                    .appendField('Z')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE3")
                this.appendDummyInput()
                    .appendField('RX')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE4")
                    .appendField(',')
                    .appendField('RY')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE5")
                    .appendField(',')
                    .appendField('RZ')
                    .appendField(new Blockly.FieldNumber(0, -300, 300, 0.01), "VALUE6")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._scale_factor + 'x')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE7")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._scale_factor + 'y')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE8")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._scale_factor + 'z')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE9")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._scale_factor + 'rx')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE10")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._scale_factor + 'ry')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE11")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._scale_factor + 'rz')
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.01), "VALUE12")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._exaxis_list_acc)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "VALUE13")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._search_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "VALUE14")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._command_cycle)
                    .appendField(new Blockly.FieldNumber(0.001, 0.001, 0.016, 0.001), "VALUE15")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._lookahead_time)
                    .appendField(new Blockly.FieldNumber(1, 0, 1000, 0.01), "VALUE16")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._gain)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0.01), "VALUE17")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['servocart'] = function (block) {
            var weave_mode = block.getFieldValue('WEAVEMODE');
            var value1 = block.getFieldValue('VALUE1');
            var value2 = block.getFieldValue('VALUE2');
            var value3 = block.getFieldValue('VALUE3');
            var value4 = block.getFieldValue('VALUE4');
            var value5 = block.getFieldValue('VALUE5');
            var value6 = block.getFieldValue('VALUE6');
            var value7 = block.getFieldValue('VALUE7');
            var value8 = block.getFieldValue('VALUE8');
            var value9 = block.getFieldValue('VALUE9');
            var value10 = block.getFieldValue('VALUE10');
            var value11 = block.getFieldValue('VALUE11');
            var value12 = block.getFieldValue('VALUE12');
            var value13 = block.getFieldValue('VALUE13');
            var value14 = block.getFieldValue('VALUE14');
            var value15 = block.getFieldValue('VALUE15');
            var value16 = block.getFieldValue('VALUE16');
            var value17 = block.getFieldValue('VALUE17');
            // TODO: Assemble Lua into code variable. 
            var code = 'ServoCart('+ weave_mode + ',' + value1 + ',' + value2 + ',' + value3 + ',' + value4 + ',' + value5 + ',' + value6 + ',' + value7 + ',' + value8 + ',' + value9 + ',' + value10 + ',' + value11 + ',' + value12 + ',' + value13 + ',' + value14 + ',' + value15 + ',' + value16 + ',' + value17 + ')\n' 
            return code;
        };

        /* 轨迹运动 */
        Blockly.Blocks['trajectory'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[19].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._select_traj_file)
                    .appendField(new Blockly.FieldDropdown(trajFileNameArr), "TRAJECTORYFILE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['trajectory'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var file = block.getFieldValue('TRAJECTORYFILE');
            var speed = block.getFieldValue('SPEED');
            var trajPath = g_systemFlag ? `/usr/local/etc/controller/lua/traj/` : `/fruser/traj/`;
            var startPose = `startPose = GetTrajectoryStartPose(\"${trajPath}${file}\")`;
            var toolNum = `tool_num = GetActualTCPNum()`;
            var wobjNum = `wobj_num = GetActualWObjNum()`;
            var moveCart = `MoveCart(startPose,tool_num,wobj_num,100.0,100.0,${speed},-1.0,-1)`;
            var moveTrajectory = `MoveTrajectory(\"${trajPath}${file}\",${speed})`;
            var printTrajPointNum = `num = GetTrajectoryPointNum()\nRegisterVar(\"number\",\"num\")`;
            var code = `LoadTrajectory(\"${trajPath}${file}\")\n${startPose}\n${toolNum}\n${wobjNum}\n${moveCart}\n${moveTrajectory}\n${printTrajPointNum}\n`
            return code;
        };

        /* 轨迹运动J */
        Blockly.Blocks['trajectoryJ'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[20].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._select_traj_file)
                    .appendField(new Blockly.FieldDropdown(trajFileNameArr), "TRAJECTORYFILE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._traj_mode)
                    .appendField(new Blockly.FieldDropdown(trajectoryJModeArr), "TRAJECTORYMODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['trajectoryJ'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var file = block.getFieldValue('TRAJECTORYFILE');
            var speed = block.getFieldValue('SPEED');
            var mode = block.getFieldValue('TRAJECTORYMODE');
            var trajPath = g_systemFlag ? `/usr/local/etc/controller/lua/traj/` : `/fruser/traj/`;
            var startPose = `startPose = GetTrajectoryStartPose(\"${trajPath}${file}\")`;
            var toolNum = `tool_num = GetActualTCPNum()`;
            var wobjNum = `wobj_num = GetActualWObjNum()`;
            var moveCart = `MoveCart(startPose,tool_num,wobj_num,100.0,100.0,${speed},-1.0,-1)`;
            var moveTrajectory = `MoveTrajectoryJ()`;
            var printTrajPointNum = `num = GetTrajectoryPointNum()\nRegisterVar(\"number\",\"num\")`;
            var code = `LoadTrajectoryJ(\"${trajPath}${file}\",${speed},${mode})\n${startPose}\n${toolNum}\n${wobjNum}\n${moveCart}\n${moveTrajectory}\n${printTrajPointNum}\n`
            return code;
        };

        /* DMP指令 */
        Blockly.Blocks['dmp'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField('DMP')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "SPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['dmp'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var point = block.getFieldValue('POINTNAME');
            var speed = block.getFieldValue('SPEED');
            var code = 'DMP(' + point + ',' + speed + ')\n'
            return code;
        };

        /* 工具转换 */
        Blockly.Blocks['tooltrsfstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[144].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coordinate_system)
                    .appendField(new Blockly.FieldDropdown(toolTrsfCoordeArr), "EXISNAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['tooltrsfstart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var name = block.getFieldValue('EXISNAME');
            var code = 'ToolTrsfStart(' + name + ')\n'
            return code;
        };
        
        /* 工具转换结束 */
        Blockly.Blocks['tooltrsfend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[145].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['tooltrsfend'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'ToolTrsfEnd()\n'
            return code;
        };

        /* 工件转换开始 */
        Blockly.Blocks['wptrsfstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[146].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._wobjcoord_system)
                    .appendField(new Blockly.FieldDropdown(wobjTrsCoordeDataArr), "EXISNAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wptrsfstart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var name = block.getFieldValue('EXISNAME');
            var code = 'WorkPieceTrsfStart(' + name + ')\n'
            return code;
        };

        /* 工件转换结束 */
        Blockly.Blocks['wptrsfend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[147].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wptrsfend'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'WorkPieceTrsfEnd()\n'
            return code;
        };

        /* MOVETPD */
        Blockly.Blocks['movetpd'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[4].name)
                this.appendDummyInput()
                    .appendField(descriptionData[0].name)
                    .appendField(new Blockly.FieldDropdown(tpdNamesArr), "TRACKNAME")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[1].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TRACKSMOOTH")
                    .appendField(",")
                    .appendField(descriptionData[2].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 200, 1), "DEBUGSPEED")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movetpd'] = function (block) {
            var dropdown_trackname = block.getFieldValue('TRACKNAME');
            var dropdown_tracksmooth = block.getFieldValue('TRACKSMOOTH');
            var number_debugspeed = block.getFieldValue('DEBUGSPEED');
            // TODO: Assemble Lua into code variable.
            var code = 'MoveTPD(\"' + dropdown_trackname + '\",' + dropdown_tracksmooth + ',' + number_debugspeed + ')\n';
            return code;
        };

        /* HSpiral-水平螺旋运动开始 */
        Blockly.Blocks['HSpiralStart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[126].name)
                this.appendDummyInput()
                    .appendField(descriptionData[37].name)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0.001), "HSPIRALRADIUS")
                    .appendField('mm')
                    .appendField(",")
                    .appendField(descriptionData[38].name)
                    .appendField(new Blockly.FieldNumber(1, 0, 2, 0.001), "HSPIRALSPEED")
                    .appendField('rev/s')
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[39].name)
                    .appendField(new Blockly.FieldDropdown(hSprialDriectionArr), "HSPIRALDRIECTION")
                    .appendField(",")
                    .appendField(descriptionData[40].name)
                    .appendField(new Blockly.FieldNumber(20, 0, 40, 0.001), "HSPIRALANGLE")
                    .appendField('deg')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['HSpiralStart'] = function (block) {
            var hSpiralRadius = block.getFieldValue('HSPIRALRADIUS');
            var hSpiralSpeed = block.getFieldValue('HSPIRALSPEED');
            var hSpiralDriection = block.getFieldValue('HSPIRALDRIECTION');
            var hSpiralAngle = block.getFieldValue('HSPIRALANGLE');
            var code = 'HorizonSpiralMotionStart(' + hSpiralRadius + ',' + hSpiralSpeed + ',' + hSpiralDriection + ',' + hSpiralAngle + ')\n';
            return code;
        };

        /* HSpiral-水平螺旋运动结束 */
        Blockly.Blocks['HSpiralEnd'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[127].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6eb3f7");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['HSpiralEnd'] = function () {
            var code = 'HorizonSpiralMotionEnd()\n';
            return code;
        };

        /* WAITMS */
        Blockly.Blocks['waitms'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[5].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, Infinity, 1), "WAITTIME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['waitms'] = function (block) {
            var number_waittime = block.getFieldValue('WAITTIME');
            // TODO: Assemble Lua into code variable.
            var code = 'WaitMs(' + number_waittime + ')\n';
            return code;
        };

        /* GETDI */
        Blockly.Blocks['getdi'] = {
            init: function () {
                this.appendValueInput("GETDI")
                    .setCheck(null)
                    .appendField(commandNameData[15].name)
                    .appendField("(")
                    .appendField(new Blockly.FieldDropdown(diOptionsArr), "DINAME")
                    .appendField(") ==");
                this.appendDummyInput();
                this.setOutput(true, null);
                this.setColour(210);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['getdi'] = function (block) {
            var dropdown_diname = block.getFieldValue('DINAME');
            var value_getdi = Blockly.Lua.valueToCode(block, 'GETDI', Blockly.Lua.ORDER_ATOMIC);
            // TODO: Assemble Lua into code variable.
            var code = 'GetDI(' + dropdown_diname + ') == ' + value_getdi;
            // TODO: Change ORDER_NONE to the correct strength.
            return [code, Blockly.Lua.ORDER_NONE];
        };

        /* GETTOOLDI */
        Blockly.Blocks['gettooldi'] = {
            init: function () {
                this.appendValueInput("GETTOOLDI")
                    .setCheck(null)
                    .appendField(commandNameData[16].name)
                    .appendField("(")
                    .appendField(new Blockly.FieldDropdown(toolDiOptionsArr), "TOOLDINAME")
                    .appendField(") ==");
                this.appendDummyInput();
                this.setOutput(true, null);
                this.setColour(210);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['gettooldi'] = function (block) {
            var dropdown_tooldiname = block.getFieldValue('TOOLDINAME');
            var value_gettooldi = Blockly.Lua.valueToCode(block, 'GETTOOLDI', Blockly.Lua.ORDER_ATOMIC);
            // TODO: Assemble Lua into code variable.
            var code = 'GetToolDI(' + dropdown_tooldiname + ') == ' + value_gettooldi;
            // TODO: Change ORDER_NONE to the correct strength.
            return [code, Blockly.Lua.ORDER_NONE];
        };

        /* SETMODE */
        Blockly.Blocks['mode'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[6].name)
                    .appendField(new Blockly.FieldDropdown([["Manual", "1"]]), "MODENAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['mode'] = function (block) {
            var dropdown_modename = block.getFieldValue('MODENAME');
            // TODO: Assemble Lua into code variable.
            var code = 'Mode(' + dropdown_modename + ')\n';
            return code;
        };

        /* GOTOFUNCTION */
        Blockly.Blocks['gotofunction'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("::")
                    .appendField(new Blockly.FieldTextInput("default"), "GOTOLABEL")
                    .appendField(":: do");
                this.appendStatementInput("GOTO")
                    .setCheck(null);
                this.appendDummyInput()
                    .appendField("end");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(210);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['gotofunction'] = function (block) {
            var text_gotolabel = block.getFieldValue('GOTOLABEL');
            var statements_goto = Blockly.Lua.statementToCode(block, 'GOTO');
            // TODO: Assemble Lua into code variable.
            var code = '::' + text_gotolabel + '::do' + '\n' + statements_goto + 'end\n';
            return code;
        };

        /* GOTO */
        Blockly.Blocks['goto'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("goto")
                    .appendField(new Blockly.FieldTextInput("default"), "GOTOLABEL");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(210);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['goto'] = function (block) {
            var text_gotolabel = block.getFieldValue('GOTOLABEL');
            // TODO: Assemble Lua into code variable.
            var code = 'goto ' + text_gotolabel + '\n';
            return code;
        };

        /* PAUSE */
        Blockly.Blocks['pause'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[7].name)
                    .appendField(new Blockly.FieldDropdown(PauseOptionsArr), "PAUSEFUNCTION")
                this.setColour('#cd50d5');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['pause'] = function (block) {
            var pause_func = block.getFieldValue('PAUSEFUNCTION');
            var code = "";
            code = 'Pause(' + pause_func + ')\n';
            return code;
        };

        /* TOOLLIST */
        Blockly.Blocks['settoollist'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[8].name)
                    .appendField(new Blockly.FieldDropdown(toolCoordOptionsArr), "TOOLCOORDNAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['settoollist'] = function (block) {
            var dropdown_toolcoordname = block.getFieldValue('TOOLCOORDNAME');
            // TODO: Assemble Lua into code variable.
            var code = 'SetToolList(' + dropdown_toolcoordname + ')\n';
            return code;
        };

        /* EXTOOLLIST */
        Blockly.Blocks['setextoollist'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[9].name)
                    .appendField(new Blockly.FieldDropdown(exToolCoordOptionsArr), "EXTOOLCOORDNAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setextoollist'] = function (block) {
            var dropdown_extoolcoordname = block.getFieldValue('EXTOOLCOORDNAME');
            // TODO: Assemble Lua into code variable.
            var code = 'SetExToolList(' + dropdown_extoolcoordname + ')\n';
            return code;
        };

        /* WOBJTOOLLIST */
        Blockly.Blocks['setwobjtoollist'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[10].name)
                    .appendField(new Blockly.FieldDropdown(wobjToolCoordOptionsArr), "WOBJTOOLCOORDNAME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setwobjtoollist'] = function (block) {
            var dropdown_wobjtoolcoordname = block.getFieldValue('WOBJTOOLCOORDNAME');
            // TODO: Assemble Lua into code variable.
            var code = 'SetWObjList(' + dropdown_wobjtoolcoordname + ')\n';
            return code;
        };

        /* LASEROFF */
        Blockly.Blocks['laseroff'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[20].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['laseroff'] = function (block) {
            // TODO: Assemble Lua into code variable.
            var code = 'LTLaserOff()\n';
            return code;
        };

        /* LOADLASERDRIVER */
        Blockly.Blocks['loadlaserdriver'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[21].name)
                this.appendDummyInput()
                    .appendField(descriptionData[14].name)
                    .appendField(new Blockly.FieldDropdown(loadPosSensorDriverDataArr), "DRIVER")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['loadlaserdriver'] = function (block) {
            var dropdown_driver = block.getFieldValue('DRIVER');
            // TODO: Assemble Lua into code variable.
            var code = 'LoadPosSensorDriver(' + dropdown_driver + ')\n';
            return code;
        };

        /* UNLOADLASERDRIVER */
        Blockly.Blocks['unloadlaserdriver'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[22].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['unloadlaserdriver'] = function (block) {
            // TODO: Assemble Lua into code variable.
            var code = 'UnloadPosSensorDriver()\n';
            return code;
        };

        /* LASERTRACKON */
        Blockly.Blocks['lasertrackon'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[23].name)
                this.appendDummyInput()
                    .appendField(descriptionData[15].name)
                    .appendField(new Blockly.FieldDropdown(sensorCoordOptionsArr), "TRACKCOORD")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lasertrackon'] = function (block) {
            var dropdown_trackcoord = block.getFieldValue('TRACKCOORD');
            // TODO: Assemble Lua into code variable.
            var code = 'LTTrackOn(' + dropdown_trackcoord + ')\n';
            return code;
        };

        /* LASERTRACKOFF */
        Blockly.Blocks['lasertrackoff'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[24].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lasertrackoff'] = function (block) {
            // TODO: Assemble Lua into code variable.
            var code = 'LTTrackOff()\n';
            return code;
        };

        /* LASERRECORDPOINT(PTP-0,LIN-1) */
        Blockly.Blocks['laserrecordpoint'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[26].name)
                    .appendField(new Blockly.FieldDropdown([['PTP', '0'], ['LIN', '1']]), "LASERPOINTTYPE")
                this.appendDummyInput()
                    .appendField(descriptionData[15].name)
                    .appendField(new Blockly.FieldDropdown(sensorCoordOptionsArr), "TOOLCOORD")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[2].name)
                    .appendField(new Blockly.FieldNumber(30, 0, 100, 1), "LASERPOINTSPEED");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['laserrecordpoint'] = function (block) {
            var dropdown_type = block.getFieldValue('LASERPOINTTYPE');
            var dropdown_toolcoord = block.getFieldValue('TOOLCOORD');
            var number_laserpointspeed = block.getFieldValue('LASERPOINTSPEED');
            // TODO: Assemble Lua into code variable. ptp-0,lin-1
            var code = 'pos = {}\n' + 'pos = LaserRecordPoint(' + dropdown_toolcoord + ',' + dropdown_type + ',' + number_laserpointspeed + ')\n';
            return code;
        };

        /* LASERRECORDEND */
        Blockly.Blocks['laserrecordend'] = {
            init: function () {
                this.appendDummyInput()
                .appendField(commandNameData[27].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['laserrecordend'] = function () {
            var code = 'if type(pos) == \"table\" then\n' + 'laserPTP(#pos,pos)\n' + 'end\n';
            return code;
        };

        /* LASERTRACKRECURRENT */
        Blockly.Blocks['lasertrackrecurrent'] = {
            init: function () {
                this.appendDummyInput()
                .appendField(commandNameData[38].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lasertrackrecurrent'] = function () {
            var code = 'MoveLTR()\n';
            return code;
        };

        /* SEARCHSTART */
        Blockly.Blocks['searchstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[28].name)
                this.appendDummyInput()
                    .appendField(descriptionData[16].name)
                    .appendField(new Blockly.FieldDropdown([["+X", "0"], ["-X", "1"], ["+Y", "2"], ["-Y", "3"], ["+Z", "4"], ["-Z", "5"]]), "SEARCHDIST")
                    .appendField(",")
                    .appendField(descriptionData[17].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 1), "SEARCHSPEED")
                    .appendField(",")
                    .appendField(descriptionData[18].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "SEARCHLEN")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[19].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 1), "SEARCHTIME")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[15].name)
                    .appendField(new Blockly.FieldDropdown(sensorCoordOptionsArr), "SEARCHTOOLCOORD")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['searchstart'] = function (block) {
            var dropdown_searchdist = block.getFieldValue('SEARCHDIST');
            var number_searchspeed = block.getFieldValue('SEARCHSPEED');
            var number_searchlen = block.getFieldValue('SEARCHLEN');
            var number_searchtime = block.getFieldValue('SEARCHTIME');
            var dropdown_searchtoolcoord = block.getFieldValue('SEARCHTOOLCOORD');
            // TODO: Assemble Lua into code variable.
            var code = 'LTSearchStart(0,' + dropdown_searchdist + "," + number_searchspeed + "," + number_searchlen + "," + number_searchtime + "," + dropdown_searchtoolcoord + ')\n';
            return code;
        };

        /* SEARCHSTOP */
        Blockly.Blocks['searchstop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[29].name);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['searchstop'] = function (block) {
            // TODO: Assemble Lua into code variable.
            var code = 'LTSearchStop()\n';
            return code;
        };

        /* WEIDARCSTART */
        Blockly.Blocks['weldarcstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[30].name)
                this.appendDummyInput()
                    .appendField(descriptionData[41].name)
                    .appendField(new Blockly.FieldDropdown(functionIOTypeDataArr), "FUNCTIONIOTYPE")
                    .appendField(", ")
                this.appendDummyInput()
                    .appendField(descriptionData[20].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 7, 1), "WELDID")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[21].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, 10000, 1), "WELDWAITTIME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weldarcstart'] = function (block) {
            var number_weldid = block.getFieldValue('WELDID');
            var number_weldwaittime = block.getFieldValue('WELDWAITTIME');
            var io_type = block.getFieldValue('FUNCTIONIOTYPE');
            // TODO: Assemble Lua into code variable.
            var code = 'ARCStart(' + io_type + "," + number_weldid + "," + number_weldwaittime + ')\n';
            return code;
        };

        /* WEIDARCEND */
        Blockly.Blocks['weldarcend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[31].name)
                this.appendDummyInput()
                    .appendField(descriptionData[41].name)
                    .appendField(new Blockly.FieldDropdown(functionIOTypeDataArr), "FUNCTIONIOTYPE")
                    .appendField(", ")
                this.appendDummyInput()
                    .appendField(descriptionData[20].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 7, 1), "WELDID")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(commandNameData[21].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, 10000, 1), "WELDWAITTIME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weldarcend'] = function (block) {
            var number_weldid = block.getFieldValue('WELDID');
            var number_weldwaittime = block.getFieldValue('WELDWAITTIME');
            var io_type = block.getFieldValue('FUNCTIONIOTYPE');
            // TODO: Assemble Lua into code variable.
            var code = 'ARCEnd(' + io_type + "," + number_weldid + "," + number_weldwaittime + ')\n';
            return code;
        };

        /* WEAVESTART */
        Blockly.Blocks['weavestart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[32].name)
                this.appendDummyInput()
                    .appendField(descriptionData[20].name)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#6eb3f7');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weavestart'] = function (block) {
            var number_weaveid = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable.
            var code = 'WeaveStart(' + number_weaveid + ')\n';
            return code;
        };

        /* WEAVEEND */
        Blockly.Blocks['weaveend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[33].name)
                this.appendDummyInput()
                    .appendField(descriptionData[22].name)
                    .appendField(new Blockly.FieldDropdown([["0", "0"],["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "WEAVEID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#6eb3f7');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['weaveend'] = function (block) {
            var number_weaveid = block.getFieldValue('WEAVEID');
            // TODO: Assemble Lua into code variable.
            var code = 'WeaveEnd(' + number_weaveid + ')\n';
            return code;
        };

        /* SEGMENT */
        Blockly.Blocks['segment'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[34].name)
                this.appendDummyInput()
                    .appendField(langJsonData.commandlist.nodeEditorCommands.weld._segment_mode)
                    .appendField(new Blockly.FieldDropdown(segmentModeDataArr), "SEGMENTMODE")
                this.appendDummyInput()
                    .appendField(descriptionData[23].name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "SEGMENTSTARTPOINT")
                    .appendField(",")
                    .appendField(langJsonData.commandlist.nodeEditorCommands.weld._segment_end_point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "SEGMENTENDPOINT")
                    .appendField(",")
                    .appendField(descriptionData[2].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 1), "TOTALLEN")
                this.appendDummyInput()
                    .appendField(descriptionData[25].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "EFFECTIVELEN")
                    .appendField(",")
                    .appendField(descriptionData[26].name)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 1), "LOSELEN")
                this.appendDummyInput()
                    .appendField(descriptionData[27].name)
                    .appendField(new Blockly.FieldDropdown(functionModeDataArr), "FUNCTIONMODE")
                this.appendDummyInput()
                    .appendField(descriptionData[28].name)
                    .appendField(new Blockly.FieldDropdown(weaveModeDataArr), "WEAVEMODE")
                this.appendDummyInput() 
                    .appendField(descriptionData[29].name)
                    .appendField(new Blockly.FieldDropdown(roundingRuleDataArr), "ISROUNDING")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#ed5a3e');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['segment'] = function (block) {
            var dropdown_segmentmode = block.getFieldValue('SEGMENTMODE');
            var dropdown_segmentstartpoint = block.getFieldValue('SEGMENTSTARTPOINT');
            var dropdown_segmentendpoint = block.getFieldValue('SEGMENTENDPOINT');
            var number_totallen = block.getFieldValue('TOTALLEN');
            var number_effectivelen = block.getFieldValue('EFFECTIVELEN');
            var number_loselen = block.getFieldValue('LOSELEN');
            var dropdown_functionmode = block.getFieldValue('FUNCTIONMODE');
            var dropdown_weavemode = block.getFieldValue('WEAVEMODE');
            var dropdown_isrounding = block.getFieldValue('ISROUNDING');
            // TODO: Assemble Lua into code variable.
            var code = "";
            code += "seg_distance,seg_x,seg_y,seg_z = GetSegWeldDisDir(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ")"  + "\n";
            code += "if seg_distance ~= nil and seg_x ~= nil and seg_y ~= nil and seg_z ~= nil then" + "\n";
            code += "PTP(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0)" + "\n";
            code += "i = 0; j = 0; k = 0" + "\n";
            code += "m =" + number_effectivelen + "; n =" + number_loselen + "\n";

            if (dropdown_weavemode == 0) {
                if (dropdown_functionmode == 0) {
                    if (dropdown_isrounding == 0) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "k=k+1" + "\n";
                        code += "i=i+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "k=k+1" + "\n";
                        code += "j=j+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 1) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "k=k+1" + "\n";
                        code += "i=i+1" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 2) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "k=k+1" + "\n";
                        code += "i=i+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    }
                } else {
                    if (dropdown_isrounding == 0) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 1) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 2) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    }
                }
            } else {
                if (dropdown_functionmode == 0) {
                    if (dropdown_isrounding == 0) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 1) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 2) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "else" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "end" + "\n";
                        code += "end" + "\n";
                    }
                } else {
                    if (dropdown_isrounding == 0) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",seg_distance)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 1) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    } else if (dropdown_isrounding == 2) {
                        code += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                        code += "if((-1)^k == 1) then" + "\n";
                        code += "j=j+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "else" + "\n";
                        code += "i=i+1" + "\n";
                        code += "k=k+1" + "\n";
                        code += "if((i*m+j*n)>seg_distance) then" + "\n";
                        code += "break" + "\n";
                        code += "end" + "\n";
                        code += "ARCStart(0,0,10000)" + "\n";
                        code += "WeaveStart(0)" + "\n";
                        if (dropdown_segmentmode == 1) {
                            code += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + dropdown_segmentstartpoint + ","+  dropdown_segmentendpoint + ",i*m+j*n)" + "\n";
                            code += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + number_totallen + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                        } else {
                            code += "Lin(" + dropdown_segmentstartpoint + "," + number_totallen + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                        }
                        code += "WeaveEnd(0)" + "\n";
                        code += "ARCEnd(0,0,10000)" + "\n";
                        code += "end" + "\n";
                        code += "end" + "\n";
                    }
                }
            }
            code += "end" + "\n";
            return code;
        };

        /* DIO */
        Blockly.Blocks['set_do'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[14].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(toolDoOptionsArr), "POINTNAME4")
                    .appendField(",")
                    .appendField(descriptionData[6].name)
                    .appendField(new Blockly.FieldDropdown(whetherTruthDataArr), "DIOSTATE")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[11].name)
                    .appendField(new Blockly.FieldDropdown(blockDataArr), "DEBUGSPEED4")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[1].name)
                    .appendField(new Blockly.FieldDropdown(doModeOptionsArr), "RADIUS4")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ISOFFSET4")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['set_do'] = function (block) {
            var dropdown_pointname4 = block.getFieldValue('POINTNAME4');
            var number_debugspeed4 = block.getFieldValue('DEBUGSPEED4');
            var number_radius4 = block.getFieldValue('RADIUS4');
            var dropdown_isoffset4 = block.getFieldValue('ISOFFSET4');
            var dio_state = block.getFieldValue('DIOSTATE');
            var code = "";
            if (number_debugspeed4 == 0) {
                if (dropdown_pointname4 > 15) {
                    code = 'SetToolDO(' + (dropdown_pointname4 - 16) + ',' + dio_state + ',' + number_radius4+ ',' + dropdown_isoffset4 + ')\n';
                } else {
                    code = 'SetDO(' + dropdown_pointname4 + ',' + dio_state + ',' + number_radius4+ ',' + dropdown_isoffset4 + ')\n';
                }
            } else {
                if (dropdown_pointname4 > 15) {
                    code = 'SPLCSetToolDO(' + (dropdown_pointname4 - 16) + ',' + dio_state + ')\n';
                }else {
                    code = 'SPLCSetDO(' + dropdown_pointname4 + ',' + dio_state + ')\n';
                }
            }
            return code;
        };

        Blockly.Blocks['get_di'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[15].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(toolDiOptionsArr), "getdi_port")
                    .appendField(",")
                    .appendField(descriptionData[6].name)
                    .appendField(new Blockly.FieldDropdown(whetherTruthDataArr), "getdi_state")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[11].name)
                    .appendField(new Blockly.FieldDropdown(blockDataArr), "getdi_false")
                    .appendField(",")
                    .appendField(commandNameData[5].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 1), "getdi_waittime")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "getdi_isuse")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['get_di'] = function (block) {
            var getdi_port = block.getFieldValue('getdi_port');
            var getdi_state = block.getFieldValue('getdi_state');
            var getdi_false = block.getFieldValue('getdi_false');
            var getdi_waittime = block.getFieldValue('getdi_waittime');
            var getdi_isuse = block.getFieldValue('getdi_isuse');
            var code = "";
            if (getdi_false == 1) {
                if (getdi_port > 15) {
                    code = 'SPLCGetToolDI(' + (getdi_port - 15) + ',' + getdi_state + ',' + getdi_waittime + ')\n';
                }else {
                    code = 'SPLCGetDI(' + getdi_port + ',' + getdi_state + ',' + getdi_waittime + ')\n';
                }
            } else {
                if (getdi_port > 15) {
                    code = 'GetToolDI(' + (getdi_port - 15) + ',' + getdi_isuse + ')\n';
                }else {
                    code = 'GetDI(' + getdi_port + ',' + getdi_isuse + ')\n';
                }
            }
            return code;
        };

        /* AIO */
        Blockly.Blocks['set_ao'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[17].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(aoOptionsArr), "POINTNAME5")
                    .appendField(",")
                    .appendField(descriptionData[4].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED5")
                    .appendField("%")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[11].name)
                    .appendField(new Blockly.FieldDropdown(blockDataArr), "ISOFFSET5")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ISUSE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['set_ao'] = function (block) {
            var dropdown_pointname5 = block.getFieldValue('POINTNAME5');
            var number_debugspeed5 = block.getFieldValue('DEBUGSPEED5');
            var dropdown_isoffset5 = block.getFieldValue('ISOFFSET5');
            var is_use = block.getFieldValue('ISUSE');
            var code = "";
            if (dropdown_isoffset5 == 0) {
                if (dropdown_pointname5 > 1) {
                    code = 'SetToolAO(' + (dropdown_pointname5 - 2) + ',' + number_debugspeed5 + ',' + is_use + ')\n';
                } else {
                    code = 'SetAO(' + dropdown_pointname5 + ',' + number_debugspeed5 + ','+ is_use + ')\n';
                }
            } else {
                if (dropdown_pointname5 > 1) {
                    code = 'SPLCToolSetAO(' + (dropdown_pointname5 - 2) + ',' + number_debugspeed5 + ')\n';
                } else {
                    code = 'SPLCSetAO(' + dropdown_pointname5 + ',' + number_debugspeed5 + ')\n';
                }
            }
            return code;
        };

        Blockly.Blocks['get_ai'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[18].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(aiOptionsArr), "POINTNAME55")
                    .appendField(",")
                    .appendField(descriptionData[4].name)
                    .appendField(new Blockly.FieldDropdown(comparationDataArr), "AIVAL")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[5].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "DEBUGSPEED55")
                    .appendField("%")
                    .appendField(",")
                    .appendField(descriptionData[11].name)
                    .appendField(new Blockly.FieldDropdown(blockDataArr), "ISOFFSET55")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "ISUSE5")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['get_ai'] = function (block) {
            var dropdown_pointname55 = block.getFieldValue('POINTNAME55');
            var dropdown_isoffset55 = block.getFieldValue('ISOFFSET55');
            var is_use5 = block.getFieldValue('ISUSE5');
            var number_debugspeed55 = block.getFieldValue('DEBUGSPEED55');
            var ai_val = block.getFieldValue('AIVAL');
            var code = "";
            if (dropdown_isoffset55 == 1) {
                if (dropdown_pointname55 > 1) {
                    code = 'SPLCGetToolAI(' + (dropdown_pointname55 - 2) + ',' + ai_val + ',' + number_debugspeed55 + ',' + is_use5+ ')\n';
                } else {
                    code = 'SPLCGetAI(' + dropdown_pointname55 + ',' + number_debugspeed55 + ',' + ai_val + ',' + is_use5 + ')\n';
                }
            } else {
                if (dropdown_pointname55 > 1) {
                    code = 'GetToolAI(' + (dropdown_pointname55 - 2) + ',' + is_use5 + ')\n';
                } else {
                    code = 'GetAI(' + dropdown_pointname55 + ',' + is_use5 + ')\n';
                }
            }
            return code;
        };

        /* wait_AI指令 */
        Blockly.Blocks['wait_AI'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[11].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(aiOptionsArr), "WAITAIPORT")
                    .appendField(",")
                    .appendField(descriptionData[4].name)
                    .appendField(new Blockly.FieldDropdown(comparationDataArr), "WAITAIIF")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[5].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "WAITAIVALUE")
                    .appendField("%")
                    .appendField(",")
                    .appendField(descriptionData[7].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, 10000, 1), "WAITAIMAXTIME")
                    .appendField("ms")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[10].name)
                    .appendField(new Blockly.FieldDropdown(whetherMotionArr), "WAITAIOVERTIME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wait_AI'] = function (block) {
            var WAITAIPORT = block.getFieldValue('WAITAIPORT');
            var WAITAIIF = block.getFieldValue('WAITAIIF');
            var WAITAIVALUE = block.getFieldValue('WAITAIVALUE');
            var WAITAIMAXTIME = block.getFieldValue('WAITAIMAXTIME');
            var WAITAIOVERTIME = block.getFieldValue('WAITAIOVERTIME');
            var code = "";
            if (WAITAIPORT > 1) {
                if (WAITAIOVERTIME == 2) {
                    code = 'WaitToolAI(' + (WAITAIPORT - 2) + ',' + WAITAIIF + ',' + WAITAIVALUE+ ',' + '0' + ',' + WAITAIOVERTIME +')\n';
                } else {
                    code = 'WaitToolAI(' + (WAITAIPORT - 2) + ',' + WAITAIIF + ',' + WAITAIVALUE+ ',' + WAITAIMAXTIME + ',' + WAITAIOVERTIME +')\n';
                }
            } else {
                if (WAITAIOVERTIME == 2) {
                    code = 'WaitAI(' + WAITAIPORT + ',' + WAITAIIF + ',' + WAITAIVALUE+ ',' + '0' + ',' + WAITAIOVERTIME +')\n';
                } else {
                    code = 'WaitAI(' + WAITAIPORT + ',' + WAITAIIF + ',' + WAITAIVALUE+ ',' + WAITAIMAXTIME + ',' + WAITAIOVERTIME +')\n';
                }
            }
            return code;
        };

        /* wait_DI指令 */
        Blockly.Blocks['wait_DI'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[12].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(toolDiOptionsArr), "WAITDIPORT")
                    .appendField(",")
                    .appendField(descriptionData[6].name)
                    .appendField(new Blockly.FieldDropdown(whetherTruthDataArr), "WAITDIIF")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[7].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, 10000, 1), "WAITDIMAXTIME")
                    .appendField("ms")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[10].name)
                // this.appendDummyInput() 
                    .appendField(new Blockly.FieldDropdown(whetherMotionArr), "WAITDIOVERTIME")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wait_DI'] = function (block) {
            var waitdi_port = block.getFieldValue('WAITDIPORT');
            var waitdi_if = block.getFieldValue('WAITDIIF');
            var waitdi_maxtime = block.getFieldValue('WAITDIMAXTIME');
            var waitdi_overtime = block.getFieldValue('WAITDIOVERTIME');
            var code = "";
            if (waitdi_port > 15) {
                if (waitdi_overtime == 2) {
                    code = 'WaitToolDI(' + (waitdi_port - 15) + ',' + waitdi_if + ',' + '0' + ',' + waitdi_overtime +')\n';
                } else {
                    code = 'WaitToolDI(' + (waitdi_port - 15) + ',' + waitdi_if + ',' + waitdi_maxtime + ',' + waitdi_overtime +')\n';
                }
            } else {
                if (waitdi_overtime == 2) {
                    code = 'WaitDI(' + waitdi_port + ',' + waitdi_if + ',' + '0' + ',' + waitdi_overtime +')\n';
                } else {
                    code = 'WaitDI(' + waitdi_port + ',' + waitdi_if + ',' + waitdi_maxtime + ',' + waitdi_overtime +')\n';
                }
            }
            return code;
        };

        /* Wait_MultiDI指令 */
        Blockly.Blocks['Wait_MultiDI'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[13].name)
                this.appendDummyInput()
                    .appendField(descriptionData[8].name)
                    .appendField(new Blockly.FieldDropdown(connectionDataArr), "WAITMULTICHOICE")
                    .appendField(",")
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldTextInput("DI0,DI1"), 'WAITMULTIVALUE')
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[9].name)
                    .appendField(new Blockly.FieldTextInput("DI0,DI1"), 'WAITMULTITRUE')
                this.appendDummyInput()
                    .appendField(descriptionData[7].name)
                    .appendField(new Blockly.FieldNumber(1000, 0, 10000, 0), 'WAITMULTITIME')
                    .appendField("ms")
                    .appendField(",")
                this.appendDummyInput()
                    .appendField(descriptionData[10].name)
                    .appendField(new Blockly.FieldDropdown(whetherMotionArr), "WAITMULTIOPTION")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('#cd50d5');
                this.setTooltip(commandNameData[13].name);
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['Wait_MultiDI'] = function (block) {
            var waitmultidi_choice = block.getFieldValue('WAITMULTICHOICE');
            var waitmultidi_value = block.getFieldValue('WAITMULTIVALUE');
            var waitmultidi_true = block.getFieldValue('WAITMULTITRUE');
            var waitmultidi_time = block.getFieldValue('WAITMULTITIME');
            var waitmultidi_option = block.getFieldValue('WAITMULTIOPTION');
            var code = "";
            var multi_number = 0;
            if (waitmultidi_value) {
                var multi_value = waitmultidi_value.split(',');
    
                //计算位数
                multi_value.forEach(data => {
                    if (waitMultiDIOptionArr.filter(item => item[0] == data).length == 1) {
                        let multi_check = waitMultiDIOptionArr.filter(item => item[0] == data)[0][1];
                        multi_number += Math.pow(2, multi_check);
                        errorWarning = 0;
                    } else {
                        errorWarning = 1;
                    }
                })
            } else {
                multi_number = 0;
            }

            var multi_true = 0;
            if (waitmultidi_true) {
                var multi_arrau = waitmultidi_true.split(',');
    
                //计算位数
                multi_arrau.forEach(data => {
                    if (waitMultiDIOptionArr.filter(item => item[0] == data).length == 1) {
                        let multi_boolean = waitMultiDIOptionArr.filter(item => item[0] == data)[0][1];
                        multi_true += Math.pow(2, multi_boolean);
                        errorWarning2 = 0;
                    } else {
                        errorWarning2 = 1;
                    }
                })
            } else {
                multi_true = 0;
            }

            code = "WaitMultiDI" + "(" + waitmultidi_choice + "," + multi_number + "," + multi_true + "," + waitmultidi_time + "," + waitmultidi_option + ")" + "\n";
            return code;
        };
        
        /* 运动DO-连续输出 */
        Blockly.Blocks['movetooldostart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[137].name + commandNameData[130].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(toolDoOptionsArr), "PORT")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._set_Interval)
                    .appendField(new Blockly.FieldNumber(500, 0, 500, 0), 'INTERVAL')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._output_pulse_duty_cycle)
                    .appendField(new Blockly.FieldNumber(99, 0, 99, 0), 'OUTPUTVALUE')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movetooldostart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var port = block.getFieldValue('PORT');
            var interval = block.getFieldValue('INTERVAL');
            var output = block.getFieldValue('OUTPUTVALUE');
            var code = "";
            if(port > 15) {
                code = 'MoveToolDOStart(' + (port-15) + ',' + interval + ',' + output + ')\n'
            } else {
                code = 'MoveDOStart(' + port + ',' + interval + ',' + output + ')\n'
            }
            return code;
        };
        
        /* 运动DO-单次输出 */
        Blockly.Blocks['movetooldostartonce'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[137].name + commandNameData[131].name)
                this.appendDummyInput()
                    .appendField(descriptionData[3].name)
                    .appendField(new Blockly.FieldDropdown(toolDoOptionsArr), "PORT")
                this.appendDummyInput()
                    .appendField(commandNameData[132].name)
                    .appendField(new Blockly.FieldDropdown(outputMoveDOModeDataArr), "MODE")
                this.appendDummyInput()
                    .appendField(commandNameData[133].name)
                    .appendField(new Blockly.FieldNumber(500, 0, 500, 0), 'TIME1')
                    .appendField(',')
                    .appendField(commandNameData[134].name)
                    .appendField(new Blockly.FieldNumber(500, 0, 500, 0), 'TIME2')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movetooldostartonce'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var port = block.getFieldValue('PORT');
            var mode = block.getFieldValue('MODE');
            var time1 = block.getFieldValue('TIME1');
            var time2 = block.getFieldValue('TIME2');
            var code = "";
            if(mode == 0) {
                if(port > 15) {
                    code = 'MoveToolDOOnceStart(' + (port-16) + ',-1,-1)\n'
                } else {
                    code = 'MoveDOOnceStart(' + port + ',-1,-1)\n'
                }
            } else {
                if(port > 15) {
                    code = 'MoveToolDOOnceStart(' + (port-16) + ',' + time1 + ',' + time2 + ')\n'
                } else {
                    code = 'MoveDOOnceStart(' + port + ',' + time1 + ',' + time2 + ')\n'
                }
            }
            return code;
        };
        
        /* 运动DO结束 */
        Blockly.Blocks['movedostop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[141].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movedostop'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue('MODE');
            var code = "";
            if (mode == 1) {
                code = 'MoveDOStop()\n' 
            } else {
                code = 'MoveDOOnceStop()\n' 
            }
            return code;
        };

        /* 运动AO */
        Blockly.Blocks['moveaostart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[142].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._control_box_ao_number)
                    .appendField(new Blockly.FieldDropdown(aoOptionsArr), "PORT")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._max_tcp_speed)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0), 'SPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._max_tcp_speed_ao_percent)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0), 'PERCENT1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._period_compensation_ao_percent)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0), 'PERCENT2')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['moveaostart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var port = block.getFieldValue('PORT');
            var speed = block.getFieldValue('SPEED');
            var percent1 = block.getFieldValue('PERCENT1');
            var percent2 = block.getFieldValue('PERCENT2');
            var code = "";
            if(port > 1) {
                code = 'MoveToolAOStart(' + (port-2) + ',' + speed + ',' + percent1 + ',' + percent2 + ')\n'
            } else {
                code = 'MoveAOStart(' + port + ',' + speed + ',' + percent1 + ',' + percent2 + ')\n'
            }
            return code;
        };
                
        /* 运动DO结束 */
        Blockly.Blocks['moveaostop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[143].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['moveaostop'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'MoveAOStop()\n' 
            return code;
        };

        /* 碰撞等级-标准等级 */
        Blockly.Blocks['setanticollision'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[30].name + '-' + collideModeDataArr[0][0])
                this.appendDummyInput()
                    .appendField('Joint1')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), "JOINT1")
                    .appendField(',')
                    .appendField('Joint2')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), 'JOINT2')
                    .appendField(',')
                    .appendField('Joint3')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), 'JOINT3')
                this.appendDummyInput()
                    .appendField('Joint4')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), 'JOINT4')
                    .appendField(',')
                    .appendField('Joint5')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), 'JOINT5')
                    .appendField(',')
                    .appendField('Joint6')
                    .appendField(new Blockly.FieldDropdown(collisionLevelArr), 'JOINT6')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setanticollision'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var joint1 = block.getFieldValue('JOINT1');
            var joint2 = block.getFieldValue('JOINT2');
            var joint3 = block.getFieldValue('JOINT3');
            var joint4 = block.getFieldValue('JOINT4');
            var joint5 = block.getFieldValue('JOINT5');
            var joint6 = block.getFieldValue('JOINT6');
            var code = "";
            code = 'SetAnticollision(0,{' + joint1 + ',' + joint2 + ',' + joint3 + ',' + joint4 + ',' + joint5 + ',' + joint6 +'},0)\n' 
            return code;
        };

        /* 碰撞等级-自定义百分比 */
        Blockly.Blocks['setanticollisionauto'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[30].name + '-' + collideModeDataArr[1][0])
                this.appendDummyInput()
                    .appendField('Joint1')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT1')
                    .appendField(',')
                    .appendField('Joint2')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT2')
                    .appendField(',')
                    .appendField('Joint3')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT3')
                this.appendDummyInput()
                    .appendField('Joint4')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT4')
                    .appendField(',')
                    .appendField('Joint5')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT5')
                    .appendField(',')
                    .appendField('Joint6')
                    .appendField(new Blockly.FieldNumber(50, 1, 100, 0), 'JOINT6')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setanticollisionauto'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var joint1 = block.getFieldValue('JOINT1');
            var joint2 = block.getFieldValue('JOINT2');
            var joint3 = block.getFieldValue('JOINT3');
            var joint4 = block.getFieldValue('JOINT4');
            var joint5 = block.getFieldValue('JOINT5');
            var joint6 = block.getFieldValue('JOINT6');
            var code = "";
            code = 'SetAnticollision(1,{' + joint1/10 + ',' + joint2/10 + ',' + joint3/10 + ',' + joint4/10 + ',' + joint5/10 + ',' + joint6/10 +'},0)\n' 
            return code;
        };
        
        /* 加速度 */
        Blockly.Blocks['setoaccscale'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(paramCommandArray[31].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_acc_percentage)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'PERCENT')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#cd50d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setoaccscale'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var percent = block.getFieldValue('PERCENT');
            var code = 'SetOaccScale(' + percent + ')\n' 
            return code;
        };
        
        /* 夹爪运动 */
        Blockly.Blocks['movegripper'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[47].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._gripper_number)
                    .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "ID")
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._gripper_position)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'POSITION')
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._gripper_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._gripper_moment)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'TORQUE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._maxtime)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'MAXTIME')
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._whether_block)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WHETHERBLOCK")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movegripper'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue('ID');
            var position = block.getFieldValue('POSITION');
            var speed = block.getFieldValue('SPEED');
            var torque = block.getFieldValue('TORQUE');
            var maxtime = block.getFieldValue('MAXTIME');
            var whether = block.getFieldValue('WHETHERBLOCK');
            var code = 'MoveGripper(' + id + ',' + position + ',' + speed + ',' + torque + ',' + maxtime + ',' + whether + ')\n' 
            return code;
        };
        
        /* 夹爪复位 */
        Blockly.Blocks['actgripperreset'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[48].name)
                    .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "ID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['actgripperreset'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue('ID');
            var code = 'ActGripper(' + id + ',0)\n' 
            return code;
        };
        
        /* 夹爪激活 */
        Blockly.Blocks['actgripper'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[49].name)
                    .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "ID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['actgripper'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue('ID');
            var code = 'ActGripper(' + id + ',1)\n' 
            return code;
        };

        /* 开始喷涂 */
        Blockly.Blocks['spraystart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[50].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['spraystart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'SprayStart()\n' 
            return code;
        };

        /* 停止喷涂 */
        Blockly.Blocks['spraystop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[51].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['spraystop'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'SprayStop()\n' 
            return code;
        };

        /* 开始清枪 */
        Blockly.Blocks['powercleanstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[52].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['powercleanstart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PowerCleanStart()\n' 
            return code;
        };

        /* 停止清枪 */
        Blockly.Blocks['powercleanstop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[53].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['powercleanstop'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PowerCleanStop()\n' 
            return code;
        };

        /* 扩展轴UDP通信加载 */
        Blockly.Blocks['extdevloadudpdriver'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[67].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extdevloadudpdriver'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'ExtDevLoadUDPDriver()\n' 
            return code;
        };

        /* 扩展轴UDP通信配置 */
        Blockly.Blocks['extdevudpcomparam'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[68].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_modbus_communicate_ip)
                    .appendField(new Blockly.FieldTextInput("192.168.61.8080"), 'ADDRESS')
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_modbus_communicate_port)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'PORT')
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._externa_modbus_communicate_period)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'PERIOD')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extdevudpcomparam'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var address = block.getFieldValue("ADDRESS");
            var port = block.getFieldValue("PORT");
            var period = block.getFieldValue("PERIOD");
            var code = 'ExtDevSetUDPComParam(\"' + address + '\",' + port + ',' + period + ')\n' 
            return code;
        };

        /* 扩展轴异步运动 */
        Blockly.Blocks['extaxisptp'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[69].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extaxisptp'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var point = block.getFieldValue("POINTNAME");
            var speed = block.getFieldValue("SPEED");
            var code = 'EXT_AXIS_PTP(0,' + point + ',' + speed + ')\n' 
            return code;
        };

        /* 扩展轴同步PTP/LIN运动 */
        Blockly.Blocks['extaxismove'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[70].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._motion_chose)
                    .appendField(new Blockly.FieldDropdown([["PTP", "0"], ["LIN", "1"]]), "MOVECHOICE")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extaxismove'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue("MOVECHOICE");
            var point = block.getFieldValue("POINTNAME");
            var speed = block.getFieldValue("SPEED");
            var code = "";
            if (mode == 0) {
                code = 'EXT_AXIS_PTP(1,' + point + ',' + speed + ')\n' 
                     + 'PTP(' + point + ',' + speed + ',0,0)\n' 
            } else {
                code = 'EXT_AXIS_PTP(1,' + point + ',' + speed + ')\n' 
                     + 'Lin(' + point + ',' + speed + ',0,0,0)\n' 
            }
            return code;
        };

        /* 扩展轴同步ARC运动 */
        Blockly.Blocks['extaxisarc'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[71].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._arc1_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME1")
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._arc_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extaxisarc'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var point1 = block.getFieldValue("POINTNAME1");
            var point2 = block.getFieldValue("POINTNAME2");
            var speed = block.getFieldValue("SPEED");
            var code = 'EXT_AXIS_PTP(1,' + point2 + ',' + speed + ')\n' 
                     + 'ARC(' + point1 + ',0,0,0,0,0,0,0,' + point2 + ',0,0,0,0,0,0,0,' + speed + ',0)\n' 
            return code;
        };

        /* 扩展轴回零指令 */
        Blockly.Blocks['extaxissethoming'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[72].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_id)
                    .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "4"], ["3", "8"]]), "ID")
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_zero_mode)
                    .appendField(new Blockly.FieldDropdown(zeroModeDataArr), "HOMING")
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_search_speed)
                    .appendField(new Blockly.FieldNumber(5, 0, 2000, 0), 'SPEED1')
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._externa_axis_latch_speed)
                    .appendField(new Blockly.FieldNumber(2, 0, 2000, 0), 'SPEED2')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extaxissethoming'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var homing = block.getFieldValue("HOMING");
            var speed1 = block.getFieldValue("SPEED1");
            var speed2 = block.getFieldValue("SPEED2");
            var code = 'ExtAxisSetHoming(' + id + ',' + homing + ',' + speed1 + ',' + speed2 + ')\n' 
            return code;
        };

        /* 扩展轴使能指令 */
        Blockly.Blocks['extaxisservoon'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[73].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_id)
                    .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "4"], ["3", "8"]]), "ID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['extaxisservoon'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var code = 'ExtAxisServoOn(' + id + ',1)\n' 
            return code;
        };

        /* 扩展轴伺服ID */
        Blockly.Blocks['auxservostatusid'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[74].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservostatusid'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var code = 'AuxServoSetStatusID(' + id + ')\n' 
            return code;
        };

        /* 扩展轴控制模式 */
        Blockly.Blocks['auxservocontrol'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[75].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                    .appendField(graphInputTitles.pherial._control_mode)
                    .appendField(new Blockly.FieldDropdown(auxServoCommandModeArr), "CONTROLMODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservocontrol'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var control_mode = block.getFieldValue("CONTROLMODE");
            var code = 'AuxServoEnable(' + id + ',0)\n' 
                     + 'AuxServoSetControlMode(' + id + ',' + control_mode + ')\n' 
                     + 'AuxServoEnable(' + id + ',1)\n'; 
            return code;
        };

        /* 扩展轴伺服使能 */
        Blockly.Blocks['auxservoenable'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[76].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                    .appendField(graphInputTitles.pherial._externa_servo_on)
                    .appendField(new Blockly.FieldDropdown(servoEnableDataArr), "SERVOENABLE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservoenable'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var enable = block.getFieldValue("SERVOENABLE");
            var code = 'AuxServoEnable(' + id + ',' + enable + ')\n'; 
            return code;
        };

        /* 扩展轴伺服回零 */
        Blockly.Blocks['auxservohoming'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[77].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_zero_mode)
                    .appendField(new Blockly.FieldDropdown(servoZeroModeDataArr), "HOMINGMODE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._externa_axis_search_speed)
                    .appendField(new Blockly.FieldNumber(0, 0, 2000, 0), 'SPEED1')
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._externa_axis_latch_speed)
                    .appendField(new Blockly.FieldNumber(0, 0, 2000, 0), 'SPEED2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_acc_percentage)
                    .appendField(new Blockly.FieldNumber(100, 1, 100, 0), 'ACC')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservohoming'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var mode = block.getFieldValue("HOMINGMODE");
            var speed1 = block.getFieldValue("SPEED1");
            var speed2 = block.getFieldValue("SPEED2");
            var acc = block.getFieldValue("ACC");
            var code = 'AuxServoHoming(' + id + ',' + mode + ',' + speed1 + ',' + speed2 + ',' + acc + ')\n'; 
            return code;
        };

        /* 扩展轴位置模式 */
        Blockly.Blocks['auxservotargetpos'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[78].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._target_pos)
                    .appendField(new Blockly.FieldNumber(100, -10000, 10000, 0), 'POSITION')
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._running_speed)
                    .appendField(new Blockly.FieldNumber(100, -10000, 10000, 0), 'SPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_acc_percentage)
                    .appendField(new Blockly.FieldNumber(100, 1, 100, 0), 'ACC')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservotargetpos'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var position = block.getFieldValue("POSITION");
            var speed = block.getFieldValue("SPEED");
            var acc = block.getFieldValue("ACC");
            var code = 'AuxServoSetTargetPos(' + id + ',' + position + ',' + speed + ',' + acc + ')\n'; 
            return code;
        };

        /* 扩展轴速度模式 */
        Blockly.Blocks['auxservotargetspeed'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[79].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._servo_id)
                    .appendField(new Blockly.FieldDropdown(servoIdDataArr), "ID")
                    .appendField(',')
                    .appendField(graphInputTitles.pherial._target_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._debug_acc_percentage)
                    .appendField(new Blockly.FieldNumber(100, 1, 100, 0), 'ACC')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['auxservotargetspeed'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var id = block.getFieldValue("ID");
            var speed = block.getFieldValue("SPEED");
            var acc = block.getFieldValue("ACC");
            var code = 'AuxServoSetTargetSpeed(' + id + ',' + speed + ',' + acc + ')\n'; 
            return code;
        };

        /* 传送带io实时检测 */
        Blockly.Blocks['conveyoriodetect'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[54].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._weld_time)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'MAXWAITTIME')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['conveyoriodetect'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var time = block.getFieldValue("MAXWAITTIME");
            var code = 'ConveyorIODetect(' + time + ')\n'; 
            return code;
        };

        /* 传送带位置实时检测 */
        Blockly.Blocks['conveyorgettrack'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[55].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._work_mode)
                    .appendField(new Blockly.FieldDropdown(conTrackModeDataArr), "MODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['conveyorgettrack'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue("MODE");
            var code = 'ConveyorGetTrackData(' + mode + ')\n'; 
            return code;
        };

        /* 传送带跟踪开启 */
        Blockly.Blocks['conveyortrackstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[56].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._work_mode)
                    .appendField(new Blockly.FieldDropdown(conTrackModeDataArr), "MODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['conveyortrackstart'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue("MODE");
            var code = 'ConveyorTrackStart(' + mode + ')\n'; 
            return code;
        };

        /* 传送带跟踪关闭 */
        Blockly.Blocks['conveyortrackend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[57].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['conveyortrackend'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'ConveyorTrackEnd()\n'; 
            return code;
        };

        /* 打磨通讯驱动卸载 */
        Blockly.Blocks['polishingunloadcomdriver'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[58].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingunloadcomdriver'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PolishingUnloadComDriver()\n'; 
            return code;
        };

        /* 打磨通讯驱动加载 */
        Blockly.Blocks['polishingloadcomdriver'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[59].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingloadcomdriver'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PolishingLoadComDriver()\n'; 
            return code;
        };

        /* 打磨设备使能 */
        Blockly.Blocks['polishingdeviceenable'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[60].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._device_enable)
                    .appendField(new Blockly.FieldDropdown(enableDataArr), "ENABLEMODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingdeviceenable'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue("ENABLEMODE");
            var code = 'PolishingDeviceEnable(' + mode + ')\n'; 
            return code;
        };

        /* 打磨设备错误清除 */
        Blockly.Blocks['polishingclearerror'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[61].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingclearerror'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PolishingClearError()\n'; 
            return code;
        };

        /* 打磨设备力传感器清零 */
        Blockly.Blocks['polishingtorquesensorreset'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[62].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtorquesensorreset'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var code = 'PolishingTorqueSensorReset()\n'; 
            return code;
        };

        /* 打磨转速 */
        Blockly.Blocks['polishingtargetVel'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[63].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._rotate_speed)
                    .appendField(new Blockly.FieldNumber(5500, 0, 5500, 0), 'SPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtargetVel'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var speed = block.getFieldValue("SPEED");
            var code = 'PolishingSetTargetVelocity(' + speed + ')\n'; 
            return code;
        };

        /* 打磨接触力 */
        Blockly.Blocks['polishingtargettorque'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[64].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._set_force)
                    .appendField(new Blockly.FieldNumber(200, 0, 200, 0), 'FORCE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtargettorque'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var force = block.getFieldValue("FORCE");
            var code = 'PolishingSetTargetTorque(' + force + ')\n'; 
            return code;
        };

        /* 打磨伸出距离 */
        Blockly.Blocks['polishingtargetposition'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[65].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._protrusion_distance)
                    .appendField(new Blockly.FieldNumber(0, 0, 12, 0), 'LENGTH')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtargetposition'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var length = block.getFieldValue("LENGTH");
            var code = 'PolishingSetTargetPosition(' + length + ')\n'; 
            return code;
        };

        /* 打磨接触力 */
        Blockly.Blocks['polishingtouchforce'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[151].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._set_force)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 0), 'FORCE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtouchforce'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var force = block.getFieldValue("FORCE");
            var code = 'PolishingSetTargetTouchForce(' + force + ')\n'; 
            return code;
        };

        /* 打磨设定过渡时间 */
        Blockly.Blocks['polishingtouchtorquetime'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[152].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._set_force_trans_time)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 0), 'TIME')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtouchtorquetime'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var time = block.getFieldValue("TIME");
            var code = 'PolishingSetTargetTouchTime(' + time + ')\n'; 
            return code;
        };

        /* 打磨工件重量 */
        Blockly.Blocks['polishingworkpieceweight'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[153].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._workpice_weight)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 0), 'WEIGHT')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingworkpieceweight'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var weight = block.getFieldValue("WEIGHT");
            var code = 'PolishingSetWorkPieceWeight(' + weight + ')\n'; 
            return code;
        };

        /* 打磨控制模式 */
        Blockly.Blocks['polishingtargetcontrolmode'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[66].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.pherial._control_mode)
                    .appendField(new Blockly.FieldDropdown(polishCommandModeArr), "CONTROLMODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#e5804a");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['polishingtargetcontrolmode'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var mode = block.getFieldValue("CONTROLMODE");
            var code = 'PolishingSetOperationMode(' + mode + ')\n'; 
            return code;
        };

        /* 焊机电压 */
        Blockly.Blocks['setweldingvoltage'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[84].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'VOLTAGE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setweldingvoltage'] = function (block) {
            // TODO: Assemble Lua into code variable. 
            var voltage = block.getFieldValue("VOLTAGE");
            var code = 'SetWeldingVoltage(' + voltage + ')\n'; 
            return code;
        };

        /* 焊机电流 */
        Blockly.Blocks['setweldingcurrent'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[85].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'CURRENT')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setweldingcurrent'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var current = block.getFieldValue("CURRENT");
            var code = 'SetWeldingCurrent(' + current + ')\n'; 
            return code;
        };

        /* 关气 */
        Blockly.Blocks['setaspirated'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[88].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setaspirated'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetAspirated(' + type + ',0)\n'; 
            return code;
        };

        /* 送气 */
        Blockly.Blocks['setaspiratedout'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[89].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setaspiratedout'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetAspirated(' + type + ',1)\n'; 
            return code;
        };

        /* 正向送丝 */
        Blockly.Blocks['setforwardWirefeed'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[91].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setforwardWirefeed'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetForwardWireFeed(' + type + ',1)\n'; 
            return code;
        };

        /* 停止正向送丝 */
        Blockly.Blocks['setforwardWirefeedstop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[90].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setforwardWirefeedstop'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetForwardWireFeed(' + type + ',0)\n'; 
            return code;
        };

        /* 反向送丝 */
        Blockly.Blocks['setreversewirefeed'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[93].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setreversewirefeed'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetReverseWireFeed(' + type + ',1)\n'; 
            return code;
        };

        /* 停止反向送丝 */
        Blockly.Blocks['setreversewirefeedstop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[92].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._io_type)
                    .appendField(new Blockly.FieldDropdown(IOTypeDictArr), "IOTYPE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['setreversewirefeedstop'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("IOTYPE");
            var code = 'SetReverseWireFeed(' + type + ',0)\n'; 
            return code;
        };

        /* 打开传感器-焊缝类型 */
        Blockly.Blocks['ltlaseron1'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[128].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_type)
                    .appendField(new Blockly.FieldNumber(49, 0, 49, 0), 'LASERTYPE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ltlaseron1'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("LASERTYPE");
            var code = 'LTLaserOn(' + type + ')\n'; 
            return code;
        };

        /* 打开传感器-任务号 */
        Blockly.Blocks['ltlaseron2'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[129].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_task)
                    .appendField(new Blockly.FieldNumber(255, 0, 255, 0), 'LASERTYPE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ltlaseron2'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("LASERTYPE");
            var code = 'LTLaserOn(' + type + ')\n'; 
            return code;
        };

        /* 打开传感器-任务号 */
        Blockly.Blocks['ltlaseron3'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[136].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_solution)
                    .appendField(new Blockly.FieldNumber(5, 0, 5, 0), 'LASERTYPE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ltlaseron3'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var type = block.getFieldValue("LASERTYPE");
            var code = 'LTLaserOn(' + type + ')\n'; 
            return code;
        };

        /* 焊缝数据记录 */
        Blockly.Blocks['lasersensorrecord'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[25].name)
                this.appendDummyInput()
                    .appendField(commandNameData[27].name)
                    .appendField(new Blockly.FieldDropdown(functionTypeDataArr), "FUNCTIONCHOICE")
                this.appendDummyInput()
                    .appendField(commandNameData[5].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'WAITTIME')
                    .appendField(',')
                    .appendField(descriptionData[17].name)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 1), 'SPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['lasersensorrecord'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func = block.getFieldValue("FUNCTIONCHOICE");
            var time = block.getFieldValue("WAITTIME");
            var speed = block.getFieldValue("SPEED");
            var code = 'LaserSensorRecord(' + func + ',' + time + ',' + speed +')\n'; 
            return code;
        };

        /* 运动至焊缝起点 */
        Blockly.Blocks['movetolaserrecordstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[107].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._motion_mode)
                    .appendField(new Blockly.FieldDropdown([['PTP', '0'], ['LIN', '1']]), "FUNCTIONCHOICE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._search_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movetolaserrecordstart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func = block.getFieldValue("FUNCTIONCHOICE");
            var speed = block.getFieldValue("SPEED");
            var code = 'MoveToLaserRecordStart(' + func + ',' + speed +')\n'; 
            return code;
        };

        /* 运动至焊缝终点 */
        Blockly.Blocks['movetolaserrecordend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[106].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._motion_mode)
                    .appendField(new Blockly.FieldDropdown([['PTP', '0'], ['LIN', '1']]), "FUNCTIONCHOICE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._search_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['movetolaserrecordend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func = block.getFieldValue("FUNCTIONCHOICE");
            var speed = block.getFieldValue("SPEED");
            var code = 'MoveToLaserRecordEnd(' + func + ',' + speed +')\n'; 
            return code;
        };

        /* 开始姿态调整 */
        Blockly.Blocks['postureadjuston'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[111].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._tech_plate_type)
                    .appendField(new Blockly.FieldDropdown(techPlateTypeArr), "FUNCTIONCHOICE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._tech_motion_direction)
                    .appendField(new Blockly.FieldDropdown(techMotionDirectionArr), "MOTIONOPERATION")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._tech_adjust_time)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'ADJUSTTIME')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._first_length)
                    .appendField(new Blockly.FieldNumber(100, 0, 1000, 0), 'LENGTH1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._inflection_point_type)
                    .appendField(new Blockly.FieldDropdown(infPointTypeArr), "TYPE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._second_length)
                    .appendField(new Blockly.FieldNumber(100, 0, 1000, 0), 'LENGTH2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._third_length)
                    .appendField(new Blockly.FieldNumber(100, 0, 1000, 0), 'LENGTH3')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._fourth_length)
                    .appendField(new Blockly.FieldNumber(100, 0, 1000, 0), 'LENGTH4')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._fifth_length)
                    .appendField(new Blockly.FieldNumber(100, 0, 1000, 0), 'LENGTH5')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['postureadjuston'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func = block.getFieldValue("FUNCTIONCHOICE");
            var motion_operation = block.getFieldValue("MOTIONOPERATION");
            var adjust_time = block.getFieldValue("ADJUSTTIME");
            var length1 = block.getFieldValue("LENGTH1");
            var type = block.getFieldValue("TYPE");
            var length2 = block.getFieldValue("LENGTH2");
            var length3 = block.getFieldValue("LENGTH3");
            var length4 = block.getFieldValue("LENGTH4");
            var length5 = block.getFieldValue("LENGTH5");
            var code = ""; 
            if (motion_operation == 0) {
                code = `PostureAdjustOn(${func},PosA,PosB,PosC,${adjust_time},${length1},`
                     + `${type},${length2},${length3},${length4},${length5})\n`;
            } else {
                code = `PostureAdjustOn(${func},PosA,PosC,PosB,${adjust_time},${length1},`
                     + `${type},${length2},${length3},${length4},${length5})\n`;
            }
            return code;
        };

        /* 关闭姿态调整 */
        Blockly.Blocks['postureadjustoff'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[110].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._tech_plate_type)
                    .appendField(new Blockly.FieldDropdown(techPlateTypeArr), "FUNCTIONCHOICE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['postureadjustoff'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func = block.getFieldValue("FUNCTIONCHOICE");
            var code = 'PostureAdjustOff(' + func + ')\n'; 
            return code;
        };

        /* 焊丝寻位开始 */
        Blockly.Blocks['wiresearchstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[112].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_reference_pos)
                    .appendField(new Blockly.FieldDropdown(wireRefPosDataArr), "SEARCHPOSITION")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_speed)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHSPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_distance)
                    .appendField(new Blockly.FieldNumber(10, 0, 1000, 0), 'SEARCHLENGTH')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_back_flag)
                    .appendField(new Blockly.FieldDropdown(wireSearchBackFlagDataArr), "SEARCHFLAG")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_back_speed)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHRETURNSPEED')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_back_distance)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHRETURNLENGTH')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_mode)
                    .appendField(new Blockly.FieldDropdown(wireSearchModeDataArr), "SEARCHMODE")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchstart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var position = block.getFieldValue("SEARCHPOSITION");
            var search_speed = block.getFieldValue("SEARCHSPEED");
            var search_length = block.getFieldValue("SEARCHLENGTH");
            var flag = block.getFieldValue("SEARCHFLAG");
            var return_speed = block.getFieldValue("SEARCHRETURNSPEED");
            var return_length = block.getFieldValue("SEARCHRETURNLENGTH");
            var mode = block.getFieldValue("SEARCHMODE");
            var code = 'WireSearchStart(' + position + ',' + search_speed + ',' + search_length + ',' + flag + ',' + return_speed + ',' + return_length + ',' + mode + ')\n'; 
            return code;
        };

        /* 焊丝寻位结束 */
        Blockly.Blocks['wiresearchend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[113].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_reference_pos)
                    .appendField(new Blockly.FieldDropdown(wireRefPosDataArr), "SEARCHPOSITION")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_speed)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHSPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_distance)
                    .appendField(new Blockly.FieldNumber(10, 0, 1000, 0), 'SEARCHLENGTH')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_back_flag)
                    .appendField(new Blockly.FieldDropdown(wireSearchBackFlagDataArr), "SEARCHFLAG")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_back_speed)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHRETURNSPEED')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_back_distance)
                    .appendField(new Blockly.FieldNumber(10, 0, 100, 0), 'SEARCHRETURNLENGTH')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_mode)
                    .appendField(new Blockly.FieldDropdown(wireSearchModeDataArr), "SEARCHMODE")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var position = block.getFieldValue("SEARCHPOSITION");
            var search_speed = block.getFieldValue("SEARCHSPEED");
            var search_length = block.getFieldValue("SEARCHLENGTH");
            var flag = block.getFieldValue("SEARCHFLAG");
            var return_speed = block.getFieldValue("SEARCHRETURNSPEED");
            var return_length = block.getFieldValue("SEARCHRETURNLENGTH");
            var mode = block.getFieldValue("SEARCHMODE");
            var code = 'WireSearchEnd(' + position + ',' + search_speed + ',' + search_length + ',' + flag + ',' + return_speed + ',' + return_length + ',' + mode + ')\n'; 
            return code;
        };

        /* 寻位点设置指南 a~f点 */
        Blockly.Blocks['wiresearchwait'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[138].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._point_name)
                    .appendField(new Blockly.FieldDropdown(pointsArr), "POINTNAME")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._debug_speed)
                    .appendField(new Blockly.FieldNumber(100, 0, 100, 0), 'SPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._smooth_stop)
                    .appendField(new Blockly.FieldDropdown(setTPDModeArr), "STOP")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._smooth_ptp)
                    .appendField(new Blockly.FieldNumber(100, 0, 10000, 0), 'SMOOTH')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._search_flag)
                    .appendField(new Blockly.FieldDropdown(setTPDModeArr), "SEARCHFLAG")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._wire_search_point_name)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "SEARCHVAR")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._weld_record)
                    .appendField(new Blockly.FieldDropdown(weldRecordDataArr), "CHOICE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._tech_plate_type)
                    .appendField(new Blockly.FieldDropdown(TplateTypeArr), "TYPE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._offset)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "OFFSET")
                    .appendField(',')
                    .appendField('dx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHX')
                this.appendDummyInput()
                    .appendField('dy')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHY')
                    .appendField(',')
                    .appendField('dz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHZ')
                    .appendField(',')
                    .appendField('drx')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHRX')
                this.appendDummyInput()
                    .appendField('dry')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHRY')
                    .appendField(',')
                    .appendField('drz')
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'WIRESEARCHRZ')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchwait'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("POINTNAME");
            var speed = block.getFieldValue("SPEED");
            var stop = block.getFieldValue("STOP");
            var smooth = block.getFieldValue("SMOOTH");
            var flag = block.getFieldValue("SEARCHFLAG");
            var vary = block.getFieldValue("SEARCHVAR");
            var choice = block.getFieldValue("CHOICE");
            var type = block.getFieldValue("TYPE");
            var offset = block.getFieldValue("OFFSET");
            var x = block.getFieldValue("WIRESEARCHX");
            var y = block.getFieldValue("WIRESEARCHY");
            var z = block.getFieldValue("WIRESEARCHZ");
            var rx = block.getFieldValue("WIRESEARCHRX");
            var ry = block.getFieldValue("WIRESEARCHRY");
            var rz = block.getFieldValue("WIRESEARCHRZ");
            var code = "";
            console.log(offset,flag,stop,'offset,flag,stop');
            if (name == "seamPos") {
                if (offset == 0) {
                    code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},${choice},${type},${offset})\n`;
                } else {
                    code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},${choice},${type},${offset},${x},${y},${z},${rx},${ry},${rz})\n`;
                }
            } else {
                if (flag == "false") {
                    if (offset == 0) {
                        code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},0,${offset})\n`;
                    } else {
                        code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},0,${offset},${x},${y},${z},${rx},${ry},${rz})\n`;
                    }
                } else {
                    if (offset == 0) {
                        code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},1,${offset})\n`
                             + `WireSearchWait(\"${vary}\")\n`;
                    } else {
                        code = `Lin(${name},${speed},${stop == 'true' ? -1 : smooth},1,${offset},${x},${y},${z},${rx},${ry},${rz})\n`
                             + `WireSearchWait(\"${vary}\")\n`;
                    }
                }
            }
            return code;
        };

        /* 计算偏移量(角焊缝) */
        Blockly.Blocks['wiresearchoffset'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[120].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_method)
                    .appendField(new Blockly.FieldDropdown(wireSearchType1MethodDataArr), "COMPUTEMODE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_ref_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT2")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point3)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT3")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH1")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_res_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point3)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH3")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchoffset'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("COMPUTEMODE");
            var point1 = block.getFieldValue("POINT1");
            var point2 = block.getFieldValue("POINT2");
            var point3 = block.getFieldValue("POINT3");
            var touch1 = block.getFieldValue("TOUCH1");
            var touch2 = block.getFieldValue("TOUCH2");
            var touch3 = block.getFieldValue("TOUCH3");
            var code = "";
            switch (mode) {
                case "0":
                    code = `GetWireSearchOffset(0,${mode},\"${point1}\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${touch1}\",\"#\",\"#\",\"#\",\"#\",\"#\")\n`;
                    break;
                case "1":
                    code = `GetWireSearchOffset(0,${mode},\"${point1}\",\"${point2}\",\"#\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"#\",\"#\",\"#\",\"#\")\n`;
                    break;
                case "2":
                    code = `GetWireSearchOffset(0,${mode},\"${point1}\",\"${point2}\",\"${point3}\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"${touch3}\",\"#\",\"#\",\"#\")\n`;
                    break;
                case "3":
                    code = `GetWireSearchOffset(0,${mode},\"${point1}\",\"${point2}\",\"${point3}\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"${touch3}\",\"#\",\"#\",\"#\")\n`;
                    break;
                default:
                    break;
            }
            return code;
        };

        /* 计算偏移量(内外径) */
        Blockly.Blocks['wiresearchoffsetin'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[121].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_method)
                    .appendField(new Blockly.FieldDropdown(wireSearchType2MethodDataArr), "COMPUTEMODE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_ref_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT2")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT3")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH1")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_res_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point3)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH3")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchoffsetin'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("COMPUTEMODE");
            var point1 = block.getFieldValue("POINT1");
            var point2 = block.getFieldValue("POINT2");
            var point3 = block.getFieldValue("POINT3");
            var touch1 = block.getFieldValue("TOUCH1");
            var touch2 = block.getFieldValue("TOUCH2");
            var touch3 = block.getFieldValue("TOUCH3");
            var code = `GetWireSearchOffset(1,${mode},\"${point1}\",\"${point2}\",\"${point3}\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"${touch3}\",\"#\",\"#\",\"#\")\n`;
            return code;
        };

        /* 计算偏移量(点) */
        Blockly.Blocks['wiresearchoffsetpoint'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[122].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_method)
                    .appendField(new Blockly.FieldDropdown([['3D(xyz)','6']]), "COMPUTEMODE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_res_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH2")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchoffsetpoint'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("COMPUTEMODE");
            var touch1 = block.getFieldValue("TOUCH1");
            var touch2 = block.getFieldValue("TOUCH2");
            var code =  `GetWireSearchOffset(2,${mode},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"#\",\"#\",\"#\",\"#\")\n`;
            return code;
        };

        /* 计算偏移量(相机) */
        Blockly.Blocks['wiresearchoffsetcamera'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[123].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_method)
                    .appendField(new Blockly.FieldDropdown([['3D+(xyzrxryrz)','7']]), "COMPUTEMODE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_res_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH2")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchoffsetcamera'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("COMPUTEMODE");
            var touch1 = block.getFieldValue("TOUCH1");
            var touch2 = block.getFieldValue("TOUCH2");
            var code = `GetWireSearchOffset(3,${mode},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${touch1}\",\"${touch2}\",\"#\",\"#\",\"#\",\"#\")\n`;
            return code;
        };
        
        /* 计算偏移量(面) */
        Blockly.Blocks['wiresearchoffsetsurface'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[124].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_method)
                    .appendField(new Blockly.FieldDropdown([['3D+(xyzrxryrz)','8']]), "COMPUTEMODE")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_ref_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT2")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_ref_point3)
                    .appendField(new Blockly.FieldDropdown(wireSearchRefPointDataArr), "POINT3")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point1)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH1")
                    .appendField(',')
                    .appendField(graphInputTitles.weld._wire_search_res_point2)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point3)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCH3")
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['wiresearchoffsetsurface'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("COMPUTEMODE");
            var point1 = block.getFieldValue("POINT1");
            var point2 = block.getFieldValue("POINT2");
            var point3 = block.getFieldValue("POINT3");
            var touch1 = block.getFieldValue("TOUCH1");
            var touch2 = block.getFieldValue("TOUCH2");
            var touch3 = block.getFieldValue("TOUCH3");
            var code = `GetWireSearchOffset(4,${mode},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${point1}\",\"${point2}\",\"${point3}\",\"${touch1}\",\"${touch2}\",\"${touch3}\")\n`;
            return code;
        };
        
        /* 接触点数据写入 */
        Blockly.Blocks['pointtodatabase'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[125].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point_write_name)
                    .appendField(new Blockly.FieldDropdown(wireSearchResPointDataArr), "TOUCHNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._wire_search_res_point_write_data)
                    .appendField(new Blockly.FieldTextInput("{0,0,0,0,0,0}"), 'TOUCHDATA')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['pointtodatabase'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("TOUCHNAME");
            var data = block.getFieldValue("TOUCHDATA");
            var code = 'SetPointToDatabase(' + name + ',' + data +')\n';
            return code;
        };
        
        /* 电弧跟踪开启 */
        Blockly.Blocks['arcweldtracecontrol'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[109].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._arc_track_lag_time)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 0), 'DELAYTIME')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_isleftright)
                    .appendField(new Blockly.FieldDropdown(traceIsleftrightDataArr), "COMPEMSATE1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_klr)
                    .appendField(new Blockly.FieldNumber(0.06, -1, 1, 0.001), 'ADJUSTCOEFFICIENT1')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_tstartlr)
                    .appendField(new Blockly.FieldNumber(5, 0, 300, 0), 'STARTCOMPEMSATE1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_stepmaxlr)
                    .appendField(new Blockly.FieldNumber(5, 0, 300, 0), 'MAXCOMPEMSATE1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_summaxlr)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'TOTALCOMPEMSATE1')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_isuplow)
                    .appendField(new Blockly.FieldDropdown(traceIsleftrightDataArr), "COMPEMSATE2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_kud)
                    .appendField(new Blockly.FieldNumber(0.06, -1, 1, 0.001), 'ADJUSTCOEFFICIENT2')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_tstartud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'STARTCOMPEMSATE2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_stepmaxud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'MAXCOMPEMSATE2')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_summaxud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'TOTALCOMPEMSATE2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_axisselect)
                    .appendField(new Blockly.FieldDropdown(weldTraceAxisselectDataArr), "AXISCHOICE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_reference_type)
                    .appendField(new Blockly.FieldDropdown(weldTraceReferenceTypeDataArr), "MODE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._up_down_reference_current_start)
                    .appendField(new Blockly.FieldNumber(4, 0, 10000, 0), 'STARTCOUNT')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._up_down_reference_current)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'CURRENTCOUNT')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_reference_current)
                    .appendField(new Blockly.FieldNumber(10, 0, 300, 0), 'CURRENT')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['arcweldtracecontrol'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var delay_time = block.getFieldValue("DELAYTIME");
            var compensate1 = block.getFieldValue("COMPEMSATE1");
            var adjust1 = block.getFieldValue("ADJUSTCOEFFICIENT1");
            var start_compensate1 = block.getFieldValue("STARTCOMPEMSATE1");
            var max_compensate1 = block.getFieldValue("MAXCOMPEMSATE1");
            var total1 = block.getFieldValue("TOTALCOMPEMSATE1");
            var compensate2 = block.getFieldValue("COMPEMSATE2");
            var adjust2 = block.getFieldValue("ADJUSTCOEFFICIENT2");
            var start_compensate2 = block.getFieldValue("STARTCOMPEMSATE2");
            var max_compensate2 = block.getFieldValue("MAXCOMPEMSATE2");
            var total2 = block.getFieldValue("TOTALCOMPEMSATE2");
            var choice = block.getFieldValue("AXISCHOICE");
            var mode = block.getFieldValue("MODE");
            var start_count = block.getFieldValue("STARTCOUNT");
            var current_count = block.getFieldValue("CURRENTCOUNT");
            var current = block.getFieldValue("CURRENT");
            if (mode == 0) {
                var code = `ArcWeldTraceControl(1,${delay_time},${compensate1},${adjust1},${start_compensate1},${max_compensate1},${total1},${compensate2},${adjust2},${start_compensate2},${max_compensate2},${total2},${choice},${mode},${start_count},${current_count},10)\n`
            } else {
                var code = `ArcWeldTraceControl(1,${delay_time},${compensate1},${adjust1},${start_compensate1},${max_compensate1},${total1},${compensate2},${adjust2},${start_compensate2},${max_compensate},${total2},${choice},${mode},4,1,${current})\n`
            }
            return code;
        };
        
        /* 电弧跟踪关闭 */
        Blockly.Blocks['arcweldtracecontrolend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[108].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._arc_track_lag_time)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000, 0), 'DELAYTIME')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_isleftright)
                    .appendField(new Blockly.FieldDropdown(traceIsleftrightDataArr), "COMPEMSATE1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_klr)
                    .appendField(new Blockly.FieldNumber(0.06, -1, 1, 0.001), 'ADJUSTCOEFFICIENT1')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_tstartlr)
                    .appendField(new Blockly.FieldNumber(5, 0, 300, 0), 'STARTCOMPEMSATE1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_stepmaxlr)
                    .appendField(new Blockly.FieldNumber(5, 0, 300, 0), 'MAXCOMPEMSATE1')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_summaxlr)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'TOTALCOMPEMSATE1')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_isuplow)
                    .appendField(new Blockly.FieldDropdown(traceIsleftrightDataArr), "COMPEMSATE2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_kud)
                    .appendField(new Blockly.FieldNumber(0.06, -1, 1, 0.001), 'ADJUSTCOEFFICIENT2')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_tstartud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'STARTCOMPEMSATE2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_stepmaxud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'MAXCOMPEMSATE2')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_summaxud)
                    .appendField(new Blockly.FieldNumber(300, 0, 300, 0), 'TOTALCOMPEMSATE2')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_axisselect)
                    .appendField(new Blockly.FieldDropdown(weldTraceAxisselectDataArr), "AXISCHOICE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._weld_trace_reference_type)
                    .appendField(new Blockly.FieldDropdown(weldTraceReferenceTypeDataArr), "MODE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._up_down_reference_current_start)
                    .appendField(new Blockly.FieldNumber(4, 0, 10000, 0), 'STARTCOUNT')
                this.appendDummyInput()
                    .appendField(graphInputTitles.weld._up_down_reference_current)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'CURRENTCOUNT')
                    .appendField(',')
                    .appendField(graphInputTitles.weld._weld_trace_reference_current)
                    .appendField(new Blockly.FieldNumber(10, 0, 300, 0), 'CURRENT')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#ed5a3e");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['arcweldtracecontrolend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var delay_time = block.getFieldValue("DELAYTIME");
            var compensate1 = block.getFieldValue("COMPEMSATE1");
            var adjust1 = block.getFieldValue("ADJUSTCOEFFICIENT1");
            var start_compensate1 = block.getFieldValue("STARTCOMPEMSATE1");
            var max_compensate1 = block.getFieldValue("MAXCOMPEMSATE1");
            var total1 = block.getFieldValue("TOTALCOMPEMSATE1");
            var compensate2 = block.getFieldValue("COMPEMSATE2");
            var adjust2 = block.getFieldValue("ADJUSTCOEFFICIENT2");
            var start_compensate2 = block.getFieldValue("STARTCOMPEMSATE2");
            var max_compensate2 = block.getFieldValue("MAXCOMPEMSATE2");
            var total2 = block.getFieldValue("TOTALCOMPEMSATE2");
            var choice = block.getFieldValue("AXISCHOICE");
            var mode = block.getFieldValue("MODE");
            var start_count = block.getFieldValue("STARTCOUNT");
            var current_count = block.getFieldValue("CURRENTCOUNT");
            var current = block.getFieldValue("CURRENT");
            if (mode == 0) {
                var code = `ArcWeldTraceControl(0,${delay_time},${compensate1},${adjust1},${start_compensate1},${max_compensate1},${total1},${compensate2},${adjust2},${start_compensate2},${max_compensate2},${total2},${choice},${mode},${start_count},${current_count},10)\n`
            } else {
                var code = `ArcWeldTraceControl(0,${delay_time},${compensate1},${adjust1},${start_compensate1},${max_compensate1},${total1},${compensate2},${adjust2},${start_compensate2},${max_compensate},${total2},${choice},${mode},4,1,${current})\n`
            }
            return code;
        };
                
        /* 开启碰撞检测 */
        Blockly.Blocks['ftguard'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[80].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(toolTrsfCoordeArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField('Fx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FX")
                    .appendField(',')
                    .appendField('FY')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FY")
                    .appendField(',')
                    .appendField('FZ')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FZ")
                this.appendDummyInput()
                    .appendField('Tx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TX")
                    .appendField(',')
                    .appendField('Ty')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TY")
                    .appendField(',')
                    .appendField('Tz')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TZ")
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZVALUE')
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXMAXVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYMAXVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZMAXVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXMAXVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYMAXVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZMAXVALUE')
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXMINVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYMINVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZMINVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXMINVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYMINVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZMINVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftguard'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var fx = block.getFieldValue("FX");
            var fy = block.getFieldValue("FY");
            var fz = block.getFieldValue("FZ");
            var tx = block.getFieldValue("TX");
            var ty = block.getFieldValue("TY");
            var tz = block.getFieldValue("TZ");
            var fx_value = block.getFieldValue("FXVALUE");
            var fy_value = block.getFieldValue("FYVALUE");
            var fz_value = block.getFieldValue("FZVALUE");
            var tx_value = block.getFieldValue("TXVALUE");
            var ty_value = block.getFieldValue("TYVALUE");
            var tz_value = block.getFieldValue("TZVALUE");
            var fx_max_value = block.getFieldValue("FXMAXVALUE");
            var fy_max_value = block.getFieldValue("FYMAXVALUE");
            var fz_max_value = block.getFieldValue("FZMAXVALUE");
            var tx_max_value = block.getFieldValue("TXMAXVALUE");
            var ty_max_value = block.getFieldValue("TYMAXVALUE");
            var tz_max_value = block.getFieldValue("TZMAXVALUE");
            var fx_min_value = block.getFieldValue("FXMINVALUE");
            var fy_min_value = block.getFieldValue("FYMINVALUE");
            var fz_min_value = block.getFieldValue("FZMINVALUE");
            var tx_min_value = block.getFieldValue("TXMINVALUE");
            var ty_min_value = block.getFieldValue("TYMINVALUE");
            var tz_min_value = block.getFieldValue("TZMINVALUE");
            var code = 'FT_Guard(1,' + name + ',' + fx + ',' + fy + ',' + fz + ',' + tx + ',' + ty + ',' + tz + ',' + fx_value + ',' + fy_value + ',' + fz_value + ',' + tx_value + ',' + ty_value + ',' + tz_value + ',' + fx_max_value + ',' + fy_max_value + ',' + fz_max_value + ',' + tx_max_value + ',' + ty_max_value + ',' + tz_max_value + ',' + fx_min_value + ',' + fy_min_value + ',' + fz_min_value + ',' + tx_min_value + ',' + ty_min_value + ',' + tz_min_value +')\n';
            return code;
        };
                        
        /* 关闭碰撞检测 */
        Blockly.Blocks['ftguardclose'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[81].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(toolTrsfCoordeArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField('Fx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FX")
                    .appendField(',')
                    .appendField('FY')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FY")
                    .appendField(',')
                    .appendField('FZ')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FZ")
                this.appendDummyInput()
                    .appendField('Tx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TX")
                    .appendField(',')
                    .appendField('Ty')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TY")
                    .appendField(',')
                    .appendField('Tz')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TZ")
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZVALUE')
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXMAXVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYMAXVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZMAXVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXMAXVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYMAXVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_max_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZMAXVALUE')
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXMINVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYMINVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZMINVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXMINVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYMINVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_min_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZMINVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftguardclose'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var fx = block.getFieldValue("FX");
            var fy = block.getFieldValue("FY");
            var fz = block.getFieldValue("FZ");
            var tx = block.getFieldValue("TX");
            var ty = block.getFieldValue("TY");
            var tz = block.getFieldValue("TZ");
            var fx_value = block.getFieldValue("FXVALUE");
            var fy_value = block.getFieldValue("FYVALUE");
            var fz_value = block.getFieldValue("FZVALUE");
            var tx_value = block.getFieldValue("TXVALUE");
            var ty_value = block.getFieldValue("TYVALUE");
            var tz_value = block.getFieldValue("TZVALUE");
            var fx_max_value = block.getFieldValue("FXMAXVALUE");
            var fy_max_value = block.getFieldValue("FYMAXVALUE");
            var fz_max_value = block.getFieldValue("FZMAXVALUE");
            var tx_max_value = block.getFieldValue("TXMAXVALUE");
            var ty_max_value = block.getFieldValue("TYMAXVALUE");
            var tz_max_value = block.getFieldValue("TZMAXVALUE");
            var fx_min_value = block.getFieldValue("FXMINVALUE");
            var fy_min_value = block.getFieldValue("FYMINVALUE");
            var fz_min_value = block.getFieldValue("FZMINVALUE");
            var tx_min_value = block.getFieldValue("TXMINVALUE");
            var ty_min_value = block.getFieldValue("TYMINVALUE");
            var tz_min_value = block.getFieldValue("TZMINVALUE");
            var code = 'FT_Guard(0,' + name + ',' + fx + ',' + fy + ',' + fz + ',' + tx + ',' + ty + ',' + tz + ',' + fx_value + ',' + fy_value + ',' + fz_value + ',' + tx_value + ',' + ty_value + ',' + tz_value + ',' + fx_max_value + ',' + fy_max_value + ',' + fz_max_value + ',' + tx_max_value + ',' + ty_max_value + ',' + tz_max_value + ',' + fx_min_value + ',' + fy_min_value + ',' + fz_min_value + ',' + tx_min_value + ',' + ty_min_value + ',' + tz_min_value +')\n';
            return code;
        };

        /* 开启控制 */
        Blockly.Blocks['ftcontrol'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[82].name)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(toolTrsfCoordeArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField('Fx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FX")
                    .appendField(',')
                    .appendField('FY')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FY")
                    .appendField(',')
                    .appendField('FZ')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "FZ")
                this.appendDummyInput()
                    .appendField('Tx')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TX")
                    .appendField(',')
                    .appendField('Ty')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TY")
                    .appendField(',')
                    .appendField('Tz')
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "TZ")
                this.appendDummyInput()
                    .appendField('Fx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXVALUE')
                    .appendField(',')
                    .appendField('Fy' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYVALUE')
                this.appendDummyInput()
                    .appendField('Fz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZVALUE')
                    .appendField(',')
                    .appendField('Tx' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXVALUE')
                this.appendDummyInput()
                    .appendField('Ty' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYVALUE')
                    .appendField(',')
                    .appendField('Tz' + graphInputTitles.motion._ft_current_value)
                    .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZVALUE')
                this.appendDummyInput()
                    .appendField('F_P_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FPVALUE')
                    .appendField(',')
                    .appendField('F_I_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FIVALUE')
                    .appendField(',')
                    .appendField('F_D_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FDVALUE')
                this.appendDummyInput()
                    .appendField('T_P_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TPVALUE')
                    .appendField(',')
                    .appendField('T_I_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TIVALUE')
                    .appendField(',')
                    .appendField('T_D_gain')
                    .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TDVALUE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_control_adj_sign)
                    .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "STATE1")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_control_ilc_sign)
                    .appendField(new Blockly.FieldDropdown(FTControlILCSignDataArr), "STATE2")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_control_length)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'MAXLENGTH')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_control_angle)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'MAXANGLE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._filtering_waves)
                    .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "FILTER")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._postural_adaptation)
                    .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "ADJUSTPOSE")
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                    this.setColour("#30c1d5");
                    this.setTooltip("");
                    this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcontrol'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var fx = block.getFieldValue("FX");
            var fy = block.getFieldValue("FY");
            var fz = block.getFieldValue("FZ");
            var tx = block.getFieldValue("TX");
            var ty = block.getFieldValue("TY");
            var tz = block.getFieldValue("TZ");
            var fx_value = block.getFieldValue("FXVALUE");
            var fy_value = block.getFieldValue("FYVALUE");
            var fz_value = block.getFieldValue("FZVALUE");
            var tx_value = block.getFieldValue("TXVALUE");
            var ty_value = block.getFieldValue("TYVALUE");
            var tz_value = block.getFieldValue("TZVALUE");
            var f_p_gain = block.getFieldValue("FPVALUE");
            var f_I_gain = block.getFieldValue("FIVALUE");
            var f_d_gain = block.getFieldValue("FDVALUE");
            var t_p_gain = block.getFieldValue("TPVALUE");
            var t_I_gain = block.getFieldValue("TIVALUE");
            var t_d_gain = block.getFieldValue("TDVALUE");
            var state1 = block.getFieldValue("STATE1");
            var state2 = block.getFieldValue("STATE2");
            var length = block.getFieldValue("MAXLENGTH");
            var angle = block.getFieldValue("MAXANGLE");
            var filter = block.getFieldValue("FILTER");
            var adjust_pose = block.getFieldValue("ADJUSTPOSE");
            var code = 'FT_Control(1,' + name + ',' + fx + ',' + fy + ',' + fz + ',' + tx + ',' + ty + ',' + tz + ',' + fx_value + ',' + fy_value + ',' + fz_value + ',' + tx_value + ',' + ty_value + ',' + tz_value + ',' + f_p_gain + ',' + f_I_gain + ',' + f_d_gain + ',' + t_p_gain + ',' + t_I_gain + ',' + t_d_gain + ',' + state1 + ',' + state2 + ',' + length + ',' + angle + ',' + filter + ',' + adjust_pose +')\n';
            return code;
        };
                                
        /* 关闭控制 */
        Blockly.Blocks['ftcontrolclose'] = {
            init: function () {
            this.appendDummyInput()
                .appendField(commandNameData[83].name)
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._coord_name)
                .appendField(new Blockly.FieldDropdown(toolTrsfCoordeArr), "AXISNAME")
            this.appendDummyInput()
                .appendField('Fx')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "FX")
                .appendField(',')
                .appendField('FY')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "FY")
                .appendField(',')
                .appendField('FZ')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "FZ")
            this.appendDummyInput()
                .appendField('Tx')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "TX")
                .appendField(',')
                .appendField('Ty')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "TY")
                .appendField(',')
                .appendField('Tz')
                .appendField(new Blockly.FieldDropdown(whetherDataArr), "TZ")
            this.appendDummyInput()
                .appendField('Fx' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FXVALUE')
                .appendField(',')
                .appendField('Fy' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FYVALUE')
            this.appendDummyInput()
                .appendField('Fz' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'FZVALUE')
                .appendField(',')
                .appendField('Tx' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TXVALUE')
            this.appendDummyInput()
                .appendField('Ty' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TYVALUE')
                .appendField(',')
                .appendField('Tz' + graphInputTitles.motion._ft_current_value)
                .appendField(new Blockly.FieldNumber(0, -1000, 1000, 0), 'TZVALUE')
            this.appendDummyInput()
                .appendField('F_P_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FPVALUE')
                .appendField(',')
                .appendField('F_I_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FIVALUE')
                .appendField(',')
                .appendField('F_D_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'FDVALUE')
            this.appendDummyInput()
                .appendField('T_P_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TPVALUE')
                .appendField(',')
                .appendField('T_I_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TIVALUE')
                .appendField(',')
                .appendField('T_D_gain')
                .appendField(new Blockly.FieldNumber(0, -1, 1, 0.0001), 'TDVALUE')
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._ft_control_adj_sign)
                .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "STATE1")
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._ft_control_ilc_sign)
                .appendField(new Blockly.FieldDropdown(FTControlILCSignDataArr), "STATE2")
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._ft_control_length)
                .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'MAXLENGTH')
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._ft_control_angle)
                .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'MAXANGLE')
            this.appendDummyInput()
                .appendField(graphInputTitles.motion._filtering_waves)
                .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "FILTER")
                .appendField(',')
                .appendField(graphInputTitles.motion._postural_adaptation)
                .appendField(new Blockly.FieldDropdown(FTControlAdjSignDataArr), "ADJUSTPOSE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcontrolclose'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var fx = block.getFieldValue("FX");
            var fy = block.getFieldValue("FY");
            var fz = block.getFieldValue("FZ");
            var tx = block.getFieldValue("TX");
            var ty = block.getFieldValue("TY");
            var tz = block.getFieldValue("TZ");
            var fx_value = block.getFieldValue("FXVALUE");
            var fy_value = block.getFieldValue("FYVALUE");
            var fz_value = block.getFieldValue("FZVALUE");
            var tx_value = block.getFieldValue("TXVALUE");
            var ty_value = block.getFieldValue("TYVALUE");
            var tz_value = block.getFieldValue("TZVALUE");
            var f_p_gain = block.getFieldValue("FPVALUE");
            var f_I_gain = block.getFieldValue("FIVALUE");
            var f_d_gain = block.getFieldValue("FDVALUE");
            var t_p_gain = block.getFieldValue("TPVALUE");
            var t_I_gain = block.getFieldValue("TIVALUE");
            var t_d_gain = block.getFieldValue("TDVALUE");
            var state1 = block.getFieldValue("STATE1");
            var state2 = block.getFieldValue("STATE2");
            var length = block.getFieldValue("MAXLENGTH");
            var angle = block.getFieldValue("MAXANGLE");
            var filter = block.getFieldValue("FILTER");
            var adjust_pose = block.getFieldValue("ADJUSTPOSE");
            var code = 'FT_Control(0,' + name + ',' + fx + ',' + fy + ',' + fz + ',' + tx + ',' + ty + ',' + tz + ',' + fx_value + ',' + fy_value + ',' + fz_value + ',' + tx_value + ',' + ty_value + ',' + tz_value + ',' + f_p_gain + ',' + f_I_gain + ',' + f_d_gain + ',' + t_p_gain + ',' + t_I_gain + ',' + t_d_gain + ',' + state1 + ',' + state2 + ',' + length + ',' + angle + ',' + filter + ',' + adjust_pose +')\n';
            return code;
        };

        /* 柔顺控制开启 */
        Blockly.Blocks['ftcompliancestart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ftcom_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_compliance_adjust)
                    .appendField(new Blockly.FieldNumber(0, 0, 1, 0.001), 'ADJUSTVALUE')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_compliance_threshold)
                    .appendField(new Blockly.FieldNumber(0, -100, 100, 0.01), 'CONTROLVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcompliancestart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var value1 = block.getFieldValue("ADJUSTVALUE");
            var value2 = block.getFieldValue("CONTROLVALUE");
            var code = 'FT_ComplianceStart(' + value1 + ',' + value2 + ')\n'; 
            return code;
        };

        /* 柔顺控制关闭 */
        Blockly.Blocks['ftcompliancestop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ftcom_end)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcompliancestop'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'FT_ComplianceStop()\n'; 
            return code;
        };

        /* 螺旋插入 */
        Blockly.Blocks['ftspiralsearch'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_spiral_search_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(FTReferenceCoordDataArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_spiral_increase_turn)
                    .appendField(new Blockly.FieldNumber(0.7, 0, 1, 0.001), 'RADIUSVALUE')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_spiral_force_insertion)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0), 'VALUE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_spiral_time_max)
                    .appendField(new Blockly.FieldNumber(0, 0, 6000, 0), 'TIME')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_spiral_vel_speed)
                    .appendField(new Blockly.FieldNumber(5, 0, 100, 0), 'MAXSPEED')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftspiralsearch'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var radius = block.getFieldValue("RADIUSVALUE");
            var value = block.getFieldValue("VALUE");
            var time = block.getFieldValue("TIME");
            var speed = block.getFieldValue("MAXSPEED");
            var code = 'FT_SpiralSearch(' + name + ',' + radius + ',' + value + ',' + time + ',' + speed + ')\n'; 
            return code;
        };

        /* 旋转插入 */
        Blockly.Blocks['ftrotinsertion'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_rot_insertion_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(FTReferenceCoordDataArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_rot_ang_vel_rot)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0.001), 'ROTATEANGLESPEED')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_rot_force_insertion)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'STOPFORCETORQUE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_rot_angle_max)
                    .appendField(new Blockly.FieldNumber(5, 0, 100, 0), 'MAXROTATEANGLE')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_rot_orn)
                    .appendField(new Blockly.FieldDropdown(FTRotOrnDataArr), "FORCEDIRECTION")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_rot_angle_acc_max)
                    .appendField(new Blockly.FieldNumber(5, 0, 100, 0), 'MAXROTATEACC')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_insert_orn)
                    .appendField(new Blockly.FieldDropdown(FTRotRotOrnDataArr), "INSERTDIRECTION")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftrotinsertion'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var speed = block.getFieldValue("ROTATEANGLESPEED");
            var torque = block.getFieldValue("STOPFORCETORQUE");
            var angle = block.getFieldValue("MAXROTATEANGLE");
            var force_direction = block.getFieldValue("FORCEDIRECTION");
            var acc = block.getFieldValue("MAXROTATEACC");
            var insert_direction = block.getFieldValue("INSERTDIRECTION");
            var code = 'FT_RotInsertion(' + name + ',' + speed + ',' + torque + ',' + angle + ',' + force_direction + ',' + acc + ',' + insert_direction + ')\n'; 
            return code;
        };

        /* 直线插入 */
        Blockly.Blocks['ftlininsertion'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_lin_insertion_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(FTReferenceCoordDataArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_lin_force_goal)
                    .appendField(new Blockly.FieldNumber(50, 0, 100, 0), 'STOPFORCETORQUE')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_lin_vel)
                    .appendField(new Blockly.FieldNumber(1, 0, 100, 0), 'LINSPEED')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_lin_acc)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'LINACC')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_lin_distance_max)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'MAXINSERTLENGTH')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_insert_orn)
                    .appendField(new Blockly.FieldDropdown(FTRotRotOrnDataArr), "INSERTDIRECTION")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftlininsertion'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var torque = block.getFieldValue("STOPFORCETORQUE");
            var speed = block.getFieldValue("LINSPEED");
            var acc = block.getFieldValue("LINACC");
            var length = block.getFieldValue("MAXINSERTLENGTH");
            var insert_direction = block.getFieldValue("INSERTDIRECTION");
            var code = 'FT_LinInsertion(' + name + ',' + torque + ',' + speed + ',' + acc + ',' + length + ',' + insert_direction + ')\n'; 
            return code;
        };

        /* 表面定位 */
        Blockly.Blocks['ftfindsurface'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_find_surface)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._coord_name)
                    .appendField(new Blockly.FieldDropdown(FTReferenceCoordDataArr), "AXISNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_find_surface_diretcion)
                    .appendField(new Blockly.FieldDropdown(FTRotRotOrnDataArr), "MOVEDIRECTION")
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_find_surface_axis)
                    .appendField(new Blockly.FieldDropdown(wobjAxisDataArr), "MOVEAXIS")
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_find_surface_vel)
                    .appendField(new Blockly.FieldNumber(1, 0, 100, 0), 'LINSPEED')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_find_surface_acc)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'LINACC')
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ft_find_surface_distance_max)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'MAXINSERTLENGTH')
                    .appendField(',')
                    .appendField(graphInputTitles.motion._ft_find_surface_force_goal)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'STOPFORCEVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftfindsurface'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var name = block.getFieldValue("AXISNAME");
            var move_direction = block.getFieldValue("MOVEDIRECTION");
            var axis = block.getFieldValue("MOVEAXIS");
            var speed = block.getFieldValue("LINSPEED");
            var acc = block.getFieldValue("LINACC");
            var length = block.getFieldValue("MAXINSERTLENGTH");
            var value = block.getFieldValue("STOPFORCEVALUE");
            var code = 'FT_FindSurface(' + name + ',' + move_direction + ',' + axis + ',' + speed + ',' + acc + ',' + length + ',' + value + ')\n'; 
            return code;
        };

        /* 计算开始 */
        Blockly.Blocks['ftcalcenterstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ftcal_start)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcalcenterstart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'FT_CalCenterStart()\n'; 
            return code;
        };

        /* 计算结束 */
        Blockly.Blocks['ftcalcenterend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._ftcal_end)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['ftcalcenterend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'FT_CalCenterEnd()\n'; 
            return code;
        };

        /* 扭矩记录启动 */
        Blockly.Blocks['torquerecordstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._torque_record_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._torque_smooth)
                    .appendField(new Blockly.FieldDropdown(torqueSmoothTypeDataArr), "SMOOTHCHOICE")
                this.appendDummyInput()
                    .appendField('J1' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J1MINUSVALUE')
                    .appendField(',')
                    .appendField('J2' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J2MINUSVALUE')
                this.appendDummyInput()
                    .appendField('J3' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J3MINUSVALUE')
                    .appendField(',')
                    .appendField('J4' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J4MINUSVALUE')
                this.appendDummyInput()
                    .appendField('J5' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J5MINUSVALUE')
                    .appendField(',')
                    .appendField('J6' + graphInputTitles.motion._torque_negative_value)
                    .appendField(new Blockly.FieldNumber(0, -100, 0, 0), 'J6MINUSVALUE')
                this.appendDummyInput()
                    .appendField('J1' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J1POSITIVEVALUE')
                    .appendField(',')
                    .appendField('J2' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J2POSITIVEVALUE')
                this.appendDummyInput()
                    .appendField('J3' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J3POSITIVEVALUE')
                    .appendField(',')
                    .appendField('J4' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J4POSITIVEVALUE')
                this.appendDummyInput()
                    .appendField('J5' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J5POSITIVEVALUE')
                    .appendField(',')
                    .appendField('J6' + graphInputTitles.motion._torque_positive_value)
                    .appendField(new Blockly.FieldNumber(0, 0, 100, 0), 'J6POSITIVEVALUE')
                this.appendDummyInput()
                    .appendField('J1' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J1COLLISIONCHECKTIME')
                    .appendField(',')
                    .appendField('J2' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J2COLLISIONCHECKTIME')
                this.appendDummyInput()
                    .appendField('J3' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J3COLLISIONCHECKTIME')
                    .appendField(',')
                    .appendField('J4' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J4COLLISIONCHECKTIME')
                this.appendDummyInput()
                    .appendField('J5' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J5COLLISIONCHECKTIME')
                    .appendField(',')
                    .appendField('J6' + graphInputTitles.motion._collision_detection_duration)
                    .appendField(new Blockly.FieldNumber(0, 0, 1000, 0), 'J6COLLISIONCHECKTIME')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['torquerecordstart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var choice = block.getFieldValue("SMOOTHCHOICE");
            var j1_minus = block.getFieldValue("J1MINUSVALUE");
            var j2_minus = block.getFieldValue("J2MINUSVALUE");
            var j3_minus = block.getFieldValue("J3MINUSVALUE");
            var j4_minus = block.getFieldValue("J4MINUSVALUE");
            var j5_minus = block.getFieldValue("J5MINUSVALUE");
            var j6_minus = block.getFieldValue("J6MINUSVALUE");
            var j1_positive = block.getFieldValue("J1POSITIVEVALUE");
            var j2_positive = block.getFieldValue("J2POSITIVEVALUE");
            var j3_positive = block.getFieldValue("J3POSITIVEVALUE");
            var j4_positive = block.getFieldValue("J4POSITIVEVALUE");
            var j5_positive = block.getFieldValue("J5POSITIVEVALUE");
            var j6_positive = block.getFieldValue("J6POSITIVEVALUE");
            var j1_time = block.getFieldValue("J1COLLISIONCHECKTIME");
            var j2_time = block.getFieldValue("J2COLLISIONCHECKTIME");
            var j3_time = block.getFieldValue("J3COLLISIONCHECKTIME");
            var j4_time = block.getFieldValue("J4COLLISIONCHECKTIME");
            var j5_time = block.getFieldValue("J5COLLISIONCHECKTIME");
            var j6_time = block.getFieldValue("J6COLLISIONCHECKTIME");
            var code = `negativeValues = {${j1_minus},${j2_minus},${j3_minus},${j4_minus},${j5_minus},${j6_minus}}\n`
                     + `positiveValues = {${j1_positive},${j2_positive},${j3_positive},${j4_positive},${j5_positive},${j6_positive}}\n`
                     + `collisionTime = {${j1_time},${j2_time},${j3_time},${j4_time},${j5_time},${j6_time}}\n`
                     + `TorqueRecordStart(${choice},negativeValues,positiveValues,collisionTime)\n`;
            return code;
        };

        /* 扭矩记录停止 */
        Blockly.Blocks['torquerecordend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._torque_record_end)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['torquerecordend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'TorqueRecordEnd()\n'; 
            return code;
        };

        /* 扭矩记录复位 */
        Blockly.Blocks['torquerecordreset'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.motion._torque_record_reset)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#30c1d5");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['torquerecordreset'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'TorqueRecordReset()\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 读线圈*/
        Blockly.Blocks['modbusmasterreaddo'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._read_coils)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._do_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterDODataArr), "DONAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 100, 0), 'REGISTERNUMBER')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterreaddo'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var do_name = block.getFieldValue("DONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusMasterReadDO(' + master_name + ',' + do_name + ',' + number + ')\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 写线圈*/
        Blockly.Blocks['modbusmasterwritedo'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._write_coils)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._do_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterDODataArr), "DONAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldTextInput("1"), 'REGISTERVALUE')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterwritedo'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var do_name = block.getFieldValue("DONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var value = block.getFieldValue("REGISTERVALUE");
            var code = 'ModbusMasterWriteDO(' + master_name + ',' + do_name + ',' + number + ',{' + value +'})\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 读离散量*/
        Blockly.Blocks['modbusmasterreaddi'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._read_inbits)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._di_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterDIDataArr), "DINAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterreaddi'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var di_name = block.getFieldValue("DINAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusMasterReadDI(' + master_name + ',' + di_name + ',' + number + ')\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 读模拟输出*/
        Blockly.Blocks['modbusmasterreadao'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._modbus_read_ao)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ao_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAODataArr), "AONAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterreadao'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var ao_name = block.getFieldValue("AONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusMasterReadAO(' + master_name + ',' + ao_name + ',' + number + ')\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 写模拟输出*/
        Blockly.Blocks['modbusmasterwriteao'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._modbus_write_ao)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ao_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAODataArr), "AONAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldTextInput("1"), 'REGISTERVALUE')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterwriteao'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var ao_name = block.getFieldValue("AONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var value = block.getFieldValue("REGISTERVALUE");
            var code = 'ModbusMasterWriteAO(' + master_name + ',' + ao_name + ',' + number + ',{' + value + '})\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 读模拟输入*/
        Blockly.Blocks['modbusmasterreadai'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._modbus_read_ai)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ai_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAIDataArr), "AINAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterreadai'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var ai_name = block.getFieldValue("AINAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusMasterReadAI(' + master_name + ',' + ai_name + ',' + number + ')\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 等待数字输入*/
        Blockly.Blocks['modbusmasterwaitdi'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._modbus_wait_di)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._di_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterDIDataArr), "DINAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_wait_state)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WAITSTATE")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._modbus_timeout)
                    .appendField(new Blockly.FieldNumber(-1, -1, 10000, 0), 'OVERTIME')
                    this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterwaitdi'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var di_name = block.getFieldValue("DINAME");
            var wait_time = block.getFieldValue("WAITSTATE");
            var overtime = block.getFieldValue("OVERTIME");
            var code = 'ModbusMasterWaitDI(' + master_name + ',' + di_name + ',' + wait_time + ',' + overtime + ')\n'; 
            return code;
        };

        /* Modbus主站设置(客户端) 等待模拟输入*/
        Blockly.Blocks['modbusmasterwaitai'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master + graphInputTitles.modbus._modbus_wait_ai)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_master_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAddressDataArr), "MASTERNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ai_name)
                    .appendField(new Blockly.FieldDropdown(modbusMasterAIDataArr), "AINAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_wait_state)
                    .appendField(new Blockly.FieldDropdown(AIcompareArr), "WAITSTATE")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldTextInput("1"), 'REGISTERVALUE')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_timeout)
                    .appendField(new Blockly.FieldNumber(-1, -1, 10000, 0), 'OVERTIME')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusmasterwaitai'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var master_name = block.getFieldValue("MASTERNAME");
            var ai_name = block.getFieldValue("AINAME");
            var wait_time = block.getFieldValue("WAITSTATE");
            var value = block.getFieldValue("REGISTERVALUE");
            var overtime = block.getFieldValue("OVERTIME");
            var code = 'ModbusMasterWaitAI(' + master_name + ',' + ai_name + ',' + wait_time + ',' + value + ',' + overtime + ')\n'; 
            return code;
        };

        /* modbus从站设置读线圈*/
        Blockly.Blocks['modbusslavereaddo'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._read_coils)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._do_name)
                    .appendField(new Blockly.FieldDropdown(slaveDODataArr), "DONAME")
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavereaddo'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var do_name = block.getFieldValue("DONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusSlaveReadDO(' + do_name + ',' + number + ')\n'; 
            return code;
        };

        /* modbus从站设置写线圈*/
        Blockly.Blocks['modbusslavewritedo'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._write_coils)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._do_name)
                    .appendField(new Blockly.FieldDropdown(slaveDODataArr), "DONAME")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldTextInput("1"), 'REGISTERVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavewritedo'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var do_name = block.getFieldValue("DONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var value = block.getFieldValue("REGISTERVALUE");
            var code = 'ModbusSlaveWriteDO(' + do_name + ',' + number + ',{' + value + '})\n'; 
            return code;
        };

        /* modbus从站设置读离散量*/
        Blockly.Blocks['modbusslavereaddi'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._read_inbits)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._di_name)
                    .appendField(new Blockly.FieldDropdown(slaveDIDataArr), "DINAME")
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavereaddi'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var di_name = block.getFieldValue("DINAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusSlaveReadDI(' + di_name + ',' + number + ')\n'; 
            return code;
        };

        /* modbus从站设置读模拟输出*/
        Blockly.Blocks['modbusslavereadao'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._modbus_read_ao)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ao_name)
                    .appendField(new Blockly.FieldDropdown(slaveAODataArr), "AONAME")
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavereadao'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var ao_name = block.getFieldValue("AONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusSlaveReadAO(' + ao_name + ',' + number + ')\n'; 
            return code;
        };
        
        /* modbus从站设置写模拟输出*/
        Blockly.Blocks['modbusslavewriteao'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._modbus_write_ao)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ao_name)
                    .appendField(new Blockly.FieldDropdown(slaveAODataArr), "AONAME")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldTextInput("1"), 'REGISTERVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavewriteao'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var ao_name = block.getFieldValue("AONAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var value = block.getFieldValue("REGISTERVALUE");
            var code = 'ModbusSlaveWriteAO(' + ao_name + ',' + number + ',{' + value + '})\n'; 
            return code;
        };
        
        /* modbus从站设置读模拟输入*/
        Blockly.Blocks['modbusslavereadai'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._modbus_read_ai)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ai_name)
                    .appendField(new Blockly.FieldDropdown(slaveAIDataArr), "AINAME")
                    .appendField(graphInputTitles.modbus._register_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavereadai'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var ai_name = block.getFieldValue("AINAME");
            var number = block.getFieldValue("REGISTERNUMBER");
            var code = 'ModbusSlaveReadAI(' + ai_name + ',' + number + ')\n'; 
            return code;
        };
        
        /* modbus从站设置等待数字输入*/
        Blockly.Blocks['modbusslavewaitdi'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._modbus_wait_di)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._di_name)
                    .appendField(new Blockly.FieldDropdown(slaveDIDataArr), "DINAME")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._modbus_wait_state)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WAITSTATE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_timeout)
                    .appendField(new Blockly.FieldNumber(-1, -1, 10000, 0), 'OVERTIME')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavewaitdi'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var di_name = block.getFieldValue("DINAME");
            var number = block.getFieldValue("WAITSTATE");
            var overtime = block.getFieldValue("OVERTIME");
            var code = 'ModbusSlaveWaitDI(' + di_name + ',' + number + ',' + overtime + ')\n'; 
            return code;
        };
        
        /* modbus从站设置等待模拟输入*/
        Blockly.Blocks['modbusslavewaitai'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_slave + graphInputTitles.modbus._modbus_wait_ai)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._ai_name)
                    .appendField(new Blockly.FieldDropdown(slaveAIDataArr), "AINAME")
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._modbus_wait_state)
                    .appendField(new Blockly.FieldDropdown(AIcompareArr), "WAITSTATE")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_value)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'REGISTERNUMBER')
                    .appendField(',')
                    .appendField(graphInputTitles.modbus._modbus_timeout)
                    .appendField(new Blockly.FieldNumber(-1, -1, 10000, 0), 'REGISTERVALUE')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusslavewaitai'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var ai_name = block.getFieldValue("AINAME");
            var state = block.getFieldValue("WAITSTATE");
            var number = block.getFieldValue("REGISTERNUMBER");
            var value = block.getFieldValue("REGISTERVALUE");
            var code = 'ModbusSlaveWaitAI(' + ai_name + ',' + state + ',' + number + ',' + value + ')\n'; 
            return code;
        };
        
        /* 读寄存器指令*/
        Blockly.Blocks['modbusregread'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_read_register_command)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_function_code)
                    .appendField(new Blockly.FieldDropdown(modbusRegReadFunctionCodeDataArr), "FUNCTIONNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_rtu_get_adress)
                    .appendField(new Blockly.FieldTextInput("192.168.61.80"), 'SLAVEADDRESS')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_rtu_get_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 255, 0), 'SLAVENUMBER')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_adress)
                    .appendField(new Blockly.FieldTextInput("192.168.61.80"), 'ADDRESS')
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WHETHERAPPLY")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusregread'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func_time = block.getFieldValue("FUNCTIONNAME");
            var salve_address = block.getFieldValue("SLAVEADDRESS");
            var salve_number = block.getFieldValue("SLAVENUMBER");
            var address = block.getFieldValue("ADDRESS");
            var whether = block.getFieldValue("WHETHERAPPLY");
            var code = 'ModbusRegRead(' + func_time + ',"' + salve_address + '",' + salve_number + ',"' + address + '",' + whether + ')\n'; 
            return code;
        };
        
        /* 读寄存器数据*/
        Blockly.Blocks['modbusreggetdata'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_read_register_data)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_rtu_get_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 255, 0), 'SLAVENUMBER')
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WHETHERAPPLY")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusreggetdata'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var salve_number = block.getFieldValue("SLAVENUMBER");
            var whether = block.getFieldValue("WHETHERAPPLY");
            var code = 'ModbusRegGetData(' + salve_number + ',' + whether + ')\n'; 
            return code;
        };
        
        /* 写寄存器*/
        Blockly.Blocks['modbusregwrite'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_write_register_data)
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_function_code)
                    .appendField(new Blockly.FieldDropdown(modbusRegWriteFunctionCodeDataArr), "FUNCTIONNAME")
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_rtu_write_adress)
                    .appendField(new Blockly.FieldTextInput("192.168.61.80"), 'SLAVEADDRESS')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._register_rtu_write_num)
                    .appendField(new Blockly.FieldNumber(1, 0, 255, 0), 'SLAVENUMBER')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_array)
                    .appendField(new Blockly.FieldNumber(1, 0, 10000, 0), 'ARRAYDATA')
                this.appendDummyInput()
                    .appendField(graphInputTitles.modbus._modbus_rtu_adress)
                    .appendField(new Blockly.FieldTextInput("192.168.61.80"), 'ADDRESS')
                this.appendDummyInput()
                    .appendField(descriptionData[12].name)
                    .appendField(new Blockly.FieldDropdown(whetherDataArr), "WHETHERAPPLY")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#6750d3");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['modbusregwrite'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var func_time = block.getFieldValue("FUNCTIONNAME");
            var salve_address = block.getFieldValue("SLAVEADDRESS");
            var salve_number = block.getFieldValue("SLAVENUMBER");
            var array = block.getFieldValue("ARRAYDATA");
            var address = block.getFieldValue("ADDRESS");
            var whether = block.getFieldValue("WHETHERAPPLY");
            var code = 'ModbusRegWrite(' + func_time + ',"' + salve_address + '",' + salve_number + ',' + array + ',"' + address + '",' + whether + ')\n'; 
            return code;
        };

        /* 点位表模式*/
        Blockly.Blocks['pointtableswitch'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._point_table_mode)
                    .appendField(new Blockly.FieldDropdown(pointTableModeListArr), "POINTTABLEMODE")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#FFA500");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['pointtableswitch'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var mode = block.getFieldValue("POINTTABLEMODE");
            var code = 'PointTableSwitch(\'' + mode + '\')\n'; 
            return code;
        };

        /* 系统模式*/
        Blockly.Blocks['systempointtableswitch'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._system_mode)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#FFA500");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['systempointtableswitch'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'PointTableSwitch(\'\')\n'; 
            return code;
        };

        /* 焦点跟随开始*/
        Blockly.Blocks['focusstart'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._focus_follows_start)
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._scale_parameter)
                    .appendField(new Blockly.FieldNumber(50.0, 0, 1000, 0.01), 'RATEPARAM')
                    .appendField(',')
                    .appendField(graphInputTitles.auxiliary._feedforward_parameters)
                    .appendField(new Blockly.FieldNumber(19.0, 0, 1000, 0.01), 'PREPARAM')
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._maximum_angular_acc_limit)
                    .appendField(new Blockly.FieldNumber(1440, 0, 10000, 0.01), 'MAXANGLEACCLIMIT')
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._maximum_angular_vel_limit)
                    .appendField(new Blockly.FieldNumber(180, 0, 1000, 0.01), 'MAXANGLESPEEDLIMIT')
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary._lock_axis_pointing)
                    .appendField(new Blockly.FieldDropdown(lockXPointModeDataArr), "LOCKXDIRECTION")
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#FFA500");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['focusstart'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var rate = block.getFieldValue("RATEPARAM");
            var preparam = block.getFieldValue("PREPARAM");
            var acc_limit = block.getFieldValue("MAXANGLEACCLIMIT");
            var angle_limit = block.getFieldValue("MAXANGLESPEEDLIMIT");
            var lock_direction = block.getFieldValue("LOCKXDIRECTION");
            var code = 'FocusStart(' + rate + "," + preparam + ',' + acc_limit + ',' + angle_limit + ','+ lock_direction + ')\n'; 
            return code;
        };

        /* 焦点跟随结束*/
        Blockly.Blocks['focusend'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(graphInputTitles.auxiliary.focus_follows_end)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour("#FFA500");
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['focusend'] = function (block) {
            // TODO: Assemble Lua into code variable.  
            var code = 'FocusEnd()\n'; 
            return code;
        };

        /* 折叠代码块指令 -- 代码块文字说明 */
        Blockly.Blocks['fold_block'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(new Blockly.FieldTextInput(descriptionData[30].name), 'FOLDNAME')
                this.appendStatementInput("FOLDBLOCK")
                    .appendField(commandNameData[35].name)
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour('FFA500');
                this.setTooltip(commandNameData[35].name);
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['fold_block'] = function (block) {
            var fold_name = block.getFieldValue("FOLDNAME");
            var fold_value = Blockly.Lua.statementToCode(block, 'FOLDBLOCK', Blockly.Lua.ORDER_ATOMIC);
            var code = "";
            code = "--" + fold_name + '\n' + fold_value + '\n';
            return code;
        };

        /* dofile调用子程序指令 */
        Blockly.Blocks['dofile'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField(commandNameData[36].name)
                    .appendField(new Blockly.FieldDropdown(userData), "file_lua")
                    .appendField(new Blockly.FieldDropdown(layerIdDataArr), "file_number")
                    .appendField(new Blockly.FieldNumber(1000, 0, Infinity, 1), "file_id")
                this.setNextStatement(true, null);
                this.setPreviousStatement(true, null);
                this.setColour('FFA500');
                this.setTooltip(commandNameData[36].name);
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['dofile'] = function (block) {
            var file_number = block.getFieldValue("file_number");
            var file_id = block.getFieldValue("file_id");
            var file_lua = block.getFieldValue("file_lua");
            var code = "";
            if (g_systemFlag == 0) {
                code = 'NewDofile("/fruser/' +  file_lua + '"' + ',' + file_number + ',' + file_id + ')' + '\n' + 'DofileEnd()\n';
            } else {
                code = 'NewDofile("/usr/local/etc/controller/lua/' +  file_lua + '"' + ',' + file_number + ',' + file_id + ')' + '\n' + 'DofileEnd()\n';
            }
            return code;
        };

        /**创建辅助线程指令 */
        Blockly.Blocks['aux_thread'] = {
            init: function () {
                this.appendValueInput('THREADVALUE')
                    .appendField(new Blockly.FieldTextInput(descriptionData[31].name), 'AUXVALUE')
                this.appendDummyInput()
                    .appendField(commandNameData[37].name)
                this.setColour('FFA500');
                this.setPreviousStatement(true, null)
                this.setNextStatement(true, null);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['aux_thread'] = function (block) {
            var input_more = Blockly.Lua.valueToCode(block, 'THREADVALUE', Blockly.Lua.ORDER_ATOMIC);
            var aux_value = block.getFieldValue('AUXVALUE');
            var code = "";
            if (input_more) {
                input_more = input_more.replace("(", "");
                input_more = input_more.replace(")", "");
                code = 'NewAuxThread(' + aux_value + ',' + '{' + input_more + '})' + '\n';
            } else {
                code = 'NewAuxThread(' + aux_value + ',' + '{' +  '})' + '\n';
            }
            return code;
        };

        /**自定义string类型数值 */
        Blockly.Blocks['input_string'] = {
            init: function () {
                this.appendValueInput('VALUESTRING')
                    .setCheck(null)
                    .appendField(new Blockly.FieldTextInput(descriptionData[32].name), 'INPUTVAL')
                this.setOutput(true);
                this.setColour('FFA500');
                this.setTooltip(descriptionData[32].name);
                this.setHelpUrl("");
            }
        };
        Blockly.Lua['input_string'] = function (block) {
            var input_string = Blockly.Lua.valueToCode(block, 'VALUESTRING', Blockly.Lua.ORDER_ATOMIC);
            var input_val = block.getFieldValue('INPUTVAL');
            var code = "";
            if (input_string) {
                input_string = input_string.replace("(", "");
                input_string = input_string.replace(")", "");
                code =  '"' + input_val + '"'+ ',' + input_string;
            } else {
                code =  '"' + input_val + '"';
            }
            return [code, Blockly.Lua.ORDER_NONE];
        };

          //自定义number类型数值
        Blockly.Blocks['math_out'] = {
            init: function() {
                this.appendValueInput('MATHVALUE')
                    .setCheck(null)
                    .appendField(new Blockly.FieldNumber(0, 0, 10000 ,0), "MATHNAME");
                this.setOutput(true, null);
                this.setColour('FFA500');
                this.setTooltip('');
                this.setHelpUrl('');
            }
        }
        Blockly.Lua['math_out'] = function(block) {
            var code = "";
            var argument0 = block.getFieldValue('MATHNAME')
            var argument1 = Blockly.Lua.valueToCode(block, 'MATHVALUE',Blockly.Lua.ORDER_ATOMIC)
            if (argument1) {
                argument1 = argument1.replace("(", "");
                argument1 = argument1.replace(")", "");
                code = argument0 + "," + argument1;
            } else {
                code = argument0;
            }
            return [code, Blockly.Lua.ORDER_NONE];
        };
    } 

    /* 初始化Blockly */
    let workspace;
    let toolbox;
    let blocklyDiv = document.getElementById('blocklyDiv');
    function initBlockly() {
        toolbox = {
            "kind": "categoryToolbox",
            "contents": [
                {
                    "id":"frluoji",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][0].name,
                    "colour": "#1777d7",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "controls_if",
                        },
                        {
                            "kind": "block",
                            "type": "logic_compare"
                        },
                        {
                            "kind": "block",
                            "type": "logic_operation"
                        },
                        {
                            "kind": "block",
                            "type": "logic_boolean"
                        },
                        {
                            "kind": "block",
                            "type": "logic_negate"
                        },
                        {
                            "kind": "block",
                            "type": "getdi"
                        },
                        {
                            "kind": "block",
                            "type": "gettooldi"
                        },
                        {
                            "kind": "block",
                            "type": "gotofunction"
                        },
                        {
                            "kind": "block",
                            "type": "goto"
                        },
                        {
                            "kind": "label",
                            "text": langJsonData.commandlist["commandTitle"][1].name,
                        },
                        {
                            "kind": "block",
                            "type": "controls_whileUntil"
                        },
                        {
                            "kind": "block",
                            "type": "controls_for"
                        },
                        {
                            "kind": "block",
                            "type": "controls_repeat_ext"
                        },
                        {
                            "kind": "block",
                            "type": "controls_flow_statements"
                        },
                        {
                            "kind": "label",
                            "text": langJsonData.commandlist["commandTitle"][2].name,
                        },
                        {
                            "kind": "block",
                            "type": "math_number"
                        },
                        {
                            "kind": "block",
                            "type": "math_arithmetic"
                        }
                    ]
                },
                {
                    "id":"frbianliang",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][3].name,
                    "categorystyle": "variable_category",
                    "custom": "VARIABLE"
                },
                {
                    "id":"frhanshutiaoyong-z",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][4].name,
                    "colour": "#e34f99",
                    "custom": "PROCEDURE"
                },
                {
                    "id":"frkongzhidian",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][5].name,
                    "colour": "#6eb3f7",
                    "contents": [
                        {
                            "kind": "label",
                            "text": commandNameData[0].name,
                        },
                        {
                            "kind": "block",
                            "type": "ptp"
                        },
                        {
                            "kind": "label",
                            "text": commandNameData[1].name,
                        },
                        {
                            "kind": "block",
                            "type": "lin"
                        },
                        {
                            "kind": "block",
                            "type": "lintranspointangle"
                        },
                        {
                            "kind": "block",
                            "type": "linseampos"
                        },
                        {
                            "kind": "label",
                            "text": commandNameData[2].name,
                        },
                        {
                            "kind": "block",
                            "type": "arc"
                        },
                        // {
                        //     "kind": "block",
                        //     "type": "sptp"
                        // },
                        // {
                        //     "kind": "block",
                        //     "type": "slin"
                        // },
                        // {
                        //     "kind": "block",
                        //     "type": "scric"
                        // },
                        {
                            "kind": "label",
                            "text": commandNameData[3].name,
                        },
                        {
                            "kind": "block",
                            "type": "circle"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[11].name,
                        },
                        {
                            "kind": "block",
                            "type": "spiral"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[12].name,
                        },
                        {
                            "kind": "block",
                            "type": "nspiral"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[55].name,
                        },
                        {
                            "kind": "block",
                            "type": "HSpiralStart"
                        },
                        {
                            "kind": "block",
                            "type": "HSpiralEnd"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[13].name,
                        },
                        {
                            "kind": "block",
                            "type": "splinestart"
                        },
                        {
                            "kind": "block",
                            "type": "splineend"
                        },
                        {
                            "kind": "block",
                            "type": "splinesptp"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[14].name,
                        },
                        {
                            "kind": "block",
                            "type": "newsplinestart"
                        },
                        {
                            "kind": "block",
                            "type": "newsplineend"
                        },
                        {
                            "kind": "block",
                            "type": "newsplinespl"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[15].name,
                        },
                        {
                            "kind": "block",
                            "type": "weavestart"
                        },
                        {
                            "kind": "block",
                            "type": "weaveend"
                        },
                        {
                            "kind": "block",
                            "type": "weavestartsim"
                        },
                        {
                            "kind": "block",
                            "type": "weaveendsim"
                        },
                        {
                            "kind": "block",
                            "type": "weaveinspectstart"
                        },
                        {
                            "kind": "block",
                            "type": "weaveinspectend"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[17].name,
                        },
                        {
                            "kind": "block",
                            "type": "pointsoffsetenable"
                        },
                        {
                            "kind": "block",
                            "type": "pointsoffsetdisable"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[18].name,
                        },
                        {
                            "kind": "block",
                            "type": "servocart"
                        },
                        {
                            "kind": "label",
                            "text":  paramCommandArray[19].name,
                        },
                        {
                            "kind": "block",
                            "type": "trajectory"
                        },
                        {
                            "kind": "label",
                            "text":  paramCommandArray[20].name,
                        },
                        {
                            "kind": "block",
                            "type": "trajectoryJ"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[16].name,
                        },
                        {
                            "kind": "block",
                            "type": "movetpd"
                        },
                        {
                            "kind": "label",
                            "text": "DMP",
                        },
                        {
                            "kind": "block",
                            "type": "dmp"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[52].name,
                        },
                        {
                            "kind": "block",
                            "type": "tooltrsfstart"
                        },
                        {
                            "kind": "block",
                            "type": "tooltrsfend"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[22].name,
                        },
                        {
                            "kind": "block",
                            "type": "wptrsfstart"
                        },
                        {
                            "kind": "block",
                            "type": "wptrsfend"
                        },
                    ]
                },
                {
                    "id":"frDIpeizhi",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][6].name,
                    "colour": "#cd50d5",
                    "contents": [
                        {
                            "kind": "label",
                            "text": paramCommandArray[3].name
                        },
                        {
                            "kind": "block",
                            "type": "waitms"
                        },
                        {
                            "kind": "label",
                            "text": commandNameData[6].name
                        },
                        {
                            "kind": "block",
                            "type": "mode"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[4].name
                        },
                        {
                            "kind": "block",
                            "type": "pause"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[28].name
                        },
                        {
                            "kind": "block",
                            "type": "settoollist"
                        },
                        {
                            "kind": "block",
                            "type": "setextoollist"
                        },
                        {
                            "kind": "block",
                            "type": "setwobjtoollist"
                        },
                        {
                            "kind": "label",
                            "text": "I/O"
                        },
                        {
                            "kind": "block",
                            "type": "set_ao"
                        },
                        {
                            "kind": "block",
                            "type": "get_ai"
                        },
                        {
                            "kind": "block",
                            "type": "wait_AI"
                        },
                        {
                            "kind": "block",
                            "type": "set_do"
                        },
                        {
                            "kind": "block",
                            "type": "get_di"
                        },
                        {
                            "kind": "block",
                            "type": "wait_DI"
                        },
                        {
                            "kind": "block",
                            "type": "Wait_MultiDI"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[27].name,
                        },
                        {
                            "kind": "block",
                            "type": "movetooldostart"
                        },
                        {
                            "kind": "block",
                            "type": "movetooldostartonce"
                        },
                        {
                            "kind": "block",
                            "type": "movedostop"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[57].name,
                        },
                        {
                            "kind": "block",
                            "type": "moveaostart"
                        },
                        {
                            "kind": "block",
                            "type": "moveaostop"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[30].name,
                        },
                        {
                            "kind": "block",
                            "type": "setanticollision"
                        },
                        {
                            "kind": "block",
                            "type": "setanticollisionauto"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[31].name,
                        },
                        {
                            "kind": "block",
                            "type": "setoaccscale"
                        }
                    ]
                },
                {
                    "id":"frkuozhanzhoutubiao",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][9].name,
                    "colour": "#e5804a",
                    "contents": [
                        {
                            "kind": "label",
                            "text": paramCommandArray[32].name,
                        },
                        {
                            "kind": "block",
                            "type": "movegripper"
                        },
                        {
                            "kind": "block",
                            "type": "actgripperreset"
                        },
                        {
                            "kind": "block",
                            "type": "actgripper"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[33].name,
                        },
                        {
                            "kind": "block",
                            "type": "spraystart"
                        },
                        {
                            "kind": "block",
                            "type": "spraystop"
                        },
                        {
                            "kind": "block",
                            "type": "powercleanstart"
                        },
                        {
                            "kind": "block",
                            "type": "powercleanstop"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[34].name + "-UDP",
                        },
                        {
                            "kind": "block",
                            "type": "extdevloadudpdriver"
                        },
                        {
                            "kind": "block",
                            "type": "extdevudpcomparam"
                        },
                        {
                            "kind": "block",
                            "type": "extaxisptp"
                        },
                        {
                            "kind": "block",
                            "type": "extaxismove"
                        },
                        {
                            "kind": "block",
                            "type": "extaxisarc"
                        },
                        {
                            "kind": "block",
                            "type": "extaxissethoming"
                        },
                        {
                            "kind": "block",
                            "type": "extaxisservoon"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[34].name + "-485",
                        },
                        {
                            "kind": "block",
                            "type": "auxservostatusid"
                        },
                        {
                            "kind": "block",
                            "type": "auxservocontrol"
                        },
                        {
                            "kind": "block",
                            "type": "auxservoenable"
                        },
                        {
                            "kind": "block",
                            "type": "auxservohoming"
                        },
                        {
                            "kind": "block",
                            "type": "auxservotargetpos"
                        },
                        {
                            "kind": "block",
                            "type": "auxservotargetspeed"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[35].name,
                        },
                        {
                            "kind": "block",
                            "type": "conveyoriodetect"
                        },
                        {
                            "kind": "block",
                            "type": "conveyorgettrack"
                        },
                        {
                            "kind": "block",
                            "type": "conveyortrackstart"
                        },
                        {
                            "kind": "block",
                            "type": "conveyortrackend"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[51].name,
                        },
                        {
                            "kind": "block",
                            "type": "polishingunloadcomdriver"
                        },
                        {
                            "kind": "block",
                            "type": "polishingloadcomdriver"
                        },
                        {
                            "kind": "block",
                            "type": "polishingdeviceenable"
                        },
                        {
                            "kind": "block",
                            "type": "polishingclearerror"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtorquesensorreset"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtargetVel"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtargettorque"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtargetposition"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtouchforce"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtouchtorquetime"
                        },
                        {
                            "kind": "block",
                            "type": "polishingworkpieceweight"
                        },
                        {
                            "kind": "block",
                            "type": "polishingtargetcontrolmode"
                        },
                    ]
                },
                {
                    "id":"frWeld",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][7].name,
                    "colour": "#ed5a3e",
                    "contents": [
                        {
                            "kind": "label",
                            "text": commandNameData[28].name,
                        },
                        {
                            "kind": "block",
                            "type": "searchstart"
                        },
                        {
                            "kind": "block",
                            "type": "searchstop"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[37].name,
                        },
                        {
                            "kind": "block",
                            "type": "weldarcstart"
                        },
                        {
                            "kind": "block",
                            "type": "weldarcend"
                        },
                        {
                            "kind": "block",
                            "type": "segment"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[36].name,
                        },
                        {
                            "kind": "block",
                            "type": "setweldingvoltage"
                        },
                        {
                            "kind": "block",
                            "type": "setweldingcurrent"
                        },
                        {
                            "kind": "block",
                            "type": "setaspirated"
                        },
                        {
                            "kind": "block",
                            "type": "setaspiratedout"
                        },
                        {
                            "kind": "block",
                            "type": "setforwardWirefeed"
                        },
                        {
                            "kind": "block",
                            "type": "setforwardWirefeedstop"
                        },
                        {
                            "kind": "block",
                            "type": "setreversewirefeed"
                        },
                        {
                            "kind": "block",
                            "type": "setreversewirefeedstop"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[38].name,
                        },
                        {
                            "kind": "block",
                            "type": "ltlaseron1"
                        },
                        {
                            "kind": "block",
                            "type": "ltlaseron2"
                        },
                        {
                            "kind": "block",
                            "type": "ltlaseron3"
                        },
                        {
                            "kind": "block",
                            "type": "unloadlaserdriver"
                        },
                        {
                            "kind": "block",
                            "type": "loadlaserdriver"
                        },
                        {
                            "kind": "block",
                            "type": "laseroff"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[39].name,
                        },
                        {
                            "kind": "block",
                            "type": "lasersensorrecord"
                        },
                        {
                            "kind": "block",
                            "type": "movetolaserrecordstart"
                        },
                        {
                            "kind": "block",
                            "type": "movetolaserrecordend"
                        },
                        {
                            "kind": "block",
                            "type": "lasertrackon"
                        },
                        {
                            "kind": "block",
                            "type": "lasertrackoff"
                        },
                        {
                            "kind": "block",
                            "type": "laserrecordpoint"
                        },
                        {
                            "kind": "block",
                            "type": "laserrecordend"
                        },
                        {
                            "kind": "block",
                            "type": "lasertrackrecurrent"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[40].name,
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchstart"
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchend"
                        },
                        {
                            "kind": "label",
                            "text": commandNameData[138].name,
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchwait"
                        },
                        {
                            "kind": "label",
                            "text": commandNameData[150].name,
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchoffset"
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchoffsetin"
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchoffsetpoint"
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchoffsetcamera"
                        },
                        {
                            "kind": "block",
                            "type": "wiresearchoffsetsurface"
                        },
                        {
                            "kind": "block",
                            "type": "pointtodatabase"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[41].name,
                        },
                        {
                            "kind": "block",
                            "type": "arcweldtracecontrol"
                        },
                        {
                            "kind": "block",
                            "type": "arcweldtracecontrolend"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[42].name,
                        },
                        {
                            "kind": "block",
                            "type": "postureadjuston"
                        },
                        {
                            "kind": "block",
                            "type": "postureadjustoff"
                        },
                    ]
                },
                {
                    "id": "frlichuanganqizhiling",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][10].name,
                    "colour": "30c1d5",
                    "contents": [
                        {
                            "kind": "label",
                            "text": paramCommandArray[43].name,
                        },
                        {
                            "kind": "block",
                            "type": "ftguard"
                        },
                        {
                            "kind": "block",
                            "type": "ftguardclose"
                        },
                        {
                            "kind": "block",
                            "type": "ftcontrol"
                        },
                        {
                            "kind": "block",
                            "type": "ftcontrolclose"
                        },
                        {
                            "kind": "block",
                            "type": "ftcompliancestart"
                        },
                        {
                            "kind": "block",
                            "type": "ftcompliancestop"
                        },
                        {
                            "kind": "block",
                            "type": "ftspiralsearch"
                        },
                        {
                            "kind": "block",
                            "type": "ftrotinsertion"
                        },
                        {
                            "kind": "block",
                            "type": "ftlininsertion"
                        },
                        {
                            "kind": "block",
                            "type": "ftfindsurface"
                        },
                        {
                            "kind": "block",
                            "type": "ftcalcenterstart"
                        },
                        {
                            "kind": "block",
                            "type": "ftcalcenterend"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[44].name,
                        },
                        {
                            "kind": "block",
                            "type": "torquerecordstart"
                        },
                        {
                            "kind": "block",
                            "type": "torquerecordend"
                        },
                        {
                            "kind": "block",
                            "type": "torquerecordreset"
                        },
                    ]
                },
                {
                    "id": "frModbustongxun-z",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][11].name,
                    "colour": "#6750d3",
                    "contents": [
                        {
                            "kind": "label",
                            "text": graphInputTitles.modbus._modbus_master,
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterreaddo"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterwritedo"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterreaddi"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterreadao"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterwriteao"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterreadai"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterwaitdi"
                        },
                        {
                            "kind": "block",
                            "type": "modbusmasterwaitai"
                        },
                        {
                            "kind": "label",
                            "text": graphInputTitles.modbus._modbus_slave,
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavereaddo"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavewritedo"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavereaddi"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavereadao"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavewriteao"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavereadai"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavewaitdi"
                        },
                        {
                            "kind": "block",
                            "type": "modbusslavewaitai"
                        },
                        {
                            "kind": "label",
                            "text": graphInputTitles.modbus._modbus_rtu_read_register_command,
                        },
                        {
                            "kind": "block",
                            "type": "modbusregread"
                        },
                        {
                            "kind": "block",
                            "type": "modbusreggetdata"
                        },
                        {
                            "kind": "block",
                            "type": "modbusregwrite"
                        }
                    ]
                },
                {
                    "id": "frgaoji",
                    "kind": "category",
                    "name": langJsonData.commandlist["commandTitle"][8].name,
                    "colour": "FFA500",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "fold_block"
                        },
                        {
                            "kind": "block",
                            "type": "dofile"
                        },
                        {
                            "kind": "block",
                            "type": "aux_thread"
                        },
                        {
                            "kind": "block",
                            "type": "input_string"
                        },
                        {
                            "kind": "block",
                            "type": "math_out"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[54].name,
                        },
                        {
                            "kind": "block",
                            "type": "pointtableswitch"
                        },
                        {
                            "kind": "block",
                            "type": "systempointtableswitch"
                        },
                        {
                            "kind": "label",
                            "text": paramCommandArray[56].name,
                        },
                        {
                            "kind": "block",
                            "type": "focusstart"
                        },
                        {
                            "kind": "block",
                            "type": "focusend"
                        },
                    ]
                }
            ]
        };

        let options = {
            toolbox: toolbox,
            collapse: true,
            comments: false,
            disable: false,
            maxBlocks: Infinity,
            trashcan: false,
            horizontalLayout: false,
            toolboxPosition: 'start',
            css: true,
            media: '',
            rtl: false,
            scrollbars: true,
            sounds: true,
            oneBasedIndex: true,
            grid: {
                spacing: 20,
                length: 1,
                colour: '#888',
                snap: false
            },
            zoom: {
                // controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.5,
                scaleSpeed: 1.2
            },
        };

        /* Inject your workspace */
        workspace = Blockly.inject(blocklyDiv, options);

    }


    /* 保存工作区 */
    function saveWorkspace(name, xmlText, code) {
        let cmdContent = {
            cmd: "save_blockly_workspace",
            data: {
                ws_name: name + ".json",       //工作区名称
                ws_xml_text: xmlText,
                ws_code: code
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                if (navigateUrl) {
                    location = navigateUrl; //切换路径时，跳转到暂存路径
                    workspace.clear();//离开页面时，保存程序后清除代码块
                }
                localStorage.setItem('graphFileName', cmdContent.data.ws_name);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    let monitorSaveContent;
    /**
     * 保存图形化编程时校验是否同名
     * @param {*} workspaceName 工作区名字
     */
    $scope.checkLuaSameName = function(workspaceName) {
        let nowGPName = workspaceName + ".json";
        let checkCmd = {
            cmd: "check_lua_file",
            data: {
                name: workspaceName + '.lua',
                type: '2'
            },
        };
        dataFactory.getData(checkCmd).then((data) => {
            switch (data.same_name) {
                case '0':
                    textToDomContent(importFileContent);
                    save();
                    break;
                case '1':
                    toastFactory.warning(gpDynamicTags.warning_messages[12] + gpDynamicTags.warning_messages[14]);
                    break;
                case '2':
                    if ($scope.selectedBlocklyWorkspaceName == undefined || $scope.selectedBlocklyWorkspaceName == null) {
                        $("#confirmChangeModal").modal('hide');
                        $('#importGraphModal').modal('hide');
                        $("#confirmGPNameModal").modal();
                        //程序保存前覆盖验证,阻止程序运行
                        g_programErrorFlag = 1;
                    } else {
                        if ($scope.selectedBlocklyWorkspaceName != nowGPName) {
                            monitorSaveContent = Blockly.Lua.workspaceToCode(workspace);
                            $("#confirmChangeModal").modal('hide');
                            $('#importGraphModal').modal('hide');
                            $("#confirmGPNameModal").modal();
                            g_programErrorFlag = 1;
                        } else {
                            save();
                        }
                    }
                    break;
                case '3':
                    toastFactory.warning(gpDynamicTags.warning_messages[13] + gpDynamicTags.warning_messages[14]);
                    break;
                default:
                    break;
            }
        }, (status) => {
            toastFactory.error(status, gpDynamicTags.error_messages[6]);
            /* test */
            if (g_testCode) {
                textToDomContent(importFileContent);
                save();
            }
            /* ./test */
        });
    }

    /**
     * 保存lua文件
     * @param {string} saveCode  覆盖lua文件code
     */
    let xmlText;
    let code;
    function save(saveCode) {
        // code: 生成出来的代码
        let normalCode; //去掉最后一行\n的代码
        code = Blockly.Lua.workspaceToCode(workspace);
        normalCode = code.slice(0, -1);
        let saveCmdContent;
        if (saveCode) {
            saveCode = saveCode.slice(0, -1);
            saveCmdContent = {
                cmd: "save_lua_file",
                data: {
                    name: $scope.workspaceNameForGP + ".lua",
                    pgvalue: saveCode,
                    type: '2'
                },
            };
            handleDofileArr(createCommandsArray(saveCode));
        } else {
            saveCmdContent = {
                cmd: "save_lua_file",
                data: {
                    name: $scope.workspaceNameForGP + ".lua",
                    pgvalue: normalCode,
                    type: '2'
                },
            };
            handleDofileArr(createCommandsArray(code));
        }
        dataFactory.actData(saveCmdContent)
            .then(() => {
                // setSessionStorage();
                g_fileNameForUpload = $scope.workspaceNameForGP + ".lua";
                g_fileDataForUpload = code;

                // save workspace
                // xml：工作区目前编辑的 xml dom 对象
                // xmlText: xml dom 对象转 text
                let xml = Blockly.Xml.workspaceToDom(workspace);
                xmlText = Blockly.Xml.domToText(xml);
                // console.log(typeof (xmlText), xmlText);
                console.log(code);
                saveWorkspace($scope.workspaceNameForGP, xmlText, code);
                $scope.selectedBlocklyWorkspaceName = $scope.workspaceNameForGP + ".json";
                toastFactory.success(gpDynamicTags.success_messages[0] + $scope.workspaceNameForGP);
                $("#confirmGPNameModal").modal('hide');
                $("#confirmChangeModal").modal('hide');
                $("#importGraphModal").modal('hide');
                if (importFileContent) {
                    importFileContent = '';
                }
                if (recordIndex == 1) {
                    $("#loadBlocklyWorkspaceModal").modal();
                }
                getUserFiles();
                if (startProgramFlag == 1 && g_programErrorFlag == 1) {
                    $('#startProgramModal').modal();//打开运行弹出框
                }
                g_programErrorFlag = 0;
                startProgramFlag = 0;
                liveCode.refresh(code);
            }, (status) => {
                /* test */
                if (g_testCode) {
                    let xml = Blockly.Xml.workspaceToDom(workspace);
                    xmlText = Blockly.Xml.domToText(xml);
                    // console.log(typeof (xmlText), xmlText);
                    console.log(code);
                    liveCode.refresh(code);
                    saveWorkspace($scope.workspaceNameForGP, xmlText, code);
                }
                /* ./test */
                toastFactory.error(status, gpDynamicTags.error_messages[3]);
            });
    }

    // 运行示教程序前程序发生改动,自动触发保存按钮
    let startProgramFlag;//程序覆盖后继续运行程序标志 0-不打开 1-打开
    document.getElementById('graphicalProgramming').addEventListener('save-graphical-program', () => {
        if (g_programChangeFlag == 2) {
            navigateUrl = undefined;
            $scope.saveLuaFile();
            startProgramFlag = 1;
        }
    })

    $scope.saveLuaFile = function () {
        if ($scope.workspaceNameForGP == null || $scope.workspaceNameForGP == undefined || $scope.workspaceNameForGP == '') {
            toastFactory.info(gpDynamicTags.info_messages[1]);
        } else {
            if (errorWarning || errorWarning2) {
                // 等待多条DI报错提示在保存时验证，只提示一次
                toastFactory.warning(gpDynamicTags.warning_messages[0]);
                return;
            }
            $scope.checkLuaSameName($scope.workspaceNameForGP);
        }
    }

    /* 确认覆盖 */
    $scope.confirmGPName = function () {
        textToDomContent(importFileContent);
        save(monitorSaveContent);
    }

    /* 取消覆盖 */
    $scope.cancelGPName = function() {
        g_programErrorFlag = 0;
        startProgramFlag = 0;
        if (navigateUrl) {
            location = navigateUrl;
        }
        $("#confirmGPNameModal").modal('hide');
        if($scope.selectedBlocklyWorkspaceName) {
            $scope.workspaceNameForGP = $scope.selectedBlocklyWorkspaceName.split('.')[0]; // 取消覆盖后，工作区名称变为之前的内容
        } else {
            $scope.workspaceNameForGP = '';
        }
    }

    /* 获取工作区数组 */
    $scope.blocklyWorkspaceNamesArr = [];
    function getBlocklyWorkspaceNames() {
        let cmdContent = {
            cmd: "get_blockly_workspace_names"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.blocklyWorkspaceNamesArr = data;
                hidePageLoading();
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.blocklyWorkspaceNamesArr = ["bws1.json", "bws2.json", "bws3.json"];
                }
                /* ./test */
                toastFactory.error(status);
                hidePageLoading();
            });
    }

    /**
     * 检测图形化编程页面内容，若发生改变则触发
     * @param {int} index 取消后继续相关文件操作 1-加载文件 2-导入文件 3-导出文件
     * @returns 
     */
    let recordIndex;
    let monitorContent;
    $scope.judegeBlocklyChange = function(index) {
        if (index) {
            recordIndex = index;
            monitorContent = Blockly.Lua.workspaceToCode(workspace);
            if (monitorContent != code && $scope.workspaceNameForGP != "" && $scope.workspaceNameForGP != undefined && $scope.workspaceNameForGP != null) {
                $("#confirmChangeModal").modal();
                return;
            }
        } else {
            //不保存时触发
            $("#confirmChangeModal").modal('hide');
            if (navigateUrl) {
                location = navigateUrl;
                workspace.clear();//离开页面时，清除输入框仍存在的问题
            }
        }

        switch(recordIndex) {
            case 1:
                $scope.openLoadBlocklyWorkspaceModal();
                break;
            case 2:
                $('#importGraphModal').modal();
                break;
            case 3:
                $('#exportGraphModal').modal();
                break;
            default:
                break;
        }
    }

    //当切换页面时，关闭页面默认不保存后跳转
    $scope.closeGraphicalProgramModal = function() {
        if (navigateUrl) {
            $scope.judegeBlocklyChange();
        }
    }

    /* 打开加载工作区xml模态窗 */
    $scope.openLoadBlocklyWorkspaceModal = function () {
        let cmdContent = {
            cmd: "get_blockly_workspace_names"
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.blocklyWorkspaceNamesArr = data;
                $("#loadBlocklyWorkspaceModal").modal();
                g_programErrorFlag = 0;
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.blocklyWorkspaceNamesArr = ["bws1.json", "bws2.json", "bws3.json"];
                    $("#loadBlocklyWorkspaceModal").modal();
                }
                /* ./test */
                toastFactory.error(status)
            });
    }

    /**
     * 加载工作区
     * @param {string} flag 标志位，初始加载页面时触发
     * @returns 
     */
    $scope.loadWorkspace = function (flag) {
        if(("1" != $scope.controlMode) && $scope.debug_flag && !flag){
            toastFactory.warning(gpDynamicTags.warning_messages[11]);
            return;
        }
        if ($scope.selectedBlocklyWorkspaceName == null || $scope.selectedBlocklyWorkspaceName == undefined) {
            toastFactory.info(gpDynamicTags.info_messages[2]);
        } else {
            let cmdContent = {
                cmd: "get_blockly_workspace",
                data: {
                    ws_name: $scope.selectedBlocklyWorkspaceName
                }
            };
            dataFactory.getData(cmdContent)
                .then((data) => {
                    // 清空工作区
                    $scope.clearWorkspace();
                    // 需要将保存的 xmlText 转为 xml dom 对象
                    let xml = Blockly.Xml.textToDom(data.ws_xml_text);
                    // 回显数据
                    Blockly.Xml.domToWorkspace(xml, workspace);
                    $scope.workspaceNameForGP = $scope.selectedBlocklyWorkspaceName.split('.')[0];
                    $("#loadBlocklyWorkspaceModal").modal("hide");
		            // 保存数据
                    recordIndex = 5;
                    save();
                }, (status) => {
                    /* test */
                    if (g_testCode) {
                        let data = {
                            ws_xml_text: xmlText,   //工作区xml 
                            ws_code: code,        //工作区lua代码
                        };
                        let xml = Blockly.Xml.textToDom(data.ws_xml_text);
                        Blockly.Xml.domToWorkspace(xml, workspace);
                        $scope.workspaceNameForGP = $scope.selectedBlocklyWorkspaceName.split('.')[0];
                        g_fileNameForUpload = $scope.selectedBlocklyWorkspaceName;
                        g_fileDataForUpload = data.ws_code;
                        $("#loadBlocklyWorkspaceModal").modal("hide");
                    }
                    /* ./test */
                    toastFactory.error(status);
                });
        }
    }

    $scope.isDeleteGraphial = false;
    /* 删除工作区文件 */
    $scope.deleteWorkspace = function() {
        if ($scope.selectedBlocklyWorkspaceName) {
            const deleteName = $scope.selectedBlocklyWorkspaceName.split('.json')[0];
            if (!$scope.isDeleteGraphial) {
                toastFactory.info(gpDynamicTags.info_messages[3]);
                $scope.isDeleteGraphial = true;
                return;
            }
            let deleteCmd = {
                cmd: "remove_lua_file",
                data: {
                    name: [deleteName + '.lua'],
                    type: '2'
                }
            };
            dataFactory.actData(deleteCmd).then(() => {
                $('#loadBlocklyWorkspaceModal').modal('hide');
                $scope.selectedBlocklyWorkspaceName = null;
                $scope.isDeleteGraphial = false;
                // 删除成功后重新获取程序文件
                getUserFiles();
                // 删除文件与当前打开文件相同时，需要清除运行的相关信息和图形化编程工作区内容
                if ($scope.workspaceNameForGP && deleteName == $scope.workspaceNameForGP ) {
                    g_fileNameForUpload = "";
                    g_fileDataForUpload = "";
                    clearWorkspace();
                }
                if ((localStorage.getItem("graphFileName") != null) && (localStorage.getItem("graphFileName") != "")) {
                    if (deleteName + '.json' == localStorage.getItem("graphFileName")) {
                        localStorage.removeItem('graphFileName');
                    }
                } 
                toastFactory.success(gpDynamicTags.success_messages[2]);
            }, (status) => {
                $('#loadBlocklyWorkspaceModal').modal('hide');
                $scope.selectedBlocklyWorkspaceName = null;
                $scope.isDeleteGraphial = false;
                toastFactory.error(status, gpDynamicTags.error_messages[7]);
            });
        } else {
            toastFactory.info(gpDynamicTags.info_messages[2]);
        }
    }

    /* 关闭工作区 */
    $scope.closeWorkspace = function() {
        recordIndex = 5; //不再触发自动打开工作区操作
    }

    /* 清空工作区 */
    $scope.clearWorkspace = function () {
        $scope.workspaceNameForGP = null;
        workspace.clear();
        liveCode.refresh('');
    }

    /** 导入工作区 */
    let importFileContent; //导入的文件内容
    let importFileName; //导入的文件名称
    $scope.importGraphFile = function() {
        importFileName = document.getElementById("graphFileImported").files; //获取当前选择的文件对象
        if (null == importFileName[0]) {
            toastFactory.info(gpDynamicTags.info_messages[2]);
            return;
        }
        let fr = new FileReader();
        try {
            fr.readAsText(importFileName.item(0));
            fr.onload = function (e) {
                importFileContent = JSON.parse(e.target.result);
                $scope.workspaceNameForGP = importFileName[0].name.split('.')[0];
                $scope.checkLuaSameName($scope.workspaceNameForGP); // 校验同名文件
            }
        }
        catch (err) {
        }
    }

    /**
     * 导入成功后工作区生成代码块
     * @param {string} content 上传的json文件内容
     */
    function textToDomContent(content) {
        if (content) {
            let xml = Blockly.Xml.textToDom(content.ws_xml_text);
            Blockly.Xml.domToWorkspace(xml, workspace);
            monitorSaveContent = Blockly.Lua.workspaceToCode(workspace);
        }
    }

    /** 导出工作区 */
    $scope.exportGraphFile = function() {
        if (!$scope.selectedBlocklyWorkspaceName) {
            toastFactory.info(gpDynamicTags.info_messages[2]);
        } else {
            $('#exportGraphModal').modal('hide');
            if (g_systemFlag == 1) {
                window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/block/" + $scope.selectedBlocklyWorkspaceName;
            } else {
                window.location.href = "/action/download?pathfilename=/root/web/file/block/" + $scope.selectedBlocklyWorkspaceName;
            }
        }
    }

    /* 更新图形化编程页面 */
    let recordSavePoint;
    blocklyDiv.addEventListener('savepoints', () => {
        if (blocklyDiv != null) {
            getPointsData();
            recordSavePoint = 1;
        }
    });

    /*展开/隐藏代码编译 */
    $scope.livaCodeArrow = function() {
        $(".block-code-container").css('transition','right 0.5s');
        document.getElementById("block-code-container").classList.toggle("live-code-closed");
        document.getElementById("live-code-arrow").classList.toggle("live-code-arrow-clicked");
        liveCode.refresh(Blockly.Lua.workspaceToCode(workspace));
    }

    /*展开/隐藏代码编译 */
    $scope.liveCodeRefresh = function() {
        liveCode.refresh(Blockly.Lua.workspaceToCode(workspace));
    }

    function initialLoadProgram() {
        // 页面初始化或者刷新时加载上次操作的程序
        if ((localStorage.getItem("graphFileName") != null) && (localStorage.getItem("graphFileName") != "")) {
            $scope.selectedBlocklyWorkspaceName = localStorage.getItem("graphFileName");
            $scope.loadWorkspace('init');
        } 
    }

    // 1. 创建自定义类别，先创建自定义类别，继承自Blockly.ToolboxCategory
    class CustomCategory extends Blockly.ToolboxCategory {
        // 自定义类别创造函数
        // categoryDef: 类别定义的信息
        // toolbox: 表示类别的父级toolbox
        // opt_parent: 可选参数，表示其父类别
        constructor(categoryDef, toolbox, opt_parent) {
            super(categoryDef, toolbox, opt_parent);
        }
        // 点击导航栏改变颜色
        addColourBorder_(colour){
            this.rowDiv_.style.backgroundColor = colour;
        }
        // 点击导航栏分类时，去除空白色
        setSelected(isSelected){
            // 点击工具箱导航栏，缩放恢复默认大小
            this.workspace_.scale = 1;
            // 使用getElementsByClassName选中类别对应的span元素
            var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
            if (isSelected) {
            // 选中的类别背景色色度变浅
            this.rowDiv_.style.opacity = '0.6';
            } else {
            // 未选中的类别背景色设置
            this.rowDiv_.style.backgroundColor = this.colour_;
            // 未选中的类别文本设置为白色
            labelDom.style.color = 'white';
            this.rowDiv_.style.opacity = '1';
            }
            Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
                Blockly.utils.aria.State.SELECTED, isSelected);
        }
        // 添加图标
        createIconDom_() {
            const svg = document.createElement('svg');
            if (this.toolboxItemDef_.id == 'frbianliang') {
                svg.setAttribute('style','width: 34px; height: 34px; color:#fff;font-size: 36px');
            } else {
                svg.setAttribute('style','width: 34px; height: 34px; color:#fff;font-size: 26px');
            }
            svg.setAttribute('class',`frfont d-flex justify-content-center align-items-center`);
            svg.setAttribute('class',`frfont ${this.toolboxItemDef_.id} d-flex justify-content-center align-items-center`);
            svg.setAttribute("aria-hidden", true);
            return svg;
        }
    }

    // 2. 自定义类别需要向Blockly注册，告知自定义类别的存在，不然会无法识别新建的类
    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        Blockly.ToolboxCategory.registrationName,
    CustomCategory, true);

    /* 初始化页面 */
    var onresize = function () {
        Blockly.svgResize(workspace);
    };
    document.getElementById("graphicalProgramming").addEventListener('init-blockly', () => {
        console.log("获取示教点", getPointsFlg);
        console.log("获取TPD轨迹", getTPDFlg);
        console.log("获取传感器坐标系", getSensorToolCoordFlg);
        if (getPointsFlg && getTPDFlg && getSensorToolCoordFlg) {
            //SetDO模式(平滑轨迹)       
            langJsonData.commandlist["setIOMode"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                doModeOptionsArr.push(tempItem);
            });
            //Pause暂停模式      
            langJsonData.commandlist["PauseFunction"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                PauseOptionsArr.push(tempItem);
            });

            //waitMultiDI
            langJsonData.IOlists["clDI"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                waitMultiDIOptionArr.push(tempItem);
            });

            //WhetherMotion
            langJsonData.commandlist["WhetherMotion"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                whetherMotionArr.push(tempItem);
            });

            //阻塞/非阻塞
            langJsonData.commandlist["IOBlockData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                blockDataArr.push(tempItem);
            });

            //是/否
            langJsonData.commandlist["WhetherData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                whetherDataArr.push(tempItem);
            });

            //否
            langJsonData.commandlist["WhetherSingleData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                whetherSingleDataArr.push(tempItem);
            });

            //与/或
            langJsonData.commandlist["ConnectionData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                connectionDataArr.push(tempItem);
            });

            //大于/小于
            langJsonData.commandlist["ComparationData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                comparationDataArr.push(tempItem);
            });

            //停止/平滑过渡
            langJsonData.commandlist["LinModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                linModeDataArr.push(tempItem);
            });

            //正确/错误
            langJsonData.commandlist["WhetherTruthData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                whetherTruthDataArr.push(tempItem);
            });

            //错误
            langJsonData.commandlist["LayerIdData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                layerIdDataArr.push(tempItem);
            });

            //功能类型
            langJsonData.program_teach.var_object["functionTypeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                functionTypeDataArr.push(tempItem);
            });

            //段焊模式 0-不变化姿态 1-变化姿态
            langJsonData.program_teach.var_object["segmentModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                segmentModeDataArr.push(tempItem);
            });

            //执行功能
            langJsonData.program_teach.var_object["functionModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                functionModeDataArr.push(tempItem);
            });

            //关节超速保护处理策略
            langJsonData.program_teach.var_object["treatStrategyData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id.toString();
                treatStrategyDataArr.push(tempItem);
            });

            //I/O类型
            langJsonData.commandlist["IOTypeDict"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                functionIOTypeDataArr.push(tempItem);
            });

            //摆动模式
            langJsonData.program_teach.var_object["weaveModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                weaveModeDataArr.push(tempItem);
            });

            //取整类型
            langJsonData.program_teach.var_object["roundingRuleData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                roundingRuleDataArr.push(tempItem);
            });

            //传感器驱动协议--睿牛
            langJsonData.commandlist["LoadPosSensorDriverData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                loadPosSensorDriverDataArr.push(tempItem);
            });

            //旋转方向（顺时针/逆时针）
            langJsonData.program_teach.var_object["spiralDirectionData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                hSprialDriectionArr.push(tempItem);
            });

            //偏移类型
            langJsonData.program_teach.var_object["offsetTypeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                offsetTypeDataArr.push(tempItem);
            });

            //是否偏移
            langJsonData.program_teach.var_object["offsetFlagData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                offsetFlagDataArr.push(tempItem);
            });

            //工具坐标偏移
            langJsonData.program_teach.var_object["nSpiralOffsetFlagData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                nSpiralOffsetFlagDataArr.push(tempItem);
            });

            //旋转方向
            langJsonData.program_teach.var_object["spiralDirectionData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                spiralDirectionDataArr.push(tempItem);
            });

            //控制模式
            langJsonData.program_teach.var_object["newSplineModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                newSplineModeDataArr.push(tempItem);
            });

            //轨迹模式
            langJsonData.commandlist["trajectoryJMode"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                trajectoryJModeArr.push(tempItem);
            });

            //回零模式
            langJsonData.program_teach.var_object["ZeroModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                zeroModeDataArr.push(tempItem);
            });

            //伺服回零模式
            langJsonData.peripheral_setting.var_object["servoZeroModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                servoZeroModeDataArr.push(tempItem);
            });

            //伺服控制模式
            langJsonData.program_teach.var_object["auxServoCommandMode"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                auxServoCommandModeArr.push(tempItem);
            });

            //伺服使能模式
            langJsonData.program_teach.var_object["servoEnableData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                servoEnableDataArr.push(tempItem);
            });

            //伺服ID
            servoIdData.forEach(element => {
                tempItem = [];
                tempItem[0] = element;
                tempItem[1] = element;
                servoIdDataArr.push(tempItem);
            });
            
            //传送带工作模式
            langJsonData.program_teach.var_object["ConTrackModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                conTrackModeDataArr.push(tempItem);
            });
            
            //设备使能
            langJsonData.program_teach.var_object["enableData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                enableDataArr.push(tempItem);
            });
            
            //打磨控制模式
            langJsonData.program_teach.var_object["polishCommandMode"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                polishCommandModeArr.push(tempItem);
            });
            
            //碰撞等级
            langJsonData.program_teach.var_object["collideModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                collideModeDataArr.push(tempItem);
            });
            
            //左右偏移补偿
            langJsonData.program_teach.var_object["traceIsleftrightData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                traceIsleftrightDataArr.push(tempItem);
            });
            
            //上下坐标系选择
            langJsonData.program_teach.var_object["weldTraceAxisselectData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                weldTraceAxisselectDataArr.push(tempItem);
            });
            
            //上下基准电流设定方式
            langJsonData.program_teach.var_object["weldTraceReferenceTypeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                weldTraceReferenceTypeDataArr.push(tempItem);
            });
            
            //启停状态
            langJsonData.program_teach.var_object["FTControlILCSignData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                FTControlILCSignDataArr.push(tempItem);
            });
            
            //控制启停状态
            langJsonData.program_teach.var_object["FTControlAdjSignData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                FTControlAdjSignDataArr.push(tempItem);
            });
            
            //坐标系名称
            langJsonData.program_teach.var_object["FTReferenceCoordData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                FTReferenceCoordDataArr.push(tempItem);
            });
            
            //力的方向
            langJsonData.program_teach.var_object["FTRotOrnData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                FTRotOrnDataArr.push(tempItem);
            });
            
            //插入方向
            langJsonData.program_teach.var_object["FTRotRotOrnData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                FTRotRotOrnDataArr.push(tempItem);
            });
            
            //移动轴
            langJsonData.peripheral_setting.var_object["wobjAxisData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wobjAxisDataArr.push(tempItem);
            });
            
            //平滑选择
            langJsonData.program_teach.var_object["torqueSmoothTypeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                torqueSmoothTypeDataArr.push(tempItem);
            });
            
            //等待状态
            langJsonData.commandlist["AIcompare"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.num;
                AIcompareArr.push(tempItem);
            });
            
            //读寄存器功能码
            langJsonData.program_teach.var_object["modbusRegReadFunctionCodeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                modbusRegReadFunctionCodeDataArr.push(tempItem);
            });
            
            //写寄存器功能码
            langJsonData.program_teach.var_object["modbusRegWriteFunctionCodeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                modbusRegWriteFunctionCodeDataArr.push(tempItem);
            });
            
            //锁定X轴指向
            langJsonData.program_teach.var_object["lockXPointModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                lockXPointModeDataArr.push(tempItem);
            });
            
            //板材类型
            langJsonData.program_teach.var_object["techPlateType"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                techPlateTypeArr.push(tempItem);
            });
            
            //运动方向
            langJsonData.program_teach.var_object["techMotionDirection"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                techMotionDirectionArr.push(tempItem);
            });
            
            //拐点类型
            langJsonData.program_teach.var_object["infPointType"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                infPointTypeArr.push(tempItem);
            });
            
            //计算方法1
            langJsonData.program_teach.var_object["wireSearchType1MethodData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wireSearchType1MethodDataArr.push(tempItem);
            });
            
            //计算方法2
            langJsonData.program_teach.var_object["wireSearchType2MethodData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wireSearchType2MethodDataArr.push(tempItem);
            });
            
            //输出模式
            langJsonData.program_teach.var_object["outputMoveDOModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                outputMoveDOModeDataArr.push(tempItem);
            });
            
            //IO类型
            langJsonData.commandlist["IOTypeDict"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                IOTypeDictArr.push(tempItem);
            });
            
            //基准位置
            langJsonData.program_teach.var_object["wireRefPosData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wireRefPosDataArr.push(tempItem);
            });

            //返回方式
            langJsonData.program_teach.var_object["wireSearchBackFlagData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wireSearchBackFlagDataArr.push(tempItem);
            });

            //寻位方式
            langJsonData.program_teach.var_object["wireSearchModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                wireSearchModeDataArr.push(tempItem);
            });

            //是否寻位
            langJsonData.commandlist["setTPDMode"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.name;
                setTPDModeArr.push(tempItem);
            });

            //寻位点变量-基准点
            langJsonData.commandlist["wireSearchRefPointData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.name;
                wireSearchRefPointDataArr.push(tempItem);
            });

            //接触点
            langJsonData.commandlist["wireSearchResPointData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.name;
                wireSearchResPointDataArr.push(tempItem);
            });

            //焊缝缓存数据选择
            langJsonData.program_teach.var_object["weldRecordData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                weldRecordDataArr.push(tempItem);
            });

            //板材类型
            langJsonData.program_teach.var_object["TplateType"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                TplateTypeArr.push(tempItem);
            });

            //伺服模式
            langJsonData.program_teach.var_object["servoCModeData"].forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                servoCModeDataArr.push(tempItem);
            });

            //碰撞等级-标准等级
            collisionLevelData.forEach(element => {
                tempItem = [];
                tempItem[0] = element.name;
                tempItem[1] = element.id;
                collisionLevelArr.push(tempItem);
            });

            initBlocks();
            initBlockly();
            /* 自适应 */
            window.addEventListener('resize', onresize, false);
            // 隐藏滚动条背景，解决与代码转译弹出框冲突问题
            $(".blocklyScrollbarVertical").css("display", "none"); 
            $(".blocklyScrollbarHorizontal").css("display", "none"); 
        }
    });

    document.getElementById("graphicalProgramming").addEventListener("resize-workspace", onresize);

};