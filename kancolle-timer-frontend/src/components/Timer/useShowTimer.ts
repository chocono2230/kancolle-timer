import { useCallback } from 'react';

import { Timer } from '../../API';
import useTimers from '../../hook/timer.hook';

const useShowTimer = () => {
  const { updateTimer, deleteTimer } = useTimers();

  const addTime = (time: Date, hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map((s) => parseInt(s, 10));
    const nextTime = new Date(time.getTime());
    nextTime.setHours(nextTime.getHours() + hh);
    nextTime.setMinutes(nextTime.getMinutes() + mm);
    return nextTime;
  };

  const date2AWSDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.000+09:00`;
  };

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
