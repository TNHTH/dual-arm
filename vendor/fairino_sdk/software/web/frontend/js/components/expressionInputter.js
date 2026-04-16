(function (angular) {
    'use strict';

    function expressionInputterController($scope, toastFactory) {
        /**
         * 随机生成ID
         * @param {int} length 长度限制
         * @returns id序列
         */
        function genRandomID(length) {
            return Number(Math.random().toString().substring(2, length) + Date.now()).toString(36);
        }

        /** 组件初始化 */
        this.$onInit = function () {
            $scope.expression = '';
            $scope.eiID = genRandomID(7);
            $scope.inputID = genRandomID(7);
            $scope.repeats = [1,1,1,1,1,1,1,1,1,1];
            $scope.inputContent = false;
            $scope.DinData = langJsonData.commandlist.DinData;
            $scope.selectedGetDIPort = $scope.DinData[0];

            $scope.IOBlockData = langJsonData.commandlist.IOBlockData;
            $scope.selectedGetDIBlock = $scope.IOBlockData[0];
            $scope.selectedGetAIBlock = $scope.IOBlockData[0];

            $scope.auxIOThreadData = langJsonData.program_teach.var_object.auxIOThreadData;
            $scope.selectedGetDIThread = $scope.auxIOThreadData[0];
            $scope.selectedGetAIThread = $scope.auxIOThreadData[0];

            $scope.IOState = langJsonData.commandlist.IOState;
            $scope.selectedGetDIState = $scope.IOState[0];

            $scope.AIport = langJsonData.commandlist.AIport;
            $scope.selectedGetAIPort = $scope.AIport[0];

            $scope.AIcompare = langJsonData.commandlist.AIcompare;
            $scope.selectedGetAIState = $scope.AIcompare[0];
            $(document).ready(() => {
                $(`#${$scope.eiID}`).draggable();
                document.querySelector(`div[id='${$scope.eiID}'] div.func-edit-zone`).addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                });
                document.querySelector(`div[id='${$scope.eiID}'] div.operation-zone`).addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                });
            });
        }

        /**
         * 变量值改变钩子函数
         * @param {object} changes bindings变量改变对象
         */
        this.$onChanges = function (changes) {
            if (changes.event.currentValue != undefined) {
                $scope.expression = changes.event.currentValue.currentTarget.value;
                $scope.inputSelectionStart = $scope.expression.length;
                $scope.inputSelectionEnd = $scope.inputSelectionStart;
                setSelection($scope.inputSelectionStart, $scope.inputSelectionEnd);
                setInputterPosition(changes.event.currentValue);
            }
        }

        /**
         * 获取Input输入光标位置
         * @param {object} e input点击事件
         */
        $scope.getSelection = function (e) {
            $scope.inputSelectionStart = e.target.selectionStart;
            $scope.inputSelectionEnd = e.target.selectionEnd;
        }

        /**
         * 设置Input输入光标位置
         * @param {int} start 文本光标选中起点
         * @param {int} end 文本光标选中终点
         */
        function setSelection(start, end) {
            const input = document.getElementById(`${$scope.inputID}`);
            input.focus();
            setTimeout(() => {  // 异步执行设置输入光标位置,防止默认操作覆盖
                input.setSelectionRange(start, end);
            }, 0);
        }

        /**
         * 递归查找form-group元素并返回该元素
         * @param {object} e 事件
         */
        function searchFormGroupEl(e) {
            if (e.parentNode.classList.contains('form-group')) {
                return e.parentNode;
            } else {
                if (e.parentNode != null) {
                    return searchFormGroupEl(e.parentNode);
                } else {
                    return null;
                }
            }
        }

        /**
         * 设置Inputter显示位置
         * @param {object} e 外部触发元素点击事件
         */
        function setInputterPosition(e) {
            let parentNode = searchFormGroupEl(e.currentTarget);
            let pnScrollTop = 0;   // form-group元素滚动值
            let marginTop = 3;
            if (parentNode != null) {
                pnScrollTop = parentNode.scrollTop;
            }
            let refLeft = e.currentTarget.offsetLeft;
            let refTop = e.currentTarget.offsetTop;
            let refWidth = e.currentTarget.offsetWidth;
            let refHeight = e.currentTarget.offsetHeight;
            const inputter = document.getElementById(`${$scope.eiID}`);
            $(inputter).ready(function () {
                inputter.style.top = `${refTop + refHeight - pnScrollTop + marginTop}px`;
                if (inputter.offsetParent.offsetWidth - refLeft < inputter.offsetWidth) {
                    inputter.style.left = `${refLeft - (inputter.offsetWidth - refWidth)}px`;
                } else {
                    inputter.style.left = `${refLeft - (inputter.offsetWidth - refWidth) / 2}px`;
                }
                inputter.style.zIndex = 9999;
            });
        }

        /**
         * 按钮输入字符数字等内容操作
         * @param {string} type 输入类型, symbol和number
         * @param {string} str 输入内容
         */
        $scope.input = function (type, str) {
            let temp1, temp2;
            switch (type) {
                case 'symbol':
                    temp1 = $scope.expression.substring(0, $scope.inputSelectionStart);
                    temp2 = $scope.expression.substring($scope.inputSelectionEnd, $scope.expression.length);
                    $scope.expression = temp1 + ` ${str} ` + temp2;
                    break;
                case 'number':
                    temp1 = $scope.expression.substring(0, $scope.inputSelectionStart);
                    temp2 = $scope.expression.substring($scope.inputSelectionEnd, $scope.expression.length);
                    $scope.expression = temp1 + str + temp2;
                    break;
                default:
                    break;
            }
            $scope.inputSelectionStart = $scope.expression.length;
            $scope.inputSelectionEnd = $scope.inputSelectionStart;
            setSelection($scope.inputSelectionStart, $scope.inputSelectionEnd);
        }

        /**
         * 依据功能类型进入编辑表达式页面
         * @param {string} type 表达式功能类型
         */
        $scope.editFunc = function (type) {
            $scope.showFuncContent = true;
            $scope.showGetDI = false;
            $scope.showGetAI = false;
            $scope.funcContentType = type;        
            switch (type) {
                case 'GetDI':
                    $scope.showGetDI = true;   
                    break;
                case 'GetAI':
                    $scope.showGetAI = true;
                    break;
            
                default:
                    break;
            }
        }

        /**
         * 添加功能表达式
         * @param {string} type 表达式功能类型
         * @returns 
         */
        this.addFunc = function (type) {
            switch (type) {
                case 'GetDI':
                    if ($scope.selectedGetDIBlock.num == 1) {
                        if (null == $scope.getDIWaittime) {
                            toastFactory.info(langJsonData.program_teach.info_messages[34]);
                            return;
                        }
                        if ($scope.selectedGetDIPort.num > 15) {
                            $scope.expression += `SPLCGetToolDI(${$scope.selectedGetDIPort.num-15},${$scope.selectedGetDIState.num},${$scope.getDIWaittime})`;
                        }
                        else {
                            $scope.expression += `SPLCGetDI(${$scope.selectedGetDIPort.num},${$scope.selectedGetDIState.num},${$scope.getDIWaittime})`;
                        }
                    } else {
                        if ($scope.selectedGetDIPort.num > 15) {
                            $scope.expression += `GetToolDI(${$scope.selectedGetDIPort.num-15},${$scope.selectedGetDIThread.id})`;
                        }
                        else {
                            $scope.expression += `GetDI(${$scope.selectedGetDIPort.num},${$scope.selectedGetDIThread.id})`;
                        }
                    }     
                    break;
                case 'GetAI':
                    if ($scope.selectedGetAIBlock.num == 1) {
                        if ((null == $scope.getAIValue) || (null == $scope.getAIWaittime)) {
                            toastFactory.info(langJsonData.program_teach.info_messages[42]);
                        } else {
                            if ($scope.selectedGetAIPort.num > 1) {
                                $scope.expression += `SPLCGetToolAI(${$scope.selectedGetAIPort.num - 2},${$scope.selectedGetAIState.num},${$scope.getAIValue},${$scope.getAIWaittime})`;
                            }
                            else {
                                $scope.expression += `SPLCGetAI(${$scope.selectedGetAIPort.num},${$scope.selectedGetAIState.num},${$scope.getAIValue},${$scope.getAIWaittime})`;
                            }
                        }
                    } else {
                        if ($scope.selectedGetAIPort.num > 1) {
                            $scope.expression += `GetToolAI(${$scope.selectedGetAIPort.num - 2},${$scope.selectedGetAIThread.id})`;
                        }
                        else {
                            $scope.expression += `GetAI(${$scope.selectedGetAIPort.num},${$scope.selectedGetAIThread.id})`;
                        }
                    }
                    break;
           
                default:
                    break;
            }
            $scope.inputSelectionStart = $scope.expression.length;
            $scope.inputSelectionEnd = $scope.inputSelectionStart;
            setSelection($scope.inputSelectionStart, $scope.inputSelectionEnd);
        }

        /** 确认表达式 */
        this.confirm = function () {
            this.getExpression($scope.expression);
            this.close();
        }

        /** 删除表达式内容(依据光标位置删除,默认从字符串尾开始删除) */
        this.delete = function () {
            if ($scope.inputSelectionStart && $scope.inputSelectionEnd && $scope.expression.length != $scope.inputSelectionStart) {
                let temp1, temp2;
                if ($scope.inputSelectionStart == $scope.inputSelectionEnd) {
                    $scope.inputSelectionStart > 0 ? $scope.inputSelectionStart -= 1 : 0;   // 大于0先减1
                    temp1 = $scope.expression.substring(0, $scope.inputSelectionStart);
                    temp2 = $scope.expression.substring($scope.inputSelectionEnd, $scope.expression.length);
                } else {
                    temp1 = $scope.expression.substring(0, $scope.inputSelectionStart);
                    temp2 = $scope.expression.substring($scope.inputSelectionEnd, $scope.expression.length);
                }
                $scope.expression = temp1 + temp2;
            } else {
                $scope.expression = $scope.expression.substring(0, $scope.expression.length - 1);
                $scope.inputSelectionStart = $scope.expression.length;
            }
            $scope.inputSelectionEnd = $scope.inputSelectionStart;
            setSelection($scope.inputSelectionStart, $scope.inputSelectionEnd);
        }

        /** 清空表达式 */
        this.clear = function () {
            $scope.expression = '';
            $scope.inputSelectionStart = 0;
            $scope.inputSelectionEnd = 0;
        }

        /** 关闭表达式输入窗口 */
        this.close = function () {
            this.toggle = false;
        }

        /** 返回表达式输入窗口 */
        this.return = function () {
            $scope.showFuncContent = false;
        }
    }

    angular.module('frApp').component('expressionInputter', {
        templateUrl: `./pages/components/expressionInputter.html?v=${new Date().getTime()}`,
        controller: ['$scope', 'toastFactory', expressionInputterController],
        bindings: {
            toggle: '=',
            event: '<',
            getExpression: '<'
        }
    })
})(window.angular);