import { useState } from "react";
import DesktopNav from "./DesktopNav";
import DesktopNavRight from "./DesktopNavRight";
import RiverbitLogo from "./RiverbitLogo";
import clsx from "clsx";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [language, setLanguage] = useState("EN");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="sticky top-0 z-header">
      <div
        className={clsx(
          "flex justify-between items-center self-stretch bg-Dark_Tier1 py-2 px-4",
          "border-b border-Dark_Tier2",
          "md:py-3.5"
        )}
      >
        <div className={clsx("flex-1 flex shrink-0 items-center gap-3")}>
          <RiverbitLogo />
          <DesktopNav />
        </div>
        {/* Right side ( Wallet, Buttons) */}
        <div
          className={clsx(
            "flex-1 flex justify-end shrink-0 items-center gap-2"
          )}
        >
          <button
            className={clsx(
              "flex items-center justify-center p-1.5 rounded-sm focus:outline-none",
              "border border-Dark_Tier3",
              "xl:hidden"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <DesktopNavRight language={language} setLanguage={setLanguage} />
          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <MobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              balance="$27,345.12"
              points="1,250,000"
              language={language}
              setLanguage={setLanguage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
