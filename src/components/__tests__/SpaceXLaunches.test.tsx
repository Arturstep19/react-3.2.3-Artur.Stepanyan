import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import SpaceXLaunches from '../SpaceXLaunches';
import { theme } from '../../theme';
import '@testing-library/jest-dom';

const mockLaunch = {
  flight_number: 1,
  mission_name: 'Starlink 2',
  launch_year: '2020',
  launch_date_utc: '2020-01-07T02:19:00.000Z',
  rocket: {
    rocket_name: 'Falcon 9',
    rocket_type: 'FT'
  },
  links: {
    mission_patch: 'https://images2.imgbox.com/d2/3b/bQaWiil0_o.png',
    mission_patch_small: 'https://images2.imgbox.com/d2/3b/bQaWiil0_o.png',
    article_link: '',
    wikipedia: '',
    video_link: ''
  },
  details: "SpaceX's second operational batch of Starlink satellites.",
  launch_success: true
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue([mockLaunch])
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SpaceXLaunches', () => {
  it('должен отображать заголовок', async () => {
    const { getByText } = render(
      <MantineProvider theme={theme}>
        <SpaceXLaunches />
      </MantineProvider>
    );

    await waitFor(() => {
      expect(getByText('SpaceX Launches 2020')).toBeInTheDocument();
    });
  });

  it('должен загружать и отображать запуски только 2020 года', async () => {
    const { getByText } = render(
      <MantineProvider theme={theme}>
        <SpaceXLaunches />
      </MantineProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://api.spacexdata.com/v3/launches?launch_year=2020');
      expect(getByText('Starlink 2')).toBeInTheDocument();
      expect(getByText('Falcon 9')).toBeInTheDocument();
    });
  });

  it('должен открывать модальное окно при клике на See more', async () => {
    const user = userEvent.setup();
    const { getByText, findByText } = render(
      <MantineProvider theme={theme}>
        <SpaceXLaunches />
      </MantineProvider>
    );

    await waitFor(async () => {
      const seeMoreButton = await findByText('See more');
      await user.click(seeMoreButton);
      expect(getByText('Детали:')).toBeInTheDocument();
    });
  });

  it('должен отображать состояние загрузки', () => {
    const { getByText } = render(
      <MantineProvider theme={theme}>
        <SpaceXLaunches />
      </MantineProvider>
    );

    expect(getByText('Загрузка запусков SpaceX 2020...')).toBeInTheDocument();
  });
});