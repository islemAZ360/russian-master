"use client";
import React from 'react';
// FIX: الإشارة للمجلد الفرعي admin
import AdminDashboard from '@/components/features/admin/AdminDashboard';
import { useAuth } from '@/context/AuthContext'; // استخدام @ للمسار

export default function AdminView() {
  const { user, userData } = useAuth();
  return <AdminDashboard currentUser={user} userData={userData} />;
}