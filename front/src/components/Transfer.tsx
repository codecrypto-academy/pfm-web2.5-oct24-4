import { useForm } from 'react-hook-form';

export function Transfer() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    const { amount, address } = data;
    try {
      // Aquí se realizaría la solicitud al faucet
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
      <h1 className="text-xl font-bold">Solicitar Fondos</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="amount">Cantidad</label>
          <input
            id="amount"
            type="number"
            {...register('amount', { required: 'La cantidad es requerida' })}
          />
          {errors.amount && <p>{String(errors.amount.message)}</p>}
        </div>
        <div>
          <label htmlFor="address">Dirección</label>
          <input
            id="address"
            type="text"
            {...register('address', { required: 'La dirección es requerida' })}
          />
          {errors.address && <p>{String(errors.address.message)}</p>}
        </div>
        <button type="submit">Solicitar Fondos</button>
      </form>
    </div>
  );
}