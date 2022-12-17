import EditTimer from './EditTimer';
import ShowTimer from './ShowTimer';
import useTimerIndex from './useIndexTimer';

const Timer = () => {
  const { timers } = useTimerIndex();
  return (
    <>
      {timers &&
        timers.map((t) => {
          return <ShowTimer key={t.id} timer={t} />;
        })}
      <EditTimer timerListSize={timers.length} />
    </>
  );
};
export default Timer;
