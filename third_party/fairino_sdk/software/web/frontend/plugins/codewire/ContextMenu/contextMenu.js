frapp.factory('ContextMenu', ['Nodes', 'Delete', 'toastFactory', function (Nodes, Delete, toastFactory) {
    let nodeDynamicTags;
    nodeDynamicTags = langJsonData.program_teach;
    var ContextMenu = {};
    let touchMoveFlag = false;

    function makeNode(e, stage, layer, toggleContextMenu) {
        let xx = e.parentElement.getBoundingClientRect().x - stage.getContainer().getBoundingClientRect().x;
        let yy = e.parentElement.getBoundingClientRect().y - stage.getContainer().getBoundingClientRect().y;
        let node = undefined;
        let dataType;
        if (e.dataset.datatype)
            dataType = e.dataset.datatype;
        let tmp = e.innerHTML.split(" ");
        let isGetSet = "";
        if (tmp[0] == "Get" && tmp.length < 2)
            isGetSet = "Get";
        else if (tmp[0] == "Set" && tmp.length < 2)
            isGetSet = "Set";
        let defValue = null;
        Nodes.CreateNode(e.innerHTML, { x: xx, y: yy }, layer, stage, isGetSet, dataType, defValue);
        layer.draw();
        toggleContextMenu([], false);
    }

    ContextMenu.contextMenu = function (stage, layer) {
        let contextMenu = document.getElementById("ctx-menu-container");
        let deleteCtxMenu = document.getElementById("delete-ctx-container");
        let getSetCtxMenu = document.getElementById("get-set-ctx-menu-container");
        let searchBar = document.getElementById("ctx-search-bar");
        let draggedVariableInfo = {
            name: null,
            dataType: null,
        };
        function toggleContextMenu(location, show) {
            if (show) {
                contextMenu.classList.toggle("hidden", false);
                contextMenu.style.left = location[0] + 'px';
                contextMenu.style.top = location[1] + 'px';
                searchBar.blur();
            }
            else {
                contextMenu.classList.toggle("hidden", true);
                searchBar.value = '';
                for (let ctxItem of contextMenu.children[1].children) {
                    ctxItem.classList.toggle("hidden", false);
                }
            }
        }
        function toggleDeleteCtxMenu(location, show) {
            if (show) {
                deleteCtxMenu.classList.toggle("hidden", false);
                deleteCtxMenu.style.left = location[0] + 'px';
                deleteCtxMenu.style.top = location[1] + 'px';

            }
            else {
                deleteCtxMenu.classList.toggle("hidden", true);
            }
        }
        function toggleGetSetCtxMenu(location, show) {
            if (show) {
                getSetCtxMenu.classList.toggle("hidden", false);
                getSetCtxMenu.style.left = location[0] + 'px';
                getSetCtxMenu.style.top = location[1] + 'px';
            }
            else {
                getSetCtxMenu.classList.toggle("hidden", true);
            }
        }
        ContextMenu.addEventToCtxMenuItems = function (e) {
            e.addEventListener('click', function () {
                if (sessionStorage.getItem('controlMode') != 1) {
                    toastFactory.warning(nodeDynamicTags.warning_messages[0]);
                    return;
                }
                makeNode(e, stage, layer, toggleContextMenu);
            });
        }
        // 触摸屏get/set添加
        ContextMenu.touchToggleGetSetCtxMenu  = function (location, show, touchInfo) {
            if (show) {
                draggedVariableInfo = touchInfo;
                getSetCtxMenu.classList.toggle("hidden", false);
                getSetCtxMenu.style.left = location[0] + 'px';
                getSetCtxMenu.style.top = location[1] + 'px';
            }
            else {
                getSetCtxMenu.classList.toggle("hidden", true);
            }
        }
        searchBar.addEventListener("input", (e) => {
            let key = e.target.value.toLowerCase();
            for (let ctxItem of contextMenu.children[1].children) {
                if (ctxItem.innerHTML.toString().toLowerCase().includes(key)) {
                    ctxItem.classList.toggle("hidden", false);
                }
                else {
                    ctxItem.classList.toggle("hidden", true);
                }
            }

        });

        for (let e of contextMenu.children[1].children) {
            this.addEventToCtxMenuItems(e);
        }

        stage.on('contextmenu', function (e) {
            e.evt.preventDefault(); 
            let evtX = e.evt.clientX - 170;
            let evtY = e.evt.clientY - 60;
            let offY = 0, offX = 0;
            if (e.target === stage) {
                let availY = stage.getContainer().getBoundingClientRect().height - evtY;    // stage高 - 右击事件坐标Y
                if (availY <= 260) {
                    offY = -260;
                }
                let availX = stage.getContainer().getBoundingClientRect().width - evtX;     // stage宽 - 右击事件坐标X
                if (availX <= 300) {
                    offX = -300;
                }
                toggleContextMenu([evtX + offX, evtY + offY], true);
            } else {
                toggleDeleteCtxMenu([e.evt.clientX - 130, e.evt.clientY - 35], true);
                deleteCtxMenu.onclick = function () {
                    if (sessionStorage.getItem('controlMode') != 1) {
                        toastFactory.warning(nodeDynamicTags.warning_messages[0]);
                        return;
                    }
                    if (e.target.getParent().name() == 'aProgramNodeGroup') {
                        Delete.deleteProgramNode(e, layer, stage);
                        stage.draw();
                    }
                    else if (e.target.name() == "isConnection") {
                        Delete.deleteWire(e.target);
                        stage.draw();
                    }
                    toggleDeleteCtxMenu([e.evt.clientX - 130, e.evt.clientY - 35], false);
                }
            }
        });
        stage.on('click', function (e) {
            toggleContextMenu([e.evt.clientX, e.evt.clientY], false);
            toggleDeleteCtxMenu([], false);
            toggleGetSetCtxMenu([], false);
        });
        
        stage.on('touchstart', function (e) {
            touchMoveFlag = false;
            document.dispatchEvent(new CustomEvent('out-wiring', { bubbles: true, cancelable: true, composed: true }));
        });
        stage.on('touchmove', function (e) {
            touchMoveFlag = true;
            toggleContextMenu([0, 0], false);
            toggleDeleteCtxMenu([], false);
            toggleGetSetCtxMenu([], false);
        });
        stage.on('touchend', function (e) {
            if (canvasMove) {
                if (e.evt.touches.length == 0) {
                    canvasMove = false;
                }
            } else {
                // 当点击节点区域不是输入框和下拉框时，移除节点区域的输入框和下拉框失去光标
                if (e.target.name() === 'borderbox') {
                    document.getElementById("nodeEditorFileName").focus();
                    document.getElementById("nodeEditorFileName").blur();
                }
                e.evt.preventDefault(); 
                let evtX = e.evt.changedTouches[0].clientX - 170;
                let evtY = e.evt.changedTouches[0].clientY - 60;
                let offY = 0, offX = 0;
                let delX = e.evt.changedTouches[0].clientX - 130;
                let delY = e.evt.changedTouches[0].clientY - 35;
                let offDelY = 0, offDelX = 0;
                if (e.target === stage) {
                    let availY = stage.getContainer().getBoundingClientRect().height - evtY;    // stage高 - 右击事件坐标Y
                    if (availY <= 260) {
                        offY = -260;
                    }
                    let availX = stage.getContainer().getBoundingClientRect().width - evtX;     // stage宽 - 右击事件坐标X
                    if (availX <= 300) {
                        offX = -300;
                    }
                    toggleDeleteCtxMenu([], false);
                    toggleContextMenu([evtX + offX, evtY + offY], true);
                } else {
                    if (!touchMoveFlag) {
                        let availDelY = stage.getContainer().getBoundingClientRect().height - delY;    // stage高 - 右击事件坐标Y
                        if (availDelY <= 100) {
                            offDelY = -100;
                        }
                        let availDelX = stage.getContainer().getBoundingClientRect().width - delX;     // stage宽 - 右击事件坐标X
                        if (availDelX <= 200) {
                            offDelX = -200;
                        }
                        toggleDeleteCtxMenu([delX + offDelX, delY + offDelY], true);
                        toggleContextMenu([0, 0], false);
                    }
                    deleteCtxMenu.onclick = function () {
                        if (sessionStorage.getItem('controlMode') != 1) {
                            toastFactory.warning(nodeDynamicTags.warning_messages[0]);
                            return;
                        }
                        if (e.target.getParent().name() == 'aProgramNodeGroup') {
                            Delete.deleteProgramNode(e, layer, stage);
                            stage.draw();
                        }
                        else if (e.target.name() == "isConnection") {
                            Delete.deleteWire(e.target);
                            stage.draw();
                        }
                        toggleDeleteCtxMenu([delX, delY], false);
                    }
                }
            }
            
        });
        document.addEventListener("click", (e) => {
            if (e.target !== stage.getContainer() && e.target !== searchBar)
                toggleContextMenu([0, 0], false);
            if (e.target !== stage.getContainer()) {
                toggleDeleteCtxMenu([], false);
                toggleGetSetCtxMenu([], false);
            }
        });

        getSetCtxMenu.addEventListener("click", (e) => {
            let nodeType = e.target.innerHTML + " " + draggedVariableInfo.name;
            let xx = e.target.parentElement.getBoundingClientRect().x - stage.getContainer().getBoundingClientRect().x;
            let yy = e.target.parentElement.getBoundingClientRect().y - stage.getContainer().getBoundingClientRect().y;
            if (e.target.innerHTML == "Get") {
                Nodes.CreateNode(nodeType, { x: xx, y: yy }, layer, stage, "Get", draggedVariableInfo.dataType, null);
            }
            else {
                Nodes.CreateNode(nodeType, { x: xx, y: yy }, layer, stage, "Set", draggedVariableInfo.dataType, null);
            }
        });

        stage.getContainer().addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        stage.getContainer().addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        stage.getContainer().addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.getData("variableName")) {
                toggleGetSetCtxMenu([e.clientX, e.clientY], true);
                draggedVariableInfo = {
                    name: e.dataTransfer.getData("variableName"),
                    dataType: e.dataTransfer.getData("dataType"),
                }
            }
            e.stopPropagation();
        });
    }

    return ContextMenu;
}])
