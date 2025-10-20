"use client";

import Lottie from "lottie-react";
import loaderAnimation from "@/public/animations/loader.json"; // ✅ your local JSON file

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-DEFAULT z-[9999]">
      <Lottie
        animationData={loaderAnimation}
        loop
        autoplay
        style={{ width: 300, height: 300 }}
      />
    </div>
  );
};

export default Loader;
