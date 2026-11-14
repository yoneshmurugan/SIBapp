import AuthLayout from './components/AuthLayout';
import FormHeader from './components/FormHeader';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <FormHeader
          title="Member Sign In"
          subtitle="Welcome back! Sign in to access your portal"
        />
        <SignInForm />
      </div>
    </AuthLayout>
  );
}
