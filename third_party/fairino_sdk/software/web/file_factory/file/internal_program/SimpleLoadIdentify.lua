trace_data = {{joint_angles_delta={0, 0, 0, 0, -40, 0}},
              {joint_angles_delta={0, 0, 0, 0,  40, 0}},
              {joint_angles_delta={0, 0, 0, 0,  40, 0}},
              {joint_angles_delta={0, 0, 0, 0, -40, 0}},
              {joint_angles_delta={0, 0, 0, 0,   0, -60}},
              {joint_angles_delta={0, 0, 0, 0,   0,  60}},
              {joint_angles_delta={0, 0, 0, 0,   0,  60}},
              {joint_angles_delta={0, 0, 0, 0,   0, -60}}}
tool = 0
user = 0
vel = 100
acc = 0
ovl = 100
epos = {0, 0, 0, 0}
blendT = 0
offset_flag = 0
offset_pos = {0, 0, 0, 0, 0, 0}
PTP(SimpleLoadIdentify, 100, 0,0)
WaitMs(3000)
SetCurrentLoadIdentifyPoint(1)
j1, j2, j3, j4, j5, j6 = GetActualJointPosDegree(1)
if tonumber(j5) ~= nil and tonumber(j6) ~= nil then
    for index, data_point in ipairs(trace_data) do
        local joint_angles_delta = data_point.joint_angles_delta
        j1, j2, j3, j4, j5, j6 = GetActualJointPosDegree(1)
        x1, x2, x3, x4, x5, x6 = GetForwardKin(j1, j2, j3, j4, tonumber(j5) + joint_angles_delta[5], tonumber(j6) + joint_angles_delta[6])
        MoveJ({j1, j2, j3, j4, tonumber(j5) + joint_angles_delta[5], tonumber(j6) + joint_angles_delta[6]},
              {x1, x2, x3, x4, x5, x6}, tool, user, vel, acc, ovl, epos, blendT, offset_flag, offset_pos)
        WaitMs(2500)
        SetCurrentLoadIdentifyPoint(tonumber(index+1))
    end
end
