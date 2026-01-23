import { filterIssues, sortIssues, formatDate, getPriorityClass } from '../utils/helpers';

describe('Helper Functions', () => {
  const mockIssues = [
    {
      id: 'ISS-001',
      title: 'Test Issue',
      priority: 'high',
      status: 'pending',
      type: 'Road Damage',
      ward: 'Ward 1',
      createdDate: '2024-01-10',
    },
    {
      id: 'ISS-002',
      title: 'Another Issue',
      priority: 'low',
      status: 'resolved',
      type: 'Garbage',
      ward: 'Ward 2',
      createdDate: '2024-01-15',
    },
  ];

  test('filterIssues filters by priority', () => {
    const filtered = filterIssues(mockIssues, { priority: ['high'] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe('high');
  });

  test('sortIssues sorts by date', () => {
    const sorted = sortIssues(mockIssues, 'date-desc');
    expect(sorted[0].createdDate).toBeGreaterThanOrEqual(sorted[1].createdDate);
  });

  test('formatDate formats correctly', () => {
    const formatted = formatDate('2024-01-10');
    expect(formatted).toContain('Jan');
  });

  test('getPriorityClass returns correct class', () => {
    expect(getPriorityClass('high')).toContain('orange');
  });
});
