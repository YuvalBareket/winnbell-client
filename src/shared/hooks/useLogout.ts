import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hook';
import { logout } from '../../store/slices/authSlice';
import { supabase } from '../lib/supabase';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return async () => {
    navigate('/');
    dispatch(logout());
    localStorage.removeItem('wasLoggedIn');
    localStorage.removeItem('install_prompt_dismissed');
    const { queryClient } = await import('../../main');
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failure doesn't affect local logout — Redux and localStorage are already cleared
    }
  };
};
