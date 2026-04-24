using HalconDotNet;
using System;
using System.Collections.Generic;
using System.IO;

namespace ExternalReference.ThingerVisionDemo
{
    public class CalibrationHelper
    {
        public List<string> GetAllCalibrations(string basePath)
        {
            List<string> result = new List<string>();
            DirectoryInfo directoryInfo = new DirectoryInfo(basePath);

            foreach (var item in directoryInfo.GetDirectories())
            {
                result.Add(item.Name);
            }

            return result;
        }

        public OperateResult<HTuple> Calibration(List<CalibrationData> calibrationDatas)
        {
            try
            {
                HTuple imageX = new HTuple();
                HTuple imageY = new HTuple();
                HTuple mechanicalX = new HTuple();
                HTuple mechanicalY = new HTuple();

                foreach (var item in calibrationDatas)
                {
                    imageX = imageX.TupleConcat(item.ImageX);
                    imageY = imageY.TupleConcat(item.ImageY);
                    mechanicalX = mechanicalX.TupleConcat(item.PositionX);
                    mechanicalY = mechanicalY.TupleConcat(item.PositionY);
                }

                HOperatorSet.VectorToHomMat2d(imageX, imageY, mechanicalX, mechanicalY, out HTuple homMat2D);
                return OperateResult.CreateSuccessResult(homMat2D);
            }
            catch (Exception ex)
            {
                return OperateResult.CreateFailResult<HTuple>("标定失败：" + ex.Message);
            }
        }

        public OperateResult SaveCalibration(string dir, CalibrationInfo calibrationInfo)
        {
            bool result = IniConfigHelper.WriteIniData(
                "标定数据",
                "九点标定",
                JsonHelper.EntityToJSON(calibrationInfo.CalibrationDatas),
                dir + "\\CalibrationData.ini");

            if (!result)
            {
                return OperateResult.CreateFailResult("九点标定数据写入失败");
            }

            result = IniConfigHelper.WriteIniData(
                "标定数据",
                "位置信息",
                JsonHelper.EntityToJSON(calibrationInfo.PositionInfo),
                dir + "\\Position.ini");

            if (!result)
            {
                return OperateResult.CreateFailResult("位置信息写入失败");
            }

            try
            {
                HOperatorSet.WriteTuple(calibrationInfo.HomMat2D, dir + "\\HomMat2D.tup");
            }
            catch (Exception ex)
            {
                return OperateResult.CreateFailResult("仿射变换矩阵写入失败：" + ex.Message);
            }

            return OperateResult.CreateSuccessResult();
        }

        public OperateResult<CalibrationInfo> LoadCalibration(string dir)
        {
            CalibrationInfo calibrationInfo = new CalibrationInfo();

            calibrationInfo.CalibrationDatas =
                JsonHelper.JSONToEntity<List<CalibrationData>>(
                    IniConfigHelper.ReadIniData("标定数据", "九点标定", "", dir + "\\CalibrationData.ini"));

            calibrationInfo.PositionInfo =
                JsonHelper.JSONToEntity<PositionInfo>(
                    IniConfigHelper.ReadIniData("标定数据", "位置信息", "", dir + "\\Position.ini"));

            try
            {
                HOperatorSet.ReadTuple(dir + "\\HomMat2D.tup", out HTuple homMat2D);
                calibrationInfo.HomMat2D = homMat2D;
            }
            catch (Exception ex)
            {
                return OperateResult.CreateFailResult<CalibrationInfo>("仿射变换矩阵读取失败：" + ex.Message);
            }

            return OperateResult.CreateSuccessResult(calibrationInfo);
        }
    }
}
