import { useEffect, useState } from "react";
import Payments from "./Payments";

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTransactions = localStorage.getItem(
        "oneapp_transactions"
      );

      return savedTransactions
        ? JSON.parse(savedTransactions)
        : [];
    } catch (error) {
      console.error("Unable to load transactions:", error);
      return [];
    }
  });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/balance");

        const data = await response.json();

        if (data.status) {
          setBalance(data.available_bal);
        }
      } catch (error) {
        console.error("Unable to load wallet balance:", error);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, []);

  /* =========================================================
     LISTEN FOR NEW TRANSACTIONS
  ========================================================= */

  useEffect(() => {
    const handleTransactionAdded = (event) => {
      const newTransaction = event.detail;

      if (!newTransaction) {
        return;
      }

      setTransactions((previousTransactions) => {
        const updatedTransactions = [
          newTransaction,
          ...previousTransactions,
        ];

        localStorage.setItem(
          "oneapp_transactions",
          JSON.stringify(updatedTransactions)
        );

        return updatedTransactions;
      });
    };

    window.addEventListener(
      "oneapp:transaction-added",
      handleTransactionAdded
    );

    return () => {
      window.removeEventListener(
        "oneapp:transaction-added",
        handleTransactionAdded
      );
    };
  }, []);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-logo">
          1app
        </div>

        <div className="dashboard-top-links">
          <button className="top-link active">
            Dashboard
          </button>

          <button className="top-link">
            Transactions
          </button>

          <button className="profile-button">
            <span>👤</span>
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">

            <button className="sidebar-item active">
              <span className="sidebar-icon">⌂</span>
              <span>Dashboard</span>
            </button>

            <button className="sidebar-item">
              <span className="sidebar-icon">▦</span>
              <span>Services</span>
            </button>

            <button className="sidebar-item">
              <span className="sidebar-icon">₦</span>
              <span>Wallet</span>
            </button>

            <button className="sidebar-item">
              <span className="sidebar-icon">↕</span>
              <span>Transactions</span>
            </button>

            <button className="sidebar-item">
              <span className="sidebar-icon">◉</span>
              <span>Account</span>
            </button>

          </nav>
        </aside>

        <main className="dashboard-main">

          <div className="dashboard-welcome">
            <span className="dashboard-eyebrow">
              DASHBOARD
            </span>

            <h1>
              Good morning Tomi
            </h1>

            <p>
              What would you like to do today?
            </p>
          </div>

          <section className="wallet-card">
            <div>
              <span className="wallet-label">
                Wallet Balance
              </span>

              <strong>
                {balanceLoading
                  ? "Loading..."
                  : balance !== null
                  ? `₦${Number(balance).toLocaleString(
                      "en-NG",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  : "₦0.00"}
              </strong>
            </div>

            <button className="fund-wallet-button">
              + Fund Wallet
            </button>
          </section>

          <section className="dashboard-services">

            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  SERVICES
                </span>

                <h2>
                  What would you like to pay for?
                </h2>
              </div>
            </div>

            <Payments />

          </section>

          {/* =====================================================
              RECENT TRANSACTIONS
          ===================================================== */}

          <section className="recent-transactions">

            <div className="recent-header">
              <div>
                <span className="dashboard-eyebrow">
                  ACTIVITY
                </span>

                <h2>
                  Recent Transactions
                </h2>
              </div>

              <button className="view-all-button">
                View all →
              </button>
            </div>

            {transactions.length === 0 ? (

              <div className="empty-transactions">

                <div className="empty-transactions-icon">
                  ↕
                </div>

                <h3>
                  No transactions yet
                </h3>

                <p>
                  Your recent transactions will appear here.
                </p>

              </div>

            ) : (

              <div className="transaction-list">

                {transactions.slice(0, 10).map(
                  (item, index) => (

                    <div
                      className="transaction-item"
                      key={
                        item.reference ||
                        item.txref ||
                        `${item.phone}-${item.amount}-${index}`
                      }
                    >

                      <div className="transaction-item-left">

                        <div className="transaction-item-icon">
                          📱
                        </div>

                        <div className="transaction-item-info">

                          <h4>
                            {item.type || "Airtime"}
                          </h4>

                          <p>
                            {item.networkName || item.network || "Network"}{" "}
                            •{" "}
                            {item.phone}
                          </p>

                        </div>

                      </div>

                      <div className="transaction-item-right">

                        <p className="transaction-item-amount">
                          ₦
                          {Number(
                            item.amount || 0
                          ).toLocaleString(
                            "en-NG",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>

                        <p className="transaction-item-status">
                          Successful
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </main>
      </div>
    </div>
  );
}