import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../store/index';
import { PriorityBadge, StatusBadge } from '../components/common/Badges';

test('renders priority badge correctly', () => {
  render(
    <Provider store={store}>
      <PriorityBadge priority="high" />
    </Provider>
  );
  expect(screen.getByText(/High/i)).toBeInTheDocument();
});

test('renders status badge correctly', () => {
  render(
    <Provider store={store}>
      <StatusBadge status="resolved" />
    </Provider>
  );
  expect(screen.getByText(/Resolved/i)).toBeInTheDocument();
});
