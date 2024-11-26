import { useState, useEffect } from "react";


interface IsAliveProps {
  id: string;
}

function IsAlive({ id }: IsAliveProps) {
  const [live, setLive] = useState(null);
  const [contador, setContador] = useState(0);
  useEffect(() => {
    fetch(`http://localhost:5555/isAlive/${id}`)
      .then((response) => {
        response.json().then((data) => {
          setLive(data);
        });
      })
      .catch((error) => {
        console.log(error);
        setLive(null);
      });
    const interval = setInterval(() => {
      setContador(contador + 1);
    }, 5000);
    return () => clearInterval(interval);
  },  [contador]);
  return (
    <>
      {live && live.blockNumber ? (
        <span className="text-success">UP {live.blockNumber}</span>
      ) : (
        <span className="text-danger">DOWN {contador} </span>
      )}
    </>
  );
}

export default IsAlive;