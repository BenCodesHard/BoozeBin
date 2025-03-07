'use client';
import { Input } from "@heroui/react";

/**
 * Reusable form input component with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.type - Input type (e.g., 'text', 'email', 'password')
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Function to call on input change
 * @param {boolean} props.required - Whether the input is required
 */
const FormInput = ({ label, placeholder, type, value, onChange, required = false }) => (
  <Input
    classNames={{
      input: ['outline-none', 'focus:outline-none', 'bg-black/40', 'text-white'],
      label: ['text-purple-200']
    }}
    label={label}
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
  />
);

export default FormInput;