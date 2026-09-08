export

const
 
NETWORKS 
= [

  { id:
     "2",
     
     name:
    "MTN" 
    
  },

  {
     id: "3", 
     name: "Airtel" 
    
  },
    
  {
     id: "1",
      name:
       "Glo" 
  },

  { id: "4",
     name:
     "9mobile"
   },

];

export 
default function 
NetworkSelector({ selected, onSelect }) 

{
  return (
    <div className=
    "network-grid">
      {NETWORKS.map((net) =>
       (
        <button
          key={net.id}

          type="button"

          className=
          {`network-btn ${selected === net.id ? "selected" : ""}`}

          onClick={() => 
            onSelect(net.id)}
        >

          {net.name}
        </button>

      ))}
      
    </div>
  );
}