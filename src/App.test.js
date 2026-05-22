import { render, screen } from '@testing-library/react';
import App from './App';

test('renders workout tracker input screen', () => {
  render(<App />);
  expect(screen.getByText('운동 기록')).toBeInTheDocument();
  expect(screen.getByText('날짜')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('예: 벤치프레스')).toBeInTheDocument();
});
