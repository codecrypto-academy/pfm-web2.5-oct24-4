import React from 'react';
import { useForm } from 'react-hook-form';

const NewNodeForm = ({ addNodeToNetwork }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    addNodeToNetwork(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="nodeNumber">Node Number</label>
        <input
          id="nodeNumber"
          type="number"
          {...register('nodeNumber', {
            required: 'Node number is required',
            min: { value: 1, message: 'Node number must be at least 1' },
            max: { value: 5, message: 'Node number must not exceed 5' },
          })}
          min="1"
          max="5"
        />
        {errors.nodeNumber && (
          <p className="error-message">{errors.nodeNumber.message}</p>
        )}
      </div>
      <button type="submit">Add Node</button>
    </form>
  );
};

export default NewNodeForm;
