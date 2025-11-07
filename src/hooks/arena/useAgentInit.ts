import { createContext, useContext, useMemo, useState } from "react";
import { useArenaNFTContext } from "./useArenaNFT";

enum TechnicalIndicator {
  EMA = "EMA",
  RSI = "RSI",
  BollingerBands = "Bollinger Bands",
  MACD = "MACD",
}

enum AlAgentModel {
  GPT5_0_TURBO = "OpenAI ChatGPT 5.0 Speed",
  MODEL_BETA = "model-beta",
  MODEL_GAMMA = "model-gamma",
  MODEL_ALPHA = "model-Alpha",
}

enum TradingPair {
  All = "All Pairs",
  BTCUSDT = "BTC/USDT",
  ETHUSDT = "ETH/USDT",
  LTCUSDT = "LTC/USDT",
}

enum Leverage {
  AUTO = "Auto (AI Decides)",
  Leverage_1 = "1x",
  Leverage_2 = "2x",
  Leverage_3 = "3x",
}

enum Frequency {
  ONE = "1 second",
  FIVE = "5 seconds",
  TEN = "10 seconds (Recommended)",
}

export default function useAgentInit() {
  const { mintNFT } = useArenaNFTContext();

  const AlAgentModels = Object.values(AlAgentModel);
  const TechnicalIndicators = Object.values(TechnicalIndicator);
  const TradingPairs = Object.values(TradingPair);
  const Leverages = Object.values(Leverage);
  const Frequencies = Object.values(Frequency);

  const [processCreateAgent, setProcessCreateAgent] = useState<boolean>(false);
  const [openInitDialog, setOpenInitDialog] = useState<boolean>(false);
  const [agentName, setAgentName] = useState<string>(""); // agent 名称
  const [agentImage, setAgentImage] = useState<File>(); // agent 本地获取的图片资源 （通过 upload 上传获取需要的参数 url）
  const [selectedAlAgentModel, setSelectedAlAgentModel] =
    useState<AlAgentModel>(AlAgentModel.GPT5_0_TURBO); // Technical indicators 选择
  const [selectedTradingPairs, setSelectedTradingPairs] = useState<TradingPair>(
    TradingPair.All
  ); // Trading Pairs 选择
  const [selectedLeverage, setSelectedLeverage] = useState<Leverage>(
    Leverage.AUTO
  ); // Leverage 选择
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>(
    Frequency.TEN
  ); // Frequency 选择
  const [selectedIndicators, setSelectedIndicators] = useState<
    TechnicalIndicator[]
  >([]); // AI Agent Model 选择

  const agentImageURL = useMemo(
    () => agentImage && URL.createObjectURL(agentImage),
    [agentImage]
  );

  // agent init arg --- 创建 agent 所需的参数
  const agentArg = useMemo(() => {
    return {
      agentName,
      selectedAlAgentModel,
      selectedTradingPairs,
      selectedIndicators,
      selectedLeverage,
      selectedFrequency,
    };
  }, [
    agentName,
    selectedAlAgentModel,
    selectedFrequency,
    selectedIndicators,
    selectedLeverage,
    selectedTradingPairs,
  ]);

  const setAgentArg = useMemo(
    () => ({
      setAgentName,
      setAgentImage,
      setSelectedAlAgentModel,
      setSelectedIndicators,
      setSelectedTradingPairs,
      setSelectedLeverage,
      setSelectedFrequency,
    }),
    []
  );

  const handleCheck = (value: TechnicalIndicator) => {
    if (selectedIndicators.includes(value as TechnicalIndicator)) {
      setSelectedIndicators(
        selectedIndicators.filter(
          (indicator) => indicator !== (value as TechnicalIndicator)
        )
      );
    } else {
      setSelectedIndicators([...selectedIndicators, value]);
    }
  };

  const createAgent = async () => {
    setProcessCreateAgent(true);
    try {
      await mintNFT.mutateAsync();
      alert("create agent success");
    } catch (error) {
      throw Error(error as string);
    } finally {
      setProcessCreateAgent(false);
    }
  };

  return {
    AlAgentModels,
    TradingPairs,
    TechnicalIndicators,
    Leverages,
    Frequencies,
    processCreateAgent,
    // args
    agentName,
    agentImage,
    agentImageURL,
    agentArg,
    setAgentArg,
    openInitDialog,
    // methods
    handleCheck,
    createAgent,
    setOpenInitDialog,
  };
}

type AgentInitContextType = ReturnType<typeof useAgentInit>;
export const AgentContext = createContext<AgentInitContextType | null>(null);

export function useAgentInitContext() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgentInit must be used within an AgentProvider");
  }
  return context;
}
