import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/index.css"],
  theme: {
    extend: {
      screens: {
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      colors: {
        // General
        D600: "#5C6970",
        D500: "#75838A ",
        D400: "#89949A",
        D300: "#ABB5BA",
        D200: "#C5CFD3",
        D100: "#E2E7E9",
        D70: "#EBEEF0",
        D30: "#F7F8F8",
        River_Red: "#DD3C41",
        River_Green: "#61DD3C",
        River_Yellow: "#E8BD30",
        // Button
        Button_Primary: "#0EECBC",
        // Dark
        Dark_Tier0: "#070E12", // D950
        Dark_Tier1: "#0D1417", // D930
        Dark_Tier2: "#151B1E", // D900
        Dark_Tier3: "#1F292E", // D800
        Dark_Tier4: "#354046", // D700
        Dark_Main: "#EBEEF0",
        Dark_RiverbitCyan: "#0EECBC",
        Dark_SpecialRed: "#FF4D4F",
        Dark_Secondary: "#75838A",
        Dark_Placeholder: "#354046",
      },
      zIndex: {
        dialog_content: "61",
        dialog: "60",
        header: "50",
        select: "15",
        orderBook: "1",
      },
      animation: {
        fadein: "fadein 0.5s ease-out forwards",
      },
      keyframes: {
        fadein: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
};

export default config;
