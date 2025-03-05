'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navigation from '@/app/components/ui/Navigation';
import SearchForm from '@/app/components/ui/SearchForm';
import '@/app/styles/Home.css';

interface HomePageProps {
  title: string;
  errorMessage?: string;
  vercelLogin?: boolean;
  portalURL?: string;
  userId?: string | null;
  nav: {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
  }[];
}

export const HomePage: React.FC<HomePageProps> = ({
  title,
  errorMessage,
  vercelLogin,
  portalURL,
  userId,
  nav
}) => {
  const [searchInitialized, setSearchInitialized] = useState(false);

  useEffect(() => {
    if (vercelLogin && !searchInitialized) {
      setSearchInitialized(true);
      // Autocomplete initialization would go here
    }
  }, [vercelLogin, searchInitialized]);

  const getPortalURL = () => {
    return portalURL || 'https://mtgban-stripe-payments.vercel.app/';
  };

 
  return (
    <div className="home-container">
      <Navigation navItems={nav} vercelLogin={vercelLogin} portalURL={portalURL}/>
      <SearchForm />
      <div className="background-container">
        <div className="main-body">
            <div className="search-container">
              <form className="search-form" action="search" autoComplete="off" spellCheck="false" id="searchform">
                <input 
                  id="searchbox" 
                  className="search-input" 
                  onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)} 
                  type="text" 
                  name="q" 
                  placeholder="Quick price check" 
                  maxLength={1000} 
                  autoFocus 
                  autoCapitalize="none"
                />
              </form>
            </div>
        </div>
      </div>

      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}

      <div className="content-section">
        {vercelLogin ? (
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = getPortalURL(); }}>
            <Image src="/img/misc/login.png" alt="Login with Patreon" width={360} height={60} />
          </a>
        ) : (
          <a href="/?errmsg=logout">
            <Image src="/img/misc/logout.png" alt="Logout" width={236} height={60} />
          </a>
        )}
      </div>

      <div className="jump-section">
        Jump to &nbsp;<a href="https://mtgban.com">Magic: the Gathering</a> &nbsp;|&nbsp; <a href="https://lorcana.mtgban.com">Disney Lorcana</a>
      </div>

      <footer className="footer">
        &copy; 2019-{new Date().getFullYear()} MTGBAN Inc<br />
        <br /><hr className="footer-divider" /><br />
        Cookies may be in use to ensure correct functionality of the platform.<br />
        Content is provided for informational purpose only.<br />
      </footer>
    </div>
  );
};

export default HomePage;