import clsx from "clsx";
import React from "react";
import { Link } from "react-router-dom";

interface RiverbitLogoProps {
  className?: string;
}

const RiverbitLogo: React.FC<RiverbitLogoProps> = ({ className }) => {
  return (
    <Link
      className="flex justify-center items-center gap-2"
      key={"home"}
      to={"/ai-arena"}
    >
      <img
        src={"/logo-Riverbit.svg"}
        className={`w-auto h-[15px] object-fill ${className || ""}`}
        alt="Riverbit Logo"
      />
      <span className={clsx("text-lg text-Dark_Riverbit-cyan")}>RiverBit</span>
    </Link>
  );
};

export default RiverbitLogo;
