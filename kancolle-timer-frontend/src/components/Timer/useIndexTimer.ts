import { useState, useEffect } from 'react';

import { Timer } from '../../API';
import { API, graphqlOperation } from 'aws-amplify';
import useTimers from '../../hook/timer.hook';
// amplifyで自動生成されたサブスクリプションのクエリをimport
import { onCreateTimer, onDeleteTimer, onUpdateTimer } from '../../graphql/subscriptions';

const useTimerIndex = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const { listTimers } = useTimers();

  const callSetTimer = async () => {
    try {
      const r = await listTimers();
      if (r) {
        const arr = r.filter((t) => t !== null) as Timer[];
        arr.sort((a, b) => {
          if (a.order < b.order) return -1;
          if (a.order > b.order) return 1;
          return 0;
        });
        setTimers(arr);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void callSetTimer();
  }, []);

  useEffect(() => {
    (() => {
      const client = API.graphql(graphqlOperation(onCreateTimer));
      if ('subscribe' in client) {
        client.subscribe({
          next: (data) => {
            console.log('onCreate', data);
            void callSetTimer();
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
            console.log('onDelete', data);
            void callSetTimer();
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
            console.log('onUpdate', data);
            void callSetTimer();
          },
          error: (error) => {
            console.error(error);
          },
        });
      }
    })();
  }, []);

  return { timers };
};

export default useTimerIndex;
