import { useCallback } from 'react';

import { Timer } from '../../API';
import useTimers from '../../hook/timer.hook';
import { date2AWSDateTime, addTime } from '../../utils/timeUtils';

const useShowTimer = () => {
  const { updateTimer, deleteTimer } = useTimers();

  const callStartTimer = async (timer: Timer) => {
    const nowTime = new Date();
    const nextTime = addTime(nowTime, timer.time);
    try {
      const nextTimer = { id: timer.id, endTime: date2AWSDateTime(nextTime) };
      await updateTimer(nextTimer);
    } catch (e) {
      console.error(e);
    }
  };

  const callStopTimer = useCallback(async (timer: Timer) => {
    try {
      const nextTimer = { id: timer.id, endTime: null };
      await updateTimer(nextTimer);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const callDeleteTimer = useCallback(async (timer: Timer) => {
    try {
      await deleteTimer(timer.id);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return { callStartTimer, callStopTimer, callDeleteTimer };
};

export default useShowTimer;
