import clsx from "clsx";
import { useAgentInitContext } from "../../hooks/arena/useAgentInit";
import type { ReactNode } from "react";

export default function CreateAgentButton({
  className,
  customContent,
}: {
  className?: string;
  customContent?: ReactNode;
}) {
  const { setOpenInitDialog } = useAgentInitContext();
  return (
    <button
      onClick={() => {
        setOpenInitDialog(true);
      }}
      className={clsx(
        "gap-2 button-Secondary px-4 text-Button_Primary flex! items-center text-xs!",
        "lg:text-base!",
        className
      )}
    >
      {customContent ? (
        customContent
      ) : (
        <>
          <img className="w-5 h-5" src="/icons/star3-color.svg" alt="" />
          <span>Create Agent</span>
        </>
      )}
    </button>
  );
}
