import { Box, Container } from '@mui/material';
import EditTimer from './EditTimer';
import ShowTimer from './ShowTimer';
import useTimerIndex from './useIndexTimer';

const Timer = () => {
  const { timersArray, organizeAfterDelete } = useTimerIndex();
  return (
    <>
      <Container maxWidth='sm'>
        <Box sx={{ minWidth: '450px' }}>
          {timersArray &&
            timersArray.map((t) => {
              return <ShowTimer key={t.id} timer={t} organizeAfterDelete={organizeAfterDelete} />;
            })}
          <Box sx={{ m: 2 }}>
            <EditTimer timerListSize={timersArray.length} />
          </Box>
        </Box>
      </Container>
    </>
  );
};
export default Timer;
