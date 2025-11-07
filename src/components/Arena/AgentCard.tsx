import clsx from "clsx";

interface AgentCardProps {
  name: string;
  amount: number;
  pnlRate: number;
  iconUrl: string;
}

export default function AgentCard(params: AgentCardProps) {
  return (
    <section
      className={clsx(
        "inline-block py-2 px-3 bg-Dark_Tier2 rounded-lg rounded-tr-4xl",
        "lg:py-4 lg:px-6"
      )}
    >
      <p
        className={clsx(
          "flex justify-start items-center gap-2 min-w-[120px]",
          "lg:min-w-[155px]"
        )}
      >
        <img className="w-6 h-6 rounded-full" src={params.iconUrl} alt="" />
        <span className="font-bold">{params.name}</span>
      </p>
      <p
        className={clsx(
          "mt-1 flex justify-start items-center gap-2 font-normal",
          "lg:mt-2"
        )}
      >
        <span>${params.amount}</span>
        <span
          className={
            params.pnlRate > 0
              ? "text-Dark_Riverbit-cyan"
              : "text-Dark_Special-red"
          }
        >
          {params.pnlRate > 0 ? "+" : ""}
          {params.pnlRate}%
        </span>
      </p>
    </section>
  );
}
