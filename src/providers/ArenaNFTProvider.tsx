import { type ReactNode } from "react";
import { useArenaNFT, ArenaNftContext } from "../hooks/arena/useArenaNFT";

export default function ArenaNFTProvider({
  children,
}: {
  children: ReactNode;
}) {
  const arenaNFT = useArenaNFT();
  return (
    <ArenaNftContext.Provider value={arenaNFT}>
      {children}
    </ArenaNftContext.Provider>
  );
}
