import { SyntheticEvent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

export const registerMui = (res: UseFormRegisterReturn) => {
  return {
    inputRef: res.ref,
    onChange: res.onChange,
    onBlur: res.onBlur,
    name: res.name,
  };
};

// <form onSubmit={onPromise(handleSubmit(onSubmit))}>
export function onPromise<T>(promise: (event: SyntheticEvent) => Promise<T>) {
  return (event: SyntheticEvent) => {
    if (promise) {
      promise(event).catch((error) => {
        console.error('Unexpected error', error);
      });
    }
  };
}
