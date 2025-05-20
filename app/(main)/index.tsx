import { useEffect, useState } from "react";
import IndexComponentC from "./central/indexC";
import IndexComponentP from "./peripheral/indexP";

export default function index() {
  const [role, setRole] = useState('CENTRAL' as 'CENTRAL' | 'PERIPHERAL');

  return(
    <>
      {role === 'CENTRAL' && <IndexComponentC setRole={setRole} />}
      {role === 'PERIPHERAL' && <IndexComponentP setRole={setRole} />}
    </>
  )
}