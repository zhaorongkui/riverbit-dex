import { useState } from "react";
import PrimaryButton from "./Button/PrimaryButton";

type CopyReferralLinkProps = {
  label?: string; // optional label text
  defaultValue?: string; // default referral link
};

const CopyReferralLink = ({
  label = "Your Referral Link:",
  defaultValue = "https://app.hyperliquid.xyz/join/",
}: CopyReferralLinkProps) => {
  const [link, setLink] = useState(defaultValue);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col items-start self-stretch gap-2 w-full">
      {/* Label */}
      <div className="flex flex-col items-center pb-[1px]">
        <span className="text-[#8B949E] text-sm">{label}</span>
      </div>

      {/* Input + Button */}
      <div className="flex flex-row w-full gap-4">
        <input
          placeholder={defaultValue}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full text-white bg-zinc-950 text-sm py-4 px-4 rounded-md border border-solid border-[#30363D] 
                     overflow-x-auto break-all"
        />
        <PrimaryButton size="small" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default CopyReferralLink;
