// src/components/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { useAuth } from '@/app/context/Authentication';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import '@/app/service/components/auth/AuthForms.css';

interface ForgotPasswordProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  allowEmail,
  redirectMethod,
  disableButton
}) => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;

      if (!email) {
        throw new Error('Please enter your email');
      }

      await resetPassword(email);
      setSuccess(`Password reset instructions sent to ${email}. Please check your email.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
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
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="slim"
            type="submit"
            className="form-submit-button"
            loading={isSubmitting}
            disabled={disableButton}
            fullWidth
          >
            Send Reset Instructions
          </Button>
        </div>
      </form>

      {/* Links Section */}
      <div className="auth-links">
        <p>
          <Link
            href="/signin/password_signin"
            className="auth-link"
          >
            Remember your password? Sign in
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
        <p>
          <Link
            href="/signin/signup"
            className="auth-link"
          >
            Don't have an account? Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;