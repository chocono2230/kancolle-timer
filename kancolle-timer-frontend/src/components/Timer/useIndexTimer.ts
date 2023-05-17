import { useState, useEffect, useCallback } from 'react';

import { Timer, OnCreateTimerSubscription, OnUpdateTimerSubscription, OnDeleteTimerSubscription } from '../../API';
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLSubscription } from '@aws-amplify/api';
import useTimers from '../../hook/timer.hook';
// amplifyで自動生成されたサブスクリプションのクエリをimport
import { onCreateTimer, onDeleteTimer, onUpdateTimer } from '../../graphql/subscriptions';

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

  const changeTimerOrder = useCallback(
    (oldIndex: number, newIndex: number) => {
      const step = oldIndex < newIndex ? 1 : -1;
      const promises: ReturnType<typeof updateTimer>[] = [];
      setTimers((prev) => {
        // ローカルでの並び替え
        const newMap = new Map(prev);
        for (let i = oldIndex; i !== newIndex; i += step) {
          const nextIndex = i + step;
          newMap.set(timersArray[nextIndex].id, { ...timersArray[nextIndex], order: timersArray[i].order });
        }
        newMap.set(timersArray[oldIndex].id, { ...timersArray[oldIndex], order: timersArray[newIndex].order });
        makeTimersArray(newMap);
        // 並び替えたものを更新するプロミスを作成
        for (let i = oldIndex; i !== newIndex + step; i += step) {
          const t = newMap.get(timersArray[i].id);
          if (t) promises.push(updateTimer({ id: t.id, order: t.order }));
        }
        return newMap;
      });
      // サーバーに更新を送信
      void Promise.all(promises);
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
    const subCreate = API.graphql<GraphQLSubscription<OnCreateTimerSubscription>>(
      graphqlOperation(onCreateTimer)
    ).subscribe({
      next: (data) => {
        if (data.value.data) {
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
          console.error('value.date is undefined', data);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    const subUpdate = API.graphql<GraphQLSubscription<OnUpdateTimerSubscription>>(
      graphqlOperation(onUpdateTimer)
    ).subscribe({
      next: (data) => {
        if (data.value.data) {
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
          console.error('value.date is undefined', data);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    const subDelete = API.graphql<GraphQLSubscription<OnDeleteTimerSubscription>>(
      graphqlOperation(onDeleteTimer)
    ).subscribe({
      next: (data) => {
        if (data.value.data) {
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
          console.error('value.date is undefined', data);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    return () => {
      subCreate.unsubscribe();
      subUpdate.unsubscribe();
      subDelete.unsubscribe();
    };
  }, []);

  return { timersArray, organizeAfterDelete, changeTimerOrder };
};

export default useTimerIndex;
