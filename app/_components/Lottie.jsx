import Lottie from "react-lottie";

export default function LottieImg({
  animationData,
  height = 300,
  width = 300,
  loop = true,
}) {
  const defaultOptions = {
    loop: loop,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return <Lottie options={defaultOptions} height={height} width={width} />;
}
