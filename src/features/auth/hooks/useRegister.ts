import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { AuthResponse, RegisterRequest } from '../types/auth.types';
import { registerUserFn } from '../api/auth.api';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useMutation<AuthResponse, AxiosError<{ message: string }>, RegisterRequest>({
    mutationFn: registerUserFn,
    onSuccess: (data) => {
      dispatch(
        login({
          user: data.user,
          token: data.token ?? '',
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
