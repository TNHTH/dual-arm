using HalconDotNet;
using System;
using System.IO;

namespace ExternalReference.ThingerVisionDemo
{
    public class ShapeModelHelper
    {
        private HalconHelper halcon = new HalconHelper();

        public OperateResult CreateShapeModel(HTuple hWindowHandle, HObject hImage, MatchParams matchParams)
        {
            try
            {
                halcon.disp_message(hWindowHandle, "请绘制模板区域，完成后右击确认", "window", 20, 20, "red", "false");

                HOperatorSet.DrawRectangle2(
                    hWindowHandle,
                    out HTuple row,
                    out HTuple column,
                    out HTuple phi,
                    out HTuple length1,
                    out HTuple length2);

                HOperatorSet.GenRectangle2(out matchParams.modelRegion, row, column, phi, length1, length2);
                HOperatorSet.ReduceDomain(hImage, matchParams.modelRegion, out HObject imageReduced);

                if (matchParams.modelId != null)
                {
                    HOperatorSet.ClearShapeModel(matchParams.modelId);
                }

                HOperatorSet.CreateShapeModel(
                    imageReduced,
                    "auto",
                    matchParams.startAngle,
                    matchParams.rangeAngle,
                    "auto",
                    "auto",
                    "use_polarity",
                    "auto",
                    "auto",
                    out matchParams.modelId);

                HOperatorSet.DispObj(hImage, hWindowHandle);
                HOperatorSet.DispObj(matchParams.modelRegion, hWindowHandle);

                if (matchParams.modelId != null)
                {
                    halcon.disp_message(hWindowHandle, "创建模板成功", "window", 20, 20, "green", "false");
                    return OperateResult.CreateSuccessResult();
                }

                halcon.disp_message(hWindowHandle, "创建模板失败", "window", 20, 20, "red", "false");
                return OperateResult.CreateFailResult("创建模板失败，未查找到模板");
            }
            catch (Exception ex)
            {
                halcon.disp_message(hWindowHandle, "创建模板失败：" + ex.Message, "window", 20, 20, "red", "false");
                return OperateResult.CreateFailResult("创建模板失败：" + ex.Message);
            }
        }

        public OperateResult FindShapeModel(HTuple hWindowHandle, HObject hImage, MatchParams matchParams, out HTuple homMat2D)
        {
            homMat2D = new HTuple();

            try
            {
                HOperatorSet.FindShapeModel(
                    hImage,
                    matchParams.modelId,
                    matchParams.startAngle,
                    matchParams.rangeAngle,
                    matchParams.score,
                    matchParams.numMatchs,
                    matchParams.overlap,
                    "least_squares",
                    0,
                    matchParams.greediness,
                    out HTuple row,
                    out HTuple column,
                    out HTuple angle,
                    out HTuple score);

                if (row.Length <= 0)
                {
                    halcon.disp_message(hWindowHandle, "查找模板失败", "window", 20, 20, "red", "false");
                    return OperateResult.CreateFailResult("查找模板失败：未查找到模板");
                }

                HOperatorSet.VectorAngleToRigid(0, 0, 0, row, column, angle, out HTuple homMat2dT);
                HOperatorSet.GetShapeModelContours(out HObject contour, matchParams.modelId, 1);
                HOperatorSet.AffineTransContourXld(contour, out HObject contour2, homMat2dT);
                HOperatorSet.GenCrossContourXld(out HObject cross, row, column, 20, new HTuple(45));

                HOperatorSet.AreaCenter(matchParams.modelRegion, out HTuple area, out HTuple row0, out HTuple column0);
                HOperatorSet.VectorAngleToRigid(row0, column0, 0, row, column, angle, out homMat2D);

                HOperatorSet.DispObj(hImage, hWindowHandle);
                HOperatorSet.DispObj(contour, hWindowHandle);
                HOperatorSet.DispObj(contour2, hWindowHandle);
                HOperatorSet.DispObj(cross, hWindowHandle);

                halcon.disp_message(hWindowHandle, "查找模板成功", "window", 20, 20, "green", "false");
                return OperateResult.CreateSuccessResult();
            }
            catch (Exception ex)
            {
                halcon.disp_message(hWindowHandle, "查找模板失败：" + ex.Message, "window", 20, 20, "red", "false");
                return OperateResult.CreateFailResult("查找模板失败：" + ex.Message);
            }
        }

        public OperateResult SaveShapeModel(string path, MatchParams matchParams, CircleParams circleParams)
        {
            if (matchParams.modelId == null || matchParams.modelRegion == null || circleParams.rOI_X.Length <= 0 || circleParams.rOI_Y.Length <= 0)
            {
                return OperateResult.CreateFailResult("保存模板失败：模板参数不全");
            }

            HOperatorSet.WriteShapeModel(matchParams.modelId, path + "\\model.shm");
            HOperatorSet.WriteRegion(matchParams.modelRegion, path + "\\model_region.tif");
            HOperatorSet.WriteTuple(circleParams.rOI_Y, path + "\\roi_row.tup");
            HOperatorSet.WriteTuple(circleParams.rOI_X, path + "\\roi_col.tup");
            HOperatorSet.WriteTuple(circleParams.circle_Direct, path + "\\roi_dir.tup");

            bool result = true;
            IniConfigHelper.filePath = path + "\\param.ini";

            result &= IniConfigHelper.WriteIniData("定位参数", "起始角度", matchParams.startAngle.ToString());
            result &= IniConfigHelper.WriteIniData("定位参数", "角度范围", matchParams.rangeAngle.ToString());
            result &= IniConfigHelper.WriteIniData("定位参数", "分数", matchParams.score.ToString());
            result &= IniConfigHelper.WriteIniData("定位参数", "重叠度", matchParams.overlap.ToString());
            result &= IniConfigHelper.WriteIniData("定位参数", "数量", matchParams.numMatchs.ToString());
            result &= IniConfigHelper.WriteIniData("测量参数", "搜索点数", circleParams.circle_Elements.ToString());
            result &= IniConfigHelper.WriteIniData("测量参数", "边缘阈值", circleParams.circle_Threshold.ToString());
            result &= IniConfigHelper.WriteIniData("测量参数", "平滑系数", circleParams.circle_Sigma.ToString());
            result &= IniConfigHelper.WriteIniData("测量参数", "极性", circleParams.circle_Transition.ToString());
            result &= IniConfigHelper.WriteIniData("测量参数", "点选择", circleParams.circle_Point_Select.ToString());

            return result ? OperateResult.CreateSuccessResult() : OperateResult.CreateFailResult("保存模板失败：INI 存储失败");
        }

        public OperateResult<MatchParams, CircleParams> LoadShapeModel(string path)
        {
            if (!Directory.Exists(path))
            {
                return OperateResult.CreateFailResult<MatchParams, CircleParams>("模板目录不存在");
            }

            try
            {
                MatchParams matchParams = new MatchParams();
                CircleParams circleParams = new CircleParams();

                HOperatorSet.ReadShapeModel(path + "\\model.shm", out matchParams.modelId);
                HOperatorSet.ReadRegion(out matchParams.modelRegion, path + "\\model_region.tif");
                HOperatorSet.ReadTuple(path + "\\roi_row.tup", out circleParams.rOI_Y);
                HOperatorSet.ReadTuple(path + "\\roi_col.tup", out circleParams.rOI_X);
                HOperatorSet.ReadTuple(path + "\\roi_dir.tup", out circleParams.circle_Direct);

                IniConfigHelper.filePath = path + "\\param.ini";
                matchParams.startAngle = Convert.ToDouble(IniConfigHelper.ReadIniData("定位参数", "起始角度", "-45"));
                matchParams.rangeAngle = Convert.ToDouble(IniConfigHelper.ReadIniData("定位参数", "角度范围", "90"));
                matchParams.score = Convert.ToDouble(IniConfigHelper.ReadIniData("定位参数", "分数", "1"));
                matchParams.overlap = Convert.ToDouble(IniConfigHelper.ReadIniData("定位参数", "重叠度", "0.5"));
                matchParams.numMatchs = Convert.ToInt32(IniConfigHelper.ReadIniData("定位参数", "数量", "1"));

                circleParams.circle_Elements = Convert.ToInt32(IniConfigHelper.ReadIniData("测量参数", "搜索点数", "1"));
                circleParams.circle_Threshold = Convert.ToInt32(IniConfigHelper.ReadIniData("测量参数", "边缘阈值", "1"));
                circleParams.circle_Sigma = Convert.ToDouble(IniConfigHelper.ReadIniData("测量参数", "平滑系数", "1"));
                circleParams.circle_Transition = IniConfigHelper.ReadIniData("测量参数", "极性", "all");
                circleParams.circle_Point_Select = IniConfigHelper.ReadIniData("测量参数", "点选择", "max");

                return OperateResult.CreateSuccessResult(matchParams, circleParams);
            }
            catch (Exception ex)
            {
                return OperateResult.CreateFailResult<MatchParams, CircleParams>("加载模板失败：" + ex.Message);
            }
        }
    }
}
