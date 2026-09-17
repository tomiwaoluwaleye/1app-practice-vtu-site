import { useState } from "react";
import { createPortal } from "react-dom";
import { apiUrl } from "../api";

const ELECTRICITY_PROVIDERS = [
  { value: "IKEJA", name: "Ikeja Electric" },
  { value: "EKO", name: "Eko Electric" },
  { value: "ABUJA", name: "Abuja Electricity" },
  { value: "IBADAN", name: "Ibadan Electricity" },
  { value: "KANO", name: "Kano Electricity" },
  { value: "PH", name: "Port Harcourt Electricity" },
  { value: "ENUGU", name: "Enugu Electricity" },
  { value: "KADUNA", name: "Kaduna Electricity" },
  { value: "JOS", name: "Jos Electricity" },
];

export default function ElectricityForm() {
  const [provider, setProvider] = useState("");
  const [meterNumber, setMeterNumber] = useState("");

  const [meterInfo, setMeterInfo] = useState(null);
  const [meterError, setMeterError] = useState("");

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const [purchasing, setPurchasing] = useState(false);

  const [purchaseResult, setPurchaseResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [purchaseDate, setPurchaseDate] = useState(null);

  const [message, setMessage] = useState("");

  function closeElectricityModal() {
    setPurchaseResult(null);
    setPurchaseDate(null);
    setShowReceipt(false);
  }

  async function verifyMeterNumber(number, selectedProvider) {
    if (!selectedProvider || !number || number.length !== 11) {
      setMeterInfo(null);
      setMeterError(number ? "Invalid meter number" : "");
      return;
    }

    try {
      setMeterError("");
      setMessage("");
      setPurchaseResult(null);

      const response = await fetch(
        `${apiUrl("/api/verify-electricity")}?provider=${encodeURIComponent(selectedProvider)}&meterno=${encodeURIComponent(number)}`,
      );

      const data = await response.json();

      if (!response.ok || data.status === false) {
        setMeterInfo(null);
        setMeterError(
          data.message ||
            data.error?.message ||
            "Meter number could not be verified for this provider.",
        );
        return;
      }

      const verifiedMeter = {
        name: data.name,
        address: data.address,
        vendtype: data.vendtype,
        minvend: data.minvend,
        maxvend: data.maxvend,
      };

      setMeterInfo(verifiedMeter);
      setMeterError("");
      setAmount("");
      setAmountError("");
    } catch (error) {
      console.error("Electricity verification error:", error);
      setMeterInfo(null);
      setMeterError("Unable to verify meter number. Please try again.");
    }
  }

  function handleProviderChange(event) {
    const selectedProvider = event.target.value;
    setProvider(selectedProvider);
    setMeterInfo(null);
    setMessage("");

    if (meterNumber.length === 11 && selectedProvider) {
      verifyMeterNumber(meterNumber, selectedProvider);
    } else {
      setMeterError("");
    }
  }

  function handleMeterChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 11);
    setMeterNumber(digitsOnly);
    setMeterInfo(null);
    setMessage("");

    if (!digitsOnly) {
      setMeterError("");
    } else if (digitsOnly.length < 11) {
      setMeterError("Invalid meter number");
    } else if (!provider) {
      setMeterError("Please select your electricity provider.");
    } else {
      verifyMeterNumber(digitsOnly, provider);
    }
  }

  function handleAmountChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setAmount(digitsOnly);
    setAmountError("");
  }

  async function buyElectricity() {
    if (!meterInfo) {
      setMessage("Please verify your meter first.");
      return;
    }

    if (!amount.trim()) {
      setAmountError("Please enter an amount.");
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount < Number(meterInfo.minvend)) {
      setAmountError(
        `Minimum amount is ₦${Number(meterInfo.minvend).toLocaleString()}.`,
      );
      return;
    }

    if (numericAmount > Number(meterInfo.maxvend)) {
      setAmountError(
        `Maximum amount is ₦${Number(meterInfo.maxvend).toLocaleString()}.`,
      );
      return;
    }

    try {
      setPurchasing(true);
      setMessage("");
      setPurchaseResult(null);
      setPurchaseDate(null);
      setShowReceipt(false);

      const response = await fetch(apiUrl("/api/electricity"), {
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
        setMessage("");
        setShowReceipt(false);
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
          <h2>Buy Electricity</h2>

          <p>Verify your meter before making a payment.</p>
        </div>
      </div>

      <div className="electricity-form">
        {/* PROVIDER */}

        <div className="field electricity-provider-field">
          <label htmlFor="electricity-provider">Electricity Provider</label>

          <div className="electricity-select-wrapper">
            <span className="electricity-select-icon" aria-hidden="true">
              &#9889;
            </span>

            <select
              id="electricity-provider"
              value={provider}
              onChange={handleProviderChange}
            >
              <option value="">Select your electricity provider</option>

              {ELECTRICITY_PROVIDERS.map((disco) => (
                <option key={disco.value} value={disco.value}>
                  {disco.name}
                </option>
              ))}
            </select>

            <span className="electricity-select-arrow">↓</span>
          </div>
        </div>

        {/* METER NUMBER */}

        <div className="field">
          <label htmlFor="meter-number">Meter Number</label>

          <input
            id="meter-number"
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder="Enter your meter number"
            value={meterNumber}
            onChange={handleMeterChange}
          />

          <small>Enter the meter number exactly as shown on your meter.</small>
          {meterError && <div className="form-message">{meterError}</div>}
        </div>

        {/* MESSAGE */}

        {message && <div className="form-message">{message}</div>}

        {/* VERIFIED METER */}

        {meterInfo && (
          <div className="meter-verification">
            <h3>✓ Meter Verified</h3>

            <div className="meter-details">
              <p>
                <strong>Name:</strong> {meterInfo.name}
              </p>

              <p>
                <strong>Address:</strong> {meterInfo.address}
              </p>

              <p>
                <strong>Meter Type:</strong> {meterInfo.vendtype}
              </p>

              <p>
                <strong>Minimum Amount:</strong> ₦
                {Number(meterInfo.minvend).toLocaleString()}
              </p>

              <p>
                <strong>Maximum Amount:</strong> ₦
                {Number(meterInfo.maxvend).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {meterInfo && (
          <div className="field">
            <label htmlFor="electricity-amount">Amount</label>

            <input
              id="electricity-amount"
              type="text"
              inputMode="numeric"
              placeholder={`Minimum ₦${Number(meterInfo.minvend).toLocaleString()}`}
              value={amount}
              onChange={handleAmountChange}
            />

            <small>
              Enter between ₦{Number(meterInfo.minvend).toLocaleString()} and ₦
              {Number(meterInfo.maxvend).toLocaleString()}.
            </small>
            {amountError && <div className="form-message">{amountError}</div>}
          </div>
        )}

        {meterInfo && (
          <button
            type="button"
            onClick={buyElectricity}
            disabled={purchasing}
            className="electricity-action"
          >
            {purchasing ? "Processing Payment..." : "Buy Electricity"}
          </button>
        )}

        {purchaseResult &&
          !showReceipt &&
          createPortal(
            <>
              <div className="success-backdrop"></div>

              <div className="transaction-success electricity-success-modal">
                <div className="success-dot">✓</div>

                <h3>Electricity payment successful</h3>

                <p>
                  Your electricity payment was successful and your token is
                  ready.
                </p>

                <button
                  type="button"
                  className="view-receipt-btn"
                  onClick={() => setShowReceipt(true)}
                >
                  VIEW RECEIPT
                </button>
              </div>
            </>,
            document.body,
          )}

        {purchaseResult &&
          showReceipt &&
          createPortal(
            <>
              <div className="transaction-modal-backdrop"></div>

              <div
                className="transaction-result transaction-modal electricity-receipt-modal"
                role="dialog"
                aria-modal="true"
              >
                <div className="transaction-modal-icon">✓</div>

                <h3>Electricity payment receipt</h3>

                <p className="transaction-status-message">
                  Your electricity payment was successful.
                </p>

                <div className="transaction-details">
                  <p>
                    <strong>Receiptant:</strong>
                    {meterInfo.name}
                  </p>

                  <p>
                    <strong>Amount:</strong>₦
                    {Number(purchaseResult.charged).toLocaleString()}
                  </p>

                  <p>
                    <strong>Transaction Reference:</strong>
                    {purchaseResult.txref}
                  </p>

                  {purchaseResult.token && (
                    <p>
                      <strong>Electricity Token:</strong>
                      {purchaseResult.token}
                    </p>
                  )}

                  {purchaseDate && (
                    <>
                      <p>
                        <strong>Date:</strong>
                        {purchaseDate.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <p>
                        <strong>Time:</strong>
                        {purchaseDate.toLocaleTimeString("en-NG", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="transaction-done-button"
                  onClick={closeElectricityModal}
                >
                  DONE
                </button>
              </div>
            </>,
            document.body,
          )}
      </div>
    </div>
  );
}
