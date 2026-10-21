import Link from 'next/link';
import AuthCard from '../../components/AuthCard';
import SignupForm from './SignupForm';

export const metadata = { title: 'Create your account — NoirFlow Client Portal' };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Enter the invite code NoirFlow sent you, then choose your login."
      footer={
        <>
          Already have an account? <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
