PTP(ForceSensorAutoZero,100,-1,0)
fx,fy,fz,mx,my,mz = FT_GetForceTorqueRCS()
FT_Guard(1,14,1,1,1,1,1,1,fx,fy,fz,mx,my,mz,30,30,30,5,5,5,30,30,30,5,5,5)

ForceSensorSetSaveDataFlag(1)
t1,t2,t3,t4,t5,t6 = GetActualJointPosDegree()
local t3_limit = 0

if tonumber(t3) ~= nil then
    if tonumber(t3) < t3_limit then
        delta4 = 90
    else
        delta4 = -90
    end
end

if tonumber(t4) ~= nil then
x1,x2,x3,x4,x5,x6 = GetForwardKin(t1,t2,t3,tonumber(t4)+delta4,t5,t6)
tool = 0
user = 0
vel = 100
acc = 0
ovl = 100
epos = {0,0,0,0}
blendT = 0
offset_flag = 0
offset_pos = {0,0,0,0,0,0}
MoveJ({t1,t2,t3,tonumber(t4)+delta4,t5,t6},{x1,x2,x3,x4,x5,x6},tool,user,vel,acc,ovl,
    epos,blendT,offset_flag,offset_pos)

ForceSensorSetSaveDataFlag(2)
end

t1,t2,t3,t4,t5,t6 = GetActualJointPosDegree()
if tonumber(t6) ~= nil then
    if tonumber(t6) <= 0 then
        delta6 = 90
    else
        delta6 = -90
    end
end
if tonumber(t6) ~= nil then
x1,x2,x3,x4,x5,x6 = GetForwardKin(t1,t2,t3,t4,t5,tonumber(t6)+delta6)
tool = 0
user = 0
vel = 100
acc = 0
ovl = 100
epos = {0,0,0,0}
blendT = 0
offset_flag = 0
offset_pos = {0,0,0,0,0,0}
MoveJ({t1,t2,t3,t4,t5,tonumber(t6)+delta6},{x1,x2,x3,x4,x5,x6},tool,user,vel,acc,ovl,
    epos,blendT,offset_flag,offset_pos)
ForceSensorSetSaveDataFlag(3)
end

PTP(ForceSensorAutoZero,100,-1,0)
FT_Guard(0,14,1,1,1,1,1,1,fx,fy,fz,mx,my,mz,30,30,30,5,5,5,30,30,30,5,5,5)

ForceSensorComputeLoad()
WaitMs(100)
