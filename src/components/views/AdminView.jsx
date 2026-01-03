"use client";
import React from 'react';
import AdminDashboard from '../features/AdminDashboard';
import { useAuth } from '../../context/AuthContext';

export default function AdminView() {
  const { user, userData } = useAuth();
  return <AdminDashboard currentUser={user} userData={userData} />;
}