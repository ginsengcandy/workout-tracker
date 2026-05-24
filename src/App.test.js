import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders workout tracker input screen', () => {
  render(<App />);
  expect(screen.getByText('운동 기록')).toBeInTheDocument();
  expect(screen.getByText('날짜')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('예: 벤치프레스')).toBeInTheDocument();
});

test('saves a temporary workout and updates it from records', async () => {
  const { container } = render(<App />);

  fireEvent.change(screen.getByPlaceholderText('예: 벤치프레스'), { target: { value: '벤치프레스' } });
  fireEvent.click(screen.getByText('저장하기'));

  expect(await screen.findByText('벤치프레스')).toBeInTheDocument();
  expect(screen.getByText(/임시 저장/)).toBeInTheDocument();

  fireEvent.click(screen.getByText('수정'));
  fireEvent.change(screen.getByDisplayValue('벤치프레스'), { target: { value: '스쿼트' } });

  const [startTime, endTime] = container.querySelectorAll('input[type="time"]');
  fireEvent.change(startTime, { target: { value: '09:00' } });
  fireEvent.change(endTime, { target: { value: '10:00' } });

  const [weight, reps] = container.querySelectorAll('input[type="number"]');
  fireEvent.change(weight, { target: { value: '100' } });
  fireEvent.change(reps, { target: { value: '5' } });
  fireEvent.click(screen.getByText('수정 저장'));

  expect(await screen.findByText('스쿼트')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('벤치프레스')).not.toBeInTheDocument());
  expect(screen.queryByText(/임시 저장/)).not.toBeInTheDocument();
});

test('saves bodyweight duration, restores it while toggling, and excludes it from volume', async () => {
  const { container } = render(<App />);

  fireEvent.change(screen.getByPlaceholderText('예: 벤치프레스'), { target: { value: '행잉 레그레이즈' } });
  fireEvent.click(screen.getByLabelText('맨몸 운동'));

  const [startTime, endTime] = container.querySelectorAll('input[type="time"]');
  fireEvent.change(startTime, { target: { value: '08:00' } });
  fireEvent.change(endTime, { target: { value: '08:20' } });

  const [minutes, seconds, reps] = container.querySelectorAll('input[type="number"]');
  fireEvent.change(minutes, { target: { value: '1' } });
  fireEvent.change(seconds, { target: { value: '30' } });
  fireEvent.change(reps, { target: { value: '15' } });

  fireEvent.click(screen.getByLabelText('맨몸 운동'));
  expect(screen.getAllByPlaceholderText('0')).toHaveLength(2);

  fireEvent.click(screen.getByLabelText('맨몸 운동'));
  expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  expect(screen.getByDisplayValue('15')).toBeInTheDocument();

  fireEvent.click(screen.getByText('저장하기'));

  expect(await screen.findByText('행잉 레그레이즈')).toBeInTheDocument();
  expect(screen.getByText(/1세트 1:30 · 15회 · 10.0회\/분/)).toBeInTheDocument();
  expect(screen.getByText(/볼륨 0kg/)).toBeInTheDocument();

  fireEvent.click(screen.getByText('수정'));
  fireEvent.click(screen.getByLabelText('맨몸 운동'));
  fireEvent.click(screen.getByLabelText('맨몸 운동'));

  expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  expect(screen.getByDisplayValue('15')).toBeInTheDocument();
});
