import { useMutation } from '@tanstack/react-query';
import { loginUserFn } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

import type { AuthResponse, LoginRequest } from '../types/auth.types';
import { useAppDispatch } from '../../../store/hook';
import { login } from '../../../store/slices/authSlice';

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, LoginRequest>({
    mutationFn: loginUserFn,
    onSuccess: (data) => {
      dispatch(
        login({
          user: data.user,
          token: data.token ?? '',
        }),
      );
      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error.response?.data?.message);
    },
  });
};
