frapp.factory('InputBox', function () {
    let InputBox = class{
        constructor(stage, layer, type, grp, position, colorMap, inputPin, iplabel, inputPinsPlaced, defValueContainer, defValueContainerForSave)
        {
            let rect = new Konva.Rect({
                width: (type == 'Boolean') ? 100 : 100,
                height: 14,
                stroke: colorMap['Text'],
                strokeWidth: 1,
            });
            this.focused = false;
            let text = new Konva.Text({
                text: '',
                fontSize: 11,
                fontFamily: 'Verdana',
                fill: colorMap['Text'],
                width: (type == 'Boolean') ? 100 : 100,
                height: 12,
                padding: 2,
            });
            this.inputBox = new Konva.Group();
            this.inputBox.add(rect);
            this.inputBox.add(text);
            this.inputBox.position(position);
            
            let htmlInputBox = null;
            let defaultValue = null;
            if(type == "Number")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("number-ip");
            }
            else if(type == "Boolean")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("bool-ip");
            }
            else if(type == "Array")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("array-ip");
            }
            else if(type == "SelectPoint")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-point-ip");
            }
            else if(type == "SelectPointSeam")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-point-seam-ip");
            }
            else if(type == "SelectSegmentMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-segment-ip");
            }
            else if(type == "SelectTplate")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-tplate-ip");
            }
            else if(type == "SelectWeld")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-weld-ip");
            }
            else if(type == "SelectWire")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-ip");
            }
            else if(type == "SelectWork")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-work-ip");
            }
            else if(type == "SelectTool")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-tool-ip");
            }
            else if(type == "SelectTreatStrategy")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-treatstrategy-ip");
            }
            else if(type == "SelectMove")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-move-ip");
            }
            else if(type == "SelectOffset")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-offset-ip");
            }
            else if(type == "SelectOffsetType")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-offsettype-ip");
            }
            else if(type == "SelectOffsetLaser")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-offset-laser-ip");
            }
            else if(type == "SelectDirection")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-direction-ip");
            }
            else if(type == "SelectWeave")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-weave-ip");
            }
            else if(type == "SelectTpd")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-tpd-ip");
            }
            else if(type == "SelectTraj")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-traj-ip");
            }
            else if(type == "SelectTrajmode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-trajmode-ip");
            }
            else if(type == "SelectSplinemode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-splinemode-ip");
            }
            else if(type == "SelectNspiral")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-nspiral-ip");
            }
	    else if(type == "SelectBlock")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-block-ip");
            }
            else if(type == "SelectSmooth")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-smooth-ip");
            }
            else if(type == "SelectWhether")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-whether-ip");
            }
            else if(type == "SelectPort")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-doport-ip");
            }
            else if(type == "SelectDIPort")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-diport-ip");
            }
            else if(type == "SelectAOPort")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-aoport-ip");
            }
            else if(type == "SelectAIPort")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-aiport-ip");
            }
            else if(type == "SelectAICompare")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-aicompare-ip");
            }
            else if(type == "SelectVirDinData")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-virdindata-ip");
            }
            else if(type == "SelectVirAinData")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-viraindata-ip");
            }
            else if(type == "SelectToolCoord")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-toolcoord-ip");
            }
            else if(type == "SelectWobjToolCoord")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wobjtoolcoord-ip");
            }
            else if(type == "SelectWhetherMotion")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-whethermotion-ip");
            }
            else if(type == "SelectConnection")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-connection-ip");
            }
            else if(type == "SelectlayerId")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-layerid-ip");
            }
            else if(type == "SelectPause")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-pause-ip");
            }
            else if(type == "SelectCollideMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-collidemode-ip");
            }
            else if(type == "SelectDofile")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-dofile-ip");
            }
            else if(type == "SelectGripper")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-gripper-ip");
            }
            else if(type == "SelectTrackmode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-trackmode-ip");
            }
            else if(type == "SelectEnable")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-enable-ip");
            }
            else if(type == "SelectPolish")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-polish-ip");
            }
            else if(type == "SelectAxismove")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-axismove-ip");
            }
            else if(type == "SelectAxisnumber")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-axisnumber-ip");
            }
            else if(type == "SelectZero")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-zero-ip");
            }
            else if(type == "SelectServo")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-servo-ip");
            }
            else if(type == "SelectServomode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-servomode-ip");
            }
            else if(type == "SelectServoenable")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-servoenable-ip");
            }
            else if(type == "SelectSmoothType")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-smoothtype-ip");
            }
            else if(type == "SelectCollisionLevel")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-collisionlevel-ip");
            }
            else if(type == "SelectFTReference")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftreference-ip");
            }
            else if(type == "SelectFTSurfaceDirection")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftsurfacedirection-ip");
            }
            else if(type == "SelectFTSurfaceAxis")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftfindsurfaceaxis-ip");
            }
            else if(type == "SelectFTRotor")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftrotor-ip");
            }
            else if(type == "SelectSensorTool")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-sensortool-ip");
            }
            else if(type == "SelectFTControlAdj")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftcontroladj-ip");
            }
            else if(type == "SelectFTControlilc")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftcontrolilc-ip");
            }
            else if(type == "SelectFTControlFilter")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftcontroladj-ip");
            }
            else if(type == "SelectFTControlPA")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-ftcontroladj-ip");
            }
            else if(type == "SelectIO")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-IO-ip");
            }
            else if(type == "SelectWeldId")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-weld-id-ip");
            }
            else if(type == "SelectDO")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-DO-ip");
            }
            else if(type == "SelectFuncMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-func-mode-ip");
            }
            else if(type == "SelectWeaveMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-weave-mode-ip");
            }
            else if(type == "SelectRounding")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-rounding-ip");
            }
            else if(type == "SelectProtocol")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-protocol-ip");
            }
            else if(type == "SelectFuncType")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-func-type-ip");
            }
            else if(type == "SelectSearch")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-search-ip");
            }
            else if(type == "SelectTraceIs")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-trace-is-ip");
            }
            else if(type == "SelectTraceAxis")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-trace-axis-ip");
            }
            else if(type == "SelectTraceReference")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-trace-reference-ip");
            }
            else if(type == "SelectTechPlate")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-tech-plate-ip");
            }
            else if(type == "SelectTechMotion")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-tech-motion-ip");
            }
            else if(type == "SelectInfPoint")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-inf-point-ip");
            }
	    else if(type == "SelectModbus")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-modbus-ip");
            }
            else if(type == "SelectModbusType")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-modbustype-ip");
            }
            else if(type == "SelectModbusRegRead")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-modbusregread-ip");
            }
            else if(type == "SelectModbusRegWrite")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-modbusregwrite-ip");
	    }
            else if(type == "SelectWirePos")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-pos-ip");
            }
            else if(type == "SelectWireSerachBack")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-search-back-ip");
            }
            else if(type == "SelectWireSerachMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-search-mode-ip");
            }
            else if(type == "SelectWireSearchResPoint")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-search-res-point-ip");
            }
            else if(type == "SelectLockDirection")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-lock-direction-ip");
            }
            else if(type == "SelectWireSearchRefPoint")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-wire-search-ref-point-ip");
            }
            else if(type == "SelectCalcMethod1")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-calc-method-horn-ip");
            }
            else if(type == "SelectCalcMethod2")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-calc-method-diameter-ip");
            }
            else if(type == "SelectCalcMethod3")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-calc-method-point-ip");
            }
            else if(type == "SelectCalcMethod4")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-calc-method-camera-ip");
            }
            else if(type == "SelectCalcMethod5")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-calc-method-external-ip");
            }
            else if(type == "SelectRobotMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-robotmode-ip");
            }
            else if(type == "SelectSlaveDIAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-slavedialias-ip");
            }
            else if(type == "SelectSlaveDOAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-slavedoalias-ip");
            }
            else if(type == "SelectSlaveAIAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-slaveaialias-ip");
            }
            else if(type == "SelectSlaveAOAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-slaveaoalias-ip");
            }
            else if(type == "SelectMasterDIAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-masterdialias-ip");
            }
            else if(type == "SelectMasterDOAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-masterdoalias-ip");
            }
            else if(type == "SelectMasterAIAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-masteraialias-ip");
            }
            else if(type == "SelectMasterAOAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-masteraoalias-ip");
            }
            else if(type == "SelectMasterAlias")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-masteralias-ip");
            }
            else if(type == "SelectOutputMode")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-outputmode-ip");
            }
            else if(type == "SelectPointTable")
            {
                defaultValue = defValueContainer.defValue;
                htmlInputBox = document.getElementById("select-pointtable-ip");
            }
            else 
            {
                // let x = 3;
                if(type == "String")
                {defaultValue = `${defValueContainer.defValue}`;}
                else
                {defaultValue = `${defValueContainer.defValue}`;}
                htmlInputBox = document.getElementById("string-ip");            
                // getComputedStyle(html)
            }
            text.text(defaultValue);
            layer.draw();
            this.inputBox.on("click", () => {
                if (defValueContainer.min != null && defValueContainer.min != undefined) {
                    htmlInputBox.min = defValueContainer.min;
                }
                if (defValueContainer.max != null && defValueContainer.max != undefined) {
                    htmlInputBox.max = defValueContainer.max;
                }
                this.focused = true;
                text.visible(false);
                layer.draw();
                htmlInputBox.value = text.text();
                let stageContainerBorderLeftWidth = parseInt(getComputedStyle(stage.getContainer()).borderLeftWidth);
                let stageContainerBorderTopWidth = parseInt(getComputedStyle(stage.getContainer()).borderTopWidth);
                htmlInputBox.style.left = (stage.getContainer().getBoundingClientRect().x - 172) + stageContainerBorderLeftWidth + this.inputBox.getAbsolutePosition().x + "px";
                htmlInputBox.style.top = (stage.getContainer().getBoundingClientRect().y - 60) + stageContainerBorderTopWidth + this.inputBox.getAbsolutePosition().y + "px";
                htmlInputBox.style.transform = `scale(${stage.scaleX()})`;
                htmlInputBox.style.display = "inline-block";
                htmlInputBox.focus();
            });
            // 触摸结束
            this.inputBox.on("touchend", () => {
                // 触摸结束时先移除光标
                htmlInputBox.blur();
                if (defValueContainer.min != null && defValueContainer.min != undefined) {
                    htmlInputBox.min = defValueContainer.min;
                }
                if (defValueContainer.max != null && defValueContainer.max != undefined) {
                    htmlInputBox.max = defValueContainer.max;
                }
                this.focused = true;
                text.visible(false);
                layer.draw();
                htmlInputBox.value = text.text();
                let stageContainerBorderLeftWidth = parseInt(getComputedStyle(stage.getContainer()).borderLeftWidth);
                let stageContainerBorderTopWidth = parseInt(getComputedStyle(stage.getContainer()).borderTopWidth);
                htmlInputBox.style.left = (stage.getContainer().getBoundingClientRect().x - 172) + stageContainerBorderLeftWidth + this.inputBox.getAbsolutePosition().x + "px";
                htmlInputBox.style.top = (stage.getContainer().getBoundingClientRect().y - 60) + stageContainerBorderTopWidth + this.inputBox.getAbsolutePosition().y + "px";
                htmlInputBox.style.transform = `scale(${stage.scaleX()})`;
                htmlInputBox.style.display = "inline-block";
                htmlInputBox.focus();
            });
            stage.on("wheel", () => {
                htmlInputBox.blur();
            });
            htmlInputBox.addEventListener("blur", () => {
                if (defValueContainer.min != null && defValueContainer.min != undefined) {
                    if (text.text() < defValueContainer.min) {
                        text.text(defValueContainer.min);
                    }
                }
                if (defValueContainer.max != null && defValueContainer.max != undefined) {
                    if (text.text() > defValueContainer.max) {
                        text.text(defValueContainer.max);
                    }
                }
                if (text.text() >= 1) {
                    text.text(Number(text.text()))
                } else if (text.text() == -1 || text.text() < -1) {
                    text.text(Number(text.text()))
                }
                text.visible(true);
                layer.draw();
                htmlInputBox.value = '';
                htmlInputBox.style.display = "none";
                this.focused = false;
            });
            htmlInputBox.addEventListener("input", () => {
                if(this.focused)
                {
                    text.text(htmlInputBox.value);
                    defValueContainerForSave.defValue = htmlInputBox.value;
                }
            });
            inputPin.on("wireconnected", (e) => {
                this.inputBox.visible(false);
                iplabel.position({ x: 28, y: 44 + 39 * inputPinsPlaced + 5 });    
            });
            inputPin.on("wireremoved", (e) => {
                if(e.isPinEmpty)
                {
                    this.inputBox.visible(true);
                    iplabel.position({ x: 28, y: 44 + 39 * inputPinsPlaced - 4 });    
                }
            });
    
            this.textBox = text;
            this.inputBox.on("mouseenter", (e) => {
                document.body.style.cursor = "text";
            });
            this.inputBox.on("mouseleave", (e) => {
                document.body.style.cursor = "default";
            });
            grp.add(this.inputBox);
        }
    }

    return InputBox;
})
