// src/hooks/useBusinessSetup.ts
import { useMutation } from '@tanstack/react-query';
import { setupBusinessProfile } from '../api/business.api';
import { useNavigate } from 'react-router-dom';

export const useBusinessSetup = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: setupBusinessProfile,
    onSuccess: () => {
      navigate('/');
    },
  });
};
