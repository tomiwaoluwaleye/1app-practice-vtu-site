import { useState } from "react";

import AirtimeForm from "../components/AirtimeForm";
import Data from "../components/Data";
import ElectricityForm from "../components/ElectricityForm";

const PAYMENT_SERVICES = [
  {
    id: "airtime",
    icon: "📱",
    title: "Airtime",
    description: "Recharge any Nigerian network instantly.",
  },
  {
    id: "data",
    icon: "📶",
    title: "Data",
    description: "Buy affordable data bundles for your device.",
  },
  {
    id: "electricity",
    icon: "⚡",
    title: "Electricity",
    description: "Pay your electricity bill securely and easily.",
  },
];

export default function Payments() {
  const [paymentType, setPaymentType] = useState(null);

  const selectedService = PAYMENT_SERVICES.find(
    (service) => service.id === paymentType
  );

  return (
    <div className="payments-page">

      {/* PAGE HEADER */}

      <div className="payments-header">

        <span className="section-label">
          PAYMENTS
        </span>

        <h1>
          What would you like
          <br />
          to pay for?
        </h1>

        <p>
          Choose a service below to get started.
        </p>

      </div>


      {/* PAYMENT CARDS */}

      <div className="payment-options">

        {PAYMENT_SERVICES.map((service) => (

          <button
            key={service.id}
            type="button"
            className={`payment-card ${
              paymentType === service.id ? "selected" : ""
            }`}
            onClick={() => setPaymentType(service.id)}
          >

            <div className="payment-card-top">

              <div className="payment-icon">
                {service.icon}
              </div>

              <span className="payment-arrow">
                →
              </span>

            </div>


            <div className="payment-card-content">

              <h3>
                {service.title}
              </h3>

              <p>
                {service.description}
              </p>

            </div>

          </button>

        ))}

      </div>


      {/* SECURITY MESSAGE */}

      <div className="payment-security">

        <span>
          🔒
        </span>

        <p>
          Your transactions are processed securely.
        </p>

      </div>


      {/* BACKDROP */}

      {paymentType && (

        <div
          className="service-backdrop"
          onClick={() => setPaymentType(null)}
        />

      )}


      {/* SERVICE PANEL */}

      {paymentType && (

        <aside className="service-panel">

          <div className="service-panel-header">

            <button
              type="button"
              className="back-button"
              onClick={() => setPaymentType(null)}
            >
              ← Back
            </button>

            <span>
              {selectedService?.title}
            </span>

          </div>


          <div className="service-panel-content">

            {paymentType === "airtime" && (
              <AirtimeForm />
            )}

            {paymentType === "data" && (
              <Data />
            )}

            {paymentType === "electricity" && (
              <ElectricityForm />
            )}

          </div>

        </aside>

      )}

    </div>
  );
}