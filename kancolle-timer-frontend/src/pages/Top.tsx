import { useState } from 'react';
import { ToggleButton } from '@mui/material';
import Timer from '../components/Timer';

const Top = () => {
  const [flg, setFlg] = useState(false);
  return (
    <>
      <ToggleButton value='check' selected={flg} onChange={() => setFlg(!flg)}>
        {flg ? 'ON' : 'OFF'}
      </ToggleButton>
      <br />
      {!flg && <Timer />}
    </>
  );
};

export default Top;
