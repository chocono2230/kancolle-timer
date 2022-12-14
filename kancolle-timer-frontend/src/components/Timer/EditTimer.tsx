/* eslint-disable @typescript-eslint/no-misused-promises */
import { useForm } from 'react-hook-form';

import { TextField, Button, Box } from '@mui/material';

import { CreateTimerInput } from '../../API';

import useTimer from '../../hook/Timer.hook';
import registerMui from '../../utils/registerMui';

type OmitFormInputTypes = 'id' | 'order' | 'endTime';
type FormInputs = Omit<CreateTimerInput, OmitFormInputTypes> & { isStart?: boolean };

type Props = {
  timerListSize: number;
};

const UserEdit = ({ timerListSize }: Props) => {
  const { register, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      time: '',
      isTemped: false,
      isStart: false,
      name: null,
    },
  });
  const { createTimer } = useTimer();

  const validateTime = (time: string) => {
    const reg = new RegExp(/^([0-9]{2}:[0-9]{2})$/);
    if (reg.test(time) === false) {
      return false;
    }
    const mm = time.split(':')[1];
    return Number(mm) <= 59;
  };

  const onSubmit = async (data: FormInputs) => {
    if (validateTime(data.time) === false) {
      return;
    }
    // endTimeの設定を、data.isStartによって定義する

    delete data.isStart;
    const awsTime = data.time + ':00.000';
    const endTime = null;
    const arg: CreateTimerInput = { ...data, time: awsTime, order: timerListSize, endTime };
    try {
      await createTimer(arg);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexFlow: 'column', maxWidth: '500px' }}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              label='Name'
              type='string'
              InputLabelProps={{ shrink: true }}
              {...registerMui(
                register('name', {
                  maxLength: 30,
                })
              )}
            />
            <TextField
              label='Time'
              type='string'
              InputLabelProps={{ shrink: true }}
              {...registerMui(
                register('time', {
                  maxLength: 6,
                })
              )}
            />
          </Box>
          <Button variant='contained' color='primary' type='submit'>
            Submit
          </Button>
        </Box>
      </form>
    </>
  );
};

export default UserEdit;
