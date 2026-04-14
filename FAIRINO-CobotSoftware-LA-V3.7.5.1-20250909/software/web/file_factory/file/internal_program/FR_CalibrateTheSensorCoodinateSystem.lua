
Lin(FR_CalibrateTeachingCenterPose,100,-1,0,0)
toolNum = GetActualTCPNum()
workPcsNum = GetActualWObjNum()
expeRx = -180 --????????????
expeRy = 0
expeRz = 0
dis = 10 --????????
j1C, j2C, j3C, j4C, j5C, j6C = GetActualJointPosDegree() --??
xC, yC, zC, rxC, ryC, rzC = GetActualTCPPose() --mm & ??
newJ1, newJ2, newJ3, newJ4, newJ5, newJ6 = GetInverseKin(0, xC, yC, zC, expeRx, expeRy, expeRz, -1)
MoveL(newJ1, newJ2, newJ3, newJ4, newJ5, newJ6, xC, yC, zC, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
j1R, j2R, j3R, j4R, j5R, j6R = GetActualJointPosDegree() --?? --?????????????
xR, yR, zR, rxR, ryR, rzR = GetActualTCPPose() --mm & ?? --?????????????
--???????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, -dis, -dis, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, dis, -dis, 0, 0, 0)
rp1 = TCPGetRecordFlangePos(0)--
if type(rp1) == "table"then
px0 = rp1[1]
py0 = rp1[2]
end
rp2 = TCPGetRecordFlangePos(1)--
if type(rp2) == "table"then
px1 = rp2[1]
py1 = rp2[2]
end
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, -dis, -dis, 0, 0, 0)
rp3 = TCPGetRecordFlangePos(0)--
if type(rp3) == "table"then
px2 = rp3[1]
py2 = rp3[2]
end
rp4 = TCPGetRecordFlangePos(1)--
if type(rp4) == "table"then
px3 = rp4[1]
py3 = rp4[2]
end
if type(px0) == "number" then
px = (px0 + px1 + px2 + px3) / 4
py = (py0 + py1 + py2 + py3) / 4
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
dJ1, dJ2, dJ3, dJ4, dJ5, dJ6 = GetInverseKin(0, px, py, zR, expeRx, expeRy, expeRz, -1)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -dis, 0, 0, 0)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
rp5 = TCPGetRecordFlangePos(0)--
if type(rp5) == "table"then
pz4 = rp5[3]
end
rp6 = TCPGetRecordFlangePos(1)--
if type(rp6) == "table"then
pz5 = rp6[3]
end
if type(pz4) == "number" then
pz = (pz4 + pz5) / 2
end
--???xyz
pJ1, pJ2, pJ3, pJ4, pJ5, pJ6 = GetInverseKin(0, px, py, pz, expeRx, expeRy, expeRz, -1)
MoveL(pJ1, pJ2, pJ3, pJ4, pJ5, pJ6, px, py, pz, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
--
pointA = { px,py,pz }
if type(pointA) == "table"then
xA = pointA[1]
yA = pointA[2]
zA = pointA[3]
--RegisterVar("number", "xA")
--RegisterVar("number", "yA")
RegisterVar("number", "zA")
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0) --????????????
-- ???????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, dis, -dis, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, dis, -dis, 0, 0, 0)
rp1 = TCPGetRecordFlangePos(0)--
if type(rp1) == "table"then
px0 = rp1[1]
py0 = rp1[2]
end
rp2 = TCPGetRecordFlangePos(1)--
if type(rp2) == "table"then
px1 = rp2[1]
py1 = rp2[2]
end
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, dis, -dis, 0, 0, 0)
rp3 = TCPGetRecordFlangePos(0)--
if type(rp3) == "table"then
px2 = rp3[1]
py2 = rp3[2]
end
rp4 = TCPGetRecordFlangePos(1)--
if type(rp4) == "table"then
px3 = rp4[1]
py3 = rp4[2]
end
if type(px0) == "number" then
px = (px0 + px1 + px2 + px3) / 4
py = (py0 + py1 + py2 + py3) / 4
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
dJ1, dJ2, dJ3, dJ4, dJ5, dJ6 = GetInverseKin(0, px, py, zR, expeRx, expeRy, expeRz, -1)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -dis, 0, 0, 0)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
rp5 = TCPGetRecordFlangePos(0)--
if type(rp5) == "table"then
pz4 = rp5[3]
end
rp6 = TCPGetRecordFlangePos(1)--
if type(rp6) == "table"then
pz5 = rp6[3]
end
if type(pz4) == "number" then
pz = (pz4 + pz5) / 2
end
--???xyz
pJ1, pJ2, pJ3, pJ4, pJ5, pJ6 = GetInverseKin(0, px, py, pz, expeRx, expeRy, expeRz, -1)
MoveL(pJ1, pJ2, pJ3, pJ4, pJ5, pJ6, px, py, pz, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
--
pointB = { px,py,pz }
if type(pointB) == "table"then
xB = pointB[1]
yB = pointB[2]
zB = pointB[3]
--RegisterVar("number", "xB")
--RegisterVar("number", "yB")
RegisterVar("number", "zB")
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0) --????????????
-- ????????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, dis, -dis, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, -dis, -dis, 0, 0, 0)
rp1 = TCPGetRecordFlangePos(0)--
if type(rp1) == "table"then
px0 = rp1[1]
py0 = rp1[2]
end
rp2 = TCPGetRecordFlangePos(1)--
if type(rp2) == "table"then
px1 = rp2[1]
py1 = rp2[2]
end
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, dis, -dis, 0, 0, 0)
rp3 = TCPGetRecordFlangePos(0)--
if type(rp3) == "table"then
px2 = rp3[1]
py2 = rp3[2]
end
rp4 = TCPGetRecordFlangePos(1)--
if type(rp4) == "table"then
px3 = rp4[1]
py3 = rp4[2]
end
if type(px0) == "number" then
px = (px0 + px1 + px2 + px3) / 4
py = (py0 + py1 + py2 + py3) / 4
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
dJ1, dJ2, dJ3, dJ4, dJ5, dJ6 = GetInverseKin(0, px, py, zR, expeRx, expeRy, expeRz, -1)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -dis, 0, 0, 0)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
rp5 = TCPGetRecordFlangePos(0)--
if type(rp5) == "table"then
pz4 = rp5[3]
end
rp6 = TCPGetRecordFlangePos(1)--
if type(rp6) == "table"then
pz5 = rp6[3]
end
if type(pz4) == "number" then
pz = (pz4 + pz5) / 2
end
--???xyz
pJ1, pJ2, pJ3, pJ4, pJ5, pJ6 = GetInverseKin(0, px, py, pz, expeRx, expeRy, expeRz, -1)
MoveL(pJ1, pJ2, pJ3, pJ4, pJ5, pJ6, px, py, pz, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
--
pointC = { px,py,pz }
if type(pointC) == "table"then
xC = pointC[1]
yC = pointC[2]
zC = pointC[3]
--RegisterVar("number", "xC")
--RegisterVar("number", "yC")
RegisterVar("number", "zC")
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0) --????????????
-- ????????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, -dis, -dis, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, dis, -dis, -dis, 0, 0, 0)
rp1 = TCPGetRecordFlangePos(0)--
if type(rp1) == "table"then
px0 = rp1[1]
py0 = rp1[2]
end
rp2 = TCPGetRecordFlangePos(1)--
if type(rp2) == "table"then
px1 = rp2[1]
py1 = rp2[2]
end
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, -dis, -dis, -dis, 0, 0, 0)
rp3 = TCPGetRecordFlangePos(0)--
if type(rp3) == "table"then
px2 = rp3[1]
py2 = rp3[2]
end
rp4 = TCPGetRecordFlangePos(1)--
if type(rp4) == "table"then
px3 = rp4[1]
py3 = rp4[2]
end
if type(px0) == "number" then
px = (px0 + px1 + px2 + px3) / 4
py = (py0 + py1 + py2 + py3) / 4
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
dJ1, dJ2, dJ3, dJ4, dJ5, dJ6 = GetInverseKin(0, px, py, zR, expeRx, expeRy, expeRz, -1)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
TCPRecordFlangePosStart() --?????
TCPRecordFlangePosEnd() --??????
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 1, 0, 0, -dis, 0, 0, 0)
MoveL(dJ1, dJ2, dJ3, dJ4, dJ5, dJ6, px, py, zR, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
rp5 = TCPGetRecordFlangePos(0)--
if type(rp5) == "table"then
pz4 = rp5[3]
end
rp6 = TCPGetRecordFlangePos(1)--
if type(rp6) == "table"then
pz5 = rp6[3]
end
if type(pz4) == "number" then
pz = (pz4 + pz5) / 2
end
--???xyz
pJ1, pJ2, pJ3, pJ4, pJ5, pJ6 = GetInverseKin(0, px, py, pz, expeRx, expeRy, expeRz, -1)
MoveL(pJ1, pJ2, pJ3, pJ4, pJ5, pJ6, px, py, pz, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
--
pointD = { px,py,pz }
if type(pointD) == "table"then
xD = pointD[1]
yD = pointD[2]
zD = pointD[3]
--RegisterVar("number", "xD")
--RegisterVar("number", "yD")
RegisterVar("number", "zD")
end
MoveL(j1R, j2R, j3R, j4R, j5R, j6R, xR, yR, zR, rxR, ryR, rzR, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0) --????????????
-- ???????????
laserXYZ = TCPComputeXYZ(1, 0, pointA, pointC, pointB, pointD)
laserRPY = TCPComputeXYZ(2, 0, pointA, pointC, pointB, pointD)
if type(laserXYZ) == "table" then
laserX = laserXYZ[1]
laserY = laserXYZ[2]
laserZ = laserXYZ[3]
RegisterVar("number", "laserX")
RegisterVar("number", "laserY")
RegisterVar("number", "laserZ")
end
Lin(FR_CalibrateTeachingCenterPose,100,-1,0,0)

if type(laserX) == "number" then
upZ = laserZ + 52
end

gJ1, gJ2, gJ3, gJ4, gJ5, gJ6 = GetInverseKin(0, laserX, laserY, upZ, expeRx, expeRy, expeRz, -1)
MoveL(gJ1, gJ2, gJ3, gJ4, gJ5, gJ6, laserX, laserY, upZ, expeRx, expeRy, expeRz, toolNum, workPcsNum, 100, 100, 100, -1, 0.000, 0.000, 0.000, 0.000, 0, 0, 0, 0, 0, 0, 0, 0)
