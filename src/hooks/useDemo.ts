import { useQuery } from "@tanstack/react-query";
import { getDemo } from "../api/demo";
import { useEffect } from "react";

export default function useDemo() {
  // demo for useQuery
  const queryData = useQuery({
    queryKey: ["demo"],
    queryFn: () => getDemo().then((res) => res),
    initialData: undefined, //设置初始值
    refetchInterval: 60 * 1000, // 设置定时查询
    staleTime: 60 * 1000, // 数据有效时间 （在这个实际内不会触发重复查询，达到防抖和节流的效果）
  });

  useEffect(() => {
    if (!queryData || !queryData.data) return;
    // 结构对象查看内部数据
    console.log("请求数据", queryData.data);
    console.log("请求数据中", queryData.isLoading);
    console.log("请求数据失败", queryData.isError);
    console.log("请求数据暂停", queryData.isPaused);
    console.log("再次请求操作", queryData.refetch);
  }, [queryData]);

  return { queryData };
}
