import { useState, useEffect, useCallback } from 'react';

import { Timer, OnCreateTimerSubscription, OnUpdateTimerSubscription, OnDeleteTimerSubscription } from '../../API';
import { API, graphqlOperation } from 'aws-amplify';
import useTimers from '../../hook/timer.hook';
// amplifyで自動生成されたサブスクリプションのクエリをimport
import { onCreateTimer, onDeleteTimer, onUpdateTimer } from '../../graphql/subscriptions';
import { hasProperty } from '../../utils/typeUtils';

type onCreateTimer = {
  value: {
    data: OnCreateTimerSubscription;
  };
};

type onUpdateTimer = {
  value: {
    data: OnUpdateTimerSubscription;
  };
};

type onDeleteTimer = {
  value: {
    data: OnDeleteTimerSubscription;
  };
};

const isOnCreateTimer = (t: unknown): t is onCreateTimer => {
  if (hasProperty(t, 'value') && hasProperty(t.value, 'data') && hasProperty(t.value.data, 'onCreateTimer')) {
    return isTimer(t.value.data.onCreateTimer);
  }
  return false;
};

const isOnUpdateTimer = (t: unknown): t is onUpdateTimer => {
  if (hasProperty(t, 'value') && hasProperty(t.value, 'data') && hasProperty(t.value.data, 'onUpdateTimer')) {
    return isTimer(t.value.data.onUpdateTimer);
  }
  return false;
};

const isOnDeleteTimer = (t: unknown): t is onDeleteTimer => {
  if (hasProperty(t, 'value') && hasProperty(t.value, 'data') && hasProperty(t.value.data, 'onDeleteTimer')) {
    return isTimer(t.value.data.onDeleteTimer);
  }
  return false;
};

const isTimer = (t: unknown): t is Timer => {
  if (hasProperty(t, 'id', 'time', 'isTemped', 'order', 'endTime', 'name', 'createdAt', 'updatedAt')) {
    return (
      typeof t.id === 'string' &&
      typeof t.time === 'string' &&
      typeof t.isTemped === 'boolean' &&
      typeof t.order === 'number' &&
      typeof t.createdAt === 'string' &&
      typeof t.updatedAt === 'string' &&
      (typeof t.endTime === 'string' || t.endTime === null) &&
      (typeof t.name === 'string' || t.name === null)
    );
  }
  return false;
};

const useTimerIndex = () => {
  const [timersArray, setTimersArray] = useState<Timer[]>([]);
  const [, setTimers] = useState<Map<string, Timer>>(new Map());
  const { listTimers, updateTimer } = useTimers();

  const makeTimersArray = (timers: Map<string, Timer>) => {
    const arr = Array.from(timers.values());
    arr.sort((a, b) => {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    });
    setTimersArray(arr);
  };

  const organizeAfterDelete = useCallback(
    async (deletedOrder: number) => {
      const arr = timersArray.filter((t) => t.order > deletedOrder);
      try {
        const promises = arr.map(async (t) => {
          const nextTimer = { id: t.id, order: t.order - 1 };
          await updateTimer(nextTimer);
        });
        await Promise.all(promises);
      } catch (e) {
        console.error(e);
      }
    },
    [timersArray, updateTimer]
  );

  useEffect(() => {
    void (async () => {
      try {
        const r = await listTimers();
        if (r) {
          const arr = r.filter((t) => t !== null) as Timer[];
          const timersMap = new Map<string, Timer>();
          for (const t of arr) {
            timersMap.set(t.id, t);
          }
          setTimers(timersMap);
          makeTimersArray(timersMap);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [listTimers]);

  useEffect(() => {
    (() => {
      const client = API.graphql(graphqlOperation(onCreateTimer));
      if ('subscribe' in client) {
        client.subscribe({
          next: (data) => {
            if (isOnCreateTimer(data)) {
              const { onCreateTimer: timer } = data.value.data;
              setTimers((prev) => {
                const newMap = new Map(prev);
                if (timer) {
                  newMap.set(timer.id, timer);
                }
                makeTimersArray(newMap);
                return newMap;
              });
            } else {
              console.error('data is not onCreateTimer', data);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    })();

    (() => {
      const client = API.graphql(graphqlOperation(onUpdateTimer));
      if ('subscribe' in client) {
        client.subscribe({
          next: (data) => {
            if (isOnUpdateTimer(data)) {
              const { onUpdateTimer: timer } = data.value.data;
              setTimers((prev) => {
                const newMap = new Map(prev);
                if (timer) {
                  newMap.set(timer.id, timer);
                }
                makeTimersArray(newMap);
                return newMap;
              });
            } else {
              console.error('data is not onUpdate', data);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    })();

    (() => {
      const client = API.graphql(graphqlOperation(onDeleteTimer));
      if ('subscribe' in client) {
        client.subscribe({
          next: (data) => {
            if (isOnDeleteTimer(data)) {
              const { onDeleteTimer: timer } = data.value.data;
              setTimers((prev) => {
                const newMap = new Map(prev);
                if (timer) {
                  newMap.delete(timer.id);
                }
                makeTimersArray(newMap);
                return newMap;
              });
            } else {
              console.error('data is not onDelete', data);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    })();
  }, []);

  return { timersArray, organizeAfterDelete };
};

export default useTimerIndex;
