close all;
clear;
clc;

% 机器人模型
L0 = Link([ pi/2   0        0       0      0], 'modified');
L1 = Link([ 0      0.1491   0      -pi/2   0], 'modified');
L2 = Link([-pi/2   0        0.4318  0      0], 'modified');
L3 = Link([ 0      0.4331   0.0203 -pi/2   0], 'modified');
L4 = Link([ 0      0        0       pi/2   0], 'modified');
L5 = Link([ 0      0        0      -pi/2   0], 'modified');

PUMA560 = SerialLink([L0 L1 L2 L3 L4 L5], 'name', 'PUMA560');

PUMA560.plot([pi/2, 0, -pi/2, 0, 0, 0]);
PUMA560.display();
teach(PUMA560);

% 正运动学
fkine_tools = PUMA560.fkine([-20/180*pi, 20/180*pi, -20/180*pi, 30/180*pi, 30/180*pi, 30/180*pi]);
fkine_my = myFkine(-20/180*pi, 20/180*pi, -20/180*pi, 30/180*pi, 30/180*pi, 30/180*pi);

% 逆运动学
ikine_tools = PUMA560.ikine(fkine_tools);
ikine_my = myIkine(fkine_my);

% 验证工具箱结果
fkine_tools_verity = PUMA560.fkine(ikine_tools);

% 验证自写逆解的 8 组候选
fkine_my_verity_1 = PUMA560.fkine(ikine_my(1,:));
fkine_my_verity_2 = PUMA560.fkine(ikine_my(2,:));
fkine_my_verity_3 = PUMA560.fkine(ikine_my(3,:));
fkine_my_verity_4 = PUMA560.fkine(ikine_my(4,:));
fkine_my_verity_5 = PUMA560.fkine(ikine_my(5,:));
fkine_my_verity_6 = PUMA560.fkine(ikine_my(6,:));
fkine_my_verity_7 = PUMA560.fkine(ikine_my(7,:));
fkine_my_verity_8 = PUMA560.fkine(ikine_my(8,:));
