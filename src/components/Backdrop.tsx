import React from "react";

interface BackdropProps {
  children?: React.ReactNode;
}

const Backdrop: React.FC<BackdropProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      {children}
    </div>
  );
};

export default Backdrop;
