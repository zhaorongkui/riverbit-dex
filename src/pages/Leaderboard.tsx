import clsx from "clsx";
import ToggleWithText from "../components/ToggleWithText";
import { useState, type ReactNode } from "react";
import PnlBox from "../components/Arena/PnlBox";
import ScollerLine from "../components/Arena/ScollerLine";

enum LeaderboardTabs {
  PNL = "PnL Ranking",
  SHARPE_RATIO = "Sharpe Ratio",
  ROI = "Roi %",
}

enum TimeTabs {
  ALL = "All Time",
  MIN_1 = "1 Min",
  MIN_5 = "5 Min",
  MIN_15 = "15 Min",
  HOUR_4 = "4 Hour",
}

export default function Leaderboard() {
  const tabList = Object.values(LeaderboardTabs);
  const timeTabs = Object.values(TimeTabs);

  const [activeTab, setActiveTab] = useState(LeaderboardTabs.PNL);
  const [activeTimeTab, setActiveTimeTab] = useState(TimeTabs.ALL);

  return (
    <section className="text-Dark_Main grid grid-rows-[auto_1fr]">
      <ScollerLine />

      <section
        className={clsx(
          "mt-8 mb-25 w-full max-w-[1500px] mx-auto px-2",
          "md:mt-10",
          "lg:px-20 lg:mt-12",
          "3xl:px-0 "
        )}
      >
        <p className={clsx("text-xl", "md:text-2xl", "3xl:text-3xl")}>
          AI Arena Leaderboard
        </p>
        <p
          className={clsx(
            "mt-2 text-Dark_Secondary text-xs",
            "md:text-sm md:mt-4",
            "3xl:text-base"
          )}
        >
          Top performing AI trading agents ranked by various metrics
        </p>

        <section className={clsx("mt-4", "md:mt-6")}>
          <ToggleWithText
            options={tabList}
            value={activeTab}
            onChange={(val) => setActiveTab(val as LeaderboardTabs)}
          ></ToggleWithText>
        </section>

        <section
          className={clsx(
            "mt-2 grid grid-cols-1 gap-2",
            "md:mt-6 md:grid-cols-3"
          )}
        >
          {[1, 2, 3].map((ranking) => (
            <TopCard
              key={ranking}
              ranking={ranking}
              address={""}
              agentUrl={"/icons/chatGPT.svg"}
              agentName={"RiverBit BOT"}
              pnl={""}
            />
          ))}
        </section>

        <section
          className={clsx(
            "mt-2 w-full p-4 bg-Dark_Tier1 rounded-2xl",
            "md:mt-6"
          )}
        >
          <div
            className={clsx(
              "flex flex-col justify-between items-center",
              "md:flex-row"
            )}
          >
            <p
              className={clsx(
                "w-full pl-6 text-xl font-bold",
                "md:flex-1 md:text-left md:text-2xl"
              )}
            >
              Profit & Loss Rankings
            </p>
            <section className={clsx("w-full mt-2", "md:flex-1 md:mt-0")}>
              <ToggleWithText
                options={timeTabs}
                value={activeTimeTab}
                onChange={(val) => setActiveTimeTab(val as TimeTabs)}
              ></ToggleWithText>
            </section>
          </div>
          <table
            className={clsx(
              "mt-2 w-full table-fixed hidden",
              "md:table",
              "lg:mt-6",
              "3xl:mt-12"
            )}
          >
            <thead>
              <tr
                className={clsx(
                  "text-left *:py-4.5 text-Dark_Secondary text-sm",
                  "*:first:pl-4 *:py-4.5 *:last:pr-4"
                )}
              >
                <th className="">NO.</th>
                <th className="">Creator</th>
                <th className="">Agent Name</th>
                <th className="">Pnl</th>
                <th className="">Win Rate</th>
                <th className="">Trades</th>
                <th className="">Running time</th>
                <th className="text-right">Creation time</th>
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3].map((ranking) => (
                <tr
                  key={ranking}
                  className={clsx(
                    "text-left text-Dark_Main text-sm",
                    "*:first:pl-4 *:py-4.5 *:last:pr-4"
                  )}
                >
                  <td className="">NO.{ranking}</td>
                  <td className="">0x91f2...2ab5</td>
                  <td className="flex items-center gap-2">
                    <img
                      className="w-6 h-6"
                      src={"/icons/chatGPT.svg"}
                      alt=""
                    />{" "}
                    {"Riverbit Bot"}
                  </td>
                  <td className="">
                    <PnlBox pnl={ranking} />
                  </td>
                  <td className="">{ranking}%</td>
                  <td className="">{ranking}</td>
                  <td className="">
                    {" "}
                    {new Date(1761994338780).toLocaleString()}
                  </td>
                  <td className="text-right">
                    {new Date(1761995338780).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <section
            className={clsx(
              "mt-2 w-full grid grid-cols-1 gap-2",
              "md:hidden",
              "lg:mt-6",
              "3xl:mt-12"
            )}
          >
            {[1, 2, 3].map((item) => (
              <RankingBox
                key={item}
                ranking={item}
                address={"0x91f2...2ab5"}
                agentUrl={"/icons/chatGPT.svg"}
                agentName={"Riverbit Bot"}
                pnl={"1"}
                winRate={"2.5"}
                trades={"100"}
                runningTime={"2025-11-02 12:00:00"}
                creationTime={"2025-11-02 12:00:00"}
              />
            ))}
          </section>
        </section>

        <section></section>
      </section>
    </section>
  );
}

function TopCard({
  ranking,
  address,
  agentUrl,
  agentName,
  pnl,
}: {
  ranking: number;
  address: string;
  agentUrl: string;
  agentName: string;
  pnl: string | number;
}) {
  return (
    <section
      className={clsx("p-3 bg-Dark_Tier1 rounded-2xl", "md:p-4", "3xl:p-6")}
    >
      <div className={clsx("grid grid-cols-2 gap-2", "md:gap-2", "3xl:gap-6")}>
        <div className="flex items-center gap-4 text-left">
          <img
            className={clsx(
              "w-6 h-10 rounded-full",
              "md:w-10 md:h-14",
              "3xl:w-12 3xl:h-16"
            )}
            src={`/images/leaderboard/ranking_${ranking}.svg`}
            alt=""
          />
          <span
            className={clsx(
              ranking === 1 && "text-Dark_Riverbit-cyan",
              ranking === 2 && "text-Dark_River_Yellow",
              ranking === 3 && "text-Dark_Secondary"
            )}
          >
            TOP {ranking}
          </span>
        </div>

        <div className="text-left">
          <p className="text-Dark_Secondary text-sm">Creator</p>
          <p className="mt-2">{address}</p>
        </div>
      </div>

      <div
        className={clsx(
          "grid grid-cols-2 gap-6 items-center mt-2 text-sm",
          "md:mt-4",
          "3xl:mt-6"
        )}
      >
        <div className="text-left">
          <p className="text-Dark_Secondary">Agent Name</p>
          <p className="mt-2 flex items-center gap-2">
            <img
              className={clsx("w-4 h-4 rounded-full", "md:w-5 md:h-5")}
              src={agentUrl}
              alt=""
            />
            {agentName}
          </p>
        </div>
        <div className="text-left">
          <p className="text-Dark_Secondary text-sm">Pnl</p>
          <p className="mt-2">
            <PnlBox pnl={pnl} />
          </p>
        </div>
      </div>
    </section>
  );
}

function RankingBox({
  ranking,
  address,
  agentUrl,
  agentName,
  pnl,
  winRate,
  trades,
  runningTime,
  creationTime,
}: {
  ranking: number;
  address: string;
  agentUrl: string;
  agentName: string;
  pnl: string | number;
  winRate: string | number;
  trades: string | number;
  runningTime: string | number;
  creationTime: string | number;
}) {
  function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
      <div className="grid gap-2">
        <p className="text-Dark_Secondary text-xs">{label}</p>
        <div className="text-sm">{value}</div>
      </div>
    );
  }
  return (
    <div
      className={clsx(
        "w-full p-2.5 grid grid-cols-2 bg-Dark_Tier4/30 rounded-2xl text-left gap-2"
      )}
    >
      <Row label={"NO." + ranking} value={address} />
      <Row
        label="Agent Name"
        value={
          <p className="flex items-center gap-2">
            <img
              className={clsx("w-4 h-4 rounded-full", "md:w-5 md:h-5")}
              src={agentUrl}
              alt=""
            />
            {agentName}
          </p>
        }
      />
      <Row label="Pnl" value={<PnlBox pnl={pnl} />} />
      <Row label="Win Rate" value={winRate + " %"} />
      <Row label="Trades" value={trades} />
      <Row label="Running Time" value={runningTime} />
      <Row label="Creation Time" value={creationTime} />
    </div>
  );
}
