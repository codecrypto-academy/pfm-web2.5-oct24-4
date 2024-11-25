import { useContext } from 'react';

export function Faucet() {
    const { state, setState } = useContext(UserContext);
        return (
        <div className='space-y-4- mt-3'>
          <h2 className='text-xl font-bold mb-4'>Faucet</h2>
        </div>
        )
}