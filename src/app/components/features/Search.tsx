'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '@/app/components/ui/Navigation';
import SearchForm from '@/app/components/ui/SearchForm';

interface SearchPageProps {
  title: string;
  cleanSearchQuery?: string;
  searchQuery?: string;
  isSealed?: boolean;
  totalUnique?: number;
  totalCards?: number;
  errorMessage?: string;
  searchSort?: string;
  reverseMode?: boolean;
  nav: {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
  }[];
  allKeys?: string[];
  metadata?: Record<string, any>;
  foundSellers?: Record<string, Record<string, any[]>>;
  foundVendors?: Record<string, Record<string, any[]>>;
  condKeys?: string[];
  indexKeys?: string[];
  chartId?: string;
  promoTags?: string[];
  cardBackURL?: string;
  hasReserved?: boolean;
  hasStocks?: boolean;
  hasSypList?: boolean;
  showSYP?: boolean;
  canShowAll?: boolean;
  editionSort?: string[];
  editionList?: Record<string, any[]>;
  noSort?: boolean;
  disableChart?: boolean;
  hasAvailable?: boolean;
  alternative?: string;
  altEtchedId?: string;
  stocksURL?: string;
  canDownloadCSV?: boolean;
  showUpsell?: boolean;
  cardHashes?: string[];
  currentIndex?: number;
  prevIndex?: number;
  nextIndex?: number;
  totalIndex?: number;
  infoMessage?: string;
  datasets?: any[];
  axisLabels?: string[];
}

const SearchPage: React.FC<SearchPageProps> = ({
  title,
  cleanSearchQuery = '',
  searchQuery = '',
  isSealed = false,
  totalUnique = 0,
  totalCards = 0,
  errorMessage = '',
  searchSort = '',
  reverseMode = false,
  nav,
  allKeys = [],
  metadata = {},
  foundSellers = {},
  foundVendors = {},
  condKeys = [],
  indexKeys = [],
  chartId = '',
  promoTags = [],
  cardBackURL = '',
  hasReserved = false,
  hasStocks = false,
  hasSypList = false,
  showSYP = true,
  canShowAll = false,
  editionSort = [],
  editionList = {},
  noSort = false,
  disableChart = false,
  hasAvailable = false,
  alternative = '',
  altEtchedId = '',
  stocksURL = '',
  canDownloadCSV = false,
  showUpsell = false,
  cardHashes = [],
  currentIndex = 0,
  prevIndex = 0,
  nextIndex = 0,
  totalIndex = 0,
  infoMessage = '',
  datasets = [],
  axisLabels = []
}) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentPrintings, setCurrentPrintings] = useState<string>('');
  const [currentProducts, setCurrentProducts] = useState<string>('');
  const searchFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize card image if we have allKeys
    if (allKeys.length > 0 && metadata[allKeys[0]]) {
      setCurrentImage(metadata[allKeys[0]].imageURL || cardBackURL);
      setCurrentPrintings(metadata[allKeys[0]].printings || '');
      setCurrentProducts(metadata[allKeys[0]].products || '');
    } else if (isSealed) {
      setCurrentImage('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    } else {
      setCurrentImage(cardBackURL);
    }
  }, [allKeys, metadata, cardBackURL, isSealed]);

  const updateSidebar = (src: string, printings: string, products: string) => {
    setCurrentImage(src);
    setCurrentPrintings(printings);
    setCurrentProducts(products);
  };

  // Render different content based on the view state
  const renderContent = () => {
    if (errorMessage) {
      return <h1 className="error-message">{errorMessage}</h1>;
    }

    if (title === 'Options') {
      return renderOptionsPage();
    }

    function renderSearchInstructions() {
      return (
        <div className="search-instructions">
          <h2>Search Instructions</h2>
          <p>Enter a card name or a product name to search for.</p>
        </div>
      );
    }

    return (
      <>
        <h1 className="search-title">
          Welcome to {title}
          {totalUnique > 0 && (
            <span className="result-count">
              - {totalUnique}
              {totalCards > 0 && ` / ${totalCards}`}
              {isSealed ? ' product' : ' card'}{allKeys.length > 1 ? 's' : ''} found
              {totalUnique > allKeys.length && ` (${allKeys.length} shown)`}
            </span>
          )}
        </h1>

        {isSealed && (
          <div id="hoverImage" className="hover-image" />
        )}

        <div ref={searchFormRef} className="search-form-container">
          <SearchForm
            isSealed={isSealed}
            placeholder={`Enter a ${isSealed ? 'product' : 'card'} name`}
            initialQuery={searchQuery}
            currentSort={searchSort}
            reverseMode={reverseMode}
          />
        </div>

        {searchQuery === '' ? (
          isSealed ? renderSealedLandingPage() : renderSearchInstructions()
        ) : (
          renderSearchResults()
        )}
      </>
    );
  };

  const renderOptionsPage = () => {
    return (
      <div className="options-page">
        <h2>Search Options</h2>
        {/* Options page content would go here */}
        <p>Options page content to be implemented.</p>
      </div>
    );
  };

  

  const renderSealedLandingPage = () => {
    return (
      <div className="sealed-landing">
        <p className="sealed-intro">
          Make sure to read the <a href="#faq" className="btn normal">F.A.Q.</a>
          <br />
          Jump to 
          {editionSort.map(key => (
            <a href={`#${key}`} className="btn normal" key={key}>{key}</a>
          ))}
        </p>
        
        {/* Sealed product categories would be rendered here */}
        
        <div className="faq-section">
          <h3 id="faq">F.A.Q.</h3>
          {/* FAQ content would go here */}
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div className="search-results">
        <div className="search-sidebar">
          <table className="sidebar-table">
            <tbody>
              <tr className="sidebar-image-row">
                <td>
                  {!isSealed ? (
                    <img 
                      id="cardImage" 
                      src={currentImage} 
                      width="354" 
                      height="493" 
                      className="card-image"
                      onClick={() => {
                        if (searchFormRef.current) {
                          const input = searchFormRef.current.querySelector('input');
                          if (input) {
                            input.focus();
                            input.setSelectionRange(0, input.value.length);
                          }
                        }
                      }}
                      alt="Card"
                    />
                  ) : null}
                </td>
              </tr>
              <tr>
                <td>
                  <div id="printings" className="printings-info">
                    {currentPrintings}
                  </div>
                  {canShowAll && (
                    <div className="show-all-link">
                      <Link href={`search?q=${cleanSearchQuery}`} className="btn info">
                        Show all versions
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
              {hasAvailable && (
                <tr>
                  <td>
                    <div className="products-container">
                      <h4>Available in</h4>
                      <div id="products" className="products-info">
                        {currentProducts}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {alternative && (
                <tr>
                  <td className="alternative-link">
                    <Link href={`/search?chart=${alternative}`} className="btn warning">
                      Switch Foil/Non-Foil
                    </Link>
                  </td>
                </tr>
              )}
              {altEtchedId && (
                <tr>
                  <td className="alternative-link">
                    <Link href={`/search?chart=${altEtchedId}`} className="btn warning">
                      Switch Etched/Non-Etched
                    </Link>
                  </td>
                </tr>
              )}
              {stocksURL && (
                <tr>
                  <td className="stocks-link">
                    <a href={stocksURL} target="_blank" rel="noreferrer" className="btn success">
                      Check MTGStocks charts
                    </a>
                  </td>
                </tr>
              )}
              {canDownloadCSV && (
                <tr>
                  <td className="download-links">
                    <div>Download prices as CSV</div>
                    <a 
                      href={`/api/search/retail${isSealed ? '/sealed' : ''}/${searchQuery}`} 
                      className="btn success"
                    >
                      Retail
                    </a>
                    <a 
                      href={`/api/search/buylist${isSealed ? '/sealed' : ''}/${searchQuery}`} 
                      className="btn warning"
                    >
                      Buylist
                    </a>
                  </td>
                </tr>
              )}
              {showUpsell && (
                <tr>
                  <td className="upsell-message">
                    <i>
                      Increase your tier to be able to download any search results as CSVs
                      {!isSealed && ' or to transfer them to the Upload optimizer!'}
                    </i>
                  </td>
                </tr>
              )}
              <tr>
                <td className="card-notes">
                  {hasReserved && (
                    <h4>
                      {chartId ? (
                        <div className="text-center">* = </div>
                      ) : (
                        '* = '
                      )}
                      Part of the <a href="https://mtg.gamepedia.com/Reserved_List">Reserved List</a>
                    </h4>
                  )}
                  {hasStocks && (
                    <h4>
                      {chartId ? (
                        <div className="text-center">• = </div>
                      ) : (
                        '• = '
                      )}
                      On <a href="https://mtgstocks.com/interests">MTGStocks Interests</a> page
                    </h4>
                  )}
                  {hasSypList && (
                    <h4>
                      {chartId ? (
                        <div className="text-center">† = </div>
                      ) : (
                        '† = '
                      )}
                      Found in the <a href="https://help.tcgplayer.com/hc/en-us/articles/360054178934-Store-Your-Products-SYP-Pull-Sheet">SYP Pull Sheet</a>
                    </h4>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="search-results-main">
          {chartId && (
            <div className="chart-container">
              <canvas id="cardChart" width="740" height="420"></canvas>
            </div>
          )}

          <div className="results-table-container">
            {allKeys.length > 0 ? (
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="category-header">Sellers</th>
                    <th className="category-header">Buyers</th>
                    <th className="category-header" style={{ display: 'none' }} id="lastsalesth">Last Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {allKeys.map(cardId => (
                    <React.Fragment key={cardId}>
                      {/* Card header row would go here */}
                      {/* Card data rows would go here */}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">No results found for your search.</div>
            )}

            {currentIndex > 0 && (
              <div className="pagination">
                {currentIndex !== 1 && (
                  <>
                    <Link href={`?q=${searchQuery}&p=1&sort=${searchSort}&reverse=${reverseMode}`}>&lt;</Link>
                    <Link href={`?q=${searchQuery}&p=${prevIndex}&sort=${searchSort}&reverse=${reverseMode}`}>
                      <i className="arrow left"></i>
                    </Link>
                  </>
                )}
                <span>{currentIndex} / {totalIndex}</span>
                {currentIndex !== totalIndex && (
                  <>
                    <Link href={`?q=${searchQuery}&p=${nextIndex}&sort=${searchSort}&reverse=${reverseMode}`}>
                      <i className="arrow right"></i>
                    </Link>
                    <Link href={`?q=${searchQuery}&p=${totalIndex}&sort=${searchSort}&reverse=${reverseMode}`}>&gt;</Link>
                  </>
                )}
              </div>
            )}

            {infoMessage && (
              <div className="info-message">{infoMessage}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // For a complete implementation, CardGrid component would handle much of the card display logic

  return (
    <div className="search-container">
      <Navigation navItems={nav} />
      <div className="search-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchPage;