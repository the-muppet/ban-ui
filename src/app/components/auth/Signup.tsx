// src/components/auth/SignUp.tsx
import React, { useState } from 'react';
import { useAuth } from '@/app/context/Authentication';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import '@/app/service/components/auth/AuthForms.css';

interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

const SignUp: React.FC<SignUpProps> = ({ 
  allowEmail, 
  redirectMethod 
}) => {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      await signUp(email, password);
      
      if (redirectMethod === 'client') {
        window.location.href = '/';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form
        noValidate={true}
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <div className="form-fields">
          <div className="form-field-group">
            {/* Email Input */}
            <div className="form-field">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email
              </label>
              <div className={`input-wrapper ${focusedInput === 'email' ? 'focused' : ''}`}>
                <input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  name="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="form-input"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
                {focusedInput === 'email' && <div className="input-glow" />}
              </div>
            </div>

            {/* Password Input */}
            <div className="form-field">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>
              <div className={`input-wrapper ${focusedInput === 'password' ? 'focused' : ''}`}>
                <input
                  id="password"
                  placeholder="Password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className="form-input"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                {focusedInput === 'password' && <div className="input-glow" />}
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="slim"
            type="submit"
            className="form-submit-button"
            loading={isSubmitting}
            fullWidth
          >
            Sign up
          </Button>
        </div>
      </form>

      {/* Links Section */}
      <div className="auth-links">
        <p>
          Already have an account?
        </p>
        <p>
          <Link
            href="/signin/password_signin"
            className="auth-link"
          >
            Sign in with email and password
          </Link>
        </p>
        {allowEmail && (
          <p>
            <Link
              href="/signin/email_signin"
              className="auth-link"
            >
              Sign in via magic link
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUp;