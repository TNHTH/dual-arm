#include <opencv2/core.hpp>
#include <iostream>

int main() {
    // 用一个最小程序验证 OpenCV 头文件和链接是否可用。
    cv::Mat image = cv::Mat::zeros(8, 8, CV_8UC3);

    std::cout << "OpenCV version: " << CV_VERSION << std::endl;
    std::cout << "Smoke image shape: " << image.rows << "x" << image.cols << std::endl;

    return 0;
}
