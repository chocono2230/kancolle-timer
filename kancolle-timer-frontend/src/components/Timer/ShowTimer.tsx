import { Box, Button } from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Timer } from '../../API';

type Props = {
  timer: Timer;
};

const ShowTimer = (props: Props) => {
  const { timer } = props;

  const formatTime = (time: string | null | undefined) => {
    if (!time) {
      return '--:--';
    }
    return time.substring(0, 5);
  };

  const createButton = () => {
    if (timer.endTime) {
      return (
        <Button variant='contained' color='secondary'>
          中止
        </Button>
      );
    }
    return (
      <Button variant='contained' color='primary'>
        開始
      </Button>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', m: 1 }}>
        <Box sx={{ flex: 1 }}>{timer.name}</Box>
        <Box sx={{ flex: 1 }}>{formatTime(timer.time)}</Box>
        <Box sx={{ flex: 1 }}>{formatTime(timer.endTime)}</Box>
        {createButton()}
        <IconButton aria-label='delete' sx={{ ml: 1 }}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default ShowTimer;
