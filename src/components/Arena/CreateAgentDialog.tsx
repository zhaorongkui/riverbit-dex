import clsx from "clsx";
import { Dialog } from "../Dialog";
import { useState } from "react";
import { CaretLeftIcon } from "@radix-ui/react-icons";
import UploadImage from "./Upload";
import CheckBox from "../CheckBox";
import Select from "../Select";
import { useAgentInitContext } from "../../hooks/arena/useAgentInit";
import Button from "../Button/Button";
import { ButtonTheme } from "../Button/theme";
import { useArenaNFTContext } from "../../hooks/arena/useArenaNFT";

export default function CreateAgentDialog({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const {
    AlAgentModels,
    TechnicalIndicators,
    TradingPairs,
    Leverages,
    Frequencies,
    agentImageURL,
    agentArg,
    setAgentArg,
    processCreateAgent,
    handleCheck,
    createAgent,
  } = useAgentInitContext();

  const { currentNftPrice } = useArenaNFTContext();

  const [toNextStep, setToNextStep] = useState(false);
  const handleSubmit = () => createAgent();
  function CancelBtn({ className }: { className?: string }) {
    return (
      <Button
        className={clsx("button-Secondary w-full", className)}
        onClick={() => {
          handleClose();
          setToNextStep(false);
        }}
      >
        Cancel
      </Button>
    );
  }

  return (
    <Dialog open={open} trigger={undefined}>
      {!toNextStep && (
        <section
          id="STEP_ONE"
          className={clsx(
            "max-w-[90vw] max-h-[80vh]",
            "xl:max-w-[1000px]",
            "grid gap-2 py-2",
            "md:grid-cols-[1fr_1fr] md:gap-6",
            "lg:gap-8"
          )}
        >
          <div className={clsx("flex flex-col justify-between gap-2")}>
            <section>
              <p className="flex gap-2 items-center">
                <img
                  className={clsx("w-5 h-5", "md:w-6 md:h-6")}
                  src="/icons/star3-color.svg"
                  alt=""
                />
                <span className={clsx("text-lg", "md:text-2xl")}>
                  Create AI Agent
                </span>
              </p>
              <p
                className={clsx(
                  "mt-1 text-xs text-Dark_Secondary ",
                  "md:text-nowrap md:text-sm"
                )}
              >
                Build your own arena AI Agent warrior and jump into the fight!
              </p>
            </section>

            <section
              className={clsx(
                "flex items-center justify-between gap-2 text-sm",
                "md:gap-6 md:text-base"
              )}
            >
              <UploadImage
                value={agentImageURL}
                onChange={setAgentArg.setAgentImage}
              ></UploadImage>
              <div className="grid gap-2">
                <p>Agent Name</p>
                <input
                  type="text"
                  value={agentArg.agentName}
                  onChange={(e) => setAgentArg.setAgentName(e.target.value)}
                  className={clsx("input-default ")}
                />
                <p className="text-Dark_Placeholder">
                  *This name cannot be changed later
                </p>
              </div>
            </section>

            <section className={clsx("text-sm md:text-base")}>
              <p>Technical indicators</p>
              <p
                className={clsx(
                  "flex justify-start gap-2 py-2s",
                  "md:px-2 md:py-2.5"
                )}
              >
                {TechnicalIndicators.map((indicator) => (
                  <span
                    key={indicator}
                    className={clsx(
                      "px-1.5 py-1 cursor-pointer rounded-md",
                      "text-xs flex items-center gap-2 bg-Dark_Tier2",
                      "md:px-2 md:py-2.5 md:text-sm"
                    )}
                    onClick={() => handleCheck(indicator)}
                  >
                    <CheckBox
                      key={indicator}
                      isChecked={agentArg.selectedIndicators.includes(
                        indicator
                      )}
                    ></CheckBox>
                    {indicator}
                  </span>
                ))}
              </p>
            </section>

            <section
              className={clsx(
                "px-2 py-1.5 text-sm flex justify-between items-center border border-Dark_Tier3 rounded-lg",
                "md:text-base",
                "3xl:px-4 3xl:py-3.5"
              )}
            >
              <p className="text-Dark_Secondary">Al Agent Model</p>
              <Select
                value={agentArg.selectedAlAgentModel}
                onChange={setAgentArg.setSelectedAlAgentModel}
                options={AlAgentModels.map((model) => ({
                  value: model,
                  label: model,
                }))}
                minWidth="200"
                className="bg-transparent border-none! min-w-20!"
              ></Select>
            </section>

            <section className={clsx("text-sm md:text-base")}>
              <p>System Prompt (Al Agent Background)</p>
              <div className="mt-2 input-default ">
                <textarea
                  className={clsx(
                    "custom-scrollbar w-full h-30 resize-none outline-none",
                    "3xl:h-42"
                  )}
                  placeholder="Enter your arena AI warrior's declaration here!"
                />
                <p className="flex justify-end ">
                  <button
                    className={clsx(
                      "flex items-center gap-2 button-Secondary text-Dark_Riverbit-cyan px-3 py-1",
                      "3xl:px-4 3xl:py-2"
                    )}
                  >
                    <img src="/icons/star3-color.svg" alt="" /> Auto
                  </button>
                </p>
              </div>
            </section>
          </div>

          <div className={clsx("grid gap-2 text-sm ", "md:text-base")}>
            <section>
              <p>Behavior Prompt</p>
              <div className="mt-2 input-default">
                <textarea
                  className={clsx(
                    "custom-scrollbar w-full h-30 resize-none outline-none",
                    "3xl:h-42"
                  )}
                  placeholder="Enter your arena AI Behavior Prompt here!"
                />
                <p className="flex justify-end ">
                  <button
                    className={clsx(
                      "flex items-center gap-2 button-Secondary text-Dark_Riverbit-cyan px-3 py-1",
                      "3xl:px-4 3xl:py-2"
                    )}
                  >
                    <img src="/icons/star3-color.svg" alt="" /> Auto
                  </button>
                </p>
              </div>
            </section>

            <section className="grid gap-2">
              <section
                className={clsx(
                  "px-2 py-1.5 flex justify-between items-center border border-Dark_Tier3 rounded-lg",
                  "3xl:px-4 3xl:py-3.5 "
                )}
              >
                <p className="text-Dark_Secondary">Scan Frequency</p>
                <Select
                  value={agentArg.selectedFrequency}
                  onChange={setAgentArg.setSelectedFrequency}
                  options={Frequencies.map((frequency) => ({
                    value: frequency,
                    label: frequency,
                  }))}
                  minWidth="200"
                  className="bg-transparent border-none! min-w-20!"
                ></Select>
              </section>
              <p className="text-sm text-Dark_Secondary text-nowrap">
                *Lower frequency = higher energy consumption
              </p>
            </section>

            <section>
              <section
                className={clsx(
                  "px-2 py-1.5 flex justify-between items-center border border-Dark_Tier3 rounded-lg",
                  "3xl:px-4 3xl:py-3.5 "
                )}
              >
                <p className="text-Dark_Secondary">Leverage</p>
                <Select
                  value={agentArg.selectedLeverage}
                  onChange={setAgentArg.setSelectedLeverage}
                  options={Leverages.map((leverage) => ({
                    value: leverage,
                    label: leverage,
                  }))}
                  minWidth="200"
                  className="bg-transparent border-none! min-w-20!"
                ></Select>
              </section>
            </section>

            <section>
              <section
                className={clsx(
                  "px-2 py-1.5 flex justify-between items-center border border-Dark_Tier3 rounded-lg",
                  "3xl:px-4 3xl:py-3.5 "
                )}
              >
                <p className="text-Dark_Secondary">Trading Pairs</p>
                <Select
                  value={agentArg.selectedTradingPairs}
                  onChange={setAgentArg.setSelectedTradingPairs}
                  options={TradingPairs.map((pair) => ({
                    value: pair,
                    label: pair,
                  }))}
                  minWidth="200"
                  className="bg-transparent border-none! min-w-20!"
                ></Select>
              </section>
            </section>

            <section className="grid gap-2">
              <p className="text-Dark_Main">Hyperliquid API Key</p>
              <input type="text" className="input-default w-full" />
              <p className="text-sm text-Dark_Secondary">
                *Your APl key is encrypted and stored securely
              </p>
            </section>

            <section
              className={clsx("flex gap-2 mb-2", "md:mb-0", "3xl:gap-3")}
            >
              <CancelBtn className={clsx("w-40!", "lg:w-[200px]!")} />
              <button
                className={clsx(
                  "button-Secondary-2 w-full",
                  "w-40!",
                  "lg:w-[200px]!"
                )}
                onClick={() => setToNextStep(true)}
              >
                Next
              </button>
            </section>
          </div>
        </section>
      )}

      {toNextStep && (
        <section
          id="next-left"
          className={clsx(
            "grid gap-3 max-w-[90vw] max-h-[80vh] custom-scrollbar text-sm",
            "md:text-base ",
            "3xl:gap-8"
          )}
        >
          <section>
            <p className="text-center text-Dark_Main relative">
              <button onClick={() => setToNextStep(false)}>
                <CaretLeftIcon
                  className={clsx(
                    "scale-200 text-Dark_Main absolute left-0 top-1/2 -translate-y-1/2",
                    "hover:text-Dark_Secondary"
                  )}
                />
              </button>
              <span className={clsx("text-lg", "text-2xl")}>
                Create AI Agent
              </span>
            </p>
          </section>

          <section className="text-center">
            <img
              className={clsx(
                "m-auto w-12 h-12 rounded-2xl",
                "md:w-18 md:h-18"
              )}
              src={agentImageURL}
              alt=""
            />
            <p className="mt-2">{agentArg.agentName}</p>
          </section>

          <div className="grid gap-2 ">
            <section>
              <div
                className={clsx(
                  "p-6 py-4 grid gap-2 bg-Dark_Tier1 rounded-2xl"
                )}
              >
                <p className="text-Dark_Secondary">My Energy Balance</p>
                <p className="flex items-center gap-2">
                  <img src="/icons/icon-energy.svg" alt="" />
                  <span>{10000}</span> Energy
                </p>
              </div>
            </section>
            <section
              className={clsx(
                "p-4 grid gap-3 *:text-nowrap bg-Dark_Tier1 rounded-2xl",
                "3xl:gap-6 md:p-6"
              )}
            >
              <ArgLine
                label="Al Agent Model"
                value={agentArg.selectedAlAgentModel}
              />
              <ArgLine
                label="Trading Pairs"
                value={agentArg.selectedTradingPairs}
              />
              <ArgLine
                label="Technical indicators"
                value={agentArg.selectedIndicators.join("/")}
              />
              <ArgLine label="Leverage" value={agentArg.selectedLeverage} />
              <ArgLine
                label="Scan Frequency"
                value={agentArg.selectedFrequency}
              />
              <ArgLine
                label="Agent NFT Mint Fee"
                value={
                  !currentNftPrice
                    ? "Limited time free"
                    : currentNftPrice + " USD"
                }
              />
              <ArgLine
                label="Est.Daily Consumption"
                value={
                  <span className="flex items-center gap-2 justify-end">
                    <img src="/icons/icon-energy.svg" alt="" />
                    <span>{agentArg.selectedTradingPairs.length}</span>
                    Energy
                  </span>
                }
              />
            </section>
            <section
              className={clsx(
                "py-1 px-2 flex justify-center items-center gap-2 rounded-lg",
                "bg-Dark_Riverbit-cyan/10 text-Dark_Riverbit-cyan text-xs",
                "md:text-base md:py-4"
              )}
            >
              <span className="w-4 h-4 leading-[100%] grid items-center text-center text-xs rounded-full text-Dark_Tier0 bg-Dark_Riverbit-cyan">
                i
              </span>
              Creating an AI Agent will mint an NFT in your wallet.
            </section>
          </div>

          <section
            className={clsx(
              "w-full flex items-center justify-between gap-2",
              "md:gap-3"
            )}
          >
            <CancelBtn />
            <Button
              disabled={processCreateAgent}
              isLoading={processCreateAgent}
              theme={ButtonTheme.Primary}
              className={clsx("w-full flex justify-center items-center gap-2")}
              onClick={handleSubmit}
            >
              <img src="/icons/star3-black.svg" alt="" />
              <span>Create Now</span>
            </Button>
          </section>
        </section>
      )}
    </Dialog>
  );
}

function ArgLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "grid grid-cols-[1fr_1fr] items-center gap-6 text-xs",
        "md:gap-8 md:text-base"
      )}
    >
      <p>{label}</p>
      <p className="text-right">{value}</p>
    </div>
  );
}
