import { useState } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Timer } from '../../API';
import useShowTimer from './useShowTimer';
import GenericDialog from '../GenericDialog';

type Props = {
  timer: Timer;
};

const ShowTimer = (props: Props) => {
  const { timer } = props;
  const { callStartTimer, callStopTimer, callDeleteTimer } = useShowTimer();
  const [open, setOpen] = useState<boolean>(false);

  const formatTime = (time: string | null | undefined) => {
    if (!time) {
      return '--:--';
    }
    return time;
  };

  const formatEndTime = (endTime: string | null | undefined) => {
    if (!endTime) {
      return '--日 --:--';
    }
    const yyyymmdd = endTime.split('T')[0];
    const day = yyyymmdd.split('-')[2];
    const hhmmss = endTime.split('T')[1];
    const hh = hhmmss.split(':')[0];
    const mm = hhmmss.split(':')[1];
    return `${day}日 ${hh}:${mm}`;
  };

  const startTimer = () => {
    void callStartTimer(timer);
  };

  const stopTimer = () => {
    void callStopTimer(timer);
  };

  const deleteTimer = () => {
    void callDeleteTimer(timer);
  };

  const createButton = () => {
    if (timer.endTime) {
      return (
        <Button
          variant='contained'
          color='secondary'
          onClick={() => {
            stopTimer();
          }}
        >
          中止
        </Button>
      );
    }
    return (
      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          startTimer();
        }}
      >
        開始
      </Button>
    );
  };

  const deleteMsg = (timer.name ? timer.name : timer.time + 'のタイマー') + ' を削除しますか？';

  return (
    <>
      <Box sx={{ display: 'flex', m: 1 }}>
        <Box sx={{ flex: 1 }}>{timer.name}</Box>
        <Box sx={{ flex: 1 }}>{formatTime(timer.time)}</Box>
        <Box sx={{ flex: 1 }}>{formatEndTime(timer.endTime)}</Box>
        {createButton()}
        <IconButton
          sx={{ ml: 1 }}
          onClick={() => {
            setOpen(true);
          }}
        >
          <DeleteIcon />
        </IconButton>
        <GenericDialog
          msg={deleteMsg}
          isOpen={open}
          doOk={deleteTimer}
          doCancel={() => setOpen(false)}
          irreversibleFlag
        />
      </Box>
    </>
  );
};

export default ShowTimer;
