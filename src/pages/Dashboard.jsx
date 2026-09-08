import { useState }
 from "react";

import AirtimeForm
 from "../components/AirtimeForm";

import Data
 from "../components/Data";

export
 default function
  Dashboard() 
  {
  const
   [tab, setTab]
    = useState("airtime");

  return (
    
    <div className=
    "dashboard">
      <div
       className=
      "tabs">

        <button
          className=
          {`tab-btn ${tab === "airtime" ? "active" : ""}`}
          onClick={() => setTab("airtime")}
        >

          Airtime

        </button>

        <button
          className={`tab-btn ${tab === "data" ? "active" : ""}`}
          onClick={() => setTab("data")}
        >

          Data

        </button>

      </div>

      {tab === "airtime" &&
       <AirtimeForm />}
      {tab ===
       "data" && 
       <Data />}

    </div>
    
  );
}