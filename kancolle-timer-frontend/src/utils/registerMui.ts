import { UseFormRegisterReturn } from 'react-hook-form';

const registerMui = (res: UseFormRegisterReturn) => {
  return {
    inputRef: res.ref,
    onChange: res.onChange,
    onBlur: res.onBlur,
    name: res.name,
  };
};

export default registerMui;
