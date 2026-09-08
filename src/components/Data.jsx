import
 {
   useState
   }
    from
     "react";


import
 NetworkSelector
  from
   "./NetworkSelector";

export
 default function
  Data()
   {

  const
   [network, setNetwork]
    =
     useState(null);

  const
   [plans, setPlans]
    =
     useState([]);

  const
   [loading, setLoading]
    =
     useState(false);

  const 
  [message, setMessage]
   =
    useState("");

  const
   [selectedPlan, setSelectedPlan]
    = useState(null);

  const
   [phone, setPhone]
    = useState("");

  async function fetchDataPlans(provider)
   {
    try
     {
      setLoading(true);
      setMessage("");

      const response

       = await
        fetch(
        `http://localhost:5000/api/data-plans?provider=${provider}&datatype=direct`,

      );


      const
       data
        =
         await
          response.json();

      console.log("Data plans response:", data);

      if
       (!response.ok)
        {
        setPlans([]);
        setMessage(data.messag
           ||
            "Unable to retrieve data plans.");
        return;
      }

      if
       (data.status === true)
        {
        setPlans(data.data);
      }

       else
         {
        setPlans([]);
        setMessage(data.message
           ||
            "Unable to retrieve data plans.");
      }

    }
     catch
      (error)
       {
      console.error("Data plans error:", error);

      setPlans([]);

      setMessage("Unable to connect to the server.");
    }
    
     finally
      {
      setLoading(false);

    }
  }

  async function purchaseData() {
    if
     (!selectedPlan)
      {

      setMessage("Please select a data plan.");
      return;

    }


    if
     (!phone)
      {
      setMessage("Please enter your phone number.");
      return;
    }

    try
     {
      setLoading(true);
      setMessage("");

      const
       response
        =
         await
          fetch("http://localhost:5000/api/data",
             {
        method:
         "POST",
        headers:
         {

          "Content-Type":
           "application/json",

        },

        body:
         JSON.stringify({

          phoneno: phone,
          network_id: network,
          datacode: selectedPlan.datacode,
          dtype: selectedPlan.dtype
           ||
           "direct",

        }),

      });

      const
       data
        =
         await response.json();


      console.log("Data purchase response:", data);

      if
       (!response.ok)
        {
        setMessage(data.message
           ||
            "Data purchase failed.");
        return;

      }

      if
       (data.status === true)
        {

        setMessage("Data purchase successful!");

      }
      
      else
         {
        setMessage(data.message
           || "Data purchase failed.");

      }
    }
    
    catch
     (error)
      {
      console.error("Data purchase error:", error);

      setMessage("Unable to connect to the server.");

    }
    
    finally
     {
      setLoading(false);
    }
  }


  return (
    <div
     className="card">

      <h2>
        Buy Data
      </h2>

      <div
       className="field">


        <label>
          Select Network Provider
        </label>


        <NetworkSelector
          selected={network}
          onSelect={(selectedNetwork) => {
            setNetwork(selectedNetwork);


            fetchDataPlans(
              selectedNetwork === "2"
                ? "MTN"
                : selectedNetwork === "3"
                  ? "AIRTEL"
                  : selectedNetwork === "1"
                    ? "GLO"
                    : "9MOBILE",


            );

          }}

        />

      </div>

      {loading && <p>Loading data plans...</p>}

      {message && <p>{message}</p>}


      {plans.length > 0 && (
        <div className="data-plans">
          <h3>Select a Data Plan</h3>

          {plans.map((plan) => (
            <div
              className={`data-plan ${
                selectedPlan?.datacode === plan.datacode ? "selected" : ""
              }`}
              key={plan.datacode}
              onClick={() => setSelectedPlan(plan)}
            >

              
              <h4>
                {plan.pname}
              </h4>


              <p>
                ₦{Number(plan.price).toLocaleString()}
              </p>


              <p>
                {plan.point}GB
              </p>

            </div>

            
          ))}


        </div>


      )}


      {selectedPlan && (
        <div className="selected-plan">
          <h3>
            Selected Plan
          </h3>


          <p>

            <strong>
              Plan:
            </strong>
             {selectedPlan.pname}

          </p>


          <p>

            <strong>
              Amount:
            </strong> ₦
            {Number(selectedPlan.price).toLocaleString()}

          </p>


          <p>

            <strong>
              Data:
            </strong>
             {selectedPlan.point}GB

          </p>

          <p>

            <strong>
              Type:
            </strong>
             {selectedPlan.dtype}

          </p>
        </div>
      )}


      {selectedPlan && (
        <div
         className="field">

          <label>
            Enter Phone Number
          </label>

          <input

            type="tel"
            placeholder="e.g., 07012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}

          />
        </div>
      )}


      {selectedPlan && phone &&
       (
        <button

          type="button"
          onClick={purchaseData}
          disabled={loading}

        >
          
          {loading ? "Processing..." : "Buy Data"}

        </button>


      )}


    </div>


  );

}