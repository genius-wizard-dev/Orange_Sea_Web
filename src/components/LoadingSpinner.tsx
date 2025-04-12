import React from "react";
import Backdrop from "./Backdrop";

const LoadingSpinner: React.FC = () => {
  return (
    <Backdrop>
      <div className="flex flex-col items-center justify-center">
        <div className="w-32 h-32 animate-[pulse_1.5s_ease-in-out_infinite]">
          <img
            src="/images/OrangeSEA.png"
            alt="Loading"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </Backdrop>
  );
};

export default LoadingSpinner;
