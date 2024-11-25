import { useContext, useState } from 'react';
import { UserContext } from '../App';

export function Faucet() {
    const { state, setState } = useContext(UserContext);
    const [tx, setTx] = useState<object | null>(null);
    const [loading, setLoading] = useState(false);  
    
    async function handleClick() {
        setLoading(true)
        const result = await fetch('http://localhost:5555/api/faucet/${state.acc}/1')
        const data = await result.json()
        setTx(data)
        setLoading(false)
      }
        return (
        <div className='space-y-4- mt-3'>
          <h2 className='text-xl font-bold mb-4'>Faucet</h2>
          <p>Cuenta {state.acc}</p>
          <button
          onClick={async () => handleClick()}
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4">
          Request funds
          </button>
          {loading && <p>Loading...</p>}
          {tx && <pre>Transaction hash: {JSON.stringify(tx, null, 4)}</pre>}
        </div>
        )
}