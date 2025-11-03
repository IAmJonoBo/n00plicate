import { render } from '@testing-library/react-native';

import App from '../App';
import { ThemeProvider } from '../theme/ThemeProvider';

// Mock design tokens
jest.mock('@n00plicate/design-tokens', () => ({
  color: {
    primary: {
      500: '#3b82f6',
    },
  },
  spacing: {
    md: 16,
  },
}));

describe('App', () => {
  it('renders without crashing', () => {
    const component = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
    expect(component).toBeTruthy();
  });

  it('displays the correct title', () => {
    const { getByText } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
    expect(getByText('n00plicate Mobile App')).toBeTruthy();
  });

  it('renders design token demo components', () => {
    const { getByText } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
    expect(getByText('Design Tokens Demo')).toBeTruthy();
    expect(getByText('Primary Button')).toBeTruthy();
  });
});
