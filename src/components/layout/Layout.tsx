import Header from "../Header";
import Footer from "../Footer";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const route = useLocation();

  const hiddenHeader = useMemo(
    () => [""].includes(route.pathname),
    [route.pathname]
  );
  const hiddenFooter = useMemo(
    () => ["/", "/ai-arena"].includes(route.pathname),
    [route.pathname]
  );
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-black">
      {!hiddenHeader && <Header />}
      <main>{children}</main>
      {!hiddenFooter && <Footer />}
    </div>
  );
};

export default Layout;
