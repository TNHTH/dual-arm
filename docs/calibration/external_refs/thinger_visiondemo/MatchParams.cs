using HalconDotNet;

namespace ExternalReference.ThingerVisionDemo
{
    public class MatchParams
    {
        public MatchParams()
        {
            startAngle = -45;
            rangeAngle = 90;
            score = 0.5;
            numMatchs = 1;
            overlap = 0.1;
            greediness = 0.9;
            scaleRMin = 0.8;
            scaleRMax = 1.2;
            scaleCMin = 0.8;
            scaleCMax = 1.2;

            HOperatorSet.GenEmptyObj(out modelRegion);
        }

        public double startAngle;
        public double rangeAngle;
        public double score;
        public double scaleRMin;
        public double scaleRMax;
        public double scaleCMin;
        public double scaleCMax;
        public double greediness;
        public int numMatchs;
        public double overlap;
        public HTuple homMat2D;
        public HTuple metric;
        public HObject modelRegion;
        public HTuple modelId;

        ~MatchParams()
        {
            if (modelId != null)
            {
                HOperatorSet.ClearShapeModel(modelId);
            }
        }
    }
}
