import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

type Props = {
  msg: string;
  isOpen: boolean;
  doOk: () => Promise<void> | void;
  doCancel: () => void;
  okMsg?: string;
  cancelMsg?: string;
  irreversibleFlag?: boolean;
};

const GenericDialog: React.FC<Props> = (props) => {
  const { msg, isOpen, doOk, doCancel, okMsg, cancelMsg, irreversibleFlag } = props;
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <Dialog open={open} keepMounted onClose={() => doCancel()}>
        <DialogContent>{msg}</DialogContent>
        <DialogActions>
          <Button onClick={() => void doOk()} color='primary' style={irreversibleFlag ? { color: '#EF5350' } : {}}>
            {okMsg ? okMsg : 'OK'}
          </Button>
          <Button onClick={() => doCancel()} color='primary'>
            {cancelMsg ? cancelMsg : 'キャンセル'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GenericDialog;
