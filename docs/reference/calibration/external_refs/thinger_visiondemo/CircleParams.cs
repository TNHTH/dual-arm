using HalconDotNet;

namespace ExternalReference.ThingerVisionDemo
{
    public class CircleParams
    {
        public CircleParams()
        {
            circle_Elements = 60;
            circle_Caliper_Width = 30;
            circle_Caliper_Height = 100;
            circle_Min_Points_Num = 5;
            circle_Threshold = 15;
            circle_Sigma = 1;
            circle_Transition = "all";
            circle_Point_Select = "max";
            circle_Dis_Min = 1;
            circle_Dis_Max = 999;
            scale = 1.0;
        }

        public int circle_Elements;
        public int circle_Caliper_Width;
        public int circle_Caliper_Height;
        public int circle_Min_Points_Num;
        public int circle_Threshold;
        public double circle_Sigma;
        public string circle_Transition;
        public string circle_Point_Select;
        public double circle_Dis_Min;
        public double circle_Dis_Max;
        public double scale;
        public HTuple rOI_X;
        public HTuple rOI_Y;
        public HTuple circle_Direct;
        public HTuple circleCenter_X;
        public HTuple circleCenter_Y;
        public HTuple circleRadius;
        public double distance = 0.0;
    }
}
