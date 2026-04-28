#ifndef ROBO_CTRL_SAFETY_LIMITS_HPP
#define ROBO_CTRL_SAFETY_LIMITS_HPP

#include <cmath>
#include <string>

namespace robo_ctrl::safety {

inline bool validate_percent_value(double value, double max_value, const char* name, std::string& error_message) {
    if (!std::isfinite(value)) {
        error_message = std::string(name) + " 必须是有限数值";
        return false;
    }
    if (value < 0.0 || value > max_value) {
        error_message = std::string(name) + " 超出范围 [0, " + std::to_string(max_value) + "]";
        return false;
    }
    return true;
}

inline bool validate_positive_percent_value(double value, double max_value, const char* name, std::string& error_message) {
    if (!validate_percent_value(value, max_value, name, error_message)) {
        return false;
    }
    if (value <= 0.0) {
        error_message = std::string(name) + " 必须大于 0";
        return false;
    }
    return true;
}

inline bool validate_blend_time(double value, std::string& error_message) {
    if (!std::isfinite(value) || value < -1.0 || value > 500.0) {
        error_message = "blend_time 超出范围 [-1, 500]";
        return false;
    }
    return true;
}

}  // namespace robo_ctrl::safety

#endif  // ROBO_CTRL_SAFETY_LIMITS_HPP
