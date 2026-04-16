frapp.factory('Nodes', ['InputBox', 'colorMap', function (InputBox, colorMap) {
    let Nodes = {};

    Nodes.countNodes = 0;
    Nodes.placeLocation = function (location) {
        //"this" is stage
        return {
            x: (location.x - this.x()) / this.scaleX(),
            y: (location.y - this.y()) / this.scaleY()
        };
    }
    Nodes.getExecPin = function (inType, helper, layer) {
        // let pointsExecIn = [0, 0, -14, -7, -14, 7];
        // let pointsExecOut = []
        let pin = new Konva.Line({
            points: [0, 0, -14, -7, -14, 7],
            stroke: 'white',
            strokeWidth: 2,
            hitStrokeWidth: 10,
            closed: true,
            helper: helper,
            name: 'pin',
            offsetX: (inType) ? -14 : 0,
            pinType: (inType) ? 'exec-in' : 'exec-out',
            pinDataType: null,
            fill: '',
        });
        pin.on("mouseenter", () => {
            pin.strokeWidth(4);
            layer.draw();
        });
        pin.on("mouseleave", () => {
            pin.strokeWidth(2);
            layer.draw();
        });
        pin.on("wireremoved", (e) => {
            if (e.isPinEmpty) {
                pin.fill('transparent');
            }
        });
        pin.on("wireconnected", (e) => {
            pin.strokeWidth(2);
            pin.fill("white");
        });
        pin.on("wiringstart", (e) => {
            pin.fill("white");
            layer.draw();
        });
        pin.on("touchstart", () => {
            pin.strokeWidth(4);
            layer.draw();
        });
        pin.on("touchend", () => {
            pin.strokeWidth(2);
            layer.draw();
        });
        pin.on("touchemove", (e) => {
            if (e.isPinEmpty) {
                pin.fill('transparent');
            }
        });
        return pin;
    }
    Nodes.getRectBlock = function (height, width) {
        let rect = new Konva.Rect({
            height: height,
            width: width,
            // fill: colorMap['MainBox'],
            opacity: 0.8,
            cornerRadius: 5,
            shadowColor: 'black',
            shadowBlur: 15,
            shadowOffset: { x: 15, y: 15 },
            shadowOpacity: 0.5,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: width, y: height },
            fillLinearGradientColorStops: [0, colorMap['MainBoxGradient']['start'], 1, colorMap['MainBoxGradient']['end']],
            // fillLinearGradientColorStops: [0, '#12100e', 1, '#2b4162'],

            // strokeWidth: [10, 10, 110, 0],
        });
        return rect;
    }
    Nodes.getInputPin = function (inType, helper, type, layer) {
        let pin = new Konva.Circle({
            radius: 7,
            stroke: colorMap[type],
            strokeWidth: 2,
            hitStrokeWidth: 10,
            name: 'pin',
            pinType: (inType) ? 'inp' : 'outp',
            pinDataType: type,
            offsetX: (inType) ? -7 : 7,
            helper: helper,
            fill: '',
        });
        pin.on("mouseenter", () => {
            pin.strokeWidth(4);
            layer.draw();
        });
        pin.on("mouseleave", () => {
            pin.strokeWidth(2);
            layer.draw();
        });
        pin.on("wireremoved", (e) => {
            if (e.isPinEmpty) {
                pin.fill('transparent');
            }
        });
        pin.on("wireconnected", (e) => {
            pin.fill(`${colorMap[type]}`);
        });
        pin.on("wiringstart", (e) => {
            pin.fill(`${colorMap[type]}`);
            layer.draw();
        });
        return pin;
    }
    // getOutputPin: function(){
    //     let pin = new Konva.Circle({
    //         radius: 7,
    //         stroke: 'yellow',
    //         strokeWidth: '2',
    //         name: 'pin',
    //         pinType: 'outp',
    //     });
    //     return pin;
    // },
    Nodes.getLabel = function (text, size, width, color) {
        let rect = new Konva.Rect({
            width: width,
            height: size + 16,
            fill: colorMap[color],
            cornerRadius: [5, 5, 0, 0],
            // fillLinearGradientStartPoint: { x: 0, y: 0 },
            // fillLinearGradientEndPoint: { x: width, y: size + 3 },
            // fillLinearGradientColorStops: [0, colorMap[color], 1, 'rgba(0, 0, 0, 0)'],
            // fillRadialGradientStartPoint: {x: 0, y: 0},
            // fillRadialGradientEndPoint: { x: 30, y: 0 },
            // fillRadialGradientColorStops: [0, colorMap[color], 1, '#2d3436'],
            // fillRadialGradientStartRadius: size / 3,
            // fillRadialGradientEndRadius: 100,

            // fillLinearGradientColorStops: [0, '#9e768f', 1, '#ff4e00'],

            // #ec9f05 #ff4e00
        });
        let label = new Konva.Text({
            text: text,
            fontSize: size - 5,
            fontFamily: 'Verdana',
            fill: colorMap['MainLabel'],
            width: width,
            // height: size + 3,
            y: 2,
            align: 'left',
            padding: 3,
            wrap: 'char'
            // padding: 10
        });
        return { bg: rect, text: label };
    }
    Nodes.getPinCounts = function (nodeDescription) {
        let inputPinCounts = 0;
        let outputPinCounts = 0;
        if (nodeDescription.execIn)
            inputPinCounts++;
        if (nodeDescription.inputs) {
            inputPinCounts += Object.keys(nodeDescription.inputs).length;
        }

        //For outputs
        if (nodeDescription.execOut) {
            outputPinCounts += Object.keys(nodeDescription.execOut).length;
        }
        if (nodeDescription.outputs) {
            outputPinCounts += Object.keys(nodeDescription.outputs).length;

        }
        return Math.max(inputPinCounts, outputPinCounts);
    }
    // getEditableTextBox: function (type, stage, index) {
    //     let rect = new Konva.Rect({
    //         width: (type == 'Boolean') ? 14 : 50,
    //         height: 14,
    //         stroke: colorMap[type],
    //         strokeWidth: 1,
    //     });
    //     return rect;
    // },
    Nodes.getInputLabel = function (labelText, isInput, layer) {
        const textSliceNum = window.sessionStorage.getItem("langCode") == 'ko' ? 20 : 30;
        const tempLabelText = labelText ? labelText : '';
        let text = new Konva.Text({
            // width: 40,
            height: 14,
            text: `${tempLabelText.substring(0, textSliceNum)}${tempLabelText.length > textSliceNum ? '...' : ''}`,
            fontSize: 11,
            fontFamily: 'Verdana',
            fill: colorMap['Text'],
        });
        text.on("mouseenter", () => {
            text.text(tempLabelText);
            layer.draw();
        });
        text.on("mouseleave", () => {
            text.text(`${tempLabelText.substring(0, textSliceNum)}${tempLabelText.length > textSliceNum ? '...' : ''}`);
            layer.draw();
        });
        if (isInput)
            text.offsetX(0);
        else
            text.offsetX(text.width());
        // text.off()
        return text;
    }
    Nodes.getExecOutTitle = function (labelText) {
        let text = new Konva.Text({
            height: 14,
            fontSize: 11,
            text: labelText,
            fontFamily: 'Verdana',
            fill: "white",
        });
        text.offsetX(text.width());
        return text;
    }
    Nodes.optimizeDrag = function (grp, stage, layer) {
        let dragLayer = stage.findOne('#dragLayer');
        let wireLayer = stage.findOne('#wireLayer');
        grp.on('dragstart', () => {
            document.getElementById("nodeEditorFileName").focus();
            document.getElementById("nodeEditorFileName").blur();
            grp.moveTo(dragLayer);
            for (let each of grp.customClass.execInPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(dragLayer);
                }
            }
            for (let each of grp.customClass.execOutPins) {
                if (each.wire)
                    each.wire.moveTo(dragLayer);
            }
            for (let each of grp.customClass.inputPins) {
                if (each.wire)
                    each.wire.moveTo(dragLayer);
            }
            for (let each of grp.customClass.outputPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(dragLayer);
                }
            }
            wireLayer.draw();
            dragLayer.draw();
            layer.draw();
            // try {
            //     if (layer.hasChildren())
            //         layer.cache();
            //     if (wireLayer.hasChildren())
            //         wireLayer.cache();
            // }
            // catch (err) {

            // }
        })
        grp.on('dragend', () => {
            grp.moveTo(layer);
            for (let each of grp.customClass.execInPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(wireLayer);
                }
            }
            for (let each of grp.customClass.execOutPins) {
                if (each.wire)
                    each.wire.moveTo(wireLayer);
            }
            for (let each of grp.customClass.inputPins) {
                if (each.wire)
                    each.wire.moveTo(wireLayer);
            }
            for (let each of grp.customClass.outputPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(wireLayer);
                }
            }
            // layer.clearCache();
            // wireLayer.clearCache();
            wireLayer.draw();
            dragLayer.draw();
            layer.draw();
        });
    }
    Nodes.getBorderRect = function (height, width) {
        let rect = new Konva.Rect({
            height: height,
            width: width,
            fill: 'transparent',
            stroke: '#dbd8e3',
            strokeWidth: 0,
            cornerRadius: 5,
            name: 'borderbox',
        });
        rect.off('click mouseover mouseenter mouseleave');
        return rect;
    }
    Nodes.ProgramNode = class {
        constructor(nodeDescription, location, layer, stage) {
            this.grp = new Konva.Group({
                draggable: true,
                name: "aProgramNodeGroup",
            });
            if (nodeDescription.nodeTitle == 'Begin') {
                this.grp.id('Begin');
            }
            this.grp.customClass = this;
            // this.grp.on('dblclick', (e) => {
            //     console.table(e.currentTarget.customClass);
            // })
            this.nodeDescription = nodeDescription;
            let relativePosition = Nodes.placeLocation.bind(stage);
            let maxOfPinsOnEitherSide = Nodes.getPinCounts(nodeDescription);
            let height = maxOfPinsOnEitherSide * 50 + 15;
            let width = nodeDescription.colums * 20;
            this.grp.position(relativePosition(location));
            let rect = Nodes.getRectBlock(height, width);
            this.grp.add(rect);
            let borderRect = Nodes.getBorderRect(height, width);
            let titleLabel = Nodes.getLabel(nodeDescription.nodeTitle, 20, width, nodeDescription.color);
            this.grp.add(titleLabel.bg);
            this.grp.add(titleLabel.text);
            this.grp.add(borderRect);

            this.grp.on("mouseover", (e) => {
                // console.log(e);
                // if(shape == this.grp)
                borderRect.strokeWidth(1);
                layer.draw();
            });
            this.grp.on("mouseleave", (e) => {
                // rect.opacity(0.9);
                // rect.shadowOffset({ x: 15, y: 15 });
                // this.grp.scale(1);
                // this.grp.filters([]);
                borderRect.strokeWidth(0);
                layer.draw();
            });
            this.grp.on('mousedown', (e) => {
                rect.shadowBlur(25);
                // rect.shadowOffset({ x: 25, y: 25 });
                layer.draw();
            })
            this.grp.on('mouseup', (e) => {
                rect.shadowBlur(15);
                // rect.shadowOffset({ x: 15, y: 15 });
                layer.draw();
            })
            /****/

            Nodes.optimizeDrag(this.grp, stage, layer);

            /****/
            // titleLabel.offsetX(titleLabel.width() / 2);
            let inputPinsPlaced = 0, outputPinsPlaced = 0;
            this.execInPins = [];
            if (nodeDescription.execIn == true) {
                let execInPin = Nodes.getExecPin(true, 'exec-in-0', layer);
                execInPin.position({ x: 7, y: 54 });
                if (nodeDescription.pinExecInId == null) {
                    execInPin.id(`${execInPin._id}`);
                }
                else {
                    execInPin.id(nodeDescription.pinExecInId);
                }
                this.nodeDescription.pinExecInId = execInPin.id();
                this.grp.add(execInPin);
                let tmp = {
                    thisNode: execInPin,
                    wire: [],
                }
                this.execInPins.push(tmp);
                inputPinsPlaced = 1;
            }

            let X = nodeDescription.nodeTitle.split(" ");
            this.type = {
                isGetSet: (X[0] == 'Get' || X[0] == 'Set'),
                typeOfNode: nodeDescription.nodeTitle,
            }
            this.execOutPins = [];
            if (nodeDescription.execOut) {
                Object.keys(nodeDescription.execOut).forEach((value, index) => {
                    let execOutPin = Nodes.getExecPin(false, `exec-out-${index}`, layer);
                    execOutPin.position({ x: width - 7, y: 54 + nodeDescription.execOut[value].outOrder * 39 });
                    if (nodeDescription.execOut[value].pinExecOutId == null) {
                        execOutPin.id(`${execOutPin._id}`);
                    }
                    else {
                        execOutPin.id(nodeDescription.execOut[value].pinExecOutId);
                    }
                    this.nodeDescription.execOut[value].pinExecOutId = execOutPin.id();
                    this.grp.add(execOutPin);
                    if (nodeDescription.execOut[value].execOutTitle) {
                        let exLabel = Nodes.getExecOutTitle(nodeDescription.execOut[value].execOutTitle);
                        exLabel.position({ x: width - 28, y: 54 + nodeDescription.execOut[value].outOrder * 39 - 4 });
                        this.grp.add(exLabel);
                    }
                    let tmp = {
                        thisNode: execOutPin,
                        wire: null,
                        title: value.execOutTitle,
                    }
                    this.execOutPins.push(tmp);
                    outputPinsPlaced++;
                });
            }
            this.inputPins = [];
            if (nodeDescription.inputs) {
                Object.keys(nodeDescription.inputs).forEach((value, index) => {
                    let inputPin = Nodes.getInputPin(true, `inp-${index}`, nodeDescription.inputs[value].dataType, layer);
                    inputPin.position({ x: 7, y: 54 + 39 * inputPinsPlaced });
                    if (nodeDescription.inputs[value].pinInId == null) {
                        inputPin.id(`${inputPin._id}`);
                    }
                    else {
                        inputPin.id(nodeDescription.inputs[value].pinInId);
                    }
                    this.nodeDescription.inputs[value].pinInId = inputPin.id();
                    // iprect.position({ x: 28, y: 44 + 39 * inputPinsPlaced - 2 });
                    let iprect = null;
                    let iplabel = Nodes.getInputLabel(nodeDescription.inputs[value].inputTitle, true, layer);
                    iplabel.position({ x: 28, y: 54 + 39 * inputPinsPlaced - 4 });
                    if (nodeDescription.inputs[value].isInputBoxRequired !== false) {
                        iprect = new InputBox(stage, layer, nodeDescription.inputs[value].dataType, this.grp, { x: 28, y: 54 + 39 * inputPinsPlaced - 2 }, colorMap, inputPin, iplabel, inputPinsPlaced, nodeDescription.inputs[value], this.nodeDescription.inputs[value]);
                        iplabel.position({ x: 28, y: 54 + 39 * inputPinsPlaced - 14 });
                    }
                    this.grp.add(iplabel);
                    this.grp.add(inputPin);
                    // this.grp.add(iprect);
                    let tmp = {
                        thisNode: inputPin,
                        wire: null,
                        textBox: iprect,
                        value: null,
                        title: value.inputTitle,
                    }
                    this.inputPins.push(tmp);
                    inputPinsPlaced++;
                });
            }
            this.outputPins = [];
            if (nodeDescription.outputs) {
                Object.keys(nodeDescription.outputs).forEach((value, index) => {
                    let outputPin = Nodes.getInputPin(false, `out-${index}`, nodeDescription.outputs[value].dataType, layer);
                    outputPin.position({ x: width - 7, y: 54 + 39 * nodeDescription.outputs[value].outOrder });
                    if (nodeDescription.outputs[value].pinOutId == null) {
                        outputPin.id(`${outputPin._id}`);
                    }
                    else {
                        outputPin.id(nodeDescription.outputs[value].pinOutId);
                    }
                    nodeDescription.outputs[value].pinOutId = outputPin.id();
                    this.grp.add(outputPin);
                    let outLabel = Nodes.getInputLabel(nodeDescription.outputs[value].outputTitle, false, layer);
                    outLabel.position({ x: width - 28, y: 54 + 39 * nodeDescription.outputs[value].outOrder - 4 })
                    this.grp.add(outLabel);
                    let tmp = {
                        wire: [],
                        value: null,
                        title: value.outputTitle,
                    }
                    this.outputPins.push(tmp);
                    outputPinsPlaced++;
                })
            };
            // this.grp.cache();
            layer.add(this.grp);
            layer.draw();
            layer.draw();
            // console.log(JSON.parse(JSON.stringify(this.grp)));
        }
    }
    Nodes.CreateNode = function (type, location, layer, stage, isGetSet, dataType, defValue) {
        let nodeDynamicTags = langJsonData.program_teach;
        let nodeInputTitles = langJsonData.commandlist.nodeEditorCommands;
        let programCommandArray = nodeDynamicTags.var_object.program_command_array; //指令名称列表
        let torqueSmoothType = nodeDynamicTags.var_object.torqueSmoothTypeData; //扭矩平滑选择列表
        let weldRecordData = nodeDynamicTags.var_object.weldRecordData;
        let TplateType = nodeDynamicTags.var_object.TplateType;
        let offsetFlagData = nodeDynamicTags.var_object.offsetFlagData;
        let treatStrategyData = nodeDynamicTags.var_object.treatStrategyData;
        let offsetTypeData = nodeDynamicTags.var_object.offsetTypeData;
        let offsetFlagLaserData = nodeDynamicTags.var_object.offsetFlagLaserData;
        let servoCModeData = nodeDynamicTags.var_object.servoCModeData;
        let newSplineModeData = nodeDynamicTags.var_object.newSplineModeData;
        let spiralDirectionData = nodeDynamicTags.var_object.spiralDirectionData;
        let nSpiralOffsetFlagData = nodeDynamicTags.var_object.nSpiralOffsetFlagData;
        let outputMoveDOModeData = nodeDynamicTags.var_object.outputMoveDOModeData;
        let lockXPointModeData = nodeDynamicTags.var_object.lockXPointModeData;
        let nodeTitleList = langJsonData.commandlist.commandName;
        let trajectoryJMode = langJsonData.commandlist.trajectoryJMode;
        let wireSearchRef_ResPointData = langJsonData.commandlist.wireSearchRef_ResPointData;
        let ConTrackModeData = nodeDynamicTags.var_object.ConTrackModeData;
        let enableData = nodeDynamicTags.var_object.enableData;
        let polishCommandModeData = langJsonData.commandlist.polishCommandMode;
        let axisMoveData = [
            {
                id: "0",
                name: "PTP"
            },
            {
                id: "1",
                name: "Lin"
            }
        ];
        let ZeroModeData = nodeDynamicTags.var_object.ZeroModeData;
        let auxServoCommandIdData = langJsonData.commandlist.auxServoCommandId;
        let auxServoCommandModeData = langJsonData.commandlist.auxServoCommandMode;
        let servoEnableData = nodeDynamicTags.var_object.servoEnableData;
        let IOTypeDict = langJsonData.commandlist.IOTypeDict;
        let WeldIdData = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]
        let functionModeData = nodeDynamicTags.var_object.functionModeData;
        let segmentModeData = nodeDynamicTags.var_object.segmentModeData;
        let weaveModeData = nodeDynamicTags.var_object.weaveModeData;
        let roundingRuleData = nodeDynamicTags.var_object.roundingRuleData;
        let protocolData = nodeDynamicTags.var_object.protocolData;
        let functionTypeData = nodeDynamicTags.var_object.functionTypeData;
        let SerachDistData = langJsonData.commandlist.SerachDistData;
        let weldTraceIsuplowData = nodeDynamicTags.var_object.weldTraceIsuplowData;
        let weldTraceAxisselectData = nodeDynamicTags.var_object.weldTraceAxisselectData;
        let weldTraceReferenceTypeData = nodeDynamicTags.var_object.weldTraceReferenceTypeData;
        let techPlateType = nodeDynamicTags.var_object.techPlateType;
        let techMotionDirection = nodeDynamicTags.var_object.techMotionDirection;
        let wireSearchBackFlagData = nodeDynamicTags.var_object.wireSearchBackFlagData;
        let wireSearchModeData = nodeDynamicTags.var_object.wireSearchModeData;
        let wireRefPosData = nodeDynamicTags.var_object.wireRefPosData;
        let wireSearchRefPointData = langJsonData.commandlist.wireSearchRefPointData;
        let wireSearchResPointData = langJsonData.commandlist.wireSearchResPointData;
        let wireSearchType1MethodData = nodeDynamicTags.var_object.wireSearchType1MethodData;
        let wireSearchType2MethodData = nodeDynamicTags.var_object.wireSearchType2MethodData;
        let xmlrpcTableTypeData = nodeDynamicTags.var_object.xmlrpcTableTypeData;
        let wireSearchType3MethodData = [
            {
                id: "6",
                name: "3D(xyz)",
            }
        ];
        let wireSearchType4MethodData = [
            {
                id: "7",
                name: "3D+(xyzrxryrz)",
            }
        ];
        let wireSearchType5MethodData = [
            {
                id: "8",
                name: "3D+(xyzrxryrz)",
            }
        ];
        let infPointType = nodeDynamicTags.var_object.infPointType;
        let descriptionData = langJsonData.commandlist["customContent"];
        let FTReferenceCoordData = nodeDynamicTags.var_object.FTReferenceCoordData;
        let FTFindSurfaceDirectionData = nodeDynamicTags.var_object.FTFindSurfaceDirectionData;
        let FTRotOrnData = nodeDynamicTags.var_object.FTRotOrnData;
        let FTControlAdjSignData = nodeDynamicTags.var_object.FTControlAdjSignData;
        let FTControlILCSignData = nodeDynamicTags.var_object.FTControlILCSignData;
        let modbusRegReadFunctionCodeData = nodeDynamicTags.var_object.modbusRegReadFunctionCodeData;
        let modbusRegWriteFunctionCodeData = nodeDynamicTags.var_object.modbusRegWriteFunctionCodeData;
        let collideModeData = nodeDynamicTags.var_object.collideModeData;
        let nodeDescription = {};
        let rsDynamicTags;
        rsDynamicTags = langJsonData.robot_setting;
        let fr5collideGradeData = rsDynamicTags.var_object.fr5collideGradeData;
        let fr3collideGradeData = rsDynamicTags.var_object.fr3collideGradeData;
        let fr10collideGradeData = rsDynamicTags.var_object.fr10collideGradeData;
        //碰撞等级设置变量初始化
        let collisionLevelData = [];
        if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
            collisionLevelData = fr3collideGradeData;
        } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
            collisionLevelData = fr5collideGradeData;
        } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
            collisionLevelData = fr10collideGradeData;
        } else {
            collisionLevelData = fr10collideGradeData;
        }
        if (type == 'Begin') {
            nodeDescription.nodeTitle = 'Begin';
            nodeDescription.execIn = false;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                }
            };
            nodeDescription.color = 'Begin';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == 'Print') {
            nodeDescription.nodeTitle = 'Print';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: "'hello'",
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Print';
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'Alert') {
            nodeDescription.nodeTitle = 'Alert';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: "'hello'",
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Print';
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'Confirm') {
            nodeDescription.nodeTitle = 'Confirm';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Message',
                    dataType: 'String',
                    defValue: "'Ok'",
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Ok?',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.color = 'Print';
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'Prompt') {
            nodeDescription.nodeTitle = 'Prompt';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Message',
                    dataType: 'String',
                    defValue: "'Ok'",
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Default',
                    dataType: 'String',
                    defValue: "'Yes'",
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Ok?',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 1,
                },
                output1: {
                    outputTitle: 'Value',
                    dataType: 'String',
                    pinOutId: null,
                    outOrder: 2,
                },
            }
            nodeDescription.color = 'Print';
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'If/Else') {
            nodeDescription.nodeTitle = 'If/Else';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'First',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Second',
                    pinExecOutId: null,
                    outOrder: 1,
                },
                execOut2: {
                    execOutTitle: 'Third',
                    pinExecOutId: null,
                    outOrder: 2,
                },
                execOut3: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 3,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'String',
                    dataType: 'Data',
                    defValue: 'true',
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'String',
                    dataType: 'Data',
                    defValue: '',
                    pinInId: null,
                },
                input2: {
                    inputTitle: 'String',
                    dataType: 'Data',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Logic';
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[2].name) {
            nodeDescription.nodeTitle = programCommandArray[2].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    dataType: 'String',
                    defValue: "",
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[2].name+'-goto') {
            nodeDescription.nodeTitle = programCommandArray[2].name+'-goto';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                output0: {
                    outputTitle: '',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    dataType: 'String',
                    defValue: "",
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[3].name) {
            nodeDescription.nodeTitle = programCommandArray[3].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                output0: {
                    outputTitle: '',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeTitleList[5].name + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[12].name) {
            nodeDescription.nodeTitle = nodeTitleList[12].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                output0: {
                    outputTitle: '',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectDIPort',
                    defValue: 'Ctrl-DI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[6].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[7].name +'(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 10000,
                },
                input3: {
                    inputTitle: descriptionData[10].name,
                    dataType: 'SelectWhetherMotion',
                    defValue: langJsonData.commandlist["WhetherMotion"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[13].name) {
            nodeDescription.nodeTitle = nodeTitleList[13].name;
            nodeDescription.execIn = true;
            nodeDescription.execOut = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                output0: {
                    outputTitle: '',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[4].name,
                    dataType: 'SelectConnection',
                    defValue: langJsonData.commandlist["ConnectionData"][0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[8].name,
                    dataType: 'String',
                    defValue: "DI0,CI0",
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[9].name,
                    dataType: 'String',
                    defValue: "DI0,CI0",
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[7].name + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 10000,
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[10].name,
                    dataType: 'SelectWhetherMotion',
                    defValue: langJsonData.commandlist["WhetherMotion"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[11].name) {
            nodeDescription.nodeTitle = nodeTitleList[11].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                output0: {
                    outputTitle: '',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectAIPort',
                    defValue: 'Ctrl-AI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[4].name,
                    dataType: 'SelectAICompare',
                    defValue: '>',
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[5].name,
                    dataType: 'Number',
                    defValue: 0,
                    min: 1,
                    max: 100,
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[7].name + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 10000,
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[10].name,
                    dataType: 'SelectWhetherMotion',
                    defValue: langJsonData.commandlist["WhetherMotion"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[4].name) {
            nodeDescription.nodeTitle = programCommandArray[4].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeTitleList[7].name,
                    dataType: 'SelectPause',
                    defValue: langJsonData.commandlist["PauseFunction"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[36].name) {
            nodeDescription.nodeTitle = nodeTitleList[36].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._dofile_lua_file,
                    dataType: 'SelectDofile',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._which_level,
                    dataType: 'SelectlayerId',
                    defValue: langJsonData.commandlist["LayerIdData"][0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._exaxis_list_id,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[39].name) {
            nodeDescription.nodeTitle = nodeTitleList[39].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Var',
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[40].name) {
            nodeDescription.nodeTitle = nodeTitleList[40].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Var',
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[5].name,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[14].name) {
            nodeDescription.nodeTitle = nodeTitleList[14].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectPort',
                    defValue: 'Ctrl-DO0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[6].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[11].name,
                    dataType: 'SelectBlock',
                    defValue: langJsonData.commandlist.IOBlockData[0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[1].name,
                    dataType: 'SelectSmooth',
                    defValue: 'Break',
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'SelectWhether',
                    defValue: langJsonData.commandlist["WhetherData"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[15].name) {
            nodeDescription.nodeTitle = nodeTitleList[15].name;
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectDIPort',
                    defValue: 'Ctrl-DI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[11].name,
                    dataType: 'SelectBlock',
                    defValue: langJsonData.commandlist.IOBlockData[0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'SelectWhether',
                    defValue: langJsonData.commandlist["WhetherData"][0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[6].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[21].name + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 10000,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[17].name) {
            nodeDescription.nodeTitle = nodeTitleList[17].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectAOPort',
                    defValue: 'Ctrl-AO0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[5].name,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100,
                },
                input2: {
                    inputTitle: descriptionData[11].name,
                    dataType: 'SelectBlock',
                    defValue: langJsonData.commandlist.IOBlockData[0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'SelectWhether',
                    defValue: langJsonData.commandlist["WhetherData"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[18].name) {
            nodeDescription.nodeTitle = nodeTitleList[18].name;
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectAIPort',
                    defValue: 'Ctrl-AI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[4].name,
                    dataType: 'SelectAICompare',
                    defValue: '>',
                    pinInId: null,
                },
                input2: {
                    inputTitle: descriptionData[5].name + '(%)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input3: {
                    inputTitle: descriptionData[7].name + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[11].name,
                    dataType: 'SelectBlock',
                    defValue: langJsonData.commandlist.IOBlockData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'SelectWhether',
                    defValue: langJsonData.commandlist["WhetherData"][0].name,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[41].name) {
            nodeDescription.nodeTitle = nodeTitleList[41].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectVirDinData',
                    defValue: 'Vir-Ctrl-DI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[6].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[42].name) {
            nodeDescription.nodeTitle = nodeTitleList[42].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectVirAinData',
                    defValue: 'Vir-Ctrl-AI0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[5].name + '(v/ma)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[43].name) {
            nodeDescription.nodeTitle = nodeTitleList[43].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectVirDinData',
                    defValue: 'Vir-Ctrl-DI0',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[44].name) {
            nodeDescription.nodeTitle = nodeTitleList[44].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectVirAinData',
                    defValue: 'Vir-Ctrl-AI0',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[45].name) {
            nodeDescription.nodeTitle = nodeTitleList[45].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[46].name) {
            nodeDescription.nodeTitle = nodeTitleList[46].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'IP',
                    dataType: 'String',
                    defValue: '192.168.58.2',
                    pinInId: null,
                },
                input1: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'Number',
                    defValue: '8080',
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._externa_modbus_communicate_period,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[27].name + nodeTitleList[130].name) {
            nodeDescription.nodeTitle = programCommandArray[27].name + nodeTitleList[130].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectPort',
                    defValue: 'Ctrl-DO0',
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._set_Interval + '(mm)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 500
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._output_pulse_duty_cycle + '(%)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 99
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[27].name + nodeTitleList[131].name) {
            nodeDescription.nodeTitle = programCommandArray[27].name + nodeTitleList[131].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: descriptionData[3].name,
                    dataType: 'SelectPort',
                    defValue: 'Ctrl-DO0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeTitleList[132].name,
                    dataType: 'SelectOutputMode',
                    defValue: outputMoveDOModeData[0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeTitleList[133].name + '(ms)',
                    dataType: 'Number',
                    defValue: 500,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input3: {
                    inputTitle: nodeTitleList[134].name + '(ms)',
                    dataType: 'Number',
                    defValue: 500,
                    pinInId: null,
                    min: 0,
                    max: 1000
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        //MoveAO
        if (type == programCommandArray[57].name) {
            nodeDescription.nodeTitle = programCommandArray[57].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._control_box_ao_number,
                    dataType: 'SelectAOPort',
                    defValue: 'Ctrl-AO0',
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._max_tcp_speed + '(mm/s)',
                    dataType: 'Number',
                    defValue: 1000,
                    pinInId: null,
                    min: 1,
                    max: 5000
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._max_tcp_speed_ao_percent + '(%)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._period_compensation_ao_percent + '(%)',
                    dataType: 'Number',
                    defValue: 20,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        // 设置工具坐标系
        if (type == nodeTitleList[8].name) {
            nodeDescription.nodeTitle = nodeTitleList[8].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._tool_name,
                    dataType: 'SelectToolCoord',
                    defValue: 'toolcoord0',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        // 设置工件坐标系
        if (type == nodeTitleList[10].name) {
            nodeDescription.nodeTitle = nodeTitleList[10].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._wobj_name,
                    dataType: 'SelectWobjToolCoord',
                    defValue: 'wobjcoord0',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[29].name) {
            nodeDescription.nodeTitle = programCommandArray[29].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: programCommandArray[29].name,
                    dataType: 'SelectRobotMode',
                    defValue: nodeInputTitles.motion.manualMode,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[30].name + '-' + collideModeData[0].name) {
            nodeDescription.nodeTitle = programCommandArray[30].name + '-' + collideModeData[0].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Joint1',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Joint2',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: 'Joint3',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: 'Joint4',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
                input4: {
                    inputTitle: 'Joint5',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: 'Joint6',
                    dataType: 'SelectCollisionLevel',
                    defValue: collisionLevelData[0].name,
                    pinInId: null,
                },
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[30].name + '-' + collideModeData[1].name) {
            nodeDescription.nodeTitle = programCommandArray[30].name + '-' + collideModeData[1].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Joint1',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input1: {
                    inputTitle: 'Joint2',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input2: {
                    inputTitle: 'Joint3',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input3: {
                    inputTitle: 'Joint4',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input4: {
                    inputTitle: 'Joint5',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
                input5: {
                    inputTitle: 'Joint6',
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 1,
                    max: 100
                },
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[31].name) {
            nodeDescription.nodeTitle = programCommandArray[31].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._debug_acc_percentage + '(%)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._torque_record_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._torque_record_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._torque_smooth,
                    dataType: 'SelectSmoothType',
                    defValue: torqueSmoothType[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: "J1" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input2: {
                    inputTitle: "J2" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input3: {
                    inputTitle: "J3" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input4: {
                    inputTitle: "J4" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input5: {
                    inputTitle: "J5" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input6: {
                    inputTitle: "J6" + nodeInputTitles.motion._torque_negative_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -100,
                    max: 0
                },
                input7: {
                    inputTitle: "J1" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input8: {
                    inputTitle: "J2" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input9: {
                    inputTitle: "J3" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input10: {
                    inputTitle: "J4" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input11: {
                    inputTitle: "J5" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input12: {
                    inputTitle: "J6" + nodeInputTitles.motion._torque_positive_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input13: {
                    inputTitle: "J1" + nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input14: {
                    inputTitle: "J2" +  nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input15: {
                    inputTitle: "J3" +  nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input16: {
                    inputTitle: "J4" +  nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input17: {
                    inputTitle: "J5" +  nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input18: {
                    inputTitle: "J6" +  nodeInputTitles.motion._collision_detection_duration,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type ==  nodeInputTitles.motion._torque_record_end) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._torque_record_end;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._torque_record_reset) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._torque_record_reset;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[82].name) {
            nodeDescription.nodeTitle = nodeTitleList[82].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue:  null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: "Fx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: "Fy",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input3: {
                    inputTitle: "Fz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input4: {
                    inputTitle: "Tx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: "Ty",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input6: {
                    inputTitle: "Tz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input7: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input8: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input9: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input10: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input11: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input12: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input13: {
                    inputTitle: "F_P_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input14: {
                    inputTitle: "F_I_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input15: {
                    inputTitle: "F_D_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input16: {
                    inputTitle: "T_P_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input17: {
                    inputTitle: "T_I_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input18: {
                    inputTitle: "T_D_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input19: {
                    inputTitle: nodeInputTitles.motion._ft_control_adj_sign,
                    dataType: 'SelectFTControlAdj',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
                input20: {
                    inputTitle: nodeInputTitles.motion._ft_control_ilc_sign,
                    dataType: 'SelectFTControlilc',
                    defValue: FTControlILCSignData[0].name,
                    pinInId: null,
                },
                input21: {
                    inputTitle: nodeInputTitles.motion._ft_control_length + "mm",
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 1000,
                    pinInId: null,
                },
                input22: {
                    inputTitle: nodeInputTitles.motion._ft_control_angle,
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 1000,
                    pinInId: null,
                },
                input23: {
                    inputTitle: nodeInputTitles.motion._filtering_waves,
                    dataType: 'SelectFTControlFilter',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
                input24: {
                    inputTitle: nodeInputTitles.motion._postural_adaptation,
                    dataType: 'SelectFTControlPA',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[83].name) {
            nodeDescription.nodeTitle = nodeTitleList[83].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue:  null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: "Fx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: "Fy",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input3: {
                    inputTitle: "Fz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input4: {
                    inputTitle: "Tx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: "Ty",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input6: {
                    inputTitle: "Tz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input7: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input8: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input9: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input10: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input11: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input12: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input13: {
                    inputTitle: "F_P_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input14: {
                    inputTitle: "F_I_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input15: {
                    inputTitle: "F_D_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input16: {
                    inputTitle: "T_P_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input17: {
                    inputTitle: "T_I_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input18: {
                    inputTitle: "T_D_gain",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input19: {
                    inputTitle: nodeInputTitles.motion._ft_control_adj_sign,
                    dataType: 'SelectFTControlAdj',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
                input20: {
                    inputTitle: nodeInputTitles.motion._ft_control_ilc_sign,
                    dataType: 'SelectFTControlilc',
                    defValue: FTControlILCSignData[0].name,
                    pinInId: null,
                },
                input21: {
                    inputTitle: nodeInputTitles.motion._ft_control_length + "mm",
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 1000,
                    pinInId: null,
                },
                input22: {
                    inputTitle: nodeInputTitles.motion._ft_control_angle,
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 1000,
                    pinInId: null,
                },
                input23: {
                    inputTitle: nodeInputTitles.motion._filtering_waves,
                    dataType: 'SelectFTControlFilter',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
                input24: {
                    inputTitle: nodeInputTitles.motion._postural_adaptation,
                    dataType: 'SelectFTControlPA',
                    defValue: FTControlAdjSignData[0].name,
                    pinInId: null,
                },
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[80].name) {
            nodeDescription.nodeTitle = nodeTitleList[80].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue:  null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: "Fx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: "Fy",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input3: {
                    inputTitle: "Fz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input4: {
                    inputTitle: "Tx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: "Ty",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input6: {
                    inputTitle: "Tz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input7: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input8: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input9: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input10: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input11: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input12: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input13: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input14: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input15: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input16: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input17: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input18: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input19: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input20: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input21: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input22: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input23: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input24: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeTitleList[81].name) {
            nodeDescription.nodeTitle = nodeTitleList[81].name;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue:  null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: "Fx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: "Fy",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input3: {
                    inputTitle: "Fz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input4: {
                    inputTitle: "Tx",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: "Ty",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input6: {
                    inputTitle: "Tz",
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input7: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input8: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input9: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input10: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input11: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input12: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_current_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input13: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input14: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input15: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input16: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input17: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input18: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_max_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input19: {
                    inputTitle: "Fx" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input20: {
                    inputTitle: "Fy" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input21: {
                    inputTitle: "Fz" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input22: {
                    inputTitle: "Tx" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input23: {
                    inputTitle: "Ty" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input24: {
                    inputTitle: "Tz" + nodeInputTitles.motion._ft_min_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ftcom_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ftcom_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._ft_compliance_adjust,
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._ft_compliance_threshold + "N",
                    dataType: 'Number',
                    defValue: 0,
                    min: 0,
                    max: 100,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ftcom_end) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ftcom_end;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ft_spiral_search_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ft_spiral_search_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectFTReference',
                    defValue: FTReferenceCoordData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle:nodeInputTitles.motion._ft_spiral_increase_turn + "mm",
                    dataType: 'Number',
                    defValue: 0.7,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._ft_spiral_force_insertion + "N/Nm",
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._ft_spiral_time_max + "ms",
                    dataType: 'Number',
                    defValue: 60000,
                    pinInId: null,
                    min: 0,
                    max: 60000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._ft_spiral_vel_speed + "mm/s",
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ft_rot_insertion_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ft_rot_insertion_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectFTReference',
                    defValue: FTReferenceCoordData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._ft_rot_ang_vel_rot + "°/s",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._ft_rot_force_insertion + "N/Nm",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._ft_rot_angle_max + "°",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._ft_rot_orn,
                    dataType: 'SelectFTRotor',
                    defValue: FTRotOrnData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._ft_rot_angle_acc_max + "°/s^2",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._ft_insert_orn,
                    dataType: 'SelectFTSurfaceDirection',
                    defValue: FTFindSurfaceDirectionData[0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ft_lin_insertion_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ft_lin_insertion_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectFTReference',
                    defValue: FTReferenceCoordData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._ft_lin_force_goal + "N",
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._ft_lin_vel + "mm/s",
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._ft_lin_acc + "mm/s^2°",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._ft_lin_distance_max + "mm",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._ft_insert_orn,
                    dataType: 'SelectFTSurfaceDirection',
                    defValue: FTFindSurfaceDirectionData[0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ft_find_surface) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ft_find_surface;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coord_name,
                    dataType: 'SelectFTReference',
                    defValue: FTReferenceCoordData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_diretcion,
                    dataType: 'SelectFTSurfaceDirection',
                    defValue: FTFindSurfaceDirectionData[0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_axis,
                    dataType: 'SelectFTSurfaceAxis',
                    defValue: 'X',
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_vel + "mm/s",
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_acc + "mm/s^2",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_distance_max + "mm",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._ft_find_surface_force_goal + "N",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ftcal_start) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ftcal_start;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.motion._ftcal_end) {
            nodeDescription.nodeTitle = nodeInputTitles.motion._ftcal_end;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._read_coils) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._read_coils;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._do_name,
                    dataType: 'SelectMasterDOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._write_coils) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._write_coils;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._do_name,
                    dataType: 'SelectMasterDOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._read_inbits) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._read_inbits;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._di_name,
                    dataType: 'SelectMasterDIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_read_ao) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_read_ao;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._ao_name,
                    dataType: 'SelectMasterAOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_write_ao) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_write_ao;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._ao_name,
                    dataType: 'SelectMasterAOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_read_ai) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_read_ai;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._ai_name,
                    dataType: 'SelectMasterAIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_wait_di) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_wait_di;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._di_name,
                    dataType: 'SelectMasterDIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._modbus_wait_state,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._modbus_timeout,
                    dataType: 'Number',
                    defValue: -1,
                    pinInId: null,
                    min: -1
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_wait_ai) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_master + nodeInputTitles.modbus._modbus_wait_ai;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_master_name,
                    dataType: 'SelectMasterAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._ai_name,
                    dataType: 'SelectMasterAIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._modbus_wait_state,
                    dataType: 'SelectAICompare',
                    defValue: '>',
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input4: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._read_coils) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._read_coils;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._do_name,
                    dataType: 'SelectSlaveDOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._write_coils) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._write_coils;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._do_name,
                    dataType: 'SelectSlaveDOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._read_inbits) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._read_inbits;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._di_name,
                    dataType: 'SelectSlaveDIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_read_ao) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_read_ao;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._ao_name,
                    dataType: 'SelectSlaveAOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_write_ao) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_write_ao;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._ao_name,
                    dataType: 'SelectSlaveAOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_read_ai) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_read_ai;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._ai_name,
                    dataType: 'SelectSlaveAOAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_num,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_wait_di) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_wait_di;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._di_name,
                    dataType: 'SelectSlaveDIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._modbus_wait_state,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._modbus_timeout,
                    dataType: 'Number',
                    defValue: -1,
                    pinInId: null,
                    min: -1
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_wait_ai) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_slave + nodeInputTitles.modbus._modbus_wait_ai;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._ai_name,
                    dataType: 'SelectSlaveAIAlias',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._modbus_wait_state,
                    dataType: 'SelectAICompare',
                    defValue: '>',
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_value,
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._modbus_timeout,
                    dataType: 'Number',
                    defValue: -1,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_rtu_read_register_command) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_rtu_read_register_command;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_rtu_function_code,
                    dataType: 'SelectModbusRegRead',
                    defValue: modbusRegReadFunctionCodeData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_rtu_get_adress,
                    dataType: 'String',
                    defValue: "",
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_rtu_get_num,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 255
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._modbus_rtu_adress,
                    dataType: 'String',
                    defValue: 0,
                    pinInId: null,
                },
                input4: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_rtu_read_register_data) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_rtu_read_register_data;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle:nodeInputTitles.modbus._register_rtu_get_num,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 255
                },
                input1: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == nodeInputTitles.modbus._modbus_rtu_write_register_data) {
            nodeDescription.nodeTitle = nodeInputTitles.modbus._modbus_rtu_write_register_data;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.modbus._modbus_rtu_function_code,
                    dataType: 'SelectModbusRegWrite',
                    defValue: modbusRegWriteFunctionCodeData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.modbus._register_rtu_write_adress,
                    dataType: 'String',
                    defValue: '',
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.modbus._register_rtu_write_num,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 255
                },
                input3: {
                    inputTitle: nodeInputTitles.modbus._modbus_rtu_array,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input4: {
                    inputTitle: nodeInputTitles.modbus._modbus_rtu_adress,
                    dataType: 'String',
                    defValue: 0,
                    pinInId: null,
                },
                input5: {
                    inputTitle: descriptionData[12].name,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '+') {
            nodeDescription.nodeTitle = '+';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Number',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '-') {
            nodeDescription.nodeTitle = '-';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Data',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '*') {
            nodeDescription.nodeTitle = '*';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Number',
                    pinOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '/') {
            nodeDescription.nodeTitle = '/';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Number',
                    pinOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == 'While') {
            nodeDescription.nodeTitle = 'While';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Condition',
                    dataType: 'Data',
                    defValue: '',
                    pinInId: null,
                },
            }
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Loop Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,

                }
            }
            nodeDescription.color = 'Logic';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '||') {
            nodeDescription.nodeTitle = '||';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: "",
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: "",
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == '＆') {
            nodeDescription.nodeTitle = '＆';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: "",
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: "",
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "==") {
            nodeDescription.nodeTitle = '==';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,

                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "!=") {
            nodeDescription.nodeTitle = '!=';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,

                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "＜=") {
            nodeDescription.nodeTitle = '＜=';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "＜") {
            nodeDescription.nodeTitle = '＜';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "＞") {
            nodeDescription.nodeTitle = '＞';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "＞=") {
            nodeDescription.nodeTitle = '＞=';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Math';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (isGetSet == "Set") {
            let defaultValueByType = {
                "Number": 0,
                "Boolean": true,
                "String": "'hello'",
                "Array": '[]',
            }
            nodeDescription.nodeTitle = type;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                    outOrder: 0,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: dataType,
                    defValue: defaultValueByType[dataType],
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Value(Ref)',
                    dataType: dataType,
                    pinOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.color = 'Func';

            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (isGetSet == "Get") {
            nodeDescription.nodeTitle = type;
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'Value(Ref)',
                    dataType: dataType,
                    pinOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.color = 'Get';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "Break") {
            nodeDescription.nodeTitle = 'Break';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.color = 'Logic';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "Continue") {
            nodeDescription.nodeTitle = 'Continue';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.color = 'Logic';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[7].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 500
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input7: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[8].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._search_flag,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._wire_search_point_name,
                    dataType: 'SelectWire',
                    defValue: wireSearchRef_ResPointData[0].name,
                    pinInId: null,
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input7: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input13: {
                    inputTitle: nodeInputTitles.motion._joint_overspeed_protect,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null
                },
                input14: {
                    inputTitle: nodeInputTitles.motion._treatment_trategy,
                    dataType: 'SelectTreatStrategy',
                    defValue: treatStrategyData[0].name,
                    pinInId: null
                },
                input15: {
                    inputTitle: nodeInputTitles.motion._allow_speed_threshold,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[8].name + '(' + nodeInputTitles.motion._trans_point_angle_adjustable + ')') {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._search_flag,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._wire_search_point_name,
                    dataType: 'SelectWire',
                    defValue: wireSearchRef_ResPointData[0].name,
                    pinInId: null,
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input7: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input13: {
                    inputTitle: nodeInputTitles.motion._trans_point_angle_adjustable,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null
                },
                input14: {
                    inputTitle: nodeInputTitles.motion._angle_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 300
                },
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[135].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPointSeam',
                    defValue: 'seamPos',
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._weld_record,
                    dataType: 'SelectWeld',
                    defValue: weldRecordData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._plate_type,
                    dataType: 'SelectTplate',
                    defValue: TplateType[0].name,
                    pinInId: null,
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffsetLaser',
                    defValue: offsetFlagLaserData[0].name,
                    pinInId: null,
                },
                input7: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[9].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._arc1_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input2: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input3: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input4: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input5: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input7: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: nodeInputTitles.motion._arc_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input9: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input10: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input13: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input14: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input15: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input16: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input17: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input18: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[10].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._offset_type,
                    dataType: 'SelectOffsetType',
                    defValue: offsetTypeData[1].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._circle1_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input4: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input5: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input7: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: nodeInputTitles.motion._circle2_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input10: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input11: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input13: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input14: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input15: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input16: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input17: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[11].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._spiral1_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._spiral2_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._spiral3_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input5: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input7: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: nodeInputTitles.motion._spiral_circle_num,
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input12: {
                    inputTitle: nodeInputTitles.motion._angle_correct_rx,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -1000,
                    max: 1000
                },
                input13: {
                    inputTitle: nodeInputTitles.motion._angle_correct_ry,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -1000,
                    max: 1000
                },
                input14: {
                    inputTitle: nodeInputTitles.motion._angle_correct_rz,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -1000,
                    max: 1000
                },
                input15: {
                    inputTitle: nodeInputTitles.motion._spiral_radius_add,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -100,
                    max: 100
                },
                input16: {
                    inputTitle: nodeInputTitles.motion._spiral_rotaxis_add,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -100,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[12].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._spiral_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectNspiral',
                    defValue: nSpiralOffsetFlagData[0].name,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._spiral_circle_num,
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._spiral_dip_angle,
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: -100,
                    max: 100
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._spiral_oringin_radius,
                    dataType: 'Number',
                    defValue: 50,
                    pinInId: null,
                    min: -100,
                    max: 100
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._spiral_radius_add,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -100,
                    max: 100
                },
                input7: {
                    inputTitle: nodeInputTitles.motion._spiral_rotaxis_add,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -100,
                    max: 100
                },
                input8: {
                    inputTitle: nodeInputTitles.motion._spiral_direction,
                    dataType: 'SelectDirection',
                    defValue: spiralDirectionData[0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[55].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._radius + '(mm)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._spiral_speed + '(rev/s)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 2
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._spiral_direction,
                    dataType: 'SelectDirection',
                    defValue: spiralDirectionData[0].name,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._dip_angle + '(deg)',
                    dataType: 'Number',
                    defValue: 20,
                    pinInId: null,
                    min: 0,
                    max: 40
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[13].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[13].name + '-SPTP') {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name + '(SPL)',
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[14].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._new_spline_mode,
                    dataType: 'SelectSplinemode',
                    defValue: newSplineModeData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._global_average_connect_time + 'ms',
                    dataType: 'Number',
                    defValue: 2000,
                    pinInId: null,
                    min: 10
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == programCommandArray[14].name + '-SPL') {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_radius,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._new_spline_last_flag,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[15].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._exaxis_list_id,
                    dataType: 'SelectWeave',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[16].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._tpd_name,
                    dataType: 'SelectTpd',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._tpd_smooth_mode,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 25,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[17].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: '△x',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input1: {
                    inputTitle: '△y',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input2: {
                    inputTitle: '△z',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input3: {
                    inputTitle: '△rx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input4: {
                    inputTitle: '△ry',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input5: {
                    inputTitle: '△rz',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                    min: -300,
                    max: 300
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[18].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._servoc_motion_mode,
                    dataType: 'SelectMove',
                    defValue: servoCModeData[0].name,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'X',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input2: {
                    inputTitle: 'Y',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input3: {
                    inputTitle: 'Z',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input4: {
                    inputTitle: 'RX',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input5: {
                    inputTitle: 'RY',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: 'RZ',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input7: {
                    inputTitle: nodeInputTitles.motion._scale_factor_x,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input8: {
                    inputTitle: nodeInputTitles.motion._scale_factor_y,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input9: {
                    inputTitle: nodeInputTitles.motion._scale_factor_z,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input10: {
                    inputTitle: nodeInputTitles.motion._scale_factor_rx,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input11: {
                    inputTitle: nodeInputTitles.motion._scale_factor_ry,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input12: {
                    inputTitle: nodeInputTitles.motion._scale_factor_rz,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input13: {
                    inputTitle: nodeInputTitles.motion._exaxis_list_acc,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input14: {
                    inputTitle: nodeInputTitles.motion._exaxis_list_speed,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input15: {
                    inputTitle: nodeInputTitles.motion._command_cycle,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0.001,
                    max: 0.016
                },
                input16: {
                    inputTitle: nodeInputTitles.motion._lookahead_time,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1
                },
                input17: {
                    inputTitle: nodeInputTitles.motion._gain,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[19].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._select_traj_file,
                    dataType: 'SelectTraj',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 25,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[20].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._select_traj_file,
                    dataType: 'SelectTraj',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 25,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._traj_mode,
                    dataType: 'SelectTrajmode',
                    defValue: trajectoryJMode[0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[21].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        // 工件转换
        if (type == programCommandArray[22].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._wobjcoord_system,
                    dataType: 'SelectWork',
                    defValue: null,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[52].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._coordinate_system,
                    dataType: 'SelectTool',
                    defValue: null,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Motion';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[47].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._gripper_number,
                    dataType: 'SelectGripper',
                    defValue: 1,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._gripper_position,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._gripper_speed,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input3: {
                    inputTitle: nodeInputTitles.pherial._gripper_moment,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.pherial._maxtime + "(ms)",
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 30000
                },
                input5: {
                    inputTitle: nodeInputTitles.pherial._whether_block,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[48].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._gripper_number,
                    dataType: 'SelectGripper',
                    defValue: 1,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[49].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._gripper_number,
                    dataType: 'SelectGripper',
                    defValue: 1,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[50].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[51].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[52].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[53].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[54].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._weld_time + '(MS)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[55].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._work_mode,
                    dataType: 'SelectTrackmode',
                    defValue: ConTrackModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[56].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._work_mode,
                    dataType: 'SelectTrackmode',
                    defValue: ConTrackModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[57].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[58].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[59].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[60].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._device_enable,
                    dataType: 'SelectEnable',
                    defValue: enableData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[61].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[62].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[63].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._rotate_speed + "(r/min)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 5500
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[64].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._set_force + "(N)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 200
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[151].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._contact_force + "(N)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[152].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._set_force_trans_time + "(ms)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[153].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._workpice_weight + "(kg)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[65].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._protrusion_distance + "(mm)",
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 12
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[66].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._control_mode,
                    dataType: 'SelectPolish',
                    defValue: polishCommandModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[67].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[68].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._externa_modbus_communicate_ip,
                    dataType: 'Sting',
                    defValue: '',
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._externa_modbus_communicate_port,
                    dataType: 'Sting',
                    defValue: '',
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._externa_modbus_communicate_period,
                    dataType: 'Sting',
                    defValue: '',
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[69].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._debug_speed,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[70].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._motion_chose,
                    dataType: 'SelectAxismove',
                    defValue: axisMoveData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[71].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._arc1_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._arc_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        
        if (type == nodeTitleList[72].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_id,
                    dataType: 'SelectAxisnumber',
                    defValue: 1,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_zero_mode,
                    dataType: 'SelectZero',
                    defValue: ZeroModeData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_search_speed + 'mm/s',
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: 0,
                    max: 2000
                },
                input3: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_latch_speed + 'mm/s',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                    min: 0,
                    max: 2000
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[73].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_id,
                    dataType: 'SelectAxisnumber',
                    defValue: 1,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[74].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[75].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._control_mode,
                    dataType: 'SelectServomode',
                    defValue: auxServoCommandModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[76].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._externa_servo_on,
                    dataType: 'SelectServoenable',
                    defValue: servoEnableData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[77].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_zero_mode,
                    dataType: 'SelectZero',
                    defValue: ZeroModeData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_search_speed + '(mm/s(°/s))',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 2000
                },
                input3: {
                    inputTitle: nodeInputTitles.pherial._externa_axis_latch_speed + '(mm/s(°/s))',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 2000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._debug_acc_percentage + '(%)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 1,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[78].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._target_pos + '(mm(°))',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.pherial._running_speed + '(mm/s(°/s))',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._debug_acc_percentage + '(%)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 1,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[79].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.pherial._servo_id,
                    dataType: 'SelectServo',
                    defValue: auxServoCommandIdData[0].id,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.pherial._target_speed + 'mm/s(°/s)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._debug_acc_percentage + '(%)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 1,
                    max: 100
                }
            }
            nodeDescription.color = 'Pherial';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[84].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._weld_voltage + '(V)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[85].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._weld_electric + '(A)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[86].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._weld_id,
                    dataType: 'SelectWeldId',
                    defValue: WeldIdData[0],
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._weld_time + '(MS)',
                    dataType: 'Number',
                    defValue: 10000,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[87].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._weld_id,
                    dataType: 'SelectWeldId',
                    defValue: WeldIdData[0],
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._weld_time + '(MS)',
                    dataType: 'Number',
                    defValue: 10000,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[88].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[89].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[90].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[91].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[92].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[93].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._io_type,
                    dataType: 'SelectIO',
                    defValue: IOTypeDict[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[34].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._segment_mode,
                    dataType: 'SelectSegmentMode',
                    defValue: segmentModeData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._segment_start_point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._segment_end_point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._effective_distance + '(mm)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._lose_distance + '(mm)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._function_mode,
                    dataType: 'SelectFuncMode',
                    defValue: functionModeData[0].name,
                    pinInId: null
                },
                input7: {
                    inputTitle: nodeInputTitles.weld._weave_select,
                    dataType: 'SelectWeaveMode',
                    defValue: weaveModeData[0].name,
                    pinInId: null
                },
                input8: {
                    inputTitle: nodeInputTitles.weld._rounding_rule,
                    dataType: 'SelectRounding',
                    defValue: roundingRuleData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[128].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._weld_type,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 49
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[129].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._weld_task,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 255
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[136].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._weld_solution,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 5
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[96].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[97].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[98].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._function_select,
                    dataType: 'SelectProtocol',
                    defValue: protocolData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[99].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue: null,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[100].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[101].name || type == nodeTitleList[94].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._function_select,
                    dataType: 'SelectFuncType',
                    defValue: functionTypeData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._weave_time + '(ms)',
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 10000
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._search_speed,
                    dataType: 'Number',
                    defValue: null,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[102].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[103].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue: null,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._motion_mode,
                    dataType: 'SelectAxismove',
                    defValue: axisMoveData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._debug_speed,
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[104].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._coord_name,
                    dataType: 'SelectSensorTool',
                    defValue: null,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._search_dist,
                    dataType: 'SelectSearch',
                    defValue: SerachDistData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._laser_search_dist_point,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._search_speed,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._search_length + '(mm)',
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._search_time + '(ms)',
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: 0,
                    max: 10000
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[105].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {}
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[106].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._motion_mode,
                    dataType: 'SelectAxismove',
                    defValue: axisMoveData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._search_speed,
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[107].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._motion_mode,
                    dataType: 'SelectAxismove',
                    defValue: axisMoveData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._search_speed,
                    dataType: 'Number',
                    defValue: 30,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[108].name || type == nodeTitleList[109].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._arc_track_lag_time + '(ms)',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._weld_trace_isleftright,
                    dataType: 'SelectTraceIs',
                    defValue: weldTraceIsuplowData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._weld_trace_klr,
                    dataType: 'Number',
                    defValue: 0.06,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._weld_trace_tstartlr + '(cyc)',
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._weld_trace_stepmaxlr + '(mm)',
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._weld_trace_summaxlr + '(mm)',
                    dataType: 'Number',
                    defValue: 300,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._weld_trace_isuplow,
                    dataType: 'SelectTraceIs',
                    defValue: weldTraceIsuplowData[0].name,
                    pinInId: null
                },
                input7: {
                    inputTitle: nodeInputTitles.weld._weld_trace_kud,
                    dataType: 'Number',
                    defValue: -0.06,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input8: {
                    inputTitle: nodeInputTitles.weld._weld_trace_tstartud + '(cyc)',
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input9: {
                    inputTitle: nodeInputTitles.weld._weld_trace_stepmaxud + '(mm)',
                    dataType: 'Number',
                    defValue: 5,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: nodeInputTitles.weld._weld_trace_summaxud + '(mm)',
                    dataType: 'Number',
                    defValue: 300,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: nodeInputTitles.weld._weld_trace_axisselect,
                    dataType: 'SelectTraceAxis',
                    defValue: weldTraceAxisselectData[0].name,
                    pinInId: null
                },
                input12: {
                    inputTitle: nodeInputTitles.weld._weld_trace_reference_type,
                    dataType: 'SelectTraceReference',
                    defValue: weldTraceReferenceTypeData[0].name,
                    pinInId: null
                },
                input13: {
                    inputTitle: nodeInputTitles.weld._up_down_reference_current_start + '(cyc)',
                    dataType: 'Number',
                    defValue: 4,
                    pinInId: null
                },
                input14: {
                    inputTitle: nodeInputTitles.weld._up_down_reference_current + '(cyc)',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null
                },
                input15: {
                    inputTitle: nodeInputTitles.weld._weld_trace_reference_current + '(A)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[110].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._tech_plate_type,
                    dataType: 'SelectTechPlate',
                    defValue: techPlateType[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[111].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._tech_plate_type,
                    dataType: 'SelectTechPlate',
                    defValue: techPlateType[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._tech_motion_direction,
                    dataType: 'SelectTechMotion',
                    defValue: techMotionDirection[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._tech_adjust_time + '(ms)',
                    dataType: 'Number',
                    defValue: 1000,
                    pinInId: null,
                    min: 0,
                    max: 10000
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._first_length + '(mm)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._inflection_point_type,
                    dataType: 'SelectInfPoint',
                    defValue: infPointType[0].name,
                    pinInId: null
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._second_length + '(mm)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._third_length + '(mm)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input7: {
                    inputTitle: nodeInputTitles.weld._fourth_length + '(mm)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input8: {
                    inputTitle: nodeInputTitles.weld._fifth_length + '(mm)',
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 1000
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[112].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_reference_pos,
                    dataType: 'SelectWirePos',
                    defValue: wireRefPosData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_speed,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_distance + '(mm)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._wire_back_flag,
                    dataType: 'SelectWireSerachBack',
                    defValue: wireSearchBackFlagData[0].name,
                    pinInId: null
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._wire_search_back_speed,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._wire_search_back_distance + '(mm)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._wire_search_mode,
                    dataType: 'SelectWireSerachMode',
                    defValue: wireSearchModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[113].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_reference_pos,
                    dataType: 'SelectWirePos',
                    defValue: wireRefPosData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_speed,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_distance + '(mm)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._wire_back_flag,
                    dataType: 'SelectWireSerachBack',
                    defValue: wireSearchBackFlagData[0].name,
                    pinInId: null
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._wire_search_back_speed,
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._wire_search_back_distance + '(mm)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._wire_search_mode,
                    dataType: 'SelectWireSerachMode',
                    defValue: wireSearchModeData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[114].name || type == nodeTitleList[115].name || type == nodeTitleList[116].name || type == nodeTitleList[117].name || type == nodeTitleList[118].name || type == nodeTitleList[119].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.motion._point_name,
                    dataType: 'SelectPoint',
                    defValue: null,
                    pinInId: null,
                },
                input1: {
                    inputTitle: nodeInputTitles.motion._debug_speed,
                    dataType: 'Number',
                    defValue: 100,
                    pinInId: null,
                    min: 0,
                    max: 100
                },
                input2: {
                    inputTitle: nodeInputTitles.motion._smooth_stop,
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input3: {
                    inputTitle: nodeInputTitles.motion._smooth_ptp,
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.motion._search_flag,
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
                input5: {
                    inputTitle: nodeInputTitles.motion._wire_search_point_name,
                    dataType: 'SelectWire',
                    defValue: wireSearchRef_ResPointData[0].name,
                    pinInId: null,
                },
                input6: {
                    inputTitle: nodeInputTitles.motion._weld_record,
                    dataType: 'SelectWeld',
                    defValue: weldRecordData[0].name,
                    pinInId: null,
                },
                input7: {
                    inputTitle: nodeInputTitles.motion._plate_type,
                    dataType: 'SelectTplate',
                    defValue: TplateType[0].name,
                    pinInId: null,
                },
                input8: {
                    inputTitle: nodeInputTitles.motion._offset,
                    dataType: 'SelectOffset',
                    defValue: offsetFlagData[0].name,
                    pinInId: null,
                },
                input9: {
                    inputTitle: 'dx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input10: {
                    inputTitle: 'dy',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input11: {
                    inputTitle: 'dz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input12: {
                    inputTitle: 'drx',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input13: {
                    inputTitle: 'dry',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                },
                input14: {
                    inputTitle: 'drz',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                    min: -300,
                    max: 300
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[120].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_method,
                    dataType: 'SelectCalcMethod1',
                    defValue: wireSearchType1MethodData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point1,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point2,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point3,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point1,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point2,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point3,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[121].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_method,
                    dataType: 'SelectCalcMethod2',
                    defValue: wireSearchType2MethodData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point1,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point2,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._wire_search_ref_point3,
                    dataType: 'SelectWireSearchRefPoint',
                    defValue: wireSearchRefPointData[0].name,
                    pinInId: null
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point1,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point2,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point3,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[122].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_method,
                    dataType: 'SelectCalcMethod3',
                    defValue: wireSearchType3MethodData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point1,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point2,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[123].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_method,
                    dataType: 'SelectCalcMethod4',
                    defValue: wireSearchType4MethodData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point1,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point2,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeTitleList[124].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_method,
                    dataType: 'SelectCalcMethod5',
                    defValue: wireSearchType5MethodData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point1,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input2: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point2,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input3: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point3,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input4: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point4,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input5: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point5,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input6: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point6,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }


        if (type == nodeTitleList[125].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point_write_name,
                    dataType: 'SelectWireSearchResPoint',
                    defValue: wireSearchResPointData[0].name,
                    pinInId: null
                },
                input1: {
                    inputTitle: nodeInputTitles.weld._wire_search_res_point_write_data,
                    dataType: 'String',
                    defValue: '{0,0,0,0,0,0}',
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeInputTitles.auxiliary._point_table_mode) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.auxiliary._point_table_mode,
                    dataType: 'SelectPointTable',
                    defValue: null,
                    pinInId: null
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == nodeInputTitles.auxiliary._system_mode) {
            nodeDescription.nodeTitle = type;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: '',
                    pinExecOutId: null,
                    outOrder: 0,

                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == programCommandArray[56].name) {
            nodeDescription.nodeTitle = type;
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Body',
                    pinExecOutId: null,
                    outOrder: 0,

                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                    outOrder: 1,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: nodeInputTitles.auxiliary._scale_parameter,
                    dataType: 'Number',
                    defValue: 50.0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input1: {
                    inputTitle: nodeInputTitles.auxiliary._feedforward_parameters,
                    dataType: 'Number',
                    defValue: 19.0,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input2: {
                    inputTitle: nodeInputTitles.auxiliary._maximum_angular_acc_limit,
                    dataType: 'Number',
                    defValue: 1440,
                    pinInId: null,
                    min: 0,
                    max: 10000
                },
                input3: {
                    inputTitle: nodeInputTitles.auxiliary._maximum_angular_vel_limit,
                    dataType: 'Number',
                    defValue: 180,
                    pinInId: null,
                    min: 0,
                    max: 1000
                },
                input4: {
                    inputTitle: nodeInputTitles.auxiliary._lock_axis_pointing,
                    dataType: 'SelectLockDirection',
                    defValue: lockXPointModeData[0].name,
                    pinInId: null,
                }
            }
            nodeDescription.color = 'Weld';
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        new this.ProgramNode(nodeDescription, location, layer, stage);
    }

    return Nodes;
}])





/*

//required json
{
    type: string,
    id: num,
    inputs:{
        count: integer,
        execIn1:{
            name: "",
            wire: KonvaWire else null
        }
        ip1: {
            dataType: string,
            default: num/str etc,
            value: num/str etc,
            name: ""
            wire: Konva.Line else null if no wire
        }
    }
    outputs:{
        count: integer,
        execOut1:{
            name: "",
            wire: KonvaWire else null
        }
        out1: {
            dataType: string,
            default: num/str etc,
            value: num/str etc,
            name: ""
            wire: Konva.Line else null if no wire
        }
    }

}


*/