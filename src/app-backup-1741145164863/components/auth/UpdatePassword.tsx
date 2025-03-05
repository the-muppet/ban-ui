// src/components/auth/UpdatePassword.tsx
import React, { useState } from 'react';
import { useAuth } from '@/app/context/Authentication';
import Button from '@/app/components/ui/Button';
import '@/app/service/components/auth/AuthForms.css';

interface UpdatePasswordProps {
  redirectMethod: string;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({
  redirectMethod
}) => {
  const { updatePassword } = useAuth();
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
      const password = formData.get('password') as string;
      const passwordConfirm = formData.get('passwordConfirm') as string;

      if (!password || !passwordConfirm) {
        throw new Error('Please enter both password fields');
      }

      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }

      await updatePassword(password, passwordConfirm);
      setSuccess('Password has been updated successfully');

      // Handle redirect - in a real app this might redirect to account page
      if (redirectMethod === 'client') {
        setTimeout(() => {
          window.location.href = '/account';
        }, 2000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while updating the password');
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
            {/* New Password Input */}
            <div className="form-field">
              <label
                htmlFor="password"
                className="form-label"
              >
                New Password
              </label>
              <div className={`input-wrapper ${focusedInput === 'password' ? 'focused' : ''}`}>
                <input
                  id="password"
                  placeholder="New Password"
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

            {/* Confirm Password Input */}
            <div className="form-field">
              <label
                htmlFor="passwordConfirm"
                className="form-label"
              >
                Confirm New Password
              </label>
              <div className={`input-wrapper ${focusedInput === 'passwordConfirm' ? 'focused' : ''}`}>
                <input
                  id="passwordConfirm"
                  placeholder="Confirm Password"
                  type="password"
                  name="passwordConfirm"
                  autoComplete="new-password"
                  className="form-input"
                  onFocus={() => setFocusedInput('passwordConfirm')}
                  onBlur={() => setFocusedInput(null)}
                />
                {focusedInput === 'passwordConfirm' && <div className="input-glow" />}
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
            fullWidth
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;