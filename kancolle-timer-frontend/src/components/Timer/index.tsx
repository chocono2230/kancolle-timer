import { Box } from '@mui/material';
import EditTimer from './EditTimer';
import ShowTimer from './ShowTimer';
import useTimerIndex from './useIndexTimer';

const Timer = () => {
  const { timersArray, organizeAfterDelete } = useTimerIndex();
  return (
    <>
      <Box sx={{ minWidth: '450px' }}>
        {timersArray &&
          timersArray.map((t) => {
            return <ShowTimer key={t.id} timer={t} organizeAfterDelete={organizeAfterDelete} />;
          })}
        <EditTimer timerListSize={timersArray.length} />
      </Box>
    </>
  );
};
export default Timer;
