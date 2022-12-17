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

  const listTimers = useCallback(async () => {
    try {
      const res = await TimerService.listTimers();
      return res.data?.listTimers?.items;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  return { createTimer, listTimers };
};

export type UseTimerReturnType = {
  createTimerRT: Exclude<TimerServiceReturnType['createTimerRT']['data'], undefined>['createTimer'];
  listTimersRT: Exclude<
    Exclude<TimerServiceReturnType['listTimersRT']['data'], undefined>['listTimers'],
    undefined | null
  >['items'];
};

export default useTimer;
