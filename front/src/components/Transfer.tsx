import { useForm } from 'react-hook-form';
import InputField from './InputField';
import { useState } from 'react';

export function Transfer() {
  const form = useForm(
    {
      defaultValues: {
        OriginAccount: '',
        DestinationAccount: '',
        Amount: '',
      },
    }
  );
  const [OriginAccount, setOriginAccount] = useState('');
  const [DestinationAccount, setDestinationAccount] = useState('');
  const [Amount, setAmount] = useState('');

  const onSubmit = async (data: any) => {
    console.log(data);
  };
  
  return <div className='space-y-4- mt-3'>

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

  </div>
}

/*
  const onSubmit = async (data: any) => {
    const { amount, address } = data;
    try {
      const response = await fetch('URL_DEL_FAUCET', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, address }),
      });
      const result = await response.json();
      console.log('Faucet response:', result);
    } catch (error) {
      console.error('Error requesting funds:', error);
    }
  };

  return (
    <div className="space-y-4 mt-3">
      <h2 className="text-xl font-bold mb-4">Transferir Fondos</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="amount">Amount</label>
          <Input
            id="amount"
            type="number"
            {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Amount must be at least 1' } })}
          />
          {errors.amount && <FormErrorMessage>{errors.amount.message}</FormErrorMessage>}
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <Input
            id="address"
            type="text"
            {...register('address', { required: 'Address is required', pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Invalid address format' } })}
          />
          {errors.address && <FormErrorMessage>{errors.address.message}</FormErrorMessage>}
        </div>
        
      </form>
    </div>
  );
}
*/