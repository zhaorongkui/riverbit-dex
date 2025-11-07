import clsx from "clsx";
import SpaceTunnel from "../components/LandingAnimation";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section className="min-h-screen ">
      <SpaceTunnel />
      <div className="absolute top-0 left-0 w-full min-h-screen flex justify-center items-center gap-2">
        <img src="/logo-Riverbit.svg" className={clsx("w-20 h-20")} alt="" />
        <Link
          to="/trading"
          className={clsx(
            "transition-all duration-150 animate-pulse",
            "bg-white/50 text-black/60 px-6 py-2 rounded-full text-xl font-bold border-4 border-transparent",
            "active:border-pink-400/50",
            "focus:border-pink-400/50",
            "hover:bg-white/80 hover:text-black/80"
          )}
        >
          Launch App
        </Link>
      </div>
    </section>
  );
}
