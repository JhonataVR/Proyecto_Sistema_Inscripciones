import React, { useEffect } from "react";

interface GlobalLoaderProps {
  show: boolean;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ show }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <>
      {show && (
        <div className="fixed inset-0 z-[9998] bg-black flex items-center justify-center ">
          <div className="w-full max-w-xs bg-black rounded-lg shadow-lg p-8 border-2 border-green-500 flex flex-col items-center">
            <span className="text-green-400 font-mono text-2xl animate-pulse select-none">
              Cargando...
              <span className="animate-pulse ml-2">█</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalLoader;