
// app/components/FormInput.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '../src/components/ui/FormInput.jsx';

describe('FormInput Component', () => {
  test('renders with label and placeholder', () => {
    render(
      <FormInput
        label="Ingredients"
        placeholder="Enter ingredient name"
        value=""
        onChange={() => { }}
      />
    );
    // Check that the label and placeholder are rendered.
    expect(screen.getByLabelText('Ingredients')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter ingredient name')).toBeInTheDocument();
  });

  test('calls onChange handler when input changes', () => {
    const handleChange = jest.fn();
    render(
      <FormInput
        label="Ingredients"
        placeholder="Enter ingredient name"
        value=""
        onChange={handleChange}
      />
    );
    const input = screen.getByPlaceholderText('Enter ingredient name');
    fireEvent.change(input, { target: { value: 'Sugar' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
