import { useEffect } from "react";
import useDemo from "../hooks/useDemo";
const Docs = () => {
  const { queryData } = useDemo();
  // test Function
  useEffect(() => {
    console.log("请求到的数据", queryData);
  }, []);

  return (
    <div className="flex flex-col text-left items-start self-stretch gap-4 main-content max-w-[1440px] mx-auto px-4">
      <div className="flex flex-col items-center pb-px py-12 ">
        <span className="text-white text-3xl font-bold">
          {"Documentations"}
        </span>
      </div>
      Coming Soon...
    </div>
  );
};

export default Docs;
