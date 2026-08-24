import AuthLayout from './components/AuthLayout';
import FormHeader from './components/FormHeader';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        <div className="p-6">
          <FormHeader
            title="SIB - Sengundhar in Business"
            subtitle="Welcome back! Sign in to continue"
          />
          <SignInForm />
        </div>
      </div>
    </AuthLayout>
  );
}
