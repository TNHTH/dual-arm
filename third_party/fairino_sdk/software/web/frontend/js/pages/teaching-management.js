angular
    .module('frApp')
    .controller('teachingmanagementCtrl', ['$http', '$scope', '$modal', 'dataFactory', 'toastFactory', '$q', teachingmanagementCtrlFn])

function teachingmanagementCtrlFn($http, $scope, $modal, dataFactory, toastFactory, $q) {
    // 页面显示范围修改
    $scope.quitSetMounting();
    $scope.fullContentView();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let tmDynamicTags;
    tmDynamicTags = langJsonData.teaching_management;
    /* 初始化 */
    getToolCoordData();
    getWObjCoordData();
    handlePointTableName();
    /* ./初始化 */
    let logDynamicTags;
    logDynamicTags = langJsonData.log;
    // 分页——下拉选择一页展示多少条
    $scope.pageSelect = logDynamicTags.var_object.pageSelect;
    // 每页显示多少条(默认显示10条/页)
    $scope.pageSize = $scope.pageSelect[0];
    // 当前页
    $scope.currentPageNum = 1;
    // 跳转至多少页的当前页
    $scope.currentInputPageNum = 1;
    // 总页数
    $scope.pageNumTotal;
    // 分页点击/跳转的展示项
    $scope.paginationSize;
    // 搜索框内问题提示
    $scope.placeholderTip = tmDynamicTags.info_messages[6];
    
    /* 每次修改示教点后刷新数据 */
    function refreshTable() {
        setInterval(() => {
            if(g_refreshTableFlag){
                g_refreshTableFlag = 0;
                $("#teachrefreshpoint").click();
            }
        }, 1000);
    }
    refreshTable();

    /* test */
    if (g_testCode) {
        $scope.optionsData = [
            {
                name: 'wekll1',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail2',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail2',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail3',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail1',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail2',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail3',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail1',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail2',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail3',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            },
            {
                name: '1tail1',
                x: -456,
                y: 298.32,
                z: -91.02,
                rx: 0.880,
                ry: -92.430,
                rz: -91.23,
                j1: -26.343,
                j2: -26.343,
                j3: -26.343,
                j4: -26.343,
                j5: -26.343,
                j6: -26.343,
                toolnum: 'tool3',
                workpiecenum: '0',
                speed: 20,
            }
        ];
    }
    /* ./test */

    //示教点搜索
    $scope.searchPointName = function () {
        $scope.currentPageNum = 1;//每次搜索时，从第一页开始查询
        let searchPointTableName = document.getElementById("pointNameFind").value;
        const pattern = new RegExp(searchPointTableName, 'i');//不区分大小写
        $scope.tmpPointTableData = [];
        $scope.optionsData.forEach(item => {
            if (pattern.test(item.name) || pattern.test(item.toolnum) || pattern.test(item.workpiecenum) || pattern.test(item.speed)) {
                $scope.tmpPointTableData.push(item);
            }
        })
        $scope.displayPointsData = $scope.tmpPointTableData;
        getPageSize($scope.currentPageNum);
    }

	 //获取工具坐标系数据
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.ToolCoordeData = JSON.parse(JSON.stringify(data));
                $scope.toolCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                getOptionsData();
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[0]);
                /* test */
                if (g_testCode) {
                    getOptionsData();
                }
                /* ./test */
            });
    };

    //获取工件坐标系数据
    function getWObjCoordData() {
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.WObjCoordeData = JSON.parse(JSON.stringify(data));
                hidePageLoading();
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[1]);
                hidePageLoading();
            });
    };

    // 获取示教点数据
    function getOptionsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                let pointNameArr = Object.keys(data);
                pointNameArr.forEach(function (item, i) {
                    if (data[pointNameArr[i]].toolnum < $scope.toolCoordeTotal) {
                        data[pointNameArr[i]].toolnum = $scope.ToolCoordeData[data[pointNameArr[i]].toolnum].name;        
                    } else {
                        data[pointNameArr[i]].toolnum = data[pointNameArr[i]].toolnum - $scope.toolCoordeTotal;
                        data[pointNameArr[i]].toolnum = tmDynamicTags.info_messages[4] + data[pointNameArr[i]].toolnum;  
                    };
                    data[pointNameArr[i]].workpiecenum = tmDynamicTags.info_messages[5] + data[pointNameArr[i]].workpiecenum;
                });
                window.displayoptionsData = JSON.parse(JSON.stringify(data));
                let array = [];
                pointNameArr.forEach(function (item, i) {
                    array.push(data[item]);
                })
                $scope.optionsData = array;
                //$scope.displayPointsData = data;
                $scope.searchPointName();
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[2]);
                /* test */
                if (g_testCode) {
                    $scope.searchPointName();
                }
                /* ./test */
            });
    };

    function getOptionsData2() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                let pointNameArr = Object.keys(data);
                pointNameArr.forEach(function (item, i) {
                    if (data[pointNameArr[i]].toolnum < $scope.toolCoordeTotal) {
                        data[pointNameArr[i]].toolnum = $scope.ToolCoordeData[data[pointNameArr[i]].toolnum].name;        
                    } else {
                        data[pointNameArr[i]].toolnum = data[pointNameArr[i]].toolnum - $scope.toolCoordeTotal;
                        data[pointNameArr[i]].toolnum = tmDynamicTags.info_messages[4] + data[pointNameArr[i]].toolnum;  
                    };
                    data[pointNameArr[i]].workpiecenum = tmDynamicTags.info_messages[5] + data[pointNameArr[i]].workpiecenum;
                });
                window.displayoptionsData = JSON.parse(JSON.stringify(data));
                let array = [];
                pointNameArr.forEach(function (item, i) {
                    array.push(data[item]);
                })
                $scope.optionsData = array;
                //$scope.displayPointsData = data;
                $scope.searchPointName();
                
            }, (status) => {
                toastFactory.error(status);
            });
    };

    $scope.deleteItemsArray = [];
    $scope.setAllCbs = function () {
        let cbMain = document.getElementById("cbMain");
        let cbItems = document.getElementsByName("cbItem");
        if (cbMain.checked == false) {
            cbItems.forEach(function (item, index, arr) {
                item.checked = false;
            });
            $scope.deleteItemsArray = [];
        } else {
            $scope.deleteItemsArray = [];
            cbItems.forEach(function (item, index, arr) {
                item.checked = true;
                $scope.deleteItemsArray = $scope.deleteItemsArray.concat($scope.displayPointsData[index].name);
            });
        };
    };
    
    $scope.clickCbItem = function (index, pointName) {
        let cbItem = document.getElementById("cbItem" + pointName);
        if(cbItem.checked == true) {
            $scope.deleteItemsArray.push(pointName);
        } else {
            $scope.deleteItemsArray.forEach(function (item, index, arr) {
                if(item == pointName) {
                    arr.splice(index, 1);
                };
            });
        };
    };

    // 根据数据总条数计算显示页码
    function getPageSize(currentPageNumVlaue) {
        if ($scope.displayPointsData) {
            $scope.pageTotal = $scope.displayPointsData.length;
            $scope.recordPointTableList = $scope.displayPointsData.slice((currentPageNumVlaue - 1) * $scope.pageSize.value, currentPageNumVlaue * $scope.pageSize.value)
        } else {
            $scope.pageTotal = 0;
        }
        $scope.pageNumTotal = Math.ceil($scope.pageTotal / $scope.pageSize.value);
        $scope.paginationSize = [];
        if (8 > $scope.pageNumTotal) {
            // 当表格总页数小于等于七条时
            if ($scope.pageNumTotal > 1) {
                for (let i = 2; i < $scope.pageNumTotal; i++) {
                    $scope.paginationSize.push(i);
                }   
            }
        } else if ($scope.pageNumTotal > 7) {
            // 当表格数据大于七条时
            if (currentPageNumVlaue < 6) {
                // 当前页码数据小于七时，只需要显示前六位跳转数
                for (let i = 2; i < 7; i++) {
                    $scope.paginationSize.push(i);
                }
            } else if (currentPageNumVlaue > Number($scope.pageNumTotal) - 5) {
                // 当前页码数据比表格总数小6以内时，只需要显示后六位跳转数
                for (let i = Number($scope.pageNumTotal) - 5; i < $scope.pageNumTotal; i++) {
                    $scope.paginationSize.push(i);
                }
            } else {
                // 当前页码第七位到倒数后六位之间
                for (let i = Number(currentPageNumVlaue) - 2; i < Number(currentPageNumVlaue) + 3; i++) {
                    $scope.paginationSize.push(i);
                }
            }
        }
    }

    // 隐藏页码的移入移出内容改变
    document.getElementById('page-less').onmouseover = function() {
        document.getElementById('page-less').innerHTML = "<<";
    }
    document.getElementById('page-less').onmouseout = function() {
        document.getElementById('page-less').innerHTML = "•••";
    }
    document.getElementById('page-more').onmouseover = function() {
        document.getElementById('page-more').innerHTML = ">>";
    }
    document.getElementById('page-more').onmouseout = function() {
        document.getElementById('page-more').innerHTML = "•••";
    }

    // 当前页码跳转
    $scope.pageJumpStep = function(type, currentPageNumVlaue) {
        $scope.deleteItemsArray = [];
        if ((currentPageNumVlaue == 1 && type == 'prev') || (currentPageNumVlaue == $scope.pageNumTotal && type == 'next')) return;
        switch (type) {
            // 点击跳转下一页
            case 'prev':
                if (currentPageNumVlaue > 1) {
                    $scope.currentPageNum = Number(currentPageNumVlaue) - 1;
                } else {
                    $scope.currentPageNum = 1;
                }
                break;
            // 点击跳转上一页
            case 'next':
                if (currentPageNumVlaue < $scope.pageNumTotal) {
                    $scope.currentPageNum = Number(currentPageNumVlaue) + 1;
                } else {
                    $scope.currentPageNum = $scope.pageNumTotal;
                }
                break;
            // 点击跳转指定页
            case 'specify':
                $scope.currentPageNum = currentPageNumVlaue;
                break;
            case 'more':
                $scope.currentPageNum = currentPageNumVlaue + 5 > $scope.pageNumTotal ? $scope.pageNumTotal : currentPageNumVlaue + 5;
                break;
            case 'less':
                $scope.currentPageNum = currentPageNumVlaue - 5 > 1 ? currentPageNumVlaue - 5 : 1;
                break;
            default:
                break;
        }
        $scope.currentInputPageNum = $scope.currentPageNum;
        getPageSize($scope.currentPageNum);
    };

    // 当前页码改变，input输入框失去焦点
    $scope.currentPageNumChange = function(value) {
        $scope.currentPageNum = Number(value);
        getPageSize($scope.currentPageNum);
    }

    /* Enter键绑定 */
    // 当前页码改变，键盘的enter
    $(function () {
        $('#currentPageNum').keydown(function (event) {
            if (event.keyCode == 13) {
                $scope.currentPageNum = Number($scope.currentInputPageNum);
                getPageSize($scope.currentPageNum);
                $scope.$apply();
            }
        });
    })
    /* Enter键绑定 */

    // 一页显示多少条改变
    $scope.pageSelectChange = function() {
        $scope.currentPageNum = 1;
        $scope.currentInputPageNum = 1;
        getPageSize($scope.currentPageNum);
    }

    /**进入示教管理页面时点位表名配置 */
    function handlePointTableName() {
        if (g_appliedPointTableName != undefined) {
            localStorage.setItem("pointTableName",g_appliedPointTableName);
        }
        let data = localStorage.getItem("pointTableName");
        if (data) {
            $scope.pointTableFlag = 1;
            $scope.pointTableName = data;
            $scope.selectedPointTable = data;
            getPointTableList();
        } else {
            $scope.pointTableFlag = 0;
        }
    }

    /*** 获取点位表列表*/
    function getPointTableList() {
        let getPointTableListCmd = {
            cmd: "get_point_table_list"
        };
        dataFactory.getData(getPointTableListCmd)
            .then((data) => {
                $scope.pointTableList = JSON.parse(JSON.stringify(data));
                toastFactory.success(tmDynamicTags.success_messages[5]);
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[8]);
                /* test */
                if (g_testCode) {
                    $scope.pointTableList = ["point_table_1.db","point_table_2.db","point_table_3.db"]
                }
                /* ./test */
            });
    }

    /**
     * 创建点位表
     * @param {string} name 文件名称
     */
    $scope.createPointTable = function(name) {
        if (!name) {
            toastFactory.info(tmDynamicTags.info_messages[8]);
            return;
        }

        let nameData = "point_table_" + name + ".db";
        if ($scope.pointTableList.findIndex(item => item == nameData) != -1) {
            toastFactory.info(tmDynamicTags.info_messages[11]);
            return;
        }

        let createPointTableCmd = {
            cmd: "create_point_table",
            data: {
                name: nameData
            }
        };
        dataFactory.actData(createPointTableCmd)
            .then(() => {
                $('#addPointTableModal').modal('hide');
                getPointTableList();
                toastFactory.success(tmDynamicTags.success_messages[6]);
            }, (status) => {
                $('#addPointTableModal').modal('hide');
                toastFactory.error(status, tmDynamicTags.error_messages[9]);
            });
    }

    /**
     * 删除点位表
     * @param {array} array 文件名称列表
     */
    let deleteFlag = 0; // 删除标志，需要删除确认
    $scope.removePointTable = function(array) {
        if (!array) {
            toastFactory.info(tmDynamicTags.info_messages[7]);
            return;
        }
        if ($scope.selectedPointTable == $scope.pointTableName) {
            toastFactory.info(tmDynamicTags.info_messages[12]);
            return;
        }
        if (deleteFlag == 0) {
            deleteFlag = 1;
            toastFactory.info(tmDynamicTags.info_messages[9]);
            return;
        }

        let removePointTableCmd = {
            cmd: "remove_point_table",
            data: {
                name: [array]
            }
        };
        dataFactory.actData(removePointTableCmd)
            .then(() => {
                deleteFlag = 0;
                if ($scope.pointTableName == $scope.selectedPointTable) {
                    $scope.pointTableName = '';
                }
                getPointTableList();
                toastFactory.success(tmDynamicTags.success_messages[7]);
            }, (status) => {
                deleteFlag = 0;
                toastFactory.error(status, tmDynamicTags.error_messages[10]);
            });
    }

    /**
     * 点位表重命名
     * @param {string} newName 新文件名称
     * @param {string} oldName 旧文件名称
     */
    $scope.renamePointTable = function(newName, oldName) {
        if (!newName) {
            toastFactory.info(tmDynamicTags.info_messages[8]);
            return;
        }

        let newData = "point_table_" + newName + ".db";
        if ($scope.pointTableList.findIndex(item => item == newData) != -1) {
            toastFactory.info(tmDynamicTags.info_messages[11]);
            return;
        }

        let renamePointTableCmd = {
            cmd: "rename_point_table",
            data: {
                newname: newData,
                oldname: oldName
            }
        };
        dataFactory.actData(renamePointTableCmd)
            .then(() => {
                $('#renamePointTableModal').modal('hide');
                getPointTableList();
                toastFactory.success(tmDynamicTags.success_messages[8]);
            }, (status) => {
                $('#renamePointTableModal').modal('hide');
                toastFactory.error(status, tmDynamicTags.error_messages[11]);
            });
    }

    /**
     * 应用点位表
     * @param {string} name 应用的点位表名称
     */
    $scope.applyPointTable = function(name) {
        let sendContent;
        if (!name && $scope.pointTableFlag == 1) {
            toastFactory.info(tmDynamicTags.info_messages[7]);
            return;
        } else if ($scope.pointTableFlag == 0) {
            sendContent = "PointTableSwitch('')";
            $('#enterSystemModeModal').modal('hide');
        } else {
            if ($scope.selectedPointTable == $scope.pointTableName) {
                toastFactory.info(tmDynamicTags.info_messages[14]);
                return;
            }
            sendContent = "PointTableSwitch('" + name + "')";
        }

        let applyPointTableCmd = {
            cmd: 844,
            data: {
                content: sendContent
            }
        };
        dataFactory.setData(applyPointTableCmd)
            .then(() => {
                $('#pageLoading').css({display: 'block'});
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[12]);
            });
    }
    document.getElementById('teachingManagement').addEventListener('table_name', e => {
        $('#pageLoading').css({display: 'none'});
        let pointTableNameData = e.detail;
        if (pointTableNameData.current) {
            //系统模式 -> 点位表模式 / 点位表模式之间切换
            $scope.pointTableName = pointTableNameData.current;
            localStorage.setItem("pointTableName",pointTableNameData.current);
        }
        getOptionsData();
    })

    /**取消切换系统模式 */
    $scope.cancelSwitchSystemMode = function() {
        $scope.pointTableFlag = 1;
    }

    /**导出点位表数据 */
    $scope.exportPointTable = function() {
        if (!$scope.selectedPointTable) {
            toastFactory.info(tmDynamicTags.info_messages[7]);
            return;
        }

        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/points/point_table/" + $scope.selectedPointTable.split('.')[0] + ".db";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/points/point_table/" + $scope.selectedPointTable.split('.')[0] + ".db";
        }
    }

    /**导入点位表数据 */
    $scope.importPointTable = function() {
        var formData = new FormData();
        var file = document.getElementById("pointTableImported").files[0];
        if (null == file) {
            toastFactory.info(tmDynamicTags.info_messages[2]);
            return;
        }
        if (file.name.indexOf(".db") == -1 || file.name.substring(0, 12) != 'point_table_') {
            toastFactory.info(tmDynamicTags.warning_messages[10]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    getPointTableList();
                    $("#importPointTableModal").modal('hide');
                    toastFactory.success(tmDynamicTags.success_messages[3] + file.name);
                }
            }, (status) => {
                $("#importPointTableModal").modal('hide');
                toastFactory.error(status, tmDynamicTags.error_messages[6]);
            });
    }

    //点击发送示教点信息
    $scope.clickmodItem = function () {
        if(($scope.deleteItemsArray.length > 1)||($scope.deleteItemsArray.length == 0)){
            toastFactory.info(tmDynamicTags.info_messages[0]);
            return;
        }
        var index = 0;
        if ($scope.recordPointTableList) {
            $scope.recordPointTableList.forEach(function (item, i) {
                if(item.name == $scope.deleteItemsArray[0]){
                    index = i;
                }
            });
        }
        if(document.getElementById("tbPointsData").rows[index+1].cells[2].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[2].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[2].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[0]);
            return;
        } else if(document.getElementById("tbPointsData").rows[index+1].cells[3].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[3].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[3].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[1]);
            return;
        }else if(document.getElementById("tbPointsData").rows[index+1].cells[4].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[4].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[4].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[2]);
            return;
        }else if(document.getElementById("tbPointsData").rows[index+1].cells[5].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[5].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[5].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[3]);
            return;
        }else if(document.getElementById("tbPointsData").rows[index+1].cells[6].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[6].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[6].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[4]);
            return;
        }else if(document.getElementById("tbPointsData").rows[index+1].cells[7].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[7].innerText>2000 || document.getElementById("tbPointsData").rows[index+1].cells[7].innerText<-2000){
            toastFactory.warning(tmDynamicTags.warning_messages[5]);
            return;
        }else if(document.getElementById("tbPointsData").rows[index+1].cells[16].innerText == "" || document.getElementById("tbPointsData").rows[index+1].cells[16].innerText>100 || document.getElementById("tbPointsData").rows[index+1].cells[16].innerText<0){
            toastFactory.warning(tmDynamicTags.warning_messages[6]);
            return;
        }
		var point = window.displayoptionsData[$scope.deleteItemsArray[0]];
        var modifyTeachPoint = JSON.parse(JSON.stringify(point));
        var toolnumArr;
        for(let i=0;i<$scope.ToolCoordeData.length;i++){
            if(point.toolnum == $scope.ToolCoordeData[i].name){
                toolnumArr = $scope.ToolCoordeData[i].id;
            }
        }
        var toolx = $scope.ToolCoordeData[toolnumArr].x;
        var tooly = $scope.ToolCoordeData[toolnumArr].y;
        var toolz = $scope.ToolCoordeData[toolnumArr].z;
        var toolrx = $scope.ToolCoordeData[toolnumArr].rx;
        var toolry = $scope.ToolCoordeData[toolnumArr].ry;
        var toolrz = $scope.ToolCoordeData[toolnumArr].rz;
        modifyTeachPoint.toolnum = toolnumArr;
        var wobjnumArr = point.workpiecenum.split(tmDynamicTags.info_messages[5]);  // 工件
        var wobjx = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].x;
        var wobjy = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].y;
        var wobjz = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].z;
        var wobjrx = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].rx;
        var wobjry = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].ry;
        var wobjrz = $scope.WObjCoordeData["wobjcoord"+wobjnumArr[1]].rz;
        modifyTeachPoint.workpiecenum = wobjnumArr[1];
        modifyTeachPoint.x = document.getElementById("tbPointsData").rows[index+1].cells[2].innerText;
        modifyTeachPoint.y = document.getElementById("tbPointsData").rows[index+1].cells[3].innerText;
        modifyTeachPoint.z = document.getElementById("tbPointsData").rows[index+1].cells[4].innerText;
        modifyTeachPoint.rx = document.getElementById("tbPointsData").rows[index+1].cells[5].innerText;
        modifyTeachPoint.ry = document.getElementById("tbPointsData").rows[index+1].cells[6].innerText;
        modifyTeachPoint.rz = document.getElementById("tbPointsData").rows[index+1].cells[7].innerText;
        modifyTeachPoint.speed = document.getElementById("tbPointsData").rows[index+1].cells[16].innerText;
        if((modifyTeachPoint.x == point.x)&&(modifyTeachPoint.y == point.y)&&(modifyTeachPoint.z == point.z)&&(modifyTeachPoint.rx == point.rx)
        &&(modifyTeachPoint.ry == point.ry)&&(modifyTeachPoint.rz == point.rz)){
            if(modifyTeachPoint.speed == point.speed){
                toastFactory.info(tmDynamicTags.info_messages[1]);
            } else{
                startModifYPoint();
            }
        }else{
                var commputePointStr = point.j1+","+point.j2+","+point.j3+","+point.j4+","+point.j5+","+point.j6+","+modifyTeachPoint.x+","+modifyTeachPoint.y
                +","+modifyTeachPoint.z+","+modifyTeachPoint.rx+","+modifyTeachPoint.ry+","+modifyTeachPoint.rz
                +","+toolnumArr+","+toolx+","+tooly+","+toolz+","+toolrx+","+toolry+","+toolrz+","+wobjnumArr[1]+","+wobjx+","+wobjy+","+wobjz+","+wobjrx+","+wobjry+","+wobjrz
                +","+point.E1+","+point.E2+","+point.E3+","+point.E4;
                let commputePointCmd = {
                    cmd: 380,
                    data: {
                    content: "ModifyTeachPoint("+commputePointStr+")",
                },
            };
            $scope.deleteItemsArray = [];
            dataFactory.setData(commputePointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[3]);
            });
        }
		window.modPoint = modifyTeachPoint;

    };

    //获取示教点计算数据
    document.getElementById('teachingManagement').addEventListener('380', e => {
        if(g_modifyPointFlag){
            g_modifyPointFlag = 0;
            temparr = JSON.parse(e.detail);
			window.modPoint.j1 = parseFloat(temparr.j1).toFixed(3);
			window.modPoint.j2 = parseFloat(temparr.j2).toFixed(3);
			window.modPoint.j3 = parseFloat(temparr.j3).toFixed(3);
			window.modPoint.j4 = parseFloat(temparr.j4).toFixed(3);
			window.modPoint.j5 = parseFloat(temparr.j5).toFixed(3);
			window.modPoint.j6 = parseFloat(temparr.j6).toFixed(3);
			startModifYPoint();
        }
    });

    //修改示教点信息

	function startModifYPoint(){
        if("1" != $scope.controlMode){
            toastFactory.warning(tmDynamicTags.warning_messages[7]);
            return;
        }
        let savePointCmd = {
            cmd: "modify_point",
            data: window.modPoint,
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                toastFactory.success(tmDynamicTags.success_messages[1] + window.modPoint.name + tmDynamicTags.success_messages[2]);
                getOptionsData2();
            }, (status) => {
                toastFactory.error(status, tmDynamicTags.error_messages[4] + window.modPoint.name + tmDynamicTags.error_messages[5]);
            });
    };

    $('#btnImportPoints').click(function () {
        // 清空文件内容
        var importPointsHtml = document.getElementById("pointsImported");
        importPointsHtml.value = '';
        // 打开模态窗
        $('#importPointsModal').modal();
    });

    $('#btnImportPointTable').click(function () {
        // 清空文件内容
        var importPointTableHtml = document.getElementById("pointTableImported");
        importPointTableHtml.value = '';
        // 打开模态窗
        $('#importPointTableModal').modal();
    });

    /**新增点位表 */
    $scope.addTableName = function() {
        $('#addPointTableModal').modal();
        $scope.addPointTableContent = '';
    }

    /**重命名点位表名称 */
    $scope.renameTableName = function() {
        //未应用点位表无法改名
        if (!$scope.selectedPointTable) {
            toastFactory.info(tmDynamicTags.info_messages[2]);
            return;
        }
        if ($scope.selectedPointTable == $scope.pointTableName) {
            toastFactory.info(tmDynamicTags.info_messages[13]);
            return;
        }
        $scope.renamePointTableContent = $scope.selectedPointTable.split('.')[0].split('_')[2];
        $('#renamePointTableModal').modal();
    }

    /**选择点位模式 0-系统模式 1-点位表模式 */
    $scope.changePointMode = function(index) {
        $scope.pointTableFlag = index;

        if (index == 0) {
            if (g_appliedPointTableName == '') {
                getOptionsData(); // 未应用点位表切回系统模式不需要提示
            } else {
                $('#enterSystemModeModal').modal();
            }
        } else {
            $scope.pointTableName = '';
            $scope.selectedPointTable = '';
            $scope.displayPointsData = [];
            getPageSize($scope.currentPageNum);
            getPointTableList();
        }
        let cbMain = document.getElementById("cbMain");
        cbMain.checked = false; //清除全选勾选框
    }

    $scope.submitPoints = function () {
        var formData = new FormData();
        var file = document.getElementById("pointsImported").files[0];
        if(null == file){
            toastFactory.info(tmDynamicTags.info_messages[2]);
            return;
        } else if("web_point.db" != file.name){
            toastFactory.warning(tmDynamicTags.warning_messages[9]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    $("#importPointsModal").modal('hide');
                    getOptionsData();
                    toastFactory.success(tmDynamicTags.success_messages[3] + file.name);
                }
            }, (status) => {
                getOptionsData();
                toastFactory.error(status, tmDynamicTags.error_messages[6]);
            });
    };

    $scope.exportPoints = function () {
        if(g_systemFlag == 1){
            window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/points/web_point.db";
        }else{
            window.location.href = "/action/download?pathfilename=/root/web/file/points/web_point.db";
        }
    };

    //删除示教点
    $scope.deletePoints = function () {
        if($scope.deleteItemsArray.length < 1){
            toastFactory.info(tmDynamicTags.info_messages[3]);
            return;
        }
        let deletePointsCmd = {
            cmd: "remove_points",
            data: {
                name: $scope.deleteItemsArray
            }
        };
        $scope.deleteItemsArray = [];
        dataFactory.actData(deletePointsCmd)
            .then(() => {
                getOptionsData();
                let cbMain = document.getElementById("cbMain");
                cbMain.checked = false;
                toastFactory.success(tmDynamicTags.success_messages[4]);
            }, (status) => {
                getOptionsData();
                toastFactory.error(status, tmDynamicTags.error_messages[7]);
            });
    };

    // 打开示教点详情模态框
    $scope.openPointDetailsModal = function(detailsItem) {
        $('#pointDetailsModal').modal();
        $scope.teachManagementDetails = detailsItem;
    }

    /**
     * 全局示教点单点运行
     * @param {object} teachingPointItem 当前待运行的示教点元素
     */
    $scope.runGlobalTeachingPoint = function(teachingPointItem) {
        let moveJData = {};
        let jointsData = {
            "j1": teachingPointItem.j1,
            "j2": teachingPointItem.j2,
            "j3": teachingPointItem.j3,
            "j4": teachingPointItem.j4,
            "j5": teachingPointItem.j5,
            "j6": teachingPointItem.j6
        }
        let tcfData = {
            "x": teachingPointItem.x,
            "y": teachingPointItem.y,
            "z": teachingPointItem.z,
            "rx": teachingPointItem.rx,
            "ry": teachingPointItem.ry,
            "rz": teachingPointItem.rz
        }
        moveJData["joints"] = jointsData;
        moveJData["tcf"] = tcfData;
        moveJData["speed"] = $scope.speed.toString();
        moveJData["acc"] = $scope.acceleration;
        moveJData["ovl"] = "50"; // 50-150
        let moveJCmd = {
            cmd: 201,
            data: moveJData
        };
        dataFactory.setData(moveJCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }

    /**
     * 重命名示教点
     * @param {object} e 焦点消失事件
     * @param {int} index 当前页面表格点位序号
     */
    $scope.renamePoint = function (e, index) {
        let newPointName = e.currentTarget.innerText.trim();
        if ($scope.recordPointTableList[index].name != newPointName && newPointName != "") {
            let cmd = {
                cmd: "rename_point",
                data: {
                    old_name: $scope.recordPointTableList[index].name,
                    new_name: newPointName
                }
            };
            dataFactory.actData(cmd)
                .then(() => {
                    $scope.recordPointTableList[index].name = newPointName;
                }, (status) => {
                    e.currentTarget.innerText = $scope.recordPointTableList[index].name;
                    toastFactory.error(status, tmDynamicTags.error_messages[13]);
                })
        } else if (newPointName == "") {
            e.currentTarget.innerText = $scope.recordPointTableList[index].name;
            toastFactory.warning(langJsonData.index.info_messages[12]);
        }
    }
}