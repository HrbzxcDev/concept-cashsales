import { LoginForm } from '@/components/ui/login-form';

export default function LoginDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Login Form Demo
          </h1>
          <p className="text-muted-foreground">
            This is a demonstration of the login form component built with shadcn/ui
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Demo Credentials</h2>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Use these credentials to test the login:</p>
              <div className="space-y-2">
                <div>
                  <strong>Email:</strong> admin@example.com
                </div>
                <div>
                  <strong>Password:</strong> password123
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted rounded text-xs">
                <strong>Note:</strong> This is a demo with mock authentication. In a real app, these would be validated against a backend service.
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Form validation with Zod</li>
                <li>• Password visibility toggle</li>
                <li>• Loading states</li>
                <li>• Toast notifications</li>
                <li>• Social login buttons (UI only)</li>
                <li>• Responsive design</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
          </div>
          
          <div>
            <LoginForm redirectTo="/dashboard" />
          </div>
        </div>
      </div>
    </div>
  );
}
