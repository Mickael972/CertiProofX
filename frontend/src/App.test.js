import { render } from '@testing-library/react';
import App from './App';

// eslint-disable-next-line no-undef
test('renders app without crashing', () => {
  render(<App />);
  // Basic test to ensure app renders
  // eslint-disable-next-line no-undef
  expect(document.body).toBeInTheDocument();
});
