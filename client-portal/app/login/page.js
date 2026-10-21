import Link from 'next/link';
import AuthCard from '../../components/AuthCard';
import LoginForm from './LoginForm';

export const metadata = { title: 'Sign in — NoirFlow Client Portal' };

export default function LoginPage({ searchParams }) {
  const linkExpired = searchParams?.error === 'link_expired';

  return (
    <AuthCard
      title="Sign in to NoirFlow"
      subtitle="Track your services, results and requests in one place."
      footer={
        <>
          New client? <Link href="/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Create your account with your invite code</Link>
        </>
      }
    >
      {linkExpired && (
        <p className="mb-4 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
          That link has expired. Sign in, or request a new password reset.
        </p>
      )}
      <LoginForm />
    </AuthCard>
  );
}
