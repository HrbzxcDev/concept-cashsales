import { LoginForm } from '@/app/login/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
