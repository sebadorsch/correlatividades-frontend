import Lottie from "lottie-react";
import animation from "src/assets/loadingAnimation.json";

const LoadingAnimation = () => {
  return (
    <div className='row justify-content-center align-items-center'>
      <div style={{ width: 500, height: '100%' }}>
        <Lottie animationData={animation} loop />
      </div>
    </div>
  );
};

export default LoadingAnimation;
