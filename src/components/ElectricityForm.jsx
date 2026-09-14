import { useEffect, useState } from "react";


export default function ElectricityForm() {

  const [electricityProviders, setElectricityProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  const [provider, setProvider] = useState("");
  const [meterNumber, setMeterNumber] = useState("");

  const [meterInfo, setMeterInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  
  const [amount, setAmount] = useState(""); 

  const [purchasing, setPurchasing] = useState(false);

  const [purchaseResult, setPurchaseResult] = useState(null);

  const [purchaseDate, setPurchaseDate] = useState(null);

  const [message, setMessage] = useState("");


  useEffect(() => {
  async function fetchElectricityProviders() {
    try {
      setProvidersLoading(true);
      setMessage("");

      const response = await fetch(
        "http://oneapp-practice-vtu-backend.onrender.com/api/electricity-billers"
      );

      const data = await response.json();

      console.log("Electricity billers response:", data);

      if (!response.ok || data.status !== true) {
        setMessage(
          data.message || "Unable to load electricity providers."
        );
        return;
      }

      setElectricityProviders(data.lists || []);
    } catch (error) {
      console.error("Electricity billers error:", error);
      setMessage("Unable to load electricity providers.");
    } finally {
      setProvidersLoading(false);
    }
  }

  fetchElectricityProviders(); 
}, []);



  async function verifyMeter() {

    if (!provider) {

      setMessage("Please select your electricity provider.");
      return;

    }


    if (!meterNumber.trim()) {

      setMessage("Please enter your meter number.");
      return;

    }


    try {

      setLoading(true);
      setMessage("");
      setMeterInfo(null);


      const response = await fetch(

        `http://oneapp-practice-vtu-backend.onrender.com/api/verify-electricity?provider=${provider}&meterno=${meterNumber.trim()}`

      );


      const data = await response.json();


      console.log("Meter verification response:", data);


      if (!response.ok) {

        setMessage(

          data.message ||
          "Unable to verify meter."

        );

        return;

      }


      if (data.status === true) {

        setMeterInfo(data);

        setMessage("Meter verified successfully.");

      }

      else {

        setMessage(

          data.message ||
          "Meter verification failed."

        );

      }

    }


    catch (error) {

      console.error(
        "Meter verification error:",
        error
      );


      setMessage(
        "Unable to connect to the server."
      );

    }


    finally {

      setLoading(false);

    }

  }


  async function buyElectricity() {
  if (!meterInfo) {
    setMessage("Please verify your meter first.");
    return;
  }

  if (!amount.trim()) {
    setMessage("Please enter an amount.");
    return;
  }

  const numericAmount = Number(amount);

  if (numericAmount < Number(meterInfo.minvend)) {
    setMessage(
      `Minimum amount is ₦${Number(meterInfo.minvend).toLocaleString()}.`
    );
    return;
  }

  if (numericAmount > Number(meterInfo.maxvend)) {
    setMessage(
      `Maximum amount is ₦${Number(meterInfo.maxvend).toLocaleString()}.`
    );
    return;
  }

  try {
    setPurchasing(true);
    setMessage("");
    setPurchaseResult(null);

    const response = await fetch("http://oneapp-practice-vtu-backend.onrender.com/api/electricity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meterno: meterNumber.trim(),
        metername: meterInfo.name,
        provider: provider,
        amount: amount,
        vendtype: meterInfo.vendtype,
      }),
    });

    const data = await response.json();

    console.log("Electricity purchase response:", data);

    if (!response.ok) {
      setMessage(data.message || "Electricity payment failed.");
      return;
    }

    if (data.status === true) {
      setPurchaseResult(data);
      setPurchaseDate(new Date());
      setMessage("Electricity payment successful.");
    } else {
      setMessage(data.message || "Electricity payment failed.");
    }
  } catch (error) {
    console.error("Electricity purchase error:", error);
    setMessage("Unable to connect to the server.");
  } finally {
    setPurchasing(false);
  }
}


  return (

    <div className="card electricity-card">


      {/* HEADER */}

      <div className="electricity-header">

        <div>

          <h2>
            Buy Electricity
          </h2>

          <p>
            Verify your meter before making a payment.
          </p>

        </div>

      </div>


      <div className="electricity-form">


        {/* PROVIDER */}

        <div className="field electricity-provider-field">
          <label htmlFor="electricity-provider">
            Electricity Provider
          </label>

          <div className="electricity-select-wrapper">
            <select
              id="electricity-provider"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setMeterInfo(null);
                setMessage("");
              }}
            >
              <option value="">
                Select your electricity provider
              </option>

              {providersLoading ? (
  <option value="">Loading electricity providers...</option>
  ) : (
    electricityProviders.map((disco) => (
    <option key={disco.value} value={disco.value}>
      {disco.disconame}
    </option>
    ))
  )}
            </select>

            <span className="electricity-select-arrow">
              ↓
            </span>
          </div>
        </div>


        {/* METER NUMBER */}

        <div className="field">

          <label htmlFor="meter-number">

            Meter Number

          </label>


          <input

            id="meter-number"

            type="text"

            inputMode="numeric"

            placeholder="Enter your meter number"

            value={meterNumber}

            onChange={(e) => {

              setMeterNumber(e.target.value);

              setMeterInfo(null);

              setMessage("");

            }}

          />


          <small>

            Enter the meter number exactly as shown on your meter.

          </small>

        </div>


        {/* MESSAGE */}

        {message && (

          <div className="form-message">

            {message}

          </div>

        )}


        {/* VERIFY BUTTON */}

        <button

          type="button"

          onClick={verifyMeter}

          disabled={loading}

          className="electricity-action"

        >

          {loading
            ? "Verifying..."
            : "Verify Meter"}

        </button>


        {/* VERIFIED METER */}

        {meterInfo && (

          <div className="meter-verification">


            <h3>
              ✓ Meter Verified
            </h3>


            <div className="meter-details">


              <p>

                <strong>
                  Name:
                </strong>{" "}

                {meterInfo.name}

              </p>


              <p>

                <strong>
                  Address:
                </strong>{" "}

                {meterInfo.address}

              </p>


              <p>

                <strong>
                  Meter Type:
                </strong>{" "}

                {meterInfo.vendtype}

              </p>


              <p>

                <strong>
                  Minimum Amount:
                </strong>{" "}

                ₦
                {Number(
                  meterInfo.minvend
                ).toLocaleString()}

              </p>


              <p>

                <strong>
                  Maximum Amount:
                </strong>{" "}

                ₦
                {Number(
                  meterInfo.maxvend
                ).toLocaleString()}

              </p>


            </div>


          </div>

        )}


              {meterInfo && (
          <div className="field">
            <label htmlFor="electricity-amount">Amount</label>

            <input
              id="electricity-amount"
              type="number"
              placeholder={`Minimum ₦${Number(meterInfo.minvend).toLocaleString()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <small>
              Enter between ₦{Number(meterInfo.minvend).toLocaleString()}
              {" "}and ₦{Number(meterInfo.maxvend).toLocaleString()}.
            </small>
          </div>
        )}

                    {meterInfo && (
          <button
            type="button"
            onClick={buyElectricity}
            disabled={purchasing}
            className="electricity-action"
          >
            {purchasing
              ? "Processing Payment..."
              : "Buy Electricity"}
          </button>
        )}

                {purchaseResult && (
          <div className="purchase-result">
            <h3>✓ Payment Successful</h3>

            <p>
              <strong>Receiptant:</strong> {meterInfo.name}
            </p>

            <p>
              <strong>Amount:</strong> ₦
              {Number(purchaseResult.charged).toLocaleString()}
            </p>

            <p>
              <strong>Transaction Reference:</strong>{" "}
              {purchaseResult.txref}
            </p>

            {purchaseResult.token && (
              <p>
                <strong>Electricity Token:</strong>{" "}
                {purchaseResult.token}
              </p>
            )}

            {purchaseDate && (
              <>
                <p>
                  <strong>Date:</strong>{" "}
                  {purchaseDate.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {purchaseDate.toLocaleTimeString("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </>
            )}
          </div>
        )}




    </div>
  </div>

  );
  

}
