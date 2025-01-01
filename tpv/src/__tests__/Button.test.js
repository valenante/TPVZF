import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../components/Button';

test('renders button and handles click', () => {
  const mockOnClick = jest.fn();
  render(<Button label="Click me" onClick={mockOnClick} />);

  const button = screen.getByText('Click me');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});
