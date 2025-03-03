'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/app/components/ui/Navigation';

interface ArbitEntry {
  CardId: string;
  InventoryEntry: {
    Conditions: string;
    Price: number;
    Quantity: number;
    URL: string;
  };
  BuylistEntry: {
    BuyPrice: number;
    PriceRatio: number;
    Quantity: number;
    URL: string;
  };
  ReferenceEntry: {
    Price: number;
    URL: string;
  };
  Spread: number;
  Difference: number;
  Profitability: number;
}

interface ArbitData {
  Name: string;
  Key: string;
  Arbit: ArbitEntry[];
  HasNoConds: boolean;
  HasNoQty: boolean;
  HasNoPrice: boolean;
  HasNoCredit: boolean;
  HasNoArbit: boolean;
  CreditMultiplier: number;
  SussyList?: Record<string, number>;
}

interface ArbitPageProps {
  title: string;
  subtitle?: string;
  errorMessage?: string;
  infoMessage?: string;
  nav: {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
  }[];
  extraNav?: {
    name: string;
    link: string;
  }[];
  scraperShort?: string;
  sortOption?: string;
  arbitFilters?: Record<string, boolean>;
  arbitOptKeys?: string[];
  arbitOptConfig?: Record<string, { Title: string; ArbitOnly?: boolean; GlobalOnly?: boolean; NoSealed?: boolean; SealedOnly?: boolean; BetaFlag?: boolean }>;
  arb?: ArbitData[];
  canShowAll?: boolean;
  largeTable?: boolean;
  isSealed?: boolean;
  globalMode?: boolean;
  reverseMode?: boolean;
  hasReserved?: boolean;
  hasStocks?: boolean;
  hasSypList?: boolean;
  hasAffiliate?: boolean;
  metadata?: Record<string, any>;
  currentIndex?: number;
  prevIndex?: number;
  nextIndex?: number;
  totalIndex?: number;
}

const ArbitPage: React.FC<ArbitPageProps> = ({
  title,
  subtitle = '',
  errorMessage = '',
  infoMessage = '',
  nav,
  extraNav = [],
  scraperShort = '',
  sortOption = '',
  arbitFilters = {},
  arbitOptKeys = [],
  arbitOptConfig = {},
  arb = [],
  canShowAll = false,
  largeTable = false,
  isSealed = false,
  globalMode = false,
  reverseMode = false,
  hasReserved = false,
  hasStocks = false,
  hasSypList = false,
  hasAffiliate = false,
  metadata = {},
  currentIndex = 0,
  prevIndex = 0,
  nextIndex = 0,
  totalIndex = 0
}) => {
  const [hoverImageSrc, setHoverImageSrc] = useState<string>('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastSoldCard, setLastSoldCard] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize the page
    setInitialLoad(false);
    
    // Reset hover image when we navigate away
    return () => {
      setHoverImageSrc('');
    };
  }, []);
  
  const handleMouseOut = () => {
    setHoverImageSrc('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  };
  
  const copyToClipboard = async (text: string) => {
    // Get only the first part of split text (for cards that have split names)
    const cleanText = text.split(' // ')[0];
    
    try {
      await navigator.clipboard.writeText(cleanText);
      // Visual feedback could be implemented here
      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  };
  
  const getLastSold = async (uuid: string) => {
    if (lastSoldCard === uuid) return;
    
    try {
      const response = await fetch(`/api/tcgplayer/lastsold/${uuid}`);
      if (response.ok) {
        setLastSoldCard(uuid);
        // In a real implementation, you would then update the DOM with this data
      }
    } catch (error) {
      console.error('Error fetching last sold data:', error);
    }
  };
  
  // Helper to check if a card is in a sussy list
  const isSussy = (sussyList: Record<string, number> | undefined, cardId: string) => {
    return sussyList && sussyList[cardId] !== undefined;
  };
  
  // Render content based on current state
  const renderContent = () => {
    if (errorMessage) {
      return <h1 className="error-message">{errorMessage}</h1>;
    }
    
    if (subtitle === "Options") {
      return renderOptionsPage();
    }
    
    if (subtitle === "") {
      return renderLandingPage();
    }
    
    return renderArbitrageData();
  };
  
  // Render options page for customizing arbitrage settings
  const renderOptionsPage = () => {
    return (
      <div className="options-page">
        <h2>Options</h2>
        <p>Options page content to be implemented.</p>
        {/* This would include options for vendors, editions, etc. */}
      </div>
    );
  };
  
  // Render landing page when no arbitrage option is selected
  const renderLandingPage = () => {
    return (
      <div className="landing-page">
        <h1>Welcome to {title}</h1>
        
        <div className="instructions">
          {globalMode ? (
            <p>Please use the top bar to choose the index to compare from.</p>
          ) : reverseMode ? (
            <p>Please use the top bar to choose the vendor to sell to.</p>
          ) : (
            <p>Please use the top bar to choose the seller to buy from.</p>
          )}
          <p><Link href="?page=options">Set options</Link></p>
          
          <h2>Instructions</h2>
          <ul className="instructions-list">
            <li>Data is refreshed periodically over the day.</li>
            <li>There is a minimum spread and difference amount for a card to be included in the list.</li>
            <li>Always check validity of prices before committing anything, it is possible that prices or quantities changed.</li>
            <li>By default, arbitrage is computed on cash value, taking into account for condition whenever possible.</li>
            
            {globalMode ? (
              <li>Each page will provide a list of cards that can be arbitraged from, according to the value reported from other markets.</li>
            ) : (
              <>
                <li>Note that buylist prices are always displayed NM to make them easier to find, but the actual spread and difference is computed according to the card conditions.</li>
                <li>Each {reverseMode ? 'vendor' : 'seller'} page will contain a list of {reverseMode ? 'sellers' : 'vendors'}, with a brief summary at the top containing the number of arbitrage opportunities.</li>
              </>
            )}
            <li>In case of mistakes or incongruities, please notify the devs in the BAN Discord.</li>
            <li>Should you find this content useful, consider clicking on one of the provided links to make a purchase on the website, and directly support BAN.</li>
          </ul>
        </div>
        
        {infoMessage && <h2>{infoMessage}</h2>}
      </div>
    );
  };
  
  // Render arbitrage data
  const renderArbitrageData = () => {
    if (!arb || arb.length === 0) {
      return (
        <div className="no-arbitrage">
          <h1>{title} - {subtitle}</h1>
          <p>No arbitrage opportunities available for the selected options.</p>
        </div>
      );
    }
    
    return (
      <div className="arbitrage-container">
        <div className="hover-image-container">
          <img 
            id="hoverImage" 
            className="hover-image" 
            src={hoverImageSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
            alt="" 
          />
        </div>
        
        <h1>{title} - {subtitle}</h1>
        
        {!largeTable && (
          <div className="jump-links">
            <p>
              Jump to
              {arb.map(arbData => (
                <a key={arbData.Key} className="btn normal" href={`#${arbData.Name}`}>
                  {arbData.Name} ({arbData.Arbit.length})
                </a>
              ))}
            </p>
            
            <p className="filter-options">
              Show
              {arbitOptKeys.map(key => {
                const config = arbitOptConfig[key];
                if (!config) return null;
                
                // Check if option should be hidden based on various flags
                const skipIfTesting = config.BetaFlag && !canShowAll;
                const skipIfGlobal = config.ArbitOnly && globalMode;
                const skipIfArbit = config.GlobalOnly && !globalMode;
                const skipIfSealed = config.NoSealed && isSealed;
                const skipIfNotSealed = config.SealedOnly && !isSealed;
                
                if (skipIfTesting || skipIfGlobal || skipIfArbit || skipIfSealed || skipIfNotSealed) {
                  return null;
                }
                
                return (
                  <a 
                    key={key}
                    className={`btn ${arbitFilters[key] ? 'success' : 'normal'}`}
                    href={`?source=${scraperShort}&sort=${sortOption}&${arbitOptKeys.map(k => 
                      `${k}=${k === key ? !arbitFilters[k] : arbitFilters[k]}`
                    ).join('&')}`}
                  >
                    {config.Title}
                  </a>
                );
              })}
            </p>
            
            <p>
              Filter by &nbsp; 
              <input 
                type="text" 
                id="filterInput" 
                onKeyUp={() => {
                  // Would be implemented with a real filter function
                  console.log('Filtering...');
                }} 
                placeholder="Edition..." 
                className="filter-input" 
              />
            </p>
          </div>
        )}
        
        {infoMessage && <h2>{infoMessage}</h2>}
        
        {/* Arbitrage data tables */}
        {arb.map((arbData, arbIndex) => (
          <div key={arbData.Key} id={arbData.Name} className="arb-section">
            <div className="arb-header">
              <a href="#top" className="storename-link">
                <h3 className="storename">{arbData.Name}</h3>
              </a>
              
              {/* Navigation between arbitrage sections */}
              {arbIndex < arb.length - 1 && (
                <a href={`#${arb[arbIndex + 1].Name}`} className="nav-arrow">
                  <i className="arrow down"></i>
                </a>
              )}
              {arbIndex > 0 && (
                <a href={`#${arb[arbIndex - 1].Name}`} className="nav-arrow">
                  <i className="arrow up"></i>
                </a>
              )}
              
              {/* Action buttons for this arbitrage section */}
              <div className="action-buttons">
                {renderActionButtons(arbData)}
              </div>
              
              <hr />
            </div>
            
            <table className="arb-table" onMouseOut={handleMouseOut}>
              <thead>
                <tr>
                  <th>Card Name</th>
                  <th>Edition</th>
                  {!isSealed && <th className="center-align">#</th>}
                  <th>Finish</th>
                  {!arbData.HasNoConds && <th>Condition</th>}
                  {!arbData.HasNoQty && <th className="center-align">Quantity</th>}
                  <th className="center-align">
                    {globalMode ? (
                      isSealed ? arbData.Name : scraperShort
                    ) : (
                      'Sell Price'
                    )}
                  </th>
                  {!arbData.HasNoPrice && (
                    <th className="center-align">
                      {globalMode ? (
                        isSealed ? scraperShort : arbData.Name
                      ) : (
                        'Buy Price'
                      )}
                    </th>
                  )}
                  {!arbData.HasNoCredit && <th className="center-align">Trade Price</th>}
                  {!arbData.HasNoArbit && (
                    <>
                      <th className="center-align">Profitability</th>
                      <th className="center-align">Difference</th>
                      <th className="center-align">Spread</th>
                      {!globalMode && <th className="center-align">Price Ratio</th>}
                    </>
                  )}
                  <th className="center-align">Quicklinks</th>
                </tr>
              </thead>
              <tbody>
                {arbData.Arbit.map(entry => {
                  const card = metadata[entry.CardId];
                  if (!card) return null;
                  
                  function getDirectQty(CardId: string): void {
                    throw new Error('Function not implemented.');
                  }

                  return (
                    <tr 
                      key={`${arbData.Key}-${entry.CardId}`}
                      onMouseOver={() => setHoverImageSrc(card.ImageURL)}
                    >
                      {/* Card Name */}
                      <td>
                        {card.Sealed ? (
                          <>
                            <a href={`/search?q=${card.Booster ? 'contents' : 'decklist'}:"${card.Name}"`} title="Search what can be found in this product">
                              <span className="emoji">🔎</span>
                            </a>&nbsp;
                          </>
                        ) : (
                          <>
                            <span className="emoji clickable" onClick={() => copyToClipboard(card.Name)} title="Copy to clipboard">📝</span>&nbsp;
                            {scraperShort === "TCGDirect" && (
                              <span className="emoji clickable" onClick={() => getDirectQty(entry.CardId)} title="Update quantities for TCG Direct" id={`directqty-${entry.CardId}`}>⚡️</span>
                            )}
                          </>
                        )}
                        <a href={card.SearchURL}>{card.Name}</a>
                        {card.Variant && <span className="variant-text">({card.Variant})</span>}
                        {card.Flag && <span className="flag-text">{card.Flag}</span>}
                        {card.Reserved && <span className="reserved-mark">*</span>}
                        {card.Stocks && <span className="stocks-mark">•</span>}
                        {card.SypList && <span className="syp-mark">†</span>}
                      </td>
                      
                      {/* Edition */}
                      <td>
                        {card.Keyrune ? (
                          <>
                            <i className={`ss ss-${card.Keyrune} ss-1x ss-fw`}></i> {card.Edition}
                          </>
                        ) : (
                          card.Edition
                        )}
                      </td>
                      
                      {/* Card Number */}
                      {!isSealed && (
                        <td className="center-align">{card.Number}</td>
                      )}
                      
                      {/* Finish */}
                      <td className="center-align">
                        {card.HasDeck ? (
                          <span title="Decklist">🎁</span>
                        ) : card.Etched ? (
                          <span title="Etched">💫</span>
                        ) : card.Foil ? (
                          <span title="Foil">✨</span>
                        ) : null}
                      </td>
                      
                      {/* Condition */}
                      {!arbData.HasNoConds && (
                        <td className="center-align">{entry.InventoryEntry.Conditions}</td>
                      )}
                      
                      {/* Quantity */}
                      {!arbData.HasNoQty && (
                        <td 
                          className="center-align" 
                          id={scraperShort === "TCGDirect" ? `qty-${scraperShort}-${entry.InventoryEntry.Conditions}-${entry.CardId}` : undefined}
                        >
                          {entry.InventoryEntry.Quantity}
                          {entry.BuylistEntry.Quantity !== 0 && ` / ${entry.BuylistEntry.Quantity}`}
                        </td>
                      )}
                      
                      {/* Sell Price */}
                      <td className="center-align">
                        $ {entry.InventoryEntry.Price.toFixed(2)}
                      </td>
                      
                      {/* Buy Price */}
                      {!arbData.HasNoPrice && (
                        <td className="center-align">
                          {entry.BuylistEntry.BuyPrice === 0.0 ? (
                            <>
                              $ {entry.ReferenceEntry.Price.toFixed(2)}
                              {arbData.SussyList && isSussy(arbData.SussyList, entry.CardId) && (
                                <span 
                                  className="sussy-warning" 
                                  title={`CAUTION - This price looks a bit off, ${isSealed ? 
                                    'the contents of this product have a very uneven distribution, and simulation or data may be wrong' : 
                                    'TCG Market is missing or incorrect'}`}
                                >
                                  ‼️
                                </span>
                              )}
                            </>
                          ) : (
                            `$ ${entry.BuylistEntry.BuyPrice.toFixed(2)}`
                          )}
                        </td>
                      )}
                      
                      {/* Trade Price */}
                      {!arbData.HasNoCredit && (
                        <td className="center-align">
                          $ {(entry.BuylistEntry.BuyPrice * arbData.CreditMultiplier).toFixed(2)}
                        </td>
                      )}
                      
                      {/* Arbitrage data */}
                      {!arbData.HasNoArbit && (
                        <>
                          <td className="center-align">
                            {entry.Spread > 0.0 ? entry.Profitability.toFixed(2) : 'n/a'}
                          </td>
                          <td className="center-align">
                            $ {entry.Difference.toFixed(2)}
                          </td>
                          <td className="center-align">
                            {entry.Spread.toFixed(2)} %
                          </td>
                          {!globalMode && (
                            <td className="center-align">
                              {entry.BuylistEntry.PriceRatio.toFixed(2)} %
                            </td>
                          )}
                        </>
                      )}
                      
                      {/* Quicklinks */}
                      <td className="center-align">
                        {entry.InventoryEntry.URL && (
                          <a className="btn normal" href={entry.InventoryEntry.URL} target="_blank" rel="nofollow">Buy</a>
                        )}
                        {entry.BuylistEntry.URL && (
                          <a className="btn normal" href={entry.BuylistEntry.URL} target="_blank" rel="nofollow">Sell</a>
                        )}
                        {!globalMode && !card.Sealed && entry.ReferenceEntry.URL && (
                          <a className="btn normal" href={entry.ReferenceEntry.URL} target="_blank" rel="nofollow">Buy</a>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Pagination */}
                {currentIndex > 0 && (
                  <tr className="pagination-row">
                    <td colSpan={15} className="pagination-cell">
                      <p>
                        {currentIndex > 1 && (
                          <>
                            <a className="pagination-link" href={`?page=syp&p=1`}>&lt;</a>
                            <a className="pagination-link" href={`?page=syp&p=${prevIndex}`}>
                              <i className="arrow left"></i>
                            </a>
                          </>
                        )}
                        {currentIndex} / {totalIndex}
                        {currentIndex < totalIndex && (
                          <>
                            <a className="pagination-link" href={`?page=syp&p=${nextIndex}`}>
                              <i className="arrow right"></i>
                            </a>
                            <a className="pagination-link" href={`?page=syp&p=${totalIndex}`}>&gt;</a>
                          </>
                        )}
                      </p>
                    </td>
                  </tr>
                )}
                
                {/* Back to top link */}
                <tr className="back-to-top-row">
                  <td colSpan={15} className="back-to-top-cell">
                    <a className="back-to-top-link" href="#top">
                      <i className="arrow up"></i> back to top
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        
        {/* Legend */}
        <div className="legend">
          {hasReserved && (
            <h4>* = Part of the <a href="https://mtg.gamepedia.com/Reserved_List">Reserved List</a></h4>
          )}
          {hasStocks && (
            <h4>• = On <a href="https://mtgstocks.com/interests">MTGStocks Interests</a> page</h4>
          )}
          {hasSypList && (
            <h4>† = Found in the <a href="https://help.tcgplayer.com/hc/en-us/articles/360054178934-Store-Your-Products-SYP-Pull-Sheet">SYP Pull Sheet</a></h4>
          )}
        </div>
        
        {/* Affiliate message */}
        {hasAffiliate && (
          <p className="affiliate-message">
            By visiting stores through the links on this page you're supporting the continuous development of this site ♥
          </p>
        )}
      </div>
    );
  };
  
  const renderActionButtons = (arbData: ArbitData) => {
    const scraperKey = arbData.Key;
    const sourceKey = scraperShort;
    const entries = arbData.Arbit;
    
    return (
      <>
        {sourceKey === "CK" && (
          <form 
            action={`https://www.cardkingdom.com/builder?utm_campaign=partner&utm_medium=arbit&utm_source=partner`} 
            method="post" 
            id={`${sourceKey}${scraperKey}deckbuilder`} 
            style={{ display: 'inline' }} 
            target="_blank"
          >
            <input type="hidden" name="partner" value="partner" />
            <input 
              type="hidden" 
              name="c" 
              value={entries.map(entry => `${entry.InventoryEntry.Quantity || 1} ${metadata[entry.CardId]?.Name || ''}`).join('||')} 
            />
            <button 
              type="button" 
              className="btn success" 
              onClick={() => (document.getElementById(`${sourceKey}${scraperKey}deckbuilder`) as HTMLFormElement)?.submit()}
            >
              Load at {sourceKey}
            </button>
          </form>
        )}
        
        {sourceKey === "CSI" && (
          <form 
            action="https://www.coolstuffinc.com/main_deckBuilder.php" 
            method="post" 
            id={`${sourceKey}${scraperKey}deckbuilder`} 
            style={{ display: 'inline' }} 
            target="_blank"
          >
            <input type="hidden" name="partner" value="partner" />
            <input 
              type="hidden" 
              name="sList" 
              value={entries.map(entry => `${entry.InventoryEntry.Quantity || 1} ${metadata[entry.CardId]?.Name || ''}`).join('|')} 
            />
            <button 
              type="button" 
              className="btn success" 
              onClick={() => (document.getElementById(`${sourceKey}${scraperKey}deckbuilder`) as HTMLFormElement)?.submit()}
            >
              Load at {sourceKey}
            </button>
          </form>
        )}
        
        {sourceKey?.startsWith("TCG") && (
          <form 
            action='https://api.tcgplayer.com/massentry' 
            method="post" 
            id={`${sourceKey}${scraperKey}deckbuilder`} 
            style={{ display: 'inline' }} 
            target="_blank"
          >
            <input type="hidden" name="affiliateurl" value='https://tcgplayer.pxf.io/c/partner/1830156/21018' />
            <input 
              type="hidden" 
              name="c" 
              value={entries.map(entry => `${entry.InventoryEntry.Quantity || 1}-${entry.CardId}`).join('||')} 
            />
            <button 
              type="button" 
              className="btn success" 
              onClick={() => (document.getElementById(`${sourceKey}${scraperKey}deckbuilder`) as HTMLFormElement)?.submit()}
            >
              Load at TCG
            </button>
          </form>
        )}
      </>
    );
  };
  
  return (
    <div className="arbit-page">
      <Navigation navItems={nav} />
      
      <div className="arbit-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArbitPage;