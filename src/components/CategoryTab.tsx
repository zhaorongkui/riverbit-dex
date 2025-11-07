import React from "react";

type CategoryTabProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const CategoryTab: React.FC<CategoryTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      className="overflow-auto flex whitespace-nowrap text-md w-full"
      style={{
        scrollbarWidth: "thin", // Firefox
        scrollbarColor: "transparent transparent", // Firefox: 預設透明
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-3 py-3 w-full rounded transition ${
            activeTab === tab
              ? "bg-fuchsia-800 text-white font-bold"
              : "bg-transparent text-zinc-400"
          }`}
          onClick={() => onTabChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default CategoryTab;
