frapp.factory('variableList', ['colorMap', 'ContextMenu', function (colorMap, ContextMenu) {
    class VariableList {

        constructor()
        {
            this.nodeDynamicTags = langJsonData.program_teach;
            this.variables = [];
            this.variablesElements = [];
        }
        makeContextMenuItem(variable, setOrGet){
            let div = document.createElement("div");
            div.classList.toggle("context-menu-items", true);
            div.setAttribute('data-datatype', `${variable.dataType}`);
            // div.id=`${variable.dataType}-${variable.name}-${setOrGet}`;
            div.innerHTML = `${(setOrGet == 'set') ? 'Set': 'Get'} ${variable.name}`;
            return div;
        }
        addVariable(variable)
        {
            // this.variables[variableName] = {
            //     name: variableName,
            //     dataType: document.getElementById("variable-data-type").value,
            //     value: value,
            // };
            this.variables.push(variable);
            let el = this.makeLeftPanelVariableListItem(variable);
            //<button type="button" class="btn btn-outline-danger position-absolute end-0 me-1"">Delete</button>
            document.getElementById("variable-list").appendChild(el);
            // <div class="context-menu-items">GetRandom</div>
            // document.getElementById("context-menu").innerHTML += `<div class="context-menu-items" data-datatype=${variable.dataType} id="${variable.dataType}-${variable.name}-set">Set ${variable.name}</div>`;
            // document.getElementById("context-menu").innerHTML += `<div class="context-menu-items" data-datatype=${variable.dataType} id="${variable.dataType}-${variable.name}-get">Get ${variable.name}</div>`;
            // let set = this.makeContextMenuItem(variable, 'set');
            // let get = this.makeContextMenuItem(variable, 'get');
            // console.log(set, get);
            // document.getElementById("context-menu").appendChild(get);
            // document.getElementById("context-menu").appendChild(set);
            // ContextMenu.addEventToCtxMenuItems(set);
            // ContextMenu.addEventToCtxMenuItems(get);
            // this.variablesElements.push(set);
            // this.variablesElements.push(get)
        }
        makeLeftPanelVariableListItem(variable) {
            let cloneLi = null;
            let li = document.createElement('li');
            li.id =  `${variable.dataType}-${variable.name}`;
            li.classList.toggle('list-group-item', true);
            li.classList.toggle('left-panel-variable', true);
            li.style.width = "100%";
            li.style.position = "relative";
            li.style.borderWidth = `2px 2px 2px 2px`;
            li.style.borderStyle = 'solid';
            li.style.margin = '1rem';
            li.style.boxShadow = `inset 0px 0px 5px ${colorMap[variable.dataType]}`;
            li.style.backgroundColor = `transparent`;
            li.style.borderColor = `${colorMap[variable.dataType]}`;
            li.setAttribute("draggable", "true");
            let text = document.createTextNode(`${variable.name}`);
            li.appendChild(text);
            li.addEventListener('mouseover', (e) => {
                li.style.boxShadow = `inset 0px 0px 30px ${colorMap[variable.dataType]}`;
            });
            li.addEventListener('mouseleave', (e) => {
                li.style.boxShadow = `inset 0px 0px 5px ${colorMap[variable.dataType]}`;
            });
            li.addEventListener("dragstart", (e) =>{
                e.dataTransfer.setData("variableName", `${variable.name}`);
                e.dataTransfer.setData("dataType", `${variable.dataType}`);
            });
            li.addEventListener("touchend", (e) =>{
                ContextMenu.touchToggleGetSetCtxMenu([e.changedTouches[0].clientX, e.changedTouches[0].clientY], true, {
                    name: variable.name,
                    dataType: variable.dataType
                });
                if (cloneLi) {
                    document.getElementById("container").removeChild(cloneLi);
                    cloneLi = null;
                }
            });
            li.addEventListener("touchmove", (e) =>{
                if (cloneLi) {
                    document.getElementById("container").removeChild(cloneLi);
                    cloneLi = null;
                }
                cloneLi = e.target.cloneNode(true);
                cloneLi.style.width = li.clientWidth + 'px';
                cloneLi.style.position = 'fixed';
                cloneLi.style.left = e.changedTouches[0].clientX + 'px';
                cloneLi.style.top = e.changedTouches[0].clientY + 'px';
                document.getElementById("container").appendChild(cloneLi);
            });
            let variableDelete = document.createElement('span');
            variableDelete.style.color = 'white';
            variableDelete.style.position = "absolute";
            variableDelete.style.right = "10px";
            variableDelete.style.display = 'none';
            li.addEventListener('mouseover', (e) => {
                variableDelete.style.display = '';
            });
            li.addEventListener('mouseleave', (e) => {
                variableDelete.style.display = 'none';
            });
            variableDelete.addEventListener("click", (e) =>{
                document.getElementById("variable-list").removeChild(li);
                variableList.variables.forEach((item, index) => {
                    if (item.name == variable.name) {
                        variableList.variables.splice(index, 1)
                    }
                })
                variableList.variablesElements.forEach((item, index) => {
                    if (item.innerHTML == `Set ${variable.name}`) {
                        variableList.variablesElements.splice(index, 2)
                    }
                })
            });
            let iconDelete = document.createElement('i');
            iconDelete.classList.add("frfont");
            iconDelete.classList.add("frshanchu");
            variableDelete.appendChild(iconDelete);
            li.appendChild(variableDelete);
            return li;
            // return `<li id=${variable.dataType}-${variable.name} class="list-group-item mt-2 ms-5 me-5 p-2 ps-3 rounded" style="font-size:15px; border: ${colorMap[variable.dataType]} 2px solid; color: white; background: transparent;">${variable.name}
            //     </li>`;
        }
    
        deleteAllVariables()
        {
            this.variables = [];
            document.getElementById("variable-list").innerHTML = '';
            this.variablesElements.forEach((elem, index) => {
                    elem.remove();
            })
        }
    }

    var variableList = new VariableList();

    return variableList;
}])