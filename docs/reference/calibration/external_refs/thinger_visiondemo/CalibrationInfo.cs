using HalconDotNet;
using System.Collections.Generic;

namespace ExternalReference.ThingerVisionDemo
{
    public class CalibrationInfo
    {
        public HTuple HomMat2D { get; set; } = new HTuple();

        public List<CalibrationData> CalibrationDatas { get; set; }

        public PositionInfo PositionInfo = new PositionInfo();
    }
}
