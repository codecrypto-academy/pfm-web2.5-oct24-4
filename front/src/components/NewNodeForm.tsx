import { useForm } from 'react-hook-form';

interface NewNodeFormProps {
  addNodeToNetwork: (data: { nodeNumber: number }) => void;
  onDismiss: () => void;
}

const NewNodeForm: React.FC<NewNodeFormProps> = ({ addNodeToNetwork, onDismiss }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    addNodeToNetwork(data);
    reset();
  };

  return (
    <form
  className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-6 border border-gray-300 rounded-lg p-4 shadow-md"
  onSubmit={handleSubmit(onSubmit)}
>
  <div className="mb-4">
    <label
      htmlFor="nodeNumber"
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      Node Number
    </label>
    <input
      id="nodeNumber"
      type="number"
      {...register("nodeNumber", {
        required: "Node number is required",
        min: { value: 1, message: "Node number must be at least 1" },
        max: { value: 5, message: "Node number must not exceed 5" },
      })}
      min="1"
      max="5"
      className="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    {errors.nodeNumber && (
      <p className="text-red-500 text-sm mt-1"> {typeof errors.nodeNumber.message === "string" && errors.nodeNumber.message}</p>
    )}
  </div>
  <div className='flex gap-4'>
    <button
    type="submit"
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
  >
    Add
  </button>

  <button
    type="button"
    onClick={onDismiss}
    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
  >
    Cancel
  </button>
  </div>
  
</form>
  )
};

export default NewNodeForm;
