// src/components/features/Sleepers.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './Sleepers.css';

export interface CardMetadata {
  id: string;
  name: string;
  setCode: string;
  setName: string;
  imageURL: string;
  searchURL: string;
  title: string;
  keyrune?: string;
  reserved?: boolean;
  stocks?: boolean;
  sypList?: boolean;
}

export interface EditionInfo {
  name: string;
  keyrune: string;
}

interface SleepersProps {
  title: string;
  subtitle?: string;
  errorMessage?: string;
  infoMessage?: string;
  sleepersKeys?: string[];
  sleepersColors?: string[];
  sleepers?: Record<string, string[]>;
  metadata?: Record<string, CardMetadata>;
  sellerKeys?: string[];
  vendorKeys?: string[];
  editions?: string[];
  editionsMap?: Record<string, EditionInfo>;
  patreonLogin?: boolean;
  onSavePreferences?: (preferences: {
    sellers: string[];
    vendors: string[];
    editions: string[];
  }) => void;
}

const Sleepers: React.FC<SleepersProps> = ({
  title,
  subtitle = "Index",
  errorMessage = "",
  infoMessage = "",
  sleepersKeys = [],
  sleepersColors = [],
  sleepers = {},
  metadata = {},
  sellerKeys = [],
  vendorKeys = [],
  editions = [],
  editionsMap = {},
  patreonLogin = false,
  onSavePreferences
}) => {
  const [selectedSellers, setSelectedSellers] = useState<Record<string, boolean>>({});
  const [selectedVendors, setSelectedVendors] = useState<Record<string, boolean>>({});
  const [selectedEditions, setSelectedEditions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize from localStorage or cookies if needed
    const loadPreferences = () => {
      try {
        const sellersStr = localStorage.getItem('SleepersSellersList');
        const vendorsStr = localStorage.getItem('SleepersVendorsList');
        const editionsStr = localStorage.getItem('SleepersEditionList');
        
        if (sellersStr) setSelectedSellers(JSON.parse(sellersStr));
        if (vendorsStr) setSelectedVendors(JSON.parse(vendorsStr));
        if (editionsStr) setSelectedEditions(JSON.parse(editionsStr));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  const toggleSeller = (key: string) => {
    setSelectedSellers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleVendor = (key: string) => {
    setSelectedVendors(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleEdition = (key: string) => {
    setSelectedEditions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearSelections = (type: 'sellers' | 'vendors' | 'editions') => {
    if (type === 'sellers') setSelectedSellers({});
    if (type === 'vendors') setSelectedVendors({});
    if (type === 'editions') setSelectedEditions({});
  };

  const selectAll = (type: 'sellers' | 'vendors' | 'editions') => {
    if (type === 'sellers') {
      const allSelected: Record<string, boolean> = {};
      sellerKeys.forEach(key => {
        allSelected[key] = true;
      });
      setSelectedSellers(allSelected);
    } else if (type === 'vendors') {
      const allSelected: Record<string, boolean> = {};
      vendorKeys.forEach(key => {
        allSelected[key] = true;
      });
      setSelectedVendors(allSelected);
    } else if (type === 'editions') {
      const allSelected: Record<string, boolean> = {};
      editions.forEach(key => {
        allSelected[key] = true;
      });
      setSelectedEditions(allSelected);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('SleepersSellersList', JSON.stringify(selectedSellers));
      localStorage.setItem('SleepersVendorsList', JSON.stringify(selectedVendors));
      localStorage.setItem('SleepersEditionList', JSON.stringify(selectedEditions));
      
      if (onSavePreferences) {
        const selectedSellerKeys = Object.keys(selectedSellers).filter(key => selectedSellers[key]);
        const selectedVendorKeys = Object.keys(selectedVendors).filter(key => selectedVendors[key]);
        const selectedEditionKeys = Object.keys(selectedEditions).filter(key => selectedEditions[key]);
        
        onSavePreferences({
          sellers: selectedSellerKeys,
          vendors: selectedVendorKeys,
          editions: selectedEditionKeys
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const getScraperName = (key: string): string => {
    // This is a placeholder - you would need to implement proper scraper name mapping
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  const renderIndex = () => (
    <div className="sleepers-index">
      <h1>Welcome to {title}</h1>
      <div className="indent" style={{ maxWidth: '85%' }}>
        <br />
        <h3>
          <ul className="indent">
            <li><Link href="?page=bulk">Bulk Me Up</Link></li>
            <li><Link href="?page=reprint">Long Time No Reprint</Link></li>
            <li><Link href="?page=mismatch">Market Mismatch</Link></li>
            <li><Link href="?page=options">Options</Link></li>
          </ul>
        </h3>
        <br />

        <hr className="divider" />
        <br />

        <h2>Instructions</h2>
        <p className="indent">
          This page offers a set of tools aimed at identifying interesting cards according to different point of views, as explained below. <br />
          They are categorized as "sleepers" because the market is apparently "sleeping" on them, and it has not been catching up on them yet. <br />
          They are presented on a S-F tiered scale, the higher the more interesting results!
        </p>
        <ul className="indent">
          <li>
            <b>Bulk Me Up</b><br />
            Show a set of cards that deviate considerably from the set average, from the last 5 years. Sometimes you may find unexpected gems!
          </li>
          <li>
            <b>Long Time No Reprint</b><br />
            Display cards that haven't received a reprint in over two years. This is done by taking into account price, and excluding any bulk card, as well as Reserve List and other funny stuff.
          </li>
          <li>
            <b>Market Mismatch</b><br />
            These cards have a higher buylist price than what market is selling them at, or they are simply priced below TCG Low.
          </li>
        </ul>
      </div>
    </div>
  );

  const renderOptions = () => (
    <div className="sleepers-options">
      <br />
      <div className="indent">
        <h2>Vendors list</h2>
        <p>Select which sellers or vendors you <b>don't</b> want to display in your sleep(ers).</p>
        <br />

        <div className="options-actions">
          <button 
            className="btn warning" 
            onClick={() => {
              clearSelections('sellers');
              clearSelections('vendors');
            }}
          >
            <b>CLEAR</b>
          </button>
          <button className="btn success" onClick={() => selectAll('sellers')}>
            <b>SELECT ALL</b>
          </button>
          <button 
            className="btn success" 
            onClick={() => {
              savePreferences();
              window.location.href = '/sleepers';
            }}
          >
            <b>SAVE</b>
          </button>
        </div>
      </div>

      <br />
      <div className="indent options-row">
        <div className="options-column" id="sellers">
          <h3>Sellers</h3>
          {sellerKeys.map(key => (
            <div key={`seller-${key}`} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`s${key}`} 
                name={key}
                checked={!!selectedSellers[key]}
                onChange={() => toggleSeller(key)}
              />
              <label htmlFor={`s${key}`}>
                {getScraperName(key)}
              </label>
            </div>
          ))}
        </div>
        <div className="options-column" id="vendors">
          <h3>Vendors</h3>
          {vendorKeys.map(key => (
            <div key={`vendor-${key}`} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`v${key}`} 
                name={key}
                checked={!!selectedVendors[key]}
                onChange={() => toggleVendor(key)} 
              />
              <label htmlFor={`v${key}`}>
                {getScraperName(key)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <br />
      <div className="indent">
        <h2>Edition list</h2>
        <p>Select which editions you <b>don't</b> want to display in your sleep(ers).</p>
        <br />

        <div className="options-actions">
          <button className="btn warning" onClick={() => clearSelections('editions')}>
            <b>CLEAR</b>
          </button>
          <button className="btn success" onClick={() => selectAll('editions')}>
            <b>SELECT ALL</b>
          </button>
          <button 
            className="btn success" 
            onClick={() => {
              savePreferences();
              window.location.href = '/sleepers';
            }}
          >
            <b>SAVE</b>
          </button>
        </div>
      </div>

      <div className="indent editions-grid" id="editions">
        {editions.map((key, i) => {
          const edition = editionsMap[key];
          if (!edition) return null;
          
          return (
            <div key={`edition-${key}`} className="checkbox-item">
              <input 
                type="checkbox" 
                id={key} 
                name={key}
                checked={!!selectedEditions[key]}
                onChange={() => toggleEdition(key)}
              />
              <label htmlFor={key}>
                <i className={`ss ss-${edition.keyrune} ss-2x ss-fw`}></i>
                {edition.name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTieredCards = () => (
    <div className="sleepers-tiers">
      <div className="indent" style={{ maxWidth: '85%' }}>
        <table className="tiers">
          <tbody>
            {sleepersKeys.map((letter, i) => {
              const bgColor = sleepersColors[i];
              const cardIds = sleepers[letter] || [];
              
              return (
                <tr key={letter} className="tiers">
                  <td className="tier-letter" style={{ backgroundColor: bgColor }}>
                    {letter}
                  </td>
                  <td className="tier-cards">
                    <div className="tier-cards-container">
                      {cardIds.map(cardId => {
                        const card = metadata[cardId];
                        if (!card) return null;
                        
                        return (
                          <Link key={cardId} href={card.searchURL} className="card-link">
                            <span className="small-hidden-text" aria-hidden="true">
                              {card.name}
                            </span>
                            <img 
                              loading="lazy" 
                              className="card-image"
                              src={card.imageURL} 
                              width={146} 
                              height={204} 
                              alt={card.name}
                              title={`${card.name} [${card.title}]`}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <br />
    </div>
  );

  return (
    <div className="sleepers-container">
      {errorMessage ? (
        <h1 className="error-message">{errorMessage}</h1>
      ) : subtitle === "Index" ? (
        renderIndex()
      ) : subtitle === "Options" ? (
        renderOptions()
      ) : (
        renderTieredCards()
      )}
      
      {infoMessage && (
        <h2><p className="indent info-message">{infoMessage}</p></h2>
      )}
    </div>
  );
};

export default Sleepers;