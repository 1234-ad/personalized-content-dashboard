'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Dashboard from '@/components/Dashboard';
import { loadUserPreferences } from '@/lib/store/slices/userSlice';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserPreferences());
  }, [dispatch]);

  return <Dashboard />;
}