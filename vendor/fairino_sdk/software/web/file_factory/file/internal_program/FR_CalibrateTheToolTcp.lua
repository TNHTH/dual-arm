R = GetSysVarValue(s_var_1)
W = GetSysVarValue(s_var_2)
dz = GetSysVarValue(s_var_3)
toolNum = GetActualTCPNum()
workPcsNum = GetActualWObjNum()

homeX, homeY, homeZ, homeRX, homeRY, homeRZ = GetActualTCPPose() --mm & ??
expeRx = homeRX
expeRy = homeRY
expeRz = homeRZ

DISX = 10
DISY = 10
DISZ = 8

-- ?????? home??
xO, yO, zO, rxO, ryO, rzO = GetActualTCPPose() --mm & ??
if type(xO) == "number" then 
    newx = xO + DISX
    newy = yO - DISY
    newz = zO - DISZ 
end
newJ1, newJ2, newJ3, newJ4, newJ5, newJ6 = GetInverseKin(0, newx, newy, newz, expeRx, expeRy, expeRz, -1)
MoveL(newJ1, newJ2, newJ3, newJ4, newJ5, newJ6, newx, newy, newz, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)


j1c1, j2c1, j3c1, j4c1, j5c1, j6c1 = GetActualJointPosDegree() --??
xc1, yc1, zc1, rxc1, ryc1, rzc1 = GetActualTCPPose() --mm & ??
inix1 = xc1
iniy1 = yc1
iniz1 = zc1
--RegisterVar("number", "inix1")
--RegisterVar("number", "iniy1")
--RegisterVar("number", "iniz1")
WaitMs(5000)
unifCircle({ j1c1, j2c1, j3c1, j4c1, j5c1, j6c1 }, { xc1, yc1, zc1, rxc1, ryc1, rzc1 }, toolNum, workPcsNum, R, W)
WaitMs(5000)
xyC = TCPComputeCircleCenter(R)
if type(xyC) == "table" then
x1C = xyC[1]
y1C = xyC[2]
RegisterVar("number", "x1C")
RegisterVar("number", "y1C")
end
xc11, yc11, zc11, rxc11, ryc11, rzc11 = GetActualTCPPose() --mm & ??
inix11 = xc11
iniy11 = yc11
iniz11 = zc11
--RegisterVar("number", "inix11")
--RegisterVar("number", "iniy11")
--RegisterVar("number", "iniz11")

if type(xyC) == "table" then
MoveL(j1c1, j2c1, j3c1, j4c1, j5c1, j6c1, xc1, yc1, zc1, rxc1, ryc1, rzc1, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -dz, 0, 0, 0)
end
j1c2, j2c2, j3c2, j4c2, j5c2, j6c2 = GetActualJointPosDegree() --??
xc2, yc2, zc2, rxc2, ryc2, rzc2 = GetActualTCPPose() --mm & ??
inix2 = xc2
iniy2 = yc2
iniz2 = zc2
--RegisterVar("number", "inix2")
--RegisterVar("number", "iniy2")
--RegisterVar("number", "iniz2")

WaitMs(5000)
unifCircle({ j1c2, j2c2, j3c2, j4c2, j5c2, j6c2 }, { xc2, yc2, zc2, rxc2, ryc2, rzc2 }, toolNum, workPcsNum, R, W)
WaitMs(5000)
xyC2 = TCPComputeCircleCenter(R)
if type(xyC2) == "table" then
x2C = xyC2[1]
y2C = xyC2[2]
RegisterVar("number", "x2C")
RegisterVar("number", "y2C")
end
xcc3, ycc3, zcc3, rxcc3, rycc3, rzcc3 = GetActualTCPPose() --mm & ??
inix22 = xcc3
iniy22 = ycc3
iniz22 = zcc3
--RegisterVar("number", "inix22")
--RegisterVar("number", "iniy22")
--RegisterVar("number", "iniz22")

tcpRPY = TCPComputeRPY(R, dz, xyC, xyC2)
if type(tcpRPY) == "table" then
tcpR = tcpRPY[1]
tcpP = tcpRPY[2]
tcpY = tcpRPY[2]
RegisterVar("number", "tcpR")
RegisterVar("number", "tcpP")
RegisterVar("number", "tcpY")
end

-- Lift up 50mm upwards
MoveL(j1c1, j2c1, j3c1, j4c1, j5c1, j6c1, xc1, yc1, zc1, rxc1, ryc1, rzc1, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, 50, 0, 0, 0)

-- Change tool posture
if type(tcpRPY) == "table" then
xR2, yR2, zR2, rxR, ryR, rzR = GetActualTCPPose() 
rJ1, rJ2, rJ3, rJ4, rJ5, rJ6 = GetInverseKin(0, xR2, yR2, zR2, tcpR, tcpP, tcpY, -1)
MoveL(rJ1, rJ2, rJ3, rJ4, rJ5, rJ6, xR2, yR2, zR2, tcpR, tcpP, tcpY, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
WaitMs(5000)
end

-- Repositioning to the starting point of circular motion
xrpy, yrpy, zrpy, rxrpy, ryrpy, rzrpy = GetActualTCPPose() 
j1rpy, j2rpy, j3rpy, j4rpy, j5rpy, j6rpy = GetInverseKin(0, xc2, yc2, zc2, rxrpy, ryrpy, rzrpy, -1)
MoveL(j1rpy, j2rpy, j3rpy, j4rpy, j5rpy, j6rpy, xc2, yc2, zc2, rxrpy, ryrpy, rzrpy, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)


-- The third circular motion
j1c3, j2c3, j3c3, j4c3, j5c3, j6c3 = GetActualJointPosDegree() --??
xc3, yc3, zc3, rxc3, ryc3, rzc3 = GetActualTCPPose() --mm & ??
WaitMs(5000)--5min
unifCircle({ j1c3, j2c3, j3c3, j4c3, j5c3, j6c3 }, { xc3, yc3, zc3, rxc3, ryc3, rzc3 }, toolNum, workPcsNum, R, W)
WaitMs(5000)--5min

xyC3 = TCPComputeCircleCenter(R)
if type(xyC3) == "table" then
x3C = xyC3[1]
y3C = xyC3[2]
RegisterVar("number", "x3C")
RegisterVar("number", "y3C")
end

-- According to the third circular motion, the center of the circle is offset to the origin
if type(x3C) == "number" then
disX = x3C
disY = y3C - R
disZ = 2 * dz
disX = math.abs(disX)
disY = math.abs(disY)
MoveL(j1c3, j2c3, j3c3, j4c3, j5c3, j6c3, xc3, yc3, zc3, rxc3, ryc3, rzc3, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -disX, disY, disZ, 0, 0, 0)
end

-- Starting to determine the Z coordinate
j1L, j2L, j3L, j4L, j5L, j6L = GetActualJointPosDegree() 
xL, yL, zL, rxL, ryL, rzL = GetActualTCPPose() 
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
if type(disZ) == "number" then
MoveL(j1L, j2L, j3L, j4L, j5L, j6L, xL, yL, zL, rxL, ryL, rzL, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -disZ, 0, 0, 0)
MoveL(j1L, j2L, j3L, j4L, j5L, j6L, xL, yL, zL, rxL, ryL, rzL, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, 0, 0, 0, 0)
end
rp1 = TCPGetRecordFlangePos(0)--
if type(rp1) == "table"then
px0 = rp1[1]
py0 = rp1[2]
pz0 = rp1[3]
end
rp2 = TCPGetRecordFlangePos(1)--
if type(rp2) == "table"then
px1 = rp2[1]
py1 = rp2[2]
pz1 = rp2[3]
end
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
if type(disZ) == "number" then
MoveL(j1L, j2L, j3L, j4L, j5L, j6L, xL, yL, zL, rxL, ryL, rzL, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -disZ, 0, 0, 0)
MoveL(j1L, j2L, j3L, j4L, j5L, j6L, xL, yL, zL, rxL, ryL, rzL, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, 0, 0, 0, 0)
end
rp3 = TCPGetRecordFlangePos(0)--
if type(rp3) == "table"then
px2 = rp3[1]
py2 = rp3[2]
pz2 = rp3[3]
end
rp4 = TCPGetRecordFlangePos(1)--
if type(rp4) == "table"then
px3 = rp4[1]
py3 = rp4[2]
pz3 = rp4[3]
end

tcpXYZ = TCPComputeXYZ(0, 0, rp1, rp2, rp3, rp4)
if type(tcpXYZ) == "table" then
TCPx = tcpXYZ[1]
TCPy = tcpXYZ[2]
TCPz = tcpXYZ[3]
RegisterVar("number", "TCPx")
RegisterVar("number", "TCPy")
RegisterVar("number", "TCPz")
end
