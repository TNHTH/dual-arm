frapp.factory('VSToLua', ['variableList', 'alertBox', 'BuilInFunctions', 'toastFactory', function (variableList, alertBox, BuilInFunctions, toastFactory) {
    var VSToLua = class {

        constructor(stage, layer, isRunOrCode) {
            this.waitMultiDIOptionArr = [];
            this.script = '';
            this.nodeLuaError = false;
            this.nodeLuaErrorType = '';
            this.nodeLuaErrorString = '';
            this.builtin_functions = {};
            this.nodeCount = 0;
            this.isRunOrCode = isRunOrCode;
            this.nodeDynamicTags = langJsonData.program_teach;
            this.programCommandArray = this.nodeDynamicTags.var_object.program_command_array; //指令名称列表
            this.nodeInputTitles = langJsonData.commandlist.nodeEditorCommands;
            this.weldRecordData = this.nodeDynamicTags.var_object.weldRecordData;
            this.TplateType = this.nodeDynamicTags.var_object.TplateType;
            this.offsetFlagData = this.nodeDynamicTags.var_object.offsetFlagData;
            this.treatStrategyData = this.nodeDynamicTags.var_object.treatStrategyData;
            this.offsetTypeData = this.nodeDynamicTags.var_object.offsetTypeData;
            this.offsetFlagLaserData = this.nodeDynamicTags.var_object.offsetFlagLaserData;
            this.servoCModeData = this.nodeDynamicTags.var_object.servoCModeData;
            this.newSplineModeData = this.nodeDynamicTags.var_object.newSplineModeData;
            this.spiralDirectionData = this.nodeDynamicTags.var_object.spiralDirectionData;
            this.nSpiralOffsetFlagData = this.nodeDynamicTags.var_object.nSpiralOffsetFlagData;
            this.outputMoveDOModeData = this.nodeDynamicTags.var_object.outputMoveDOModeData;
            this.lockXPointModeData = this.nodeDynamicTags.var_object.lockXPointModeData;
            this.nodeTitleList = langJsonData.commandlist.commandName;
            this.selectDofileFlagData = langJsonData.peripheral_setting;
            this.trajectoryJMode = langJsonData.commandlist.trajectoryJMode;
            this.blockData = langJsonData.commandlist.IOBlockData;
            this.setIOModeData = langJsonData.commandlist.setIOMode;
            this.whetherData = langJsonData.commandlist.WhetherData;
            this.doData = langJsonData.commandlist.DoData;
            this.diData = langJsonData.commandlist.DinData;
            this.aoPort = langJsonData.commandlist.AOport;
            this.aiPort = langJsonData.commandlist.AIport;
            this.setTPDMode = langJsonData.commandlist.setTPDMode;
            this.aiCompare = langJsonData.commandlist.AIcompare;
            this.virDinData = langJsonData.commandlist.VirDinData;
            this.virAinData = langJsonData.commandlist.VirAinData;
            this.toolCoordData = g_nodeToolCoorde;
            this.nodeToolCoordeTotal = g_nodeToolCoordeTotal;
            this.wobjToolCoordData = g_nodeWobjToolCoorde;
            this.whetherMotionData = langJsonData.commandlist.WhetherMotion;
            this.connectionData = langJsonData.commandlist.ConnectionData;
            this.layerIdData = langJsonData.commandlist.LayerIdData;
            this.pauseFunctionData = langJsonData.commandlist.PauseFunction;
            this.collideModeData = langJsonData.program_teach.var_object.collideModeData;
            this.ConTrackModeData = this.nodeDynamicTags.var_object.ConTrackModeData;
            this.enableData = this.nodeDynamicTags.var_object.enableData;
            this.polishCommandModeData = langJsonData.commandlist.polishCommandMode;
            this.axisMoveData = [
                {
                    id: "0",
                    name: "PTP"
                },
                {
                    id: "1",
                    name: "Lin"
                }
            ];
            this.axisNumberData = [
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
            this.ZeroModeData = this.nodeDynamicTags.var_object.ZeroModeData;
            this.auxServoCommandModeData = langJsonData.commandlist.auxServoCommandMode;
            this.servoEnableData = this.nodeDynamicTags.var_object.servoEnableData;
            this.torqueSmoothType = this.nodeDynamicTags.var_object.torqueSmoothTypeData
            this.FTReferenceCoordData = this.nodeDynamicTags.var_object.FTReferenceCoordData;
            this.FTFindSurfaceDirectionData = this.nodeDynamicTags.var_object.FTFindSurfaceDirectionData;
            this.FTRotOrnData = this.nodeDynamicTags.var_object.FTRotOrnData;
            this.FTControlAdjSignData = this.nodeDynamicTags.var_object.FTControlAdjSignData;
            this.FTControlILCSignData = this.nodeDynamicTags.var_object.FTControlILCSignData;
            this.modbusRegReadFunctionCodeData = this.nodeDynamicTags.var_object.modbusRegReadFunctionCodeData;
            this.modbusRegWriteFunctionCodeData = this.nodeDynamicTags.var_object.modbusRegWriteFunctionCodeData;
            this.robotModeData = this.nodeDynamicTags.var_object.robotModeData;
            this.FTFindSurfaceAxisData = [
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
	        this.modbusMasterIDData = [
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
            this.modbusMasterTypeData = [
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
            this.IOTypeDict = langJsonData.commandlist.IOTypeDict;
            this.segmentModeData = this.nodeDynamicTags.var_object.segmentModeData;
            this.functionModeData = this.nodeDynamicTags.var_object.functionModeData;
            this.weaveModeData = this.nodeDynamicTags.var_object.weaveModeData;
            this.roundingRuleData = this.nodeDynamicTags.var_object.roundingRuleData;
            this.protocolData = this.nodeDynamicTags.var_object.protocolData;
            this.functionTypeData = this.nodeDynamicTags.var_object.functionTypeData;
            this.SerachDistData = langJsonData.commandlist.SerachDistData;
            this.weldTraceIsuplowData = this.nodeDynamicTags.var_object.weldTraceIsuplowData;
            this.weldTraceAxisselectData = this.nodeDynamicTags.var_object.weldTraceAxisselectData;
            this.weldTraceReferenceTypeData = this.nodeDynamicTags.var_object.weldTraceReferenceTypeData;
            this.techPlateType = this.nodeDynamicTags.var_object.techPlateType;
            this.techMotionDirection = this.nodeDynamicTags.var_object.techMotionDirection;
            this.infPointType = this.nodeDynamicTags.var_object.infPointType;
            this.wireSearchBackFlagData = this.nodeDynamicTags.var_object.wireSearchBackFlagData;
            this.wireSearchModeData = this.nodeDynamicTags.var_object.wireSearchModeData;
            this.wireRefPosData = this.nodeDynamicTags.var_object.wireRefPosData;
            this.wireSearchRefPointData = langJsonData.commandlist.wireSearchRefPointData;
            this.wireSearchResPointData = langJsonData.commandlist.wireSearchResPointData;
            this.wireSearchType1MethodData = this.nodeDynamicTags.var_object.wireSearchType1MethodData;
            this.wireSearchType2MethodData = this.nodeDynamicTags.var_object.wireSearchType2MethodData;
            this.wireSearchType3MethodData = [
                {
                    id: "6",
                    name: "3D(xyz)",
                }
            ];
            this.wireSearchType4MethodData = [
                {
                    id: "7",
                    name: "3D+(xyzrxryrz)",
                }
            ];
            this.wireSearchType5MethodData = [
                {
                    id: "8",
                    name: "3D+(xyzrxryrz)",
                }
            ];
            this.rsDynamicTags = langJsonData.robot_setting;
            this.fr5collideGradeData = this.rsDynamicTags.var_object.fr5collideGradeData;
            this.fr3collideGradeData = this.rsDynamicTags.var_object.fr3collideGradeData;
            this.fr10collideGradeData = this.rsDynamicTags.var_object.fr10collideGradeData;
            this.collisionLevelData = [];
            if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
                this.collisionLevelData = this.fr3collideGradeData;
            } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
                this.collisionLevelData = this.fr5collideGradeData;
            } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
                this.collisionLevelData = this.fr10collideGradeData;
            } else {
                this.collisionLevelData = this.fr10collideGradeData;
            }
	    
            for (let variable of variableList.variables) {
                // console.log(variable);
                this.script += `${variable.name} = ${variable.value}\n`;
            }
            let begin = this.getBegin(stage);
            if (begin) {
                try {
                    this.coreAlgorithm(begin);
                    if (this.isRunOrCode == "Run") {
                        // document.getElementById("console-window").classList.toggle("hidden", false);
                        // let codeDoc = document.getElementById("console").contentWindow.document;
                        // console.log("run");
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
                        <p id="myLog"></p>
                        </body>
                        <script>
                        window.parent = null;
                        window.top = null;
                        window.console = {
                            log: function(str){
                              var node = document.createElement("div");
                              node.appendChild(document.createTextNode(JSON.stringify(str)));
                              document.getElementById("myLog").appendChild(node);
                            }
                          }
                        try{
                        ${this.script}
                        }
                        catch(err){
                            console.log("Error");
                            console.log(\`\${err}\`);
                        }
                        </script>
                        </html>
                        `
                        );
                        codeDoc.close();
                    }
                }
                catch (err) {
                    // document.getElementById("console-window").classList.toggle("hidden", false);
                    // let codeDoc = document.getElementById("console").contentWindow.document;
                    // this.script = '';
                    // this.builtin_functions = {};
                    // codeDoc.open();
                    // codeDoc.writeln(
                    //     `<!DOCTYPE html>\n
                    //     <style>
                    //         html{
                    //             color: white;
                    //             margin: 20;
                    //         }
                    //     </style>
                    //     <body>
                    //     <code>
                    //     Recheck the nodes <br>
                    //     ${err.name === 'RangeError' ? 'CyclicDependence : Irresolvable Cycle(s) Exists' : `UnknownException: Improve The Editor By Opening Issue On GitHub(Just Attach The Exported Graph)`}
                    //     </code>
                    //     </body>
                    //     </html>
                    //     `
                    // );
                }
            }
        }
        getBegin(stage) {
            let X = stage.find("#Begin");
            if (X.length == 0) {
                if (g_isGetNodeGraph) {
                    g_isGetNodeGraph = false;
                } else {
                    $('#includeBeginModal').modal();
                }
            }
            else if (X.length > 1) {
                $('#multipleBeginModal').modal();
            }
            else return X[0];
        }
        getExecOut(node) {
            let X = [];
            for (let aNode of node.customClass.execOutPins) {
                if (aNode.wire)
                    X.push(aNode.wire.attrs.dest.getParent());
                else
                    X.push(null);
            }
            return X;
        }
        getSrcOutputPinNumber(grp, aNodeWire) {
            let c = 0;
            for (let eachPin of grp.customClass.outputPins) {
                for (let aWire of eachPin.wire) {
                    if (aWire === aNodeWire) {
                        return c;
                    }
                }
                c++;
            }
        }
        getInputPins(node) {
            let X = [];
            for (let aNode of node.customClass.inputPins) {
                if (aNode.wire) {
                    X.push({ node: aNode.wire.attrs.src.getParent(), isWire: true, srcOutputPinNumber: this.getSrcOutputPinNumber(aNode.wire.attrs.src.getParent(), aNode.wire) });
                }
                else {
                    // console.log(aNode.textBox);
                    X.push({ node: aNode.textBox.textBox.text(), isWire: false, srcOutputPinNumber: null });
                }
            }
            return X;
        }
        coreAlgorithm(node) {
            if (node == null) return;
            let execOutPins = this.getExecOut(node);
            let inputPins = this.getInputPins(node);
            // console.log(node.customClass.type);
            // console.log(inputPins);
            if (node.customClass.type.isGetSet) {
                if (node.customClass.type.typeOfNode.slice(0, 3) == 'Set') {
                    this.script += `${node.customClass.type.typeOfNode.slice(4)} = ${this.handleInputs(inputPins[0])};\n`;
                    for (let each of execOutPins) {
                        this.coreAlgorithm(each);
                    }
                }
            }
            else {
                this.nodeLuaError = false;
                this.nodeLuaErrorType = '';
                this.nodeLuaErrorString = '';
                switch (node.customClass.type.typeOfNode) {
                    case "Begin": {
                        this.coreAlgorithm(execOutPins[0]);
                        let func_string = `-- Functions Space Begins --
                        `;
                        for (let each_function in this.builtin_functions) {
                            func_string = func_string + BuilInFunctions[each_function];
                        }
                        func_string += `
                        -- Functions Space Ends --
                        --\n--\n-- Generated Lua Code Space Begins --
                        `;
                        this.script = func_string + this.script;
                        this.script += `\n-- Generated Lua Code Space Ends --`;
                    }
                        break;
                    case "If/Else": {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = 'If/Else';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[215];
                            return;
                        }
                        this.script += `if ${this.handleInputs(inputPins[0])} then\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        if (`${this.handleInputs(inputPins[1])}` && !`${this.handleInputs(inputPins[2])}`) {
                            this.script += `else ${this.handleInputs(inputPins[1])}\n`
                            this.coreAlgorithm(execOutPins[1]);
                        }
                        if (`${this.handleInputs(inputPins[1])}` && `${this.handleInputs(inputPins[2])}`) {
                            this.script += `elseif ${this.handleInputs(inputPins[1])} then\n`
                            this.coreAlgorithm(execOutPins[1]);
                            this.script += `else ${this.handleInputs(inputPins[2])}\n`;
                            this.coreAlgorithm(execOutPins[2]);
                        }
                        this.script += `end\n`;
                        this.coreAlgorithm(execOutPins[3]);
                    }
                        break;
                    // 跳转
                    case this.programCommandArray[2].name: {
                        let inputValue = this.handleInputs(inputPins[0]).split('')[0];
                        if (inputValue <=9 || inputValue >= 0) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[2].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[214];
                            return;
                        }
                        this.script += `::${this.handleInputs(inputPins[0])}::do\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `end\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 跳转goto
                    case this.programCommandArray[2].name+'-goto': {
                        let inputValue = this.handleInputs(inputPins[0]).split('')[0];
                        if (inputValue <=9 || inputValue >= 0) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[2].name+'-goto';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[214];
                            return;
                        }
                        this.script += `goto ${this.handleInputs(inputPins[0])}\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 等待
                    case this.programCommandArray[3].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[3].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[37];
                            return;
                        }
                        this.script += `WaitMs(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 等待DI
                    case this.nodeTitleList[12].name: {
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[38];
                            return;
                        }
                        let state = `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1}`;
                        let portValue = this.diData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let whetherMotionValue = this.whetherMotionData.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        if (portValue > 15) {
                            if (whetherMotionValue == 2) {
                                this.script += `WaitToolDI(${portValue - 15}`;
                                this.script += `,${state}`;
                                this.script += `,0`;
                                this.script += `,${whetherMotionValue}`;
                            } else {
                                this.script += `WaitToolDI(${portValue - 15}`;
                                this.script += `,${state}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${whetherMotionValue}`;
                            }
                            this.script += `)\n`;
                        } else {
                            if (whetherMotionValue == 2) {
                                this.script += `WaitDI(${portValue}`;
                                this.script += `,${state}`;
                                this.script += `,0`;
                                this.script += `,${whetherMotionValue}`;
                            } else {
                                this.script += `WaitDI(${portValue}`;
                                this.script += `,${state}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${whetherMotionValue}`;
                            }
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 等待多条DI
                    case this.nodeTitleList[13].name: {
                        if (!this.handleInputs(inputPins[1]) || !this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[13].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[39];
                            return;
                        }
                        //waitMultiDI
                        langJsonData.IOlists["clDI"].forEach(element => {
                            let tempItem = [];
                            tempItem[0] = element.name;
                            tempItem[1] = element.num;
                            this.waitMultiDIOptionArr.push(tempItem);
                        });
                        let multi_number = 0;
                        let multi_true = 0;
                        let multiValue = `${this.handleInputs(inputPins[1])}`.split(','); 
                        let multiPort = `${this.handleInputs(inputPins[2])}`.split(','); 
                        let nodeWarning1;
                        let nodeWarning2;
                        multiValue.forEach(data => {
                            if (this.waitMultiDIOptionArr.filter(item => item[0] == data).length == 1) {
                                let multi_check = this.waitMultiDIOptionArr.filter(item => item[0] == data)[0][1];
                                multi_number += Math.pow(2, multi_check);
                                nodeWarning1 = 0;
                            } else {
                                nodeWarning1 = 1;
                            }
                        })
                        multiPort.forEach(data => {
                            if (this.waitMultiDIOptionArr.filter(item => item[0] == data).length == 1) {
                                let multi_check = this.waitMultiDIOptionArr.filter(item => item[0] == data)[0][1];
                                multi_true += Math.pow(2, multi_check);
                                nodeWarning2 = 0;
                            } else {
                                nodeWarning2 = 1;
                            }
                        })

                        if (nodeWarning1 || nodeWarning2) {
                            document.getElementById('nodeEditor').dispatchEvent(new CustomEvent('saveWaitMultiDI', { bubbles: true, cancelable: true, composed: true, detail: 1 }));
                        } else {
                            document.getElementById('nodeEditor').dispatchEvent(new CustomEvent('saveWaitMultiDI', { bubbles: true, cancelable: true, composed: true, detail: 0 }));
                        }

                        let connectionValue = this.connectionData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let whetherMotionValue = this.whetherMotionData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        
                        this.script += `WaitMultiDI(${connectionValue}`;
                        this.script += `,${multi_number}`;
                        this.script += `,${multi_true}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${whetherMotionValue}`;
                        this.script += `)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 等待AI
                    case this.nodeTitleList[11].name: {
                        if (!this.handleInputs(inputPins[2]) || !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[40];
                            return;
                        }
                        let portValue = this.aiPort.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let aiCompareValue = this.aiCompare.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let whetherMotionValue = this.whetherMotionData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;

                        if (portValue > 1) {
                            if (whetherMotionValue == 2) {
                                this.script += `WaitToolAI(${portValue - 2}`;
                                this.script += `,${aiCompareValue}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,0`;
                                this.script += `,${whetherMotionValue}`;
                            } else {
                                this.script += `WaitToolAI(${portValue - 2}`;
                                this.script += `,${aiCompareValue}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${this.handleInputs(inputPins[3])}`;
                                this.script += `,${whetherMotionValue}`;
                            }
                            this.script += `)\n`;
                        } else {
                            if (whetherMotionValue == 2) {
                                this.script += `WaitAI(${portValue}`;
                                this.script += `,${aiCompareValue}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,0`;
                                this.script += `,${whetherMotionValue}`;
                            } else {
                                this.script += `WaitAI(${portValue}`;
                                this.script += `,${aiCompareValue}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${this.handleInputs(inputPins[3])}`;
                                this.script += `,${whetherMotionValue}`;
                            }
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 暂停
                    case this.programCommandArray[4].name: {
                        let pauseValue = this.pauseFunctionData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        this.script += `Pause(${pauseValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 获取系统变量
                    case this.nodeTitleList[39].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[39].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[155];
                            return;
                        }
                        this.script += `GetSysVarValue(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 设置系统变量
                    case this.nodeTitleList[40].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[40].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[155];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[40].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[156];
                            return;
                        }
                        this.script += `SetSysVarValue(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 调用子程序
                    case this.nodeTitleList[36].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[36].name;
                            this.nodeLuaErrorString = this.selectDofileFlagData.info_messages[27];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[36].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[47];
                            return;
                        }
                        let layerValue = this.layerIdData.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        if (g_systemFlag == 0) {
                            this.script += `NewDofile("/fruser/${this.handleInputs(inputPins[0])}"`;
                        } else {
                            this.script += `NewDofile("/usr/local/etc/controller/lua/${this.handleInputs(inputPins[0])}"`;
                        }
                        this.script += `,${layerValue}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `DofileEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 设置模拟外部DI
                    case this.nodeTitleList[41].name: {
                        let state = `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1}`;
                        let virData = this.virDinData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        if(virData > 15) {
                            this.script += `SetVirtualToolDI(${virData - 15}`;
                            this.script += `,${state}`;
                            this.script += `)\n`;
                        } else {
                            this.script += `SetVirtualDI(${virData}`;
                            this.script += `,${state}`;
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 设置模拟外部AI
                    case this.nodeTitleList[42].name: {
                        let virData = this.virAinData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        if(virData > 1) {
                            this.script += `SetVirtualToolAI(${virData - 2}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `)\n`;
                        } else {
                            this.script += `SetVirtualAI(${virData}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 获取模拟外部DI
                    case this.nodeTitleList[43].name: {
                        let virData = this.virDinData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        if(virData > 15) {
                            this.script += `GetVirtualToolDI(${virData - 15})\n`;
                        } else {
                            this.script += `GetVirtualDI(${virData})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 获取模拟外部AI
                    case this.nodeTitleList[44].name: {
                        let virData = this.virAinData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        if(virData > 1) {
                            this.script += `GetVirtualToolAI(${virData - 2})\n`;
                        } else {
                            this.script += `GetVirtualAI(${virData})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 加载UDP通信
                    case this.nodeTitleList[45].name: {
                        this.script += `ExtDevLoadUDPDriver()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 配置UDP通信
                    case this.nodeTitleList[46].name: {
                        if (!this.handleInputs(inputPins[0]) || !this.handleInputs(inputPins[1]) || !this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[46].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[158];
                            return;
                        }
                        this.script += `ExtDevSetUDPComParam("${this.handleInputs(inputPins[0])}`;
                        this.script += `",${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 运动DO-连续输出
                    case this.programCommandArray[27].name + this.nodeTitleList[130].name: {
                        if (!this.handleInputs(inputPins[1]) || !this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[27].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[159];
                            return;
                        }
                        let portValue = this.doData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        if(portValue > 15) {
                            this.script += `MoveToolDOStart(${portValue - 16}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `,${this.handleInputs(inputPins[2])}`;
                            this.script += `)\n`;
                        } else {
                            this.script += `MoveDOStart(${portValue}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `,${this.handleInputs(inputPins[2])}`;
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `MoveDOStop()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 运动DO-单次输出
                    case this.programCommandArray[27].name + this.nodeTitleList[131].name: {
                        let portValue = this.doData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let outputMode = this.outputMoveDOModeData.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].id;
                        if (outputMode == 0) {
                            if(portValue > 15) {
                                this.script += `MoveToolDOOnceStart(${portValue - 16},-1,-1)\n`;
                            } else {
                                this.script += `MoveDOOnceStart(${portValue},-1,-1)\n`;
                            }
                        } else {
                            if (!this.handleInputs(inputPins[2]) || !this.handleInputs(inputPins[3])) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.programCommandArray[27].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[159];
                                return;
                            }
                            if(portValue > 15) {
                                this.script += `MoveToolDOOnceStart(${portValue - 16}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${this.handleInputs(inputPins[3])}`;
                                this.script += `)\n`;
                            } else {
                                this.script += `MoveDOOnceStart(${portValue}`;
                                this.script += `,${this.handleInputs(inputPins[2])}`;
                                this.script += `,${this.handleInputs(inputPins[3])}`;
                                this.script += `)\n`;
                            }
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `MoveDOOnceStop()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 运动AO
                    case this.programCommandArray[57].name: {
                        let portValue = this.aoPort.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[57].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[249];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[57].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[250];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[57].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[251];
                            return;
                        }
                        if(portValue > 1) {
                            this.script += `MoveToolAOStart(${portValue - 2}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `,${this.handleInputs(inputPins[2])}`;
                            this.script += `,${this.handleInputs(inputPins[3])}`;
                            this.script += `)\n`;
                        } else {
                            this.script += `MoveAOStart(${portValue}`;
                            this.script += `,${this.handleInputs(inputPins[1])}`;
                            this.script += `,${this.handleInputs(inputPins[2])}`;
                            this.script += `,${this.handleInputs(inputPins[3])}`;
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `MoveAOStop()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 设置工具坐标系
                    case this.nodeTitleList[8].name: {
                        let toolValue = this.toolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0];
                        if(toolValue.id < this.nodeToolCoordeTotal) {
                            this.script += `SetToolList(${toolValue.name})\n`;
                        } else {
                            this.script += `SetExToolList(${toolValue.name})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 设置工件坐标系
                    case this.nodeTitleList[10].name: {
                        let wobjValue = this.wobjToolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].name;
                        this.script += `SetWObjList(${wobjValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 模式切换
                    case this.programCommandArray[29].name: {
                        let modeValue = this.robotModeData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        this.script += `Mode(${modeValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 碰撞等级-标准等级
                    case this.programCommandArray[30].name + '-' + this.collideModeData[0].name: {
                        let level1 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let level2 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].id;
                        let level3 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].id;
                        let level4 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].id;
                        let level5 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].id;
                        let level6 = this.collisionLevelData.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].id;
                        this.script += `SetAnticollision(0`;
                        this.script += `,{${level1}`;
                        this.script += `,${level2}`;
                        this.script += `,${level3}`;
                        this.script += `,${level4}`;
                        this.script += `,${level5}`;
                        this.script += `,${level6}}`;
                        this.script += `,0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 碰撞等级-自定义百分比
                    case this.programCommandArray[30].name + '-' + this.collideModeData[1].name: {
                        if (!this.handleInputs(inputPins[0]) || !this.handleInputs(inputPins[1]) || !this.handleInputs(inputPins[2] || !this.handleInputs(inputPins[3]) || !this.handleInputs(inputPins[4]) || !this.handleInputs(inputPins[5]))) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[30].name + '-' + this.collideModeData[1].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[160];
                            return;
                        }
                        this.script += `SetAnticollision(1`;
                        this.script += `,{${this.handleInputs(inputPins[0])/10}`;
                        this.script += `,${this.handleInputs(inputPins[1])/10}`;
                        this.script += `,${this.handleInputs(inputPins[2])/10}`;
                        this.script += `,${this.handleInputs(inputPins[3])/10}`;
                        this.script += `,${this.handleInputs(inputPins[4])/10}`;
                        this.script += `,${this.handleInputs(inputPins[5])/10}}`;
                        this.script += `,0)\n`;
                        
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 加速度
                    case this.programCommandArray[31].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[31].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[161];
                            return;
                        }
                        this.script += `SetOaccScale(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扭矩记录启动
                    case this.nodeInputTitles.motion._torque_record_start: {
                        for(let i=1; i<13; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._torque_record_start;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[84];
                                return;
                            }
                        }
                        let torqueSmoothTypeValue = this.torqueSmoothType.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        this.script += `negativeValues = {${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])}}\n`;
                        this.script += `positiveValues = {${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])}}\n`;
                        this.script += `collisionTime = {${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])},${this.handleInputs(inputPins[18])}}\n`;
                        this.script += `TorqueRecordStart(${torqueSmoothTypeValue},negativeValues,positiveValues,collisionTime)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扭矩记录停止
                    case this.nodeInputTitles.motion._torque_record_end: {
                        this.script += `TorqueRecordEnd()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扭矩记录复位
                    case this.nodeInputTitles.motion._torque_record_reset: {
                        this.script += `TorqueRecordReset()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 开启碰撞检测
                    case this.nodeTitleList[80].name: {
                        for(let i=0; i<25; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeTitleList[80].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[63];
                                return;
                            }
                        }
                        let toolValue = this.toolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let state2 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let state3 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        let state4 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        let state5 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].num;
                        let state6 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[6])}`)[0].num;
                        this.script += `FT_Guard(1,${toolValue},${state},${state2},${state3},${state4},${state5},${state6}`;
                        this.script += `,${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])}`;
                        this.script += `,${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])},${this.handleInputs(inputPins[18])}`;
                        this.script += `,${this.handleInputs(inputPins[19])},${this.handleInputs(inputPins[20])},${this.handleInputs(inputPins[21])},${this.handleInputs(inputPins[22])},${this.handleInputs(inputPins[23])},${this.handleInputs(inputPins[24])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 关闭碰撞检测
                    case this.nodeTitleList[81].name: {
                        for(let i=0; i<25; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeTitleList[81].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[63];
                                return;
                            }
                        }
                        let toolValue = this.toolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let state2 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let state3 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        let state4 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        let state5 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].num;
                        let state6 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[6])}`)[0].num;
                        this.script += `FT_Guard(0,${toolValue},${state},${state2},${state3},${state4},${state5},${state6}`;
                        this.script += `,${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])}`;
                        this.script += `,${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])},${this.handleInputs(inputPins[18])}`;
                        this.script += `,${this.handleInputs(inputPins[19])},${this.handleInputs(inputPins[20])},${this.handleInputs(inputPins[21])},${this.handleInputs(inputPins[22])},${this.handleInputs(inputPins[23])},${this.handleInputs(inputPins[24])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 开启控制
                    case this.nodeTitleList[82].name: {
                        for(let i=0; i<23; i++) {
                            if (!`${this.handleInputs(inputPins[i])}` && i != 19 && i != 20) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeTitleList[82].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[64];
                                return;
                            }
                        }
                        let toolValue = this.toolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let state2 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let state3 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        let state4 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        let state5 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].num;
                        let state6 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[6])}`)[0].num;
                        let FTControlAdjValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[19])}`)[0].id;
                        let FTControlILCValue = this.FTControlILCSignData.filter(item => item.name == `${this.handleInputs(inputPins[20])}`)[0].id;
                        let FTControlFilterValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[23])}`)[0].id;
                        let FTControlPAValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[24])}`)[0].id;
                        this.script += `FT_Control(1,${toolValue},${state},${state2},${state3},${state4},${state5},${state6}`;
                        this.script += `,${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])}`;
                        this.script += `,${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])},${this.handleInputs(inputPins[18])}`;
                        this.script += `,${FTControlAdjValue},${FTControlILCValue},${this.handleInputs(inputPins[21])},${this.handleInputs(inputPins[22])},${FTControlFilterValue},${FTControlPAValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 关闭控制
                    case this.nodeTitleList[83].name: {
                        for(let i=0; i<23; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeTitleList[83].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[64];
                                return;
                            }
                        }
                        let toolValue = this.toolCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let state2 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let state3 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        let state4 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        let state5 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].num;
                        let state6 = this.setTPDMode.filter(item => item.name == `${this.handleInputs(inputPins[6])}`)[0].num;
                        let FTControlAdjValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[19])}`)[0].id;
                        let FTControlILCValue = this.FTControlILCSignData.filter(item => item.name == `${this.handleInputs(inputPins[20])}`)[0].id;
                        let FTControlFilterValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[23])}`)[0].id;
                        let FTControlPAValue = this.FTControlAdjSignData.filter(item => item.name == `${this.handleInputs(inputPins[24])}`)[0].id;
                        this.script += `FT_Control(0,${toolValue},${state},${state2},${state3},${state4},${state5},${state6}`;
                        this.script += `,${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])}`;
                        this.script += `,${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])},${this.handleInputs(inputPins[18])}`;
                        this.script += `,${FTControlAdjValue},${FTControlILCValue},${this.handleInputs(inputPins[23])},${this.handleInputs(inputPins[24])},${FTControlFilterValue},${FTControlPAValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 柔顺控制开启
                    case this.nodeInputTitles.motion._ftcom_start: {
                        for(let i=0; i<2; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._ftcom_start;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[89];
                                return;
                            }
                        }
                        this.script += `FT_ComplianceStart(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 柔顺控制关闭
                    case this.nodeInputTitles.motion._ftcom_end: {
                        this.script += `FT_ComplianceStop()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 螺旋插入
                    case this.nodeInputTitles.motion._ft_spiral_search_start: {
                        for(let i=1; i<5; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._ft_spiral_search_start;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[65];
                                return;
                            }
                        }
                        let FTReferenceCoordValue = this.FTReferenceCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        this.script += `FT_SpiralSearch(${FTReferenceCoordValue}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${this.handleInputs(inputPins[4])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 旋转插入
                    case this.nodeInputTitles.motion._ft_rot_insertion_start: {
                        for(let i=1; i<6; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._ft_rot_insertion_start;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[66];
                                return;
                            }
                        }
                        let FTReferenceCoordValue = this.FTReferenceCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let FTRotOrnDataValue = this.FTRotOrnData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].id;
                        let FTFindSurfaceDirectionValue = this.FTFindSurfaceDirectionData.filter(item => item.name == `${this.handleInputs(inputPins[6])}`)[0].id;
                        this.script += `FT_RotInsertion(${FTReferenceCoordValue}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${FTRotOrnDataValue}`;
                        this.script += `,${this.handleInputs(inputPins[5])}`;
                        this.script += `,${FTFindSurfaceDirectionValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 直线插入
                    case this.nodeInputTitles.motion._ft_lin_insertion_start: {
                        for(let i=1; i<5; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._ft_lin_insertion_start;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[67];
                                return;
                            }
                        }
                        let FTReferenceCoordValue = this.FTReferenceCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let FTFindSurfaceDirectionValue = this.FTFindSurfaceDirectionData.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].id;
                        this.script += `FT_LinInsertion(${FTReferenceCoordValue}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${this.handleInputs(inputPins[4])}`;
                        this.script += `,${FTFindSurfaceDirectionValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 表面定位
                    case this.nodeInputTitles.motion._ft_find_surface: {
                        for(let i=3; i<7; i++) {
                            if (!`${this.handleInputs(inputPins[i])}`) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeInputTitles.motion._ft_find_surface;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[68];
                                return;
                            }
                        }
                        let FTReferenceCoordValue = this.FTReferenceCoordData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let FTFindSurfaceDirectionValue = this.FTFindSurfaceDirectionData.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].id;
                        let FTFindSurfaceAxisValue = this.FTFindSurfaceAxisData.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].id;
                        this.script += `FT_FindSurface(${FTReferenceCoordValue}`;
                        this.script += `,${FTFindSurfaceDirectionValue}`;
                        this.script += `,${FTFindSurfaceAxisValue}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${this.handleInputs(inputPins[4])}`;
                        this.script += `,${this.handleInputs(inputPins[5])}`;
                        this.script += `,${this.handleInputs(inputPins[6])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 计算开始
                    case this.nodeInputTitles.motion._ftcal_start: {
                        this.script += `FT_CalCenterStart()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 计算结束
                    case this.nodeInputTitles.motion._ftcal_end: {
                        this.script += `FT_CalCenterEnd()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)读线圈
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_coils: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[223];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusMasterReadDO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)写线圈
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_coils: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[223];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        this.script += `ModbusMasterWriteDO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,{${this.handleInputs(inputPins[3])}})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)读离散量
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_inbits: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_inbits;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_inbits;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[224];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._read_inbits;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusMasterReadDI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)读模拟输出
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ao: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[225];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusMasterReadAO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)写模拟输出
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_write_ao: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[225];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        this.script += `ModbusMasterWriteAO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,{${this.handleInputs(inputPins[3])}})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)读模拟输入
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ai: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[226];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_read_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusMasterReadAI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)写模拟输入
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_di: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_di;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_di;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[224];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_di;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[230];
                            return;
                        }
                        let state = `${this.handleInputs(inputPins[2]) == 'false' ? 0 : 1}`;
                        this.script += `ModbusMasterWaitDI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${state}`;
                        this.script += `,${this.handleInputs(inputPins[3])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus主站设置(客户端)等待数字输入
                    case this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_ai: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[222];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[226];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[4])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_master + this.nodeInputTitles.modbus._write_holdregs;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        let aiCompareValue = this.aiCompare.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        this.script += `ModbusMasterWaitAI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${aiCompareValue}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${this.handleInputs(inputPins[4])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置读线圈
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_coils: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[223];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusSlaveReadDO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置写线圈
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._write_coils: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[223];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._write_coils;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        this.script += `ModbusSlaveWriteDO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,{${this.handleInputs(inputPins[2])}})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置读离散量
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_inbits: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_inbits;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[224];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._read_inbits;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusSlaveReadDI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置读模拟输出
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ao: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[225];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusSlaveReadAO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置写模拟输出
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_write_ao: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[225];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_write_ao;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        this.script += `ModbusSlaveWriteAO(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,{${this.handleInputs(inputPins[2])}})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置读模拟输入
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ai: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[226];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_read_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        this.script += `ModbusSlaveReadAI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置等待数字输入
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_di: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_di;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[224];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_di;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[230];
                            return;
                        }
                        let state = `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1}`;
                        this.script += `ModbusSlaveWaitDI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${state}`;
                        this.script += `,${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // modbus从站设置等待模拟输入
                    case this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_ai: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[226];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[227];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType =this.nodeInputTitles.modbus._modbus_slave + this.nodeInputTitles.modbus._modbus_wait_ai;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[228];
                            return;
                        }
                        let aiCompareValue = this.aiCompare.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        this.script += `ModbusSlaveWaitAI(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${aiCompareValue}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 读寄存器指令
                    case this.nodeInputTitles.modbus._modbus_rtu_read_register_command: {
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_read_register_command;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[198];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_read_register_command;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[199];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_read_register_command;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[195];
                            return;
                        }
                        let modbusRegReadValue = this.modbusRegReadFunctionCodeData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = `${this.handleInputs(inputPins[4]) == 'false' ? 0 : 1}`;
                        this.script += `ModbusRegRead(${modbusRegReadValue}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${state})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 读寄存器数据
                    case this.nodeInputTitles.modbus._modbus_rtu_read_register_data: {
                        if (!`${this.handleInputs(inputPins[0])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_read_register_command;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[198];
                            return;
                        }
                        let state = `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1}`;
                        this.script += `ModbusRegGetData(${this.handleInputs(inputPins[0])}`;
                        this.script += `,${state})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 写寄存器
                    case this.nodeInputTitles.modbus._modbus_rtu_write_register_data: {
                        if (!`${this.handleInputs(inputPins[1])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_write_register_data;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[198];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[2])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_write_register_data;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[199];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[4])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_write_register_data;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[195];
                            return;
                        }
                        if (!`${this.handleInputs(inputPins[3])}`) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.modbus._modbus_rtu_write_register_data;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[200];
                            return;
                        }
                        let modbusRegWriteValue = this.modbusRegWriteFunctionCodeData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].id;
                        let state = `${this.handleInputs(inputPins[5]) == 'false' ? 0 : 1}`;
                        this.script += `ModbusRegWrite(${modbusRegWriteValue}`;
                        this.script += `,${this.handleInputs(inputPins[1])}`;
                        this.script += `,${this.handleInputs(inputPins[2])}`;
                        this.script += `,${this.handleInputs(inputPins[3])}`;
                        this.script += `,${this.handleInputs(inputPins[4])}`;
                        this.script += `,${state})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    case "Break": {
                        this.script += `break;\n`;
                    }
                        break;
                    case "Continue": {
                        this.script += `continue;\n`;
                    }
                        break;
                    case "While": {
                        this.script += `while(${this.handleInputs(inputPins[0])}) do\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `end\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 点到点
                    case this.programCommandArray[7].name: {
                        const offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[4])).id;
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[7].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[91];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[7].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[2]) == 'true' && !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[7].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[5]) || !this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[7].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }
                        if (offsetFlagName == 0) {
                            this.script += `PTP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${offsetFlagName})\n`;
                        } else {
                            this.script += `PTP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${offsetFlagName},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 直线
                    case this.programCommandArray[8].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[91];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[2]) == 'true' && !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        const offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        const strategyName = this.treatStrategyData.find(item => item.name == this.handleInputs(inputPins[14])).id;
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }

                        if (this.handleInputs(inputPins[13]) == "false") {
                            if (this.handleInputs(inputPins[4]) == "false") {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName})\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                }
                            } else {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                }
                            }
                        } else {
                            if (strategyName == 3) {
                                this.script += `JointOverSpeedProtectStart(3,${this.handleInputs(inputPins[15])})\n` 
                            } else {
                                this.script += `JointOverSpeedProtectStart(${strategyName},0)\n` 
                            }
                            if (this.handleInputs(inputPins[4]) == "false") {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName})\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                }
                            } else {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                }
                            }
                            this.script += `JointOverSpeedProtectEnd()\n` 
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 直线-过渡点角度可调节
                    case this.programCommandArray[8].name + '(' + this.nodeInputTitles.motion._trans_point_angle_adjustable + ')': {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name + '(' + this.nodeInputTitles.motion._trans_point_angle_adjustable + ')';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[91];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name + '(' + this.nodeInputTitles.motion._trans_point_angle_adjustable + ')';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[2]) == 'true' && !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name + '(' + this.nodeInputTitles.motion._trans_point_angle_adjustable + ')';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        if (!this.handleInputs(inputPins[14])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name + '(' + this.nodeInputTitles.motion._trans_point_angle_adjustable + ')';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[265];
                            return;
                        }
                        const offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[8].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }

                        if (this.handleInputs(inputPins[13]) == "false") {
                            if (this.handleInputs(inputPins[4]) == "false") {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName})\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                }
                            } else {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                }
                            }
                        } else {
                            this.script += `AngularSpeedStart(${this.handleInputs(inputPins[14])})\n`
                            if (this.handleInputs(inputPins[4]) == "false") {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName})\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                }
                            } else {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                }
                            }
                            this.script += `AngularSpeedEnd()\n` 
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 直线(seamPos)
                    case this.nodeTitleList[135].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[135].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[91];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[135].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[2]) == 'true' && !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[135].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        const weldRecordName = this.weldRecordData.find(item => item.name == this.handleInputs(inputPins[4])).id;
                        const TplateName = this.TplateType.find(item => item.name == this.handleInputs(inputPins[5])).id;
                        const offsetFlagName = this.offsetFlagLaserData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[135].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }
                        if (offsetFlagName == 0) {
                            this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${weldRecordName},${TplateName},${offsetFlagName})\n`;
                        } else {
                            this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${weldRecordName},${TplateName},${offsetFlagName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 圆弧
                    case this.programCommandArray[9].name: {
                        const offsetFlagName1 = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        const offsetFlagName2 = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[9])).id;
                        const arcCenterOffest = `${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])}`
                        const arcEndOffest = `${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])}`
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[115];
                            return;
                        }
                        if (offsetFlagName1 > 0 && (!this.handleInputs(inputPins[2]) || !this.handleInputs(inputPins[3]) || !this.handleInputs(inputPins[4]) || !this.handleInputs(inputPins[5]) || !this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[116];
                            return;
                        }
                        if (!this.handleInputs(inputPins[8])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[117];
                            return;
                        }
                        if (offsetFlagName2 > 0 && (!this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14]) || !this.handleInputs(inputPins[15]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[118];
                            return;
                        }
                        if (!this.handleInputs(inputPins[16])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[17]) == 'true' && !this.handleInputs(inputPins[18])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[9].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        this.script += `ARC(${this.handleInputs(inputPins[0])},${offsetFlagName1},${arcCenterOffest},${this.handleInputs(inputPins[8])},`
                        this.script += `${offsetFlagName2},${arcEndOffest},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17]) == 'true' ? -1 : this.handleInputs(inputPins[18])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 整圆
                    case this.programCommandArray[10].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[10].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[119];
                            return;
                        }
                        if (!this.handleInputs(inputPins[9])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[10].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[120];
                            return;
                        }
                        if (!this.handleInputs(inputPins[17])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[10].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        let offsetTypeName = this.offsetTypeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        let offsetFlagName1 = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[2])).id;
                        let offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[10])).id;

                        //相同偏移量 -- 设置一个偏移量
                        if (offsetTypeName == 1) {
                            if (offsetFlagName == 0) {
                                this.script += `Circle(${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[17])},${offsetFlagName})\n`;
                            } else {
                                if (offsetFlagName > 0 && (!this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14]) || !this.handleInputs(inputPins[15]) || !this.handleInputs(inputPins[16]) )) {
                                    this.nodeLuaError = true;
                                    this.nodeLuaErrorType = this.programCommandArray[10].name;
                                    this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                                    return;
                                }
                                this.script += `Circle(${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[17])},`
                                this.script += `${offsetFlagName},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},`
                                this.script += `${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])})\n`;
                            }
                        } else {
                            //不同偏移量 -- 分别设置两个偏移量
                            if (offsetFlagName1 == 0 && offsetFlagName == 0) {
                                //点1、点2都不偏移
                                this.script += `Circle(${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[17])},${offsetFlagName})\n`;
                            } else if (offsetFlagName1 != 0 && offsetFlagName == 0) {
                                //只有点1偏移
                                if (offsetFlagName1 > 0 && (!this.handleInputs(inputPins[3]) || !this.handleInputs(inputPins[4]) || !this.handleInputs(inputPins[5]) || !this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]))) {
                                    this.nodeLuaError = true;
                                    this.nodeLuaErrorType = this.programCommandArray[10].name;
                                    this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                                    return;
                                }
                                this.script += `Circle(${this.handleInputs(inputPins[1])}, ${offsetFlagName1},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},0,${this.handleInputs(inputPins[17])})\n`;
                            } else if (offsetFlagName1 == 0 && offsetFlagName != 0) {
                                //只有点2偏移
                                if (offsetFlagName > 0 && (!this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14]) || !this.handleInputs(inputPins[15]) || !this.handleInputs(inputPins[16]) )) {
                                    this.nodeLuaError = true;
                                    this.nodeLuaErrorType = this.programCommandArray[10].name;
                                    this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                                    return;
                                }
                                this.script += `Circle(${this.handleInputs(inputPins[1])},0,${this.handleInputs(inputPins[9])},${offsetFlagName},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])})\n`;
                            } else {
                                // 点1、点2都偏移
                                if (offsetFlagName1 > 0 && offsetFlagName > 0 && (!this.handleInputs(inputPins[3]) || !this.handleInputs(inputPins[4]) || !this.handleInputs(inputPins[5]) || !this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14]) || !this.handleInputs(inputPins[15]) || !this.handleInputs(inputPins[16]))) {
                                    this.nodeLuaError = true;
                                    this.nodeLuaErrorType = this.programCommandArray[10].name;
                                    this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                                    return;
                                }
                                this.script += `Circle(${this.handleInputs(inputPins[1])},${offsetFlagName1},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${offsetFlagName},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])})\n`;
                            }
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 螺旋
                    case this.programCommandArray[11].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[121];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[122];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[123];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        const offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[4])).id;
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[5]) || !this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }
                        if (!this.handleInputs(inputPins[11])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[124];
                            return;
                        }
                        if (!this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[125];
                            return;
                        }
                        if (!this.handleInputs(inputPins[15])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[126];
                            return;
                        }
                        if (!this.handleInputs(inputPins[16])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[11].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[154];
                            return;
                        }
                        if (offsetFlagName == 0) {
                            this.script += `Spiral(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},`
                            this.script += `${this.handleInputs(inputPins[3])},${offsetFlagName},0,0,0,0,0,0,${this.handleInputs(inputPins[11])},`
                            this.script += `${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},`
                            this.script += `${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])})\n`;
                        } else {
                            this.script += `Spiral(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},`
                            this.script += `${this.handleInputs(inputPins[3])},${offsetFlagName},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},`
                            this.script += `${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},`
                            this.script += `${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},`
                            this.script += `${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 新螺旋
                    case this.programCommandArray[12].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[127];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[124];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[128];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[129];
                            return;
                        }
                        if (!this.handleInputs(inputPins[6])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[7])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[12].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[154];
                            return;
                        }
                        const nSpiralOffsetName = this.nSpiralOffsetFlagData.find(item => item.name == this.handleInputs(inputPins[2])).id;
                        const spiralDirectionName = this.spiralDirectionData.find(item => item.name == this.handleInputs(inputPins[8])).id;
                        this.script += `PTP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},0,${nSpiralOffsetName},`
                        this.script += `${this.handleInputs(inputPins[5])},0,0,-${this.handleInputs(inputPins[4])},0,0)\n`
                        this.script += `NewSpiral(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${nSpiralOffsetName},`
                        this.script += `${this.handleInputs(inputPins[5])},0,0,-${this.handleInputs(inputPins[4])},0,0,${this.handleInputs(inputPins[3])},`
                        this.script += `${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},`
                        this.script += `${this.handleInputs(inputPins[7])},${spiralDirectionName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 水平螺旋
                    case this.programCommandArray[55].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[55].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[218];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[55].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[219];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[55].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[220];
                            return;
                        }
                        const spiralDirectionName = this.spiralDirectionData.find(item => item.name == this.handleInputs(inputPins[2])).id;
                        this.script += `HorizonSpiralMotionStart(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${spiralDirectionName},${this.handleInputs(inputPins[3])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `HorizonSpiralMotionEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 样条
                    case this.programCommandArray[13].name: {
                        this.script += `SplineStart()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `SplineEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 样条-SPTP
                    case this.programCommandArray[13].name + '-SPTP': {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[13].name + '-SPTP';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[13].name + '-SPTP';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        } 
                        this.script += `SPTP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 新样条
                    case this.programCommandArray[14].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[14].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[246];
                            return;
                        }
                        const newSplineModeName = this.newSplineModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `NewSplineStart(${newSplineModeName},${this.handleInputs(inputPins[1])})\n`
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `NewSplineEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 新样条-SPL
                    case this.programCommandArray[14].name + '-SPL': {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[14].name + '-SPL';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[14].name + '-SPL';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[14].name + '-SPL';
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[131];
                            return;
                        }
                        this.script += `NewSP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},`
                        this.script += `${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3]) == 'false' ? 0 : 1})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 摆动
                    case this.programCommandArray[15].name: {
                        this.script += `WeaveStart(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `WeaveEnd(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 轨迹复现
                    case this.programCommandArray[16].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[16].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[132];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[16].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        this.script += `LoadTPD(\"${this.handleInputs(inputPins[0])}\")\nMoveTPD(\"${this.handleInputs(inputPins[0])}\",`
                        this.script += `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1},${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 点偏移
                    case this.programCommandArray[17].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[133];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[134];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[135];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[136];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[137];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[138];
                            return;
                        }
                        this.script += `PointsOffsetEnable(0,${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])})\n`
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `PointsOffsetDisable()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 伺服
                    case this.programCommandArray[18].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[139];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[140];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[141];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[142];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[143];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[144];
                            return;
                        }
                        if (!this.handleInputs(inputPins[6]) || !this.handleInputs(inputPins[7]) || !this.handleInputs(inputPins[8]) || !this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[145];
                            return;
                        }
                        if (!this.handleInputs(inputPins[12])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[146];
                            return;
                        }
                        if (!this.handleInputs(inputPins[13])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[147];
                            return;
                        }
                        if (!this.handleInputs(inputPins[14])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[148];
                            return;
                        }
                        if (!this.handleInputs(inputPins[15])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[149];
                            return;
                        }
                        if (!this.handleInputs(inputPins[16])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[150];
                            return;
                        }
                        const servoCModeName = this.servoCModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ServoCart(${servoCModeName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},${this.handleInputs(inputPins[15])},${this.handleInputs(inputPins[16])},${this.handleInputs(inputPins[17])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 轨迹
                    case this.programCommandArray[19].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[19].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[151];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[19].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        const trajPath = g_systemFlag ? `/usr/local/etc/controller/lua/traj/` : `/fruser/traj/`;
                        const startPose = `startPose = GetTrajectoryStartPose(\"${trajPath}${this.handleInputs(inputPins[0])}\")`;
                        const toolNum = `tool_num = GetActualTCPNum()`;
                        const wobjNum = `wobj_num = GetActualWObjNum()`;
                        const moveCart = `MoveCart(startPose,tool_num,wobj_num,100.0,100.0,${this.handleInputs(inputPins[1])},-1.0,-1)`;
                        const moveTrajectory = `MoveTrajectory(\"${trajPath}${this.handleInputs(inputPins[0])}\",${this.handleInputs(inputPins[1])})`;
                        const printTrajPointNum = `num = GetTrajectoryPointNum()\nRegisterVar(\"number\",\"num\")`;
                        this.script += `LoadTrajectory(\"${trajPath}${this.handleInputs(inputPins[0])}\")\n${startPose}\n${toolNum}\n${wobjNum}\n${moveCart}\n${moveTrajectory}\n${printTrajPointNum}\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 轨迹J
                    case this.programCommandArray[20].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[20].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[151];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[20].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        const trajectoryJModeName = this.trajectoryJMode.find(item => item.name == this.handleInputs(inputPins[2])).id;
                        const trajPath = g_systemFlag ? `/usr/local/etc/controller/lua/traj/` : `/fruser/traj/`;
                        const startPose = `startPose = GetTrajectoryStartPose(\"${trajPath}${this.handleInputs(inputPins[0])}\")`;
                        const toolNum = `tool_num = GetActualTCPNum()`;
                        const wobjNum = `wobj_num = GetActualWObjNum()`;
                        const moveCart = `MoveCart(startPose,tool_num,wobj_num,100.0,100.0,${this.handleInputs(inputPins[1])},-1.0,-1)`;
                        const moveTrajectory = `MoveTrajectoryJ()`;
                        const printTrajPointNum = `num = GetTrajectoryPointNum()\nRegisterVar(\"number\",\"num\")`;
                        this.script += `LoadTrajectoryJ(\"${trajPath}${this.handleInputs(inputPins[0])}\",${this.handleInputs(inputPins[1])},`
                        this.script += `${trajectoryJModeName})\n${startPose}\n${toolNum}\n${wobjNum}\n${moveCart}\n${moveTrajectory}\n${printTrajPointNum}\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // DMP
                    case this.programCommandArray[21].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[21].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[21].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        this.script += `DMP(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 工件转换
                    case this.programCommandArray[22].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[22].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[152];
                            return;
                        }
                        this.script += `WorkPieceTrsfStart(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `WorkPieceTrsfEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 工具转换
                    case this.programCommandArray[52].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[52].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[153];
                            return;
                        }
                        this.script += `ToolTrsfStart(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `ToolTrsfEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                    }
                        break;
                    // 夹爪运动
                    case this.nodeTitleList[47].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[47].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[162];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[47].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[163];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[47].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[164];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[47].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[165];
                            return;
                        }
                        this.script += `MoveGripper(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},`
                        this.script += `${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5]) == 'true' ? 0 : 1})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 夹爪复位
                    case this.nodeTitleList[48].name: {
                        this.script += `ActGripper(${this.handleInputs(inputPins[0])},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 夹爪激活
                    case this.nodeTitleList[49].name: {
                        this.script += `ActGripper(${this.handleInputs(inputPins[0])},0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 开始喷涂
                    case this.nodeTitleList[50].name: {
                        this.script += `SprayStart()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 停止喷涂
                    case this.nodeTitleList[51].name: {
                        this.script += `SprayStop()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 开始清枪
                    case this.nodeTitleList[52].name: {
                        this.script += `PowerCleanStart()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 停止清枪
                    case this.nodeTitleList[53].name: {
                        this.script += `PowerCleanStop()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 传送带io实时检测
                    case this.nodeTitleList[54].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[54].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[56];
                            return;
                        }
                        this.script += `ConveyorIODetect(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 传送带位置实时检测
                    case this.nodeTitleList[55].name: {
                        const conTrackModeName = this.ConTrackModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ConveyorGetTrackData(${conTrackModeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 传送带跟踪开启
                    case this.nodeTitleList[56].name: {
                        const conTrackModeName = this.ConTrackModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ConveyorTrackStart(${conTrackModeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 传送带跟踪关闭
                    case this.nodeTitleList[57].name: {
                        this.script += `ConveyorTrackEnd()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨通讯驱动卸载
                    case this.nodeTitleList[58].name: {
                        this.script += `PolishingUnloadComDriver()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨通讯驱动加载
                    case this.nodeTitleList[59].name: {
                        this.script += `PolishingLoadComDriver()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设备使能
                    case this.nodeTitleList[60].name: {
                        const enableName = this.enableData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `PolishingDeviceEnable(${enableName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设备错误清除
                    case this.nodeTitleList[61].name: {
                        this.script += `PolishingClearError()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设备力传感器清零
                    case this.nodeTitleList[62].name: {
                        this.script += `PolishingTorqueSensorReset()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨转速
                    case this.nodeTitleList[63].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[63].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[94];
                            return;
                        }
                        this.script += `PolishingSetTargetVelocity(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设定力
                    case this.nodeTitleList[64].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[64].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[95];
                            return;
                        }
                        this.script += `PolishingSetTargetTorque(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨接触力
                    case this.nodeTitleList[151].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[64].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[262];
                            return;
                        }
                        this.script += `PolishingSetTargetTouchForce(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设定力过渡时间
                    case this.nodeTitleList[152].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[152].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[263];
                            return;
                        }
                        this.script += `PolishingSetTargetTouchTime(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨设定力
                    case this.nodeTitleList[153].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[153].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[264];
                            return;
                        }
                        this.script += `PolishingSetWorkPieceWeight(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨伸出距离
                    case this.nodeTitleList[65].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[65].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[96];
                            return;
                        }
                        this.script += `PolishingSetTargetPosition(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 打磨控制模式
                    case this.nodeTitleList[66].name: {
                        const polishCommandModeName = this.polishCommandModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `PolishingSetOperationMode(${polishCommandModeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴UDP通信加载
                    case this.nodeTitleList[67].name: {
                        this.script += `ExtDevLoadUDPDriver()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴UDP通信配置
                    case this.nodeTitleList[68].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[68].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[166];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[68].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[167];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[68].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[168];
                            return;
                        }
                        this.script += `ExtDevSetUDPComParam(\"${this.handleInputs(inputPins[0])}\",${this.handleInputs(inputPins[1])},`
                        this.script += `${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴异步运动
                    case this.nodeTitleList[69].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[69].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[69].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        this.script += `EXT_AXIS_PTP(0,${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴同步PTP/LIN运动
                    case this.nodeTitleList[70].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[70].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[130];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[70].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        switch (this.handleInputs(inputPins[0])) {
                            case 'PTP':
                                this.script += `EXT_AXIS_PTP(1,${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                                this.script += `PTP(${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},0,0)\n`;
                                break;
                            case 'LIN':
                                this.script += `EXT_AXIS_PTP(1,${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                                this.script += `Lin(${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},0,0,0)\n`;
                                break;
                            default:
                                break;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴同步ARC运动
                    case this.nodeTitleList[71].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[71].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[115];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[71].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[117];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[71].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        this.script += `EXT_AXIS_PTP(1,${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                        this.script += `ARC(${this.handleInputs(inputPins[0])},0,0,0,0,0,0,0,${this.handleInputs(inputPins[1])},0,0,0,0,0,0,0,${this.handleInputs(inputPins[2])},0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                    }
                        break;
                    // 扩展轴回零指令
                    case this.nodeTitleList[72].name: {
                        const servoId = this.axisNumberData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        const zeroModeName = this.ZeroModeData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[72].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[105];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[72].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[106];
                            return;
                        }
                        this.script += `ExtAxisSetHoming(${servoId},${zeroModeName},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴使能指令
                    case this.nodeTitleList[73].name: {
                        const servoId = this.axisNumberData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ExtAxisServoOn(${servoId},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴伺服ID
                    case this.nodeTitleList[74].name: {
                        this.script += `AuxServoSetStatusID(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴控制模式
                    case this.nodeTitleList[75].name: {
                        const auxServoCommandModeName = this.auxServoCommandModeData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        this.script += `AuxServoEnable(${this.handleInputs(inputPins[0])},0)\n`;
                        this.script += `AuxServoSetControlMode(${this.handleInputs(inputPins[0])},${auxServoCommandModeName})\n`;
                        this.script += `AuxServoEnable(${this.handleInputs(inputPins[0])},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴伺服使能
                    case this.nodeTitleList[76].name: {
                        const servoEnableName = this.servoEnableData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        this.script += `AuxServoEnable(${this.handleInputs(inputPins[0])},${servoEnableName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴伺服回零
                    case this.nodeTitleList[77].name: {
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[77].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[105];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[77].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[106];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[77].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[266];
                            return;
                        }
                        const zeroModeName = this.ZeroModeData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        this.script += `AuxServoHoming(${this.handleInputs(inputPins[0])},${zeroModeName},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴位置模式
                    case this.nodeTitleList[78].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[78].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[100];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[78].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[101];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[78].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[266];
                            return;
                        }
                        this.script += `AuxServoSetTargetPos(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 扩展轴速度模式
                    case this.nodeTitleList[79].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[79].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[102];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[79].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[266];
                            return;
                        }
                        this.script += `AuxServoSetTargetSpeed(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焊机电压
                    case this.nodeTitleList[84].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[84].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[169];
                            return;
                        }
                        this.script += `SetWeldingVoltage(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焊机电流
                    case this.nodeTitleList[85].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[85].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[170];
                            return;
                        }
                        this.script += `SetWeldingCurrent(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 收弧
                    case this.nodeTitleList[86].name: {
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[86].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[56];
                            return;
                        }
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ARCEnd(${ioTypeName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 起弧
                    case this.nodeTitleList[87].name: {
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[87].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[171];
                            return;
                        }
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `ARCStart(${ioTypeName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 关气
                    case this.nodeTitleList[88].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetAspirated(${ioTypeName},0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 送气
                    case this.nodeTitleList[89].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetAspirated(${ioTypeName},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 停止正向送丝
                    case this.nodeTitleList[90].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetForwardWireFeed(${ioTypeName},0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 正向送丝
                    case this.nodeTitleList[91].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetForwardWireFeed(${ioTypeName},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 停止反向送丝
                    case this.nodeTitleList[92].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetReverseWireFeed(${ioTypeName},0)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 反向送丝
                    case this.nodeTitleList[93].name: {
                        const ioTypeName = this.IOTypeDict.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `SetReverseWireFeed(${ioTypeName},1)\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }

                    case this.nodeTitleList[34].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[34].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[171];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[34].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[172];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[34].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[34].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[59];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[34].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[173];
                            return;
                        }
                        const segmentModeName = this.segmentModeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        const functionModeName = this.functionModeData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        const weaveModeName = this.weaveModeData.find(item => item.name == this.handleInputs(inputPins[7])).id;
                        const roundingRuleName = this.roundingRuleData.find(item => item.name == this.handleInputs(inputPins[8])).id;
                        this.script += "seg_distance,seg_x,seg_y,seg_z = GetSegWeldDisDir(" + this.handleInputs(inputPins[1]) + ","+ this.handleInputs(inputPins[2]) + ")"  + "\n";
                        this.script += "if seg_distance ~= nil and seg_x ~= nil and seg_y ~= nil and seg_z ~= nil then" + "\n";
                        this.script += "PTP(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0)" + "\n";
                        this.script += "i = 0; j = 0; k = 0" + "\n";
                        this.script += "m =" + this.handleInputs(inputPins[4]) + "; n =" + this.handleInputs(inputPins[5]) + "\n";
                        if (weaveModeName == 0) {
                            if (functionModeName == 0) {
                                if (roundingRuleName == 0) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 1) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 2) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                }
                            } else {
                                if (roundingRuleName == 0) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 1) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 2) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                }
                            }
                        } else {
                            if (functionModeName == 0) {
                                if (roundingRuleName == 0) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 1) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 2) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "else" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                }
                            } else {
                                if (roundingRuleName == 0) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",seg_distance)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 1) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                } else if (roundingRuleName == 2) {
                                    this.script += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                                    this.script += "if((-1)^k == 1) then" + "\n";
                                    this.script += "j=j+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "else" + "\n";
                                    this.script += "i=i+1" + "\n";
                                    this.script += "k=k+1" + "\n";
                                    this.script += "if((i*m+j*n)>seg_distance) then" + "\n";
                                    this.script += "break" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "ARCStart(0,0,10000)" + "\n";
                                    this.script += "WeaveStart(0)" + "\n";
                                    if (segmentModeName == 1) {
                                        this.script += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + this.handleInputs(inputPins[1]) + ","+  this.handleInputs(inputPins[2]) + ",i*m+j*n)" + "\n";
                                        this.script += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + this.handleInputs(inputPins[3]) + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                                    } else {
                                        this.script += "Lin(" + this.handleInputs(inputPins[1]) + "," + this.handleInputs(inputPins[3]) + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                                    }
                                    this.script += "WeaveEnd(0)" + "\n";
                                    this.script += "ARCEnd(0,0,10000)" + "\n";
                                    this.script += "end" + "\n";
                                    this.script += "end" + "\n";
                                }
                            }
                        }
                        this.script += `end\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 打开传感器-焊缝类型
                    case this.nodeTitleList[128].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[128].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[174];
                            return;
                        }
                        this.script += `LTLaserOn(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 打开传感器-任务号
                    case this.nodeTitleList[129].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[129].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[241];
                            return;
                        }
                        this.script += `LTLaserOn(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 打开传感器-解决方案
                    case this.nodeTitleList[136].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[136].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[248];
                            return;
                        }
                        this.script += `LTLaserOn(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 关闭传感器
                    case this.nodeTitleList[96].name: {
                        this.script += `LTLaserOff()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 卸载传感器
                    case this.nodeTitleList[97].name: {
                        this.script += `UnloadPosSensorDriver()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 加载传感器
                    case this.nodeTitleList[98].name: {
                        const protocolName = this.protocolData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `LoadPosSensorDriver(${protocolName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 开始跟踪
                    case this.nodeTitleList[99].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[99].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[175];
                            return;
                        }
                        this.script += `LTTrackOn(${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 停止跟踪
                    case this.nodeTitleList[100].name: {
                        this.script += `LTTrackOff()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焊缝数据记录
                    // 数据记录
                    case this.nodeTitleList[94].name: 
                    case this.nodeTitleList[101].name: {
                        const functionTypeName = this.functionTypeData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[176];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[147];
                            return;
                        }
                        this.script += `LaserSensorRecord(${functionTypeName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 激光跟踪复现
                    case this.nodeTitleList[102].name: {
                        this.script += `MoveLTR()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 传感器取点运动
                    case this.nodeTitleList[103].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[103].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[175];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[103].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        switch (this.handleInputs(inputPins[1])) {
                            case 'PTP':
                                this.script += `pos = {}\n`;
                                this.script += `pos = LaserRecordPoint(${this.handleInputs(inputPins[0])},0,${this.handleInputs(inputPins[2])})\n`;
                                this.script += `if type(pos) == \"table\" then\n`;
                                this.script += `laserPTP(#pos,pos)\n`;
                                this.script += `end\n`;
                                break;
                            case 'LIN':
                                this.script += `pos = {}\n`;
                                this.script += `pos = LaserRecordPoint(${this.handleInputs(inputPins[0])},1,${this.handleInputs(inputPins[2])})\n`;
                                this.script += `if type(pos) == \"table\" then\n`;
                                this.script += `laserLin(#pos,pos)\n`;
                                this.script += `end\n`;
                                break;
                            default:
                                break;
                        }
                        this.script += `MoveLTR()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 寻位开始
                    case this.nodeTitleList[104].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[104].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[175];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[104].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[147];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[104].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[177];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[104].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[178];
                            return;
                        }
                        const serachDistName = this.SerachDistData.find(item => item.name == this.handleInputs(inputPins[1])).num;
                        let laserSearchDistData = '';
                        if (serachDistName == 6) {
                            if (!this.handleInputs(inputPins[2])) {
                                this.nodeLuaError = true;
                                this.nodeLuaErrorType = this.nodeTitleList[104].name;
                                this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[179];
                                return;
                            }
                            laserSearchDistData = this.handleInputs(inputPins[2]);
                        } else {
                            laserSearchDistData = 0;
                        }
                        this.script += `LTSearchStart(${serachDistName},${laserSearchDistData},${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[0])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 寻位结束
                    case this.nodeTitleList[105].name: {
                        this.script += `LTSearchStop()\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 获取焊缝终点
                    case this.nodeTitleList[106].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[106].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[147];
                            return;
                        }
                        const axisMoveName = this.axisMoveData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `MoveToLaserRecordEnd(${axisMoveName},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 获取焊缝起点
                    case this.nodeTitleList[107].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[107].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[147];
                            return;
                        }
                        const axisMoveName = this.axisMoveData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `MoveToLaserRecordStart(${axisMoveName},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 电弧跟踪关闭
                    // 电弧跟踪开启
                    case this.nodeTitleList[108].name:
                    case this.nodeTitleList[109].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[209];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[180];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[182];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[184];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[186];
                            return;
                        }
                        if (!this.handleInputs(inputPins[7])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[181];
                            return;
                        }
                        if (!this.handleInputs(inputPins[8])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[183];
                            return;
                        }
                        if (!this.handleInputs(inputPins[9])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[185];
                            return;
                        }
                        if (!this.handleInputs(inputPins[10])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[187];
                            return;
                        }
                        if (!this.handleInputs(inputPins[13])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[210];
                            return;
                        }
                        if (!this.handleInputs(inputPins[14])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[211];
                            return;
                        }
                        if (!this.handleInputs(inputPins[15])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[188];
                            return;
                        }
                        let arcWeldTraceControlValue = 0;
                        switch (node.customClass.type.typeOfNode) {
                            case this.nodeTitleList[108].name:
                                arcWeldTraceControlValue = 0;
                                break;
                            case this.nodeTitleList[109].name:
                                arcWeldTraceControlValue = 1;
                                break;
                            default:
                                break;
                        }
                        const weldTraceIsudName = this.weldTraceIsuplowData.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        const weldTraceIslrName = this.weldTraceIsuplowData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        const weldTraceAxisName = this.weldTraceAxisselectData.find(item => item.name == this.handleInputs(inputPins[11])).id;
                        const weldTraceReferenceTypeName = this.weldTraceReferenceTypeData.find(item => item.name == this.handleInputs(inputPins[12])).id;
                        this.script += `ArcWeldTraceControl(${arcWeldTraceControlValue},${this.handleInputs(inputPins[0])},${weldTraceIsudName},${this.handleInputs(inputPins[2])},`
                        this.script += `${this.handleInputs(inputPins[3])},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},`
                        this.script += `${weldTraceIslrName},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${weldTraceAxisName},`
                        if (weldTraceReferenceTypeName == 0) {
                            this.script += `${weldTraceReferenceTypeName},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])},10)\n`;
                        } else {
                            this.script += `${weldTraceReferenceTypeName},4,1,${this.handleInputs(inputPins[15])})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 关闭调整
                    case this.nodeTitleList[110].name: {
                        const techPlateTypeName = this.techPlateType.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `PostureAdjustOff(${techPlateTypeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 开启调整
                    case this.nodeTitleList[111].name: {
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[189];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[190];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[191];
                            return;
                        }
                        if (!this.handleInputs(inputPins[6])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[192];
                            return;
                        }
                        if (!this.handleInputs(inputPins[7])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[193];
                            return;
                        }
                        if (!this.handleInputs(inputPins[8])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[111].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[194];
                            return;
                        }
                        const techPlateTypeName = this.techPlateType.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        const techMotionDirectionName = this.techMotionDirection.find(item => item.name == this.handleInputs(inputPins[1])).id;
                        const infPointTypeName = this.infPointType.find(item => item.name == this.handleInputs(inputPins[4])).id;
                        if (techMotionDirectionName == 0) {
                            this.script += `PostureAdjustOn(${techPlateTypeName},PosA,PosB,PosC,${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},`
                            this.script += `${infPointTypeName},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])})\n`;
                        } else {
                            this.script += `PostureAdjustOn(${techPlateTypeName},PosA,PosC,PosB,${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},`
                            this.script += `${infPointTypeName},${this.handleInputs(inputPins[5])},${this.handleInputs(inputPins[6])},${this.handleInputs(inputPins[7])},${this.handleInputs(inputPins[8])})\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焊丝寻位结束
                    case this.nodeTitleList[112].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[112].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[75];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[112].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[76];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[112].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[77];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[112].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[78];
                            return;
                        }
                        const wireRefPosName = this.wireRefPosData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        const wireSearchBackFlagName = this.wireSearchBackFlagData.find(item => item.name == this.handleInputs(inputPins[3])).id;
                        const wireSearchModeName = this.wireSearchModeData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        this.script += `WireSearchEnd(${wireRefPosName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${wireSearchBackFlagName},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${wireSearchModeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焊丝寻位开始
                    case this.nodeTitleList[113].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[113].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[75];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[113].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[76];
                            return;
                        }
                        if (!this.handleInputs(inputPins[4])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[113].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[77];
                            return;
                        }
                        if (!this.handleInputs(inputPins[5])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[113].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[78];
                            return;
                        }
                        const wireRefPosName = this.wireRefPosData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        const wireSearchBackFlagName = this.wireSearchBackFlagData.find(item => item.name == this.handleInputs(inputPins[3])).id;
                        const wireSearchModeName = this.wireSearchModeData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        this.script += `WireSearchStart(${wireRefPosName},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${wireSearchBackFlagName},${this.handleInputs(inputPins[4])},${this.handleInputs(inputPins[5])},${wireSearchModeName})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 寻位点设置指南(a点、b点、c点、d点、e点、f点)
                    case this.nodeTitleList[114].name:
                    case this.nodeTitleList[115].name:
                    case this.nodeTitleList[116].name:
                    case this.nodeTitleList[117].name:
                    case this.nodeTitleList[118].name:
                    case this.nodeTitleList[119].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[91];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[112];
                            return;
                        }
                        if (this.handleInputs(inputPins[2]) == 'true' && !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[113];
                            return;
                        }
                        const weldRecordName = this.weldRecordData.find(item => item.name == this.handleInputs(inputPins[6])).id;
                        const TplateName = this.TplateType.find(item => item.name == this.handleInputs(inputPins[7])).id;
                        const offsetFlagName = this.offsetFlagData.find(item => item.name == this.handleInputs(inputPins[8])).id;
                        if (offsetFlagName > 0 && (!this.handleInputs(inputPins[9]) || !this.handleInputs(inputPins[10]) || !this.handleInputs(inputPins[11]) || !this.handleInputs(inputPins[12]) || !this.handleInputs(inputPins[13]) || !this.handleInputs(inputPins[14]) )) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = node.customClass.type.typeOfNode;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[114];
                            return;
                        }
                        if (this.handleInputs(inputPins[0]) == "seamPos") {
                            if (offsetFlagName == 0) {
                                this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${weldRecordName},${TplateName},${offsetFlagName})\n`;
                            } else {
                                this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},${weldRecordName},${TplateName},${offsetFlagName},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])})\n`;
                            }
                        } else {
                            if (this.handleInputs(inputPins[4]) == "false") {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName})\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},0,${offsetFlagName},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])})\n`;
                                }
                            } else {
                                if (offsetFlagName == 0) {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                } else {
                                    this.script += `Lin(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2]) == 'true' ? -1 : this.handleInputs(inputPins[3])},1,${offsetFlagName},${this.handleInputs(inputPins[9])},${this.handleInputs(inputPins[10])},${this.handleInputs(inputPins[11])},${this.handleInputs(inputPins[12])},${this.handleInputs(inputPins[13])},${this.handleInputs(inputPins[14])})\n`;
                                    this.script += `WireSearchWait(\"${this.handleInputs(inputPins[5])}\")\n`;
                                }
                            }
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 计算偏移量(角焊缝)
                    case this.nodeTitleList[120].name: {
                        const wireSearchTypeName = this.wireSearchType1MethodData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        switch (wireSearchTypeName) {
                            case "0":
                                this.script += `GetWireSearchOffset(0,${wireSearchTypeName},\"${this.handleInputs(inputPins[1])}\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[4])}\",\"#\",\"#\",\"#\",\"#\",\"#\")\n`;
                                break;
                            case "1":
                                this.script += `GetWireSearchOffset(0,${wireSearchTypeName},\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"#\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[4])}\",\"${this.handleInputs(inputPins[5])}\",\"#\",\"#\",\"#\",\"#\")\n`;
                                break;
                            case "2":
                                this.script += `GetWireSearchOffset(0,${wireSearchTypeName},\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"${this.handleInputs(inputPins[3])}\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[4])}\",\"${this.handleInputs(inputPins[5])}\",\"${this.handleInputs(inputPins[6])}\",\"#\",\"#\",\"#\")\n`;
                                break;
                            case "3":
                                this.script += `GetWireSearchOffset(0,${wireSearchTypeName},\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"${this.handleInputs(inputPins[3])}\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[4])}\",\"${this.handleInputs(inputPins[5])}\",\"${this.handleInputs(inputPins[6])}\",\"#\",\"#\",\"#\")\n`;
                                break;
                            default:
                                break;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 计算偏移量(内外径)
                    case this.nodeTitleList[121].name: {
                        const wireSearchTypeName = this.wireSearchType2MethodData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `GetWireSearchOffset(1,${wireSearchTypeName},\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"${this.handleInputs(inputPins[3])}\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[4])}\",\"${this.handleInputs(inputPins[5])}\",\"${this.handleInputs(inputPins[6])}\",\"#\",\"#\",\"#\")\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 计算偏移量(点)
                    case this.nodeTitleList[122].name: {
                        const wireSearchTypeName = this.wireSearchType3MethodData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `GetWireSearchOffset(2,${wireSearchTypeName},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"#\",\"#\",\"#\",\"#\")\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 计算偏移量(相机)
                    case this.nodeTitleList[123].name: {
                        const wireSearchTypeName = this.wireSearchType4MethodData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `GetWireSearchOffset(3,${wireSearchTypeName},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"#\",\"#\",\"#\",\"#\")\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 计算偏移量(面)
                    case this.nodeTitleList[124].name: {
                        const wireSearchTypeName = this.wireSearchType5MethodData.find(item => item.name == this.handleInputs(inputPins[0])).id;
                        this.script += `GetWireSearchOffset(4,${wireSearchTypeName},\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"${this.handleInputs(inputPins[1])}\",\"${this.handleInputs(inputPins[2])}\",\"${this.handleInputs(inputPins[3])}\",\"${this.handleInputs(inputPins[4])}\",\"${this.handleInputs(inputPins[5])}\",\"${this.handleInputs(inputPins[6])}\")\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 接触点数据写入
                    case this.nodeTitleList[125].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[125].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[79];
                            return;
                        }
                        this.script += `SetPointToDatabase(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 点位表模式
                    case this.nodeInputTitles.auxiliary._point_table_mode: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeInputTitles.auxiliary._point_table_mode;
                            this.nodeLuaErrorString = langJsonData.teaching_management.info_messages[7];
                            return;
                        }
                        this.script += `PointTableSwitch('${this.handleInputs(inputPins[0])}')\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 系统模式
                    case this.nodeInputTitles.auxiliary._system_mode: {
                        this.script += `PointTableSwitch('')\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 焦点跟随
                    case this.programCommandArray[56].name: {
                        if (!this.handleInputs(inputPins[0])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[56].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[247];
                            return;
                        }
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[56].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[247];
                            return;
                        }
                        if (!this.handleInputs(inputPins[2])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[56].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[247];
                            return;
                        }
                        if (!this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.programCommandArray[56].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[247];
                            return;
                        }
                        let directionValue = this.lockXPointModeData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].id;
                        this.script += `FocusStart(${this.handleInputs(inputPins[0])},${this.handleInputs(inputPins[1])},${this.handleInputs(inputPins[2])},${this.handleInputs(inputPins[3])},${directionValue})\n`;
                        this.coreAlgorithm(execOutPins[0]);
                        this.script += `FocusEnd()\n`;
                        this.coreAlgorithm(execOutPins[1]);
                        break;
                    }
                    // 设置DO
                    case this.nodeTitleList[14].name: {
                        let state = `${this.handleInputs(inputPins[1]) == 'false' ? 0 : 1}`;
                        let portValue = this.doData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let blockValue = this.blockData.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let smoothValue = this.setIOModeData.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
                        let whetherValue = this.whetherData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        if(blockValue == 0) {
                            if(portValue > 15) {
                                this.script += `SetToolDO(${portValue - 16}`;
                                this.script += `,${state}`;
                                this.script += `,${smoothValue}`;
                                this.script += `,${whetherValue}`;
                            } else {
                                this.script += `SetDO(${portValue}`;
                                this.script += `,${state}`;
                                this.script += `,${smoothValue}`;
                                this.script += `,${whetherValue}`;
                            }
                                this.script += `)\n`;
                        } else {
                            if(portValue > 15) {
                                this.script += `SPLCSetToolDO(${portValue - 16}`;
                                this.script += `,${state}`;
                            } else {
                                this.script += `SPLCSetDO(${portValue}`;
                                this.script += `,${state}`;
                            }
                                this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                    // 设置AO
                    case this.nodeTitleList[17].name: {
                        if (!this.handleInputs(inputPins[1])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[17].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[41];
                            return;
                        }
                        let portValue = this.aoPort.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let blockValue = this.blockData.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                        let whetherValue = this.whetherData.filter(item => item.name == `${this.handleInputs(inputPins[3])}`)[0].num;
    
                        if(blockValue == 1) {
                            if(portValue > 1) {
                                this.script += `SPLCSetToolAO(${portValue - 2}`;
                                this.script += `,${this.handleInputs(inputPins[1])}`;
                            } else {
                                this.script += `SPLCSetAO(${portValue}`;
                                this.script += `,${this.handleInputs(inputPins[1])}`;
                            }
                                this.script += `)\n`;
                        } else {
                            if(portValue > 1) {
                                this.script += `SetToolAO(${portValue - 2}`;
                                this.script += `,${this.handleInputs(inputPins[1])}`;
                                this.script += `,${whetherValue}`;
                            } else {
                                this.script += `SetAO(${portValue}`;
                                this.script += `,${this.handleInputs(inputPins[1])}`;
                                this.script += `,${whetherValue}`;
                            }
                            this.script += `)\n`;
                        }
                        this.coreAlgorithm(execOutPins[0]);
                        break;
                    }
                }
            }
        }
        handleInputs(inputNode) {
    
            if (!inputNode.isWire) {
                return inputNode.node;
            }
            let inputPins = this.getInputPins(inputNode.node);
            if (inputNode.node.customClass.type.isGetSet) {
                return `${inputNode.node.customClass.type.typeOfNode.slice(4)}`;
            }
            // if (inputNode.node.customClass.type.isFor) {
            //     return `(i${inputNode.node.customClass.type.isFor})`;
            // }
            let expr = ``;
            switch (inputNode.node.customClass.type.typeOfNode) {
                case "+": {
                    expr = `(${this.handleInputs(inputPins[0])} + ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "-": {
                    expr = `(${this.handleInputs(inputPins[0])} - ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "*": {
                    expr = `(${this.handleInputs(inputPins[0])} * ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "/": {
                    expr = `(${this.handleInputs(inputPins[0])} * ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "＆": {
                    expr = `(${this.handleInputs(inputPins[0])} && ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "||": {
                    expr = `(${this.handleInputs(inputPins[0])} || ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "==": {
                    expr = `(${this.handleInputs(inputPins[0])} == ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "!=": {
                    expr = `(${this.handleInputs(inputPins[0])} != ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "＜=": {
                    expr = `(${this.handleInputs(inputPins[0])} <= ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "＜": {
                    expr = `(${this.handleInputs(inputPins[0])} < ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "＞": {
                    expr = `(${this.handleInputs(inputPins[0])} > ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                case "＞=": {
                    expr = `(${this.handleInputs(inputPins[0])} >= ${this.handleInputs(inputPins[1])})`;
                }
                    break;
                // 获取DI
                case this.nodeTitleList[15].name: {
                    if (!this.handleInputs(inputPins[4])) {
                        this.nodeLuaError = true;
                        this.nodeLuaErrorType = this.nodeTitleList[15].name;
                        this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[157];
                        return;
                    }
                    let portValue = this.diData.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                    let blockValue = this.blockData.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                    let whetherValue = this.whetherData.filter(item => item.name == `${this.handleInputs(inputPins[2])}`)[0].num;
                    let state = `${this.handleInputs(inputPins[3]) == 'false' ? 0 : 1}`;

                    if(blockValue == 1) {
                        if(portValue > 15) {
                            expr += `SPLCGetToolDI(${portValue - 15}`;
                            expr += `,${state}`;
                            expr += `,${this.handleInputs(inputPins[4])}`;
                        } else {
                            expr += `SPLCGetDI(${portValue}`;
                            expr += `,${state}`;
                            expr += `,${this.handleInputs(inputPins[4])}`;
                        }
                            expr += `)`;
                    } else {
                        if(portValue > 15) {
                            expr += `GetToolDI(${portValue - 15}`;
                            expr += `,${whetherValue}`;
                        } else {
                            expr += `GetDI(${portValue}`;
                            expr += `,${whetherValue}`;
                        }
                        expr += `)`;
                    }
                }
                    break;
                // 获取AI
                case this.nodeTitleList[18].name: {
                        if (!this.handleInputs(inputPins[2]) || !this.handleInputs(inputPins[3])) {
                            this.nodeLuaError = true;
                            this.nodeLuaErrorType = this.nodeTitleList[18].name;
                            this.nodeLuaErrorString = this.nodeDynamicTags.info_messages[42];
                            return;
                        }
                        let portValue = this.aiPort.filter(item => item.name == `${this.handleInputs(inputPins[0])}`)[0].num;
                        let aiCompareValue = this.aiCompare.filter(item => item.name == `${this.handleInputs(inputPins[1])}`)[0].num;
                        let blockValue = this.blockData.filter(item => item.name == `${this.handleInputs(inputPins[4])}`)[0].num;
                        let whetherValue = this.whetherData.filter(item => item.name == `${this.handleInputs(inputPins[5])}`)[0].num;
                        if(blockValue == 1) {
                            if(portValue > 1) {
                                expr += `SPLCGetToolAI(${portValue - 2}`;
                                expr += `,${aiCompareValue}`;
                                expr += `,${this.handleInputs(inputPins[2])}`;
                                expr += `,${this.handleInputs(inputPins[3])}`;
                            } else {
                                expr += `SPLCGetAI(${portValue}`;
                                expr += `,${aiCompareValue}`;
                                expr += `,${this.handleInputs(inputPins[2])}`;
                                expr += `,${this.handleInputs(inputPins[3])}`;
                            }
                                expr += `)`;
                        } else {
                            if(portValue > 1) {
                                expr += `GetToolAI(${portValue - 2}`;
                                expr += `,${whetherValue}`;
                            } else {
                                expr += `GetAI(${portValue}`;
                                expr += `,${whetherValue}`;
                            }
                            expr += `)`;
                        }
                    }
                        break;
            }
            return expr;
        }
    }

    return VSToLua;
}])