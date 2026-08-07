import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export function FormLabel({ children, required, className = "", ...props }: FormLabelProps) {
  return (
    <label className={`block text-sm font-bold text-primary-900 mb-2 ${className}`} {...props}>
      {children} {required && <span className="text-accent-red-500">*</span>}
    </label>
  );
}

const inputBaseClasses = "w-full px-4 py-3 border-2 border-primary-900 rounded-xl bg-white focus:ring-0 focus:border-primary-500 shadow-[3px_3px_0_var(--color-primary-900)] focus:shadow-[4px_4px_0_var(--color-primary-500)] outline-none transition-all font-medium disabled:opacity-50 disabled:bg-neutral-50";

export function FormInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={`${inputBaseClasses} ${className}`} {...props} />
  );
}

export function FormSelect({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`appearance-none ${inputBaseClasses} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FormTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`resize-none ${inputBaseClasses} ${className}`} {...props} />
  );
}
