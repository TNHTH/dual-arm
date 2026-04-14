frapp.factory('alertBox', ['SaveAndLoad', function (SaveAndLoad) {
    let alertBox = {};

    alertBox.showAlert = function(msg) {
        let alertMsg = document.getElementById("alert-box").children[0].children[0];
        let alertBox = document.getElementById("alert-box");
        document.getElementById("alert-ok-btn").addEventListener("click", (e) => {
            alertBox.classList.toggle("hidden", true);
            // console.log("ok clicked");
        });
        alertMsg.innerHTML = `<span style="color: tomato;">Alert:</span> ${msg}`;
        alertBox.classList.toggle('hidden', false);
        [...document.getElementsByClassName("sidebox")].forEach(value => {
            if (value !== alertBox) {
                value.classList.toggle("hidden", true);
            }
            else {
                value.classList.toggle("hidden", false);
            }
        })
    }

    alertBox.prompRefreshOrStarter = function (type, stage) {
        let refreshBox = document.getElementById("refresh-box");
        let refBtn = document.getElementById("refresh-btn");
        let refCnclBtn = document.getElementById("refresh-cancel-btn");
        if (type == 'refresh') {
            // 刷新
            refreshBox.children[0].children[1].innerHTML = langJsonData.program_teach.info_messages[201];
            refreshBox.classList.toggle('hidden', false);
            [...document.getElementsByClassName("sidebox")].forEach(value => {
                if (value !== refreshBox) {
                    value.classList.toggle("hidden", true);
                }
                else {
                    value.classList.toggle("hidden", false);
                }
            });
            refBtn.addEventListener("click", (e) => {
                SaveAndLoad.refresh(stage.findOne("#main_layer"), stage.findOne("#wireLayer"));
                refreshBox.classList.toggle('hidden', true);
            });
            refCnclBtn.addEventListener("click", (e) => {
                refreshBox.classList.toggle('hidden', true);
            });
        }
        if (type == 'starter') {
            // 加载
            refreshBox.children[0].children[1].innerHTML = langJsonData.program_teach.info_messages[202];
            refreshBox.classList.toggle('hidden', false);
            [...document.getElementsByClassName("sidebox")].forEach(value => {
                if (value !== refreshBox) {
                    value.classList.toggle("hidden", true);
                }
                else {
                    value.classList.toggle("hidden", false);
                }
            });
            refBtn.addEventListener("click", (e) => {
                refreshBox.classList.toggle('hidden', true);
                alertBox.vscriptOnLoad(stage);
            });
            refCnclBtn.addEventListener("click", (e) => {
                refreshBox.classList.toggle('hidden', true);
            }) ;
        }
    }

    alertBox.vscriptOnLoad = function (stage) {
        // stage.setScale({x: 0.5, y: 0.5});
        const starterFile = {
            "variables": [
                {
                    "name": "fib0",
                    "dataType": "Number",
                    "value": "0"
                },
                {
                    "name": "fib1",
                    "dataType": "Number",
                    "value": "1"
                },
                {
                    "name": "tmp",
                    "dataType": "Number",
                    "value": "0"
                }
            ],
            "nodesData": [
                {
                    "position": {
                        "x": 882.7650007538189,
                        "y": 159.85163279515638
                    },
                    "nodeDescription": {
                        "nodeTitle": "Get fib0",
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "161",
                                "outOrder": 0
                            }
                        },
                        "color": "Get",
                        "rows": 2,
                        "colums": 10
                    }
                },
                {
                    "position": {
                        "x": 1162.030258295078,
                        "y": -77.86835027480167
                    },
                    "nodeDescription": {
                        "nodeTitle": "Print",
                        "execIn": true,
                        "pinExecInId": "197",
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": null,
                                "pinExecOutId": "198",
                                "outOrder": 0
                            }
                        },
                        "inputs": {
                            "input0": {
                                "inputTitle": "Value",
                                "dataType": "Data",
                                "defValue": "'hello'",
                                "pinInId": "199"
                            }
                        },
                        "color": "Print",
                        "rows": 3,
                        "colums": 12
                    }
                },
                {
                    "position": {
                        "x": 1643.3447156786845,
                        "y": -188.30058437154722
                    },
                    "nodeDescription": {
                        "nodeTitle": "Set fib0",
                        "execIn": true,
                        "pinExecInId": "263",
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": null,
                                "pinExecOutId": "264",
                                "outOrder": 0
                            }
                        },
                        "inputs": {
                            "input0": {
                                "inputTitle": "Value",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "265"
                            }
                        },
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "270",
                                "outOrder": 1
                            }
                        },
                        "color": "Func",
                        "rows": 2,
                        "colums": 12
                    }
                },
                {
                    "position": {
                        "x": 1405.0217632814442,
                        "y": -10.307506983789182
                    },
                    "nodeDescription": {
                        "nodeTitle": "Set tmp",
                        "execIn": true,
                        "pinExecInId": "213",
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": null,
                                "pinExecOutId": "214",
                                "outOrder": 0
                            }
                        },
                        "inputs": {
                            "input0": {
                                "inputTitle": "Value",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "215"
                            }
                        },
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "220",
                                "outOrder": 1
                            }
                        },
                        "color": "Func",
                        "rows": 2,
                        "colums": 12
                    }
                },
                {
                    "position": {
                        "x": 858.226295226729,
                        "y": -103.76430203490688
                    },
                    "nodeDescription": {
                        "nodeTitle": "ForLoop",
                        "pinExecInId": "168",
                        "execIn": true,
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": "Loop Body",
                                "pinExecOutId": "169",
                                "outOrder": 0
                            },
                            "execOut1": {
                                "execOutTitle": "Completed",
                                "pinExecOutId": "171",
                                "outOrder": 2
                            }
                        },
                        "inputs": {
                            "input0": {
                                "inputTitle": "From",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "173"
                            },
                            "input1": {
                                "inputTitle": "To(Excl)",
                                "dataType": "Number",
                                "defValue": 10,
                                "pinInId": "178"
                            },
                            "input2": {
                                "inputTitle": "Increment",
                                "dataType": "Number",
                                "defValue": 1,
                                "pinInId": "183"
                            }
                        },
                        "outputs": {
                            "output0": {
                                "outputTitle": "Index",
                                "dataType": "Number",
                                "pinOutId": "188",
                                "outOrder": 1
                            }
                        },
                        "color": "Logic",
                        "rows": 2,
                        "colums": 12
                    }
                },
                {
                    "position": {
                        "x": 597.3988522169524,
                        "y": -71.28918923767549
                    },
                    "nodeDescription": {
                        "nodeTitle": "Begin",
                        "execIn": false,
                        "pinExecInId": null,
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": null,
                                "pinExecOutId": "10",
                                "outOrder": 0
                            }
                        },
                        "color": "Begin",
                        "rows": 2,
                        "colums": 10
                    }
                },
                {
                    "position": {
                        "x": 1842.6577068958845,
                        "y": -7.296090238984647
                    },
                    "nodeDescription": {
                        "nodeTitle": "Set fib1",
                        "execIn": true,
                        "pinExecInId": "288",
                        "execOut": {
                            "execOut0": {
                                "execOutTitle": null,
                                "pinExecOutId": "289",
                                "outOrder": 0
                            }
                        },
                        "inputs": {
                            "input0": {
                                "inputTitle": "Value",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "290"
                            }
                        },
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "295",
                                "outOrder": 1
                            }
                        },
                        "color": "Func",
                        "rows": 2,
                        "colums": 12
                    }
                },
                {
                    "position": {
                        "x": 1183.0158909384227,
                        "y": 176.8455118436093
                    },
                    "nodeDescription": {
                        "nodeTitle": "Add",
                        "inputs": {
                            "input0": {
                                "inputTitle": "ValueA",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "240"
                            },
                            "input1": {
                                "inputTitle": "ValueB",
                                "dataType": "Number",
                                "defValue": 0,
                                "pinInId": "245"
                            }
                        },
                        "outputs": {
                            "output0": {
                                "outputTitle": "Result",
                                "dataType": "Number",
                                "pinOutId": "250",
                                "outOrder": 0
                            }
                        },
                        "color": "Math",
                        "rows": 2,
                        "colums": 10
                    }
                },
                {
                    "position": {
                        "x": 1420.4451174247129,
                        "y": -153.90186070105034
                    },
                    "nodeDescription": {
                        "nodeTitle": "Get fib1",
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "279",
                                "outOrder": 0
                            }
                        },
                        "color": "Get",
                        "rows": 2,
                        "colums": 10
                    }
                },
                {
                    "position": {
                        "x": 876.2598976089839,
                        "y": 268.9161815178427
                    },
                    "nodeDescription": {
                        "nodeTitle": "Get fib1",
                        "outputs": {
                            "output0": {
                                "outputTitle": "Value(Ref)",
                                "dataType": "Number",
                                "pinOutId": "231",
                                "outOrder": 0
                            }
                        },
                        "color": "Get",
                        "rows": 2,
                        "colums": 10
                    }
                }
            ],
            "wireData": [
                {
                    "srcId": "161",
                    "destId": "199"
                },
                {
                    "srcId": "198",
                    "destId": "213"
                },
                {
                    "srcId": "214",
                    "destId": "263"
                },
                {
                    "srcId": "169",
                    "destId": "197"
                },
                {
                    "srcId": "10",
                    "destId": "168"
                },
                {
                    "srcId": "264",
                    "destId": "288"
                },
                {
                    "srcId": "220",
                    "destId": "290"
                },
                {
                    "srcId": "161",
                    "destId": "240"
                },
                {
                    "srcId": "250",
                    "destId": "215"
                },
                {
                    "srcId": "279",
                    "destId": "265"
                },
                {
                    "srcId": "231",
                    "destId": "245"
                }
            ]
        }
        let starterJSON = JSON.stringify(starterFile);
        new SaveAndLoad.Import(stage, stage.findOne("#main_layer"), stage.findOne("#wireLayer"), starterJSON);
    }

    return alertBox;
}])

// <div style="font-size: 1.2rem; color: white; padding: 10px; margin-top: 10px; text-align: center"><span
//                     style="color: tomato;">Alert:</span> Current Scipt Will Be Lost Unless Exported</div>


