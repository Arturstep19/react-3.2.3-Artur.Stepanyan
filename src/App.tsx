import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import SpaceXLaunches from './components/SpaceXLaunches';

function App() {
  return (
    <MantineProvider theme={theme}>
      <SpaceXLaunches />
    </MantineProvider>
  );
}

export default App;