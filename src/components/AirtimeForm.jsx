import { useState } from "react";
import NetworkSelector from "./NetworkSelector";
import { createPortal } from "react-dom";
import { apiUrl } from "../api";

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
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [submittedReference, setSubmittedReference] = useState("");

  function validatePhone(value) {
    if (!value) {
      return "Please enter a phone number.";
    }

    if (!/^\d{11}$/.test(value)) {
      return "Enter a valid 11-digit phone number.";
    }

    return "";
  }

  function handlePhoneChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);

    setPhone(digitsOnly);

    if (phoneTouched) {
      setPhoneError(validatePhone(digitsOnly));
    }
  }

  function handlePhoneBlur() {
    setPhoneTouched(true);
    setPhoneError(validatePhone(phone));
  }

  function closeTransactionModal() {
    setTransaction(null);
    setTransactionType(null);
    setShowReceipt(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");

    const currentPhoneError = validatePhone(phone);
    setPhoneTouched(true);
    setPhoneError(currentPhoneError);

    if (currentPhoneError) {
      return;
    }

    if (!network) {
      setMessage("Please select a network.");
      return;
    }

    if (!amount) {
      setMessage("Please enter an amount.");
      return;
    }

    try {
      setLoading(true);

      const reference = `REF-${Date.now()}`;
      setSubmittedReference(reference);

      const response = await fetch(apiUrl("/api/airtime"), {
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
        setTransaction(data);
        setTransactionType("failure");
        setShowReceipt(true);
        return;
      }

      if (data.status === true) {
        setTransaction(data);
        setTransactionType("success");
        setShowReceipt(false);
      } else {
        setTransaction(data);
        setTransactionType("failure");
        setShowReceipt(true);
      }
    } catch (error) {
      console.error("Request error:", error);

      setTransaction({
        status: false,
        message: "Unable to connect to the server.",
      });
      setTransactionType("failure");
      setShowReceipt(true);
    } finally {
      setLoading(false);
    }
  }

  const transactionReference =
    transaction?.data?.reference ||
    transaction?.data?.txref ||
    transaction?.reference ||
    transaction?.txref ||
    submittedReference;

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
          inputMode="numeric"
          maxLength={11}
          placeholder="e.g. 09134807909"
          value={phone}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          aria-invalid={Boolean(phoneError)}
        />

        {phoneError && <p className="phone-error">{phoneError}</p>}
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
              <div className="success-dot">✓</div>

              <h3>Airtime payment successful</h3>

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

          document.body,
        )}

      {/* TRANSACTION RESULT MODAL */}
      {transaction &&
        showReceipt &&
        createPortal(
          <>
            <div className="transaction-modal-backdrop"></div>

            <div
              className="transaction-result transaction-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className={`transaction-modal-icon ${transactionType}`}>
                {transactionType === "success" ? "✓" : "!"}
              </div>

              <h3>
                {transactionType === "success"
                  ? "Airtime Purchase Successful"
                  : "Airtime Purchase Failed"}
              </h3>

              <p className="transaction-status-message">
                {transaction.message ||
                  (transactionType === "success"
                    ? "Your airtime purchase was successful."
                    : "Airtime purchase failed. Please try again.")}
              </p>

              <div className="transaction-details">
                <p>
                  <strong>Status:</strong>
                  {transactionType === "success" ? "Successful" : "Failed"}
                </p>

                <p>
                  <strong>Network:</strong>
                  {network}
                </p>

                <p>
                  <strong>Phone:</strong>
                  {phone}
                </p>

                <p>
                  <strong>Amount:</strong>₦
                  {Number(transaction.amount || amount).toLocaleString()}
                </p>

                {(transaction.fee !== undefined ||
                  transaction.fees !== undefined) && (
                  <p>
                    <strong>Fee:</strong>₦
                    {Number(
                      transaction.fee ?? transaction.fees,
                    ).toLocaleString()}
                  </p>
                )}

                {transactionReference && (
                  <p>
                    <strong>Reference:</strong>
                    {transactionReference}
                  </p>
                )}

                {transaction.charged !== undefined && (
                  <p>
                    <strong>Amount Charged:</strong>₦
                    {Number(transaction.charged).toLocaleString()}
                  </p>
                )}

                {transaction.newbal !== undefined && (
                  <p>
                    <strong>Remaining Balance:</strong>₦
                    {Number(transaction.newbal).toLocaleString()}
                  </p>
                )}

                {(transaction.date || transaction.transdate) && (
                  <p>
                    <strong>Date:</strong>
                    {transaction.date || transaction.transdate}
                  </p>
                )}

                {transaction.time && (
                  <p>
                    <strong>Time:</strong>
                    {transaction.time}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="transaction-done-button"
                onClick={closeTransactionModal}
              >
                DONE
              </button>
            </div>
          </>,
          document.body,
        )}
    </form>
  );
}
