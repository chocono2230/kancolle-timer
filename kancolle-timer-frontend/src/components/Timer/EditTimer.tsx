/* eslint-disable @typescript-eslint/no-misused-promises */
import { useForm, Controller } from 'react-hook-form';

import { TextField, Button, Box, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

import { CreateTimerInput } from '../../API';

import useTimer from '../../hook/timer.hook';
import registerMui from '../../utils/registerMui';
import { date2AWSDateTime, addTime } from '../../utils/timeUtils';

type OmitFormInputTypes = 'id' | 'order' | 'endTime';
type FormInputs = Omit<CreateTimerInput, OmitFormInputTypes> & { isStart?: boolean };

type Props = {
  timerListSize: number;
};

const UserEdit = ({ timerListSize }: Props) => {
  const { register, handleSubmit, control } = useForm<FormInputs>({
    defaultValues: {
      time: '',
      isTemped: true,
      isStart: true,
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
    // 開始しない、かつ、一時用のタイマーは、登録しない
    if (data.isStart === false && data.isTemped === true) {
      return;
    }
    // endTimeの設定を、data.isStartによって定義する
    // #3では対応しない
    const endTime = data.isStart ? date2AWSDateTime(addTime(new Date(), data.time)) : null;
    delete data.isStart;
    const arg: CreateTimerInput = { ...data, order: timerListSize, endTime };
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
                  required: true,
                  maxLength: 6,
                })
              )}
            />
            <FormGroup>
              <Controller
                name='isStart'
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <>
                    <FormControlLabel {...field} label='開始' control={<Checkbox defaultChecked />} />
                  </>
                )}
              />
            </FormGroup>
            <FormGroup>
              <Controller
                name='isTemped'
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <>
                    <FormControlLabel {...field} label='削除' control={<Checkbox defaultChecked />} />
                  </>
                )}
              />
            </FormGroup>
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
