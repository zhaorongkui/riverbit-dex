import { CheckIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

export default function CheckBox({
  isChecked,
  className,
}: {
  isChecked?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "w-4 h-4 flex justify-center items-center border border-Dark_Tier4 rounded",
        "hover:border-Dark_Main cursor-pointer",
        isChecked && "bg-Dark_Main",
        "transition-colors duration-200",
        className
      )}
    >
      {isChecked && <CheckIcon className="text-Dark_Tier1" />}
    </span>
  );
}
