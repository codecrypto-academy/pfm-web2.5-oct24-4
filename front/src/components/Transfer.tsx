import useForm from 'react-hook-form';
import { Form, FormItem } from '.form';

export function Transfer () {
  const form = useForm

  return <div className="space-y-4 mt-3">
    
    <h1 className="text-xl font-bold">Transfer</h1>
    <p>Transfer tokens between accounts</p>

  </div>;
}