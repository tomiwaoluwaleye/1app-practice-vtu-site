import { useState } from "react";
import { apiUrl } from "../api";

const CABLE_PROVIDERS = [
  { value: "DSTV", name: "DStv" },
  { value: "GOTV", name: "GOtv" },
  { value: "STARTIMES", name: "Startimes" },
];

export default function CableTVForm() {
  const [provider, setProvider] = useState("");
  const [iuc, setIuc] = useState("");

  const [customerInfo, setCustomerInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function verifyIUC() {
    if (!provider) {
      setMessage("Please select your cable TV provider.");
      return;
    }

    if (!iuc.trim()) {
      setMessage("Please enter your IUC number.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setCustomerInfo(null);

      const response = await fetch(
        apiUrl(
          `/api/verify-cable?type=${provider}&iuc=${encodeURIComponent(iuc.trim())}`,
        ),
      );

      const data = await response.json();

      console.log("Cable verification response:", data);

      if (!response.ok) {
        setMessage(data.message || "Unable to verify IUC.");
        return;
      }

      if (data.status === true) {
        setCustomerInfo(data);
        setMessage("IUC verified successfully.");
      } else {
        setMessage(data.message || "IUC verification failed.");
      }
    } catch (error) {
      console.error("Cable verification error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card cable-card">
      {/* HEADER */}
      <div className="cable-header">
        <div>
          <h2>Buy Cable TV</h2>

          <p>Verify your decoder before making a payment.</p>
        </div>
      </div>

      <div className="cable-form">
        {/* CABLE PROVIDER */}
        <div className="field">
          <label htmlFor="cable-provider">Cable TV Provider</label>

          <select
            id="cable-provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setCustomerInfo(null);
              setMessage("");
            }}
          >
            <option value="">Select your cable TV provider</option>

            {CABLE_PROVIDERS.map((cable) => (
              <option key={cable.value} value={cable.value}>
                {cable.name}
              </option>
            ))}
          </select>
        </div>

        {/* IUC NUMBER */}
        <div className="field">
          <label htmlFor="iuc-number">IUC Number</label>

          <input
            id="iuc-number"
            type="text"
            inputMode="numeric"
            placeholder="Enter your IUC number"
            value={iuc}
            onChange={(e) => {
              setIuc(e.target.value);
              setCustomerInfo(null);
              setMessage("");
            }}
          />

          <small>Enter the decoder IUC number exactly as shown.</small>
        </div>

        {/* MESSAGE */}
        {message && <div className="form-message">{message}</div>}

        {/* VERIFY BUTTON */}
        <button
          type="button"
          onClick={verifyIUC}
          disabled={loading}
          className="cable-action"
        >
          {loading ? "Verifying..." : "Verify IUC"}
        </button>

        {/* VERIFIED CUSTOMER */}
        {customerInfo && (
          <div className="cable-verification">
            <h3>✓ IUC Verified</h3>

            <div className="cable-details">
              <p>
                <strong>Customer Name:</strong> {customerInfo.details?.custname}
              </p>

              <p>
                <strong>IUC Number:</strong> {customerInfo.iuc}
              </p>

              <p>
                <strong>Status:</strong> {customerInfo.details?.status}
              </p>

              <p>
                <strong>Customer Number:</strong> {customerInfo.details?.custno}
              </p>

              <p>
                <strong>Due Date:</strong> {customerInfo.details?.dueDate}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
