import { useEffect, useState } from "react";
import { LogProvider } from "@/app/(main)/logContext";
import IndexComponentC from "./central/indexC";
import IndexComponentP from "./peripheral/indexP";

export default function index() {
  const [role, setRole] = useState('CENTRAL' as 'CENTRAL' | 'PERIPHERAL');

  return(
    <>
      <LogProvider>
        {role === 'CENTRAL' && <IndexComponentC setRole={setRole} />}
        {role === 'PERIPHERAL' && <IndexComponentP setRole={setRole} />}
      </LogProvider>
    </>
  )
}