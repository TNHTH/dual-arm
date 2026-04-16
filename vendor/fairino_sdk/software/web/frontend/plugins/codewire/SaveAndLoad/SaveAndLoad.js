frapp.factory('SaveAndLoad', ['Nodes', 'Wiring', 'variableList', 'toastFactory', function (Nodes, Wiring, variableList, toastFactory) {
    let injector = angular.injector(['frApp']);
    let alertBox;

    function writeError(err, msg) {
        // document.getElementById("console-window").classList.toggle("hidden", false);
        // let codeDoc = document.getElementById("console").contentWindow.document;
        // codeDoc.open();
        // codeDoc.writeln(
        //     `<!DOCTYPE html>\n
        //             <style>
        //                 html{
        //                     color: white;
        //                     margin: 20;
        //                 }
        //             </style>
        //             <body>
        //             <code>
        //             "${msg}"<br>
        //             ${err}
        //             </code>
        //             </body>
        //             </html>
        //             `
        // );
        // codeDoc.close();
    }

    function printContent(json, stage, layer, wireLayer) {
        for (let aNode of json.nodesData) {
            try {
                new Nodes.ProgramNode(aNode.nodeDescription, { x: aNode.position.x * stage.scaleX() + stage.x(), y: aNode.position.y * stage.scaleY() + stage.y() }, layer, stage);
    
            }
            catch (err) {
                // writeError(err, "Error Occurred In Importing The JSON(Node Description Not Valid)");
            }
        }
        // let X = layer.findOne('Group');
        // console.log(layer.children);
        // console.log(X); 
        for (let aWire of json.wireData) {
            // console.log(`${aWire.srcId}`, `${aWire.destId}`);
            let src = layer.findOne(`#${aWire.srcId}`);
            let dest = layer.findOne(`#${aWire.destId}`);
            // console.log(src, dest);
            try {
                Wiring.addConnectionWire(dest, src, stage, 1, wireLayer);
            }
            catch (err) {
                // writeError(err, "Error Occurred In Importing The JSON(Wire Data Not Valid)");
            }
        }
        for (let aVariable of json.variables) {
            try {
                variableList.addVariable(aVariable);
            }
            catch (err) {
                // writeError(err, "Error Occurred In Importing The JSON(Variable Data Not Valid)");
            }
        }
        layer.draw();
        wireLayer.draw();
    }

    let SaveAndLoad = {};

    SaveAndLoad.Export = class {
        constructor(stage, layer, wireLayer) {
            document.getElementById('export').addEventListener("click", (e) => {
                let exportScript = [];
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
                wireLayer.find('.isConnection').forEach((aWire, index) => {
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
                if (exportScript.variables.length == 0 && exportScript.nodesData.length == 0 && exportScript.wireData.length == 0) {
                    toastFactory.info(langJsonData.program_teach.info_messages[207]);
                } else {
                    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportScript));
                    let exportAnchorElem = document.getElementById('exportAnchorElem');
                    exportAnchorElem.setAttribute("href", dataStr);
                    exportAnchorElem.setAttribute("download", "wireScript.json");
                    exportAnchorElem.click();
                }
            });
        }
    }

    SaveAndLoad.Import = class {
        constructor(stage, layer, wireLayer, script) {
            SaveAndLoad.refresh(layer, wireLayer);
            let json = null;
            try {
                json = JSON.parse(script);
            }
            catch (err) {
                writeError(err, "Error In Loading JSON(JSON TEMPERED)");
            }
            // console.log(json);
            printContent(json, stage, layer, wireLayer);
        }
    }
    
    SaveAndLoad.Save = class {
        constructor(stage, layer, wireLayer) {
            document.getElementById('save').addEventListener("click", (e) => {
                let exportScript = [];
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
                wireLayer.find('.isConnection').forEach((aWire, index) => {
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
                exportScript.nodesData.forEach(item => {
                    if (item.nodeDescription.inputs) {
                        for (const key in item.nodeDescription.inputs) {
                            if (item.nodeDescription.inputs[key].max != null && item.nodeDescription.inputs[key].min != undefined) {
                                if (Number(item.nodeDescription.inputs[key].defValue > item.nodeDescription.inputs[key].max)) {
                                    item.nodeDescription.inputs[key].defValue = item.nodeDescription.inputs[key].max
                                }
                            }
                            if (item.nodeDescription.inputs[key].min != null && item.nodeDescription.inputs[key].min != undefined) {
                                if (Number(item.nodeDescription.inputs[key].defValue < item.nodeDescription.inputs[key].min)) {
                                    item.nodeDescription.inputs[key].defValue = item.nodeDescription.inputs[key].min
                                }
                            }
                        }
                    }
                })
                localStorage.setItem('lastLoadWireScriptJSON', JSON.stringify(exportScript));
                localStorage.setItem('lastLoadFileName', $('#nodeEditorFileName').val());
            });
            window.addEventListener("load", () => {
                SaveAndLoad.prompLastSave(stage, layer, wireLayer);
            })
        }
    }

    SaveAndLoad.refresh = function (layer, wireLayer) {
        layer.destroyChildren();
        wireLayer.destroyChildren();
        variableList.deleteAllVariables();
        layer.draw();
        wireLayer.draw();
    }

    SaveAndLoad.prompLastSave = function (stage, layer, wireLayer) {
        [...document.getElementsByClassName("sidebox")].forEach(value => {
            value.classList.toggle("hidden", true);
        });
        if (localStorage.getItem('lastLoadWireScriptJSON') && localStorage.getItem('lastLoadWireScriptJSON') != "{\"variables\":[],\"nodesData\":[],\"wireData\":[]}") {
            $('#reloadNodeGraphModal').modal();
            document.getElementById("load-btn").onclick = function () {
                new SaveAndLoad.Import(stage, layer, wireLayer, localStorage.getItem('lastLoadWireScriptJSON'));
                $('#nodeEditorFileName').val(localStorage.getItem('lastLoadFileName'));
                $('#reloadNodeGraphModal').modal('hide');
            };
            document.getElementById("load-cancel-btn").onclick = function () {
                $('#reloadNodeGraphModal').modal('hide');
            };
        }
        else{
            $('#lastSaveModal').modal();
        }
    }

    return SaveAndLoad;
}])
