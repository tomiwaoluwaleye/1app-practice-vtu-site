import { useState } from "react";

const ELECTRICITY_PROVIDERS = [
  { value: "ABUJA", name: "Abuja Electricity" },
  { value: "IBADAN", name: "Ibadan Electricity" },
  { value: "IKEJA", name: "Ikeja Electricity" },
  { value: "EKO", name: "Eko Electricity" },
  { value: "PH", name: "Port Harcourt Electricity" },
  { value: "ENUGU", name: "Enugu Electricity" },
  { value: "KADUNA", name: "Kaduna Electricity" },
  { value: "JOS", name: "Jos Electricity" },
  { value: "KANO", name: "Kano Electricity" },
];

export default function ElectricityForm() {

  const [provider, setProvider] = useState("");
  const [meterNumber, setMeterNumber] = useState("");

  const [meterInfo, setMeterInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


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

        `http://localhost:5000/api/verify-electricity?provider=${provider}&meterno=${meterNumber.trim()}`

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

        <div className="field">

          <label htmlFor="electricity-provider">

            Electricity Provider

          </label>


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


            {ELECTRICITY_PROVIDERS.map((disco) => (

              <option

                key={disco.value}

                value={disco.value}

              >

                {disco.name}

              </option>

            ))}

          </select>

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

      </div>

    </div>

  );

}