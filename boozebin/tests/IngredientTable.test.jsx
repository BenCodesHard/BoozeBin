// src/components/ui/IngredientTable.test.jsx
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

// Mock the Supabase client
jest.mock('@/supabaseClient', () => {
  return {
    from: jest.fn()
  };
});

import IngredientTable from '../src/components/ui/IngredientsTable.jsx';
// Import the mocked client
import supabase from '@/supabaseClient';

describe('IngredientTable Component', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('supabase.from is mocked', () => {
    expect(jest.isMockFunction(supabase.from)).toBe(true);
  });

  test('renders form input and mocked ingredient', async () => {
    // Setup the supabase mock with data
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { stuff: ['Salt'] },
        error: null
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null })
    }));

    // Render component wrapped in act
    await act(async () => {
      render(<IngredientTable user={{ email: 'test@example.com' }} />);
    });

    // Wait for all promises to resolve
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Check that we're looking at ingredients, not loading state
    expect(screen.queryByText('Loading ingredients...')).not.toBeInTheDocument();

    // Check for the ingredients list header
    expect(screen.getByText('Your Ingredients:')).toBeInTheDocument();

    // Check that we don't have the "no ingredients" message
    expect(screen.queryByText('No ingredients added yet')).not.toBeInTheDocument();

    // Look for the Salt ingredient with a custom matcher
    // This accounts for the text being inside a label element
    const saltElement = screen.getByLabelText('Salt');
    expect(saltElement).toBeInTheDocument();
  });

  test('shows error message when an error occurs', async () => {
    // Setup the supabase mock to return an error
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    }));

    // Render component wrapped in act
    await act(async () => {
      render(<IngredientTable user={{ email: 'test@example.com' }} />);
    });

    // Wait for state updates
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Check that error message appears
    expect(screen.getByText('Error fetching data: Database error')).toBeInTheDocument();
  });

  test('handles PGRST116 error by creating a new record', async () => {
    // First call returns a PGRST116 error (no record found)
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No record found' }
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null })
    }));

    // Render component wrapped in act
    await act(async () => {
      render(<IngredientTable user={{ email: 'test@example.com' }} />);
    });

    // Wait for state updates
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Check that the "No ingredients" message appears
    expect(screen.getByText('No ingredients added yet')).toBeInTheDocument();
  });

  test('adds a new ingredient when add button is clicked', async () => {
    // Setup multiple mock implementations for different calls

    // First implementation: Empty ingredient list for initial load
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { stuff: [] },
        error: null
      })
    }));

    // Second implementation: For the add operation
    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { stuff: [] },
        error: null
      }),
      update: jest.fn().mockImplementation(() => {
        // Inside update, mutate the next mock to return updated data
        supabase.from.mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { stuff: ['Pepper'] },
            error: null
          })
        }));

        return Promise.resolve({ data: null, error: null });
      })
    }));

    // Render component wrapped in act
    await act(async () => {
      render(<IngredientTable user={{ email: 'test@example.com' }} />);
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Find and fill the input field
    const input = screen.getByPlaceholderText('Enter ingredient name');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pepper' } });
    });

    // Find the add button by its text content or role
    const addButton = screen.getByRole('button', {
      name: (content) => content.includes('Add')
    });

    // Click the add button
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Wait for the update to complete
    await act(async () => {
      await new Promise(r => setTimeout(r, 100)); // Give it a bit more time
    });

    // Debug output to see what's in the DOM
    // console.log(screen.debug());

    // Check that the new ingredient appears
    const pepperLabel = screen.getByLabelText('Pepper');
    expect(pepperLabel).toBeInTheDocument();
  });

  test('deletes an ingredient when checkbox is clicked', async () => {
    // Track whether delete was called
    let deleteWasCalled = false;

    // Setup initial data with one ingredient
    supabase.from.mockImplementation((table) => {
      // For the initial data fetch
      const mockObj = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { stuff: ['Apple'] },
          error: null
        }),
        // For the delete operation
        update: jest.fn().mockImplementation((data) => {
          deleteWasCalled = true;
          // After the update call, change the mock for the next data fetch
          supabase.from.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { stuff: [] },
              error: null
            })
          }));
          return Promise.resolve({ data: null, error: null });
        })
      };
      return mockObj;
    });

    // Render component wrapped in act
    await act(async () => {
      render(<IngredientTable user={{ email: 'test@example.com' }} />);
    });

    // Wait for initial render
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    // Find the checkbox for Apple
    const appleCheckbox = screen.getByRole('checkbox');

    // Click the checkbox to delete
    await act(async () => {
      fireEvent.click(appleCheckbox);
    });

    // Wait for the component to re-render
    await act(async () => {
      await new Promise(r => setTimeout(r, 300)); // Longer wait to ensure update completes
    });

    // Debug what's in the DOM after deletion

    // Verify delete was called
    expect(deleteWasCalled).toBe(true);
  });
});
