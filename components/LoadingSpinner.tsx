// @/component/Loading.tsx

import React from "react";
import { LineWave } from "react-loader-spinner";

const LoadingSpinner: React.FC<{ size?: number }> = ({ size }) => {
  return (
    <div className="loading-overlay flex flex-col justify-center items-center h-[calc(100vh-150px)]">
      <div className="loading-spinner">
        <LineWave
          visible={true}
          height={size ? size : 200}
          width={size ? size : 200}
          color="#e5e7eb"
          ariaLabel="triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;