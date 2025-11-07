"use client";
import { useEffect, useMemo, useState } from "react";

export default function useWindowWidth() {
  // window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return { windowWidth, isMobile };
}
