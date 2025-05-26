import { useEffect, useState } from "react";
import { LogProvider } from "@/utils/logContext";
import { LangProvider } from "@/utils/langContext";
import IndexComponentC from "./central/indexC";
import IndexComponentP from "./peripheral/indexP";

export default function index() {
  const [role, setRole] = useState('CENTRAL' as 'CENTRAL' | 'PERIPHERAL');

  return(
    <>
      <LogProvider>
        <LangProvider>
          {role === 'CENTRAL' && <IndexComponentC setRole={setRole} />}
          {role === 'PERIPHERAL' && <IndexComponentP setRole={setRole} />}
        </LangProvider>
      </LogProvider>
    </>
  )
}