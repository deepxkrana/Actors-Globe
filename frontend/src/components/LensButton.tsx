import React from "react";

interface LensButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const LensButton: React.FC<LensButtonProps> = ({
  label = "Get Started",
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`lens-button cursor-pointer relative select-none group text-white ${className}`}
      aria-label={label}
    >
      <span className="text-xl md:text-2xl font-medium tracking-tight group-hover:scale-105 transition-transform duration-300">
        {label}
      </span>
      {/* Dynamic specular glint */}
      <div className="absolute inset-0 rounded-full bg-linear-to-tr from-white/20 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
