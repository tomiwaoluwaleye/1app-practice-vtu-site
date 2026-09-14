import { useState } from "react";
import NetworkSelector from "./NetworkSelector";
import { createPortal } from "react-dom";

const QUICK_TOP_UP = [
  { amount: 100, cashback: 1 },
  { amount: 500, cashback: 5 },
  { amount: 1000, cashback: 10 },
  { amount: 2000, cashback: 20 },
  { amount: 3000, cashback: 30 },
  { amount: 5000, cashback: 50 },
];

export default function AirtimeForm() {
  const [network, setNetwork] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setTransaction(null);

    // Validation
    if (!network) {
      setMessage("Please select a network.");
      return;
    }

    if (!phone) {
      setMessage("Please enter a phone number.");
      return;
    }

    if (!amount) {
      setMessage("Please enter an amount.");
      return;
    }

    try {
      setLoading(true);

      const reference = `REF-${Date.now()}`;

      const response = await fetch("http://oneapp-practice-vtu-backend.onrender.com/api/airtime", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phoneno: phone,
          network_id: network,
          amount: amount,
          reference: reference,
        }),
      });

      const data = await response.json();

      console.log("Server response:", data);

      if (!response.ok) {
        setMessage(
          data.message || "Airtime purchase failed. Please try again.",
        );

        return;
      }

      if (data.status === true) {
        setTransaction(data);
        setShowReceipt(false);

        setMessage(data.message || "Airtime purchase successful!");
      } else {
        setTransaction(null);

        setMessage(
          data.message || "Airtime purchase failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Request error:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="airtime-form" onSubmit={handleSubmit}>
      {/* NETWORK */}
      <div className="field">
        <label>Select Network Provider</label>

        <NetworkSelector selected={network} onSelect={setNetwork} />
      </div>

      {/* PHONE */}
      <div className="field">
        <label>Enter Phone Number</label>

        <input
          type="tel"
          placeholder="e.g. 09134807909"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* QUICK TOP UP */}
      <div className="quick-topup">
        <h3>Quick Top Up</h3>

        <div className="quick-topup-grid">
          {QUICK_TOP_UP.map((topup) => (
            <button
              key={topup.amount}
              type="button"
              className={`quick-topup-btn ${
                Number(amount) === topup.amount ? "selected" : ""
              }`}
              onClick={() => setAmount(topup.amount)}
            >
              <strong>
                ₦{topup.amount.toLocaleString()}
                .00
              </strong>

              <span>
                ₦{topup.cashback.toLocaleString()}
                .00 cashback
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AMOUNT */}
      <div className="field">
        <label>Enter Amount</label>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* PROCEED */}
      <button type="submit" className="buy-btn" disabled={loading}>
        {loading ? "PROCESSING..." : "PROCEED"}
      </button>

      {message && <p className="form-message">{message}</p>}


      {/* SUCCESS NOTIFICATION */}
      {transaction &&
      !showReceipt &&
      createPortal(
    <>
      <div className="success-backdrop"></div>

      <div className="transaction-success">
        <div className="success-dot">
          ✓
        </div>

        <h3>
          Airtime purchased
        </h3>

        <p>
          ₦{Number(amount).toLocaleString()}.00 airtime is on its way to
          <br />
          {phone}
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
    
    document.body

  )}

      {/* TRANSACTION RESULT */}
      {transaction && showReceipt && (
        <div className="transaction-result">
          <h3>Airtime Purchase Successful</h3>

          <p>
            <strong>Network:</strong> {network}
          </p>

          <p>
            <strong>Phone:</strong> {phone}
          </p>

          <p>
            <strong>Amount:</strong> ₦{Number(amount).toLocaleString()}
          </p>

          <p>
            <strong>Transaction Reference:</strong>{" "}
            {transaction.txref || transaction.reference || "N/A"}
          </p>

          <p>
            <strong>Amount Charged:</strong> ₦
            {Number(transaction.charged || 0).toLocaleString()}
          </p>

          <p>
            <strong>Remaining Balance:</strong> ₦
            {Number(transaction.newbal || 0).toLocaleString()}
          </p>
        </div>
      )}
    </form>
  );
}
