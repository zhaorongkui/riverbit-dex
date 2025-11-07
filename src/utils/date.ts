/**
 * 根据传开始日期、结束日期，计算时间差
 * @param {*} beginTime endTime - 时间差
 */
export function diffDate(beginTime, endTime = beginTime) {
  const start = new Date(beginTime).valueOf();
  const end = new Date(endTime).valueOf();
  // 两个时间戳相差的毫秒数
  const time = end - start;
  // 计算相差的天数
  const day = Math.floor(time / (24 * 3600 * 1000));
  // 计算天数后剩余的毫秒数
  // const msec = time % (24 * 3600 * 1000)
  // 计算出小时数
  // const hour = Math.floor(msec / (3600 * 1000))
  // 计算小时数后剩余的毫秒数
  //const msec2 = msec % (3600 * 1000)
  // 计算相差分钟数
  // const minute = Math.floor(msec2 / (60 * 1000))
  // + hour + '时' + minute + '分'
  const diff = day + "天";
  return { time, diff };
}
/**
 * 根据传时间和类型，计算时间差
 * @param {*} num - 时间差
 */
export function timeDiff(num: any, type = "minutes") {
  const date = new Date();
  if (type === "minutes") {
    date.setMinutes(date.getMinutes() + num);
  } else if (type === "day") {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + num);
  }
  return [formatDate(date), formatDate()];
}

/**
 * 时间格式化
 *
 * @param [d] {Date} - Date 对象，默认为当前时间
 * @param [format] {String} - 格式模板，默认为 `2024-09-11 01:02:03`
 * @return {String} - 格式化后的时间字符串
 */
export function formatDate(d?, format = "YYYY-MM-DD HH:mm:ss") {
  if (!d || d === 'null') {
    return "-";
  }
  d = new Date(d);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  return format
    .replace("YYYY", year + "")
    .replace("YY", ((year % 100) + "").padStart(2, "0"))
    .replace("MM", (month + "").padStart(2, "0"))
    .replace("M", month + "")
    .replace("DD", (date + "").padStart(2, "0"))
    .replace("D", date + "")
    .replace("HH", (hour + "").padStart(2, "0"))
    .replace("H", hour + "")
    .replace("hh", ((hour % 12) + "").padStart(2, "0"))
    .replace("h", (hour % 12) + "")
    .replace("mm", (minute + "").padStart(2, "0"))
    .replace("m", minute + "")
    .replace("ss", (second + "").padStart(2, "0"))
    .replace("s", second + "");
}

// 获取指定月份的天数
export const getTotalDaysOnMonth = (year, month) =>
  new Date(year, month, 0).getDate();
// 获取指定日期是星期几
export const getDay = (year, month, date = 1) =>
  new Date(year, month - 1, date).getDay();
// 获取昨天
export const getYesterday = () =>
  new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
// 获取上周
export const getLastWeek = () =>
  new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7);
// 获取2个日期的数组 ['2022-09-01', '2022-09-02', '2022-09-03']
export const getAllDate = (startDate, endDate, format = "YYYY-MM-DD") => {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  const dateList = [];
  while (endDate.getTime() - startDate.getTime() >= 0) {
    dateList.push(formatDate(startDate, format));
    startDate.setDate(startDate.getDate() + 1);
  }
  return dateList;
};
// el-date-picker禁止大于今天
export const disabledAfterOptions = (time) =>
  time.getTime() > new Date().getTime();
// 禁用今天之前的日期，只允许选择今天及之后的日期
export const disabledBeforeOptions = (time) => {
  // 获取当前时间的毫秒数（今天0点0分0秒）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 返回true表示禁用该日期
  // 这里禁用所有小于等于今天的日期
  return time.getTime() < today.getTime();
};
