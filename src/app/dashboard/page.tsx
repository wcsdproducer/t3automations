import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { redirect } from 'next/navigation';

export default function Dashboard() {
  // This page is no longer used directly.
  // We will redirect to the login page if someone tries to access it.
  // The actual dashboard will be at /dashboard/[userId]
  redirect('/login');
}
