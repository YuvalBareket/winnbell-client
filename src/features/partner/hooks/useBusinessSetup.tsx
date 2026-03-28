// src/hooks/useBusinessSetup.ts
import { useMutation } from '@tanstack/react-query';
import { setupBusinessProfile } from '../api/business.api';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hook';
import { clearBusinessSetup } from '../../../store/slices/authSlice';

export const useBusinessSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: setupBusinessProfile,
    onSuccess: () => {
      dispatch(clearBusinessSetup());
      navigate('/scan');
    },
  });
};
