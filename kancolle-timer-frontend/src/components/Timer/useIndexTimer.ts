import { useState, useRef, useEffect, useCallback } from 'react';

import { Timer, OnCreateTimerSubscription, OnUpdateTimerSubscription, OnDeleteTimerSubscription } from '../../API';
import { API, graphqlOperation, Hub } from 'aws-amplify';
import { CONNECTION_STATE_CHANGE, ConnectionState } from '@aws-amplify/pubsub';
import { GraphQLSubscription } from '@aws-amplify/api';
// amplifyで自動生成されたサブスクリプションのクエリをimport
import { onCreateTimer, onDeleteTimer, onUpdateTimer } from '../../graphql/subscriptions';
import useTimers from '../../hook/timer.hook';
import { hasProperty } from '../../utils/typeUtils';

const useTimerIndex = () => {
  const [timersArray, setTimersArray] = useState<Timer[]>([]);
  const [, setTimers] = useState<Map<string, Timer>>(new Map());
  const prevRequestTime = useRef<number>(0);
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

  const upwardOrder = useCallback(
    (targetIndex: number) => {
      if (targetIndex === 0) return;
      const target = timersArray[targetIndex];
      const prev = timersArray[targetIndex - 1];
      const promises = [
        updateTimer({ id: target.id, order: prev.order }),
        updateTimer({ id: prev.id, order: target.order }),
      ];
      setTimers((pMap) => {
        const newMap = new Map(pMap);
        newMap.set(target.id, { ...target, order: prev.order });
        newMap.set(prev.id, { ...prev, order: target.order });
        makeTimersArray(newMap);
        return newMap;
      });
      void Promise.all(promises);
    },
    [timersArray, updateTimer]
  );

  const downwardOrder = useCallback(
    (targetIndex: number) => {
      if (targetIndex === timersArray.length - 1) return;
      const target = timersArray[targetIndex];
      const next = timersArray[targetIndex + 1];
      const promises = [
        updateTimer({ id: target.id, order: next.order }),
        updateTimer({ id: next.id, order: target.order }),
      ];
      setTimers((pMap) => {
        const newMap = new Map(pMap);
        newMap.set(target.id, { ...target, order: next.order });
        newMap.set(next.id, { ...next, order: target.order });
        makeTimersArray(newMap);
        return newMap;
      });
      void Promise.all(promises);
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
    const listenStop = Hub.listen('api', (inputdata) => {
      const { payload } = inputdata;
      if (payload.event !== CONNECTION_STATE_CHANGE) return;
      const data = payload.data as unknown;
      if (!hasProperty(data, 'connectionState') || typeof data.connectionState !== 'string') return;
      if (data.connectionState !== ConnectionState.Connected) return;
      const now = Date.now() / 1000;
      if (now - prevRequestTime.current <= 30) return;
      // 以下 state === 'connected' かつ (初回 または 30秒以上前にリクエストを送っていた)場合
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
      prevRequestTime.current = now;
    });

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
      listenStop();
      subCreate.unsubscribe();
      subUpdate.unsubscribe();
      subDelete.unsubscribe();
    };
  }, [listTimers]);

  return { timersArray, organizeAfterDelete, changeTimerOrder, upwardOrder, downwardOrder };
};

export default useTimerIndex;
