import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

const FormField = ({ id, label, error, ...inputProps }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      name={id}
      className={`rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...inputProps}
    />
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default FormField;
