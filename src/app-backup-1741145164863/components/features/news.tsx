'use client';

// src/components/features/MtgNewspaper.tsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/styles/MtgNewspaper.css';

export interface NewspaperCard {
  id: string;
  name: string;
  setCode: string;
  setName: string;
  number: string;
  keyrune: string;
  imageURL: string;
  reserved?: boolean;
  stocks?: boolean;
  sypList?: boolean;
}

export interface TableHeading {
  title: string;
  field: string;
  canSort: boolean;
  conditionalSort?: boolean;
  isDollar?: boolean;
  isPerc?: boolean;
  isHidden?: boolean;
}

export interface TableRow {
  cardId: string;
  values: string[];
}

export interface EditionInfo {
  name: string;
  keyrune: string;
}

export interface TocItem {
  title: string;
  option: string;
}

interface MtgNewspaperProps {
  title: string;
  subtitle?: string;
  lastUpdate?: string;
  isOneDay?: boolean;
  canSwitchDay?: boolean;
  errorMessage?: string;
  infoMessage?: string;
  tocItems?: TocItem[];
  headings?: TableHeading[];
  cards?: NewspaperCard[];
  tableData?: string[][];
  editions?: string[];
  editionsMap?: Record<string, EditionInfo>;
  rarities?: string[];
  filterSet?: string;
  filterRarity?: string;
  filterMinPrice?: string;
  filterMaxPrice?: string;
  filterMinPercChange?: string;
  filterMaxPercChange?: string;
  sortOption?: string;
  sortDir?: 'asc' | 'desc';
  currentIndex?: number;
  prevIndex?: number;
  nextIndex?: number;
  totalIndex?: number;
  offsetCards?: number;
  largeTable?: boolean;
  hasReserved?: boolean;
  hasStocks?: boolean;
  hasSypList?: boolean;
  cardHashes?: string[];
  canFilterByPrice?: boolean;
  canFilterByPercentage?: boolean;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: {
    set?: string;
    rarity?: string;
    minPrice?: string;
    maxPrice?: string;
    minChange?: string;
    maxChange?: string;
  }) => void;
  onPageChange?: (index: number) => void;
  onLoadInUploader?: (hashes: string[]) => void;
  onSaveExcludedEditions?: (excludedEditions: string[]) => void;
}

const MtgNewspaper: React.FC<MtgNewspaperProps> = ({
  title,
  subtitle = '',
  lastUpdate = new Date().toLocaleDateString(),
  isOneDay = false,
  canSwitchDay = false,
  errorMessage = '',
  infoMessage = '',
  tocItems = [],
  headings = [],
  cards = [],
  tableData = [],
  editions = [],
  editionsMap = {},
  rarities = [],
  filterSet = '',
  filterRarity = '',
  filterMinPrice = '',
  filterMaxPrice = '',
  filterMinPercChange = '',
  filterMaxPercChange = '',
  sortOption = '',
  sortDir = 'asc',
  currentIndex = 0,
  prevIndex = 0,
  nextIndex = 0,
  totalIndex = 0,
  offsetCards = 0,
  largeTable = false,
  hasReserved = false,
  hasStocks = false,
  hasSypList = false,
  cardHashes = [],
  canFilterByPrice = false,
  canFilterByPercentage = false,
  onSortChange,
  onFilterChange,
  onPageChange,
  onLoadInUploader,
  onSaveExcludedEditions
}) => {
  const [excludedEditions, setExcludedEditions] = useState<Record<string, boolean>>({});
  const [filterValues, setFilterValues] = useState({
    set: filterSet,
    rarity: filterRarity,
    minPrice: filterMinPrice,
    maxPrice: filterMaxPrice,
    minChange: filterMinPercChange,
    maxChange: filterMaxPercChange
  });
  const [hoverImageSrc, setHoverImageSrc] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    // Load saved excluded editions from localStorage
    try {
      const savedEditions = localStorage.getItem('NewspaperList');
      if (savedEditions) {
        setExcludedEditions(JSON.parse(savedEditions));
      }
    } catch (error) {
      console.error('Error loading excluded editions:', error);
    }
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'filter' || name === 'rarity') {
      if (onFilterChange) {
        onFilterChange({
          ...filterValues,
          [name === 'filter' ? 'set' : 'rarity']: value
        });
      }
      
      // Auto-submit the form on select change
      if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };
  
  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (onFilterChange) {
      onFilterChange(filterValues);
    }
  };
  
  const toggleEdition = (editionKey: string) => {
    setExcludedEditions(prev => ({
      ...prev,
      [editionKey]: !prev[editionKey]
    }));
  };
  
  const clearExcludedEditions = () => {
    setExcludedEditions({});
  };
  
  const selectAllEditions = () => {
    const allSelected: Record<string, boolean> = {};
    editions.forEach(edition => {
      allSelected[edition] = true;
    });
    setExcludedEditions(allSelected);
  };
  
  const saveExcludedEditions = () => {
    try {
      localStorage.setItem('NewspaperList', JSON.stringify(excludedEditions));
      
      if (onSaveExcludedEditions) {
        const excludedKeys = Object.keys(excludedEditions).filter(key => excludedEditions[key]);
        onSaveExcludedEditions(excludedKeys);
      }
      
      // Redirect to main newspaper page
      window.location.href = '/newspaper';
    } catch (error) {
      console.error('Error saving excluded editions:', error);
    }
  };
  
  const formatPrice = (value: string): string => {
    if (!value || value === 'N/A') return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    return `$${numValue.toFixed(2)}`;
  };
  
  const formatPercentage = (value: string): string => {
    if (!value || value === 'N/A') return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    const formattedValue = numValue.toFixed(2);
    return numValue >= 0 ? `+${formattedValue}%` : `${formattedValue}%`;
  };
  
  const renderLandingPage = () => (
    <div className="newspaper-landing">
      <h1>Welcome to {title}{isOneDay ? ', ' : ''}
        <i>early edition</i>
        {isOneDay ? '' : ''}
      </h1>
      <p className="indent">Published on {lastUpdate}</p>
      
      <div className="indent table-of-contents">
        <h2>Table of contents</h2>
        <ol className="indent index">
          {tocItems.map((item, index) => (
            <li key={index}>
              <Link href={`newspaper?page=${item.option}`}>{item.title}</Link>
            </li>
          ))}
        </ol>
      </div>
      
      <div className="clear"></div>
      
      <div className="indent" style={{ maxWidth: '900px' }}>
        <br />
        <p className="indent">
          Your patronage gives you access to the
          {isOneDay ? (
            <> <i>early edition</i>, aka the 1-day newspaper.</>
          ) : (
            ' 3-day newspaper.'
          )}
          {canSwitchDay && (
            <>
              <br />As <b>Admin</b> you can check on the
              <Link href={`newspaper?force3day=${isOneDay}`} className="special-link">
                {isOneDay ? ' 3-day' : ' early edition'} newspaper
              </Link>.
            </>
          )}
        </p>
        
        <h3>Instructions</h3>
        <ul className="indent">
          <li>The Market Review provides an overall market health overview.</li>
          <li>Pages 2 and 3 show you how the market is trending.<br />
            These are the cards that <a href="https://mtgstocks.com">MTGStocks</a>, <a href="https://echomtg.com">echomtg</a>, and similar pages will pick up in about 5 days (usually - even if they don't, these are the cards that are actively churning on the market given a 3 week review across multiple vendor sites).</li>
          <li>Pages 4 and 5 give you an overview of TCG vendor levels, how many vendors have listings of a specific card and how it is trending.</li>
          <li>Pages 6 and 7 are the same deal as 4-5, just reviewing CK buylist and the strength and trends of their offers on cards.</li>
          <li>On page 8 you may select which sets to exclude and tailor your experience.</li>
        </ul>
        <br />
        <ul className="indent">
          <li>Check out a <a href="https://youtu.be/1BILs981-Y4">video introduction</a> from <a href="https://twitter.com/WolfOfTinStreet">WolfOfTinStreet</a>.</li>
        </ul>
        <br />
        
        <h3>A note on forecasts</h3>
        <ul className="indent">
          <li>This newspaper is not a crystal ball.</li>
          <li>More often then not, the trend of the card is what we're aiming to predict and the sharpness of that trend velocity.</li>
          <li>These forecasts hereafter attempt to show, based off time series analysis, the potential future values (7 days out) for key metrics.</li>
          <li>The values shown demonstrate the value and forecast value from one week prior. We then can compare the forecast value (what the model thought the value would be {isOneDay ? 'in present day' : 'on a 3 day lag'}).</li>
          <li>Then it will demonstrate today's value, and the current projection moving forward.</li>
          <li>In your own review of how my model performed last week to this week, <b>it is left up to the reader</b> to decide whether or not to believe it will continue to hold true into the future week, or if trends will change. What is being represented is historical patterns and their predicted end result.</li>
          <ul className="indent">
            <li>Things in the present, oftentimes, do not follow historical trends, and herein lies the risk.</li>
            <li>If they should follow historical patterns though...</li>
          </ul>
          {!isOneDay && (
            <li>Please also remember, this edition is lagged 3 days behind present date. Consider upgrading your pledge to gain access to the <i>early edition</i>.</li>
          )}
        </ul>
        <br />
      </div>
    </div>
  );
  
  const renderOptionsPage = () => (
    <div className="newspaper-options">
      <br />
      <div className="indent">
        <h2>Edition list</h2>
        <p>Select which editions you <b>don't</b> want to display in your newspaper.</p>
        <br />
        
        <div className="edition-actions">
          <button 
            className="btn warning" 
            onClick={clearExcludedEditions}
          >
            <b>CLEAR</b>
          </button>
          <button 
            className="btn success" 
            onClick={selectAllEditions}
          >
            <b>SELECT ALL</b>
          </button>
          <button 
            className="btn success" 
            onClick={saveExcludedEditions}
          >
            <b>SAVE</b>
          </button>
        </div>
      </div>
      
      <div className="indent edition-grid" id="editions">
        {editions.map((editionKey, i) => {
          const edition = editionsMap[editionKey];
          if (!edition) return null;
          
          return (
            <div key={`edition-${editionKey}`} className="edition-item">
              <input 
                type="checkbox" 
                id={editionKey} 
                name={editionKey}
                checked={!!excludedEditions[editionKey]} 
                onChange={() => toggleEdition(editionKey)}
              />
              <label htmlFor={editionKey}>
                <i className={`ss ss-${edition.keyrune} ss-2x ss-fw`}></i>
                {edition.name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  const renderDataTable = () => (
    <div className="newspaper-data">
      <div className="hover-image-container">
        <img 
          id="hoverImage" 
          className="hover-image" 
          src={hoverImageSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
          alt="" 
        />
      </div>
      
      <div className="newspaper-section-header">
        <div className="title-container">
          <h1>{subtitle}</h1>
        </div>
        
        <div className="filter-container">
          <form 
            ref={formRef}
            action="newspaper" 
            method="GET" 
            onSubmit={handleFilterSubmit}
          >
            <input type="hidden" name="page" value={subtitle} />
            <input type="hidden" name="sort" value={sortOption} />
            <input type="hidden" name="dir" value={sortDir} />
            <input type="hidden" name="index" value={currentIndex.toString()} />
            
            {canFilterByPrice && (
              <>
                <input 
                  name="min_price" 
                  value={filterValues.minPrice} 
                  placeholder="Min $" 
                  className="input-css price-input"
                  onChange={handleFilterChange}
                />
                <input 
                  name="max_price" 
                  value={filterValues.maxPrice} 
                  placeholder="Max $" 
                  className="input-css price-input"
                  onChange={handleFilterChange}
                />
              </>
            )}
            
            {canFilterByPercentage && (
              <>
                <input 
                  name="min_change" 
                  value={filterValues.minChange} 
                  placeholder="Min %" 
                  className="input-css perc-input"
                  onChange={handleFilterChange}
                />
                <input 
                  name="max_change" 
                  value={filterValues.maxChange} 
                  placeholder="Max %" 
                  className="input-css perc-input"
                  onChange={handleFilterChange}
                />
              </>
            )}
            
            <select 
              name="filter" 
              value={filterValues.set}
              onChange={handleFilterChange} 
              className="select-css edition-select"
            >
              <option value="" disabled={filterValues.set !== ''}>
                Filter by Edition
              </option>
              {editions.map((edition, index) => (
                <option key={index} value={edition}>
                  {edition}
                </option>
              ))}
            </select>
            
            <select 
              name="rarity" 
              value={filterValues.rarity}
              onChange={handleFilterChange} 
              className="select-css rarity-select"
            >
              <option value="" disabled={filterValues.rarity !== ''}>
                🍀
              </option>
              {rarities.map((rarity, index) => (
                <option key={index} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
            
            <input type="submit" style={{ display: 'none' }} />
          </form>
        </div>
      </div>
      
      <div className="indent" style={{ maxWidth: largeTable ? '90%' : '1080px' }}>
        <table 
          className="data-table"
          onMouseOut={() => setHoverImageSrc('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')}
        >
          <thead>
            <tr>
              {headings.map((heading, i) => {
                if (heading.isHidden) return null;
                
                return (
                  <th key={i} className="sticky-header">
                    {heading.conditionalSort && <div className="center">{heading.title}</div>}
                    {!heading.conditionalSort && heading.title}
                    
                    {(heading.canSort || (filterSet !== '' && heading.conditionalSort)) && (
                      <div className="sort-arrows">
                        <a 
                          href={`newspaper?page=${subtitle}&sort=${heading.field}&dir=desc&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (onSortChange) onSortChange(heading.field, 'desc');
                          }}
                        >
                          <i className="arrow down"></i>
                        </a>
                        <a 
                          href={`newspaper?page=${subtitle}&sort=${heading.field}&dir=asc&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (onSortChange) onSortChange(heading.field, 'asc');
                          }}
                        >
                          <i className="arrow up"></i>
                        </a>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody>
            {cards.map((card, j) => {
              const rowData = tableData[j] || [];
              
              return (
                <tr 
                  key={`card-${j}`}
                  onMouseOver={() => setHoverImageSrc(card.imageURL)}
                >
                  {headings.map((heading, i) => {
                    if (heading.isHidden) return null;
                    
                    const cellData = rowData[i] || '';
                    
                    // Handle card name column (offsetCards)
                    if (i === offsetCards) {
                      return (
                        <td key={`cell-${j}-${i}`} className={largeTable ? 'large-cell' : ''}>
                          <Link href={`search?q=${card.name} s:${card.setCode} cn:${card.number}`}>
                            {cellData}
                          </Link>
                          {card.reserved && ' *'}
                          {card.stocks && ' •'}
                          {card.sypList && ' †'}
                        </td>
                      );
                    }
                    
                    // Handle set column (offsetCards + 1)
                    if (i === offsetCards + 1) {
                      return (
                        <td key={`cell-${j}-${i}`} className={largeTable ? 'large-cell' : ''}>
                          <i className={`ss ${card.keyrune} ss-1x ss-fw`}></i> {cellData}
                        </td>
                      );
                    }
                    
                    // Handle other columns
                    return (
                      <td key={`cell-${j}-${i}`}>
                        <div className="center">
                          <div className="nowrap">
                            {heading.isDollar ? formatPrice(cellData) : 
                             heading.isPerc ? formatPercentage(cellData) : 
                             cellData}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          
          <tfoot>
            <tr>
              <td colSpan={headings.filter(h => !h.isHidden).length}>
                <div className="pagination-container">
                  {currentIndex !== 0 && (
                    <>
                      <Link 
                        href={`/newspaper?page=${subtitle}&sort=${sortOption}&dir=${sortDir}&index=&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                        className="pagination-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onPageChange) onPageChange(0);
                        }}
                      >
                        &lt;
                      </Link>
                      <Link 
                        href={`/newspaper?page=${subtitle}&sort=${sortOption}&dir=${sortDir}&index=${prevIndex}&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                        className="pagination-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onPageChange) onPageChange(prevIndex);
                        }}
                      >
                        <i className="arrow left"></i>
                      </Link>
                    </>
                  )}
                  
                  <span className="pagination-info">
                    {currentIndex + 1} / {totalIndex + 1}
                  </span>
                  
                  {currentIndex !== totalIndex && (
                    <>
                      <Link 
                        href={`/newspaper?page=${subtitle}&sort=${sortOption}&dir=${sortDir}&index=${nextIndex}&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                        className="pagination-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onPageChange) onPageChange(nextIndex);
                        }}
                      >
                        <i className="arrow right"></i>
                      </Link>
                      <Link 
                        href={`/newspaper?page=${subtitle}&sort=${sortOption}&dir=${sortDir}&index=${totalIndex}&filter=${filterSet}&rarity=${filterRarity}&min_price=${filterMinPrice}&max_price=${filterMaxPrice}&min_change=${filterMinPercChange}&max_change=${filterMaxPercChange}`}
                        className="pagination-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onPageChange) onPageChange(totalIndex);
                        }}
                      >
                        &gt;
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="uploader-button-container">
                  <button 
                    className="btn success uploader-button"
                    onClick={() => {
                      if (onLoadInUploader) onLoadInUploader(cardHashes);
                    }}
                  >
                    Load this page in the Uploader tool
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <br />
        <div className="legend">
          <p>{infoMessage}</p>
          {hasReserved && (
            <p>* = Part of the <a href="https://mtg.gamepedia.com/Reserved_List">Reserved List</a></p>
          )}
          {hasStocks && (
            <p>• = On <a href="https://mtgstocks.com/interests">MTGStocks Interests</a> page</p>
          )}
          {hasSypList && (
            <p>† = Found in the <a href="https://help.tcgplayer.com/hc/en-us/articles/360054178934-Store-Your-Products-SYP-Pull-Sheet">SYP Pull Sheet</a></p>
          )}
        </div>
        <br /><br /><br />
      </div>
    </div>
  );
  
  return (
    <div className="newspaper-container">
      {errorMessage ? (
        <h1 className="error-message">{errorMessage}</h1>
      ) : subtitle === '' ? (
        renderLandingPage()
      ) : subtitle === 'Options' ? (
        renderOptionsPage()
      ) : (
        renderDataTable()
      )}
    </div>
  );
};

export default MtgNewspaper;