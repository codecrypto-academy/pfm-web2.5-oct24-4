import { useForm } from 'react-hook-form';
import InputField from './InputField';
import { useState } from 'react';
import { ethers } from 'ethers';

export function Transfer() {
  const [tx, setTx] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
      defaultValues: {
        OriginAccount: '',
        DestinationAccount: '',
        Amount: '',
      },
    });

  const [OriginAccount, setOriginAccount] = useState('');
  const [DestinationAccount, setDestinationAccount] = useState('');
  const [Amount, setAmount] = useState('');

  const onSubmit = async (data: any) => {
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(data.OriginAccount)
    const t = await signer.sendTransaction({
      to: data.DestinationAccount,
      value: ethers.parseEther(data.Amount.toString()),
    });
    const tx = await t.wait();
    setTx(tx);
    setLoading(false);
  };
  
  return (
    <div className='space-y-4- mt-3'>
      <h2 className='text-xl font-bold mb-4'>Transfer</h2>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className='space-y-8'>
          <div className="mb-4">
                <InputField
                  id="OriginAccount"
                  label="Origin Account"
                  value={OriginAccount}
                  onChange={(e) => setOriginAccount(e.target.value)}
                  placeholder="0x..."
                />
          </div>
          <div className="mb-4">
                <InputField
                  id="DestinationAccount"
                  label="Destination Account"
                  value={DestinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  placeholder="0x..."
                />
          </div>
          <div className="mb-4">
                <InputField
                  id="Amount"
                  label="Amount"
                  value={Amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
          </div>
        <button
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4">
          Transfer
          </button>
      </form>
    {tx && ( 
    <div>
      <h2>Transaction succeded</h2>
      <pre>{JSON.stringify(tx, null, 4)}</pre>
    </div>
    )},
  </div>
  );}