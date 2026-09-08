import { useState } 
from "react";

import NetworkSelector 
from "./NetworkSelector";

const Quick_Top_Up = 
["100", "500", "1000", "2000", "3000", "5000"];

export default function

AirtimeForm() 
{
  const 
  [network, setNetwork] 
  = useState(null);

  const [phone, setPhone] 
  = useState("");

  const [amount, setAmount] 
  = useState("");

  const [loading, setLoading] 
  = useState(false);

  const [message, setMessage] 
  = useState("");

  const [transaction, setTransaction] 
  = useState(null);

  async function 
  handleSubmit(e)

  {

    e.preventDefault();

    setMessage("");
    setTransaction(null);

    // validation
    if (!network)

      {

      setMessage
      ("Please select a network.");
      return;
    }

    if (!phone) 
      
      {

      setMessage

      ("Please enter a phone number.");

      return;
    }

    if (!amount) 
      
      {

      setMessage

      ("Please enter an amount.");

      return;
    }

    try 
    {
      setLoading(true);
      const reference = 
      `REF-${Date.now()}`;

      const 
      response = 
      await 
      fetch("http://localhost:5000/api/airtime", {
        method: 
        "POST",
        headers: 
        {

          "Content-Type": 
          "application/json",

        },

        body: 
        JSON.stringify
        ({

          phoneno: phone,
          network_id: network,
          amount: amount,
          reference: reference,

        }),

      });

      const data = 
      await response.json();

      console.log
      ("Server response:", data);

      if (!response.ok) 
        
        {

        setTransaction(null);

        setMessage(
          data.message || "Airtime purchase failed. Please try again.",
        );

        return;

      }


      if 
      (data.status === true) 
      {

        setTransaction(data);
        setMessage
        ("Airtime purchase successful!");

      } 


      else

        {

        setTransaction(null);
        setMessage(
          data.message || "Airtime purchase failed. Please try again.",
        );

      }

      setTransaction(data);


      setMessage
      (data.message || "Request successful.");


    }

    catch (error)

    {

      console.error
      ("Request error:", error);

      setMessage
      ("Unable to connect to the server.");

    }

    finally 
    
    {

      setLoading
      (false);

    }
  }

  return (

    <form className=
    "card" 
    onSubmit=
    {handleSubmit}>

      <div 
      className="field">

        <label>
          Select Network Provider
          </label>

        <NetworkSelector 
        selected={network} 
        onSelect={setNetwork} 
        />

      </div>

      <div className=
      "field">


        <label>
          Enter Phone Number
          </label>

        <input

          type="tel"
          placeholder=
          "e.g. 09134807909"
          value={phone}
          onChange=


          {

            (e) => 
              setPhone
            (e.target.value)
          }
        />

      </div>

      <div className=
      "field">

        <label>
          Enter Amount
          </label>

        <div className=
        "amount-grid">

          {Quick_Top_Up.map((amt) => 
          
          (

            <button

              type="button"
              key={amt}
              className={`amount-btn ${amount === amt ? "selected" : ""}`}
              onClick={() => setAmount(amt)}

            >
              ₦{Number(amt).toLocaleString()}

            </button>


          ))}

        </div>

        <input
          type=
          "number"

          placeholder=
          "enter amount"

          value={amount}
          onChange={(e) => 
            setAmount
            (e.target.value)}
        />

      </div>

      <button 
      type="submit" 
      className="buy-btn" 
      disabled={loading}>

        {loading ? "PROCESSING..." : "PROCEED"}
        
      </button>


      {message &&

      <p>

        {message}

        </p>}


      {transaction &&

      (

        <div className=
        "transaction-result">

          <h3>

            Airtime Purchase Successful

            </h3>

          <p>

            <strong>

              Network 

            </strong>

            {" "}



          </p>
          
          <p>

            <strong>
              Phone
            </strong>

            {phone}


          </p>

          <p>

            <strong>

              Amount

              </strong>

              ₦{Number(amount)
              .toLocaleString()}

          </p>

          <p>

            <strong>

              Transaction Reference

              </strong>

            {transaction.txref || transaction.reference || "N/A"}

          </p>

          <p>

            <strong>

              Amount Charged

              </strong>
              
              ₦

            {Number
            (transaction.charged)
            .toLocaleString()}

          </p>

          <p>

            <strong>

              Remaining Balance

              </strong>

              ₦

            {Number
            (transaction.newbal)
            .toLocaleString()}

          </p>

        </div>

      )}

    </form>

  );

}

