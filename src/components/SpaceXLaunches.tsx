import React, { useReducer, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, Text, Container, Title } from '@mantine/core';
import type { SpaceXLaunch } from '../types/spacex';

type State = {
  launches: SpaceXLaunch[];
  loading: boolean;
  error: string | null;
  selectedLaunch: SpaceXLaunch | null;
  modalOpened: boolean;
};

type Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: SpaceXLaunch[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'OPEN_MODAL'; payload: SpaceXLaunch }
  | { type: 'CLOSE_MODAL' };

const launchesReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, launches: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'OPEN_MODAL':
      return { ...state, selectedLaunch: action.payload, modalOpened: true };
    case 'CLOSE_MODAL':
      return { ...state, selectedLaunch: null, modalOpened: false };
    default:
      return state;
  }
};

const initialState: State = {
  launches: [],
  loading: true,
  error: null,
  selectedLaunch: null,
  modalOpened: false,
};

const LaunchModal: React.FC<{
  launch: SpaceXLaunch | null;
  opened: boolean;
  onClose: () => void;
}> = ({ launch, opened, onClose }) => {
  if (!launch) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: opened ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          aria-label="Закрыть"
        >
          ×
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ 
            margin: 0, 
            marginBottom: '20px',
            fontSize: '22px', 
            fontWeight: 600, 
            color: '#000',
            paddingRight: '30px'
          }}>
            {launch.mission_name}
          </h2>
          
          {launch.links?.mission_patch && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={launch.links.mission_patch}
                height={120}
                alt={launch.mission_name}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text fw={500} size="sm" style={{ color: '#000', minWidth: '70px' }}>Ракета:</Text>
              <Text size="sm" style={{ color: '#333' }}>{launch.rocket?.rocket_name || 'Неизвестно'}</Text>
            </div>
            
            <div style={{ display: 'flex' }}>
              <Text fw={500} size="sm" style={{ color: '#000', minWidth: '70px' }}>Дата:</Text>
              <Text size="sm" style={{ color: '#333' }}>
                {new Date(launch.launch_date_utc).toLocaleDateString('ru-RU')}
              </Text>
            </div>
          </div>
          
          {launch.details && (
            <div>
              <Text fw={500} size="sm" mb={8} style={{ color: '#000' }}>Детали:</Text>
              <Text size="sm" style={{ color: '#333', lineHeight: 1.5 }}>{launch.details}</Text>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const SpaceXLaunches: React.FC = () => {
  const [state, dispatch] = useReducer(launchesReducer, initialState);

  useEffect(() => {
    const fetchLaunches = async () => {
      dispatch({ type: 'FETCH_START' });
      
      try {
        const response = await fetch('https://api.spacexdata.com/v3/launches?launch_year=2020');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        console.error('Error fetching SpaceX launches:', error);
        dispatch({ type: 'FETCH_ERROR', payload: 'Не удалось загрузить данные. Проверьте подключение к интернету.' });
      }
    };

    fetchLaunches();
  }, []);

  const handleSeeMore = (launch: SpaceXLaunch) => {
    dispatch({ type: 'OPEN_MODAL', payload: launch });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  if (state.loading) {
    return (
      <Container size="xl" py={80}>
        <Text size="lg" style={{ textAlign: 'center' }}>Загрузка запусков SpaceX 2020...</Text>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container size="xl" py={80}>
        <Text c="red" style={{ textAlign: 'center' }}>Ошибка: {state.error}</Text>
      </Container>
    );
  }

  return (
    <>
      <Container size="xl" py={60} style={{ maxWidth: '1200px' }}>
        <Title 
          order={1} 
          mb={50}
          style={{ 
            fontSize: '32px',
            fontWeight: 700,
            color: '#000',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}
        >
          SpaceX Launches 2020
        </Title>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {state.launches.map((launch) => (
            <Card
              key={launch.flight_number}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{
                border: '1px solid #eaeaea',
                borderRadius: '10px',
                backgroundColor: 'white',
                height: '190px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text fw={700} style={{ color: '#000', fontSize: '17px', marginBottom: '6px' }}>
                    {launch.mission_name}
                  </Text>
                  <Text style={{ color: '#666', fontSize: '14px' }}>
                    {launch.rocket?.rocket_name || 'Неизвестно'}
                  </Text>
                </div>
                
                {launch.links?.mission_patch_small && (
                  <img
                    src={launch.links.mission_patch_small}
                    width={45}
                    height={45}
                    alt={launch.mission_name}
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>

              <button
                onClick={() => handleSeeMore(launch)}
                style={{
                  width: '100%',
                  height: '38px',
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px'
                }}
              >
                <span>See more</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </Card>
          ))}
        </div>
      </Container>

      <LaunchModal
        launch={state.selectedLaunch}
        opened={state.modalOpened}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default SpaceXLaunches;