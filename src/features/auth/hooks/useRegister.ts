import { useMutation } from '@tanstack/react-query';

import type { AuthResponse, RegisterRequest } from '../types/auth.types';
import { registerUserFn } from '../api/auth.api';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: registerUserFn,
    onSuccess: (data) => {
      dispatch(
        login({
          user: data.user,
          token: data.token ?? '',
        }),
      );
      if (data?.user?.role === 'Business') {
        // 3. Move to Step 2: Business Info
        navigate('/partner/setup-business');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      // Axios errors usually hide the message in error.response.data
      console.error(
        'Registration failed:',
        error.response?.data?.message || error.message,
      );
    },
  });
};
