import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { AuthResponse, RegisterRequest } from '../types/auth.types';
import { registerUserFn } from '../api/auth.api';
import { login } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hook';

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return useMutation<AuthResponse, AxiosError<{ message: string }>, RegisterRequest>({
    mutationFn: registerUserFn,
    onSuccess: (data) => {
      dispatch(
        login({
          user: data.user,
          token: data.token ?? '',
          refreshToken: data.refreshToken ?? null,
        }),
      );
      if (data?.user?.role === 'Business') {
        navigate('/partner/setup-business');
      } else {
        navigate('/scan');
      }
    },
    onError: (error) => {
      console.error(
        'Registration failed:',
        error.response?.data?.message || error.message,
      );
    },
  });
};
