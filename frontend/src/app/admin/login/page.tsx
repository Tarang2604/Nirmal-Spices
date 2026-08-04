import type { Metadata } from 'next';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login | Nirmal\'s Spices',
  description: 'Administrator sign-in for Nirmal\'s Spices console.',
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
