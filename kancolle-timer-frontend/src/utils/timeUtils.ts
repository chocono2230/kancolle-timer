export const date2AWSDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000+09:00`;
};

export const addTime = (time: Date, hhmm: string) => {
  const [hh, mm] = hhmm.split(':').map((s) => parseInt(s, 10));
  const nextTime = new Date(time.getTime());
  nextTime.setHours(nextTime.getHours() + hh);
  nextTime.setMinutes(nextTime.getMinutes() + mm);
  return nextTime;
};
