import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page text', () => {
  render(<App />);
  const homeText = screen.getByText(/home page/i); // Asegúrate de que este texto existe en App.js
  expect(homeText).toBeInTheDocument();
});
