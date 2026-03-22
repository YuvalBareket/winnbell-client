import { useMutation } from '@tanstack/react-query';
import { loginUserFn } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

import type { AuthResponse, LoginRequest } from '../types/auth.types';
import { useAppDispatch } from '../../../store/hook';
import { login } from '../../../store/slices/authSlice';

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: loginUserFn,
    onSuccess: (data) => {
      // 1. Update Redux (Persist middleware handles the saving automatically)
      dispatch(
        login({
          user: data.user,
          token: data.token ?? '',
        }),
      );

      // 2. Redirect
      navigate('/');
    },
    onError: (error: any) => {
      console.error('Login failed:', error.response?.data?.message);
    },
  });
};
