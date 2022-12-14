import { useCallback } from 'react';

import { CreateTimerInput } from '../API';
import TimerService, { TimerServiceReturnType } from '../service/timer.service';

const useTimer = () => {
  const createTimer = useCallback(async (createTimerInput: CreateTimerInput) => {
    try {
      const res = await TimerService.createTimer(createTimerInput);
      return res.data?.createTimer;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  return { createTimer };
};

export type UseTimerReturnType = {
  createTimerRT: Exclude<TimerServiceReturnType['createTimerRT']['data'], undefined>['createTimer'];
};

export default useTimer;
