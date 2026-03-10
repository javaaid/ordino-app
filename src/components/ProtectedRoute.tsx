import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePOS } from '../context/POSContext';

export const ProtectedRoute: React.FC = () => {
  const { user } = usePOS();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
