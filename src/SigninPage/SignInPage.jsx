import AuthLayout from './components/AuthLayout';
import FormHeader from './components/FormHeader';
import SignInForm from './SignInForm';
import { ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <FormHeader
          title="Member Sign In"
          subtitle="Welcome back! Sign in to access your portal"
        />
        <SignInForm />

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <ShieldCheck size={14} className="text-amber-500 dark:text-amber-400" />
          <span>Protected by SIB Secure Authentication</span>
        </div>
      </div>
    </AuthLayout>
  );
}
