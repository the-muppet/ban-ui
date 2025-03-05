'use client'

// src/components/auth/OAuthSignIn.tsx
import React, { JSX, useState } from 'react';
import Button from '@/app/components/ui/Button';
import '@/app/service/components/auth/AuthForms.css';
import { Github } from 'lucide-react';

type Provider = 'github'; // Add more OAuth providers as needed

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
};

const OAuthSignIn: React.FC = () => {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'github',
      displayName: 'GitHub',
      icon: <Github className="provider-icon" />
    }
    /* Add more OAuth providers here as needed */
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingProvider, setSubmittingProvider] = useState<Provider | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmittingProvider(provider);

    try {
      // In a real app, this would redirect to the OAuth provider's login page
      console.log(`Initiating OAuth login with ${provider}`);
      
      // Simulate the OAuth flow
      window.location.href = `https://example.com/oauth/${provider}`;
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      // In a real app, this would happen after the user returns from the OAuth provider
      setIsSubmitting(false);
      setSubmittingProvider(null);
    }
  };

  return (
    <div className="oauth-providers">
      {oAuthProviders.map((provider) => (
        <form
          key={provider.name}
          className="oauth-form"
          onSubmit={(e) => handleSubmit(e, provider.name)}
        >
          <input type="hidden" name="provider" value={provider.name} />
          <Button
            variant="ghost"
            type="submit"
            className="oauth-button"
            loading={isSubmitting && submittingProvider === provider.name}
            fullWidth
          >
            <span className="provider-icon-wrapper">{provider.icon}</span>
            <span className="provider-name">Sign in with {provider.displayName}</span>
          </Button>
        </form>
      ))}
    </div>
  );
};

export default OAuthSignIn;