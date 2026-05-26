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

test('keeps muscle heatmap percentages within a 100 percent total', async () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('wk_v1', JSON.stringify([
    {
      id: 'heatmap-test',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      isTemporary: false,
      exercises: [
        { name: '벤치프레스', targetMuscle: '가슴', sets: [{ weight: 100, reps: 10 }] },
        { name: '랫풀다운', targetMuscle: '등', sets: [{ weight: 65, reps: 10 }] },
      ],
    },
  ]));

  render(<App />);

  fireEvent.click(screen.getByText('통계'));

  const heatmapLabels = await screen.findAllByText(/^(가슴|등|어깨|이두|삼두|하체|복근) \d+%$/);
  const total = heatmapLabels.reduce((sum, label) => {
    const match = label.textContent.match(/(\d+)%$/);
    return sum + Number(match[1]);
  }, 0);

  expect(total).toBeLessThanOrEqual(100);
});
