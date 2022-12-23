import { useCallback } from 'react';

import { CreateTimerInput, UpdateTimerInput } from '../API';
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

  const updateTimer = useCallback(async (updateTimerInput: UpdateTimerInput) => {
    try {
      const res = await TimerService.updateTimer(updateTimerInput);
      return res.data?.updateTimer;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const deleteTimer = useCallback(async (id: string) => {
    try {
      const res = await TimerService.deleteTimer({ id });
      return res.data?.deleteTimer;
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

  return { createTimer, updateTimer, deleteTimer, listTimers };
};

export type UseTimerReturnType = {
  createTimerRT: Exclude<TimerServiceReturnType['createTimerRT']['data'], undefined>['createTimer'];
  updateTimerRT: Exclude<TimerServiceReturnType['updateTimerRT']['data'], undefined>['updateTimer'];
  deleteTimerRT: Exclude<TimerServiceReturnType['deleteTimerRT']['data'], undefined>['deleteTimer'];
  listTimersRT: Exclude<
    Exclude<TimerServiceReturnType['listTimersRT']['data'], undefined>['listTimers'],
    undefined | null
  >['items'];
};

export default useTimer;
