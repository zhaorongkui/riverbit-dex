import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import clsx from "clsx";

interface LineDataPoint {
  time: string;
  value: number;
}

interface LineData {
  name: string;
  color: string;
  icon: string;
  values: LineDataPoint[];
}

/** 工具函数：时间序列 */
const generateTimeSeries = (length: number, intervalSec = 5): string[] => {
  const now = new Date();
  return Array.from({ length })
    .map((_, i) => new Date(now.getTime() - (length - i) * intervalSec * 1000))
    .map((t) =>
      t.toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
};

/** ✅ 平滑但波动更大的随机曲线 */
const generateSmoothLine = (
  name: string,
  color: string,
  icon: string,
  baseValue: number,
  timeList: string[]
): LineData => {
  const startOffset = Math.floor(Math.random() * 6); // 每条线延后0~5分钟
  const offsetTime = (t: string, offsetMin: number) => {
    const d = new Date();
    const [h, m, s] = t.split(":").map(Number);
    d.setHours(h, m + offsetMin, s, 0);
    return d.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const values: LineDataPoint[] = [];
  let last = baseValue;
  let trend = 1;
  const volatility = 250; // 🚀 提高波动幅度

  for (let i = 0; i < timeList.length; i++) {
    const change =
      trend *
      (Math.random() * volatility * 0.8 +
        (Math.random() > 0.9 ? volatility * 1.2 : 0));
    last = Math.max(1000, last + change);
    if (Math.random() > 0.92) trend *= -1;

    values.push({
      time: offsetTime(timeList[i], startOffset),
      value: last,
    });
  }

  return { name, color, icon, values };
};

// ✅ 初始时间序列（满屏 60 点）
const initialTimes = generateTimeSeries(60, 5);
const BASE_VALUE = 10000;

const mockData: LineData[] = [
  generateSmoothLine(
    "Alpha",
    "#4B7BF5",
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg",
    BASE_VALUE,
    initialTimes
  ),
  generateSmoothLine(
    "Beta",
    "#9B6EF3",
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f47e.svg",
    BASE_VALUE,
    initialTimes
  ),
  generateSmoothLine(
    "Gamma",
    "#F97316",
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2600.svg",
    BASE_VALUE,
    initialTimes
  ),
  generateSmoothLine(
    "Delta",
    "#0EA5E9",
    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2728.svg",
    BASE_VALUE,
    initialTimes
  ),
];

const nowLabel = () =>
  new Date().toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const AdaptiveLineChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);
  const dataRef = useRef<LineData[]>(mockData);
  const selectedSeriesRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const instance = echarts.init(chartRef.current);
    chartInstance.current = instance;
    instance.getDom().addEventListener("wheel", () => {}, { passive: false });

    /** 构建系列配置 */
    const buildSeries = (selectedName: string | null): echarts.SeriesOption[] =>
      dataRef.current.map((line) => {
        const isSelected = selectedName === null || selectedName === line.name;
        const opacity = selectedName === null ? 1 : isSelected ? 1 : 0.12;

        return {
          name: line.name,
          type: "line",
          smooth: 0.8,
          smoothMonotone: "x",
          showSymbol: false,
          connectNulls: true,
          data: line.values.map((v) => v.value),
          lineStyle: {
            width: 3,
            opacity,
            cap: "round",
            join: "round",
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: line.color + "80" },
              { offset: 1, color: line.color },
            ]),
            shadowBlur: 6,
            shadowColor: line.color + "40",
          },
          areaStyle: {
            opacity: isSelected ? 0.2 : 0.06,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: line.color + "33" },
              { offset: 1, color: "transparent" },
            ]),
          },
          markPoint: {
            symbol: `image://${line.icon}`,
            symbolSize: [28, 28],
            symbolOffset: [20, 0],
            itemStyle: {
              opacity, // ✅ 跟随选中状态置灰
            },
            label: {
              show: true,
              opacity,
              formatter: `$${line.values[line.values.length - 1].value.toLocaleString()}`,
              color: "#fff",
              backgroundColor: line.color,
              padding: [4, 8],
              borderRadius: 8,
              position: "bottom",
              fontWeight: "bold",
            },
            data: [
              {
                name: line.name,
                value: line.values[line.values.length - 1].value,
                coord: [
                  line.values.length - 1,
                  line.values[line.values.length - 1].value,
                ],
              },
            ],
          },
        } as echarts.SeriesOption;
      });

    /** 基础配置 */
    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#151B1E",
        borderColor: "#1F292E",
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const selectedName = selectedSeriesRef.current;
          const formatValue = (v: any) =>
            Number(v?.value ?? v).toLocaleString();

          if (selectedName) {
            const item = items.find((p: any) => p.seriesName === selectedName);
            if (!item) return "";
            return `
              <div style="display:flex;flex-direction:column;gap:4px;background:#151B1E;padding:6px 10px;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:20px">
                  <span style="display:flex;align-items:center;gap:10px;color:#EBEEF0;font-size:12px;font-weight:bold;">
                    <img src="${
                      dataRef.current.find((d) => d.name === item.seriesName)
                        ?.icon
                    }" width="18" height="18" />
                    ${item.seriesName}
                  </span>
                  <span style="color:#EBEEF0;font-weight:bold;">$${formatValue(item.data)}</span>
                </div>
                <div style="display:grid;gap:16x;">
                  <p style="font-size:12px;color:#888;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="color:#75838A">PnL</span>
                    <span style="color:${item.data - BASE_VALUE > 0 ? "#0EECBC" : "#FF4D4F"};">$${formatValue(item.data - BASE_VALUE)}</span>
                  </p>
                  <p style="font-size:12px;color:#888;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="color:#75838A">Creator</span>
                    <span style="color:#EBEEF0">${"0x91f2...2ab5"}</span>
                  </p>
                  <p style="font-size:12px;color:#888;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="color:#75838A">Running time</span>
                    <span style="color:#EBEEF0">${nowLabel()}</span>
                  </p>
                  <p style="font-size:12px;color:#888;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="color:#75838A">Creation Time</span>
                    <span style="color:#EBEEF0">${nowLabel()}</span>
                  </p>
                </div>
              </div>`;
          }

          return `
            <div style="display:flex;flex-direction:column;gap:4px;background:#151B1E;padding:6px 10px;border-radius:8px;">
              <p style="font-size:18px;color:#EBEEF0;">${items[0].axisValue}</p>
              ${items
                .map(
                  (p: any) => `
                  <div style="display:flex;justify-content:space-between;gap:20px;align-items:center;">
                    <span style="display:flex;align-items:center;gap:10px;color:#EBEEF0;font-size:12px;font-weight:bold;">
                      <img src="${
                        dataRef.current.find((d) => d.name === p.seriesName)
                          ?.icon
                      }" width="18" height="18" />
                      ${p.seriesName}
                    </span>
                    <span style="color:#EBEEF0;font-weight:bold;">$${formatValue(p.data)}</span>
                  </div>`
                )
                .join("")}
            </div>`;
        },
      },
      grid: { left: "5%", right: "10%", top: "10%", bottom: "5%" },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dataRef.current[0].values.map((v) => v.time),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#888" },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: { lineStyle: { color: "#354046", type: "dashed" } },
        axisLabel: { color: "#888" },
      },
      dataZoom: [
        {
          type: "inside",
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          throttle: 50,
        },
      ],
      series: buildSeries(selectedSeriesRef.current),
    };

    instance.setOption(option);

    /** 点击线条高亮 */
    const handleClick = (params: any) => {
      const clickedName = params?.seriesName ?? null;
      selectedSeriesRef.current =
        selectedSeriesRef.current === clickedName ? null : clickedName;
      instance.setOption({ series: buildSeries(selectedSeriesRef.current) });
    };
    instance.on("click", handleClick);

    /** 点击空白恢复全部 */
    const zr = instance.getZr();
    const handleBlankClick = (e: any) => {
      if (!e.topTarget) {
        selectedSeriesRef.current = null;
        instance.setOption({ series: buildSeries(null) });
      }
    };
    zr.on("click", handleBlankClick);

    /** 实时更新 + markPoint 跟随 */
    const updateChart = () => {
      dataRef.current = dataRef.current.map((line) => {
        const last = line.values[line.values.length - 1];
        const prev = line.values[line.values.length - 2]?.value ?? last.value;
        const diff = last.value - prev;
        const next = last.value + diff * 0.4 + (Math.random() - 0.5) * 400; // 🚀 实时波动更大
        const newPoint = { time: nowLabel(), value: Math.max(1000, next) };
        return { ...line, values: [...line.values, newPoint] };
      });

      instance.setOption({
        xAxis: { data: dataRef.current[0].values.map((v) => v.time) },
        series: dataRef.current.map((line) => {
          const isSelected =
            selectedSeriesRef.current === null ||
            selectedSeriesRef.current === line.name;
          const opacity =
            selectedSeriesRef.current === null ? 1 : isSelected ? 1 : 0.12;

          return {
            data: line.values.map((v) => v.value),
            lineStyle: { opacity },
            itemStyle: { opacity },
            markPoint: {
              itemStyle: { opacity },
              label: {
                opacity,
                formatter: `$${line.values[line.values.length - 1].value.toLocaleString()}`,
              },
              data: [
                {
                  name: line.name,
                  value: line.values[line.values.length - 1].value,
                  coord: [
                    line.values.length - 1,
                    line.values[line.values.length - 1].value,
                  ],
                },
              ],
            },
          };
        }),
      });
    };

    const timer = setInterval(updateChart, 5000);
    const handleResize = () => instance.resize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handleResize);
      instance.off("click", handleClick);
      zr.off("click", handleBlankClick);
      instance.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className={clsx("h-full w-full", "min-h-60 max-h-[calc(100vh-400px)]")}
    />
  );
};

export default AdaptiveLineChart;
