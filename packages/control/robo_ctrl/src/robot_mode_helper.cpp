#include "libfairino/robot.h"
#include "libfairino/robot_error.h"

#include <chrono>
#include <array>
#include <cstring>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>

namespace {

const char* explain_robot_error(int error_code) {
    switch (error_code) {
        case ERR_SUCCESS:
            return "success";
        case ERR_PARAM_NUM:
            return "参数数量不一致";
        case ERR_PARAM_VALUE:
            return "参数值超出合理范围";
        case ERR_EXECUTION_FAILED:
            return "命令执行失败";
        case ERR_PROGRAM_IS_RUNNING:
            return "程序正在运行";
        case ERR_COMPUTE_FAILED:
            return "计算失败";
        case ERR_INVERSE_KINEMATICS_COMPUTE_FAILED:
            return "逆运动学计算失败";
        case ERR_SERVOJ_JOINT_OVERRUN:
            return "关节超限";
        case ERR_STRANGE_POSE:
            return "奇异位姿";
        case ERR_LINE_POINT:
            return "直线目标点不正确";
        case ERR_WAIT_TIMEOUT:
            return "等待超时";
        case ERR_TARGET_POSE_CANNOT_REACHED:
            return "目标位姿不可达";
        case ERR_SOCKET_COM_FAILED:
            return "网络通信异常";
        default:
            return "未分类错误";
    }
}

bool wait_motion_done(FRRobot& robot, int timeout_sec) {
    auto start = std::chrono::steady_clock::now();
    uint8_t motion_done = 0;
    while (true) {
        const int ret = robot.GetRobotMotionDone(&motion_done);
        if (ret != 0) {
            std::cerr << "获取运动完成状态失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
            return false;
        }
        if (motion_done != 0) {
            return true;
        }
        if (std::chrono::steady_clock::now() - start > std::chrono::seconds(timeout_sec)) {
            std::cerr << "等待待机动作完成超时" << std::endl;
            return false;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void print_joint_pos(const char* title, const JointPos& joint_pos) {
    std::cout << title << ": ["
              << joint_pos.jPos[0] << ", "
              << joint_pos.jPos[1] << ", "
              << joint_pos.jPos[2] << ", "
              << joint_pos.jPos[3] << ", "
              << joint_pos.jPos[4] << ", "
              << joint_pos.jPos[5] << "]" << std::endl;
}

}  // namespace

int main(int argc, char** argv) {
    std::string ip = "192.168.58.3";
    std::string arm_name = "R";
    float speed = 5.0f;
    bool normal_only = false;
    int target_mode = -1; // -1 表示保持当前模式，0 表示自动，1 表示手动
    std::array<double, 6> standby_joints = {
        4.365596771240234,
        -77.84477233886719,
        -16.82822608947754,
        -92.0924072265625,
        82.69158935546875,
        -60.655428171157837
    };

    for (int i = 1; i < argc; ++i) {
        const std::string arg = argv[i];
        if (arg == "--ip" && i + 1 < argc) {
            ip = argv[++i];
        } else if (arg == "--arm" && i + 1 < argc) {
            arm_name = argv[++i];
        } else if (arg == "--speed" && i + 1 < argc) {
            speed = std::stof(argv[++i]);
        } else if (arg == "--normal-only") {
            normal_only = true;
        } else if (arg == "--auto-mode") {
            target_mode = 0;
        } else if (arg == "--manual-mode") {
            target_mode = 1;
        } else if (arg == "--keep-mode") {
            target_mode = -1;
        } else if (arg == "--joints" && i + 1 < argc) {
            std::stringstream ss(argv[++i]);
            std::string item;
            for (size_t joint_idx = 0; joint_idx < standby_joints.size(); ++joint_idx) {
                if (!std::getline(ss, item, ',')) {
                    std::cerr << "--joints 需要 6 个逗号分隔的关节角" << std::endl;
                    return 2;
                }
                standby_joints[joint_idx] = std::stod(item);
            }
        } else {
            std::cerr << "用法: " << argv[0]
                      << " [--ip IP] [--arm L|R] [--speed 5.0] [--normal-only]"
                      << " [--auto-mode|--manual-mode|--keep-mode]"
                      << " [--joints j1,j2,j3,j4,j5,j6]"
                      << std::endl;
            return 2;
        }
    }

    FRRobot robot;
    int ret = robot.RPC(ip.c_str());
    if (ret != 0) {
        std::cerr << "连接控制器失败，IP: " << ip << "，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
        return 1;
    }
    std::cout << "已连接控制器: " << ip << "，目标机械臂: " << arm_name << std::endl;

    uint8_t program_state = 0;
    ret = robot.GetProgramState(&program_state);
    if (ret == 0) {
        std::cout << "当前程序状态: " << static_cast<int>(program_state) << std::endl;
        if (program_state == 2 || program_state == 3) {
            ret = robot.ProgramStop();
            if (ret != 0) {
                std::cerr << "停止当前程序失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
                robot.CloseRPC();
                return 1;
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(300));
        }
    }

    uint8_t drag_state = 0;
    ret = robot.IsInDragTeach(&drag_state);
    if (ret != 0) {
        std::cerr << "查询 Drag 状态失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
        robot.CloseRPC();
        return 1;
    }
    std::cout << "当前 Drag 状态: " << static_cast<int>(drag_state) << std::endl;
    if (drag_state == 1) {
        ret = robot.DragTeachSwitch(0);
        if (ret != 0) {
            std::cerr << "退出 Drag 模式失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
            robot.CloseRPC();
            return 1;
        }
        std::cout << "已退出 Drag 模式" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }

    ret = robot.ResetAllError();
    if (ret != 0) {
        std::cerr << "清除机器人错误失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
        robot.CloseRPC();
        return 1;
    }
    std::cout << "已清除机器人错误" << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(300));

    if (target_mode != -1) {
        ret = robot.Mode(target_mode);
        if (ret != 0) {
            std::cerr << "切换模式失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
            robot.CloseRPC();
            return 1;
        }
        if (target_mode == 0) {
            std::cout << "已切换自动模式" << std::endl;
        } else {
            std::cout << "已切换手动模式" << std::endl;
        }
    } else {
        std::cout << "保持当前机器人模式，不主动切换自动/手动" << std::endl;
    }

    ret = robot.RobotEnable(1);
    if (ret != 0) {
        std::cerr << "机器人上使能失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
        robot.CloseRPC();
        return 1;
    }
    std::cout << "已上使能" << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(300));

    if (normal_only) {
        std::cout << "已完成退出拖动/模式处理/上使能，不执行待机动作" << std::endl;
        robot.CloseRPC();
        return 0;
    }

    JointPos current_joint_pos;
    ret = robot.GetActualJointPosDegree(0, &current_joint_pos);
    if (ret == 0) {
        print_joint_pos("当前关节角", current_joint_pos);
    }

    JointPos target_joint_pos;
    std::memset(&target_joint_pos, 0, sizeof(JointPos));
    for (size_t i = 0; i < standby_joints.size(); ++i) {
        target_joint_pos.jPos[i] = standby_joints[i];
    }
    DescPose target_desc_pos;
    std::memset(&target_desc_pos, 0, sizeof(DescPose));
    ExaxisPos exaxis_pos;
    std::memset(&exaxis_pos, 0, sizeof(ExaxisPos));
    DescPose offset_pos;
    std::memset(&offset_pos, 0, sizeof(DescPose));

    std::cout << "开始以低速移动到待机姿态（joints = ["
              << standby_joints[0] << ", "
              << standby_joints[1] << ", "
              << standby_joints[2] << ", "
              << standby_joints[3] << ", "
              << standby_joints[4] << ", "
              << standby_joints[5] << "]）" << std::endl;
    ret = robot.MoveJ(
        &target_joint_pos,
        &target_desc_pos,
        0,
        0,
        speed,
        speed,
        100.0f,
        &exaxis_pos,
        -1.0f,
        0,
        &offset_pos
    );
    if (ret != 0) {
        std::cerr << "移动到待机姿态失败，错误码: " << ret << "（" << explain_robot_error(ret) << "）" << std::endl;
        robot.CloseRPC();
        return 1;
    }

    if (!wait_motion_done(robot, 25)) {
        robot.CloseRPC();
        return 1;
    }

    JointPos final_joint_pos;
    ret = robot.GetActualJointPosDegree(0, &final_joint_pos);
    if (ret == 0) {
        print_joint_pos("待机后关节角", final_joint_pos);
    }

    std::cout << "已切换到正常模式并到达待机姿态" << std::endl;
    robot.CloseRPC();
    return 0;
}
