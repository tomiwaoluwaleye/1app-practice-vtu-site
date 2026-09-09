const express = 
require("express");

const cors = 
require("cors");

const axios = 
require("axios");

const crypto = 
require("crypto");

require("dotenv")
.config({ path: __dirname + "/.env",
  override: true,
 });

const app = 
express();

const PORT = 5000;

console.log
("ONEAPP_BASE_URL:", process.env.ONEAPP_BASE_URL);

console.log
(

  "ONEAPP_SECRET_KEY loaded:",
  !!process.env.ONEAPP_SECRET_KEY

);

console.log
(

  "ONEAPP_PUBLIC_KEY loaded:",
  !!process.env.ONEAPP_PUBLIC_KEY
  
); 

console.log
(

  "PUBLIC KEY LENGTH:",
  process.env.ONEAPP_PUBLIC_KEY
    ? process.env.ONEAPP_PUBLIC_KEY.length
    : 0

);

console.log
(
 
  "PUBLIC KEY START:",
  process.env.ONEAPP_PUBLIC_KEY
    ? process.env.ONEAPP_PUBLIC_KEY.substring(0, 7)
    : "NONE"

);

console.log
(
  
  "PUBLIC KEY END:",
  process.env.ONEAPP_PUBLIC_KEY
    ? process.env.ONEAPP_PUBLIC_KEY.slice(-5)
    : "NONE"

);


app.use(cors())
;
app.use(express.json());


// TESTING THE SERVER //

app.get
("/",
  
  
  (req,
    res
  ) => 
    
    {
  res.json
  
  ({

    message: "VTU is running",

  });


});



// AUTHENTICATION TESTING //

app.get
("/api/test-1app", 
  async (req, 
    res
  ) => {
    
  try 
  {
    const
     response
     = 
    await
     axios.get
     
    (
      `${process.env.ONEAPP_BASE_URL}/balance`,
      {

        headers: {
          Authorization: `Bearer ${process.env.ONEAPP_SECRET_KEY.trim()}`,
          "Conetent-Type" : "application/json",
        
        },

      }
    );


    console.log("1app authentication successful");

    res.json
    ({

      status: true,
      message: "1app authentication successful",
      data: response.data,
      
    });

  }

  catch (error) 
  
  {
    console.error
    (

      "1app authentication failed"

    );

    if 
    (
      error.response
    )

    {

      console.error
      
      (error.response.data);

      return res.status
      (error.response.status).json
      (
        {
        status: false,
        message: "1app authentication failed",
        error: error.response.data,
      });

    }

    res.status
    (500).json
    
    ({
      status: false,
      message: "Server error",
      error: error.message,
    });

  }
  
});


// DATA PLANS
app.get
("/api/data-plans", async (req, res) => {

  try 
  {

    const 
    { provider, datatype } = req.query;

    
    if (!provider)
       {

      return res.status(400).json({

        status: false,
        message: "Network provider is required.",

      });

    }

    console.log("Data Plans request:",
       {
      provider,
      datatype,
    });


    
    const response
     = await axios.get(

      `${process.env.ONEAPP_BASE_URL}/getdataplans`,

      {

        params: {
          provider,
          ...(datatype && { datatype }),
        },

        headers:
         {

          Authorization:
            `Bearer ${process.env.ONEAPP_PUBLIC_KEY}`,

        },

      }

    );


    // SEND'S 1APP RESPONSE TO FRONTEND
    console.log("1app data plans response:");

    console.log(response.data);


    return res.json(response.data);


  }

  catch (error) {

    console.error(
      "Data Plans error:"
    );


    if (error.response) {

      console.error(
        error.response.data
      );


      return res.status(
        error.response.status
      ).json({

        status: false,

        message:
          error.response.data?.message ||
          "Unable to retrieve data plans.",

        error: error.response.data,


      });

    }


    console.error(
      error.message
    );


    return res.status(500).json({

      status: false,

      message: "Unable to retrieve data plans.",

    });

  }

});



// PURCHASE AIRTIME//

app.post
("/api/airtime", async (req, res) => 
  {
    
  try {

    const
    
    {
      
      phoneno,
      network_id,
      amount,
      reference

    }
     = req.body;


    
    // VALIDATION //
    
    if 
    
    (!phoneno || !network_id || !amount) 
    
    {

      return res.status(400).json
      
      ({

        status: false,
        message: "Phone number, network and amount are cumpulsory.",

      });

    }


  
    const cleanAmount = 
    String(amount).replace(/,/g, "");



    if 
    
    (
      isNaN
      (Number

        (

          cleanAmount
        
        )) || Number
        (
          cleanAmount
        ) 
        <= 0) 
        {
      return res.status(400).json
      
      ({

        status: false,
        message: "Please enter a valid airtime amount.",

      });

    }


    // GENERATE TRANSACTION REFERENCE //

    const 

    transactionReference =
      reference
       ||
      `VTU-${Date.now()}-${crypto.randomUUID()
        .slice(0, 8)}`;


    console.log
    ("Airtime request:");


    console.log
    
    ({

      phoneno,
      network_id,
      amount: cleanAmount,
      reference: transactionReference,

    });


    
    // SEND'S REQUEST TO 1APP //

    const 
    response = 
    await 
    axios.post(
      `${process.env.ONEAPP_BASE_URL}/airtime`,

      {

        phoneno,
        network_id,
        amount: cleanAmount,
        reference: transactionReference,

      },

      {

        headers: 
        {

          Authorization: 
          `Bearer ${process.env.ONEAPP_SECRET_KEY}`,
          "Content-Type": 
          "application/json",
          
        },

      }
      
    );


   




    // SEND'S 1APP RESPONSE TO FRONTEND //

    console.log


    (

      "1app airtime response:"

    );


    console.log

    (

      response.data
      
    );


    return res.json

    (

      response.data

    );

  }
  

  catch

  (error) 
  
  {

    console.error

    (

      "Airtime purchase error:"

    );


    if 

    (

      error.response

    )

    
    {

      console.error
      (error.response.data);

      return res.status
      (error.response.status)
      .json

      ({

        status: false,
        message:
          error.response.data?.message ||
          "Airtime purchase failed.",
        error: error.response.data,

      });

    }


    console.error
    (
      error.message
    );

    return res.status
    (500)
    .json
    ({
      status: false,
      message: "Unable to process airtime request.",
    });
  }

});



// THE START SERVER //

app.post("/api/data",

   async (req, res) =>

   {

  try
  
  {
   
    const

     {

       phoneno, network_id, datacode, reference

      
      }

       =
        req.body;


    if
     (!phoneno
       ||
        !network_id
        
         ||

          !datacode)

           {

      return res.status(400).json({


        status:
         false,

        message:
         "Phone number, network and data code are required.",


      });


    }

    const

     dataType
      =

       req.body.dtype

        ||

         "direct";

    const
    
     transactionReference
      =

      reference

       ||

        `VTU-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;


    console.log("Data purchase request:",
       {

      phoneno,
      network_id,
      datacode,
      reference:
       transactionReference,

    });

    const

     response
      =
       await
        axios.post(
      `${process.env.ONEAPP_BASE_URL}/databundle`,


      {

        phoneno,
        network_id,
        datacode,
        dtype: dataType,
        reference: transactionReference,

      },


      {

        headers:


         {

          Authorization:`Bearer ${process.env.ONEAPP_SECRET_KEY}`,
          "Content-Type":
           "application/json",

        },

      }

    );


    console.log("1app data purchase response:");
    console.log(response.data);

    

    return res.json(response.data);

  }


  catch
   (error)
   
   {
    console.error("Data purchase error:", error);



    if
    
     (error.response)
      {
        
      console.error(error.response.data);
      return res.status(error.response.status).json
      
      ({

        status:
         false,

        message:
         error.response.data?.message

          ||
           "Data purchase failed.",

        error: error.response.data,


      });


    }

    console.error(error.message);
    return res.status(500).json
    
    ({

      status:
       false,

      message:
       "Unable to process data request.",

    });

  }

});



// ELECTRICITY METER VERIFICATION //

app.get("/api/verify-electricity", async (req, res) => {

  try {

    const { provider, meterno } = req.query;


    // VALIDATION /

    if (!provider || !meterno) {

      return res.status(400).json({

        status: false,
        message: "Electricity provider and meter number are required.",

      });

    }


    console.log("Electricity meter verification request:", {

      provider,
      meterno,

    });


    // SEND REQUEST TO 1APP

    const response = await axios.get(

      `${process.env.ONEAPP_BASE_URL}/verifyelect`,

      {

        params: {

          provider,
          meterno,

        },

        headers: {

          Authorization:
            `Bearer ${process.env.ONEAPP_PUBLIC_KEY}`,

        },

      }

    );


    // LOG 1APP RESPONSE

    console.log("1app meter verification response:");

    console.log(response.data);


    // SEND RESPONSE TO FRONTEND

    return res.json(response.data);

  }


  catch (error) {

    console.error("Electricity meter verification error:");


    if (error.response) {

      console.error(error.response.data);


      return res.status(error.response.status).json({

        status: false,

        message:
          error.response.data?.message ||
          "Unable to verify electricity meter.",

        error: error.response.data,

      });

    }


    console.error(error.message);


    return res.status(500).json({

      status: false,

      message: "Unable to verify electricity meter.",

    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});