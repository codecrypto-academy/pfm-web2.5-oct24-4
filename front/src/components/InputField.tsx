interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  const InputField: React.FC<InputFieldProps> = ({ id, label, value, placeholder, onChange }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-2 mt-2 border rounded-md"
        placeholder={placeholder}
      />
    </div>
  );
  
  export default InputField;