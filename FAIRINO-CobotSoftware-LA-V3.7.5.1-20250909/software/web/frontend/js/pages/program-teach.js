/* test */
var testLimitPointData;
var testData;
var testToolCoordeData;
var testExToolCoordeData;
var testAliasData;
var testWeavecfgData;
var testTpdNameList;
var testTrajFileNameList;
var testWObjCoordeData;
var testRobotData;
var testAuthorityData;
var testEndLoadList;
if (g_testCode) {
    testLimitPointData = {
        "localpoint1": {
            name: 'localpoint1',
            x: 111.111,
            y: 122.222,
            z: 1,
            rx: 1,
            ry: 1,
            rz: 1,
            j1: '111.333',
            j2: '122.888',
            j3: '133.999',
            j4: '144.777',
            j5: '155.666',
            j6: '166.555',
            toolnum: 1,
            workpiecenum: 1,
            speed: 1,
            acc: 1,
            E1: 1,
            E2: 1,
            E3: 1,
            E4: 1
        },
        "localpoint2": {
            name: 'localpoint2',
            x: 2,
            y: 2,
            z: 2,
            rx: 2,
            ry: 2,
            rz: 2,
            j1: 2,
            j2: 2,
            j3: 2,
            j4: 2,
            j5: 2,
            j6: 2,
            toolnum: 2,
            workpiecenum: 2,
            speed: 2,
            acc: 2,
            E1: 2,
            E2: 2,
            E3: 2,
            E4: 2
        },
        "localpoint3": {
            name: 'localpoint3',
            x: 3,
            y: 3,
            z: 3,
            rx: 3,
            ry: 3,
            rz: 3,
            j1: 3,
            j2: 3,
            j3: 3,
            j4: 3,
            j5: 3,
            j6: 3,
            toolnum: 3,
            workpiecenum: 3,
            speed: 3,
            acc: 3,
            E1: 3,
            E2: 3,
            E3: 3,
            E4: 3
        },
        "seamPos": {
            name: 'seamPos',
            x: 4,
            y: 4,
            z: 4,
            rx: 4,
            ry: 4,
            rz: 4,
            j1: 4,
            j2: 4,
            j3: 4,
            j4: 4,
            j5: 4,
            j6: 4,
            toolnum: 4,
            workpiecenum: 4,
            speed: 4,
            acc: 4,
            E1: 4,
            E2: 4,
            E3: 4,
            E4: 4
        },
        "PosA": {
            name: 'PosA',
            x: 5,
            y: 5,
            z: 5,
            rx: 5,
            ry: 5,
            rz: 5,
            j1: 5,
            j2: 5,
            j3: 5,
            j4: 5,
            j5: 5,
            j6: 5,
            toolnum: 5,
            workpiecenum: 5,
            speed: 5,
            acc: 5,
            E1: 5,
            E2: 5,
            E3: 5,
            E4: 5
        },
        "PosB": {
            name: 'PosB',
            x: 6,
            y: 6,
            z: 6,
            rx: 6,
            ry: 6,
            rz: 6,
            j1: 6,
            j2: 6,
            j3: 6,
            j4: 6,
            j5: 6,
            j6: 6,
            toolnum: 6,
            workpiecenum: 6,
            speed: 6,
            acc: 6,
            E1: 6,
            E2: 6,
            E3: 6,
            E4: 6
        },
        "PosC": {
            name: 'PosC',
            x: 7,
            y: 7,
            z: 7,
            rx: 7,
            ry: 7,
            rz: 7,
            j1: 7,
            j2: 7,
            j3: 7,
            j4: 7,
            j5: 7,
            j6: 7,
            toolnum: 7,
            workpiecenum: 7,
            speed: 7,
            acc: 7,
            E1: 7,
            E2: 7,
            E3: 7,
            E4: 7
        }
    };
    testData = {
        "program1.lua": {
            name: "program1.lua",
            pgvalue: "PTP(localpoint1,100,99,0)\nNewDofile(\"/fruser/program3.lua\",1,1)\nDofileEnd()",
            level: 0
        },
        "program2.lua": {
            name: "program2.lua",
            pgvalue: "PTP(11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111)\nPTP(2)\nPTP(3)\nPTP(4)\nPTP(5)\nPTP(6)\nPTP(7)\nPTP(8)\nPTP(9)\nPTP(10)\nPTP(11)\nPTP(1222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222)\nPTP(13)\nPTP(14)\nPTP(15)\nPTP(16)\nPTP(17)\nPTP(18)\nPTP(19)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nmode(20)\nline(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)\nPTP(20)",
            level: 0
        },
        "program3.lua": {
            name: "program3.lua",
            pgvalue: "PTP(localpoint1,100,80,0)",
            level: 0
        },
        "program4.lua": {
            name: "program4.lua",
            pgvalue: "PTP(localpoint2)",
            level: 0
        },
        "program5.lua": {
            name: "program5.lua",
            pgvalue: "PTP(.......)",
            level: 1
        },
        "program6.lua": {
            name: "program6.lua",
            pgvalue: "PTP(.......)",
            level: 1
        },
        "program7.lua": {
            name: "program7.lua",
            pgvalue: "PTP(.......)",
            level: 1
        },
        "program8.lua": {
            name: "program8.lua",
            pgvalue: "PTP(.......)",
            level: 1
        },
        "program9.lua": {
            name: "program9.lua",
            pgvalue: "PTP(.......)",
            level: 2
        },
        "program10.lua": {
            name: "program10.lua",
            pgvalue: "PTP(.......)",
            level: 2
        },
        "program11.lua": {
            name: "program11.lua",
            pgvalue: "PTP(.......)",
            level: 2
        },
        "program12.lua": {
            name: "program12.lua",
            pgvalue: "PTP(.......)",
            level: 2
        }
    };
    testToolCoordeData = [
        {
            name: 'toolcoord0',
            id: '0',
            x: 0,
            y: 0,
            z: 0,
            rx: 0,
            ry: 0,
            rz: 0,
            type: 0,
            installation_site: 0
        },
        {
            name: 'toolcoord1',
            id: '1',
            x: 1,
            y: 1,
            z: 1,
            rx: 1,
            ry: 1,
            rz: 1,
            type: 1,
            installation_site: 1
        },
        {
            name: 'toolcoord2',
            id: '2',
            x: 2,
            y: 2,
            z: 2,
            rx: 2,
            ry: 2,
            rz: 2,
            type: 1,
            installation_site: 2
        }
    ];
    testExToolCoordeData = {
        etoolcoord0: {
            name: 'etoolcoord0',
            user_name: '外部工具坐标0',
            id: 0,
            ex: 0,
            ey: 0,
            ez: 0,
            erx: 0,
            ery: 0,
            erz: 0,
            tx: 0,
            ty: 0,
            tz: 0,
            trx: 0,
            try: 0,
            trz: 0
        },
        etoolcoord1: {
            name: 'etoolcoord1',
            user_name: '外部工具坐标1',
            id: 1,
            ex: 1,
            ey: 1,
            ez: 1,
            erx: 1,
            ery: 1,
            erz: 1,
            tx: 1,
            ty: 1,
            tz: 1,
            trx: 1,
            try: 1,
            trz: 1
        },
        etoolcoord2: {
            name: 'etoolcoord2',
            user_name: '外部工具坐标2',
            id: 2,
            ex: 2,
            ey: 2,
            ez: 2,
            erx: 2,
            ery: 2,
            erz: 2,
            tx: 2,
            ty: 2,
            tz: 2,
            trx: 2,
            try: 2,
            trz: 2
        },
        etoolcoord3: {
            name: 'etoolcoord3',
            user_name: '外部工具坐标3',
            id: 3,
            ex: 3,
            ey: 3,
            ez: 3,
            erx: 3,
            ery: 3,
            erz: 3,
            tx: 3,
            ty: 3,
            tz: 3,
            trx: 3,
            try: 3,
            trz: 3
        }
    };
    testAliasData = {
        CtrlBox: {
            DI: ["打磨DI0", "打磨DI1", "打磨DI2", "打磨DI3", "打磨DI4", "打磨DI5", "打磨DI6", "打磨DI7", "打磨CI0", "打磨CI1", "打磨CI2", "打磨CI3", "打磨CI4", "打磨CI5", "打磨CI6", "打磨CI7"],
            DO: ["传送带DO0", "传送带DO1", "传送带DO2", "传送带DO3", "传送带DO4", "传送带DO5", "传送带DO6", "传送带DO7", "传送带CO0", "传送带CO1", "传送带CO2", "传送带CO3", "传送带CO4", "传送带CO5", "传送带CO6", "传送带CO7"],
            AI: ["焊接AI1", "焊接AI2"],
            AO: ["焊接AO1", "焊接AO2"]
        },
        EndEff: {
            DI: ["起弧DI1", "起弧DI2"],
            DO: ["起弧DO1", "起弧DO2"],
            AI: ["起弧AI"],
            AO: ["起弧AO"]
        }
    };
    testWeavecfgData = [
        {
            id: 0,
            type: 0,
            freq: 0,
            inctime: 0,
            stationary: 0,
            range: 0,
            leftrange: 0,
            rightrange: 0,
            origintime: 0,
            ltime: 0,
            rtime: 0,
            circleratio: 0,
            yawangle: 0
        },
        {
            id: 1,
            type: 1,
            freq: 1,
            inctime: 1,
            stationary: 1,
            range: 1,
            leftrange: 1,
            rightrange: 1,
            origintime: 1,
            ltime: 1,
            rtime: 1,
            circleratio: 1,
            yawangle: 1
        },
        {
            id: 2,
            type: 2,
            freq: 2,
            inctime: 0,
            stationary: 0,
            range: 2,
            leftrange: 2,
            rightrange: 2,
            origintime: 2,
            ltime: 2,
            rtime: 2,
            circleratio: 2,
            yawangle: 2
        },
        {
            id: 3,
            type: 3,
            freq: 3,
            inctime: 1,
            stationary: 1,
            range: 3,
            leftrange: 3,
            rightrange: 3,
            origintime: 3,
            ltime: 3,
            rtime: 3,
            circleratio: 3,
            yawangle: 3
        },
        {
            id: 4,
            type: 4,
            freq: 4,
            inctime: 0,
            stationary: 0,
            range: 4,
            leftrange: 4,
            rightrange: 4,
            origintime: 4,
            ltime: 4,
            rtime: 4,
            circleratio: 4,
            yawangle: 4
        },
        {
            id: 5,
            type: 5,
            freq: 5,
            inctime: 1,
            stationary: 1,
            range: 5,
            leftrange: 5,
            rightrange: 5,
            origintime: 5,
            ltime: 5,
            rtime: 5,
            circleratio: 5,
            yawangle: 5
        },
        {
            id: 6,
            type: 6,
            freq: 6,
            inctime: 0,
            stationary: 0,
            range: 6,
            leftrange: 6,
            rightrange: 6,
            origintime: 6,
            ltime: 6,
            rtime: 6,
            circleratio: 6,
            yawangle: 6
        }
    ];
    testTrajFileNameList = ['trajHex_1', 'trajHex_2'];
    testTpdNameList = ['tpd1', 'tpd2'];
    testWObjCoordeData = {
        wodjcoord0: {
            name: 'wodjcoord0',
            id: 0,
            x: 0,
            y: 0,
            z: 0,
            rx: 0,
            ry: 0,
            rz: 0
        },
        wodjcoord1: {
            name: 'wodjcoord1',
            id: 1,
            x: 1,
            y: 1,
            z: 1,
            rx: 1,
            ry: 1,
            rz: 1
        },
        wodjcoord2: {
            name: 'wodjcoord2',
            id: 2,
            x: 2,
            y: 2,
            z: 2,
            rx: 2,
            ry: 2,
            rz: 2
        },
        wodjcoord3: {
            name: 'wodjcoord3',
            id: 3,
            x: 3,
            y: 3,
            z: 3,
            rx: 3,
            ry: 3,
            rz: 3
        }
    };
    testRobotData = {
        load_identify_dyn: 0
    };
    testAuthorityData = [
        {
            auth_id: 0,
            auth_name: '超级管理员',
            auth_description: '超级管理员的职能描述'
        },
        {
            auth_id: 1,
            auth_name: '监视',
            auth_description: '监视的职能描述'
        },
        {
            auth_id: 2,
            auth_name: '操作员',
            auth_description: '操作员的职能描述'
        },
        {
            auth_id: 3,
            auth_name: '技术员&组长',
            auth_description: '技术员&组长的职能描述'
        },
        {
            auth_id: 4,
            auth_name: 'PE&PQE工程师',
            auth_description: 'PE&PQE工程师的职能描述PE&PQE工程师的职能描述PE&PQE工程师的职能描述PE&PQE工程师的职能描述PE&PQE工程师的职能描述'
        },
        {
            auth_id: 5,
            auth_name: 'ME工程师',
            auth_description: 'ME工程师的职能描述'
        },
        {
            auth_id: 66666666,
            auth_name: '管理员管理员管理员管理员管理员管理员',
            auth_description: '管理员的职能描述管理员的职能描述管理员的职能描述管理员的职能描述管理员的职能描述管理员的职能描述管理员的职能描述管理员的职能描述'
        },
        {
            auth_id: 7,
            auth_name: '市场员',
            auth_description: '市场员的职能描述'
        },
        {
            auth_id: 8,
            auth_name: '程序员',
            auth_description: '程序员的职能描述'
        }
    ];
    testEndLoadList = [
        {
            id: 0,
            name: 'load0',
            x: '0',
            y: '0',
            z: '0',
            weight: '0'
        },
        {
            id: 1,
            name: 'load1',
            x: '1',
            y: '1',
            z: '1',
            weight: '1'
        },
        {
            id: 2,
            name: 'load2',
            x: '2',
            y: '2',
            z: '2',
            weight: '2'
        },
        {
            id: 3,
            name: 'load3',
            x: '3',
            y: '3',
            z: '3',
            weight: '3'
        }
    ];
}
/* ./test */

angular
    .module('frApp')
    .controller('programteachCtrl', ['$scope', '$compile', 'dataFactory', 'toastFactory', programteachCtrlFn])

function programteachCtrlFn($scope, $compile, dataFactory, toastFactory) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.halfBothView();
    $scope.setProgramUrdf(true);
    document.getElementById('btn-expand').style.width = `${document.getElementById('urdf-container').offsetWidth}px`;
    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let ptDynamicTags;
    let monitorTeachData; //检测示教程序内容
    ptDynamicTags = langJsonData.program_teach;
    $scope.programCategoryArray = ptDynamicTags.var_object.program_category_array; //指令分类列表
    $scope.programCommandArray = ptDynamicTags.var_object.program_command_array; //指令名称列表
    $scope.modebusAddressTypeArray = ptDynamicTags.var_object.modebus_address_type_array; //Modbus主站地址类型
    $scope.modbusSlaveFucDIData = ptDynamicTags.var_object.modbusSlaveFucDIData; //Modbus从站DI输入状态
    $scope.modbusSlaveDOCtrlDIData = ptDynamicTags.var_object.modbusSlaveDOCtrlDIData; //Modbus从站DI输入状态
    let globalPoint = ptDynamicTags.info_messages[98];
    let localPoint = ptDynamicTags.info_messages[99];
    $scope.programCategoryId = $scope.programCategoryArray[0]; //指令默认全部类
    $scope.programAreaRight = false; // 是否显示左侧内容（局部示教点、当前程序备份）
    $scope.showCommandsTextExpand = false; // 是否扩展显示编辑模式下的右侧内容
    $scope.localpointCheckAll = false;
    $scope.addCommandIndexArr = [];
    $scope.showCommandIndexArr = [];
    /* 初始化 */
    getTempFiles();
    backgetUserFiles();
    getToolCoordData();
    getRobotdata();
    /* ./初始化 */
    /* 气泡弹窗激活 */
    $(function () {
        $('#btnDeleteFile').tooltip({
            animation: true,
            placement: 'bottom',
            title: ptDynamicTags.info_messages[1],
            trigger: "focus",
        });
        $('#btnExportFile').tooltip({
            animation: true,
            placement: 'bottom',
            title: ptDynamicTags.info_messages[1],
            trigger: "focus",
        });
        $('#btnSaveCommands').tooltip({
            animation: true,
            placement: 'bottom',
            title: ptDynamicTags.info_messages[1],
            trigger: "focus",
        });
        $('#btnSaveAs').tooltip({
            animation: true,
            placement: 'bottom',
            title: ptDynamicTags.info_messages[1],
            trigger: "focus",
        });
    });
    /* 气泡弹窗激活 */

    /**离开当前页面，路由发生改变时触发 */
    let navigateUrl; //跳转页面的路径
    $scope.$on('$routeChangeStart', function(event, current, previous) {
        if ($scope.editMode_FileName && $scope.editMode_CommandsArr && monitorTeachData) {
            if ($scope.editMode_CommandsArr.length === monitorTeachData.length && $scope.editMode_CommandsArr.every((item, index) => item === monitorTeachData[index])) {
            } else {
                event.preventDefault(); //拦截路由跳转
                $('#programUnsavedModal').modal();
                navigateUrl = '#' + current.originalPath; //跳转暂存的路径
            }
        }
    })

    /**监测全局示教程序，发生改变时触发 */
    $scope.$watch(() => {
        if ($scope.editMode_FileName && $scope.editMode_CommandsArr && monitorTeachData) {
            if ($scope.editMode_CommandsArr.length == monitorTeachData.length && $scope.editMode_CommandsArr.every((item, index) => item === monitorTeachData[index])) {
                g_programChangeFlag = 3; // 未发生改变
            } else {
                g_programChangeFlag = 1; // 示教程序发生改变
            }
        }
    })


    $scope.modbusType = 'master';
    /**
     * Modbus主/从站设置
     * @param {string} type 主站：'master';从站：'slave'
     */
    $scope.toggleModbusSettingType = function (type) {
        $scope.modbusType = type;
        $(".modbus-title").removeClass('active');
        $(".modbus-title-" + type).addClass('active');
        if ($scope.modbusType == 'master') {
            getModbusMasterConfig();
            getModbusMasterAddressConfig();
        } else {
            getModbusSlaveAliasConfig();
            getModbusSlaveParam();
        }
    }

    $scope.digitalType = 'di';
    /**
     * Modbus从站数字输入输出
     * @param {string} type 数字输入：'di';数字输出：'do'
     */
    $scope.toggleModbusDigitalType = function (type) {
        $scope.digitalType = type;
        $(".digital-title").removeClass('active');
        $(".digital-title-" + type).addClass('active');
    }

    $scope.AIType = 'unsigned';
    /**
     * Modbus从站模拟量输入
     * @param {string} type 无符号：'unsigned';有符号：'signed'；浮点型：'float'
     */
    $scope.toggleModbusAIType = function (type) {
        $scope.AIType = type;
        $(".AI-title").removeClass('active');
        $(".AI-title-" + type).addClass('active');
    }

    $scope.AOType = 'unsigned';
    /**
     * Modbus从站模拟量输出
     * @param {string} type 无符号：'unsigned';有符号：'signed'；浮点型：'float'
     */
    $scope.toggleModbusAOType = function (type) {
        $scope.AOType = type;
        $(".AO-title").removeClass('active');
        $(".AO-title-" + type).addClass('active');
    }

    /**
     * 创建主站
     * @param {int} id 主站编号
     * @param {string} ip 从站IP
     * @param {int} port 端口号
     * @param {int} slaveID 从站号
     * @param {int} period 通讯周期
     * @param {string} alias 名称
     * @param {int} 类型 0-主站别名同名校验标志
     * @returns 
     */
    let masterIdFlag = 0;
    let recordConfigData = []; //记录初始主站原始数据
    $scope.createModbusMaster = function(id,ip,port,slaveID,period,alias,type) {
        //创建Modbus主站时处理
        if (id == undefined) {
            if ($scope.modbusMasterConfigData) {
                //主站数量最多为8个
                if ($scope.modbusMasterConfigData.filter(item => item.id == 7).length > 0) {
                    toastFactory.info(ptDynamicTags.info_messages[232]);
                    return;
                }

                // 添加主站时，别名自增，自动增加0-7之间的数字
                for(let i=0; i<=7; i++) {
                    if ($scope.modbusMasterConfigData.findIndex(item => item.alias.slice(7,item.alias.length) == i) == -1) {
                        masterIdFlag = i;
                        break;
                    }
                }
                id = $scope.modbusMasterConfigData.length;
            } else {
                id = 0;
            }

            ip = '192.168.58.1';
            port = 502;
            slaveID = 1;
            period = 100;
            alias = 'Modbus_' + masterIdFlag;
        }

        if (type == 0 && recordConfigData.findIndex(item => item.alias == alias) != -1) {
            let aliasData = $scope.modbusMasterConfigData.filter(item => item.id == id)[0].alias;
            let aliasRecordData = recordConfigData.filter(item => item.id == id)[0].alias;
    
            if (aliasData == aliasRecordData && recordConfigData.findIndex(item => item.alias == alias) == addressid) {
                return;
            }
            getModbusMasterConfig();
            toastFactory.info(ptDynamicTags.info_messages[233]);
            return;
        }

        let createModbusMasterCmd = {
            cmd: 884,
            data: {
                id: id,
                ip: ip,
                port: parseInt(port),
                slaveID: parseInt(slaveID),
                period: parseInt(period),
                alias: alias
            }
        }
        dataFactory.setData(createModbusMasterCmd)
            .then(() => {
                getModbusMasterConfig();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 删除主站
     * @param {int} id 主站id
     * @returns 
     */
    let deleteModbusMasterFlag = 0;
    let recordMasterId;//记录单独删除的id是否时上次操作的数据
    $scope.deleteModbusMaster = function(id) {
        let deleteModbusMasterCmd;
        if (deleteModbusMasterFlag == 0) {
            recordMasterId = id;
            deleteModbusMasterFlag = 1;
            toastFactory.info(ptDynamicTags.info_messages[7]);
            return;
        } else {
            if (recordMasterId != id) {
                recordMasterId = id;
                deleteModbusMasterFlag = 1;
                toastFactory.info(ptDynamicTags.info_messages[7]);
                return;
            }
            deleteModbusMasterFlag = 0;
            recordMasterId = "";
            deleteModbusMasterCmd = {
                cmd: 885,
                data: {
                    id: id
                }
            }
        }
        $('#pageLoading').css("display", "block");
        dataFactory.setData(deleteModbusMasterCmd)
            .then(() => {
                getModbusMasterConfig();
                $('#pageLoading').css("display", "none");
            }, (status) => {
                toastFactory.error(status);
                $('#pageLoading').css("display", "none");
            });
    }

    /**获取主站配置 */
    function getModbusMasterConfig() {
        let modbusMasterConfigCmd = {
            cmd: 886,
            data: {
                content: "ModbusMasterGetConfig()"
            }
        }
        dataFactory.setData(modbusMasterConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    let data = [
                        {
                            id: 0,
                            ip: "192.168.58.33",
                            port: 8020,
                            slaveID: 0,
                            period: 200,
                            alias: "Modbus_0"
                        },
                        {
                            id: 1,
                            ip: "192.168.58.34",
                            port: 8021,
                            slaveID: 1,
                            period: 200,
                            alias: "Modbus_4"
                        },
                        {
                            id: 2,
                            ip: "192.168.58.34",
                            port: 8022,
                            slaveID: 1,
                            period: 200,
                            alias: "Modbus1"
                        }
                    ]
                    $scope.modbusMasterConfigData = data;
                    getModbusMasterAddressConfig();
                }
                /* ./test */
            });
    }

    document.getElementById('programTeach').addEventListener('886', e => {
        $scope.modbusMasterConfigData = JSON.parse(e.detail);
        getModbusMasterAddressConfig();
    })

    /**
     * 应用主站寄存器地址
     * @param {int} id 主站id
     * @param {int} addressid 从站id
     * @param {int} addresstype 地址类型
     * @param {int} address 地址
     * @param {string} alias 名称
     * @param {int} type 类型 0-修改寄存器名称标志
     * @returns 
     */
    let masterRegisterIdFlag = 0;
    let recordConfigAddressData = [];////记录初始主站寄存器原始数据
    $scope.applyModbusMasterRegister = function(id,addressid,addresstype,address,alias,type) {
        //创建主站寄存器地址时处理
        if (addressid == undefined) {
            if (recordRegisterData) {
                //主站寄存器数量最多为128个
                if (recordRegisterData.filter(item => item.id == id).length == 128) {
                    toastFactory.info(ptDynamicTags.info_messages[231]);
                    return;
                }

                // 添加主站寄存器时，别名自增，自动增加0-127之间的数字
                for(let i=0; i<=127; i++) {
                    if (recordRegisterData.filter(item => item.id == id).findIndex(item => item.id_name == i) == -1) {
                        masterRegisterIdFlag = i;
                        break;
                    }
                }
                addressid = recordRegisterData.filter(item => item.id == id).length;
                addresstype = $scope.modbusMasterAddressData[id].addresstype.pop();
                address = $scope.modbusMasterAddressData[id].address.pop() + 1;
            } else {
                addressid = 0;
                addresstype = 0;
                address = 2000;
            }

            alias = 'Register_' + masterRegisterIdFlag;
        }

        // 修改寄存器名称时判断不能同名
        if (type == 0 && recordConfigAddressData.filter(item => item.id == id).findIndex(item => item.alias == alias) != -1) {
            let aliasData = $scope.modbusMasterNewData.filter(item => item.id == id)[0].alias;
            let aliasRecordData = recordConfigAddressData.filter(item => item.id == id)[0].alias;
            if (aliasData == aliasRecordData && recordConfigAddressData.findIndex(item => item.alias == alias) == addressid) {
                return;
            }
            getModbusMasterAddressConfig();
            toastFactory.info(ptDynamicTags.info_messages[234]);
            return;
        }
        
        let applyModbusMasterRegisterCmd = {
            cmd: 887,
            data: {
                id: id,
                addressid: addressid,
                addresstype: parseInt(addresstype),
                address: parseInt(address),
                alias: alias
            }
        }
        dataFactory.setData(applyModbusMasterRegisterCmd)
            .then(() => {
                getModbusMasterAddressConfig();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 删除主站寄存器地址
     * @param {int} id 主站id
     * @param {int} addressid 地址编号
     * @returns 
     */
    let deleteMasterRegisterFlag = 0; // 删除标志，需要删除确认
    let recordRegisterId;//记录单独删除的addressid是否时上次操作的数据
    $scope.deleteModbusMasterRegister = function(id,addressid) {
        let deleteModbusMasterRegisterCmd;
        if (deleteMasterRegisterFlag == 0) {
            recordRegisterId = addressid;
            deleteMasterRegisterFlag = 1;
            toastFactory.info(ptDynamicTags.info_messages[7]);
            return;
        } else {
            if (recordRegisterId != addressid) {
                recordRegisterId = addressid;
                deleteMasterRegisterFlag = 1;
                toastFactory.info(ptDynamicTags.info_messages[7]);
                return;
            }
            deleteMasterRegisterFlag = 0;
            recordRegisterId = "";

            deleteModbusMasterRegisterCmd = {
                cmd: 888,
                data: {
                    id: id,
                    addressid: addressid
                }
            }
        }
        $('#pageLoading').css("display", "block");
        dataFactory.setData(deleteModbusMasterRegisterCmd)
            .then(() => {
                getModbusMasterAddressConfig();
                $('#pageLoading').css("display", "none");
            }, (status) => {
                $('#pageLoading').css("display", "none");
                toastFactory.error(status);
            });
    }

    /**获取主站寄存器配置 */
    let recordRegisterData = [];
    function getModbusMasterAddressConfig() {
        let modbusMasterConfigCmd = {
            cmd: 889,
            data: {
                content: "ModbusMasterGetAddressConfig()"
            }
        }
        dataFactory.setData(modbusMasterConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('programTeach').addEventListener('889', e => {
        $scope.modbusMasterAddressData = JSON.parse(e.detail);
        if ($scope.modbusMasterAddressData) {
            let data = [];
            recordRegisterData = [];
            $scope.modbusMasterAddressData.forEach(item => {
                item["children"] = [];
            })
            $scope.modbusMasterAddressData.forEach(item => {
                for(let i=0; i<item.addressnum; i++) {
                    let array_new = {};
                    array_new = {
                        id: item.id,
                        addressid: i, 
                        addresstype: item.addresstype[i], 
                        address: item.address[i], 
                        alias: item.alias[i],
                        mastervalue: $scope.modbusStateData.mastervalue[item.id] ? $scope.modbusStateData.mastervalue[item.id][i] : 0,
                        type: $scope.modebusAddressTypeArray[item.addresstype[i]]
                    }
                    item["children"].push(array_new);
                    data.push(array_new);
    
                    // 记录添加的寄存器名称
                    let record_register_new = {};
                    if (item.alias[i] && item.alias[i].length>9) {
                        record_register_new = {
                            id: item.id,
                            id_name: parseInt(item.alias[i].slice(9,item.alias[i].length)),
                        }
                    } else {
                        record_register_new = {
                            id: item.id,
                            id_name: item.alias[i],
                        }
                    }
                    recordRegisterData.push(record_register_new);
                }
            });
            //校验寄存器名称数据列表
            $scope.modbusMasterNewData = data;
            $scope.modbusMasterDIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 0);
            $scope.modbusMasterDOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 1);
            $scope.modbusMasterAIData = $scope.modbusMasterNewData.filter(item => item.addresstype == 2 || item.addresstype == 3 || item.addresstype == 4);
            $scope.modbusMasterAOData = $scope.modbusMasterNewData.filter(item => item.addresstype == 5 || item.addresstype == 6 || item.addresstype == 7);
            recordConfigAddressData = JSON.parse(JSON.stringify(data));
            if ($scope.modbusMasterConfigData) {
                $scope.modbusMasterConfigData.forEach(item => {
                    item["children"] = $scope.modbusMasterAddressData.filter(data => data.id == item.id)[0].children;
                })
            }
            recordConfigData = JSON.parse(JSON.stringify($scope.modbusMasterConfigData));
            //从小到大排序寄存器序号数据
            recordRegisterData =  recordRegisterData.sort((a, b) => {
                return a.id_name - b.id_name;
            })
        }
    })

    /**
     * 切换modbus主站后寄存器数据
     * @param {int} id 
     */
    $scope.changeModbusRegister = function(id) {
        $scope.modbusMasterDINewData = $scope.modbusMasterDIData.filter(item => item.id == id);
        $scope.modbusMasterDONewData = $scope.modbusMasterDOData.filter(item => item.id == id);
        $scope.modbusMasterAINewData = $scope.modbusMasterAIData.filter(item => item.id == id);
        $scope.modbusMasterAONewData = $scope.modbusMasterAOData.filter(item => item.id == id);
    }

    /**
     * 设置从站配置参数
     * @param {int} ip 从站ip  
     * @param {int} port 从站端口号  
     * @param {int} slaveId 从站号
     */
    $scope.setModbusSlaveParam = function(ip,port,slaveId) {
        if (ip && port && slaveId) {
            let setModbusSlaveParamCmd = {
                cmd: 872,
                data: {
                    content: "ModbusSlaveSetParam(\"" + ip + "\"," + port + "," + slaveId + ")"
                }
            }
            dataFactory.setData(setModbusSlaveParamCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /** 获取从站配置参数*/
    function getModbusSlaveParam() {
        let getModbusSlaveParamCmd = {
            cmd: 873,
            data: {
                content: "ModbusSlaveGetParam()"
            }
        }
        dataFactory.setData(getModbusSlaveParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('programTeach').addEventListener('873', e => {
        let data = e.detail.split(",");
        $scope.modbusSlaveIP = data[0];
        $scope.modbusSlavePort = data[1];
        $scope.modbusSlaveId = data[2];
    })

    /**
     * 切换modbus主站后寄存器数据
     * @param {int} id 
     */
    $scope.changeModbusRegister = function(id) {
        $scope.modbusMasterDINewData = $scope.modbusMasterDIData.filter(item => item.id == id);
        $scope.modbusMasterDONewData = $scope.modbusMasterDOData.filter(item => item.id == id);
        $scope.modbusMasterAINewData = $scope.modbusMasterAIData.filter(item => item.id == id);
        $scope.modbusMasterAONewData = $scope.modbusMasterAOData.filter(item => item.id == id);
    }

    /**获取从站寄存器别名 */
    function getModbusSlaveAliasConfig() {
        let getModbusSlaveAliasCmd = {
            cmd: "get_modbusslave_IO_alias_cfg"
        }
        dataFactory.getData(getModbusSlaveAliasCmd)
            .then((data) => {
                $scope.modbusSlaveIOAliasData = data;
                $scope.slaveAIUnsigned = $scope.modbusSlaveIOAliasData["AI"].slice(0,16);
                $scope.slaveAISigned = $scope.modbusSlaveIOAliasData["AI"].slice(16,32);
                $scope.slaveAIFloat = $scope.modbusSlaveIOAliasData["AI"].slice(32,64);
                $scope.slaveAOUnsigned = $scope.modbusSlaveIOAliasData["AO"].slice(0,16);
                $scope.slaveAOSigned = $scope.modbusSlaveIOAliasData["AO"].slice(16,32);
                $scope.slaveAOFloat = $scope.modbusSlaveIOAliasData["AO"].slice(32,64);
                $scope.modbusValueData = $scope.modbusStateData;//更新AO输入框数据
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置从站寄存器别名
     * @param {sting} type DI,DO,AI,AO
     * @param {int} id 需要修改的id位置
     * @param {string} name 修改的名称
     */
    $scope.setModbusSlaveIOAliasCfg = function(type,id,name) {
        let sendModbusSlaveIOAlias = $scope.modbusSlaveIOAliasData;
        if (sendModbusSlaveIOAlias[type][id] == name) {
            //IO别名未作修改时不下发指令
            $(`#borderEditor${type}${id}`).removeClass("input-error-border");
            return;
        };
        if (sendModbusSlaveIOAlias[type].findIndex(item => item == name) != -1) {
            //IO别名存在同名时，出现红色提示框
            $(`#borderEditor${type}${id}`).addClass("input-error-border");
            toastFactory.info(ptDynamicTags.info_messages[235])
            return;
        } else {
            sendModbusSlaveIOAlias[type][id] = name;
            $(`#borderEditor${type}${id}`).removeClass("input-error-border");
        }
        let setModbusSlaveAliasCmd = {
            cmd: "set_modbusslave_IO_alias_cfg",
            data: sendModbusSlaveIOAlias
        }
        dataFactory.actData(setModbusSlaveAliasCmd)
            .then(() => {
                getModbusSlaveAliasConfig();
                toastFactory.success(ptDynamicTags.success_messages[23]);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[43]);
            });
    }

    /**
     * 主站写DO
     * @param {int} id 主站编号
     * @param {int} addressid 寄存器编号
     * @param {int} num 写入数量
     * @param {int} value 值0~1
     */
    $scope.setModbusMasterWriteDO = function(id,addressid,num,value) {
        let setModbusMasterWriteDOCmd = {
            cmd: 890,
            data: {
                content: "ModbusMasterWriteDO(" + id + "," + addressid + ","  + num + ",{" + value + "})"
            },
        };
        dataFactory.setData(setModbusMasterWriteDOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 主站写AO
     * @param {int} id 主站编号
     * @param {int} addressid 寄存器编号
     * @param {int} num 写入数量
     * @param {int} value 值0~1
     */
    $scope.setModbusMasterWriteAO = function(id,addressid,num,value) {
        let setModbusMasterWriteAOCmd = {
            cmd: 891,
            data: {
                content: "ModbusMasterWriteAO(" + id + "," + addressid + ","  + num + ",{" + value + "})"
            },
        };
        dataFactory.setData(setModbusMasterWriteAOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 从站写DO
     * @param {int} id DO编号
     * @param {int} num 写入数量
     * @param {int} value 值0~1
     */
    $scope.setModbusSlaveWriteDO = function(id,num,value) {
        let setModbusSlaveWriteDOCmd = {
            cmd: 874,
            data: {
                content: "ModbusSlaveWriteDO(" + id + "," + num + ",{" + (1 ^ value) + "})"
            },
        };
        dataFactory.setData(setModbusSlaveWriteDOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 从站写AO
     * @param {int} id AO编号
     * @param {int} num 写入数量
     * @param {int} value 值
     */
    $scope.setModbusSlaveWriteAO = function(id,num,value) {
        let setModbusSlaveWriteAOCmd = {
            cmd: 876,
            data: {
                content: "ModbusSlaveWriteAO(" + id + "," + num + ",{" + value + "})"
            },
        };
        dataFactory.setData(setModbusSlaveWriteAOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 程序示教右侧内容打开 */
    let viewFlag = 0;   //0-half,1-full
    $scope.programAreaRightType = 'robot';
    // 查看 backup-程序修改备份;point-局部示教点位;modbus-modbus配置;dofile-子程序;add-程序示教添加;robot-机器人模型;
    $scope.chooseProgramView = function(type) {
        switch (type) {
            case 'robot':
                $scope.ReturnCommandArr = JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr));
                $scope.showCommandIndexArr = [];
                $scope.addCommandIndexArr = [];
                $scope.halfBothView();
                viewFlag = 0;
                $scope.programAreaRight = false;
                $scope.programAreaRightType = type;
                $scope.setProgramUrdf(true);
                break;
            case 'add':
            case 'edit':
            case 'dofile':
            case 'backup':
            case 'point':
                if ($scope.fileSelected) {
                    if (type == 'dofile' && $scope.dofileList.length == 0 && $scope.editMode_CommandsArr.length) {
                        toastFactory.info(ptDynamicTags.info_messages[260]);
                        return;
                    };
                    if (type == 'backup' || type == 'point') {
                        $scope.ReturnCommandArr = JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr));
                        $scope.showCommandIndexArr = [];
                        $scope.addCommandIndexArr = [];
                    }
                    $scope.fullContentView();
                    viewFlag = 1;
                    $scope.programAreaRight = true;
                    if ($scope.programAreaRightType == type && !$scope.showCommandsTextExpand) return;
                    $scope.programAreaRightType = type;
                    $scope.showCommandsTextExpand = false;
                    getProgramAreaRightData(type);
                } else {
                    toastFactory.info(ptDynamicTags.info_messages[13]);
                }
                break;
            case 'modbus':
                $scope.ReturnCommandArr = JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr));
                $scope.showCommandIndexArr = [];
                $scope.addCommandIndexArr = [];
                $scope.fullContentView();
                viewFlag = 1;
                $scope.programAreaRight = true;
                if ($scope.programAreaRightType == type && !$scope.showCommandsTextExpand) return;
                $scope.programAreaRightType = type;
                $scope.showCommandsTextExpand = false;
                getProgramAreaRightData(type);
                break;
            default:
                break;
        }
    }
    // 扩展示教程序显示区域
    $scope.expandEditor = function() {
        if (!$scope.fileSelected) {
            toastFactory.info(ptDynamicTags.info_messages[13]);
            return;
        }
        if ($scope.programAreaRightType != 'robot') {
            $scope.showCommandsTextExpand = !$scope.showCommandsTextExpand;
        } else {
            $scope.programAreaRight = !$scope.programAreaRight;
            if (viewFlag) {
                $scope.halfBothView();
                viewFlag = 0;
                $scope.setProgramUrdf(true);
            } else {
                $scope.fullContentView();
                viewFlag = 1;
            }
        }
    }
    /* ./程序示教右侧内容打开 */

    /* 数据初始化 */
    /**ACE Editor编辑器设置 */
    var editor = ace.edit("editor");
    //设置主题
    editor.setTheme("ace/theme/crimson_editor");
    //设置语言模式
    editor.getSession().setMode("ace/mode/lua");
    //禁用语法检查器
    editor.getSession().setUseWorker(false);
    //禁用显示打印线
    editor.setShowPrintMargin(false);

    //自动补全功能
    editor.setOptions({
        enableBasicAutocompletion:true,
        // enableSnippets:true,
        enableLiveAutocompletion:true
    })

    //监听事件
    editor.getSession().on('change',function(e){
        $scope.editMode_CommandsText = editor.getValue();
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            editor.setReadOnly(true);
        } else {
            editor.setReadOnly(false);
        }
        if(("1" != $scope.controlMode)&&$scope.debug_flag){
            $scope.editMode_CommandsText = commandsArray2String($scope.editMode_CommandsArr);
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else{
            $scope.editMode_CommandsArr = createCommandsArray($scope.editMode_CommandsText);
            updateFileDataforUpload($scope.editMode_CommandsArr);
        }
    })
    // 监听光标事件
    editor.getSession().selection.on('changeCursor',function(e){
        editor.resize();
    })

    //其他操作使得文件内容发生改变时(打开，删除......)
    function updateEditorFile(){
        if($scope.showCommandsText == true){
            editor.setValue($scope.editMode_CommandsText);
        }
    }

    function backgetUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.userData = data;
                initializePage();
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[0]);
                /* test */
                if (g_testCode) {
                    $scope.userData = testData;
                }
                /* ./test */
            });
    };

    // 记录监测的数据
    function recordMonitorData() {
        if ($scope.editMode_FileName && $scope.editMode_CommandsArr) {
            monitorTeachData = JSON.parse(JSON.stringify($scope.editMode_CommandsArr));
        }
    }

    function initializePage() {
        if (localStorage.length !== 0) {
            if ((localStorage.getItem("weldtemppgvalue") != null) && (localStorage.getItem("weldtemppgvalue") != "")) {
                //点击确定打开文件内容
                $scope.clickUserFileData = {
                    "name": localStorage.getItem("weldtempname"),
                    "pgvalue": $scope.userData[localStorage.getItem("weldtempname")].pgvalue,
                    "level": $scope.userData[localStorage.getItem("weldtempname")].level
                }
                $scope.fileSelected = $scope.clickUserFileData.name;
    
                g_fileNameForUpload = $scope.clickUserFileData.name;
                g_fileDataForUpload = processFileData($scope.clickUserFileData.pgvalue);
    
                $scope.editMode_FileName = $scope.clickUserFileData.name;
                $scope.editMode_CommandsText = $scope.clickUserFileData.pgvalue;
                $scope.editMode_CommandsLevel = $scope.clickUserFileData.level;
                if ($scope.clickUserFileData.pgvalue) {
                    $scope.editMode_CommandsArr = createCommandsArray($scope.clickUserFileData.pgvalue);
                } else {
                    $scope.editMode_CommandsArr = [];
                }
                $scope.indexSelected = null;
                setLocalStorage();
    
                $scope.clickUserFileData = null;
                localStorage.setItem("weldtempname", "");
                localStorage.setItem("weldtemppgvalue", "");
            } else if ((localStorage.getItem("kangyangtemppgvalue") != null) && (localStorage.getItem("kangyangtemppgvalue") != "")) {
                //点击确定打开文件内容
                $scope.clickUserFileData = {
                    "name": localStorage.getItem("kangyangtempname"),
                    "pgvalue": $scope.userData[localStorage.getItem("kangyangtempname")].pgvalue,
                    "level": $scope.userData[localStorage.getItem("weldtempname")].level
                }
                $scope.fileSelected = $scope.clickUserFileData.name;
    
                g_fileNameForUpload = $scope.clickUserFileData.name;
                g_fileDataForUpload = processFileData($scope.clickUserFileData.pgvalue);
    
                $scope.editMode_FileName = $scope.clickUserFileData.name;
                $scope.editMode_CommandsText = $scope.clickUserFileData.pgvalue;
                $scope.editMode_CommandsLevel = $scope.clickUserFileData.level;
                if ($scope.clickUserFileData.pgvalue) {
                    $scope.editMode_CommandsArr = createCommandsArray($scope.clickUserFileData.pgvalue);
                } else {
                    $scope.editMode_CommandsArr = [];
                }
                $scope.indexSelected = null;
                setLocalStorage();
    
                $scope.clickUserFileData = null;
                localStorage.setItem("kangyangtempname", "");
                localStorage.setItem("kangyangtemppgvalue", "");
            } else if ((localStorage.getItem("lastprogpgvalue") != null) && (localStorage.getItem("lastprogpgvalue") != "")) {
                //点击确定打开文件内容
                $scope.clickUserFileData = {
                    "name": localStorage.getItem("lastprogname"),
                    "pgvalue": $scope.userData[localStorage.getItem("lastprogname")].pgvalue,
                    "level": $scope.userData[localStorage.getItem("weldtempname")].level
                }
                $scope.fileSelected = $scope.clickUserFileData.name;
    
                g_fileNameForUpload = $scope.clickUserFileData.name;
                g_fileDataForUpload = processFileData($scope.clickUserFileData.pgvalue);
    
                $scope.editMode_FileName = $scope.clickUserFileData.name;
                $scope.editMode_CommandsText = $scope.clickUserFileData.pgvalue;
                $scope.editMode_CommandsLevel = $scope.clickUserFileData.level;
                if ($scope.clickUserFileData.pgvalue) {
                    $scope.editMode_CommandsArr = createCommandsArray($scope.clickUserFileData.pgvalue);
                } else {
                    $scope.editMode_CommandsArr = [];
                }
                $scope.indexSelected = null;
                setLocalStorage();
    
                $scope.clickUserFileData = null;
                localStorage.setItem("lastprogname", "");
                localStorage.setItem("lastprogpgvalue", "");
            } else if ((localStorage.getItem("fileselected") != null) && (localStorage.getItem("fileselected") != "")) {
                if ($scope.userData.hasOwnProperty(localStorage.getItem("fileselected"))) {
                    $scope.fileSelected = localStorage.getItem("fileselected");
                    $scope.editMode_FileName = localStorage.getItem("filename");
                    // $scope.editMode_CommandsText = localStorage.getItem("filecontent");
                    $scope.editMode_CommandsText = $scope.userData[$scope.editMode_FileName].pgvalue;
                    $scope.editMode_CommandsLevel = $scope.userData[$scope.editMode_FileName].level;
                    if ($scope.editMode_CommandsText) {
                        $scope.editMode_CommandsArr = createCommandsArray($scope.editMode_CommandsText);
                    } else {
                        $scope.editMode_CommandsArr = [];
                    }
                    g_fileNameForUpload = localStorage.getItem("fileNameforUpload");
                    g_fileDataForUpload = processFileData($scope.editMode_CommandsText);
                    // g_fileDataForUpload = localStorage.getItem("fileDataforUpload");
                } else {
                    removeLocalStorage();
                }
            }
            //初始化时记录工作区内容
            recordMonitorData();
            $scope.getCurrentLuaDofileData($scope.editMode_CommandsArr);
            g_graphicalErr = false; //清除图形化编程NewDofile报错影响示教程序的运行
            g_nodeLuaError = false; //清除节点图编程NewDofile报错影响示教程序的运行
        }
        
    }

    
    /**
     * 跳转到选择的指令分类处
     * @param {object} value 选中的对象 
     */
    $scope.showCommandId = -1; //选择后展示指令ID表示
    $scope.navigateProgramPosition = function(value) {
        if (value) {
            $scope.showCommandId = value.id;
        }
    }

    function getTempFiles() {
        let getCmd = {
            cmd: "get_template_data",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.tempData = data;
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[1]);
            });
    };

    function getUserFiles() {
        let getCmd = {
            cmd: "get_user_data",
            data: {
                type: '1'
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.userData = data;
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[0]);
            });
    };

    //配置后，同步获取文件
    document.getElementById('programTeach').addEventListener('modbusFile', e => {
        getUserFiles();
    });

    function getOptionsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                let pointNameArr = Object.keys(data);
                pointNameArr.forEach(function (item, i) {
                    if (data[pointNameArr[i]].toolnum < $scope.proToolCoordeTotal) {
                        data[pointNameArr[i]].toolnum = $scope.pro_ToolCoordeData[data[pointNameArr[i]].toolnum].name;
                    } else {
                        data[pointNameArr[i]].toolnum = data[pointNameArr[i]].toolnum - $scope.proToolCoordeTotal;
                        data[pointNameArr[i]].toolnum = ptDynamicTags.info_messages[0] + data[pointNameArr[i]].toolnum;
                    };
                });
                $scope.pointsData = data;
                for (const key in $scope.pointsData) {
                    $scope.pointsData[key]['type'] = globalPoint;
                }
                $scope.tempPointsData = JSON.parse(JSON.stringify($scope.pointsData));
                if ($scope.editMode_FileName) {
                    const getParams = {
                        cmd: 'get_local_points',
                        data: {
                            local: $scope.editMode_FileName
                        }
                    }
                    dataFactory.getData(getParams).then((data) => {
                        $scope.templocalPointData = data;
                        for (const key in $scope.templocalPointData) {
                            $scope.templocalPointData[key]['type'] = localPoint;
                        }
                        for (const itemKey in $scope.pointsData) {
                            for (const elementKey in $scope.templocalPointData) {
                                if (itemKey == elementKey) {
                                    delete($scope.pointsData[itemKey])
                                }
                            }
                        }
                        $scope.pointsData = Object.assign($scope.templocalPointData, $scope.pointsData);
                    }, (status) => {
                        toastFactory.error(status, ptDynamicTags.error_messages[33]);
                    });
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[2]);
                /* test */
                if (g_testCode) {
                    $scope.pointsData = testLimitPointData;
                }
                /** ./test */
            });
    };

    //获取速度、CO0~CO7配置和扩展I/O配置
    function getRobotdata() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                // 速度
                $scope.manualSpeed = ~~(data.speedscale_manual * 100);
                $scope.autoSpeed = ~~(data.speedscale_auto * 100);
                //CO0~CO7配置
                $scope.ctrlDO8 = ~~data.ctl_do8_config + "";
                $scope.ctrlDO9 = ~~data.ctl_do9_config + "";
                $scope.ctrlDO10 = ~~data.ctl_do10_config + "";
                $scope.ctrlDO11 = ~~data.ctl_do11_config + "";
                $scope.ctrlDO12 = ~~data.ctl_do12_config + "";
                $scope.ctrlDO13 = ~~data.ctl_do13_config + "";
                $scope.ctrlDO14 = ~~data.ctl_do14_config + "";
                $scope.ctrlDO15 = ~~data.ctl_do15_config + "";
                $scope.ctrlDOArr = [$scope.ctrlDO8, $scope.ctrlDO9, $scope.ctrlDO10, $scope.ctrlDO11, $scope.ctrlDO12, $scope.ctrlDO13, $scope.ctrlDO14, $scope.ctrlDO15];
                //焊机起弧配置的扩展DO编号
                $scope.extArcstart = ~~data.ext_num_arcstart;
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[3]);
            });
    }

    //坐标系数据保留三位小数
    function pro_Screen_Sensor(data){ 
        for(let i=0; i<data.length; i++){
            if(data[i].type == 0){
                data.splice(i,1);
                i=i-1;
            }else{
                let valuearr = Object.keys(data[i]);
                var valuelength = valuearr.length;
                for(let j=2; j<valuelength-2; j++){
                    data[i][valuearr[j]] = parseFloat(data[i][valuearr[j]]).toFixed(3);
                }
            }
        }
    }

    //获取工具坐标系数据
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.pro_ToolCoordeData = JSON.parse(JSON.stringify(data));
                $scope.proToolCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                $scope.pro_SensorCoordeData = JSON.parse(JSON.stringify(data)).filter(item => item.type == 1);
                getExToolCoordData();
                pro_Screen_Sensor(data);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[4]);
                /* test */
                if (g_testCode) {
                    $scope.pro_ToolCoordeData = testToolCoordeData;
                    $scope.proToolCoordeTotal = JSON.parse(JSON.stringify(testToolCoordeData)).length;
                    pro_Screen_Sensor(testToolCoordeData);
                    $scope.pro_SensorCoordeData = JSON.parse(JSON.stringify(testToolCoordeData)).filter(item => item.type == 1);
                    getExToolCoordData();
                }
                /* ./test */
            });
    };

    /** 获取外部工具坐标系数据*/
    function getExToolCoordData() {
        const exToolCoordeArr = [];
        let getCmd = {
            cmd: "get_ex_tool_cdsystem",
        };
        dataFactory.getData(getCmd).then((data) => {
            const exToolCoordeData = JSON.parse(JSON.stringify(data));
            const exToolCoordeKeys = Object.keys(exToolCoordeData);
            exToolCoordeKeys.forEach(item => {
                exToolCoordeData[item].id = exToolCoordeData[item].id + $scope.proToolCoordeTotal;
                exToolCoordeArr.push(exToolCoordeData[item]);
            });
            $scope.pro_ToolCoordeData = $scope.pro_ToolCoordeData.concat(exToolCoordeArr);
            getOptionsData();
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[44]);
            /* test */
            if (g_testCode) {
                const exToolCoordeData = testExToolCoordeData;
                const exToolCoordeKeys = Object.keys(exToolCoordeData);
                exToolCoordeKeys.forEach(item => {
                    exToolCoordeData[item].id = exToolCoordeData[item].id + $scope.proToolCoordeTotal;
                    exToolCoordeArr.push(exToolCoordeData[item]);
                });
                $scope.pro_ToolCoordeData = $scope.pro_ToolCoordeData.concat(exToolCoordeArr);
                getOptionsData();
            }
            /* ./test */
        });
    };

    //配置后，同步配置信息
    document.getElementById('programTeach').addEventListener('206', e => {
        getRobotdata();
    });


    //修改或新建点数据后更新点数据
    document.getElementById('programTeach').addEventListener('savepoints', e => {
        getOptionsData();
    })

    /** 设置示教程序相关本地存储项，用于恢复上一次选择的示教程序，无需重新选择打开 */
    function setLocalStorage() {
        localStorage.setItem('fileNameforUpload', g_fileNameForUpload);
        localStorage.setItem('fileDataforUpload', g_fileDataForUpload);
        localStorage.setItem('fileselected', $scope.fileSelected);
        localStorage.setItem('filename', $scope.editMode_FileName);
        localStorage.setItem('filecontent', $scope.editMode_CommandsText);
    }
    /** 清除设置示教程序相关本地存储项 */
    function removeLocalStorage() {
        localStorage.removeItem('fileNameforUpload');
        localStorage.removeItem('fileDataforUpload');
        localStorage.removeItem('fileselected');
        localStorage.removeItem('filename');
        localStorage.removeItem('filecontent');
    }
    /* ./数据初始化 */

    // 文件名匹配搜索
    $scope.screen = function () {
        $scope.openUserFileName = document.getElementById("userFileFind").value;
        let userDataName = Object.keys($scope.userData);
        $scope.userDataArr = [];
        for (let i = 0; i < userDataName.length; i++) {
            if (userDataName[i].indexOf($scope.openUserFileName) >= 0) {
                $scope.userDataArr.push(userDataName[i]);
            }
        }
    }

    /* 打开文件模块 */
    // 注册新增按钮的点击事件，打开文件模态窗
    $("#btnOpenFile").click(function () {
        if (($scope.userData == null) || ($scope.userData == "")) {
            getUserFiles();
        }
        deleteUserFileArr = [];//清空已选文件数组
        removeSelect();
        $scope.openUserFileName = "";
        $scope.userDataArr = Object.keys($scope.userData);
        if($scope.currentFileEdit_flag == 1){
            $scope.FileEditTips = ptDynamicTags.info_messages[2];
        }
    });

    /**
     * 示教程序内容发生改变时触发
     * @param {int} item  0-操作标志/不保存 1-保存
     * @param {int} index  1-打开 2-新建 3-导出 4-另存为 5-重命名
     * @returns 
     */
    let recordData;
    $scope.changeFileData = function(item ,index) {
        if (index) {
            recordData = index;
            if ($scope.editMode_FileName && $scope.editMode_CommandsArr && monitorTeachData) {
                if ($scope.editMode_CommandsArr.length === monitorTeachData.length && $scope.editMode_CommandsArr.every((item, index) => item === monitorTeachData[index])) {
                } else {
                    if ($scope.editMode_CommandsArr != "") {
                        // 新建文件程序若为空则不校验
                        $('#programUnsavedModal').modal();
                        return;
                    }; 
                }
                switchFileType(index);
            } else {
                switchFileType(index); //无内容时相关文件操作
            }
        } else if (item == 1) {
            $('#programUnsavedModal').modal('hide');
            if (!navigateUrl) {
                switchFileType(recordData);
            }
            $scope.saveCommands();
        } else if (item == 0) {
            $('#programUnsavedModal').modal('hide');
            if (navigateUrl) {
                location = navigateUrl;
            } else {
                switchFileType(recordData);
            }
            $scope.editMode_CommandsArr = monitorTeachData; //不保存时程序恢复之前的程序
            $scope.editMode_CommandsText = commandsArray2String($scope.editMode_CommandsArr);
            updateEditorFile();
            recordMonitorData();//重新记录
        }
    }

    //当切换页面时，关闭页面默认不保存后跳转
    $scope.closeTeachProgramModal = function() {
        if (navigateUrl) {
            $scope.changeFileData(0);
        }
    }

    /**相关文件操作类型 */
    function switchFileType(index) {
        switch(index) { 
            case 1:
                $('#openFileModal').modal();
                $scope.openFile(); 
                break;
            case 2:
                $('#newFileModal').modal();
                $scope.clickbtnNewFile(); 
                break;
            case 3:
                $scope.exportFile(); 
                break;
            case 4:
                if ($scope.editMode_CommandsLevel != 1) {
                    $('#saveAsModal').modal();
                    $scope.clickBtnSaveAs(); 
                }
                break;
            case 5:
                $scope.ejectRename(); 
                break;
            default:
                break;
        }
    }

    // 打开文件功能的模态窗口点击时触发
    $scope.openFile = function () {
        $scope.deleteFileFlag = 0;
    }

    /* 新建文件模块 */
    // 注册新增按钮的点击事件，打开新建模态窗
    $("#btnNewFile").click(function () {
        if (($scope.tempData == null) || ($scope.tempData == "")) {
            getTempFiles();
        }
        removeSelect();
        $("#txt_departmentname").text("test");
    });

    // 新建文件功能的模态窗口点击时触发
    $scope.clickbtnNewFile = function () {
        $scope.newFileName = "";
    }

    // 保存新建的文件时同名校验
    $scope.checkNewLuaSameName = function() {
        $scope.newFileName = document.getElementById("tnewfilename").value;
        let newFileName = $scope.newFileName + ".lua";
        if ($scope.newFileName === "" || $scope.newFileName === undefined) {
            toastFactory.info(ptDynamicTags.info_messages[3]);
        } else if (null == $scope.clickTempFileData) {
            toastFactory.info(ptDynamicTags.info_messages[5]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else {
            let checkCmd = {
                cmd: "check_lua_file",
                data: {
                    name: newFileName,
                    type: '1'
                },
            };
            dataFactory.getData(checkCmd).then((data) => {
                switch (data.same_name) {
                    case '0':
                        saveNewFile();
                        break;
                    case '1':
                        toastFactory.info(ptDynamicTags.info_messages[4]);
                        break;
                    case '2':
                        toastFactory.warning(ptDynamicTags.warning_messages[14] + ptDynamicTags.warning_messages[16]);
                        break;
                    case '3':
                        toastFactory.warning(ptDynamicTags.warning_messages[15] + ptDynamicTags.warning_messages[16]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[42]);
            });
        }
        
    }

    // 保存新建的文件时操作(新建文件默认为不加密：level为0)
    function saveNewFile() {
        monitorTeachData = []; // 新建后清空上次记录的monitorTeachData
        // 发送新建的文件到后台
        $scope.newFileName = document.getElementById("tnewfilename").value;
        let newFileName = $scope.newFileName + ".lua";
        $scope.currentFileEdit_flag = 0;//新建文件编辑状态置0
        $scope.program_value = $scope.clickTempFileData.pgvalue;
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: newFileName,
                pgvalue: $scope.program_value,
                level: '0',
                type: "1"
            },
        };
        // update $scope.userData  新建文件之后更新文件
        dataFactory.actData(saveCmd).then(() => {
            // 新建文件时，关闭程序编程的编辑和子程序展示界面
            if ($scope.programAreaRightType == 'edit' || $scope.programAreaRightType == 'dofile' ) {
                $scope.dofileList = [];
                $scope.selectDofileName = '';
                $scope.selectDofileChildName = '';
                $scope.single_arrlist = [];
                $scope.selectDofileList = [];
                $scope.chooseProgramView('robot');
            }
            let getCmd = {
                cmd: "get_user_data",
                data: {
                    type: '1'
                }
            };
            dataFactory.getData(getCmd)
                .then(function (data) {
                    $scope.userData = data;
                    toastFactory.success(ptDynamicTags.success_messages[0] + newFileName);
                    $("#newFileModal").modal('hide');
                    $scope.newFileName = "";

                    $scope.fileSelected = newFileName;
                    g_fileNameForUpload = newFileName;
                    g_fileDataForUpload = $scope.program_value;

                    $scope.editMode_FileName = newFileName;
                    $scope.editMode_CommandsText = $scope.program_value;
                    $scope.editMode_CommandsLevel = $scope.userData[$scope.editMode_FileName].level;
                    $scope.indexSelected = null;
                    if ($scope.program_value) {
                        $scope.editMode_CommandsArr = createCommandsArray($scope.program_value);
                    } else {
                        $scope.editMode_CommandsArr = [];
                    }

                    setLocalStorage();

                    updateEditorFile();
                    $("#newFileModal").modal('hide');
                    $scope.pointsData = $scope.tempPointsData;
                    $scope.templocalPointData = {};
                    $scope.localPointData = {};
                    $scope.programBackupData = [];
                    $scope.selectProgramBackupName = '';
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[5]);
                });
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[6]);
        });
    };
    /* 新建文件模块 */


    /* 导入文件模块 */
    // 点击导入按钮打开导入文件功能的模态窗
    $("#btnImportFile").click(function () {
        var samenametip = document.getElementById("samenametip");
        samenametip.style.display = "none";
        var sameencnametip = document.getElementById("sameencnametip");
        sameencnametip.style.display = "none";
        // 清空文件内容
        var importFileHtml = document.getElementById("fileImported");
        importFileHtml.value = '';
        // 打开模态窗
        $('#importFileModal').modal();
    });

    // 提交导入的文件到系统后台；
    $scope.submitFile = function () {
        if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else {
            var i=0;
            var j=0;
            var ss =document.getElementById("fileImported").files; //获取当前选择的文件对象
            for(var m=0;m<ss.length;m++){  //判断文件名
                efileName = ss[m].name ;
                if (efileName.indexOf(".tar.gz") != -1) {
                    if (efileName.indexOf("program_") == -1) {
                        toastFactory.warning(ptDynamicTags.warning_messages[3]);
                        return;
                    }
                } else if (efileName.indexOf(".lua") == -1) {
                    toastFactory.warning(ptDynamicTags.warning_messages[2]);
                    return;
                }
            }
            sendAjax();
            function sendAjax() {
                if(j>=ss.length)   //采用递归的方式循环发送请求
                {
                    $("#fileImported").val("");
                    j=0;
                    let getCmd = {
                        cmd: "get_user_data",
                        data: {
                            type: '1'
                        }
                    };
                    dataFactory.getData(getCmd)
                        .then((data) => {
                            $scope.userData = data;
                            $("#importFileModal").modal('hide');
                        }, (status) => {
                            toastFactory.error(status, ptDynamicTags.error_messages[5]);
                        });
                    return;
                }
                var formData = new FormData();
                formData.append('files', ss[j]);  //将该file对象添加到formData对象中
                if (ss[j].name in $scope.userData) {
                    var mychar = $scope.userData[ss[j].name].level != '0' ? document.getElementById("sameencnametip") : document.getElementById("samenametip");
                    mychar.style.display = "";
                } else{
                    dataFactory.uploadData(formData)
                    .then((data) => {
                        if (typeof(data) != "object") {
                            toastFactory.success(ptDynamicTags.success_messages[1] + ss[j].name);
                            j++; //递归条件
                            sendAjax();
                            getProgramAreaRightData($scope.programAreaRightType);
                        }
                    }, (status) => {
                        toastFactory.error(status, ptDynamicTags.error_messages[7] + ss[j].name);
                    });
                }
            }
        }
    };

    // 导入同名文件到系统后台；
    $scope.conSubmitFile = function () {
        var same_name_file_flag = 0;
        var i=0;
        var j=0;
        var ss =document.getElementById("fileImported").files; //获取当前选择的文件对象
        for(var m=0;m<ss.length;m++){  //判断文件名
            efileName = ss[m].name ;
            if (efileName.indexOf(".tar.gz") != -1) {
                if (efileName.indexOf("program_") == -1) {
                    toastFactory.warning(ptDynamicTags.warning_messages[3]);
                    return;
                }
            } else if (efileName.indexOf(".lua") == -1) {
                toastFactory.warning(ptDynamicTags.warning_messages[2]);
                return;
            }
        }
        sendAjax();
        function sendAjax() {
            if(j>=ss.length)   //采用递归的方式循环发送请求
            {
                $("#fileImported").val("");
                j=0;
                let getCmd = {
                    cmd: "get_user_data",
                    data: {
                        type: '1'
                    }
                };
                dataFactory.getData(getCmd)
                    .then((data) => {
                        $scope.userData = data;
                        if(same_name_file_flag == 1){
                            /*同名文件覆盖更新当前文件内容*/
                            g_fileDataForUpload = $scope.userData[$scope.fileSelected].pgvalue;
                            $scope.editMode_CommandsText = $scope.userData[$scope.fileSelected].pgvalue;
                            $scope.editMode_CommandsLevel = $scope.userData[$scope.fileSelected].level;
                            $scope.indexSelected = null;
                            $scope.editMode_CommandsArr = createCommandsArray($scope.userData[$scope.fileSelected].pgvalue);
                            setLocalStorage();
                            updateEditorFile();
                        }
                        $("#importFileModal").modal('hide');
                    }, (status) => {
                        toastFactory.error(status, ptDynamicTags.error_messages[5]);
                    });
                return;
            }
            var formData = new FormData();
            formData.append('files', ss[j]);  //将该file对象添加到formData对象中
            dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    toastFactory.success(ptDynamicTags.success_messages[1] + ss[j].name);
                    let tarFileName;
                    if (efileName.indexOf("program_") != -1 && efileName.indexOf(".tar.gz") != -1) {
                        // 如果是program_xxx.tar.gz类型文件，则重新组合文件名进行判断
                        tarFileName = (ss[j].name).split(".")[0].split("_")[1] + ".lua";
                    } else {
                        tarFileName = ss[j].name;
                    }
                    if (tarFileName == $scope.fileSelected) {
                        same_name_file_flag = 1;
                    }
                    j++; //递归条件
                    sendAjax();
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[7] + ss[j].name);
            });
        }
    };

    //点击导入清除同名警告提示
    document.getElementById("fileImported").onclick = function () {
        var samenametip = document.getElementById("samenametip");
        samenametip.style.display = "none";
        var sameencnametip = document.getElementById("sameencnametip");
        sameencnametip.style.display = "none";
    }
    /* 导入文件模块 */


    /* 导出文件模块 */
    // 导出按键功能
    $scope.exportFile = function () {
        if ($scope.editMode_CommandsLevel == 1) {
            toastFactory.info(`${ptDynamicTags.error_messages[28]},${ptDynamicTags.encryption_messages[1]}`);
            return
        }
        if (!$scope.fileSelected) {
            $('#btnExportFile').tooltip('show');
            $('#btnExportFile').on('shown.bs.tooltip', function () {
                setTimeout(() => {
                    $('#btnExportFile').tooltip('hide');
                }, 500);
            });
        } else {
            var filenameindex = $scope.fileSelected.indexOf(".lua");
            if (filenameindex == -1) {
                toastFactory.warning(ptDynamicTags.warning_messages[3]);
                return;
            }
            window.location.href = "/action/download?pathfilename=/tmp/program_" + $scope.fileSelected.split('.')[0] + ".tar.gz";
        };
    };
    /* 导出文件模块 */


    /* 删除文件模块 */
    //点击删除删除选中用户文件
    $scope.deleteFileFlag = 0;
    $scope.deleteUserFile = function () {
        const deleteEncryptFileName = []
        deleteUserFileArr.forEach(item => {
            if ($scope.userData[item].level == 1 || $scope.userData[item].level == 2) {
                deleteEncryptFileName.push(item)
            }
        })
        if (deleteEncryptFileName.length) {
            toastFactory.warning(`${deleteEncryptFileName.join(',')},${ptDynamicTags.warning_messages[12]}`);
            return
        }
        if (0 == deleteUserFileArr.length) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else {
            if ($scope.deleteFileFlag == 0) {
                toastFactory.info(ptDynamicTags.info_messages[7]);
                $scope.deleteFileFlag = 1;
                return;
            }
            $scope.deleteFileFlag = 0;
            let deleteCmd = {
                cmd: "remove_lua_file",
                data: {
                    name: deleteUserFileArr,
                    type: "1"
                },
            };
            dataFactory.actData(deleteCmd)
                .then(() => {
                    let getCmd = {
                        cmd: "get_user_data",
                        data: {
                            type: '1'
                        }
                    }
                    dataFactory.getData(getCmd)
                        .then((data) => {
                            var deleteNameTip = "";
                            var deleteCurrentFile_flag = 0;
                            for(var i=0;i<deleteUserFileArr.length;i++){
                                deleteNameTip = deleteUserFileArr[i]+","+deleteNameTip;
                                if (deleteUserFileArr[i] == $scope.editMode_FileName) {
                                    deleteCurrentFile_flag = 1;
                                }
                            }
                            toastFactory.success(ptDynamicTags.success_messages[2] + deleteNameTip);
                            $scope.userData = data;
                            if (deleteCurrentFile_flag == 1) {
                                $scope.editMode_FileName = "";
                                $scope.editMode_CommandsArr = "";
                                $scope.fileSelected = "";
                                $scope.commandSelected = "";
                                g_fileNameForUpload = "";
                                g_fileDataForUpload = "";
                                $scope.clickUserFileData = "";
                                $scope.editMode_CommandsText = "";
                                $scope.editMode_CommandsLevel = "";
                                removeLocalStorage();
                                updateEditorFile();
                                if (viewFlag == 1) {
                                    $scope.chooseProgramView('robot');
                                }
                            } else {
                                setLocalStorage();
                            }
                            $("#openFileModal").modal('hide');
                        }, (status) => {
                            toastFactory.error(status, ptDynamicTags.error_messages[5]);
                        });
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[8]);
                });
        }
    }

    //点击删除模板文件
    $scope.deleteTempFile = function () {
        if (null == $scope.clickTempFileData) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else if ("empty.lua" == $scope.clickTempFileData.name) {
            toastFactory.warning(ptDynamicTags.warning_messages[4]);
        } else {
            let deleteCmd = {
                cmd: "remove_template_file",
                data: {
                    name: $scope.clickTempFileData.name,
                },
            };
            dataFactory.actData(deleteCmd)
                .then(() => {
                    $scope.clickTempFileData = null;
                    getTempFiles();
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[8]);
                });
        }
    }

    /* 删除文件模块 */


    /* 点击文件并打开功能模块 */
    // 点击模板程序文件夹中的文件操作
    $scope.clickTempFile = function (fileIndex, fileItem) {

        $scope.commandSelected = null;

        // 清除所有文件的选中状态
        $(".file-config1").each(function () {
            if ($(this).hasClass("file-selected")) {
                $(this).removeClass("file-selected");
            };
        });

        $(".file-config2").each(function () {
            if ($(this).hasClass("file-selected")) {
                $(this).removeClass("file-selected");
            };
        });

        // 对点击的文件添加选中状态
        $(".f" + fileIndex).filter(".file-config1").addClass("file-selected");

        $scope.clickTempFileData = fileItem;

    };

    var deleteUserFileArr = [];
    // 点击用户文件夹中的文件操作
    $scope.clickUserFile = function (fileIndex, fileItem) {
        $scope.commandSelected = null;

        if ($(".f" + fileIndex).hasClass("file-selected")) {
            $(".f" + fileIndex).removeClass("file-selected");
            var index = deleteUserFileArr.indexOf(fileItem);
            if(index > -1){
                deleteUserFileArr.splice(index,1);
            }
        }else{
            $(".f" + fileIndex).addClass("file-selected");
            deleteUserFileArr.push(fileItem);
        };
        $scope.clickUserFileData = $scope.userData[fileItem];
    };

    //去除选中样式和选中内容
    function removeSelect() {
        $(".file-config1").each(function () {
            if ($(this).hasClass("file-selected")) {
                $(this).removeClass("file-selected");
            };
        });

        $(".file-config2").each(function () {
            if ($(this).hasClass("file-selected")) {
                $(this).removeClass("file-selected");
            };
        });

        $(".line-config").removeClass("running");
        $(".line-config").removeClass("shear");
        $(".line-config").removeClass("selected");

        $scope.clickUserFileData = null;
        $scope.clickTempFileData = null;
    }

    //点击确定打开文件内容
    $scope.openUserFile = function () {
        $scope.deleteFileFlag = 0;
        if(deleteUserFileArr.length == 0){
            toastFactory.info(ptDynamicTags.info_messages[1]);
            return;
        }else if(deleteUserFileArr.length > 1){
            toastFactory.warning(ptDynamicTags.warning_messages[5]);
            return;
        }else{
            $scope.clickUserFileData = $scope.userData[deleteUserFileArr[0]];
        }
        if (null == $scope.clickUserFileData) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
            } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
                toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.currentFileEdit_flag = 0;//打开新文件编辑状态置0
            $scope.fileSelected = $scope.clickUserFileData.name;

            g_fileNameForUpload = $scope.clickUserFileData.name;
            g_fileDataForUpload = processFileData($scope.clickUserFileData.pgvalue);

            $scope.editMode_FileName = $scope.clickUserFileData.name;
            $scope.editMode_CommandsText = $scope.clickUserFileData.pgvalue;
            $scope.editMode_CommandsLevel = $scope.clickUserFileData.level;
            if ($scope.clickUserFileData.pgvalue) {
                $scope.editMode_CommandsArr = createCommandsArray($scope.clickUserFileData.pgvalue);
            } else {
                $scope.editMode_CommandsArr = [];
            }
            recordMonitorData();//打开文件时记录
            $scope.indexSelected = null;

            updateEditorFile();

            setLocalStorage();
            $("#openFileModal").modal('hide');
            $scope.clickUserFileData = null;
            getOptionsData();
            getProgramAreaRightData($scope.programAreaRightType);
            $scope.getCurrentLuaDofileData($scope.editMode_CommandsArr);
        }
    }
    /* 点击文件并打开功能模块 */

    /**
     * 获取当前程序子程序的数据
     * @param {array} luaArray 当前程序的数据
     */
    $scope.getCurrentLuaDofileData = function(luaArray) {
        let dofileData = [];
        let secondDofileData = [''];
        luaArray.forEach(item => {
            const dofileResult = handleDofileCommand(item);
            if (dofileResult != -1 && dofileResult != -2) {
                secondDofileData = [''];
                const secondDofile = createCommandsArray($scope.userData[dofileResult[0]].pgvalue);
                secondDofile.forEach(element => {
                    const secondDofileResult = handleDofileCommand(element);
                    if (secondDofileResult != -1 && secondDofileResult != -2) {
                        if (secondDofileData.length > 1) {
                            if (secondDofileData.every(secondDofileItem => secondDofileItem.name != secondDofileResult[0])) {
                                secondDofileData.push(secondDofileResult[0])
                            }
                        } else {
                            secondDofileData.push(secondDofileResult[0])
                        }
                    }
                });
                if (dofileData.length) {
                    if (dofileData.every(dofileItem => dofileItem.name != dofileResult[0])) {
                        dofileData.push({
                            name: dofileResult[0],
                            children: secondDofileData
                        }) 
                    }
                } else {
                    dofileData.push({
                        name: dofileResult[0],
                        children: secondDofileData
                    })
                }
            }
        })
        $scope.dofileList = dofileData;
        $scope.selectDofileName = '';
        $scope.selectDofileChildName = '';
        $scope.single_arrlist = [];
        if ($scope.dofileList.length == 0) {
            $scope.selectDofileList = [];
            $scope.chooseProgramView('robot');
        }
    }

    /**
     * 选择子程序展示对应内容
     * @param {string} type first--第一层调用；second--第二层调用
     * @param {Object} firstName 第一层调用的数据对象
     * @param {string} secondName 第二层调用程序名
     */
    $scope.selectDofile = function(type, firstName, secondName) {
        switch (type) {
            case 'first':
                $scope.selectDofileChildName = '';
                $scope.single_arrlist = createCommandsArray($scope.userData[firstName.name].pgvalue);
                $scope.selectDofileList = firstName.children;
                break;
            case 'second':
                if (secondName) {
                    $scope.single_arrlist = createCommandsArray($scope.userData[secondName].pgvalue);
                } else {
                    $scope.single_arrlist = createCommandsArray($scope.userData[firstName.name].pgvalue);
                }
                break;
            default:
                break;
        }
    }

    // 运行示教程序前程序发生改动,自动触发保存按钮
    document.getElementById('programTeach').addEventListener('save-teach-program', () => {
        if (g_programChangeFlag == 1) {
            navigateUrl = undefined;
            $scope.saveCommands();
        }
    })

    /* 保存文件模块 */
    // 保存控件操作，将已修改的命令行提交后台保存
    $scope.saveCommands = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[6]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if (!$scope.fileSelected) {
            $('#btnSaveCommands').tooltip('show');
            $('#btnSaveCommands').on('shown.bs.tooltip', function () {
                setTimeout(() => {
                    $('#btnSaveCommands').tooltip('hide');
                }, 500);
            });
        } else {
            let newCommandsData = commandsArray2String($scope.editMode_CommandsArr);
            let saveCmd = {
                cmd: "save_lua_file",
                data: {
                    name: $scope.fileSelected,
                    pgvalue: newCommandsData,
                    type: "1"
                },
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    // 保存时再次记录工作区内容
                    recordMonitorData();
                    setLocalStorage();
                    toastFactory.success(ptDynamicTags.success_messages[0] + $scope.fileSelected);
                    let getCmd = {
                        cmd: "get_user_data",
                        data: {
                            type: '1'
                        }
                    };
                    dataFactory.getData(getCmd)
                        .then((data) => {
                            if (navigateUrl) {
                                location = navigateUrl;
                            }
                            $scope.userData = data;
                            $scope.currentFileEdit_flag = 0;
                            getProgramAreaRightData($scope.programAreaRightType);
                            $scope.getCurrentLuaDofileData($scope.editMode_CommandsArr);
                        }, (status) => {
                            toastFactory.error(status, ptDynamicTags.error_messages[5]);
                        });
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[6]);
                });
        };
    };

    // 操作文件时默认保存文件
    $scope.currentFileEdit_flag = 0;//文件是否编辑标志
    $scope.saveModifyCommands = function () {
        if (!$scope.fileSelected) {

        } else {
            $scope.currentFileEdit_flag = 1;
            $(".line-config").removeClass("running");//编辑文件清除程序高亮状态
            let newCommandsData = commandsArray2String($scope.editMode_CommandsArr);
            let saveCmd = {
                cmd: "save_lua_file",
                data: {
                    name: $scope.fileSelected,
                    pgvalue: newCommandsData,
                    type: '1'
                },
            };
            dataFactory.actData(saveCmd)
                .then(() => {
                    setLocalStorage();
                    let getCmd = {
                        cmd: "get_user_data",
                        data: {
                            type: '1'
                        }
                    };
                    dataFactory.getData(getCmd)
                        .then((data) => {
                            $scope.userData = data;
                            getProgramAreaRightData($scope.programAreaRightType);
                        }, (status) => {
                            toastFactory.error(status);
                        });
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[6]);
                });
        };
    };
    /* 保存文件模块 */


    /* 另存文件模块 */
    // 注册另存按钮的点击事件，打开另存模态窗
    $("#btnSaveAs").click(function () {
        if ($scope.editMode_CommandsLevel == 1) {
            toastFactory.info(`${ptDynamicTags.error_messages[9]},${ptDynamicTags.encryption_messages[1]}`);
            return
        }
        if (!$scope.fileSelected) {
            $('#btnSaveAs').tooltip('show');
            $('#btnSaveAs').on('shown.bs.tooltip', function () {
                setTimeout(() => {
                    $('#btnSaveAs').tooltip('hide');
                }, 500);
            });
        } else {
            $scope.show_tempduplicate = false;
            $scope.show_userduplicate = false;
        };
    });

    // 另存文件功能的模态窗口点击时触发
    $scope.clickBtnSaveAs = function () {
        $scope.saveAsName = "";
        $scope.show_tempduplicate = false;
        $scope.show_userduplicate = false;
    };

    // 另存为用户文件时同名校验
    $scope.checkAsLuaSameName = function() {
        $scope.saveAsName = document.getElementById("tsaveAsName").value;
        saveAsName = $scope.saveAsName + ".lua";
        if ($scope.saveAsName === "" || $scope.saveAsName == null) {
            toastFactory.info(ptDynamicTags.info_messages[3]);
        } else {
            let checkCmd = {
                cmd: "check_lua_file",
                data: {
                    name: saveAsName,
                    type: '1'
                },
            };
            dataFactory.getData(checkCmd).then((data) => {
                switch (data.same_name) {
                    case '0':
                        $scope.conUserFile();
                        break;
                    case '1':
                        if ($scope.userData[saveAsName].level == 1 || $scope.userData[saveAsName].level == 2) {
                            toastFactory.warning(ptDynamicTags.warning_messages[13]);
                        } else {
                            $scope.show_tempduplicate = false;
                            $scope.show_userduplicate = true;
                        }
                        break;
                    case '2':
                        toastFactory.warning(ptDynamicTags.warning_messages[14] + ptDynamicTags.warning_messages[16]);
                        break;
                    case '3':
                        toastFactory.warning(ptDynamicTags.warning_messages[15] + ptDynamicTags.warning_messages[16]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[42]);
            });
        }
    }

    //另存为用户文件
    $scope.conUserFile = function () {
        $scope.show_userduplicate = false;
        $scope.program_value = commandsArray2String($scope.editMode_CommandsArr);
        $scope.saveAsName = document.getElementById("tsaveAsName").value;
        saveAsName = $scope.saveAsName + ".lua";
        let saveCmd = {
            cmd: "restore_lua_file",
            data: {
                newname: saveAsName,
                oldname: $scope.fileSelected,
                type: '1'
            },
        };
        // update $scope.userData  新建文件之后更新文件
        dataFactory.actData(saveCmd)
            .then(() => {
                let getCmd = {
                    cmd: "get_user_data",
                    data: {
                        type: '1'
                    }
                };
                dataFactory.getData(getCmd)
                    .then((data) => {
                        $scope.show_userduplicate = false;
                        $scope.userData = data;
                        toastFactory.success(ptDynamicTags.success_messages[3]);
                        $("#saveAsModal").modal('hide');
                        $scope.newFileName = "";

                        //打开另存为的文件
                        $scope.fileSelected = saveAsName;

                        g_fileNameForUpload = saveAsName;
                        g_fileDataForUpload = processFileData($scope.program_value);

                        $scope.editMode_FileName = saveAsName;
                        $scope.editMode_CommandsText = $scope.program_value;
                        $scope.editMode_CommandsLevel = $scope.userData[$scope.editMode_FileName].level;
                        $scope.editMode_CommandsArr = $scope.editMode_CommandsArr;
                        $scope.indexSelected = null;

                        setLocalStorage();
                        getProgramAreaRightData($scope.programAreaRightType);
                    }, (status) => {
                        toastFactory.error(status, ptDynamicTags.error_messages[5]);
                    });
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[9]);
            });
    }

    //另存为模板文件文件名判断
    $scope.saveAsTempFile = function () {
        $scope.saveAsName = document.getElementById("tsaveAsName").value;
        saveAsName = $scope.saveAsName + ".lua";
        if ($scope.saveAsName === "" || $scope.saveAsName == null) {
            toastFactory.info(ptDynamicTags.info_messages[3]);
        } else if (saveAsName in $scope.tempData) {
            $scope.show_userduplicate = false;
            $scope.show_tempduplicate = true;
        } else {
            $scope.show_tempduplicate = false;
            $scope.conTempFile();
        }
    };

    //另存为模板文件
    $scope.conTempFile = function () {
        $scope.saveAsName = document.getElementById("tsaveAsName").value;
        saveAsName = $scope.saveAsName + ".lua";
        $scope.program_value = commandsArray2String($scope.editMode_CommandsArr);
        let saveCmd = {
            cmd: "save_template_file",
            data: {
                name: saveAsName,
                pgvalue: $scope.program_value,
            },
        };
        // update $scope.tempData  新建文件之后更新文件
        dataFactory.actData(saveCmd)
            .then(() => {
                toastFactory.success(ptDynamicTags.success_messages[4]);
                let getCmd = {
                    cmd: "get_template_data",
                };
                dataFactory.getData(getCmd)
                    .then((data) => {
                        $scope.show_tempduplicate = false;
                        $scope.tempData = data;
                        toastFactory.success(ptDynamicTags.success_messages[5] + saveAsName);
                        $("#saveAsModal").modal('hide');
                        $scope.newFileName = "";
                    }, (status) => {
                        toastFactory.error(status, ptDynamicTags.error_messages[10]);
                    });
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[9]);
            });
    }
    /* 另存文件模块 */


    /* 重命名文件名功能模块 */

    // 重命名文件功能函数
    $scope.ejectRename = function () {
    	//未打开文件无法改名
        if (!$scope.fileSelected) {
            toastFactory.info(ptDynamicTags.info_messages[13]);
            return;
        }
        $scope.inputFileName = $scope.fileSelected.split(".")[0];
        $('#renameFileModal').modal();
    }

    $scope.renameFile = function () {
        if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
            return;
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
            return;
        }
        $scope.inputFileName = document.getElementById("trenamefile").value;
        let newName = $scope.inputFileName + ".lua";
        let oldName = $scope.fileSelected;
        if ($scope.inputFileName === "" || $scope.inputFileName == null) {
            toastFactory.info(ptDynamicTags.info_messages[3]);
        } else if (newName in $scope.userData) {
            toastFactory.info(ptDynamicTags.info_messages[4]);
        } else {
            let checkCmd = {
                cmd: "check_lua_file",
                data: {
                    name: newName,
                    type: '1'
                },
            };
            dataFactory.getData(checkCmd).then((data) => {
                switch (data.same_name) {
                    case '0':
                        let renameCmd = {
                            cmd: "rename_lua_file",
                            data: {
                                newname: newName,
                                oldname: oldName,
                                type: "1"
                            },
                        };
                        $('#renameFileModal').modal('hide');
                        dataFactory.actData(renameCmd).then(() => {
                            toastFactory.success(ptDynamicTags.success_messages[6]);
                            let getCmd = {
                                cmd: "get_user_data",
                                data: {
                                    type: '1'
                                }
                            };
                            dataFactory.getData(getCmd).then((data) => {
                                $scope.userData = data;
                                simulateClickingFile(newName, $scope.userData);
                                setLocalStorage();
                            }, (status) => {
                                toastFactory.error(status, ptDynamicTags.error_messages[5]);
                            });
                        }, (status) => {
                            toastFactory.error(status, ptDynamicTags.error_messages[11]);
                        });
                        break;
                    case '1':
                        toastFactory.info(ptDynamicTags.info_messages[4]);
                        break;
                    case '2':
                        toastFactory.warning(ptDynamicTags.warning_messages[14] + ptDynamicTags.warning_messages[16]);
                        break;
                    case '3':
                        toastFactory.warning(ptDynamicTags.warning_messages[15] + ptDynamicTags.warning_messages[16]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[42]);
            });
        };
    };

    //同步文件内容
    function simulateClickingFile(filename, filedata) {

        $scope.fileSelected = filedata[filename].name;

        g_fileNameForUpload = filedata[filename].name;
        g_fileDataForUpload = processFileData(filedata[filename].pgvalue);

        $scope.editMode_FileName = filedata[filename].name;
        $scope.editMode_CommandsText = filedata[filename].pgvalue;
        $scope.editMode_CommandsLevel = filedata[filename].level;
        $scope.editMode_CommandsArr = createCommandsArray(filedata[filename].pgvalue);

    }
    /* 重命名文件名功能模块 */

    /* 局部示教点位的查看、编辑和删除 */

    /** 检查局部示教点是否存在 */
    $scope.checkLocalTeachingPoint = function() {
        if (!$scope.addLocalPointName) {
            toastFactory.info(ptDynamicTags.info_messages[91]);
            return;
        }
        const checkParams = {
            cmd: 'get_checklocalpoint',
            data: {
                local: $scope.editMode_FileName,
                name: $scope.addLocalPointName
            }
        }
        dataFactory.getData(checkParams).then((data) => {
            if (data.result == '1') {
                $scope.checkCoverPoint = 1;
                $scope.openLimitPointModal('cover');
            } else {
                $scope.checkCoverPoint = 0;
                $scope.addLocalTeachingPoint();
            }
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[30]);
        });
    }
    /** 新增局部示教点 */
    $scope.addLocalTeachingPoint = function() {
        //更新示教程序时弹出Loading
        $('#pageLoading').css("display", "block");
        const addParams = {
            cmd: 'save_local_point',
            data: {
                local: $scope.editMode_FileName,
                name: $scope.addLocalPointName,
                speed: '100',
                acc: $scope.acceleration,
                elbow_speed: '100',
                elbow_acc: $scope.acceleration,
                toolnum: $scope.currentCoord + "",
                workpiecenum: $scope.currentWobjCoord + "",
                update_programfile: $scope.checkCoverPoint
            }
        }
        dataFactory.actData(addParams).then(() => {
            // 执行保存示教点位后，将新增示教点位名称清空，将检查示教点位是否存在的提示语隐藏
            $scope.addLocalPointName = '';
            // 新增示教点时，当页面是半展开状态时就执行扩展全部显示的方法，方便用户查看新增成功后的数据
            if (viewFlag == 0) {
                $scope.chooseProgramView('point');
            } else {
                getLocalTeachingPointsData();
            }
            $scope.showCommandsTextExpand = false;
            $('#limitPointModal').modal('hide');
            // 新增成功后，程序指令界面的示教点也需要更新数据
            getOptionsData();
            toastFactory.success(ptDynamicTags.success_messages[19]);
            $('#pageLoading').css("display", "none");
        }, (status) => {
            $('#pageLoading').css("display", "none");
            toastFactory.error(status, ptDynamicTags.error_messages[31]);
        });
    }
    /** 获取程序文件的对应示教点位 */
    function getLocalTeachingPointsData() {
        $scope.localPointData = {};
        const getParams = {
            cmd: 'get_local_points',
            data: {
                local: $scope.editMode_FileName
            }
        }
        dataFactory.getData(getParams).then((data) => {
            $scope.localPointData = data;
            for (const key in $scope.localPointData) {
                $scope.localPointData[key]['check'] = false;
            }
            if (Object.keys($scope.localPointData).length == 0) {
                toastFactory.info(ptDynamicTags.info_messages[93]);
            }
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[33]);
        });
    }
    /**
     * 打开局部示教点模态框
     * @param {String} type 打开模态框的类型——add：新增；delete：删除；look：查看; cover: 覆盖；
     * @param {Object} pointItem 查看传入的表格当前行数据
     * @returns 
     */
    $scope.openLimitPointModal = function (type, pointItem) {
        if (!$scope.fileSelected) {
            toastFactory.info(ptDynamicTags.info_messages[13]);
            return;
        }
        if (type == 'delete') {
            const localPointKeys = Object.keys($scope.localPointData);
            if (localPointKeys.every(item => $scope.localPointData[item]['check'] == false)) {
                toastFactory.info(ptDynamicTags.info_messages[92]);
                return;
            }
        }
        $('#limitPointModal').modal();
        $scope.limitType = type;
        switch (type) {
            case 'look':
            case 'edit':
                $scope.limitOperateItem = pointItem;
                break;
            case 'add':
                $scope.addLocalPointName = '';
                break;
            default:
                break;
        }
    }
    /** 勾选示教点位表格的全选 */
    $scope.clickLocalPointAll = function() {
        for (const key in $scope.localPointData) {
            $scope.localPointData[key]['check'] = $scope.localpointCheckAll;
        }
    }
    /** 勾选示教点位 */
    $scope.clickLocalPointItem = function() {
        const localPointKeys = Object.keys($scope.localPointData);
        if (localPointKeys.every(item => $scope.localPointData[item]['check'])) {
            $scope.localpointCheckAll = true;
        } else {
            $scope.localpointCheckAll = false;
        }
    }
    /** 删除示教点位 */
    $scope.deleteLocalTeachingPoint = function() {
        const localPointKeys = Object.keys($scope.localPointData);
        let deleteLocalPointArr = [];
        localPointKeys.forEach(item => {
            if ($scope.localPointData[item]['check']) {
                deleteLocalPointArr.push($scope.localPointData[item].name)
            }
        })
        const deleteParams = {
            cmd: 'remove_local_points',
            data: {
                local: $scope.editMode_FileName,
                name: deleteLocalPointArr
            }
        }
        dataFactory.actData(deleteParams).then(() => {
            $scope.localpointCheckAll = false;
            getLocalTeachingPointsData();
            $('#limitPointModal').modal('hide');
            // 删除成功后，程序指令界面的示教点也需要更新数据
            getOptionsData();
            toastFactory.success(ptDynamicTags.success_messages[20]);
        }, (status) => {
            $('#limitPointModal').modal('hide');
            toastFactory.error(status, ptDynamicTags.error_messages[32]);
        });
    }
    /**
     * 局部示教点运行
     * @param {Object} localPointItem 当前待运行的示教点元素
     */
    $scope.localPointRun = function(localPointItem) {
        const moveJCmd = {
            cmd: 201,
            data: {
                joints: {
                    j1: localPointItem.j1,
                    j2: localPointItem.j2,
                    j3: localPointItem.j3,
                    j4: localPointItem.j4,
                    j5: localPointItem.j5,
                    j6: localPointItem.j6,
                },
                tcf: {
                    x: localPointItem.x,
                    y: localPointItem.y,
                    z: localPointItem.z,
                    rx: localPointItem.rx,
                    ry: localPointItem.ry,
                    rz: localPointItem.rz
                },
                speed: $scope.speed.toString(),
                acc: $scope.acceleration,
                ovl: '50'
            }
        };
        dataFactory.setData(moveJCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        })
    }
    /* 局部示教点位的查看、编辑和删除 **/
    /* 程序修改备份 */
    /**程序备份ACE Editor编辑器设置 */
    var backupEditor = ace.edit("backupEditor");
    //设置主题
    backupEditor.setTheme("ace/theme/crimson_editor");
    //设置语言模式
    backupEditor.getSession().setMode("ace/mode/lua");
    //禁用语法检查器
    backupEditor.getSession().setUseWorker(false);
    //禁用显示打印线
    backupEditor.setShowPrintMargin(false);
    //自动补全功能
    backupEditor.setOptions({
        enableBasicAutocompletion:true,
        enableLiveAutocompletion:true
    })
    //监听事件
    backupEditor.getSession().on('change',function(e){
        $scope.programBackupItemData = backupEditor.getValue();
        backupEditor.setReadOnly(true);
        if(("1" != $scope.controlMode)&&$scope.debug_flag){
            $scope.programBackupItemData = commandsArray2String($scope.programBackupItemArr);
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else{
            $scope.programBackupItemArr = createCommandsArray($scope.programBackupItemData);
            updateFileDataforUpload($scope.programBackupItemArr);
        }
    })
    //其他操作使得文件内容发生改变时(打开，删除......)
    function updateBackupEditorFile(){
        backupEditor.setValue($scope.programBackupItemData);
    }
    /** 获取当前示教程序备份列 */
    function getCurrentProgramBackupList() {
        $scope.programBackupData = [];
        const getBackupParams = {
            cmd: 'get_current_backup_list',
            data: {
                origin: $scope.editMode_FileName
            }
        }
        dataFactory.getData(getBackupParams).then((data) => {
            $scope.programBackupData = data;
            $scope.selectProgramBackupName = $scope.programBackupData.length ? $scope.programBackupData[0] : '';
            $scope.getBackupProgramContent($scope.selectProgramBackupName);
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[35]);
        });
    }
    /**
     * 获取示教程序备份内容
     * @param {Object} backupItem 选择当前示教程序备份列表的下拉项
     */
    $scope.getBackupProgramContent = function(backupItem) {
        if (backupItem) {
            const getItemParams = {
                cmd: 'get_backup_program_content',
                data: {
                    origin: $scope.editMode_FileName,
                    backup: backupItem
                }
            }
            dataFactory.getData(getItemParams).then((data) => {
                $scope.programBackupItemData = data;
                $scope.programBackupItemArr = createCommandsArray($scope.programBackupItemData);
                updateBackupEditorFile();
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[36]);
            });
        }
    }
    /**
     * 打开程序备份模态框
     * @param {string} type 打开程序备份模态框的类型（目前只有删除）
     */
    $scope.openProgramBackupModal = function(type) {
        $('#programBackupModal').modal();
        $scope.backupType = type;
    }
    /**
     * 删除备份文件
     * @param {Object} deleteItem 选择当前示教程序备份列表的下拉项
     */
    $scope.deleteBackupProgram = function(deleteItem) {
        const deleteBackupParams = {
            cmd: 'remove_backup_program',
            data: {
                origin: $scope.editMode_FileName,
                backup: [deleteItem]
            }
        }
        dataFactory.actData(deleteBackupParams).then(() => {
            getCurrentProgramBackupList();
            $('#programBackupModal').modal('hide');
            toastFactory.success(ptDynamicTags.success_messages[21]);
        }, (status) => {
            $('#programBackupModal').modal('hide');
            toastFactory.error(status, ptDynamicTags.error_messages[34]);
        });
    }
    /* 程序修改备份 **/

    /**
     * 获取右侧内容（当前程序所有备份列表/当前程序所有局部示教点数据）
     * @param {string} type 'backup'/'point'/'modbus'
     */
    function getProgramAreaRightData(type) {
        if ($scope.programAreaRight) {
            switch (type) {
                case 'backup':
                    // 获取当前程序所有备份列表
                    getCurrentProgramBackupList();
                    break;
                case 'point':
                    // 获取当前程序所有局部示教点数据
                    getLocalTeachingPointsData();
                    break;
                case 'modbus':
                    // 获取当前程序modbus数据
                    getModbusMasterConfig();
                    break;
                default:
                    break;
            }
        }
    }


    /* 命令行操作模块 */
    // 创建命令行数组
    // 将以字符串形式的程序文件内容转换成命令行数组
    function createCommandsArray(commandsData) {
        // 以'\n'字符分割字符串并以数组形式保存
        // let commandsArray;
        // //针对新建文件第一行空做处理
        // if(commandsData.length > 0){
        //     commandsArray = commandsData.split('\n');
        // } else{
        //     commandsArray = [];
        // }
        let commandsArray = commandsData.split('\n');
        // if ($scope.showCommandsList == true) {
        //     commandsArray = commandsArray.filter(function (s) {
        //         return s && s.trim();
        //     })
        // }
        return commandsArray;
    };

    // 命令行数组转字符串
    function commandsArray2String(commandsArray) {
        let commandsData = '';
        for (let i = 0; i < commandsArray.length; i++) {
            // if(commandsArray[i] != ""){
            if (i == commandsArray.length - 1) {
                commandsData += commandsArray[i];
            } else {
                commandsData += commandsArray[i] + '\n';
            }
            // } 
        };
        $scope.editMode_CommandsText = commandsData;
        return commandsData;
    };


    //点击单行程序判断是否为dofile
    function adjustSingleLineDofile(str){
        str = str + "";
        var singleLine_str = str.trim();
        var call_index;
        if(g_systemFlag == 1){
            call_index = singleLine_str.indexOf("NewDofile(\"/usr/local/etc/controller/lua/");
        }else{
            call_index = singleLine_str.indexOf("NewDofile(\"/fruser/");
        }
        var lua_index = singleLine_str.indexOf(".lua");
        if (call_index != -1) {
            if(lua_index != -1){
                var callFileName;
                if(g_systemFlag == 1){
                    callFileName = singleLine_str.substring(call_index+41, lua_index+4).replace(/[\r\n]/g,"");//去掉回车换行
                }else{
                    callFileName = singleLine_str.substring(call_index+19, lua_index+4).replace(/[\r\n]/g,"");//去掉回车换行
                }
                if (null == $scope.userData[callFileName]) {
                    toastFactory.error(403, ptDynamicTags.error_messages[12]);
                    return [];
                } else {
                    let fileElement = $scope.userData[callFileName];
                    var singleLine_Call_Arr = createCommandsArray(fileElement.pgvalue);
                    let tempLen = singleLine_Call_Arr.length;
                    if (tempLen === 0) {
                        toastFactory.error(403, ptDynamicTags.error_messages[13]);
                    }else{
                        $scope.singleCallName = callFileName;
                        return singleLine_Call_Arr;
                    }
                }
            }else{
                toastFactory.error(403, ptDynamicTags.error_messages[12]);
                return [];
            }
            
        } else {
            return [];
        }
    }

    $scope.single_arrlist = [];

    // 上移下移点击命令行功能，获取命令行序号和内容
    $scope.clickCommand = function (commandIndex, commandItem) {
        $('.line-config').removeClass('selected');
        $('.line' + commandIndex).addClass('selected');
        $scope.commandSelected = commandItem;
        $scope.indexSelected = commandIndex + 1;             //item从0开始计数，对于后面数组操作需要加1，方便操作
    };
    var proClickFn = null;
    // 程序点击命令行功能，获取命令行序号和内容
    $scope.proClickCommand = function (commandIndex, commandItem) {
        var headArr = [];
        $('.line-config').removeClass('selected');
        $('.line' + commandIndex).addClass('selected');
        $scope.commandSelected = commandItem;
        $scope.indexSelected = commandIndex + 1;             //item从0开始计数，对于后面数组操作需要加1，方便操作
        //获取LIN/PTP点位名称
        var name_PTP_flag = commandItem.indexOf("PTP");
        var name_Lin_flag = commandItem.indexOf("Lin");
        var name_Eaxis_flag = commandItem.indexOf("EXT_AXIS_PTP");
        if(name_PTP_flag != -1 || name_Lin_flag != -1 || name_Eaxis_flag != -1){
            var noteindex = commandItem.indexOf("(");
            if (noteindex != -1) {
                var length = commandItem.length;
                headArr[0] = commandItem.substring(0, noteindex);
                headArr[1] = commandItem.substring(noteindex+1, length-1);
            }else{
                headArr = commandItem.split(":");
            }
            tailArr = headArr[1].split(",");
            if(name_Eaxis_flag != -1){
                document.getElementById("savePoint").value = tailArr[1];
            }else{
                document.getElementById("savePoint").value = tailArr[0];
            }
        }
        
        clearTimeout(proClickFn);
        proClickFn = setTimeout(function(){

        },300)
    };

    // 获取该行号的文件内容
    $scope.clickShowCallFile = function (commandIndex, commandItem) {
        clearTimeout(proClickFn);
        $scope.single_arrlist = adjustSingleLineDofile(commandItem);
        if ($scope.single_arrlist != false) {
            $scope.singalCallManualCloseFlag = 0;
            $scope.chooseProgramView('dofile');
        }
    };

    $scope.singalCallManualCloseFlag = 0;//手动关闭dofile显示框标志
    //关闭dofile模态框
    $("#singalCallModalclose_btn").click(function () {
        $scope.singalCallManualCloseFlag = 1;
    });

    let commandIndex;
    let commandItem;
    /**
     * 示教程序命令行单步执行
     * @param {int} index 命令行行号
     * @param {string} item 命令行内容
     */
    $scope.runStepOver = function (index, item) {
        if ($scope.controlMode == "0") {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            commandIndex = index;
            commandItem = item;
            g_isRunStepOver = 1;      // 1-单步执行，用于105指令状态反馈判断
            $scope.sendProgramName();
        }
    }
    document.getElementById('programTeach').addEventListener('105', e => {
        if (e.detail == "1") {
            let stepoverCmd = {
                cmd: 1001,
                data: {
                    pgline: commandItem
                }
            };
            dataFactory.setData(stepoverCmd)
                .then((data) => {
                    if (data != "success") {
                        toastr.error(data);
                        return;
                    }
                    $(".line-config").removeClass("running");
                    $(".line" + commandIndex).addClass("running");
                    soFlg = 1;
                    document.dispatchEvent(new CustomEvent('clearTrack_1001', { bubbles: true, cancelable: true, composed: true }));
                    noteindex = commandItem.indexOf("EXT_AXIS_PTP(1");
                    if (noteindex != -1) {
                        toastFactory.info(ptDynamicTags.info_messages[8]);
                    }
                }, (status) => {
                    toastFactory.error(status, ptDynamicTags.error_messages[14]);
                });
        }
    });

    // 命令行数组元素位置互换
    function swapArray(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };

    // 命令行上移操作
    $scope.moveUp = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[25]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if ($scope.indexSelected == null) {
            toastFactory.info(ptDynamicTags.info_messages[9]);
        } else if ($scope.indexSelected - 1 == 0) {
            toastFactory.info(ptDynamicTags.info_messages[11]);
        } else if (2 == $scope.CopyorShearFlag) {
            toastFactory.info(ptDynamicTags.info_messages[10]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            swapArray($scope.editMode_CommandsArr, $scope.indexSelected - 1, $scope.indexSelected - 2);
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.indexSelected -= 1;
            $scope.clickCommand($scope.indexSelected - 1, $scope.editMode_CommandsArr[$scope.indexSelected - 1]);
        };
    };

    // 命令行下移操作
    $scope.moveDown = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[26]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if ($scope.indexSelected == null) {
            toastFactory.info(ptDynamicTags.info_messages[9]);
        } else if ($scope.indexSelected == $scope.editMode_CommandsArr.length) {
            toastFactory.info(ptDynamicTags.info_messages[12]);
        } else if (2 == $scope.CopyorShearFlag) {
            toastFactory.info(ptDynamicTags.info_messages[10]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            swapArray($scope.editMode_CommandsArr, $scope.indexSelected - 1, $scope.indexSelected);
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.indexSelected += 1;
            $scope.clickCommand($scope.indexSelected - 1, $scope.editMode_CommandsArr[$scope.indexSelected - 1]);
        };
    };

    //命令行编辑操作
    $scope.editCmd = function (commandIndex, commandItem) {
        if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.chooseProgramView('edit');
            $scope.modifyCommandIndex = commandIndex;
            if ($scope.pointsData == null) {
                toastFactory.warning(ptDynamicTags.warning_messages[11]);
            } else {
                $scope.optionsData = $scope.pointsData;
            }
            $scope.commandUserData = $scope.userData;
            spliceCommand(commandItem);
        }
    };

    /* 根据所选命令行内容显示界面 */
    var afterCommandString = "";
    // 提取编辑命令行内容
    let headArr = [];
    let tailArr = [];
    // 返回数据内容
    $scope.ReturnString = "";
    $scope.modifyCommandIndex;
    function spliceCommand(data) {
        afterCommandString = "";
        // 逻辑指令
        $scope.show_While = false;
        $scope.show_if_else = false;
        $scope.show_waittime = false;
        $scope.show_waitDI = false;
        $scope.show_waitMultiDI = false;
        $scope.show_waitAI = false;
        $scope.show_Pause = false;
        $scope.show_Var = false;
        $scope.show_goto = false;
        $scope.show_dofile = false;
        // 运动指令
        $scope.show_PTP = false;
        $scope.show_Lin = false;
        $scope.show_joint_overspeed = false;
        $scope.show_angle_speed = false;
        $scope.show_ARC = false;
        $scope.show_Circle = false;
        $scope.show_Spiral = false;
        $scope.show_N_Spiral = false;
        $scope.show_HSpiral = false;
        $scope.show_Spline = false;
        $scope.show_Spline_Main = false;
        $scope.show_Spline_SPL = false;
        $scope.show_Spline_SLIN = false;
        $scope.show_Spline_SCIRC = false;
        $scope.show_New_Spline = false;
        $scope.show_New_Spline_Main = false;
        $scope.show_New_Spline_SPL = false;
        $scope.show_Weave = false;
        $scope.show_Weave_Test = false;
        $scope.show_Weave_Set = false;
        $scope.show_TPD = false;
        $scope.show_load_TPD = false;
        $scope.show_move_TPD = false;
        $scope.show_Offset = false;
        $scope.show_Traj = false;
        $scope.show_TrajJ = false;
        $scope.show_ServoC = false;
        $scope.show_DMP = false;
        $scope.show_WPTrsf = false;
        $scope.show_ToolTrsf = false;
        // 控制指令
        $scope.show_SetIO = false;
        $scope.show_SetDO = false;
        $scope.show_SetDI = false;
        $scope.show_SetAO = false;
        $scope.show_AO = false;
        $scope.show_AI = false;
        $scope.show_Vir = false;
        $scope.show_Set_Vir_DI = false;
        $scope.show_Set_Vir_AI = false;
        $scope.show_Get_Vir_DI = false;
        $scope.show_Get_Vir_AI = false;
        $scope.show_AuxIO = false;
        $scope.show_Aux_IO_Main = false;
        $scope.show_Aux_Set_DO = false;
        $scope.show_Aux_Set_AO = false;
        $scope.show_Aux_Wait_DI = false;
        $scope.show_Aux_Wait_AI = false;
        $scope.show_Aux_Get_DI = false;
        $scope.show_Aux_Get_AI = false;
        $scope.show_MoveDO = false;
        $scope.show_MoveAO = false;
        $scope.show_ToolList = false;
        $scope.show_tool = false;
        $scope.show_wobj = false;
        $scope.show_Mode = false;
        $scope.show_Collision = false;
        $scope.show_Acc = false;
        // 外设指令
        $scope.show_Gripper = false;
        $scope.show_Gripper_move = false;
        $scope.show_Spray = false;
        $scope.show_EAxis = false;
        $scope.show_EAxis_Move = false;
        $scope.show_EAxis_Homing = false;
        $scope.show_EAxis_ServoOn = false;
        $scope.show_auxServo_id = false;
        $scope.show_auxServo_mode = false;
        $scope.show_auxServo_pos = false;
        $scope.show_auxServo_traget_speed = false;
        // $scope.show_auxServo_target_Torque = false;
        $scope.show_auxServo_zero_control = false;
        $scope.show_Conveyor = false;
        $scope.show_Conveyor_IODetect = false;
        $scope.show_Conveyor_PositionDetect = false;
        $scope.show_Conveyor_TrackStart = false;
        $scope.show_Polish = false;
        $scope.show_Polish_vel = false;
        $scope.show_Polish_force = false;
        $scope.show_Polish_pos = false;
        $scope.show_Polish_mode = false;
        $scope.show_touch_force = false;
        $scope.show_torque_time = false;
        $scope.show_piece_weight = false;
        // 焊接
        $scope.show_Weld = false;
        $scope.show_Weld_current = false;
        $scope.show_Weld_volage = false;
        $scope.show_Weld_ARC = false;
        $scope.show_Segment = false;
        $scope.show_Laser = false;
        $scope.show_Laser_Track = false;
        $scope.show_Laser_Record = false;
        $scope.show_Laser_Recurrent = false;
        $scope.show_Recurrent = false;
        $scope.show_Weld_Trace = false;
        $scope.show_Wire_Search = false;
        $scope.show_Wire_Search_Main = false;
        $scope.show_Wire_Search_Point = false;
        $scope.show_Adjust = false;
        // 力控
        $scope.show_FT = false;
        $scope.show_FT_Main = false;
        $scope.show_FT_Guard = false;
        $scope.show_FT_Control = false;
        $scope.show_FT_Spiral = false;
        $scope.show_FT_Rot = false;
        $scope.show_FT_Lin = false;
        $scope.show_FT_Find_Surface = false;
        $scope.show_FT_Cal_Center = false;
        $scope.show_FT_Compliance = false;
        $scope.show_Torque = false;
        // 3D
        $scope.show_3D = false;
        // 码垛
        $scope.show_pallet = false;
        // 通讯
        $scope.show_Modbus = false;
        $scope.show_Modbus_Master = false;
        $scope.show_Modbus_Slave = false;
        $scope.show_Modbus_Rtu = false;
        $scope.show_Modbus_Tcp = false;
        $scope.show_Xmlrpc = false;
        // 辅助
        $scope.show_Thread = false;
        $scope.show_Function = false;
        $scope.show_PTMode = false;
        $scope.show_FFollow = false;
        // 自定义
        $scope.show_Custom_Edit = false;

        data = data.trim();
        var notes = data.search(/--/i);         
        if (notes !== -1) {
            //文件包含lua自带注释--
            if (notes  == 0) {
                toastFactory.info(ptDynamicTags.info_messages[88]);
                $scope.cancel();
                return;
            } else {
                //如果--在指令后面面，需要处理
                var luaindex = data.indexOf("--");
                let tempString = data.substring(0,luaindex);
                afterCommandString = data.substring(luaindex,data.length);
                tempString = tempString.trim();

                data = tempString;
            }
        } else {
            data = data.trim();
        }
        if (0 == data.search(/NewDofile/)) {
            $scope.pro_splite_flag = 1;
            if (g_systemFlag == 1) {
                headArr = data.split("(\"/usr/local/etc/controller/lua/");
            } else {
                headArr = data.split("(\"/fruser/");
            }
        } else {
            $scope.pro_splite_flag = 0;
            var noteindex = data.indexOf("(");
            if (noteindex != -1) {
                var length = data.length;
                headArr[0] = data.substring(0, noteindex);
                headArr[1] = data.substring(noteindex+1, length-1);
            } else {
                headArr = data.split(":");
            }
        }
        if (headArr.length <= 1) {
            document.getElementById("selectedCustomEdit").value = data;
                $scope.show_Custom_Edit = true;
            return;
        }
        tailArr = headArr[1].split(",");
        let pointNameArr = Object.keys($scope.optionsData);
        $scope._Command_Title = ptDynamicTags.info_messages[87];
        $scope.SensorToolCoord = $scope.pro_SensorCoordeData;
        let weldId;
        switch (headArr[0]) {
            case "WaitMs":
                $scope.waittime = tailArr[0];
                $scope.show_waittime = true;
                break;
            case "WaitDI":
                getIOAliasData();
                $scope.selectedWaitDIPort = $scope.DinData[tailArr[0]];
                $scope.selectedWaitDIState = $scope.IOState[tailArr[1]];
                $scope.waitDItime = tailArr[2];
                $scope.selectedWaitDIMotion = $scope.WhetherMotion[tailArr[3]];
                $scope.show_waitDI = true;
                break;
            case "WaitToolDI":
                getIOAliasData();
                $scope.selectedWaitDIPort = $scope.DinData[parseInt(tailArr[0]) + 15];
                $scope.selectedWaitDIState = $scope.IOState[tailArr[1]];
                $scope.waitDItime = tailArr[2];
                $scope.selectedWaitDIMotion = $scope.WhetherMotion[tailArr[3]];
                $scope.show_waitDI = true;
                break;
            case "WaitMultiDI":
                $scope.selectedWaitMultiDICondition = $scope.WaitMultiDiCondition[tailArr[0]]
                $scope.selectedmultiPort = transMultiPort(tailArr[1],0);
                $scope.selectedmultiValue = transMultiPort(tailArr[2],1);
                $scope.waitMultiDItime = tailArr[3];
                $scope.selectedWaitMultiDIMotion = $scope.WhetherMotion[tailArr[4]];
                $scope.show_waitMultiDI = true;
                break;
            case "WaitAI":
                getIOAliasData();
                $scope.selectedWaitAIPort = $scope.AIport[tailArr[0]];
                $scope.selectedWaitAIState = $scope.AIcompare[tailArr[1]];
                $scope.WaitAIValue = tailArr[2]
                $scope.waitAItime = tailArr[3];
                $scope.selectedWaitAIMotion = $scope.WhetherMotion[tailArr[4]];
                $scope.show_waitAI = true;
                break;
            case "WaitToolAI":
                getIOAliasData();
                $scope.selectedWaitAIPort = $scope.AIport[parseInt(tailArr[0]) + 2];
                $scope.selectedWaitAIState = $scope.AIcompare[tailArr[1]];
                $scope.WaitAIValue = tailArr[2]
                $scope.waitAItime = tailArr[3];
                $scope.selectedWaitAIMotion = $scope.WhetherMotion[tailArr[4]];
                $scope.show_waitAI = true;
                break;
            case "NewDofile":
                tailArr[0] = tailArr[0].substring(0, tailArr[0].length-1);
                $scope.selectedDofileCall = $scope.commandUserData[tailArr[0]];
                $scope.selectedDofileLevel = $scope.dofileLevelData[tailArr[1]-1];
                $scope.dofileID = tailArr[2].substring(0, tailArr[2].length-1);
                $scope.show_dofile = true;
                break;
            case "PTP":
                // $scope._Command_Title = "PTP";
                $scope.show_PTP = true;
                $scope.PTPdebugspeed = tailArr[1];
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedPTP = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedPTP = null;
                }
                $scope.PTPRadius = tailArr[2];
                if (tailArr[2] == -1) {
                    document.getElementById("proPTPSmoothClose").checked = true;
                    $scope.PTPCustomRadius = 0;
                } else {
                    document.getElementById("proPTPSmoothOpen").checked = true;
                    $scope.PTPCustomRadius = tailArr[2];

                }
                if (tailArr[3] != 0) {
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[3]];
                    $scope.PTPdx = tailArr[4];
                    $scope.PTPdy = tailArr[5];
                    $scope.PTPdz = tailArr[6];
                    $scope.PTPdrx = tailArr[7];
                    $scope.PTPdry = tailArr[8];
                    $scope.PTPdrz = tailArr[9];
                } else if (tailArr[3] == 0) {
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
                }
                $scope.offsetChange();
                
                break;
            case "Lin":
                // $scope._Command_Title = "LIN";
                $scope.Lindebugspeed = tailArr[1];
                $scope.LinRadius = tailArr[2];
                if (tailArr[2] == -1) {
                    document.getElementById("proLinSmoothClose").checked = true;
                    $scope.LinCustomRadius = 0;
                } else {
                    document.getElementById("proLinSmoothOpen").checked = true;
                    $scope.LinCustomRadius = tailArr[2];

                }
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedLin = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedLin = null;
                }
                if (tailArr[0] === "seamPos") {
                    $scope.selectedWeldRecord = $scope.weldRecordData[tailArr[3]];
                    $scope.selectedTPlateType = $scope.TplateType[tailArr[4]];
                    $scope.show_seampos = true;
                    if (tailArr[5] != 0) {
                        $scope.selectedOffsetFlag = $scope.offsetFlagLaserData[tailArr[5]];
                        $scope.LINdx = tailArr[6];
                        $scope.LINdy = tailArr[7];
                        $scope.LINdz = tailArr[8];
                        $scope.LINdrx = tailArr[9];
                        $scope.LINdry = tailArr[10];
                        $scope.LINdrz = tailArr[11];
                    } else if (tailArr[5] == 0) {
                        $scope.selectedOffsetFlag = $scope.offsetFlagLaserData[0];
                    }
                } else {
                    if (tailArr[0] == "cvrCatchPoint" || tailArr[0] == "cvrRaisePoint") {
                        $scope.show_enable_offset = false;
                    } else {
                        $scope.show_enable_offset = true;
                    }
                    $scope.show_seampos = false;
                    if (tailArr[4] != 0) {
                        $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[4]];
                        $scope.LINdx = tailArr[5];
                        $scope.LINdy = tailArr[6];
                        $scope.LINdz = tailArr[7];
                        $scope.LINdrx = tailArr[8];
                        $scope.LINdry = tailArr[9];
                        $scope.LINdrz = tailArr[10];
                    } else if (tailArr[4] == 0) {
                        $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
                    }
                    $scope.selectedWireSearchRecord = $scope.spiralDipAngleData[tailArr[3]];
                    $scope.changeLinWireSearch();
                }
                if ($scope.operation.selectedLin) {
                    $scope.disProgDebugSpeed($scope.operation.selectedLin.speed, $scope.Lindebugspeed);
                }
                $scope.offsetChange();
                $scope.show_Lin = true;
                break;
            case "ARC":
                // $scope._Command_Title = "ARC";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedARC1 = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedARC1 = null;
                }
                $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[1]];
                $scope.ARC1dx = tailArr[2];
                $scope.ARC1dy = tailArr[3];
                $scope.ARC1dz = tailArr[4];
                $scope.ARC1drx = tailArr[5];
                $scope.ARC1dry = tailArr[6];
                $scope.ARC1drz = tailArr[7];
                if ($scope.optionsData[tailArr[8]]) {
                    $scope.operation.selectedARC2 = $scope.optionsData[tailArr[8]];
                } else {
                    $scope.operation.selectedARC2 = null;
                }
                $scope.selectedOffset2Flag = $scope.offsetFlagData[tailArr[9]];
                $scope.ARC2dx = tailArr[10];
                $scope.ARC2dy = tailArr[11];
                $scope.ARC2dz = tailArr[12];
                $scope.ARC2drx = tailArr[13];
                $scope.ARC2dry = tailArr[14];
                $scope.ARC2drz = tailArr[15];
                $scope.ARCdebugspeed = tailArr[16];
                $scope.ARCRadius = tailArr[17];
                if (tailArr[17] == -1) {
                    document.getElementById("proArcSmoothClose").checked = true;
                    $scope.ArcCustomRadius = 0;
                } else {
                    document.getElementById("proArcSmoothOpen").checked = true;
                    $scope.ArcCustomRadius = tailArr[17];
                }
                $scope.offsetChange();
                $scope.offsetChange_ARC2();
                $scope.show_ARC = true;
                break;
            case "Circle":
                // $scope._Command_Title = "Circle";
                if (tailArr[3] != 0 && tailArr.length == 10) {
                    //相同偏移量 --设置偏移量
                    document.getElementById("sameOffset").checked = true;
                    $scope.selectedOffsetType = 1;
                    if ($scope.optionsData[tailArr[0]]) {
                        $scope.operation.selectedCircle1 = $scope.optionsData[tailArr[0]];
                    } else {
                        $scope.operation.selectedCircle1 = null;
                    }
                    if ($scope.optionsData[tailArr[1]]) {
                        $scope.operation.selectedCircle2 = $scope.optionsData[tailArr[1]];
                    } else {
                        $scope.operation.selectedCircle2 = null;
                    }
                    $scope.Circledebugspeed = tailArr[2];
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[3]];
                    $scope.Circledx = tailArr[4];
                    $scope.Circledy = tailArr[5];
                    $scope.Circledz = tailArr[6];
                    $scope.Circledrx = tailArr[7];
                    $scope.Circledry = tailArr[8];
                    $scope.Circledrz = tailArr[9];
                } else if (tailArr[3] == 0 && tailArr.length == 4) {
                    //相同偏移量 --不设置偏移量
                    document.getElementById("sameOffset").checked = true;
                    $scope.selectedOffsetType = 1;
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
                    if ($scope.optionsData[tailArr[0]]) {
                        $scope.operation.selectedCircle1 = $scope.optionsData[tailArr[0]];
                    } else {
                        $scope.operation.selectedCircle1 = null;
                    }
                    if ($scope.optionsData[tailArr[1]]) {
                        $scope.operation.selectedCircle2 = $scope.optionsData[tailArr[1]];
                    } else {
                        $scope.operation.selectedCircle2 = null;
                    }
                    $scope.Circledebugspeed = tailArr[2];
                } else if (tailArr[1] != 0 && tailArr[9] == 0 && tailArr.length == 11) {
                    //不相同偏移量 --只有点1偏移
                    document.getElementById("differentOffset").checked = true;
                    $scope.selectedOffsetType = 0;
                    if ($scope.optionsData[tailArr[0]]) {
                        $scope.operation.selectedCircle1 = $scope.optionsData[tailArr[0]];
                    } else {
                        $scope.operation.selectedCircle1 = null;
                    }
                    $scope.selectedOffset1Flag = $scope.offsetFlagData[tailArr[1]];
                    $scope.Circledx1 = tailArr[2];
                    $scope.Circledy1 = tailArr[3];
                    $scope.Circledz1 = tailArr[4];
                    $scope.Circledrx1 = tailArr[5];
                    $scope.Circledry1 = tailArr[6];
                    $scope.Circledrz1 = tailArr[7];
                    if ($scope.optionsData[tailArr[8]]) {
                        $scope.operation.selectedCircle2 = $scope.optionsData[tailArr[8]];
                    } else {
                        $scope.operation.selectedCircle2 = null;
                    }
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
                    $scope.Circledebugspeed = tailArr[10];
                } else if (tailArr[1] == 0 && tailArr[3] != 0 && tailArr.length == 11) {
                    //不相同偏移量 --只有点2偏移
                    document.getElementById("differentOffset").checked = true;
                    $scope.selectedOffsetType = 0;
                    if ($scope.optionsData[tailArr[0]]) {
                        $scope.operation.selectedCircle1 = $scope.optionsData[tailArr[0]];
                    } else {
                        $scope.operation.selectedCircle1 = null;
                    }
                    $scope.selectedOffset1Flag = $scope.offsetFlagData[0];
                    if ($scope.optionsData[tailArr[2]]) {
                        $scope.operation.selectedCircle2 = $scope.optionsData[tailArr[2]];
                    } else {
                        $scope.operation.selectedCircle2 = null;
                    }
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[3]];
                    $scope.Circledx = tailArr[4];
                    $scope.Circledy = tailArr[5];
                    $scope.Circledz = tailArr[6];
                    $scope.Circledrx = tailArr[7];
                    $scope.Circledry = tailArr[8];
                    $scope.Circledrz = tailArr[9];
                    $scope.Circledebugspeed = tailArr[10];
                } else {
                    //不相同偏移量 --点1、点2都偏移
                    document.getElementById("differentOffset").checked = true;
                    $scope.selectedOffsetType = 0;
                    if ($scope.optionsData[tailArr[0]]) {
                        $scope.operation.selectedCircle1 = $scope.optionsData[tailArr[0]];
                    } else {
                        $scope.operation.selectedCircle1 = null;
                    }
                    $scope.selectedOffset1Flag = $scope.offsetFlagData[tailArr[1]];
                    $scope.Circledx1 = tailArr[2];
                    $scope.Circledy1 = tailArr[3];
                    $scope.Circledz1 = tailArr[4];
                    $scope.Circledrx1 = tailArr[5];
                    $scope.Circledry1 = tailArr[6];
                    $scope.Circledrz1 = tailArr[7];
                    if ($scope.optionsData[tailArr[8]]) {
                        $scope.operation.selectedCircle2 = $scope.optionsData[tailArr[8]];
                    } else {
                        $scope.operation.selectedCircle2 = null;
                    }
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[9]];
                    $scope.Circledx = tailArr[10];
                    $scope.Circledy = tailArr[11];
                    $scope.Circledz = tailArr[12];
                    $scope.Circledrx = tailArr[13];
                    $scope.Circledry = tailArr[14];
                    $scope.Circledrz = tailArr[15];
                    $scope.Circledebugspeed = tailArr[16];
                }
                $scope.offsetChange();
                $scope.show_Circle = true;
                break;
            case "Spiral":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSpiral1 = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSpiral1 = null;
                }
                if ($scope.optionsData[tailArr[1]]) {
                    $scope.operation.selectedSpiral2 = $scope.optionsData[tailArr[1]];
                } else {
                    $scope.operation.selectedSpiral2 = null;
                }
                if ($scope.optionsData[tailArr[2]]) {
                    $scope.operation.selectedSpiral3 = $scope.optionsData[tailArr[2]];
                } else {
                    $scope.operation.selectedSpiral3 = null;
                }
                $scope.Spiraldebugspeed = tailArr[3];
                if (tailArr[4] != 0) {
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[tailArr[4]];
                } else if (tailArr[4] == 0) {
                    $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
                }
                $scope.Spiraldx = tailArr[5];
                $scope.Spiraldy = tailArr[6];
                $scope.Spiraldz = tailArr[7];
                $scope.Spiraldrx = tailArr[8];
                $scope.Spiraldry = tailArr[9];
                $scope.Spiraldrz = tailArr[10];
                $scope.spiralCircleNum = tailArr[11];
                $scope.spiralDipAngleRx = tailArr[12];
                $scope.spiralDipAngleRy = tailArr[13];
                $scope.spiralDipAngleRz = tailArr[14];
                $scope.spiralRadiusAdd = tailArr[15];
                $scope.spiralRotAxisAdd = tailArr[16];
                $scope.offsetChange();
                $scope.show_Spiral = true;
                break;
            case "NewSpiral":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedNSpiral = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedNSpiral = null;
                }
                $scope.NSpiraldebugspeed = tailArr[1];
                $scope.selectedNSpiralOffsetFlag = $scope.nSpiralOffsetFlagData[0];
                $scope.NspiralCircleNum = tailArr[9];
                $scope.NspiralDipAngle = tailArr[10];
                $scope.NspiralOriginRadius = tailArr[11];
                $scope.NspiralRadiusAdd = tailArr[12];
                $scope.NspiralRotAxisAdd = tailArr[13];
                $scope.selectedSpiralDirection = $scope.spiralDirectionData[tailArr[14]];
                $scope.offsetChange();
                $scope.show_N_Spiral = true;
                break;
            case "HorizonSpiralMotionStart":
                $scope.HSpiralRadius = tailArr[0];
                $scope.HSpiralSpeed = tailArr[1];
                $scope.selectedHSpiralDirection = $scope.spiralDirectionData[tailArr[2]];
                $scope.HSpiralAngle = tailArr[3];
                $scope.show_HSpiral = true;
                break;
            case "SPTP":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSPL = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSPL = null;
                }
                $scope.SPLdebugspeed = tailArr[1];
                $scope.show_Spline = true;
                $scope.show_Spline_SPL = true;
                break;
            case "SLIN":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSLIN = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSLIN = null;
                }
                $scope.SLINdebugspeed = tailArr[1];
                $scope.show_Spline = true;
                $scope.show_Spline_SLIN = true;
                break;
            case "SCIRC":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSCIRC1 = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSCIRC1 = null;
                }
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSCIRC2 = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSCIRC2 = null;
                }
                $scope.SCIRCdebugspeed = tailArr[2];
                $scope.show_Spline = true;
                $scope.show_Spline_SCIRC = true;
                break;
            case 'NewSplineStart':
                $scope.show_new_spline_start = true;
                $scope.selectedNewSplineMode = $scope.newSplineModeData[tailArr[0]];
                $scope.globalConnectTime = tailArr[1];
                $scope.show_New_Spline = true;
                $scope.show_New_Spline_Main = true;
                break;
            case "NewSP":
                // $scope._Command_Title = "Spiral";
                if ($scope.optionsData[tailArr[0]]) {
                    $scope.operation.selectedSPL = $scope.optionsData[tailArr[0]];
                } else {
                    $scope.operation.selectedSPL = null;
                }
                $scope.newSplinedebugspeed = tailArr[1];
                $scope.newSplineRadius = tailArr[2];
                $scope.selectedSplineLastFlag = $scope.newSplineLastFlag[tailArr[3]];
                $scope.show_New_Spline = true;
                $scope.show_New_Spline_SPL = true;
                break;
            case "WeaveStart":
            case "WeaveEnd":
                getWeavecfg(tailArr[0]);
                $scope.show_Weave = true;
                $scope.show_Weave_Set = true;
                break;
            case "PointsOffsetEnable":
                $scope.PointOffset_x = tailArr[1];
                $scope.PointOffset_y = tailArr[2];
                $scope.PointOffset_z = tailArr[3];
                $scope.PointOffset_rx = tailArr[4];
                $scope.PointOffset_ry = tailArr[5];
                $scope.PointOffset_rz = tailArr[6];
                $scope.show_Offset = true;
                break;
            case "LoadTPD":
                getTPDName(tailArr[0]);
                $scope.show_TPD = true;
                $scope.show_load_TPD = true;
                break;
            case "MoveTPD":
                getTPDName(tailArr[0]);
                $scope.selectedTPDMode = $scope.setTPDMode[tailArr[1]];
                if ($scope.selectedTPDMode.num == 0) {
                    $scope.show_TPD_Mode_true = 0;
                    $scope.show_TPD_Mode_false = 1;
                    for (let i = 0; i < $scope.setTPDSpeed.length; i++) {
                        if (tailArr[2] == $scope.setTPDSpeed[i].num) {
                            $scope.selectedTPDSpeed = $scope.setTPDSpeed[i];
                        }
                    }
                } else {
                    $scope.show_TPD_Mode_true = 1;
                    $scope.show_TPD_Mode_false = 0;
                    $scope.inputTPDSpeed = tailArr[2];
                }
                $scope.show_TPD = true;
                $scope.show_move_TPD = true;
                break;
            case "ServoCart":
                $scope.selectedServoCMode = $scope.servoCModeData[tailArr[0]];
                if (tailArr[0] == 0) {
                    $scope.ServoCx = tailArr[1];
                    $scope.ServoCy = tailArr[2];
                    $scope.ServoCz = tailArr[3];
                    $scope.ServoCrx = tailArr[4];
                    $scope.ServoCry = tailArr[5];
                    $scope.ServoCrz = tailArr[6];
                    $scope.ServoCdx = "0";
                    $scope.ServoCdy = "0";
                    $scope.ServoCdz = "0";
                    $scope.ServoCdrx = "0";
                    $scope.ServoCdry = "0";
                    $scope.ServoCdrz = "0";
                } else {
                    $scope.ServoCx = "0";
                    $scope.ServoCy = "0";
                    $scope.ServoCz = "0";
                    $scope.ServoCrx = "0";
                    $scope.ServoCry = "0";
                    $scope.ServoCrz = "0";
                    $scope.ServoCdx = tailArr[1];
                    $scope.ServoCdy = tailArr[2];
                    $scope.ServoCdz = tailArr[3];
                    $scope.ServoCdrx = tailArr[4];
                    $scope.ServoCdry = tailArr[5];
                    $scope.ServoCdrz = tailArr[6];
                }
                $scope.ServoCScalex = tailArr[7];
                $scope.ServoCScaley = tailArr[8];
                $scope.ServoCScalez = tailArr[9];
                $scope.ServoCScalerx = tailArr[10];
                $scope.ServoCScalery = tailArr[10];
                $scope.ServoCScalerz = tailArr[12];
                $scope.ServoCAcc = tailArr[13];
                $scope.ServoCSpeed = tailArr[14];
                $scope.ServoCCommandCycle = tailArr[15];
                $scope.ServoCLookaheadTime = tailArr[16];
                $scope.ServoCGain = tailArr[17];
                $scope.show_ServoC = true;
                break;
            case 'WorkPieceTrsfStart':
                getWobjCoordData('WorkPieceTrsfStart', tailArr[0]);
                $scope.show_WPTrsf = true;
                break;
            case 'ToolTrsfStart':
                getToolTrsfCoordData(tailArr[0]);
                $scope.show_ToolTrsf = true;
                break;
            case "SetDO":
                // $scope._Command_Title = "SetIO";
                getDOcfg();
                getIOAliasData();
                $scope.selectedSetioPort = $scope.DoData[tailArr[0]];
                $scope.selectedSetioState = $scope.IOState[tailArr[1]];
                $scope.selectedSetioMode = $scope.setIOMode[tailArr[2]];
                $scope.selectedSetioThread = $scope.auxIOThreadData[tailArr[3]];
                $scope.selectedSetIOBlock = $scope.IOBlockData[0];
                $scope.changeSetioMode($scope.selectedSetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDO = true;
                break;
            case "SetToolDO":
                // $scope._Command_Title = "SetIO";
                getIOAliasData();
                $scope.selectedSetioPort = $scope.DoData[parseInt(tailArr[0]) + 16];
                $scope.selectedSetioState = $scope.IOState[tailArr[1]];
                $scope.selectedSetioMode = $scope.setIOMode[tailArr[2]];
                $scope.selectedSetioThread = $scope.auxIOThreadData[tailArr[3]];
                $scope.selectedSetIOBlock = $scope.IOBlockData[0];
                $scope.changeSetioMode($scope.selectedSetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDO = true;
                break;
            case "SPLCSetDO":
                // $scope._Command_Title = "SetIO";
                getDOcfg();
                getIOAliasData();
                $scope.selectedSetioPort = $scope.DoData[tailArr[0]];
                $scope.selectedSetioState = $scope.IOState[tailArr[1]];
                $scope.selectedSetioMode = $scope.setIOMode[tailArr[2]];
                $scope.selectedSetIOBlock = $scope.IOBlockData[1];
                $scope.changeSetioMode($scope.selectedSetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDO = true;
                break;
            case "SPLCSetToolDO":
                // $scope._Command_Title = "SetIO";
                getIOAliasData();
                $scope.selectedSetioPort = $scope.DoData[parseInt(tailArr[0]) + 16];
                $scope.selectedSetioState = $scope.IOState[tailArr[1]];
                $scope.selectedSetioMode = $scope.setIOMode[tailArr[2]];
                $scope.selectedSetIOBlock = $scope.IOBlockData[1];
                $scope.changeSetioMode($scope.selectedSetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDO = true;
                break;
            case "GetDI":
                getIOAliasData();
                $scope.selectedGetIOPort = $scope.DinData[tailArr[0]];
                $scope.selectedGetIOBlock = $scope.IOBlockData[0];
                $scope.selectedGetioThread = $scope.auxIOThreadData[tailArr[1]];
                $scope.changeGetIOMode($scope.selectedGetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDI = true;
                break;
            case "GetToolDI":
                getIOAliasData();
                $scope.selectedGetIOPort = $scope.DinData[parseInt(tailArr[0]) + 15];
                $scope.selectedGetIOBlock = $scope.IOBlockData[0];
                $scope.selectedGetioThread = $scope.auxIOThreadData[tailArr[1]];
                $scope.changeGetIOMode($scope.selectedGetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDI = true;
                break;
            case "SPLCGetToolDI":
                getIOAliasData();
                $scope.selectedGetIOPort = $scope.DinData[parseInt(tailArr[0]) + 15];
                $scope.selectedGetIOState = $scope.IOState[tailArr[1]];
                $scope.GetIOwaittime = tailArr[2];
                $scope.selectedGetIOBlock = $scope.IOBlockData[1];
                $scope.changeGetIOMode($scope.selectedGetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDI = true;
                break;
            case "SPLCGetDI":
                getIOAliasData();
                $scope.selectedGetIOPort = $scope.DinData[tailArr[0]];
                $scope.selectedGetIOState = $scope.IOState[tailArr[1]];
                $scope.GetIOwaittime = tailArr[2];
                $scope.selectedGetIOBlock = $scope.IOBlockData[1];
                $scope.changeGetIOMode($scope.selectedGetIOBlock.num);
                $scope.show_SetIO = true;
                $scope.show_SetDI = true;
                break;
            case "SetAO":
                getIOAliasData();
                $scope.SetAOPort = $scope.AOport[tailArr[0]];
                $scope.SetAOValue = tailArr[1];
                $scope.selectedSetAoThread = $scope.auxIOThreadData[tailArr[2]];
                $scope.selectedSetAOBlock = $scope.IOBlockData[0];
                $scope.changeSetAOMode($scope.selectedSetAOBlock.num);
                $scope.show_SetAO = true;
                $scope.show_AO = true;
                break;
            case "SetToolAO":
                getIOAliasData();
                $scope.SetAOPort = $scope.AOport[parseInt(tailArr[0]) + 2];
                $scope.SetAOValue = tailArr[1];
                $scope.selectedSetAoThread = $scope.auxIOThreadData[tailArr[2]];
                $scope.selectedSetAOBlock = $scope.IOBlockData[0];
                $scope.changeSetAOMode($scope.selectedSetAOBlock.num);
                $scope.show_SetAO = true;
                $scope.show_AO = true;
                break;
            case "SPLCSetAO":
                getIOAliasData();
                $scope.SetAOPort = $scope.AOport[tailArr[0]];
                $scope.SetAOValue = tailArr[1];
                $scope.selectedSetAOBlock = $scope.IOBlockData[1];
                $scope.changeSetAOMode($scope.selectedSetAOBlock.num);
                $scope.show_SetAO = true;
                $scope.show_AO = true;
                break;
            case "SPLCSetToolAO":
                getIOAliasData();
                $scope.SetAOPort = $scope.AOport[parseInt(tailArr[0]) + 2];
                $scope.SetAOValue = tailArr[1];
                $scope.selectedSetAOBlock = $scope.IOBlockData[1];
                $scope.changeSetAOMode($scope.selectedSetAOBlock.num);
                $scope.show_SetAO = true;
                $scope.show_AO = true;
                break;
            case "GetAI":
                getIOAliasData();
                $scope.GetAIport = $scope.AIport[tailArr[0]];
                $scope.selectedGetAIBlock = $scope.IOBlockData[0];
                $scope.changeGetAIMode($scope.selectedGetAIBlock.num);
                $scope.selectedGetAoThread = $scope.auxIOThreadData[tailArr[1]];
                $scope.show_SetAO = true;
                $scope.show_AI = true;
                break;
            case "GetToolAI":
                getIOAliasData();
                $scope.GetAIport = $scope.AIport[parseInt(tailArr[0]) + 2];
                $scope.selectedGetAIBlock = $scope.IOBlockData[0];
                $scope.changeGetAIMode($scope.selectedGetAIBlock.num);
                $scope.selectedGetAoThread = $scope.auxIOThreadData[tailArr[1]];
                $scope.show_SetAO = true;
                $scope.show_AI = true;
                break;
            case "SPLCGetAI":
                getIOAliasData();
                $scope.GetAIport = $scope.AIport[tailArr[0]];
                $scope.selectedGetAIBlock = $scope.IOBlockData[1];
                $scope.changeGetAIMode($scope.selectedGetAIBlock.num);
                $scope.selectedGetAIState = $scope.AIcompare[tailArr[1]];
                $scope.getAIValue = tailArr[2];
                $scope.getAItime = tailArr[3];
                $scope.show_SetAO = true;
                $scope.show_AI = true;
                break;
            case "SPLCGetToolAI":
                getIOAliasData();
                $scope.GetAIport = $scope.AIport[parseInt(tailArr[0]) + 2];
                $scope.selectedGetAIBlock = $scope.IOBlockData[1];
                $scope.changeGetAIMode($scope.selectedGetAIBlock.num);
                $scope.selectedGetAIState = $scope.AIcompare[tailArr[1]];
                $scope.getAIValue = tailArr[2];
                $scope.getAItime = tailArr[3];
                $scope.show_SetAO = true;
                $scope.show_AI = true;
                break;
            case 'MoveDOStart':
                $scope.selectedMoveDOPort = $scope.DoData[tailArr[0]];
                $scope.separationDistance = tailArr[1];
                $scope.outputPulseDutyCycle = tailArr[2];
                $scope.moveDoMode = 0;
                document.getElementById("continuousOutput").checked = true;
                $scope.show_MoveDO = true;
                break;
            case "SetVirtualDI":
                $scope.selectedSetVirDIPort = $scope.VirDinData[tailArr[0]];
                $scope.selectedSetVirDIState = $scope.IOState[tailArr[1]];
                $scope.show_Vir = true;
                $scope.show_Set_Vir_DI = true;
                break;
            case "SetVirtualToolDI":
                $scope.selectedSetVirDIPort = $scope.VirDinData[parseInt(tailArr[0]) + 15];
                $scope.selectedSetVirDIState = $scope.IOState[tailArr[1]];
                $scope.show_Vir = true;
                $scope.show_Set_Vir_DI = true;
                break;
            case "SetVirtualAI":
                $scope.selectedSetVirAIPort = $scope.VirAinData[tailArr[0]];
                $scope.SetVirAIValue = tailArr[1];
                $scope.show_Vir = true;
                $scope.show_Set_Vir_AI = true;
                break;
            case "SetVirtualToolAI":
                $scope.selectedSetVirAIPort = $scope.VirAinData[parseInt(tailArr[0]) + 2];
                $scope.SetVirAIValue = tailArr[1];
                $scope.show_Vir = true;
                $scope.show_Set_Vir_AI = true;
                break;
            case "GetVirtualDI":
                $scope.selectedGetVirDIPort = $scope.VirDinData[tailArr[0]];
                $scope.show_Vir = true;
                $scope.show_Get_Vir_DI = true;
                break;
            case "GetVirtualToolDI":
                $scope.selectedGetVirDIPort = $scope.VirDinData[parseInt(tailArr[0]) + 15];
                $scope.show_Vir = true;
                $scope.show_Get_Vir_DI = true;
                break;
            case "GetVirtualAI":
                $scope.selectedGetVirAIPort = $scope.VirAinData[tailArr[0]];
                $scope.show_Vir = true;
                $scope.show_Get_Vir_AI = true;
                break;
            case "GetVirtualToolAI":
                $scope.selectedGetVirAIPort = $scope.VirAinData[parseInt(tailArr[0]) + 2];
                $scope.show_Vir = true;
                $scope.show_Get_Vir_AI = true;
                break;
            case 'MoveToolDOStart':
                $scope.selectedMoveDOPort = $scope.DoData[Number(tailArr[0]) + 16];
                $scope.separationDistance = tailArr[1];
                $scope.outputPulseDutyCycle = tailArr[2];
                $scope.moveDoMode = 0;
                document.getElementById("continuousOutput").checked = true;
                $scope.show_MoveDO = true;
                break;
            case 'MoveDOOnceStart':
                $scope.selectedOnceMoveDOPort = $scope.DoData[tailArr[0]];
                $scope.setOnceTime = tailArr[1];
                $scope.resetOnceTime = tailArr[2];
                $scope.moveDoMode = 1;
                document.getElementById("singleOutput").checked = true;
                $scope.show_MoveDO = true;
                break;
            case 'MoveToolDOOnceStart':
                $scope.selectedOnceMoveDOPort = $scope.DoData[Number(tailArr[0]) + 16];
                $scope.setOnceTime = tailArr[1];
                $scope.resetOnceTime = tailArr[2];
                $scope.moveDoMode = 1;
                document.getElementById("singleOutput").checked = true;
                $scope.show_MoveDO = true;
                break;
            case 'MoveAOStart':
                $scope.selectedMoveAOPort = $scope.AOport[tailArr[0]];
                $scope.maxTcpSpeed = tailArr[1];
                $scope.maxTcpSpeedPercent = tailArr[2];
                $scope.zerozoneCmp = tailArr[3];
                $scope.show_MoveAO = true;
                break;
            case 'MoveToolAOStart':
                $scope.selectedMoveAOPort = $scope.AOport[Number(tailArr[0]) + 2];
                $scope.maxTcpSpeed = tailArr[1];
                $scope.maxTcpSpeedPercent = tailArr[2];
                $scope.zerozoneCmp = tailArr[3];
                $scope.show_MoveAO = true;
                break;
            case "SetToolList":
                for (let i = 0; i < $scope.ToolCoord.length; i++) {
                    if (tailArr[0] == $scope.ToolCoord[i].name) {
                        $scope.selectedToolCoord = $scope.ToolCoord[i];
                    }
                }
                $scope.show_ToolList = true;
                $scope.show_tool = true;
                break;
            case "SetExToolList":
                for (let i = 0; i < $scope.ToolCoord.length; i++) {
                    if (tailArr[0] == $scope.ToolCoord[i].name) {
                        $scope.selectedToolCoord = $scope.ToolCoord[i];
                    }
                }
                $scope.show_ToolList = true;
                $scope.show_tool = true;
                break;
            case "SetWObjList":
                getWobjCoordData('SetWObjList', tailArr[0]);
                $scope.show_ToolList = true;
                $scope.show_wobj = true;
                break;
            case "Mode":
                $scope.selectedRobotMode = $scope.robotModeData[tailArr[0]-1];
                $scope.show_Mode = true;
                break;
            // 外设指令
            case "MoveGripper":
                // getTeachGripperInfo();
                $scope.selectedTeachGripper = $scope.teachActivateGripperData[tailArr[0]-1];
                $scope.SetOpenShut = tailArr[1];
                $scope.SetGripperSpeed = tailArr[2];
                $scope.SetGripperMoment = tailArr[3];
                $scope.waitGrippertime = tailArr[4];
                $scope.selectedSetGripperBlock = $scope.IOBlockData[tailArr[5]];
                $scope.show_Gripper = true;
                $scope.show_Gripper_move = true;
                break;
            case "EXT_AXIS_PTP":
                $scope.selectedTEAxisMode = $scope.TEAxisModeData[tailArr[0]];
                if ($scope.optionsData[tailArr[1]]) {
                    $scope.operation.selectedEAxisPTP = $scope.optionsData[tailArr[1]];
                } else {
                    $scope.operation.selectedEAxisPTP = null;
                }
                $scope.EAxisPTPdebugspeed = tailArr[2];
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 0;
                document.getElementById("plcEaxis").checked = true;
                $scope.show_EAxis_Move = true;
                break;
            case "ExtAxisSetHoming":
                if (tailArr[0] == 1) {
                    $scope.selectedTEAxisID = $scope.TEAxisIDData[0];
                } else if (tailArr[0] == 2) {
                    $scope.selectedTEAxisID = $scope.TEAxisIDData[1];
                } else if (tailArr[0] == 4) {
                    $scope.selectedTEAxisID = $scope.TEAxisIDData[2];
                } else if (tailArr[0] == 8) {
                    $scope.selectedTEAxisID = $scope.TEAxisIDData[3];
                }
                $scope.selectedEAxisZeroMode = $scope.ZeroModeData[tailArr[1]];
                $scope.HomeSearchVel = tailArr[2];
                $scope.HomeLatchVel = tailArr[3];
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 0;
                document.getElementById("plcEaxis").checked = true;
                $scope.show_EAxis_Homing = true;
                break;
            case "ExtAxisServoOn":
                if (tailArr[0] == 1) {
                    $scope.selectedServeOnAxisID = $scope.TEAxisIDData[0];
                } else if (tailArr[0] == 2) {
                    $scope.selectedServeOnAxisID = $scope.TEAxisIDData[1];
                } else if (tailArr[0] == 4) {
                    $scope.selectedServeOnAxisID = $scope.TEAxisIDData[2];
                } else if (tailArr[0] == 8) {
                    $scope.selectedServeOnAxisID = $scope.TEAxisIDData[3];
                }
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 0;
                document.getElementById("plcEaxis").checked = true;
                $scope.show_EAxis_ServoOn = true;
                break;
            case "AuxServoSetStatusID":
                $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 1;
                document.getElementById("servoEaxis").checked = true;
                $scope.show_auxServo_id = true;
                break;
            case "AuxServoSetControlMode":
                $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
                $scope.auxServoCommandMode = $scope.auxServoCommandModeData.find(item => item.id == tailArr[1]);
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 1;
                document.getElementById("servoEaxis").checked = true;
                $scope.show_auxServo_mode = true;
                break;
            case "AuxServoSetTargetPos":
                $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
                $scope.auxServoTargetPosCommand = tailArr[1];
                $scope.auxServoRunSpeedCommand = tailArr[2];
                $scope.auxServoCommandMode = $scope.auxServoCommandModeData[0];
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 1;
                document.getElementById("servoEaxis").checked = true;
                $scope.show_auxServo_pos = true;
                break;
            case "AuxServoSetTargetSpeed":
                $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
                $scope.auxServoTargetSpeedCommand = tailArr[1];
                $scope.auxServoCommandMode = $scope.auxServoCommandModeData[1];
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 1;
                document.getElementById("servoEaxis").checked = true;
                $scope.show_auxServo_traget_speed = true;
                break;
            // case "AuxServoSetTargetTorque":
            // $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
            //     $scope.auxServoTargetTorqueCommand = tailArr[1];
            //     $scope.show_EAxis = true;
                // $scope.setEaxisType(1);
            //     $scope.show_auxServo_target_Torque = true;
            //     break;
            case "AuxServoHoming":
                $scope.auxServoCommandId = $scope.auxServoCommandIdData.find(item => item.id == tailArr[0]);
                $scope.auxServoZeroModeCommand = $scope.auxServoHommingModeData.filter(item => item.id == tailArr[1]);
                $scope.auxServoSearchVelCommand = tailArr[2];
                $scope.auxServoZeroLatchVelCommand = tailArr[3];
                $scope.show_EAxis = true;
                $scope.eaxisCommandType = 1;
                document.getElementById("servoEaxis").checked = true;
                $scope.show_auxServo_zero_control = true;
                break;
            case "ConveyorIODetect":
                $scope.IODetectTime = tailArr[0];
                $scope.show_Conveyor = true;
                $scope.show_Conveyor_IODetect = true;
                break;
            case "ConveyorGetTrackData":
                $scope.selectedConTrackMode = $scope.ConTrackModeData[tailArr[0]-1];
                $scope.show_Conveyor = true;
                $scope.show_Conveyor_PositionDetect = true;
                break;
            case "ConveyorTrackStart":
                $scope.selectedConTrackMode = $scope.ConTrackModeData[tailArr[0]-1];
                $scope.show_Conveyor = true;
                $scope.show_Conveyor_TrackStart = true;
                break;
            case "PolishingSetTargetVelocity":
                $scope.polishVelCommand = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_Polish_vel = true;
                break;
            case "PolishingSetTargetTorque":
                $scope.polishForceCommand = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_Polish_force = true;
                break;
            case "PolishingSetTargetPosition":
                $scope.polishPosCommand = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_Polish_pos = true;
                break;
            case "PolishingSetOperationMode":
                $scope.polishModeCommand = $scope.polishCommandModeData.find(item => item.id == tailArr[0]);
                $scope.show_Polish = true;
                $scope.show_Polish_mode = true;
                break;
            case "PolishingSetTargetTouchForce":
                $scope.polishTouchForce = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_touch_force = true;
                break;
            case "PolishingSetTargetTouchTime":
                $scope.polishTorqueTime = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_torque_time = true;
                break;
            case "PolishingSetWorkPieceWeight":
                $scope.polishWorkPieceWeight = tailArr[0];
                $scope.show_Polish = true;
                $scope.show_piece_weight = true;
                break;
            // 焊接指令
            case 'WeldingSetCurrent':
                $scope.selectedWeldIOType = tailArr[0];
                weldId = $scope.selectedWeldIOType == 0 ? 'weldControl' : 'weldDigtal';
                document.getElementById(weldId).checked = true;
                $scope.weldCurrentValue = tailArr[1];
                $scope.selectAOIndex = $scope.AOSinglePort[tailArr[2]];
                $scope.selectWeldCurrentBlending = $scope.setIOMode[tailArr[3]];
                $scope.show_Weld = true;
                $scope.show_Weld_current = true;
                break;
            case 'WeldingSetVoltage':
                $scope.selectedWeldIOType = tailArr[0];
                weldId = $scope.selectedWeldIOType == 0 ? 'weldControl' : 'weldDigtal';
                document.getElementById(weldId).checked = true;
                $scope.weldVoltageValue = tailArr[1];
                $scope.selectVoltageAOIndex = $scope.AOSinglePort[tailArr[2]];
                $scope.selectWeldVoltageBlending = $scope.setIOMode[tailArr[3]];
                $scope.show_Weld = true;
                $scope.show_Weld_volage = true;
                break;
            case "ARCStart":
                $scope.selectedWeldIOType = tailArr[0];
                weldId = $scope.selectedWeldIOType == 0 ? 'weldControl' : 'weldDigtal';
                document.getElementById(weldId).checked = true;
                $scope.selectedWeldId = $scope.WeldIdData[tailArr[1]];
                $scope.weldTime = tailArr[2];
                $scope.show_Weld = true;
                $scope.show_Weld_ARC = true;
                break;
            case "ARCEnd":
                $scope.selectedWeldIOType = tailArr[0];
                weldId = $scope.selectedWeldIOType == 0 ? 'weldControl' : 'weldDigtal';
                document.getElementById(weldId).checked = true;
                $scope.selectedWeldId = $scope.WeldIdData[tailArr[1]];
                $scope.weldTime = tailArr[2];
                $scope.show_Weld = true;
                $scope.show_Weld_ARC = true;
                break;
            // case "SegmentWeldStart":
            //     $scope.selectedFunction = $scope.functionData[tailArr[0] - 1];
            //     $scope.selectedWeldId = $scope.WeldIdData[tailArr[1]];
            //     $scope.segmentTime = tailArr[2];
            //     $scope.selectedFunctionMode = $scope.functionModeData[tailArr[3]];
            //     $scope.effectiveDistance = tailArr[4];
            //     $scope.loseDistance = tailArr[5];
            //     $scope.show_Segment = true;
            //     break;
            case "LTTrackOn":
                for (let i=0;i<$scope.SensorToolCoord.length;i++) {
                    if($scope.SensorToolCoord[i].id == tailArr[0]){
                        $scope.selectedTrackToolCoorde = $scope.SensorToolCoord[i];
                    }
                }
                $scope.show_Laser = true;
                $scope.show_Laser_Track = true;
                break;
            case "LaserSensorRecord":
                $scope.selectedLTFunction = $scope.functionTypeData[tailArr[0]];
                $scope.LTwaittime = tailArr[1];
                $scope.LTSerachSpeed = tailArr[2];
                $scope.show_Laser = true;
                $scope.show_Laser_Record = true;
                break;
            case "LTSearchStart":
                $scope.selectedSerachDist = $scope.SerachDistData[tailArr[0]];
                if (tailArr[1] == 0) {
                    $scope.operation.selectedLTSearchDistP = $scope.optionsData[pointNameArr[0]];
                } else {
                    if ($scope.optionsData[tailArr[1]]) {
                        $scope.operation.selectedLTSearchDistP = $scope.optionsData[tailArr[1]];
                    } else {
                        $scope.operation.selectedLTSearchDistP = null;
                    }
                }
                $scope.tserachSpeed = tailArr[2];
                $scope.tsearchLen = tailArr[3];
                $scope.tsearchTime = tailArr[4];
                for (let i=0; i < $scope.SensorToolCoord.length; i++) {
                    if ($scope.SensorToolCoord[i].id == tailArr[5]) {
                        $scope.selectedSearchToolCoorde = $scope.SensorToolCoord[i];
                    }
                }
                $scope.show_Laser = true;
                $scope.show_Laser_Search = true;
                break;
            case "MoveToLaserRecordEnd":
            case "MoveToLaserRecordStart":
                $scope.selectedLTRecurrentMotionMode = $scope.LaserMotionModeData[tailArr[0]];
                $scope.LTRecdebugspeed = tailArr[1];
                $scope.show_Laser_Recurrent = true;
                $scope.show_Recurrent = true;
                break;
            case "WireSearchStart":
            case "WireSearchEnd":
                $scope.selectedWireRefPos = $scope.wireRefPosData[tailArr[0]];
                $scope.tserachSpeed = tailArr[1];
                $scope.tserachDistance = tailArr[2];
                $scope.selectedSearchBackFlag = $scope.wireSearchBackFlagData[tailArr[3]];
                $scope.tserachBackSpeed = tailArr[4];
                $scope.tserachBackDistance = tailArr[5];
                $scope.selectedSearchMode = $scope.wireSearchModeData[tailArr[6]];
                $scope.show_Wire_Search_Main = true;
                $scope.show_Wire_Search = true;
                break;
            case "PostureAdjustOn":
                if (tailArr[0] == 4) {
                    $scope.selectedTechPlateType = $scope.techPlateType[3];
                } else {
                    $scope.selectedTechPlateType = $scope.techPlateType[tailArr[0]];
                }
                if (tailArr[2] == "PosB") {
                    $scope.selectedTechMotionDir = $scope.techMotionDirection[0];
                    if ($scope.optionsData[tailArr[2]]) {
                        $scope.PosB = $scope.optionsData[tailArr[2]];
                    } else {
                        $scope.PosB = null;
                    }
                    if ($scope.optionsData[tailArr[3]]) {
                        $scope.PosC = $scope.optionsData[tailArr[3]];
                    } else {
                        $scope.PosC = null;
                    }
                } else {
                    $scope.selectedTechMotionDir = $scope.techMotionDirection[1];
                    if ($scope.optionsData[tailArr[2]]) {
                        $scope.PosC = $scope.optionsData[tailArr[2]];
                    } else {
                        $scope.PosC = null;
                    }
                    if ($scope.optionsData[tailArr[3]]) {
                        $scope.PosB = $scope.optionsData[tailArr[3]];
                    } else {
                        $scope.PosB = null;
                    }
                }
                if ($scope.optionsData[tailArr[1]]) {
                    $scope.PosA = $scope.optionsData[tailArr[1]];
                } else {
                    $scope.PosA = null;
                }
                $scope.AdjustTime = tailArr[4];
                $scope.FirstLength = tailArr[5];
                $scope.selectedInfPoint = $scope.infPointType[tailArr[6]];
                $scope.SecondLength = tailArr[7];
                $scope.ThirdLength = tailArr[8];
                $scope.FourthLength = tailArr[9];
                $scope.FifthLength = tailArr[10];
                $scope.techDirPicChange();
                $scope.show_Adjust = true;
                break;
            case "FT_Guard":
                $scope.FtGuard_Open_Close_Flag = tailArr[0];
                for (let i=0;i<$scope.SensorToolCoord.length;i++) {
                    if ($scope.SensorToolCoord[i].id == tailArr[1]) {
                        $scope.selectedFTGuardCoorde = $scope.SensorToolCoord[i];
                    }
                }
                $scope.select_guard_Fx = tailArr[2];
                $scope.select_guard_Fy = tailArr[3];
                $scope.select_guard_Fz = tailArr[4];
                $scope.select_guard_Tx = tailArr[5];
                $scope.select_guard_Ty = tailArr[6];
                $scope.select_guard_Tz = tailArr[7];
                $scope.FtGuard_Fx = tailArr[8];
                $scope.FtGuard_Fy = tailArr[9];
                $scope.FtGuard_Fz = tailArr[10];
                $scope.FtGuard_Tx = tailArr[11];
                $scope.FtGuard_Ty = tailArr[12];
                $scope.FtGuard_Tz = tailArr[13];
                $scope.FtGuard_Fx_Max = tailArr[14];
                $scope.FtGuard_Fy_Max = tailArr[15];
                $scope.FtGuard_Fz_Max = tailArr[16];
                $scope.FtGuard_Tx_Max = tailArr[17];
                $scope.FtGuard_Ty_Max = tailArr[18];
                $scope.FtGuard_Tz_Max = tailArr[19];
                $scope.FtGuard_Fx_Min = tailArr[20];
                $scope.FtGuard_Fy_Min = tailArr[21];
                $scope.FtGuard_Fz_Min = tailArr[22];
                $scope.FtGuard_Tx_Min = tailArr[23];
                $scope.FtGuard_Ty_Min = tailArr[24];
                $scope.FtGuard_Tz_Min = tailArr[25];
                transFTState(0);
                $scope.show_FT = true;
                $scope.show_FT_Guard = true;
                break;
            case "FT_Control":
                $scope.FtControl_Open_Close_Flag = tailArr[0];
                for (let i=0;i<$scope.SensorToolCoord.length;i++) {
                    if ($scope.SensorToolCoord[i].id == tailArr[1]) {
                        $scope.selectedFTControlCoorde = $scope.SensorToolCoord[i];
                    }
                }
                $scope.select_Control_Fx = tailArr[2];
                $scope.select_Control_Fy = tailArr[3];
                $scope.select_Control_Fz = tailArr[4];
                $scope.select_Control_Tx = tailArr[5];
                $scope.select_Control_Ty = tailArr[6];
                $scope.select_Control_Tz = tailArr[7];
                $scope.FtControl_Fx = tailArr[8];
                $scope.FtControl_Fy = tailArr[9];
                $scope.FtControl_Fz = tailArr[10];
                $scope.FtControl_Tx = tailArr[11];
                $scope.FtControl_Ty = tailArr[12];
                $scope.FtControl_Tz = tailArr[13];
                $scope.FtControl_F_P_gain = tailArr[14];
                $scope.FtControl_F_I_gain = tailArr[15];
                $scope.FtControl_F_D_gain = tailArr[16];
                $scope.FtControl_T_P_gain = tailArr[17];
                $scope.FtControl_T_I_gain = tailArr[18];
                $scope.FtControl_T_D_gain = tailArr[19];
                $scope.selectedFTControlAdjSign = $scope.FTControlAdjSignData[tailArr[20]];
                $scope.selectedFTControlILCSign = $scope.FTControlILCSignData[tailArr[21]];
                $scope.FTControlLimitlength = tailArr[22];
                $scope.FTControlLimitangle = tailArr[23];
                $scope.selectedFTControlFilter = $scope.FTControlAdjSignData[tailArr[24]];
                $scope.selectedFTControlPA = $scope.FTControlAdjSignData[tailArr[25]];
                transFTState(1);
                $scope.show_FT = true;
                $scope.show_FT_Control = true;
                break;
            case "FT_SpiralSearch":
                $scope.selectedFTSpiralCoorde = $scope.FTReferenceCoordData[tailArr[0]];
                $scope.FTSpiralIncreasePerTurn = tailArr[1];
                $scope.FTSpiralForceInsertion = tailArr[2];
                $scope.FTSpiralTMax = tailArr[3];
                $scope.FTSpiralVelSpiral = tailArr[4];
                $scope.show_FT = true;
                $scope.show_FT_Spiral = true;
                break;
            case "FT_RotInsertion":
                $scope.selectedFTRotCoorde = $scope.FTReferenceCoordData[tailArr[0]];
                $scope.FTRotAngVelRot = tailArr[1];
                $scope.FTRotForceInsertion = tailArr[2];
                $scope.FTRotAngleMax = tailArr[3];
                $scope.selectedFTRotOrn = $scope.FTRotOrnData[tailArr[4]-1];
                $scope.FTRotAngleAccMax = tailArr[5];
                $scope.selectedFTRotRotOrn = $scope.FTRotRotOrnData[tailArr[6]-1];
                $scope.show_FT = true;
                $scope.show_FT_Rot = true;
                break;
            case "FT_LinInsertion":
                $scope.selectedFTLinCoorde = $scope.FTReferenceCoordData[tailArr[0]];
                $scope.FTLinForceGoal = tailArr[1];
                $scope.FTLinVel = tailArr[2];
                $scope.FTLinAcc = tailArr[3];
                $scope.FTLinDistanceMax = tailArr[4];
                $scope.selectedFTLinOrn = $scope.FTLinOrnData[tailArr[5]-1];
                $scope.show_FT = true;
                $scope.show_FT_Lin = true;
                break;
            case "FT_FindSurface":
                $scope.selectedFTFindSurfaceCoorde = $scope.FTReferenceCoordData[tailArr[0]];
                $scope.selectedFTFindSurfaceDirection = $scope.FTFindSurfaceDirectionData[Number(tailArr[1]) - 1];
                $scope.selectedFTFindSurfaceAxis = $scope.FTFindSurfaceAxisData[Number(tailArr[2]) - 1];
                $scope.FTFindSurfaceVel = tailArr[3];
                $scope.FTFindSurfaceAcc = tailArr[4];
                $scope.FTFindSurfaceDistanceMax = tailArr[5];
                $scope.FTFindSurfaceForceGoal = tailArr[6];
                $scope.show_FT = true;
                $scope.show_FT_Find_Surface = true;
                break;
            case 'JointOverSpeedProtectStart':
                $scope.jointOverspeedProtectEnable = 1;
                $scope.selectedTreatStrategy = $scope.treatStrategyData.filter(item => item.id == [tailArr[0]])[0];
                $scope.speedReductionThreshold = tailArr[1];
                $scope.show_Lin = true;
                $scope.show_joint_overspeed = true;
                $scope.changeProtectBtn(1);
                break;
            case 'AngularSpeedStart':
                $scope.transPointAngleSpeedEnable = 1;
                $scope.angleSpeedThreshold = tailArr[0];
                $scope.show_Lin = true;
                $scope.show_angle_speed = true;
                $scope.changeTransPointAngleBtn(1);
                break;
            default:
                document.getElementById("selectedCustomEdit").value = data;
                $scope.show_Custom_Edit = true;
                break;
        }
    }
    /* ./根据所选命令行内容显示界面 */

    // 完成操作保存数据
    $scope.replaceCommand = function () {
        switch (headArr[0]) {
            // 逻辑
            case "WaitMs":
                $scope.addWaitTime();
                break;
            case "WaitDI":
            case "WaitToolDI":
                $scope.addWaitDI();
                break;
            case "WaitMultiDI":
                $scope.addWaitMultiDI();
                break;
            case "WaitAI":
            case "WaitToolAI":
                $scope.addWaitAI();
                break;
            case "NewDofile":
                $scope.addDofileCall();
                break;
            // 运动
            case "PTP":
                $scope.addPTP();
                break;
            case "Lin":
                $scope.addLin();
                break;
            case "ARC":
                $scope.addARC();
                break;
            case "Circle":
                $scope.addCircle();
                break;
            case "Spiral":
                $scope.addSpiral();
                break;
            case "NewSpiral":
                $scope.addNSpiral();
                break;
            case "HorizonSpiralMotionStart":
                $scope.addHorizonSpiralMotionStart();
                break;
            case "SPTP":
                $scope.addSplineSPL();
                break;
            case "SLIN":
                $scope.addSplineSLIN();
                break;
            case "SCIRC":
                $scope.addSplineSCIRC();
                break;
            case "NewSplineStart":
                $scope.addNewSplineStart();
                break;
            case "NewSP":
                $scope.addNewSplineSPL();
                break;
            case "WeaveStart":
                $scope.addWeaveStart();
                break;
            case "WeaveEnd":
                $scope.addWeaveEnd();
                break;
            case "PointsOffsetEnable":
                $scope.addPointOffsetEnable();
                break;
            case "ServoCart":
                $scope.addServoC();
                break;
            case "MoveTPD":
                $scope.reappearTPDRecord();
                break;
            case "LoadTPD":
                $scope.addLoadTPDFile();
                break;
            case "WorkPieceTrsfStart":
                $scope.addWorkPieceTrsf();
                break;
            case "ToolTrsfStart":
                $scope.addToolTrsf();
                break;
            // 控制
            case "SetDO":
            case "SetToolDO":
            case "SPLCSetDO":
            case "SPLCSetToolDO":
                $scope.addSetIO();
                break;
            case "GetDI":
            case "GetToolDI":
            case "SPLCGetDI":
            case "SPLCGetToolDI":
                $scope.addGetIO();
                break;
            case "SetAO":
            case "SetToolAO":
            case "SPLCSetAO":
            case "SPLCSetToolAO":
                $scope.addSetAO();
                break;
            case "GetAI":
            case "GetToolAI":
            case "SPLCGetAI":
            case "SPLCGetToolAI":
                $scope.addGetAI();
                break;
            case "SetVirtualDI":
            case "SetVirtualToolDI":
                $scope.addSetVirDI();
                break;
            case "SetVirtualAI":
            case "SetVirtualToolAI":
                $scope.addSetVirAI();
                break;
            case "GetVirtualDI":
            case "GetVirtualToolDI":
                $scope.addGetVirDI();
                break;
            case "GetVirtualAI":
            case "GetVirtualToolAI":
                $scope.addGetVirAI();
                break;
            case "MoveDOStart":
            case "MoveToolDOStart":
                $scope.addMoveDO();
                break;
            case "MoveDOOnceStart":
            case "MoveToolDOOnceStart":
                $scope.addOnceMoveDO();
                break;
            case "MoveAOStart":
            case "MoveToolAOStart":
                $scope.addMoveAO();
                break;
            case "Mode":
                $scope.addRobotMode();
                break;
            case "SetToolList":
            case "SetExToolList":
                $scope.applyTool();
                break;
            case "SetWObjList":
                $scope.applyWobj();
                break;
            // 外设
            case "MoveGripper":
                $scope.addGripper();
                break;
            case "EXT_AXIS_PTP":
                $scope.addEAxis();
                break;
            case "ExtAxisSetHoming":
                $scope.addEAxisZero();
                break;
            case "ExtAxisServoOn":
                $scope.addEAxisServoOn();
                break;
            case "AuxServoSetStatusID":
                $scope.addAuxServoStatusID($scope.auxServoCommandId.id);
                break;
            case "AuxServoSetControlMode":
                $scope.addAuxServoSetControlMode($scope.auxServoCommandMode.id);
                break;
            case "AuxServoSetTargetPos":
                $scope.addAuxServoTargetPos($scope.auxServoTargetPosCommand, $scope.auxServoRunSpeedCommand, $scope.auxServoRunAccCommand);
                break;
            case "AuxServoSetTargetSpeed":
                $scope.addAuxServoTargetSpeed($scope.auxServoTargetSpeedCommand, $scope.auxServoTargetAccCommand);
                break;
            // case "AuxServoSetTargetTorque":
            //     $scope.addAuxServoTargetTorque();
            //     break;
            case "AuxServoHoming":
                $scope.addAuxServoHoming($scope.auxServoHommingMode.id, $scope.auxServoSearchVelCommand, $scope.auxServolatchVelCommand, $scope.auxServoAccCommand);
                break;
            case "ConveyorIODetect":
                $scope.addConIODetect();
                break;
            case "ConveyorGetTrackData":
                $scope.addConPositionDetect();
                break;
            case "ConveyorTrackStart":
                $scope.addConTrackStart();
                break;
            case "PolishingSetTargetVelocity":
                $scope.addPolishingSetTargetVelocity($scope.polishVelCommand);       
                break;
            case "PolishingSetTargetTorque":
                $scope.addPolishingSetTargetTorque($scope.polishForceCommand);
                break;
            case "PolishingSetTargetPosition":
                $scope.addPolishingSetTargetPosition($scope.polishPosCommand);
                break;
            case "PolishingSetOperationMode":
                $scope.addPolishingSetOperationMode($scope.polishModeCommand.id);
                break;
            case "PolishingSetTargetTouchForce":
                $scope.addPolishingSetTargetTouchForce($scope.polishTouchForce);
                break;
            case "PolishingSetTargetTouchTime":
                $scope.addPolishingSetTargetTouchTime($scope.polishTorqueTime);
                break;
            case "PolishingSetWorkPieceWeight":
                $scope.addPolishingSetWorkPieceWeight($scope.polishWorkPieceWeight);
                break;
            // 焊接
            case "WeldingSetCurrent":
                $scope.addWeldingCurrent($scope.selectedWeldIOType, $scope.weldCurrentValue, $scope.selectAOIndex.num, $scope.selectWeldCurrentBlending.num);
                break;
            case "WeldingSetVoltage":
                $scope.addWeldingVoltage($scope.selectedWeldIOType, $scope.weldVoltageValue, $scope.selectVoltageAOIndex.num, $scope.selectWeldVoltageBlending.num);
                break;
            case "ARCStart":
                $scope.addARCStart();
                break;
            case "ARCEnd":
                $scope.addARCEnd();
                break;
            // case "SegmentWeldStart":
            //     $scope.addSegmengStart();
            //     break;
            // case "SegmentWeldEnd":
            //     $scope.addSegmengEnd();
            //     break;
            case "LTTrackOn":
                $scope.addLTTrackOn();
                break;
            case "LaserSensorRecord":
                $scope.addLTTrackDataOn();
                break;
            case "LTSearchStart":
                $scope.addLTSearchStart();
                break;
            case "MoveToLaserRecordEnd":
                $scope.addGetWeldTrackingRecordEndPos();
                break;
            case "MoveToLaserRecordStart":
                $scope.addGetWeldTrackingRecordStartPos();
                break;
            case "WireSearchStart":
                $scope.addWireSearchStart();
                break;
            case "WireSearchEnd":
                $scope.addWireSearchStop();
                break;
            case "PostureAdjustOn":
                $scope.addAdjustOn();
                break;
            // 力控
            case "FT_Guard":
                $scope.addFtGuardOpen();
                break;
            case "FT_Control":
                $scope.addFtControlOpen();
                break;
            case "FT_SpiralSearch":
                $scope.addFTSpiralSearch();
                break;
            case "FT_RotInsertion":
                $scope.addFTRotInsertion();
                break;
            case "FT_LinInsertion":
                $scope.addFTLinInsertion();
                break;
            case "FT_FindSurface":
                $scope.addFTFindSurface();
                break;
            case "JointOverSpeedProtectStart":
                $scope.addJointOverSpeedProtect();
                break;
            case "AngularSpeedStart":
                $scope.addAngularSpeedStart();
                break;
            default:
                $scope.addCustomEdit();
                break;
        }
        if ($scope.ReturnString != "") {
            $scope.editMode_CommandsArr[$scope.modifyCommandIndex] = $scope.ReturnString + afterCommandString;
            updateFileDataforUpload($scope.editMode_CommandsArr);
        }
    };

    // 自定义编辑内容
    $scope.addCustomEdit = function(){
        $scope.ReturnString = document.getElementById("selectedCustomEdit").value;
    }

    // 命令行删除操作
    $scope.deleteCommand = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[29]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if ($scope.indexSelected == null) {
            toastFactory.info(ptDynamicTags.info_messages[9]);
        } else if (2 == $scope.CopyorShearFlag) {
            toastFactory.info(ptDynamicTags.info_messages[10]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.editMode_CommandsArr.splice($scope.indexSelected - 1, 1);
            updateFileDataforUpload($scope.editMode_CommandsArr);
        }
    };

    //根据层数和id映射对应调用的NewDofile
    function mappingNewDofile(layer, id) {
        for (let m = 0; m < $scope.finallyNewDofileArr.length; m++) {
            if ($scope.finallyNewDofileArr[m][1] == layer && $scope.finallyNewDofileArr[m][2] == id) {
                return $scope.finallyNewDofileArr[m][0];
            }
        }
    }

    //映射实时显示的行号
    let modal_main_line = 0;
    let modal_close_flag = 1;
    let modal_ndf_row = 0;
    function markRunningLine(ptData) {
        var lineNumber = ptData.line_number;//主程序行号
        var ndf_layer = ptData.ndf_layer;//第几层调用
        var ndf_row = ptData.ndf_row;//无调用为0，调用子程序显示主程序行号
        var ndf_id = ptData.ndf_id;//调用程序id
        if (ndf_layer == 1 || ndf_layer == 2) {
            //当前控制器从二级调用返回一级调用，ndf_row会清零，需要将这些处理注释掉
            //if(modal_ndf_row != ndf_row){
            //    modal_ndf_row = ndf_row;
            //if(ndf_row == 0){
            //    //数组无数据，不显示
            //    return;
            //}else{
            if (modal_close_flag == 1) {
                modal_close_flag = 0;
                if ($scope.singalCallManualCloseFlag != 1) {
                    $scope.chooseProgramView('dofile');
                }
            }
            //显示主程序行号
            reallineNumber = lineNumber - 1;
            $(".line-config").removeClass("running");
            $(".line" + reallineNumber).addClass("running");
            //调用子程序内容解析
            var tmpFileName = mappingNewDofile(ndf_layer, ndf_id);
            let fileElement = $scope.userData[tmpFileName];
            $scope.singleCallName = tmpFileName;
            $scope.single_arrlist = createCommandsArray(fileElement.pgvalue);
            switch (ndf_layer) {
                case 1:
                    $scope.selectDofileName = $scope.dofileList.find(item => item.name == $scope.singleCallName);
                    $scope.selectDofileList = $scope.dofileList.find(item => item.name == $scope.singleCallName).children;
                    $scope.selectDofileChildName = '';
                    break;
                case 2:
                    $scope.dofileList.forEach(item => {
                        if (item.children.length > 1) {
                            if (item.children.find(element => element == $scope.singleCallName)) {
                                $scope.selectDofileList = item.children;
                                $scope.selectDofileName = item;
                            }
                        }
                    })
                    $scope.selectDofileChildName = $scope.singleCallName;
                    break;
                default:
                    break;
            }
            if ($scope.single_arrlist.length == 0) {
                //数组无数据，不显示
                return;
            }
            //子程序行号显示
            var modal_mark_line = ~~(ndf_row - 1);
            $(".call_line").removeClass("file-selected");
            $(".call" + modal_mark_line).addClass("file-selected");
            //}
            //}
        } else if (ndf_layer == 0) {
            modal_close_flag = 1;
            $('modal-backdrop').remove();
            if (lineNumber != modal_main_line) {
                //当程序主行号变化时处理
                //显示主程序行号
                reallineNumber = lineNumber;
                modal_main_line = lineNumber;
                $(".line-config").removeClass("running");
                $(".line" + (reallineNumber - 1)).addClass("running");
            }
        }
    };

    // 运行示教程序时，运行到当前行，当前行背景色高亮
    $scope.lastCurrNum = -1;
    function scrollCurrentBar(currentNum) {
        if (document.getElementById('command-lines-list')) {
            // 滚动显示区域的高度
            const clientHeight = document.getElementById('command-lines-list').clientHeight;
            // 滚动显示内容每一行的高度(需要去除内外边距上方的距离) 
            const itemHieght = 44;
            // 滚动时，当前运行行高亮保持居中显示，开始滚动的行号
            const startScrollNum = Math.ceil((clientHeight / itemHieght) / 2);
            if (document.getElementsByClassName('running').length && currentNum + 1 > startScrollNum) {
                // 滚动条移动的距离 = itemHieght * (当前行-开始滚动的行号 + 1)     (需要加1的原因是后台返回的当前行是从0开始的)
                const scrollHieght = itemHieght * (currentNum - startScrollNum + 1);
                document.getElementById('command-lines-list').scrollTop = startScrollNum % 2 == 0 ? scrollHieght + 22 : scrollHieght;
            } else {
                document.getElementById('command-lines-list').scrollTop = 0;
            }
            $scope.lastCurrNum = currentNum;
        }
    }

    //接收显示高亮
    if (document.getElementById('programTeach')) {
        document.getElementById('programTeach').addEventListener('RL_Highlight', (e) => {
            // if ("Stopped" == $scope.programStatus) {
            //     document.dispatchEvent(new CustomEvent('No_Highlight', { bubbles: true, cancelable: true, composed: true }));
            // } else {
                $scope.commandSelected = null;
                $scope.currentRunningProgram = e.detail.currentRunningProgram;
                //$(".line-config").removeClass("selected");
                //$(".line-config").removeClass("shear");
                // 只有当编辑的文件名和当前运行程序名一致时，才进行程序运行行号高亮显示
                if ($scope.currentRunningProgram == $scope.editMode_FileName) {
                    markRunningLine(e.detail);
                    if ($scope.lastCurrNum != e.detail.line_number) {
                        scrollCurrentBar(e.detail.line_number);
                    }
                } else {
                    $(".line-config").removeClass("running");
                    $(".line-config").removeClass("selected");
                    $(".line-config").removeClass("shear");
                };
            // }
        });
    }

    if (document.getElementById('programTeach')) {
        document.getElementById('programTeach').addEventListener('No_Highlight', () => {
            $(".line-config").removeClass("running");
        });
    }

    //复制/剪切按键标志位
    $scope.CopyorShearFlag = 0;

    //复制按键功能函数
    $scope.CopyCommand = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[23]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if ($scope.indexSelected == null) {
            toastFactory.info(ptDynamicTags.info_messages[9]);
        } else if (2 == $scope.CopyorShearFlag) {
            toastFactory.info(ptDynamicTags.info_messages[10]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.CopyorShearFlag = 1;
            $scope.toolsDisabled = true;
            $scope.CopyCommandSelect = $scope.editMode_CommandsArr[$scope.indexSelected - 1];
            toastFactory.success(ptDynamicTags.success_messages[7]);
        }
    }

    //剪切按键功能函数
    $scope.ShearCommand = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[24]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if ($scope.indexSelected == null) {
            toastFactory.info(ptDynamicTags.info_messages[9]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.CopyorShearFlag = 2;
            $scope.toolsDisabled = true;
            $scope.indexSheared = $scope.indexSelected;
            let indexSheared = $scope.indexSheared - 1;
            $scope.ShearCommandSelect = $scope.editMode_CommandsArr[$scope.indexSelected - 1];
            $('.line-config').removeClass('shear');
            $('.line' + indexSheared).addClass('shear');
            toastFactory.success(ptDynamicTags.success_messages[8]);
        }
    }

    //粘贴按键功能函数
    $scope.PastCommand = function () {
        if ($scope.editMode_CommandsLevel == 1 || $scope.editMode_CommandsLevel == 2) {
            toastFactory.info(`${ptDynamicTags.error_messages[15]},${ptDynamicTags.encryption_messages[$scope.editMode_CommandsLevel]}`);
            return
        }
        if (null == $scope.commandSelected || "" == $scope.commandSelected || 0 == $scope.CopyorShearFlag) {
            toastFactory.warning(ptDynamicTags.warning_messages[6]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            if (2 == $scope.CopyorShearFlag) {
                $scope.editMode_CommandsArr.splice($scope.indexSheared - 1, 1);               //删除后一个元素，该处删除剪切选定的元素，需要减去1
                $scope.editMode_CommandsArr.splice($scope.indexSelected, 0, $scope.ShearCommandSelect);     //剪切掉一个元素，数组长度减去1
                updateFileDataforUpload($scope.editMode_CommandsArr);
                $scope.CopyorShearFlag = 0;
                $scope.toolsDisabled = false;
                $('.line-config').removeClass('shear');
                toastFactory.success(ptDynamicTags.success_messages[9]);
            } else if (1 == $scope.CopyorShearFlag) {
                $scope.editMode_CommandsArr.splice($scope.indexSelected, 0, $scope.CopyCommandSelect);
                updateFileDataforUpload($scope.editMode_CommandsArr);
                $scope.toolsDisabled = false;
                toastFactory.success(ptDynamicTags.success_messages[9]);
            } else {
                toastFactory.error(403, ptDynamicTags.error_messages[15]);
            }
        }
    }
    /* 命令行操作模块 */

    /* 程序数据处理模块 */
    function processFileData(program_value) {
        let program;
        program_value = addEnterMark(program_value);
        if (program_value !== "") {
            temparr = createCommandsArray(program_value);
            //处理NewDofile内容
            handleDofileArr(temparr);
        }
        program = program_value;
        return program;
    }

    function addEnterMark(data) {
        let pgv = data;
        if (pgv !== "" && pgv.substring(pgv.length - 1) !== "\n") {
            data += "\n";
        };
        return data;
    };

    //检测ID是否重复
    function checkNewDofileID(resultArr){
        for(let m=0;m<$scope.finallyNewDofileArr.length;m++){
            if($scope.finallyNewDofileArr[m][2] == resultArr[2]){
                if($scope.finallyNewDofileArr[m][0] == resultArr[0] && resultArr[1] == 2){

                }else if($scope.finallyNewDofileArr[m][1] != resultArr[1]){

                }else{
                    return resultArr[1];
                }
            }
        }
        return -1;
    }

    //处理程序中第一层NewDofile语句
    function handleDofileArr(programArr) {
        g_programErr = 0;//每次先置为0，程序无误
        g_programErrString = "";//每次先置为空，无报错信息
        $scope.finallyNewDofileArr = new Array();
        $scope.finallyNewDofileArr_index = 0;
        let mainProgramLength = programArr.length;
        for (let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult == -1) {
                //不处理
            } else if (handleresult == -2) {
                g_programErrString = (m + 1) + ptDynamicTags.info_messages[14];
                g_programErr = 1;
            } else {
                var NewDofileName = handleresult[0];
                if (null == $scope.userData[NewDofileName]) {
                    g_programErrString = (m + 1) + ptDynamicTags.info_messages[15];
                    g_programErr = 1;
                } else if ($scope.fileSelected == NewDofileName) {
                    g_programErrString = (m + 1) + ptDynamicTags.info_messages[16];
                    g_programErr = 1;
                } else {
                    let fileElement = $scope.userData[NewDofileName];
                    var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                    let tempLen = singleLine_NewDofile_Arr.length;
                    if (tempLen === 0) {
                        g_programErrString = (m + 1) + ptDynamicTags.info_messages[15];
                        g_programErr = 1;
                    } else {
                        if (handleresult[1] != 1) {
                            g_programErrString = (m + 1) + ptDynamicTags.info_messages[17];
                            g_programErr = 1;
                        } else {
                            var checkidreturn = checkNewDofileID(handleresult);
                            if (checkidreturn != -1 && $scope.finallyNewDofileArr_index != 0) {
                                g_programErrString = (m + 1) + ptDynamicTags.info_messages[18] + checkidreturn + ptDynamicTags.info_messages[19];
                                g_programErr = 1;
                            } else {
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index] = new Array();
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][0] = handleresult[0];
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][1] = handleresult[1];
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][2] = handleresult[2];
                                $scope.finallyNewDofileArr_index = $scope.finallyNewDofileArr_index + 1;
                                handleDofileArr_second(singleLine_NewDofile_Arr, fileElement, (m + 1));
                            }
                        }
                    }
                }
            }
        }
    }

    //处理程序中第二层NewDofile语句
    function handleDofileArr_second(programArr, lastfilename, n) {
        let mainProgramLength = programArr.length;
        for (let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult == -1) {
                //不处理
            } else if (handleresult == -2) {
                g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[14];
                g_programErr = 1;
            } else {
                var NewDofileName = handleresult[0];
                if (null == $scope.userData[NewDofileName]) {
                    g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[15];
                    g_programErr = 1;
                } else if (lastfilename == NewDofileName) {
                    g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[16];
                    g_programErr = 1;
                } else if ($scope.fileSelected == NewDofileName) {
                    g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[16];
                    g_programErr = 1;
                } else {
                    let fileElement = $scope.userData[NewDofileName];
                    var singleLine_NewDofile_Arr = createCommandsArray(fileElement.pgvalue);
                    let tempLen = singleLine_NewDofile_Arr.length;
                    if (tempLen === 0) {
                        g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[15];
                        g_programErr = 1;
                    } else {
                        if (handleresult[1] != 2) {
                            g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[21];
                            g_programErr = 1;
                        } else {
                            var checkidreturn = checkNewDofileID(handleresult);
                            if (checkidreturn != -1 && $scope.finallyNewDofileArr_index != 0) {
                                g_programErrString = n + ptDynamicTags.info_messages[20] + (m + 1) + ptDynamicTags.info_messages[18] + checkidreturn + ptDynamicTags.info_messages[19];
                                g_programErr = 1;
                            } else {
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index] = new Array();
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][0] = handleresult[0];
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][1] = handleresult[1];
                                $scope.finallyNewDofileArr[$scope.finallyNewDofileArr_index][2] = handleresult[2];
                                $scope.finallyNewDofileArr_index = $scope.finallyNewDofileArr_index + 1;
                                handleDofileArr_Third(singleLine_NewDofile_Arr, n, m + 1)
                            }
                        }
                    }
                }
            }
        }
    }

    //处理程序中第三层NewDofile语句
    function handleDofileArr_Third(programArr, j, k) {
        let mainProgramLength = programArr.length;
        for (let m = 0; m < mainProgramLength; m++) {
            //处理命令行
            var handleresult = handleDofileCommand(programArr[m]);
            if (handleresult == -1) {
                //不处理
            } else if (handleresult == -2) {
                g_programErrString = j + ptDynamicTags.info_messages[20] + k + ptDynamicTags.info_messages[22];
                g_programErr = 1;
            } else {
                g_programErrString = j + ptDynamicTags.info_messages[20] + k + ptDynamicTags.info_messages[22];
                g_programErr = 1;
            }
        }
    }

    //提取出单行命令NewDofile信息
    function handleDofileCommand(command) {
        command = command.trim();
        var dofile_index;
        if (g_systemFlag == 1) {
            dofile_index = command.indexOf("NewDofile(\"/usr/local/etc/controller/lua/");
        } else {
            dofile_index = command.indexOf("NewDofile(\"/fruser/");
        }
        if (dofile_index !== -1) {
            var resultArr = [];
            command = command.trim();
            var notes_flag = command.search(/--/i);
            if (notes_flag == -1) {
                //指令不含lua自带注释--
                tempString = command.trim();
                var lua_index = tempString.indexOf(".lua");
                if (lua_index !== -1) {
                    //分割提取文件名
                    var NewDofileName;
                    if (g_systemFlag == 1) {
                        NewDofileName = tempString.substring(dofile_index + 41, lua_index + 4).replace(/[\r\n]/g, "");//去掉回车换行
                    } else {
                        NewDofileName = tempString.substring(dofile_index + 19, lua_index + 4).replace(/[\r\n]/g, "");//去掉回车换行
                    }
                    //分割提取层数和行号
                    var length = tempString.length;
                    let dofileParaArr = tempString.substring(0, length - 1).replace(/[\r\n]/g, "").split(",");
                    var NewDofileLayer = dofileParaArr[1];
                    var NewDofileRow = dofileParaArr[2];
                    resultArr[0] = NewDofileName;
                    resultArr[1] = NewDofileLayer;
                    resultArr[2] = NewDofileRow;
                    return resultArr;
                } else {
                    return -2;
                }
            } else {
                //指令包含lua自带注释--
                if (notes_flag == 0) {
                    return -1;
                } else {
                    //如果--在指令后面面，需要处理
                    var luaindex = command.indexOf("--");
                    let tempString;
                    if (luaindex != -1) {
                        tempString = command.substring(0, luaindex);
                    }
                    tempString = tempString.trim();
                    var lua_index = tempString.indexOf(".lua");
                    if (lua_index !== -1) {
                        //分割提取文件名
                        var NewDofileName = tempString.substring(dofile_index + 19, lua_index + 4).replace(/[\r\n]/g, "");//去掉回车换行
                        //分割提取层数和行号
                        var length = tempString.length;
                        let dofileParaArr = tempString.substring(0, length - 1).replace(/[\r\n]/g, "").split(",");
                        var NewDofileLayer = dofileParaArr[1];
                        var NewDofileRow = dofileParaArr[2];
                        resultArr[0] = NewDofileName;
                        resultArr[1] = NewDofileLayer;
                        resultArr[2] = NewDofileRow;
                        return resultArr;
                    } else {
                        return -2;
                    }
                }
            }
        } else {
            return -1;
        }
    }

    $scope.manualSpeed = $scope.manualSpeed;
    $scope.autoSpeed = $scope.autoSpeed;
    // 选择点位初始化
    $scope.operation = {
        selectedPTP: null,
        selectedLin: null,
        selectedARC1: null,
        selectedARC2: null,
        selectedCircle1: null,
        selectedCircle2: null,
        selectedSpiral1: null,
        selectedSpiral2: null,
        selectedSpiral3: null,
        selectedNSpiral: null,
        selectedSPL: null,
        selectedSLIN: null,
        selectedSCIRC1: null,
        selectedSCIRC2: null,
        selectedSegStartPoint: null,
        selectedSegEndPoint: null,
        selectedEAxisPTP: null,
        selectedEAxisARCPoint1: null,
        selectedEAxisARCPoint2: null,
        selectedLTSearchDistP: null,
        selected3DsortPhotoPoint: null,
        selectedPalletPoint1: null,
        selectedPalletPoint2: null,
        selectedPalletPoint3: null,
        selectedDMP: null
    }
    // 添加命令按键触发弹出命令界面
    $scope.NewCommand = function (index) {
        if (!$scope.fileSelected) {
            toastFactory.info(ptDynamicTags.info_messages[13]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (($scope.controlMode != "1") && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            // 打开程序示教的添加程序界面
            $scope.fullContentView();
            viewFlag = 1;
            $scope.programAreaRight = true;
            $scope.chooseProgramView('add');
            // 指令选择跳转界面
            $scope.commandTypeIndex = index;
            // 程序示教添加程序时，所需基本数据的赋值
            initProgramAddData();
            $scope.updateoptions($scope.commandTypeIndex);
        }
    };

    // 删除上一次添加的程序
    $scope.deleteLastCommand = function() {
        if ($scope.showCommandIndexArr.length && $scope.addCommandIndexArr.length) {
            const lastShowIndex = $scope.showCommandIndexArr[$scope.showCommandIndexArr.length - 1];
            $scope.ReturnCommandArr.commandshow.splice(lastShowIndex, $scope.ReturnCommandArr.commandshow.length - lastShowIndex);
            $scope.showCommandIndexArr.pop();
            const lastAddIndex = $scope.addCommandIndexArr[$scope.addCommandIndexArr.length - 1];
            $scope.ReturnCommandArr.commandsadd = $scope.ReturnCommandArr.commandsadd.slice(0, lastAddIndex);
            $scope.addCommandIndexArr.pop();
            protectFlag = undefined;
            angleSpeedFlag = undefined;
        }
    }

    // 清空程序预览内容
    $scope.deleteAllCommand = function() {
        $scope.ReturnCommandArr.commandshow = [];
        $scope.ReturnCommandArr.commandsadd = '';
        $scope.showCommandIndexArr = [];
        $scope.addCommandIndexArr = [];
        protectFlag = undefined;
        angleSpeedFlag = undefined;
    }

    // 应用添加的所有指令
    $scope.addCommand = function () {
        if ($scope.controlMode == "0") {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            if ($scope.ReturnCommandArr.commandsadd != JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr)).commandsadd) {
                if ($scope.indexSelected == null) {
                    $scope.editMode_CommandsArr = $scope.editMode_CommandsArr.concat($scope.ReturnCommandArr.commandshow);
                } else {
                    for (var i = 0; i < $scope.ReturnCommandArr.commandshow.length; i++) {
                        $scope.editMode_CommandsArr.splice($scope.indexSelected + i, 0, $scope.ReturnCommandArr.commandshow[i]);
                    }
                }
                updateFileDataforUpload($scope.editMode_CommandsArr);
                let tempFileData = commandsArray2String($scope.ReturnCommandArr.commandshow);
                if($scope.showCommandsText == true){
                    editor.insert("\n"+tempFileData);
                }
                commandsArray2String($scope.editMode_CommandsArr);
                $scope.ReturnCommandArr = JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr));
                $scope.showCommandIndexArr = [];
                $scope.addCommandIndexArr = [];
                protectFlag = undefined;
                angleSpeedFlag = undefined;
            } else {
                toastFactory.info(ptDynamicTags.info_messages[255]);
            }
        }
    }

    /* 指令选择跳转界面 */
    $scope.updateoptions = function (option) {
        $scope.selectedOffsetType = 1;
        $scope.moveDoMode = 0;
        $scope.selectedGradeMode = 0;
        $scope.eaxisCommandType = 1;
        $scope.selectedWeldIOType = 0;
        $scope.weldTraceType = 'UD';
        // 逻辑
        $scope.show_While = false;
        $scope.show_if_else = false;
        $scope.show_waittime = false;
        $scope.show_waitDI = false;
        $scope.show_waitMultiDI = false;
        $scope.show_waitAI = false;
        $scope.show_Pause = false;
        $scope.show_Var = false;
        $scope.show_goto = false;
        $scope.show_dofile = false;
        // 运动
        $scope.show_PTP = false;
        $scope.show_Lin = false;
        $scope.show_joint_overspeed = false;
        $scope.show_angle_speed = false;
        $scope.show_ARC = false;
        $scope.show_Circle = false;
        $scope.show_Spiral = false;
        $scope.show_N_Spiral = false;
        $scope.show_HSpiral = false;
        $scope.show_Spline = false;
        $scope.show_Spline_Main = false;
        $scope.show_Spline_SPL = false;
        $scope.show_Spline_SLIN = false;
        $scope.show_Spline_SCIRC = false;
        $scope.show_New_Spline = false;
        $scope.show_New_Spline_Main = false;
        $scope.show_New_Spline_SPL = false;
        $scope.show_Weave = false;
        $scope.show_Weave_Test = false;
        $scope.show_Weave_Set = false;
        $scope.show_TPD = false;
        $scope.show_load_TPD = false;
        $scope.show_move_TPD = false;
        $scope.show_Offset = false;
        $scope.show_Traj = false;
        $scope.show_TrajJ = false;
        $scope.show_ServoC = false;
        $scope.show_DMP = false;
        $scope.show_WPTrsf = false;
        $scope.show_ToolTrsf = false;
        // 控制
        $scope.show_SetIO = false;
        $scope.show_SetDO = false;
        $scope.show_SetDI = false;
        $scope.show_SetAO = false;
        $scope.show_AO = false;
        $scope.show_AI = false;
        $scope.show_Vir = false;
        $scope.show_Set_Vir_DI = false;
        $scope.show_Set_Vir_AI = false;
        $scope.show_Get_Vir_DI = false;
        $scope.show_Get_Vir_AI = false;
        $scope.show_AuxIO = false;
        $scope.show_Aux_IO_Main = false;
        $scope.show_Aux_Set_DO = false;
        $scope.show_Aux_Set_AO = false;
        $scope.show_Aux_Wait_DI = false;
        $scope.show_Aux_Wait_AI = false;
        $scope.show_Aux_Get_DI = false;
        $scope.show_Aux_Get_AI = false;
        $scope.show_MoveDO = false;
        $scope.show_MoveAO = false;
        $scope.show_ToolList = false;
        $scope.show_tool = false;
        $scope.show_wobj = false;
        $scope.show_Mode = false;
        $scope.show_Collision = false;
        $scope.show_Acc = false;
        // 外设
        $scope.show_Gripper = false;
        $scope.show_Gripper_move = false;
        $scope.show_Spray = false;
        $scope.show_EAxis = false;
        $scope.show_EAxis_Move = false;
        $scope.show_EAxis_Homing = false;
        $scope.show_EAxis_ServoOn = false;
        $scope.show_auxServo_id = false;
        $scope.show_auxServo_mode = false;
        $scope.show_auxServo_pos = false;
        $scope.show_auxServo_traget_speed = false;
        // $scope.show_auxServo_target_Torque = false;
        $scope.show_auxServo_zero_control = false;
        $scope.show_Conveyor = false;
        $scope.show_Conveyor_IODetect = false;
        $scope.show_Conveyor_PositionDetect = false;
        $scope.show_Conveyor_TrackStart = false;
        $scope.show_Polish = false;
        $scope.show_Polish_vel = false;
        $scope.show_Polish_force = false;
        $scope.show_Polish_pos = false;
        $scope.show_Polish_mode = false;
        $scope.show_touch_force = false;
        $scope.show_torque_time = false;
        $scope.show_piece_weight = false;
        // 焊接
        $scope.show_Weld = false;
        $scope.show_Weld_current = false;
        $scope.show_Weld_volage = false;
        $scope.show_Weld_ARC = false;
        $scope.show_Segment = false;
        $scope.show_Laser = false;
        $scope.show_Laser_Track = false;
        $scope.show_Laser_Record = false;
        $scope.show_Laser_Recurrent = false;
        $scope.show_Recurrent = false;
        $scope.show_Weld_Trace = false;
        $scope.show_Wire_Search = false;
        $scope.show_Wire_Search_Main = false;
        $scope.show_Wire_Search_Point = false;
        $scope.show_Adjust = false;
        // 力控
        $scope.show_FT = false;
        $scope.show_FT_Main = false;
        $scope.show_FT_Guard = false;
        $scope.show_FT_Control = false;
        $scope.show_FT_Spiral = false;
        $scope.show_FT_Rot = false;
        $scope.show_FT_Lin = false;
        $scope.show_FT_Find_Surface = false;
        $scope.show_FT_Cal_Center = false;
        $scope.show_FT_Compliance = false;
        $scope.show_Torque = false;
        // 3D
        $scope.show_3D = false;
        // 码垛
        $scope.show_pallet = false;
        // 通讯
        $scope.show_Modbus = false;
        $scope.show_Modbus_Master = false;
        $scope.show_Modbus_Slave = false;
        $scope.show_Modbus_Rtu = false;
        $scope.show_Modbus_Tcp = false;
        $scope.show_Xmlrpc = false;
        // 辅助
        $scope.show_Thread = false;
        $scope.show_Function = false;
        $scope.show_PTMode = false;
        $scope.show_FFollow = false;
        // 自定义
        $scope.show_Custom_Edit = false;

        switch (option) {
            case 0:
                $scope._Command_Title = "PTP";
                $scope.show_PTP = true;
                break;
            case 1:
                $scope._Command_Title = "Lin";
                $scope.show_Lin = true;
                $scope.disProgDebugSpeed($scope.operation.selectedLin.speed, 100);
                break;
            case 2:
                $scope._Command_Title = "ARC";
                $scope.show_ARC = true;
                break;
            case 3:
                $scope._Command_Title = "Circle";
                $scope.show_Circle = true;
                break;
            case 4:
                $scope._Command_Title = "Spiral";
                $scope.show_Spiral = true;
                break;
            case 5:
                $scope._Command_Title = "N-Spiral";
                $scope.show_N_Spiral = true;
                break;
            case 6:
                $scope._Command_Title = "Spline";
                $scope.show_Spline = true;
                $scope.show_Spline_Main = true;
                break;
            case 7:
                $scope._Command_Title = "N-Spline";
                $scope.show_New_Spline = true;
                $scope.show_New_Spline_Main = true;
                break;
            case 8:
                $scope._Command_Title = "Digital-IO";
                getDOcfg();
                getIOAliasData();
                $scope.show_SetIO = true;
                break;
            case 9:
                $scope._Command_Title = "Analog-IO";
                getIOAliasData();
                $scope.show_SetAO = true;
                break;
            case 10:
                $scope._Command_Title = "TPD";
                getTPDName();
                $scope.show_TPD = true;
                break;
            case 11:
                $scope._Command_Title = "ToolList";
                $scope.show_ToolList = true;
                break;
            case 12:
                $scope._Command_Title = "Mode";
                $scope.show_Mode = true;
                break;
            case 13:
                $scope._Command_Title = "Variable";
                $scope.show_Var = true;
                getSysVarList();
                break;
            case 14:
                $scope._Command_Title = "While";
                $scope.show_While = true;
                $scope.whileType = '0';
                $scope.whileVariable = 'loop1';
                $scope.whileTimes = '10';
                break;
            case 15:
                $scope._Command_Title = "if-else";
                // 重新打开if else程序指令界面时，清空上一次的数据
                $scope.hasElse = false;
                $scope.hasElseIf = false;
                $scope.elseIndexArr = [];
                $scope.ifData = '';
                if ($scope.hasElseIf) {
                    $scope.elseIndexArr.forEach(item => {
                        $scope[`if${item}Data`] = '';
                    })
                }
                const ifElseList = document.querySelector('#if-else-content ul');
                const ifElseLiList = Array.from(document.querySelectorAll('#if-else-content ul li'));
                if (ifElseLiList.length > 1) {
                    ifElseLiList.forEach((item, index) => {
                        if (index > 0) {
                            ifElseList.removeChild(item);
                        }
                    })
                }
                $scope.show_if_else = true;
                break;
            case 16:
                $scope._Command_Title = "Goto";
                $scope.show_goto = true;
                break;
            case 17:
                $scope._Command_Title = "Wait";
                getIOAliasData();
                $scope.show_waittime = true;
                break;
            case 18:
                $scope._Command_Title = "Pasue";
                $scope.show_Pause = true;
                break;
            case 19:
                $scope._Command_Title = "Dofile";
                $scope.show_dofile = true;
                break;
            case 20:
                $scope._Command_Title = "Weave";
                $scope.show_Weave = true;
                $scope.show_Weave_Set = true;
                getWeavecfg();
                break;
            case 21:
                $scope._Command_Title = "Segment";
                $scope.show_Segment = true;
                break;
            case 22:
                if ($scope.optionsData.hasOwnProperty("PosA") && $scope.optionsData.hasOwnProperty("PosB") && $scope.optionsData.hasOwnProperty("PosC")) {
                } else {
                    toastFactory.info(ptDynamicTags.info_messages[85]);
                    return;
                }
                $scope._Command_Title = "Adjust";
                $scope.show_Adjust = true;
                break;
            case 23:
                $scope._Command_Title = "Gripper";
                $scope.show_Gripper = true;
                break;
            case 24:
                $scope._Command_Title = "Spray";
                getDOcfg();
                $scope.show_Spray = true;
                break;
            case 25:
                $scope._Command_Title = "EAxis";
                $scope.show_EAxis = true;
                break;
            case 26:
                $scope._Command_Title = "Weld";
                $scope.show_Weld = true;
                break;
            case 27:
                $scope._Command_Title = "Laser";
                $scope.show_Laser = true;
                break;
            case 28:
                $scope._Command_Title = "LT-Rec";
                $scope.show_Laser_Recurrent = true;
                break;
            case 29:
                $scope._Command_Title = "Conveyor";
                $scope.show_Conveyor = true;
                break;
            case 30:
                $scope._Command_Title = "F/T";
                $scope.show_FT = true;
                $scope.show_FT_Main = true;
                break;
            case 31:
                $scope._Command_Title = "3D";
                $scope.show_3D = true;
                break;
            case 32:
                $scope._Command_Title = "Pallet";
                $scope.show_pallet = true;
                break;
            case 33:
                $scope._Command_Title = "Offset";
                $scope.show_Offset = true;
                break;
            case 34:
                $scope._Command_Title = "W-Search";
                $scope.show_Wire_Search_Main = true;
                $scope.show_Wire_Search = true;
                break;
            case 35:
                $scope._Command_Title = "Virtual-IO";
                $scope.show_Vir = true;
                break;
            case 36:
                $scope._Command_Title = "Aux-Thread";
                $scope.show_Thread = true;
                break;
            case 37:
                $scope._Command_Title = "ServoCart";
                $scope.show_ServoC = true;
                break;
            case 38:
                $scope._Command_Title = "Modbus";
                $scope.show_Modbus = true;
                $scope.show_Modbus_Tcp = true;
                $scope.show_Modbus_Master = true;
                getModbusMasterConfig();
                getModbusSlaveAliasConfig();
                $("#modbusMaster").prop("checked", true);
                $("#modbusTcp").prop("checked", true);
                break;
            case 39:
                $scope._Command_Title = "Function";
                $scope.show_Function = true;
                break;
            case 40:
                $scope._Command_Title = "Collision";
                $scope.show_Collision = true;
                break;
            case 41:
                $scope._Command_Title = "Xmlrpc";
                $scope.show_Xmlrpc = true;
                break;
            case 42:
                $scope._Command_Title = "DMP";
                $scope.show_DMP = true;
                break;
            case 43:
                $scope._Command_Title = "Acc";
                $scope.show_Acc = true;
                break;
            case 44:
                $scope._Command_Title = "Torque";
                $scope.show_Torque = true;
                break;
            case 45:
                $scope._Command_Title = "Aux-IO";
                $scope.show_AuxIO = true;
                $scope.show_Aux_IO_Main = true;
                break;
            case 46:
                $scope._Command_Title = "Weld-Trc";
                $scope.show_Weld_Trace = true;
                break;
            case 47:
                $scope._Command_Title = "Trajectory";
                $scope.show_Traj = true;
                break;
            case 48:
                $scope._Command_Title = "TrajectoryJ";
                $scope.show_TrajJ = true;
                break;
            case 49:
                $scope._Command_Title = "WPTrsf";
                $scope.show_WPTrsf = true;
                break;
            case 50:
                $scope._Command_Title = "MoveDO";
                $scope.show_MoveDO = true;
                break;
            case 51:
                $scope._Command_Title = "Polish";
                $scope.show_Polish = true;
                break;
            case 52:
                $scope._Command_Title = "ToolTrsf";
                $scope.show_ToolTrsf = true;
                break;
            case 53:
                $scope._Command_Title = "PT-Mode";
                $scope.show_PTMode = true;
                getPointTableModeList();
                break;
            case 54:
                $scope._Command_Title = "H-Spiral";
                $scope.show_HSpiral = true;
                break;
            case 55:
                $scope._Command_Title = "F_Follow";
                $scope.show_FFollow = true;
                $scope.focusNumberChange(3); //初始从第一个焦点跟随点
                getRobotFocusPointdata();
                break;
            case 56:
                $scope._Command_Title = "MoveAO";
                $scope.show_MoveAO = true;
                break;
            default:
        }
        $(document).ready(function() {
            displayProgramPointInfo();
        })
    };

    // 程序编程添加时，记录添加前的数据，以便删除上次添加的数据
    $scope.handleCommandIndex = function() {
        if ($scope.programAreaRightType == 'add') {
            $scope.showCommandIndexArr.push($scope.ReturnCommandArr.commandshow.length);
            $scope.addCommandIndexArr.push($scope.ReturnCommandArr.commandsadd.length);
        }
    }

    /* 设置点位信息弹出窗 */
    function displayProgramPointInfo() {
        var eyeDom = document.querySelectorAll('.program-dropdowm a');
        eyeDom.forEach(item => {
            // 移入显示
            item.addEventListener('mouseover', function(e) {
                $(this).parent().find('.program-point-details').css('display', 'block');
                $(this).parent().find('.program-point-details').css('left', e.clientX);
            })
            // 移除消失
            item.addEventListener('mouseout', function(e) {
                $(this).parent().find('.program-point-details').css('display', 'none');
            })
            item.addEventListener('touchstart', function(e) {
                $(this).parent().find('.program-point-details').css('display', 'block');
                $(this).parent().find('.program-point-details').css('left', e.clientX);
            })
            // 移除消失
            item.addEventListener('touchend', function(e) {
                $(this).parent().find('.program-point-details').css('display', 'none');
            })
        })
    }
    /* ./设置点位信息弹出窗 */

    // 更新上传文件数据变量
    function updateFileDataforUpload(arr) {
        let tempFileData = commandsArray2String(arr);
        g_fileDataForUpload = processFileData(tempFileData);
        $scope.editMode_CommandsText = tempFileData;//编辑模式无需转换注释内容
    };
    /* 程序数据处理模块 */


    /* 编辑模式处理 */
    // 编辑模式初始化
    $scope.showCommandsList = true;
    $scope.showCommandsText = false;
    // 程序编辑模式切换
    $scope.switchProgramEditMode = function () {
        if ($scope.editMode_CommandsLevel == 1) {
            toastFactory.info(`${ptDynamicTags.error_messages[27]},${ptDynamicTags.encryption_messages[1]}`);
            return
        }
        if (!$scope.fileSelected) {
            toastFactory.info(ptDynamicTags.info_messages[13]);
        } else if ($scope.programStatus != "Stopped") {
            toastFactory.info(ptDynamicTags.info_messages[6]);
        } else if (("1" != $scope.controlMode) && $scope.debug_flag) {
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else {
            $scope.showCommandsList = !$scope.showCommandsList;
            $scope.showCommandsText = !$scope.showCommandsText;
            updateEditorFile();
        }
    };

    // 当编辑文本内容改变时执行editCommandsText
    $scope.editCommandsText = function () {
        if(("1" != $scope.controlMode)&&$scope.debug_flag){
            $scope.editMode_CommandsText = commandsArray2String($scope.editMode_CommandsArr);
            toastFactory.warning(ptDynamicTags.warning_messages[0]);
        } else{
            $scope.editMode_CommandsArr = createCommandsArray($scope.editMode_CommandsText);
            updateFileDataforUpload($scope.editMode_CommandsArr);
        }
    }

    /* 编辑模式处理 */

    /* Smart Tool */
    let smartDOflag = 0;
    let smartArcFlag = 0;
    let smartArcFirstFlag = true;
    let smartArcWayPoint = "";
    let smartNumPush = []; // 记录上次添加程序的数量，当数量不为1时，撤销操作需要将上次添加的程序数量全部删除。
    document.getElementById('programTeach').addEventListener('smarttoolsingle', e => {
        console.log(e.detail);
        if(e.detail.function == 10){
            //撤销上一步操作
            smartArcFirstFlag = true;
            if (smartNumPush.length) {
                $scope.editMode_CommandsArr.pop();
            } else {
                const lastNum = smartNumPush[smartNumPush.length - 1];
                if (lastNum > 1) {
                    $scope.editMode_CommandsArr.slice(0, $scope.editMode_CommandsArr.length - lastNum);
                } else {
                    $scope.editMode_CommandsArr.pop();
                }
                smartNumPush.pop();
            }
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            toastFactory.success(ptDynamicTags.success_messages[10]);
        }else if(e.detail.function == 11){
            //清空程序
            smartArcFirstFlag = true;
            $scope.editMode_CommandsArr = [];
            smartNumPush = [];
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            // ARC功能失效
            smartArcFlag = 0;
            smartArcWayPoint = "";
            toastFactory.success(ptDynamicTags.success_messages[11]);
        }else if(e.detail.function == 0){
            //PTP操作
            smartArcFirstFlag = true;
            smartNumPush.push(1);
            $scope.editMode_CommandsArr.push("PTP(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0)");
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            // 激活ARC功能，保存路径点名称
            smartArcFlag = 1;
            smartArcWayPoint = "smartPointP" + e.detail.index;
            toastFactory.success(ptDynamicTags.success_messages[12]);
        }else if(e.detail.function == 1){
            //LIN操作
            smartArcFirstFlag = true;
            smartNumPush.push(1);
            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            // 激活ARC功能，保存路径点名称
            smartArcFlag = 1;
            smartArcWayPoint = "smartPointP" + e.detail.index;
            toastFactory.success(ptDynamicTags.success_messages[13]);
        }else if(e.detail.function == 2){
            //ARC操作
            if(smartArcFlag){
                if (smartArcFirstFlag) {
                    smartArcFirstFlag = false;
                    smartArcWayPoint = "smartPointP" + e.detail.index;
                    toastFactory.info(ptDynamicTags.info_messages[221]);
                } else {
                    smartNumPush.push(1);
                    $scope.editMode_CommandsArr.push("ARC(" + smartArcWayPoint + ",0,0,0,0,0,0,0,smartPointP" + e.detail.index + ",0,0,0,0,0,0,0," + e.detail.speed + ",0)");
                    smartArcWayPoint = "smartPointP" + e.detail.index;
                    updateFileDataforUpload($scope.editMode_CommandsArr);
                    $scope.saveModifyCommands();
                    smartArcFirstFlag = true;
                    toastFactory.success(ptDynamicTags.success_messages[15]);
                }
                
            } else {
                toastFactory.info(ptDynamicTags.info_messages[110]);
            }
        }else if(e.detail.function == 3){
            //新建程序操作
            // 发送新建的文件到后台
            smartArcFirstFlag = true;
            $scope.editMode_CommandsArr = [];
            smartNumPush = [];
            updateFileDataforUpload($scope.editMode_CommandsArr);
            let newFileName = "SmartTool"+ e.detail.index + ".lua";
            let checkCmd = {
                cmd: "check_lua_file",
                data: {
                    name: newFileName,
                    type: '1'
                },
            };
            dataFactory.getData(checkCmd).then((data) => {
                switch (data.same_name) {
                    case '0':
                        if ($scope.programStatus != "Stopped") {
                            toastFactory.info(ptDynamicTags.info_messages[6]);
                        } else {
                            $scope.currentFileEdit_flag = 0;//新建文件编辑状态置0
                            $scope.program_value = "";
                            let saveCmd = {
                                cmd: "save_lua_file",
                                data: {
                                    name: newFileName,
                                    pgvalue: $scope.program_value,
                                    type: '1'
                                },
                            };
                            // update $scope.userData  新建文件之后更新文件
                            dataFactory.actData(saveCmd).then(() => {
                                let getCmd = {
                                    cmd: "get_user_data",
                                    data: {
                                        type: '1'
                                    }
                                };
                                dataFactory.getData(getCmd)
                                    .then(function (data) {
                                        $scope.userData = data;
                                        toastFactory.success(ptDynamicTags.success_messages[0] + newFileName);
        
                                        $scope.fileSelected = newFileName;
                                        g_fileNameForUpload = newFileName;
                                        g_fileDataForUpload = $scope.program_value;
        
                                        $scope.editMode_FileName = newFileName;
                                        $scope.editMode_CommandsText = $scope.program_value;
                                        $scope.editMode_CommandsLevel = $scope.userData[$scope.program_value].level;
                                        $scope.indexSelected = null;
                                        $scope.editMode_CommandsArr = createCommandsArray($scope.program_value);
                                        setLocalStorage();
                                        updateEditorFile();
                                        getProgramAreaRightData($scope.programAreaRightType);
                                        // ARC功能失效
                                        smartArcFlag = 0;
                                        smartArcWayPoint = "";
                                    }, (status) => {
                                        toastFactory.error(status, ptDynamicTags.error_messages[5]);
                                    });
                            }, (status) => {
                                toastFactory.error(status, ptDynamicTags.error_messages[6]);
                            });
                        };
                        break;
                    case '1':
                        toastFactory.info(ptDynamicTags.info_messages[4]);
                        break;
                    case '2':
                        toastFactory.warning(ptDynamicTags.warning_messages[14] + ptDynamicTags.warning_messages[16]);
                        break;
                    case '3':
                        toastFactory.warning(ptDynamicTags.warning_messages[15] + ptDynamicTags.warning_messages[16]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[42]);
            });
        }else if(e.detail.function == 4){
            //保存程序操作
            smartArcFirstFlag = true;
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveCommands();
        }else if(e.detail.function == 5){
            //摆焊开始操作
            smartArcFirstFlag = true;
            smartNumPush.push(1);
            $scope.editMode_CommandsArr.push("WeaveStart(0)");
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            toastFactory.success(ptDynamicTags.success_messages[16]);
        }else if(e.detail.function == 6){
            //摆焊结束操作
            smartArcFirstFlag = true;
            smartNumPush.push(1);
            $scope.editMode_CommandsArr.push("WeaveEnd(0)");
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            toastFactory.success(ptDynamicTags.success_messages[17]);
        }else if(e.detail.function == 7){
            // IO键操作
            // auxId——IO键配置编号：DO0~DO7对应0-7、CO0~CO7对应8—15、EndDO0为16、EndDO1为17、扩展IO为大于18
            // type——焊接选择：-1对应无、0对应焊接、1对应LIN + 焊接、2对应LIN + 焊接 + 摆动
            // speed——点速度（焊接选择为“LIN + 焊接”或“LIN + 焊接 + 摆动”需要配置点速度）
            smartArcFirstFlag = true;
            if (smartDOflag == 0) {
                if (e.detail.auxId < 8) {
                    // DO0~DO7
                    smartNumPush.push(1);
                    $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",1,0,0)");
                } else if (e.detail.auxId > 7 && e.detail.auxId < 16) {
                    // CO0~CO7
                    if ($scope.ctrlDOArr[e.detail.auxId - 8] == 6) {
                        // CO0~CO7配置起弧
                        if (e.detail.type == -1) {
                            // 焊接选择-无
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",1,0,0)");
                        } else if (e.detail.type == 0) {
                            // 焊接选择-焊接
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("ARCStart(0,0,10000)");
                        } else if (e.detail.type == 1) {
                            // 焊接选择-LIN + 焊接
                            smartNumPush.push(2);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCStart(0,0,10000)");
                        } else if (e.detail.type == 2) {
                            // 焊接选择-LIN + 焊接 + 摆动
                            smartNumPush.push(3);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCStart(0,0,10000)");
                            $scope.editMode_CommandsArr.push("WeaveStart(0)");
                        }
                    } else {
                        // CO0~CO7未配置起弧
                        smartNumPush.push(1);
                        $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",1,0,0)");
                    }
                } else if (e.detail.auxId == 16 || e.detail.auxId == 17) {
                    // End-DO0、End—DO1
                    smartNumPush.push(1);
                    $scope.editMode_CommandsArr.push("SetToolDO(" + (e.detail.auxId - 16) + ",1,0,0)");
                } else {
                    // 扩展DO
                    if (e.detail.auxId - 18 == $scope.extArcstart) {
                        // 扩展DO配置焊机起弧
                        if (e.detail.type == -1) {
                            // 焊接选择-无
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("SetAuxDO(" + (e.detail.auxId - 18) + ",1,0,0)");
                        } else if (e.detail.type == 0) {  
                            // 焊接选择-焊接
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("ARCStart(1,0,10000)");
                        } else if (e.detail.type == 1) {
                            // 焊接选择-LIN + 焊接
                            smartNumPush.push(2);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCStart(1,0,10000)");
                        } else if (e.detail.type == 2) {
                            // 焊接选择-LIN + 焊接 + 摆动
                            smartNumPush.push(3);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCStart(1,0,10000)");
                            $scope.editMode_CommandsArr.push("WeaveStart(0)");
                        }
                    } else {
                        // 扩展DO未配置焊机起弧
                        smartNumPush.push(1);
                        $scope.editMode_CommandsArr.push("SetAuxDO(" + (e.detail.auxId - 18) + ",1,0,0)");
                    }
                }
                smartDOflag = 1;
            } else {
                if (e.detail.auxId < 8) {
                    // DO0~DO7
                    smartNumPush.push(1);
                    $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",0,0,0)");
                } else if (e.detail.auxId > 7 && e.detail.auxId < 16) {
                    // CO0~CO7
                    if ($scope.ctrlDOArr[e.detail.auxId - 8] == 6) {
                        // CO0~CO7配置起弧
                        if (e.detail.type == -1) {
                            // 焊接选择-无
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",0,0,0)");
                        } else if (e.detail.type == 0) {
                            // 焊接选择-焊接
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("ARCEnd(0,0,10000)");
                        } else if (e.detail.type == 1) {
                            // 焊接选择-LIN + 焊接
                            smartNumPush.push(2);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCEnd(0,0,10000)");
                        } else if (e.detail.type == 2) {
                            // 焊接选择-LIN + 焊接 + 摆动
                            smartNumPush.push(3);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCEnd(0,0,10000)");
                            $scope.editMode_CommandsArr.push("WeaveEnd(0)");
                        }
                    } else {
                        // CO0~CO7未配置起弧
                        smartNumPush.push(1);
                        $scope.editMode_CommandsArr.push("SetDO(" + e.detail.auxId + ",0,0,0)");
                    }
                } else if (e.detail.auxId == 16 || e.detail.auxId == 17) {
                    smartNumPush.push(1);
                    $scope.editMode_CommandsArr.push("SetToolDO(" + (e.detail.auxId - 16) + ",0,0,0)");
                } else {
                    // 扩展DO
                    if (e.detail.auxId - 18 == $scope.extArcstart) {
                        // 扩展DO配置焊机起弧
                        if (e.detail.type == -1) {
                            // 焊接选择-无
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("SetAuxDO(" + (e.detail.auxId - 18) + ",0,0,0)");
                        } else if (e.detail.type == 0) {
                            // 焊接选择-焊接
                            smartNumPush.push(1);
                            $scope.editMode_CommandsArr.push("ARCEnd(1,0,10000)");
                        } else if (e.detail.type == 1) {
                            // 焊接选择-LIN + 焊接
                            smartNumPush.push(2);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCEnd(1,0,10000)");
                        } else if (e.detail.type == 2) {
                            // 焊接选择-LIN + 焊接 + 摆动
                            smartNumPush.push(3);
                            $scope.editMode_CommandsArr.push("Lin(smartPointP" + e.detail.index + "," + e.detail.speed + ",-1,0,0)");
                            $scope.editMode_CommandsArr.push("ARCEnd(1,0,10000)");
                            $scope.editMode_CommandsArr.push("WeaveEnd(0)");
                        }
                    } else {
                        // 扩展DO未配置焊机起弧
                        smartNumPush.push(1);
                        $scope.editMode_CommandsArr.push("SetAuxDO(" + (e.detail.auxId - 18) + ",0,0,0)");
                    }
                }
                smartDOflag = 0;
            } 
            setAxleExtDO(smartDOflag);
            updateFileDataforUpload($scope.editMode_CommandsArr);
            $scope.saveModifyCommands();
            toastFactory.success(ptDynamicTags.success_messages[18]);
        }
    });

    //设置扩展IO设备灯亮
    function setAxleExtDO(index) {
        var setAxleExtDOString = "SetAxleExtDO("+index+")";
        let setAxleExtDOCmd = {
            cmd: 678,
            data: {
                content: setAxleExtDOString,
            },
        };
        dataFactory.setData(setAxleExtDOCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[46]);
            });
    };

    /* Smart Tool */

    /* Enter键绑定 */
    $(function () {
        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                if ($("#btn_saveas").is(":visible")) {
                    $("#btn_saveas").click();
                } else if ($("#btn_delete").is(":visible")) {
                    $("#btn_delete").click();
                } else if ($("#btn_submit").is(":visible")) {
                    $("#btn_submit").click();
                } else if ($("#btn_save").is(":visible")) {
                    $("#btn_save").click();
                } else if ($("#btn_openUserFile").is(":visible")) {
                    $("#btn_openUserFile").click();
                }
            }
        });
    })
    /* Enter键绑定 */

    /* 获取指令参数相关数据, 初始化 */
    // 语言包数据初始化
    $scope._Command_Title = ptDynamicTags.info_messages[23];
    $scope.ReturnCommandArr = JSON.parse(JSON.stringify(ptDynamicTags.var_object.ReturnCommandArr));
    // 按键选择的命令初始化
    $scope.commandSelected = "";
    // 包含的命令
    $scope.options = [
        { name: "PTP", value: 0 },
        { name: "Lin", value: 1 },
        { name: "ARC", value: 2 },
        { name: "IO", value: 3 },
        { name: "While", value: 4 },
        { name: "if_else", value: 5 },
        { name: "Wait", value: 6 },
        { name: "AI", value: 7 },
        { name: "CALL", value: 8 },
        { name: "TPD", value: 9 },
        { name: "Gripper", value: 10 },
        { name: "ToolList", value: 11 },
        { name: "Spray", value: 12 },
        { name: "Weave", value: 13 },
        { name: "Laser", value: 14 },
        { name: "EAxis", value: 15 }
    ];
    // 命令界面变量初始化赋值
    $scope._Program_Teach_Operation = "Program Teach Operation";
    $scope._Options = "Options";
    // ARC、Circle起始点运动方式
    $scope.moveStartData = [
        {
            id: "0",
            name: "PTP"
        },
        {
            id: "1",
            name: "Lin"
        }
    ];
    // IO阻塞
    $scope.IOBlockData = langJsonData.commandlist.IOBlockData;
    // TPD位姿类型
    $scope.setTPDLocation = langJsonData.commandlist.setTPDLocation;
    // WaitDI
    $scope.WhetherMotion = langJsonData.commandlist.WhetherMotion;
    // Pause指令
    $scope.PauseFunctionList = langJsonData.commandlist.PauseFunction;
    // SetIO端口号
    $scope.DoData = langJsonData.commandlist.DoData;
    // SetIO状态
    $scope.IOState = langJsonData.commandlist.IOState;
    // SetIO模式
    $scope.setIOMode = langJsonData.commandlist.setIOMode;
    // GetIO端口号
    $scope.DinData = langJsonData.commandlist.DinData;
    // SetAO端口号
    $scope.AOport = langJsonData.commandlist.AOport;
    // GetAI端口号
    $scope.AIport = langJsonData.commandlist.AIport;
    // VirIO指令
    $scope.VirDinData = langJsonData.commandlist.VirDinData;
    $scope.VirAinData = langJsonData.commandlist.VirAinData;
    // SetAuxIO端口号
    $scope.AuxDoData = [
        {
            "name":"Aux-DO-0",
            "num":"0"
        },
        {
            "name":"Aux-DO-1",
            "num":"1"
        },
        {
            "name":"Aux-DO-2",
            "num":"2"
        },
        {
            "name":"Aux-DO-3",
            "num":"3"
        },
        {
            "name":"Aux-DO-4",
            "num":"4"
        },
        {
            "name":"Aux-DO-5",
            "num":"5"
        },
        {
            "name":"Aux-DO-6",
            "num":"6"
        },
        {
            "name":"Aux-DO-7",
            "num":"7"
        },
        {
            "name":"Aux-DO-8",
            "num":"8"
        },
        {
            "name":"Aux-DO-9",
            "num":"9"
        },
        {
            "name":"Aux-DO-10",
            "num":"10"
        },
        {
            "name":"Aux-DO-11",
            "num":"11"
        },
        {
            "name":"Aux-DO-12",
            "num":"12"
        },
        {
            "name":"Aux-DO-13",
            "num":"13"
        },
        {
            "name":"Aux-DO-14",
            "num":"14"
        },
        {
            "name":"Aux-DO-15",
            "num":"15"
        },
        {
            "name":"Aux-DO-16",
            "num":"16"
        },
        {
            "name":"Aux-DO-17",
            "num":"17"
        },
        {
            "name":"Aux-DO-18",
            "num":"18"
        },
        {
            "name":"Aux-DO-19",
            "num":"19"
        },
        {
            "name":"Aux-DO-20",
            "num":"20"
        },
        {
            "name":"Aux-DO-21",
            "num":"21"
        },
        {
            "name":"Aux-DO-22",
            "num":"22"
        },
        {
            "name":"Aux-DO-23",
            "num":"23"
        },
        {
            "name":"Aux-DO-24",
            "num":"24"
        },
        {
            "name":"Aux-DO-25",
            "num":"25"
        },
        {
            "name":"Aux-DO-26",
            "num":"26"
        },
        {
            "name":"Aux-DO-27",
            "num":"27"
        },
        {
            "name":"Aux-DO-28",
            "num":"28"
        },
        {
            "name":"Aux-DO-29",
            "num":"29"
        },
        {
            "name":"Aux-DO-30",
            "num":"30"
        },
        {
            "name":"Aux-DO-31",
            "num":"31"
        },
        {
            "name":"Aux-DO-32",
            "num":"32"
        },
        {
            "name":"Aux-DO-33",
            "num":"33"
        },
        {
            "name":"Aux-DO-34",
            "num":"34"
        },
        {
            "name":"Aux-DO-35",
            "num":"35"
        },
        {
            "name":"Aux-DO-36",
            "num":"36"
        },
        {
            "name":"Aux-DO-37",
            "num":"37"
        },
        {
            "name":"Aux-DO-38",
            "num":"38"
        },
        {
            "name":"Aux-DO-39",
            "num":"39"
        },
        {
            "name":"Aux-DO-40",
            "num":"40"
        },
        {
            "name":"Aux-DO-41",
            "num":"41"
        },
        {
            "name":"Aux-DO-42",
            "num":"42"
        },
        {
            "name":"Aux-DO-43",
            "num":"43"
        },
        {
            "name":"Aux-DO-44",
            "num":"44"
        },
        {
            "name":"Aux-DO-45",
            "num":"45"
        },
        {
            "name":"Aux-DO-46",
            "num":"46"
        },
        {
            "name":"Aux-DO-47",
            "num":"47"
        },
        {
            "name":"Aux-DO-48",
            "num":"48"
        },
        {
            "name":"Aux-DO-49",
            "num":"49"
        },
        {
            "name":"Aux-DO-50",
            "num":"50"
        },
        {
            "name":"Aux-DO-51",
            "num":"51"
        },
        {
            "name":"Aux-DO-52",
            "num":"52"
        },
        {
            "name":"Aux-DO-53",
            "num":"53"
        },
        {
            "name":"Aux-DO-54",
            "num":"54"
        },
        {
            "name":"Aux-DO-55",
            "num":"55"
        },
        {
            "name":"Aux-DO-56",
            "num":"56"
        },
        {
            "name":"Aux-DO-57",
            "num":"57"
        },
        {
            "name":"Aux-DO-58",
            "num":"58"
        },
        {
            "name":"Aux-DO-59",
            "num":"59"
        },
        {
            "name":"Aux-DO-60",
            "num":"60"
        },
        {
            "name":"Aux-DO-61",
            "num":"61"
        },
        {
            "name":"Aux-DO-62",
            "num":"62"
        },
        {
            "name":"Aux-DO-63",
            "num":"63"
        },
        {
            "name":"Aux-DO-64",
            "num":"64"
        },
        {
            "name":"Aux-DO-65",
            "num":"65"
        },
        {
            "name":"Aux-DO-66",
            "num":"66"
        },
        {
            "name":"Aux-DO-67",
            "num":"67"
        },
        {
            "name":"Aux-DO-68",
            "num":"68"
        },
        {
            "name":"Aux-DO-69",
            "num":"69"
        },
        {
            "name":"Aux-DO-70",
            "num":"70"
        },
        {
            "name":"Aux-DO-71",
            "num":"71"
        },
        {
            "name":"Aux-DO-72",
            "num":"72"
        },
        {
            "name":"Aux-DO-73",
            "num":"73"
        },
        {
            "name":"Aux-DO-74",
            "num":"74"
        },
        {
            "name":"Aux-DO-75",
            "num":"75"
        },
        {
            "name":"Aux-DO-76",
            "num":"76"
        },
        {
            "name":"Aux-DO-77",
            "num":"77"
        },
        {
            "name":"Aux-DO-78",
            "num":"78"
        },
        {
            "name":"Aux-DO-79",
            "num":"79"
        },
        {
            "name":"Aux-DO-80",
            "num":"80"
        },
        {
            "name":"Aux-DO-81",
            "num":"81"
        },
        {
            "name":"Aux-DO-82",
            "num":"82"
        },
        {
            "name":"Aux-DO-83",
            "num":"83"
        },
        {
            "name":"Aux-DO-84",
            "num":"84"
        },
        {
            "name":"Aux-DO-85",
            "num":"85"
        },
        {
            "name":"Aux-DO-86",
            "num":"86"
        },
        {
            "name":"Aux-DO-87",
            "num":"87"
        },
        {
            "name":"Aux-DO-88",
            "num":"88"
        },
        {
            "name":"Aux-DO-89",
            "num":"89"
        },
        {
            "name":"Aux-DO-90",
            "num":"90"
        },
        {
            "name":"Aux-DO-91",
            "num":"91"
        },
        {
            "name":"Aux-DO-92",
            "num":"92"
        },
        {
            "name":"Aux-DO-93",
            "num":"93"
        },
        {
            "name":"Aux-DO-94",
            "num":"94"
        },
        {
            "name":"Aux-DO-95",
            "num":"95"
        },
        {
            "name":"Aux-DO-96",
            "num":"96"
        },
        {
            "name":"Aux-DO-97",
            "num":"97"
        },
        {
            "name":"Aux-DO-98",
            "num":"98"
        },
        {
            "name":"Aux-DO-99",
            "num":"99"
        },
        {
            "name":"Aux-DO-100",
            "num":"100"
        },
        {
            "name":"Aux-DO-101",
            "num":"101"
        },
        {
            "name":"Aux-DO-102",
            "num":"102"
        },
        {
            "name":"Aux-DO-103",
            "num":"103"
        },
        {
            "name":"Aux-DO-104",
            "num":"104"
        },
        {
            "name":"Aux-DO-105",
            "num":"105"
        },
        {
            "name":"Aux-DO-106",
            "num":"106"
        },
        {
            "name":"Aux-DO-107",
            "num":"107"
        },
        {
            "name":"Aux-DO-108",
            "num":"108"
        },
        {
            "name":"Aux-DO-109",
            "num":"109"
        },
        {
            "name":"Aux-DO-110",
            "num":"110"
        },
        {
            "name":"Aux-DO-111",
            "num":"111"
        },
        {
            "name":"Aux-DO-112",
            "num":"112"
        },
        {
            "name":"Aux-DO-113",
            "num":"113"
        },
        {
            "name":"Aux-DO-114",
            "num":"114"
        },
        {
            "name":"Aux-DO-115",
            "num":"115"
        },
        {
            "name":"Aux-DO-116",
            "num":"116"
        },
        {
            "name":"Aux-DO-117",
            "num":"117"
        },
        {
            "name":"Aux-DO-118",
            "num":"118"
        },
        {
            "name":"Aux-DO-119",
            "num":"119"
        },
        {
            "name":"Aux-DO-120",
            "num":"120"
        },
        {
            "name":"Aux-DO-121",
            "num":"121"
        },
        {
            "name":"Aux-DO-122",
            "num":"122"
        },
        {
            "name":"Aux-DO-123",
            "num":"123"
        },
        {
            "name":"Aux-DO-124",
            "num":"124"
        },
        {
            "name":"Aux-DO-125",
            "num":"125"
        },
        {
            "name":"Aux-DO-126",
            "num":"126"
        },
        {
            "name":"Aux-DO-127",
            "num":"127"
        }
    ];
    // GetAuxIO端口号
    $scope.AuxDinData = [
        {
            "name":"Aux-DI-0",
            "num":"0"
        },
        {
            "name":"Aux-DI-1",
            "num":"1"
        },
        {
            "name":"Aux-DI-2",
            "num":"2"
        },
        {
            "name":"Aux-DI-3",
            "num":"3"
        },
        {
            "name":"Aux-DI-4",
            "num":"4"
        },
        {
            "name":"Aux-DI-5",
            "num":"5"
        },
        {
            "name":"Aux-DI-6",
            "num":"6"
        },
        {
            "name":"Aux-DI-7",
            "num":"7"
        },
        {
            "name":"Aux-DI-8",
            "num":"8"
        },
        {
            "name":"Aux-DI-9",
            "num":"9"
        },
        {
            "name":"Aux-DI-10",
            "num":"10"
        },
        {
            "name":"Aux-DI-11",
            "num":"11"
        },
        {
            "name":"Aux-DI-12",
            "num":"12"
        },
        {
            "name":"Aux-DI-13",
            "num":"13"
        },
        {
            "name":"Aux-DI-14",
            "num":"14"
        },
        {
            "name":"Aux-DI-15",
            "num":"15"
        },
        {
            "name":"Aux-DI-16",
            "num":"16"
        },
        {
            "name":"Aux-DI-17",
            "num":"17"
        },
        {
            "name":"Aux-DI-18",
            "num":"18"
        },
        {
            "name":"Aux-DI-19",
            "num":"19"
        },
        {
            "name":"Aux-DI-20",
            "num":"20"
        },
        {
            "name":"Aux-DI-21",
            "num":"21"
        },
        {
            "name":"Aux-DI-22",
            "num":"22"
        },
        {
            "name":"Aux-DI-23",
            "num":"23"
        },
        {
            "name":"Aux-DI-24",
            "num":"24"
        },
        {
            "name":"Aux-DI-25",
            "num":"25"
        },
        {
            "name":"Aux-DI-26",
            "num":"26"
        },
        {
            "name":"Aux-DI-27",
            "num":"27"
        },
        {
            "name":"Aux-DI-28",
            "num":"28"
        },
        {
            "name":"Aux-DI-29",
            "num":"29"
        },
        {
            "name":"Aux-DI-30",
            "num":"30"
        },
        {
            "name":"Aux-DI-31",
            "num":"31"
        },
        {
            "name":"Aux-DI-32",
            "num":"32"
        },
        {
            "name":"Aux-DI-33",
            "num":"33"
        },
        {
            "name":"Aux-DI-34",
            "num":"34"
        },
        {
            "name":"Aux-DI-35",
            "num":"35"
        },
        {
            "name":"Aux-DI-36",
            "num":"36"
        },
        {
            "name":"Aux-DI-37",
            "num":"37"
        },
        {
            "name":"Aux-DI-38",
            "num":"38"
        },
        {
            "name":"Aux-DI-39",
            "num":"39"
        },
        {
            "name":"Aux-DI-40",
            "num":"40"
        },
        {
            "name":"Aux-DI-41",
            "num":"41"
        },
        {
            "name":"Aux-DI-42",
            "num":"42"
        },
        {
            "name":"Aux-DI-43",
            "num":"43"
        },
        {
            "name":"Aux-DI-44",
            "num":"44"
        },
        {
            "name":"Aux-DI-45",
            "num":"45"
        },
        {
            "name":"Aux-DI-46",
            "num":"46"
        },
        {
            "name":"Aux-DI-47",
            "num":"47"
        },
        {
            "name":"Aux-DI-48",
            "num":"48"
        },
        {
            "name":"Aux-DI-49",
            "num":"49"
        },
        {
            "name":"Aux-DI-50",
            "num":"50"
        },
        {
            "name":"Aux-DI-51",
            "num":"51"
        },
        {
            "name":"Aux-DI-52",
            "num":"52"
        },
        {
            "name":"Aux-DI-53",
            "num":"53"
        },
        {
            "name":"Aux-DI-54",
            "num":"54"
        },
        {
            "name":"Aux-DI-55",
            "num":"55"
        },
        {
            "name":"Aux-DI-56",
            "num":"56"
        },
        {
            "name":"Aux-DI-57",
            "num":"57"
        },
        {
            "name":"Aux-DI-58",
            "num":"58"
        },
        {
            "name":"Aux-DI-59",
            "num":"59"
        },
        {
            "name":"Aux-DI-60",
            "num":"60"
        },
        {
            "name":"Aux-DI-61",
            "num":"61"
        },
        {
            "name":"Aux-DI-62",
            "num":"62"
        },
        {
            "name":"Aux-DI-63",
            "num":"63"
        },
        {
            "name":"Aux-DI-64",
            "num":"64"
        },
        {
            "name":"Aux-DI-65",
            "num":"65"
        },
        {
            "name":"Aux-DI-66",
            "num":"66"
        },
        {
            "name":"Aux-DI-67",
            "num":"67"
        },
        {
            "name":"Aux-DI-68",
            "num":"68"
        },
        {
            "name":"Aux-DI-69",
            "num":"69"
        },
        {
            "name":"Aux-DI-70",
            "num":"70"
        },
        {
            "name":"Aux-DI-71",
            "num":"71"
        },
        {
            "name":"Aux-DI-72",
            "num":"72"
        },
        {
            "name":"Aux-DI-73",
            "num":"73"
        },
        {
            "name":"Aux-DI-74",
            "num":"74"
        },
        {
            "name":"Aux-DI-75",
            "num":"75"
        },
        {
            "name":"Aux-DI-76",
            "num":"76"
        },
        {
            "name":"Aux-DI-77",
            "num":"77"
        },
        {
            "name":"Aux-DI-78",
            "num":"78"
        },
        {
            "name":"Aux-DI-79",
            "num":"79"
        },
        {
            "name":"Aux-DI-80",
            "num":"80"
        },
        {
            "name":"Aux-DI-81",
            "num":"81"
        },
        {
            "name":"Aux-DI-82",
            "num":"82"
        },
        {
            "name":"Aux-DI-83",
            "num":"83"
        },
        {
            "name":"Aux-DI-84",
            "num":"84"
        },
        {
            "name":"Aux-DI-85",
            "num":"85"
        },
        {
            "name":"Aux-DI-86",
            "num":"86"
        },
        {
            "name":"Aux-DI-87",
            "num":"87"
        },
        {
            "name":"Aux-DI-88",
            "num":"88"
        },
        {
            "name":"Aux-DI-89",
            "num":"89"
        },
        {
            "name":"Aux-DI-90",
            "num":"90"
        },
        {
            "name":"Aux-DI-91",
            "num":"91"
        },
        {
            "name":"Aux-DI-92",
            "num":"92"
        },
        {
            "name":"Aux-DI-93",
            "num":"93"
        },
        {
            "name":"Aux-DI-94",
            "num":"94"
        },
        {
            "name":"Aux-DI-95",
            "num":"95"
        },
        {
            "name":"Aux-DI-96",
            "num":"96"
        },
        {
            "name":"Aux-DI-97",
            "num":"97"
        },
        {
            "name":"Aux-DI-98",
            "num":"98"
        },
        {
            "name":"Aux-DI-99",
            "num":"99"
        },
        {
            "name":"Aux-DI-100",
            "num":"100"
        },
        {
            "name":"Aux-DI-101",
            "num":"101"
        },
        {
            "name":"Aux-DI-102",
            "num":"102"
        },
        {
            "name":"Aux-DI-103",
            "num":"103"
        },
        {
            "name":"Aux-DI-104",
            "num":"104"
        },
        {
            "name":"Aux-DI-105",
            "num":"105"
        },
        {
            "name":"Aux-DI-106",
            "num":"106"
        },
        {
            "name":"Aux-DI-107",
            "num":"107"
        },
        {
            "name":"Aux-DI-108",
            "num":"108"
        },
        {
            "name":"Aux-DI-109",
            "num":"109"
        },
        {
            "name":"Aux-DI-110",
            "num":"110"
        },
        {
            "name":"Aux-DI-111",
            "num":"111"
        },
        {
            "name":"Aux-DI-112",
            "num":"112"
        },
        {
            "name":"Aux-DI-113",
            "num":"113"
        },
        {
            "name":"Aux-DI-114",
            "num":"114"
        },
        {
            "name":"Aux-DI-115",
            "num":"115"
        },
        {
            "name":"Aux-DI-116",
            "num":"116"
        },
        {
            "name":"Aux-DI-117",
            "num":"117"
        },
        {
            "name":"Aux-DI-118",
            "num":"118"
        },
        {
            "name":"Aux-DI-119",
            "num":"119"
        },
        {
            "name":"Aux-DI-120",
            "num":"120"
        },
        {
            "name":"Aux-DI-121",
            "num":"121"
        },
        {
            "name":"Aux-DI-122",
            "num":"122"
        },
        {
            "name":"Aux-DI-123",
            "num":"123"
        },
        {
            "name":"Aux-DI-124",
            "num":"124"
        },
        {
            "name":"Aux-DI-125",
            "num":"125"
        },
        {
            "name":"Aux-DI-126",
            "num":"126"
        },
        {
            "name":"Aux-DI-127",
            "num":"127"
        }
    ];
    // SetAuxAO端口号
    $scope.AuxAOport = langJsonData.commandlist.AuxAOport;
    // GetAuxAI端口号
    $scope.AuxAIport = langJsonData.commandlist.AuxAIport;
    // TPD平滑选择
    $scope.setTPDMode = langJsonData.commandlist.setTPDMode;
    // TPD速度缩放
    $scope.setTPDSpeed = langJsonData.commandlist.setTPDSpeed;
    // 等待AI指令
    $scope.AIcompare = langJsonData.commandlist.AIcompare;
    // 工件号指令
    $scope.WobjToolCoord = [];
    // 打磨控制模式
    $scope.polishCommandModeData = langJsonData.commandlist.polishCommandMode;
    // Aux_Servo伺服id
    $scope.auxServoCommandIdData = langJsonData.commandlist.auxServoCommandId;
    // Aux_Servo控制模式
    $scope.auxServoCommandModeData = langJsonData.commandlist.auxServoCommandMode;
    // Aux_Servo回零模式
    $scope.auxServoHommingModeData = langJsonData.commandlist.auxServoHommingMode;
    // 起弧编号
    $scope.WeldIdData = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,
        26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,
        51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,
        76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99];
    // 寻位方向
    $scope.SerachDistData = langJsonData.commandlist.SerachDistData;
    // 寻位指令
    $scope.wireSearchRef_ResPointData = langJsonData.commandlist.wireSearchRef_ResPointData;
    $scope.wireSearchRefPointData = langJsonData.commandlist.wireSearchRefPointData;
    $scope.wireSearchResPointData = langJsonData.commandlist.wireSearchResPointData;
    // 轨迹TrajectoryJ
    $scope.trajectoryJMode = langJsonData.commandlist.trajectoryJMode;
    $scope.weldRecordData = ptDynamicTags.var_object.weldRecordData;
    $scope.TplateType = ptDynamicTags.var_object.TplateType;
    $scope.WeaveTypeData = ptDynamicTags.var_object.WeaveTypeData;
    $scope.weaveWaitTimeData = ptDynamicTags.var_object.weaveWaitTimeData;
    $scope.weaveLocationWaitData = ptDynamicTags.var_object.weaveLocationWaitData;
    $scope.TEAxisModeData = ptDynamicTags.var_object.TEAxisModeData;
    $scope.functionTypeData = ptDynamicTags.var_object.functionTypeData;
    $scope.protocolData = ptDynamicTags.var_object.protocolData;
    $scope.infPointType = ptDynamicTags.var_object.infPointType;
    $scope.techPlateType = ptDynamicTags.var_object.techPlateType;
    $scope.techMotionDirection = ptDynamicTags.var_object.techMotionDirection;
    $scope.robotModeData = ptDynamicTags.var_object.robotModeData;
    $scope.weaveModeData = ptDynamicTags.var_object.weaveModeData;
    $scope.functionModeData = ptDynamicTags.var_object.functionModeData;
    $scope.segmentModeData = ptDynamicTags.var_object.segmentModeData;
    $scope.roundingRuleData = ptDynamicTags.var_object.roundingRuleData;
    $scope.VarTyepData = ptDynamicTags.var_object.VarTyepData;
    $scope.VarQueryTyepData = ptDynamicTags.var_object.VarQueryTyepData;
    $scope.offsetFlagData = ptDynamicTags.var_object.offsetFlagData;
    $scope.offsetFlagLaserData = ptDynamicTags.var_object.offsetFlagLaserData;
    $scope.nSpiralOffsetFlagData = ptDynamicTags.var_object.nSpiralOffsetFlagData;
    $scope.ZeroModeData = ptDynamicTags.var_object.ZeroModeData;
    $scope.polishCommandModeData = ptDynamicTags.var_object.polishCommandMode;
    $scope.auxServoCommandIdData = ptDynamicTags.var_object.auxServoCommandId;
    $scope.auxServoCommandModeData = ptDynamicTags.var_object.auxServoCommandMode;
    $scope.auxServoHommingModeData = ptDynamicTags.var_object.auxServoHommingMode;
    $scope.ExternaAxisDirData = ptDynamicTags.var_object.ExternaAxisDirData;
    $scope.ConTrackModeData = ptDynamicTags.var_object.ConTrackModeData;
    $scope.threeDFunctionData = ptDynamicTags.var_object.threeDFunctionData;
    $scope.PatternData = ptDynamicTags.var_object.PatternData;
    $scope.DirectionData = ptDynamicTags.var_object.DirectionData;
    $scope.LaserLocationData = ptDynamicTags.var_object.LaserLocationData;
    $scope.wireSearchBackFlagData = ptDynamicTags.var_object.wireSearchBackFlagData;
    $scope.wireSearchModeData = ptDynamicTags.var_object.wireSearchModeData;
    $scope.wireRefPosData = ptDynamicTags.var_object.wireRefPosData;
    $scope.wireSearchTypeData = ptDynamicTags.var_object.wireSearchTypeData;
    $scope.wireSearchType1MethodData = ptDynamicTags.var_object.wireSearchType1MethodData;
    $scope.wireSearchType2MethodData = ptDynamicTags.var_object.wireSearchType2MethodData;
    $scope.newSplineModeData = ptDynamicTags.var_object.newSplineModeData;
    $scope.newSplineLastFlag = ptDynamicTags.var_object.newSplineLastFlag;
    $scope.spiralDipAngleData = ptDynamicTags.var_object.spiralDipAngleData;
    $scope.WaitMultiDiCondition = ptDynamicTags.var_object.WaitMultiDiCondition;
    $scope.auxIOThreadData = ptDynamicTags.var_object.auxIOThreadData;
    $scope.weldTraceAxisselectData = ptDynamicTags.var_object.weldTraceAxisselectData;
    $scope.weldTraceReferenceTypeData = ptDynamicTags.var_object.weldTraceReferenceTypeData;
    $scope.traceIsleftrightData = ptDynamicTags.var_object.traceIsleftrightData;
    $scope.weldTraceIsuplowData = ptDynamicTags.var_object.weldTraceIsuplowData;
    $scope.servoCModeData = ptDynamicTags.var_object.servoCModeData;
    $scope.spiralDirectionData = ptDynamicTags.var_object.spiralDirectionData;
    $scope.modbusRegReadFunctionCodeData = ptDynamicTags.var_object.modbusRegReadFunctionCodeData;
    $scope.modbusRegWriteFunctionCodeData = ptDynamicTags.var_object.modbusRegWriteFunctionCodeData;
    $scope.collideModeData = ptDynamicTags.var_object.collideModeData;
    $scope.FTRotOrnData = ptDynamicTags.var_object.FTRotOrnData;
    $scope.dofileLevelData = ptDynamicTags.var_object.dofileLevelData;
    $scope.FTReferenceCoordData = ptDynamicTags.var_object.FTReferenceCoordData;
    $scope.FTControlAdjSignData = ptDynamicTags.var_object.FTControlAdjSignData;
    $scope.FTControlILCSignData = ptDynamicTags.var_object.FTControlILCSignData;
    $scope.FTRotRotOrnData = ptDynamicTags.var_object.FTRotRotOrnData;
    $scope.FTLinOrnData = ptDynamicTags.var_object.FTLinOrnData;
    $scope.FTFindSurfaceDirectionData = ptDynamicTags.var_object.FTFindSurfaceDirectionData;
    $scope.outputMoveDOModeData = ptDynamicTags.var_object.outputMoveDOModeData;
    $scope.selectedHSpiralDirection = $scope.spiralDirectionData[0];
    $scope.xmlrpcTableTypeData = ptDynamicTags.var_object.xmlrpcTableTypeData;
    $scope.torqueSmoothTypeData = ptDynamicTags.var_object.torqueSmoothTypeData;
    $scope.offsetTypeData = ptDynamicTags.var_object.offsetTypeData;
    $scope.lockXPointModeData= ptDynamicTags.var_object.lockXPointModeData;
    $scope.treatStrategyData= ptDynamicTags.var_object.treatStrategyData;
    $scope.focusNumberData = [
        {
            id: 1,
            name: "1",
        },
        {
            id: 2,
            name: "2",
        },
        {
            id: 3,
            name: "3",
        },
        {
            id: 4,
            name: "4",
        },
        {
            id: 5,
            name: "5",
        },
        {
            id: 6,
            name: "6",
        },
        {
            id: 7,
            name: "7",
        },
        {
            id: 8,
            name: "8",
        }
    ];
    $scope.MotionModeData = [
        {
            id: "0",
            name: "PTP"
        },
        {
            id: "1",
            name: "Lin"
        },
        {
            id: "2",
            name: "ARC"
        }
    ]
    $scope.PalletMotionModeData = [
        {
            id: 0,
            name: "PTP"
        },
        {
            id: 1,
            name: "Lin"
        }
    ]
    $scope.LaserMotionModeData = [
        {
            id: "0",
            name: "PTP"
        },
        {
            id: "1",
            name: "Lin"
        }
    ]
    $scope.wireSearchType3MethodData = [
        {
            id: "6",
            name: "3D(xyz)",
        }
    ]
    $scope.wireSearchType4MethodData = [
        {
            id: "7",
            name: "3D+(xyzrxryrz)",
        }
    ]
    $scope.wireSearchType5MethodData = [
        {
            id: "8",
            name: "3D+(xyzrxryrz)",
        }
    ]
    $scope.modbusMasterIDData = [
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
    ]
    $scope.modbusMasterCoilsValueData = [
        {
            id: "0",
            name: "OFF",
        },
        {
            id: "1",
            name: "ON",
        }
    ]
    $scope.modbusMasterTypeData = [
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
    $scope.scriptFunctionData = [
        {
            id: "0",
            name: "j1,j2,j3,j4,j5,j6 = GetInverseKinRef(<type>,<pose>,[ref-joints])  --type:0/1/2; pose:{x,y,z,rx,ry,rz}; ref-joints:{j1,j2,j3,j4,j5,j6}",
        },
        {
            id: "1",
            name: "result = GetInverseKinHasSolution(<type>,<pose>,[ref-joints])  --type:0/1/2; pose:{x,y,z,rx,ry,rz}; ref-joints:{j1,j2,j3,j4,j5,j6}",
        }
    ]
    $scope.fr5collideGradeData = [
        {
            id:"1",
            name:"1(25N)",
        },
        {
            id:"2",
            name:"2(33N)",
        },
        {
            id:"3",
            name:"3(41N)",
        },
        {
            id:"4",
            name:"4(50N)",
        },
        {
            id:"5",
            name:"5(58N)",
        },
        {
            id:"6",
            name:"6(66N)",
        },
        {
            id:"7",
            name:"7(75N)",
        },
        {
            id:"8",
            name:"8(83N)",
        },
        {
            id:"9",
            name:"9(91N)",
        },
        {
            id:"10",
            name:"10(100N)",
        },
        {
            id:"100",
            name:"close",
        }
    ];
    $scope.fr3collideGradeData = [
        {
            id:"1",
            name:"1(16N)",
        },
        {
            id:"2",
            name:"2(21N)",
        },
        {
            id:"3",
            name:"3(26N)",
        },
        {
            id:"4",
            name:"4(32N)",
        },
        {
            id:"5",
            name:"5(37N)",
        },
        {
            id:"6",
            name:"6(42N)",
        },
        {
            id:"7",
            name:"7(48N)",
        },
        {
            id:"8",
            name:"8(53N)",
        },
        {
            id:"9",
            name:"9(58N)",
        },
        {
            id:"10",
            name:"10(64N)",
        },
        {
            id:"100",
            name:"close",
        }
    ];
    $scope.fr10collideGradeData = [
        {
            id:"1",
            name:"1(95N)",
        },
        {
            id:"2",
            name:"2(125N)",
        },
        {
            id:"3",
            name:"3(156N)",
        },
        {
            id:"4",
            name:"4(190N)",
        },
        {
            id:"5",
            name:"5(220N)",
        },
        {
            id:"6",
            name:"6(251N)",
        },
        {
            id:"7",
            name:"7(285N)",
        },
        {
            id:"8",
            name:"8(315N)",
        },
        {
            id:"9",
            name:"9(346N)",
        },
        {
            id:"10",
            name:"10(380N)",
        },
        {
            id:"100",
            name:"close",
        }
    ];
    $scope.FTFindSurfaceAxisData = [
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
    // EAxis option
    $scope.TEAxisIDData = [
        {
            id: "1"
        },
        {
            id: "2"
        },
        {
            id: "3"
        },
        {
            id: "4"
        }
    ];
    // Collision option
    $scope.collideGradeData = [{}];
    if (g_robotType.type == 1 || g_robotType.type == 6 || g_robotTypeCode == 901) {
        $scope.collideGradeData = $scope.fr3collideGradeData;
    } else if (g_robotType.type == 2 || g_robotType.type == 7 || g_robotTypeCode == 802) {
        $scope.collideGradeData = $scope.fr5collideGradeData;
    } else if (g_robotType.type == 3 || g_robotTypeCode == 902) {
        $scope.collideGradeData = $scope.fr10collideGradeData;
    } else {
        $scope.collideGradeData = $scope.fr10collideGradeData;
    }
    // 夹爪变量
    $scope.teachActivateGripperData = [1,2,3,4,5,6,7,8];
    $scope.teachConfigGripperData = [1,2,3,4,5,6,7,8];
    initCodingData();
    getWobjCoordData();
    getToolTrsfCoordData();
    /* ./获取指令参数相关数据, 初始化 */

    /* 程序编程界面变量初始化 */
    function initCodingData() {
        // goto option
        $scope.gototext = "";
        // Var option
        $scope.show_chose_sys_var = true;
        $scope.show_sys_var_rename = false;
        $scope.selectedVarType = $scope.VarTyepData[0];
        $scope.selectedVarQueryType = $scope.VarQueryTyepData[0];
        // WaitDI
        $scope.waittime = null;
        $scope.selectedWaitDIMotion = $scope.WhetherMotion[0];
        $scope.selectedWaitAIMotion = $scope.WhetherMotion[0];
        $scope.selectedWaitMultiDIMotion = $scope.WhetherMotion[0];
        // waitmultidi选择
        $scope.selectedWaitMultiDICondition = $scope.WaitMultiDiCondition[0];
        $scope.select_multi_DI0 = 0;
        $scope.select_multi_DI1 = 0;
        $scope.select_multi_DI2 = 0;
        $scope.select_multi_DI3 = 0;
        $scope.select_multi_DI4 = 0;
        $scope.select_multi_DI5 = 0;
        $scope.select_multi_DI6 = 0;
        $scope.select_multi_DI7 = 0;
        $scope.select_multi_CI0 = 0;
        $scope.select_multi_CI1 = 0;
        $scope.select_multi_CI2 = 0;
        $scope.select_multi_CI3 = 0;
        $scope.select_multi_CI4 = 0;
        $scope.select_multi_CI5 = 0;
        $scope.select_multi_CI6 = 0;
        $scope.select_multi_CI7 = 0;
        // WaitMultiDI
        $scope.selectedWaitMultiDI0State = $scope.IOState[0];
        $scope.selectedWaitMultiDI1State = $scope.IOState[0];
        $scope.selectedWaitMultiDI2State = $scope.IOState[0];
        $scope.selectedWaitMultiDI3State = $scope.IOState[0];
        $scope.selectedWaitMultiDI4State = $scope.IOState[0];
        $scope.selectedWaitMultiDI5State = $scope.IOState[0];
        $scope.selectedWaitMultiDI6State = $scope.IOState[0];
        $scope.selectedWaitMultiDI7State = $scope.IOState[0];
        $scope.selectedWaitMultiCI0State = $scope.IOState[0];
        $scope.selectedWaitMultiCI1State = $scope.IOState[0];
        $scope.selectedWaitMultiCI2State = $scope.IOState[0];
        $scope.selectedWaitMultiCI3State = $scope.IOState[0];
        $scope.selectedWaitMultiCI4State = $scope.IOState[0];
        $scope.selectedWaitMultiCI5State = $scope.IOState[0];
        $scope.selectedWaitMultiCI6State = $scope.IOState[0];
        $scope.selectedWaitMultiCI7State = $scope.IOState[0];
        // 等待AI指令
        $scope.selectedWaitAIState = $scope.AIcompare[0];
        $scope.selectedGetAIState = $scope.AIcompare[0];
        // 等待AuxAI指令
        $scope.selectedWaitAuxAIState = $scope.AIcompare[0];
        $scope.selectedGetAuxAIState = $scope.AIcompare[0];
        // Pause指令
        $scope.PauseFunctionList = langJsonData.commandlist.PauseFunction;
        $scope.selectedPauseFunction = $scope.PauseFunctionList[0];
        // ARC、Circle整圆起始点的运动方式
        $scope.selectedArcStartMove = $scope.moveStartData[0];
        $scope.selectedCircleStartMove = $scope.moveStartData[0];
        // PTP、LIN、ARC调试速度
        $scope.Circledebugspeed = 100;
        $scope.ARCdebugspeed = 100;
        $scope.PTPdebugspeed = 100;
        $scope.Lindebugspeed = 100;
        $scope.EAxisPTPdebugspeed = 100;
        $scope.segLindebugspeed = 100;
        $scope.LinCustomRadius = 0;
        $scope.PTPCustomRadius = 0;
        $scope.ArcCustomRadius = 0;
        $scope.DMPdebugspeed = 100;
        // 自动速度
        $scope.manualSpeed = $scope.manualSpeed;
        // 手动速度
        $scope.autoSpeed = $scope.autoSpeed;
        // PTP option
        $scope.PTPdx = "0";
        $scope.PTPdy = "0";
        $scope.PTPdz = "0";
        $scope.PTPdrx = "0";
        $scope.PTPdry = "0";
        $scope.PTPdrz = "0";
        $scope.selectedOffsetFlag = $scope.offsetFlagData[0];
        $scope.selectedOffset1Flag = $scope.offsetFlagData[0];
        $scope.selectedOffset2Flag = $scope.offsetFlagData[0];
        // Lin option
        $scope.LINdx = "0";
        $scope.LINdy = "0";
        $scope.LINdz = "0";
        $scope.LINdrx = "0";
        $scope.LINdry = "0";
        $scope.LINdrz = "0";
        $scope.show_enable_offset = true;
        $scope.selectedTreatStrategy = $scope.treatStrategyData[0];
        $scope.speedReductionThreshold = 0;
        $scope.angleSpeedThreshold = 100;
        // ARC option
        $scope.ARC1dx = "0";
        $scope.ARC1dy = "0";
        $scope.ARC1dz = "0";
        $scope.ARC1drx = "0";
        $scope.ARC1dry = "0";
        $scope.ARC1drz = "0";
        $scope.ARC2dx = "0";
        $scope.ARC2dy = "0";
        $scope.ARC2dz = "0";
        $scope.ARC2drx = "0";
        $scope.ARC2dry = "0";
        $scope.ARC2drz = "0";
        // Circle option
        $scope.Circledx = "0";
        $scope.Circledy = "0";
        $scope.Circledz = "0";
        $scope.Circledrx = "0";
        $scope.Circledry = "0";
        $scope.Circledrz = "0";
        $scope.Circledx1 = "0";
        $scope.Circledy1 = "0";
        $scope.Circledz1 = "0";
        $scope.Circledrx1 = "0";
        $scope.Circledry1 = "0";
        $scope.Circledrz1 = "0";
        $scope.selectedOffsetType = 1;
        // 水平螺旋
        $scope.HSpiralAngle = 20;
        // Spiral option
        $scope.Spiraldebugspeed = 100;
        $scope.spiralCircleNum = 5;
        $scope.spiralRadiusAdd = 10;
        $scope.spiralRotAxisAdd = 10;
        $scope.spiralDipAngleRx = 0;
        $scope.spiralDipAngleRy = 0;
        $scope.spiralDipAngleRz = 0;
        $scope.selectedDipAngle = $scope.spiralDipAngleData[0];
        $scope.Spiraldx = "0";
        $scope.Spiraldy = "0";
        $scope.Spiraldz = "0";
        $scope.Spiraldrx = "0";
        $scope.Spiraldry = "0";
        $scope.Spiraldrz = "0";
        $scope.selectedSpiralDirection = $scope.spiralDirectionData[0];
        // NSpiral option
        $scope.NSpiraldebugspeed = 100;
        $scope.NspiralCircleNum = 5;
        $scope.NspiralRadiusAdd = 10;
        $scope.NspiralRotAxisAdd = 10;
        $scope.NspiralOriginRadius = 50;
        $scope.NspiralDipAngle = 30;
        $scope.selectedNSpiralOffsetFlag = $scope.nSpiralOffsetFlagData[0];
        $scope.NSpiraldx = "0";
        $scope.NSpiraldy = "0";
        $scope.NSpiraldz = "0";
        $scope.NSpiraldrx = "0";
        $scope.NSpiraldry = "0";
        $scope.NSpiraldrz = "0";
        // SPLINE option
        $scope.SPLdebugspeed = 100;
        $scope.SLINdebugspeed = 100;
        $scope.SCIRCdebugspeed = 100;
        // NewSPLINE option
        $scope.selectedNewSplineMode = $scope.newSplineModeData[0];
        $scope.newSplinedebugspeed = 100;
        $scope.newSplineRadius = 0;
        $scope.selectedSplineLastFlag = $scope.newSplineLastFlag[0];
        // RobotMode option
        $scope.selectedRobotMode = $scope.robotModeData[0];
        // 摆动
        $scope.weldTime = 10000;
        $scope.selectedWeaveWaitTime= $scope.weaveWaitTimeData[0];
        $scope.selectedWeaveLocationWait= $scope.weaveLocationWaitData[0];
        // TPD模式
        $scope.show_TPD_Mode_true = 0;
        $scope.show_TPD_Mode_false = 1;
        // TPD option
        $scope.inputTPDSpeed = 100;
        // TPD平滑选择
        $scope.selectedTPDMode = $scope.setTPDMode[0];
        // TPD速度缩放
        $scope.selectedTPDSpeed = $scope.setTPDSpeed[0];
        // TPD位姿类型
        $scope.selectedTPDLocation = $scope.setTPDLocation[0];
        // offset option
        $scope.PointOffset_x = 0;
        $scope.PointOffset_rx = 0;
        $scope.PointOffset_y = 0;
        $scope.PointOffset_ry = 0;
        $scope.PointOffset_z = 0;
        $scope.PointOffset_rz = 0;
        // ServoC option
        $scope.selectedServoCMode = $scope.servoCModeData[0];
        $scope.ServoCx = "0";
        $scope.ServoCy = "0";
        $scope.ServoCz = "0";
        $scope.ServoCrx = "0";
        $scope.ServoCry = "0";
        $scope.ServoCrz = "0";
        $scope.ServoCdx = "0";
        $scope.ServoCdy = "0";
        $scope.ServoCdz = "0";
        $scope.ServoCdrx = "0";
        $scope.ServoCdry = "0";
        $scope.ServoCdrz = "0";
        $scope.ServoCScalex = "0";
        $scope.ServoCScaley = "0";
        $scope.ServoCScalez = "0";
        $scope.ServoCScalerx = "0";
        $scope.ServoCScalery = "0";
        $scope.ServoCScalerz = "0";
        $scope.ServoCAcc = "100";
        $scope.ServoCSpeed = "100";
        $scope.ServoCCommandCycle = "0";
        $scope.ServoCLookaheadTime = "0";
        $scope.ServoCGain = "0";
        // 轨迹TrajectoryJ
        $scope.selectedTrajJMode = $scope.trajectoryJMode[0];
        // Collision option
        $scope.selectedCollisionJ1 = $scope.collideGradeData[0];
        $scope.selectedCollisionJ2 = $scope.collideGradeData[0];
        $scope.selectedCollisionJ3 = $scope.collideGradeData[0];
        $scope.selectedCollisionJ4 = $scope.collideGradeData[0];
        $scope.selectedCollisionJ5 = $scope.collideGradeData[0];
        $scope.selectedCollisionJ6 = $scope.collideGradeData[0];
        $scope.customCollisionJ1 = 50;
        $scope.customCollisionJ2 = 50;
        $scope.customCollisionJ3 = 50;
        $scope.customCollisionJ4 = 50;
        $scope.customCollisionJ5 = 50;
        $scope.customCollisionJ6 = 50;
        $scope.selectedGradeMode = 0;
        // setIO端口号
        $scope.selectedSetioPort = $scope.DoData[0];
        // IO阻塞
        $scope.show_SetIo_Block = true;
        $scope.selectedGetIOBlock = $scope.IOBlockData[0];
        $scope.selectedSetAOBlock = $scope.IOBlockData[0];
        $scope.selectedGetAIBlock = $scope.IOBlockData[0];
        // IO option
        $scope.selectedSetioThread = $scope.auxIOThreadData[0];
        $scope.selectedGetioThread = $scope.auxIOThreadData[0];
        $scope.selectedSetAoThread = $scope.auxIOThreadData[0];
        $scope.selectedGetAoThread = $scope.auxIOThreadData[0];
        $scope.selectedWeldRecord = $scope.weldRecordData[0];
        $scope.selectedTPlateType = $scope.TplateType[0];
        $scope.selectedWireSearchRecord = $scope.spiralDipAngleData[0];
        $scope.selectedSetAuxioThread = $scope.auxIOThreadData[0];
        $scope.selectedGetAuxioThread = $scope.auxIOThreadData[0];
        $scope.selectedSetAuxAoThread = $scope.auxIOThreadData[0];
        $scope.selectedGetAuxAoThread = $scope.auxIOThreadData[0];
        // SetIO状态
        $scope.selectedSetioState = $scope.IOState[0];
        $scope.selectedWaitDIState = $scope.IOState[0];
        // SetIO模式
        $scope.selectedSetioMode = $scope.setIOMode[0];
        $scope.selectWeldCurrentBlending = $scope.setIOMode[0];
        $scope.selectWeldVoltageBlending = $scope.setIOMode[0];
        // GetIO端口号
        $scope.selectedGetIOPort = $scope.DinData[0];
        $scope.selectedWaitDIPort = $scope.DinData[0];
        $scope.show_GetIO_Block = false;
        // SetAO端口号
        $scope.AOSinglePort = $scope.AOport.slice(0, -1);
        $scope.SetAOPort = $scope.AOport[0];
        $scope.selectedMoveAOPort = $scope.AOport[0];
        $scope.show_SetAO_Block = false;
        // GetAI端口号
        $scope.selectedWaitAIPort = $scope.AIport[0];
        $scope.GetAIport = $scope.AIport[0];
        $scope.show_GetAI_Block = false;
        // VirIO指令
        $scope.selectedSetVirDIPort = $scope.VirDinData[0];
        $scope.selectedGetVirDIPort = $scope.VirDinData[0];
        $scope.selectedSetVirAIPort = $scope.VirAinData[0];
        $scope.selectedGetVirAIPort = $scope.VirAinData[0];
        $scope.selectedSetVirDIState = $scope.IOState[0];
        // SetAuxIO端口号
        $scope.selectedSetAuxioPort = $scope.AuxDoData[0];
        // SetAuxIO状态
        $scope.selectedSetAuxioState = $scope.IOState[0];
        $scope.selectedWaitAuxDIState = $scope.IOState[0];
        // SetAuxIO模式
        $scope.selectedSetAuxioMode = $scope.setIOMode[0];
        // GetAuxIO端口号
        $scope.selectedGetAuxIOPort = $scope.AuxDinData[0];
        $scope.selectedWaitAuxDIPort = $scope.AuxDinData[0];
        // SetAuxAO端口号
        $scope.SetAuxAOPort = $scope.AuxAOport[0];
        // GetAuxAI端口号
        $scope.selectedWaitAuxAIPort = $scope.AuxAIport[0];
        $scope.GetAuxAIport = $scope.AuxAIport[0];
        // MoveDO
        $scope.selectedMoveDOMode = $scope.outputMoveDOModeData[0];
        $scope.selectedMoveDOPort = $scope.DoData[0];
        $scope.selectedOnceMoveDOPort = $scope.DoData[0];
        // MoveAO
        $scope.maxTcpSpeed = '1000';
        $scope.maxTcpSpeedPercent = '100';
        $scope.zerozoneCmp = '20';
        // MoveDO初始变量-连续输出模式
        $scope.separationDistance = 10;
        $scope.outputPulseDutyCycle = 50;
        // MoveDO初始变量-单次输出模式
        $scope.setOnceTime = 500;
        $scope.resetOnceTime = 500;
        //输出AO类型
        $scope.selectAOIndex = $scope.AOport[0];
        $scope.selectVoltageAOIndex = $scope.AOport[0];
        // 扩展轴+485
        $scope.auxServoCommandId = $scope.auxServoCommandIdData[0];
        $scope.auxServoCommandMode = $scope.auxServoCommandModeData[0];
        $scope.auxServoHommingMode = $scope.auxServoHommingModeData[0];
        // EAxis option
        $scope.selectedEAxisMotion = $scope.MotionModeData[0];
        $scope.selectedTEAxisID = $scope.TEAxisIDData[0];
        $scope.selectedServeOnAxisID = $scope.TEAxisIDData[0];
        $scope.selectedEAxisZeroMode = $scope.ZeroModeData[0];
        $scope.HomeSearchVel = 5;
        $scope.HomeLatchVel = 1;
        $scope.selectedTEAxisMode = $scope.TEAxisModeData[0];
        // gripper
        $scope.selectedTeachGripper = $scope.teachActivateGripperData[0];
        $scope.selectedActGripper = $scope.teachConfigGripperData[0];
        $scope.SetOpenShut = 0;
        $scope.SetGripperSpeed = 0;
        $scope.SetGripperMoment = 0;
        $scope.waitGrippertime = 0;
        $scope.selectedSetGripperBlock = $scope.IOBlockData[0];
        // conveyor option 
        $scope.selectedConTrackMode = $scope.ConTrackModeData[0];
        // 起弧编号
        $scope.selectedWeldId = $scope.WeldIdData[0];
        // Segment option
        $scope.selectedWeaveMode = $scope.weaveModeData[0];
        $scope.selectedFunctionMode = $scope.functionModeData[0];
        $scope.selectedRoundingRule = $scope.roundingRuleData[0];
        $scope.selectedSegmentMode = $scope.segmentModeData[0];
        // Laser option
        $scope.selectedMotionMode = $scope.LaserMotionModeData[0];
        $scope.selectedLTRecurrentMotionMode = $scope.LaserMotionModeData[0];
        $scope.selectedLTFunction = $scope.functionTypeData[0];
        $scope.selectedProtocol = $scope.protocolData[0];
        $scope.weldType = 0;
        $scope.LTwaittime = 10;
        $scope.LTSerachSpeed = 30;
        $scope.LaserPointSpeed = 30;
        $scope.selectedLTRecFunction = $scope.functionTypeData[0];
        $scope.LTRecwaittime = 10;
        $scope.LTRecdebugspeed = 30;
        $scope.LTRecserachSpeed = 30;
        // 电弧跟踪
        $scope.WeldTraceLagTime = 0;
        $scope.selectedWeldTraceAxisselect = $scope.weldTraceAxisselectData[0];
        $scope.selectedWeldTraceReferenceType = $scope.weldTraceReferenceTypeData[0];
        $scope.selectedTraceIsleftright = $scope.traceIsleftrightData[1];
        $scope.selectedWeldTraceIsuplow = $scope.weldTraceIsuplowData[1];
        $scope.WeldTraceKud = -0.06;
        $scope.WeldTraceTstartud = 5;
        $scope.WeldTraceStepmaxud = 5;
        $scope.WeldTraceSummaxud = 300;
        $scope.WeldTraceReferenceStartSampCurrent = 4;
        $scope.WeldTraceReferenceSampCurrent = 1;
        $scope.WeldTraceReferenceCurrent = 10;
        $scope.WeldTraceKlr = 0.06;
        $scope.WeldTraceTstartlr = 5;
        $scope.WeldTraceStepmaxlr = 5;
        $scope.WeldTraceSummaxlr = 300;
        // Adjust option
        $scope.AdjustTime = 1000;
        $scope.FirstLength = 100;
        $scope.SecondLength = 100;
        $scope.ThirdLength = 100;
        $scope.FourthLength = 100;
        $scope.FifthLength = 100;
        $scope.selectedInfPoint = $scope.infPointType[0];
        $scope.selectedTechPlateType = $scope.techPlateType[0];
        $scope.selectedTechMotionDir = $scope.techMotionDirection[0];
        // 焊丝寻位变量初始化
        $scope.selectedWireSearchType = $scope.wireSearchTypeData[0];
        $scope.wireSearchMethodData = $scope.wireSearchType1MethodData;
        $scope.selectedWireSearchMethod = $scope.wireSearchMethodData[0];
        $scope.selectedSearchBackFlag = $scope.wireSearchBackFlagData[0];
        $scope.selectedWireRefPos = $scope.wireRefPosData[0];
        $scope.tserachSpeed = 10;
        $scope.tserachDistance = 10;
        $scope.tserachBackSpeed = 10;
        $scope.tserachBackDistance = 10;
        $scope.selectedSearchMode = $scope.wireSearchModeData[0];
        $scope.selectedGuardWireSearchType = $scope.wireSearchTypeData[0];
        // 寻位方向
        $scope.selectedSerachDist = $scope.SerachDistData[0];
        // 默认展示内径示意图
        $scope.show_wireSearchType5Pic = true;
        // 角焊缝
        $scope.selectedSearchType1_1D_RefPoint1 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_1D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_2D_RefPoint1 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_2D_RefPoint2 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_2D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_2D_ResPoint2 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_3D_RefPoint1 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_3D_RefPoint2 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_3D_RefPoint3 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_3D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_3D_ResPoint2 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_3D_ResPoint3 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_2DX_RefPoint1 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_2DX_RefPoint2 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_2DX_RefPoint3 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType1_2DX_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_2DX_ResPoint2 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType1_2DX_ResPoint3 = $scope.wireSearchResPointData[0];
        // 内外径
        $scope.selectedSearchType2_2D_RefPoint1 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType2_2D_RefPoint2 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType2_2D_RefPoint3 = $scope.wireSearchRefPointData[0];
        $scope.selectedSearchType2_2D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType2_2D_ResPoint2 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType2_2D_ResPoint3 = $scope.wireSearchResPointData[0];
        // 点
        $scope.selectedSearchType3_2D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType3_2D_ResPoint2 = $scope.wireSearchResPointData[0];
        // 相机
        $scope.selectedSearchType4_2D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType4_2D_ResPoint2 = $scope.wireSearchResPointData[0];
        // 面
        $scope.selectedSearchType5_2D_ResPoint1 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType5_2D_ResPoint2 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType5_2D_ResPoint3 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType5_2D_ResPoint4 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType5_2D_ResPoint5 = $scope.wireSearchResPointData[0];
        $scope.selectedSearchType5_2D_ResPoint6 = $scope.wireSearchResPointData[0];
        // 接触点写数据
        $scope.selectedSearchResPointWriteName = $scope.wireSearchResPointData[0];
        // FT option
        $scope.select_guard_Fx = 0;
        $scope.select_guard_Fy = 0;
        $scope.select_guard_Fz = 0;
        $scope.select_guard_Tx = 0;
        $scope.select_guard_Ty = 0;
        $scope.select_guard_Tz = 0;
        $scope.FtGuard_Fx_Max = 0;
        $scope.FtGuard_Fy_Max = 0;
        $scope.FtGuard_Fz_Max = 0;
        $scope.FtGuard_Tx_Max = 0;
        $scope.FtGuard_Ty_Max = 0;
        $scope.FtGuard_Tz_Max = 0;
        $scope.FtGuard_Fx_Min = 0;
        $scope.FtGuard_Fy_Min = 0;
        $scope.FtGuard_Fz_Min = 0;
        $scope.FtGuard_Tx_Min = 0;
        $scope.FtGuard_Ty_Min = 0;
        $scope.FtGuard_Tz_Min = 0;
        $scope.select_Control_Fx = 0;
        $scope.select_Control_Fy = 0;
        $scope.select_Control_Fz = 0;
        $scope.select_Control_Tx = 0;
        $scope.select_Control_Ty = 0;
        $scope.select_Control_Tz = 0;
        $scope.FtControl_Fx = 0;
        $scope.FtControl_Fy = 0;
        $scope.FtControl_Fz = 0;
        $scope.FtControl_Tx = 0;
        $scope.FtControl_Ty = 0;
        $scope.FtControl_Tz = 0;
        $scope.FtControl_F_P_gain = 0.0005;
        $scope.FtControl_F_I_gain = 0;
        $scope.FtControl_F_D_gain = 0;
        $scope.FtControl_T_P_gain = 0;
        $scope.FtControl_T_I_gain = 0;
        $scope.FtControl_T_D_gain = 0;
        $scope.FTControlLimitlength = 0;
        $scope.FTControlLimitangle = 0;
        $scope.selectedFTSpiralCoorde = $scope.FTReferenceCoordData[0];
        $scope.FTSpiralIncreasePerTurn = "0.7";
        $scope.FTSpiralForceInsertion = "50";
        $scope.FTSpiralTMax = "60000";
        $scope.FTSpiralVelSpiral = "5";
        $scope.selectedFTRotCoorde = $scope.FTReferenceCoordData[0];
        $scope.FTRotAngVelRot = "0";
        $scope.FTRotForceInsertion = "50";
        $scope.FTRotAngleMax = "5";
        $scope.selectedFTRotOrn = $scope.FTRotOrnData[0];
        $scope.FTRotAngleAccMax = "0";
        $scope.selectedFTRotRotOrn = $scope.FTRotRotOrnData[0];
        $scope.selectedFTLinCoorde = $scope.FTReferenceCoordData[0];
        $scope.FTLinForceGoal = "50";
        $scope.FTLinVel = "1";
        $scope.FTLinAcc = "0";
        $scope.FTLinDistanceMax = "0";
        $scope.selectedFTLinOrn = $scope.FTLinOrnData[0];
        $scope.selectedFTFindSurfaceCoorde = $scope.FTReferenceCoordData[0];
        $scope.selectedFTFindSurfaceDirection = $scope.FTFindSurfaceDirectionData[0];
        $scope.selectedFTFindSurfaceAxis = $scope.FTFindSurfaceAxisData[0];
        $scope.FTFindSurfaceVel = "1";
        $scope.FTFindSurfaceAcc = "0";
        $scope.FTFindSurfaceDistanceMax = "0";
        $scope.FTFindSurfaceForceGoal = "50";
        $scope.selectedFTControlAdjSign = $scope.FTControlAdjSignData[0];
        $scope.selectedFTControlILCSign = $scope.FTControlILCSignData[0];
        $scope.selectedFTControlFilter = $scope.FTControlAdjSignData[0];
        $scope.selectedFTControlPA = $scope.FTControlAdjSignData[0];
        $scope.FTComplianceAdjust = "0.005";
        $scope.FTComplianceThreshold = "0";
        $scope.FtGuard_Fx = $scope.currentFT[0];
        $scope.FtGuard_Fy = $scope.currentFT[1];
        $scope.FtGuard_Fz = $scope.currentFT[2];
        $scope.FtGuard_Tx = $scope.currentFT[3];
        $scope.FtGuard_Ty = $scope.currentFT[4];
        $scope.FtGuard_Tz = $scope.currentFT[5];
        // Torque option
        $scope.selectedTorqueSmoothType = $scope.torqueSmoothTypeData[0];
        $scope.torqueNegativeValue1 = -0.1;
        $scope.torqueNegativeValue2 = -0.1;
        $scope.torqueNegativeValue3 = -0.1;
        $scope.torqueNegativeValue4 = -0.1;
        $scope.torqueNegativeValue5 = -0.1;
        $scope.torqueNegativeValue6 = -0.1;
        $scope.torquePositiveValue1 = 0.1;
        $scope.torquePositiveValue2 = 0.1;
        $scope.torquePositiveValue3 = 0.1;
        $scope.torquePositiveValue4 = 0.1;
        $scope.torquePositiveValue5 = 0.1;
        $scope.torquePositiveValue6 = 0.1;
        $scope.collisionTime1 = 500;
        $scope.collisionTime2 = 500;
        $scope.collisionTime3 = 500;
        $scope.collisionTime4 = 500;
        $scope.collisionTime5 = 500;
        $scope.collisionTime6 = 500;
        // 3D
        $scope.selected3DFunction = $scope.threeDFunctionData[0];
        $scope.selected3DSensorLocation = $scope.LaserLocationData[0];
        // 码垛
        $scope.selectedPalletMotion = $scope.PalletMotionModeData[0];
        $scope.selectedPalletPattern = $scope.PatternData[0];
        $scope.selectedPalletDirection = $scope.DirectionData[0];
        // Modbus
        $scope.modbusMasterGetCoilsRegisterNum = null;
        $scope.modbusMasterSetCoilsRegisterValue = null;
        $scope.modbusMasterGetInbitsRegisterNum = null;
        $scope.modbusMasterGetHoldRegsRegisterNum = null;
        $scope.selectedModbusMasterWaitDITime = null;
        $scope.modbusMasterWaitAIValue = null;
        $scope.selectedModbusMasterWaitAITime = null;
        $scope.modbusSlaveGetCoilsRegisterNum = null;
        $scope.modbusSlaveSetCoilsRegisterValue = null;
        $scope.modbusSlaveGetInbitsRegisterNum = null;
        $scope.modbusSlaveGetHoldRegsRegisterNum = null;
        $scope.modbusSlaveSetHoldRegsRegisterValue = null;
        $scope.modbusSlaveGetInRegsRegisterNum = null;
        $scope.selectedModbusSlaveWaitDITime = null;
        $scope.modbusSlaveWaitAIValue = null;
        $scope.selectedModbusSlaveWaitAITime = null;
        $scope.modbusRegReadRegisterAdress = null;
        $scope.modbusRegReadRegisterNum = null;
        $scope.modbusRegReadAdress = null;
        $scope.modbusRegGetDataRegisterNum = null;
        $scope.modbusRegWriteRegisterAdress = null;
        $scope.modbusRegWriteRegisterNum = null;
        $scope.modbusRegWriteArray = null;
        $scope.modbusRegWriteAdress = null;
        // Xmlrpc option
        $scope.selectedXmlrpcTableType = $scope.xmlrpcTableTypeData[0];
        // 焦点跟随配置默认初始值
        $scope.scaleParameter = '50.0';
        $scope.feedforwardParameter = '19.0';
        $scope.maxAngularVelAccLimit = '1440';
        $scope.maxAngularVelLimit = '180';
        $scope.selectedFocusNumber = $scope.focusNumberData[2];
        $scope.selectedLockXPoint= $scope.lockXPointModeData[0];
    }

    /* 程序示教添加程序时，所需基本数据的赋值 */
    function initProgramAddData() {
        initCodingData();
        // dofile指令
        $scope.commandUserData = $scope.userData
        let callNameArr = Object.keys($scope.commandUserData);
        $scope.selectedDofileCall = $scope.commandUserData[callNameArr[0]];
        // 普通工具
        $scope.ToolCoord = $scope.pro_ToolCoordeData;
        $scope.selectedToolCoord = $scope.ToolCoord[0];
        $scope.SensorToolCoord = $scope.pro_SensorCoordeData;
        $scope.selectedTrackToolCoorde = $scope.SensorToolCoord[0];
        $scope.selectedSearchToolCoorde = $scope.SensorToolCoord[0];
        $scope.selectedRecordToolCoorde = $scope.SensorToolCoord[0];
        $scope.selectedFTGuardCoorde = $scope.SensorToolCoord[0];
        $scope.selectedFTControlCoorde = $scope.SensorToolCoord[0];
        if ($scope.pointsData == null || $scope.pointsData == undefined) {
            toastFactory.warning(ptDynamicTags.warning_messages[7]);
        } else {
            $scope.optionsData = $scope.pointsData;
            let pointNameArr = Object.keys($scope.optionsData);
            $scope.operation.selectedARC1 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedARC2 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedArcStart = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedLin = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedPTP = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedDMP = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedEAxisPTP = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSCIRC2 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSCIRC1 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSLIN = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSPL = $scope.optionsData[pointNameArr[0]];
            $scope.selectedSegPoint = $scope.optionsData[pointNameArr[0]];
            $scope.selected3DsortHomePoint = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selected3DsortPhotoPoint = $scope.optionsData[pointNameArr[0]];
            $scope.selected3DsortTransPoint = $scope.optionsData[pointNameArr[0]];
            $scope.selected3DPickFunction = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedPalletPoint1 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedPalletPoint2 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedPalletPoint3 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedCircleStart = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedCircle1 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedCircle2 = $scope.optionsData[pointNameArr[0]];
            $scope.selectedCircle3 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSpiral1 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSpiral2 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedSpiral3 = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedNSpiral = $scope.optionsData[pointNameArr[0]];
            $scope.operation.selectedLTSearchDistP = $scope.optionsData[pointNameArr[0]];
            $scope.selectedFocusPoint = $scope.optionsData[pointNameArr[0]];
            if ($scope.optionsData.hasOwnProperty("PosA") && $scope.optionsData.hasOwnProperty("PosB") && $scope.optionsData.hasOwnProperty("PosC")) {
                $scope.PosA = $scope.optionsData.PosA;
                $scope.PosB = $scope.optionsData.PosB;
                $scope.PosC = $scope.optionsData.PosC;
            }
        }
        /* ./程序示教添加程序时，所需基本数据的赋值 */
    }

    /* Move */
    // 展示MoveDO指令范例
    $scope.showMoveDODemo = function() {
        if ($scope.moveDoMode == 1) {
            if ($scope.selectedOnceMoveDOPort.num > 15) {
                if ($scope.selectedMoveDOMode.id == 0) {
                    $scope.cmdMoveDODemo = "MoveToolDOOnceStart(1,-1,1)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveToolDOOnceStop()"+"\n";
                } else {
                    $scope.cmdMoveDODemo = "MoveToolDOOnceStart(1,500,500)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveToolDOOnceStop()"+"\n";
                }
            } else {
                if ($scope.selectedMoveDOMode.id == 0) {
                    $scope.cmdMoveDODemo = "MoveDOOnceStart(1,-1,1)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveDOOnceStop()"+"\n";
                } else {
                    $scope.cmdMoveDODemo = "MoveDOOnceStart(1,500,500)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveDOOnceStop()"+"\n";
                }
            }
        } else {
            if ($scope.selectedMoveDOPort.num > 15) {
                $scope.cmdMoveDODemo = "MoveToolDOStart(1,10,50)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveToolDOStop()"+"\n";
            } else {
                $scope.cmdMoveDODemo = "MoveDOStart(1,10,50)"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveDOStop()"+"\n";
            }
        }
    }

    // 展示MoveAO指令范例
    $scope.showMoveAODemo = function() {
        if ($scope.selectedMoveAOPort.num > 1) {
            $scope.cmdMoveAODemo = "MoveToolAOStart(" + ($scope.selectedMoveAOPort.num - 2) + "," + $scope.maxTcpSpeed + "," + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveToolAOStop()"+"\n";
        } else {
            $scope.cmdMoveAODemo = "MoveAOStart(" + $scope.selectedMoveAOPort.num + "," + $scope.maxTcpSpeed + "," + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")"+"\n"+"Lin(A1,100,0,0,0)"+"\n"+"MoveAOStop()"+"\n";
        }
    }

    if (g_lang_code == "zh") {
        $scope.gotodemo = "::s1::do--s1标签头"+"\n"+"PTP:P1,100--执行内容"+"\n"+"end--s1标签尾"+"\n"+"\n"+"goto s1--跳转到s1标签";
        $scope.ifelsedemo = "if(判断条件1)then"+"\n"+"条件1成立执行命令"+"\n"+"elseif(判断条件2)then"+"\n"+"条件2成立执行命令"+"\n"+"else"+"\n"+"条件1,2不成立执行命令"+"\n"+"end";
        $scope.Threaddemo = "--辅助线程函数定义" + "\n" 
                            + "function auxThread_TCPCom(ip, port)" + "\n"
                            + "	local flag = 0" + "\n"
                            + "	SetSysNumber(1, 0)--系统变量1赋值0" + "\n"
                            + "	while 1 do" + "\n"
                            + "		if flag == 0 then" + "\n"
                            + "			flag = SocketOpen(ip,port, \"socket_0\")--与服务端建立连接" + "\n"
                            + "		elseif flag == 1 then" + "\n"
                            + "			SocketSendString(\"hello world\",\"socket_0\",1)" + "\n"
                            + "			n,svar = SocketReadAsciiFloat(1,\"socket_0\",0)--与服务端交互数据" + "\n"
                            + "			if n == 1 then" + "\n"
                            + "				SetSysNumber(1, svar)--系统变量1赋值svar" + "\n"
                            + "			end" + "\n"
                            + "		end" + "\n"
                            + "	end" + "\n"
                            + "end" + "\n"
                            + "--创建辅助线程" + "\n"
                            + "NewAuxThread(auxThread_TCPCom, {\"127.0.0.1\",8010})" + "\n"
                            + "WaitMs(100)" + "\n"
                            + "while 1 do" + "\n"
                            + "	v  = GetSysNumber(1)--获取系统变量1值" + "\n"
                            + "	if v == 100 then" + "\n"
                            + "		PTP(P1,10,0,0)" + "\n"
                            + "	elseif v == 200 then" + "\n"
                            + "		PTP(P2,10,0,0)" + "\n"
                            + "	end" + "\n"
                            + "end" + "\n";
        $scope.WorkPieceTrsfDemo = "WorkPieceTrsfStart(1)"+"\n"+"PTP(A1,100,0,0)"+"\n"+"PTP(A2,100,0,0)"+"\n"+"PTP(A3,100,0,0)"+"\n"+"WorkPieceTrsfEnd()"+"\n"+"--将需要转换的运动点位（如：A1,A2,A3）放到WorkPieceTrsfStart指令和WorkPieceTrsfEnd指令中间"+"\n";
        $scope.toolTrsfDemo = "SetToolList(toolcoord0)"+"\n"+"ToolTrsfStart(1)"+"\n"+"PTP(A1,100,0,0)"+"\n"+"PTP(A2,100,0,0)"+"\n"+"PTP(A3,100,0,0)"+"\n"+"ToolTrsfEnd()"+"\n"+"--将需要转换的运动点位（如：A1,A2,A3）放到ToolTrsfStart指令和ToolTrsfEnd指令中间"+"\n";
        $scope.showMoveDODemo();
        $scope.showMoveAODemo();
    } else {
        $scope.gotodemo = "::s1::do--s1 tag header"+"\n"+"PTP:P1,100--execution content"+"\n"+"end--s1 tag tail"+"\n"+"\n"+"goto s1--Jump to s1 tab";
        $scope.ifelsedemo = "if(Judgment Condition 1)then"+"\n"+"Condition 1 is satisfied to execute the command"+"\n"+"elseif(Judgment Condition 2)then"+"\n"+"Condition 2 is established to execute the command"+"\n"+"else"+"\n"+"Conditions 1 and 2 are not established to execute the command"+"\n"+"end";
        $scope.Threaddemo = "--Helper thread function definition" + "\n" 
                            + "function auxThread_TCPCom(ip, port)" + "\n"
                            + "	local flag = 0" + "\n"
                            + "	SetSysNumber(1, 0)--System variable 1 is assigned a value of 0" + "\n"
                            + "	while 1 do" + "\n"
                            + "		if flag == 0 then" + "\n"
                            + "			flag = SocketOpen(ip,port, \"socket_0\")--Establish a connection with the server" + "\n"
                            + "		elseif flag == 1 then" + "\n"
                            + "			SocketSendString(\"hello world\",\"socket_0\",1)" + "\n"
                            + "			n,svar = SocketReadAsciiFloat(1,\"socket_0\",0)--Interact data with the server" + "\n"
                            + "			if n == 1 then" + "\n"
                            + "				SetSysNumber(1, svar)--System variable 1 assignment svar" + "\n"
                            + "			end" + "\n"
                            + "		end" + "\n"
                            + "	end" + "\n"
                            + "end" + "\n"
                            + "--Create a helper thread" + "\n"
                            + "NewAuxThread(auxThread_TCPCom, {\"127.0.0.1\",8010})" + "\n"
                            + "WaitMs(100)" + "\n"
                            + "while 1 do" + "\n"
                            + "	v  = GetSysNumber(1)--Get system variable 1 value" + "\n"
                            + "	if v == 100 then" + "\n"
                            + "		PTP(P1,10,0,0)" + "\n"
                            + "	elseif v == 200 then" + "\n"
                            + "		PTP(P2,10,0,0)" + "\n"
                            + "	end" + "\n"
                            + "end" + "\n";
        $scope.WorkPieceTrsfDemo = "WorkPieceTrsfStart(1)"+"\n"+"PTP(A1,100,0,0)"+"\n"+"PTP(A2,100,0,0)"+"\n"+"PTP(A3,100,0,0)"+"\n"+"WorkPieceTrsfEnd()"+"\n"+"--Put the movement points to be converted (for example: A1, A2 and A3) between the WorkPieceTesfStart command and the WorkPieceTrsfEnd command."+"\n";
        $scope.toolTrsfDemo = "SetToolList(toolcoord0)"+"\n"+"ToolTrsfStart(1)"+"\n"+"PTP(A1,100,0,0)"+"\n"+"PTP(A2,100,0,0)"+"\n"+"PTP(A3,100,0,0)"+"\n"+"ToolTrsfEnd()"+"\n"+"--Put the movement points to be converted (for example: A1, A2 and A3) between the ToolTrsfStart command and the ToolTrsfEnd command."+"\n";
        $scope.showMoveDODemo();
        $scope.showMoveAODemo();
    }
    /* ./Move */

    /**
     * 切换焊接输出AO类型
     * @param {index} index 0 A-V , 1 V-V
     */
    $scope.toggleType = function (index) {
        $scope.clickItemTitle = index;
        
        $(".title").removeClass('active');
        $(".title-" + index).addClass('active');
        if (index == 0) {
            getWeldingCurrentRelation();
        } else {
            getWeldingVoltageRelation();
        }
    }

    $scope.show_offset = false;
    $scope.offsetChange = function () {
        if ($scope.selectedOffsetFlag.id == "0") {
            $scope.show_offset = false;
        } else {
            $scope.show_offset = true;
        }
    }

    $scope.show_offset_ARC2 = false;
    //指令中第二点（ARC2）判断是否有偏移
    $scope.offsetChange_ARC2 = function () {
        if ($scope.selectedOffset2Flag.id == "0") {
            $scope.show_offset_ARC2 = false;
        } else{
            $scope.show_offset_ARC2 = true;
        }
    }

    /* 命令界面添加指令功能函数 */
    // 速度计算功能
    $scope.disProgDebugSpeed = function (speed1, speed2) {
        $scope.DebugManualSpeed = ptDynamicTags.info_messages[24] + parseFloat($scope.manualSpeed * speed1 * speed2 * 6 / 1000).toFixed(3) + "cm/min";
        $scope.DebugAutoSpeed = ptDynamicTags.info_messages[25] + parseFloat($scope.autoSpeed * speed1 * speed2 * 6 / 1000).toFixed(3) + "cm/min";
    }

    // 添加关节超速保护指令
    $scope.addJointOverSpeedProtect = function () {
        if ($scope.selectedTreatStrategy.id == 3) {
            $scope.ReturnString = ("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + "," + $scope.speedReductionThreshold + ")");
        } else {
            $scope.ReturnString = ("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + ",0)");
        }
    }

    // 添加过渡点角度调节指令
    $scope.addAngularSpeedStart = function () {
        $scope.ReturnString = ("AngularSpeedStart(" + $scope.angleSpeedThreshold + ")");
    }

    // 添加PTP指令
    $scope.addPTP = function () {
        //PTP指令平滑选择
        if (document.getElementById("proPTPSmoothClose").checked == true) {
            $scope.PTPRadius = -1;
        } else if (document.getElementById("proPTPSmoothOpen").checked == true) {
            $scope.PTPRadius = $scope.PTPCustomRadius;
        }
        if (null == $scope.PTPdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.selectedOffsetFlag.id == "0") {
                if ($scope.programAreaRightType == 'add') {
                    $scope.ReturnCommandArr.commandshow.push("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + ")");
                    $scope.ReturnCommandArr.commandsadd += ("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                } else {
                    $scope.ReturnString = ("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + ")");
                }
                
            } else {
                if (("" == $scope.PTPdx) || ("" == $scope.PTPdy) || ("" == $scope.PTPdz) || ("" == $scope.PTPdrx) || ("" == $scope.PTPdry) || ("" == $scope.PTPdrz)) {
                    toastFactory.info(ptDynamicTags.info_messages[27]);
                } else {
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + "," + $scope.PTPdx + "," + $scope.PTPdy + "," + $scope.PTPdz + "," + $scope.PTPdrx + "," + $scope.PTPdry + "," + $scope.PTPdrz + ")");
                        $scope.ReturnCommandArr.commandsadd += ("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + "," + $scope.PTPdx + "," + $scope.PTPdy + "," + $scope.PTPdz + "," + $scope.PTPdrx + "," + $scope.PTPdry + "," + $scope.PTPdrz + ")" + ";");
                    } else {
                        $scope.ReturnString = ("PTP(" + $scope.operation.selectedPTP.name + "," + $scope.PTPdebugspeed + "," + $scope.PTPRadius + "," + $scope.selectedOffsetFlag.id + "," + $scope.PTPdx + "," + $scope.PTPdy + "," + $scope.PTPdz + "," + $scope.PTPdrx + "," + $scope.PTPdry + "," + $scope.PTPdrz + ")");
                    }
                    
                }
            }
        }
    };

    // Lin指令判断是否为seampos点
    $scope.seamposPoint = function (type) {
        if ($scope.operation[type].name === "seamPos") {
            $scope.show_seampos = true;
        } else {
            $scope.show_seampos = false;
        }
        if ($scope.operation[type].name == "cvrCatchPoint" || $scope.operation[type].name == "cvrRaisePoint") {
            $scope.show_enable_offset = false;
        } else {
            $scope.show_enable_offset = true;
        }
    }

    // lin寻位标志切换
    $scope.changeLinWireSearch = function(){
        if($scope.selectedWireSearchRecord.id == 1){
            $scope.show_Lin_Wire_Search = true;
        }else{
            $scope.show_Lin_Wire_Search = false;
        }
    }
    $scope.changeLinWireSearch();

    /*关节超速保护切换按钮 */
    $scope.changeProtectBtn = function(index) {
        if (!index) {
            protectFlag = undefined;
        } else {
            if ($scope.transPointAngleSpeedEnable) {
                $scope.transPointAngleSpeedEnable = 0;
                angleSpeedFlag = undefined;
            }
        }
    }

    /*过渡点角速度调节切换按钮 */
    $scope.changeTransPointAngleBtn = function(index) {
        if (!index) {
            angleSpeedFlag = undefined;
        } else {
            if ($scope.jointOverspeedProtectEnable) {
                $scope.jointOverspeedProtectEnable = 0;
                protectFlag = undefined;
            }
        }
    }

    //添加LIN指令
    let protectFlag; //关节超速保护标志位
    let angleSpeedFlag; //过渡点角速度调节标志位
    let strategyRecord; //记录关节超速策略，若发生改变则重新嵌套逻辑
    let speedReductionRecord; //记录允许降速阈值
    let angleSpeedRecord; //记录角速度
    $scope.addLin = function () {
        //Lin指令平滑选择
        if (document.getElementById("proLinSmoothClose").checked == true) {
            $scope.LinRadius = -1;
        } else if (document.getElementById("proLinSmoothOpen").checked == true) {
            $scope.LinRadius = $scope.LinCustomRadius;
        }
        if ((null == $scope.Lindebugspeed) || (null == $scope.LinRadius)) {
            toastFactory.info(ptDynamicTags.info_messages[28]);
        } else {
            $scope.handleCommandIndex();
            // 开启LIN指令关节超速保护时添加
            if ($scope.jointOverspeedProtectEnable == 1) {
                if (!protectFlag) {
                    strategyRecord = $scope.selectedTreatStrategy.id;
                    speedReductionRecord = $scope.speedReductionThreshold;
                    $scope.ReturnCommandArr.commandshow.push("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + "," + ($scope.speedReductionThreshold ? $scope.speedReductionThreshold : 0) + ")");
                    $scope.ReturnCommandArr.commandsadd += ("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + "," + ($scope.speedReductionThreshold ? $scope.speedReductionThreshold : 0) + ")" + ";");
                } else {
                    // 在关节超速保护指令之间添加lin指令
                    if ($scope.selectedTreatStrategy.id == strategyRecord && $scope.speedReductionThreshold == speedReductionRecord) {
                        const lastAddIndex = $scope.addCommandIndexArr[$scope.addCommandIndexArr.length - 1];
                        $scope.ReturnCommandArr.commandsadd = $scope.ReturnCommandArr.commandsadd.slice(0, lastAddIndex-27);
                        $scope.ReturnCommandArr.commandshow = $scope.ReturnCommandArr.commandshow.splice(0, $scope.ReturnCommandArr.commandshow.length - 1);
                    } else {
                        strategyRecord = $scope.selectedTreatStrategy.id;
                        speedReductionRecord = $scope.speedReductionThreshold;
                        $scope.ReturnCommandArr.commandshow.push("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + "," + ($scope.speedReductionThreshold ? $scope.speedReductionThreshold : 0) + ")");
                        $scope.ReturnCommandArr.commandsadd += ("JointOverSpeedProtectStart(" + $scope.selectedTreatStrategy.id + "," + ($scope.speedReductionThreshold ? $scope.speedReductionThreshold : 0) + ")" + ";");
                    }
                }
            }
            // 开启LIN指令过渡点角速度
            if ($scope.transPointAngleSpeedEnable == 1) {
                if (!angleSpeedFlag) {
                    angleSpeedRecord = $scope.angleSpeedThreshold;
                    $scope.ReturnCommandArr.commandshow.push("AngularSpeedStart(" + ($scope.angleSpeedThreshold ? $scope.angleSpeedThreshold : 0) + ")");
                    $scope.ReturnCommandArr.commandsadd += ("AngularSpeedStart(" + ($scope.angleSpeedThreshold ? $scope.angleSpeedThreshold : 0) + ")" + ";");
                } else {
                    if ($scope.angleSpeedThreshold == angleSpeedRecord) {
                        const lastAddIndex = $scope.addCommandIndexArr[$scope.addCommandIndexArr.length - 1];
                        $scope.ReturnCommandArr.commandsadd = $scope.ReturnCommandArr.commandsadd.slice(0, lastAddIndex-18);
                        $scope.ReturnCommandArr.commandshow = $scope.ReturnCommandArr.commandshow.splice(0, $scope.ReturnCommandArr.commandshow.length - 1);
                    } else {
                        angleSpeedRecord = $scope.angleSpeedThreshold;
                        $scope.ReturnCommandArr.commandshow.push("AngularSpeedStart(" + ($scope.angleSpeedThreshold ? $scope.angleSpeedThreshold : 0) + ")");
                        $scope.ReturnCommandArr.commandsadd += ("AngularSpeedStart(" + ($scope.angleSpeedThreshold ? $scope.angleSpeedThreshold : 0) + ")" + ";");
                    }
                }
            }
            if ($scope.operation.selectedLin.name === "seamPos") {
                if ($scope.selectedOffsetFlag.id == "0") {
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                    } else {
                        $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + ")");
                    }
                    
                } else {
                    if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                        toastFactory.info(ptDynamicTags.info_messages[28]);
                    } else {
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                        }
                        
                    }
                }
            } else {
                if ($scope.selectedWireSearchRecord.id == "0") {
                    if ($scope.selectedOffsetFlag.id == "0") {
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                        }
                    } else {
                        if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                            toastFactory.info(ptDynamicTags.info_messages[28]);
                        } else {
                            if ($scope.programAreaRightType == 'add') {
                                $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                                $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                            } else {
                                $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                            }
                        }
                    }
                } else {
                    if ($scope.selectedOffsetFlag.id == "0") {
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                            $scope.ReturnCommandArr.commandshow.push("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")");
                            $scope.ReturnCommandArr.commandsadd += ("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")" + ";");
                        } else {
                            $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                        }
                    } else {
                        if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                            toastFactory.info(ptDynamicTags.info_messages[28]);
                        } else {
                            if ($scope.programAreaRightType == 'add') {
                                $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                                $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                                $scope.ReturnCommandArr.commandshow.push("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")");
                                $scope.ReturnCommandArr.commandsadd += ("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")" + ";");
                            } else {
                                $scope.ReturnString = ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                            }
                        }
                    }
                }
            }
            // 开启LIN指令关节超速保护时添加
            if ($scope.jointOverspeedProtectEnable == 1) {
                $scope.ReturnCommandArr.commandshow.push("JointOverSpeedProtectEnd()");
                $scope.ReturnCommandArr.commandsadd += ("JointOverSpeedProtectEnd()" + ";");
                $scope.show_joint_overspeed = false;
                protectFlag = 1;
            }
            // 开启过渡点角度调节时添加
            if ($scope.transPointAngleSpeedEnable == 1) {
                $scope.ReturnCommandArr.commandshow.push("AngularSpeedEnd()");
                $scope.ReturnCommandArr.commandsadd += ("AngularSpeedEnd()" + ";");
                $scope.show_angle_speed = false;
                angleSpeedFlag = 1;
            }
        }
    };

    //添加ARC指令
    $scope.addARC = function () {
        //Arc指令平滑选择
        if(document.getElementById("proArcSmoothClose").checked == true){
            $scope.ARCRadius = -1;
        }else if(document.getElementById("proArcSmoothOpen").checked == true){
            $scope.ARCRadius = $scope.ArcCustomRadius;
        }
        if ((null == $scope.ARCdebugspeed) || (null == $scope.ARCRadius)) {
            toastFactory.info(ptDynamicTags.info_messages[29]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedArcStartMove.id == '1') {
                    $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedArcStart.name + ",100,-1,0,0" + ")");
                    $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedArcStart.name + ",100,-1,0,0" + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("PTP(" + $scope.operation.selectedArcStart.name + ",100,-1,0" + ")");
                    $scope.ReturnCommandArr.commandsadd += ("PTP(" + $scope.operation.selectedArcStart.name + ",100,-1,0" + ")" + ";");
                }
                $scope.ReturnCommandArr.commandshow.push("ARC(" + $scope.operation.selectedARC1.name + "," + $scope.selectedOffsetFlag.id + ","
                    + $scope.ARC1dx + "," + $scope.ARC1dy + "," + $scope.ARC1dz + "," + $scope.ARC1drx + "," + $scope.ARC1dry + "," + $scope.ARC1drz
                    + "," + $scope.operation.selectedARC2.name + "," + $scope.selectedOffset2Flag.id + "," + $scope.ARC2dx + "," + $scope.ARC2dy
                    +"," + $scope.ARC2dz + "," + $scope.ARC2drx + "," + $scope.ARC2dry + "," + $scope.ARC2drz + "," + $scope.ARCdebugspeed + "," + $scope.ARCRadius + ")");
                $scope.ReturnCommandArr.commandsadd += ("ARC(" + $scope.operation.selectedARC1.name + "," + $scope.selectedOffsetFlag.id + ","
                    + $scope.ARC1dx + "," + $scope.ARC1dy + "," + $scope.ARC1dz + "," + $scope.ARC1drx + "," + $scope.ARC1dry + "," + $scope.ARC1drz
                    + "," + $scope.operation.selectedARC2.name + "," + $scope.selectedOffset2Flag.id + "," + $scope.ARC2dx + "," + $scope.ARC2dy + ","
                    + $scope.ARC2dz + "," + $scope.ARC2drx + "," + $scope.ARC2dry + "," + $scope.ARC2drz + "," + $scope.ARCdebugspeed + "," + $scope.ARCRadius + ")" + ";");
            } else {
                $scope.ReturnString =  ("ARC(" + $scope.operation.selectedARC1.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.ARC1dx + "," + $scope.ARC1dy + ","
                    + $scope.ARC1dz + "," + $scope.ARC1drx + "," + $scope.ARC1dry + "," + $scope.ARC1drz + "," + $scope.operation.selectedARC2.name + ","
                    + $scope.selectedOffset2Flag.id + "," + $scope.ARC2dx + "," + $scope.ARC2dy + "," + $scope.ARC2dz + "," + $scope.ARC2drx + ","
                    + $scope.ARC2dry + "," + $scope.ARC2drz + "," + $scope.ARCdebugspeed + "," + $scope.ARCRadius + ")");
            }
        }
    };

    // 添加Circle指令
    $scope.addCircle = function () {
        if (null == $scope.Circledebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[30]);
        } else {
            if ($scope.programAreaRightType == 'add') {
                $scope.handleCommandIndex();
                if ($scope.selectedCircleStartMove.id == '1') {
                    $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedCircleStart.name + ",100,-1,0,0" + ")");
                    $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedCircleStart.name + ",100,-1,0,0" + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("PTP(" + $scope.operation.selectedCircleStart.name + ",100,-1,0" + ")");
                    $scope.ReturnCommandArr.commandsadd += ("PTP(" + $scope.operation.selectedCircleStart.name + ",100,-1,0" + ")" + ";");
                }
            }
            // 相同偏移量 -- 设置一个偏移量
            if ($scope.selectedOffsetType == 1) {
                if ($scope.selectedOffsetFlag.id == "0") {
                    $scope.handleCommandIndex();
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                    } else {
                        $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")");
                    }
                } else {
                    if (("" == $scope.Circledx) || ("" == $scope.Circledy) || ("" == $scope.Circledz) || ("" == $scope.Circledrx) || ("" == $scope.Circledry) || ("" == $scope.Circledrz)) {
                        toastFactory.info(ptDynamicTags.info_messages[30]);
                    } else {
                        $scope.handleCommandIndex();
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + ")");
                        }
                    }
                }
            } else {
                // 不同偏移量 -- 分别设置两个偏移量
                if ($scope.selectedOffset1Flag.id == "0" && $scope.selectedOffsetFlag.id == "0") {
                    $scope.handleCommandIndex();
                    // 点1、点2都不偏移
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                    } else {
                        $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.operation.selectedCircle2.name + "," + $scope.Circledebugspeed + "," + $scope.selectedOffsetFlag.id + ")");
                    }
                    
                } else if ($scope.selectedOffset1Flag.id != "0" && $scope.selectedOffsetFlag.id == "0") {
                    // 只有点1偏移
                    if (("" == $scope.Circledx1) || ("" == $scope.Circledy1) || ("" == $scope.Circledz1) || ("" == $scope.Circledrx1) || ("" == $scope.Circledry1) || ("" == $scope.Circledrz1)) {
                        toastFactory.info(ptDynamicTags.info_messages[30]);
                    } else {
                        $scope.handleCommandIndex();
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + ",0," + $scope.Circledebugspeed + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + ",0," + $scope.Circledebugspeed + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + ",0," + $scope.Circledebugspeed + ")");
                        }
                    }
                } else if ($scope.selectedOffset1Flag.id == "0" && $scope.selectedOffsetFlag.id != "0") {
                    // 只有点2偏移
                    if (("" == $scope.Circledx) || ("" == $scope.Circledy) || ("" == $scope.Circledz) || ("" == $scope.Circledrx) || ("" == $scope.Circledry) || ("" == $scope.Circledrz)) {
                        toastFactory.info(ptDynamicTags.info_messages[30]);
                    } else {
                        $scope.handleCommandIndex();
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + ",0," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + ",0," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + ",0," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")");
                        }
                        
                    }
                } else {
                    // 点1、点2都偏移
                    if (("" == $scope.Circledx1) || ("" == $scope.Circledy1) || ("" == $scope.Circledz1) || ("" == $scope.Circledrx1) || ("" == $scope.Circledry1) || ("" == $scope.Circledrz1) || ("" == $scope.Circledx) || ("" == $scope.Circledy) || ("" == $scope.Circledz) || ("" == $scope.Circledrx) || ("" == $scope.Circledry) || ("" == $scope.Circledrz)) {
                        toastFactory.info(ptDynamicTags.info_messages[30]);
                    } else {
                        $scope.handleCommandIndex();
                        if ($scope.programAreaRightType == 'add') {
                            $scope.ReturnCommandArr.commandshow.push("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")" + ";");
                        } else {
                            $scope.ReturnString = ("Circle(" + $scope.operation.selectedCircle1.name + "," + $scope.selectedOffset1Flag.id + "," + $scope.Circledx1 + "," + $scope.Circledy1 + "," + $scope.Circledz1 + "," + $scope.Circledrx1 + "," + $scope.Circledry1 + "," + $scope.Circledrz1 + "," + $scope.operation.selectedCircle2.name + "," + $scope.selectedOffsetFlag.id + "," + $scope.Circledx + "," + $scope.Circledy + "," + $scope.Circledz + "," + $scope.Circledrx + "," + $scope.Circledry + "," + $scope.Circledrz + "," + $scope.Circledebugspeed + ")");
                        }
                    }
                }
            }
        }
    };

    //添加Spiral指令
    $scope.addSpiral = function () {
        if (null == $scope.Spiraldebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[31]);
        } else {
            if ($scope.selectedOffsetFlag.id == "0") {
                $scope.handleCommandIndex();
                if ($scope.programAreaRightType == 'add') {
                    $scope.ReturnCommandArr.commandshow.push("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                        + "," + $scope.selectedOffsetFlag.id+ ",0,0,0,0,0,0," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                        + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")");
                    $scope.ReturnCommandArr.commandsadd += ("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                        + "," + $scope.selectedOffsetFlag.id+ ",0,0,0,0,0,0," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                        + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")" + ";");
                } else {
                    $scope.ReturnString = ("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                        + "," + $scope.selectedOffsetFlag.id+ ",0,0,0,0,0,0," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                        + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")");
                }
            } else {
                if (("" == $scope.Spiraldx) || ("" == $scope.Spiraldy) || ("" == $scope.Spiraldz) || ("" == $scope.Spiraldrx) || ("" == $scope.Spiraldry) || ("" == $scope.Spiraldrz)) {
                    toastFactory.info(ptDynamicTags.info_messages[31]);
                } else {
                    $scope.handleCommandIndex();
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                            + "," + $scope.selectedOffsetFlag.id + "," + $scope.Spiraldx + "," + $scope.Spiraldy + "," + $scope.Spiraldz + "," + $scope.Spiraldrx + "," + $scope.Spiraldry + "," + $scope.Spiraldrz
                            + "," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                            + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                            + "," + $scope.selectedOffsetFlag.id + "," + $scope.Spiraldx + "," + $scope.Spiraldy + "," + $scope.Spiraldz + "," + $scope.Spiraldrx + "," + $scope.Spiraldry + "," + $scope.Spiraldrz
                            + "," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                            + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")" + ";");
                    } else {
                        $scope.ReturnString = ("Spiral(" + $scope.operation.selectedSpiral1.name + "," + $scope.operation.selectedSpiral2.name+ "," + $scope.operation.selectedSpiral3.name + "," + $scope.Spiraldebugspeed
                            + "," + $scope.selectedOffsetFlag.id + "," + $scope.Spiraldx + "," + $scope.Spiraldy + "," + $scope.Spiraldz + "," + $scope.Spiraldrx + "," + $scope.Spiraldry + "," + $scope.Spiraldrz
                            + "," + $scope.spiralCircleNum + "," + $scope.spiralDipAngleRx + "," + $scope.spiralDipAngleRy + "," + $scope.spiralDipAngleRz
                            + "," + $scope.spiralRadiusAdd + "," + $scope.spiralRotAxisAdd + ")");
                    }
                }
            }
        }
    };

    // 添加NSpiral指令
    $scope.addNSpiral = function () {
        if (null == $scope.NSpiraldebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[32]);
        } else {
            if ($scope.selectedNSpiralOffsetFlag.id == "0") {
                $scope.handleCommandIndex();
                if ($scope.programAreaRightType == 'add') {
                    $scope.ReturnCommandArr.commandshow.push("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id+ ",0,0,0,0,0,0"
                        + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + "," + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")");
                    $scope.ReturnCommandArr.commandsadd += ("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id+ ",0,0,0,0,0,0"
                        + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + "," + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")");
                } else {
                    $scope.ReturnString = ("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id+ ",0,0,0,0,0,0"
                        + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + "," + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")");
                }
            } else {
                if (("" == $scope.NSpiraldx) || ("" == $scope.NSpiraldy) || ("" == $scope.NSpiraldz) || ("" == $scope.NSpiraldrx) || ("" == $scope.NSpiraldry) || ("" == $scope.NSpiraldrz)) {
                    toastFactory.info(ptDynamicTags.info_messages[32]);
                } else {
                    $scope.handleCommandIndex();
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("PTP(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ ",0," + $scope.selectedNSpiralOffsetFlag.id
                            + "," + $scope.NspiralOriginRadius + ",0,0,- " + $scope.NspiralDipAngle + ",0,0)");
                        $scope.ReturnCommandArr.commandshow.push("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id
                            + "," + $scope.NspiralOriginRadius + ",0,0,- " + $scope.NspiralDipAngle + ",0,0" + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + ","
                            + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("PTP(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ ",0," + $scope.selectedNSpiralOffsetFlag.id
                            + "," + $scope.NspiralOriginRadius + ",0,0,- " + $scope.NspiralDipAngle + ",0,0)" + ";");
                        $scope.ReturnCommandArr.commandsadd += ("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id
                            + "," + $scope.NspiralOriginRadius + ",0,0,- " + $scope.NspiralDipAngle + ",0,0" + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + ","
                            + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")" + ";");
                    } else {
                        $scope.ReturnString = ("NewSpiral(" + $scope.operation.selectedNSpiral.name + "," + $scope.NSpiraldebugspeed+ "," + $scope.selectedNSpiralOffsetFlag.id
                            + "," + $scope.NspiralOriginRadius + ",0,0,- " + $scope.NspiralDipAngle + ",0,0" + "," + $scope.NspiralCircleNum + "," + $scope.NspiralDipAngle + ","
                            + $scope.NspiralOriginRadius + "," + $scope.NspiralRadiusAdd + "," + $scope.NspiralRotAxisAdd+ "," + $scope.selectedSpiralDirection.id + ")");
                    }
                }
            }
        }
    };

    /**
     * 添加HSpiral运动开始指令
     */
    $scope.addHorizonSpiralMotionStart = function() {
        if (!$scope.HSpiralRadius) {
            $scope.HSpiralRadius = $('#HSpiralRadius').val();
        }
        if (!$scope.HSpiralSpeed) {
            $scope.HSpiralSpeed = $('#HSpiralSpeed').val();
        }
        if (!$scope.HSpiralSpeed) {
            $scope.HSpiralSpeed = $('#HSpiralSpeed').val();
        }
        if (!$scope.HSpiralRadius) {
            toastFactory.info(ptDynamicTags.info_messages[218]);
            return;
        }
        if (!$scope.HSpiralSpeed) {
            toastFactory.info(ptDynamicTags.info_messages[219]);
            return;
        }
        if (!$scope.HSpiralAngle) {
            toastFactory.info(ptDynamicTags.info_messages[220]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("HorizonSpiralMotionStart(" + $scope.HSpiralRadius + "," + $scope.HSpiralSpeed + "," + $scope.selectedHSpiralDirection.id + "," + $scope.HSpiralAngle + ")");
            $scope.ReturnCommandArr.commandsadd += ("HorizonSpiralMotionStart(" + $scope.HSpiralRadius + "," + $scope.HSpiralSpeed + "," + $scope.selectedHSpiralDirection.id + "," + $scope.HSpiralAngle + ");");
        } else {
            $scope.ReturnString = ("HorizonSpiralMotionStart(" + $scope.HSpiralRadius + "," + $scope.HSpiralSpeed + "," + $scope.selectedHSpiralDirection.id + "," + $scope.HSpiralAngle + ")");
        }
    }

    /**
     * 添加HSpiral运动开始指令
     */
    $scope.addHorizonSpiralMotionEnd = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("HorizonSpiralMotionEnd()");
        $scope.ReturnCommandArr.commandsadd += ("HorizonSpiralMotionEnd();");
    }

    //读取DO配置文件
    $scope.DOcfgArr = [];
    function getDOcfg() {
        $scope.DOcfgArr = [];
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.DOcfgArr[0] = ~~data.ctl_do8_config;
                $scope.DOcfgArr[1] = ~~data.ctl_do9_config;
                $scope.DOcfgArr[2] = ~~data.ctl_do10_config;
                $scope.DOcfgArr[3] = ~~data.ctl_do11_config;
                $scope.DOcfgArr[4] = ~~data.ctl_do12_config;
                $scope.DOcfgArr[5] = ~~data.ctl_do13_config;
                $scope.DOcfgArr[6] = ~~data.ctl_do14_config;
                $scope.DOcfgArr[7] = ~~data.ctl_do15_config;
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[16]);
            });
    }

    //阻塞选择切换是否平滑
    $scope.changeSetioMode = function (index) {
        if (index == 1) {
            $scope.show_SetIo_Block = false;
        } else {
            $scope.show_SetIo_Block = true;
        }
    }

    //添加SetIO指令
    $scope.addSetIO = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedSetIOBlock.num == 1) {
                if ($scope.selectedSetioPort.num > 15) {
                    $scope.ReturnCommandArr.commandshow.push("SPLCSetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + $scope.selectedSetioState.num + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SPLCSetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + $scope.selectedSetioState.num + ")" + ";");
                }
                else {
                    if ($scope.selectedSetioPort.num > 7) {
                        if (0 != $scope.DOcfgArr[$scope.selectedSetioPort.num - 8]) {
                            toastFactory.warning("DO" + $scope.selectedSetioPort.num + ptDynamicTags.info_messages[33]);
                        } else {
                            $scope.ReturnCommandArr.commandshow.push("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")");
                            $scope.ReturnCommandArr.commandsadd += ("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")" + ";");
                        }
                    } else {
                        $scope.ReturnCommandArr.commandshow.push("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")" + ";");
                    }
                }
            } else {
                let tempData = $scope.selectedSetioState.num + "," + $scope.selectedSetioMode.num + "," + $scope.selectedSetioThread.id;
                if ($scope.selectedSetioPort.num > 15) {
                    $scope.ReturnCommandArr.commandshow.push("SetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + tempData + ")" + ";");
                }
                else {
                    if ($scope.selectedSetioPort.num > 7) {
                        if (0 != $scope.DOcfgArr[$scope.selectedSetioPort.num - 8]) {
                            toastFactory.warning("DO" + $scope.selectedSetioPort.num + ptDynamicTags.info_messages[33]);
                        } else {
                            $scope.ReturnCommandArr.commandshow.push("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")");
                            $scope.ReturnCommandArr.commandsadd += ("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")" + ";");
                        }
                    } else {
                        $scope.ReturnCommandArr.commandshow.push("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")" + ";");
                    }
                }
            }
        } else {
            if ($scope.selectedSetIOBlock.num == 1) {
                if ($scope.selectedSetioPort.num > 15) {
                    $scope.ReturnString = ("SPLCSetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + $scope.selectedSetioState.num + ")");
                }
                else {
                    if ($scope.selectedSetioPort.num > 7) {
                        if (0 != $scope.DOcfgArr[$scope.selectedSetioPort.num - 8]) {
                            toastFactory.warning("DO" + $scope.selectedSetioPort.num + ptDynamicTags.warning_messages[33]);
                        } else {
                            $scope.ReturnString = ("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")");
                        }
                    } else {
                        $scope.ReturnString = ("SPLCSetDO(" + $scope.selectedSetioPort.num + "," + $scope.selectedSetioState.num + ")");
                    }
                }
            } else {
                let tempData = $scope.selectedSetioState.num + "," + $scope.selectedSetioMode.num + "," + $scope.selectedSetioThread.id;
                if ($scope.selectedSetioPort.num > 15) {
                    $scope.ReturnString = ("SetToolDO(" + ($scope.selectedSetioPort.num-16) + "," + tempData + ")");
                }
                else {
                    if ($scope.selectedSetioPort.num > 7) {
                        if (0 != $scope.DOcfgArr[$scope.selectedSetioPort.num - 8]) {
                            toastFactory.warning("DO" + $scope.selectedSetioPort.num + ptDynamicTags.warning_messages[33]);
                        } else {
                            $scope.ReturnString = ("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")");
                        }
                    } else {
                        $scope.ReturnString = ("SetDO(" + $scope.selectedSetioPort.num + "," + tempData + ")");
                    }
                }
            }
        }
    };

    //阻塞选择切换是否平滑
    $scope.changeGetIOMode = function (index) {
        if (index == 1) {
            $scope.show_GetIO_Block = true;
            $scope.selectedGetIOState = $scope.IOState[0];
        } else {
            $scope.show_GetIO_Block = false;
        }
    }

    //添加GetIO指令
    $scope.addGetIO = function () {
        if ($scope.selectedGetIOBlock.num == 1) {
            if (null == $scope.GetIOwaittime) {
                toastFactory.info(ptDynamicTags.info_messages[34]);
                return;
            }
            $scope.handleCommandIndex();
            if ($scope.selectedGetIOPort.num > 15) {
                $scope.ReturnCommandArr.commandshow.push("SPLCGetToolDI(" + ($scope.selectedGetIOPort.num-15) + "," + $scope.selectedGetIOState.num + "," + $scope.GetIOwaittime + ")");
                $scope.ReturnCommandArr.commandsadd += ("SPLCGetToolDI(" + ($scope.selectedGetIOPort.num-15) + "," + $scope.selectedGetIOState.num + "," + $scope.GetIOwaittime + ");");
            }
            else {
                $scope.ReturnCommandArr.commandshow.push("SPLCGetDI(" + $scope.selectedGetIOPort.num + "," + $scope.selectedGetIOState.num + "," + $scope.GetIOwaittime + ")");
                $scope.ReturnCommandArr.commandsadd += ("SPLCGetDI(" + $scope.selectedGetIOPort.num + "," + $scope.selectedGetIOState.num + "," + $scope.GetIOwaittime + ");");
            }
        } else {
            $scope.handleCommandIndex();
            if ($scope.selectedGetIOPort.num > 15) {
                $scope.ReturnCommandArr.commandshow.push("GetToolDI(" + ($scope.selectedGetIOPort.num-15) + "," + $scope.selectedGetioThread.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("GetToolDI(" + ($scope.selectedGetIOPort.num-15) + "," + $scope.selectedGetioThread.id + ");");
            }
            else {
                $scope.ReturnCommandArr.commandshow.push("GetDI(" + $scope.selectedGetIOPort.num + "," + $scope.selectedGetioThread.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("GetDI(" + $scope.selectedGetIOPort.num + "," + $scope.selectedGetioThread.id + ");");
            }
        }
    };

    //添加While_do指令
    $scope.addWhile = function () {
        switch ($scope.whileType) {
            case '0':
                $scope.handleCommandIndex();
                $scope.ReturnCommandArr.commandshow.push("while (1) do ");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("while (1) do " + "end" + ";");
                break;
            case '1':
                if ($scope.whileVariable == '' || $scope.whileTimes == '') {
                    toastFactory.info(ptDynamicTags.info_messages[35]);
                } else {
                    $scope.handleCommandIndex();
                    $scope.ReturnCommandArr.commandshow.push(`${$scope.whileVariable} = 0 `);
                    $scope.ReturnCommandArr.commandshow.push("while (" + `${$scope.whileVariable} < ${$scope.whileTimes}` + ") " + "do ");
                    $scope.ReturnCommandArr.commandshow.push(`${$scope.whileVariable} = ${$scope.whileVariable} + 1`);
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += (`${$scope.whileVariable} = 0 ` + "while (" + `${$scope.whileVariable} < ${$scope.whileTimes}` + ") " + "do " + `${$scope.whileVariable} = ${$scope.whileVariable} + 1` + "end" + ";");
                }
                break;
            case '2':
                if ($scope.whileData == '' || $scope.whileData == undefined) {
                    toastFactory.info(ptDynamicTags.info_messages[35]);
                } else {
                    $scope.handleCommandIndex();
                    $scope.ReturnCommandArr.commandshow.push("while (" + $scope.whileData + ") " + "do ");
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += ("while (" + $scope.whileData + ") " + "do " + "end" + ";");
                }
                break;
            default:
                break;
        }
    };

    //拆分字符串返回数组
    function createCommandsArray(commandsData) {
        let commandsArray = commandsData.split('\n');
        return commandsArray;
    };

    /* if-else指令 */
    $scope.hasElse = false; // 是否存在else表达式
    $scope.hasElseIf = false; // 是否存在else if表达式
    $scope.elseIndexArr = [];
    $scope.ifText = ptDynamicTags.info_messages[252];
    $scope.elseIfText = ptDynamicTags.info_messages[254];
    // 添加else、else if
    $scope.addIfElseContent = function(type) {
        const ifElseList = document.querySelector('#if-else-content ul');
        const ifElseLiList = Array.from(document.querySelectorAll('#if-else-content ul li span'));
        if (ifElseLiList.find(item => item.innerText.trim() == 'else')) {
            toastFactory.info(ptDynamicTags.info_messages[256]);
        } else {
            let li = document.createElement('li');
            li.style.height = "50px";
            switch (type) {
                case 0:
                    li.innerHTML = `<span class="block text-left" style="width: 180px;">else</span>`;
                    $scope.hasElse = true;
                    break;
                case 1:
                    if ($scope.elseIndexArr.length) {
                        $scope.elseIndexArr.push(Number($scope.elseIndexArr[$scope.elseIndexArr.length - 1]) + 1);
                    } else {
                        $scope.elseIndexArr.push(1);
                    }
                    li.innerHTML = `<span class="block text-left" style="width: 180px;">${$scope.elseIfText}</span>
                        <input class="else-input" type="text" style="width: 180px;" ng-model="if${$scope.elseIndexArr[$scope.elseIndexArr.length - 1]}Data" ng-click="toggleExpressionInputter($event)"/>`;
                    $scope.hasElseIf = true;
                    break;
                default:
                    break;
            }
            ifElseList.appendChild(li);
            $compile(ifElseList)($scope);
            
        }
    }
    
    // 删除else、else if
    $scope.deleteIfElseContent = function(type) {
        const ifElseList = document.querySelector('#if-else-content ul');
        const ifElseLiList = Array.from(document.querySelectorAll('#if-else-content ul li'));
        const ifElseLiSpanList = Array.from(document.querySelectorAll('#if-else-content ul li span'));
        let ifElseRemoveLiIndex;
        switch (type) {
            case 0:
                ifElseLiSpanList.forEach((item, index) => {
                    if (item.innerText.trim() == 'else') {
                        ifElseRemoveLiIndex = index;
                        $scope.hasElse = false;
                    }
                })
                break;
            case 1:
                ifElseLiSpanList.forEach((item, index) => {
                    if (item.innerText.trim() == $scope.elseIfText) {
                        ifElseRemoveLiIndex = index;
                    }
                })
                break;
            default:
                break;
        }
        if (ifElseRemoveLiIndex) {
            ifElseList.removeChild(ifElseLiList[ifElseRemoveLiIndex]);
            if ($scope.elseIndexArr.length) {
                $scope.elseIndexArr.pop();
            }
        } else {
            toastFactory.info(ptDynamicTags.info_messages[257]);
        }
        // 判断移除else if表达式是否存在
        const newIfElseLiList = Array.from(document.querySelectorAll('#if-else-content ul li'));
        if (newIfElseLiList.find(item => item.innerText.trim() ==  $scope.elseIfText)) {
            $scope.hasElseIf = true;
        } else {
            $scope.hasElseIf = false;
        }
    }

    // 添加if_else指令
    $scope.addIfElse = function () {
        if ($scope.ifData == '' || $scope.ifData == undefined || $scope.ifData == null) {
            toastFactory.info(ptDynamicTags.info_messages[36]);
            return;
        }
        if ($scope.hasElseIf && ($scope.elseIndexArr.find(item => $scope[`if${item}Data`] == '' || $scope[`if${item}Data`] == undefined || $scope[`if${item}Data`] == null))) {
            toastFactory.info(ptDynamicTags.info_messages[36]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("if " + $scope.ifData + " " + "then");
        $scope.ReturnCommandArr.commandsadd += ("if " + $scope.ifData + " " + "then " + ";");
        if (!$scope.hasElse && !$scope.hasElseIf) {
            $scope.ReturnCommandArr.commandshow.push("end");
            $scope.ReturnCommandArr.commandsadd += ("end" + ";");
        }
        if ($scope.hasElseIf) {
            $scope.elseIndexArr.forEach(item => {
                $scope.ReturnCommandArr.commandshow.push("elseif " + $scope[`if${item}Data`] + " " + "then");
                $scope.ReturnCommandArr.commandsadd += ("elseif " + $scope[`if${item}Data`] + " " + "then " + ";");
            })
            if (!$scope.hasElse) {
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("end" + ";");
            }
        }
        if ($scope.hasElse) {
            $scope.ReturnCommandArr.commandshow.push("else");
            $scope.ReturnCommandArr.commandshow.push("end");
            $scope.ReturnCommandArr.commandsadd += ("else" + ";");
            $scope.ReturnCommandArr.commandsadd += ("end" + ";");
        }
    };
    /* ./if-else指令 */

    // 添加Wait指令
    $scope.addWaitTime = function () {
        if ($scope.waittime != undefined || $scope.waittime != null) {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("WaitMs(" + $scope.waittime + ")");
                $scope.ReturnCommandArr.commandsadd += ("WaitMs(" + $scope.waittime + ")" + ";");
            } else {
                $scope.ReturnString = ("WaitMs(" + $scope.waittime + ")");
            }
        } else {
            toastFactory.info(ptDynamicTags.info_messages[37]);
        }
    };

    // 添加WaitDI指令
    $scope.addWaitDI = function() {
        if ($scope.selectedWaitDIMotion.num == 2) {
            $scope.handleCommandIndex();
            let tempData = $scope.selectedWaitDIState.num + ",0" + "," + $scope.selectedWaitDIMotion.num;
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedWaitDIPort.num > 15) {
                    $scope.ReturnCommandArr.commandshow.push("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")" + ";");
                }
            } else {
                if ($scope.selectedWaitDIPort.num > 15) {
                    $scope.ReturnString = ("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")");
                } else {
                    $scope.ReturnString = ("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")");
                }
            }
        } else {
            if (null == $scope.waitDItime) {
                toastFactory.info(ptDynamicTags.info_messages[38]);
            } else {
                $scope.handleCommandIndex();
                let tempData = $scope.selectedWaitDIState.num + "," + $scope.waitDItime + "," + $scope.selectedWaitDIMotion.num;
                if ($scope.programAreaRightType == 'add') {
                    if ($scope.selectedWaitDIPort.num > 15) {
                        $scope.ReturnCommandArr.commandshow.push("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")");
                        $scope.ReturnCommandArr.commandsadd += ("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")" + ";");
                    } else {
                        $scope.ReturnCommandArr.commandshow.push("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")");
                        $scope.ReturnCommandArr.commandsadd += ("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")" + ";");
                    }
                } else {
                    if ($scope.selectedWaitDIPort.num > 15) {
                        $scope.ReturnString = ("WaitToolDI(" + ($scope.selectedWaitDIPort.num - 15) + "," + tempData + ")");
                    } else {
                        $scope.ReturnString = ("WaitDI(" + $scope.selectedWaitDIPort.num + "," + tempData + ")");
                    }
                }
            }
        }
    };

    // waitmultidi选择
    $scope.setMultiDI = function(string) {
        let cbItem = document.getElementById("Wait_Multi_" + string);
        if (cbItem.checked == true) {
            switch (string) {
                case "DI0":
                    $scope.select_multi_DI0 = 1;
                    break;
                case "DI1":
                    $scope.select_multi_DI1 = 1;
                    break;
                case "DI2":
                    $scope.select_multi_DI2 = 1;
                    break;
                case "DI3":
                    $scope.select_multi_DI3 = 1;
                    break;
                case "DI4":
                    $scope.select_multi_DI4 = 1;
                    break;
                case "DI5":
                    $scope.select_multi_DI5 = 1;
                    break;
                case "DI6":
                    $scope.select_multi_DI6 = 1;
                    break;
                case "DI7":
                    $scope.select_multi_DI7 = 1;
                    break;
                case "CI0":
                    $scope.select_multi_CI0 = 1;
                    break;
                case "CI1":
                    $scope.select_multi_CI1 = 1;
                    break;
                case "CI2":
                    $scope.select_multi_CI2 = 1;
                    break;
                case "CI3":
                    $scope.select_multi_CI3 = 1;
                    break;
                case "CI4":
                    $scope.select_multi_CI4 = 1;
                    break;
                case "CI5":
                    $scope.select_multi_CI5 = 1;
                    break;
                case "CI6":
                    $scope.select_multi_CI6 = 1;
                    break;
                case "CI7":
                    $scope.select_multi_CI7 = 1;
                    break;
                default:
                    break;
            }
        } else {
            switch (string) {
                case "DI0":
                    $scope.select_multi_DI0 = 0;
                    break;
                case "DI1":
                    $scope.select_multi_DI1 = 0;
                    break;
                case "DI2":
                    $scope.select_multi_DI2 = 0;
                    break;
                case "DI3":
                    $scope.select_multi_DI3 = 0;
                    break;
                case "DI4":
                    $scope.select_multi_DI4 = 0;
                    break;
                case "DI5":
                    $scope.select_multi_DI5 = 0;
                    break;
                case "DI6":
                    $scope.select_multi_DI6 = 0;
                    break;
                case "DI7":
                    $scope.select_multi_DI7 = 0;
                    break;
                case "CI0":
                    $scope.select_multi_CI0 = 0;
                    break;
                case "CI1":
                    $scope.select_multi_CI1 = 0;
                    break;
                case "CI2":
                    $scope.select_multi_CI2 = 0;
                    break;
                case "CI3":
                    $scope.select_multi_CI3 = 0;
                    break;
                case "CI4":
                    $scope.select_multi_CI4 = 0;
                    break;
                case "CI5":
                    $scope.select_multi_CI5 = 0;
                    break;
                case "CI6":
                    $scope.select_multi_CI6 = 0;
                    break;
                case "CI7":
                    $scope.select_multi_CI7 = 0;
                    break;
                default:
                    break;
            }
        };
    }

    // 按位计算
    function compulteMultiDI(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16){
        var binvalue = ~~a1*1+~~a2*2+~~a3*4+~~a4*8+~~a5*16+~~a6*32+~~a7*64+~~a8*128+~~a9*256+~~a10*512+~~a11*1024+~~a12*2048+~~a13*4096+~~a14*8192+~~a15*16384+~~a16*32768;
        return binvalue;
    }

    function transMultiPort(value,index) {
        var binaryValue = parseInt(value).toString(2);
        var l = binaryValue.length;
        if (l < 16) {
            for (var i = 0; i < 16-l; i++) {
                binaryValue = "0" + binaryValue;
            }
        }
        reaultArr = binaryValue.split('');
        if (index == 0) {
            $scope.select_multi_DI0 = 0;
            $scope.select_multi_DI1 = 0;
            $scope.select_multi_DI2 = 0;
            $scope.select_multi_DI3 = 0;
            $scope.select_multi_DI4 = 0;
            $scope.select_multi_DI5 = 0;
            $scope.select_multi_DI6 = 0;
            $scope.select_multi_DI7 = 0;
            $scope.select_multi_CI0 = 0;
            $scope.select_multi_CI1 = 0;
            $scope.select_multi_CI2 = 0;
            $scope.select_multi_CI3 = 0;
            $scope.select_multi_CI4 = 0;
            $scope.select_multi_CI5 = 0;
            $scope.select_multi_CI6 = 0;
            $scope.select_multi_CI7 = 0;
            if (reaultArr[0] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI7");
                cbItem.checked = true;
                $scope.select_multi_CI7 = 1;
            }
            if (reaultArr[1] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI6");
                cbItem.checked = true;
                $scope.select_multi_CI6 = 1;
            }
            if (reaultArr[2] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI5");
                cbItem.checked = true;
                $scope.select_multi_CI5 = 1;
            }
            if (reaultArr[3] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI4");
                cbItem.checked = true;
                $scope.select_multi_CI4 = 1;
            }
            if(reaultArr[4] == 1){
                let cbItem = document.getElementById("Wait_Multi_CI3");
                cbItem.checked = true;
                $scope.select_multi_CI3 = 1;
            }
            if (reaultArr[5] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI2");
                cbItem.checked = true;
                $scope.select_multi_CI2 = 1;
            }
            if (reaultArr[6] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI1");
                cbItem.checked = true;
                $scope.select_multi_CI1 = 1;
            }
            if (reaultArr[7] == 1) {
                let cbItem = document.getElementById("Wait_Multi_CI0");
                cbItem.checked = true;
                $scope.select_multi_CI0 = 1;
            }
            if (reaultArr[8] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI7");
                cbItem.checked = true;
                $scope.select_multi_DI7 = 1;
            }
            if (reaultArr[9] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI6");
                cbItem.checked = true;
                $scope.select_multi_DI6 = 1;
            }
            if (reaultArr[10] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI5");
                cbItem.checked = true;
                $scope.select_multi_DI5 = 1;
            }
            if (reaultArr[11] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI4");
                cbItem.checked = true;
                $scope.select_multi_DI4 = 1;
            }
            if (reaultArr[12] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI3");
                cbItem.checked = true;
                $scope.select_multi_DI3 = 1;
            }
            if (reaultArr[13] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI2");
                cbItem.checked = true;
                $scope.select_multi_DI2 = 1;
            }
            if (reaultArr[14] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI1");
                cbItem.checked = true;
                $scope.select_multi_DI1 = 1;
            }
            if (reaultArr[15] == 1) {
                let cbItem = document.getElementById("Wait_Multi_DI0");
                cbItem.checked = true;
                $scope.select_multi_DI0 = 1;
            }
        } else {
            $scope.selectedWaitMultiDI0State = $scope.IOState[reaultArr[15]];
            $scope.selectedWaitMultiDI1State = $scope.IOState[reaultArr[14]];
            $scope.selectedWaitMultiDI2State = $scope.IOState[reaultArr[13]];
            $scope.selectedWaitMultiDI3State = $scope.IOState[reaultArr[12]];
            $scope.selectedWaitMultiDI4State = $scope.IOState[reaultArr[11]];
            $scope.selectedWaitMultiDI5State = $scope.IOState[reaultArr[10]];
            $scope.selectedWaitMultiDI6State = $scope.IOState[reaultArr[9]];
            $scope.selectedWaitMultiDI7State = $scope.IOState[reaultArr[8]];
            $scope.selectedWaitMultiCI0State = $scope.IOState[reaultArr[7]];
            $scope.selectedWaitMultiCI1State = $scope.IOState[reaultArr[6]];
            $scope.selectedWaitMultiCI2State = $scope.IOState[reaultArr[5]];
            $scope.selectedWaitMultiCI3State = $scope.IOState[reaultArr[4]];
            $scope.selectedWaitMultiCI4State = $scope.IOState[reaultArr[3]];
            $scope.selectedWaitMultiCI5State = $scope.IOState[reaultArr[2]];
            $scope.selectedWaitMultiCI6State = $scope.IOState[reaultArr[1]];
            $scope.selectedWaitMultiCI7State = $scope.IOState[reaultArr[0]];
        }
    }

    //添加WaitMultiDI指令
    $scope.addWaitMultiDI = function(){
        if (null == $scope.waitMultiDItime) {
            toastFactory.info(ptDynamicTags.info_messages[39]);
        } else {
            $scope.handleCommandIndex();
            var multiPort = compulteMultiDI($scope.select_multi_DI0,$scope.select_multi_DI1,$scope.select_multi_DI2,$scope.select_multi_DI3,$scope.select_multi_DI4,
                                    $scope.select_multi_DI5,$scope.select_multi_DI6,$scope.select_multi_DI7,$scope.select_multi_CI0,$scope.select_multi_CI1,$scope.select_multi_CI2,
                                    $scope.select_multi_CI3,$scope.select_multi_CI4,$scope.select_multi_CI5,$scope.select_multi_CI6,$scope.select_multi_CI7);
            var multiValue = compulteMultiDI($scope.selectedWaitMultiDI0State.num,$scope.selectedWaitMultiDI1State.num,$scope.selectedWaitMultiDI2State.num,
                                    $scope.selectedWaitMultiDI3State.num,$scope.selectedWaitMultiDI4State.num,$scope.selectedWaitMultiDI5State.num,
                                    $scope.selectedWaitMultiDI6State.num,$scope.selectedWaitMultiDI7State.num,$scope.selectedWaitMultiCI0State.num,
                                    $scope.selectedWaitMultiCI1State.num,$scope.selectedWaitMultiCI2State.num,$scope.selectedWaitMultiCI3State.num,
                                    $scope.selectedWaitMultiCI4State.num,$scope.selectedWaitMultiCI5State.num,$scope.selectedWaitMultiCI6State.num,
                                    $scope.selectedWaitMultiCI7State.num);
            let tempData = $scope.selectedWaitMultiDICondition.id+","+multiPort+","+multiValue+","+$scope.waitMultiDItime+","+$scope.selectedWaitMultiDIMotion.num;
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("WaitMultiDI("+tempData + ")");
                $scope.ReturnCommandArr.commandsadd += ("WaitMultiDI("+tempData + ")" +";");
            } else {
                $scope.ReturnString = ("WaitMultiDI("+tempData + ")");
            }
        }   
    };

    //添加WaitAI指令
    $scope.addWaitAI = function() {
        if ($scope.selectedWaitAIMotion.num == 2) {
            $scope.handleCommandIndex();
            let tempData = $scope.selectedWaitAIState.num + "," + $scope.WaitAIValue + ",0" + "," + $scope.selectedWaitAIMotion.num;
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedWaitAIPort.num > 1) {
                    $scope.ReturnCommandArr.commandshow.push("WaitToolAI(" + ($scope.selectedWaitAIPort.num-2) + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitToolAI(" + ($scope.selectedWaitAIPort.num-2) + "," + tempData + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")" + ";");
                }
            } else {
                if ($scope.selectedWaitAIPort.num > 1) {
                    $scope.ReturnCommandArr.commandshow.push("WaitToolAI(" +($scope.selectedWaitAIPort.num-2)+","+tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitToolAI("+($scope.selectedWaitAIPort.num-2)+","+tempData + ")" +";");
                } else{
                    $scope.ReturnCommandArr.commandshow.push("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")");
                    $scope.ReturnCommandArr.commandsadd += ("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")" +";");
                }
            }
        } else {
            if ((null == $scope.WaitAIValue)||(null == $scope.waitAItime)) {
                toastFactory.info(ptDynamicTags.info_messages[40]);
            } else {
                $scope.handleCommandIndex();
                let tempData = $scope.selectedWaitAIState.num + "," + $scope.WaitAIValue + "," + $scope.waitAItime + "," + $scope.selectedWaitAIMotion.num;
                if ($scope.programAreaRightType == 'add') {
                    if ($scope.selectedWaitAIPort.num > 1) {
                        $scope.ReturnCommandArr.commandshow.push("WaitToolAI(" +($scope.selectedWaitAIPort.num-2)+","+tempData + ")");
                        $scope.ReturnCommandArr.commandsadd += ("WaitToolAI("+($scope.selectedWaitAIPort.num-2)+","+tempData + ")" +";");
                    } else{
                        $scope.ReturnCommandArr.commandshow.push("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")");
                        $scope.ReturnCommandArr.commandsadd += ("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")" +";");
                    }
                } else {
                    if ($scope.selectedWaitAIPort.num > 1) {
                        $scope.ReturnString = ("WaitToolAI(" + ($scope.selectedWaitAIPort.num - 2) + "," + tempData + ")");
                    } else {
                        $scope.ReturnString = ("WaitAI(" + $scope.selectedWaitAIPort.num + "," + tempData + ")");
                    }
                }
            }
        }
    };

    //阻塞选择切换是否辅助线程
    $scope.changeSetAOMode = function(index){
        if (index == 1) {
            $scope.show_SetAO_Block = true;
        } else {
            $scope.show_SetAO_Block = false;
        }
    };

    //添加SetAO指令
    $scope.addSetAO = function () {
        if (null == $scope.SetAOValue) {
            toastFactory.info(ptDynamicTags.info_messages[41]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedSetAOBlock.num == 1) {
                    if ($scope.SetAOPort.num > 1) {
                        $scope.ReturnCommandArr.commandshow.push("SPLCSetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SPLCSetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + ")" + ";");
                    }
                    else {
                        $scope.ReturnCommandArr.commandshow.push("SPLCSetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SPLCSetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + ")" + ";");
                    }
                } else {
                    if ($scope.SetAOPort.num > 1) {
                        $scope.ReturnCommandArr.commandshow.push("SetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")" + ";");
                    }
                    else {
                        $scope.ReturnCommandArr.commandshow.push("SetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("SetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")" + ";");
                    }
                }
            } else {
                if ($scope.selectedSetAOBlock.num == 1) {
                    if ($scope.SetAOPort.num > 1) {
                        $scope.ReturnString = ("SPLCSetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + ")");
                    }
                    else {
                        $scope.ReturnString = ("SPLCSetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + ")");
                    }
                } else {
                    if ($scope.SetAOPort.num > 1) {
                        $scope.ReturnString = ("SetToolAO(" + ($scope.SetAOPort.num-2) + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")");
                    }
                    else {
                        $scope.ReturnString = ("SetAO(" + $scope.SetAOPort.num + "," + $scope.SetAOValue + "," + $scope.selectedSetAoThread.id + ")");
                    }
                }
            }
        }
    };

    //阻塞选择切换是否平滑
    $scope.changeGetAIMode = function(index){
        if (index == 1) {
            $scope.show_GetAI_Block = true;
            $scope.selectedGetIOState = $scope.IOState[0];
        } else {
            $scope.show_GetAI_Block = false;
        }
    };

    // 添加GetAI指令
    $scope.addGetAI = function (){
        if ($scope.selectedGetAIBlock.num == 1) {
            if ( (null == $scope.getAIValue) || (null == $scope.getAItime) ) {
                toastFactory.info(ptDynamicTags.info_messages[42]);
            } else {
                $scope.handleCommandIndex();
                if ($scope.GetAIport.num > 1) {
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("SPLCGetToolAI("+($scope.GetAIport.num-2)+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +")");
                        $scope.ReturnCommandArr.commandsadd += ("SPLCGetToolAI("+($scope.GetAIport.num-2)+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +");");
                    } else {
                        $scope.ReturnString = ("SPLCGetToolAI("+($scope.GetAIport.num-2)+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +")");
                    }
                } else {
                    if ($scope.programAreaRightType == 'add') {
                        $scope.ReturnCommandArr.commandshow.push("SPLCGetAI("+$scope.GetAIport.num+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +")");
                        $scope.ReturnCommandArr.commandsadd += ("SPLCGetAI("+$scope.GetAIport.num+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +");");
                    } else {
                        $scope.ReturnString = ("SPLCGetAI("+$scope.GetAIport.num+","+$scope.selectedGetAIState.num+","+$scope.getAIValue+","+$scope.getAItime +")");
                    }
                }
            }
        } else {
            $scope.handleCommandIndex();
            if ($scope.GetAIport.num > 1) {
                if ($scope.programAreaRightType == 'add') {
                    $scope.ReturnCommandArr.commandshow.push("GetToolAI("+($scope.GetAIport.num-2) + "," + $scope.selectedGetAoThread.id +")");
                    $scope.ReturnCommandArr.commandsadd += ("GetToolAI("+($scope.GetAIport.num-2) + "," + $scope.selectedGetAoThread.id +");");
                } else {
                    $scope.ReturnString = ("GetToolAI("+($scope.GetAIport.num-2) + "," + $scope.selectedGetAoThread.id +")");
                }
            } else {
                if ($scope.programAreaRightType == 'add') {
                    $scope.ReturnCommandArr.commandshow.push("GetAI("+$scope.GetAIport.num + "," + $scope.selectedGetAoThread.id +")");
                    $scope.ReturnCommandArr.commandsadd += ("GetAI("+$scope.GetAIport.num + "," + $scope.selectedGetAoThread.id +");");
                } else {
                    $scope.ReturnString = ("GetAI("+$scope.GetAIport.num + "," + $scope.selectedGetAoThread.id +")");
                }
                
            }
        }
    };

    /* TPD */
    // 获取TPD轨迹指令
    function getTPDName(tpdname) {
        let getTPDNameCmd = {
            cmd: "get_tpd_name",
        };
        dataFactory.getData(getTPDNameCmd)
            .then((data) => {
                $scope.GetTPDName = data;
                if (tpdname) {
                    for (let i = 0; i < data.length; i++) {
                        if (tpdname == ("\"" + data[i] + "\"")) {
                            $scope.selectedLoadTPDName = $scope.GetTPDName[i];
                            $scope.selectedTPDName = $scope.GetTPDName[i];
                        }
                    }
                } else {
                    $scope.selectedLoadTPDName = $scope.GetTPDName[0];
                    $scope.selectedTPDName = $scope.GetTPDName[0];
                }
                
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[22]);
                /* test */
                if (g_testCode) {
                    $scope.GetTPDName = testTpdNameList;
                    if (tpdname) {
                        for (let i = 0; i < data.length; i++) {
                            if (tpdname == ("\"" + data[i] + "\"")) {
                                $scope.selectedLoadTPDName = $scope.GetTPDName[i];
                                $scope.selectedTPDName = $scope.GetTPDName[i];
                            }
                        }
                    } else {
                        $scope.selectedLoadTPDName = $scope.GetTPDName[0];
                        $scope.selectedTPDName = $scope.GetTPDName[0];   
                    }
                }
                /* ./test */
            });
    }

    // 添加TPD轨迹加载指令
    $scope.addLoadTPDFile = function () {
        if (null == $scope.selectedLoadTPDName) {
            toastFactory.info(ptDynamicTags.info_messages[44]);
        }
        else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("LoadTPD(\"" + $scope.selectedLoadTPDName + "\")");
                $scope.ReturnCommandArr.commandsadd += ("LoadTPD(\"" + $scope.selectedLoadTPDName + "\");");
            } else {
                $scope.ReturnString = ("LoadTPD(\"" + $scope.selectedLoadTPDName + "\")");
            }
        }
    };

    // TPD平滑选择
    $scope.changTpdMode = function(){
        if($scope.selectedTPDMode.num == 0){
            $scope.show_TPD_Mode_true = 0;
            $scope.show_TPD_Mode_false = 1;
        }else{
            $scope.show_TPD_Mode_true = 1;
            $scope.show_TPD_Mode_false = 0;
        }
    }

    // 添加TPD轨迹指令
    $scope.reappearTPDRecord = function () {
        if (null == $scope.selectedTPDName) {
            toastFactory.info(ptDynamicTags.info_messages[44]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedTPDMode.num == 0) {
                    $scope.ReturnCommandArr.commandshow.push("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.selectedTPDSpeed.num + ")");
                    $scope.ReturnCommandArr.commandsadd += ("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.selectedTPDSpeed.num + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.inputTPDSpeed + ")");
                    $scope.ReturnCommandArr.commandsadd += ("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.inputTPDSpeed + ")" + ";");
                }
            } else {
                if ($scope.selectedTPDMode.num == 0) {
                    $scope.ReturnString = ("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.selectedTPDSpeed.num + ")");
                } else {
                    $scope.ReturnString = ("MoveTPD(\"" + $scope.selectedTPDName + "\"," + $scope.selectedTPDMode.num + "," + $scope.inputTPDSpeed + ")");
                }
            }
        }
    };
    /* ./TPD */

    /* 夹爪 */
    // 添加Gripper指令
    $scope.addGripper = function () {
        if (null == $scope.selectedTeachGripper) {
            toastFactory.info(ptDynamicTags.info_messages[45]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("MoveGripper(" + $scope.selectedTeachGripper + "," + parseInt($scope.SetOpenShut) + "," + parseInt($scope.SetGripperSpeed) + "," + parseInt($scope.SetGripperMoment) + "," + parseInt($scope.waitGrippertime) + "," + parseInt($scope.selectedSetGripperBlock.num) + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveGripper(" + $scope.selectedTeachGripper + "," + parseInt($scope.SetOpenShut) + "," + parseInt($scope.SetGripperSpeed) + "," + parseInt($scope.SetGripperMoment) + "," + parseInt($scope.waitGrippertime) + "," + parseInt($scope.selectedSetGripperBlock.num) + ")" + ";");
            } else {
                $scope.ReturnString = ("MoveGripper(" + $scope.selectedTeachGripper + "," + parseInt($scope.SetOpenShut) + "," + parseInt($scope.SetGripperSpeed) + "," + parseInt($scope.SetGripperMoment) + "," + parseInt($scope.waitGrippertime) + "," + parseInt($scope.selectedSetGripperBlock.num) + ")");
            }
        }
    };

    // 添加夹爪激活复位指令
    $scope.actGripper = function (state) {
        if (null == $scope.selectedActGripper) {
            toastFactory.info(ptDynamicTags.info_messages[46]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ActGripper(" + $scope.selectedActGripper + "," + state  + ")");
        $scope.ReturnCommandArr.commandsadd += ("ActGripper(" + $scope.selectedActGripper + "," + state + ")" + ";");
    }
    /* ./夹爪 */


    // 添加dofile指令
    $scope.addDofileCall = function() {
        if (undefined == $scope.selectedDofileLevel || undefined == $scope.dofileID || "" == $scope.dofileID) {
            toastFactory.info(ptDynamicTags.info_messages[47]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if (g_systemFlag == 1) {
                $scope.ReturnCommandArr.commandshow.push("NewDofile(\"/usr/local/etc/controller/lua/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")");
                $scope.ReturnCommandArr.commandshow.push("DofileEnd()");
                $scope.ReturnCommandArr.commandsadd += ("NewDofile(\"/usr/local/etc/controller/lua/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("DofileEnd()" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("NewDofile(\"/fruser/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")");
                $scope.ReturnCommandArr.commandshow.push("DofileEnd()");
                $scope.ReturnCommandArr.commandsadd += ("NewDofile(\"/fruser/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("DofileEnd()" + ";");
            }
        } else {
            if (g_systemFlag == 1) {
                $scope.ReturnString = ("NewDofile(\"/usr/local/etc/controller/lua/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")");
            } else {
                $scope.ReturnString = ("NewDofile(\"/fruser/" + $scope.selectedDofileCall.name + "\","+$scope.selectedDofileLevel.id+","+$scope.dofileID+")");
            }
        }
    };

    // 添加ToolList指令
    $scope.applyTool = function () {
        if (null == $scope.selectedToolCoord) {
            toastFactory.info(ptDynamicTags.info_messages[48]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedToolCoord.id < $scope.toolTrsfCoordeTotal + 1) {
                    $scope.ReturnCommandArr.commandshow.push("SetToolList(" + $scope.selectedToolCoord.name + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SetToolList(" + $scope.selectedToolCoord.name + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("SetExToolList(" + $scope.selectedToolCoord.name + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SetExToolList(" + $scope.selectedToolCoord.name + ")" + ";");
                }
            } else {
                if ($scope.selectedToolCoord.id < $scope.toolTrsfCoordeTotal + 1) {
                    $scope.ReturnString = ("SetToolList(" + $scope.selectedToolCoord.name + ")");
                } else {
                    $scope.ReturnString = ("SetExToolList(" + $scope.selectedToolCoord.name + ")");
                }
            }
        }
    }

    // 添加WobjToolList指令
    $scope.applyWobj = function () {
        if (null == $scope.selectedWobjCoord) {
            toastFactory.info(ptDynamicTags.info_messages[49]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("SetWObjList(" + $scope.selectedWobjCoord.name + ")");
                $scope.ReturnCommandArr.commandsadd += ("SetWObjList(" + $scope.selectedWobjCoord.name + ")" + ";");
            } else {
                $scope.ReturnString = ("SetWObjList(" + $scope.selectedWobjCoord.name + ")");
            }
        }
    }

    /* 添加喷涂相关指令 */
    // 检查是否配置喷涂DO
    function checkspray() {
        for (let i = 0; i < 8; i++) {
            if (3 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }

    // 检查是否配置清枪DO
    function checkclean() {
        for (let i = 0; i < 8; i++) {
            if (4 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }
    // 开始喷涂
    $scope.addSprayStart = function () {
        if (1 != checkspray()) {
            toastFactory.info(ptDynamicTags.info_messages[50]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SprayStart()");
            $scope.ReturnCommandArr.commandsadd += ("SprayStart()" + ";");
        }
    }

    // 停止喷涂
    $scope.addSprayStop = function () {
        if (1 != checkspray()) {
            toastFactory.info(ptDynamicTags.info_messages[50]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SprayStop()");
            $scope.ReturnCommandArr.commandsadd += ("SprayStop()" + ";");
        }
    }

    // 开始清枪
    $scope.addCleanStart = function () {
        if (1 != checkclean()) {
            toastFactory.info(ptDynamicTags.info_messages[51]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("PowerCleanStart()");
            $scope.ReturnCommandArr.commandsadd += ("PowerCleanStart()" + ";");
        }
    }

    // 停止清枪
    $scope.addCleanStop = function () {
        if (1 != checkclean()) {
            toastFactory.info(ptDynamicTags.info_messages[51]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("PowerCleanStop()");
            $scope.ReturnCommandArr.commandsadd += ("PowerCleanStop()" + ";");
        }
    }
    /* ./添加喷涂相关指令 */

    /* 摆焊功能 */
    // 读取摆焊参数配置文件
    function getWeavecfg(index) {
        let getRobotCfgCmd = {
            cmd: "get_weave",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.WeavecfgData = data;
                if (index) {
                    $scope.selectedWeaveId = $scope.WeavecfgData[index];
                } else {
                    $scope.selectedWeaveId = $scope.WeavecfgData[0];
                }
                $scope.selectedWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)].name;
                $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)].name;
                $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)].name;
                $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)];
                $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)];
                $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)];
                $scope.changeCircleRatio($scope.selectedSetWeaveType.id);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[17]);
                /*test */
                if (g_testCode) {
                    $scope.WeavecfgData = testWeavecfgData;
                    if (index) {
                        $scope.selectedWeaveId = $scope.WeavecfgData[index];
                    } else {
                        $scope.selectedWeaveId = $scope.WeavecfgData[0];
                    }
                    $scope.selectedWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)].name;
                    $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)].name;
                    $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)].name;
                    $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)];
                    $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)];
                    $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)];
                    $scope.changeCircleRatio($scope.selectedSetWeaveType.id);
                }
                /**test */
            });
    }

    // 根据选择编号显示摆动类型
    $scope.weaveTypeChange = function () {
        $scope.selectedWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)].name;
        $scope.selectedWeaveWaitTimeType = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)].name;
        $scope.selectedWeaveLocationWaitType = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)].name;
        $scope.selectedSetWeaveType = $scope.WeaveTypeData[~~($scope.selectedWeaveId.type)];
        $scope.selectedWeaveWaitTime = $scope.weaveWaitTimeData[~~($scope.selectedWeaveId.inctime)];
        $scope.selectedWeaveLocationWait = $scope.weaveLocationWaitData[~~($scope.selectedWeaveId.stationary)];
        $scope.changeCircleRatio($scope.selectedSetWeaveType.id);
    }

    // 根据摆动类型显示参数
    $scope.changeCircleRatio = function(index){
        if(index == 2 || index == 3){
            $scope.show_Weave_Normal = false;
            $scope.show_Weave_Circular = true;
            $scope.show_Weave_Vertical = false;
        } else if (index == 6) {
            $scope.show_Weave_Normal = false;
            $scope.show_Weave_Circular = false;
            $scope.show_Weave_Vertical = true;
        } else {
            $scope.show_Weave_Normal = true;
            $scope.show_Weave_Circular = false;
            $scope.show_Weave_Vertical = false;
        }
    }

    // 摆焊参数配置
    $scope.weaveSetPara = function(){
        var weaveSetParaString = "WeaveSetPara(" + $scope.selectedWeaveId.id + "," + $scope.selectedSetWeaveType.id + "," + $scope.selectedWeaveId.freq
            + "," + $scope.selectedWeaveWaitTime.id + "," + $scope.selectedWeaveId.range + "," + $scope.selectedWeaveId.leftrange + ","
            + $scope.selectedWeaveId.rightrange + "," + $scope.selectedWeaveId.origintime + "," + $scope.selectedWeaveId.ltime + ","
            + $scope.selectedWeaveId.rtime + "," + $scope.selectedWeaveId.circleratio + "," + $scope.selectedWeaveLocationWait.id + "," + $scope.selectedWeaveId.yawangle + ")";
        let weaveSetParaCmd = {
            cmd: 252,
            data: {
                content: weaveSetParaString,
            },
        };
        dataFactory.setData(weaveSetParaCmd)
            .then(() => {

            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[18]);
            });
    }

    // 添加开始摆动指令到程序中
    $scope.addWeaveStart = function () {
        if ($scope.selectedWeaveId == null || $scope.selectedWeaveId == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("WeaveStart(" + $scope.selectedWeaveId.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeaveStart(" + $scope.selectedWeaveId.id + ")" + ";");
            } else {
                $scope.ReturnString = ("WeaveStart(" + $scope.selectedWeaveId.id + ")");
            }
            
        }
    }

    // 添加停止摆动指令到程序中
    $scope.addWeaveEnd = function () {
        if ($scope.selectedWeaveId == null || $scope.selectedWeaveId == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("WeaveEnd(" + $scope.selectedWeaveId.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeaveEnd(" + $scope.selectedWeaveId.id + ")" + ";");
            } else {
                $scope.ReturnString = ("WeaveEnd(" + $scope.selectedWeaveId.id + ")");
            }
        }
    }

    // 添加摆动仿真开始指令到程序中
    $scope.addWeaveStartSim = function () {
        if (null == $scope.selectedWeaveId) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("WeaveStartSim(" + $scope.selectedWeaveId.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WeaveStartSim(" + $scope.selectedWeaveId.id + ")" + ";");
        }
    }

    // 添加摆动仿真结束指令到程序中
    $scope.addWeaveEndSim = function () {
        if (null == $scope.selectedWeaveId) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("WeaveEndSim(" + $scope.selectedWeaveId.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WeaveEndSim(" + $scope.selectedWeaveId.id + ")" + ";");
        }
    }

    // 添加开始摆动轨迹检测预警(不运动)
    $scope.addWeaveStartWarning = function () {
        if (null == $scope.selectedWeaveId) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("WeaveInspectStart(" + $scope.selectedWeaveId.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WeaveInspectStart(" + $scope.selectedWeaveId.id + ")" + ";");
        }
    }

    // 添加停止摆动轨迹检测预警(不运动)
    $scope.addWeaveEndWarning = function () {
        if (null == $scope.selectedWeaveId) {
            toastFactory.info(ptDynamicTags.info_messages[52]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("WeaveInspectEnd(" + $scope.selectedWeaveId.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WeaveInspectEnd(" + $scope.selectedWeaveId.id + ")" + ";");
        }
    }
    /* ./摆焊功能 */

    /* 添加焊机电压指令 */
    $scope.addWeldVoltage = () => {
        if (undefined == $scope.weldVoltage || $scope.weldVoltage == '') {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetWeldingVoltage(" + $scope.weldVoltage + ")");
            $scope.ReturnCommandArr.commandsadd += ("SetWeldingVoltage(" + $scope.weldVoltage + ")" + ";");
        }
    }

    /* 添加焊机电流指令 */
    $scope.addWeldCurrent = () => {
        if (undefined == $scope.weldCurrent || $scope.weldCurrent == '') {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetWeldingCurrent(" + $scope.weldCurrent + ")");
            $scope.ReturnCommandArr.commandsadd += ("SetWeldingCurrent(" + $scope.weldCurrent + ")" + ";");
        }
    }

    /** 获取点位表列表*/
    function getPointTableModeList() {
        let getPointTableListCmd = {
            cmd: "get_point_table_list"
        };
        dataFactory.getData(getPointTableListCmd)
            .then((data) => {
                $scope.pointTableModeList = JSON.parse(JSON.stringify(data));
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 焊接 */
    // 添加起弧指令到程序中
    $scope.addARCStart = function () {
        if (null == $scope.selectedWeldIOType || null == $scope.selectedWeldId || null == $scope.weldTime || $scope.weldTime == '') {
            toastFactory.info(ptDynamicTags.info_messages[53]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("ARCStart(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")");
                $scope.ReturnCommandArr.commandsadd += ("ARCStart(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")" + ";");
            } else {
                $scope.ReturnString = ("ARCStart(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")");
            }
        }
    }

    // 添加收弧指令到程序中
    $scope.addARCEnd = function () {
        if (null == $scope.selectedWeldIOType || null == $scope.selectedWeldId || null == $scope.weldTime || $scope.weldTime == '') {
            toastFactory.info(ptDynamicTags.info_messages[54]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("ARCEnd(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")");
                $scope.ReturnCommandArr.commandsadd += ("ARCEnd(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")" + ";");
            } else {
                $scope.ReturnString = ("ARCEnd(" + $scope.selectedWeldIOType + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")");
            }
        }
    }

    // 添加送气指令到程序中
    $scope.addSetAspiratedOpen = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetAspirated(" + $scope.selectedWeldIOType + ",1)");
            $scope.ReturnCommandArr.commandsadd += ("SetAspirated(" + $scope.selectedWeldIOType + ",1)" + ";");
        }
    }

    // 添加关气指令到程序中
    $scope.addSetAspiratedClose = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetAspirated(" + $scope.selectedWeldIOType + ",0)");
            $scope.ReturnCommandArr.commandsadd += ("SetAspirated(" + $scope.selectedWeldIOType + ",0)" + ";");
        }
    }
    
    // 添加正向送丝指令到程序中
    $scope.addSetForwardWireFeedOpen = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetForwardWireFeed(" + $scope.selectedWeldIOType + ",1)");
            $scope.ReturnCommandArr.commandsadd += ("SetForwardWireFeed(" + $scope.selectedWeldIOType + ",1)" + ";");
        }
    }

    // 添加停止正向送丝指令到程序中
    $scope.addSetForwardWireFeedClose = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetForwardWireFeed(" + $scope.selectedWeldIOType + ",0)");
            $scope.ReturnCommandArr.commandsadd += ("SetForwardWireFeed(" + $scope.selectedWeldIOType + ",0)" + ";");
        }
    }

    // 添加反向送丝指令到程序中
    $scope.addSetReverseWireFeedOpen = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetReverseWireFeed(" + $scope.selectedWeldIOType + ",1)");
            $scope.ReturnCommandArr.commandsadd += ("SetReverseWireFeed(" + $scope.selectedWeldIOType + ",1)" + ";");
        }
    }

    // 添加停止反向送丝指令到程序中
    $scope.addSetReverseWireFeedClose = function () {
        if (null == $scope.selectedWeldIOType) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetReverseWireFeed(" + $scope.selectedWeldIOType + ",0)");
            $scope.ReturnCommandArr.commandsadd += ("SetReverseWireFeed(" + $scope.selectedWeldIOType + ",0)" + ";");
        }
    }

    /**
     * 设置焊接电流及输出端口
     * @param {int} type I/O类型
     * @param {float} value 设置电流值(A)
     * @param {int} index 设置电流输出端口(0 ~ 1)
     * @param {int} blending 控制器AO电流平滑选项(0-break 1-Serious)
     */
    $scope.addWeldingCurrent = function (type, value, index, blending) {
        if (!value) {
            toastFactory.info(ptDynamicTags.info_messages[208]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if (type == 0) {
                $scope.ReturnCommandArr.commandshow.push("WeldingSetCurrent(" + type + ',' + value + ',' + index + ',' + blending + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeldingSetCurrent(" + type + ',' + value + ',' + index + ',' + blending + ")" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("WeldingSetCurrent(" + type + ',' + value + ',' + 0 + ',' + 0 + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeldingSetCurrent(" + type + ',' + value + ',' + 0 + ',' + 0 + ")" + ";");
            }
        } else {
            if (type == 0) {
                $scope.ReturnString = ("WeldingSetCurrent(" + type + ',' + value + ',' + index + ',' + blending + ")");
            } else {
                $scope.ReturnString = ("WeldingSetCurrent(" + type + ',' + value + ',' + 0 + ',' + 0 + ")");
            }
        }
    }

    /**
     * 设置焊接电压及输出端口
     * @param {int} type I/O类型
     * @param {float} value 设置电压值(V)
     * @param {int} index 设置电流输出端口(0 ~ 1)
     * @param {int} blending 控制器AO电压平滑选项(0-break 1-Serious)
     */
    $scope.addWeldingVoltage = function (type, value, index, blending) {
        if (!value) {
            toastFactory.info(ptDynamicTags.info_messages[240]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if (type == 0) {
                $scope.ReturnCommandArr.commandshow.push("WeldingSetVoltage(" + type + ',' + value + ',' + index + ',' + blending + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeldingSetVoltage(" + type + ',' + value + ',' + index + ',' + blending + ")" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("WeldingSetVoltage(" + type + ',' + value + ',' + 0 + ',' + 0 + ")");
                $scope.ReturnCommandArr.commandsadd += ("WeldingSetVoltage(" + type + ',' + value + ',' + 0 + ',' + 0 + ")" + ";");
            }
        } else {
            if (type == 0) {
                $scope.ReturnString = ("WeldingSetVoltage(" + type + ',' + value + ',' + index + ',' + blending +")");
            } else {
                $scope.ReturnString = ("WeldingSetVoltage(" + type + ',' + value + ',' + 0 + ',' + 0 + ")");
            }
        }
    }
    /* ./焊接 */

    /* 跟踪传感器指令 */
    // 添加打开传感器指令到程序中
    $scope.addLTLaserOn = function () {
        if (null == $scope.weldType) {
            toastFactory.info(ptDynamicTags.info_messages[55]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("LTLaserOn(" + $scope.weldType + ")");
            $scope.ReturnCommandArr.commandsadd += ("LTLaserOn(" + $scope.weldType + ")" + ";");
        }

    }

    // 添加关闭传感器指令到程序中
    $scope.addLTLaserOff = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("LTLaserOff()");
        $scope.ReturnCommandArr.commandsadd += ("LTLaserOff()" + ";");
    }

    // 加载协议
    $scope.addloadProtocol = function(){
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("LoadPosSensorDriver("+$scope.selectedProtocol.id + ")");
        $scope.ReturnCommandArr.commandsadd += ("LoadPosSensorDriver("+$scope.selectedProtocol.id + ")"+";");
    }

    // 卸载协议
    $scope.addloadOffProtocol = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("UnloadPosSensorDriver()");
        $scope.ReturnCommandArr.commandsadd += ("UnloadPosSensorDriver()" + ";");
    }

    // 添加开始跟踪指令到程序中
    $scope.addLTTrackOn = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("LTTrackOn("+$scope.selectedTrackToolCoorde.id+")");
            $scope.ReturnCommandArr.commandsadd += ("LTTrackOn("+$scope.selectedTrackToolCoorde.id+")" + ";");
        } else {
            $scope.ReturnString = ("LTTrackOn("+$scope.selectedTrackToolCoorde.id+")");
        }
    }

    // 添加停止跟踪指令到程序中
    $scope.addLTTrackOff = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("LTTrackOff()");
        $scope.ReturnCommandArr.commandsadd += ("LTTrackOff()" + ";");
    }

    // 添加开始记录指令到程序中
    $scope.addLTTrackDataOn = function () {
        if (null == $scope.LTwaittime) {
            toastFactory.info(ptDynamicTags.info_messages[56]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("LaserSensorRecord(" + $scope.selectedLTFunction.id + "," + $scope.LTwaittime + "," + $scope.LTSerachSpeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("LaserSensorRecord(" + $scope.selectedLTFunction.id + "," + $scope.LTwaittime + "," + $scope.LTSerachSpeed + ")" + ";");
            } else {
                $scope.ReturnString = ("LaserSensorRecord(" + $scope.selectedLTFunction.id + "," + $scope.LTwaittime + "," + $scope.LTSerachSpeed + ")");
            }
        }
    }

    // 添加轨迹跟踪复现指令到程序中
    $scope.addLTRecordRepare = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("MoveLTR()");
        $scope.ReturnCommandArr.commandsadd += ("MoveLTR()" + ";");
    }

    // 显示复现功能
    $scope.show_record_repare = false;
    $scope.showLaserRecordReapare = function () {
        if (3 == ~~$scope.selectedLTFunction.id) {
            $scope.show_record_repare = true;
        } else {
            $scope.show_record_repare = false;
        }
    }

    // 添加传感器点运动
    $scope.addLaserPoint = function () {
        if (null == $scope.LaserPointSpeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.selectedMotionMode.id == 1) {
                $scope.ReturnCommandArr.commandshow.push("pos = {}");
                $scope.ReturnCommandArr.commandshow.push("pos = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("if type(pos) == \"table\" then");
                $scope.ReturnCommandArr.commandshow.push("laserLin(#pos,pos)");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("pos = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("if type(pos) == \"table\" then");
                $scope.ReturnCommandArr.commandsadd += ("laserLin(#pos,pos)" + ";");
                $scope.ReturnCommandArr.commandsadd += ("end" + ";");
            } else if ($scope.selectedMotionMode.id == 0) {
                $scope.ReturnCommandArr.commandshow.push("pos = {}");
                $scope.ReturnCommandArr.commandshow.push("pos = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("if type(pos) == \"table\" then");
                $scope.ReturnCommandArr.commandshow.push("laserPTP(#pos,pos)");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("pos = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("if type(pos) == \"table\" then");
                $scope.ReturnCommandArr.commandsadd += ("laserPTP(#pos,pos)" + ";");
                $scope.ReturnCommandArr.commandsadd += ("end" + ";");
            } else if ($scope.selectedMotionMode.id == 2) {
                $scope.ReturnCommandArr.commandshow.push("pos1 = {}");
                $scope.ReturnCommandArr.commandshow.push("pos1 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("pos2 = {}");
                $scope.ReturnCommandArr.commandshow.push("pos2 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("if type(pos1) == \"table\" and type(pos2) == \"table\" then");
                $scope.ReturnCommandArr.commandshow.push("laserARC(#pos1,pos1,#pos2,pos2)");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("pos1 = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos1 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos2 = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos2 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("if type(pos1) == \"table\" and type(pos2) == \"table\" then");
                $scope.ReturnCommandArr.commandsadd += ("laserARC(#pos1,pos1,#pos2,pos2)" + ";");
                $scope.ReturnCommandArr.commandsadd += ("end" + ";");
            } else if ($scope.selectedMotionMode.id == 3) {
                $scope.ReturnCommandArr.commandshow.push("pos1 = {}");
                $scope.ReturnCommandArr.commandshow.push("pos1 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("pos2 = {}");
                $scope.ReturnCommandArr.commandshow.push("pos2 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")");
                $scope.ReturnCommandArr.commandshow.push("if type(pos1) == \"table\" and type(pos2) == \"table\" then");
                $scope.ReturnCommandArr.commandshow.push("laserCircle(#pos1,pos1,#pos2,pos2)");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("pos1 = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos1 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos2 = {}" + ";");
                $scope.ReturnCommandArr.commandsadd += ("pos2 = LaserRecordPoint(" +$scope.selectedRecordToolCoorde.id+","+  $scope.selectedMotionMode.id + "," + $scope.LaserPointSpeed + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("if type(pos1) == \"table\" and type(pos2) == \"table\" then");
                $scope.ReturnCommandArr.commandsadd += ("laserCircle(#pos1,pos1,#pos2,pos2)" + ";");
                $scope.ReturnCommandArr.commandsadd += ("end" + ";");
            }
        }
    }

    // 添加寻位开始指令到程序中
    $scope.addLTSearchStart = function () {
        if ((null == $scope.selectedSerachDist) || (null == $scope.tserachSpeed) || (null == $scope.tsearchLen) || (null == $scope.tsearchTime)) {
            toastFactory.info(ptDynamicTags.info_messages[57]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedSerachDist.num != 6) {
                    $scope.ReturnCommandArr.commandshow.push("LTSearchStart(" + $scope.selectedSerachDist.num + ",0," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")");
                    $scope.ReturnCommandArr.commandsadd += ("LTSearchStart(" + $scope.selectedSerachDist.num + ",0," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("LTSearchStart(" + $scope.selectedSerachDist.num + "," + $scope.operation.selectedLTSearchDistP.name + "," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")");
                    $scope.ReturnCommandArr.commandsadd += ("LTSearchStart(" + $scope.selectedSerachDist.num + "," + $scope.operation.selectedLTSearchDistP.name + "," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")" + ";");
                }
            } else {
                if ($scope.selectedSerachDist.num != 6) {
                    $scope.ReturnString = ("LTSearchStart(" + $scope.selectedSerachDist.num + ",0," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")");
                } else {
                    $scope.ReturnString = ("LTSearchStart(" + $scope.selectedSerachDist.num + "," + $scope.operation.selectedLTSearchDistP.name + "," + $scope.tserachSpeed + "," + $scope.tsearchLen + "," + $scope.tsearchTime + "," + $scope.selectedSearchToolCoorde.id + ")");
                }
            }
        }
    }

    //添加寻位结束指令到程序中
    $scope.addLTSearchStop = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("LTSearchStop()");
        $scope.ReturnCommandArr.commandsadd += ("LTSearchStop()" + ";");
    }

    /*激光轨迹复现指令*/
    //显示复现功能
    $scope.show_record_rec_repare = false;
    $scope.showLaserRecordRecReapare = function () {
        if (3 == ~~$scope.selectedLTRecFunction.id) {
            $scope.show_record_rec_repare = true;
        } else {
            $scope.show_record_rec_repare = false;
        }
    }
    //添加获取焊缝终点令到程序中
    $scope.addGetWeldTrackingRecordEndPos = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("MoveToLaserRecordEnd(" +  $scope.selectedLTRecurrentMotionMode.id + "," + $scope.LTRecdebugspeed + ")");
            $scope.ReturnCommandArr.commandsadd += ("MoveToLaserRecordEnd(" +  $scope.selectedLTRecurrentMotionMode.id + "," + $scope.LTRecdebugspeed + ")" + ";");
        } else {
            $scope.ReturnString = ("MoveToLaserRecordEnd(" + $scope.selectedLTRecurrentMotionMode.id +","+$scope.LTRecdebugspeed + ")");
        }
    }

    //添加获取焊缝起点指令到程序中
    $scope.addGetWeldTrackingRecordStartPos = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("MoveToLaserRecordStart(" +  $scope.selectedLTRecurrentMotionMode.id + "," + $scope.LTRecdebugspeed + ")");
            $scope.ReturnCommandArr.commandsadd += ("MoveToLaserRecordStart(" +  $scope.selectedLTRecurrentMotionMode.id + "," + $scope.LTRecdebugspeed + ")" + ";");
        } else {
            $scope.ReturnString = ("MoveToLaserRecordStart(" + $scope.selectedLTRecurrentMotionMode.id +","+$scope.LTRecdebugspeed + ")");
        }
    }

    //添加激光跟踪焊缝数据记录启停指令到程序中
    $scope.addLaserSensorRecord = function () {
        // if (null == $scope.LTwaittime) {
        //     toastFactory.info(ptDynamicTags.info_messages[56]);
        // } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("LaserSensorRecord(" + $scope.selectedLTRecFunction.id + "," + $scope.LTRecwaittime + "," + $scope.LTRecserachSpeed + ")");
            $scope.ReturnCommandArr.commandsadd += ("LaserSensorRecord(" + $scope.selectedLTRecFunction.id + "," + $scope.LTRecwaittime + "," + $scope.LTRecserachSpeed + ")" + ";");
        // }
    }

    /* 外部轴指令 */
    // 同步异步切换显示
    $scope.changeSync = function(){
        $scope.show_EAxis_Sync = false;
        if($scope.selectedTEAxisMode.num == 1){
            $scope.show_EAxis_Sync = true;
        }else{
            $scope.show_EAxis_Sync = false;
        }
    }
    $scope.changeSync();

    // 添加外部轴运动指令
    $scope.addEAxis = function () {
        if (null == $scope.EAxisPTPdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedTEAxisMode.num == 1) {
                    // 同步
                    if ($scope.selectedEAxisMotion.id == 1) {
                        // Lin
                        $scope.ReturnCommandArr.commandshow.push("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")");
                        $scope.ReturnCommandArr.commandshow.push($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ",0,0,0)");
                        $scope.ReturnCommandArr.commandsadd += ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")" + ";");
                        $scope.ReturnCommandArr.commandsadd += ($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ",0,0,0)" + ";");
                    } else if ($scope.selectedEAxisMotion.id == 0) {
                        // PTP
                        $scope.ReturnCommandArr.commandshow.push("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")");
                        $scope.ReturnCommandArr.commandshow.push($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ",0,0)");
                        $scope.ReturnCommandArr.commandsadd += ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")" + ";");
                        $scope.ReturnCommandArr.commandsadd += ($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ",0,0)" + ";");
                    } else if ($scope.selectedEAxisMotion.id == 2) {
                        // ARC
                        $scope.ReturnCommandArr.commandshow.push("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisARCPoint2.name + "," + $scope.EAxisPTPdebugspeed + ")");
                        $scope.ReturnCommandArr.commandshow.push($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisARCPoint1.name + ",0,0,0,0,0,0,0," + $scope.operation.selectedEAxisARCPoint2.name + ",0,0,0,0,0,0,0," + $scope.EAxisPTPdebugspeed + ",0)");
                        $scope.ReturnCommandArr.commandsadd += ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisARCPoint2.name + "," + $scope.EAxisPTPdebugspeed + ")" + ";");
                        $scope.ReturnCommandArr.commandsadd += ($scope.selectedEAxisMotion.name + "(" + $scope.operation.selectedEAxisARCPoint1.name + ",0,0,0,0,0,0,0," + $scope.operation.selectedEAxisARCPoint2.name + ",0,0,0,0,0,0,0," + $scope.EAxisPTPdebugspeed + ",0)" + ";");
                    }
                } else {
                    // 异步
                    $scope.ReturnCommandArr.commandshow.push("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")");
                    $scope.ReturnCommandArr.commandsadd += ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")" + ";");
                }
            } else {
                if ($scope.selectedTEAxisMode.num == 1) {
                    // 同步
                    if ($scope.selectedEAxisMotion.id == 0 || $scope.selectedEAxisMotion.id == 1) {
                        $scope.ReturnString = ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")");
                    } else {
                        $scope.ReturnString = ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisARCPoint2.name + "," + $scope.EAxisPTPdebugspeed + ")");
                    }
                } else {
                    // 异步
                    $scope.ReturnString = ("EXT_AXIS_PTP(" + $scope.selectedTEAxisMode.num + "," + $scope.operation.selectedEAxisPTP.name + "," + $scope.EAxisPTPdebugspeed + ")");
                }
            }
        }
    }

    // 添加外部轴回零指令
    $scope.addEAxisZero = function () {
        var exaxisidTrabsfer = 0;
        if ($scope.selectedTEAxisID.id == 1) {
            exaxisidTrabsfer = 1;
        } else if ($scope.selectedTEAxisID.id == 2) {
            exaxisidTrabsfer = 2;
        } else if ($scope.selectedTEAxisID.id == 3) {
            exaxisidTrabsfer = 4;
        } else if ($scope.selectedTEAxisID.id == 4) {
            exaxisidTrabsfer = 8;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("ExtAxisSetHoming(" + exaxisidTrabsfer + "," + $scope.selectedEAxisZeroMode.id + "," + $scope.HomeSearchVel + "," + $scope.HomeLatchVel + ")");
            $scope.ReturnCommandArr.commandsadd += ("ExtAxisSetHoming(" + exaxisidTrabsfer + "," + $scope.selectedEAxisZeroMode.id + "," + $scope.HomeSearchVel + "," + $scope.HomeLatchVel + ");");
        } else {
            $scope.ReturnString = ("ExtAxisSetHoming(" + exaxisidTrabsfer + "," + $scope.selectedEAxisZeroMode.id + "," + $scope.HomeSearchVel + "," + $scope.HomeLatchVel + ")");
        }
    }

    // 外部轴伺服使能
    $scope.addEAxisServoOn = function(index){
        var exaxisidTrabsfer = 0;
        if($scope.selectedServeOnAxisID.id == 1){
            exaxisidTrabsfer = 1;
        } else if($scope.selectedServeOnAxisID.id == 2){
            exaxisidTrabsfer = 2;
        } else if($scope.selectedServeOnAxisID.id == 3){
            exaxisidTrabsfer = 4;
        } else if($scope.selectedServeOnAxisID.id == 4){
            exaxisidTrabsfer = 8;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("ExtAxisServoOn("+exaxisidTrabsfer+","+index + ")");
            $scope.ReturnCommandArr.commandsadd += ("ExtAxisServoOn("+exaxisidTrabsfer+","+index + ")"+";");
        } else {
            $scope.ReturnString = ("ExtAxisServoOn("+exaxisidTrabsfer+",1)");
        }
    }
    /* ./外部轴指令 */

    /* 姿态变换指令 */
    // 添加姿态变换开启指令
    $scope.addAdjustOn = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedTechMotionDir.id == 0) {
                $scope.ReturnCommandArr.commandshow.push("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosB" + "," + "PosC" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")");
                $scope.ReturnCommandArr.commandsadd += ("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosB" + "," + "PosC" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosC" + "," + "PosB" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")");
                $scope.ReturnCommandArr.commandsadd += ("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosC" + "," + "PosB" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")" + ";");
            }
        } else {
            if ($scope.selectedTechMotionDir.id == 0) {
                $scope.ReturnString = ("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosB" + "," + "PosC" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")");
            } else {
                $scope.ReturnString = ("PostureAdjustOn(" + $scope.selectedTechPlateType.id + "," + "PosA" + "," + "PosC" + "," + "PosB" + "," + $scope.AdjustTime + ","
                    + $scope.FirstLength + "," + $scope.selectedInfPoint.id + "," + $scope.SecondLength + "," + $scope.ThirdLength + "," + $scope.FourthLength + "," + $scope.FifthLength + ")");
            }
        }
    }

    // 添加姿态变换关闭指令
    $scope.addAdjustOff = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PostureAdjustOff(" + $scope.selectedTechPlateType.id + ")");
        $scope.ReturnCommandArr.commandsadd += ("PostureAdjustOff(" + $scope.selectedTechPlateType.id + ")" + ";");
    }
    /* ./姿态变换指令 */

    //根据所选安装方式显示图片
    $scope.techDirPicChange = function () {
        $scope.show_Tpos_Pic = false;
        $scope.show_Tneg_Pic = false;
        switch (~~($scope.selectedTechMotionDir.id)) {
            case 0:
                $scope.show_Tpos_Pic = true;
                break;
            case 1:
                $scope.show_Tneg_Pic = true;
                break;
            default:
                break;
        }
    }
    $scope.techDirPicChange();


    /* 样条曲线指令 */
    // 添加样条组开始指令
    $scope.addSplineStart = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SplineStart()");
        $scope.ReturnCommandArr.commandsadd += ("SplineStart()" + ";");
    }

    // 添加样条组结束指令
    $scope.addSplineEnd = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SplineEnd()");
        $scope.ReturnCommandArr.commandsadd += ("SplineEnd()" + ";");
    }

    // 添加样条组SPL指令
    $scope.addSplineSPL = function () {
        if (null == $scope.SPLdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("SPTP(" + $scope.operation.selectedSPL.name + "," + $scope.SPLdebugspeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("SPTP(" + $scope.operation.selectedSPL.name + "," + $scope.SPLdebugspeed + ")" + ";");
            } else {
                $scope.ReturnString = ("SPTP(" + $scope.operation.selectedSPL.name + "," + $scope.SPLdebugspeed + ")");
            }
            
        }
    }

    // 添加样条组SLIN指令
    $scope.addSplineSLIN = function () {
        if (null == $scope.SLINdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("SLIN(" + $scope.operation.selectedSLIN.name + "," + $scope.SLINdebugspeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("SLIN(" + $scope.operation.selectedSLIN.name + "," + $scope.SLINdebugspeed + ")" + ";");
            } else {
                $scope.ReturnString = ("SLIN(" + $scope.operation.selectedSLIN.name + "," + $scope.SLINdebugspeed + ")");
            }
            
        }
    }

    // 添加样条组SCIRC指令
    $scope.addSplineSCIRC = function () {
        if (null == $scope.SCIRCdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("SCIRC(" + $scope.operation.selectedSCIRC1.name + "," + $scope.operation.selectedSCIRC2.name + "," + $scope.SCIRCdebugspeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("SCIRC(" + $scope.operation.selectedSCIRC1.name + "," + $scope.operation.selectedSCIRC2.name + "," + $scope.SCIRCdebugspeed + ")" + ";");
            } else {
                $scope.ReturnString = ("SCIRC(" + $scope.operation.selectedSCIRC1.name + "," + $scope.operation.selectedSCIRC2.name + "," + $scope.SCIRCdebugspeed + ")");
            }
            
        }
    }
    /* ./样条曲线指令 */

    /* 多点轨迹指令 */
    // 添加多点轨迹开始指令
    $scope.addNewSplineStart = function () {
        if (null == $scope.globalConnectTime) {
            toastFactory.info(ptDynamicTags.info_messages[246]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("NewSplineStart(" + $scope.selectedNewSplineMode.id + "," + $scope.globalConnectTime + ")");
                $scope.ReturnCommandArr.commandsadd += ("NewSplineStart(" + $scope.selectedNewSplineMode.id + "," + $scope.globalConnectTime + ")" + ";");
            } else {
                $scope.ReturnString = ("NewSplineStart(" + $scope.selectedNewSplineMode.id + ',' + $scope.globalConnectTime + ")");
            }
            
        }
    }

    // 修改显示控制点和路径点
    $scope.changeNewSplineMode = function(){
        if($scope.selectedNewSplineMode.id == 1){
            $scope.show_New_Spline_Control = true;
            $scope.show_New_Spline_Route = false;
        } else{
            $scope.show_New_Spline_Control = false;
            $scope.show_New_Spline_Route = true;
        }
    }
    $scope.changeNewSplineMode();

    // 添加多点轨迹结束指令
    $scope.addNewSplineEnd = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("NewSplineEnd()");
        $scope.ReturnCommandArr.commandsadd += ("NewSplineEnd()" + ";");
    }

    // 添加多点轨迹SPL指令
    $scope.addNewSplineSPL = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("NewSP(" + $scope.operation.selectedSPL.name+","+$scope.newSplinedebugspeed+","+$scope.newSplineRadius+","+$scope.selectedSplineLastFlag.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("NewSP(" + $scope.operation.selectedSPL.name+","+$scope.newSplinedebugspeed+","+$scope.newSplineRadius+","+$scope.selectedSplineLastFlag.id + ")" + ";");
        } else {
            $scope.ReturnString = ("NewSP(" + $scope.operation.selectedSPL.name+","+$scope.newSplinedebugspeed+","+$scope.newSplineRadius+","+$scope.selectedSplineLastFlag.id + ")");
        }
        
    }
    /* ./多点轨迹指令 */

    /* 传送带 */
    // 添加传送带IO检测指令
    $scope.addConIODetect = function () {
        if (null == $scope.IODetectTime) {
            toastFactory.info(ptDynamicTags.info_messages[58]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("ConveyorIODetect(" + $scope.IODetectTime + ")");
                $scope.ReturnCommandArr.commandsadd += ("ConveyorIODetect(" + $scope.IODetectTime + ")" + ";");
            } else {
                $scope.ReturnString = ("ConveyorIODetect(" + $scope.IODetectTime + ")");
            }
        }
    }

    // 添加传送带物体位置检测指令
    $scope.addConPositionDetect = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("ConveyorGetTrackData(" + $scope.selectedConTrackMode.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("ConveyorGetTrackData(" + $scope.selectedConTrackMode.id + ")" + ";");
        } else {
            $scope.ReturnString = ("ConveyorGetTrackData(" + $scope.selectedConTrackMode.id + ")");
        }
    }

    // 添加传送带跟踪开始指令
    $scope.addConTrackStart = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("ConveyorTrackStart(" + $scope.selectedConTrackMode.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("ConveyorTrackStart(" + $scope.selectedConTrackMode.id + ")" + ";");
        } else {
            $scope.ReturnString = ("ConveyorTrackStart(" + $scope.selectedConTrackMode.id + ")");
        }
    }

    // 添加传送带跟踪结束指令
    $scope.addConTrackEnd = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ConveyorTrackEnd()");
        $scope.ReturnCommandArr.commandsadd += ("ConveyorTrackEnd()" + ";");
    }
    /* ./传送带 */

    /**加载通讯驱动 */
    $scope.addPolishLoadDriver = function(){
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PolishingLoadComDriver()");
        $scope.ReturnCommandArr.commandsadd += ("PolishingLoadComDriver()"+";");
    }

    /**卸载通讯驱动 */
    $scope.addPolishUnloadDriver = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PolishingUnloadComDriver()");
        $scope.ReturnCommandArr.commandsadd += ("PolishingUnloadComDriver()" + ";");
    }

    /**
     * 使能
     * @param {int} index 1-上使能/0-下使能 
     */
    $scope.addPolishDeviceEnable = function (index) {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PolishingDeviceEnable(" + index + ")");
        $scope.ReturnCommandArr.commandsadd += ("PolishingDeviceEnable(" + index + ")" + ";");
    }

    /**错误清除 */
    $scope.addPolishClearError = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PolishingClearError()");
        $scope.ReturnCommandArr.commandsadd += ("PolishingClearError()" + ";");
    }

    /**力传感器清零 */
    $scope.addPolishingTorqueSensorReset = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PolishingTorqueSensorReset()");
        $scope.ReturnCommandArr.commandsadd += ("PolishingTorqueSensorReset()" + ";");
    }

    /**
     * 设置目标转速
     * @param {int16_t} vel 转速值
     */
    $scope.addPolishingSetTargetVelocity = function (vel) {
        if (!vel) {
            toastFactory.info(ptDynamicTags.info_messages[94]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetTargetVelocity(" + vel + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetTargetVelocity(" + vel + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetTargetVelocity(" + vel + ")");
        }
    }

    /**
     * 设置目标接触力
     * @param {int16_t} force 接触力
     */
    $scope.addPolishingSetTargetTorque = function (force) {
        if (!force) {
            toastFactory.info(ptDynamicTags.info_messages[95]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetTargetTorque(" + force + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetTargetTorque(" + force + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetTargetTorque(" + force + ")");
        }
    }

    /**
     * 设置伸出距离
     * @param {int16_t} pos 伸出距离
     */
    $scope.addPolishingSetTargetPosition = function (pos) {
        if (!pos) {
            toastFactory.info(ptDynamicTags.info_messages[96]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetTargetPosition(" + pos + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetTargetPosition(" + pos + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetTargetPosition(" + pos + ")");
        }
    }
    
    /**
     * 设置控制模式
     * @param {int16_t} mode 1-回零模式，2-位置模式，4-力控模式
     */
    $scope.addPolishingSetOperationMode = function (mode) {
        if (!mode) {
            toastFactory.info(ptDynamicTags.info_messages[97]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetOperationMode(" + mode + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetOperationMode(" + mode + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetOperationMode(" + mode + ")");
        }
    }

    /**
     * 设置接触力
     * @param {int16_t} force 接触力
     */
    $scope.addPolishingSetTargetTouchForce = function (force) {
        if (!force) {
            toastFactory.info(ptDynamicTags.info_messages[262]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetTargetTouchForce(" + force + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetTargetTouchForce(" + force + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetTargetTouchForce(" + force + ")");
        }
    }

    /**
     * 设置设定力过渡时间
     * @param {int16_t} time 设定力过渡时间
     */
    $scope.addPolishingSetTargetTouchTime = function (time) {
        if (!time) {
            toastFactory.info(ptDynamicTags.info_messages[263]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetTargetTouchTime(" + time + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetTargetTouchTime(" + time + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetTargetTouchTime(" + time + ")");
        }
    }

    /**
     * 设置工件重量
     * @param {int16_t} weight 
     */
    $scope.addPolishingSetWorkPieceWeight = function (weight) {
        if (!weight) {
            toastFactory.info(ptDynamicTags.info_messages[264]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PolishingSetWorkPieceWeight(" + weight + ")");
            $scope.ReturnCommandArr.commandsadd += ("PolishingSetWorkPieceWeight(" + weight + ")" + ";");
        } else {
            $scope.ReturnString = ("PolishingSetWorkPieceWeight(" + weight + ")");
        }
    }

    /**
     * 伺服ID设置
     * @param {int} id 伺服ID 1~16
     */
    $scope.addAuxServoStatusID = function (id) {
        if (!id) {
            toastFactory.info(ptDynamicTags.info_messages[107]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("AuxServoSetStatusID(" + id + ")");
                $scope.ReturnCommandArr.commandsadd += ("AuxServoSetStatusID(" + id + ")" + ";");
            } else {
                $scope.ReturnString = ("AuxServoSetStatusID(" + $scope.auxServoCommandId.id + ")");
            }
        }
    }

    /**
     * 伺服使能
     * @param {int} status 1-上使能/0-下使能 
     */
    $scope.addAuxServoEnable = function (status) {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + status + ")");
        $scope.ReturnCommandArr.commandsadd += ("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + status + ")" + ";");
    }

    /**
     * 设置控制模式
     * @param {int16_t} mode 0-位置模式，1-速度模式, 2力矩模式
     */
    $scope.addAuxServoSetControlMode = function (mode) {
        if (!mode) {
            toastFactory.info(ptDynamicTags.info_messages[97]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + 0 + ")");
                $scope.ReturnCommandArr.commandshow.push("AuxServoSetControlMode(" + $scope.auxServoCommandId.id + ',' + mode + ")");
                $scope.ReturnCommandArr.commandshow.push("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + 1 + ")");
                $scope.ReturnCommandArr.commandsadd += ("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + 0 + ")" + ";")
                $scope.ReturnCommandArr.commandsadd += ("AuxServoSetControlMode(" + $scope.auxServoCommandId.id + ',' + mode + ")" + ";");
                $scope.ReturnCommandArr.commandsadd += ("AuxServoEnable(" + $scope.auxServoCommandId.id + ',' + 1 + ")" + ";")
            } else {
                $scope.ReturnString = ("AuxServoSetControlMode(" + $scope.auxServoCommandId.id + ',' + $scope.auxServoCommandMode.id + ")");
            }
        }
    }

    /**
     * 设置目标位置
     * @param {float} pos 目标位置
     * @param {float} speed 运行速度
     * @param {int} acc 加速度百分比
     */
    $scope.addAuxServoTargetPos = function (pos, speed, acc) {
        if (!pos) {
            toastFactory.info(ptDynamicTags.info_messages[100]);
            return;
        }
        if (!speed) {
            toastFactory.info(ptDynamicTags.info_messages[101]);
            return;
        }
        if (!acc) {
            toastFactory.info(ptDynamicTags.info_messages[266]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("AuxServoSetTargetPos(" + $scope.auxServoCommandId.id + ',' + pos + ',' + speed + ',' + acc + ")");
            $scope.ReturnCommandArr.commandsadd += ("AuxServoSetTargetPos(" + $scope.auxServoCommandId.id + ',' + pos + ',' + speed + ',' + acc + ")" + ";");
        } else {
            $scope.ReturnString = ("AuxServoSetTargetPos(" + $scope.auxServoCommandId.id + ',' + $scope.auxServoTargetPosCommand + ',' + $scope.auxServoRunSpeedCommand + ',' + acc + ")");
        }
    }

    /**
     * 设置目标速度
     * @param {float} speed 目标速度
     * @param {int} acc 加速度百分比
     */
    $scope.addAuxServoTargetSpeed = function (speed, acc) {
        if (!speed) {
            toastFactory.info(ptDynamicTags.info_messages[102]);
            return;
        }
        if (!acc) {
            toastFactory.info(ptDynamicTags.info_messages[266]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("AuxServoSetTargetSpeed(" + $scope.auxServoCommandId.id + ',' + speed + ',' + acc + ")");
            $scope.ReturnCommandArr.commandsadd += ("AuxServoSetTargetSpeed(" + $scope.auxServoCommandId.id + ',' + speed + ',' + acc + ")" + ";");
        } else {
            $scope.ReturnString = ("AuxServoSetTargetSpeed(" + $scope.auxServoCommandId.id + ',' + speed + ',' + acc + ")");
        }
    }

    /**
     * 设置目标转矩
     * @param {float} torque 目标转矩
     */
    // $scope.addAuxServoTargetTorque = function (torque) {
    //     if (!torque) {
    //         toastFactory.info(ptDynamicTags.info_messages[103]);
    //         return;
    //     }
    //     if ($scope.programAreaRightType == 'add') {
    //         $scope.ReturnCommandArr.commandshow.push("AuxServoSetTargetTorque(" + $scope.auxServoCommandId.id + ',' + torque + ")");
    //         $scope.ReturnCommandArr.commandsadd += ("AuxServoSetTargetTorque(" + $scope.auxServoCommandId.id + ',' + torque + ")" + ";");
    //     } else {
    //         $scope.ReturnString = ("AuxServoSetTargetTorque(" + $scope.auxServoCommandId.id + ',' + $scope.auxServoTargetTorqueCommand + ")");
    //     }
    // }

    /**
     * 设置伺服回零
     * @param {int} mode 回零方式
     * @param {float} searchVel 寻零速度
     * @param {float} latchVel 零点箍位速度
     * @param {int} acc 加速度百分比
     */
    $scope.addAuxServoHoming = function (mode, searchVel, latchVel, acc) {
        if (!mode) {
            toastFactory.info(ptDynamicTags.info_messages[104]);
            return;
        }
        if (!searchVel) {
            toastFactory.info(ptDynamicTags.info_messages[105]);
            return;
        }
        if (!latchVel) {
            toastFactory.info(ptDynamicTags.info_messages[106]);
            return;
        }
        if (!acc) {
            toastFactory.info(ptDynamicTags.info_messages[266]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("AuxServoHoming(" + $scope.auxServoCommandId.id + ',' + mode + ',' + searchVel + "," + latchVel + "," + acc + ")");
            $scope.ReturnCommandArr.commandsadd += ("AuxServoHoming(" + $scope.auxServoCommandId.id + ',' + mode + ',' + searchVel + "," + latchVel + "," + acc + ")" + ";");
        } else {
            $scope.ReturnString = ("AuxServoHoming(" + $scope.auxServoCommandId.id + ',' + mode + ',' + searchVel + ',' + latchVel + "," + acc + ")");
        }
    }

    // 添加机器人模式指令
    $scope.addRobotMode = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("Mode(" + $scope.selectedRobotMode.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("Mode(" + $scope.selectedRobotMode.id + ")" + ";");
        } else {
            $scope.ReturnString = ("Mode(" + $scope.selectedRobotMode.id + ")");
        }
    }

    // 计算段焊方向和长度
    $scope.computeSegmentPar = function(){
        if (($scope.segLindebugspeed == null) || ($scope.segLindebugspeed == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[26]);
            return;
        }
        if (($scope.effectiveDistance == null) || ($scope.effectiveDistance == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[59]);
            return;
        }
        if (($scope.loseDistance == null) || ($scope.loseDistance == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[59]);
            return;
        }
        var segmentCmdString = "";
        segmentCmdString += "seg_distance,seg_x,seg_y,seg_z = GetSegWeldDisDir(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ")"  + "\n";
        segmentCmdString += "if seg_distance ~= nil and seg_x ~= nil and seg_y ~= nil and seg_z ~= nil then" + "\n";
        segmentCmdString += "PTP(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0)" + "\n";
        segmentCmdString += "i = 0; j = 0; k = 0" + "\n";
        // m-执行长度 n-非执行长度
        segmentCmdString += "m =" + $scope.effectiveDistance + "; n =" + $scope.loseDistance + "\n";
        // segmentCmdString += "seg_x = " + seg_x + "; seg_y =" + seg_y + "; seg_z =" + seg_z + "; seg_distance =" + seg_distance + "\n";
        if ($scope.selectedWeaveMode.id == 0) {
            if ($scope.selectedFunctionMode.id == 0) {
                if ($scope.selectedRoundingRule.id == 0) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    // 运动到下一个段焊点的起点，其中seg_distance*seg_x表示段焊直线运动x方向的偏移量
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",seg_distance)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        //变化姿态段焊模式
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        //不变化姿态段焊模式
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 1) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 2) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                }
            } else {
                if ($scope.selectedRoundingRule.id == 0) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",seg_distance)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 1) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 2) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                }
            }
        } else {
            if ($scope.selectedFunctionMode.id == 0) {
                if ($scope.selectedRoundingRule.id == 0) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",seg_distance)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 1) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 2) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                }
            } else {
                if ($scope.selectedRoundingRule.id == 0) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",seg_distance)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "seg_distance*seg_x," + "seg_distance*seg_y," + "seg_distance*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 1) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                } else if ($scope.selectedRoundingRule.id == 2) {
                    segmentCmdString += "while(k<(math.floor(seg_distance/(m+n))*2+2)) do" + "\n";
                    segmentCmdString += "if((-1)^k == 1) then" + "\n";
                    segmentCmdString += "j=j+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "else" + "\n";
                    segmentCmdString += "i=i+1" + "\n";
                    segmentCmdString += "k=k+1" + "\n";
                    segmentCmdString += "if((i*m+j*n)>seg_distance) then" + "\n";
                    segmentCmdString += "break" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "ARCStart(0,0,10000)" + "\n";
                    segmentCmdString += "WeaveStart(0)" + "\n";
                    if ($scope.selectedSegmentMode.id == 1) {
                        segmentCmdString += "compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum = GetSegmentWeldPoint(" + $scope.operation.selectedSegStartPoint.name + ","+  $scope.operation.selectedSegEndPoint.name + ",i*m+j*n)" + "\n";
                        segmentCmdString += "MoveL(compute_j1,compute_j2,compute_j3,compute_j4,compute_j5,compute_j6,compute_x,compute_y,compute_z,compute_rx,compute_ry,compute_rz,compute_tool_num,compute_workPieceNum," + $scope.segLindebugspeed + ",30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)" + "\n";
                    } else {
                        segmentCmdString += "Lin(" + $scope.operation.selectedSegStartPoint.name + "," + $scope.segLindebugspeed + ",-1,0,1," + "(i*m+j*n)*seg_x," + "(i*m+j*n)*seg_y," + "(i*m+j*n)*seg_z," + "0,0,0)" + "\n";
                    }
                    segmentCmdString += "WeaveEnd(0)" + "\n";
                    segmentCmdString += "ARCEnd(0,0,10000)" + "\n";
                    segmentCmdString += "end" + "\n";
                    segmentCmdString += "end" + "\n";
                }
            }
        }
        segmentCmdString += "end" + "\n";
        segmentCmdArr = createCommandsArray(segmentCmdString);
        $scope.handleCommandIndex();
        for (var i = 0; i < segmentCmdArr.length; i++) {
            $scope.ReturnCommandArr.commandshow.push(segmentCmdArr[i]);
            $scope.ReturnCommandArr.commandsadd += (segmentCmdArr[i] + ";");
        }
    }

    function createCommandsArray(commandsData) {
        // 以'\n'字符分割字符串并以数组形式保存
        let commandsArray = commandsData.split('\n');
        if ($scope.showCommandsList == true) {
            commandsArray = commandsArray.filter(function (s) {
                return s && s.trim();
            })
        }
        return commandsArray;
    };


    //添加goto指令
    $scope.addgoto = function () {
        $scope.gototext = document.getElementById("selectedgoto").value;
        if ((null == $scope.gototext) || (0 == $scope.gototext.trim().length)) {
            toastFactory.info(ptDynamicTags.info_messages[60]);
        }
        else {
            let gotoArray = createCommandsArray($scope.gototext);
            $scope.ReturnCommandArr.commandshow = $scope.ReturnCommandArr.commandshow.concat(gotoArray);
            $scope.ReturnCommandArr.commandsadd += ($scope.gototext + ";");
        }
    };

    //添加暂停指令
    $scope.addPause = function (selectedPauseFunction) {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("Pause(" + selectedPauseFunction.num + ")  --" + selectedPauseFunction.name);
        $scope.ReturnCommandArr.commandsadd += ("Pause(" + selectedPauseFunction.num + ")  --" + selectedPauseFunction.name + ";");
    }

    /* 暂停指令功能改变 */
    $scope.changePauseFunc = function (selectedPauseFunction) {
        // 自定义指令编辑
        if (selectedPauseFunction.num == "1"
        || selectedPauseFunction.num == "10"
        || selectedPauseFunction.num == "11"
        || selectedPauseFunction.num == "12"
        || selectedPauseFunction.num == "13"
        || selectedPauseFunction.num == "14") {
            getCustomPause(selectedPauseFunction);
            $scope.show_CustomPause = true;
        } else {
            $scope.show_CustomPause = false;
        }
    }

    /* 保存自定义暂停内容 */
    $scope.saveCustomPause = function (selectedPauseFunction) {
        let cmdContent = {
            cmd: "torque_save_custom_pause",
            data: {
                modal_title: $scope.costomPauseTitle,
                modal_content: $scope.costomPauseContent,
                modal_func_id: selectedPauseFunction.num
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                document.dispatchEvent(new CustomEvent('updatePauseData', { bubbles: true, cancelable: true, composed: true }));
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取自定义暂停内容 */
    function getCustomPause(selectedPauseFunction) {
        let cmdContent = {
            cmd: "torque_get_custom_pause",
            data: {
                modal_func_id: selectedPauseFunction.num
            }
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.costomPauseTitle = data.modal_title;
                $scope.costomPauseContent = data.modal_content;
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //添加变量
    $scope.addVar = function () {
        let inputValue; // 变量名称不能以数字开头
        if ($scope.VarName) {
            inputValue = $scope.VarName.split('')[0];
            if (inputValue <=9 || inputValue >= 0) {
                toastFactory.info(ptDynamicTags.info_messages[217]);
                return;
            }
        }
        let judgeType;
        if ($scope.VarValue) {
            judgeType = $scope.VarValue.match(/[^\d\.-]/g, '') // 若变量初始值为字符串类型需要增加引号
        }
        if ($scope.selectedVarType.id == 1) {
            $scope.handleCommandIndex();
            if (judgeType) {
                $scope.ReturnCommandArr.commandshow.push("local " + $scope.VarName + " = \"" + $scope.VarValue + "\"");
                $scope.ReturnCommandArr.commandsadd += ("local " + $scope.VarName + " = \"" + $scope.VarValue + "\"" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("local " + $scope.VarName + " = " + $scope.VarValue);
                $scope.ReturnCommandArr.commandsadd += ("local " + $scope.VarName + " = " + $scope.VarValue+ ";");
            }
        } else if ($scope.selectedVarType.id == 0) {
            $scope.handleCommandIndex();
            if (judgeType) {
                $scope.ReturnCommandArr.commandshow.push($scope.VarName + " = \"" + $scope.VarValue + "\"");
                $scope.ReturnCommandArr.commandsadd += ($scope.VarName + " = \"" + $scope.VarValue + "\"" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push($scope.VarName + " = " + $scope.VarValue);
                $scope.ReturnCommandArr.commandsadd += ($scope.VarName + " = " + $scope.VarValue + ";");
            }
            
        }
    }


    //添加查询变量
    $scope.addRegisterVar = function () {
        if ($scope.VarQuery == null) {
            toastFactory.info(ptDynamicTags.info_messages[61]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("RegisterVar(\"" + $scope.selectedVarQueryType.id + "\",\"" + $scope.VarQuery + "\")");
            $scope.ReturnCommandArr.commandsadd += ("RegisterVar(\"" + $scope.selectedVarQueryType.id + "\",\"" + $scope.VarQuery + "\")" + ";");
        }
        
    }

	$scope.systemVarData = [];
    // 获取系统变量列表
    function getSysVarList(){
        let getSysVarListCmd = {
            cmd: "get_varlist",
        };
        dataFactory.getData(getSysVarListCmd).then((data) => {
            $scope.systemVarData = data;
            if ($scope.selectedSysVar != null) {
                $scope.selectedSysVar = $scope.systemVarData[$scope.selectedSysVar.id - 1];
            } else {
                $scope.selectedSysVar = $scope.systemVarData[0];
            }
        }, (status) => {
            $scope.systemVarData = [];
            $scope.selectedSysVar = null;
            toastFactory.error(status, ptDynamicTags.error_messages[19]);
        });
    }
    //显示修改系统变量
    let lastSysName;
    $scope.showRenameSysVar = function(){
        $scope.show_chose_sys_var = false;
        $scope.sysName = $scope.selectedSysVar.name;
        lastSysName = $scope.selectedSysVar.name;
    }

    //检查系统变量名是否已存在
    $scope.checkSysVarName = function () {
        $scope.sysName = document.getElementById("sysRename").value;

        //变量名未作修改时，返回可选择变量模式
        if (lastSysName == $scope.sysName) {
            $scope.show_sys_var_rename = false;
            renameSysVar();
            return;
        }
        let checkSysVarNameCmd = {
            cmd: "get_checkvar",
            data: {
                name: $scope.sysName
            }
        }
        dataFactory.getData(checkSysVarNameCmd)
            .then((data) => {
                if (~~data.result) {
                    $scope.show_sys_var_rename = true;
                    $scope.sysVarNameTips = ptDynamicTags.info_messages[62];
                } else {
                    $scope.show_sys_var_rename = false;
                    renameSysVar();
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[20]);
            })
    }

    //修改系统变量名
    function renameSysVar(){
        let renameSysVarCmd = {
            cmd: "rename_var",
            data: {
                name: $scope.sysName,
                id: ~~$scope.selectedSysVar.id,
            },
        };
        dataFactory.actData(renameSysVarCmd)
            .then(() => {
                $scope.show_chose_sys_var = true;
                getSysVarList();
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[21]);
            });
    }

    // 添加获取系统变量
    $scope.addGetSysVar = function() {
        if ($scope.sysVarName == '' || $scope.sysVarName == null || $scope.sysVarName == undefined || !$scope.selectedSysVar) {
            toastFactory.info(ptDynamicTags.info_messages[258]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push($scope.sysVarName + " = " + "GetSysVarValue(" + $scope.selectedSysVar.name + ")");
        $scope.ReturnCommandArr.commandsadd += ($scope.sysVarName + " = " + "GetSysVarValue(" + $scope.selectedSysVar.name + ")" + ";");
    }

    // 添加设置系统变量
    $scope.addSetSysVar = function() {
        if ($scope.sysVarValue == '' || $scope.sysVarValue == null || $scope.sysVarValue == undefined || !$scope.selectedSysVar) {
            toastFactory.info(ptDynamicTags.info_messages[259]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SetSysVarValue(" + $scope.selectedSysVar.name + "," + $scope.sysVarValue + ")");
        $scope.ReturnCommandArr.commandsadd += ("SetSysVarValue(" + $scope.selectedSysVar.name + "," + $scope.sysVarValue + ")" + ";");
    }


    /**力传感器指令 */
    //力/扭矩传感器碰撞检测选择
    $scope.setGuardFT = function(string){
        let cbItem = document.getElementById("FT_Guard_" + string);
        if(cbItem.checked == true) {
            switch (string) {
                case "Fx":
                    $scope.select_guard_Fx = 1;
                    break;
                case "Fy":
                    $scope.select_guard_Fy = 1;
                    break;
                case "Fz":
                    $scope.select_guard_Fz = 1;
                    break;
                case "Tx":
                    $scope.select_guard_Tx = 1;
                    break;
                case "Ty":
                    $scope.select_guard_Ty = 1;
                    break;
                case "Tz":
                    $scope.select_guard_Tz = 1;
                    break;
                default:
                    break;
            }
        } else {
            switch (string) {
                case "Fx":
                    $scope.select_guard_Fx = 0;
                    break;
                case "Fy":
                    $scope.select_guard_Fy = 0;
                    break;
                case "Fz":
                    $scope.select_guard_Fz = 0;
                    break;
                case "Tx":
                    $scope.select_guard_Tx = 0;
                    break;
                case "Ty":
                    $scope.select_guard_Ty = 0;
                    break;
                case "Tz":
                    $scope.select_guard_Tz = 0;
                    break;
                default:
                    break;
            }
        };
    }

    // 添加碰撞检测关闭指令
    $scope.addFtGuardClose = function(){
        if ($scope.select_guard_Fx == 0 && $scope.select_guard_Fy == 0 && $scope.select_guard_Fz == 0 && $scope.select_guard_Tx == 0 && $scope.select_guard_Ty == 0 && $scope.select_guard_Tz == 0) {
            toastFactory.info(ptDynamicTags.info_messages[63]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_Guard(0,"+$scope.selectedFTGuardCoorde.id + "," + $scope.select_guard_Fx + "," + $scope.select_guard_Fy + "," + $scope.select_guard_Fz
            + "," + $scope.select_guard_Tx + "," + $scope.select_guard_Ty + "," + $scope.select_guard_Tz + "," + $scope.FtGuard_Fx + "," + $scope.FtGuard_Fy + "," + $scope.FtGuard_Fz
            + "," + $scope.FtGuard_Tx + "," + $scope.FtGuard_Ty + "," + $scope.FtGuard_Tz + "," + $scope.FtGuard_Fx_Max + "," + $scope.FtGuard_Fy_Max + "," + $scope.FtGuard_Fz_Max
            + "," + $scope.FtGuard_Tx_Max + "," + $scope.FtGuard_Ty_Max + "," + $scope.FtGuard_Tz_Max + "," + $scope.FtGuard_Fx_Min + "," + $scope.FtGuard_Fy_Min + "," + $scope.FtGuard_Fz_Min
            + "," + $scope.FtGuard_Tx_Min + "," + $scope.FtGuard_Ty_Min + "," + $scope.FtGuard_Tz_Min + ")");
        $scope.ReturnCommandArr.commandsadd += ("FT_Guard(0,"+$scope.selectedFTGuardCoorde.id + "," + $scope.select_guard_Fx + "," + $scope.select_guard_Fy + "," + $scope.select_guard_Fz
            + "," + $scope.select_guard_Tx + "," + $scope.select_guard_Ty + "," + $scope.select_guard_Tz + "," + $scope.FtGuard_Fx + "," + $scope.FtGuard_Fy + "," + $scope.FtGuard_Fz
            + "," + $scope.FtGuard_Tx + "," + $scope.FtGuard_Ty + "," + $scope.FtGuard_Tz+ "," + $scope.FtGuard_Fx_Max + "," + $scope.FtGuard_Fy_Max + "," + $scope.FtGuard_Fz_Max
            + "," + $scope.FtGuard_Tx_Max + "," + $scope.FtGuard_Ty_Max + "," + $scope.FtGuard_Tz_Max + "," + $scope.FtGuard_Fx_Min + "," + $scope.FtGuard_Fy_Min + "," + $scope.FtGuard_Fz_Min
            + "," + $scope.FtGuard_Tx_Min + "," + $scope.FtGuard_Ty_Min + "," + $scope.FtGuard_Tz_Min + ")"+";");
    }

    // 添加碰撞检测开启指令
    $scope.addFtGuardOpen = function() {
        if ($scope.select_guard_Fx == 0 && $scope.select_guard_Fy == 0 && $scope.select_guard_Fz == 0 && $scope.select_guard_Tx == 0 && $scope.select_guard_Ty == 0 && $scope.select_guard_Tz == 0) {
            toastFactory.info(ptDynamicTags.info_messages[63]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_Guard(1,"+$scope.selectedFTGuardCoorde.id + "," + $scope.select_guard_Fx + "," + $scope.select_guard_Fy + "," + $scope.select_guard_Fz
                + "," + $scope.select_guard_Tx + "," + $scope.select_guard_Ty + "," + $scope.select_guard_Tz + "," + $scope.FtGuard_Fx + "," + $scope.FtGuard_Fy + "," + $scope.FtGuard_Fz
                + "," + $scope.FtGuard_Tx + "," + $scope.FtGuard_Ty + "," + $scope.FtGuard_Tz+ "," + $scope.FtGuard_Fx_Max + "," + $scope.FtGuard_Fy_Max + "," + $scope.FtGuard_Fz_Max
                + "," + $scope.FtGuard_Tx_Max + "," + $scope.FtGuard_Ty_Max + "," + $scope.FtGuard_Tz_Max + "," + $scope.FtGuard_Fx_Min + "," + $scope.FtGuard_Fy_Min + "," + $scope.FtGuard_Fz_Min
                + "," + $scope.FtGuard_Tx_Min + "," + $scope.FtGuard_Ty_Min + "," + $scope.FtGuard_Tz_Min + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_Guard(1,"+$scope.selectedFTGuardCoorde.id + "," + $scope.select_guard_Fx + "," + $scope.select_guard_Fy + "," + $scope.select_guard_Fz
                + "," + $scope.select_guard_Tx + "," + $scope.select_guard_Ty + "," + $scope.select_guard_Tz + "," + $scope.FtGuard_Fx + "," + $scope.FtGuard_Fy + "," + $scope.FtGuard_Fz
                + "," + $scope.FtGuard_Tx + "," + $scope.FtGuard_Ty + "," + $scope.FtGuard_Tz+ "," + $scope.FtGuard_Fx_Max + "," + $scope.FtGuard_Fy_Max + "," + $scope.FtGuard_Fz_Max
                + "," + $scope.FtGuard_Tx_Max + "," + $scope.FtGuard_Ty_Max + "," + $scope.FtGuard_Tz_Max + "," + $scope.FtGuard_Fx_Min + "," + $scope.FtGuard_Fy_Min + "," + $scope.FtGuard_Fz_Min
                + "," + $scope.FtGuard_Tx_Min + "," + $scope.FtGuard_Ty_Min + "," + $scope.FtGuard_Tz_Min + ")"+";");
        } else {
            $scope.ReturnString = ("FT_Guard("+$scope.FtGuard_Open_Close_Flag+","+$scope.selectedFTGuardCoorde.id + "," + $scope.select_guard_Fx + "," + $scope.select_guard_Fy + "," + $scope.select_guard_Fz
                + "," + $scope.select_guard_Tx + "," + $scope.select_guard_Ty + "," + $scope.select_guard_Tz + "," + $scope.FtGuard_Fx + "," + $scope.FtGuard_Fy + "," + $scope.FtGuard_Fz
                + "," + $scope.FtGuard_Tx + "," + $scope.FtGuard_Ty + "," + $scope.FtGuard_Tz+ "," + $scope.FtGuard_Fx_Max + "," + $scope.FtGuard_Fy_Max + "," + $scope.FtGuard_Fz_Max
                + "," + $scope.FtGuard_Tx_Max + "," + $scope.FtGuard_Ty_Max + "," + $scope.FtGuard_Tz_Max + "," + $scope.FtGuard_Fx_Min + "," + $scope.FtGuard_Fy_Min + "," + $scope.FtGuard_Fz_Min
                + "," + $scope.FtGuard_Tx_Min + "," + $scope.FtGuard_Ty_Min + "," + $scope.FtGuard_Tz_Min + ")");
        }
    }

    // 力/扭矩传感器柔顺控制选择
    $scope.setControlFT = function(string){
        let cbItem = document.getElementById("FT_Control_" + string);
        if(cbItem.checked == true) {
            switch (string) {
                case "Fx":
                    $scope.select_Control_Fx = 1;
                    break;
                case "Fy":
                    $scope.select_Control_Fy = 1;
                    break;
                case "Fz":
                    $scope.select_Control_Fz = 1;
                    break;
                case "Tx":
                    $scope.select_Control_Tx = 1;
                    break;
                case "Ty":
                    $scope.select_Control_Ty = 1;
                    break;
                case "Tz":
                    $scope.select_Control_Tz = 1;
                    break;
                default:
                    break;
            }
        } else {
            switch (string) {
                case "Fx":
                    $scope.select_Control_Fx = 0;
                    break;
                case "Fy":
                    $scope.select_Control_Fy = 0;
                    break;
                case "Fz":
                    $scope.select_Control_Fz = 0;
                    break;
                case "Tx":
                    $scope.select_Control_Tx = 0;
                    break;
                case "Ty":
                    $scope.select_Control_Ty = 0;
                    break;
                case "Tz":
                    $scope.select_Control_Tz = 0;
                    break;
                default:
                    break;
            }
        };
    }

    // 解析选择框
    function transFTState(index) {
        if (index == 1) {
            if ($scope.select_Control_Fx == 1) {
                let cbItem = document.getElementById("FT_Control_Fx");
                cbItem.checked = true;
            }
            if($scope.select_Control_Fy == 1) {
                let cbItem = document.getElementById("FT_Control_Fy");
                cbItem.checked = true;
            }
            if ($scope.select_Control_Fz == 1) {
                let cbItem = document.getElementById("FT_Control_Fz");
                cbItem.checked = true;
            }
            if ($scope.select_Control_Tx == 1) {
                let cbItem = document.getElementById("FT_Control_Tx");
                cbItem.checked = true;
            }
            if ($scope.select_Control_Ty == 1) {
                let cbItem = document.getElementById("FT_Control_Ty");
                cbItem.checked = true;
            }
            if ($scope.select_Control_Tz == 1) {
                let cbItem = document.getElementById("FT_Control_Tz");
                cbItem.checked = true;
            }
        } else {
            if ($scope.select_guard_Fx == 1) {
                let cbItem = document.getElementById("FT_Guard_Fx");
                cbItem.checked = true;
            }
            if ($scope.select_guard_Fy == 1) {
                let cbItem = document.getElementById("FT_Guard_Fy");
                cbItem.checked = true;
            }
            if ($scope.select_guard_Fz == 1) {
                let cbItem = document.getElementById("FT_Guard_Fz");
                cbItem.checked = true;
            }
            if ($scope.select_guard_Tx == 1) {
                let cbItem = document.getElementById("FT_Guard_Tx");
                cbItem.checked = true;
            }
            if ($scope.select_guard_Ty == 1) {
                let cbItem = document.getElementById("FT_Guard_Ty");
                cbItem.checked = true;
            }
            if ($scope.select_guard_Tz == 1) {
                let cbItem = document.getElementById("FT_Guard_Tz");
                cbItem.checked = true;
            }
        }
    }

    // 添加柔顺控制关闭指令
    $scope.addFtControlClose = function() {
        if ($scope.select_Control_Fx == 0 && $scope.select_Control_Fy == 0 && $scope.select_Control_Fz == 0 && $scope.select_Control_Tx == 0 && $scope.select_Control_Ty == 0 && $scope.select_Control_Tz == 0) {
            toastFactory.info(ptDynamicTags.info_messages[64]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_Control(0,"+$scope.selectedFTControlCoorde.id + "," + $scope.select_Control_Fx + "," + $scope.select_Control_Fy + "," + $scope.select_Control_Fz
            + "," + $scope.select_Control_Tx + "," + $scope.select_Control_Ty + "," + $scope.select_Control_Tz + "," + $scope.FtControl_Fx + "," + $scope.FtControl_Fy + "," + $scope.FtControl_Fz
            + "," + $scope.FtControl_Tx + "," + $scope.FtControl_Ty + "," + $scope.FtControl_Tz+ "," + $scope.FtControl_F_P_gain + "," + $scope.FtControl_F_I_gain
            + "," + $scope.FtControl_F_D_gain + "," + $scope.FtControl_T_P_gain + "," + $scope.FtControl_T_I_gain + "," + $scope.FtControl_T_D_gain
            + "," + $scope.selectedFTControlAdjSign.id + "," + $scope.selectedFTControlILCSign.id + "," + $scope.FTControlLimitlength + "," + $scope.FTControlLimitangle + "," + $scope.selectedFTControlFilter.id + "," + $scope.selectedFTControlPA.id + ")");
        $scope.ReturnCommandArr.commandsadd += ("FT_Control(0,"+$scope.selectedFTControlCoorde.id + "," + $scope.select_Control_Fx + "," + $scope.select_Control_Fy + "," + $scope.select_Control_Fz
            + "," + $scope.select_Control_Tx + "," + $scope.select_Control_Ty + "," + $scope.select_Control_Tz + "," + $scope.FtControl_Fx + "," + $scope.FtControl_Fy + "," + $scope.FtControl_Fz
            + "," + $scope.FtControl_Tx + "," + $scope.FtControl_Ty + "," + $scope.FtControl_Tz+ "," + $scope.FtControl_F_P_gain + "," + $scope.FtControl_F_I_gain
            + "," + $scope.FtControl_F_D_gain + "," + $scope.FtControl_T_P_gain + "," + $scope.FtControl_T_I_gain + "," + $scope.FtControl_T_D_gain
            + "," + $scope.selectedFTControlAdjSign.id + "," + $scope.selectedFTControlILCSign.id + "," + $scope.FTControlLimitlength + "," + $scope.FTControlLimitangle + "," + $scope.selectedFTControlFilter.id + "," + $scope.selectedFTControlPA.id + ")"+";");
    }

    // 添加柔顺控制开启指令
    $scope.addFtControlOpen = function() {
        if ($scope.select_Control_Fx == 0 && $scope.select_Control_Fy == 0 && $scope.select_Control_Fz == 0 && $scope.select_Control_Tx == 0 && $scope.select_Control_Ty == 0 && $scope.select_Control_Tz == 0) {
            toastFactory.info(ptDynamicTags.info_messages[64]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_Control(1,"+$scope.selectedFTControlCoorde.id + "," + $scope.select_Control_Fx + "," + $scope.select_Control_Fy + "," + $scope.select_Control_Fz
                + "," + $scope.select_Control_Tx + "," + $scope.select_Control_Ty + "," + $scope.select_Control_Tz + "," + $scope.FtControl_Fx + "," + $scope.FtControl_Fy + "," + $scope.FtControl_Fz
                + "," + $scope.FtControl_Tx + "," + $scope.FtControl_Ty + "," + $scope.FtControl_Tz+ "," + $scope.FtControl_F_P_gain + "," + $scope.FtControl_F_I_gain
                + "," + $scope.FtControl_F_D_gain + "," + $scope.FtControl_T_P_gain + "," + $scope.FtControl_T_I_gain + "," + $scope.FtControl_T_D_gain
                + "," + $scope.selectedFTControlAdjSign.id + "," + $scope.selectedFTControlILCSign.id + "," + $scope.FTControlLimitlength + "," + $scope.FTControlLimitangle + "," + $scope.selectedFTControlFilter.id + "," + $scope.selectedFTControlPA.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_Control(1,"+$scope.selectedFTControlCoorde.id + "," + $scope.select_Control_Fx + "," + $scope.select_Control_Fy + "," + $scope.select_Control_Fz
                + "," + $scope.select_Control_Tx + "," + $scope.select_Control_Ty + "," + $scope.select_Control_Tz + "," + $scope.FtControl_Fx + "," + $scope.FtControl_Fy + "," + $scope.FtControl_Fz
                + "," + $scope.FtControl_Tx + "," + $scope.FtControl_Ty + "," + $scope.FtControl_Tz+ "," + $scope.FtControl_F_P_gain + "," + $scope.FtControl_F_I_gain
                + "," + $scope.FtControl_F_D_gain + "," + $scope.FtControl_T_P_gain + "," + $scope.FtControl_T_I_gain + "," + $scope.FtControl_T_D_gain
                + "," + $scope.selectedFTControlAdjSign.id + "," + $scope.selectedFTControlILCSign.id + "," + $scope.FTControlLimitlength + "," + $scope.FTControlLimitangle + "," + $scope.selectedFTControlFilter.id + "," + $scope.selectedFTControlPA.id + ")"+";");
        } else {
            $scope.ReturnString = ("FT_Control("+$scope.FtControl_Open_Close_Flag+","+$scope.selectedFTControlCoorde.id+ "," + $scope.select_Control_Fx + "," + $scope.select_Control_Fy + "," + $scope.select_Control_Fz
                + "," + $scope.select_Control_Tx + "," + $scope.select_Control_Ty + "," + $scope.select_Control_Tz + "," + $scope.FtControl_Fx + "," + $scope.FtControl_Fy + "," + $scope.FtControl_Fz
                + "," + $scope.FtControl_Tx + "," + $scope.FtControl_Ty + "," + $scope.FtControl_Tz+ "," + $scope.FtControl_F_P_gain + "," + $scope.FtControl_F_I_gain
                + "," + $scope.FtControl_F_D_gain + "," + $scope.FtControl_T_P_gain + "," + $scope.FtControl_T_I_gain + "," + $scope.FtControl_T_D_gain
                + "," + $scope.selectedFTControlAdjSign.id + "," + $scope.selectedFTControlILCSign.id + "," + $scope.FTControlLimitlength + "," + $scope.FTControlLimitangle + "," + $scope.selectedFTControlFilter.id + "," + $scope.selectedFTControlPA.id + ")");
        }
    }

    // 添加螺旋插入指令
    $scope.addFTSpiralSearch = function(){
        if ($scope.FTSpiralIncreasePerTurn == "" || $scope.FTSpiralForceInsertion == "" || $scope.FTSpiralTMax == "" || $scope.FTSpiralVelSpiral == "") {
            toastFactory.info(ptDynamicTags.info_messages[65]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_SpiralSearch("+$scope.selectedFTSpiralCoorde.id+ "," + $scope.FTSpiralIncreasePerTurn + "," + $scope.FTSpiralForceInsertion
                + "," + $scope.FTSpiralTMax + "," + $scope.FTSpiralVelSpiral + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_SpiralSearch("+$scope.selectedFTSpiralCoorde.id+ "," + $scope.FTSpiralIncreasePerTurn + "," + $scope.FTSpiralForceInsertion
                + "," + $scope.FTSpiralTMax + "," + $scope.FTSpiralVelSpiral + ")"+";");
        } else {
            $scope.ReturnString = ("FT_SpiralSearch("+$scope.selectedFTSpiralCoorde.id+ "," + $scope.FTSpiralIncreasePerTurn + "," + $scope.FTSpiralForceInsertion
                + "," + $scope.FTSpiralTMax + "," + $scope.FTSpiralVelSpiral + ")");
        }
        
    }

    //添加旋转插入指令
    $scope.addFTRotInsertion = function(){
        if ($scope.FTRotAngVelRot == "" || $scope.FTRotForceInsertion == "" || $scope.FTRotAngleMax == "" || $scope.FTRotAngleAccMax == "") {
            toastFactory.info(ptDynamicTags.info_messages[66]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_RotInsertion("+$scope.selectedFTRotCoorde.id+ "," + $scope.FTRotAngVelRot + "," + $scope.FTRotForceInsertion
                + "," + $scope.FTRotAngleMax + "," + $scope.selectedFTRotOrn.id + "," + $scope.FTRotAngleAccMax + "," + $scope.selectedFTRotRotOrn.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_RotInsertion("+$scope.selectedFTRotCoorde.id+ "," + $scope.FTRotAngVelRot + "," + $scope.FTRotForceInsertion
                + "," + $scope.FTRotAngleMax + "," + $scope.selectedFTRotOrn.id + "," + $scope.FTRotAngleAccMax + "," + $scope.selectedFTRotRotOrn.id + ")"+";");
        } else {
            $scope.ReturnString = ("FT_RotInsertion("+$scope.selectedFTRotCoorde.id+ "," + $scope.FTRotAngVelRot + "," + $scope.FTRotForceInsertion
                + "," + $scope.FTRotAngleMax + "," + $scope.selectedFTRotOrn.id + "," + $scope.FTRotAngleAccMax + "," + $scope.selectedFTRotRotOrn.id + ")");
        }
    }

    // 添加直线插入指令
    $scope.addFTLinInsertion = function() {
        if ($scope.FTLinForceGoal == "" || $scope.FTLinVel == "" || $scope.FTLinAcc == "" || $scope.FTLinDistanceMax == "") {
            toastFactory.info(ptDynamicTags.info_messages[67]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_LinInsertion("+$scope.selectedFTLinCoorde.id+ "," + $scope.FTLinForceGoal + "," + $scope.FTLinVel
                + "," + $scope.FTLinAcc + "," + $scope.FTLinDistanceMax + "," + $scope.selectedFTLinOrn.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_LinInsertion("+$scope.selectedFTLinCoorde.id+ "," + $scope.FTLinForceGoal + "," + $scope.FTLinVel
                + "," + $scope.FTLinAcc + "," + $scope.FTLinDistanceMax + "," + $scope.selectedFTLinOrn.id + ")"+";");
        } else {
            $scope.ReturnString = ("FT_LinInsertion("+$scope.selectedFTLinCoorde.id+ "," + $scope.FTLinForceGoal + "," + $scope.FTLinVel
                + "," + $scope.FTLinAcc + "," + $scope.FTLinDistanceMax + "," + $scope.selectedFTLinOrn.id + ")");
        }
    }

    // 添加平面定位指令
    $scope.addFTFindSurface = function() {
        if ($scope.FTFindSurfaceVel == "" || $scope.FTFindSurfaceAcc == "" || $scope.FTFindSurfaceDistanceMax == "" || $scope.FTFindSurfaceForceGoal == "") {
            toastFactory.info(ptDynamicTags.info_messages[68]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("FT_FindSurface("+$scope.selectedFTFindSurfaceCoorde.id + "," + $scope.selectedFTFindSurfaceDirection.id + "," + $scope.selectedFTFindSurfaceAxis.id
                + "," + $scope.FTFindSurfaceVel + "," + $scope.FTFindSurfaceAcc + "," + $scope.FTFindSurfaceDistanceMax + "," + $scope.FTFindSurfaceForceGoal + ")");
            $scope.ReturnCommandArr.commandsadd += ("FT_FindSurface("+$scope.selectedFTFindSurfaceCoorde.id + "," + $scope.selectedFTFindSurfaceDirection.id + "," + $scope.selectedFTFindSurfaceAxis.id
                + "," + $scope.FTFindSurfaceVel + "," + $scope.FTFindSurfaceAcc + "," + $scope.FTFindSurfaceDistanceMax + "," + $scope.FTFindSurfaceForceGoal + ")"+";");
        } else {
            $scope.ReturnString = ("FT_FindSurface("+$scope.selectedFTFindSurfaceCoorde.id + "," + $scope.selectedFTFindSurfaceDirection.id + "," + $scope.selectedFTFindSurfaceAxis.id
                + "," + $scope.FTFindSurfaceVel + "," + $scope.FTFindSurfaceAcc + "," + $scope.FTFindSurfaceDistanceMax + "," + $scope.FTFindSurfaceForceGoal + ")");
        }
    }

    // 添加计算中间平面定位开始指令
    $scope.addFTCalCenter_Start = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_CalCenterStart()");
        $scope.ReturnCommandArr.commandsadd += ("FT_CalCenterStart()"+";");
    }

    // 添加计算中间平面定位结束指令
    $scope.addFTCalCenter_End = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_CalCenterEnd()");
        $scope.ReturnCommandArr.commandsadd += ("FT_CalCenterEnd()"+";");
    }

    // 添加柔顺控制开启指令
    $scope.addFT_ComplianceStart = function() {
        if ($scope.FTComplianceAdjust == "" || $scope.FTComplianceThreshold == "") {
            toastFactory.info(ptDynamicTags.info_messages[89]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_ComplianceStart("+ $scope.FTComplianceAdjust + "," + $scope.FTComplianceThreshold + ")");
        $scope.ReturnCommandArr.commandsadd += ("FT_ComplianceStart("+ $scope.FTComplianceAdjust + "," + $scope.FTComplianceThreshold + ")"+";");
    }

    // 添加柔顺控制关闭指令
    $scope.addFT_ComplianceStop = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FT_ComplianceStop()");
        $scope.ReturnCommandArr.commandsadd += ("FT_ComplianceStop()"+";");
    }

    /**3D视觉传感器配置 */
    /**3D视觉传感器配置 */
    $scope.display3DFunction = function(){
        $scope.sort3Dfile = "";
        if($scope.selected3DFunction.id == 0){
            $scope.show_3D_Callbrat = true;
            $scope.show_3D_Pick = false;
        }else{
            $scope.show_3D_Callbrat = false;
            $scope.show_3D_Pick = true;
        }
    }
    $scope.display3DFunction();

    $scope.change3DSensorlocation = function(){
        if($scope.selected3DSensorLocation.id == 0){
            $scope.show_3D_valid = true;
            $scope.show_3D_perfor = false;
        }else{
            $scope.show_3D_perfor = true;
            $scope.show_3D_valid = false;
        }
    }
    $scope.change3DSensorlocation();


    //添加3D视觉程序
    $scope.LaserIP_3D_Sort = "192.168.57.100";
    $scope.LaserPort_3D_Sort = "5000";
    $scope.add3DSensor = function() {
        $scope.handleCommandIndex();
        if (g_lang_code == 'zh') {
            if($scope.selected3DFunction.id == 0){
                $scope.ReturnCommandArr.commandshow.push("--此例为机器人与图漾相机通讯标定示例,其他相机厂商可根据实际需求做相应更改。");
                $scope.ReturnCommandArr.commandshow.push("--相机控制器IP和Port");
                $scope.ReturnCommandArr.commandshow.push("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandshow.push("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandshow.push("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--检查是否建立成功");
                $scope.ReturnCommandArr.commandshow.push("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("  --获取机械臂法兰中心点位姿,位置单位[mm],姿态单位[°]");
                $scope.ReturnCommandArr.commandshow.push("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandshow.push("	--数值转字符");
                $scope.ReturnCommandArr.commandshow.push("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("	--发送字符串至相机控制器");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandshow.push("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--检查应答");            
                $scope.ReturnCommandArr.commandshow.push("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--检查是否建立成功");
                $scope.ReturnCommandArr.commandshow.push("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("	--获取机械臂关节位置,单位[°]");
                $scope.ReturnCommandArr.commandshow.push("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandshow.push("	--数值转字符");
                $scope.ReturnCommandArr.commandshow.push("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    --发送字符串至相机控制器");
                $scope.ReturnCommandArr.commandshow.push("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--检查应答");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--检查是否建立成功");
                $scope.ReturnCommandArr.commandshow.push("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("	--发送拍照字符串至相机控制器");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandshow.push("    rcv_cap = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--检查应答");
                $scope.ReturnCommandArr.commandshow.push("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--检查应答");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_cap == \"0 0 0 0 0 0 2#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("--此例为机器人与图漾相机通讯标定示例,其他相机厂商可根据实际需求做相应更改。");
                $scope.ReturnCommandArr.commandsadd += ("--相机控制器IP和Port");
                $scope.ReturnCommandArr.commandsadd += ("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandsadd += ("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandsadd += ("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--检查是否建立成功");
                $scope.ReturnCommandArr.commandsadd += ("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--获取机械臂法兰中心点位姿,位置单位[mm],姿态单位[°]");
                $scope.ReturnCommandArr.commandsadd += ("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandsadd += ("	--数值转字符");
                $scope.ReturnCommandArr.commandsadd += ("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("	--发送字符串至相机控制器");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--检查应答");            
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--检查是否建立成功");
                $scope.ReturnCommandArr.commandsadd += ("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--获取机械臂关节位置,单位[°]");
                $scope.ReturnCommandArr.commandsadd += ("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandsadd += ("	--数值转字符");
                $scope.ReturnCommandArr.commandsadd += ("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    --发送字符串至相机控制器");
                $scope.ReturnCommandArr.commandsadd += ("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--检查应答");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("--机器人控制柜与相机控制器建立Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--检查是否建立成功");
                $scope.ReturnCommandArr.commandsadd += ("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--发送拍照字符串至相机控制器");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_cap = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--检查应答");
                $scope.ReturnCommandArr.commandsadd += ("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--获取相机控制器应答");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--检查应答");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_cap == \"0 0 0 0 0 0 2#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--机器人控制柜与相机控制器断开Socket通讯");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
            }else if($scope.selected3DFunction.id == 1){
                $scope.ReturnCommandArr.commandshow.push("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandshow.push("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandshow.push("pickzlength = "+$scope.sortPickZOffset);
                $scope.ReturnCommandArr.commandshow.push("pickzangle = "+$scope.sortPickZRotate);
                $scope.ReturnCommandArr.commandshow.push("retreatzlength = "+$scope.sortRetreatZOffset);
                $scope.ReturnCommandArr.commandshow.push("retreatzangle = "+$scope.sortRetreatZRotate);
                $scope.ReturnCommandArr.commandshow.push("--如使用夹爪在此复位激活ActGripper(1,0)/ActGripper(1,1)");
                $scope.ReturnCommandArr.commandshow.push("--拍照点");
                $scope.ReturnCommandArr.commandshow.push("while(1) do");
                $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selected3DsortPhotoPoint.name+ ",30,0,0)");
                $scope.ReturnCommandArr.commandshow.push("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandshow.push("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandshow.push("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    print(rcv_jnt)");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    --触发拍照");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    data_str = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    data_str1 = string.sub(data_str, 2, -2)");
                $scope.ReturnCommandArr.commandshow.push("    res = str_split(data_str1,\"][\")");
                $scope.ReturnCommandArr.commandshow.push("    pick_str = str_split(res[1],\",\")");
                $scope.ReturnCommandArr.commandshow.push("    px = tonumber(pick_str[1])");
                $scope.ReturnCommandArr.commandshow.push("    py = tonumber(pick_str[2])");
                $scope.ReturnCommandArr.commandshow.push("    pz = tonumber(pick_str[3])");
                $scope.ReturnCommandArr.commandshow.push("    prx = tonumber(pick_str[4])");
                $scope.ReturnCommandArr.commandshow.push("    pry = tonumber(pick_str[5])");
                $scope.ReturnCommandArr.commandshow.push("    prz = tonumber(pick_str[6])");
                $scope.ReturnCommandArr.commandshow.push("	 p_j1,p_j2,p_j3,p_j4,p_j5,p_j6 = GetInverseKin(0,px,py,pz,prx,pry,prz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 px,py,pz,prx,pry,prz = GetForwardKin(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6)");
                $scope.ReturnCommandArr.commandshow.push("	 tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandshow.push("	 --计算预抓取点");
                $scope.ReturnCommandArr.commandshow.push("	 pre_x,pre_y,pre_z,pre_rx,pre_ry, pre_rz = ComputePrePick(px,py,pz,prx,pry,prz,pickzlength,pickzangle)");
                $scope.ReturnCommandArr.commandshow.push("	 --计算撤退点");
                $scope.ReturnCommandArr.commandshow.push("	 post_x,post_y,post_z,post_rx,post_ry, post_rz = ComputePostPick(px,py,pz,prx,pry,prz,retreatzlength,retreatzangle)");
                $scope.ReturnCommandArr.commandshow.push("	 --计算关节位置");
                $scope.ReturnCommandArr.commandshow.push("	 pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 post_j1,post_j2,post_j3,post_j4,post_j5,post_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 --直线至预抓取点");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --直线至抓取点");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6,px,py,pz,prx,pry,prz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --在此添加抓取物体动作（夹爪抓取或吸盘吸取");
                $scope.ReturnCommandArr.commandshow.push("	 --直线至撤退点");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(post_j1,post_j2,post_j3,post_j4,post_j5,post_j6,post_x,post_y,post_z,post_rx,post_ry,post_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --在此添加放置物体动作（松开夹爪或吸盘打开");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandsadd += ("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandsadd += ("pickzlength = "+$scope.sortPickZOffset);
                $scope.ReturnCommandArr.commandsadd += ("pickzangle = "+$scope.sortPickZRotate);
                $scope.ReturnCommandArr.commandsadd += ("retreatzlength = "+$scope.sortRetreatZOffset);
                $scope.ReturnCommandArr.commandsadd += ("retreatzangle = "+$scope.sortRetreatZRotate);
                $scope.ReturnCommandArr.commandsadd += ("--如使用夹爪在此复位激活ActGripper(1,0)/ActGripper(1,1)");
                $scope.ReturnCommandArr.commandsadd += ("--拍照点");
                $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selected3DsortPhotoPoint.name+ ",10,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("tcp1 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandsadd += ("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    print(rcv_tcp)");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("tcp2 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandsadd += ("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    print(rcv_jnt)");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("tcp3 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    --触发拍照");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    data_str = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    data_str1 = string.sub(data_str, 2, -2)");
                $scope.ReturnCommandArr.commandsadd += ("    res = str_split(data_str1,\"][\")");
                $scope.ReturnCommandArr.commandsadd += ("    pick_str = str_split(res[1],\",\")");
                $scope.ReturnCommandArr.commandsadd += ("    px = tonumber(pick_str[1])");
                $scope.ReturnCommandArr.commandsadd += ("    py = tonumber(pick_str[2])");
                $scope.ReturnCommandArr.commandsadd += ("    pz = tonumber(pick_str[3])");
                $scope.ReturnCommandArr.commandsadd += ("    prx = tonumber(pick_str[4])");
                $scope.ReturnCommandArr.commandsadd += ("    pry = tonumber(pick_str[5])");
                $scope.ReturnCommandArr.commandsadd += ("    prz = tonumber(pick_str[6])");
                $scope.ReturnCommandArr.commandsadd += ("	 p_j1,p_j2,p_j3,p_j4,p_j5,p_j6 = GetInverseKin(0,px,py,pz,prx,pry,prz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 px,py,pz,prx,pry,prz = GetForwardKin(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6)");
                $scope.ReturnCommandArr.commandsadd += ("	 tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("	 --计算预抓取点");
                $scope.ReturnCommandArr.commandsadd += ("	 pre_x,pre_y,pre_z,pre_rx,pre_ry, pre_rz = ComputePrePick(px,py,pz,prx,pry,prz,pickzlength,pickzangle)");
                $scope.ReturnCommandArr.commandsadd += ("	 --计算撤退点");
                $scope.ReturnCommandArr.commandsadd += ("	 post_x,post_y,post_z,post_rx,post_ry, post_rz = ComputePostPick(px,py,pz,prx,pry,prz,retreatzlength,retreatzangle)");
                $scope.ReturnCommandArr.commandsadd += ("	 --计算关节位置");
                $scope.ReturnCommandArr.commandsadd += ("	 pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 post_j1,post_j2,post_j3,post_j4,post_j5,post_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 --直线至预抓取点");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --直线至抓取点");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6,px,py,pz,prx,pry,prz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --在此添加抓取物体动作（夹爪抓取或吸盘吸取");
                $scope.ReturnCommandArr.commandsadd += ("	 --直线至撤退点");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(post_j1,post_j2,post_j3,post_j4,post_j5,post_j6,post_x,post_y,post_z,post_rx,post_ry,post_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --在此添加放置物体动作（松开夹爪或吸盘打开");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("end");
            }
        } else {
            if($scope.selected3DFunction.id == 0){
                $scope.ReturnCommandArr.commandshow.push("--This example is an example of communication calibration between a robot and a Percipio camera. Other camera manufacturers can make corresponding changes according to actual needs. ");
                $scope.ReturnCommandArr.commandshow.push("--Camera controller IP and Port. ");
                $scope.ReturnCommandArr.commandshow.push("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandshow.push("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandshow.push("--Establish Socket communication between the robot control cabinet and the camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandshow.push("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("  --Get the pose of the center point of the robot arm flange, position unit [mm], attitude unit [°]. ");
                $scope.ReturnCommandArr.commandshow.push("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandshow.push("	--Convert numeric value to character. ");
                $scope.ReturnCommandArr.commandshow.push("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("	--Send string to camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandshow.push("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--check response ");            
                $scope.ReturnCommandArr.commandshow.push("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--The robot control cabinet and camera controller disconnect Socket communication. ");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("--Establish Socket communication between the robot control cabinet and the camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandshow.push("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("	--Get the joint position of the robot arm, unit [°]. ");
                $scope.ReturnCommandArr.commandshow.push("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandshow.push("	--Convert numeric value to character ");
                $scope.ReturnCommandArr.commandshow.push("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    --Send string to camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--check response ");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--The robot control cabinet and camera controller disconnect Socket communication.");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("--Establish Socket communication between the robot control cabinet and the camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandshow.push("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("	--Send photo string to camera controller. ");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandshow.push("    rcv_cap = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--check response ");
                $scope.ReturnCommandArr.commandshow.push("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("	--check response ");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_cap == \"0 0 0 0 0 0 2#\" then");
                $scope.ReturnCommandArr.commandshow.push("		--The robot control cabinet and camera controller disconnect Socket communication. ");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("--This example is an example of communication calibration between a robot and a Percipio camera. Other camera manufacturers can make corresponding changes according to actual needs. ");
                $scope.ReturnCommandArr.commandsadd += ("--Camera controller IP and Port. ");
                $scope.ReturnCommandArr.commandsadd += ("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandsadd += ("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandsadd += ("--Establish Socket communication between the robot control cabinet and the camera controller.");
                $scope.ReturnCommandArr.commandsadd += ("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandsadd += ("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--Get the pose of the center point of the robot arm flange, position unit [mm], attitude unit [°]. ");
                $scope.ReturnCommandArr.commandsadd += ("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandsadd += ("	--Convert numeric value to character ");
                $scope.ReturnCommandArr.commandsadd += ("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("	--Send string to camera controller. ");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--check response ");            
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--The robot control cabinet and camera controller disconnect Socket communication. ");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("--Establish Socket communication between the robot control cabinet and the camera controller. ");
                $scope.ReturnCommandArr.commandsadd += ("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandsadd += ("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--Get the joint position of the robot arm, unit [°]. ");
                $scope.ReturnCommandArr.commandsadd += ("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandsadd += ("	--Convert numeric value to character.");
                $scope.ReturnCommandArr.commandsadd += ("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    --Send string to camera controller. ");
                $scope.ReturnCommandArr.commandsadd += ("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--check response ");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--The robot control cabinet and camera controller disconnect Socket communication. ");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("--Establish Socket communication between the robot control cabinet and the camera controller. ");
                $scope.ReturnCommandArr.commandsadd += ("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("--Check whether the establishment is successful. ");
                $scope.ReturnCommandArr.commandsadd += ("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("	--Send photo string to camera controller. ");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_cap = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--check response ");
                $scope.ReturnCommandArr.commandsadd += ("	SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--Get camera controller response. ");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("	--check response ");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_cap == \"0 0 0 0 0 0 2#\" then");
                $scope.ReturnCommandArr.commandsadd += ("		--The robot control cabinet and camera controller disconnect Socket communication. ");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
            }else if($scope.selected3DFunction.id == 1){
                $scope.ReturnCommandArr.commandshow.push("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandshow.push("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandshow.push("pickzlength = "+$scope.sortPickZOffset);
                $scope.ReturnCommandArr.commandshow.push("pickzangle = "+$scope.sortPickZRotate);
                $scope.ReturnCommandArr.commandshow.push("retreatzlength = "+$scope.sortRetreatZOffset);
                $scope.ReturnCommandArr.commandshow.push("retreatzangle = "+$scope.sortRetreatZRotate);
                $scope.ReturnCommandArr.commandshow.push("--If using the gripper, reset here to activate ActGripper(1,0)/ActGripper(1,1)");
                $scope.ReturnCommandArr.commandshow.push("--photo spot ");
                $scope.ReturnCommandArr.commandshow.push("while(1) do");
                $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selected3DsortPhotoPoint.name+ ",30,0,0)");
                $scope.ReturnCommandArr.commandshow.push("tcp1 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandshow.push("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("tcp2 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandshow.push("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    print(rcv_jnt)");
                $scope.ReturnCommandArr.commandshow.push("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandshow.push("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("    end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("tcp3 = SocketOpen(ip,port,\"socket_0\")");
                $scope.ReturnCommandArr.commandshow.push("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandshow.push("    --Trigger photo ");
                $scope.ReturnCommandArr.commandshow.push("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    data_str = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandshow.push("    data_str1 = string.sub(data_str, 2, -2)");
                $scope.ReturnCommandArr.commandshow.push("    res = str_split(data_str1,\"][\")");
                $scope.ReturnCommandArr.commandshow.push("    pick_str = str_split(res[1],\",\")");
                $scope.ReturnCommandArr.commandshow.push("    px = tonumber(pick_str[1])");
                $scope.ReturnCommandArr.commandshow.push("    py = tonumber(pick_str[2])");
                $scope.ReturnCommandArr.commandshow.push("    pz = tonumber(pick_str[3])");
                $scope.ReturnCommandArr.commandshow.push("    prx = tonumber(pick_str[4])");
                $scope.ReturnCommandArr.commandshow.push("    pry = tonumber(pick_str[5])");
                $scope.ReturnCommandArr.commandshow.push("    prz = tonumber(pick_str[6])");
                $scope.ReturnCommandArr.commandshow.push("	 p_j1,p_j2,p_j3,p_j4,p_j5,p_j6 = GetInverseKin(0,px,py,pz,prx,pry,prz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 px,py,pz,prx,pry,prz = GetForwardKin(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6)");
                $scope.ReturnCommandArr.commandshow.push("	 tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandshow.push("	 --Calculate prefetch points. ");
                $scope.ReturnCommandArr.commandshow.push("	 pre_x,pre_y,pre_z,pre_rx,pre_ry, pre_rz = ComputePrePick(px,py,pz,prx,pry,prz,pickzlength,pickzangle)");
                $scope.ReturnCommandArr.commandshow.push("	 --Calculate retreat point. ");
                $scope.ReturnCommandArr.commandshow.push("	 post_x,post_y,post_z,post_rx,post_ry, post_rz = ComputePostPick(px,py,pz,prx,pry,prz,retreatzlength,retreatzangle)");
                $scope.ReturnCommandArr.commandshow.push("	 --Calculate joint positions. ");
                $scope.ReturnCommandArr.commandshow.push("	 pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 post_j1,post_j2,post_j3,post_j4,post_j5,post_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandshow.push("	 --Straight line to pre-grab point. ");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --Straight line to grab point. ");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6,px,py,pz,prx,pry,prz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --Add the object grabbing action here (claw grabbing or suction cup picking ");
                $scope.ReturnCommandArr.commandshow.push("	 --Straight line to retreat point. ");
                $scope.ReturnCommandArr.commandshow.push("	 MoveL(post_j1,post_j2,post_j3,post_j4,post_j5,post_j6,post_x,post_y,post_z,post_rx,post_ry,post_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandshow.push("	 --Add the action of placing the object here (release the gripper or open the suction cup ");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandshow.push("end");
                $scope.ReturnCommandArr.commandsadd += ("ip = \""+$scope.LaserIP_3D_Sort+"\"");
                $scope.ReturnCommandArr.commandsadd += ("port = "+$scope.LaserPort_3D_Sort);
                $scope.ReturnCommandArr.commandsadd += ("pickzlength = "+$scope.sortPickZOffset);
                $scope.ReturnCommandArr.commandsadd += ("pickzangle = "+$scope.sortPickZRotate);
                $scope.ReturnCommandArr.commandsadd += ("retreatzlength = "+$scope.sortRetreatZOffset);
                $scope.ReturnCommandArr.commandsadd += ("retreatzangle = "+$scope.sortRetreatZRotate);
                $scope.ReturnCommandArr.commandsadd += ("--If using the gripper, reset here to activate ActGripper(1,0)/ActGripper(1,1)");
                $scope.ReturnCommandArr.commandsadd += ("--photo spot ");
                $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selected3DsortPhotoPoint.name+ ",10,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("tcp1 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp1 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    x,y,z,rx,ry,rz = GetActualToolFlangePose()");
                $scope.ReturnCommandArr.commandsadd += ("    str_tcp = \"ROBOT_TCP\"..\" \"..tostring(x/1000)..\" \"..tostring(y/1000)..\" \"..tostring(z/1000)..\" \"..tostring(math.rad(rx))..\" \"..tostring(math.rad(ry))..\" \"..tostring(math.rad(rz))..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_tcp,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_tcp = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    print(rcv_tcp)");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_tcp == \"ROBOT_TCP#\" then");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("tcp2 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp2 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    j1,j2,j3,j4,j5,j6 = GetActualJointPosRadian()");
                $scope.ReturnCommandArr.commandsadd += ("    str_jnt = \"ROBOT_JOINTS\"..\" \"..tostring(j1)..\" \"..tostring(j2)..\" \"..tostring(j3)..\" \"..tostring(j4)..\" \"..tostring(j5)..\" \"..tostring(j6)..\"#\"");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(str_jnt,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    rcv_jnt = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    print(rcv_jnt)");
                $scope.ReturnCommandArr.commandsadd += ("    if rcv_jnt == \"ROBOT_JOINTS#\" then");
                $scope.ReturnCommandArr.commandsadd += ("        SocketClose(\"socket_0\")");
                $scope.ReturnCommandArr.commandsadd += ("    end");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("tcp3 = SocketOpen(ip,port,\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("if tcp3 == 1 then");
                $scope.ReturnCommandArr.commandsadd += ("    --Trigger photo. ");
                $scope.ReturnCommandArr.commandsadd += ("    SocketSendString(\"CAPTURE #\",\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    data_str = SocketReadString(\"socket_0\",0)");
                $scope.ReturnCommandArr.commandsadd += ("    data_str1 = string.sub(data_str, 2, -2)");
                $scope.ReturnCommandArr.commandsadd += ("    res = str_split(data_str1,\"][\")");
                $scope.ReturnCommandArr.commandsadd += ("    pick_str = str_split(res[1],\",\")");
                $scope.ReturnCommandArr.commandsadd += ("    px = tonumber(pick_str[1])");
                $scope.ReturnCommandArr.commandsadd += ("    py = tonumber(pick_str[2])");
                $scope.ReturnCommandArr.commandsadd += ("    pz = tonumber(pick_str[3])");
                $scope.ReturnCommandArr.commandsadd += ("    prx = tonumber(pick_str[4])");
                $scope.ReturnCommandArr.commandsadd += ("    pry = tonumber(pick_str[5])");
                $scope.ReturnCommandArr.commandsadd += ("    prz = tonumber(pick_str[6])");
                $scope.ReturnCommandArr.commandsadd += ("	 p_j1,p_j2,p_j3,p_j4,p_j5,p_j6 = GetInverseKin(0,px,py,pz,prx,pry,prz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 px,py,pz,prx,pry,prz = GetForwardKin(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6)");
                $scope.ReturnCommandArr.commandsadd += ("	 tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("	 --Calculate prefetch points. ");
                $scope.ReturnCommandArr.commandsadd += ("	 pre_x,pre_y,pre_z,pre_rx,pre_ry, pre_rz = ComputePrePick(px,py,pz,prx,pry,prz,pickzlength,pickzangle)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Calculate retreat point. ");
                $scope.ReturnCommandArr.commandsadd += ("	 post_x,post_y,post_z,post_rx,post_ry, post_rz = ComputePostPick(px,py,pz,prx,pry,prz,retreatzlength,retreatzangle)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Calculate joint positions. ");
                $scope.ReturnCommandArr.commandsadd += ("	 pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 post_j1,post_j2,post_j3,post_j4,post_j5,post_j6 = GetInverseKin(0,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,-1)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Straight line to pre-grab point. ");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(pre_j1,pre_j2,pre_j3,pre_j4,pre_j5,pre_j6,pre_x,pre_y,pre_z,pre_rx,pre_ry,pre_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Straight line to grab point. ");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(p_j1,p_j2,p_j3,p_j4,p_j5,p_j6,px,py,pz,prx,pry,prz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Add the object grabbing action here (claw grabbing or suction cup picking ");
                $scope.ReturnCommandArr.commandsadd += ("	 --Straight line to retreat point. ");
                $scope.ReturnCommandArr.commandsadd += ("	 MoveL(post_j1,post_j2,post_j3,post_j4,post_j5,post_j6,post_x,post_y,post_z,post_rx,post_ry,post_rz,tool_num,0,30,30,30,0,0,0,0,0,0,0,0,0,0,0,0,0)");
                $scope.ReturnCommandArr.commandsadd += ("	 --Add the action of placing the object here (release the gripper or open the suction cup ");
                $scope.ReturnCommandArr.commandsadd += ("end");
                $scope.ReturnCommandArr.commandsadd += ("end");
            }
        }
    }

    /**矩阵移动 */

    //根据所选运动方式显示图片
    $scope.PalletPatternChange = function(){
        $scope.show_Pallet_Pattern0 = false;
        $scope.show_Pallet_Pattern1 = false;
        switch(~~($scope.selectedPalletPattern.id)){
            case 0:
                $scope.show_Pallet_Pattern0 = true;
                break;
            case 1:
                $scope.show_Pallet_Pattern1 = true;
                break;
            default:
                break;
        }
    }
    $scope.PalletPatternChange();

    //根据所选堆叠方式显示图片
    $scope.palletDirectionChange = function(){
        $scope.show_Pallet_Direction0 = false;
        $scope.show_Pallet_Direction1 = false;
        switch(~~($scope.selectedPalletDirection.id)){
            case 0:
                $scope.show_Pallet_Direction0 = true;
                break;
            case 1:
                $scope.show_Pallet_Direction1 = true;
                break;
            default:
                break;
        }
    }
    $scope.palletDirectionChange();

    //添加矩阵程序
    $scope.addpallet = function(){
        var dx1;
        var dx2;
        var dy1;
        var dy2;
        //var dz1;
        //var dz2;
        if (($scope.palletRow == null) || ($scope.palletRow == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[70]);
            return;
        }
        if (($scope.palletColum == null) || ($scope.palletColum == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[71]);
            return;
        }
        if (($scope.palletLayer == null) || ($scope.palletLayer == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[72]);
            return;
        }
        if (($scope.palletHeight == null) || ($scope.palletHeight == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[73]);
            return;
        }
        if ($scope.palletColum == 1) {
            dx1 = 0;
            dy1 = 0;
            //dz1 = 0;
        } else {
            dx1 = parseFloat(($scope.operation.selectedPalletPoint2.x - $scope.operation.selectedPalletPoint1.x) / ($scope.palletColum - 1)).toFixed(3);
            dy1 = parseFloat(($scope.operation.selectedPalletPoint2.y - $scope.operation.selectedPalletPoint1.y) / ($scope.palletColum - 1)).toFixed(3);
            //dz1 = parseFloat(($scope.operation.selectedPalletPoint2.z - $scope.operation.selectedPalletPoint1.z)/($scope.palletColum-1)).toFixed(3);
        }
        if ($scope.palletRow == 1) {
            dx2 = 0;
            dy2 = 0;
            //dz2 = 0;
        } else {
            dx2 = parseFloat(($scope.operation.selectedPalletPoint3.x - $scope.operation.selectedPalletPoint2.x) / ($scope.palletRow - 1)).toFixed(3);
            dy2 = parseFloat(($scope.operation.selectedPalletPoint3.y - $scope.operation.selectedPalletPoint2.y) / ($scope.palletRow - 1)).toFixed(3);
            //dz2 = parseFloat(($scope.operation.selectedPalletPoint3.z - $scope.operation.selectedPalletPoint2.z)/($scope.palletRow-1)).toFixed(3);
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("m = 0; n = 0; h = 0");
        $scope.ReturnCommandArr.commandshow.push("i = "+$scope.palletColum+"; j ="+$scope.palletRow+"; k ="+$scope.palletLayer);
        $scope.ReturnCommandArr.commandshow.push("while(h<k) do");
        $scope.ReturnCommandArr.commandshow.push("while(n<j) do");
        $scope.ReturnCommandArr.commandshow.push("while(m<i) do");
        $scope.ReturnCommandArr.commandsadd += ("m = 0; n = 0; h = 0");
        $scope.ReturnCommandArr.commandsadd += ("i = "+$scope.palletColum+"; j ="+$scope.palletRow+"; k ="+$scope.palletLayer);
        $scope.ReturnCommandArr.commandsadd += ("while(h<k) do");
        $scope.ReturnCommandArr.commandsadd += ("while(n<j) do");
        $scope.ReturnCommandArr.commandsadd += ("while(m<i) do");
        if($scope.selectedPalletDirection.id){
            if($scope.selectedPalletMotion.id){
                if($scope.selectedPalletPattern.id){ 
                    $scope.ReturnCommandArr.commandshow.push("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("else");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += ("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("else");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-(k-1-h)+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("end");
                    
                } else{
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                }
            } else{
                if($scope.selectedPalletPattern.id){
                    $scope.ReturnCommandArr.commandshow.push("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("else");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += ("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("else");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("end");
                } else{
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*-h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                }
            }
        } else{
            if($scope.selectedPalletMotion.id == 1){
                if($scope.selectedPalletPattern.id == 1){ 
                    $scope.ReturnCommandArr.commandshow.push("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("else");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += ("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("else");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("end");
                } else{
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("Lin("+$scope.operation.selectedPalletPoint1.name+",10,-1,0,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                }
            } else{
                if($scope.selectedPalletPattern.id){
                    $scope.ReturnCommandArr.commandshow.push("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("else");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("end");
                    $scope.ReturnCommandArr.commandsadd += ("if((-1)^n == 1) then");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("else");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*(i-1-m)+"+dx2+"*n,"+dy1+"*(i-1-m)+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("end");
                } else{
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandshow.push("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h"+",0,0,0)");
                    $scope.ReturnCommandArr.commandsadd += ("PTP("+$scope.operation.selectedPalletPoint1.name+",10,-1,1,"+dx1+"*m+"+dx2+"*n,"+dy1+"*m+"+
                    dy2+"*n,"+$scope.palletHeight+"*h+"+$scope.palletHeight+"*("+$scope.palletLayer+"+1)"+",0,0,0)");
                }
            }
        }
        $scope.ReturnCommandArr.commandshow.push("RegisterVar(\"number\",\"m\")");
        $scope.ReturnCommandArr.commandshow.push("RegisterVar(\"number\",\"n\")");
        $scope.ReturnCommandArr.commandshow.push("RegisterVar(\"number\",\"h\")");
        $scope.ReturnCommandArr.commandshow.push("m = m+1");
        $scope.ReturnCommandArr.commandshow.push("end");
        $scope.ReturnCommandArr.commandshow.push("n = n+1; m = 0");
        $scope.ReturnCommandArr.commandshow.push("end");
        $scope.ReturnCommandArr.commandshow.push("m = 0; n = 0");
        $scope.ReturnCommandArr.commandshow.push("h = h+1");
        $scope.ReturnCommandArr.commandshow.push("end");
        $scope.ReturnCommandArr.commandsadd += ("RegisterVar(\"number\",\"m\")");
        $scope.ReturnCommandArr.commandsadd += ("RegisterVar(\"number\",\"n\")");
        $scope.ReturnCommandArr.commandsadd += ("RegisterVar(\"number\",\"h\")");
        $scope.ReturnCommandArr.commandsadd += ("m = m+1");
        $scope.ReturnCommandArr.commandsadd += ("end");
        $scope.ReturnCommandArr.commandsadd += ("n = n+1; m = 0");
        $scope.ReturnCommandArr.commandsadd += ("end");
        $scope.ReturnCommandArr.commandsadd += ("m = 0; n = 0");
        $scope.ReturnCommandArr.commandsadd += ("h = h+1");
        $scope.ReturnCommandArr.commandsadd += ("end");
    }

    /* 点位偏移 */
    // 添加点位偏移开始指令
    $scope.addPointOffsetEnable = function(){
        if($scope.PointOffset_x == 0 && $scope.PointOffset_rx == 0 && $scope.PointOffset_y == 0 && $scope.PointOffset_ry == 0
            && $scope.PointOffset_z == 0 && $scope.PointOffset_rz == 0){
            toastFactory.info(ptDynamicTags.info_messages[74]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("PointsOffsetEnable(0," + $scope.PointOffset_x + "," + $scope.PointOffset_y + "," + $scope.PointOffset_z
                + "," + $scope.PointOffset_rx + "," + $scope.PointOffset_ry + "," + $scope.PointOffset_rz + ")");
            $scope.ReturnCommandArr.commandsadd += ("PointsOffsetEnable(0," + $scope.PointOffset_x + "," + $scope.PointOffset_y + "," + $scope.PointOffset_z
                + "," + $scope.PointOffset_rx + "," + $scope.PointOffset_ry + "," + $scope.PointOffset_rz + ")"+";");
        } else {
            $scope.ReturnString = ("PointsOffsetEnable(0," + $scope.PointOffset_x + "," + $scope.PointOffset_y + "," + $scope.PointOffset_z
                + "," + $scope.PointOffset_rx + "," + $scope.PointOffset_ry + "," + $scope.PointOffset_rz + ")");
        }
        
    }

    // 添加点位偏移结束指令
    $scope.addPointOffsetDisable = function(){
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PointsOffsetDisable()");
        $scope.ReturnCommandArr.commandsadd += ("PointsOffsetDisable()"+";");
    }
    /* ./点位偏移 */

    //焊丝寻位获取计算结果焊缝类型方法切换
    $scope.changeWireSearchType = function(){
        switch($scope.selectedWireSearchType.id){
            case "0":
                $scope.wireSearchMethodData = $scope.wireSearchType1MethodData;
                break;
            case "1":
                $scope.wireSearchMethodData = $scope.wireSearchType2MethodData;
                break;
            case "2":
                $scope.wireSearchMethodData = $scope.wireSearchType3MethodData;
                break;
            case "3":
                $scope.wireSearchMethodData = $scope.wireSearchType4MethodData;
                break;
            case "4":
                $scope.wireSearchMethodData = $scope.wireSearchType5MethodData;
                break;
            default:
                break;
        }
        $scope.selectedWireSearchMethod = $scope.wireSearchMethodData[0];
        $scope.changeWireSearchMethod();
    }
    
    //焊丝寻位获取计算结果计算方法切换
    $scope.changeWireSearchMethod = function(){
        $scope.show_WireSearchType1_Method1 = false;
        $scope.show_WireSearchType1_Method2 = false;
        $scope.show_WireSearchType1_Method3 = false;
        $scope.show_WireSearchType1_Method4 = false;
        $scope.show_WireSearchType1_Method5 = false;
        $scope.show_WireSearchType2_Method1 = false;
        $scope.show_WireSearchType3_Method1 = false;
        $scope.show_WireSearchType4_Method1 = false;
        $scope.show_WireSearchType5_Method1 = false;
        switch($scope.selectedWireSearchMethod.id){
            case "0":
                $scope.show_WireSearchType1_Method1 = true;
                break;
            case "1":
                $scope.show_WireSearchType1_Method2 = true;
                break;
            case "2":
                $scope.show_WireSearchType1_Method3 = true;
                break;
            case "3":
                $scope.show_WireSearchType1_Method4 = true;
                break;
            case "4":
                $scope.show_WireSearchType1_Method5 = true;
                break;
            case "5":
                $scope.show_WireSearchType2_Method1 = true;
                break;
            case "6":
                $scope.show_WireSearchType3_Method1 = true;
                break;
            case "7":
                $scope.show_WireSearchType4_Method1 = true;
                break;
            case "8":
                $scope.show_WireSearchType5_Method1 = true;
                break;
            default:
                break;
        }
    }
    $scope.changeWireSearchMethod();

    //焊丝寻位获取计算结果焊缝类型方法切换
    $scope.changeGuardWireSearchType = function(){
        switch($scope.selectedGuardWireSearchType.id){
            case "0":
                $scope.wireSearchGuardMethodData = $scope.wireSearchType1MethodData;
                break;
            case "1":
                $scope.wireSearchGuardMethodData = $scope.wireSearchType2MethodData;
                break;
            case "2":
                $scope.wireSearchGuardMethodData = $scope.wireSearchType3MethodData;
                break;
            case "3":
                $scope.wireSearchGuardMethodData = $scope.wireSearchType4MethodData;
                break;
            case "4":
                $scope.wireSearchGuardMethodData = $scope.wireSearchType5MethodData;
                break;
            default:
                break;
        }
        $scope.selectedGuardWireSearchMethod = $scope.wireSearchGuardMethodData[0];
        $scope.changeGuardWireSearchMethod();
    }
    
    //焊丝寻位获取计算结果计算方法切换
    $scope.changeGuardWireSearchMethod = function(){
        $scope.show_Guard_WireSearchType1_Method1 = false;
        $scope.show_Guard_WireSearchType1_Method2 = false;
        $scope.show_Guard_WireSearchType1_Method3 = false;
        $scope.show_Guard_WireSearchType1_Method4 = false;
        $scope.show_Guard_WireSearchType1_Method5 = false;
        $scope.show_Guard_WireSearchType2_Method1 = false;
        $scope.show_Guard_WireSearchType3_Method1 = false;
        $scope.show_Guard_WireSearchType4_Method1 = false;
        $scope.show_Guard_WireSearchType5_Method1 = false;
        switch($scope.selectedGuardWireSearchMethod.id){
            case "0":
                $scope.show_Guard_WireSearchType1_Method1 = true;
                break;
            case "1":
                $scope.show_Guard_WireSearchType1_Method2 = true;
                break;
            case "2":
                $scope.show_Guard_WireSearchType1_Method3 = true;
                break;
            case "3":
                $scope.show_Guard_WireSearchType1_Method4 = true;
                break;
            case "4":
                $scope.show_Guard_WireSearchType1_Method5 = true;
                break;
            case "5":
                $scope.show_Guard_WireSearchType2_Method1 = true;
                break;
            case "6":
                $scope.show_Guard_WireSearchType3_Method1 = true;
                break;
            case "7":
                $scope.show_Guard_WireSearchType4_Method1 = true;
                break;
            case "8":
                $scope.show_Guard_WireSearchType5_Method1 = true;
                break;
            default:
                break;
        }
    }
    $scope.changeGuardWireSearchType();

    //  添加焊丝寻位开始指令
    $scope.addWireSearchStart = function() {
        if (($scope.tserachSpeed == null)||($scope.tserachSpeed == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[75]);
            return;
        }
        if (($scope.tserachDistance == null)||($scope.tserachDistance == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[76]);
            return;
        }
        if (($scope.tserachBackSpeed == null)||($scope.tserachBackSpeed == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[77]);
            return;
        }
        if (($scope.tserachBackDistance == null)||($scope.tserachBackDistance == undefined)) {
            toastFactory.info(ptDynamicTags.info_messages[78]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("WireSearchStart(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WireSearchStart(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")"+";");
        } else {
            $scope.ReturnString = ("WireSearchStart(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")");
        }
        
    }

    //  添加焊丝寻位结束指令
    $scope.addWireSearchStop = function() {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            $scope.ReturnCommandArr.commandshow.push("WireSearchEnd(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("WireSearchEnd(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")"+";");
        } else {
            $scope.ReturnString = ("WireSearchEnd(" + $scope.selectedWireRefPos.id + "," + $scope.tserachSpeed + "," + $scope.tserachDistance + "," + $scope.selectedSearchBackFlag.id
                + "," + $scope.tserachBackSpeed + "," + $scope.tserachBackDistance + "," + $scope.selectedSearchMode.id + ")");
        }
        
    }

    // 焊丝寻位添加寻位点显示页面
    $scope.addWireSearch = function(index){
        switch(index){
            case 0:
                $scope.show_Wire_Search = true;
                $scope.show_Wire_Search_Point = false;
                $scope.add_Wire_Search_Point_Count = 0;
                break;
            case 1:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 1;
                break;
            case 2:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 2;
                break;
            case 3:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 3;
                break;
            case 4:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 4;
                break;
            case 5:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 5;
                break;
            case 6:
                $scope.show_Wire_Search = false;
                $scope.show_Wire_Search_Point = true;
                $scope.add_Wire_Search_Point_Count = 6;
                break;
            default:
                break;
        }
        $(document).ready(function() {
            displayProgramPointInfo();
        })
    }

    /**
     * 点击焊接寻位点设置指南焊缝类型为内外径时的示意图进行内径或外径示意图切换
     */
    $scope.changeWireSearchType5Pic = function () {
        $scope.show_wireSearchType5Pic = !$scope.show_wireSearchType5Pic;
    }

    //添加LIN指令
    $scope.addWireSearchLin = function (index) {
        //Lin指令平滑选择
        if(document.getElementById("proWireSearchLinSmoothClose").checked == true){
            $scope.LinRadius = -1;
        }else if(document.getElementById("proWireSearchLinSmoothOpen").checked == true){
            $scope.LinRadius = $scope.LinCustomRadius;
        }
        if ((null == $scope.Lindebugspeed) || (null == $scope.LinRadius)) {
            toastFactory.info(ptDynamicTags.info_messages[28]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.operation.selectedLin.name === "seamPos") {
                if ($scope.selectedOffsetFlag.id == "0") {
                    $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + ")");
                    $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                } else {
                    if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                        toastFactory.info(ptDynamicTags.info_messages[28]);
                    } else {
                        $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWeldRecord.id + "," + $scope.selectedTPlateType.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                    }
                }
            } else {
                if($scope.selectedWireSearchRecord.id == "0"){
                    if ($scope.selectedOffsetFlag.id == "0") {
                        $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                    } else {
                        if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                            toastFactory.info(ptDynamicTags.info_messages[28]);
                        } else {
                            $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                        }
                    }
                }else{
                    if ($scope.selectedOffsetFlag.id == "0") {
                        $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")");
                        $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + ")" + ";");
                        $scope.ReturnCommandArr.commandshow.push("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")");
                        $scope.ReturnCommandArr.commandsadd += ("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")" + ";");
                    } else {
                        if (("" == $scope.LINdx) || ("" == $scope.LINdy) || ("" == $scope.LINdz) || ("" == $scope.LINdrx) || ("" == $scope.LINdry) || ("" == $scope.LINdrz)) {
                            toastFactory.info(ptDynamicTags.info_messages[28]);
                        } else {
                            $scope.ReturnCommandArr.commandshow.push("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")");
                            $scope.ReturnCommandArr.commandsadd += ("Lin(" + $scope.operation.selectedLin.name + "," + $scope.Lindebugspeed + "," + $scope.LinRadius + "," + $scope.selectedWireSearchRecord.id + "," + $scope.selectedOffsetFlag.id + "," + $scope.LINdx + "," + $scope.LINdy + "," + $scope.LINdz + "," + $scope.LINdrx + "," + $scope.LINdry + "," + $scope.LINdrz + ")" + ";");
                            $scope.ReturnCommandArr.commandshow.push("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")");
                            $scope.ReturnCommandArr.commandsadd += ("WireSearchWait(\""+$scope.selectedSearchLinRef_ResPoint.name+"\")" + ";");
                        }
                    }
                }
            }
        }
    };

    //添加焊丝寻位计算偏移量指令
    $scope.addGetWireSearchOffset = function() {
        $scope.handleCommandIndex();
        switch($scope.selectedWireSearchMethod.id) {
            case "0":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_1D_RefPoint1.name + "\",\"#\",\"#\",\"#\",\"#\",\"#\",\"" + $scope.selectedSearchType1_1D_ResPoint1.name + "\",\"#\",\"#\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_1D_RefPoint1.name + "\",\"#\",\"#\",\"#\",\"#\",\"#\",\"" + $scope.selectedSearchType1_1D_ResPoint1.name + "\",\"#\",\"#\",\"#\",\"#\",\"#\")"+";");
                break;
            case "1":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_2D_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_2D_RefPoint2.name + "\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_2D_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_2D_RefPoint2.name + "\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")"+";");
                break;
            case "2":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_3D_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_3D_RefPoint2.name + "\",\"" + $scope.selectedSearchType1_3D_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_3D_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_3D_ResPoint2.name + "\",\"" + $scope.selectedSearchType1_3D_ResPoint3.name + "\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_3D_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_3D_RefPoint2.name + "\",\"" + $scope.selectedSearchType1_3D_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_3D_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_3D_ResPoint2.name + "\",\"" + $scope.selectedSearchType1_3D_ResPoint3.name + "\",\"#\",\"#\")"+";");
                break;
            case "3":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_2DX_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_2DX_RefPoint2.name + "\",\"" + $scope.selectedSearchType1_2DX_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_2DX_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_2DX_ResPoint2.name + "\",\"" + $scope.selectedSearchType1_2DX_ResPoint3.name + "\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType1_2DX_RefPoint1.name + "\",\"" + $scope.selectedSearchType1_2DX_RefPoint2.name + "\",\"" + $scope.selectedSearchType1_2DX_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType1_2DX_ResPoint1.name + "\",\"" + $scope.selectedSearchType1_2DX_ResPoint2.name + "\",\"" + $scope.selectedSearchType1_2DX_ResPoint3.name + "\",\"#\",\"#\")"+";");
                break;
            case "4":
                $scope.show_WireSearchType1_Method5 = true;
                break;
            case "5":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType2_2D_RefPoint1.name + "\",\"" + $scope.selectedSearchType2_2D_RefPoint2.name + "\",\"" + $scope.selectedSearchType2_2D_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType2_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType2_2D_ResPoint2.name + "\",\"" + $scope.selectedSearchType2_2D_ResPoint3.name + "\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"" + $scope.selectedSearchType2_2D_RefPoint1.name + "\",\"" + $scope.selectedSearchType2_2D_RefPoint2.name + "\",\"" + $scope.selectedSearchType2_2D_RefPoint3.name + "\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType2_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType2_2D_ResPoint2.name + "\",\"" + $scope.selectedSearchType2_2D_ResPoint3.name + "\",\"#\",\"#\")"+";");
                break;
            case "6":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType3_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType3_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType3_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType3_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")"+";");
                break;
            case "7":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType4_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType4_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType4_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType4_2D_ResPoint2.name + "\",\"#\",\"#\",\"#\",\"#\")"+";");
                break;
            case "8":
                $scope.ReturnCommandArr.commandshow.push("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\""
                    + $scope.selectedSearchType5_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint2.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint3.name
                    + "\",\"" + $scope.selectedSearchType5_2D_ResPoint4.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint5.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint6.name + "\")");
                $scope.ReturnCommandArr.commandsadd += ("GetWireSearchOffset(" + $scope.selectedWireSearchType.id + "," + $scope.selectedWireSearchMethod.id
                    + ",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\","
                    + $scope.selectedSearchType5_2D_ResPoint1.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint2.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint3.name
                    + "\",\"" + $scope.selectedSearchType5_2D_ResPoint4.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint5.name + "\",\"" + $scope.selectedSearchType5_2D_ResPoint6.name + "\")"+";");
                break;
            default:
                break;
        }
    }

    $scope.addWireSearchResPointWrite = function() {
        if(undefined == $scope.searchResPointWriteData || "" == $scope.searchResPointWriteData){
            toastFactory.info(ptDynamicTags.info_messages[79]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SetPointToDatabase(" + "\"" + $scope.selectedSearchResPointWriteName.name + "\"" + "," + $scope.searchResPointWriteData + ")");
        $scope.ReturnCommandArr.commandsadd += ("SetPointToDatabase(" + "\"" + $scope.selectedSearchResPointWriteName.name + "\"" + "," + $scope.searchResPointWriteData + ")" + ";");
    }

    // 添加设置虚拟DI指令
    $scope.addSetVirDI = function() {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedSetVirDIPort.num > 15) {
                $scope.ReturnCommandArr.commandshow.push("SetVirtualToolDI(" + ($scope.selectedSetVirDIPort.num-15) + "," + $scope.selectedSetVirDIState.num + ")");
                $scope.ReturnCommandArr.commandsadd += ("SetVirtualToolDI(" + ($scope.selectedSetVirDIPort.num-15) + "," + $scope.selectedSetVirDIState.num + ")" + ";");
            } else {
                $scope.ReturnCommandArr.commandshow.push("SetVirtualDI(" + $scope.selectedSetVirDIPort.num + "," + $scope.selectedSetVirDIState.num + ")");
                $scope.ReturnCommandArr.commandsadd += ("SetVirtualDI(" + $scope.selectedSetVirDIPort.num + "," + $scope.selectedSetVirDIState.num + ")" + ";");
            }
        } else {
            if ($scope.selectedSetVirDIPort.num > 15) {
                $scope.ReturnString = ("SetVirtualToolDI(" + ($scope.selectedSetVirDIPort.num-15) + "," + $scope.selectedSetVirDIState.num + ")");
            }
            else {
                $scope.ReturnString = ("SetVirtualDI(" + $scope.selectedSetVirDIPort.num + "," + $scope.selectedSetVirDIState.num + ")");
            }
        }
    };

    // 添加设置虚拟AI指令
    $scope.addSetVirAI = function() {
        if (null == $scope.SetVirAIValue) {
            toastFactory.info(ptDynamicTags.info_messages[80]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                if ($scope.selectedSetVirAIPort.num > 1) {
                    $scope.ReturnCommandArr.commandshow.push("SetVirtualToolAI(" + ($scope.selectedSetVirAIPort.num-2) + "," + $scope.SetVirAIValue + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SetVirtualToolAI(" + ($scope.selectedSetVirAIPort.num-2) + "," + $scope.SetVirAIValue + ")" + ";");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("SetVirtualAI(" + $scope.selectedSetVirAIPort.num + "," + $scope.SetVirAIValue + ")");
                    $scope.ReturnCommandArr.commandsadd += ("SetVirtualAI(" + $scope.selectedSetVirAIPort.num + "," + $scope.SetVirAIValue + ")" + ";");
                }
            } else {
                if ($scope.selectedSetVirAIPort.num > 1) {
                    $scope.ReturnString = ("SetVirtualToolAI(" + ($scope.selectedSetVirAIPort.num-2) + "," + $scope.SetVirAIValue + ")");
                } else {
                    $scope.ReturnString = ("SetVirtualAI(" + $scope.selectedSetVirAIPort.num + "," + $scope.SetVirAIValue + ")");
                }
            }
        }
    };

    // 添加获取虚拟DI指令
    $scope.addGetVirDI = function() {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedGetVirDIPort.num > 15) {
                $scope.ReturnCommandArr.commandshow.push("GetVirtualToolDI(" + ($scope.selectedGetVirDIPort.num-15) + ")");
                $scope.ReturnCommandArr.commandsadd += ("GetVirtualToolDI(" + ($scope.selectedGetVirDIPort.num-15) + ");");
            } else {
                $scope.ReturnCommandArr.commandshow.push("GetVirtualDI(" + $scope.selectedGetVirDIPort.num + ")");
                $scope.ReturnCommandArr.commandsadd += ("GetVirtualDI(" + $scope.selectedGetVirDIPort.num + ");");
            }
        } else {
            if ($scope.selectedGetVirDIPort.num > 15) {
                $scope.ReturnString = ("GetVirtualToolDI(" + ($scope.selectedGetVirDIPort.num-15) + ")");
            } else {
                $scope.ReturnString = ("GetVirtualDI(" + $scope.selectedGetVirDIPort.num + ")");
            }
        }
    };

    //添加获取虚拟AI指令
    $scope.addGetVirAI = function() {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedGetVirAIPort.num > 1) {
                $scope.ReturnCommandArr.commandshow.push("GetVirtualToolAI("+($scope.selectedGetVirAIPort.num-2) +")");
                $scope.ReturnCommandArr.commandsadd += ("GetVirtualToolAI("+($scope.selectedGetVirAIPort.num-2) +");");
            } else{
                $scope.ReturnCommandArr.commandshow.push("GetVirtualAI("+$scope.selectedGetVirAIPort.num +")");
                $scope.ReturnCommandArr.commandsadd += ("GetVirtualAI("+$scope.selectedGetVirAIPort.num +");");
            }
        } else {
            if($scope.selectedGetVirAIPort.num > 1) {
                $scope.ReturnString = ("GetVirtualToolAI("+($scope.selectedGetVirAIPort.num-2) +")");
            } else{
                $scope.ReturnString = ("GetVirtualAI("+$scope.selectedGetVirAIPort.num +")");
            }
        }
    };

    //添加auxThread指令
    $scope.addThread = function () {
        $scope.threadtext = document.getElementById("selectedThread").value;
        if ((null == $scope.threadtext) || (0 == $scope.threadtext.trim().length)) {
            toastFactory.info(ptDynamicTags.info_messages[81]);
        } else {
            $scope.handleCommandIndex();
            let threadArray = createCommandsArray($scope.threadtext);
            $scope.ReturnCommandArr.commandshow = $scope.ReturnCommandArr.commandshow.concat(threadArray);
            $scope.ReturnCommandArr.commandsadd += ($scope.threadtext + ";");
        }
    };

    /* 伺服运动 */
    // 添加SevroC指令
    $scope.addServoC = function () {
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedServoCMode.id == 0) {
                $scope.ReturnCommandArr.commandshow.push("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCx + "," + $scope.ServoCy + "," + $scope.ServoCz
                    + "," + $scope.ServoCrx + "," + $scope.ServoCry + "," + $scope.ServoCrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +")");
                $scope.ReturnCommandArr.commandsadd += ("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCx + "," + $scope.ServoCy + "," + $scope.ServoCz
                    + "," + $scope.ServoCrx + "," + $scope.ServoCry + "," + $scope.ServoCrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +");");
            } else {
                $scope.ReturnCommandArr.commandshow.push("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCdx + "," + $scope.ServoCdy + "," + $scope.ServoCdz
                    + "," + $scope.ServoCdrx + "," + $scope.ServoCdry + "," + $scope.ServoCdrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +")");
                $scope.ReturnCommandArr.commandsadd += ("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCdx + "," + $scope.ServoCdy + "," + $scope.ServoCdz
                    + "," + $scope.ServoCdrx + "," + $scope.ServoCdry + "," + $scope.ServoCdrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +");");
            }
        } else {
            if  ($scope.selectedServoCMode.id == 0) {
                $scope.ReturnString = ("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCx + "," + $scope.ServoCy + "," + $scope.ServoCz
                    + "," + $scope.ServoCrx + "," + $scope.ServoCry + "," + $scope.ServoCrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +")");
            } else {
                $scope.ReturnString = ("ServoCart("+$scope.selectedServoCMode.id + "," + $scope.ServoCdx + "," + $scope.ServoCdy + "," + $scope.ServoCdz
                    + "," + $scope.ServoCdrx + "," + $scope.ServoCdry + "," + $scope.ServoCdrz + "," + $scope.ServoCScalex + "," + $scope.ServoCScaley + "," + $scope.ServoCScalez
                    + "," + $scope.ServoCScalerx + "," + $scope.ServoCScalery + "," + $scope.ServoCScalerz + "," + $scope.ServoCAcc + "," + $scope.ServoCSpeed + "," + $scope.ServoCCommandCycle
                    + "," + $scope.ServoCLookaheadTime + "," + $scope.ServoCGain +")");
            }
        }
    };
    /* ./伺服运动 */

    /**Modbus-tcp */
    //读线圈-Modbus主站读数字输出
    $scope.ModbusMasterGetCoils = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetCoilsID) {
            toastFactory.info(ptDynamicTags.info_messages[223]);
            return;
        }
        if (!$scope.modbusMasterGetCoilsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterReadDO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetCoilsID.alias+","+$scope.modbusMasterGetCoilsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterReadDO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetCoilsID.alias+","+$scope.modbusMasterGetCoilsRegisterNum+");");
    }

    //写线圈-Modbus主站写数字输出
    $scope.ModbusMasterSetCoils = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetCoilsID) {
            toastFactory.info(ptDynamicTags.info_messages[223]);
            return;
        }
        if (!$scope.modbusMasterGetCoilsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        if (!$scope.modbusMasterSetCoilsRegisterValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterWriteDO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetCoilsID.alias+","+$scope.modbusMasterGetCoilsRegisterNum+",{"+$scope.modbusMasterSetCoilsRegisterValue+"})");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterWriteDO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetCoilsID.alias+","+$scope.modbusMasterGetCoilsRegisterNum+",{"+$scope.modbusMasterSetCoilsRegisterValue+"});");
    }

    //读离散量-Modbus主站读数字输入
    $scope.ModbusMasterGetInBits = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetInbitsID) {
            toastFactory.info(ptDynamicTags.info_messages[224]);
            return;
        }
        if (!$scope.modbusMasterGetInbitsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterReadDI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetInbitsID.alias+","+$scope.modbusMasterGetInbitsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterReadDI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetInbitsID.alias+","+$scope.modbusMasterGetInbitsRegisterNum +");");
    }

    //读输入寄存器-Modbus主站读模拟输入
    $scope.ModbusMasterGetInRegs = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetInRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[226]);
            return;
        }
        if (!$scope.modbusMasterGetInRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterReadAI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetInRegsID.alias+","+$scope.modbusMasterGetInRegsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterReadAI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetInRegsID.alias+","+$scope.modbusMasterGetInRegsRegisterNum+");");
    }

    //读保持寄存器-Modbus主站读模拟输出
    $scope.ModbusMasterGetHoldRegs = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetHoldRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[225]);
            return;
        }
        if (!$scope.modbusMasterGetHoldRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterReadAO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetHoldRegsID.alias+","+$scope.modbusMasterGetHoldRegsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterReadAO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetHoldRegsID.alias+","+$scope.modbusMasterGetHoldRegsRegisterNum+");");
    }

    //写保持寄存器-Modbus主站写模拟输出
    $scope.ModbusMasterSetHoldRegs = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterGetHoldRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[225]);
            return;
        }
        if (!$scope.modbusMasterGetHoldRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        if (!$scope.modbusMasterSetHoldRegsRegisterValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterWriteAO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetHoldRegsID.alias+","+$scope.modbusMasterGetHoldRegsRegisterNum+",{"+$scope.modbusMasterSetHoldRegsRegisterValue+"})");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterWriteAO("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterGetHoldRegsID.alias+","+$scope.modbusMasterGetHoldRegsRegisterNum+",{"+$scope.modbusMasterSetHoldRegsRegisterValue+"});");
    }

    //Modbus主站等待数字输入
    $scope.ModbusMasterWaitDI = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitDIID) {
            toastFactory.info(ptDynamicTags.info_messages[224]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitDIStatus) {
            toastFactory.info(ptDynamicTags.info_messages[229]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitDITime) {
            toastFactory.info(ptDynamicTags.info_messages[230]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterWaitDI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterWaitDIID.alias+","+$scope.selectedModbusMasterWaitDIStatus.num+","+$scope.selectedModbusMasterWaitDITime+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterWaitDI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterWaitDIID.alias+","+$scope.selectedModbusMasterWaitDIStatus.num+","+$scope.selectedModbusMasterWaitDITime+");");
    }

    //Modbus主站等待模拟输入
    $scope.ModbusMasterWaitAI = function(){
        if (!$scope.selectedModbusMasterID) {
            toastFactory.info(ptDynamicTags.info_messages[222]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitAIID) {
            toastFactory.info(ptDynamicTags.info_messages[226]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitAIStatus) {
            toastFactory.info(ptDynamicTags.info_messages[229]);
            return;
        }
        if (!$scope.modbusMasterWaitAIValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        if (!$scope.selectedModbusMasterWaitAITime) {
            toastFactory.info(ptDynamicTags.info_messages[230]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusMasterWaitAI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterWaitAIID.alias+","+$scope.selectedModbusMasterWaitAIStatus.num+","+$scope.modbusMasterWaitAIValue+","+$scope.selectedModbusMasterWaitAITime+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusMasterWaitAI("+$scope.selectedModbusMasterID.alias+","+$scope.selectedModbusMasterWaitAIID.alias+","+$scope.selectedModbusMasterWaitAIStatus.num+","+$scope.modbusMasterWaitAIValue+","+$scope.selectedModbusMasterWaitAITime+");");
    }

    //读线圈-Modbus从站读数字输出
    $scope.ModbusSlaveGetCoils = function(){
        if (!$scope.modbusSlaveGetCoilsID) {
            toastFactory.info(ptDynamicTags.info_messages[223]);
            return;
        }
        if (!$scope.modbusSlaveGetCoilsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveReadDO("+$scope.modbusSlaveGetCoilsID+","+$scope.modbusSlaveGetCoilsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveReadDO("+$scope.modbusSlaveGetCoilsID+","+$scope.modbusSlaveGetCoilsRegisterNum +");");
    }

    //写线圈-Modbus从站写数字输出
    $scope.ModbusSlaveSetCoils = function(){
        if (!$scope.modbusSlaveGetCoilsID) {
            toastFactory.info(ptDynamicTags.info_messages[223]);
            return;
        }
        if (!$scope.modbusSlaveGetCoilsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        if (!$scope.modbusSlaveSetCoilsRegisterValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveWriteDO("+$scope.modbusSlaveGetCoilsID+","+$scope.modbusSlaveGetCoilsRegisterNum+",{"+$scope.modbusSlaveSetCoilsRegisterValue +"})");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveWriteDO("+$scope.modbusSlaveGetCoilsID+","+$scope.modbusSlaveGetCoilsRegisterNum+",{"+$scope.modbusSlaveSetCoilsRegisterValue +"});");
    }

    //读离散量-Modbus从站读数字输入
    $scope.ModbusSlaveGetInBits = function(){
        if (!$scope.modbusSlaveGetInbitsID) {
            toastFactory.info(ptDynamicTags.info_messages[224]);
            return;
        }
        if (!$scope.modbusSlaveGetInbitsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveReadDI("+$scope.modbusSlaveGetInbitsID+","+$scope.modbusSlaveGetInbitsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveReadDI("+$scope.modbusSlaveGetInbitsID+","+$scope.modbusSlaveGetInbitsRegisterNum +");");
    }

    //读输入寄存器-Modbus从站读模拟输入
    $scope.ModbusSlaveGetInRegs = function(){
        if (!$scope.modbusSlaveGetInRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[226]);
            return;
        }
        if (!$scope.modbusSlaveGetInRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveReadAI("+$scope.modbusSlaveGetInRegsID+","+$scope.modbusSlaveGetInRegsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveReadAI("+$scope.modbusSlaveGetInRegsID+","+$scope.modbusSlaveGetInRegsRegisterNum+");");
    }

    //读保持寄存器-Modbus从站读模拟输出
    $scope.ModbusSlaveGetHoldRegs = function(){
        if (!$scope.modbusSlaveGetHoldRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[225]);
            return;
        }
        if (!$scope.modbusSlaveGetHoldRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveReadAO("+$scope.modbusSlaveGetHoldRegsID+","+$scope.modbusSlaveGetHoldRegsRegisterNum+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveReadAO("+$scope.modbusSlaveGetHoldRegsID+","+$scope.modbusSlaveGetHoldRegsRegisterNum+");");
    }

    //写保持寄存器-Modbus从站写模拟输出
    $scope.ModbusSlaveSetHoldRegs = function(){
        if (!$scope.modbusSlaveGetHoldRegsID) {
            toastFactory.info(ptDynamicTags.info_messages[225]);
            return;
        }
        if (!$scope.modbusSlaveGetHoldRegsRegisterNum) {
            toastFactory.info(ptDynamicTags.info_messages[227]);
            return;
        }
        if (!$scope.modbusSlaveSetHoldRegsRegisterValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveWriteAO("+$scope.modbusSlaveGetHoldRegsID+","+$scope.modbusSlaveGetHoldRegsRegisterNum+",{"+$scope.modbusSlaveSetHoldRegsRegisterValue+"})");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveWriteAO("+$scope.modbusSlaveGetHoldRegsID+","+$scope.modbusSlaveGetHoldRegsRegisterNum+",{"+$scope.modbusSlaveSetHoldRegsRegisterValue+"});");
    }

    //Modbus从站等待数字输出
    $scope.ModbusSlaveWaitDI = function(){
        if (!$scope.selectedModbusSlaveWaitDIID) {
            toastFactory.info(ptDynamicTags.info_messages[224]);
            return;
        }
        if (!$scope.selectedModbusSlaveWaitDIStatus) {
            toastFactory.info(ptDynamicTags.info_messages[229]);
            return;
        }
        if (!$scope.selectedModbusSlaveWaitDITime) {
            toastFactory.info(ptDynamicTags.info_messages[230]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveWaitDI("+$scope.selectedModbusSlaveWaitDIID+","+$scope.selectedModbusSlaveWaitDIStatus.num+","+$scope.selectedModbusSlaveWaitDITime+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveWaitDI("+$scope.selectedModbusSlaveWaitDIID+","+$scope.selectedModbusSlaveWaitDIStatus.num+","+$scope.selectedModbusSlaveWaitDITime+");");
    }

    //Modbus从站等待模拟输入
    $scope.ModbusSlaveWaitAI = function(){
        if (!$scope.selectedModbusSlaveWaitAIID) {
            toastFactory.info(ptDynamicTags.info_messages[226]);
            return;
        }
        if (!$scope.selectedModbusSlaveWaitAIStatus) {
            toastFactory.info(ptDynamicTags.info_messages[229]);
            return;
        }
        if (!$scope.modbusSlaveWaitAIValue) {
            toastFactory.info(ptDynamicTags.info_messages[228]);
            return;
        }
        if (!$scope.selectedModbusSlaveWaitAITime) {
            toastFactory.info(ptDynamicTags.info_messages[230]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusSlaveWaitAI("+$scope.selectedModbusSlaveWaitAIID+","+$scope.selectedModbusSlaveWaitAIStatus.num+","+$scope.modbusSlaveWaitAIValue+","+$scope.selectedModbusSlaveWaitAITime+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusSlaveWaitAI("+$scope.selectedModbusSlaveWaitAIID+","+$scope.selectedModbusSlaveWaitAIStatus.num+","+$scope.modbusSlaveWaitAIValue+","+$scope.selectedModbusSlaveWaitAITime+");");
    }

    /**Modbus-rtu */
    //读寄存器指令 
    $scope.modbusRegRead = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusRegRead("+$scope.selecteModbusRegReadFunctionCode.id + "," + $scope.modbusRegReadRegisterAdress + "," + $scope.modbusRegReadRegisterNum + "," + $scope.modbusRegReadAdress + "," + $scope.selectedModbusRegReadThread.id+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusRegRead("+$scope.selecteModbusRegReadFunctionCode.id + "," + $scope.modbusRegReadRegisterAdress + "," + $scope.modbusRegReadRegisterNum + "," + $scope.modbusRegReadAdress + "," + $scope.selectedModbusRegReadThread.id +");");
    }

    //读寄存器数据
    $scope.modbusRegGetData = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusRegGetData("+$scope.modbusRegGetDataRegisterNum + "," + $scope.selectedModbusRegGetThread.id +")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusRegGetData("+$scope.modbusRegGetDataRegisterNum + "," + $scope.selectedModbusRegGetThread.id +");");
    }

    //写寄存器
    $scope.modbusRegWrite = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ModbusRegWrite("+$scope.selectedmodbusRegWriteFunctionCode.id+","+$scope.modbusRegWriteRegisterAdress+","+$scope.modbusRegWriteRegisterNum+","+$scope.modbusRegWriteArray+","+$scope.modbusRegWriteAdress + "," + $scope.selectedModbusRegWriteThread.id+")");
        $scope.ReturnCommandArr.commandsadd += ("ModbusRegWrite("+$scope.selectedmodbusRegWriteFunctionCode.id+","+$scope.modbusRegWriteRegisterAdress+","+$scope.modbusRegWriteRegisterNum+","+$scope.modbusRegWriteArray+","+$scope.modbusRegWriteAdress + "," + $scope.selectedModbusRegWriteThread.id +");");
    }

    //脚本函数添加
    $scope.addScript = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push($scope.selectedScriptFunction.name);
        $scope.ReturnCommandArr.commandsadd += ($scope.selectedScriptFunction.name+";");
    }

    /* 碰撞等级 */
    // 碰撞等级添加
    $scope.addCollision = function() {
        $scope.handleCommandIndex();
        if ($scope.selectedGradeMode == 1) {
            $scope.ReturnCommandArr.commandshow.push("SetAnticollision(" + $scope.selectedGradeMode + ",{" + $scope.customCollisionJ1 / 10 + "," + $scope.customCollisionJ2 / 10 + "," + $scope.customCollisionJ3 / 10 + ","
                + $scope.customCollisionJ4 / 10 + "," + $scope.customCollisionJ5 / 10 + "," + $scope.customCollisionJ6 / 10 + "},0)");
            $scope.ReturnCommandArr.commandsadd += ("SetAnticollision(" + $scope.selectedGradeMode + ",{" + $scope.customCollisionJ1 / 10 + "," + $scope.customCollisionJ2 / 10 + "," + $scope.customCollisionJ3 / 10 + ","
                + $scope.customCollisionJ4 / 10 + "," + $scope.customCollisionJ5 / 10 + "," + $scope.customCollisionJ6 / 10 + "},0)" + ";");
        } else {
            $scope.ReturnCommandArr.commandshow.push("SetAnticollision(" + $scope.selectedGradeMode + ",{" + $scope.selectedCollisionJ1.id + "," + $scope.selectedCollisionJ2.id + "," + $scope.selectedCollisionJ3.id + ","
                + $scope.selectedCollisionJ4.id + "," + $scope.selectedCollisionJ5.id + "," + $scope.selectedCollisionJ6.id + "},0)");
            $scope.ReturnCommandArr.commandsadd += ("SetAnticollision(" + $scope.selectedGradeMode + ",{" + $scope.selectedCollisionJ1.id + "," + $scope.selectedCollisionJ2.id + "," + $scope.selectedCollisionJ3.id + ","
                + $scope.selectedCollisionJ4.id + "," + $scope.selectedCollisionJ5.id + "," + $scope.selectedCollisionJ6.id + "},0)" + ";");
        }
    }
    /* ./碰撞等级 */

    //Xmlrpc接口添加
    $scope.addXmlrpc = function(){
        if (undefined == $scope.XmlrpcServerUrl || "" == $scope.XmlrpcServerUrl) {
            toastFactory.warning(ptDynamicTags.warning_messages[8]);
            return;
        }
        if (undefined == $scope.XmlrpcMethodName || "" == $scope.XmlrpcMethodName) {
            toastFactory.warning(ptDynamicTags.warning_messages[9]);
            return;
        }
        if (undefined == $scope.XmlrpcParam || "" == $scope.XmlrpcParam) {
            toastFactory.warning(ptDynamicTags.warning_messages[10]);
            return;
        }
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("XmlrpcClientCall(\""+$scope.XmlrpcServerUrl+"\",\""+$scope.XmlrpcMethodName+"\","+$scope.selectedXmlrpcTableType.id+","+$scope.XmlrpcParam+")");
        $scope.ReturnCommandArr.commandsadd += ("XmlrpcClientCall(\""+$scope.XmlrpcServerUrl+"\",\""+$scope.XmlrpcMethodName+"\","+$scope.selectedXmlrpcTableType.id+","+$scope.XmlrpcParam +");");
    }

    //添加DMP指令
    $scope.addDMP = function () {
        if (null == $scope.DMPdebugspeed) {
            toastFactory.info(ptDynamicTags.info_messages[82]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("DMP(" + $scope.operation.selectedDMP.name + "," + $scope.DMPdebugspeed + ")");
            $scope.ReturnCommandArr.commandsadd += ("DMP(" + $scope.operation.selectedDMP.name + "," + $scope.DMPdebugspeed + ");");
        }
    };

    //添加加速度指令
    $scope.addAccScale = function () {
        if (null == $scope.MotionDebugAcc) {
            toastFactory.info(ptDynamicTags.info_messages[83]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("SetOaccScale(" + $scope.MotionDebugAcc + ")");
            $scope.ReturnCommandArr.commandsadd += ("SetOaccScale(" + $scope.MotionDebugAcc + ");");
        }
    };

    //添加扭矩记录启动
    $scope.addTorqueRecordStart = function () {
        if (null == $scope.torqueNegativeValue1 
            || null == $scope.torquePositiveValue1 
            || null == $scope.collisionTime1
            || null == $scope.torqueNegativeValue2 
            || null == $scope.torquePositiveValue2
            || null == $scope.collisionTime2
            || null == $scope.torqueNegativeValue3 
            || null == $scope.torquePositiveValue3
            || null == $scope.collisionTime3
            || null == $scope.torqueNegativeValue4 
            || null == $scope.torquePositiveValue4
            || null == $scope.collisionTime4
            || null == $scope.torqueNegativeValue5 
            || null == $scope.torquePositiveValue5
            || null == $scope.collisionTime5
            || null == $scope.torqueNegativeValue6 
            || null == $scope.torquePositiveValue6
            || null == $scope.collisionTime6
        ) {
            toastFactory.info(ptDynamicTags.info_messages[84]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("negativeValues = {" + $scope.torqueNegativeValue1 + ","+ $scope.torqueNegativeValue2 + ","+ $scope.torqueNegativeValue3 + "," + $scope.torqueNegativeValue4 + ","+ $scope.torqueNegativeValue5 + ","+ $scope.torqueNegativeValue6 + "}");
            $scope.ReturnCommandArr.commandsadd += ("negativeValues = {" + $scope.torqueNegativeValue1 + ","+ $scope.torqueNegativeValue2 + ","+ $scope.torqueNegativeValue3 + "," + $scope.torqueNegativeValue4 + ","+ $scope.torqueNegativeValue5 + ","+ $scope.torqueNegativeValue6 + "};");
            $scope.ReturnCommandArr.commandshow.push("positiveValues = {" + $scope.torquePositiveValue1 + ","+ $scope.torquePositiveValue2 + ","+ $scope.torquePositiveValue3 + "," + $scope.torquePositiveValue4 + ","+ $scope.torquePositiveValue5 + ","+ $scope.torquePositiveValue6 + "}");
            $scope.ReturnCommandArr.commandsadd += ("positiveValues = {" + $scope.torquePositiveValue1 + ","+ $scope.torquePositiveValue2 + ","+ $scope.torquePositiveValue3 + "," + $scope.torquePositiveValue4 + ","+ $scope.torquePositiveValue5 + ","+ $scope.torquePositiveValue6 + "};");
            $scope.ReturnCommandArr.commandshow.push("collisionTime = {" + $scope.collisionTime1 + ","+ $scope.collisionTime2 + ","+ $scope.collisionTime3 + "," + $scope.collisionTime4 + ","+ $scope.collisionTime5 + ","+ $scope.collisionTime6 + "}");
            $scope.ReturnCommandArr.commandsadd += ("collisionTime = {" + $scope.collisionTime1 + ","+ $scope.collisionTime2 + ","+ $scope.collisionTime3 + "," + $scope.collisionTime4 + ","+ $scope.collisionTime5 + ","+ $scope.collisionTime6 + "};");
            $scope.ReturnCommandArr.commandshow.push("TorqueRecordStart(" + $scope.selectedTorqueSmoothType.id + ","+ "negativeValues" + ","+ "positiveValues" + "," + "collisionTime" + ")");
            $scope.ReturnCommandArr.commandsadd += ("TorqueRecordStart(" + $scope.selectedTorqueSmoothType.id + ","+ "negativeValues" + ","+ "positiveValues" + "," + "collisionTime" + ");");
        }
    };

    //添加扭矩记录复位
    $scope.addTorqueRecordReset = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("TorqueRecordReset()");
        $scope.ReturnCommandArr.commandsadd += ("TorqueRecordReset();");
    };

    //添加扭矩记录停止
    $scope.addTorqueRecordEnd = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("TorqueRecordEnd()");
        $scope.ReturnCommandArr.commandsadd += ("TorqueRecordEnd();");
    };



    //添加Modbus通信配置指令
    $scope.addSetExtAxisSetModbusComParam = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ExtDevSetUDPComParam(\"" + $scope.extAxisModbusIP + "\","+ $scope.extAxisModbusPort + ","+ $scope.extAxisModbusPeriod+ ")");
        $scope.ReturnCommandArr.commandsadd += ("ExtDevSetUDPComParam(\"" + $scope.extAxisModbusIP + "\","+ $scope.extAxisModbusPort + ","+ $scope.extAxisModbusPeriod + ")" + ";");
    };

    //添加Modbus通信加载指令
    $scope.addSetExtAxisLoadModbusTCPDriver = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ExtDevLoadUDPDriver()");
        $scope.ReturnCommandArr.commandsadd += ("ExtDevLoadUDPDriver()" + ";");
    };

    //添加SetIO指令
    $scope.addSetAuxIO = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SetAuxDO(" + $scope.selectedSetAuxioPort.num + "," + $scope.selectedSetAuxioState.num + "," + $scope.selectedSetAuxioMode.num + "," + $scope.selectedSetAuxioThread.id+ ")");
        $scope.ReturnCommandArr.commandsadd += ("SetAuxDO(" + $scope.selectedSetAuxioPort.num + "," + $scope.selectedSetAuxioState.num + "," + $scope.selectedSetAuxioMode.num + "," + $scope.selectedSetAuxioThread.id + ")" + ";");
    };

    //添加SetAO指令
    $scope.addSetAuxAO = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("SetAuxAO(" + $scope.SetAuxAOPort.num + "," + $scope.SetAuxAOValue + "," + $scope.selectedSetAuxAoThread.id + ")");
        $scope.ReturnCommandArr.commandsadd += ("SetAuxAO(" + $scope.SetAuxAOPort.num + "," + $scope.SetAuxAOValue + "," + $scope.selectedSetAuxAoThread.id + ")" + ";");
    };
    
    //添加WaitDI指令
    $scope.addWaitAuxDI = function(){
        if ($scope.selectedWaitAuxDIMotion.num == 2) {
            $scope.handleCommandIndex();
            let tempData = $scope.selectedWaitAuxDIState.num + ",0" + "," + $scope.selectedWaitAuxDIMotion.num;
            $scope.ReturnCommandArr.commandshow.push("WaitAuxDI(" + $scope.selectedWaitAuxDIPort.num + "," + tempData + ")");
            $scope.ReturnCommandArr.commandsadd += ("WaitAuxDI(" + $scope.selectedWaitAuxDIPort.num + "," + tempData + ")" + ";");
        } else {
            if (null == $scope.waitAuxDItime) {
                toastFactory.info(ptDynamicTags.info_messages[38]);
            } else {
                $scope.handleCommandIndex();
                let tempData = $scope.selectedWaitAuxDIState.num + "," + $scope.waitAuxDItime + "," + $scope.selectedWaitAuxDIMotion.num;
                $scope.ReturnCommandArr.commandshow.push("WaitAuxDI(" + $scope.selectedWaitAuxDIPort.num + "," + tempData + ")");
                $scope.ReturnCommandArr.commandsadd += ("WaitAuxDI(" + $scope.selectedWaitAuxDIPort.num + "," + tempData + ")" + ";");
            }
        }     
    };

    //添加WaitAI指令
    $scope.addWaitAuxAI = function() {
        if ($scope.selectedWaitAuxAIMotion.num == 2) {
            $scope.handleCommandIndex();
            let tempData = $scope.selectedWaitAuxAIState.num + "," + $scope.WaitAuxAIValue + ",0" + "," + $scope.selectedWaitAuxAIMotion.num;
            $scope.ReturnCommandArr.commandshow.push("WaitAuxAI(" + $scope.selectedWaitAuxAIPort.num + "," + tempData + ")");
            $scope.ReturnCommandArr.commandsadd += ("WaitAuxAI(" + $scope.selectedWaitAuxAIPort.num + "," + tempData + ")" + ";");
        } else {
            if ((null == $scope.WaitAuxAIValue) || (null == $scope.waitAuxAItime)) {
                toastFactory.info(ptDynamicTags.info_messages[40]);
            } else {
                $scope.handleCommandIndex();
                let tempData = $scope.selectedWaitAuxAIState.num + "," + $scope.WaitAuxAIValue + "," + $scope.waitAuxAItime + "," + $scope.selectedWaitAuxAIMotion.num;
                $scope.ReturnCommandArr.commandshow.push("WaitAuxAI(" + $scope.selectedWaitAuxAIPort.num + "," + tempData + ")");
                $scope.ReturnCommandArr.commandsadd += ("WaitAuxAI(" + $scope.selectedWaitAuxAIPort.num + "," + tempData + ")" + ";");
            }
        }
    };

    
    //添加GetIO指令
    $scope.addGetAuxIO = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("GetAuxDI(" + $scope.selectedGetAuxIOPort.num + "," + $scope.selectedGetAuxioThread.id + ")");
        $scope.ReturnCommandArr.commandsadd += ("GetAuxDI(" + $scope.selectedGetAuxIOPort.num + "," + $scope.selectedGetAuxioThread.id + ");");
    };

    //添加GetAI指令
    $scope.addGetAuxAI = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("GetAuxAI("+$scope.GetAuxAIport.num + "," + $scope.selectedGetAuxAoThread.id +")");
        $scope.ReturnCommandArr.commandsadd += ("GetAuxAI("+$scope.GetAuxAIport.num + "," + $scope.selectedGetAuxAoThread.id +");");
    };

    /**
     * 电弧跟踪参数未填写时，恢复默认值
     * @param {string} type 
     */
    $scope.resetWeldTraceCommon = function(type) {
        // 输入框输入拼音后再输入数字会置空ng-model的值，所有需要先作一下判断赋值
        let weldItemTypeValue = document.getElementById(type).value;
        if (($scope[type] == null || $scope[type] == undefined || $scope[type] == '') && weldItemTypeValue != null && weldItemTypeValue != undefined && weldItemTypeValue != '') {
            $scope[type] = document.getElementById(type).value;
        }
        if ($scope[type] == null || $scope[type] == undefined || $scope[type] == '') {
            switch (type) {
                case 'WeldTraceKud':
                    $scope[type] = -0.06;
                    break;
                case 'WeldTraceKlr':
                    $scope[type] = 0.06;
                    break;
                case 'WeldTraceTstartud':
                case 'WeldTraceStepmaxud':
                case 'WeldTraceTstartlr':
                case 'WeldTraceStepmaxlr':
                    $scope[type] = 5;
                    break;
                case 'WeldTraceSummaxud':
                case 'WeldTraceSummaxlr':
                    $scope[type] = 300;
                    break;
                case 'WeldTraceReferenceStartSampCurrent':
                    $scope[type] = 4;
                    break;
                case 'WeldTraceReferenceSampCurrent':
                    $scope[type] = 1;
                    break;
                case 'WeldTraceReferenceCurrent':
                    $scope[type] = 10;
                    break;
                default:
                    break;
            }
        }
    }

    //添加电弧跟踪结束指令
    $scope.addWeldTraceEnd = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ArcWeldTraceControl(0," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")");
        $scope.ReturnCommandArr.commandsadd += ("ArcWeldTraceControl(0," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ");");
    };

    //添加电弧跟踪开始指令
    $scope.addWeldTraceStart = function () {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("ArcWeldTraceControl(1," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ")");
        $scope.ReturnCommandArr.commandsadd += ("ArcWeldTraceControl(1," + $scope.WeldTraceLagTime + "," + $scope.selectedTraceIsleftright.id + "," + $scope.WeldTraceKlr + "," + $scope.WeldTraceTstartlr + "," + $scope.WeldTraceStepmaxlr + "," + $scope.WeldTraceSummaxlr
            + "," + $scope.selectedWeldTraceIsuplow.id + "," + $scope.WeldTraceKud + "," + $scope.WeldTraceTstartud + "," + $scope.WeldTraceStepmaxud + "," + $scope.WeldTraceSummaxud + "," + $scope.selectedWeldTraceAxisselect.id + "," + $scope.selectedWeldTraceReferenceType.id
            + "," + $scope.WeldTraceReferenceStartSampCurrent + "," + $scope.WeldTraceReferenceSampCurrent + "," + $scope.WeldTraceReferenceCurrent + ");");
    };

    /* Trajectory指令集合 */
    const qnxTrajPath = "/fruser/traj/";
    const linuxTrajPath = "/usr/local/etc/controller/lua/traj/";

    // 轨迹文件导入
    $scope.importTrajectoryFile = function () {
        var formData = new FormData();
        var file = document.getElementById("trajectoryFileImport").files[0];
        // 文件重命名，加入"traj_"前缀便于后端匹配分类
        if (!file) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
            return;
        }
        formData.append('file', file, "traj_"+file.name);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    toastFactory.success(ptDynamicTags.success_messages[1] + file.name);
                    getTrajectoryFileNameList();
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[7] + file.name);
            });
    }

    // 获取系统内轨迹文件名称列表
    function getTrajectoryFileNameList() {
        let getTrajFileNameListCmd = {
            cmd: "get_traj_files",
        }
        dataFactory.getData(getTrajFileNameListCmd)
            .then((data) => {
                $scope.trajFileNameList = data;
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    $scope.trajFileNameList = testTrajFileNameList;
                }
                /* ./test */
            });
    }
    getTrajectoryFileNameList();

    /**
     * 删除traj轨迹文件名称
     * @param {string} name 轨迹名称
     */
    $scope.deleteTrajectoryFileName = function(name) {
        if (!name) {
            toastFactory.info(ptDynamicTags.info_messages[3]);
            return;
        }
        let deleteTrajectoryFileNameCmd = {
            cmd: "delete_traj_file",
            data: {
                name: name
            }
        }
        dataFactory.actData(deleteTrajectoryFileNameCmd)
            .then(() => {
                getTrajectoryFileNameList();
                toastFactory.success(ptDynamicTags.success_messages[2]);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[8]);
            });
    }

    // 添加轨迹预加载指令
    $scope.addLoadTrajFile = function () {
        if (null == $scope.selectedTrajFile) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else {
            if (g_systemFlag) {
                $scope.ReturnCommandArr.commandshow.push("LoadTrajectory(\"" + linuxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("LoadTrajectory(\"" + linuxTrajPath + $scope.selectedTrajFile + "\");");
            } else {
                $scope.ReturnCommandArr.commandshow.push("LoadTrajectory(\"" + qnxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("LoadTrajectory(\"" + qnxTrajPath + $scope.selectedTrajFile + "\");");
            }
        }
    }

    // 添加轨迹运动指令
    $scope.addMoveTraj = function () {
        if (null == $scope.selectedTrajFile) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else {
            if (!$scope.selectedTrajMoveSpeed) {
                toastFactory.info(ptDynamicTags.info_messages[82]);
                return;
            }
            $scope.handleCommandIndex();
            if (g_systemFlag) {
                $scope.ReturnCommandArr.commandshow.push("startPose = GetTrajectoryStartPose(\"" + linuxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("startPose = GetTrajectoryStartPose(\"" + linuxTrajPath + $scope.selectedTrajFile + "\");");
                $scope.ReturnCommandArr.commandshow.push("tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("tool_num = GetActualTCPNum();");
                $scope.ReturnCommandArr.commandshow.push("wobj_num = GetActualWObjNum()");
                $scope.ReturnCommandArr.commandsadd += ("wobj_num = GetActualWObjNum();");
                $scope.ReturnCommandArr.commandshow.push("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajMoveSpeed + "," + -1.0 + "," + -1 + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajMoveSpeed + "," + -1.0 + "," + -1 + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveTrajectory(\"" + linuxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajMoveSpeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveTrajectory(\"" + linuxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajMoveSpeed + ");");
            } else {
                $scope.ReturnCommandArr.commandshow.push("startPose = GetTrajectoryStartPose(\"" + qnxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("startPose = GetTrajectoryStartPose(\"" + qnxTrajPath + $scope.selectedTrajFile + "\");");
                $scope.ReturnCommandArr.commandshow.push("tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("tool_num = GetActualTCPNum();");
                $scope.ReturnCommandArr.commandshow.push("wobj_num = GetActualWObjNum()");
                $scope.ReturnCommandArr.commandsadd += ("wobj_num = GetActualWObjNum();");
                $scope.ReturnCommandArr.commandshow.push("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajMoveSpeed + "," + -1.0 + "," + -1 + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajMoveSpeed + "," + -1.0 + "," + -1 + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveTrajectory(\"" + qnxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajMoveSpeed + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveTrajectory(\"" + qnxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajMoveSpeed + ");");
            }
        }
    }

    // 添加打印轨迹点编号
    $scope.addPrintTrajPointNum = function () {
        $scope.handleCommandIndex();
        // $scope.ReturnCommandArr.commandshow.push("while (1) do ");
        $scope.ReturnCommandArr.commandshow.push("num = GetTrajectoryPointNum()");
        $scope.ReturnCommandArr.commandshow.push("RegisterVar(\"number\",\"num\")");
        // $scope.ReturnCommandArr.commandshow.push("end");
        // $scope.ReturnCommandArr.commandsadd += ("while (1) do ");
        $scope.ReturnCommandArr.commandsadd += ("num = GetTrajectoryPointNum(); ");
        $scope.ReturnCommandArr.commandsadd += ("RegisterVar(\"number\",\"num\"); ");
        // $scope.ReturnCommandArr.commandsadd += ("end");
    }
    /* ./Trajectory指令集合 */
    
    /* TrajectoryJ指令集合 */
    // 轨迹文件导入
    $scope.importTrajectoryJFile = function () {
        var formData = new FormData();
        var file = document.getElementById("trajectoryJFileImport").files[0];
        if (!file) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
            return;
        }
        // 文件重命名，加入"traj_"前缀便于后端匹配分类
        formData.append('file', file, "traj_"+file.name);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    toastFactory.success(ptDynamicTags.success_messages[1] + file.name);
                    getTrajectoryFileNameList();
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[7] + file.name);
            });
    }

    // 添加TrajectoryJ预处理指令
    $scope.addPreprocessTrajFileJ = function () {
        if (null == $scope.selectedTrajFile) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else {
            if (!$scope.selectedTrajJSpeedScale) {
                toastFactory.info(ptDynamicTags.info_messages[82]);
                return;
            }
            $scope.handleCommandIndex();
            if (g_systemFlag) {
                $scope.ReturnCommandArr.commandshow.push("LoadTrajectoryJ(\"" + linuxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajJSpeedScale + "," + $scope.selectedTrajJMode.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("LoadTrajectoryJ(\"" + linuxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajJSpeedScale + "," + $scope.selectedTrajJMode.id + ");");
            } else {
                $scope.ReturnCommandArr.commandshow.push("LoadTrajectoryJ(\"" + qnxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajJSpeedScale + "," + $scope.selectedTrajJMode.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("LoadTrajectoryJ(\"" + qnxTrajPath + $scope.selectedTrajFile + "\"," + $scope.selectedTrajJSpeedScale + "," + $scope.selectedTrajJMode.id + ");");
            }
        }
    }

    // 添加TrajectoryJ运动指令
    $scope.addTrajMotionJ = function () {
        if (null == $scope.selectedTrajFile) {
            toastFactory.info(ptDynamicTags.info_messages[1]);
        } else {
            $scope.handleCommandIndex();
            if (g_systemFlag) {
                $scope.ReturnCommandArr.commandshow.push("startPose = GetTrajectoryStartPose(\"" + linuxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("startPose = GetTrajectoryStartPose(\"" + linuxTrajPath + $scope.selectedTrajFile + "\");");
                $scope.ReturnCommandArr.commandshow.push("tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("tool_num = GetActualTCPNum();");
                $scope.ReturnCommandArr.commandshow.push("wobj_num = GetActualWObjNum()");
                $scope.ReturnCommandArr.commandsadd += ("wobj_num = GetActualWObjNum();");
                $scope.ReturnCommandArr.commandshow.push("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajJSpeedScale + "," + -1.0 + "," + -1 + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajJSpeedScale + "," + -1.0 + "," + -1 + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveTrajectoryJ()");
                $scope.ReturnCommandArr.commandsadd += ("MoveTrajectoryJ();");
            } else {
                $scope.ReturnCommandArr.commandshow.push("startPose = GetTrajectoryStartPose(\"" + qnxTrajPath + $scope.selectedTrajFile + "\")");
                $scope.ReturnCommandArr.commandsadd += ("startPose = GetTrajectoryStartPose(\"" + qnxTrajPath + $scope.selectedTrajFile + "\");");
                $scope.ReturnCommandArr.commandshow.push("tool_num = GetActualTCPNum()");
                $scope.ReturnCommandArr.commandsadd += ("tool_num = GetActualTCPNum();");
                $scope.ReturnCommandArr.commandshow.push("wobj_num = GetActualWObjNum()");
                $scope.ReturnCommandArr.commandsadd += ("wobj_num = GetActualWObjNum();");
                $scope.ReturnCommandArr.commandshow.push("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajJSpeedScale + "," + -1.0 + "," + -1 + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveCart(" + "startPose" + "," + "tool_num" + "," + "wobj_num" + "," + 100.0 + "," + 100.0 + "," + $scope.selectedTrajJSpeedScale + "," + -1.0 + "," + -1 + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveTrajectoryJ()");
                $scope.ReturnCommandArr.commandsadd += ("MoveTrajectoryJ();");
            }
        }
    }
    /* ./TrajectoryJ指令集合 */

    /* WPTrsf */
    /**
     * 获取工件坐标系数据
     * @param {string} type 坐标系-工件坐标系："SetWObjList";工件转换："WorkPieceTrsfStart"
     * @param {*} value 编辑时程序命令行时，当前工件数据的相关值
     */
    function getWobjCoordData(type, value) {
        $scope.WobjToolCoord = [];
        let getCmd = {
            cmd: "get_wobj_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.WObjCoordeData = JSON.parse(JSON.stringify(data));
                const wobjCoordeKeys = Object.keys($scope.WObjCoordeData);
                wobjCoordeKeys.forEach(item => {
                    $scope.WobjToolCoord.push($scope.WObjCoordeData[item]);
                });
                if (type) {
                    switch (type) {
                        case 'SetWObjList':
                            for (let i = 0; i < $scope.WobjToolCoord.length; i++) {
                                if ($scope.WobjToolCoord[i].name == value) {
                                    $scope.selectedWobjCoord = $scope.WobjToolCoord[i];
                                }
                            }
                            break;
                        case 'WorkPieceTrsfStart':
                            $scope.selectedWPCoord = $scope.WobjToolCoord.find(item => item.id == value);
                            break;
                        default:
                            break;
                    }
                } else {
                    $scope.selectedWobjCoord = $scope.WobjToolCoord[0];
                }
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[45]);
                /* test */
                if (g_testCode) {
                    $scope.WObjCoordeData = testWObjCoordeData;
                    const wobjCoordeKeys = Object.keys($scope.WObjCoordeData);
                    wobjCoordeKeys.forEach(item => {
                        $scope.WobjToolCoord.push($scope.WObjCoordeData[item]);
                    });
                    if (type) {
                        switch (type) {
                            case 'SetWObjList':
                                for (let i = 0; i < $scope.WobjToolCoord.length; i++) {
                                    if ($scope.WobjToolCoord[i].name == value) {
                                        $scope.selectedWobjCoord = $scope.WobjToolCoord[i];
                                    }
                                }
                                break;
                            case 'WorkPieceTrsfStart':
                                $scope.selectedWPCoord = $scope.WobjToolCoord.find(item => item.id == value);
                                break;
                            default:
                                break;
                        }
                    } else {
                        $scope.selectedWobjCoord = $scope.WobjToolCoord[0];
                    }
                }
                /* ./test */
            });
    };

    // 添加工件坐标系下点位自动转换功能指令
    $scope.addWorkPieceTrsf = function () {
        if ($scope.selectedWPCoord == null || $scope.selectedWPCoord == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[90]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("WorkPieceTrsfStart(" + $scope.selectedWPCoord.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("WorkPieceTrsfStart(" + $scope.selectedWPCoord.id + ");");
                $scope.ReturnCommandArr.commandshow.push("WorkPieceTrsfEnd()");
                $scope.ReturnCommandArr.commandsadd += ("WorkPieceTrsfEnd();");
            } else {
                $scope.ReturnString = ("WorkPieceTrsfStart(" + $scope.selectedWPCoord.id + ")");
            }
        }
    }
    /* ./WPTrsf */

    /* MoveDO */
    /**添加东创智能飞拍DO指令-连续输出 */
    $scope.addMoveDO = function () {
        if (!$scope.separationDistance) {
            toastFactory.info(ptDynamicTags.info_messages[242]);
            return;
        }
        if (!$scope.outputPulseDutyCycle) {
            toastFactory.info(ptDynamicTags.info_messages[243]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedMoveDOPort.num > 15) {
                $scope.ReturnCommandArr.commandshow.push("MoveToolDOStart(" + ($scope.selectedMoveDOPort.num - 16) + ',' + $scope.separationDistance + ',' + $scope.outputPulseDutyCycle + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveToolDOStart(" + ($scope.selectedMoveDOPort.num - 16) + ',' + $scope.separationDistance + ',' + $scope.outputPulseDutyCycle  + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveToolDOStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveToolDOStop();");
            } else {
                $scope.ReturnCommandArr.commandshow.push("MoveDOStart(" + $scope.selectedMoveDOPort.num + ',' + $scope.separationDistance + ',' +  $scope.outputPulseDutyCycle + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveDOStart(" + $scope.selectedMoveDOPort.num + ',' + $scope.separationDistance + ',' + $scope.outputPulseDutyCycle + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveDOStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveDOStop();");
            }
        } else {
            if ($scope.selectedMoveDOPort.num > 15) {
                $scope.ReturnString = ("MoveToolDOStart(" + ($scope.selectedMoveDOPort.num - 16) + ',' + $scope.separationDistance + ',' + $scope.outputPulseDutyCycle + ")");
            } else {
                $scope.ReturnString = ("MoveDOStart(" + $scope.selectedMoveDOPort.num + ',' + $scope.separationDistance + ',' +  $scope.outputPulseDutyCycle + ")");
            }
        }
    }

    /**添加福路运动DO指令-单次输出 */
    $scope.addOnceMoveDO = function () {
        if (!$scope.setOnceTime && $scope.selectedMoveDOMode.id == 1) {
            toastFactory.info(ptDynamicTags.info_messages[244]);
            return;
        }
        if (!$scope.resetOnceTime && $scope.selectedMoveDOMode.id == 1) {
            toastFactory.info(ptDynamicTags.info_messages[245]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedOnceMoveDOPort.num > 15) {
                if ($scope.selectedMoveDOMode.id == 1) {
                    $scope.ReturnCommandArr.commandshow.push("MoveToolDOOnceStart(" + ($scope.selectedOnceMoveDOPort.num - 16) + ',' + $scope.setOnceTime + ',' + $scope.resetOnceTime + ")");
                    $scope.ReturnCommandArr.commandsadd += ("MoveToolDOOnceStart(" + ($scope.selectedOnceMoveDOPort.num - 16) + ',' + $scope.setOnceTime + ',' + $scope.resetOnceTime  + ");");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("MoveToolDOOnceStart(" + ($scope.selectedOnceMoveDOPort.num - 16) + ",-1,-1)");
                    $scope.ReturnCommandArr.commandsadd += ("MoveToolDOOnceStart(" + ($scope.selectedOnceMoveDOPort.num - 16) + ",-1,-1);");
                }
                $scope.ReturnCommandArr.commandshow.push("MoveToolDOOnceStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveToolDOOnceStop();");
            } else {
                if ($scope.selectedMoveDOMode.id == 1) {
                    $scope.ReturnCommandArr.commandshow.push("MoveDOOnceStart(" + $scope.selectedOnceMoveDOPort.num + ',' + $scope.setOnceTime + ',' +  $scope.resetOnceTime + ")");
                    $scope.ReturnCommandArr.commandsadd += ("MoveDOOnceStart(" + $scope.selectedOnceMoveDOPort.num + ',' + $scope.setOnceTime + ',' + $scope.resetOnceTime + ");");
                } else {
                    $scope.ReturnCommandArr.commandshow.push("MoveDOOnceStart(" + $scope.selectedOnceMoveDOPort.num + ",-1,-1)");
                    $scope.ReturnCommandArr.commandsadd += ("MoveDOOnceStart(" + $scope.selectedOnceMoveDOPort.num + ",-1,-1);");
                }
                $scope.ReturnCommandArr.commandshow.push("MoveDOOnceStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveDOOnceStop();");
            }
        } else {
            if ($scope.selectedOnceMoveDOPort.num > 15) {
                $scope.ReturnString = ("MoveToolDOOnceStart(" + ($scope.selectedOnceMoveDOPort.num - 16) + ',' + $scope.setOnceTime + ',' + $scope.resetOnceTime + ")");
            } else {
                $scope.ReturnString = ("MoveDOOnceStart(" + $scope.selectedOnceMoveDOPort.num + ',' + $scope.setOnceTime + ',' +  $scope.resetOnceTime + ")");
            }
        }
    }
    /* ./MoveDO */

    /* MoveAO */
    /**添加卓兆点胶应用,MoveAO控制*/
    $scope.addMoveAO = function () {
        if (!$scope.maxTcpSpeed) {
            toastFactory.info(ptDynamicTags.info_messages[249]);
            return;
        }
        if (!$scope.maxTcpSpeedPercent) {
            toastFactory.info(ptDynamicTags.info_messages[250]);
            return;
        }
        if (!$scope.zerozoneCmp) {
            toastFactory.info(ptDynamicTags.info_messages[251]);
            return;
        }
        $scope.handleCommandIndex();
        if ($scope.programAreaRightType == 'add') {
            if ($scope.selectedMoveAOPort.num > 1) {
                $scope.ReturnCommandArr.commandshow.push("MoveToolAOStart(" + ($scope.selectedMoveAOPort.num - 2) + ',' + $scope.maxTcpSpeed + ',' + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveToolAOStart(" + ($scope.selectedMoveAOPort.num - 2) + ',' + $scope.maxTcpSpeed + ',' + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp  + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveToolAOStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveToolAOStop();");
            } else {
                $scope.ReturnCommandArr.commandshow.push("MoveAOStart(" + $scope.selectedMoveAOPort.num + ',' + $scope.maxTcpSpeed + ',' +  $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")");
                $scope.ReturnCommandArr.commandsadd += ("MoveAOStart(" + $scope.selectedMoveAOPort.num + ',' + $scope.maxTcpSpeed + ',' + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ");");
                $scope.ReturnCommandArr.commandshow.push("MoveAOStop()");
                $scope.ReturnCommandArr.commandsadd += ("MoveAOStop();");
            }
        } else {
            if ($scope.selectedMoveAOPort.num > 1) {
                $scope.ReturnString = ("MoveToolAOStart(" + ($scope.selectedMoveAOPort.num - 2) + ',' + $scope.maxTcpSpeed + ',' + $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")");
            } else {
                $scope.ReturnString = ("MoveAOStart(" + $scope.selectedMoveAOPort.num + ',' + $scope.maxTcpSpeed + ',' +  $scope.maxTcpSpeedPercent + "," + $scope.zerozoneCmp + ")");
            }
        }
    }
    /* ./MoveAO */

    // 获取工具坐标系数据
    function getToolTrsfCoordData(value) {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.toolTrsfCoordeData = JSON.parse(JSON.stringify(data));
                $scope.toolTrsfCoordeTotal = JSON.parse(JSON.stringify(data)).length;
                getExToolTrsfCoordData(value);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[4]);
                /* test */
                if (g_testCode) {
                    $scope.toolTrsfCoordeData = testToolCoordeData;
                    $scope.toolTrsfCoordeTotal = JSON.parse(JSON.stringify(testToolCoordeData)).length;
                    getExToolTrsfCoordData(value);
                }
                /* ./test */
            });
    };

    //获取外部工具坐标系数据
    function getExToolTrsfCoordData(value) {
        const exToolCoordeArr = [];
        let getCmd = {
            cmd: "get_ex_tool_cdsystem",
        };
        dataFactory.getData(getCmd).then((data) => {
            const exToolCoordeData = JSON.parse(JSON.stringify(data));
            const exToolCoordeKeys = Object.keys(exToolCoordeData);
            exToolCoordeKeys.forEach(item => {
                item.id = item.id + $scope.toolTrsfCoordeTotal;
                exToolCoordeArr.push(exToolCoordeData[item]);
            });
            $scope.toolTrsfCoordeData = $scope.toolTrsfCoordeData.concat(exToolCoordeArr);
            if (value) {
                $scope.selectedToolTrsfCoord = $scope.toolTrsfCoordeData.find(item => item.id == value);
            } else {
                $scope.selectedToolTrsfCoord = $scope.toolTrsfCoordeData.find(item => item.id == 0);
            }
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[44]);
            /* test */
            if (g_testCode) {
                const exToolCoordeData = testExToolCoordeData;
                const exToolCoordeKeys = Object.keys(exToolCoordeData);
                exToolCoordeKeys.forEach(item => {
                    item.id = item.id + $scope.toolTrsfCoordeTotal;
                    exToolCoordeArr.push(exToolCoordeData[item]);
                });
                $scope.toolTrsfCoordeData = $scope.toolTrsfCoordeData.concat(exToolCoordeArr);
                if (value) {
                    $scope.selectedToolTrsfCoord = $scope.toolTrsfCoordeData.find(item => item.id == value);
                } else {
                    $scope.selectedToolTrsfCoord = $scope.toolTrsfCoordeData.find(item => item.id == 0);
                }
            }
            /* ./test */
        });
    };

    /* ToolTrsf */
    // 工具坐标系切换后，点位的自动更新
    $scope.addToolTrsf = function () {
        if ($scope.selectedToolTrsfCoord == null || $scope.selectedToolTrsfCoord == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[109]);
        } else {
            $scope.handleCommandIndex();
            if ($scope.programAreaRightType == 'add') {
                $scope.ReturnCommandArr.commandshow.push("SetToolList(" + $scope.selectedToolTrsfCoord.name + ")");
                $scope.ReturnCommandArr.commandshow.push("ToolTrsfStart(" + $scope.selectedToolTrsfCoord.id + ")");
                $scope.ReturnCommandArr.commandsadd += ("SetToolList(" + $scope.selectedToolTrsfCoord.name + ");");
                $scope.ReturnCommandArr.commandsadd += ("ToolTrsfStart(" + $scope.selectedToolTrsfCoord.id + ");");
                $scope.ReturnCommandArr.commandshow.push("ToolTrsfEnd()");
                $scope.ReturnCommandArr.commandsadd += ("ToolTrsfEnd();");
            } else {
                $scope.ReturnString = ("ToolTrsfStart(" + $scope.selectedToolTrsfCoord.id + ")");
            }
            
        }
    }
    /* ./ToolTrsf */

    /* PTMode */
    //切换点位表模式
    $scope.addPTMode = function() {
        if ($scope.selectedPTMode == null || $scope.selectedPTMode == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[216]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("PointTableSwitch('" + $scope.selectedPTMode + "')");
            $scope.ReturnCommandArr.commandsadd += ("PointTableSwitch('" + $scope.selectedPTMode + "');");
        }
    }

    //系统模式切换
    $scope.addSystemMode = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("PointTableSwitch('')");
        $scope.ReturnCommandArr.commandsadd += ("PointTableSwitch('');");
    }

    /* 焦点跟随指令 F_Follow */

    /**
     * 选择焦点
     * @param {int} index 选择的焦点数量
     */
    $scope.focusNumberChange = function(index) {
        $scope.focusNumberNewData = $scope.focusNumberData.slice(0,index);//切换焦点数量时所选焦点点位个数
        $scope.nextFocusCalibPointSet(1);//切换焦点数量时，从第一个点位重新设置
        $scope.show_focusCalibPointCompute = false;
    }

    /**
     * 设置焦点标定点
     * @param {int} index 焦点标定点编号
     * @param {string} pointData 焦点标定点信息
     */
    let nextFocusCalibPointIndex;
    $scope.setFocusCalibPoint = function(index, pointData, data) {
        if(!pointData) {
            toastFactory.warning(ptDynamicTags.warning_messages[11]);
            return;
        }
        nextFocusCalibPointIndex = Number(index) + 1;

        if (data == nextFocusCalibPointIndex) {
            $scope.show_focusCalibPointCompute = true;
        } else {
            $scope.show_focusCalibPointCompute = false;
        }

        let setCmd = {
            cmd: 938,
            data: {
                content: "SetFocusCalibPoint(" + index + "," + pointData.x + "," + pointData.y + "," + pointData.z + "," + pointData.rx + "," + pointData.ry + "," + pointData.rz + ")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
                $scope.nextFocusCalibPointSet(nextFocusCalibPointIndex);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //焦点设置界面切换
    $scope.nextFocusCalibPointSet = function(id){
        $scope.show_focusCalibPoint1 = false;
        $scope.show_focusCalibPoint2 = false;
        $scope.show_focusCalibPoint3 = false;
        $scope.show_focusCalibPoint4 = false;
        $scope.show_focusCalibPoint5 = false;
        $scope.show_focusCalibPoint6 = false;
        $scope.show_focusCalibPoint7 = false;
        $scope.show_focusCalibPoint8 = false;
        switch(id){
            case 0:
                break;
            case 1:
                $scope.show_focusCalibPoint1 = true;
                break;
            case 2:
                $scope.show_focusCalibPoint2 = true;
                break;
            case 3:
                $scope.show_focusCalibPoint3 = true;
                break;
            case 4:
                $scope.show_focusCalibPoint4 = true;
                break;
            case 5:
                $scope.show_focusCalibPoint5 = true;
                break;
            case 6:
                $scope.show_focusCalibPoint6 = true;
                break;
            case 7:
                $scope.show_focusCalibPoint7 = true;
                break;
            case 8:
                $scope.show_focusCalibPoint8 = true;
                break;
            default:
                break;
        }
    }

    /**
     * 计算焦点标定结果
     * @param {int} number 设置焦点标定点的个数
     */
    $scope.computeFocusCalib = function(number) {
        let setCmd = {
            cmd: 939,
            data: {
                content: "ComputeFocusCalib(" + number + ")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('programTeach').addEventListener('939', e => {
        let  focusCalibPointData = e.detail.split(',');
        $scope.focusCoordinateX = parseFloat(focusCalibPointData[0]).toFixed(3);
        $scope.focusCoordinateY = parseFloat(focusCalibPointData[1]).toFixed(3);
        $scope.focusCoordinateZ = parseFloat(focusCalibPointData[2]).toFixed(3);
        $scope.annotationAccuracy = parseFloat(focusCalibPointData[3]).toFixed(3);
    })

    /**
     * 应用焦点标定参数
     * @param {float} x 焦点标定参数X
     * @param {float} y 焦点标定参数Y
     * @param {float} z 焦点标定参数Z
    */
    $scope.setFocusPoint = function(x,y,z) {
        if (!x) {
            toastFactory.info(ptDynamicTags.info_messages[139]);
            return;
        }
        if (!y) {
            toastFactory.info(ptDynamicTags.info_messages[140]);
            return;
        }
        if (!z) {
            toastFactory.info(ptDynamicTags.info_messages[141]);
            return;
        }
        let setCmd = {
            cmd: 942,
            data: {
                content: "SetFocusPosition(" + x + "," + y + "," + z + ")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //获取焦点标定点位置信息
    function getRobotFocusPointdata() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                // 焦点标定点位置信息
                $scope.focusCoordinateX = parseFloat(data.focus_coord_x).toFixed(3);
                $scope.focusCoordinateY = parseFloat(data.focus_coord_y).toFixed(3);
                $scope.focusCoordinateZ = parseFloat(data.focus_coord_z).toFixed(3);
            }, (status) => {
                toastFactory.error(status, ptDynamicTags.error_messages[3]);
            });
    }

    //焦点跟随开始
    $scope.addFocusStart = function() {
        if ($scope.scaleParameter == undefined || $scope.feedforwardParameter == undefined || $scope.maxAngularVelAccLimit == undefined || $scope.maxAngularVelLimit == undefined) {
            toastFactory.info(ptDynamicTags.info_messages[247]);
        } else {
            $scope.handleCommandIndex();
            $scope.ReturnCommandArr.commandshow.push("FocusStart(" + $scope.scaleParameter + "," + $scope.feedforwardParameter + "," + $scope.maxAngularVelAccLimit + "," + $scope.maxAngularVelLimit + "," + $scope.selectedLockXPoint.id + ")");
            $scope.ReturnCommandArr.commandsadd += ("FocusStart(" + $scope.scaleParameter + "," + $scope.feedforwardParameter + "," + $scope.maxAngularVelAccLimit + "," + $scope.maxAngularVelLimit + "," + $scope.selectedLockXPoint.id + ");");
        }
    }

    //焦点跟随结束
    $scope.addFocusEnd = function() {
        $scope.handleCommandIndex();
        $scope.ReturnCommandArr.commandshow.push("FocusEnd()");
        $scope.ReturnCommandArr.commandsadd += ("FocusEnd();");
    }

    /* 焦点跟随指令 */

    /**设定按钮样式**/
    $scope.setMethodStyle = function (index) {
        var $obj = $("div.btn-group button");
        $obj.each(function (i, val) {
            if (val.className.indexOf("active") != -1) {
                val.className = val.className.replace("active", "");
            }
        });
        $obj[index].className += " active";
    };

    // 指令间翻页功能函数
    $scope.turnPage = function (string) {
        $scope.show_PTP = false;
        $scope.show_Lin = false;
        $scope.show_ARC = false;
        $scope.show_SetIO = false;
        $scope.show_SetDO = false;
        $scope.show_SetDI = false;
        $scope.show_While = false;
        $scope.show_if_else = false;
        $scope.show_waittime = false;
        $scope.show_waitDI = false;
        $scope.show_waitMultiDI = false;
        $scope.show_waitAI = false;
        $scope.show_SetAO = false;
        $scope.show_AO = false;
        $scope.show_AI = false;
        $scope.show_dofile = false;
        $scope.show_TPD = false;
        $scope.show_Gripper = false;
        $scope.show_Gripper_move = false;
        $scope.show_ToolList = false;
        $scope.show_tool = false;
        $scope.show_wobj = false;
        $scope.show_Spray = false;
        $scope.show_Weave = false;
        $scope.show_Weld = false;
        $scope.show_Laser = false;
        $scope.show_Weave_Test = false;
        $scope.show_Weave_Set = false;
        $scope.show_EAxis = false;
        $scope.show_Adjust = false;
        $scope.show_Spline = false;
        $scope.show_Spline_Main = false;
        $scope.show_Spline_SPL = false;
        $scope.show_Spline_SLIN = false;
        $scope.show_Spline_SCIRC = false;
        $scope.show_New_Spline = false;
        $scope.show_New_Spline_Main = false;
        $scope.show_New_Spline_SPL = false;
        $scope.show_conveyor = false;
        $scope.show_Mode = false;
        $scope.show_Segment = false;
        $scope.show_goto = false;
        $scope.show_Pause = false;
        $scope.show_Var = false;
        $scope.show_FT = false;
        $scope.show_FT_Main = false;
        $scope.show_FT_Guard = false;
        $scope.show_FT_Control = false;
        $scope.show_FT_Spiral = false;
        $scope.show_FT_Rot = false;
        $scope.show_FT_Lin = false;
        $scope.show_FT_Find_Surface = false;
        $scope.show_FT_Cal_Center = false;
        $scope.show_FT_Compliance = false;
        $scope.show_Circle = false;
        $scope.show_Spiral = false;
        $scope.show_3D = false;
        $scope.show_pallet = false;
        $scope.show_Vir = false;
        $scope.show_Set_Vir_DI = false;
        $scope.show_Set_Vir_AI = false;
        $scope.show_Get_Vir_DI = false;
        $scope.show_Get_Vir_AI = false;
        $scope.show_ServoC = false;
        $scope.show_Modbus = false;
        $scope.show_Modbus_Tcp = false;
        $scope.show_Modbus_Master = false;
        $scope.show_Modbus_Slave = false;
        $scope.show_Modbus_Rtu = false;
        $scope.show_AuxIO = false;
        $scope.show_Aux_IO_Main = false;
        $scope.show_Aux_Set_DO = false;
        $scope.show_Aux_Set_AO = false;
        $scope.show_Aux_Wait_DI = false;
        $scope.show_Aux_Wait_AI = false;
        $scope.show_Aux_Get_DI = false;
        $scope.show_Aux_Get_AI = false;
        $scope.show_Laser_Recurrent = false;
        switch (string) {
            case "to_WaitDI":
                $scope.show_waitDI = true;
                $scope.show_waitMultiDI = true;
                break;
            case "to_WaitAI":
                $scope.show_waitAI = true;
                break;
            case "return_WaitDI":
                $scope.show_waitDI = true;
                $scope.show_waitMultiDI = true;
                break;
            case "return_Waittime":
                $scope.show_waittime = true;
                break;
            case "Weave_Set":
                getWeavecfg($scope.selectedWeaveId.id);
                $scope.show_Weave = true;
                $scope.show_Weave_Set = true;
                break;
            case "Weave_Test":
                $scope.show_Weave = true;
                $scope.show_Weave_Test = true;
                break;
            case "to_SPL":
                $scope.show_Spline = true;
                $scope.show_Spline_SPL = true;
                break;
            case "to_SLIN":
                $scope.show_Spline = true;
                $scope.show_Spline_SLIN = true;
                break;
            case "to_SCIRC":
                $scope.show_Spline = true;
                $scope.show_Spline_SCIRC = true;
                break;
            case "to_SMAIN":
                $scope.show_Spline = true;
                $scope.show_Spline_Main = true;
                break;
            case "to_New_SPL":
                $scope.show_New_Spline = true;
                $scope.show_New_Spline_SPL = true;
                break;
            case "to_New_SMAIN":
                $scope.show_New_Spline = true;
                $scope.show_New_Spline_Main = true;
                break;
            case "to_FT_Main":
                $scope.show_FT = true;
                $scope.show_FT_Main = true;
                break;
            case "to_FT_Guard":
                $scope.show_FT_Guard = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Control":
                $scope.show_FT_Control = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Spiral":
                $scope.show_FT_Spiral = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Rot":
                $scope.show_FT_Rot = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Lin":
                $scope.show_FT_Lin = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Find_Surface":
                $scope.show_FT_Find_Surface = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Cal_Center":
                $scope.show_FT_Cal_Center = true;
                $scope.show_FT = true;
                break;
            case "to_FT_Compliance":
                $scope.show_FT_Compliance = true;
                $scope.show_FT = true;
                break;
            case "to_Modbus_Master":
                $scope.show_Modbus = true;
                $scope.show_Modbus_Tcp = true;
                $scope.show_Modbus_Master = true;
                break;
            case "to_Modbus_Slave":
                $scope.show_Modbus = true;
                $scope.show_Modbus_Tcp = true;
                $scope.show_Modbus_Slave = true;
                break;
            case "to_Modbus_Tcp":
                $scope.show_Modbus = true;
                $scope.show_Modbus_Tcp = true;
                $scope.show_Modbus_Master = true;
                break;
            case "to_Modbus_Rtu":
                $scope.show_Modbus = true;
                $scope.show_Modbus_Rtu = true;
                break;
            case "to_Aux_IO_Main":
                $scope.show_Aux_IO_Main = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Set_DO":
                $scope.show_Aux_Set_DO = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Set_AO":
                $scope.show_Aux_Set_AO = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Wait_DI":
                $scope.show_Aux_Wait_DI = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Wait_AI":
                $scope.show_Aux_Wait_AI = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Get_DI":
                $scope.show_Aux_Get_DI = true;
                $scope.show_AuxIO = true;
                break;
            case "to_Aux_Get_AI":
                $scope.show_Aux_Get_AI = true;
                $scope.show_AuxIO = true;
                break;
            default:
                break;
        }
        $(document).ready(function() {
            displayProgramPointInfo();
        })
    }

    /*获取IO别名配置数据 */
    function getIOAliasData() {
        const getAliasCmd = {
            cmd: 'get_IO_alias_cfg'
        };
        dataFactory.getData(getAliasCmd).then(data => {
            $scope.ctrlDIAliasData = data.CtrlBox.DI;
            $scope.ctrlDOAliasData = data.CtrlBox.DO;
            $scope.ctrlAIAliasData = data.CtrlBox.AI;
            $scope.ctrlAOAliasData = data.CtrlBox.AO;
            $scope.endDIAliasData = data.EndEff.DI;
            $scope.endDOAliasData = data.EndEff.DO;
            $scope.endAIAliasData = data.EndEff.AI;
            $scope.endAOAliasData = data.EndEff.AO;
            $scope.DinData.forEach((item, index) => {
                switch (index) {
                    case 16:
                        item['aliasName'] = $scope.endDIAliasData[0] ? `(${$scope.endDIAliasData[0]})` : '';
                        break;
                    case 17:
                        item['aliasName'] = $scope.endDIAliasData[1] ? `(${$scope.endDIAliasData[1]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlDIAliasData[index] ? `(${$scope.ctrlDIAliasData[index]})` : '';
                        break;
                }
            });
            $scope.DoData.forEach((item, index) => {
                switch (index) {
                    case 16:
                        item['aliasName'] = $scope.endDOAliasData[0] ? `(${$scope.endDOAliasData[0]})` : '';
                        break;
                    case 17:
                        item['aliasName'] = $scope.endDOAliasData[1] ? `(${$scope.endDOAliasData[1]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlDOAliasData[index] ? `(${$scope.ctrlDOAliasData[index]})` : '';
                        break;
                }
            });
            $scope.AIport.forEach((item, index) => {
                switch (index) {
                    case 2:
                        item['aliasName'] = $scope.endAIAliasData[0] ? `(${$scope.endAIAliasData[0]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlAIAliasData[index] ? `(${$scope.ctrlAIAliasData[index]})` : '';
                        break;
                }
            });
            $scope.AOport.forEach((item, index) => {
                switch (index) {
                    case 2:
                        item['aliasName'] = $scope.endAOAliasData[0] ? `(${$scope.endAOAliasData[0]})` : '';
                        break;
                    default:
                        item['aliasName'] = $scope.ctrlAOAliasData[index] ? `(${$scope.ctrlAOAliasData[index]})` : '';
                        break;
                }
            });
        }, (status) => {
            toastFactory.error(status, ptDynamicTags.error_messages[38]);
        });
    };

    /* 表达式输入模块 */
    /**
     * 点击触发展示表达式输入器
     * @param {object} event 点击事件
     */
    $scope.toggleExpressionInputter = function (event) {
        $scope.toggleEI = true;
        $scope.eventEI = event;
    }

    /**
     * 获取表达式输入器的值
     * @param {string} val 表达式
     */
    $scope.getExpression = function (val) {
        let keys = Object.keys($scope.eventEI.currentTarget.attributes);
        for (let i = 0; i < keys.length; i++) {
            if ($scope.eventEI.currentTarget.attributes[i].name == 'ng-model') {
                $scope[$scope.eventEI.currentTarget.attributes[i].value] = val;
                break;
            }
        }
    }
    /* ./表达式输入模块 */
}