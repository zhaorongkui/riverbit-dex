import clsx from "clsx";

export default function PnlBox({ pnl }: { pnl: string | number }) {
  return !isNaN(Number(pnl)) ? (
    <span
      className={clsx(
        Number(pnl) === 0
          ? "text-Dark_Main"
          : Number(pnl) > 0
            ? "text-Dark_Riverbit-cyan"
            : "text-River_Red"
      )}
    >
      {Number(pnl) === 0 ? "" : Number(pnl) > 0 ? "+" : "-"}$
      {Math.abs(Number(pnl)).toFixed(2)}
    </span>
  ) : (
    <span>0</span>
  );
}
