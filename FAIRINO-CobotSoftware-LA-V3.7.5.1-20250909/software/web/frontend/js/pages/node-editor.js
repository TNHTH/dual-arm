angular.module('frApp')
    .controller('nodeeditorCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$q', 'AppStage', 'Delete', 'Wiring', 'ContextMenu', 'leftPanel', 'SaveAndLoad', 'alertBox', 'VSToLua', 'liveCode', 'variableList', nodeeditorCtrlFn])

function nodeeditorCtrlFn($scope, $modal, dataFactory, toastFactory, $q, AppStage, Delete, Wiring, ContextMenu, leftPanel, SaveAndLoad, alertBox, VSToLua, liveCode, variableList) {
    // 页面显示范围修改
    $scope.quitSetMounting();
    $scope.fullContentView();
    // 初始化
    let nodeDynamicTags;
    nodeDynamicTags = langJsonData.program_teach;
    let dofileDynamicTags = langJsonData.graphical_programming;
    $scope.programCategoryArray = nodeDynamicTags.var_object.program_category_array; //指令名称列表
    $scope.programCommandArray = nodeDynamicTags.var_object.program_command_array; //指令名称列表
    $scope.nodeInputTitles = langJsonData.commandlist.nodeEditorCommands;
    $scope.eaxisCommandTypeData = langJsonData.commandlist.eaxisCommandType;
    $scope.torqueSmoothType = nodeDynamicTags.var_object.torqueSmoothTypeData;
    $scope.offsetFlagData = nodeDynamicTags.var_object.offsetFlagData;
    $scope.treatStrategyData = nodeDynamicTags.var_object.treatStrategyData;
    $scope.offsetTypeData = nodeDynamicTags.var_object.offsetTypeData;
    $scope.offsetFlagLaserData = nodeDynamicTags.var_object.offsetFlagLaserData;
    $scope.servoCModeData = nodeDynamicTags.var_object.servoCModeData;
    $scope.newSplineModeData = nodeDynamicTags.var_object.newSplineModeData;
    $scope.spiralDirectionData = nodeDynamicTags.var_object.spiralDirectionData;
    $scope.nSpiralOffsetFlagData = nodeDynamicTags.var_object.nSpiralOffsetFlagData;
    $scope.nodeTitleList = langJsonData.commandlist.commandName;
    $scope.weldRecordData = nodeDynamicTags.var_object.weldRecordData;
    $scope.TplateType = nodeDynamicTags.var_object.TplateType;
    $scope.trajectoryJMode = langJsonData.commandlist.trajectoryJMode;
    $scope.wireSearchRef_ResPointData = langJsonData.commandlist.wireSearchRef_ResPointData;
    let globalPoint = nodeDynamicTags.info_messages[98];
    let localPoint = nodeDynamicTags.info_messages[99];
    let descriptionData = langJsonData.commandlist.customContent;
    $scope.blockData = langJsonData.commandlist.IOBlockData;
    $scope.setIOModeData = langJsonData.commandlist.setIOMode;
    $scope.whetherData = langJsonData.commandlist.WhetherData;
    $scope.doData = langJsonData.commandlist.DoData;
    $scope.diData = langJsonData.commandlist.DinData;
    $scope.aoPort = langJsonData.commandlist.AOport;
    $scope.aiPort = langJsonData.commandlist.AIport;
    $scope.aiCompare = langJsonData.commandlist.AIcompare;
    $scope.virDinData = langJsonData.commandlist.VirDinData;
    $scope.virAinData = langJsonData.commandlist.VirAinData;
    $scope.whetherMotionData = langJsonData.commandlist.WhetherMotion;
    $scope.connectionData = langJsonData.commandlist.ConnectionData;
    $scope.layerIdData = langJsonData.commandlist.LayerIdData;
    $scope.pauseFunctionData = langJsonData.commandlist.PauseFunction;
    $scope.collideModeData = langJsonData.program_teach.var_object.collideModeData;
    $scope.gripperData = [1,2,3,4,5,6,7,8];
    $scope.ConTrackModeData = nodeDynamicTags.var_object.ConTrackModeData;
    $scope.enableData = nodeDynamicTags.var_object.enableData;
    $scope.polishCommandModeData = langJsonData.commandlist.polishCommandMode;
    $scope.axisMoveData = [
        {
            id: "0",
            name: "PTP"
        },
        {
            id: "1",
            name: "Lin"
        }
    ];
    $scope.axisNumberData = [
        {
            id: "1",
            name: "1"
        },
        {
            id: "2",
            name: "2"
        },
        {
            id: "4",
            name: "3"
        },
        {
            id: "8",
            name: "4"
        }
    ];
    $scope.ZeroModeData = nodeDynamicTags.var_object.ZeroModeData;
    $scope.auxServoCommandIdData = langJsonData.commandlist.auxServoCommandId;
    $scope.auxServoCommandModeData = langJsonData.commandlist.auxServoCommandMode;
    $scope.servoEnableData = nodeDynamicTags.var_object.servoEnableData;
    $scope.FTReferenceCoordData = nodeDynamicTags.var_object.FTReferenceCoordData;
    $scope.FTFindSurfaceDirectionData = nodeDynamicTags.var_object.FTFindSurfaceDirectionData;
    $scope.FTRotOrnData = nodeDynamicTags.var_object.FTRotOrnData;
    $scope.FTControlAdjSignData = nodeDynamicTags.var_object.FTControlAdjSignData;
    $scope.FTControlILCSignData = nodeDynamicTags.var_object.FTControlILCSignData;
    $scope.modbusRegReadFunctionCodeData = nodeDynamicTags.var_object.modbusRegReadFunctionCodeData;
    $scope.modbusRegWriteFunctionCodeData = nodeDynamicTags.var_object.modbusRegWriteFunctionCodeData;
    $scope.robotModeData = nodeDynamicTags.var_object.robotModeData;
    $scope.outputMoveDOModeData = nodeDynamicTags.var_object.outputMoveDOModeData;
    $scope.lockXPointModeData = nodeDynamicTags.var_object.lockXPointModeData;
    $scope.segmentModeData = nodeDynamicTags.var_object.segmentModeData;
    $scope.FTFindSurfaceAxisData = [
        {
            id: "1",
            name: "X",
        },
        {
            id: "2",
            name: "Y",
        },
        {
            id: "3",
            name: "Z",
        }
    ];
    $scope.modbusMasterIDData = [
        {
            id: "0",
            name: "0",
        },
        {
            id: "1",
            name: "1",
        },
        {
            id: "2",
            name: "2",
        },
        {
            id: "3",
            name: "3",
        },
        {
            id: "4",
            name: "4",
        }
    ];
    $scope.modbusMasterTypeData = [
        {
            id: "0",
            name: "U16",
        },
        {
            id: "1",
            name: "U32",
        },
        {
            id: "2",
            name: "F32",
        },
        {
            id: "3",
            name: "F64",
        }
    ]
    $scope.IOTypeDict = langJsonData.commandlist.IOTypeDict;
    $scope.WeldIdData = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]
    $scope.functionModeData = nodeDynamicTags.var_object.functionModeData;
    $scope.weaveModeData = nodeDynamicTags.var_object.weaveModeData;
    $scope.roundingRuleData = nodeDynamicTags.var_object.roundingRuleData;
    $scope.protocolData = nodeDynamicTags.var_object.protocolData;
    $scope.functionTypeData = nodeDynamicTags.var_object.functionTypeData;
    $scope.SerachDistData = langJsonData.commandlist.SerachDistData;
    $scope.weldTraceIsuplowData = nodeDynamicTags.var_object.weldTraceIsuplowData;
    $scope.weldTraceAxisselectData = nodeDynamicTags.var_object.weldTraceAxisselectData;
    $scope.weldTraceReferenceTypeData = nodeDynamicTags.var_object.weldTraceReferenceTypeData;
    $scope.techPlateType = nodeDynamicTags.var_object.techPlateType;
    $scope.techMotionDirection = nodeDynamicTags.var_object.techMotionDirection;
    $scope.infPointType = nodeDynamicTags.var_object.infPointType;
    $scope.wireSearchBackFlagData = nodeDynamicTags.var_object.wireSearchBackFlagData;
    $scope.wireSearchModeData = nodeDynamicTags.var_object.wireSearchModeData;
    $scope.wireRefPosData = nodeDynamicTags.var_object.wireRefPosData;
    $scope.wireSearchRefPointData = langJsonData.commandlist.wireSearchRefPointData;
    $scope.wireSearchResPointData = langJsonData.commandlist.wireSearchResPointData;
    $scope.wireSearchType1MethodData = nodeDynamicTags.var_object.wireSearchType1MethodData;
    $scope.wireSearchType2MethodData = nodeDynamicTags.var_object.wireSearchType2MethodData;
    $scope.wireSearchType3MethodData = [
        {
            id: "6",
            name: "3D(xyz)",
        }
    ];
    $scope.wireSearchType4MethodData = [
        {
            id: "7",
            name: "3D+(xyzrxryrz)",
        }
    ];
    $scope.wireSearchType5MethodData = [
        {
            id: "8",
            name: "3D+(xyzrxryrz)",
        }
    ];
    let importNodeName;  // 导入文件时，节点图编程的程序名称
    let importNodeData;  // 导入文件时，节点图编程的JSON数据
    variableList.variables = [];  // 创建变量后，进入其它页面再次进入时，清除变量列表
    let rsDynamicTags;
    rsDynamicTags = langJsonData.robot_setting;
    $scope.fr5collideGradeData = rsDynamicTags.var_object.fr5collideGradeData;
    $scope.fr3collideGradeData = rsDynamicTags.var_object.fr3collideGradeData;
    $scope.fr10collideGradeData = rsDynamicTags.var_object.fr10collideGradeData;
    //碰撞等级设置变量初始化
    if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
        $scope.collisionLevelData = $scope.fr3collideGradeData;
    } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
        $scope.collisionLevelData = $scope.fr5collideGradeData;
    } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
        $scope.collisionLevelData = $scope.fr10collideGradeData;
    } else {
        $scope.collisionLevelData = $scope.fr10collideGradeData;
    }

    getOptionsData();
    getTpdNameList();
    getTrajectoryFileNameList();
    getWObjCoordData();
    getToolTrsfCoordData();
    getUserFiles();
    getDOcfg();
    getModbusMasterConfig();
    getModbusSlaveAliasConfig();
    getPointTableModeList();
    g_programErr = 0; //清除示教程序Newdofile报错影响图形化编程程序运行
    g_graphicalErr = false; //清除图形化编程Newdofile报错影响图形化编程程序运行

    // var width = window.innerWidth;
    // var height = window.innerHeight;
    let stage = AppStage.getStage(document.getElementById("container").clientWidth, document.getElementById("container").clientHeight, 'container');
    var layer = new Konva.Layer({
        id: 'main_layer'
    });
    let dragLayer = new Konva.Layer({
        id: 'dragLayer',
    });
    stage.add(layer);
    stage.add(dragLayer);
    stage.container().style.backgroundPosition = `${stage.position().x} ${stage.position().y}`;

    // stage.on("wheel", () => {
    //     if (inputIsFocused) {
    //         document.getElementById("number-ip").blur();
    //         document.getElementById("string-ip").blur();
    //         document.getElementById("bool-ip").blur();
    //     }
    // });
    // SelectionBox.setSelectionBox(layer, stage);
    Delete.enableDelete(stage, layer);
    // DragAndDrop.DragAndDrop(stage, layer);
    Wiring.enableWiring(stage, layer);
    ContextMenu.contextMenu(stage, layer);
    let panel = new leftPanel();
    liveCode.initLiveCode();
    // layer.toggleHitCanvas();
    // document.getElementById("number-ip").value = 12;
    // layer.draw();
    stage.draw();
    // document.getElementById("Run").addEventListener("click", (e) => {
    //     try {
    //         let script = new VSToLua(stage, layer, "Run").script;
    //         // let script = new VSToLua(stage, layer, "live-code-refresh").script;
    //         liveCode.refresh(script);
    //     }
    //     catch (err) {

    //     }
    // });
    // stage.on('mouseup', () => {
    //     console.log("x");
    // })

    new SaveAndLoad.Save(stage, layer, stage.findOne('#wireLayer'));

    /*打开导入节点图编程弹出框*/
    $scope.openImportMenu = function() {
        let uploadFile = document.getElementById("upload-json");
        uploadFile.value = '';
        uploadFile.outerHTML = uploadFile.outerHTML;
        importNodeData = null;
        importNodeName = null;
        $('#importNodeGraphModal').modal();
    }

    /*上传节点图编程文件数据*/
    $scope.uploadNodeGraphFile = function() {
        let file = document.getElementById("upload-json").files;
        if (file.length == 0) {
            toastFactory.info(nodeDynamicTags.info_messages[206]);
        } else {
            let fileName = file[0].name.split('.json')[0];
            importNodeName = fileName;
            try {
                let fr = new FileReader();
                fr.onload = function (e) {
                    let script = e.target.result;
                    importNodeData = JSON.parse(script).node_data;
                    $('#importNodeGraphModal').modal('hide');
                    checkLuaSameName(fileName);
                }
                fr.readAsText(file.item(0));
            }
            catch (err) {}
        }
    }

    /*刷新代码编译 */
    $scope.liveCodeRefresh = function() {
        let script = new VSToLua(stage, layer, "live-code-refresh").script;
        liveCode.refresh(script);
        showConsoleWindow();
    }

    /*代码转移时，展示提示语在console-window */
    function showConsoleWindow() {
        g_nodeLuaError = new VSToLua(stage, layer, "live-code-refresh").nodeLuaError;
        g_nodeLuaErrorType = new VSToLua(stage, layer, "live-code-refresh").nodeLuaErrorType;
        g_nodeLuaErrorString = new VSToLua(stage, layer, "live-code-refresh").nodeLuaErrorString;
        if (g_nodeLuaError) {
            document.getElementById("console-window").classList.toggle("hidden", false);
            let codeDoc = document.getElementById("console").contentWindow.document;
                codeDoc.open();
                codeDoc.writeln(
                    `<!DOCTYPE html>\n
                    <style>
                        html{
                            color: white;
                            margin: 20;
                        }
                    </style>
                    <body>
                    <code>
                    ${g_nodeLuaErrorType}-${g_nodeLuaErrorString}
                    </code>
                    </body>
                    </html>
                    `
                );
                codeDoc.close();
        } else {
            document.getElementById("console-window").classList.toggle("hidden", true);
        }
    }

    document.onkeydown = (e) => {
        // e.preventDefault();
        if (e.code == 'KeyQ' && e.ctrlKey) {
            let script = new VSToLua(stage, layer, "live-code-refresh").script;
            liveCode.refresh(script);
        }
    }

    /*展开/隐藏代码编译 */
    $scope.livaCodeArrow = function() {
        document.getElementById("live-code-container").classList.toggle("live-code-closed");
        document.getElementById("live-code-arrow").classList.toggle("live-code-arrow-clicked");
    }
    
    /*打开代码编译 */
    $scope.openCode = function() {
        document.getElementById("live-code-container").classList.toggle("live-code-closed");
        $scope.liveCodeRefresh();
        document.getElementById("live-code-arrow").classList.toggle("live-code-arrow-clicked");
    }

    /*关闭代码编译的console */
    $scope.colseConsole = function() {
        document.getElementById("console-window").classList.toggle("hidden", true);
    }

    /*重载节点图工作区 */
    $scope.reloadNodeGraphContent = function() {
        SaveAndLoad.prompLastSave(stage, layer, stage.findOne('#wireLayer'));
    }

    /*刷新节点图工作区 */
    $scope.refreshNodeGraphContent = function() {
        $('#refreshNodeGraphModal').modal();
    }

    /*初始节点图工作区 */
    $scope.starterNodeGraphContent = function() {
        $('#initialNodeGraphModal').modal();
    }

    /**
     * 刷新或初始节点图工作区
     * @param {string} type refresh:刷新；initial:初始；
     */
    $scope.refreshOrStart = function(type) {
        $scope.nodeEditorFileName = '';
        $('#nodeEditorFileName').val('');
        liveCode.refresh('');
        switch (type) {
            case 'refresh':
                $('#refreshNodeGraphModal').modal('hide');
                SaveAndLoad.refresh(stage.findOne("#main_layer"), stage.findOne("#wireLayer"));
                break;
            case 'initial':
                $('#initialNodeGraphModal').modal('hide');
                alertBox.vscriptOnLoad(stage);
                break;
            default:
                break;
        }
    }

    /*关闭导入弹出框 */
    $scope.closeUploadMenu = function() {
        // document.getElementById("import-menu").classList.toggle("hidden", true);
    }

    /**处理节点图编程内容为lua程序保存所需要的字符串 */
    function handleNodeString(nodeString) {
        let scriptBegin = "-- Generated Lua Code Space Begins --";
        let scriptEnd = "-- Generated Lua Code Space Ends --";
        let commandsString = nodeString.trim().substring(nodeString.indexOf(scriptBegin) + scriptBegin.length, nodeString.indexOf(scriptEnd));
        return commandsString.trim();
    }

    /**
     * 打开所有节点图编程文件名称的弹出框,优先获取所有节点图编程文件名称
     * @param {string} type 'save':保存时打开弹出框；'export':导出时打开导出弹出框
     */
    $scope.getNodeGraphNameList = function(type) {
        let getNodeGraphListCmd = {
            cmd: "get_node_graph_names",
        }
        dataFactory.getData(getNodeGraphListCmd).then((data) => {
            $scope.nodeGraphNameList = JSON.parse(JSON.stringify(data));
            $scope.nodeEditorFileName = $('#nodeEditorFileName').val();
            switch (type) {
                case 'save':
                    $('#loadNodeGraphModal').modal();
                    break;
                case 'export':
                    $scope.selectedExportNodeGraphName = null;
                    $('#exportNodeGraphModal').modal();
                    break;
                default:
                    break;
            }
            g_programErrorFlag = 0;
        }, (status) => {
            toastFactory.error(status, nodeDynamicTags.error_messages[39]);
            /* test */
            if (g_testCode) {
                $scope.nodeGraphNameList = ['program1.json', 'program2.json', 'program3.json'];
                $scope.nodeEditorFileName = $('#nodeEditorFileName').val();
                switch (type) {
                    case 'save':
                        $('#loadNodeGraphModal').modal();
                        break;
                    case 'export':
                        $('#exportNodeGraphModal').modal();
                        break;
                    default:
                        break;
                }
            }
            /* ./test */
        });
    }

    /**获取当前选中节点图内容 */
    $scope.getNodeGraphContent = function() {
        if ($scope.controlMode != 1) {
            toastFactory.warning(nodeDynamicTags.warning_messages[0]);
            return;
        }
        let getNodeGraphCmd = {
            cmd: "get_node_graph",
            data: {
                node_name: $scope.selectedNodeGraphName
            }
        };
        dataFactory.getData(getNodeGraphCmd).then((data) => {
            liveCode.refresh('');
            g_isGetNodeGraph = true;
            $scope.nodeEditorFileName = $scope.selectedNodeGraphName.split('.json')[0];
            g_fileNameForUpload = $scope.nodeEditorFileName + ".lua";
            new SaveAndLoad.Import(stage, layer, stage.findOne('#wireLayer'), data.node_data);
            let nodeData = new VSToLua(stage, layer, "live-code-refresh").script;
            g_fileDataForUpload = handleNodeString(nodeData);
            $('#loadNodeGraphModal').modal('hide');
        }, (status) => {
            liveCode.refresh('');
            g_isGetNodeGraph = true;
            $('#loadNodeGraphModal').modal('hide');
            toastFactory.error(status, nodeDynamicTags.error_messages[41]);
        });
    }

    /**获取节点图编程的初始内容对象 */
    function getNodeGraphObject() {
        let exportScript = {};
        let nodesData = [];
        let wireData = [];
        layer.find('.aProgramNodeGroup').forEach((node, index) => {
            if (node.name() == 'aProgramNodeGroup') {
                let nodeData = {
                    position: node.position(),
                    nodeDescription: node.customClass.nodeDescription,
                };
                nodesData.push(nodeData);
            }
        });
        stage.findOne('#wireLayer').find('.isConnection').forEach((aWire, index) => {
            if (aWire.name() == 'isConnection') {
                let wireD = {
                    srcId: aWire.attrs.src.id(),
                    destId: aWire.attrs.dest.id(),
                }
                wireData.push(wireD);
            }
        })
        exportScript = {
            variables: variableList.variables,
            nodesData: nodesData,
            wireData: wireData,
        }
        return JSON.stringify(exportScript);
    }

    /**点击保存按钮 */
    $scope.saveNodeGraphContent = function() {
        importNodeName = null;
        importNodeData = null;
        saveCommands();
    }

    let saveNodeFlag;
    document.getElementById('nodeEditor').addEventListener('saveWaitMultiDI', e => {
        if (e.detail) {
            saveNodeFlag = 1;
        } else {
            saveNodeFlag = 0;
        }
    })

    /**保存验证 */
    function saveCommands() {
        if ($('#nodeEditorFileName').val()) {
            $scope.nodeEditorFileName = $('#nodeEditorFileName').val();
        }
        if (!$scope.nodeEditorFileName) {
            toastFactory.info(nodeDynamicTags.info_messages[3]);
            return;
        }
        let script = new VSToLua(stage, layer, "live-code-refresh").script;
        $scope.newCommandsData = handleNodeString(script);
        g_nodeLuaError = new VSToLua(stage, layer, "live-code-refresh").nodeLuaError;
        g_nodeLuaErrorType = new VSToLua(stage, layer, "live-code-refresh").nodeLuaErrorType;
        g_nodeLuaErrorString = new VSToLua(stage, layer, "live-code-refresh").nodeLuaErrorString;
        if (g_nodeLuaError) {
            toastFactory.info(`${g_nodeLuaErrorType}--${g_nodeLuaErrorString}`);
            return;   
        }
        if (!$scope.newCommandsData) {
            toastFactory.info(nodeDynamicTags.info_messages[111]);
            return;
        }
        if ($scope.newCommandsData.indexOf('SprayStart()') != -1 || $scope.newCommandsData.indexOf('SprayStop()') != -1) {
            if (checkspray() != 1) {
                toastFactory.info(nodeDynamicTags.info_messages[50]);
                return;
            }
        }
        if ($scope.newCommandsData.indexOf('PowerCleanStart()') != -1 || $scope.newCommandsData.indexOf('PowerCleanStop()') != -1) {
            if (checkclean() != 1) {
                toastFactory.info(nodeDynamicTags.info_messages[51]);
                return;
            }
        }
        if ($scope.newCommandsData.indexOf('PostureAdjustOn') != -1) {
            if (!($scope.pointsData.hasOwnProperty("PosA") && $scope.pointsData.hasOwnProperty("PosB") && $scope.pointsData.hasOwnProperty("PosC"))) {
                toastFactory.info(nodeDynamicTags.info_messages[85]);
                return;
            }
        }
        if (saveNodeFlag) {
            toastFactory.warning(langJsonData.graphical_programming.warning_messages[0]);
            return;
        }
        checkLuaSameName($scope.nodeEditorFileName);
    };

    /**保存节点图编程时校验是否同名 */
    function checkLuaSameName(luaName) {
        let nowNodeName = luaName + '.json';
        let checkCmd = {
            cmd: "check_lua_file",
            data: {
                name: luaName + '.lua',
                type: '3'
            },
        };
        dataFactory.getData(checkCmd).then((data) => {
            switch (data.same_name) {
                case '0':
                    $scope.saveNodeEditor();
                    break;
                case '1':
                    toastFactory.warning(nodeDynamicTags.warning_messages[17] + nodeDynamicTags.warning_messages[16]);
                    break;
                case '2':
                    toastFactory.warning(nodeDynamicTags.warning_messages[14] + nodeDynamicTags.warning_messages[16]);
                    break;
                case '3':
                    if ($scope.selectedNodeGraphName == undefined || $scope.selectedNodeGraphName == null || $scope.selectedNodeGraphName == '') {
                        $("#confirmNodeFilenameModal").modal();
                        //程序保存前覆盖验证,阻止程序运行
                        g_programErrorFlag = 1;
                    } else {
                        if ($scope.selectedNodeGraphName != nowNodeName) {
                            $("#confirmNodeFilenameModal").modal();
                            g_programErrorFlag = 1;
                        } else {
                            $scope.saveNodeEditor();
                        }
                    }
                    break;
                default:
                    break;
            }
        }, (status) => {
            toastFactory.error(status, nodeDynamicTags.error_messages[42]);
        });
    }

    /**保存节点图编程JSON对象 */
    $scope.saveNodeGraphObject = function() {
        let saveCmd = {
            cmd: "save_node_graph",
            data: {
                node_name: $scope.nodeEditorFileName + '.json',
                node_code: $scope.newCommandsData,
                node_data: getNodeGraphObject(),
            },
        };
        dataFactory.actData(saveCmd).then(() => {
            toastFactory.success(nodeDynamicTags.success_messages[0] + $scope.nodeEditorFileName + '.json');
        }, (status) => {
            toastFactory.error(status, nodeDynamicTags.error_messages[40]);
        });
    }

    /**覆盖保存 */
    $scope.saveNodeEditor = function() {
        // 导入文件时的数据保存
        if (importNodeData) {
            $scope.nodeEditorFileName = importNodeName;
            new SaveAndLoad.Import(stage, layer, stage.findOne('#wireLayer'), importNodeData);
            let script = new VSToLua(stage, layer, "live-code-refresh").script;
            $scope.newCommandsData = handleNodeString(script);
        }
        handleDofileArr(createCommandsArray($scope.newCommandsData));
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: $scope.nodeEditorFileName + '.lua',
                pgvalue: $scope.newCommandsData,
                type: '3'
            },
        };
        dataFactory.actData(saveCmd).then(() => {
            importNodeName = null;
            importNodeData = null;
            g_fileNameForUpload = $scope.nodeEditorFileName + ".lua";
            g_fileDataForUpload = $scope.newCommandsData;
            $scope.selectedNodeGraphName = $scope.nodeEditorFileName + ".json";//保存文件后同名覆盖不再校验
            $scope.liveCodeRefresh();
            $scope.saveNodeGraphObject();
            getUserFiles();
            g_programErrorFlag = 0;
        }, (status) => {
            importNodeName = null;
            importNodeData = null;
            toastFactory.error(status, nodeDynamicTags.error_messages[6]);
        });
        $("#confirmNodeFilenameModal").modal('hide');
    }

    /*取消覆盖保存 */
    $scope.cancelNodeEditor = function() {
        importNodeName = null;
        importNodeData = null;
        g_programErrorFlag = 0;
    }

    /*打开导出节点图编程 */
    $scope.exportNodeGraph = function() {
        $('#exportNodeGraphModal').modal('hide');
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/node_graph/" + $scope.selectedExportNodeGraphName;
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/node_graph/" + $scope.selectedExportNodeGraphName;
        }
    }

    /*清除文件名和代码转译区域 */
    $scope.refreshNodeFileName = function() {
        $scope.nodeEditorFileName = '';
        $('#nodeEditorFileName').val('');
        liveCode.refresh('');
    }

    $scope.isDeleteNode = false;
    /*删除节点图编程文件 */
    $scope.deleteNodeGraphFile = function() {
        if ($scope.selectedNodeGraphName) {
            const deleteName = $scope.selectedNodeGraphName.split('.json')[0];
            if (!$scope.isDeleteNode) {
                toastFactory.info(nodeDynamicTags.info_messages[7]);
                $scope.isDeleteNode = true;
                return;
            }
            let deleteCmd = {
                cmd: "remove_lua_file",
                data: {
                    name: [deleteName + '.lua'],
                    type: '3'
                }
            };
            dataFactory.actData(deleteCmd).then(() => {
                $('#loadNodeGraphModal').modal('hide');
                $scope.selectedNodeGraphName = null;
                $scope.isDeleteNode = false;
                // 删除成功后重新获取程序文件
                getUserFiles();
                // 删除文件与当前打开文件相同时，需要清除运行的相关信息和节点图编程工作区内容
                if ($scope.nodeEditorFileName && deleteName == $scope.nodeEditorFileName) {
                    g_fileNameForUpload = "";
                    g_fileDataForUpload = "";
                    $scope.refreshNodeFileName();
                    SaveAndLoad.refresh(stage.findOne("#main_layer"), stage.findOne("#wireLayer"));
                }
                toastFactory.success(nodeDynamicTags.success_messages[2]);
            }, (status) => {
                $('#loadNodeGraphModal').modal('hide');
                $scope.selectedNodeGraphName = null;
                $scope.isDeleteNode = false;
                toastFactory.error(status, nodeDynamicTags.error_messages[8]);
            });
        } else {
            toastFactory.info(nodeDynamicTags.info_messages[212]);
        }
    }

    /*关闭加载节点图编程弹窗 */
    $scope.cancelNodeGraphModal = function() {
        $scope.selectedNodeGraphName = null;
        $scope.isDeleteNode = false;
    }

    /**获取示教点位 */
    function getOptionsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.pointsData = data;
                for (const key in $scope.pointsData) {
                    $scope.pointsData[key]['type'] = globalPoint;
                }
                $scope.tempPointsData = JSON.parse(JSON.stringify($scope.pointsData));
                if ($scope.editMode_FileName) {
                    const getParams = {
                        cmd: 'get_local_points',
                        data: {
                            local: $scope.editMode_FileName
                        }
                    }
                    dataFactory.getData(getParams).then((data) => {
                        $scope.templocalPointData = data;
                        for (const key in $scope.templocalPointData) {
                            $scope.templocalPointData[key]['type'] = localPoint;
                        }
                        for (const itemKey in $scope.pointsData) {
                            for (const elementKey in $scope.templocalPointData) {
                                if (itemKey == elementKey) {
                                    delete($scope.pointsData[itemKey])
                                }
                            }
                        }
                        $scope.pointsData = Object.assign($scope.templocalPointData, $scope.pointsData);
                        $scope.pointsSeamData = { seamPos: $scope.pointsData.seamPos};
                    }, (status) => {
                        toastFactory.error(status, nodeDynamicTags.error_messages[33]);
                    });
                }
            }, (status) => {
                toastFactory.error(status, nodeDynamicTags.error_messages[2]);
            });
    };

    /**获取系统内轨迹（TPD）文件名称列表 */
    function getTpdNameList() {
        let getTrajFileNameListCmd = {
            cmd: "get_tpd_name",
        }
        dataFactory.getData(getTrajFileNameListCmd)
            .then((data) => {
                $scope.tpdList = data;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**获取系统内轨迹（traj、trajJ）文件名称列表 */
    function getTrajectoryFileNameList() {
        let getTrajFileNameListCmd = {
            cmd: "get_traj_files",
        }
        dataFactory.getData(getTrajFileNameListCmd)
            .then((data) => {
                $scope.trajFileNameList = data;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**获取工件坐标系数据 */
    function getWObjCoordData() {
        $scope.wobjToolCoordData = [];
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.WObjCoordeData = JSON.parse(JSON.stringify(data));
                const wobjCoordeKeys = Object.keys($scope.WObjCoordeData);
                wobjCoordeKeys.forEach(item => {
                    $scope.wobjToolCoordData.push($scope.WObjCoordeData[item]);
                });
                g_nodeWobjToolCoorde = $scope.wobjToolCoordData;
            }, (status) => {
                toastFactory.error(status, nodeDynamicTags.error_messages[45]);
            });
    };

    /**获取工具坐标系数据 */
    function getToolTrsfCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                g_nodeToolCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                $scope.toolTrsfCoordeData = JSON.parse(JSON.stringify(data));
                $scope.toolCoordData = JSON.parse(JSON.stringify(data));
                getExToolCoordData();
                $scope.SensorToolCoord = JSON.parse(JSON.stringify(data)).filter(item => item.type == 1);
                getOptionsData();
            }, (status) => {
                toastFactory.error(status, nodeDynamicTags.error_messages[4]);
            });
    };

    /** 获取外部工具坐标系数据*/
    function getExToolCoordData() {
        const exToolCoordeArr = [];
        let getCmd = {
            cmd: "get_ex_tool_cdsystem",
        };
        dataFactory.getData(getCmd).then((data) => {
            const exToolCoordeData = JSON.parse(JSON.stringify(data));
            const exToolCoordeKeys = Object.keys(exToolCoordeData);
            exToolCoordeKeys.forEach(item => {
                exToolCoordeData[item].id = exToolCoordeData[item].id + g_nodeToolCoordeTotal;
                exToolCoordeArr.push(exToolCoordeData[item]);
            });
            $scope.toolTrsfCoordeData = $scope.toolTrsfCoordeData.concat(exToolCoordeArr);
            $scope.toolCoordData = $scope.toolCoordData.concat(exToolCoordeArr);
            g_nodeToolCoorde = $scope.toolCoordData;
        }, (status) => {
            toastFactory.error(status, nodeDynamicTags.error_messages[44]);
        });
    };

    /**获取dofile子程序 */
    function getUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '3'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.programData = JSON.parse(JSON.stringify(data));
                let array = Object.keys(data);
                if (array.length != 0) {
                    $scope.dofileData = array;
                } else {
                    $scope.dofileData = descriptionData[33].name.split(' ');
                }
            }, (status) => {
                toastFactory.error(status);
            });
    };

    //检查是否配置喷涂DO
    function checkspray() {
        for (let i = 0; i < 8; i++) {
            if (3 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }

    //检查是否配置清枪DO
    function checkclean() {
        for (let i = 0; i < 8; i++) {
            if (4 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }

    //读取DO配置文件
    $scope.DOcfgArr = [];
    function getDOcfg() {
        $scope.DOcfgArr = [];
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd).then((data) => {
            $scope.DOcfgArr[0] = ~~data.ctl_do8_config;
            $scope.DOcfgArr[1] = ~~data.ctl_do9_config;
            $scope.DOcfgArr[2] = ~~data.ctl_do10_config;
            $scope.DOcfgArr[3] = ~~data.ctl_do11_config;
            $scope.DOcfgArr[4] = ~~data.ctl_do12_config;
            $scope.DOcfgArr[5] = ~~data.ctl_do13_config;
            $scope.DOcfgArr[6] = ~~data.ctl_do14_config;
            $scope.DOcfgArr[7] = ~~data.ctl_do15_config;
        }, (status) => {
            toastFactory.error(status, nodeDynamicTags.error_messages[16]);
        });
    }

    // 当前NewDofile是第几个
    var nodeEditorOrder;

    /**
     * 处理程序中第一层NewDofile语句
     * @param {array} programArr 第一层NewDofile命令内容
     */
    function handleDofileArr(programArr) {
        nodeEditorOrder = 0;
        g_nodeEditorErr = false;//每次先置为0，程序无误
        g_nodeEditorErrString = "";//每次先置为空，无报错信息
        $scope.finallyGraNewDofileArr = new Array();
        $scope.finallyGraNewDofileArr_index = 0;
        let mainProgramLength = programArr.length;
        for(let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult != -1 && handleresult != -2) {
                var NewDofileName = handleresult[0];
                let fileElement = $scope.programData[NewDofileName];
                var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                let tempLen = singleLine_NewDofile_Arr.length;
                if (tempLen === 0) {
                    nodeEditorOrder++;
                    g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + nodeEditorOrder + dofileDynamicTags.warning_messages[2] + dofileDynamicTags.warning_messages[7];
                    g_nodeEditorErr = true;
                } else {
                    nodeEditorOrder++;
                    if (handleresult[1] != 1) {
                        g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + nodeEditorOrder + dofileDynamicTags.warning_messages[4];
                        g_nodeEditorErr = true;
                    } else {
                        var checkidreturn = checkNewDofileID(handleresult);
                        if (checkidreturn != -1 && $scope.finallyGraNewDofileArr_index != 0) {
                            g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + nodeEditorOrder + + dofileDynamicTags.warning_messages[2] + dofileDynamicTags.warning_messages[6];
                            g_nodeEditorErr = true;
                        } else {
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index] = new Array();
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][0] = handleresult[0];
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][1] = handleresult[1];
                            $scope.finallyGraNewDofileArr[$scope.finallyGraNewDofileArr_index][2] = handleresult[2];
                            $scope.finallyGraNewDofileArr_index = $scope.finallyGraNewDofileArr_index + 1;
                            handleDofileArr_second(singleLine_NewDofile_Arr, fileElement, nodeEditorOrder);
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
                    g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + n + dofileDynamicTags.warning_messages[8] + (m + 1) + dofileDynamicTags.warning_messages[10];
                    g_nodeEditorErr = true;
                } else {
                    let fileElement = $scope.programData[NewDofileName];
                    var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                    let tempLen = singleLine_NewDofile_Arr.length;
                    if (tempLen === 0) {
                        g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + n + dofileDynamicTags.warning_messages[8] + (m + 1) + dofileDynamicTags.warning_messages[3] + dofileDynamicTags.warning_messages[7];
                        g_nodeEditorErr = true;
                    } else {
                        if (handleresult[1] != 2) {
                            g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + n + dofileDynamicTags.warning_messages[8] + (m + 1) + dofileDynamicTags.warning_messages[5];
                            g_nodeEditorErr = true;
                        } else {
                            var checkidreturn = checkNewDofileID(handleresult);
                            if (checkidreturn != -1 && $scope.finallyGraNewDofileArr_index != 0) {
                                g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + n + dofileDynamicTags.warning_messages[8] + (m + 1) + dofileDynamicTags.warning_messages[3] + dofileDynamicTags.warning_messages[6];
                                g_nodeEditorErr = true;
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
                g_nodeEditorErrString = dofileDynamicTags.warning_messages[1] + j + dofileDynamicTags.warning_messages[8] + k + dofileDynamicTags.warning_messages[9];
                g_nodeEditorErr = true;
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

    /**获取主站配置 */
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
            });
    }

    document.getElementById('nodeEditor').addEventListener('886', e => {
        $scope.modbusMasterConfigData = JSON.parse(e.detail);
        getModbusMasterAddressConfig();
    })

    /**获取主站寄存器配置 */
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
            });
    }

    document.getElementById('nodeEditor').addEventListener('889', e => {
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
    })

    /**获取从站寄存器别名 */
    function getModbusSlaveAliasConfig() {
        let getModbusSlaveAliasCmd = {
            cmd: "get_modbusslave_IO_alias_cfg"
        }
        dataFactory.getData(getModbusSlaveAliasCmd)
            .then((data) => {
                $scope.modbusSlaveIOAliasData = data;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 获取点位表列表*/
    function getPointTableModeList() {
        let getPointTableListCmd = {
            cmd: "get_point_table_list"
        };
        dataFactory.getData(getPointTableListCmd)
            .then((data) => {
                $scope.pointTableModeList = JSON.parse(JSON.stringify(data));
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.pointTableModeList = ["point_table_1.db","point_table_2.db","point_table_3.db"];
                }
                /* ./test */
            });
    }

    /*防止节点图编程工作区的触摸移动事件冒泡 */
    $('#nodeEditor').on('touchmove', function(e) {
        e.preventDefault();
    });
}