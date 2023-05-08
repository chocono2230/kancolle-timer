import { useState } from 'react';
import { Box, Button, IconButton, ListItem, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Timer } from '../../API';
import useShowTimer from './useShowTimer';
import GenericDialog from '../GenericDialog';

type Props = {
  timer: Timer;
  organizeAfterDelete: (deletedOrder: number) => Promise<void>;
};

const ShowTimer = (props: Props) => {
  const { timer, organizeAfterDelete } = props;
  const { callStartTimer, callStopTimer, callDeleteTimer } = useShowTimer();
  const [open, setOpen] = useState<boolean>(false);

  const formatTime = (time: string | null | undefined) => {
    if (!time) {
      return '--時間--分';
    }
    const hh = time.split(':')[0];
    const mm = time.split(':')[1];
    return `${hh}時間${mm}分`;
  };

  const formatEndTime = (endTime: string | null | undefined) => {
    if (!endTime) {
      return '--日 --時--分';
    }
    const yyyymmdd = endTime.split('T')[0];
    const day = yyyymmdd.split('-')[2];
    const hhmmss = endTime.split('T')[1];
    const hh = hhmmss.split(':')[0];
    const mm = hhmmss.split(':')[1];
    return `${day}日 ${hh}時${mm}分`;
  };

  const formatTimeName = (name: string) => {
    if (name.length <= 10) {
      return name;
    }
    return name.slice(0, 10) + '...';
  };

  const startTimer = () => {
    void callStartTimer(timer);
  };

  const stopTimer = () => {
    void callStopTimer(timer);
  };

  const deleteTimer = () => {
    const deletedOrder = timer.order;
    void organizeAfterDelete(deletedOrder);
    void callDeleteTimer(timer);
    setOpen(false);
  };

  const createButton = () => {
    if (timer.endTime) {
      return (
        <Button
          variant='contained'
          color='secondary'
          onClick={() => {
            if (timer.isTemped) {
              setOpen(true);
            } else {
              stopTimer();
            }
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

  const deleteMsg = (timer.name ? timer.name : formatTime(timer.time) + 'のタイマー') + ' を削除しますか？';
  const timerMsg = formatTimeName((timer.isTemped ? 'T: ' : '') + (timer.name ? timer.name : formatTime(timer.time)));

  return (
    <>
      <ListItem sx={{ p: 0.5 }}>
        <Paper elevation={3} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', m: 1 }}>
            <Box sx={{ flex: 1 }}>{timerMsg}</Box>
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
        </Paper>
      </ListItem>
    </>
  );
};

export default ShowTimer;
