"use strict";

angular
    .module('frApp')
    .controller('perCtrl', ['$scope', '$modal', 'dataFactory', 'toastFactory', '$http', perCtrlFn])

function perCtrlFn($scope, $modal, dataFactory, toastFactory, $http) {
    // 页面显示范围设置
    $scope.quitSetMounting();
    $scope.halfBothView();
    $scope.setProgramUrdf(false);
    $('.setting-menu').tree();

    /* 依据系统语言获取对应的语言包及当前页面初始化 */
    let pesDynamicTags;
    pesDynamicTags = langJsonData.peripheral_setting;
    // 获取导航栏对象页面显示
    $scope.peripheralNavList = pesDynamicTags.navbar; 
    // 获取变量对象
    $scope.IOTypeDict = langJsonData.commandlist.IOTypeDict;
    $scope.ROGripperTypeData = pesDynamicTags.var_object.ROGripperTypeData;
    $scope.MountPositionData = pesDynamicTags.var_object.MountPositionData;
    $scope.LaserLocationData = pesDynamicTags.var_object.LaserLocationData;
    $scope.protocolData = pesDynamicTags.var_object.protocolData;
    $scope.polishProtocolData = pesDynamicTags.var_object.polishProtocolData;
    $scope.pointSearchModeData = pesDynamicTags.var_object.pointSearchModeData;
    $scope.ExternaAxisDirData = pesDynamicTags.var_object.ExternaAxisDirData;
    $scope.ExternaAxisTypData = pesDynamicTags.var_object.ExternaAxisTypData;
    $scope.ZeroModeData = pesDynamicTags.var_object.ZeroModeData;
    $scope.plateType = pesDynamicTags.var_object.plateType;
    $scope.motionDirection = pesDynamicTags.var_object.motionDirection;
    $scope.ExternaAxisCompany = pesDynamicTags.var_object.ExternaAxisCompany;
    $scope.ExternaAxisHCFAType = pesDynamicTags.var_object.ExternaAxisHCFAType;
    $scope.ExternaAxisINOVANCEType = pesDynamicTags.var_object.ExternaAxisINOVANCEType;
    $scope.ExternaAxisPANASONICType = pesDynamicTags.var_object.ExternaAxisPANASONICType;
    $scope.ExternaAxisModel = pesDynamicTags.var_object.ExternaAxisModel;
    $scope.LaserDataUsage = pesDynamicTags.var_object.LaserDataUsage;
    $scope.encoderChannelData = pesDynamicTags.var_object.encoderChannelData;
    $scope.wobjAxisData = pesDynamicTags.var_object.wobjAxisData;
    $scope.ConveyorFunctionData = pesDynamicTags.var_object.ConveyorFunctionData;
    $scope.interfereReferenceCoordData = pesDynamicTags.var_object.interfereReferenceCoordData;
    $scope.visionData = pesDynamicTags.var_object.visionData;
    $scope.MotionWayData = pesDynamicTags.var_object.MotionWayData;
    $scope.EndDeviceTypeData = pesDynamicTags.var_object.EndDeviceTypeData;
    $scope.EndProtocolTypeData = pesDynamicTags.var_object.EndProtocolTypeData;
    $scope.openluaGripper = pesDynamicTags.var_object.openluaGripper;
    $scope.openluaFTSensor = pesDynamicTags.var_object.openluaFTSensor;
    $scope.ptpSmoothTimeData = pesDynamicTags.var_object.ptpSmoothTimeData;
    $scope.linSmoothlengthData = pesDynamicTags.var_object.linSmoothlengthData;
    $scope.deliveryMethodList = pesDynamicTags.var_object.deliveryMethodList;
    $scope.screwdriverTypeList = pesDynamicTags.var_object.screwdriverTypeList;
    $scope.torqueTeachingPointTypes = pesDynamicTags.var_object.torqueTeachingPointTypes;
    $scope.LaserSensorCoordData = pesDynamicTags.var_object.LaserSensorCoordData;
    $scope.generateProgramModeList = pesDynamicTags.var_object.palletizingModeList;
    $scope.DOCfgData = langJsonData.robot_setting.var_object.DOCfgData;
    $scope.DICfgData = langJsonData.robot_setting.var_object.DICfgData;
    $scope.AOport = langJsonData.commandlist.AOport;
    $scope.AOSinglePort = $scope.AOport.slice(0, -1);
    /* 初始化 */
    //显示设置页面标志位初始化
    $scope.show_spray = false;
    $scope.show_weave = false;
    //夹爪配置变量初始化
    $scope.selectedEndProtocolType = $scope.EndProtocolTypeData[0];
    $scope.ActivateGripperData = [];
    $scope.gripperData = [
        {
            name: 0,
            type: 0,
            version: 0,
            position: 0
        }
    ];
    $scope.GripperIdData = [
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
        },
        {
            id: "5",
            name: "5",
        },
        {
            id: "6",
            name: "6",
        },
        {
            id: "7",
            name: "7",
        },
        {
            id: "8",
            name: "8",
        }
    ];
    $scope.selectedActivateGripper = $scope.GripperIdData[0];
    $scope.GripperFirmData = [
        {
            id: "1",
            name: "ROBOTIQ",
        },
        {
            id: "2",
            name: "HITBOT",
        },
        {
            id: "3",
            name: "TIANJI",
        },
        {
            id: "4",
            name: "DAHUAN",
        },
        {
            id: "5",
            name: "ZHIXING",
        },
        {
            id: "6",
            name: "JODELL"
        },
        {
            id: "7",      // 0x06 + 1
            name: "MT"
        },
        {
            id: "8",        // 增广夹爪 0x07 + 1
            name: "RM"
        }
    ];
    $scope.selectedGripperFirm = $scope.GripperFirmData[0];

    /* ROBOTIQ夹爪 */
    $scope.ROSoftwareVersionData = [
        {
            id: "0",
            name: "R2.0",
        },
        {
            id: "1",
            name: "R2.1",
        },
        {
            id: "2",
            name: "R2.2",
        },
        {
            id: "3",
            name: "R2.3",
        }
    ];

    /* 慧灵夹爪 */
    $scope.HITBOTGripperTypeData = [
        {
            id: "0",
            name: "Z-EFG-RNM",
        },
        {
            id: "1",
            name: "Z-EFG-100",
        },
        {
            id: "2",
            name: "Z-EFG-20P",
        },
        {
            id: "3",
            name: "Z-EFG-50",
        }
    ];
    $scope.HITBOTSoftwareVersionData = [
        {
            id: "0",
            name: "H1.0",
        },
        {
            id: "1",
            name: "H1.1",
        },
        {
            id: "2",
            name: "H1.2",
        },
        {
            id: "3",
            name: "H1.3",
        }
    ];

    /* 天机夹爪 */
    $scope.TIANJIGripperTypeData = [
        {
            id: "0",
            name: "TIANJI-TYPE",
        }
    ];
    $scope.TIANJISoftwareVersionData = [
        {
            id: "0",
            name: "T1.0",
        }
    ];

    /* 大寰夹爪 */
    $scope.DAHUANGripperTypeData = [
        {
            id: "0",
            name: "PGI-140",
        }
    ];
    $scope.DAHUANSoftwareVersionData = [
        {
            id: "0",
            name: "D1.0",
        }
    ];

    /* 知行夹爪 */
    $scope.ZHIXINGGripperTypeData = [
        {
            id: "0",
            name: "CTPM2F20",
        }
    ];
    $scope.ZHIXINGSoftwareVersionData = [
        {
            id: "0",
            name: "Z1.0",
        }
    ];

    /* 钧舵（JODELL）夹爪 */
    $scope.jodellGripperTypeData = [
        {
            id: "0",
            name: "RG"
        },
        {
            id: "1",
            name: "ERG"
        }
    ]
    $scope.jodellSoftwareVersionData = [
        {
            id: "0",
            name: "J1.0"
        }
    ]

    /* MT夹爪 */
    $scope.mtGripperTypeData = [
        {
            id: "0",
            name: "MT-ACTUATOR"
        }
    ]
    $scope.mtSoftwareVersionData = [
        {
            id: "0",
            name: "MT1.0"
        }
    ]

    /* RM夹爪 */
    $scope.rmGripperTypeData = [
        {
            id: "0",
            name: "RM-GB-11-40-2-ITG"
        }
    ]
    $scope.rmSoftwareVersionData = [
        {
            id: "0",
            name: "RM1.0"
        }
    ]

    $scope.selectedGripperMountPosition = $scope.MountPositionData[0];
    //焊机配置变量初始化
    $scope.weldTime = 1000;
    $scope.selectedWeldIOType = $scope.IOTypeDict[0];
    $scope.auxDIOptionsDict = [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127];
    $scope.auxDOOptionsDict = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127];
    $scope.selectedWeldAuxDI0 = $scope.auxDIOptionsDict[0];
    $scope.selectedWeldAuxDI1 = $scope.auxDIOptionsDict[0];
    $scope.selectedWeldAuxDI2 = $scope.auxDIOptionsDict[0];
    $scope.selectedWeldAuxDI3 = $scope.auxDIOptionsDict[0];
    $scope.selectedWeldAuxDO0 = $scope.auxDOOptionsDict[0];
    $scope.selectedWeldAuxDO1 = $scope.auxDOOptionsDict[1];
    $scope.selectedWeldAuxDO2 = $scope.auxDOOptionsDict[2];
    $scope.selectedWeldAuxDO3 = $scope.auxDOOptionsDict[3];
    $scope.diOptionsDict = pesDynamicTags.var_object.diOptionsDictData;
    $scope.doOptionsDict = pesDynamicTags.var_object.doOptionsDictData;
    $scope.selectedWeldDI0 = $scope.diOptionsDict[0];
    $scope.selectedWeldDI1 = $scope.diOptionsDict[0];
    $scope.selectedWeldDI2 = $scope.diOptionsDict[0];
    $scope.selectedWeldDI3 = $scope.diOptionsDict[0];
    $scope.selectedWeldDO0 = $scope.doOptionsDict[0];
    $scope.selectedWeldDO1 = $scope.doOptionsDict[0];
    $scope.selectedWeldDO2 = $scope.doOptionsDict[0];
    $scope.selectedWeldDO3 = $scope.doOptionsDict[0];
    $scope.WeldIdData = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]
    $scope.selectedWeldId = $scope.WeldIdData[0];
    //传感器跟踪器变量初始化   
    $scope.show_Modify_Laser_Coord = false;
    $scope.selectedLaserLocation = $scope.LaserLocationData[0];
    $scope.selectedProtocol = $scope.protocolData[0];
    // 扩展轴（控制器+伺服器485)变量初始化
    $scope.servoConfigTips = g_lang_code == "zh";
    $scope.ExternaAxisModbusList = pesDynamicTags.var_object.ExternaAxisModbusData;
    $scope.externaAxisModbusMode = $scope.ExternaAxisModbusList[1];
    $scope.servoDriverData = [
        {
            number: 0,
            company: 0,
            model: 0,
            version: 0,
            resolution: 0,
            transmission: 0
        }
    ];
    $scope.servoFirmList = pesDynamicTags.var_object.servoFirmData;
    $scope.servoFirm = $scope.servoFirmList[1];
    $scope.servoModelFRList = [
        {
            id: 1,
            name: 'FD100-750C'
        }
    ];
    $scope.servoModelList = $scope.servoModelFRList;
    $scope.servoModel = $scope.servoModelList[0];
    $scope.servoSoftVersionFRList = [
        {
            id: 1,
            name: 'V1.0'
        }
    ];
    $scope.servoSoftVersionList = $scope.servoSoftVersionFRList;
    $scope.servoSoftVersion = $scope.servoSoftVersionList[0];
    $scope.servoIdList = [
        {
            id: 1
        },
        {
            id: 2
        },
        {
            id: 3
        },
        {
            id: 4
        },
        {
            id: 5
        },
        {
            id: 6
        },
        {
            id: 7
        },
        {
            id: 8
        },
        {
            id: 9
        },
        {
            id: 10
        },
        {
            id: 11
        },
        {
            id: 12
        },
        {
            id: 13
        },
        {
            id: 14
        },
        {
            id: 15
        }
    ];
    $scope.servoNumber = $scope.servoIdList[0];
    $scope.servoControlModelList = pesDynamicTags.var_object.servoControlModelData;
    $scope.servoControlModel = $scope.servoControlModelList[0];
    $scope.servoZeroModeData = pesDynamicTags.var_object.servoZeroModeData;
    $scope.servoZeroMode = $scope.servoZeroModeData[0];
    $scope.servoSearchVel = 5;
    $scope.servoLatchVel = 1;
    $scope.servoAccPercent = 100;
    $scope.servoRunningAccPercent = 100;
    $scope.servoTargetAccPercent = 100;
    //外部线性滑轨变量初始化
    $scope.EAxisSpeed = 100;
    $scope.EAxisDistance = 50;
    $scope.EAxisacc = 100;
    $scope.HomeSearchVel = 5;
    $scope.HomeLatchVel = 1;
    $scope.zeroStateText = "";
    $scope.ExternaAxisIdData = [
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
    ]
    $scope.selectedEAxisCfgID = $scope.ExternaAxisIdData[0];
    $scope.selectedEAxisTestID = $scope.ExternaAxisIdData[0];
    $scope.selectedEAxisCompany = $scope.ExternaAxisCompany[0];
    $scope.selectedEAxisCompanyModel = $scope.ExternaAxisModel[0];
    //外部轴选择不同厂商对应参数选择改变
    $scope.ExternaAxisCfgData = [
        {
            axis_id: "1",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "1",
            axis_offset: "1"
        },
        {
            axis_id: "2",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "1",
            axis_offset: "1"
        },
        {
            axis_id: "3",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "1",
            axis_offset: "1"
        },
        {
            axis_id: "4",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "1",
            axis_offset: "1"
        }
    ]
    $scope.ListEAxisCfgData = [
        {
            axis_id: "1",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "14.130",
            axis_offset: "1"
        },
        {
            axis_id: "2",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "14.130",
            axis_offset: "1"
        },
        {
            axis_id: "3",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "14.130",
            axis_offset: "1"
        },
        {
            axis_id: "4",
            axis_type: "1",
            axis_direction: "1",
            axis_possoftlimit: "1",
            axis_negsoftlimit: "1",
            axis_speed: "1",
            axis_acc: "1",
            axis_enres: "1",
            axis_lead: "14.130",
            axis_offset: "1"
        }
    ]
    $scope.selectedEAxisZeroMode = $scope.ZeroModeData[0];
    $scope.selectedSetEAxisLead = 0;
    //传送带跟踪配置
    $scope.selectedConveyorFunction = $scope.ConveyorFunctionData[0];
    $scope.selectedVision = $scope.visionData[0];
    //姿态调整配置
    $scope.selectedPlateType = $scope.plateType[0];
    $scope.selectedMotionDir = $scope.motionDirection[0];
    //寻位配置
    $scope.selectedSearchMode = $scope.pointSearchModeData[0];
    //力传感器配置
    $scope.FTData = [
        {
            name: 0,
            type: 0,
            version: 0,
            position: 0
        }
    ];
    $scope.FTIdData = [
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
        },
        {
            id: "5",
            name: "5",
        },
        {
            id: "6",
            name: "6",
        },
        {
            id: "7",
            name: "7",
        },
        {
            id: "8",
            name: "8",
        }
    ];
    $scope.selectedActivateFT = $scope.FTIdData[0];
    $scope.FTFirmData = [
        {
            id: "17",
            name: "KUNWEI",
        },
        {
            id: "19",
            name: "CAAA(十一院)",
        },
        {
            id: "20",
            name: "ATI",
        },
        {
            id: "21",
            name: "HKM(中科米点)",
        },
        {
            id: "22",
            name: "GZCX(港智创信)",
        },
        {
            id: "23",
            name: "NBIT",
        },
        {
            id: "24",// 0x17为23，需要+1
            name: "XJC(鑫精诚)",
        },
        {
            id: "26",       // 0x19为25，需要+1
            name: "NSR",
        }
    ];
    $scope.selectedFTFirm = $scope.FTFirmData[0];
    $scope.KUNWEITypeData = [
        {
            id: "0",
            name: "KWR75B",
        },
        {
            id: "1",
            name: "KWR75A",
        },
        {
            id: "2",
            name: "KWR75C",
        },
        {
            id: "3",
            name: "KWR75D",
        },
        {
            id: "4",
            name: "KWR75E",
        },
        {
            id: "5",
            name: "KWR75F",
        },
        {
            id: "6",
            name: "KWR75S-A",
        },
        {
            id: "7",
            name: "KWR75S-B",
        },
        {
            id: "8",
            name: "KWR75S-C",
        },
        {
            id: "9",
            name: "KWR75S-D",
        },
        {
            id: "10",
            name: "KWR75S-P",
        },
        {
            id: "11",
            name: "KWR96G-KL",
        }
    ];
    $scope.HANGTIANTypeData = [
        {
            id: "0",
            name: "MCS6A-200-4",
        }
    ];
    $scope.ATITypeData = [
        {
            id: "0",
            name: "AXIA-80-M8",
        }
    ];
    $scope.zhongKeTypeData = [
        {
            id: "0",
            name: "MST2010",
        }
    ];
    $scope.weiHangTypeData = [
        {
            id: "0",
            name: "GZCX-6F-75A",
        }
    ];
    $scope.shenYuanShengTypeData = [
        {
            id: "0",
            name: "XLH93003ACS",
        }
    ];
    $scope.XJCTypeData = [
        {
            id: "0",
            name: "XJC-6F-D82",
        }
    ];
    $scope.NSRTypeData = [
        {
            id: "0",
            name: "NSR-FTSensorA",
        }
    ];
    $scope.FTTypeData = $scope.KUNWEITypeData;
    $scope.selectedFTType = $scope.FTTypeData[0];
    $scope.KWSoftwareVersionData = [
        {
            id: "0",
            name: "1.0",
        }
    ];
    $scope.FTSoftwareVersionData = $scope.KWSoftwareVersionData;
    $scope.selectedFTSoftwareVersion = $scope.FTSoftwareVersionData[0];
    $scope.selectedFTMountPosition = $scope.MountPositionData[0];
    //辅助传感器配置
    $scope.AuxData = [
        {
            name: 0,
            type: 0,
            version: 0,
            position: 0
        }
    ];
    $scope.AuxIdData = [
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
        },
        {
            id: "5",
            name: "5",
        },
        {
            id: "6",
            name: "6",
        },
        {
            id: "7",
            name: "7",
        },
        {
            id: "8",
            name: "8",
        }
    ];
    $scope.selectedActivateAux = $scope.AuxIdData[0];
    $scope.AuxFirmData = [
        {
            id: "18",       // 十六进制0x11转十进制17，hal有减1处理，则下发17+1=18
            name: "JUNKONG"
        },
        {
            id: "25",       // 十六进制0x18转十进制24，hal有减1处理，则下发24+1=25
            name: "HUIDE"
        }
    ];
    $scope.selectedAuxFirm = $scope.AuxFirmData[0];

    /* 钧控外设 */
    $scope.junkongTypeData = [
        {
            id: "0",
            name: "JunKong",
        }
    ];
    $scope.JKSoftwareVersionData = [
        {
            id: "0",
            name: "J1.0",
        }
    ];

    /* 汇德医疗（HUIDE） */
    $scope.huideTypeData = [
        {
            id: "0",
            name: "RYR6T.V1.0"
        }
    ]
    $scope.huideSoftwareVersionData = [
        {
            id: "0",
            name: "HuiDe1.0"
        }
    ]
    //安装配置
    $scope.selectedAuxMountPosition = $scope.MountPositionData[0];

    //扩展IO配置
    $scope.SmartDeviceData = [
        {
            name: 0,
            type: 0,
            version: 0,
            position: 0
        }
    ];
    $scope.SmartDeviceIdData = [
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
        },
        {
            id: "5",
            name: "5",
        },
        {
            id: "6",
            name: "6",
        },
        {
            id: "7",
            name: "7",
        },
        {
            id: "8",
            name: "8",
        }
    ];
    $scope.selectedActivateSmartDevice = $scope.SmartDeviceIdData[0];

    $scope.SmartDeviceFirmData = [
        {
            id: "49",      // 十六进制0x30转十进制48，hal有减1处理，则下发48+1=49
            name: "NSR",
        },
        {
            id: "81",      // 十六进制0x50转十进制80，hal有减1处理，则下发80+1=81
            name: "FR",
        }
    ];
    $scope.selectedSmartDeviceFirm = $scope.SmartDeviceFirmData[0];

    /* NSR */
    $scope.NSRSmartDeviceTypeData = [
        {
            id: "0",
            name: "SmartTool",
        }
    ];
    $scope.NSRSmartDeviceSoftwareVersionData = [
        {
            id: "0",
            name: "NSR1.0",
        }
    ];

    /* FR */
    $scope.FRSmartDeviceTypeData = [
        {
            id: "0",
            name: "Smart Tool + XJC-6F-D82",
        },
        {
            id: "1",
            name: "Smart Tool + NSR-FT Sensor A",
        },
        {
            id: "2",
            name: "Smart Tool + GZCX-6F-75A",
        }
    ];
    $scope.FRSmartDeviceSoftwareVersionData = [
        {
            id: "0",
            name: "FR1.0",
        }
    ];
    /* Lua末端开放协议配置参数 */
    $scope.endProtocolBaudRateData = [
        {
            id: "0",
            name: "9600",
        },
        {
            id: "1",
            name: "14400",
        },
        {
            id: "2",
            name: "19200",
        },
        {
            id: "3",
            name: "38400",
        },
        {
            id: "4",
            name: "56000",
        },
        {
            id: "5",
            name: "67600",
        },
        {
            id: "6",
            name: "115200",
        },
        {
            id: "7",
            name: "128000",
        }
    ];
    $scope.endProtocolStopBitData = [
        {
            id: "1",
            name: "0.5",
        },
        {
            id: "0",
            name: "1",
        },
        {
            id: "3",
            name: "1.5",
        },
        {
            id: "2",
            name: "2",
        },
    ];
    $scope.endProtocolCheckData = [
        {
            id: "0",
            name: "None",
        },
        {
            id: "1",
            name: "Odd",
        },
        {
            id: "2",
            name: "Even",
        }
    ]
    $scope.luaEndCompanyData = [
        {
            id: "97", // 十六进制0x60转十进制96，hal有减1处理，则下发97
            name: "OpenLua",
        }
    ];
    $scope.openluaGripperIDData = [
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
        },
        {
            id: "5",
            name: "5",
        },
        {
            id: "6",
            name: "6",
        },
        {
            id: "7",
            name: "7",
        },
        {
            id: "8",
            name: "8",
        }
    ];
    $scope.controlProtocolData = [
        {
            id: "0",
            name: "0"
        },
        {
            id: "1",
            name: "1"
        },
        {
            id: "2",
            name: "2"
        },
        {
            id: "3",
            name: "3"
        },
    ]
    $scope.configDeviceArr = [];   // openlua已配置设备数组
    $scope.openluaGripperArr = [];  // openlua夹爪数组
    for (let i = 1; i < 9; i++) {
        $scope.openluaGripper.id = i;
        let el = JSON.parse(JSON.stringify($scope.openluaGripper));
        $scope.openluaGripperArr.push(el);
    }
    $scope.openluaGripperArrCopy = JSON.parse(JSON.stringify($scope.openluaGripperArr));
    $scope.endProtocolBaudRate = $scope.endProtocolBaudRateData[0];
    $scope.endProtocolStopBit = $scope.endProtocolStopBitData[0];
    $scope.endProtocolCheck = $scope.endProtocolCheckData[0];
    $scope.selectedOLGriID = $scope.openluaGripperIDData[0];

    //安装配置
    $scope.selectedSmartDeviceMountPosition = $scope.MountPositionData[0];
    //康养配置
    $scope.selectedKangyangMotion = $scope.MotionWayData[0];
    // 扭矩示教点数据列表
    // 扭矩系统单位列表
    $scope.torqueUnitList = [
        {
            unit_index: 0,
            int_float: 0,
            unit_name: "mN.m"
        },
        {
            unit_index: 1,
            int_float: 1,
            unit_name: "kgf.cm"
        }
    ];
    $scope.leftTorqueTeachingPointsList = [];
    $scope.rightTorqueTeachingPointsList = [];
    // 码垛系统变量
    $scope.palletAdvancedConfig = {
        height: '',
        x1: '',
        y1: '',
        z1: '',
        x2: '',
        y2: '',
        z2: '',
        time: '',
        smooth_enable: '0',
        smooth1_time: '-1',
        smooth1_length: '-1',
        smooth2_time: '-1',
        smooth2_length: '-1',
    };
    let isExistFormula = 0;                 // 已存在码垛配方标志位，0-不存在，1-存在
    let isPalletizingFormulaLoaded = 0;     // 码垛配方已加载标志位，0-未加载，1-已加载 
    let isSuccessSetGripPoint = 0;          // 码垛工件夹取示教点设置成功标志位，0-未设置，1-设置成功
    let patternALeftMatrix = {};            // 模式A左工位点矩阵
    let patternBLeftMatrix = {};            // 模式B左工位点矩阵
    let patternARightMatrix = {};           // 模式A右工位点矩阵
    let patternBRightMatrix = {};           // 模式B右工位点矩阵
    let gripPointData = {};                 // 码垛参考点数据
    let layerSequenceArr = [];              // 层模式序列数组
    let patternEditCanvas;                  // 模式编辑Canvas实例变量
    let originPatternA = [];                // 右工位原始Canvas码垛模板像素点位-模式A
    let originPatternALeft = [];            // 左工位原始Canvas码垛模板像素点位-模式A            
    let originPatternB = [];                // 右工位原始Canvas码垛模板像素点位-模式B
    let originPatternBLeft = [];            // 左工位原始Canvas码垛模板像素点位-模式B
    let patternType;                        // 模式配置的模型 'A':A模式，'B':B模式
    let gripPointName = "";                 // 抓取点名称
    let leftTransitionPointName = "";       // 左工位过度点名称
    let rightTransitionPointName = "";      // 右工位过度点名称
    let currentAutoTransitionNum = 0;          // 自动设置左右工位过度点名称时，0为优先设置左工位点，设置成功后置为1后再下发自动设置右工位点
    let currentAutoTransitionJoint = {};
    let patternDraw = false;                // 工件是否有碰撞的标志
    let lastAddedBox = {};                  // 码垛上一次添加的工件
    $scope.patternATransparency = 100;
    let boxTransparency = 1;                // canvas中工件的透明度
    let checkPatternAShow = 0;              // 显示A模式配置是否打开
    let isDeletePattern = false;            // 码垛第一次点击删除全部按钮的标志
    let isCheckPatternBEnable = false;      // 点击B模式是否开启按钮的标志
    let isSelectPatternEnable = false;      // 切换A/B模式按钮的标志
    let isSelectPatternAShow = false;       // 点击显示A模式配置是否开启按钮的标志
    $scope.layersPatternObj = [];
    $scope.isinheritconfig = 0;
    // 远程控制接口配置
    $scope.fciModeData = pesDynamicTags.var_object.fciModeData;
    $scope.fciFirmData = [
        {
            name: 'HMS',
            id: 1
        },
        {
            name: 'Hilscher',
            id: 2
        }
    ];
    $scope.fciPeriodData = [1, 2, 4, 8, 16, 32];
    /* 获取一系列数据初始化页面 */
    getLaserInfo();
    getWPNameList();
    initializePerPage();
    getDOcfg();
    getLaserSensorcfg();
    getToolCoordData();
    getExtAxisGetModbusComParam();
    getEAxiscfg();
    getConveyorcfg();
    getUserFiles();
    getIOAliasData();
    getGripperInfo();
    /* ./初始化 */
    
    // 判断子页面是否有权限
    $scope.userAuthData = getUserAuthority();

    //根据二级菜单切换对应设置界面
    $scope.switchapplicationPage = function (id) {
        $(".navItem").removeClass("item-selected");
        $(".navItem" + id).addClass("item-selected");
        $(".childrenItem").removeClass("childItem-selected");
        $(".childrenItem" + id).addClass("childItem-selected");
        $scope.show_End_Device = false;
        $scope.show_lua_end_protocol = false;
        $scope.show_control_protocol = false;
        $scope.show_forceSensor = false;
        $scope.show_aux_Sensor = false;
        $scope.show_spray = false;
        $scope.show_weave = false;
        $scope.show_laser = false;
        $scope.show_linear = false;
        $scope.show_conveyor = false;
        $scope.show_padjust = false;
        $scope.show_TorqueSetting = false;
        $scope.show_kangyang = false;
        $scope.show_palletizing = false;
        $scope.show_polishing = false;
        $scope.show_robotFCIMode = false;
        switch (id) {
            case "peripheral_config":
                $scope.show_End_Device = true;
                $scope.changeEndDeviceType(0);
                $scope.selectedEndDeviceType = $scope.EndDeviceTypeData[0];
                break;
            case "lua_end_protocol_config":
                $scope.show_lua_end_protocol = true;
                $scope.openluaInitFlag = 1;
                getLuaProtocolParam();
                getAxleLuaEnableStatus();
                getAxleLuaEnableDeviceType();
                break;
            case "control_protocol_config":
                $scope.show_control_protocol = true;
                getControlProtocol();
                getCtrlOpenLUAName();
                break;
            case "spay_config":
                $scope.show_spray = true;
                break;
            case "welder_config":
                $scope.show_weave = true;
                getWeldingCheckArcInterruptionParam();
                getWeldingReWeldAfterBreakOffParam();
                $scope.selectedProcessWeldId = $scope.WeldIdData[0];
                $scope.getWeldingProcessParam(0);//初始工艺参数配置
                $scope.toggleType(0);//获取模拟量电流关系图数据
                break;
            case "sensor_tracking":
                $scope.show_laser = true;
                getOptionsData();
                break;
            case "extended_axis":
                $scope.show_linear = true;
                $scope.selectExternaAxisModbusMode($scope.externaAxisModbusMode.id);
                break;
            case "conveyor_tracking":
                $scope.show_conveyor = true;
                break;
            case "track_pose":
                $scope.show_padjust = true;
                break;
            case "torque_sys":
                $scope.show_TorqueSetting = true;
                break;
            case "health_sys":
                $scope.show_kangyang = true;
                break;
            case "palletizing_sys":
                $scope.show_palletizing = true;
                $scope.show_palletizingInitialPage = true;
                $scope.show_palletizingSettingPage = false;
                break;
            case "polishing_device":
                $scope.show_polishing = true;
                getPolishingComParam();
                break;
            case "remote_control":
                $scope.show_robotFCIMode = true;
                getRobotFCIMode();
                break;
            default:
                break;
        }
    }

    /* 扭矩系统状态展示页面一键直达设置 */
    document.getElementById('peripheral').addEventListener('open_torque_setting', () => {
        $scope.switchapplicationPage(7);
    });

    /* 康养系统状态展示页面一键直达设置 */
    document.getElementById('peripheral').addEventListener('open_kangyang_setting', () => {
        $scope.switchapplicationPage(8);
    });

    /* 码垛系统状态展示页面一键直达设置 */
    document.getElementById('peripheral').addEventListener('open_palletizing_setting', () => {
        $scope.switchapplicationPage(9);
    });

    /*部分设置参数设置完切换界面保存数据*/
    function initializePerPage() {
        if (sessionStorage.getItem("weldTime") != null) {
            $scope.weldTime = sessionStorage.getItem("weldTime");
        }
        if (sessionStorage.getItem("EAxisSpeed") != null) {
            $scope.EAxisSpeed = sessionStorage.getItem("EAxisSpeed");
        }
        if (sessionStorage.getItem("EAxisacc") != null) {
            $scope.EAxisacc = sessionStorage.getItem("EAxisacc");
        }
        if (sessionStorage.getItem("EAxisDistance") != null) {
            $scope.EAxisDistance = sessionStorage.getItem("EAxisDistance");
        }
    }

    function setPerSessionStorage() {
        sessionStorage.setItem('weldTime', $scope.weldTime);
        sessionStorage.setItem('EAxisSpeed', $scope.EAxisSpeed);
        sessionStorage.setItem('EAxisacc', $scope.EAxisacc);
        sessionStorage.setItem('EAxisDistance', $scope.EAxisDistance);
    }

    //夹爪选择不同厂商对应参数选择改变
    $scope.changeEndDeviceType = function (num) {
        if (1 == num) {
            $scope.show_gripper = false;
            $scope.show_forceSensor = true;
            $scope.show_aux_Sensor = false;
            $scope.show_smart_device = false;
            getFTConfigInfo();
        } else if (0 == num) {
            $scope.show_gripper = true;
            $scope.show_forceSensor = false;
            $scope.show_aux_Sensor = false;
            $scope.show_smart_device = false;
        } else if (2 == num) {
            $scope.show_gripper = false;
            $scope.show_forceSensor = false;
            $scope.show_aux_Sensor = true;
            $scope.show_smart_device = false;
            getAuxConfigInfo();
        } else if (3 == num) {
            $scope.show_gripper = false;
            $scope.show_forceSensor = false;
            $scope.show_aux_Sensor = false;
            $scope.show_smart_device = true;
            getSmartDeviceConfigInfo();
        }
    }

    //夹爪选择不同厂商对应参数选择改变
    $scope.changeFrim = function (num) {
        if (2 == num) {
            $scope.GripperTypeData = $scope.HITBOTGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.HITBOTSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (1 == num) {
            $scope.GripperTypeData = $scope.ROGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.ROSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (3 == num) {
            $scope.GripperTypeData = $scope.TIANJIGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.TIANJISoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (4 == num) {
            $scope.GripperTypeData = $scope.DAHUANGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.DAHUANSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (5 == num) {
            $scope.GripperTypeData = $scope.ZHIXINGGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.ZHIXINGSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (6 == num) {
            $scope.GripperTypeData = $scope.jodellGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.jodellSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (7 == num) {
            $scope.GripperTypeData = $scope.mtGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.mtSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        } else if (8 == num) {
            $scope.GripperTypeData = $scope.rmGripperTypeData;
            $scope.selectedGripperType = $scope.GripperTypeData[0];
            $scope.SoftwareVersionData = $scope.rmSoftwareVersionData;
            $scope.selectedSoftwareVersion = $scope.SoftwareVersionData[0];
        }
    }
    $scope.changeFrim(1);

    //辅助传感器设备选择不同厂商对应参数选择改变
    $scope.changeAuxFrim = function (num) {
        if (18 == num) {
            $scope.AuxTypeData = $scope.junkongTypeData;
            $scope.selectedAuxType = $scope.AuxTypeData[0];
            $scope.auxSoftwareVersionData = $scope.JKSoftwareVersionData;
            $scope.selectedAuxSoftwareVersion = $scope.auxSoftwareVersionData[0];
        } else if (25 == num) {
            $scope.AuxTypeData = $scope.huideTypeData;
            $scope.selectedAuxType = $scope.AuxTypeData[0];
            $scope.auxSoftwareVersionData = $scope.huideSoftwareVersionData;
            $scope.selectedAuxSoftwareVersion = $scope.auxSoftwareVersionData[0];
        }
    }
    $scope.changeAuxFrim(18);


    //配置夹爪指令下发
    //配置夹爪
    $scope.configGripper = function () {
        if (checkGripperActive()) {
            var cfrGripperString = "SetGripperConfig(" + $scope.selectedGripperFirm.id + "," + $scope.selectedGripperType.id + "," + $scope.selectedSoftwareVersion.id + "," + $scope.selectedGripperMountPosition.id + ")";
            let setCfgGripperCmd = {
                cmd: 226,
                data: {
                    "content": cfrGripperString,
                },
            };
            dataFactory.setData(setCfgGripperCmd)
                .then(() => {
                    sleep(500);
                    getGripperInfo();
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.warning(pesDynamicTags.warning_messages[0]);
        }
    }

    //清除夹爪
    $scope.deleteGripper = function () {
        if (checkGripperActive()) {
            var cfrGripperString = "SetGripperConfig(0,0,0,0)";
            let setCfgGripperCmd = {
                cmd: 226,
                data: {
                    "content": cfrGripperString,
                },
            };
            dataFactory.setData(setCfgGripperCmd)
                .then(() => {
                    sleep(500);
                    getGripperInfo();
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.warning(pesDynamicTags.warning_messages[0]);
        }
    }

    //配置夹爪前检查该夹爪是否已经激活
    function checkGripperActive() {
        let length = $scope.gripperstatearr.length;
        for (let i = 0; i < length; i++) {
            if (1 == $scope.gripperstatearr[i]) {
                return 0;
            }
        }
        return 1;
    }

    /**
     * 激活和复位夹爪
     * @param {int} gripperID 夹爪ID
     * @param {int} state 激活/复位标志位
     * @returns 
     */
     $scope.actGripper = function (gripperID, state) {
        if (undefined === $scope.selectedActivateGripper) {
            toastFactory.info(pesDynamicTags.info_messages[0]);
            return;
        }
        var actGripperString = "ActGripper(" + gripperID + "," + state + ")";
        let setActGripperCmd = {
            cmd: 227,
            data: {
                "content": actGripperString,
            },
        };
        dataFactory.setData(setActGripperCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //毫秒等待功能函数
    function sleep(time){
        var starttime = new Date().getTime();
        while(new Date().getTime() < starttime+time ){
        }
    }

    //获取夹爪配置信息
    function getGripperInfo() {
        var GripperCfgString = "GetGripperConfig()";
        let getGripperCfgCmd = {
            cmd: 229,
            data: {
                content: GripperCfgString,
            },
        };
        dataFactory.setData(getGripperCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[0]);
            });
    };

    document.getElementById('peripheral').addEventListener('229', e => {
        extractGripperInfo(JSON.parse(e.detail));
    })

    let stateArr = [0, 0, 0, 0, 0, 0, 0, 0];
    document.getElementById('peripheral').addEventListener('gripperstate', e => {
        if (stateArr != e.detail) {
            $scope.gripperstatearr = e.detail;
            stateArr = e.detail;
        } 
    })


    //提取获取到的夹爪配置信息
    function extractGripperInfo(data) {
        $scope.gripperData = [];
        let length = data.length;
        var j = 0;
        for (let i = 0; i < length; i++) {
            data[i].name = data[i].name+1;
            if (data[i].name != 0) {
                $scope.gripperData[j++] = data[i];
            }
        }
        j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                if (2 == data[i].name) {
                    $scope.gripperData[j].type = $scope.HITBOTGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.HITBOTSoftwareVersionData[~~(data[i].version)].name;
                } else if (1 == data[i].name) {
                    $scope.gripperData[j].type = $scope.ROGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.ROSoftwareVersionData[~~(data[i].version)].name;
                } else if (3 == data[i].name) {
                    $scope.gripperData[j].type = $scope.TIANJIGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.TIANJISoftwareVersionData[~~(data[i].version)].name;
                } else if (4 == data[i].name) {
                    $scope.gripperData[j].type = $scope.DAHUANGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.DAHUANSoftwareVersionData[~~(data[i].version)].name;
                } else if (5 == data[i].name) {
                    $scope.gripperData[j].type = $scope.ZHIXINGGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.ZHIXINGSoftwareVersionData[~~(data[i].version)].name;
                } else if (6 == data[i].name) {
                    $scope.gripperData[j].type = $scope.jodellGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.jodellSoftwareVersionData[~~(data[i].version)].name;
                } else if (7 == data[i].name) {
                    $scope.gripperData[j].type = $scope.mtGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.mtSoftwareVersionData[~~(data[i].version)].name;
                } else if (8 == data[i].name) {
                    $scope.gripperData[j].type = $scope.rmGripperTypeData[~~(data[i].type)].name;
                    $scope.gripperData[j].version = $scope.rmSoftwareVersionData[~~(data[i].version)].name;
                }
                if (data[i].name > 8) {
                    $scope.gripperData[j].name = data[i].name;
                }else{
                    $scope.gripperData[j].name = $scope.GripperFirmData[~~(data[i].name - 1)].name;
                }
                
                j++;
            }
        }
    }

    /*Lua末端开放协议配置 */

    /** 设置末端文件传输类型-末端Lua文件升级*/
    $scope.setEndFileType = function(){
        let setCmd = {
            cmd: 947,
            data: {
                content: "SetAxleFileType(2)"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('947', () => {
        inboot();
    });

    // 进入BOOT模式
    function inboot(){
        let setCmd = {
            cmd: 332,
            data: {
                content: "SetSysServoBootMode()"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
                toastFactory.success();
            }, (status) => {
                toastFactory.error(status);
            })
    }
    // 获取BOOT模式
    let lua_boot_flag = 0;
    document.getElementById('peripheral').addEventListener('332', () => {
        lua_boot_flag = 1;
    });

    /** 上传Lua末端开放协议 */
    $scope.importLuaProtocol = function () {
        if(lua_boot_flag == 0){
            toastFactory.info(pesDynamicTags.info_messages[86]);
            return;
        }
        var formData = new FormData();
        var file = document.getElementById("luaProtocolImported").files[0];

        if (null == file) {
            toastFactory.info(pesDynamicTags.info_messages[85]);
            return;
        }
        if (file.name.substring(0, 9) != 'AXLE_LUA_') {
            toastFactory.info(pesDynamicTags.info_messages[88]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    let inBootCmd = {
                        cmd: 620,
                        data: {
                            content: "SlaveFileWrite(1,7,\"/tmp/"+file.name+"\")"
                        }
                    }
                    dataFactory.setData(inBootCmd)
                        .then(() => {
                            $scope.updateLuaProgressText = pesDynamicTags.info_messages[89];
                        }, (status) => {
                            toastFactory.error(status);
                        })
                }
            }, (status) => {
                if (status != 403) {
                    toastFactory.error(status);
                } else if (status == 403) {
                    $scope.updateLuaProgressText = pesDynamicTags.error_messages[30];
                }
            });
    };
    // 获取openlua上传状态
    document.getElementById('peripheral').addEventListener('620', function (e) {
        let luaUpgradeData = JSON.parse(e.detail);
        if (luaUpgradeData.ret == "0") {
            $scope.updateLuaProgressText = pesDynamicTags.error_messages[30];
        } else {
            $scope.updateLuaProgressText = pesDynamicTags.success_messages[13];
        }
    })

    /**
     * 设置末端通讯配置参数
     * @param {U16} boardRate 波特率 
     * @param {U16} dateBit 数据位
     * @param {U16} stopBit 停止位
     * @param {U16} check 校验
     * @param {U16} timeout 超时时间
     * @param {U16} overtime 超时次数
     * @param {U16} interval 周期性指令时间间隔
     */
    $scope.setLuaProtocolParam = function(boardRate,dateBit,stopBit,check,timeout,overtime,interval) {
        if (!boardRate || !dateBit || !stopBit || !check || !timeout || !overtime || !interval) {
            toastFactory.info(pesDynamicTags.info_messages[87]);
            return;
        }
        let setCmd = {
            cmd: 946,
            data: {
                content: "SetAxleCommunicationParam("+ (parseInt(boardRate) + 1) + "," + dateBit + "," + (parseInt(stopBit) + 1) + "," + check + "," + timeout + "," + overtime + "," + interval +")"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
                getLuaProtocolParam();
            }, (status) => {
                toastFactory.error(status);
            })
    }

    /** 获取末端通讯配置参数 */
    function getLuaProtocolParam() {
        let getCmd = {
            cmd: 945,
            data: {
                content: "GetAxleCommunicationParam()"
            }
        }
        dataFactory.setData(getCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('945', e => {
        let communicationParam = e.detail.split(",");
        $scope.endProtocolBaudRate = $scope.endProtocolBaudRateData[communicationParam[0] - 1];
        $scope.endProtocolDataBit = communicationParam[1];
        $scope.endProtocolStopBit = $scope.endProtocolStopBitData.filter(item => item.id == (communicationParam[2] - 1))[0];
        $scope.endProtocolCheck = $scope.endProtocolCheckData[communicationParam[3]];
        $scope.endProtocolTimeout = communicationParam[4];
        $scope.endProtocolOvertime = communicationParam[5];
        $scope.endProtocolInterval = communicationParam[6];
    });

    /**
     * 设置启用末端Lua执行
     * @param {int} enable 0-关闭 1-开启
     */
    $scope.setAxleLuaEnable = function(enable) {
        let setCmd = {
            cmd: 948,
            data: {
                content: "SetAxleLuaEnable(" + enable +")"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('948', e => {
        getAxleLuaEnableStatus();
    });

    /** 获取启用末端Lua执行状态*/
    function getAxleLuaEnableStatus() {
        let setCmd = {
            cmd: 965,
            data: {
                content: "GetAxleLuaEnableStatus()"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('965', e => {
        $scope.openluaEnable = ~~e.detail == 1 ? 1 : 0;
        // 启用状态下
        if ($scope.openluaEnable) {
            // 无激活夹爪
            if (checkGripperActive()) {
                // 存在已配置夹爪
                if ($scope.gripperData.length != 0) {
                    // 已配置的夹爪不为0x60(97)
                    if ($scope.gripperData[0].name != 97) {
                        $scope.setFTConfig($scope.luaEndCompanyData[0].id,0,0,1);
                        getGripperInfo();
                        getFTConfigInfo();
                    } else {
                        // 存在已配置的FT
                        if ($scope.FTData.length != 0) {
                            if ($scope.FTData[0].name != 96) {
                                $scope.setFTConfig($scope.luaEndCompanyData[0].id,0,0,1);
                                getFTConfigInfo();
                            }
                        }
                    }
                // 无已配置夹爪
                } else {
                    $scope.setFTConfig($scope.luaEndCompanyData[0].id,0,0,1);
                    getGripperInfo();
                    getFTConfigInfo();
                }
            // 有激活夹爪
            } else {
                // 已配置的夹爪不为0x60(97)
                if ($scope.gripperData[0].name != 97) {
                    // 提示复位夹爪并且关闭启用
                    toastFactory.warning(pesDynamicTags.warning_messages[0]);
                    $scope.setAxleLuaEnable(0);
                }
            }
        }
    });

    /**
     * 切换夹爪设备ID时还原未下发的功能码修改
     * @param {object} gripperIDObj 夹爪ID对象
     */
    $scope.changeGripperID = function (gripperIDObj) {
        $scope.selectedOLGriID = gripperIDObj;
        getAxleLuaGripperFunc(gripperIDObj.id);
    }

    /**
     * 设置末端Lua末端设备启用类型
     * @param {int} enable 0-不启用，1-启用
     * @param {int} type 1-力传感器，2-夹爪，3-I/O设备
     */
    $scope.setAxleLuaEnableDeviceType = function (enable, type) {
        $scope.ftSensorON = type == 1 ? enable : $scope.ftSensorON;
        $scope.gripperON = type == 2 ? enable : $scope.gripperON;
        let setCmd = {
            cmd: 977,
            data: {
                content: `SetAxleLuaEnableDeviceType({${$scope.ftSensorON},${$scope.gripperON},0})`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('977', () => {
        getAxleLuaEnableDeviceType();
    });

    /** 获取Lua末端设备启用类型 */
    function getAxleLuaEnableDeviceType() {
        let setCmd = {
            cmd: 982,
            data: {
                content: `GetAxleLuaEnableDeviceType()`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('982', (e) => {
        let deviceEnable = e.detail.split(',').map(Number);
        $scope.ftSensorON = deviceEnable[0];
        $scope.gripperON = deviceEnable[1];
        if ($scope.openluaInitFlag) {
            $('#pageLoading').css("display", "block");
            getAxleLuaGripperFunc(1);
            $scope.recursionFlag = 1;
            $scope.recursionIndex = 1;
        }
        if ($scope.openluaInitFlag != 1 && ($scope.ftSensorON == 0 || $scope.ftSensorON == 1)) {
            getAxleLuaEnableDevice();
        }
    });

    /**
     * 配置Openlua夹爪及夹爪功能码元组
     * @param {int} gripperID 夹爪ID
     * @param {array} funcCodeSet 功能码元组
     */
    $scope.setAxleLuaGripperFunc = function (gripperID, funcCodeSet) {
        if (funcCodeSet == undefined) {
            let set = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            let configsLength = $scope.openluaGripper.configs.length;
            for (let i = 0; i < configsLength; i++) {
                set[$scope.openluaGripperArr[gripperID-1].configs[i].bit] = ($scope.openluaGripperArr[gripperID-1].configs[i].state);
            }
            funcCodeSet = `{${set.toString()}}`;
        }
        let setCmd = {
            cmd: 979,
            data: {
                content: `SetAxleLuaGripperFunc(${gripperID},${funcCodeSet})`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('979', (e) => {
        if (e.detail) {
            getAxleLuaGripperFunc();
            getAxleLuaEnableDevice();
        }
    });

    /**
     * 获取Openlua夹爪ID对应功能码
     * @param {int} gripperID 夹爪ID 缺省使用$scope.selectedOLGriID
     */
    function getAxleLuaGripperFunc(gripperID) {
        if (gripperID == undefined) {
            gripperID = $scope.selectedOLGriID.id;
            $scope.funcGripperID = gripperID;
        } else {
            $scope.funcGripperID = gripperID;
        }
        let setCmd = {
            cmd: 981,
            data: {
                content: `GetAxleLuaGripperFunc(${gripperID})`
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('981', (e) => {
        let funcCodeArr = e.detail.split(',').map(Number);
        $scope.openluaGripperArr[$scope.funcGripperID - 1].configs.forEach((el, index, arr) => {
            el.state = funcCodeArr[$scope.openluaGripper.configs[index].bit];
        })
        $scope.openluaGripperArrCopy = JSON.parse(JSON.stringify($scope.openluaGripperArr));
        if ($scope.recursionFlag && $scope.recursionIndex != 8) {
            $scope.recursionIndex = $scope.recursionIndex + 1;
            getAxleLuaGripperFunc($scope.recursionIndex);
        } else if ($scope.recursionFlag && $scope.recursionIndex == 8) {
            $scope.recursionFlag = 0;
            if ($scope.openluaInitFlag) {
                $('#pageLoading').css("display", "none");
                $scope.openluaInitFlag = 0;
            }
            getAxleLuaEnableDevice();
        }
    });

    /** 获取Openlua已配置设备 */
    function getAxleLuaEnableDevice() {
        let setCmd = {
            cmd: 978,
            data: {
                content: "GetAxleLuaEnableDevice()"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            })
    }
    document.getElementById('peripheral').addEventListener('978', (e) => {
        let tmpStr = e.detail.substring(1,48);
        let deviceConfigFlagArr = tmpStr.split(',').map(Number);  // [0-7,8-15,16-23]
        let ftConfigFlagArr = deviceConfigFlagArr.slice(0, 8);
        let gripperConfigFlagArr = deviceConfigFlagArr.slice(8, 16);
        $scope.configDeviceArr = [];
        // 力传感器设备
        if (ftConfigFlagArr[0] == 1) {
            $scope.configDeviceArr.push(JSON.parse(JSON.stringify($scope.openluaFTSensor)));
        }
        // 夹爪设备
        for (let i = 0; i < gripperConfigFlagArr.length; i++) {
            if (gripperConfigFlagArr[i] == 1) {
                $scope.configDeviceArr.push(JSON.parse(JSON.stringify($scope.openluaGripperArr[i])));
            }
        }
    });

    /*./Lua末端开放协议配置 */

    /* 控制器开放协议配置 */

    /** 上传外设控制开放协议 */
    $scope.importControlProtocol = function () {
        var formData = new FormData();
        var file = document.getElementById("controlProtocolImported").files[0];

        if (null == file) {
            toastFactory.info(pesDynamicTags.info_messages[85]);
            return;
        }
        if (file.name.substring(0, 8) != 'CtrlDev_') {
            toastFactory.info(pesDynamicTags.info_messages[92]);
            return;
        }
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                if (typeof(data) != "object") {
                    if (data == "success") {
                        getControlProtocol();
                    } else {
                        toastFactory.info(file.name + '\n' + data);
                    }
                }
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    getControlProtocol();
                }
                /* ./test */
            });
    };

    /**获取外设控制协议 */
    function getControlProtocol() {
        let getCmd = {
            cmd: "get_openlua_filenames",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.controlProtocolNameData = JSON.parse(JSON.stringify(data));
                $scope.controlProtocolNameData.unshift(pesDynamicTags.var_object.clearData[0].name);
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[31]);
                /* test */
                if(g_testCode) {
                    $scope.controlProtocolNameData = ['test01.lua','test02.lua'];
                    $scope.controlProtocolNameData.unshift(pesDynamicTags.var_object.clearData[0].name);
                }
                /* ./test */
            });
    }

    /**
     * 删除控制器外设协议
     * @param {string} name 
     */
    $scope.deleteControlProtocol = function(name) {
        if (!name || name == pesDynamicTags.var_object.clearData[0].name) {
            toastFactory.info(pesDynamicTags.info_messages[85]);
            return;
        }

        let deleteCmd = {
            cmd: "remove_lua_file",
            data: {
                name: name,
                type: "4"
            },
        };
        dataFactory.actData(deleteCmd)
            .then(() => {
                getControlProtocol()
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置控制器外设协议LUA文件名
     * @param {int} id 协议编号
     * @param {string} name 协议名称
     */
    let temp = [];
    $scope.setCtrlOpenLUAName = function(id,name) {
        if (!id || !name) {
            toastFactory.info(pesDynamicTags.info_messages[93]);
            return;
        }
        if (name == pesDynamicTags.var_object.clearData[0].name) {
            name = "";
        }
        let setCmd = {
            cmd: 993,
            data: {
                content: "SetCtrlOpenLUAName(" + id + ',\"' + name +"\")"
            }
        }
        dataFactory.setData(setCmd)
            .then(() => {
                getCtrlOpenLUAName();
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    if (temp.find(item => item.id == id) && name == "") {
                        temp.splice(temp.findIndex(item => item.id == id),1);
                        $scope.equipmentProtocolData = temp;
                        return;
                    }

                    if (temp.find(item => item.id == id && item.name == name)) {
                        return;
                    } else if (temp.find(item => item.id == id && item.name != name)) {
                        temp[temp.findIndex(item => item.id == id)].name = name;
                    } else {
                        if(name == "") return;
                        temp.push({
                            id: id,
                            name: name,
                        })
                    }
                    $scope.equipmentProtocolData = temp;
                }
                /* ./test */
            })
    }

    /**
     * 导出控制协议
     * @param {string} name 控制协议名称 
     */
    $scope.exportControlProtocol = function(name) {
        if (name == null || name == undefined || name == pesDynamicTags.var_object.clearData[0].name) {
            toastFactory.info(pesDynamicTags.info_messages[85]);
        } else {
            if(g_systemFlag == 1){
                window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/user/ctrlopenlua/" + name;
            }else{
                window.location.href = "/action/download?pathfilename=/fruser/ctrlopenlua/" + name;
            }
        }
    }

    /**
     * 加载控制器开放协议
     * @param {int} id 协议编号
     */
    $scope.loadCtrlOpenLUA = function(id) {
        let setCmd = {
            cmd: 995,
            data: {
                "content": "LoadCtrlOpenLUA(" + id + ")",
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**获取当前配置的外设协议LUA文件名*/
    function getCtrlOpenLUAName() {
        let setCmd = {
            cmd: 994,
            data: {
                "content": "GetCtrlOpenLUAName()",
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
                /* test */
                if (g_testCode) {
                    let protocolNameData = ['name1','name2','name3','name4']
                    let temp = [];
                    protocolNameData.forEach((item,index) => {
                        temp.push({
                            id: index,
                            name: item,
                        })
                    });
                    $scope.equipmentProtocolData = temp;
                }
                /* ./test */
            });
    }
    document.getElementById('peripheral').addEventListener('994', e => {
        let protocolNameData = e.detail.split(",");
        let temp = [];
        protocolNameData.forEach((item,index) => {
            temp.push({
                id: index,
                name: item,
            })
        });
        $scope.equipmentProtocolData = temp;
    });

    /**
     * 卸载控制器开放协议
     * @param {int} id 协议编号
     */
    $scope.unloadCtrlOpenLUA = function(id) {
        let setCmd = {
            cmd: 996,
            data: {
                "content": "UnloadCtrlOpenLUA(" + id + ")",
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* ./控制器开放协议配置 */

    //读取DO配置文件
    let isSafetyFunc = 0;
    function getDOcfg() {
        $scope.DIcfgArr = [];
        $scope.DOcfgArr = [];
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.DIcfgArr[0] = ~~data.ctl_di8_config;
                $scope.DIcfgArr[1] = ~~data.ctl_di9_config;
                $scope.DIcfgArr[2] = ~~data.ctl_di10_config;
                $scope.DIcfgArr[3] = ~~data.ctl_di11_config;
                $scope.DIcfgArr[4] = ~~data.ctl_di12_config;
                $scope.DIcfgArr[5] = ~~data.ctl_di13_config;
                $scope.DIcfgArr[6] = ~~data.ctl_di14_config;
                $scope.DIcfgArr[7] = ~~data.ctl_di15_config;
                $scope.DOcfgArr[0] = ~~data.ctl_do8_config;
                $scope.DOcfgArr[1] = ~~data.ctl_do9_config;
                $scope.DOcfgArr[2] = ~~data.ctl_do10_config;
                $scope.DOcfgArr[3] = ~~data.ctl_do11_config;
                $scope.DOcfgArr[4] = ~~data.ctl_do12_config;
                $scope.DOcfgArr[5] = ~~data.ctl_do13_config;
                $scope.DOcfgArr[6] = ~~data.ctl_do14_config;
                $scope.DOcfgArr[7] = ~~data.ctl_do15_config;

                // 判断自定义DIO功能代码是否存在安全功能
                if (g_safetyCIFuncArr.indexOf(~~data.ctl_di8_config) != -1 && ~~data.ctl_di8_config == ~~data.ctl_di9_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCIFuncArr.indexOf(~~data.ctl_di10_config) != -1 && ~~data.ctl_di10_config == ~~data.ctl_di11_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCIFuncArr.indexOf(~~data.ctl_di12_config) != -1 && ~~data.ctl_di12_config == ~~data.ctl_di13_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCIFuncArr.indexOf(~~data.ctl_di14_config) != -1 && ~~data.ctl_di14_config == ~~data.ctl_di15_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCOFuncArr.indexOf(~~data.ctl_do8_config) != -1 && ~~data.ctl_do8_config == ~~data.ctl_do9_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCOFuncArr.indexOf(~~data.ctl_do10_config) != -1 && ~~data.ctl_do10_config == ~~data.ctl_do11_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCOFuncArr.indexOf(~~data.ctl_do12_config) != -1 && ~~data.ctl_do12_config == ~~data.ctl_do13_config) {
                    isSafetyFunc = 1;
                }
                if (g_safetyCOFuncArr.indexOf(~~data.ctl_do14_config) != -1 && ~~data.ctl_do14_config == ~~data.ctl_do15_config) {
                    isSafetyFunc = 1;
                }

                //获取焊接功能I/O配置参数
                for(let i=8; i<16; i++) {
                    if (~~data[`ctl_di${i}_config`] == 1) {
                        $scope.selectedWeldDI1 = $scope.diOptionsDict[i-7];
                    } else if (~~data[`ctl_di${i}_config`] == 2) {
                        $scope.selectedWeldDI0 = $scope.diOptionsDict[i-7];
                    } else if (~~data[`ctl_di${i}_config`] == 25) {
                        $scope.selectedWeldDI2 = $scope.diOptionsDict[i-7];
                    } else if (~~data[`ctl_di${i}_config`] == 26) {
                        $scope.selectedWeldDI3 = $scope.diOptionsDict[i-7];
                    } 

                    if (~~data[`ctl_do${i}_config`] == 6) {
                        $scope.selectedWeldDO0 = $scope.doOptionsDict[i-7];
                    } else if (~~data[`ctl_do${i}_config`] == 5) {
                        $scope.selectedWeldDO1 = $scope.doOptionsDict[i-7];
                    } else if (~~data[`ctl_do${i}_config`] == 7) {
                        $scope.selectedWeldDO2 = $scope.doOptionsDict[i-7];
                    } else if (~~data[`ctl_do${i}_config`] == 8) {
                        $scope.selectedWeldDO3 = $scope.doOptionsDict[i-7];
                    }
                }
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[1]);
            });
    }
    

    //配置DO后，同步DO配置信息
    document.getElementById('peripheral').addEventListener('324', e => {
        getDOcfg();
    });

    //检查是否配置喷涂DO
    function checkspray() {
        for (let i = 0; i < 8; i++) {
            if (3 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }

    //检查是否配置清枪DO
    function checkclean() {
        for (let i = 0; i < 8; i++) {
            if (4 == $scope.DOcfgArr[i]) {
                return 1;
            }
        }
        return 0;
    }

    //一键配置喷涂DO功能函数
    $scope.sprayQuickSet = function () {
        if (!isSafetyFunc) {
            let clearDiCfgCmd = {
                cmd: 323,
                data: {
                    content: "SetDIConfig(0,0,0,0,0,0,0,0)",
                },
            };
            dataFactory.setData(clearDiCfgCmd)
                .then(() => {
                    let sprayQuickCmd = {
                        cmd: 324,
                        data: {
                            content: "SetDOConfig(1,2,3,4,0,0,0,0)",
                        },
                    };
                    dataFactory.setData(sprayQuickCmd)
                        .then(() => {
                            syncUpdateRobotIOAlias('spray');
                        }, (status) => {
                            toastFactory.error(status);
                        });
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.error('403', pesDynamicTags.error_messages[29]);
        }
    }

    //开始喷涂功能函数
    $scope.startSpray = function () {
        if (1 != checkspray()) {
            toastFactory.info(pesDynamicTags.info_messages[0]);
        } else {
            let startSprayCmd = {
                cmd: 236,
                data: {
                    "content": "SprayStart()",
                },
            };
            dataFactory.setData(startSprayCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //停止喷涂功能函数
    $scope.stopSpray = function () {
        if (1 != checkspray()) {
            toastFactory.info(pesDynamicTags.info_messages[0]);
        } else {
            let stopSprayCmd = {
                cmd: 237,
                data: {
                    "content": "SprayStop()",
                },
            };
            dataFactory.setData(stopSprayCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //开始清枪功能函数
    $scope.startClean = function () {
        if (1 != checkclean()) {
            toastFactory.info(pesDynamicTags.info_messages[1]);
        } else {
            let startCleanCmd = {
                cmd: 238,
                data: {
                    "content": "PowerCleanStart()",
                },
            };
            dataFactory.setData(startCleanCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //停止清枪功能函数
    $scope.stopClean = function () {
        if (1 != checkclean()) {
            toastFactory.info(pesDynamicTags.info_messages[1]);
        } else {
            let stopCleanCmd = {
                cmd: 239,
                data: {
                    "content": "PowerCleanStop()",
                },
            };
            dataFactory.setData(stopCleanCmd)
                .then(() => {

                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }



    $("#enterLaserSearch").click(function () {
        $('#LaserCfgModal').modal();
    });



    /**焊机配置模块*/
    /* 控制器I/O：一键配置焊机控制器I/O功能函数 */
    $scope.quickSetWeave = function (di1,di2,di3,di4,do1,do2,do3,do4) {
        if (!isSafetyFunc) {
            if ($scope.changeWeldDI()) {
                toastFactory.info(pesDynamicTags.info_messages[81]);
                return;
            }
            if ($scope.changeWeldDO()) {
                toastFactory.info(pesDynamicTags.info_messages[82]);
                return;
            }

            let setDIData = [0,0,0,0,0,0,0,0];
            setDIData[$scope.diOptionsDict.findIndex(item => item.id == di1) - 1] = 2;
            setDIData[$scope.diOptionsDict.findIndex(item => item.id == di2) - 1] = 1;
            setDIData[$scope.diOptionsDict.findIndex(item => item.id == di3) - 1] = 25;
            setDIData[$scope.diOptionsDict.findIndex(item => item.id == di4) - 1] = 26;

            let setCmd = {
                cmd: 323,
                data: {
                    content: "SetDIConfig(" + [...setDIData] + ")"
                },
            };
            dataFactory.setData(setCmd)
                .then(() => {
                    let setDOData = [0,0,0,0,0,0,0,0];
                    setDOData[$scope.doOptionsDict.findIndex(item => item.id == do1) - 1] = 6;
                    setDOData[$scope.doOptionsDict.findIndex(item => item.id == do2) - 1] = 5;
                    setDOData[$scope.doOptionsDict.findIndex(item => item.id == do3) - 1] = 7;
                    setDOData[$scope.doOptionsDict.findIndex(item => item.id == do4) - 1] = 8;

                    let setCmd = {
                        cmd: 324,
                        data: {
                            content: "SetDOConfig(" + [...setDOData] + ")",
                        },
                    };
                    dataFactory.setData(setCmd)
                        .then(() => {
                            syncUpdateRobotIOAlias('weave');
                        }, (status) => {
                            toastFactory.error(status);
                        });
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.error('403', pesDynamicTags.error_messages[29]);
        }
    }

    /* 获取扩展I/O配置 */
    function getAuxIOCfg() {
        let getRobotCfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getRobotCfgCmd)
            .then((data) => {
                $scope.selectedWeldAuxDI0 = ~~data.ext_num_weldready;
                $scope.selectedWeldAuxDI1 = ~~data.ext_num_arcdone;
                $scope.selectedWeldAuxDI2 = ~~data.ext_num_interruptrecover;
                $scope.selectedWeldAuxDI3 = ~~data.ext_num_interruptexit;
                $scope.selectedWeldAuxDO0 = ~~data.ext_num_arcstart;
                $scope.selectedWeldAuxDO1 = ~~data.ext_num_aircontrol;
                $scope.selectedWeldAuxDO2 = ~~data.ext_num_wireforwardfeed;
                $scope.selectedWeldAuxDO3 = ~~data.ext_num_wirereversefeed;
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[1]);
            });
    }

    /**
     * 改变焊机IO类型
     * @param {string} typeID I/O类型, 0-控制器, 1-扩展
     */
    $scope.changeWeldIOType = (typeID) => {
        if (~~typeID) {
            getAuxIOCfg();
        }
    }

    /**
     * 扩展DI序号判断是否存在相同
     * @returns true-存在相同/false-都不同
     */
    $scope.changeWeldDI = () => {
        let arr = [$scope.selectedWeldDI0, $scope.selectedWeldDI1, $scope.selectedWeldDI2, $scope.selectedWeldDI3];
        let weldSameDIIndexArr = [];
        // 获取所有相同元素的序号
        arr.forEach((el, index) => {
            if (arr.indexOf(el) != index && el.id != -1) {
                weldSameDIIndexArr.push(arr.indexOf(el));
                weldSameDIIndexArr.push(index);
            }
        });
        // 数组去重
        weldSameDIIndexArr = [...(new Set(weldSameDIIndexArr))];
        // 相同DO序号的选择框变红
        for (let i = 0; i < 4; i++) {
            $('#weldDI' + i).removeClass("input-error-status");
        }
        if (weldSameDIIndexArr.length) {
            weldSameDIIndexArr.forEach(el => {
                $('#weldDI' + el).addClass("input-error-status");
            });
            return true;
        } else {
            return false;
        }
    }

    /**
     * 扩展DO序号判断是否存在相同
     * @returns true-存在相同/false-都不同
     */
    $scope.changeWeldDO = () => {
        let arr = [$scope.selectedWeldDO0, $scope.selectedWeldDO1, $scope.selectedWeldDO2, $scope.selectedWeldDO3];
        let weldSameDOIndexArr = [];
        // 获取所有相同元素的序号
        arr.forEach((el, index) => {
            if (arr.indexOf(el) != index && el.id != -1) {
                weldSameDOIndexArr.push(arr.indexOf(el));
                weldSameDOIndexArr.push(index);
            }
        });
        // 数组去重
        weldSameDOIndexArr = [...(new Set(weldSameDOIndexArr))];
        // 相同DO序号的选择框变红
        for (let i = 0; i < 4; i++) {
            $('#weldDO' + i).removeClass("input-error-status");
        }
        if (weldSameDOIndexArr.length) {
            weldSameDOIndexArr.forEach(el => {
                $('#weldDO' + el).addClass("input-error-status");
            });
            return true;
        } else {
            return false;
        }
    }

    /**
     * 扩展DI序号判断是否存在相同
     * @returns true-存在相同/false-都不同
     */
    $scope.changeAuxDI = () => {
        let arr = [$scope.selectedWeldAuxDI0, $scope.selectedWeldAuxDI1, $scope.selectedWeldAuxDI2, $scope.selectedWeldAuxDI3];
        let weldSameAuxDIIndexArr = [];
        // 获取所有相同元素的序号
        arr.forEach((el, index) => {
            if (arr.indexOf(el) != index && el != -1) {
                weldSameAuxDIIndexArr.push(arr.indexOf(el));
                weldSameAuxDIIndexArr.push(index);
            }
        });
        // 数组去重
        weldSameAuxDIIndexArr = [...(new Set(weldSameAuxDIIndexArr))];
        // 相同DO序号的选择框变红
        for (let i = 0; i < 4; i++) {
            $('#weldAuxDI' + i).removeClass("input-error-status");
        }
        if (weldSameAuxDIIndexArr.length) {
            weldSameAuxDIIndexArr.forEach(el => {
                $('#weldAuxDI' + el).addClass("input-error-status");
            });
            return true;
        } else {
            return false;
        }
    }

    /**
     * 扩展DO序号判断是否存在相同
     * @returns true-存在相同/false-都不同
     */
    $scope.changeAuxDO = () => {
        let arr = [$scope.selectedWeldAuxDO0, $scope.selectedWeldAuxDO1, $scope.selectedWeldAuxDO2, $scope.selectedWeldAuxDO3];
        let weldSameAuxDOIndexArr = [];
        // 获取所有相同元素的序号
        arr.forEach((el, index) => {
            if (arr.indexOf(el) != index) {
                weldSameAuxDOIndexArr.push(arr.indexOf(el));
                weldSameAuxDOIndexArr.push(index);
            }
        });
        // 数组去重
        weldSameAuxDOIndexArr = [...(new Set(weldSameAuxDOIndexArr))];
        // 相同DO序号的选择框变红
        for (let i = 0; i < 4; i++) {
            $('#weldAuxDO' + i).removeClass("input-error-status");
        }
        if (weldSameAuxDOIndexArr.length) {
            weldSameAuxDOIndexArr.forEach(el => {
                $('#weldAuxDO' + el).addClass("input-error-status");
            });
            return true;
        } else {
            return false;
        }
    }

    /* 设置焊机扩展I/O配置 */
    $scope.setWeldAuxIOConfig = () => {
        if ($scope.changeAuxDI()) {
            toastFactory.info(pesDynamicTags.info_messages[81]);
            return;
        }
        if ($scope.changeAuxDO()) {
            toastFactory.info(pesDynamicTags.info_messages[82]);
            return;
        }
        let setAuxIOCmdArr = [
            {
                cmd: 778,
                data: {
                    content: `SetWeldReadyExtDiNum(${$scope.selectedWeldAuxDI0})`
                }
            },
            {
                cmd: 777,
                data: {
                    content: `SetArcDoneExtDiNum(${$scope.selectedWeldAuxDI1})`
                }
            },
            {
                cmd: 909,
                data: {
                    content: `SetExtDIWeldBreakOffRecover(${$scope.selectedWeldAuxDI2},${$scope.selectedWeldAuxDI3})`
                }
            },
            {
                cmd: 774,
                data: {
                    content: `SetArcStartExtDoNum(${$scope.selectedWeldAuxDO0})`
                }
            },
            {
                cmd: 773,
                data: {
                    content: `SetAirControlExtDoNum(${$scope.selectedWeldAuxDO1})`
                }
            },
            {
                cmd: 776,
                data: {
                    content: `SetWireForwardFeedExtDoNum(${$scope.selectedWeldAuxDO2})`
                }
            },
            {
                cmd: 775,
                data: {
                    content: `SetWireReverseFeedExtDoNum(${$scope.selectedWeldAuxDO3})`
                }
            }
        ]
        let errorFlg = 0;
        setAuxIOCmdArr.forEach((el, index) => {
            dataFactory.setData(el)
                .then(() => {
                    if (index == 6 && !errorFlg) {
                        toastFactory.success(pesDynamicTags.success_messages[0]);
                    }
                }, (status) => {
                    errorFlg = 1;
                    toastFactory.error(status);
                })
        });
    }

    /* 检查是否配置起弧DO */
    function checkarc() {
        if ($scope.selectedWeldIOType.id == '0') {
            for (let i = 0; i < 8; i++) {
                if (6 == $scope.DOcfgArr[i]) {
                    return 1;
                }
            }
        } else {
            if ($scope.selectedWeldAuxDO0 != null || $scope.selectedWeldAuxDO0 != undefined) {
                return 1;
            }
        }
        return 0;
    }

    /* 检查是否配置送气DO */
    function checkair() {
        if ($scope.selectedWeldIOType.id == '0') {
            for (let i = 0; i < 8; i++) {
                if (5 == $scope.DOcfgArr[i]) {
                    return 1;
                }
            }
        } else {
            if ($scope.selectedWeldAuxDO1 != null || $scope.selectedWeldAuxDO1 != undefined) {
                return 1;
            }
        }
        return 0;
    }

    /* 检查是否配置正向送丝DO */
    function checkfoward() {
        if ($scope.selectedWeldIOType.id == '0') {
            for (let i = 0; i < 8; i++) {
                if (7 == $scope.DOcfgArr[i]) {
                    return 1;
                }
            }
        } else {
            if ($scope.selectedWeldAuxDO2 != null || $scope.selectedWeldAuxDO2 != undefined) {
                return 1;
            }
        }
        return 0;
    }

    /* 检查是否配置反向送丝DO */
    function checkopposite() {
        if ($scope.selectedWeldIOType.id == '0') {
            for (let i = 0; i < 8; i++) {
                if (8 == $scope.DOcfgArr[i]) {
                    return 1;
                }
            }
        } else {
            if ($scope.selectedWeldAuxDO3 != null || $scope.selectedWeldAuxDO3 != undefined) {
                return 1;
            }
        }
        return 0;
    }

    /**
     * 设置焊接工艺参数
     * @param {int} id 焊接工艺编号
     * @param {float} startCurrent 起弧电流(A)
     * @param {float} startVoltage 起弧电压(V)
     * @param {float} startTime 起弧时间(ms)
     * @param {float} weldCurrent 焊接电流(A)        
     * @param {float} weldVoltage 焊接电压(V)
     * @param {float} endCurrent 收弧电流(A)
     * @param {float} endVoltage 收弧电压(V)
     * @param {float} endTime 收弧时间(ms)
     */
    $scope.setWeldingProcessParam = function(id,startCurrent,startVoltage,startTime,weldCurrent,weldVoltage,endCurrent,endVoltage,endTime) {
        if (!startCurrent || !startVoltage || !startTime || !weldCurrent || !weldVoltage || !endCurrent || !endVoltage || !endTime) {
            toastFactory.info(pesDynamicTags.info_messages[90]);
            return;
        }
        let setCmd = {
            cmd: 967,
            data: {
                content: "WeldingSetProcessParam(" + id + "," + startCurrent + "," + startVoltage + "," + startTime + "," + weldCurrent + "," + weldVoltage + "," + endCurrent + "," + endVoltage + "," + endTime + ")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 获取焊接工艺参数
     * @param {int} id 焊接工艺编号
     */
    let weldProcessId;
    $scope.getWeldingProcessParam = function(id) {
        weldProcessId = id;

        let setCmd = {
            cmd: 968,
            data: {
                content: "WeldingGetProcessParam(" + id + ")"
            },
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('peripheral').addEventListener('968', e => {
        let weldProcessParam = e.detail.split(',');
        if (weldProcessId == 0) {
            $scope.processStartCurrent = "--";
            $scope.processStartVoltage = "--";
            $scope.processStartTime = "--";
            $scope.processWeldCurrent = "--";
            $scope.processWeldVoltage = "--";
            $scope.processEndCurrent = "--";
            $scope.processEndVoltage = "--";
            $scope.processEndTime = "--";
        } else {
            $scope.processStartCurrent = (~~weldProcessParam[0]).toString();
            $scope.processStartVoltage = (~~weldProcessParam[1]).toString();
            $scope.processStartTime = (~~weldProcessParam[2]).toString();
            $scope.processWeldCurrent = (~~weldProcessParam[3]).toString();
            $scope.processWeldVoltage = (~~weldProcessParam[4]).toString();
            $scope.processEndCurrent = (~~weldProcessParam[5]).toString();
            $scope.processEndVoltage = (~~weldProcessParam[6]).toString();
            $scope.processEndTime = (~~weldProcessParam[7]).toString();
        }
    })

    /* 起弧 */
    $scope.arcStart = function () {
        setPerSessionStorage();
        if ($scope.weldTime == "" || $scope.weldTime == null || $scope.weldTime == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[3]);
        } else if (1 != checkarc()) {
            toastFactory.info(pesDynamicTags.info_messages[4]);
        } else {
            var arcstartString = "ARCStart(" + $scope.selectedWeldIOType.id + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")";
            let arcstartCmd = {
                cmd: 247,
                data: {
                    content: arcstartString,
                },
            };
            dataFactory.setData(arcstartCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 收弧 */
    $scope.arcEnd = function () {
        setPerSessionStorage();
        if (1 != checkarc()) {
            toastFactory.info(pesDynamicTags.info_messages[4]);
        } else {
            var arcendString = "ARCEnd(" + $scope.selectedWeldIOType.id + "," + $scope.selectedWeldId + "," + $scope.weldTime + ")";
            let arcendCmd = {
                cmd: 248,
                data: {
                    content: arcendString,
                },
            };
            dataFactory.setData(arcendCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 送气 */
    $scope.aspirated = function () {
        if (1 != checkair()) {
            toastFactory.info(pesDynamicTags.info_messages[5]);
        } else {
            let airCmd = {
                cmd: 270,
                data: {
                    content: "SetAspirated(" + $scope.selectedWeldIOType.id + "," + "1)",
                },
            };
            dataFactory.setData(airCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 关气 */
    $scope.colsehale = function () {
        if (1 != checkair()) {
            toastFactory.info(pesDynamicTags.info_messages[5]);
        } else {
            let closeairCmd = {
                cmd: 270,
                data: {
                    content: "SetAspirated(" + $scope.selectedWeldIOType.id + "," + "0)",
                },
            };
            dataFactory.setData(closeairCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 正向送丝 */
    $scope.fowardWireFeed = function () {
        if (1 != checkfoward()) {
            toastFactory.info(pesDynamicTags.info_messages[6]);
        } else {
            let fowardWireCmd = {
                cmd: 268,
                data: {
                    content: "SetForwardWireFeed(" + $scope.selectedWeldIOType.id + "," + "1)",
                },
            };
            dataFactory.setData(fowardWireCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 停止正向送丝 */
    $scope.stopfowardWireFeed = function () {
        if (1 != checkfoward()) {
            toastFactory.info(pesDynamicTags.info_messages[6]);
        } else {
            let stopfowardWireCmd = {
                cmd: 268,
                data: {
                    content: "SetForwardWireFeed(" + $scope.selectedWeldIOType.id + "," + "0)",
                },
            };
            dataFactory.setData(stopfowardWireCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 反向送丝 */
    $scope.oppositeWireFeed = function () {
        if (1 != checkopposite()) {
            toastFactory.info(pesDynamicTags.info_messages[7]);
        } else {
            let oppositeWireCmd = {
                cmd: 269,
                data: {
                    content: "SetReverseWireFeed(" + $scope.selectedWeldIOType.id + "," + "1)",
                },
            };
            dataFactory.setData(oppositeWireCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 停止反向送丝 */
    $scope.stopoppositeWireFeed = function () {
        if (1 != checkopposite()) {
            toastFactory.info(pesDynamicTags.info_messages[8]);
        } else {
            let stopoppositeWireCmd = {
                cmd: 269,
                data: {
                    content: "SetReverseWireFeed(" + $scope.selectedWeldIOType.id + "," + "0)",
                },
            };
            dataFactory.setData(stopoppositeWireCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //焊接电流/电压与输出关系变量
    $scope.clickItemTitle = 0; // 0 A-V , 1 V-V
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

    //获取焊接电流与输出模拟量对应关系
    function getWeldingCurrentRelation() {
        let weldingCurrentCmd = {
            cmd: 829,
            data: {
                content: "WeldingGetCurrentRelation()"
            }
        };
        dataFactory.setData(weldingCurrentCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('peripheral').addEventListener('829', e => {
        let  weldingCurrentData = e.detail.split(',');
        $scope.currentMin = parseFloat(weldingCurrentData[0]).toFixed(3);
        $scope.currentMax = parseFloat(weldingCurrentData[1]).toFixed(3);
        $scope.outputeMin = parseFloat(weldingCurrentData[2]).toFixed(3);
        $scope.outputeMax = parseFloat(weldingCurrentData[3]).toFixed(3);
        $scope.selectedCurrentAOPort = $scope.AOSinglePort[~~weldingCurrentData[4]];
    })

    //获取焊接电压与输出模拟量对应关系
    function getWeldingVoltageRelation() {
        let weldingVoltageCmd = {
            cmd: 830,
            data: {
                content: "WeldingGetVoltageRelation()"
            }
        };
        dataFactory.setData(weldingVoltageCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('peripheral').addEventListener('830', e => {
        let  weldingVoltageData = e.detail.split(',');
        $scope.weldVoltageMin = parseFloat(weldingVoltageData[0]).toFixed(3);
        $scope.weldVoltageMax = parseFloat(weldingVoltageData[1]).toFixed(3);
        $scope.outputVoltageMin = parseFloat(weldingVoltageData[2]).toFixed(3);
        $scope.outputVoltageMax = parseFloat(weldingVoltageData[3]).toFixed(3);
        $scope.selectedVoltageAOPort = $scope.AOSinglePort[~~weldingVoltageData[4]];
    })

    /**
     * 设置焊接电流与输出模拟量对应关系
     * @param {float} currentMin 左侧点焊接电流值(A)
     * @param {float} currentMax 右侧点焊接电流值(A)
     * @param {float} outputeMin 左侧点输出模拟量电压值(V)
     * @param {float} outputeMax 右侧点输出模拟量电压值(V)
     * @param {int} port 焊接电流控制箱模拟输出端口
     */
    $scope.setWeldingCurrentRelation = function(currentMin,currentMax,outputeMin,outputeMax,port) {
        if (!currentMin || !currentMax || !outputeMin || !outputeMax || !port) {
            toastFactory.info(pesDynamicTags.info_messages[91]);
            return;
        }
        let weaveSetParaCmd = {
            cmd: 827,
            data: {
                content: "WeldingSetCurrentRelation(" + currentMin + ',' + currentMax + ',' + outputeMin + ',' + outputeMax + "," + port + ")"
            },
        };
        dataFactory.setData(weaveSetParaCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('peripheral').addEventListener('827', () => {
        getWeldingCurrentRelation();
    })

    /**
     * 设置焊接电压与输出模拟量对应关系
     * @param {float} weldVoltageMin 左侧点焊接电压值(V)
     * @param {float} weldVoltageMax 右侧点焊接电压值(V)
     * @param {float} outputVoltageMin 左侧点输出模拟量电压值(V)
     * @param {float} outputVoltageMax 右侧点输出模拟量电压值(V)
     * @param {int} port 焊接电压控制箱模拟输出端口
     */
    $scope.setWeldingVoltageRelation = function(weldVoltageMin,weldVoltageMax,outputVoltageMin,outputVoltageMax,port) {
        if (!weldVoltageMin || !weldVoltageMax || !outputVoltageMin || !outputVoltageMax || !port) {
            toastFactory.info(pesDynamicTags.info_messages[91]);
            return;
        }
        let WeldingVoltageRelationCmd = {
            cmd: 828,
            data: {
                content: "WeldingSetVoltageRelation(" + weldVoltageMin + ',' + weldVoltageMax + ',' + outputVoltageMin + ',' + outputVoltageMax + "," + port + ")",
            },
        };
        dataFactory.setData(WeldingVoltageRelationCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('peripheral').addEventListener('828', () => {
        getWeldingVoltageRelation();
    })
    /* ./焊机配置模块 */

    /**焊接中断模块 */
    /**
     * 电弧中断检测参数配置
     * @param {int} checkEnable 检测使能
     * @param {int} arcInterruptTimeLength 确认时长ms
     */
    $scope.setWeldingCheckArcInterruptionParam = function(checkEnable, arcInterruptTimeLength) {
        if (!arcInterruptTimeLength) {
            toastFactory.info(pesDynamicTags.info_messages[55]);
            return;
        }
        let setweldingCheckArcCmd = {
            cmd: 802,
            data: {
                content: "WeldingSetCheckArcInterruptionParam(" + checkEnable + "," + arcInterruptTimeLength + ")"
            }
        };
        dataFactory.setData(setweldingCheckArcCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**电弧中断检测参数获取*/
    function getWeldingCheckArcInterruptionParam() {
        let getweldingCheckArcCmd = {
            cmd: 803,
            data: {
                content: "WeldingGetCheckArcInterruptionParam()"
            }
        };
        dataFactory.setData(getweldingCheckArcCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('peripheral').addEventListener('803', e => {
        let weldingInterruptionParam = JSON.parse(e.detail);
        $scope.selectEnableDetect = weldingInterruptionParam.enable;
        $scope.confirmTimeLength = weldingInterruptionParam.time;
    })

    /**
     * 焊接中断再恢复参数配置
     * @param {int} reWeldEnable 
     * @param {float} backLength 重叠距离mm
     * @param {float} backVelocity 从当前位置返回再起弧点速度%
     * @param {int} backMoveType 从当前位置返回再起弧点运动方式 0-PTP 1-Lin
     * @returns 
     */
    $scope.setWeldingReWeldAfterBreakOffParam = function(reWeldEnable, backLength, backVelocity, backMoveType ) {
        if (!backLength) {
            toastFactory.info(pesDynamicTags.info_messages[56]);
            return;
        }
        if (!backVelocity) {
            toastFactory.info(pesDynamicTags.info_messages[57]);
            return;
        }
        if (!backMoveType) {
            toastFactory.info(pesDynamicTags.info_messages[58]);
            return;
        }
        let setWeldAfterBreakCmd = {
            cmd: 804,
            data: {
                content: "WeldingSetReWeldAfterBreakOffParam(" + reWeldEnable + "," + backLength + "," + backVelocity + "," + backMoveType + ")"
            }
        };
        dataFactory.setData(setWeldAfterBreakCmd)
            .then(() => {
                document.dispatchEvent(new CustomEvent('getReweld', { bubbles: true, cancelable: true, composed: true }));
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**焊接中断再恢复参数获取*/
    function getWeldingReWeldAfterBreakOffParam() {
        let getWeldAfterBreakCmd = {
            cmd: 805,
            data: {
                content: "WeldingGetReWeldAfterBreakOffParam()"
            }
        };
        dataFactory.setData(getWeldAfterBreakCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('peripheral').addEventListener('805', e => {
        let reWeldAfterBreakParam = JSON.parse(e.detail);
        $scope.selectEnableRefresh = reWeldAfterBreakParam.enable;
        $scope.refreshBreakLength = reWeldAfterBreakParam.length.toString();
        $scope.refreshBreakSpeed = reWeldAfterBreakParam.velocity.toString();
        $scope.refreshBreakMotionWay = $scope.MotionWayData[reWeldAfterBreakParam.movetype];
    })

    /* ./焊接中断模块 */

    /*跟踪传感器模块*/

    //获取传感器通信配置信息
    function getLaserInfo() {
        var getLaserConfig = "GetLaserSensorConfigInfo()";
        let getLaserConfigCmd = {
            cmd: 283,
            data: {
                content: getLaserConfig,
            },
        };
        dataFactory.setData(getLaserConfigCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[2]);
            });
    };

    document.getElementById('peripheral').addEventListener('283', e => {
        var LTconfig = JSON.parse(e.detail);
        $scope.LaserIP = LTconfig.ip;
        $scope.LaserPort = LTconfig.port;
        $scope.SamplePer = LTconfig.period;
        $scope.selectedProtocol = $scope.protocolData[~~LTconfig.protocol_id - 101];
        $scope.selectedLaserSensorCoord = $scope.LaserSensorCoordData[~~LTconfig.coord];
        $scope.changeLaserProtocol();
    })

    //设定传感器最大插值
    $scope.setLTMaxDiff = function () {
        if (null == $scope.LTMaxDiff) {
            toastFactory.info(pesDynamicTags.info_messages[8]);
        } else {
            var SetLTMaxDiffString = "LaserTrackMaxDiffSet(" + $scope.LTMaxDiff + ")";
            let SetLTMaxDiffCmd = {
                cmd: 279,
                data: {
                    content: SetLTMaxDiffString,
                },
            };
            dataFactory.setData(SetLTMaxDiffCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //设定传感器数据处理
    $scope.setLaserDataUsage = function () {
        let SetLaserSensorUsageCmd = {
            cmd: 422,
            data: {
                content: "SetLaserSensorUsage(" + $scope.selectedLaserDataUsage.id + ")",
            },
        };
        dataFactory.setData(SetLaserSensorUsageCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //设定传感器灵敏度系数
    $scope.setSeamTrackingSetSensitivity = function () {
        if (null == $scope.LTSensitiveX || null == $scope.LTSensitiveY || null == $scope.LTSensitiveZ) {
            toastFactory.info(pesDynamicTags.info_messages[9]);
        } else {
            var setSeamTrackingSetSensitivityString = "SeamTrackingSetSensitivity(" + $scope.LTSensitiveX + ","+ $scope.LTSensitiveY + ","+ $scope.LTSensitiveZ + ")";
            let setSeamTrackingSetSensitivityCmd = {
                cmd: 636,
                data: {
                    content: setSeamTrackingSetSensitivityString,
                },
            };
            dataFactory.setData(setSeamTrackingSetSensitivityCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //配置传感器IP
    $scope.setLaserIPCfg = function () {
        if (null == $scope.LaserIP || null == $scope.LaserPort) {
            toastFactory.info(pesDynamicTags.info_messages[11]);
        } else {
            var laserIPCfgString = "LaserTrackingSensorIPConfig(" + "\"" + $scope.LaserIP + "\"," + $scope.LaserPort + ")";
            let laserIPCfgCmd = {
                cmd: 264,
                data: {
                    content: laserIPCfgString,
                },
            };
            dataFactory.setData(laserIPCfgCmd)
                .then(() => {
                    getLaserInfo();
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //设置采样周期
    $scope.setSamplePer = function () {
        if (null === $scope.SamplePer || undefined === $scope.SamplePer) {
            toastFactory.info(pesDynamicTags.info_messages[12]);
        } else {
            var samplePeriodString = "SetLTSensorSamplePeriod(" + $scope.SamplePer + ")";
            let setSamplePeriodCmd = {
                cmd: 267,
                data: {
                    content: samplePeriodString,
                },
            };
            dataFactory.setData(setSamplePeriodCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    //选择传感器
    $scope.changeLaserProtocol = function(){
        if($scope.selectedProtocol.id == "102"){
            $scope.show_ruiniu_coord = false;
        }else{
            $scope.show_ruiniu_coord = true;
        }
    }

    //加载通信协议
    $scope.loadProtocol = function () {
        if($scope.selectedProtocol.id == "102"){
            var setLaserSensorCoordString = "SetLaserSensorCoord(1)";
            let setLaserSensorCoordCmd = {
                cmd: 666,
                data: {
                    content: setLaserSensorCoordString,
                },
            };
            dataFactory.setData(setLaserSensorCoordCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }
        //sleep(500);
        var loadSDriverString = "LoadPosSensorDriver(" + $scope.selectedProtocol.id + ")";
        let loadSDriverCmd = {
            cmd: 265,
            data: {
                content: loadSDriverString,
            },
        };
        dataFactory.setData(loadSDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //卸载通信协议
    $scope.loadOffProtocol = function () {
        var unloadSDriverString = "UnloadPosSensorDriver()";
        let unloadSDriverCmd = {
            cmd: 266,
            data: {
                content: unloadSDriverString,
            },
        };
        dataFactory.setData(unloadSDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //设置传感器坐标系
    $scope.setLaserSensorCoord = function () {
        var setLaserSensorCoordString = "SetLaserSensorCoord(" + $scope.selectedLaserSensorCoord.id + ")";
        let setLaserSensorCoordCmd = {
            cmd: 666,
            data: {
                content: setLaserSensorCoordString,
            },
        };
        dataFactory.setData(setLaserSensorCoordCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    
    //读取传感器相关配置文件初始化页面内容
    function getLaserSensorcfg() {
        let getLaserSensorcfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getLaserSensorcfgCmd)
            .then((data) => {
                $scope.selectedLaserLocation = $scope.LaserLocationData[~~data.possensor_install];
                $scope.LTMaxDiff = ~~data.possensor_maxdiff;
                $scope.LTSensitiveX = parseFloat(data.possensor_sensitive_x).toFixed(3);
                $scope.LTSensitiveY = parseFloat(data.possensor_sensitive_y).toFixed(3);
                $scope.LTSensitiveZ = parseFloat(data.possensor_sensitive_z).toFixed(3);
                $scope.selectedLaserDataUsage = $scope.LaserDataUsage[~~data.possensor_datausage];
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[3]);
            });
    }

    //打开传感器
    $scope.lkLaserOn = function () {
        let lkLaserOnCmd = {
            cmd: 255,
            data: {
                content: "LTLaserOn(0)",
            },
        };
        dataFactory.setData(lkLaserOnCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //关闭传感器
    $scope.lkLaserOff = function () {
        let lkLaserOffCmd = {
            cmd: 256,
            data: {
                content: "LTLaserOff()",
            },
        };
        dataFactory.setData(lkLaserOffCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //传感器标定点
    $scope.setLaserOffsetPoint = function (index) {
        if (index == 1) {
            let setLaserOffsetPointCmd = {
                cmd: 387,
                data: {
                    content: "SetLaserOffsetPoint(" + index + "," + $scope.per_selectedSensorCoorde.id + "," + $scope.per_selectedSensorCoorde.installation_site + "," + $scope.per_selectedSensorCoorde.x + "," + $scope.per_selectedSensorCoorde.y + "," +
                        $scope.per_selectedSensorCoorde.z + "," + $scope.per_selectedSensorCoorde.rx + "," + $scope.per_selectedSensorCoorde.ry + "," + $scope.per_selectedSensorCoorde.rz + ")",
                },
            };
            dataFactory.setData(setLaserOffsetPointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            let setLaserOffsetPointCmd = {
                cmd: 387,
                data: {
                    content: "SetLaserOffsetPoint(" + index + ",0,0,0,0,0,0,0,0)",
                },
            };
            dataFactory.setData(setLaserOffsetPointCmd)
                .then(() => {
                }, (status) => {
                    toastFactory.error(status);
                });
        }


    }

    //计算传感器点偏移量
    $scope.computeLaserOffset = function () {
        let computeLaserOffsetCmd = {
            cmd: 386,
            data: {
                content: "ComputeLaserOffset()",
            },
        };
        dataFactory.setData(computeLaserOffsetCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //计算出的结果保留三位小数

    document.getElementById('peripheral').addEventListener('386', e => {
        var tempjson = JSON.parse(e.detail);
        let temparr = Object.keys(tempjson);
        var templength = temparr.length;
        for (let i = 0; i < templength; i++) {
            if ((tempjson[temparr[i]] == "nan") || (tempjson[temparr[i]] == "-nan")) {
                tempjson[temparr[i]] = 0.000;
            } else {
                tempjson[temparr[i]] = parseFloat(tempjson[temparr[i]]).toFixed(3);
            }
        }
        $scope.Benchmark = JSON.parse(JSON.stringify(tempjson));
    })

    //坐标系数据保留三位小数
    function per_Screen_Sensor(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].type == 0) {
                data.splice(i, 1);
                i = i - 1;
            } else {
                let valuearr = Object.keys(data[i]);
                var valuelength = valuearr.length;
                for (let j = 2; j < valuelength - 2; j++) {
                    data[i][valuearr[j]] = parseFloat(data[i][valuearr[j]]).toFixed(3);
                }
            }
        }
    }
    
    /**获取寻位示教点数据 */
    function getOptionsData() {
        let getCmd = {
            cmd: "get_points",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.searchPointsData = data;
            }, (status) => {
                toastFactory.error(status);
            });
    };

    /**
     * 给定三点（一线一点）计算其垂直交点
     * @param {array} p1 点位1
     * @param {array} p2 点位2
     * @param {array} p3 点位3
     */
    let referencePointData;//参考点点位关节
    $scope.setIntersectionThrough3Point = function(p1,p2,p3) {
        if (!p1 || !p2 || !p3) {
            toastFactory.info(pesDynamicTags.info_messages[84]);
            return;
        }
        referencePointData = p3;

        let setCmd = {
            cmd: 928,
            data: {
                content: "GetIntersectionThrough3Point({" 
                + p1.x + "," + p1.y + "," + p1.z + "," + p1.rx + "," + p1.ry + "," + p1.rz + "},{" 
                + p2.x + "," + p2.y + "," + p2.z + "," + p2.rx + "," + p2.ry + "," + p2.rz + "},{" 
                + p3.x + "," + p3.y + "," + p3.z + "," + p3.rx + "," + p3.ry + "," + p3.rz + "})"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    document.getElementById('peripheral').addEventListener('928', e => {
        $scope.crossPointData = e.detail.split(",");
        computeDescartesJoint(referencePointData,$scope.crossPointData);
    })
    
    /**
     * 给定四点（两线）计算其交点
     * @param {array} p1 点位1
     * @param {array} p2 点位2
     * @param {array} p3 点位3
     * @param {array} p4 点位4
     */
    $scope.setIntersectionThrough4Point = function(p1,p2,p3,p4) {
        if (!p1 || !p2 || !p3 || !p4) {
            toastFactory.info(pesDynamicTags.info_messages[84]);
            return;
        }
        referencePointData = p4;

        let setCmd = {
            cmd: 929,
            data: {
                content: "GetIntersectionThrough4Point({" 
                + p1.x + "," + p1.y + "," + p1.z + "," + p1.rx + "," + p1.ry + "," + p1.rz + "},{" 
                + p2.x + "," + p2.y + "," + p2.z + "," + p2.rx + "," + p2.ry + "," + p2.rz + "},{" 
                + p3.x + "," + p3.y + "," + p3.z + "," + p3.rx + "," + p3.ry + "," + p3.rz + "},{" 
                + p4.x + "," + p4.y + "," + p4.z + "," + p4.rx + "," + p4.ry + "," + p4.rz + "})"
            }
        };
        dataFactory.setData(setCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('peripheral').addEventListener('929', e => {
        $scope.crossPointData = e.detail.split(",");
        computeDescartesJoint(referencePointData,$scope.crossPointData);
    })

    /**
     * 笛卡尔计算关节
     * @param {data} reference 参考点点位关节数据
     * @param {data} crossPoint 交点笛卡尔坐标
     */
    function computeDescartesJoint(reference,crossPoint) {
        let clacJointCmd = {
            cmd: 325,
            data: {
                content: "TCFToJoint(" + reference.j1 + "," + reference.j2 + "," + reference.j3 + "," + reference.j4
                    + "," + reference.j5 + "," + reference.j6 + "," + crossPoint[0] + "," + crossPoint[1]
                    + "," + crossPoint[2] + "," + crossPoint[3] + "," + crossPoint[4]
                    + "," + crossPoint[5] + "," + $scope.currentCoord + "," + $scope.currentWobjCoord + "," + $scope.exAxisPos[0]
                    + "," + $scope.exAxisPos[1] + "," + $scope.exAxisPos[2] + "," + $scope.exAxisPos[3] + ")",
            }
        }
        dataFactory.setData(clacJointCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);   
            })
    }

    let crossPointContent;//保存交点点位数据
    document.addEventListener('325', e => {
        let crossDescartesJoint = JSON.parse(e.detail);
        crossPointContent = {
            "name": "",
            "speed": $scope.velocity,
            "elbow_speed": $scope.velocity,
            "acc": $scope.acceleration,
            "elbow_acc": $scope.acceleration,
            "toolnum": $scope.currentCoord + "",
            "workpiecenum": $scope.currentWobjCoord + "",
            "j1": parseFloat(crossDescartesJoint.j1).toFixed(3),
            "j2": parseFloat(crossDescartesJoint.j2).toFixed(3),
            "j3": parseFloat(crossDescartesJoint.j3).toFixed(3),
            "j4": parseFloat(crossDescartesJoint.j4).toFixed(3),
            "j5": parseFloat(crossDescartesJoint.j5).toFixed(3),
            "j6": parseFloat(crossDescartesJoint.j6).toFixed(3),
            "x": $scope.crossPointData[0],
            "y": $scope.crossPointData[1],
            "z": $scope.crossPointData[2],
            "rx": $scope.crossPointData[3],
            "ry": $scope.crossPointData[4],
            "rz": $scope.crossPointData[5],
            "E1": '0',
            "E2": '0',
            "E3": '0',
            "E4": '0'
        }
    })

    //检查示教点是否已存在
    $scope.checkCrossPoint = function (name) {
        if (!name) {
            toastFactory.info(pesDynamicTags.info_messages[83]);
            return;
        }
        
        let checkPointCmd = {
            cmd: "get_checkpoint",
            data: {
                name: name
            }
        }
        dataFactory.getData(checkPointCmd)
            .then((data) => {
                if (~~data.result) {
                    $('#crossPointModal').modal();
                } else {
                    $scope.saveCrossPoint(name);
                }
            }, (status) => {
                toastFactory.error(status);
            })
    }
    
    /**
     * 保存交点点位坐标
     * @param {string} name 交点名称
     */
    $scope.saveCrossPoint = function(name) {
        crossPointContent.name = name;

        let loadclacTCFCmd = {
            cmd: 'save_point_joint_TCF',
            data: crossPointContent
        }

        //更新示教程序时弹出Loading
        $('#pageLoading').css("display", "block");
        dataFactory.actData(loadclacTCFCmd).then(() => {
            $('#pageLoading').css("display", "none");
            $('#crossPointModal').modal('hide');
            toastFactory.success(pesDynamicTags.success_messages[12]);
        }, (status) => {
            toastFactory.error(status);
        })
    };

    //获取工具坐标系数据
    function getToolCoordData() {
        let getCmd = {
            cmd: "get_tool_cdsystem",
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                per_Screen_Sensor(data);
                $scope.per_SensorCoordeData = JSON.parse(JSON.stringify(data));
                $scope.per_selectedSensorCoorde = $scope.per_SensorCoordeData[0];
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[4]);
            });
    };


    //外部轴选择不同厂商对应参数选择改变
    $scope.changeExAxisCompany = function (num) {
        if (0 == num) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        } else if (1 == num) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisINOVANCEType;
        } else if (2 == num) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisPANASONICType;
        } else {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }
        $scope.selectedEAxisCompanyType = $scope.ExternaAxisCompanyType[0];
    }
    $scope.changeExAxisCompany(0);

    //设定外部轴零点
    $scope.setEAxisZero = function () {
        if ($scope.EAxisRDY[$scope.selectedEAxisCfgID.id - 1] != 1) {
            toastFactory.info(pesDynamicTags.info_messages[13]);
            $('#ConverZeroModal').modal('hide');
            return;
        }
        handleexaxisid($scope.selectedEAxisCfgID.id);
        var SetEAxisZeroString = "ExtAxisSetHoming(" + $scope.exaxisidTrabsfer + "," + $scope.selectedEAxisZeroMode.id + "," + $scope.HomeSearchVel + "," + $scope.HomeLatchVel + ")";
        let SetEAxisZeroCmd = {
            cmd: 290,
            data: {
                content: SetEAxisZeroString,
            },
        };
        dataFactory.setData(SetEAxisZeroCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 处理外部轴零点数据
     * @param {array} zeroData 
     */
    function handleZeroStateData(zeroData) {
        if (zeroData[$scope.selectedEAxisCfgID.id-1] == 0) {
            $scope.zeroStateText = "";
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 1) {
            $scope.zeroStateText = pesDynamicTags.info_messages[36];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 2) {
            $scope.zeroStateText = pesDynamicTags.info_messages[37];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 3) {
            $scope.zeroStateText = pesDynamicTags.info_messages[38];
        } else if (zeroData[$scope.selectedEAxisCfgID.id-1] == 4) {
            $scope.zeroStateText = pesDynamicTags.info_messages[39];
        }
    }

    if (g_zeroStateInit) {
        handleZeroStateData(g_zeroStateInit);
    }
    // 监听外部轴零点数据
    document.getElementById('peripheral').addEventListener('EAxisZero', function (e) {
        handleZeroStateData(e.detail);
    });

    //获取Modbus通信配置
    function getExtAxisGetModbusComParam() {
        let getExtAxisGetModbusComParamCmd = {
            cmd: 657,
            data: {
                content: "ExtDevGetUDPComParam()",
            },
        };
        dataFactory.setData(getExtAxisGetModbusComParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[5]);
            });
    }

    document.getElementById('peripheral').addEventListener('657', e => {
        var ExtAxisModbusconfig = JSON.parse(e.detail);
        $scope.extAxisModbusIP = ExtAxisModbusconfig.ip;
        $scope.extAxisModbusPort = ExtAxisModbusconfig.port;
        $scope.extAxisModbusPeriod = ExtAxisModbusconfig.period;
        $scope.packetLossDetectTime = ExtAxisModbusconfig.losspkgtime;
        $scope.packetLosstimes = ExtAxisModbusconfig.losspkgnum;
        $scope.commuicateInterruptConfirmTime = ExtAxisModbusconfig.disconnecttime;
        $scope.commuicateInterruptAutoReconnect = Number(ExtAxisModbusconfig.reconnectenable);
        $scope.autoReconnectPeriod = ExtAxisModbusconfig.reconnectperiod;
        $scope.autoReconnectTimes = ExtAxisModbusconfig.reconnectnum;
    })

    /**
     * Modbus通信配置
     * @param {string} ip IP地址
     * @param {int} port 端口号
     * @param {int} period 通讯周期
     * @param {int} detectperiod 丢包检测周期
     * @param {int} losstimes 丢包次数
     * @param {int} confirmtime 通讯中断确认时长
     * @param {int} isopen 通讯中断是否自动重连
     * @param {int} reconnectperiod 重连周期
     * @param {int} reconnecttime 重连次数
     */
    $scope.setExtAxisSetModbusComParam = function (ip,port,period,detectperiod,losstimes,confirmtime,isopen,reconnectperiod,reconnecttime) {
        if (!ip) {
            toastFactory.info(pesDynamicTags.info_messages[10]);
            return;
        }
        if (!port) {
            toastFactory.info(pesDynamicTags.info_messages[74]);
            return;
        }
        if (!period) {
            toastFactory.info(pesDynamicTags.info_messages[75]);
            return;
        }
        if (!detectperiod) {
            toastFactory.info(pesDynamicTags.info_messages[76]);
            return;
        }
        if (!losstimes) {
            toastFactory.info(pesDynamicTags.info_messages[77]);
            return;
        }
        if (!confirmtime) {
            toastFactory.info(pesDynamicTags.info_messages[78]);
            return;
        }
        if (isopen == 1 && !reconnectperiod) {
            toastFactory.info(pesDynamicTags.info_messages[79]);
            return;
        }
        if (isopen == 1 && !reconnecttime) {
            toastFactory.info(pesDynamicTags.info_messages[80]);
            return;
        }
        let setExtAxisSetModbusComParamCmd = {
            cmd: 654,
            data: {
                content: "ExtDevSetUDPComParam(\"" + ip + "\","+ port + ","+ period + "," + detectperiod + "," + losstimes + "," + confirmtime + "," + isopen + "," + reconnectperiod + "," + reconnecttime + ")",
            },
        };
        dataFactory.setData(setExtAxisSetModbusComParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[6]);
            });
    }

    //加载Modbus通信
    $scope.setExtAxisLoadModbusTCPDriver = function () {
        let setExtAxisLoadModbusTCPDriverCmd = {
            cmd: 655,
            data: {
                content: "ExtDevLoadUDPDriver()",
            },
        };
        dataFactory.setData(setExtAxisLoadModbusTCPDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[7]);
            });
    }

    //卸载Modbus通信
    $scope.setExtAxisUnloadModbusTCPDriver = function () {
        let setExtAxisUnloadModbusTCPDriverCmd = {
            cmd: 656,
            data: {
                content: "ExtDevUnloadUDPDriver()",
            },
        };
        dataFactory.setData(setExtAxisUnloadModbusTCPDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[8]);
            });
    }

    $scope.GetExaxisDrive = function () {
        handleexaxisid($scope.selectedEAxisCfgID.id);
        let getExaxisDriveCmd = {
            cmd: 393,
            data: {
                content: "GetExAxisDriverConfig(" + $scope.exaxisidTrabsfer + ")",
            },
        };
        dataFactory.setData(getExaxisDriveCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[10]);
            });
    }

    document.getElementById('peripheral').addEventListener('393', function (e) {
        $scope.ExaxisDriveText = "";
        var driverInfo = JSON.parse(e.detail);
        $scope.ExaxisDriveText += $scope.ExternaAxisCompany[driverInfo.company].name;
        if (0 == driverInfo.company) {
            $scope.ExaxisDriveText += $scope.ExternaAxisHCFAType[driverInfo.model].name;
        } else if (1 == driverInfo.company) {
            $scope.ExaxisDriveText += $scope.ExternaAxisINOVANCEType[driverInfo.model].name;
        } else if (2 == driverInfo.company) {
            $scope.ExaxisDriveText += $scope.ExternaAxisPANASONICType[driverInfo.model].name;
        } else {
            $scope.ExaxisDriveText += $scope.ExternaAxisHCFAType[driverInfo.model].name;
        }
        $scope.ExaxisDriveText += $scope.ExternaAxisModel[driverInfo.encType].name;
        toastFactory.success(pesDynamicTags.success_messages[0]);
    });

    function handleexaxisid(index) {
        $scope.exaxisidTrabsfer = 0;
        if (index == 1) {
            $scope.exaxisidTrabsfer = 1;
        } else if (index == 2) {
            $scope.exaxisidTrabsfer = 2;
        } else if (index == 3) {
            $scope.exaxisidTrabsfer = 4;
        } else if (index == 4) {
            $scope.exaxisidTrabsfer = 8;
        }
    }

    //外部轴点动
    $scope.startEAxisJog = function (index) {
        setPerSessionStorage();
        if ($scope.EAxisRDY[$scope.selectedEAxisTestID.id - 1] === 0) {
            toastFactory.info(pesDynamicTags.info_messages[14]);
            return;
        }
        handleexaxisid($scope.selectedEAxisTestID.id);
        var StartEAxisJogString = "ExtAxisStartJog(" + "6" + "," + $scope.exaxisidTrabsfer + "," + index + "," + $scope.EAxisSpeed + "," + $scope.EAxisacc + "," + $scope.EAxisDistance + ")";
        let StartEAxisJogCmd = {
            cmd: 292,
            data: {
                content: StartEAxisJogString,
            },
        };
        dataFactory.setData(StartEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //外部轴停止点动
    $scope.stopEAxisJog = function () {
        var StopEAxisJogString = "StopExtAxisJog";
        let StopEAxisJogCmd = {
            cmd: 240,
            data: {
                content: StopEAxisJogString,
            },
        };
        dataFactory.setData(StopEAxisJogCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //扩展轴参数配置
    $scope.setEAxisParamCfg = function () {
        handleexaxisid($scope.selectedEAxisCfgID.id);
        var EAxisParamCfgString = "ExtAxisParamConfig(" + $scope.exaxisidTrabsfer + "," +
            $scope.selectedSetEAxisTyp.id + "," +
            $scope.selectedSetEAxisDir.id + "," +
            $scope.setEAxisCfgData.axis_possoftlimit + "," +
            $scope.setEAxisCfgData.axis_negsoftlimit + "," +
            $scope.setEAxisCfgData.axis_speed + "," +
            $scope.setEAxisCfgData.axis_acc + "," +
            $scope.selectedSetEAxisLead + "," +
            $scope.setEAxisCfgData.axis_enres + "," +
            $scope.setEAxisCfgData.axis_offset +
            "," +
            $scope.selectedEAxisCompany.id + "," +
            $scope.selectedEAxisCompanyType.id + "," +
            $scope.selectedEAxisCompanyModel.id +
            ")";
        let EAxisParamCfgCmd = {
            cmd: 291,
            data: {
                content: EAxisParamCfgString,
            },
        };
        dataFactory.setData(EAxisParamCfgCmd)
            .then(() => {
                setTimeout(getEAxiscfg, 1000);
                $("#ConverCfgModal").modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //处理外部轴配置参数
    function handelEAxisCfgData(tempdata) {
        let length = tempdata.length;
        for (let i = 0; i < length; i++) {
            $scope.ExternaAxisCfgData[i].axis_id = ~~(tempdata[i].axis_id);
            $scope.ExternaAxisCfgData[i].axis_type = ~~(tempdata[i].axis_type);
            $scope.ExternaAxisCfgData[i].axis_direction = ~~(tempdata[i].axis_direction);
            $scope.ExternaAxisCfgData[i].axis_possoftlimit = ~~(tempdata[i].axis_possoftlimit);
            $scope.ExternaAxisCfgData[i].axis_negsoftlimit = ~~(tempdata[i].axis_negsoftlimit);
            $scope.ExternaAxisCfgData[i].axis_speed = ~~(tempdata[i].axis_speed);
            $scope.ExternaAxisCfgData[i].axis_acc = ~~(tempdata[i].axis_acc);
            $scope.ExternaAxisCfgData[i].axis_enres = ~~(tempdata[i].axis_enres);
            $scope.ExternaAxisCfgData[i].axis_lead = parseFloat(tempdata[i].axis_lead).toFixed(3);
            $scope.ExternaAxisCfgData[i].axis_offset = ~~(tempdata[i].axis_offset);
            $scope.ExternaAxisCfgData[i].axis_company = ~~(tempdata[i].axis_company);
            $scope.ExternaAxisCfgData[i].axis_model = ~~(tempdata[i].axis_model);
            $scope.ExternaAxisCfgData[i].axis_enctype = ~~(tempdata[i].axis_enctype);

            $scope.ListEAxisCfgData[i].axis_id = ~~(tempdata[i].axis_id);
            $scope.ListEAxisCfgData[i].axis_type = $scope.ExternaAxisTypData[~~(tempdata[i].axis_type)].name;
            $scope.ListEAxisCfgData[i].axis_direction = $scope.ExternaAxisDirData[~~(tempdata[i].axis_direction)].name;
            $scope.ListEAxisCfgData[i].axis_possoftlimit = ~~(tempdata[i].axis_possoftlimit);
            $scope.ListEAxisCfgData[i].axis_negsoftlimit = ~~(tempdata[i].axis_negsoftlimit);
            $scope.ListEAxisCfgData[i].axis_speed = ~~(tempdata[i].axis_speed);
            $scope.ListEAxisCfgData[i].axis_acc = ~~(tempdata[i].axis_acc);
            $scope.ListEAxisCfgData[i].axis_enres = ~~(tempdata[i].axis_enres);
            $scope.ListEAxisCfgData[i].axis_lead = parseFloat(tempdata[i].axis_lead).toFixed(3);
            $scope.ListEAxisCfgData[i].axis_offset = ~~(tempdata[i].axis_offset);
            $scope.ListEAxisCfgData[i].axis_company = $scope.ExternaAxisCompany[~~(tempdata[i].axis_company)].name;
            if (0 == ~~(tempdata[i].axis_company)) {
                $scope.ListEAxisCfgData[i].axis_model = $scope.ExternaAxisHCFAType[~~(tempdata[i].axis_model)].name;
            } else if (1 == ~~(tempdata[i].axis_company)) {
                $scope.ListEAxisCfgData[i].axis_model = $scope.ExternaAxisINOVANCEType[~~(tempdata[i].axis_model)].name;
            } else if (2 == ~~(tempdata[i].axis_company)) {
                $scope.ListEAxisCfgData[i].axis_model = $scope.ExternaAxisPANASONICType[~~(tempdata[i].axis_model)].name;
            } else {
                $scope.ListEAxisCfgData[i].axis_model = $scope.ExternaAxisHCFAType[~~(tempdata[i].axis_model)].name;
            }
            $scope.ListEAxisCfgData[i].axis_enctype = $scope.ExternaAxisModel[~~(tempdata[i].axis_enctype)].name;


        }
    }

    //读取外部轴参数配置文件
    function getEAxiscfg() {
        let getEAxiscfgCmd = {
            cmd: "get_exaxis_cfg",
        };
        dataFactory.getData(getEAxiscfgCmd)
            .then((data) => {
                $scope.ExAxisTime = parseInt(data.cmddonetime);
                handelEAxisCfgData(data.cfg);
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[11]);
            });
    }

    //外部轴伺服使能
    $scope.setEAxisServoOn = function (index) {
        handleexaxisid($scope.selectedEAxisTestID.id);
        let EAxisServoOnCmd = {
            cmd: 296,
            data: {
                content: "ExtAxisServoOn(" + $scope.exaxisidTrabsfer + "," + index + ")",
            },
        };
        dataFactory.setData(EAxisServoOnCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //外部轴定位完成时间设置
    $scope.setExAxisCmdDoneTime = function () {
        let setExAxisCmdDoneTimeCmd = {
            cmd: 298,
            data: {
                content: "SetExAxisCmdDoneTime(" + $scope.ExAxisTime + ")",
            },
        };
        dataFactory.setData(setExAxisCmdDoneTimeCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**传送带跟踪 */

    //一键配置传送带IO功能函数
    $scope.quickSetConveyor = function () {
        if (!isSafetyFunc) {
            let DIConQuickCmd = {
                cmd: 323,
                data: {
                    content: "SetDIConfig(3,0,0,0,0,0,0,0)",
                },
            };
            dataFactory.setData(DIConQuickCmd)
                .then(() => {
                    let DOConQuickCmd = {
                        cmd: 324,
                        data: {
                            content: "SetDOConfig(1,2,12,0,0,0,0,0)",
                        },
                    };
                    dataFactory.setData(DOConQuickCmd)
                        .then(() => {
                            syncUpdateRobotIOAlias('conveyor')
                        }, (status) => {
                            toastFactory.error(status);
                        });
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.error('403', pesDynamicTags.error_messages[29]);
        }
    }

    /* 传送带跟踪功能切换 */
    $scope.changeConveyorFunction = function(){
        if($scope.selectedConveyorFunction.id == 0){
            $scope.show_conveyor_grab = true;
            $scope.show_conveyor_motion = false;
            $scope.show_conveyor_tpd = false;
        } else if($scope.selectedConveyorFunction.id == 1){
            $scope.show_conveyor_grab = false;
            $scope.show_conveyor_motion = true;
            $scope.show_conveyor_tpd = false;
        } else if($scope.selectedConveyorFunction.id == 2){
            $scope.show_conveyor_grab = false;
            $scope.show_conveyor_motion = false;
            $scope.show_conveyor_tpd = true;
        }
    }
    $scope.changeConveyorFunction();

    /* 获取传送带跟踪配置 */
    function getConveyorcfg() {
        let getConveyorcfgCmd = {
            cmd: "get_robot_cfg",
        };
        dataFactory.getData(getConveyorcfgCmd)
            .then((data) => {
                $scope.selectedChannel = $scope.encoderChannelData[~~data.encoder_channel];
                $scope.selectedWobjAxis = $scope.wobjAxisData[~~data.encoder_wpaxis];
                $scope.conresolution = parseFloat(data.encoder_resolution).toFixed(3);
                $scope.conperimeter = parseFloat(data.encoder_lead).toFixed(3);
                $scope.selectedVision = $scope.visionData[~~data.encoder_vision];
                $scope.conveyorSpeedRatio = parseInt(data.encoder_speedratio);
                $scope.Conveyorx = parseFloat(data.compensation_tool_x).toFixed(3);
                $scope.Conveyory = parseFloat(data.compensation_tool_y).toFixed(3);
                $scope.Conveyorz = parseFloat(data.compensation_tool_z).toFixed(3);
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[3]);
            });
    }

    //传送带参数配置
    $scope.setConveyorParam = function () {
        if (((null == $scope.conresolution) || ("" == $scope.conresolution)) ||
            ((null == $scope.conperimeter) || ("" == $scope.conperimeter)) || 
            ((null == $scope.conveyorSpeedRatio) || ("" == $scope.conveyorSpeedRatio))
        ) {
            toastFactory.info(pesDynamicTags.info_messages[15]);
            return;
        }
        let setConParamCmd = {
            cmd: 367,
            data: {
                content: "ConveyorSetParam(" + $scope.selectedChannel.id + "," + $scope.conresolution + "," + $scope.conperimeter + "," + $scope.selectedWobjAxis.id + "," + $scope.selectedVision.id + "," + $scope.conveyorSpeedRatio + ")",
            },
        };
        dataFactory.setData(setConParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //传送带抓取点偏差设置
    $scope.setConveyorPointComp = function () {
        if (((null == $scope.Conveyorx) || ("" == $scope.Conveyorx)) ||
            ((null == $scope.Conveyory) || ("" == $scope.Conveyory)) ||
            ((null == $scope.Conveyorz) || ("" == $scope.Conveyorz))) {
            toastFactory.info(pesDynamicTags.info_messages[16]);
            return;
        }
        let setConPointCompCmd = {
            cmd: 368,
            data: {
                content: "ConveyorCatchPointComp(" + $scope.Conveyorx + "," + $scope.Conveyory + "," + $scope.Conveyorz + ")",
            },
        };
        dataFactory.setData(setConPointCompCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    //传送带启停
    $scope.ConveyorStartEnd = function (index) {
        let setConStartEndCmd = {
            cmd: 358,
            data: {
                content: "ConveyorStartEnd(" + index + ")",
            },
        };
        dataFactory.setData(setConStartEndCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //传送带IO切入点标定
    $scope.setConIOPoint = function () {
        let setConIOPointCmd = {
            cmd: 359,
            data: {
                content: "ConveyorPointIORecord()",
            },
        };
        dataFactory.setData(setConIOPointCmd)
            .then(() => {
                $('#ConIOModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //传送带A点标定
    $scope.setConAPoint = function () {
        let setConAPointCmd = {
            cmd: 360,
            data: {
                content: "ConveyorPointARecord()",
            },
        };
        dataFactory.setData(setConAPointCmd)
            .then(() => {
                $('#ConAModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //传送带参考点标定
    $scope.setConRfePoint = function () {
        let setConRfePointCmd = {
            cmd: 361,
            data: {
                content: "ConveyorRefPointRecord()",
            },
        };
        dataFactory.setData(setConRfePointCmd)
            .then(() => {
                $('#ConRefModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //传送带B点标定
    $scope.setConBPoint = function () {
        let setConBPointCmd = {
            cmd: 362,
            data: {
                content: "ConveyorPointBRecord()",
            },
        };
        dataFactory.setData(setConBPointCmd)
            .then(() => {
                $('#ConBModal').modal('hide');
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 一键配置IO时，同步更新IO别名
     * @param {string} type spray:一键配置喷涂DO功能函数;weave:一键配置焊机控制器I/O;conveyor:一键配置传送带IO
     */
    function syncUpdateRobotIOAlias(type) {
        switch (type) {
            case 'spray':
                $scope.ctrlDIAliasData.forEach((item, index) => {
                    if (index > 7) {
                        $scope.ctrlDIAliasData[index] = '';
                    }
                });
                $scope.ctrlDOAliasData.forEach((item, index) => {
                    if (index == 8) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[0].name;
                    }
                    if (index == 9) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[1].name;
                    }
                    if (index == 10) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[2].name;
                    }
                    if (index == 11) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[3].name;
                    }
                    if (index > 11) {
                        $scope.ctrlDOAliasData[index] = '';
                    }
                });
                break;
            case 'weave':
                $scope.ctrlDIAliasData.forEach((item, index) => {
                    if (index == 8) {
                        $scope.ctrlDIAliasData[index] = $scope.DICfgData[0].name;
                    }
                    if (index == 9) {
                        $scope.ctrlDIAliasData[index] = $scope.DICfgData[1].name;
                    }
                    if (index > 9) {
                        $scope.ctrlDIAliasData[index] = '';
                    }
                });
                $scope.ctrlDOAliasData.forEach((item, index) => {
                    if (index == 8) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[0].name;
                    }
                    if (index == 9) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[4].name;
                    }
                    if (index == 10) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[5].name;
                    }
                    if (index == 11) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[6].name;
                    }
                    if (index == 12) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[7].name;
                    }
                    if (index == 13) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[8].name;
                    }
                    if (index == 14) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[9].name;
                    }
                    if (index == 15) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[10].name;
                    }
                });
                break;
            case 'conveyor':
                $scope.ctrlDIAliasData.forEach((item, index) => {
                    if (index == 8) {
                        $scope.ctrlDIAliasData[index] = $scope.DICfgData[2].name;
                    }
                    if (index > 8) {
                        $scope.ctrlDIAliasData[index] = '';
                    }
                });
                $scope.ctrlDOAliasData.forEach((item, index) => {
                    if (index == 8) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[0].name;
                    }
                    if (index == 9) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[1].name;
                    }
                    if (index == 10) {
                        $scope.ctrlDOAliasData[index] = $scope.DOCfgData[11].name;
                    }
                    if (index > 10) {
                        $scope.ctrlDOAliasData[index] = '';
                    }
                });
                break;
            default:
                break;
        };
        setRobotIOAlias($scope.ctrlDIAliasData, $scope.ctrlDOAliasData, $scope.ctrlAIAliasData, $scope.ctrlAOAliasData, $scope.endDIAliasData, $scope.endDOAliasData, $scope.endAIAliasData, $scope.endAOAliasData);
    };

    /*获取I/O别名数据 */
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
        }, (status) => {
            toastFactory.error(status, pesDynamicTags.error_messages[19]);
        });
    };

    /**
     * 配置I/O别名
     * @param {array} ctrlDIArr 控制箱DI别名
     * @param {array} ctrlDOArr 控制箱DO别名
     * @param {array} ctrlAIArr 控制箱AI别名
     * @param {array} ctrlAOArr 控制箱AO别名
     * @param {array} endDIArr 末端DI别名
     * @param {array} endDOArr 末端DO别名
     * @param {array} endAIArr 末端AI别名
     * @param {array} endAOArr 末端AO别名
     */
    function setRobotIOAlias(ctrlDIArr, ctrlDOArr, ctrlAIArr, ctrlAOArr, endDIArr, endDOArr, endAIArr, endAOArr) {
        const setAliasParams = {
            cmd: 'set_IO_alias_cfg',
            data: {
                CtrlBox: {
                    DI: ctrlDIArr,
                    DO: ctrlDOArr,
                    AI: ctrlAIArr,
                    AO: ctrlAOArr
                },
                EndEff: {
                    DI: endDIArr,
                    DO: endDOArr,
                    AI: endAIArr,
                    AO: endAOArr
                }
            }
        };
        dataFactory.actData(setAliasParams).then(() => {
            document.dispatchEvent(new CustomEvent('setIOAliasData', { bubbles: true, cancelable: true, composed: true }));
        }, (status) => {
            toastFactory.error(status, pesDynamicTags.error_messages[20]);
        });
    };

    //保存姿态点
    $scope.setPosturePoint = function (name) {
        $scope.PosturePointName = "Pos" + name;
        let savePointCmd = {
            cmd: "save_point",
            data: {
                "name": $scope.PosturePointName,
                "update_allprogramfile": 0
            },
        };
        dataFactory.actData(savePointCmd)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //根据所选安装方式显示图片
    $scope.dirPicChange = function () {
        $scope.show_Pos_Pic = false;
        $scope.show_Neg_Pic = false;
        switch (~~($scope.selectedMotionDir.id)) {
            case 0:
                $scope.show_Pos_Pic = true;
                break;
            case 1:
                $scope.show_Neg_Pic = true;
                break;
            default:
                break;
        }
    }
    $scope.dirPicChange();




    //扩展轴配置窗口
    $("#Conveyorcfg").click(function () {
        $scope.setEAxisCfgData = $scope.ExternaAxisCfgData[$scope.selectedEAxisCfgID.id - 1];
        $scope.selectedSetEAxisTyp = $scope.ExternaAxisTypData[$scope.setEAxisCfgData.axis_type];
        $scope.selectedSetEAxisDir = $scope.ExternaAxisDirData[$scope.setEAxisCfgData.axis_direction];
        $scope.selectedSetEAxisLead = $scope.setEAxisCfgData.axis_lead;
        $scope.selectedEAxisCompany = $scope.ExternaAxisCompany[$scope.setEAxisCfgData.axis_company];
        if (0 == $scope.selectedEAxisCompany.id) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        } else if (1 == $scope.selectedEAxisCompany.id) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisINOVANCEType;
        } else if (2 == $scope.selectedEAxisCompany.id) {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisPANASONICType;
        } else {
            $scope.ExternaAxisCompanyType = $scope.ExternaAxisHCFAType;
        }
        $scope.selectedEAxisCompanyType = $scope.ExternaAxisCompanyType[$scope.setEAxisCfgData.axis_model];
        $scope.selectedEAxisCompanyModel = $scope.ExternaAxisModel[$scope.setEAxisCfgData.axis_enctype];

        $('#ConverCfgModal').modal();
    });

    //扩展轴零点配置窗口
    $("#ConveyorZero").click(function () {
        $('#ConverZeroModal').modal();
    });

    /*扩展轴（控制器+伺服器485） */
    /**
     * 切换扩展轴组合方式进入对应页面进行的初始化操作
     * @param {string} modbusModeId 1-扩展轴（控制器+PLC（UDP）；2-扩展轴（控制器+伺服器485）；
     */
    $scope.selectExternaAxisModbusMode = function(modbusModeId) {
        switch (modbusModeId) {
            case '2':
                // 获取伺服驱动器配置列表
                getAuxServoInfo();
                // 获取伺服加速度和减速度
                getAuxServoAcc();
                // 获取伺服急停加速度和减速度
                getAuxServoEmergcyStopAcc();
                break;
            default:
                break;
        }
    };
    
    /**
     * 切换伺服器厂商获取对应信息
     * @param {number} firmId 伺服器厂商id
     */
    $scope.selectServoFirm = function(firmId) {
        switch (firmId) {
            case 0:
                resetAuxServoInfo();
                break;
            case 1:
                $scope.servoModelList = $scope.servoModelFRList;
                $scope.servoModel = $scope.servoModelList[0];
                $scope.servoSoftVersionList = $scope.servoSoftVersionFRList;
                $scope.servoSoftVersion = $scope.servoSoftVersionList[0];
                break;
            default:
                break;
        }
    };
    /** ./切换伺服器厂商获取对应信息 */

    /**
     * 将获取伺服器信息中的厂商，型号，软件版本处理为name
     * @param {number} servoFirmId 厂商id
     * @param {number} servoModelId 型号id
     * @param {number} servoSoftVersionId 软件版本id
     * @returns 
     */
    function getAuxServoInfoName(servoFirmId, servoModelId, servoSoftVersionId) {
        const servoObject = {
            company: '',
            model: '',
            version: ''
        };
        switch (servoFirmId) {
            case 1:
                servoObject.company = $scope.servoFirmList.find(item => item.id == servoFirmId).name;
                servoObject.model = $scope.servoModelFRList.find(item => item.id == servoModelId).name;
                servoObject.version = $scope.servoSoftVersionFRList.find(item => item.id == servoSoftVersionId).name;
                break;
            default:
                break;
        };
        return servoObject;
    };
    /** ./将获取伺服器信息中的厂商，型号，软件版本处理为name */

    /**
     * 处理获取伺服器信息中的厂商，型号，软件版本数据结构
     * @param {array} servoData 伺服驱动器信息的二维数组
     */
    function handleAuxServoInfo(servoData) {
        if (servoData.length > 0) {
            $scope.servoConfigNumberList = [];
            const tempServoData = [];
            servoData.forEach((item, index) => {
                if (item[0] != '0') {
                    tempServoData.push({
                        number: index + 1,
                        company: getAuxServoInfoName(item[0], item[1], item[2]).company,
                        model: getAuxServoInfoName(item[0], item[1], item[2]).model,
                        version: getAuxServoInfoName(item[0], item[1], item[2]).version,
                        resolution: item[3],
                        transmission: item[4]
                    });
                    $scope.servoConfigNumberList.push({
                        id: index + 1
                    });
                }
            })
            $scope.servoDriverData = tempServoData;
            // 根据扩展轴伺服驱动器状态反馈默认选中伺服驱动器编号
            if ($scope.servoConfigNumberList.length > 0 && $scope.auxServoData && $scope.auxServoData.id && $scope.auxServoData.id != '0'
                && $scope.servoConfigNumberList.find(item => item.id == $scope.auxServoData.id)) {
                $scope.servoConfigNumber = $scope.servoConfigNumberList.find(item => item.id == $scope.auxServoData.id);
            } else {
                $scope.servoConfigNumber = $scope.servoConfigNumberList[0];
            }
        } else {
            $scope.servoDriverData = [
                {
                    number: 0,
                    company: 0,
                    model: 0,
                    version: 0,
                    resolution: 0,
                    transmission: 0
                }
            ];
            $scope.servoConfigNumberList = [];
            $scope.servoConfigNumber = {};
        }
    };
    /** ./获取伺服器信息中的厂商，型号，软件版本 */

    /*获取伺服器信息 */
    function getAuxServoInfo() {
        const getAuxServoInfoCmd = {
            cmd: 781,
            data: {
                content: 'AuxServoGetParam()',
            }
        };
        dataFactory.setData(getAuxServoInfoCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
            /* test */
            if (g_testCode) {
                $scope.servoConfigNumberList = [{"id": 1}]
            }
            /* test */
        });
    };
    document.getElementById('peripheral').addEventListener('781', e => {
        if (e.detail) {
            handleAuxServoInfo(JSON.parse(e.detail));
        } else {
            toastFactory.error('403', pesDynamicTags.error_messages[17])
        }
    });
    /** ./获取伺服器信息 */

    /*伺服器配置厂商、型号、软件版本设置为无 */
    function resetAuxServoInfo() {
        $scope.servoModelList = pesDynamicTags.var_object.clearData;
        $scope.servoSoftVersionList = pesDynamicTags.var_object.clearData;
        $scope.servoFirm = $scope.servoFirmList[0];
        $scope.servoModel = $scope.servoModelList[0];
        $scope.servoSoftVersion = $scope.servoSoftVersionList[0];
    };
    /**伺服器配置厂商、型号、软件版本设置为无 */

    /*清除伺服器配置 */
    $scope.clearAuxServoInfo = function() {
        resetAuxServoInfo();
        const setAuxServoInfoCmd = {
            cmd: 780,
            data: {
                content: "AuxServoSetParam(" + $scope.servoNumber.id + ",0,0,0,0,0" + ")"
            }
        };
        dataFactory.setData(setAuxServoInfoCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };
    /** ./获取伺服器信息 */

    /*配置伺服器信息 */
    $scope.setAuxServoInfo = function() {
        if ($scope.servoResolutionRadio == null || $scope.servoResolutionRadio == undefined || $scope.servoResolutionRadio == '') {
            $scope.servoResolutionRadio = $('#servoResolutionRadio')[0].value;
        }
        if ($scope.mechanicalTransmissionRatio == null || $scope.mechanicalTransmissionRatio == undefined || $scope.mechanicalTransmissionRatio == '') {
            $scope.mechanicalTransmissionRatio = $('#mechanicalTransmissionRatio')[0].value;
        }
        if ($scope.servoResolutionRadio && $scope.mechanicalTransmissionRatio) {
            const setAuxServoInfoCmd = {
                cmd: 780,
                data: {
                    content: "AuxServoSetParam(" + $scope.servoNumber.id + "," + $scope.servoFirm.id + "," + $scope.servoModel.id + "," + $scope.servoSoftVersion.id + "," + $scope.servoResolutionRadio + "," + $scope.mechanicalTransmissionRatio + ")"
                }
            };
            dataFactory.setData(setAuxServoInfoCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            if (!$scope.servoResolutionRadio) {
                toastFactory.info(pesDynamicTags.info_messages[46]);
            } 
            if (!$scope.mechanicalTransmissionRatio) {
                toastFactory.info(pesDynamicTags.info_messages[47]);
            }
        }
    };
    document.getElementById('peripheral').addEventListener('780', () => {
        getAuxServoInfo();
    });
    /** ./配置伺服器信息 */

    /**
     * 设置伺服器编号
     * @param {number} servoId 伺服器编号(1-16)
     */
    $scope.setServoId = function(servoId) {
        if (servoId) {
            const setServoIdCmd = {
                cmd: 790,
                data: {
                    content: "AuxServoSetStatusID(" + servoId + ")"
                }
            };
            dataFactory.setData(setServoIdCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[45]);
        }
    };
    /** ./设置伺服器编号 */

    /**
     * 伺服使能/去使能
     * @param {number} servoId 伺服器编号(1-16)
     * @param {number} enableId 0-去使能，1-使能
     */
    $scope.enableAuxServo = function(servoId, enableId) {
        if (servoId) {
            const enableAuxServoCmd = {
                cmd: 782,
                data: {
                    content: "AuxServoEnable(" + servoId + "," + enableId + ")"
                }
            };
            dataFactory.setData(enableAuxServoCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[45]);
        }
    };
    /** ./伺服使能/去使能 */

    /**
     * 清除伺服器错误
     * @param {number} servoId 伺服器编号(1-16)
     */
    $scope.clearAuxServoError = function(servoId) {
        if (servoId) {
            const clearAuxServoErrorCmd = {
                cmd: 789,
                data: {
                    content: "AuxServoClearError(" + servoId + ")"
                }
            };
            dataFactory.setData(clearAuxServoErrorCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[45]);
        }
    };
    /** ./清除伺服器错误 */

    /**
     * 设置伺服加速度和减速
     * @param {number} acc 加速度
     * @param {number} dec 减速度
     */
    $scope.setAuxServoAcc = function(acc,dec) {
        if (acc && dec) {
            const setCmd = {
                cmd: 1019,
                data: {
                    content: "AuxServoSetAcc(" + acc + "," + dec + ")"
                }
            };
            dataFactory.setData(setCmd).then(() => {
                getAuxServoAcc();
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[95]);
        }
    };
    /** ./设置伺服加速度和减速 */

    /**
     * 设置伺服急停加速度和减速
     * @param {number} acc 加速度
     * @param {number} dec 减速度
     */
    $scope.setAuxServoEmergcyStopAcc = function(acc,dec) {
        if (acc && dec) {
            const setCmd = {
                cmd: 1020,
                data: {
                    content: "AuxServoSetEmergencyStopAcc(" + acc + "," + dec + ")"
                }
            };
            dataFactory.setData(setCmd).then(() => {
                getAuxServoEmergcyStopAcc();
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[96]);
        }
    };
    /** ./设置伺服急停加速度和减速 */

    /*获取伺服急停加速度和减速 */
    function getAuxServoAcc() {
        const getCmd = {
            cmd: 1031,
            data: {
                content: 'AuxServoGetAcc()',
            }
        };
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };
    document.getElementById('peripheral').addEventListener('1031', e => {
        let speedData = e.detail.split(",");
        $scope.servoAccSpeed = parseFloat(speedData[0]).toFixed(3);
        $scope.servoDecSpeed = parseFloat(speedData[1]).toFixed(3);
    });

    /*获取伺服急停加速度和减速 */
    function getAuxServoEmergcyStopAcc() {
        const getCmd = {
            cmd: 1032,
            data: {
                content: 'AuxServoGetEmergencyStopAcc()',
            }
        };
        dataFactory.setData(getCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    };
    document.getElementById('peripheral').addEventListener('1032', e => {
        let speedData = e.detail.split(",");
        $scope.servoEmergcyStopAcc = parseFloat(speedData[0]).toFixed(3);
        $scope.servoEmergcyStopDec = parseFloat(speedData[1]).toFixed(3);
    });

    /**
     * 设置控制模式
     * @param {number} servoId 伺服器编号(1-16)
     * @param {number} servoControlModelId 控制模式id
     */
    $scope.setServoControlModel = function(servoId, servoControlModelId) {
        if (servoId) {
            const setServoControlModelCmd = {
                cmd: 783,
                data: {
                    content: "AuxServoSetControlMode(" + servoId + "," + servoControlModelId + ")"
                }
            };
            dataFactory.setData(setServoControlModelCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            toastFactory.info(pesDynamicTags.info_messages[45]);
        }
    };
    /** ./设置控制模式 */

    /**
     * 设置目标位置和运行速度-位置模式
     * @param {number} servoId 伺服器编号(1-16)
     */
    $scope.setServoTargetPosition = function(servoId) {
        if ($scope.servoTargetPosition == null || $scope.servoTargetPosition == undefined || $scope.servoTargetPosition == '') {
            $scope.servoTargetPosition = $('#servoTargetPosition')[0].value;
        }
        if ($scope.servoRunningSpeed == null || $scope.servoRunningSpeed == undefined || $scope.servoRunningSpeed == '') {
            $scope.servoRunningSpeed = $('#servoTargetSpeed')[0].value;
        }
        if ($scope.servoRunningAccPercent == null || $scope.servoRunningAccPercent == undefined || $scope.servoRunningAccPercent == '') {
            $scope.servoRunningAccPercent = $('#servoRunningAccPercent')[0].value;
        }
        if (servoId && $scope.servoTargetPosition && $scope.servoRunningSpeed && $scope.servoRunningAccPercent) {
            const setServoTargetPositionCmd = {
                cmd: 784,
                data: {
                    content: "AuxServoSetTargetPos(" + servoId + "," + $scope.servoTargetPosition + "," + $scope.servoRunningSpeed + "," + $scope.servoRunningAccPercent +")"
                }
            };
            dataFactory.setData(setServoTargetPositionCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            if (!servoId) {
                toastFactory.info(pesDynamicTags.info_messages[45]);
            }
            if (!$scope.servoTargetPosition) {
                toastFactory.info(pesDynamicTags.info_messages[48]);
            }
            if (!$scope.servoRunningSpeed) {
                toastFactory.info(pesDynamicTags.info_messages[49]);
            }
            if (!$scope.servoRunningAccPercent) {
                toastFactory.info(pesDynamicTags.info_messages[94]);
            }
        }
    };
    /** ./设置目标位置和运行速度-位置模式 */

    /**
     * 设置目标速度-速度模式
     * @param {number} servoId 伺服器编号(1-16)
     */
    $scope.setServoTargetSpeed = function(servoId) {
        if ($scope.servoTargetSpeed == null || $scope.servoTargetSpeed == undefined || $scope.servoTargetSpeed == '') {
            $scope.servoTargetSpeed = $('#servoTargetSpeed')[0].value;
        }
        if ($scope.servoTargetAccPercent == null || $scope.servoTargetAccPercent == undefined || $scope.servoTargetAccPercent == '') {
            $scope.servoTargetAccPercent = $('#servoTargetAccPercent')[0].value;
        }
        if (servoId && $scope.servoTargetSpeed && $scope.servoTargetAccPercent) {
            const setServoTargetSpeedCmd = {
                cmd: 786,
                data: {
                    content: "AuxServoSetTargetSpeed(" + servoId + "," + $scope.servoTargetSpeed + "," + $scope.servoTargetAccPercent + ")"
                }
            };
            dataFactory.setData(setServoTargetSpeedCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            if (!servoId) {
                toastFactory.info(pesDynamicTags.info_messages[45]);
            }
            if (!$scope.servoTargetSpeed) {
                toastFactory.info(pesDynamicTags.info_messages[50]);
            }
            if (!$scope.servoTargetAccPercent) {
                toastFactory.info(pesDynamicTags.info_messages[94]);
            }
        }
    };
    /** ./设置目标速度-速度模式 */

    /**
     * 设置目标转矩-力矩模式
     * @param {number} servoId 伺服器编号(1-16)
     */
    // $scope.setServoTargetTorque = function(servoId, servoTargetTorque) {
    //     if ($scope.servoTargetTorque == null || $scope.servoTargetTorque == undefined || $scope.servoTargetTorque == '') {
    //         $scope.servoTargetTorque = $('#servoTargetTorque')[0].value;
    //     }
    //     if (servoId && $scope.servoTargetTorque) {
    //         const setServoTargetTorqueCmd = {
    //             cmd: 787,
    //             data: {
    //                 content: "AuxServoSetTargetTorque(" + servoId + "," + $scope.servoTargetTorque + ")"
    //             }
    //         };
    //         dataFactory.setData(setServoTargetTorqueCmd).then(() => {
    //         }, (status) => {
    //             toastFactory.error(status);
    //         });
    //     } else {
    //         if (!servoId) {
    //             toastFactory.info(pesDynamicTags.info_messages[45]);
    //         }
    //         if (!$scope.servoTargetTorque) {
    //             toastFactory.info(pesDynamicTags.info_messages[51]);
    //         }
    //     }
    // };
    /** ./设置目标转矩-力矩模式 */

    /**
     * 伺服回零
     * @param {number} servoId 伺服器编号(1-16)
     */
    $scope.setAuxServoHoming = function(servoId) {
        if ($scope.servoSearchVel != null || $scope.servoSearchVel != undefined || $scope.servoSearchVel == '') {
            $scope.servoSearchVel = $('#servoSearchVel')[0].value;
        }
        if ($scope.servoLatchVel == null || $scope.servoLatchVel == undefined || $scope.servoLatchVel == '') {
            $scope.servoLatchVel = $('#servoLatchVel')[0].value;
        }
        if ($scope.servoAccPercent == null || $scope.servoAccPercent == undefined || $scope.servoAccPercent == '') {
            $scope.servoAccPercent = $('#servoAccPercent')[0].value;
        }
        if (servoId && $scope.servoSearchVel && $scope.servoLatchVel && $scope.servoAccPercent) {
            const setAuxServoHomingCmd = {
                cmd: 788,
                data: {
                    content: "AuxServoHoming(" + servoId + "," + $scope.servoZeroMode.id + "," + $scope.servoSearchVel + "," + $scope.servoLatchVel + "," + $scope.servoAccPercent + ")"
                }
            };
            dataFactory.setData(setAuxServoHomingCmd).then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
        } else {
            if (!servoId) {
                toastFactory.info(pesDynamicTags.info_messages[45]);
            }
            if (!$scope.servoSearchVel) {
                toastFactory.info(pesDynamicTags.info_messages[52]);
            }
            if (!$scope.servoLatchVel) {
                toastFactory.info(pesDynamicTags.info_messages[53]);
            }
            if (!$scope.servoAccPercent) {
                toastFactory.info(pesDynamicTags.info_messages[94]);
            }
        }
    };
    /** ./伺服回零 */
    /* ./扩展轴（控制器+伺服器485） */

    // 传送带标定参考点打开模态窗
    //IO切入点
    $("#ConIOcfg").click(function () {
        $('#ConIOModal').modal();
    });

    //起始点A
    $("#ConAcfg").click(function () {
        $('#ConAModal').modal();
    });

    //参考点
    $("#ConRefcfg").click(function () {
        $('#ConRefModal').modal();
    });

    //起始点B
    $("#ConBcfg").click(function () {
        $('#ConBModal').modal();
    });

    /* FT力传感器配置 */

    //力传感器选择不同厂商对应参数选择改变
    $scope.changeFTFrim = function (num) {
        if (19 == num) {
            $scope.FTTypeData = $scope.HANGTIANTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (20 == num) {
            $scope.FTTypeData = $scope.ATITypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (21 == num) {
            $scope.FTTypeData = $scope.zhongKeTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (22 == num) {
            $scope.FTTypeData = $scope.weiHangTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (23 == num) {
            $scope.FTTypeData = $scope.shenYuanShengTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (24 == num) {
            $scope.FTTypeData = $scope.XJCTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else if (26 == num) {
            $scope.FTTypeData = $scope.NSRTypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        } else{
            $scope.FTTypeData = $scope.KUNWEITypeData;
            $scope.selectedFTType = $scope.FTTypeData[0];
        }
    }
    $scope.changeFTFrim(17);
    

    //配置FT指令下发
    /**
     * 配置FT
     * @param {int} company 厂商
     * @param {int} device 类型
     * @param {int} softversion 版本
     * @param {int} mountPosition 挂载位置
     */
    $scope.setFTConfig = function (company,device,softversion,mountPosition) {
        var setFTConfigString = "FT_SetConfig(" + company + "," + device + "," + softversion + "," + mountPosition + ")";
        let setFTConfigCmd = {
            cmd: 526,
            data: {
                "content": setFTConfigString,
            },
        };
        dataFactory.setData(setFTConfigCmd)
            .then(() => {
                sleep(500);
                getFTConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清除FT
    $scope.deleteFTConfig = function () {
        var setFTConfigString = "FT_SetConfig(0,0,0,0)";
        let setFTConfigCmd = {
            cmd: 526,
            data: {
                "content": setFTConfigString,
            },
        };
        dataFactory.setData(setFTConfigCmd)
            .then(() => {
                sleep(500);
                getFTConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //激活和复位力/扭矩传感器
    $scope.actFT = function (state) {
        let setActFTCmd = {
            cmd: 524,
            data: {
                "content": "FT_Activate(" + state + ")",
            },
        };
        dataFactory.setData(setActFTCmd)
            .then(() => {
            }, (status) => {
                if (1 == state) {
                    toastFactory.error(status);
                } else {
                    toastFactory.error(status);
                }
            });
    }

    // //实时获取力/扭矩传感器激活状态
    // document.addEventListener('FTstate', e => {
    //     $scope.FTData[0].state = e.detail;
    // })
    

    //获取力/扭矩传感器配置信息
    function getFTConfigInfo() {
        let getFTCfgCmd = {
            cmd: 527,
            data: {
                content: "FT_GetConfig()",
            },
        };
        dataFactory.setData(getFTCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[11]);
            });
    };

    document.getElementById('peripheral').addEventListener('527', e => {
        extractFTInfo(JSON.parse(e.detail));
    })
    

    //提取获取到的力/扭矩传感器配置信息
    function extractFTInfo(data) {
        $scope.FTData = [];
        let length = data.length;
        var j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                $scope.FTData[j++] = data[i];
            }
        }
        j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                if (16 == data[i].name) {
                    $scope.FTData[j].type = $scope.KUNWEITypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 16)].name;
                } else if (18 == data[i].name) {
                    $scope.FTData[j].type = $scope.HANGTIANTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (19 == data[i].name) {
                    $scope.FTData[j].type = $scope.ATITypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (20 == data[i].name) {
                    $scope.FTData[j].type = $scope.zhongKeTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (21 == data[i].name) {
                    $scope.FTData[j].type = $scope.weiHangTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (22 == data[i].name) {
                    $scope.FTData[j].type = $scope.shenYuanShengTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (23 == data[i].name) {
                    $scope.FTData[j].type = $scope.XJCTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 17)].name;
                } else if (25 == data[i].name) {
                    $scope.FTData[j].type = $scope.NSRTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.FTFirmData[~~(data[i].name - 18)].name;
                } else if (80 == data[i].name) {
                    $scope.FTData[j].type = $scope.FRSmartDeviceTypeData[~~(data[i].type)].name;
                    $scope.FTData[j].name = $scope.SmartDeviceFirmData[~~(data[i].name - 79)].name;
                }
                $scope.FTData[j].version = $scope.FTSoftwareVersionData[~~(data[i].version)].name;
                j++;
            }
        }
    }

    //力矩传感器零点设置
    $scope.setFTZero = function(index){
        let setFTZeroCmd = {
            cmd: 528,
            data: {
                content: "FT_SetZero("+index+")",
            },
        };
        dataFactory.setData(setFTZeroCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[12]);
            });
    }

    /* 辅助传感器配置 */
    //配置指令下发
    $scope.setAuxConfig = function () {
        var setAuxConfigString = "AxleSensorConfig(" + $scope.selectedAuxFirm.id + "," + $scope.selectedAuxType.id + "," + $scope.selectedAuxSoftwareVersion.id + "," + $scope.selectedAuxMountPosition.id + ")";
        let setAuxConfigCmd = {
            cmd: 545,
            data: {
                "content": setAuxConfigString,
            },
        };
        dataFactory.setData(setAuxConfigCmd)
            .then(() => {
                sleep(500);
                getAuxConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清除
    $scope.deleteAuxConfig = function () {
        var setAuxConfigString = "AxleSensorConfig(0,0,0,0)";
        let setAuxConfigCmd = {
            cmd: 545,
            data: {
                "content": setAuxConfigString,
            },
        };
        dataFactory.setData(setAuxConfigCmd)
            .then(() => {
                sleep(500);
                getAuxConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //激活和复位辅助传感器
    $scope.actAux = function (state) {
        let setActAuxCmd = {
            cmd: 547,
            data: {
                "content": "AxleSensorActivate(" + state + ")",
            },
        };
        dataFactory.setData(setActAuxCmd)
            .then(() => {
            }, (status) => {
                if (1 == state) {
                    toastFactory.error(status);
                } else {
                    toastFactory.error(status);
                }
            });
    }

    //获取配置信息
    function getAuxConfigInfo() {
        let getAuxCfgCmd = {
            cmd: 546,
            data: {
                content: "AxleSensorConfigGet()",
            },
        };
        dataFactory.setData(getAuxCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[13]);
            });
    };

    document.getElementById('peripheral').addEventListener('546', e => {
        extractAuxInfo(JSON.parse(e.detail));
    })
    

    //提取获取到的传感器配置信息
    function extractAuxInfo(data) {
        $scope.AuxData = [];
        let length = data.length;
        var j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                $scope.AuxData[j++] = data[i];
            }
        }
        j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                if (data[i].name == 17) {
                    $scope.AuxData[j].name = $scope.AuxFirmData[~~(data[i].name - 17)].name;
                    $scope.AuxData[j].type = $scope.junkongTypeData[~~(data[i].type)].name;
                    $scope.AuxData[j].version = $scope.JKSoftwareVersionData[~~(data[i].version)].name;
                } else if (data[i].name == 24) {
                    $scope.AuxData[j].name = $scope.AuxFirmData[~~(data[i].name - 23)].name;
                    $scope.AuxData[j].type = $scope.huideTypeData[~~(data[i].type)].name;
                    $scope.AuxData[j].version = $scope.huideSoftwareVersionData[~~(data[i].version)].name;
                } else {
                    $scope.AuxData[j].name = data[i].name;
                    $scope.AuxData[j].type = data[i].type;
                    $scope.AuxData[j].version = data[i].version;
                }
                
                j++;
            }
        }
    }

    /* Smart Tool配置 */
    // Smart Tool设备选择不同厂商对应参数选择改变
    $scope.changeSmartDeviceFrim = function (num) {
        if (49 == num) {
            $scope.SmartDeviceTypeData = $scope.NSRSmartDeviceTypeData;
            $scope.selectedSmartDeviceType = $scope.SmartDeviceTypeData[0];
            $scope.SmartDeviceSoftwareVersionData = $scope.NSRSmartDeviceSoftwareVersionData;
            $scope.selectedSmartDeviceSoftwareVersion = $scope.SmartDeviceSoftwareVersionData[0];
            $scope.show_SmartDeviceFTControl = false;
        } else if (81 == num) {
            $scope.SmartDeviceTypeData = $scope.FRSmartDeviceTypeData;
            $scope.selectedSmartDeviceType = $scope.SmartDeviceTypeData[0];
            $scope.SmartDeviceSoftwareVersionData = $scope.FRSmartDeviceSoftwareVersionData;
            $scope.selectedSmartDeviceSoftwareVersion = $scope.SmartDeviceSoftwareVersionData[0];
            $scope.show_SmartDeviceFTControl = true;
        }
    }
    $scope.changeSmartDeviceFrim(49);

    //配置指令下发
    $scope.setSmartDeviceConfig = function () {
        var setSmartDeviceConfigString = "SetAxleExtIOConfig(" + $scope.selectedSmartDeviceFirm.id + "," + $scope.selectedSmartDeviceType.id + "," + $scope.selectedSmartDeviceSoftwareVersion.id + "," + $scope.selectedSmartDeviceMountPosition.id + ")";
        let setSmartDeviceConfigCmd = {
            cmd: 681,
            data: {
                "content": setSmartDeviceConfigString,
            },
        };
        dataFactory.setData(setSmartDeviceConfigCmd)
            .then(() => {
                sleep(500);
                getSmartDeviceConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    //清除
    $scope.deleteSmartDeviceConfig = function () {
        var setSmartDeviceConfigString = "SetAxleExtIOConfig(0,0,0,0)";
        let setSmartDeviceConfigCmd = {
            cmd: 681,
            data: {
                "content": setSmartDeviceConfigString,
            },
        };
        dataFactory.setData(setSmartDeviceConfigCmd)
            .then(() => {
                sleep(500);
                getSmartDeviceConfigInfo();
            }, (status) => {
                toastFactory.error(status);
            });
    }


    //激活和复位辅助传感器
    $scope.actSmartDevice = function (state) {
        let setActSmartDeviceCmd = {
            cmd: 547,
            data: {
                "content": "AxleSensorActivate(" + state + ")",
            },
        };
        dataFactory.setData(setActSmartDeviceCmd)
            .then(() => {
            }, (status) => {
                if (1 == state) {
                    toastFactory.error(status);
                } else {
                    toastFactory.error(status);
                }
            });
    }

    //获取配置信息
    function getSmartDeviceConfigInfo() {
        let getSmartDeviceCfgCmd = {
            cmd: 682,
            data: {
                content: "GetAxleExtIOConfig()",
            },
        };
        dataFactory.setData(getSmartDeviceCfgCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[13]);
            });
    };

    document.getElementById('peripheral').addEventListener('682', e => {
        extractSmartDeviceInfo(JSON.parse(e.detail));
    })
    
    //提取获取到的传感器配置信息
    function extractSmartDeviceInfo(data) {
        $scope.SmartToolData = [];
        let length = data.length;
        var j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                $scope.SmartToolData[j++] = data[i];
            }
        }
        j = 0;
        for (let i = 0; i < length; i++) {
            if (data[i].name != 0) {
                if (data[i].name == 48) {
                    $scope.SmartToolData[j].name = $scope.SmartDeviceFirmData[~~(data[i].name - 48)].name;
                    $scope.SmartToolData[j].type = $scope.NSRSmartDeviceTypeData[~~(data[i].type)].name;
                    $scope.SmartToolData[j].version = $scope.NSRSmartDeviceSoftwareVersionData[~~(data[i].version)].name;
                } else if (data[i].name == 80) {
                    $scope.SmartToolData[j].name = $scope.SmartDeviceFirmData[~~(data[i].name - 79)].name;
                    $scope.SmartToolData[j].type = $scope.FRSmartDeviceTypeData[~~(data[i].type)].name;
                    $scope.SmartToolData[j].version = $scope.FRSmartDeviceSoftwareVersionData[~~(data[i].version)].name;
                } else {
                    $scope.SmartToolData[j].name = data[i].name;
                    $scope.SmartToolData[j].type = data[i].type;
                    $scope.SmartToolData[j].version = data[i].version;
                }
                
                j++;
            }
        }
    }

    /* 扭矩系统配置 */

    $scope.tightenParameterArr = [0, 0, 0, 0, {
        T0: [0.00, 0.00, 0.00, 0.00, 0.00],
        T1: [0.00, 0.00, 0.00, 0.00, 0.00],
        T2: [0.00, 0.00, 0.00, 0.00, 0.00],
        T3: [0.00, 0.00, 0.00, 0.00, 0.00],
        T4: [0.00, 0.00, 0.00, 0.00, 0.00]
    }, 0, 0.00, 0.00, 0, 0.00, 0, 0];
    $scope.unscrewParameterArr = [0, 0, 0];
    $scope.freeParameterArr = [0, 0];
    $scope.templateContent = {
        tighten_mode: 0,
        tighten_direction: 0,
        target_torque: 0,
        torque_hold: 0,
        torque_compensate: {
            T0: [0.00, 0.00, 0.00, 0.00, 0.00],
            T1: [0.00, 0.00, 0.00, 0.00, 0.00],
            T2: [0.00, 0.00, 0.00, 0.00, 0.00],
            T3: [0.00, 0.00, 0.00, 0.00, 0.00],
            T4: [0.00, 0.00, 0.00, 0.00, 0.00],
        },
        float_slip: 0,
        float_rpm: 0.00,
        slid_rpm: 0.00,
        tapping_func: 0,
        exemption_rpm: 0.00,
        standby_wait_time: 0,
        torque_ratio: 0,
        tighten_rpm: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tighten_speed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        tighten_torque: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        unscrew_threshold: 0,
        unscrew_hold_time: 0,
        unscrew_rpm: [0, 0],
        unscrew_speed: [0, 0],
        unscrew_torque: [0, 0],
        unscrew_limit: 0,
        free_direction: 0,
        free_speed: 0,
    }

    // 获取示教点数据
    function getWPTP(selectedWorkpieceIDForTP) {
        let getCmd = {
            cmd: "torque_get_wkpoints",
            data: {
                workpiece_id: selectedWorkpieceIDForTP
            }
        };
        dataFactory.getData(getCmd)
            .then((data) => {
                $scope.leftWPTP = data.left_workstation;
                $scope.rightWPTP = data.right_workstation;
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.leftWPTP = ["工件1_left_1", "工件1_left_2"];
                    $scope.rightWPTP = ["工件1_right_1", "工件1_right_2"];
                }
                /* ./test */
                toastFactory.error(status);
            });
    }

    /* 添加左工位示教点 */
    $scope.addLeftTorqueTeachingPoint = function () {
        let torqueElement = {
            id: $scope.leftTorqueTeachingPointsList.length + 1,
            name: ""
        };
        $scope.leftTorqueTeachingPointsList.push(torqueElement);
    }

    /* 添加右工位示教点 */
    $scope.addRightTorqueTeachingPoint = function () {
        let torqueElement = {
            id: $scope.rightTorqueTeachingPointsList.length + 1,
            name: ""
        };
        $scope.rightTorqueTeachingPointsList.push(torqueElement);
    }

    /* 设置工件示教点前缀 */
    $scope.setWPPointPrefix = function (selectedWorkpieceIDForTP) {
        if (selectedWorkpieceIDForTP == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[17]);
        } else {
            setTPPrefix(selectedWorkpieceIDForTP);
        }
    }

    /* 选择左工位示教点名称 */
    $scope.changeLeftTTPName = function (ttpIndex, selectedTTPName) {
        $scope.leftTorqueTeachingPointsList[ttpIndex].name = selectedTTPName;
    }
    /* 选择右工位示教点名称 */
    $scope.changeRightTTPName = function (ttpIndex, selectedTTPName) {
        $scope.rightTorqueTeachingPointsList[ttpIndex].name = selectedTTPName;
    }

    /* 删除左工位示教点 */
    $scope.deleteLeftTorqueTeachingPoint = function (ttpIndex) {
        $scope.leftTorqueTeachingPointsList.splice(ttpIndex, 1);
        $scope.selectedLeftTTPNameArr.splice(ttpIndex, 1);
        $scope.leftTorqueTeachingPointsList.forEach((item, index, arr) => {
            item.id = index + 1;
        });
    }
    /* 删除右工位示教点 */
    $scope.deleteRightTorqueTeachingPoint = function (ttpIndex) {
        $scope.rightTorqueTeachingPointsList.splice(ttpIndex, 1);
        $scope.selectedRightTTPNameArr.splice(ttpIndex, 1);
        $scope.rightTorqueTeachingPointsList.forEach((item, index, arr) => {
            item.id = index + 1;
        });
    }

    /* 获取当前扭矩系统型号（414） */
    function getCurrentTorqueProduct() {
        let cmdContent = {
            cmd: 414,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取当前扭矩系统型号参数范围（413） */
    function getCurrentTorqueRange(currentProduct) {
        let cmdContent = {
            cmd: 413,
            data: {
                current_product: currentProduct
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取起子程序名数组（401） */
    function getTorqueProgramArray() {
        let cmdContent = {
            cmd: 401,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取起子程序内容（402） */
    function getTorqueProgramContent(programName) {
        let cmdContent = {
            cmd: 402,
            data: {
                program_name: programName
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取扭矩系统开关状态（412） */
    function getTorqueActiveState() {
        let cmdContent = {
            cmd: 412,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置扭矩开启或关闭（411） */
    let torqueActiveFlg = 0;
    $scope.activateTorque = function () {
        let cmdContent = {
            cmd: 411,
            data: {
                enable: 1 ^ torqueActiveFlg
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置扭矩系统单位（415） */
    $scope.setTorqueUnit = function (torqueUnit) {
        let cmdContent = {
            cmd: 415,
            data: {
                torque_unit: torqueUnit.unit_index
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置扭矩控制模式（406） */
    $scope.setTorqueControlMode = function (controlMode) {
        let cmdContent = {
            cmd: 406,
            data: {
                control_mode: controlMode.cm_index
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 打开程序编辑模态窗 */
    $scope.editTorqueProgram = function (selectedTorqueProgram) {
        // 选择的扭矩起子程序不为空或undefined
        if (selectedTorqueProgram != null || selectedTorqueProgram != undefined) {
            getTorqueProgramContent(selectedTorqueProgram);
        }
        /* test */
        if (g_testCode) {
            $('#torqueProgramEditModal').modal();
        }
        /* ./test */
    }

    /* 打开编辑步骤的模态窗 */
    $scope.showTightenStepEdit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    $scope.showUnscrewStepEdit = [0, 0];
    $scope.openEditStepModal = function (stepType, stepIndex) {
        if (stepType == 'tighten') {
            if ($scope.showTightenStepEdit[stepIndex] == 0) {
                $scope.showTightenStepEdit = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                $scope.showTightenStepEdit[stepIndex] = 1;
                $scope.tightenRPMEdit = $scope.JobContentForPlanning.tighten_rpm[stepIndex];
                $scope.tightenSpeedEdit = $scope.JobContentForPlanning.tighten_speed[stepIndex];
                $scope.tightenTorqueEdit = $scope.JobContentForPlanning.tighten_torque[stepIndex];
            } else if ($scope.showTightenStepEdit[stepIndex] == 1) {
                $scope.showTightenStepEdit[stepIndex] = 0;
            }
        } else if (stepType == 'unscrew') {
            if ($scope.showUnscrewStepEdit[stepIndex] == 0) {
                $scope.showUnscrewStepEdit = [0, 0];
                $scope.showUnscrewStepEdit[stepIndex] = 1;
                $scope.unscrewRPMEdit = $scope.JobContentForPlanning.unscrew_rpm[stepIndex];
                $scope.unscrewSpeedEdit = $scope.JobContentForPlanning.unscrew_speed[stepIndex];
                $scope.unscrewTorqueEdit = $scope.JobContentForPlanning.unscrew_torque[stepIndex];
            } else if ($scope.showUnscrewStepEdit[stepIndex] == 1) {
                $scope.showUnscrewStepEdit[stepIndex] = 0;
            }
        }
    }

    /* 编辑参数值 */
    $scope.edit = function (e, i, t, v) {
        let td = $(e.target);
        if (t == 'tighten') {
            let input = $("<input id='inputval' style='width: 100px' type='number' min='0' max='" + v.range_max + "' value='" + $scope.tightenParameterArr[i] + "'/>");
            td.html(input);
            input.click(() => {
                return false;
            });
            input.trigger("focus");
            input.blur(() => {
                let newtxt = $("#inputval").val();
                td.html(newtxt);
                $scope.tightenParameterArr[i] = parseFloat(newtxt);
                $scope.JobContentForPlanning.tighten_mode = $scope.tightenParameterArr[0];
                $scope.JobContentForPlanning.tighten_direction = $scope.tightenParameterArr[1];
                $scope.JobContentForPlanning.target_torque = $scope.tightenParameterArr[2];
                $scope.JobContentForPlanning.torque_hold = $scope.tightenParameterArr[3];
                $scope.JobContentForPlanning.torque_compensate = $scope.tightenParameterArr[4];
                $scope.JobContentForPlanning.float_slip = $scope.tightenParameterArr[5];
                $scope.JobContentForPlanning.float_rpm = $scope.tightenParameterArr[6];
                $scope.JobContentForPlanning.slid_rpm = $scope.tightenParameterArr[7];
                $scope.JobContentForPlanning.tapping_func = $scope.tightenParameterArr[8];
                $scope.JobContentForPlanning.exemption_rpm = $scope.tightenParameterArr[9];
                $scope.JobContentForPlanning.standby_wait_time = $scope.tightenParameterArr[10];
                $scope.JobContentForPlanning.torque_ratio = $scope.tightenParameterArr[11];
            });
        } else if (t == 'unscrew') {
            let input = $("<input id='inputval' style='width: 100px' type='number' min='0' max='" + v.range_max + "' value='" + $scope.unscrewParameterArr[i] + "'/>");
            td.html(input);
            input.click(() => {
                return false;
            });
            input.trigger("focus");
            input.blur(() => {
                let newtxt = $("#inputval").val();
                td.html(newtxt);
                $scope.unscrewParameterArr[i] = parseFloat(newtxt);
                $scope.JobContentForPlanning.unscrew_threshold = $scope.unscrewParameterArr[0];
                $scope.JobContentForPlanning.unscrew_hold_time = $scope.unscrewParameterArr[1];
                $scope.JobContentForPlanning.unscrew_limit = $scope.unscrewParameterArr[2];
            });
        } else if (t == 'free') {
            let input = $("<input id='inputval' style='width: 100px' type='number' min='0' max='" + v.range_max + "' value='" + $scope.freeParameterArr[i] + "'/>");
            td.html(input);
            input.click(() => {
                return false;
            });
            input.trigger("focus");
            input.blur(() => {
                let newtxt = $("#inputval").val();
                td.html(newtxt);
                $scope.freeParameterArr[i] = parseFloat(newtxt);
                $scope.JobContentForPlanning.free_direction = $scope.freeParameterArr[0];
                $scope.JobContentForPlanning.free_speed = $scope.freeParameterArr[1];
            });
        }
    }

    /* 确认步骤参数值修改 */
    $scope.confirmStepVals = function (stepType, stepIndex) {
        if (stepType == 'tighten') {
            $scope.showTightenStepEdit[stepIndex] = 0;
            $scope.JobContentForPlanning.tighten_rpm[stepIndex] = $scope.tightenRPMEdit;
            $scope.JobContentForPlanning.tighten_speed[stepIndex] = $scope.tightenSpeedEdit;
            $scope.JobContentForPlanning.tighten_torque[stepIndex] = $scope.tightenTorqueEdit;
        } else if (stepType == 'unscrew') {
            $scope.showUnscrewStepEdit[stepIndex] = 0;
            $scope.JobContentForPlanning.unscrew_rpm[stepIndex] = $scope.unscrewRPMEdit;
            $scope.JobContentForPlanning.unscrew_speed[stepIndex] = $scope.unscrewSpeedEdit;
            $scope.JobContentForPlanning.unscrew_torque[stepIndex] = $scope.unscrewTorqueEdit;
        }
    }

    /* 切换设置页Tab */
    $scope.tighten = true;
    $scope.switchTab = function (key) {
        switch (key) {
            case 'tighten':
                $scope.tighten = true;
                $scope.unscrew = false;
                $scope.free = false;
                break;
            case 'unscrew':
                $scope.tighten = false;
                $scope.unscrew = true;
                $scope.free = false;
                break;
            case 'free':
                $scope.tighten = false;
                $scope.unscrew = false;
                $scope.free = true;
                break;

            default:
                break;
        }
    }

    /* 程序编辑确认修改并保存（403） */
    $scope.saveTorqueProgram = function () {
        // 输入的程序名不为undefined
        // if ($scope.inputedProgramName != undefined) {
        let cmdContent = {
            cmd: 403,
            data: {
                task_name: $scope.selectedTorqueProgram,
                task_content: $scope.JobContentForPlanning
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 程序下发功能（404） */
    $scope.uploadTorqueProgram = function (programName) {
        let cmdContent = {
            cmd: 404,
            data: {
                program_name: programName
            }
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 测试拧紧（407） */
    $scope.testTighten = function () {
        let cmdContent = {
            cmd: 407,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 测试反松（408） */
    $scope.testUnscrew = function () {
        let cmdContent = {
            cmd: 408,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 测试自由（409） */
    $scope.testFree = function () {
        let cmdContent = {
            cmd: 409,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 停止运行（410） */
    $scope.testStop = function () {
        let cmdContent = {
            cmd: 410,
            data: {}
        };
        dataFactory.setData(cmdContent)
            .then(() => {
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 获取工件编号列表 */
    function getWPNameList() {
        let cmdContent = {
            cmd: "torque_get_wpname_list",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.jiabaoWorkpieceIDList = data;
                
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.jiabaoWorkpieceIDList = ["tet", "wew"];
                }
                /* ./test */
                toastFactory.error(status);
            });
    }

    /* 获取子程序模板文件 */
    function getWPST() {
        let cmdContent = {
            cmd: "torque_get_ptemp_list",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.jiabaoSubroutineTemplateList = data;
                
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.jiabaoSubroutineTemplateList = ["ptemp_吸气.lua", "ptemp_吹气.lua"];
                }
                /* ./test */
                toastFactory.error(status);
            });
    }

    /* 工件配方配置导入 */
    $scope.selectRecipelFile = function () {
        $("#recipeImport").click();
    }

    /* 工件配方配置导出 */
    $scope.exportRecipe = function (workpieceID) {
        if (workpieceID == null || workpieceID == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[17]);
        } else {
            if(g_systemFlag == 1){
                window.location.href = "/action/download?pathfilename=/usr/local/etc/web/file/torquesys/torquesys_" + workpieceID + ".tar.gz";
            }else{
                window.location.href = "/action/download?pathfilename=/tmp/torquesys_" + workpieceID + ".tar.gz";
            }
            $("#torqueProductionParameters").modal('hide');
        }
    }

    /* 打开生产参数及设备配置模态窗 */
    $scope.openWorkpieceParametersSetting = function () {
        $scope.selectedWorkpieceID = null;
        $scope.workpieceID = null;
        $scope.screwsNum = null;
        $scope.screwTime = null;
        $scope.screwPeriod = null;
        $scope.floatTime = null;
        $scope.slipTime = null;
        $scope.dispensingTime = null;
        getWPNameList();
        $("#torqueProductionParameters").modal();
    }

    /* 依据选择的工件名称获取其参数及设备配置 */
    $scope.getWorkpieceParameters = function (selectedWorkpieceID) {
        if (selectedWorkpieceID != null) {
            let cmdContent = {
                cmd: "torque_get_cfg",
                data: {
                    workpiece_id: selectedWorkpieceID,
                }
            };
            dataFactory.getData(cmdContent)
                .then((data) => {
                    $scope.workpieceID = data.workpiece_id;
                    $scope.screwsNum = data.screw_num;
                    $scope.screwTime = data.screw_time;
                    $scope.screwPeriod = data.screw_period;
                    $scope.floatTime = data.float_time;
                    $scope.slipTime = data.slip_time;
                    $scope.dispensingTime = data.dispensing_time;
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 下发生产参数及设备配置 */
    $scope.setWorkpieceParametersSetting = function () {
        if ($scope.workpieceID == '' || $scope.workpieceID == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[18]);
        } else if ($scope.screwsNum == '' || $scope.screwsNum == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[19]);
        } else if ($scope.screwTime == '' || $scope.screwTime == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[20]);
        } else if ($scope.screwPeriod == '' || $scope.screwPeriod == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[21]);
        } else if ($scope.floatTime == '' || $scope.floatTime == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[22]);
        } else if ($scope.slipTime == '' || $scope.slipTime == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[23]);
        } else if ($scope.dispensingTime == '' || $scope.dispensingTime == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[24]);
        } else if ($scope.selectedWorkpieceID != $scope.workpieceID && $scope.jiabaoWorkpieceIDList.includes($scope.workpieceID)) {
            toastFactory.info(pesDynamicTags.info_messages[25]);
        } else {
            let cmdContent;
            if ($scope.selectedWorkpieceID == null) {
                cmdContent = {
                    cmd: "torque_save_cfg",
                    data: {
                        old_workpiece_id: "new",
                        new_workpiece_id: $scope.workpieceID,
                        screw_num: $scope.screwsNum,
                        screw_time: $scope.screwTime,
                        screw_period: $scope.screwPeriod,
                        float_time: $scope.floatTime,
                        slip_time: $scope.slipTime,
                        dispensing_time: $scope.dispensingTime,
                    }
                };
            } else {
                cmdContent = {
                    cmd: "torque_save_cfg",
                    data: {
                        old_workpiece_id: $scope.selectedWorkpieceID,
                        new_workpiece_id: $scope.workpieceID,
                        screw_num: $scope.screwsNum,
                        screw_time: $scope.screwTime,
                        screw_period: $scope.screwPeriod,
                        float_time: $scope.floatTime,
                        slip_time: $scope.slipTime,
                        dispensing_time: $scope.dispensingTime,
                    }
                };
            }
            dataFactory.actData(cmdContent)
                .then((data) => {
                    $("#torqueProductionParameters").modal('hide');
                    getWPNameList();
                    
                }, (status) => {
                    /* test */
                    if (g_testCode) {
                        $("#torqueProductionParameters").modal('hide');
                    }
                    /* ./test */
                    toastFactory.error(status);
                });
        }
    }

    /* 打开示教点编辑对话窗 */
    $scope.openEditTeachingPoints = function () {
        $scope.selectedWorkpieceIDForTP = undefined;
        $scope.selectedSubroutineTemplate = undefined;
        $scope.singleScrewWPNum = "";
        $scope.leftTorqueTeachingPointsList = [];
        $scope.rightTorqueTeachingPointsList = [];
        $scope.selectedLeftTTPNameArr = [];
        $scope.selectedRightTTPNameArr = [];
        getWPNameList();
        getWPST();
        $("#torquePointsEditModal").modal();
    }

    $scope.selectedLeftTTPNameArr = [];
    $scope.selectedRightTTPNameArr = [];
    /* 获取扭矩示教点 */
    $scope.getWPTeachingPoints = function (selectedWorkpieceIDForTP) {
        if (selectedWorkpieceIDForTP != null) {
            let cmdContent = {
                cmd: "torque_get_points",
                data: {
                    workpiece_id: selectedWorkpieceIDForTP
                }
            };
            dataFactory.getData(cmdContent)
                .then((data) => {
                    $scope.selectedSubroutineTemplate = "";
                    $scope.singleScrewWPNum = 0;
                    $scope.leftTorqueTeachingPointsList = [];
                    $scope.rightTorqueTeachingPointsList = [];
                    $scope.selectedLeftTTPNameArr = [];
                    $scope.selectedRightTTPNameArr = [];
                    if (!$.isEmptyObject(data)) {
                        $scope.selectedSubroutineTemplate = data.ptemp;
                        $scope.singleScrewWPNum = data.perscrew_pnum;
                        $scope.leftTorqueTeachingPointsList = data.left_workstation;
                        $scope.rightTorqueTeachingPointsList = data.right_workstation;
                        data.left_workstation.forEach((item, index) => {
                            $scope.selectedLeftTTPNameArr.push(item.name);
                        });
                        data.right_workstation.forEach((item, index) => {
                            $scope.selectedRightTTPNameArr.push(item.name);
                        });
                    }
                    getWPTP(selectedWorkpieceIDForTP);
                    
                }, (status) => {
                    /* test */
                    if (g_testCode) {
                        let selectedWorkpieceIDForTP = "wp1";
                        let data = {
                            "ptemp": "ptemp_吸气.lua",
                            "perscrew_pnum": 10,
                            "left_workstation": [
                                {
                                    "name": "工件1_left_1",
                                    "id": 1
                                },
                                {
                                    "name": "工件1_left_2",
                                    "id": 2
                                }
                            ],
                            "right_workstation": [
                                {
                                    "name": "工件1_right_1",
                                    "id": 1
                                },
                                {
                                    "name": "工件1_right_2",
                                    "id": 2
                                }
                            ]
                        };
                        $scope.selectedSubroutineTemplate = data.ptemp;
                        $scope.singleScrewWPNum = data.perscrew_pnum;
                        $scope.leftTorqueTeachingPointsList = data.left_workstation;
                        $scope.rightTorqueTeachingPointsList = data.right_workstation;
                        data.left_workstation.forEach((item, index) => {
                            $scope.selectedLeftTTPNameArr.push(item.name);
                        });
                        data.right_workstation.forEach((item, index) => {
                            $scope.selectedRightTTPNameArr.push(item.name);
                        });
                        getWPTP(selectedWorkpieceIDForTP);
                    }
                    /* ./test */
                    toastFactory.error(status);
                });
        }
    }

    /* 确认扭矩示教点 */
    $scope.confirmTeachingPoints = function () {
        if ($scope.selectedWorkpieceIDForTP == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[26]);
        } else if ($scope.selectedSubroutineTemplate == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[27]);
        } else if ($scope.singleScrewWPNum == "" || $scope.singleScrewWPNum == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[28]);
        } else {
            let cmdContent = {
                cmd: "torque_ensure_points",
                data: {
                    "workpiece_id": $scope.selectedWorkpieceIDForTP,        //工件名称
                    "ptemp": $scope.selectedSubroutineTemplate,             //工位示教点模板文件名称
                    "perscrew_pnum": $scope.singleScrewWPNum,               //单个螺丝对应示教点个数
                    "left_workstation": $scope.leftTorqueTeachingPointsList,
                    "right_workstation": $scope.rightTorqueTeachingPointsList,
                }
            };
            dataFactory.actData(cmdContent)
                .then((data) => {
                    $("#torquePointsEditModal").modal('hide');
                    
                }, (status) => {
                    /* test */
                    if (g_testCode) {
                        $("#torquePointsEditModal").modal('hide');
                    }
                    /* ./test */
                    toastFactory.error(status);
                });
        }
    }

    /* 打开生成示教程序对话框 */
    $scope.openGenerateProgramModal = function () {
        getMainTemplates();
    }

    /* 示教点数组生成 */
    let leftSPsArr;
    let rightSPsArr;
    $scope.createScrewArray = function (flg, screwPoints) {
        if (flg == 0) {
            // left
            leftSPsArr = [];
            leftSPsArr = screwPoints.split(",");
            leftSPsArr.forEach((e, i, a) => {
                a[i] = parseInt(e);
            });
        } else {
            // right
            rightSPsArr = [];
            rightSPsArr = screwPoints.split(",");
            rightSPsArr.forEach((e, i, a) => {
                a[i] = parseInt(e);
            });
        }
    }

    /* 获取Main程序模板列表 */
    function getMainTemplates() {
        let cmdContent = {
            cmd: "torque_get_main_list",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.mainTempList = data;
                $("#torqueGenerateProgramModal").modal();
            }, (status) => {
                /* test */
                if (g_testCode) {
                    $scope.mainTempList = ["mtemp_吸气.lua", "mtemp_吹气.lua"];
                    $("#torqueGenerateProgramModal").modal();
                }
                /* ./test */
                toastFactory.error(status);
            });
    }

    /* 生成示教程序 */
    $scope.generateTeachingProgram = function () {
        if ($scope.selectedMainTemplate == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[29]);
        } else if ($scope.selectedLeftWP == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[30]);
        } else if (leftSPsArr == [] || leftSPsArr == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[31]);
        } else if ($scope.selectedRightWP == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[32]);
        } else if (rightSPsArr == '' || rightSPsArr == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[33]);
        } else if ($scope.gpName == '' || $scope.gpName == undefined) {
            toastFactory.info(pesDynamicTags.info_messages[34]);
        } else {
            let cmdContent = {
                cmd: "torque_generate_program",
                data: {
                    main_temp: $scope.selectedMainTemplate,
                    left_wp: $scope.selectedLeftWP,
                    left_screw_array: leftSPsArr,
                    right_wp: $scope.selectedRightWP,
                    right_screw_array: rightSPsArr,
                    gp_name: $scope.gpName
                }
            };
            dataFactory.actData(cmdContent)
                .then((data) => {
                    $("#torqueGenerateProgramModal").modal("hide");
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 根据选择的左右工位工件名称自动填入默认的示教程序名称 */
    $scope.autoEntryGPName = function (selectedLeftWP, selectedRightWP) {
        if (selectedLeftWP == undefined || selectedRightWP == undefined) {
        } else {
            $scope.gpName = "main" + "_" + selectedLeftWP + "_" + selectedRightWP + ".lua";
        }
    }

    /* 打开IO别名设置功能 */
    $scope.openIOAliasSettingModal = function () {
        getIOAlias();
    }

    $scope.DIAliasList = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    $scope.DOAliasList = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    /* 获取IO别名 */
    function getIOAlias() {
        let cmdContent = {
            cmd: "get_DIO_cfg",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                $scope.DIAliasList = data.DI;
                $scope.DOAliasList = data.DO;
                $("#IOAliasSettingModal").modal();
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置IO别名 */
    $scope.setIOAlias = function () {
        let cmdContent = {
            cmd: "set_DIO_cfg",
            data: {
                DI: $scope.DIAliasList,
                DO: $scope.DOAliasList,
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                $("#IOAliasSettingModal").modal("hide");
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    let spFlag = 0;
    /* 获取系统状态页面标志位 */
    function getStatusPageFlag() {
        let cmdContent = {
            cmd: "get_status_flag",
        };
        dataFactory.getData(cmdContent)
            .then((data) => {
                spFlag = data.page_flag;
                if (spFlag == 1) {
                    $("#torqueStatusPageSwitch").prop("checked", true);
                    $("#kangyangStatusPageSwitch").prop("checked", false);
                    $("#palletizingMonitorPageSwitchBtn").prop("checked", false);
                } else if (spFlag == 2) {
                    $("#torqueStatusPageSwitch").prop("checked", false);
                    $("#kangyangStatusPageSwitch").prop("checked", true);
                    $("#palletizingMonitorPageSwitchBtn").prop("checked", false);
                } else if (spFlag == 3) {
                    $("#torqueStatusPageSwitch").prop("checked", false);
                    $("#kangyangStatusPageSwitch").prop("checked", false);
                    $("#palletizingMonitorPageSwitchBtn").prop("checked", true);
                } else {
                    $("#torqueStatusPageSwitch").prop("checked", false);
                    $("#kangyangStatusPageSwitch").prop("checked", false);
                    $("#palletizingMonitorPageSwitchBtn").prop("checked", false);
                }
            }, (status) => {
                toastFactory.error(status);
            });
    }
    getStatusPageFlag();

    /* 设置扭矩系统状态页面标志位 */
    $scope.setTorqueStatusPage = function () {
        var per_page_flag = 0;
        if(spFlag == 1){
            per_page_flag = 0;
        } else{
            per_page_flag = 1;
        }
        let cmdContent = {
            cmd: "set_status_flag",
            data: {
                page_flag: per_page_flag
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                getStatusPageFlag();
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 展示嘉宝状态页面 */
    $scope.showJiabaoStatusPage = function () {
        if (spFlag == 1) {
            document.dispatchEvent(new CustomEvent('update_torque_status_data', { bubbles: true, cancelable: true, composed: true }));
            $("#torqueStatusPage").show();
        } else {
            toastFactory.info(pesDynamicTags.info_messages[35]);
        }
    }

    /* 扭矩系统配置指令事件回调 */
    // 获取起子程序名数组
    document.getElementById("torqueSystem").addEventListener("401", (e) => {
        $scope.torqueProgramNameList = JSON.parse(e.detail);
    });
    // 获取起子程序内容
    document.getElementById("torqueSystem").addEventListener("402", (e) => {
        $scope.JobContentForPlanning = JSON.parse(e.detail);
        $scope.tightenParameterArr[0] = $scope.JobContentForPlanning.tighten_mode;
        $scope.tightenParameterArr[1] = $scope.JobContentForPlanning.tighten_direction;
        $scope.tightenParameterArr[2] = $scope.JobContentForPlanning.target_torque;
        $scope.tightenParameterArr[3] = $scope.JobContentForPlanning.torque_hold;
        $scope.tightenParameterArr[4] = $scope.JobContentForPlanning.torque_compensate;
        $scope.tightenParameterArr[5] = $scope.JobContentForPlanning.float_slip;
        $scope.tightenParameterArr[6] = $scope.JobContentForPlanning.float_rpm;
        $scope.tightenParameterArr[7] = $scope.JobContentForPlanning.slid_rpm;
        $scope.tightenParameterArr[8] = $scope.JobContentForPlanning.tapping_func;
        $scope.tightenParameterArr[9] = $scope.JobContentForPlanning.exemption_rpm;
        $scope.tightenParameterArr[10] = $scope.JobContentForPlanning.standby_wait_time;
        $scope.tightenParameterArr[11] = $scope.JobContentForPlanning.torque_ratio;
        $scope.unscrewParameterArr[0] = $scope.JobContentForPlanning.unscrew_threshold;
        $scope.unscrewParameterArr[1] = $scope.JobContentForPlanning.unscrew_hold_time;
        $scope.unscrewParameterArr[2] = $scope.JobContentForPlanning.unscrew_limit;
        $scope.freeParameterArr[0] = $scope.JobContentForPlanning.free_direction;
        $scope.freeParameterArr[1] = $scope.JobContentForPlanning.free_speed;
        $('#torqueProgramEditModal').modal();
    });
    // 保存起子程序
    document.getElementById("torqueSystem").addEventListener("403", () => {
        $('#torqueProgramEditModal').modal('hide');
    });
    // 设置法奥扭矩系统开关
    document.getElementById("torqueSystem").addEventListener("411", () => {
        getTorqueActiveState();
    });
    // 获取法奥扭矩系统开关状态
    document.getElementById("torqueSystem").addEventListener("412", (e) => {
        torqueActiveFlg = JSON.parse(e.detail).enable;
        if (torqueActiveFlg == 1) {
            getCurrentTorqueProduct();    // 414
            getTorqueProgramArray();      // 401
            $("#torqueActiveSwitch").prop("checked", true);
            // $scope.show_TorqueSetting = true;
        } else if (torqueActiveFlg == 0) {
            $("#torqueActiveSwitch").prop("checked", false);
            // $scope.show_TorqueSetting = false;
        }
    });
    // 获取当前扭矩型号参数范围
    document.getElementById("torqueSystem").addEventListener("413", (e) => {
        let varRange = JSON.parse(e.detail);
        /* 参数设置项初始化 */
        if ($scope.selectedTorqueUnit.unit_index == 0) {
            langJsonData.peripheral_setting.var_object.tighten[2].range_max = varRange.mNm_range;
            langJsonData.peripheral_setting.var_object.unscrew[0].range_max = varRange.mNm_range;
        } else if ($scope.selectedTorqueUnit.unit_index == 1) {
            langJsonData.peripheral_setting.var_object.tighten[2].range_max = varRange.kgfcm_range;
            langJsonData.peripheral_setting.var_object.unscrew[0].range_max = varRange.kgfcm_range;
        }
        langJsonData.peripheral_setting.var_object.tighten[0].range_max = varRange.tighten_mode_range;
        langJsonData.peripheral_setting.var_object.tighten[1].range_max = varRange.direction_range;
        langJsonData.peripheral_setting.var_object.tighten[3].range_max = varRange.time_range;
        langJsonData.peripheral_setting.var_object.tighten[5].range_max = varRange.float_slip_range;
        langJsonData.peripheral_setting.var_object.tighten[6].range_max = varRange.revolutions_range;
        langJsonData.peripheral_setting.var_object.tighten[7].range_max = varRange.revolutions_range;
        langJsonData.peripheral_setting.var_object.tighten[8].range_max = varRange.tapping_func_range;
        langJsonData.peripheral_setting.var_object.tighten[9].range_max = varRange.revolutions_range;
        langJsonData.peripheral_setting.var_object.tighten[10].range_max = varRange.time_range;
        langJsonData.peripheral_setting.var_object.tighten[11].range_max = varRange.tarque_ratio_range;
        langJsonData.peripheral_setting.var_object.unscrew[1].range_max = varRange.time_range;
        langJsonData.peripheral_setting.var_object.unscrew[2].range_max = varRange.unscrew_limit_range;
        langJsonData.peripheral_setting.var_object.free[0].range_max = varRange.direction_range;
        langJsonData.peripheral_setting.var_object.free[1].range_max = varRange.speed_range;
        $scope.parameterList = langJsonData.peripheral_setting.var_object;
    });
    // 获取当前扭矩型号
    document.getElementById("torqueSystem").addEventListener("414", (e) => {
        $scope.torqueProductModel = JSON.parse(e.detail).current_product;
        getCurrentTorqueRange($scope.torqueProductModel);      // 413
    });
    // 状态反馈
    document.getElementById("torqueSystem").addEventListener("torque_state_feedback", (e) => {
        let torqueStateFeedback = e.detail;
        $scope.selectedTorqueControlMode = $scope.torqueControlModeList[torqueStateFeedback.control_mode];
        $scope.selectedTorqueUnit = $scope.torqueUnitList[torqueStateFeedback.current_unit];
        if ($scope.selectedTorqueUnit.unit_index == 0) {
            $scope.show_unit_mNm = true;
            $scope.show_unit_kgfcm = false;
        } else if ($scope.selectedTorqueUnit.unit_index == 1) {
            $scope.show_unit_mNm = false;
            $scope.show_unit_kgfcm = true;
        }
    });
    /* ./扭矩系统配置指令事件回调 */

    /* ./扭矩系统配置 */

    /* test */
    // $scope.show_TorqueSetting = true;
    // $scope.show_FRTorqueSetting = true;
    // $scope.torqueProductModel = "FTSD-A-5-100-001";
    // $scope.selectedTorqueUnit = $scope.torqueUnitList[1];
    // if ($scope.selectedTorqueUnit.unit_index == 0) {
    //     $scope.show_unit_mNm = true;
    //     $scope.show_unit_kgfcm = false;
    // } else if ($scope.selectedTorqueUnit.unit_index == 1) {
    //     $scope.show_unit_mNm = false;
    //     $scope.show_unit_kgfcm = true;
    // }
    // $scope.show_parameter_en = false;
    // $scope.show_parameter_zh = true;
    // $scope.show_parameter_ja = false;
    // $scope.JobContentForPlanning = $scope.templateContent;
    // let varRange = {
    //     "revolutions_range": 600,     // 圈数范围（有小数）
    //     "speed_range": 3000,          // 速度范围
    //     "mNm_range": 480,             // mNm范围
    //     "kgfcm_range": 2,             // kfg/cm范围（有小数）
    //     "tighen_mode_range": 9,       // 拧紧模式范围
    //     "direction_range": 1,         // 旋转方向范围：拧紧旋转方向，自由旋转方向
    //     "time_range": 1000,           // 时间范围：扭矩保持时间，待机等待时间，拧松有效触发的保持时间
    //     "float_slip_range": 1,        // 开启浮高滑牙检测 范围
    //     "tapping_func_range": 1,      // 开启攻丝功能 范围
    //     "tarque_ratio_range": 100,    // 触发速度切换的扭矩比值 范围
    //     "unscrew_limit_range": 300,   // 拧松扭矩限制 范围
    // };
    // /* 参数设置项初始化 */
    // $http.get("./data/torquesys-parameter-list.json").success(function (jsonData) {
    //     if ($scope.selectedTorqueUnit.unit_index == 0) {
    //         jsonData.tighten[2].range_max = varRange.mNm_range;
    //         jsonData.unscrew[0].range_max = varRange.mNm_range;
    //     } else if ($scope.selectedTorqueUnit.unit_index == 1) {
    //         jsonData.tighten[2].range_max = varRange.kgfcm_range;
    //         jsonData.unscrew[0].range_max = varRange.kgfcm_range;
    //     }
    //     jsonData.tighten[0].range_max = varRange.tighen_mode_range;
    //     jsonData.tighten[1].range_max = varRange.direction_range;
    //     jsonData.tighten[3].range_max = varRange.time_range;
    //     jsonData.tighten[5].range_max = varRange.float_slip_range;
    //     jsonData.tighten[6].range_max = varRange.revolutions_range;
    //     jsonData.tighten[7].range_max = varRange.revolutions_range;
    //     jsonData.tighten[8].range_max = varRange.tapping_func_range;
    //     jsonData.tighten[9].range_max = varRange.revolutions_range;
    //     jsonData.tighten[10].range_max = varRange.time_range;
    //     jsonData.tighten[11].range_max = varRange.tarque_ratio_range;
    //     jsonData.unscrew[1].range_max = varRange.time_range;
    //     jsonData.unscrew[2].range_max = varRange.unscrew_limit_range;
    //     jsonData.free[0].range_max = varRange.direction_range;
    //     jsonData.free[1].range_max = varRange.speed_range;
    //     $scope.parameterList = jsonData;
    // });
    /* ./test */

    /**康养页面配置 */

    /* 打开示教点编辑对话窗 */
    $scope.openKangyangEditTeachingPoints = function () {
        $scope.AKangyangTeachingPointsList = [];
        $scope.BKangyangTeachingPointsList = [];
        $scope.CKangyangTeachingPointsList = [];
        $scope.AKangyangTeachingPointsFlag = 1;
        $scope.BKangyangTeachingPointsFlag = 1;
        $scope.CKangyangTeachingPointsFlag = 1;
        $("#kangyangPointsEditModal").modal();
    }

    // 扭矩示教点数据列表
    $scope.AKangyangTeachingPointsList = [];
    $scope.BKangyangTeachingPointsList = [];
    $scope.CKangyangTeachingPointsList = [];
    $scope.AKangyangTeachingPointsFlag = 1;
    $scope.BKangyangTeachingPointsFlag = 1;
    $scope.CKangyangTeachingPointsFlag = 1;

    /* 添加A运动示教点 */
    $scope.addAKangyangTeachingPoint = function(){
        if($scope.kangyangPointName == null || $scope.kangyangPointName == ""){
            toastFactory.warning(pesDynamicTags.warning_messages[1]);
        }else{
            let pointname = $scope.kangyangPointName+$scope.AKangyangTeachingPointsFlag;
            let savePointCmd = {
                cmd: "save_point",
                data: {
                    "name":pointname,
                    "update_allprogramfile": 0
                },
            };
            dataFactory.actData(savePointCmd)
                .then(() => {
                    //保存成功后，示教点数组增加
                    $scope.AKangyangTeachingPointsFlag = $scope.AKangyangTeachingPointsFlag+1;
                    let kangyangElement = {
                        id: $scope.AKangyangTeachingPointsList.length + 1,
                        name: pointname,
                        motion: $scope.selectedKangyangMotion.name
                    };
                    $scope.AKangyangTeachingPointsList.push(kangyangElement);
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 删除A运动示教点 */
    $scope.deleteAkangyangTeachingPoint = function (ttpIndex) {
        $scope.AKangyangTeachingPointsList.splice(ttpIndex, 1);
        $scope.AKangyangTeachingPointsList.forEach((item, index, arr) => {
            item.id = index + 1;
        });
    }

    /* 添加B运动示教点 */
    $scope.addBKangyangTeachingPoint = function(){
        if($scope.kangyangPointName == null || $scope.kangyangPointName == ""){
            toastFactory.warning(pesDynamicTags.warning_messages[1]);
        }else{
            let pointname = $scope.kangyangPointName+$scope.BKangyangTeachingPointsFlag;
            let savePointCmd = {
                cmd: "save_point",
                data: {
                    "name":pointname,
                    "update_allprogramfile": 0
                },
            };
            dataFactory.actData(savePointCmd)
                .then(() => {
                    //保存成功后，示教点数组增加
                    $scope.BKangyangTeachingPointsFlag = $scope.BKangyangTeachingPointsFlag+1;
                    let kangyangElement = {
                        id: $scope.BKangyangTeachingPointsList.length + 1,
                        name: pointname,
                        motion: $scope.selectedKangyangMotion.name
                    };
                    $scope.BKangyangTeachingPointsList.push(kangyangElement);
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 删除B运动示教点 */
    $scope.deleteBkangyangTeachingPoint = function (ttpIndex) {
        $scope.BKangyangTeachingPointsList.splice(ttpIndex, 1);
        $scope.BKangyangTeachingPointsList.forEach((item, index, arr) => {
            item.id = index + 1;
        });
    }

    /* 添加C运动示教点 */
    $scope.addCKangyangTeachingPoint = function(){
        if($scope.kangyangPointName == null || $scope.kangyangPointName == ""){
            toastFactory.warning(pesDynamicTags.warning_messages[1]);
        }else{
            let pointname = $scope.kangyangPointName+$scope.CKangyangTeachingPointsFlag;
            let savePointCmd = {
                cmd: "save_point",
                data: {
                    "name":pointname,
                    "update_allprogramfile": 0
                },
            };
            dataFactory.actData(savePointCmd)
                .then(() => {
                    //保存成功后，示教点数组增加
                    $scope.CKangyangTeachingPointsFlag = $scope.CKangyangTeachingPointsFlag+1;
                    let kangyangElement = {
                        id: $scope.CKangyangTeachingPointsList.length + 1,
                        name: pointname,
                        motion: $scope.selectedKangyangMotion.name
                    };
                    $scope.CKangyangTeachingPointsList.push(kangyangElement);
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        }
    }

    /* 删除C运动示教点 */
    $scope.deleteCkangyangTeachingPoint = function (ttpIndex) {
        $scope.CKangyangTeachingPointsList.splice(ttpIndex, 1);
        $scope.CKangyangTeachingPointsList.forEach((item, index, arr) => {
            item.id = index + 1;
        });
    }

    //康养程序内容
    $scope.confirmKangyangTeachingPoints = function(){
        g_kangYangCycleIndex = [];
        $scope.kangyangFilePgvalue = "";
        if($scope.AKangyangTeachingPointsList.length>0){
            if($scope.motionACycleIndex == null || $scope.motionACycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[2]);
                return;
            }
            g_kangYangCycleIndex.push($scope.motionACycleIndex);
            $scope.kangyangFilePgvalue += "A = "+$scope.motionACycleIndex+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"A\")"+"\n";
        }
        if($scope.BKangyangTeachingPointsList.length>0){
            if($scope.motionBCycleIndex == null || $scope.motionBCycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[3]);
                return;
            }
            g_kangYangCycleIndex.push($scope.motionBCycleIndex);
            $scope.kangyangFilePgvalue += "B = "+$scope.motionBCycleIndex+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"B\")"+"\n";
        }
        if($scope.CKangyangTeachingPointsList.length>0){
            if($scope.motionCCycleIndex == null || $scope.motionCCycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[4]);
                return;
            }
            g_kangYangCycleIndex.push($scope.motionCCycleIndex);
            $scope.kangyangFilePgvalue += "C = "+$scope.motionCCycleIndex+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"C\")"+"\n";
        }
        if($scope.AKangyangTeachingPointsList.length>0){
            if($scope.motionACycleIndex == null || $scope.motionACycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[2]);
                return;
            }
            $scope.kangyangFilePgvalue += "while(A > 0)do"+"\n";
            $scope.kangyangFilePgvalue += "A = A-1"+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"A\")"+"\n";
            for(let i=0;i<$scope.AKangyangTeachingPointsList.length;i++){
                $scope.kangyangFilePgvalue += $scope.AKangyangTeachingPointsList[i].motion+"("+$scope.AKangyangTeachingPointsList[i].name+",30,0,0)"+"\n";
            }
            $scope.kangyangFilePgvalue += "end"+"\n";
        }
        if($scope.BKangyangTeachingPointsList.length>0){
            if($scope.motionBCycleIndex == null || $scope.motionBCycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[3]);
                return;
            }
            $scope.kangyangFilePgvalue += "while(B > 0)do"+"\n";
            $scope.kangyangFilePgvalue += "B = B-1"+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"B\")"+"\n";
            for(let i=0;i<$scope.BKangyangTeachingPointsList.length;i++){
                $scope.kangyangFilePgvalue += $scope.BKangyangTeachingPointsList[i].motion+"("+$scope.BKangyangTeachingPointsList[i].name+",30,0,0)"+"\n";
            }
            $scope.kangyangFilePgvalue += "end"+"\n";
        }
        if($scope.CKangyangTeachingPointsList.length>0){
            if($scope.motionCCycleIndex == null || $scope.motionCCycleIndex == ""){
                toastFactory.warning(pesDynamicTags.warning_messages[4]);
                return;
            }
            $scope.kangyangFilePgvalue += "while(C > 0)do"+"\n";
            $scope.kangyangFilePgvalue += "C = C-1"+"\n";
            $scope.kangyangFilePgvalue += "RegisterVar(\"number\",\"C\")"+"\n";
            for(let i=0;i<$scope.CKangyangTeachingPointsList.length;i++){
                $scope.kangyangFilePgvalue += $scope.CKangyangTeachingPointsList[i].motion+"("+$scope.CKangyangTeachingPointsList[i].name+",30,0,0)"+"\n";
            }
            $scope.kangyangFilePgvalue += "end";
        }
        sessionStorage.setItem('g_kangYangCycleIndex', JSON.stringify(g_kangYangCycleIndex));
        $("#kangyangPointsEditModal").modal('hide');
    }

    //获取用户文件
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
                hidePageLoading();
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[14]);
                hidePageLoading();
            });
    };

    // 保存文件时同名校验
    $scope.checkLuaSameName = function() {
        var newFileName = document.getElementById("kangyangFileName").value + ".lua";
        if (document.getElementById("kangyangFileName").value === "" || document.getElementById("kangyangFileName").value === undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[5]);
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
                        saveKangyangFile();
                        break;
                    case '1':
                        toastFactory.warning(pesDynamicTags.warning_messages[6]);
                        break;
                    case '2':
                        toastFactory.warning(pesDynamicTags.warning_messages[18] + pesDynamicTags.warning_messages[20]);
                        break;
                    case '3':
                        toastFactory.warning(pesDynamicTags.warning_messages[19] + pesDynamicTags.warning_messages[20]);
                        break;
                    default:
                        break;
                }
            }, (status) => {
                toastFactory.error(status, pesDynamicTags.error_messages[28]);
            });
        }
        
    }

    //保存示教文件
    function saveKangyangFile() {
        var newFileName = document.getElementById("kangyangFileName").value + ".lua";
        let saveCmd = {
            cmd: "save_lua_file",
            data: {
                name: newFileName,
                pgvalue: $scope.kangyangFilePgvalue,
                type: '1'
            },
        };
        dataFactory.actData(saveCmd)
            .then(() => {
                getUserFiles();
                /*保存文件内容程序示教直接打开*/
                g_fileNameForUpload = newFileName;
                g_fileDataForUpload = $scope.kangyangFilePgvalue;
                sessionStorage.setItem('kangyangtempname', newFileName);
                sessionStorage.setItem('kangyangtemppgvalue', $scope.kangyangFilePgvalue);
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 设置康养系统状态页面标志位 */
    $scope.setkangyangStatusPage = function () {
        var per_page_flag = 0;
        if(spFlag == 2){
            per_page_flag = 0;
        } else{
            per_page_flag = 2;
        }
        let cmdContent = {
            cmd: "set_status_flag",
            data: {
                page_flag: per_page_flag
            }
        };
        dataFactory.actData(cmdContent)
            .then((data) => {
                getStatusPageFlag();
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 展示康养状态页面 */
    $scope.showKangyangStatusPage = function () {
        if (spFlag == 2) {
            $("#kangyangStatusPage").show();
        } else {
            toastFactory.info(pesDynamicTags.info_messages[35]);
        }
    }


    /* 码垛系统配置 */
    /**
     * 获取当前系统码垛配方名称
     */
    function getPalletizingFormulaNameList() {
        let getFormulaNameCmd = {
            cmd:"get_palletizing_formula_list"
        }
        dataFactory.getData(getFormulaNameCmd)
            .then((data) => {
                $scope.palletizingFormulaList = data;
                if (data.length) {
                    isExistFormula = 1;
                } else {
                    isExistFormula = 0;
                }
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 选择进入码垛配置方式
     * @param {int} type 进入码垛配置方式，0-加载，1-创建
     */
    $scope.enterPalletizingConfig = function (type) {
        switch (type) {
            case 0:
                $scope.show_enterFormulaLoading = true;
                $scope.show_enterFormulaCreating = false;
                getPalletizingFormulaNameList();
                break;
            case 1:
                $scope.show_enterFormulaLoading = false;
                $scope.show_enterFormulaCreating = true;
                break;
            default:
                break;
        }
        $scope.show_startPalletizingConfgBtn = true;
    }

    /**
     * 码垛配方导入，模拟点击文件导入元素按钮
     */
    $scope.selectPalletizingFormulaFile = function () {
        $("#palletizingFormulaImport").click();
    }

    /**
     * 根据当前系统型号导出码垛配方
     * @param {string} palletizingFormulaName 码垛配方名称参数
     */
    $scope.exportPalletizingFormula = function (palletizingFormulaName) {
        if (g_systemFlag) {
            // linux
            window.location.href = "/action/download?pathfilename=/usr/local/etc/" + palletizingFormulaName + ".tar.gz";
        } else {
            // qnx
            window.location.href = "/action/download?pathfilename=/" + palletizingFormulaName + ".tar.gz";
        }
    }

    /**
     * 获取码垛参考点数据
     * @param {string} referencePointName 码垛工件参考点名称
     */
    function getPalletizingGripPoint(referencePointName) {
        let getCmd = {
            cmd: "get_points",
        }
        dataFactory.getData(getCmd)
            .then((data) => {
                if (data[referencePointName] == undefined) {
                    isSuccessSetGripPoint = 0;
                    toastFactory.error("403", "No data for reference point");    //报错：码垛参考点无数据
                } else {
                    gripPointData = data[referencePointName];
                    isSuccessSetGripPoint = 1;    // 码垛参考点数据获取到即为成功
                }
            }, (status) => {
                isSuccessSetGripPoint = 0;    // 指令失败
                toastFactory.error(status);
            });
    }

    /**
     * 负责解析码垛配方数据
     * @param {object} formulaData 码垛配方数据对象
     */
    function parsePalletizingFormulaData(formulaData) {
        if (!$.isEmptyObject(formulaData)) {
            // box config
            if (!$.isEmptyObject(formulaData.box_config)) {
                $scope.currentBoxLength = formulaData.box_config.length;
                $scope.currentBoxWidth = formulaData.box_config.width;
                $scope.currentBoxHeight = formulaData.box_config.height;
                $scope.currentBoxPayload = formulaData.box_config.payload;
                $scope.boxLength = formulaData.box_config.length;
                $scope.boxWidth = formulaData.box_config.width;
                $scope.boxHeight = formulaData.box_config.height;
                $scope.boxPayload = formulaData.box_config.payload;
                if (formulaData.box_config.grip_point != "") {
                    gripPointName = formulaData.box_config.grip_point;
                    getPalletizingGripPoint("pHome");  // 默认只按照pHome姿态作为放置点姿态参考（231117）
                }
                $scope.show_boxConfiguredTips = formulaData.box_config.flag ? true : false;
            }
            // pallet config
            if (!$.isEmptyObject(formulaData.pallet_config)) {
                $scope.currentPalletFront = formulaData.pallet_config.front;
                $scope.currentPalletSide = formulaData.pallet_config.side;
                $scope.currentPalletHeight = formulaData.pallet_config.height;
                $scope.palletFront = formulaData.pallet_config.front;
                $scope.palletSide = formulaData.pallet_config.side;
                $scope.palletHeight = formulaData.pallet_config.height;
                if (formulaData.pallet_config.left_pallet) {
                    $("#leftPalletStation").prop("checked", true);
                    $scope.leftPalletStationChecked = 1;
                } else {
                    $("#leftPalletStation").prop("checked", false);
                    $scope.leftPalletStationChecked = 0;
                }
                if (formulaData.pallet_config.right_pallet) {
                    $("#rightPalletStation").prop("checked", true);
                    $scope.rightPalletStationChecked = 1;
                } else {
                    $("#rightPalletStation").prop("checked", false);
                    $scope.rightPalletStationChecked = 0;
                }
                $scope.show_palletConfiguredTips = formulaData.pallet_config.flag ? true : false;
            }
            // device config
            if (!$.isEmptyObject(formulaData.device_config)) {
                $scope.currentEquipmentX = formulaData.device_config.x;
                $scope.currentEquipmentY = formulaData.device_config.y;
                $scope.currentEquipmentZ = formulaData.device_config.z;
                $scope.equipmentX = formulaData.device_config.x;
                $scope.equipmentY = formulaData.device_config.y;
                $scope.equipmentZ = formulaData.device_config.z;
                $scope.currentEquipmentAngle = formulaData.device_config.angle;
                $scope.equipmentAngle = formulaData.device_config.angle;
                $scope.show_deviceConfiguredTips = formulaData.device_config.flag ? true : false;
            }
            // pattern config
            if (!$.isEmptyObject(formulaData.pattern_config)) {
                $scope.currentLayersNumber = formulaData.pattern_config.layers;
                $scope.currentLayerSequence = formulaData.pattern_config.sequence;
                $scope.patternBEnable = formulaData.pattern_config.pattern_b_enable;
                $scope.boxGapPX = formulaData.pattern_config.box_gap;
                $scope.layersNumber = formulaData.pattern_config.layers;
                $scope.createLayersIndexArr();
                layerSequenceArr = formulaData.pattern_config.sequence.split(",");
                originPatternA = JSON.parse(formulaData.pattern_config.origin_pattern_a);
                originPatternB = JSON.parse(formulaData.pattern_config.origin_pattern_b);
                patternALeftMatrix = JSON.parse(formulaData.pattern_config.left_pattern_a);
                patternBLeftMatrix = JSON.parse(formulaData.pattern_config.left_pattern_b);
                patternARightMatrix = JSON.parse(formulaData.pattern_config.right_pattern_a);
                patternBRightMatrix = JSON.parse(formulaData.pattern_config.right_pattern_b);
                $scope.show_patternConfiguredTips = formulaData.pattern_config.flag ? true : false;
                if ($scope.patternBEnable) {
                    $("#patternBEnable").prop("checked", true);
                } else {
                    $("#patternBEnable").prop("checked", false);
                }
                // 模式A/模式B选择
                $("#patternEnableA").prop("checked", true);
                $scope.patternEnable = 'A';
                patternType = $scope.patternEnable;
                // 显示模式A配置单选
                $("#patternAShow").prop("checked", false);
                $scope.patternAShow = 0;
                checkPatternAShow = $scope.patternAShow;
                // console.log(typeof(formulaData.pattern_config.sequence), formulaData.pattern_config.sequence);
                // console.log(typeof(formulaData.pattern_config.pattern_a), formulaData.pattern_config.pattern_a);
                // console.log(typeof(JSON.parse(formulaData.pattern_config.pattern_b)), JSON.parse(formulaData.pattern_config.pattern_b));
            }
            // program config
            if (!$.isEmptyObject(formulaData.program_config)) {
                if (formulaData.program_config.flag == '[1, 1]') {
                    $scope.generateProgramMode = $scope.generateProgramModeList[0];
                    $scope.show_programGeneratedTips = true;
                } else if (formulaData.program_config.flag == '[1, 0]') {
                    $scope.generateProgramMode = $scope.generateProgramModeList[1];
                    $scope.show_programGeneratedTips = true;
                } else if (formulaData.program_config.flag == '[0, 1]') {
                    $scope.generateProgramMode = $scope.generateProgramModeList[2];
                    $scope.show_programGeneratedTips = true;
                } else {
                    $scope.generateProgramMode = null;
                    $scope.show_programGeneratedTips = false;
                }
            }
            // 默认自带码垛中间点需要在进行托盘配置时默认下发左工位示教点——lefttransitionpoint
            if (!$.isEmptyObject(formulaData.lefttransitionpoint)) {
                $scope.palletLeftTranPoint = formulaData.lefttransitionpoint;
            }
            // 默认自带码垛中间点需要在进行托盘配置时默认下发右工位示教点——righttransitionpoint
            if (!$.isEmptyObject(formulaData.righttransitionpoint)) {
                $scope.palletRightTranPoint = formulaData.righttransitionpoint;
            }
        } else {
            $scope.currentBoxLength = null;
            $scope.currentBoxWidth = null;
            $scope.currentBoxHeight = null;
            $scope.currentBoxPayload = null;
            $scope.boxLength = null;
            $scope.boxWidth = null;
            $scope.boxHeight = null;
            $scope.boxPayload = null;
            $scope.currentPalletFront = null;
            $scope.currentPalletSide = null;
            $scope.currentPalletHeight = null;
            $scope.palletFront = null;
            $scope.palletSide = null;
            $scope.palletHeight = null;
            $scope.currentEquipmentX = null;
            $scope.currentEquipmentY = null;
            $scope.currentEquipmentZ = null;
            $scope.currentEquipmentAngle = null;
            $scope.palletLeftTranPoint = {};
            $scope.palletRightTranPoint = {};
            $scope.leftPalletStationChecked = 0;
            $scope.rightPalletStationChecked = 0;
            $scope.generateProgramMode = null;
            $("#leftPalletStation").prop("checked", false);
            $("#rightPalletStation").prop("checked", false);
            $scope.currentLayersNumber = null;
            $scope.currentLayerSequence = "";
            $scope.patternBEnable = 0;
            $("#patternBEnable").prop("checked", false);
            // 模式A/模式B选择
            $("#patternEnableA").prop("checked", true);
            $scope.patternEnable = 'A';
            patternType = $scope.patternEnable;
            // 显示模式A配置单选
            $("#patternAShow").prop("checked", false);
            $scope.patternAShow = 0;
            checkPatternAShow = $scope.patternAShow;
            $scope.boxGapPX = 0;
            $scope.layersNumber = null;
            patternALeftMatrix = {};            // 模式A左工位点矩阵
            patternBLeftMatrix = {};            // 模式B左工位点矩阵
            patternARightMatrix = {};           // 模式A右工位点矩阵
            patternBRightMatrix = {};           // 模式B右工位点矩阵
            gripPointData = {};
            layerSequenceArr = [];
            originPatternA = [];
            originPatternB= [];
            $scope.layersPatternObj = [];
            isSuccessSetGripPoint = 0; 
            $scope.show_boxConfiguredTips = false;
            $scope.show_palletConfiguredTips = false;
            $scope.show_deviceConfiguredTips = false;
            $scope.show_patternConfiguredTips = false;
            $scope.show_programGeneratedTips = false;
        }
    }

    /**
     * 加载码垛配方
     * @param {string} palletizingFormulaName 码垛配方名称参数
     * @param {int} isNew 是否为创建码垛配方后加载
     */
    $scope.loadPalletizingFormula = function (palletizingFormulaName, isNew) {
        if (palletizingFormulaName == null || palletizingFormulaName == undefined || palletizingFormulaName == '') {
            toastFactory.info(pesDynamicTags.info_messages[68]);
            return;
        }
        let loadFormulaCmd = {
            cmd: "get_palletizing_formula",
            data: {
                name: palletizingFormulaName
            }
        }
        dataFactory.getData(loadFormulaCmd)
            .then((data) => {
                $scope.currentLoadedFormula = palletizingFormulaName;
                if (isNew) {
                    parsePalletizingFormulaData({});
                    $scope.show_formulaCreatedTips = true;
                    $scope.show_formulaLoadedTips = false;
                    $scope.palletLeftTranPoint = data.lefttransitionpoint;
                    $scope.palletRightTranPoint = data.righttransitionpoint;
                } else {
                    parsePalletizingFormulaData(data);
                    $scope.show_formulaCreatedTips = false;
                    $scope.show_formulaLoadedTips = true;
                }
                isPalletizingFormulaLoaded = 1;
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 创建码垛配方
     * @param {string} palletizingFormulaName 码垛配方名称参数
     * @param {int} inheritFlag 是否继承当前配方已有配置, 0-不继承，创建新的配方，1-继承，相当于只是重命名已有配方名称
     */
    $scope.createPalletizingFormula = function (palletizingFormulaName, inheritFlag) {
        let fullName = "palletizing_" + palletizingFormulaName;
        let createFormulaCmd = {
            cmd: "create_palletizing_formula",
            data: {
                name: fullName,
                inherit_flag: inheritFlag
            }
        }
        dataFactory.actData(createFormulaCmd)
            .then(() => {
                // 创建成功后执行加载创建配方操作
                $scope.loadPalletizingFormula(fullName, 1);
                $("#palletizingCreateFormulaWarning").modal("hide");
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 点击创建码垛配方按钮 */
    $scope.clickPalletizingCreateFormulaBtn = function () {
        if ($scope.inputedPalletizingFormulaName == null || $scope.inputedPalletizingFormulaName == undefined || $scope.inputedPalletizingFormulaName == '') {
            toastFactory.info(info_messages[63]);
            return;
        }
        if (isExistFormula) {
            // 存在码垛配方提示，二次确认
            $("#palletizingCreateFormulaWarning").modal();
        } else {
            // 不存在码垛配方直接创建
            $scope.createPalletizingFormula($scope.inputedPalletizingFormulaName, 0);
        }
    }

    /** 开始配置，进入码垛配置页 */
    $scope.startPalletizingConfig = function () {
        if (isPalletizingFormulaLoaded) {
            $scope.show_palletizingInitialPage = false;
            $scope.show_palletizingSettingPage = true;
            setPalletizinggrabPointAuto();
        } else {
            toastFactory.warning(pesDynamicTags.warning_messages[7]);
        }
    }

    /** 返回上一页，进入码垛配方导入导出与加载页面（初始页） */
    $scope.goBackPreviousPage = function () {
        $scope.show_palletizingInitialPage = true;
        $scope.show_palletizingSettingPage = false;
    }

    /** 打开码垛工件配置窗口 */
    $scope.openConfigBoxModal = function () {
        $("#palletizingBoxConfig").modal();
    }

    /** 设置码垛工件抓取示教点 */
    $scope.setPalletizingGripPoint = function () {
        // 组码垛抓取点名称
        gripPointName = $scope.currentLoadedFormula + "grippoint";
        // 发布设置码垛抓取点事件，在index.js中设置监听进行接收
        document.dispatchEvent(new CustomEvent('set-palletizing-grip-point', { bubbles: true, cancelable: true, composed: true, detail: gripPointName }));
    }
    /** 设置码垛工件抓取示教点成功事件监听 */
    document.getElementById('peripheral').addEventListener("savepoints", () => {
        // getPalletizingGripPoint($scope.currentLoadedFormula + "grippoint");
        if ($scope.show_palletizing) {
            getPalletizingGripPoint("pHome");
        }
        getOptionsData();
    });


    /**
     * 确认码垛工件配置下发
     * @param {int} boxLength 工件长度
     * @param {int} boxWidth 工件宽度
     * @param {int} boxHeight 工件高度
     * @param {float} boxPayload 工件负载
     * 工件抓取点名称来自变量：gripPointName
     */
    $scope.configureBox = function (boxLength, boxWidth, boxHeight, boxPayload) {
        if (boxLength == null || boxLength == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (boxWidth == null || boxWidth == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (boxHeight == null || boxHeight == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (isSuccessSetGripPoint) {
            let configBoxCmd = {
                cmd: "palletizing_config_box",
                data: {
                    length: boxLength,
                    width: boxWidth,
                    height: boxHeight,
                    payload: 0,
                    grip_point: gripPointName
                }
            }
            dataFactory.actData(configBoxCmd)
                .then(() => {
                    $("#palletizingBoxConfig").modal("hide");
                    $scope.show_boxConfiguredTips = true;
                    $scope.currentBoxLength = boxLength;
                    $scope.currentBoxWidth = boxWidth;
                    $scope.currentBoxHeight = boxHeight;
                    $scope.currentBoxPayload = boxPayload;
                    
                }, (status) => {
                    toastFactory.error(status);
                });
        } else {
            toastFactory.warning(pesDynamicTags.warning_messages[8]);
        }
    }

    /** 设置码垛左工位过渡点 */
    $scope.setLeftTransitionPoint = function () {
        // 组左工位过渡点名称
        leftTransitionPointName = $scope.currentLoadedFormula + "lefttransitionpoint";
        // 发布设置码垛左工位过渡点事件，在index.js中设置监听进行接收
        document.dispatchEvent(new CustomEvent('set-palletizing-transition-point', { bubbles: true, cancelable: true, composed: true, detail: leftTransitionPointName }));
    }

    /** 设置码垛右工位过渡点 */
    $scope.setRightTransitionPoint = function () {
        // 组右工位过渡点名称
        rightTransitionPointName = $scope.currentLoadedFormula + "righttransitionpoint";
        // 发布设置码垛右工位过渡点事件，在index.js中设置监听进行接收
        document.dispatchEvent(new CustomEvent('set-palletizing-transition-point', { bubbles: true, cancelable: true, composed: true, detail: rightTransitionPointName }));
    }

    /** 默认自带码垛中间点，配置时仅需示教一个抓取点 */
    function setPalletizinggrabPointAuto() {
        // 发布设置码垛右工位过渡点事件，在index.js中设置监听进行接收
        leftTransitionPointName = $scope.currentLoadedFormula + "lefttransitionpoint";
        rightTransitionPointName = $scope.currentLoadedFormula + "righttransitionpoint";
        checkTranPoint(leftTransitionPointName, 0, $scope.palletLeftTranPoint);
    };

    /**
     * 校验自动设置码垛左右工位点是否存在，已存在弹出是否覆盖提示，不存在下发计算指令后保存
     * @param {string} transitionName 左工位点：leftTransitionPointName；右工位点：rightTransitionPointName；
     * @param {number} currentTran 0：优先下发左工位点；1：成功保存左工位点后下发保存右工位点；
     * @param {Object} jointsData 保存工位点的关节数据
     */
    function checkTranPoint(transitionName, currentTran, jointsData) {
        currentAutoTransitionNum = currentTran;
        currentAutoTransitionJoint = jointsData;
        document.getElementById("savePoint").value = transitionName;
        $scope.pointName = document.getElementById("savePoint").value;
        let checkPointCmd = {
            cmd: "get_checkpoint",
            data: {
                name: $scope.pointName
            }
        };
        dataFactory.getData(checkPointCmd).then((data) => {
            if (~~data.result) {
                $scope.checkGlobalCoverPoint = 1;
                if (currentAutoTransitionNum == 0) {
                    checkTranPoint(rightTransitionPointName, 1, $scope.palletRightTranPoint);
                    $scope.palletizingStationLeft = true;
                } else {
                    $scope.palletizingStationRight = true;
                }
            } else {
                $scope.checkGlobalCoverPoint = 0;
                calcTCFPointJoint();
            }
        }, (status) => {
            toastFactory.error(status, pesDynamicTags.error_messages[24]);
        })
    }

    /** 默认自带码垛中间点，配置时仅需示教一个抓取点；当示教点不存在时，需要计算笛卡尔位姿后再下发保存 */
    function calcTCFPointJoint() {
        let loadclacTCFCmd = {
            cmd: 320,
            data: currentAutoTransitionJoint,
        }
        dataFactory.setData(loadclacTCFCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        })
    };
    document.getElementById('peripheral').addEventListener('320', e => {
        const result = JSON.parse(e.detail);
        if (!$.isEmptyObject(result)) {
            saveTCFPointJoint(result);
            if (currentAutoTransitionNum != 0) {
                currentAutoTransitionNum == 0;
            }
        }
    });

    /**
     * 码垛中间点保存
     * @param {Object} calcData 码垛中间点(计算笛卡尔位姿)
     */
    function saveTCFPointJoint(calcData) {
        let loadclacTCFCmd = {
            cmd: 'save_point_joint_TCF',
            data: {
                name: $scope.pointName,
                speed: $scope.velocity,
                elbow_speed: $scope.velocity,
                acc: $scope.acceleration,
                elbow_acc: $scope.acceleration,
                toolnum: $scope.currentCoord + "",
                workpiecenum: $scope.currentWobjCoord + "",
                j1: currentAutoTransitionJoint.j1,
                j2: currentAutoTransitionJoint.j2,
                j3: currentAutoTransitionJoint.j3,
                j4: currentAutoTransitionJoint.j4,
                j5: currentAutoTransitionJoint.j5,
                j6: currentAutoTransitionJoint.j6,
                x: calcData.x,
                y: calcData.y,
                z: calcData.z,
                rx: calcData.rx,
                ry: calcData.ry,
                rz: calcData.rz,
                E1: calcData.E1 ? calcData.E1 : '0',
                E2: calcData.E2 ? calcData.E2 : '0',
                E3: calcData.E3 ? calcData.E3 : '0',
                E4: calcData.E4 ? calcData.E4 : '0'
            }
        }
        dataFactory.actData(loadclacTCFCmd).then(() => {
            if (currentAutoTransitionNum == 0) {
                checkTranPoint(rightTransitionPointName, 1, $scope.palletRightTranPoint);
                $scope.palletizingStationLeft = true;
                toastFactory.success(pesDynamicTags.success_messages[10] + '(' + pesDynamicTags.info_messages[61] + ')');
            } else {
                $scope.palletizingStationRight = true;
                toastFactory.success(pesDynamicTags.success_messages[10] + '(' + pesDynamicTags.info_messages[62] + ')');
            }
        }, (status) => {
            if (currentAutoTransitionNum == 0) {
                toastFactory.error(status, pesDynamicTags.error_messages[23] + '(' + pesDynamicTags.info_messages[61] + ')');
            } else {
                toastFactory.error(status, pesDynamicTags.error_messages[23] + '(' + pesDynamicTags.info_messages[62] + ')');
            }
        })
    };

    /**
     * 打开码垛托盘配置窗口
     */
    $scope.openConfigPalletModal = function () {
        $("#palletizingPalletConfig").modal();
    }

    /**
     * 确认码垛托盘配置下发
     * @param {int} palletFront 托盘前边长度
     * @param {int} palletSide 托盘侧边长度
     * @param {int} palletHeight 托盘高度
     * @param {int} leftPalletStationChecked 左托盘工位选择
     * @param {int} rightPalletStationChecked 右托盘工位选择
     */
    $scope.configurePallet = function (palletFront, palletSide, palletHeight, leftPalletStationChecked, rightPalletStationChecked) {
        if (palletFront == null || palletFront == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (palletSide == null || palletSide == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (palletHeight == null || palletHeight == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (!leftPalletStationChecked && !rightPalletStationChecked) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        let configPalletCmd = {
            cmd: "palletizing_config_pallet",
            data: {
                front: palletFront,
                side: palletSide,
                height: palletHeight,
                left_pallet: leftPalletStationChecked,
                right_pallet: rightPalletStationChecked
            }
        }
        dataFactory.actData(configPalletCmd)
            .then(() => {
                $("#palletizingPalletConfig").modal("hide");
                $scope.show_palletConfiguredTips = true;
                $scope.currentPalletFront = palletFront;
                $scope.currentPalletSide = palletSide;
                $scope.currentPalletHeight = palletHeight;
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /** 依据层数创建层数模板对象数组 */
    $scope.createLayersIndexArr = function () {
        let arr = [];
        for (let i = 0; i < $scope.layersNumber; i++) {
            let item = {};
            item.index = i + 1;
            item.pattern = "";
            arr.push(item);
            $("#"+ item.index + 'A').prop("checked", false);
            $("#"+ item.index + 'B').prop("checked", false);
        }
        $scope.layersPatternObj = arr;
        layerSequenceArr = [];
        // console.log(JSON.stringify($scope.layersPatternObj));
    }

    /**
     * 选择层数对应模式
     * @param {int} layerIndex 层index编号（从1开始）
     * @param {string} pattern 层模式（A or B）
     */
    $scope.selectLayerPattern = function (layerIndex, pattern) {
        $scope.layersPatternObj[layerIndex - 1].pattern = pattern;
        layerSequenceArr[layerIndex - 1] = pattern;
        $("#"+ layerIndex + pattern).prop("checked", true);
    }

    /*打开码垛设备尺寸配置模态框 */
    $scope.openConfigEquipmentModal = function () {
        $("#palletizingEquipmentConfig").modal();
    };
    /**./打开码垛设备尺寸配置模态框 */
    /*码垛设备尺寸配置 */
    $scope.configureEquipment = function() {
        if ($scope.equipmentAngle == null || $scope.equipmentAngle == undefined || $scope.equipmentAngle == '') {
            $scope.equipmentAngle = $('#equipmentAngle')[0].value;
        }
        if ($scope.equipmentX && $scope.equipmentY && $scope.equipmentZ && $scope.equipmentAngle) {
            let configPalletCmd = {
                cmd: "palletizing_config_device",
                data: {
                    x: $scope.equipmentX,
                    y: $scope.equipmentY,
                    z: $scope.equipmentZ,
                    angle: $scope.equipmentAngle
                }
            };
            dataFactory.actData(configPalletCmd).then(() => {
                $("#palletizingEquipmentConfig").modal("hide");
                $scope.currentEquipmentX = $scope.equipmentX;
                $scope.currentEquipmentY = $scope.equipmentY;
                $scope.currentEquipmentZ = $scope.equipmentZ;
                $scope.currentEquipmentAngle = $scope.equipmentAngle;
                $scope.show_deviceConfiguredTips = true;
                toastFactory.success(pesDynamicTags.success_messages[8]);
            }, (status) => {
                $scope.show_deviceConfiguredTips = false;
                toastFactory.error(status, pesDynamicTags.error_messages[21]);
            });
        } else {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
        }
    };
    /**./码垛设备尺寸配置 */

    /** 码垛模式配置canvas类 */
    class palletizingPatternEdit {
        /**
         * 码垛模式配置构造函数
         * @param {int} palletFront 托盘前边长
         * @param {int} palletSide 托盘侧边长
         * @param {int} palletHeight 托盘高度
         * @param {int} boxLength 方块长度
         * @param {int} boxWidth 方块宽度
         * @param {int} boxHeight 方块高度
         * @param {number} baseX 底座X轴
         * @param {number} baseY 底座Y轴
         * @param {number} baseZ 底座Z轴
         * @param {number} baseAngle 底座偏移角度
         * @param {object} gripPoint 抓取点对象
         * @param {int} canvasWidth canvas宽度（可选）
         * @param {int} canvasHeight canvas高度（可选）
         * @param {object} ctx canvas context（可选）
         */
        constructor(palletFront, palletSide, palletHeight, boxLength, boxWidth, boxHeight, baseX, baseY, baseZ, baseAngle, gripPoint, canvasWidth, canvasHeight, ctx) {
            // 创建托盘编辑区域Html元素
            let canvasLabelRight = document.createElement('span');
            let canvasLabelLeft = document.createElement('span');
            canvasLabelRight.innerText = pesDynamicTags.info_messages[72] + "(Front)";
            canvasLabelLeft.innerText = pesDynamicTags.info_messages[73];
            this.canvasWidth = canvasWidth || 400;
            this.canvasHeight = canvasHeight || 350;
            this.patternDiv = document.querySelector('#palletizingPattern');
            this.patternCanvas = document.createElement('canvas');
            this.patternCanvas.setAttribute('id', 'patternCanvas');
            this.patternCanvas.setAttribute('width', this.canvasWidth);
            this.patternCanvas.setAttribute('height', this.canvasHeight);
            this.patternCanvas.innerHTML =
            `
                Canvas not supported
            `;
            this.patternDiv.appendChild(this.patternCanvas);
            this.patternDiv.appendChild(canvasLabelRight);
            this.patternDiv.appendChild(canvasLabelLeft);
            this.ctx = ctx || this.patternCanvas.getContext('2d');
            // 托盘模式编辑所需参数
            this.palletFront = palletFront;
            this.palletSide = palletSide;
            this.palletHeight = palletHeight;
            this.boxLength = boxLength;
            this.boxWidth = boxWidth;
            this.boxHeight = boxHeight;
            this.baseX = baseX;
            this.baseY = baseY;
            this.baseZ = baseZ;
            this.baseAngle = baseAngle;
            this.gripPoint = gripPoint;
            this.boxGapPX = 0;
            this.coe = 0.25;
            this.canvasPalletFront = 0;
            this.canvasPalletSide = 0;
            this.canvasBoxLength = 0;
            this.canvasBoxWidth = 0;
            this.selectedBox = {};
            this.selectedBoxIndex = null;
            lastAddedBox = {};
            this.boxsGroup = [];
            this.didCollideArr = [];
            this.patternALeftOriginMatrix = [];
            this.patternARightOriginMatrix = [];
            this.drawPoint = {x: 0, y: 0};
            this.originPoint = {x: 0, y: 0};
            this.palletColor = "rgb(219, 198, 45)";
            this.boxColor = "#66ccff"
        }

        /**
         * 析构函数
         * 将div#palletizingPattern元素下创建的子元素全部删除，
         * 在使用后，需将创建的实例变量赋值为null，断开变量对实例对象的引用，释放资源。
         * 例如：
         *     // 创建实例
         *     let instance = new palletizingPatternEdit(...);
         *     // 释放实例
         *     instance.destructor();
         *     instance = null;
         */
        destructor() {
            this.patternDiv.innerHTML = "";
        }

        /** 托盘模式编辑区域初始化 */
        init() {
            this.canvasPalletFront = this.palletFront * this.coe;
            this.canvasPalletSide = this.palletSide * this.coe;
            this.canvasBoxLength = this.boxLength * this.coe;
            this.canvasBoxWidth = this.boxWidth * this.coe;
            this.originPoint.x = (this.canvasWidth - this.canvasPalletFront) / 2;
            this.originPoint.y = (this.canvasHeight - this.canvasPalletSide) / 2;
            this.drawPoint = this.originPoint;
            // 当模式为B模式，且“显示模式A配置”按钮打开时，点击删除全部按钮，只删除B模式的点位数据（将this.boxGroup数组中的originPatternA保留）。所以此时需要执行redraw（）将模式A的点位重绘。
            if (patternType == 'B' && checkPatternAShow) {
                this.redraw();
            } else {
                this.drawPallet(this.originPoint.x, this.originPoint.y, this.canvasPalletFront, this.canvasPalletSide);       //绘制码垛托盘
            }
            this.bindEvent();
            this.drawArrow();
        }

        /**绘制码垛方向箭头 */
        drawArrow() {
            // 绘制竖向箭头
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvasWidth - 10, this.canvasHeight - 130);
            this.ctx.lineTo(this.canvasWidth -10, this.canvasHeight -10);
            this.ctx.stroke();
            // 绘制箭身
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvasWidth - 10, this.canvasHeight - 150);
            this.ctx.lineTo(this.canvasWidth - 5, this.canvasHeight - 130);
            this.ctx.lineTo(this.canvasWidth - 15, this.canvasHeight - 130);
            this.ctx.closePath();
            this.ctx.stroke();

            // 绘制横向箭头
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvasWidth - 140, this.canvasHeight - 10);
            this.ctx.lineTo(this.canvasWidth -10, this.canvasHeight -10);
            this.ctx.stroke();
            // 绘制箭身
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvasWidth - 160, this.canvasHeight - 10);
            this.ctx.lineTo(this.canvasWidth - 140, this.canvasHeight - 15);
            this.ctx.lineTo(this.canvasWidth - 140, this.canvasHeight - 5);
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.restore();

            this.ctx.fillStyle = 'red';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(pesDynamicTags.info_messages[71], this.canvasWidth - 140, this.canvasHeight - 15);
            this.ctx.restore();
        }

        /**
         * 绘制托盘
         * @param {int} x 托盘绘制点x，单位px
         * @param {int} y 托盘绘制点y，单位px
         * @param {int} f 托盘前边长度，单位px
         * @param {int} s 托盘侧边长度，单位px
         */
        drawPallet(x, y, f, s) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.fillStyle = this.palletColor;
            this.ctx.strokeRect(x, y, f, s);
            this.ctx.fillRect(x, y, f, s);
            this.ctx.restore();
        }

        /**
         * 绘制工件方块
         * @param {object} boxx 工件方块绘制点x，单位px
         * @param {int} x 工件方块绘制点x，单位px
         * @param {int} y 工件方块绘制点y，单位px
         * @param {int} fl 工件方块平行托盘前边长度，单位px
         * @param {int} sw 工件方块平行托盘侧边宽度，单位px
         */
        drawBox(box, color) {
            let textX;
            let textY;
            if (box.index > 9) {
                textX = box.x + (box.fl)/2 - 24;
                textY = box.y + (box.sw)/2 + 8;
            } else {
                textX = box.x + (box.fl)/2 - 16;
                textY = box.y + (box.sw)/2 + 8;
            }
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.fillStyle = color || this.boxColor;
            if (box.type == 'B' && checkPatternAShow && color != 'red' && color != 'green') {
                this.ctx.globalAlpha = boxTransparency;
            } else {
                this.ctx.globalAlpha = 1;
            }
            this.ctx.strokeRect(box.x, box.y, box.fl, box.sw);
            this.ctx.fillRect(box.x, box.y, box.fl, box.sw);
            this.ctx.restore();
            // 设置工件序号，字体为白色（该步骤一定要放在restore()方法之后，不然工件序号会显示在工件背景色下方）
            this.ctx.fillStyle = 'white';
            this.ctx.font = '900 28px Arial';
            this.ctx.fillText(box.type + box.index, textX, textY, box.sw);
        }

        /**
         * 判断拖动的工件方块是否超出Canvas边界，超出进行修正
         * @param {object} obj 工件方块对象
         */
        judgePosition(obj) {
            obj.x = obj.x < 0 ? 0 : (obj.x + obj.fl) < this.canvasWidth ? obj.x : this.canvasWidth - obj.fl;
            obj.y = obj.y < 0 ? 0 : (obj.y + obj.sw) < this.canvasHeight ? obj.y : this.canvasHeight - obj.sw;
            // obj.x = obj.x < this.originPoint.x ? this.originPoint.x : (obj.x + obj.fl) < this.originPoint.x + this.canvasPalletFront ? obj.x : this.originPoint.x + this.canvasPalletFront - obj.fl;
            // obj.y = obj.y < this.originPoint.y ? this.originPoint.y : (obj.y + obj.sw) < this.originPoint.y + this.canvasPalletSide ? obj.y : this.originPoint.y + this.canvasPalletSide - obj.sw;
        }

        // windowToCanvas(cx, cy) {
        //     let bbox = this.patternCanvas.getBoundingClientRect();
        //     console.log(this.patternCanvas.width, bbox.width, this.patternCanvas.width / bbox.width);
        //     console.log(this.patternCanvas.height, bbox.height, this.patternCanvas.height / bbox.height);
        //     return {
        //       x: cx - bbox.left * (this.patternCanvas.width / bbox.width),
        //       y: cy - bbox.top * (this.patternCanvas.height / bbox.height)
        //     //   x: cx - bbox.left,
        //     //   y: cy - bbox.top
        //     }
        // }

        /**
         * 鼠标按下事件（选中Canvas中工件方块）
         * @param {object} e 事件对象 
         */
        mouseDown(e) {
            e.preventDefault();
            // console.log("mouse down", e);
            this.isMouseDown = true;
            // console.log(this.windowToCanvas(e.clientX, e.clientY));
            // console.log(e.offsetX, e.offsetY);
            // let {x, y} = this.windowToCanvas(e.clientX, e.clientY);
            // console.log(this.boxsGroup);
            // this.boxsGroup.forEach((item, index, arr) => {
            //     let inBoxX = item.x > e.offsetX ? 0 : item.x + item.fl > e.offsetX ? 1 : 0;
            //     let inBoxY = item.y > e.offsetY ? 0 : item.y + item.sw > e.offsetY ? 1 : 0;
            //     if (inBoxX && inBoxY) {
            //         // 选中
            //         this.selectedBox = item;
            //         this.inBoxWidth = e.offsetX - item.x;
            //         this.inBoxHeight = e.offsetY - item.y;
            //         // console.log(this.selectedBox);
            //     }
            // });
            for (let i = this.boxsGroup.length - 1; i >= 0; i--) {
                let inBoxX = this.boxsGroup[i].x > e.offsetX ? 0 : this.boxsGroup[i].x + this.boxsGroup[i].fl > e.offsetX ? 1 : 0;
                let inBoxY = this.boxsGroup[i].y > e.offsetY ? 0 : this.boxsGroup[i].y + this.boxsGroup[i].sw > e.offsetY ? 1 : 0;
                if (inBoxX && inBoxY) {
                    // 选中
                    this.selectedBox = this.boxsGroup[i];
                    this.selectedBoxIndex = i;
                    this.inBoxWidth = e.offsetX - this.boxsGroup[i].x;
                    this.inBoxHeight = e.offsetY - this.boxsGroup[i].y;
                    // console.log(this.selectedBox);
                    break;
                } else {
                    // 未选中
                    this.selectedBox = {};
                    this.selectedBoxIndex = null;
                    this.inBoxWidth = null;
                    this.inBoxHeight = null;
                }
            }
            this.redraw();
        }

        /**
         * 鼠标移动事件
         * @param {object} e 事件对象
         * @returns 
         */
        mouseMove(e) {
            e.preventDefault();
            // console.log("mouse move", e);
            if (this.isMouseDown) {
                // console.log(this.windowToCanvas(e.clientX, e.clientY));
                // let {x, y} = this.windowToCanvas(e.clientX, e.clientY);
                // this.clearPallet();
                // this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                // this.drawPallet(this.originPoint.x, this.originPoint.y, this.canvasPalletFront, this.canvasPalletSide);
                // console.log(this.selectedBox);
                if (!$.isEmptyObject(this.selectedBox)) {
                    this.selectedBox.x = e.offsetX - this.inBoxWidth;
                    this.selectedBox.y = e.offsetY - this.inBoxHeight;
                    this.judgePosition(this.selectedBox);
                    this.detectCollision();
                    this.redraw();
                }
            } else {
                return;
            }
        }

        /**
         * 鼠标抬起事件
         * @param {object} e 事件对象
         */
        mouseUp(e) {
            e.preventDefault();
            // console.log("mouse up", e);
            this.isMouseDown = false;
        }

        /**
         * 鼠标移出Canvas事件
         * @param {object} e 事件对象
         */
        mouseOut(e) {
            e.preventDefault();
            // console.log("mouse out", e);
            this.isMouseDown = false;
        }

        /** Canvas绑定事件 */
        bindEvent() {
            this.patternCanvas.addEventListener("mousedown", (e) => this.mouseDown(e));
            this.patternCanvas.addEventListener("mousemove", (e) => this.mouseMove(e));
            this.patternCanvas.addEventListener("mouseup", (e) => this.mouseUp(e));
            this.patternCanvas.addEventListener("mouseout", (e) => this.mouseOut(e));
        }

        /** 添加工件方块（依据已选工件方块） */
        addBox() {
            let refBox = {};
            let boxItem = {};
            // 是否超限值初始化，默认不超出托盘范围
            let inBounds = {
                inBoundX: 1,
                inBoundY: 1,
            };
            let boxIndex = this.boxsGroup.length + 1;
            // 判断当前是否为第一个工件方块
            if ($.isEmptyObject(lastAddedBox)) {
                // 是第一个方块，将已初始化的托盘绘制点赋值即可
                boxItem.x = this.drawPoint.x;
                boxItem.y = this.drawPoint.y;
                boxItem.fl = this.canvasBoxLength;
                boxItem.sw = this.canvasBoxWidth;
                boxItem.isRotated = 0;
                boxItem.index = boxIndex++;
                boxItem.type = patternType;
            } else {
                // 不是第一个方块，则依据已选工件方块数据，若无已选工件方块则为上一次添加的工件方块
                refBox = $.isEmptyObject(this.selectedBox) ? lastAddedBox : this.selectedBox;
                // console.log(refBox);
                // 新工件方块是否会超出托盘边界
                boxItem.x = refBox.x + refBox.fl + this.boxGapPX;
                boxItem.y = refBox.y + refBox.sw + this.boxGapPX;
                inBounds = this.detectOutPalletBounds(boxItem.x, boxItem.y);
                // console.log(inBounds);
                if (inBounds.inBoundX && inBounds.inBoundY) {
                    boxItem.y = refBox.y;
                } else if (!inBounds.inBoundX && inBounds.inBoundY) {
                    boxItem.x = this.originPoint.x;
                } else if (inBounds.inBoundX && !inBounds.inBoundY) {
                    boxItem.y = refBox.y;
                } else {
                    toastFactory.warning(pesDynamicTags.warning_messages[17]);
                }
                boxItem.fl = refBox.fl;
                boxItem.sw = refBox.sw;
                boxItem.isRotated = refBox.isRotated;
                boxItem.index = boxIndex++;
                boxItem.type = patternType;
            }
            if (inBounds.inBoundX || inBounds.inBoundY ) {
                // 绘制工件方块
                this.drawBox(boxItem);
                // 存储绘制方块数据
                this.boxsGroup.push(boxItem);
                lastAddedBox = boxItem;
                // console.log("addbox:" + JSON.stringify(lastAddedBox));
                // console.log("addbox_boxsGroup:" + JSON.stringify(this.boxsGroup));
            }
            this.detectAllCollision();
            if (this.didCollideArr.length > 0) {
                patternDraw = true;
            } else {
                patternDraw = false;
            }
            this.redraw();
        }

        /** 旋转选中的工件方块对象 */
        rotateBox() {
            if (!$.isEmptyObject(this.selectedBox)) {
                if (this.boxLength != this.boxWidth) {
                    this.selectedBox.fl = [this.selectedBox.sw, this.selectedBox.sw = this.selectedBox.fl][0];
                    // console.log(JSON.stringify(this.boxsGroup));
                    this.selectedBox.isRotated = 1^this.selectedBox.isRotated;
                    this.detectCollision();
                    this.redraw();
                } else {
                    toastFactory.info(pesDynamicTags.info_messages[64]);
                }
            } else {
                toastFactory.warning(pesDynamicTags.warning_messages[12]);
            }
        }

        /** 删除选中的工件方块对象 */
        deletebox() {
            if (this.selectedBoxIndex != null) {
                this.boxsGroup.splice(this.selectedBoxIndex, 1);
                if (this.didCollideArr.length) {
                    this.didCollideArr = [];
                    this.detectAllCollision();
                }
                if (this.didCollideArr.length > 0) {
                    patternDraw = true;
                } else {
                    patternDraw = false;
                }
                // 如果选择的方块是最后一个，则上次已添加的方块向前移一位
                if (this.selectedBoxIndex == this.boxsGroup.length) {
                    lastAddedBox = this.boxsGroup[this.selectedBoxIndex - 1];
                    // console.log(lastAddedBox);
                } 
                // 如果删除的是最后一个方块，则上次清空上次已添加的方块对象变量
                if (!this.boxsGroup.length) {
                    lastAddedBox = {};
                }
                // 清空已选方块对象变量
                this.selectedBox = {};
                this.selectedBoxIndex = null;
                this.inBoxWidth = null;
                this.inBoxHeight = null;
                this.redraw();
            } else {
                toastFactory.warning(pesDynamicTags.warning_messages[12]);
            }
        }

        /**
         * 选中工件方块后输入行列执行批量添加
         * @param {int} rows 
         * @param {int} columns 
         */
        addBoxsInBatches(rows, columns) {
            if (!$.isEmptyObject(this.selectedBox)) {
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < columns; j++) {
                        if (i || j) {
                            let newBox = {};
                            newBox.x = this.selectedBox.x + this.selectedBox.fl * j;
                            newBox.y = this.selectedBox.y + this.selectedBox.sw * i;
                            newBox.fl = this.selectedBox.fl;
                            newBox.sw = this.selectedBox.sw;
                            newBox.isRotated = this.selectedBox.isRotated;
                            newBox.type = patternType;
                            this.boxsGroup.push(newBox);
                        }
                    }
                }
                // 批量添加时也需要验证碰撞检测
                this.detectAllCollision();
                if (this.didCollideArr.length > 0) {
                    patternDraw = true;
                } else {
                    patternDraw = false;
                }
                // console.log("boxsGroup:" + JSON.stringify(this.boxsGroup));
                this.redraw();
            } else {
                toastFactory.warning(pesDynamicTags.warning_messages[12]);
            }
        }

        /**
         * 检测新增的工件方块是否会超出托盘边界
         * @param {int} x 新工件方块绘制点x
         * @param {int} y 新工件方块绘制点y
         */
        detectOutPalletBounds(x, y) {
            let inBoundX = (x - this.originPoint.x + this.canvasBoxLength) <= this.canvasPalletFront ? 1 : 0;
            let inBoundY = (y - this.originPoint.y + this.canvasBoxWidth) <= this.canvasPalletSide ? 1 : 0;
            return {
                inBoundX: inBoundX,
                inBoundY: inBoundY
            };
        }

        /** 方块之间的碰撞检测--遍历所有方块 */
        detectAllCollision() {
            this.boxsGroup.forEach((item, itemIndex) => {
                this.boxsGroup.forEach((element, elementIndex) => {
                    if (itemIndex != elementIndex && item.type == element.type) {
                        let hor = element.x + element.fl > item.x && element.x < item.x + item.fl;
                        let ver = element.y < item.y + item.sw && element.y + element.sw > item.y;
                        if (hor && ver) {
                            if (this.didCollideArr.every(didItem => didItem != elementIndex)) {
                                this.didCollideArr.push(elementIndex);
                                if (this.didCollideArr.indexOf(itemIndex) == -1) {
                                    this.didCollideArr.push(itemIndex);
                                }
                            }
                        }
                    }
                })
            })
        }

        /** 方块之间的碰撞检测--当前选中 */
        detectCollision() {
            this.boxsGroup.forEach((item, index) => {
                if (this.selectedBoxIndex != index && item.type == this.selectedBox.type) {
                    let hor = item.x + item.fl > this.selectedBox.x && item.x < this.selectedBox.x + this.selectedBox.fl;
                    let ver = item.y < this.selectedBox.y + this.selectedBox.sw && item.y + item.sw > this.selectedBox.y;
                    if (hor && ver) {
                        if (this.didCollideArr.every(item => item != index)) {
                            this.didCollideArr.push(index);
                            if (this.didCollideArr.indexOf(this.selectedBoxIndex) == -1) {
                                this.didCollideArr.push(this.selectedBoxIndex);
                            }
                        }
                    } else {
                        if (this.didCollideArr.indexOf(index) != -1) {
                            this.didCollideArr.splice(this.didCollideArr.indexOf(index), 1);
                            if (this.didCollideArr.length == 1) {
                                this.didCollideArr.splice(this.didCollideArr.indexOf(this.selectedBoxIndex), 1);
                            }
                        }
                    }
                }
            });
            this.detectAllCollision();
            if (this.didCollideArr.length > 0) {
                patternDraw = true;
            } else {
                patternDraw = false;
            }
        }

        /**
         * 计算右工件盒子中心点，单位：mm   400 790 1070
         * @param {Object} boxItem 右工件方块对象
         */
        calculateRightBoxCenterPoint(boxItem) {
            let rightCenterPoint = {};
            rightCenterPoint.cx = ((boxItem.fl / 2 + boxItem.x) - this.originPoint.x) / this.coe;
            rightCenterPoint.cy = ((boxItem.sw / 2 + boxItem.y) - this.originPoint.y) / this.coe;
            rightCenterPoint.cz = this.boxHeight;
            return rightCenterPoint;
        }

        /**
         * 计算左工件盒子中心点，单位：mm   400 790 1070
         * @param {Object} boxItem 左工件方块对象
         */
        calculateLeftBoxCenterPoint(boxItem) {
            let leftCenterPoint = {};
            leftCenterPoint.cx = ((this.originPoint.x + this.canvasPalletFront) - (boxItem.fl / 2 + boxItem.x)) / this.coe;
            leftCenterPoint.cy = ((boxItem.sw / 2 + boxItem.y) - this.originPoint.y) / this.coe;
            leftCenterPoint.cz = this.boxHeight;
            return leftCenterPoint;
        }

        /**
         * 工件方块按距离排序（冒泡排序）
         * @param {array} arrD 工件方块中心点到原点距离数组
         * @param {array} arr 工件中心点数组
         * @returns arr 返回依据距离排序后的工件中心点数组
         */
        bobbleSort(arrD, arr, boxs) {
            for (let i = 0; i < arrD.length; i++) {
                for (let j = 0; j < arrD.length - 1 - i; j++) {
                    if (arrD[j] < arrD[j+1]) {
                        arrD[j] = [arrD[j+1], arrD[j+1] = arrD[j]][0];
                        arr[j] = [arr[j+1], arr[j+1] = arr[j]][0];
                        if (boxs != undefined) {
                            boxs[j] = [boxs[j+1], boxs[j+1] = boxs[j]][0];
                        }
                    }
                }
            }

            return arr;
        }

        /**
         * 根据右工位canvas镜像计算左工位方块的原始点位数据
         * @param {array} rightArray 右工位原始点位数据
         * @returns 
         */
        createPatternLeftPoint(rightArray) {
            // console.log(rightArray, 'rightArray');
            let leftArray = [];
            rightArray.forEach(item => {
                leftArray.push({
                    fl: item.fl,
                    index: item.index,
                    isRotated: item.isRotated,
                    sw: item.sw,
                    type: item.type,
                    x: this.canvasWidth/2 + (this.canvasWidth/2 - item.x) -item.fl,
                    y: item.y
                })
            });
            return leftArray;
        }

        /**
         * 计算所有的右工件方块的放置点坐标
         * @returns ppMatrix
         */
        createPatternRightPointsMatrix(patternData) {
            let ppRightMatrix = {},
                tempRightMatrix = [],
                tempRightDistance = [];
            // let diff_X = Math.round((-790)*Math.cos(Math.PI/180*(-30)) - (-400)*Math.sin(Math.PI/180*(-30)));
            // let diff_Y = Math.round((-790)*Math.sin(Math.PI/180*(-30)) + (-400)*Math.cos(Math.PI/180*(-30)));
                // diff_X = Math.round((-790)*Math.cos(Math.PI/180*60) + (400)*Math.sin(Math.PI/180*60)),
                // diff_Y = Math.round((-790)*Math.cos(Math.PI/180*60) - (400)*Math.sin(Math.PI/180*60));
            // console.log(diff_X, diff_Y);
            this.rightBoxsGroup = [];
            this.patternARightOriginMatrix = [];
            patternData.forEach(item => {
                let rightPointArr = [],
                    tempRightPointArr = [];
                let rcp = this.calculateRightBoxCenterPoint(item);
                // console.log(rcp, 'rcp');

                // 创建码垛右工位矩阵点位
                rightPointArr.push(rcp.cx);                                   // x--工件方块中心点x
                rightPointArr.push(rcp.cy);                                   // y--工件方块中心点y
                rightPointArr.push(rcp.cz);                                   // z--工件方块中心点z（托盘高度+工件高度）
                rightPointArr.push(parseFloat(this.gripPoint.rx));           // rx--暂时使用抓取点的rx
                rightPointArr.push(parseFloat(this.gripPoint.ry));           // ry--暂时使用抓取点的ry
                tempRightPointArr.push(rcp.cx);                               // x--工件方块中心点x
                tempRightPointArr.push(rcp.cy);                               // y--工件方块中心点y
                tempRightPointArr.push(rcp.cz);                               // z--工件方块中心点z（托盘高度+工件高度）
                tempRightPointArr.push(parseFloat(this.gripPoint.rx));       // rx--暂时使用抓取点的rx
                tempRightPointArr.push(parseFloat(this.gripPoint.ry));       // ry--暂时使用抓取点的ry
                // 如果工件方块进行了旋转，则进行rz减去90度（工具坐标系）
                if (item.isRotated) {                                   
                    if (parseFloat(this.gripPoint.rz) >= 0) {
                        rightPointArr.push(parseFloat(this.gripPoint.rz) - 90);          // rz--暂时使用抓取点的rz
                        tempRightPointArr.push(parseFloat(this.gripPoint.rz) - 90);      // rz--暂时使用抓取点的rz
                    } else {
                        rightPointArr.push(parseFloat(this.gripPoint.rz) + 90);          // rz--暂时使用抓取点的rz
                        tempRightPointArr.push(parseFloat(this.gripPoint.rz) + 90);      // rz--暂时使用抓取点的rz
                    }
                } else {
                    rightPointArr.push(parseFloat(this.gripPoint.rz));               // rz--暂时使用抓取点的rz
                    tempRightPointArr.push(parseFloat(this.gripPoint.rz));           // rz--暂时使用抓取点的rz
                }

                this.patternARightOriginMatrix.push(rightPointArr);
                tempRightDistance.push(Math.sqrt(Math.pow(rightPointArr[0], 2) + Math.pow(rightPointArr[1], 2)));
                
                let tempRightX = Math.round((tempRightPointArr[1] - Number(this.baseX))*Math.cos(Math.PI/180*(Number(this.baseAngle))) - (tempRightPointArr[0] + Number(this.baseY))*Math.sin(Math.PI/180*(Number(this.baseAngle))));
                let tempRightY = Math.round((tempRightPointArr[1] - Number(this.baseX))*Math.sin(Math.PI/180*(Number(this.baseAngle))) + (tempRightPointArr[0] + Number(this.baseY))*Math.cos(Math.PI/180*(Number(this.baseAngle))));
                // let tempRightX = -790 + tempRightPointArr[1];
                // let tempRightY = 400 + tempRightPointArr[0];
                tempRightPointArr[0] = tempRightX;
                tempRightPointArr[1] = tempRightY;
                tempRightPointArr[2] = tempRightPointArr[2] - Number(this.baseZ);
                tempRightMatrix.push(tempRightPointArr);

                this.rightBoxsGroup.push(item);
            });
            ppRightMatrix["1"] = tempRightMatrix;
            // 右工位点位排序
            // ppRightMatrix["1"] = this.bobbleSort(tempRightDistance, tempRightMatrix, this.rightBoxsGroup);
            // console.log(JSON.stringify(this.rightBoxsGroup));
            // console.log(JSON.stringify(this.patternARightOriginMatrix));

            return ppRightMatrix;
        }

        /**
         * 计算所有的左工件方块的放置点坐标
         * @returns ppMatrix
         */
        createPatternLeftPointsMatrix(patternData) {
            let ppLeftMatrix = {},
                tempLeftMatrix = [],
                tempLeftDistance = [];
            // let diff_X = Math.round((-790)*Math.cos(Math.PI/180*(-30)) - (-400)*Math.sin(Math.PI/180*(-30)));
            // let diff_Y = Math.round((-790)*Math.sin(Math.PI/180*(-30)) + (-400)*Math.cos(Math.PI/180*(-30)));
                // diff_X = Math.round((-790)*Math.cos(Math.PI/180*60) + (400)*Math.sin(Math.PI/180*60)),
                // diff_Y = Math.round((-790)*Math.cos(Math.PI/180*60) - (400)*Math.sin(Math.PI/180*60));
            // console.log(diff_X, diff_Y);
            this.leftBoxsGroup = [];
            this.patternALeftOriginMatrix = [];
            patternData.forEach(item => {
                let leftPointArr = [],
                    tempLeftPointArr = [];
                let lcp = this.calculateLeftBoxCenterPoint(item);
                // console.log(lcp, 'lcp');
                // 创建码垛左工位矩阵点位
                leftPointArr.push(lcp.cx);                                   // x--工件方块中心点x
                leftPointArr.push(lcp.cy);                                   // y--工件方块中心点y
                leftPointArr.push(lcp.cz);                                   // z--工件方块中心点z（托盘高度+工件高度）
                leftPointArr.push(parseFloat(this.gripPoint.rx));           // rx--暂时使用抓取点的rx
                leftPointArr.push(parseFloat(this.gripPoint.ry));           // ry--暂时使用抓取点的ry
                tempLeftPointArr.push(lcp.cx);                               // x--工件方块中心点x
                tempLeftPointArr.push(lcp.cy);                               // y--工件方块中心点y
                tempLeftPointArr.push(lcp.cz);                               // z--工件方块中心点z（托盘高度+工件高度）
                tempLeftPointArr.push(parseFloat(this.gripPoint.rx));       // rx--暂时使用抓取点的rx
                tempLeftPointArr.push(parseFloat(this.gripPoint.ry));       // ry--暂时使用抓取点的ry
                // 如果工件方块进行了旋转，则进行rz减去90度（工具坐标系）
                if (item.isRotated) {                                   
                    if (parseFloat(this.gripPoint.rz) >= 0) {
                        leftPointArr.push(parseFloat(this.gripPoint.rz) + 90);          // rz--暂时使用抓取点的rz
                        tempLeftPointArr.push(parseFloat(this.gripPoint.rz) + 90);      // rz--暂时使用抓取点的rz
                    } else {
                        leftPointArr.push(parseFloat(this.gripPoint.rz) - 90);          // rz--暂时使用抓取点的rz
                        tempLeftPointArr.push(parseFloat(this.gripPoint.rz) - 90);      // rz--暂时使用抓取点的rz
                    }
                } else {
                    leftPointArr.push(parseFloat(this.gripPoint.rz));               // rz--暂时使用抓取点的rz
                    tempLeftPointArr.push(parseFloat(this.gripPoint.rz));           // rz--暂时使用抓取点的rz
                }

                this.patternALeftOriginMatrix.push(leftPointArr);
                tempLeftDistance.push(Math.sqrt(Math.pow(leftPointArr[0], 2) + Math.pow(leftPointArr[1], 2)));
                
                let tempLeftX = Math.round((tempLeftPointArr[1] - Number(this.baseX))*Math.cos(Math.PI/180*(Number(this.baseAngle))) - (-tempLeftPointArr[0] - Number(this.baseY))*Math.sin(Math.PI/180*(Number(this.baseAngle))));
                let tempLeftY = Math.round((tempLeftPointArr[1] - Number(this.baseX))*Math.sin(Math.PI/180*(Number(this.baseAngle))) + (-tempLeftPointArr[0] - Number(this.baseY))*Math.cos(Math.PI/180*(Number(this.baseAngle))));
                // let tempLeftX = -790 + tempLeftPointArr[1];
                // let tempLeftY = -400 - tempLeftPointArr[0];
                tempLeftPointArr[0] = tempLeftX;
                tempLeftPointArr[1] = tempLeftY;
                tempLeftPointArr[2] = tempLeftPointArr[2] - Number(this.baseZ);
                tempLeftMatrix.push(tempLeftPointArr);

                this.leftBoxsGroup.push(item);
            });
            ppLeftMatrix["1"] = tempLeftMatrix;
            // 左工位点位排序
            // ppLeftMatrix["1"] = this.bobbleSort(tempLeftDistance, tempLeftMatrix, this.leftBoxsGroup);
            // console.log(JSON.stringify(this.leftBoxsGroup));
            // console.log(JSON.stringify(this.patternALeftOriginMatrix));

            return ppLeftMatrix;
        }

        /**
         * 点位矩阵旋转变换
         * @param {object} ppMatrix 模式A点位矩阵
         * @param {int} angle 矩阵变换角度 
         * @returns rppRightMatrix
         */
        rotatePatternPointsMatrix(angle) {
            let rppLeftMatrix = {},
                tempRLeftDistance = [],
                tempRLeftMatrix = [],
                rppRightMatrix = {},
                tempRRightDistance = [],
                tempRRightMatrix = [];
            // 计算码垛模式A旋转中心点
            let leftCenterPoint = {
                x: (this.canvasPalletFront - (((this.leftBoxsGroup[this.leftBoxsGroup.length-1].x + this.leftBoxsGroup[this.leftBoxsGroup.length-1].fl) - this.leftBoxsGroup[0].x) / 2)) / this.coe, 
                y: (((this.leftBoxsGroup[0].y + this.leftBoxsGroup[0].sw) - this.leftBoxsGroup[this.leftBoxsGroup.length-1].y) / 2) / this.coe
            };
            // console.log(leftCenterPoint);
            // console.log(-Number(this.baseX) + leftCenterPoint.y);
            // console.log(-Number(this.baseY) - leftCenterPoint.x);
            
            // let rightCenterPoint = {
            //     x: (((this.boxs[this.boxs.length-1].x + this.boxs[this.boxs.length-1].fl) - this.boxs[0].x) / 2) / this.coe, 
            //     y: (((this.boxs[0].y + this.boxs[0].sw) - this.boxs[this.boxs.length-1].y) / 2) / this.coe
            // };
            let rightCenterPoint = {
                x: (this.rightBoxsGroup[0].x + this.rightBoxsGroup[0].fl - this.rightBoxsGroup[this.rightBoxsGroup.length-1].x) / 2 / this.coe, 
                y: (this.rightBoxsGroup[0].y + this.rightBoxsGroup[0].sw - this.rightBoxsGroup[this.rightBoxsGroup.length-1].y) / 2 / this.coe
            };
            // console.log(rightCenterPoint);
            // console.log(-Number(this.baseX) + rightCenterPoint.y);
            // console.log(-Number(this.baseY) + rightCenterPoint.x);
            // 码垛模式A左工位原始点位依次按旋转点旋转
            this.patternALeftOriginMatrix.forEach(item => {
                let a = [];
                a[0] = Math.round((item[0] - leftCenterPoint.x)*Math.cos(Math.PI/180*angle) - (item[1] - leftCenterPoint.y)*Math.sin(Math.PI/180*angle) + leftCenterPoint.x);
                a[1] = Math.round((item[0] - leftCenterPoint.x)*Math.sin(Math.PI/180*angle) + (item[1] - leftCenterPoint.y)*Math.cos(Math.PI/180*angle) + leftCenterPoint.y);
                a[2] = item[2];
                a[3] = item[3];
                a[4] = item[4];
                a[5] = item[5];
                // 点位旋转后距离计算
                tempRLeftDistance.push(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2)));
                // 旋转后点位依据实际基坐标系偏移进行矩阵变换
                let tempLeftX = Math.round((a[1] - Number(this.baseX))*Math.cos(Math.PI/180*(Number(this.baseAngle))) - (-a[0] - Number(this.baseY))*Math.sin(Math.PI/180*(Number(this.baseAngle))));
                let tempLeftY = Math.round((a[1] - Number(this.baseX))*Math.sin(Math.PI/180*(Number(this.baseAngle))) + (-a[0] - Number(this.baseY))*Math.cos(Math.PI/180*(Number(this.baseAngle))));
                // let tempLeftX = -790 + a[1];
                // let tempLeftY = -400 - a[0];
                a[0] = tempLeftX;
                a[1] = tempLeftY;
                a[2] = a[2] - Number(this.baseZ);
                tempRLeftMatrix.push(a);
            });
            // 码垛模式A右工位原始点位依次按旋转点旋转
            this.patternARightOriginMatrix.forEach(item => {
                let b = [];
                b[0] = Math.round((item[0] - rightCenterPoint.x)*Math.cos(Math.PI/180*angle) - (item[1] - rightCenterPoint.y)*Math.sin(Math.PI/180*angle) + rightCenterPoint.x);
                b[1] = Math.round((item[0] - rightCenterPoint.x)*Math.sin(Math.PI/180*angle) + (item[1] - rightCenterPoint.y)*Math.cos(Math.PI/180*angle) + rightCenterPoint.y);
                b[2] = item[2];
                b[3] = item[3];
                b[4] = item[4];
                b[5] = item[5];
                // 点位旋转后距离计算
                tempRRightDistance.push(Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2)));
                // 旋转后点位依据实际基坐标系偏移进行矩阵变换
                let tempRightX = Math.round((b[1] - Number(this.baseX))*Math.cos(Math.PI/180*(Number(this.baseAngle))) - (b[0] + Number(this.baseY))*Math.sin(Math.PI/180*(Number(this.baseAngle))));
                let tempRightY = Math.round((b[1] - Number(this.baseX))*Math.sin(Math.PI/180*(Number(this.baseAngle))) + (b[0] + Number(this.baseY))*Math.cos(Math.PI/180*(Number(this.baseAngle))));
                // let tempRightX = -790 + b[1];
                // let tempRightY = 400 + b[0];
                b[0] = tempRightX;
                b[1] = tempRightY;
                b[2] = b[2] - Number(this.baseZ);
                tempRRightMatrix.push(b);
            });
            // 旋转变换后的点位矩阵依据距托盘原点排序离排序
            rppLeftMatrix["1"] = this.bobbleSort(tempRLeftDistance, tempRLeftMatrix);
            rppRightMatrix["1"] = this.bobbleSort(tempRRightDistance, tempRRightMatrix);

            return [rppLeftMatrix, rppRightMatrix];
        }

        /** 清空托盘，删除全部的工件方块，并重新初始化 */
        clearPallet() {
            if (this.boxsGroup.length) {
                if (isDeletePattern) {
                    this.ctx.save();
                    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                    this.ctx.restore();
                    this.selectedBox = {};
                    this.selectedBoxIndex = null;
                    this.inBoxWidth = null;
                    this.inBoxHeight = null;
                    lastAddedBox = {};
                    this.boxsGroup = [];
                    this.didCollideArr = [];
                    this.init();
                    isDeletePattern = false;
                    if (patternType == 'A') {
                        originPatternA = [];
                    } else {
                        originPatternB = [];
                    }
                } else {
                    isDeletePattern = true;
                    toastFactory.info(pesDynamicTags.info_messages[69]);
                }
            } else{
                toastFactory.info(pesDynamicTags.info_messages[70]);
            }
        }

        /** 依据修改后的BoxsGroup重新绘制 */
        redraw() {
            if (isCheckPatternBEnable || isSelectPatternEnable || isSelectPatternAShow) {
                // 清空已选方块对象变量
                this.selectedBox = {};
                this.selectedBoxIndex = null;
                this.inBoxWidth = null;
                this.inBoxHeight = null;
            }
            // 清空画布
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.restore();
            // 重绘托盘
            this.drawPallet(this.originPoint.x, this.originPoint.y, this.canvasPalletFront, this.canvasPalletSide);
            if (checkPatternAShow) {
                for (let index = 0; index < originPatternA.length; index++) {
                    this.drawBox(originPatternA[index]);
                    this.ctx.restore();
                }
            }
            for (let i = 0; i < this.boxsGroup.length; i++) {
                this.boxsGroup[i].index = i + 1;
                // 重绘工件方块
                if (this.didCollideArr.includes(i)) {
                    this.drawBox(this.boxsGroup[i], 'red');     // 碰撞检测的绘制成红色方块
                } else if (this.selectedBoxIndex == i) {
                    this.drawBox(this.boxsGroup[i], 'green');   // 选中的绘制成绿色方块
                } else {
                    if (patternType == 'B') {
                        this.drawBox(this.boxsGroup[i], '#005e8c');
                    } else {
                        this.drawBox(this.boxsGroup[i]);    // 其余的按默认颜色绘制
                    }
                }
            }
            // 重绘完成以后，选择模式B、切换A/B模式、选择显示模式A配置已经完成，将该标志关闭
            isCheckPatternBEnable = false
            isSelectPatternEnable = false;
            isSelectPatternAShow = false;
            this.drawArrow();
        }

        /**
         * 计算工件像素间隔对应的实际间隔
         * @param {int} boxGapPX 工件的像素间隔
         * @returns boxGapMM
         */
        calculateActualGap(boxGapPX) {
            return boxGapPX / this.coe;
        }

        /**
         * 修改对象中的像素间隔值
         * @param {int} boxGapPX 工件的像素间隔
         */
        changeBoxGap(boxGapPX) {
            this.boxGapPX = boxGapPX;
        }

        /**
         * 获取码垛模板像素点位
         * @returns 
         */
        getBoxsGroup() {
            return this.boxsGroup;
        }

        /**
         * 设置码垛模板像素点位
         */
        setBoxsGroup(data) {
            this.boxsGroup = data;
            this.redraw();
        }
    }

    /* 打开码垛模式配置窗口 */
    $scope.openConfigPatternModal = function () {
        patternEditCanvas = new palletizingPatternEdit(
            $scope.currentPalletFront, 
            $scope.currentPalletSide, 
            $scope.currentPalletHeight,
            $scope.currentBoxLength, 
            $scope.currentBoxWidth,
            $scope.currentBoxHeight,
            $scope.currentEquipmentX,
            $scope.currentEquipmentY,
            $scope.currentEquipmentZ,
            $scope.currentEquipmentAngle,
            gripPointData
        );
        patternEditCanvas.init();
        if (originPatternA.length != 0 && patternType == 'A') {
            patternEditCanvas.setBoxsGroup(originPatternA);
        }
        if (originPatternB.length != 0 && patternType == 'B') {
            patternEditCanvas.setBoxsGroup(originPatternB);
        }
        if (layerSequenceArr.length != 0 && layerSequenceArr.length == $scope.layersPatternObj.length) {
            layerSequenceArr.forEach((element, index) => {
                $scope.selectLayerPattern(index + 1, element);
            });
        }
        $scope.boxGapMM = patternEditCanvas.calculateActualGap($scope.boxGapPX);
        $scope.inputedRows = null;
        $scope.inputedColumns = null;
        $("#palletizingPatternConfig").modal();
    }

    /*选择B模式的按钮是否打开 */
    $scope.checkPatternBEnable = function() {
        if (patternDraw) {
            toastFactory.warning(pesDynamicTags.warning_messages[11]);
            if ($("#patternBEnable").prop("checked")) {
                $("#patternBEnable").prop("checked", false);
            } else {
                $("#patternBEnable").prop("checked", true);
            }
            return;
        }
        isCheckPatternBEnable = true;
        isSelectPatternEnable = false;
        isSelectPatternAShow = false;
        $scope.patternBEnable = $("#patternBEnable").prop("checked") ? 1 : 0;
        if (!$scope.patternBEnable) {
            $("#patternEnableA").prop("checked", true);
            $scope.patternEnable = 'A';
            patternType = $scope.patternEnable;
            $("#patternAShow").prop("checked", false);
            $scope.patternAShow = 0;
            checkPatternAShow = $scope.patternAShow;
        }
        if ($scope.layersPatternObj.length && !$scope.patternBEnable) {
            $scope.layersPatternObj.forEach((item, index) => {
                $(`#${item.index}A`).prop("checked", true);
                $scope.layersPatternObj[index].pattern = 'A';
            })
        }
        patternEditCanvas.setBoxsGroup(originPatternA);
    }

    /**
     * 选择A/B模式 
     * @param {string} type A模式：'A';B模式：'B'
     */
    $scope.selectPatternEnable = function(type) {
        // 存在碰撞时，不允许切换AB模式
        if (patternDraw) {
            toastFactory.warning(pesDynamicTags.warning_messages[11]);
            $(`#patternEnable${$scope.patternEnable}`).prop("checked", true);
            return;
        }
        isSelectPatternEnable = true;
        $scope.patternEnable = type;
        patternType = $scope.patternEnable;
        // 切换A/B模式时重新绘制画布内的工件
        if ($scope.patternEnable == 'A') {
            $("#patternAShow").prop("checked", false);
            $scope.patternAShow = 0;
            checkPatternAShow = $scope.patternAShow;
            // 执行patternEditCanvas.setBoxsGroup(originPatternA)前，一定要先重新赋值originPatternB，以此保存B模式配置的点位数据
            originPatternB = patternEditCanvas.getBoxsGroup();
            patternEditCanvas.setBoxsGroup(originPatternA);
            if (originPatternA.length) {
                lastAddedBox = originPatternA[originPatternA.length - 1];
            } else {
                lastAddedBox = {};
            }
        } else {
            // 执行patternEditCanvas.setBoxsGroup(originPatternB)前，一定要先重新赋值originPatternA，以此保存A模式配置的点位数据
            originPatternA = patternEditCanvas.getBoxsGroup();
            patternEditCanvas.setBoxsGroup(originPatternB);
            if (originPatternB.length) {
                lastAddedBox = originPatternB[originPatternB.length - 1];
            } else {
                lastAddedBox = {};
            }
        }
    }

    /*显示模式A配置的按钮是否打开 */
    $scope.selectPatternAShow = function() {
        // 存在碰撞时，不允许切换AB模式
        if (patternDraw) {
            toastFactory.warning(pesDynamicTags.warning_messages[11]);
            if ($("#patternAShow").prop("checked")) {
                $("#patternAShow").prop("checked", false);
            } else {
                $("#patternAShow").prop("checked", true);
            }
            return;
        }
        isSelectPatternAShow = true;
        $scope.patternAShow = $("#patternAShow").prop("checked") ? 1 : 0;
        checkPatternAShow = $scope.patternAShow;
        originPatternB = patternEditCanvas.getBoxsGroup();
        patternEditCanvas.setBoxsGroup(originPatternB);
    }

    /*修改透明的重修绘制工件 */
    $scope.setBoxTransparency = function() {
        boxTransparency = $scope.patternATransparency / 100;
        patternEditCanvas.redraw();
    }

    /* 模态窗关闭清除创建的实例 */
    $scope.destructPatternCanvas = function () {
        isCheckPatternBEnable = false
        isSelectPatternEnable = false;
        isSelectPatternAShow = false;
        patternEditCanvas.destructor();
        patternEditCanvas = null;
    }

    /*获取画布区域的工件 */
    function getPalletizingBox() {
        switch (patternType) {
            case 'A':
                originPatternA = patternEditCanvas.getBoxsGroup();
                break;
            case 'B':
                originPatternB = patternEditCanvas.getBoxsGroup();
                break;
            default:
                break;
        }
    }

    /* 添加码垛工件方块 */
    $scope.addPalletizingBox = function () {
        patternEditCanvas.addBox();
        getPalletizingBox();
        
    }

    /* 改变之后添加的工件方块与上一工件方块之间的间隔 */
    $scope.changeBoxGap = function () {
        isCheckPatternBEnable = false
        isSelectPatternEnable = false;
        isSelectPatternAShow = false;
        $scope.boxGapMM = patternEditCanvas.calculateActualGap($scope.boxGapPX);
        patternEditCanvas.changeBoxGap($scope.boxGapPX);
        getPalletizingBox();
    }

    /* 旋转已选择的工件方块 */
    $scope.rotateSelectedBox = function () {
        patternEditCanvas.rotateBox();
        getPalletizingBox();
    }

    /* 删除已选择的工件方块 */
    $scope.deleteSelectedBox = function () {
        patternEditCanvas.deletebox();
        getPalletizingBox();
    }

    /* 删除全部工件 */
    $scope.deleteAllBoxs = function () {
        isCheckPatternBEnable = false
        isSelectPatternEnable = false;
        isSelectPatternAShow = false;
        patternEditCanvas.clearPallet();
    }

    /* 批量添加工件 */
    $scope.addBoxsInBatches = function (rows, columns) {
        patternEditCanvas.addBoxsInBatches(rows, columns);
    }

    /* 模式配置参数下发 */
    $scope.configurePattern = function () {
        isCheckPatternBEnable = false
        isSelectPatternEnable = false;
        isSelectPatternAShow = false;
        if (patternDraw) {
            toastFactory.warning(pesDynamicTags.warning_messages[11]);
            return;
        }
        if ($.isEmptyObject(gripPointData)) {
            toastFactory.warning(pesDynamicTags.warning_messages[8]);
            return;
        }
        let isExistPatternNull = 0;
        layerSequenceArr = [];
        $scope.layersPatternObj.forEach(element => {
            if (element.pattern == "") {
                isExistPatternNull = 1;
            }
            layerSequenceArr.push(element.pattern);
        });
        if (layerSequenceArr.indexOf('A') != -1 && originPatternA.length == 0) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if (layerSequenceArr.indexOf('B') != -1 && originPatternB.length == 0) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if ($scope.boxGapPX == null || $scope.boxGapPX == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        if ($scope.layersNumber == null || $scope.layersNumber == undefined) {
            toastFactory.warning(pesDynamicTags.warning_messages[10]);
            return;
        }
        // 如果长度不相等并或者存在未选项则报错退出
        if (isExistPatternNull) {
            toastFactory.warning(pesDynamicTags.warning_messages[9]);
            return;
        }
        originPatternALeft = patternEditCanvas.createPatternLeftPoint(originPatternA);
        originPatternBLeft = patternEditCanvas.createPatternLeftPoint(originPatternB);
        // console.log(originPatternALeft, 'originPatternALeft');
        // console.log(originPatternBLeft, 'originPatternBLeft');
        patternARightMatrix = patternEditCanvas.createPatternRightPointsMatrix(originPatternA);
        patternALeftMatrix = patternEditCanvas.createPatternLeftPointsMatrix(originPatternALeft);
        patternBRightMatrix = patternEditCanvas.createPatternRightPointsMatrix(originPatternB);
        patternBLeftMatrix = patternEditCanvas.createPatternLeftPointsMatrix(originPatternBLeft);
        // console.log("A_Right", JSON.stringify(patternARightMatrix));
        // console.log("A_Left", JSON.stringify(patternALeftMatrix));
        // console.log("B_Right", JSON.stringify(patternBRightMatrix));
        // console.log("B_Left", JSON.stringify(patternBLeftMatrix));
        let configPatternCmd = {
            cmd: "palletizing_config_pattern",
            data: {
                box_gap: $scope.boxGapPX,
                layers: $scope.layersNumber,
                sequence: layerSequenceArr.toString(),
                pattern_b_enable: $scope.patternBEnable,
                left_pattern_a: JSON.stringify(patternALeftMatrix),
                left_pattern_b: JSON.stringify(patternBLeftMatrix),
                right_pattern_a: JSON.stringify(patternARightMatrix),
                right_pattern_b: JSON.stringify(patternBRightMatrix),
                origin_pattern_a: JSON.stringify(originPatternA),
                origin_pattern_b: JSON.stringify(originPatternB)
            }
        }
        dataFactory.actData(configPatternCmd)
            .then(() => {
                $("#palletizingPatternConfig").modal("hide");
                $scope.show_patternConfiguredTips = true;
                $scope.currentLayersNumber = $scope.layersNumber;
                $scope.currentLayerSequence = layerSequenceArr.toString();
                $scope.destructPatternCanvas();
                $scope.loadPalletizingFormula($scope.currentLoadedFormula, 0);
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /*码垛高级配置模态框 */
    $scope.openConfigAdvancedModal = function() {
        // 码垛高级配置获取
        let loadFormulaCmd = {
            cmd: "get_palletizing_formula",
            data: {
                name: $scope.currentLoadedFormula
            }
        }
        dataFactory.getData(loadFormulaCmd)
            .then((data) => {
                if (!$.isEmptyObject(data)) {
                    $scope.palletAdvancedConfig = data.advanced_config;
                    $scope.selectedPalletizeSmoothTime = $scope.ptpSmoothTimeData.filter(item => item.id == $scope.palletAdvancedConfig.smooth1_time)[0];
                    $scope.selectedPalletizeSmoothlength = $scope.linSmoothlengthData.filter(item => item.id == $scope.palletAdvancedConfig.smooth1_length)[0];
                    $scope.selectedDestackingSmoothTime = $scope.ptpSmoothTimeData.filter(item => item.id == $scope.palletAdvancedConfig.smooth2_time)[0];
                    $scope.selectedDestackingSmoothlength = $scope.linSmoothlengthData.filter(item => item.id == $scope.palletAdvancedConfig.smooth2_length)[0];
                } else {
                    $scope.palletAdvancedConfig = {
                        height: '',
                        x1: '',
                        y1: '',
                        z1: '',
                        x2: '',
                        y2: '',
                        z2: '',
                        time: '',
                        smooth_enable: '0',
                        smooth1_time: '-1',
                        smooth1_length: '-1',
                        smooth2_time: '-1',
                        smooth2_length: '-1',
                    }
                }
                $('#palletizingAdvancedConfig').modal();
            }, (status) => {
                $('#palletizingAdvancedConfig').modal();
                toastFactory.error(status, pesDynamicTags.error_messages[26]);
            });
    }

    /*码垛高级配置确认 */
    $scope.configurePalletAdvanced = function() {
        const palletAdvancedConfigKeys = Object.keys($scope.palletAdvancedConfig);
        palletAdvancedConfigKeys.forEach(item => {
            if ($scope.palletAdvancedConfig[item] == '') {
                $scope.palletAdvancedConfig[item] = document.getElementById(`advanced-${item}`).value
            }
            $scope.palletAdvancedConfig['smooth1_time'] = $scope.selectedPalletizeSmoothTime.id
            $scope.palletAdvancedConfig['smooth1_length'] = $scope.selectedPalletizeSmoothlength.id
            $scope.palletAdvancedConfig['smooth2_time'] = $scope.selectedDestackingSmoothTime.id
            $scope.palletAdvancedConfig['smooth2_length'] = $scope.selectedDestackingSmoothlength.id
        })
        let generateProgramCmd = {
            cmd: "palletizing_advanced_cfg",
            data: $scope.palletAdvancedConfig
        };
        dataFactory.actData(generateProgramCmd).then(() => {
            $('#palletizingAdvancedConfig').modal('hide');
            toastFactory.success(pesDynamicTags.success_messages[11]);
        }, (status) => {
            $('#palletizingAdvancedConfig').modal('hide');
            toastFactory.error(status, pesDynamicTags.error_messages[28]);
        });
    }

    /**
     * 生成码垛示教程序
     * @param {string} palletizingFormulaName 
     */
    $scope.generatePalletizingProgram = function (palletizingFormulaName) {
        if ($scope.show_boxConfiguredTips && $scope.show_palletConfiguredTips && $scope.show_deviceConfiguredTips && $scope.show_patternConfiguredTips) {
            if ($scope.generateProgramMode) {
                let generalFlag = [];
                switch ($scope.generateProgramMode.id) {
                    case 0:
                        generalFlag = '[1, 1]';
                        break;
                    case 1:
                        generalFlag = '[1, 0]';
                        break;
                    case 2:
                        generalFlag = '[0, 1]';
                        break;
                    default:
                        break;
                };
                let generateProgramCmd = {
                    cmd: "generate_palletizing_program",
                    data: {
                        palletizing_name: palletizingFormulaName,
                        depalletizing_name: 'de' + palletizingFormulaName,
                        flag: generalFlag
                    }
                };
                dataFactory.actData(generateProgramCmd).then(() => {
                    $scope.show_programGeneratedTips = true;
                    toastFactory.success(pesDynamicTags.success_messages[9]);
                }, (status) => {
                    toastFactory.error(status, pesDynamicTags.error_messages[22]);
                });
            } else {
                toastFactory.info(pesDynamicTags.info_messages[59]);
            }
        } else {
            if (!$scope.show_boxConfiguredTips) {
                toastFactory.warning(pesDynamicTags.warning_messages[13]);
            }
            if (!$scope.show_palletConfiguredTips) {
                toastFactory.warning(pesDynamicTags.warning_messages[14]);
            }
            if (!$scope.show_deviceConfiguredTips) {
                toastFactory.warning(pesDynamicTags.warning_messages[15]);
            }
            if (!$scope.show_patternConfiguredTips) {
                toastFactory.warning(pesDynamicTags.warning_messages[16]);
            }
        }
    }

    /**
     * 设置码垛系统状态页启用标志位
     */
    $scope.setPalletizingStatusPage = function () {
        var per_page_flag = 0;
        if(spFlag == 3){
            per_page_flag = 0;
        } else{
            per_page_flag = 3;
        }
        let cmdContent = {
            cmd: "set_status_flag",
            data: {
                page_flag: per_page_flag
            }
        };
        dataFactory.actData(cmdContent)
            .then(() => {
                getStatusPageFlag();
                
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 打开码垛监控页面
     */
    $scope.showPalletizingStautsPage = function () {
        if (spFlag == 3) {
            // 打开监控页
            $("#palletizingStatusPage").show();
            // 发布打开码垛监控页事件，在index.js中设置监听进行接收
            document.dispatchEvent(new CustomEvent('open-palletizing-monitor', { bubbles: true, cancelable: true, composed: true}));
        } else {
            toastFactory.info(pesDynamicTags.info_messages[35]);
        }
    }
    /* ./码垛系统配置 end */

    /**
     * 码垛配方导入接口
     */
    $scope.importPalletizingFormula = function() {;
        var formData = new FormData();
        var file = document.getElementById("palletizingFormulaImport").files[0];
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                document.getElementById("palletizingFormulaImport").outerHTML = document.getElementById("palletizingFormulaImport").outerHTML;
                if (typeof(data) != "object") {
                    toastFactory.success(pesDynamicTags.success_messages[2]+file.name);
                    getPalletizingFormulaNameList();
                }
            }, (status) => {
                document.getElementById("palletizingFormulaImport").outerHTML = document.getElementById("palletizingFormulaImport").outerHTML;
                toastFactory.error(status, pesDynamicTags.error_messages[16]);
            });
        // $.ajax({
        //     url : '/action/upload',//这里写你的url
        //     type : 'POST',
        //     data : formData,
        //     contentType: false,// 当有文件要上传时，此项是必须的，否则后台无法识别文件流的起始位置
        //     processData: false,// 是否序列化data属性，默认true(注意：false时type必须是post)
        //     dataType: 'json',//这里是返回类型，一般是json,text等
        //     clearForm: true,//提交后是否清空表单数据
        //     success: function(data) {   //提交成功后自动执行的处理函数，参数data就是服务器返回的数据。
        //         console.success("import successfully");
        //         toastFactory.success(pesDynamicTags.success_messages[2]+file.name);
        //         getPalletizingFormulaNameList();
        //     },
        //     error: function(data, status, e) {  //提交失败自动执行的处理函数。
        //         console.error(status);
        //         toastFactory.error(status, pesDynamicTags.error_messages[15]+ file.name);
        //     }
        // });
        // document.getElementById("palletizingFormulaImport").outerHTML = document.getElementById("palletizingFormulaImport").outerHTML;
    }

    /**
     * 扭矩配方导入接口
     */
    $scope.importRecipe = function() {;
        var formData = new FormData();
        var file = document.getElementById("recipeImport").files[0];
        formData.append('file', file);
        dataFactory.uploadData(formData)
            .then((data) => {
                document.getElementById("recipeImport").outerHTML = document.getElementById("recipeImport").outerHTML;
                if (typeof(data) != "object") {
                    toastFactory.success(pesDynamicTags.success_messages[2]+file.name);
                }
            }, (status) => {
                document.getElementById("recipeImport").outerHTML = document.getElementById("recipeImport").outerHTML;
                toastFactory.error(status, pesDynamicTags.error_messages[16]);
            });
        // $.ajax({
        //     url : '/action/upload',//这里写你的url
        //     type : 'POST',
        //     data : formData,
        //     contentType: false,// 当有文件要上传时，此项是必须的，否则后台无法识别文件流的起始位置
        //     processData: false,// 是否序列化data属性，默认true(注意：false时type必须是post)
        //     dataType: 'json',//这里是返回类型，一般是json,text等
        //     clearForm: true,//提交后是否清空表单数据
        //     success: function(data) {   //提交成功后自动执行的处理函数，参数data就是服务器返回的数据。
        //         toastFactory.success(pesDynamicTags.success_messages[2]+file.name);
                
        //     },
        //     error: function(data, status, e) {  //提交失败自动执行的处理函数。
        //         toastFactory.error(status, pesDynamicTags.error_messages[15]+ file.name);
        //     }
        // });
        // document.getElementById("recipeImport").outerHTML = document.getElementById("recipeImport").outerHTML;
    }

    /* 打磨设备配置 */
    /**
     * 设置通讯参数
     * @param {char[20]} ip
     * @param {u16} port 端口
     * @param {int} period 采样周期
     * @param {int} protocol 通信协议
     */
    $scope.setPolishingComParam = function(ip, port, period, protocol) {
        let setPolishingComParamCmd = {
            cmd: 760,
            data: {
                content: "PolishingSetComParam(" + '"' + ip + '"' + "," + port + "," + period + "," + protocol + ")"
            }
        };

        if (!ip || !port) {
            toastFactory.info(pesDynamicTags.info_messages[11]);
            return;
        }

        if (!period) {
            toastFactory.info(pesDynamicTags.info_messages[12]);
            return;
        }
        
        if (!protocol) {
            toastFactory.info(pesDynamicTags.info_messages[44]);
            return;
        }
        dataFactory.setData(setPolishingComParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**获取通讯参数 */
    function getPolishingComParam() {
        let getPolishingComParamCmd = {
            cmd: 761,
            data: {
                content: "PolishingGetComParam()"
            },
        };
        dataFactory.setData(getPolishingComParamCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }
    document.getElementById('pollishingSystem').addEventListener('761', e => {
        $scope.getPolishComData = JSON.parse(e.detail);
        $scope.polishIP = $scope.getPolishComData.ip;
        $scope.polishPort = $scope.getPolishComData.port;
        $scope.polishPeriod = $scope.getPolishComData.period;
        $scope.selectedPolishProtocol = $scope.polishProtocolData[$scope.getPolishComData.protocol - 101];
    })

    /**加载打磨头通信驱动 */
    $scope.loadPolishingComDriver = function() {
        let loadPolishingComDriverCmd = {
            cmd: 762,
            data: {
                content: "PolishingLoadComDriver()"
            }
        };
        dataFactory.setData(loadPolishingComDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**卸载打磨头通信驱动 */
    $scope.unloadPolishingComDriver = function() {
        let unloadPolishingComDriverCmd = {
            cmd: 763,
            data: {
                content: "PolishingUnloadComDriver()"
            }
        };
        dataFactory.setData(unloadPolishingComDriverCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 打磨设备使能
     * @param {*} index 0-下使能 1-上使能
     */
    $scope.enablePolishingDevice = function(index) {
        let enablePolishingDeviceCmd = {
            cmd: 764,
            data: {
                content: "PolishingDeviceEnable(" + index + ")",
            }
        };
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**清除错误 */
    $scope.clearPolishingError = function() {
        let clearPolishingErrorCmd = {
            cmd: 765,
            data: {
                content: "PolishingClearError()",
            }
        };
        dataFactory.setData(clearPolishingErrorCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**力传感器清零 */
    $scope.resetPolishingTorqueSensor = function() {
        let resetPolishingTorqueSensorCmd = {
            cmd: 766,
            data: {
                content: "PolishingTorqueSensorReset()",
            }
        };
        dataFactory.setData(resetPolishingTorqueSensorCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置目标转速，单位r/min
     * @param {int16_t} vel 转速值
     */
    $scope.setPolishingTargetVelocity = function(vel) {
        let enablePolishingDeviceCmd = {
            cmd: 767,
            data: {
                content: "PolishingSetTargetVelocity(" + vel + ")",
            }
        };
        if (!vel) {
            toastFactory.info(pesDynamicTags.info_messages[40]);
            return;
        }
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置目标接触力，单位N
     * @param {int16_t} force 接触力大小
     */
    $scope.setPolishingTargetTorque = function(force) {
        let enablePolishingDeviceCmd = {
            cmd: 768,
            data: {
                content: "PolishingSetTargetTorque(" + force + ")",
            }
        };
        if (!force) {
            toastFactory.info(pesDynamicTags.info_messages[41]);
            return;
        }
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置目标伸出距离,单位0.01mm
     * @param {int16_t} pos 伸出距离
     */
    $scope.setPolishingTargetPosition = function(pos) {
        let enablePolishingDeviceCmd = {
            cmd: 769,
            data: {
                content: "PolishingSetTargetPosition(" + pos + ")",
            }
        };
        if (!pos) {
            toastFactory.info(pesDynamicTags.info_messages[42]);
            return;
        }
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置控制模式
     * @param {int} mode 1-回零模式，2-位置模式，4-力控模式
     */
    $scope.setPolishingOperationMode = function(mode) {
        let enablePolishingDeviceCmd = {
            cmd: 770,
            data: {
                content: "PolishingSetOperationMode(" + mode + ")",
            }
        };
        if (!mode) {
            toastFactory.info(pesDynamicTags.info_messages[43]);
            return;
        }
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置目标设定力
     * @param {int16_t} force 设定力
     */
    $scope.setPolishingSetTargetTouchForce = function(force) {
        let enablePolishingDeviceCmd = {
            cmd: 1010,
            data: {
                content: "PolishingSetTargetTouchForce(" + force + ")",
            }
        };
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设定力过渡时间
     * @param {int16_t} time 设定力过渡时间
     */
    $scope.setPolishingSetTargetTouchTime = function(time) {
        let enablePolishingDeviceCmd = {
            cmd: 1011,
            data: {
                content: "PolishingSetTargetTouchTime(" + time + ")",
            }
        };
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /**
     * 设置工件重量
     * @param {int16_t} weight 工件重量
     */
    $scope.setPolishingSetWorkPieceWeight = function(weight) {
        let enablePolishingDeviceCmd = {
            cmd: 1012,
            data: {
                content: "PolishingSetWorkPieceWeight(" + weight + ")",
            }
        };
        dataFactory.setData(enablePolishingDeviceCmd)
            .then(() => {
            }, (status) => {
                toastFactory.error(status);
            });
    }

    /* 远程控制接口页面一键直达设置 */
    document.getElementById('peripheral').addEventListener('open_remote_setting', () => {
        $scope.switchapplicationPage(12);
        $('#vRobot-view').css('z-index', 0);
    });

    /*获取远程控制通讯参数 */
    function getRobotFCIMode() {
        let getFCIModeCmd = {
            cmd: 815,
            data: {
                content: "RCIGetComParam()",
            }
        };
        dataFactory.setData(getFCIModeCmd).then(() => {
        }, (status) => {
            toastFactory.error(status, pesDynamicTags.error_messages[25]);
        });
    }

    document.getElementById('peripheral').addEventListener('815', e => {
        const fciResult = e.detail.split(',');
        $scope.selectedFciMode = $scope.fciModeData.find(item => item.id == fciResult[0]);
        if (fciResult[0] == 2) {
            $scope.selectedFciFirm = $scope.fciFirmData.find(item => item.id == fciResult[2]);
            $scope.selectedFciPeriod = $scope.fciPeriodData.find(item => item == fciResult[1]);
        } else {
            $scope.selectedFciPort = fciResult[1];
            $scope.selectedFciParam = fciResult[2];
        }
    })
    /** ./获取远程控制通讯参数 */

    /*设置远程控制通讯参数 */
    $scope.setRobotFCIMode = function() {
        if (!$scope.selectedFciMode) {
            toastFactory.info(pesDynamicTags.info_messages[65]);
            return;
        }
        if ($scope.selectedFciMode.id == 2 && !$scope.selectedFciFirm) {
            toastFactory.info(pesDynamicTags.info_messages[66]);
            return;
        }
        if ($scope.selectedFciMode.id == 2 && !$scope.selectedFciPeriod) {
            toastFactory.info(pesDynamicTags.info_messages[67]);
            return;
        }
        $scope.selectedFciPort = $scope.selectedFciPort ? $scope.selectedFciPort : '8055';
        $scope.selectedFciParam = $scope.selectedFciParam ? $scope.selectedFciParam : '127';
        let setFCIModeCmd = {
            cmd: 814,
            data: {
                content: $scope.selectedFciMode.id == 1 ? "RCISetComParam(" + $scope.selectedFciMode.id + "," + $scope.selectedFciPort + "," + $scope.selectedFciParam + ")"  : "RCISetComParam(" + $scope.selectedFciMode.id + "," + $scope.selectedFciPeriod + "," + $scope.selectedFciFirm.id + ")",
            }
        };
        dataFactory.setData(setFCIModeCmd).then(() => {
        }, (status) => {
            toastFactory.error(status);
        });
    }
    /** ./设置远程控制通讯参数 */
}