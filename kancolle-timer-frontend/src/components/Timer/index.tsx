import { useState } from 'react';
import { Box, Container, List, Switch, FormControlLabel } from '@mui/material';

import EditTimer from './EditTimer';
import ShowTimer from './ShowTimer';
import useTimerIndex from './useIndexTimer';

const Timer = () => {
  const [editOrderFlag, setEditOrderFlag] = useState(false);
  const { timersArray, organizeAfterDelete, upwardOrder, downwardOrder } = useTimerIndex();

  const handleChange = () => {
    setEditOrderFlag(!editOrderFlag);
  };

  return (
    <>
      <Container maxWidth='sm'>
        <FormControlLabel control={<Switch checked={editOrderFlag} onChange={handleChange} />} label='順序変更モード' />
        <Box sx={{ minWidth: '450px' }}>
          <List>
            {timersArray &&
              timersArray.map((t) => {
                return (
                  <ShowTimer
                    key={t.id}
                    timer={t}
                    editOrderFlag={editOrderFlag}
                    upwardFlag={t.order !== 0}
                    downwardFlag={t.order !== timersArray.length - 1}
                    upwardUpdate={() => upwardOrder(t.order)}
                    downwardUpdate={() => downwardOrder(t.order)}
                    organizeAfterDelete={organizeAfterDelete}
                  />
                );
              })}
          </List>
          <Box sx={{ m: 2 }}>
            <EditTimer timerListSize={timersArray.length} />
          </Box>
        </Box>
      </Container>
    </>
  );
};
export default Timer;
