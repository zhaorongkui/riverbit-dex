import AgentCard from "../components/Arena/AgentCard";
import clsx from "clsx";
import {
  AgentState,
  useArena,
  type AgentInfoList,
} from "../hooks/arena/useArena";
import { useState } from "react";
import ToggleWithText from "../components/ToggleWithText";
import Select from "../components/Select";
import LineChart from "../components/Arena/LineCharts";
import { CaretDownIcon } from "@radix-ui/react-icons";
import type { ArenaPosition } from "../hooks/arena/useArenaPosition";
import useArenaPosition, { Strategy } from "../hooks/arena/useArenaPosition";
import type { ArenaTrade } from "../hooks/arena/useArenaTrades";
import useArenaTrades from "../hooks/arena/useArenaTrades";
import CreateAgentDialog from "../components/Arena/CreateAgentDialog";
import ShareDialog from "../components/Arena/ShareDialog";
import { useAgentInitContext } from "../hooks/arena/useAgentInit";
import CreateAgentButton from "../components/Arena/CreateAgentButton";
import PnlBox from "../components/Arena/PnlBox";
import ScollerLine from "../components/Arena/ScollerLine";
enum AgentTabs {
  Agents = "Agents",
  Positions = "Positions",
  Trades = "Trades",
}
enum Agent {
  ChatGPT = "ChatGPT",
  DeepSeek = "DeepSeek",
  Riverbit = "Riverbit",
}
enum AgentPerformanceTabs {
  ONE = "Top 1 in 24h",
  FIVE = "Top 5 in 24h",
  TEN = "Top 10 in 24h",
}
enum TimeTabs {
  ALL = "All Time",
  MIN_1 = "1 Min",
  MIN_5 = "5 Min",
  MIN_15 = "15 Min",
  HOUR_4 = "4 Hour",
}
function Arena() {
  const { openInitDialog, setOpenInitDialog } = useAgentInitContext();
  const [openShareDialog, setOpenShareDialog] = useState(false);

  const tabList = Object.values(AgentTabs);
  const agentTabs = Object.values(Agent);
  const agentPerformanceTabs = Object.values(AgentPerformanceTabs);
  const timeTabs = Object.values(TimeTabs);

  const [activeTab, setActiveTab] = useState(AgentTabs.Agents);
  const [activeAgent, setActiveAgent] = useState<Agent>(Agent.ChatGPT);
  const [activePerformanceTab, setActivePerformanceTab] =
    useState<AgentPerformanceTabs>(AgentPerformanceTabs.ONE);
  const [activeTimeTab, setActiveTimeTab] = useState<TimeTabs>(TimeTabs.ALL);

  const { agentList, agentInfoList } = useArena();
  const { positions } = useArenaPosition();
  const { trades } = useArenaTrades();

  return (
    <section className="h-full grid grid-rows-[auto_1fr]">
      <div
        className={clsx(
          "w-full bg-Dark_Tier1 px-6 py-4 custom-scrollbar-x",
          "flex items-center gap-2"
        )}
      >
        {agentList.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            amount={agent.amount}
            pnlRate={agent.pnlRate}
            iconUrl={agent.iconUrl}
          />
        ))}
      </div>

      <section
        className={clsx(
          "p-2 flex flex-col-reverse gap-2",
          "lg:grid lg:grid-cols-[1.4fr_3fr]",
          "xl:grid-cols-[1.3fr_3fr]",
          "4xl:grid-cols-[1fr_3fr]"
        )}
      >
        <div
          className={clsx(
            "flex-1  grid grid-rows-[auto_1fr] gap-4",
            "bg-Dark_Tier1 p-4 rounded-2xl"
          )}
        >
          <ToggleWithText
            options={tabList}
            value={activeTab}
            onChange={(val) => setActiveTab(val as AgentTabs)}
          ></ToggleWithText>

          {activeTab === AgentTabs.Agents && (
            <AgentTabCotent
              activeAgent={activeAgent}
              agentList={agentTabs}
              setActiveAgent={setActiveAgent}
              agentInfoList={agentInfoList}
            />
          )}

          {activeTab === AgentTabs.Positions && (
            <PositionsTabContent
              activeAgent={activeAgent}
              agentList={agentTabs}
              setActiveAgent={setActiveAgent}
              positions={positions}
            />
          )}

          {activeTab === AgentTabs.Trades && (
            <TradesTabContent
              activeAgent={activeAgent}
              agentList={agentTabs}
              setActiveAgent={setActiveAgent}
              trades={trades}
            />
          )}
        </div>

        <div className="w-full bg-Dark_Tier1 p-4 rounded-2xl">
          <div
            className={clsx(
              "w-full flex flex-col justify-start items-center gap-2 text-sm",
              "lg:flex-row lg:justify-between lg:px-3 lg:py-2 lg:text-base"
            )}
          >
            <div className="w-full flex-1 flex items-center gap-2">
              <img src="/icons/star3.svg" alt="" />
              <span className="text-left">AI Trading Agents Performance</span>
              <Select
                value={activePerformanceTab}
                onChange={(val) =>
                  setActivePerformanceTab(val as AgentPerformanceTabs)
                }
                options={agentPerformanceTabs.map((tab) => ({
                  label: tab,
                  value: tab,
                }))}
                className="rounded-lg! bg-transparent"
              ></Select>
            </div>
            <div className="w-full flex-1">
              <ToggleWithText
                options={timeTabs}
                value={activeTimeTab}
                onChange={(val) => setActiveTimeTab(val as TimeTabs)}
              ></ToggleWithText>
            </div>
          </div>
          <LineChart />
        </div>
      </section>

      <ScollerLine />

      <CreateAgentDialog
        open={openInitDialog}
        handleClose={() => setOpenInitDialog(false)}
      ></CreateAgentDialog>

      <ShareDialog
        open={openShareDialog}
        handleClose={() => setOpenShareDialog(false)}
      ></ShareDialog>
    </section>
  );
}

function AgentTabCotent(props: {
  activeAgent: Agent; // 当前选中的 agent
  agentList: Agent[]; // all agents
  agentInfoList: AgentInfoList[]; // 已经创建的 agents 列表
  setActiveAgent: (agent: Agent) => void;
}) {
  const [showMore, setShowMore] = useState<number[]>([]);
  const handleShowMore = (index: number) => {
    if (showMore.includes(index)) {
      setShowMore(showMore.filter((i) => i !== index));
    } else {
      setShowMore([...showMore, index]);
    }
  };
  const showMoreAgentInfo = (index: number) => showMore.includes(index);
  return (
    <section className="w-full flex flex-col gap-4">
      <div
        className={clsx(
          "flex justify-between items-center gap-2 text-xs",
          "lg:text-base"
        )}
      >
        <Select
          value={props.activeAgent}
          onChange={props.setActiveAgent}
          options={props.agentList.map((agent) => ({
            label: agent,
            value: agent,
          }))}
        />
        <div className="flex items-center gap-2">
          <button className="rounded-lg bg-Dark_Tier2 p-2">
            <img
              className="w-5 h-5"
              src="/icons/dashboard.svg"
              alt="dashboard"
            />
          </button>
          <button className="rounded-lg bg-Dark_Tier2 p-2">
            <img className="w-5 h-5" src="/icons/setting.svg" alt="setting" />
          </button>
        </div>
      </div>

      {props.agentInfoList.length > 0 ? (
        <section
          className={clsx(
            "min-h-60 max-h-[calc(100vh-240px)] custom-scrollbar grid gap-4",
            "lg:max-h-[calc(100vh-440px)]"
          )}
        >
          {props.agentInfoList.map((agentInfo, index) => (
            <div
              key={agentInfo.name}
              className={clsx(" px-4 py-6 bg-Dark_Tier2 rounded-2xl")}
            >
              <div className="flex justify-between items-center ">
                <div
                  className={clsx(
                    "flex items-center gap-2",
                    "text-lg font-bold"
                  )}
                >
                  <img
                    className="w-5 h-5"
                    src={agentInfo.iconUrl}
                    alt={agentInfo.name}
                  />
                  {agentInfo.name}
                </div>
                <button className="button-Secondary p-2">
                  <img
                    className="w-5 h-5"
                    src="/icons/icon-share.svg"
                    alt="share"
                  />
                </button>
              </div>
              <ul className="w-full mt-6 grid gap-6">
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">State</span>
                  <span
                    className={clsx(
                      "flex items-center gap-2 px-2 py-1 rounded-lg",
                      agentInfo.state === AgentState.RUNNING
                        ? "text-Dark_Riverbit-cyan bg-Dark_Riverbit-cyan/10"
                        : "text-River_Red bg-River_Red/10"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full inline-block",
                        agentInfo.state === AgentState.RUNNING
                          ? "bg-Dark_Riverbit-cyan"
                          : "bg-River_Red"
                      )}
                    ></span>
                    {agentInfo.state}
                  </span>
                </li>
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">Pnl</span>
                  <PnlBox pnl={agentInfo.pnl}></PnlBox>
                </li>
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">Balance</span>
                  <span>${agentInfo.balance}</span>
                </li>
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">
                    Est.Daily Consumption:
                  </span>
                  <span className="flex items-center gap-2">
                    <img src="/icons/icon-energy.svg" alt="" />
                    {agentInfo.daily_consumption} Energy
                  </span>
                </li>
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">Running Time</span>
                  {agentInfo.daily_consumption > 1 ? "Days" : "Day"}
                </li>
                <li className="w-full flex justify-between">
                  <span className="text-Dark_Secondary">Creation Time</span>
                  <span>{agentInfo.create_time}</span>
                </li>
                {showMoreAgentInfo(index) && (
                  <>
                    <li className="w-full flex justify-between">
                      <span className="text-Dark_Secondary">Trades</span>
                      <span>{agentInfo.trades}</span>
                    </li>
                    <li className="w-full flex justify-between">
                      <span className="text-Dark_Secondary">
                        Scan Frequency
                      </span>
                      <span>{agentInfo.scan_frequency}</span>
                    </li>
                    <li className="w-full flex justify-between">
                      <span className="text-Dark_Secondary">Trading Pairs</span>
                      <span>{agentInfo.trading_pairs}</span>
                    </li>
                    <li className="w-full flex justify-between">
                      <span className="text-Dark_Secondary">
                        Technical indicators
                      </span>
                      <span>{agentInfo.technical_indicators}</span>
                    </li>
                    <li className="w-full flex justify-between">
                      <span className="text-Dark_Secondary">Leverage</span>
                      <span>{agentInfo.leverage}</span>
                    </li>
                    <li className="w-full grid grid-cols-2 gap-2">
                      <button className="button-Secondary">Edit</button>
                      <button className="button-Secondary bg-River_Red/10! text-River_Red">
                        Stop
                      </button>
                    </li>
                  </>
                )}
              </ul>
              <section className={clsx("mt-6 text-Dark_Main")}>
                <button
                  onClick={() => handleShowMore(index)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CaretDownIcon
                    className={clsx(
                      "transition-transform duration-200",
                      showMoreAgentInfo(index) ? "rotate-180" : "rotate-0",
                      "scale-180"
                    )}
                  />
                  <span>Show {showMoreAgentInfo(index) ? "less" : "more"}</span>
                </button>
              </section>
            </div>
          ))}
        </section>
      ) : (
        <EmptyCotent showButton={true}></EmptyCotent>
      )}
    </section>
  );
}

function PositionsTabContent(props: {
  activeAgent: Agent;
  agentList: Agent[];
  positions: ArenaPosition[];
  setActiveAgent: (agent: Agent) => void;
}) {
  return (
    <section className="w-full flex flex-col gap-4">
      <div
        className={clsx(
          "flex justify-start items-center gap-2 text-xs",
          "lg:text-base"
        )}
      >
        <Select
          value={props.activeAgent}
          onChange={props.setActiveAgent}
          options={props.agentList.map((agent) => ({
            label: agent,
            value: agent,
          }))}
        />
        <Select
          value={props.activeAgent}
          onChange={props.setActiveAgent}
          options={props.agentList.map((agent) => ({
            label: agent,
            value: agent,
          }))}
        />
      </div>

      <section
        className={clsx(
          "min-h-60 max-h-[calc(100vh-240px)] custom-scrollbar grid gap-4",
          "lg:max-h-[calc(100vh-440px)]"
        )}
      >
        {props.positions.map((p, index) => (
          <div
            key={index}
            className={clsx("px-4 py-6 bg-Dark_Tier2 rounded-2xl")}
          >
            <div className="flex justify-between items-center px-2">
              <span className={clsx("text-lg font-bold")}>{p.pair}</span>
              <StrategyBox strategy={p.strategy}></StrategyBox>
            </div>
            <section className="w-full mt-6 grid grid-cols-2 gap-2 text-left">
              <div className="w-full grid gap-2 border border-Dark_Tier3 p-4 rounded-lg">
                <span className="text-Dark_Secondary">Entry</span>
                <span className={clsx()}>${p.entryPrice}</span>
              </div>
              <div className="w-full grid gap-2 border border-Dark_Tier3 p-4 rounded-lg">
                <span className="text-Dark_Secondary">Current</span>
                <span>${p.currentPrice}</span>
              </div>
              <div className="w-full grid gap-2 border border-Dark_Tier3 p-4 rounded-lg">
                <span className="text-Dark_Secondary">size</span>
                <span>{p.size}</span>
              </div>
              <div className="w-full grid gap-2 border border-Dark_Tier3 p-4 rounded-lg">
                <span className="text-Dark_Secondary">Pnl</span>
                <PnlBox pnl={p.pnl}></PnlBox>
              </div>
            </section>
            <div className="mt-6 flex justify-between items-center px-2">
              <span className={clsx("text-lg font-bold")}>Agent</span>
              <span className="flex items-center gap-2">
                <img className="w-5 h-5" src={p.iconUrl} alt="" />
                {p.agentName}
              </span>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

function TradesTabContent(props: {
  activeAgent: Agent;
  agentList: Agent[];
  trades: ArenaTrade[];
  setActiveAgent: (agent: Agent) => void;
}) {
  return (
    <section className="w-full flex flex-col gap-4">
      <div
        className={clsx(
          "flex justify-start items-center gap-2 text-xs",
          "lg:text-base"
        )}
      >
        <Select
          value={props.activeAgent}
          onChange={props.setActiveAgent}
          options={props.agentList.map((agent) => ({
            label: agent,
            value: agent,
          }))}
        />
        <Select
          value={props.activeAgent}
          onChange={props.setActiveAgent}
          options={props.agentList.map((agent) => ({
            label: agent,
            value: agent,
          }))}
        />
      </div>

      <section
        className={clsx(
          "min-h-60 max-h-[calc(100vh-240px)] custom-scrollbar grid gap-4",
          "lg:max-h-[calc(100vh-440px)]"
        )}
      >
        {props.trades.map((t, index) => (
          <div
            key={index}
            className={clsx("px-4 py-6 bg-Dark_Tier2 rounded-2xl")}
          >
            <div className="flex justify-between items-center px-2">
              <span className={clsx("text-lg font-bold")}>{t.pair}</span>
              <StrategyBox strategy={t.strategy}></StrategyBox>
            </div>
            <div className="w-full px-2 py-6 flex justify-between gap-6 border-b border-Dark_Tier3">
              <span className="text-Dark_Secondary">Pnl</span>
              <PnlBox pnl={t.pnl}></PnlBox>
            </div>
            <div className="w-full px-2 py-6 grid gap-6 border-b border-Dark_Tier3">
              <p className="flex justify-between ">
                <span className="text-Dark_Secondary">Entry</span>
                <span>${t.entryPrice}</span>
              </p>
              <p className="flex justify-between ">
                <span className="text-Dark_Secondary">Exit</span>
                <span>{t.exitPrice}</span>
              </p>
            </div>
            <div className="w-full px-2 pt-6 grid gap-6">
              <p className="flex justify-between ">
                <span className="text-Dark_Secondary">Agent</span>
                <span className="flex items-center gap-2">
                  <img className="w-5 h-5" src={t.iconUrl} alt="" />
                  {t.agentName}
                </span>
              </p>
              <p className="flex justify-between ">
                <span className="text-Dark_Secondary">Time</span>
                <span>{t.tradeTime}</span>
              </p>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

function EmptyCotent({
  text,
  showButton,
}: {
  text?: string;
  showButton?: boolean;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="">
        <img className="w-32 h-32 m-auto" src="/images/empty.svg" alt="" />
        <p className="text-Dark_Secondary">
          You don't have any {text + "s" || "agents"}.
        </p>
      </div>
      {showButton && <CreateAgentButton className="mt-8" />}
    </div>
  );
}

function StrategyBox({ strategy }: { strategy: string }) {
  return (
    <span
      className={clsx(
        "px-4 py-2 text-Dark_Riverbit-cyan bg-Dark_Riverbit-cyan/10 rounded text-sm",
        strategy === Strategy.LONG
          ? "text-Dark_Riverbit-cyan bg-Dark_Riverbit-cyan/10"
          : "text-River_Red bg-River_Red/10"
      )}
    >
      {strategy}
    </span>
  );
}

export default Arena;
