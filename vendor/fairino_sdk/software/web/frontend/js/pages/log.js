'use strict';

angular
  .module('frApp')
  .controller('logCtrl', ['$http', '$scope', 'dataFactory', 'toastFactory', logCtrlFn]);

function logCtrlFn($http, $scope, dataFactory, toastFactory) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.fullContentView();
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let logDynamicTags;
    let className;
    logDynamicTags = langJsonData.log;
    className = logDynamicTags.log_class[0]; // 默认显示全部日志数据
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
    /* 初始化 */
    /**
     * 登录页面类型
     * 0-FR，1-CATL
     */
    $scope.loginType = '0';
    getLoginType();
    /* ./初始化 */

    /** 获取登录页面类型 */
    function getLoginType() {
        let getLoginTypeCmd = {
            cmd: "get_login_type"
        }
        dataFactory.getData(getLoginTypeCmd).then(
            (data) => {
                $scope.loginType = data.type;
                if ($scope.loginType == "1") {
                    getCATLLogList();
                } else {
                    getLogName();
                }
            },
            (status) => {
                toastFactory.error(status, logDynamicTags.error_messages[0]);
            }
        );
    }
    /* ./初始化 */
    
    /* 获取日志名列表 */
    function getLogName() {
        let getCmd = {
        cmd: 'get_log_name',
        };
        dataFactory.getData(getCmd).then(
            (data) => {
                $scope.recordname = data;
                $scope.selectrecordname = $scope.recordname[0];
                getLogData();
            },
            (status) => {
                toastFactory.error(status, logDynamicTags.error_messages[0]);
            }
        );
    }

    /* 获取单条日志内容 */
    $scope.logTypeContent = [];     // 界面显示动态数组
    function getLogData() {
        let getCmd = {
            cmd: 'get_log_data',
            data: {
                name: $scope.selectrecordname,
            },
        };
        dataFactory.getData(getCmd).then(
            (data) => {
                $scope.recordData = data;
                $scope.logTypeContent = selectedType($scope.recordData);
                hidePageLoading();
            },
            (status) => {
                toastFactory.error(status, logDynamicTags.error_messages[1]);
                hidePageLoading();
            }
        );
    }

    /* 点击日期选择并打开功能函数 */
    $scope.clickDataClass = function () {
        getLogData();
    };

    /* 根据类别处理现实日志数据 */
    function selectedType(logData) {
        if (logDynamicTags.log_class[0] == className) {
            return logData;
        } else {
            let arrType = [];
            let dataLen = logData.length;
            for (let i = 0; i < dataLen; i++) {
                if (logData[i].class == className) {
                arrType.push(logData[i]);
                }
            }
            return arrType;
        }
    }

    /* 点击分类单选按钮功能函数 */
    $scope.typeRecord = function (id) {
        className = logDynamicTags.log_class[id];
        $scope.logTypeContent = selectedType($scope.recordData);
    };

    /* 导出日志模块 */
    $scope.exportRecordData = function () {
        if (null == $scope.selectrecordname) {
            toastFactory.info(logDynamicTags.info_messages[0]);
        } else {
            if (g_systemFlag == 1) {
                window.location.href = '/action/download?pathfilename=/usr/local/etc/web/log/log.db';
            } else {
                window.location.href = '/action/download?pathfilename=/root/web/log/log.db';
            }
        }
    };

    // 获取CATL日志列表
    function getCATLLogList() {
        const getLogCmd = {
            cmd: "get_catl_log_list"
        }
        dataFactory.getData(getLogCmd).then(
            (data) => {
                $scope.catlRecordList = data;
                $scope.selectCATLLogType('0');
            },
            (status) => {
                toastFactory.error(status, logDynamicTags.error_messages[0]);
            }
        );
    }

    // 日期选择
    $scope.selectCATLDate = function() {
        $scope.currentPageNum = 1;
        $scope.currentInputPageNum = 1;
        getPageSize($scope.currentPageNum);
    }

    // 日志类型选择
    $scope.selectCATLLogType = function(item) {
        $scope.catlLogType = item;
        $scope.currentPageNum = 1;
        $scope.currentInputPageNum = 1;
        $scope.catlRecordList.forEach(item => {
            if (item.class == $scope.catlLogType) {
                $scope.catlRecordDateList = item.date_arr;
            }
        });
        if ($scope.catlRecordDateList.length) {
            $scope.catlRecordDate = $scope.catlRecordDateList[0];
        } else {
            $scope.catlRecordDate = '';
            toastFactory.info(logDynamicTags.info_messages[1]);
        }
        getPageSize($scope.currentPageNum);
    }
    
    // 获取CATL日志（宁德时代需求）
    $scope.getCATLLogContent = function() {
        if ($scope.catlRecordDate) {
            const getSystemLogParams = {
                cmd: 'get_catl_log_content',
                data: {
                    date: $scope.catlRecordDate,
                    class: $scope.catlLogType,
                    page_index: $scope.currentPageNum.toString(),
                    page_rows: $scope.pageSize.value
                }
            }
            dataFactory.getData(getSystemLogParams).then(
                (data) => {
                    $scope.catlLogData = data;
                },
                (status) => {
                    // CATL日志数据
                    $scope.catlLogData = [];
                    toastFactory.error(status, logDynamicTags.error_messages[1]);
                }
            );
        }
    }
    
    // 根据数据总条数计算显示页码
    function getPageSize(currentPageNumVlaue) {
        $scope.catlRecordList.forEach(item => {
            if (item.class == $scope.catlLogType) {
                if (item.date_arr.length) {
                    item.date_arr.forEach((element, eleIndex) => {
                        if (element == $scope.catlRecordDate) {
                            $scope.pageTotal = item.rows_arr[eleIndex]
                        }
                    })
                } else {
                    $scope.pageTotal = 0;
                }
            }
        });
        if ($scope.pageTotal == 0) {
            $scope.catlLogData = [];
            return;
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
        $scope.getCATLLogContent();
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

    // 导出CATL日志
    $scope.exportCATLLogDB = function() {
        if (!$scope.catlRecordDate && $scope.catlRecordDateList.length == 0) {
            toastFactory.info(logDynamicTags.info_messages[0]);
        } else {
            window.location.href = '/action/download?pathfilename=/tmp/catl_log.tar.gz';
        }
    }
}