'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/app/components/ui/Navigation';
import '@/app/styles/Upload.css';

interface UploadPageProps {
  title: string;
  errorMessage?: string;
  warningMessage?: string;
  nav: {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
  }[];
  sellerKeys?: string[];
  vendorKeys?: string[];
  enabledSellers?: string[];
  enabledVendors?: string[];
  isBuylist?: boolean;
  canBuylist?: boolean;
  remoteLinkURL?: string;
  cardHashes?: string[];
  searchQuery?: string;
  optimized?: boolean;
  uploadEntries?: any[];
  resultPrices?: Record<string, Record<string, number>>;
  metadata?: Record<string, any>;
  totalEntries?: Record<string, number>;
  missingPrices?: Record<string, number>;
  missingCounts?: Record<string, number>;
  indexKeys?: string[];
  optimizedTotals?: Record<string, number>;
  hasReserved?: boolean;
  hasStocks?: boolean;
  hasSypList?: boolean;
  infoMessage?: string;
  totalQuantity?: number;
  highestTotal?: number;
}

const UploadPage: React.FC<UploadPageProps> = ({
  title,
  errorMessage = '',
  warningMessage = '',
  nav,
  sellerKeys = [],
  vendorKeys = [],
  enabledSellers = [],
  enabledVendors = [],
  isBuylist = false,
  canBuylist = false,
  remoteLinkURL = '',
  cardHashes = [],
  searchQuery = '',
  optimized = false,
  uploadEntries = [],
  resultPrices = {},
  metadata = {},
  totalEntries = {},
  missingPrices = {},
  missingCounts = {},
  indexKeys = [],
  optimizedTotals = {},
  hasReserved = false,
  hasStocks = false,
  hasSypList = false,
  infoMessage = '',
  totalQuantity = 0,
  highestTotal = 0
}) => {
  const [selectedMode, setSelectedMode] = useState<'retail' | 'buylist'>(isBuylist ? 'buylist' : 'retail');
  const [fileLabel, setFileLabel] = useState<string>('Select local csv/xls');
  const [urlLabel, setUrlLabel] = useState<string>(remoteLinkURL ? 'Remote URL ready' : 'Load remote URL');
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [showTextArea, setShowTextArea] = useState<boolean>(false);
  const [textAreaContent, setTextAreaContent] = useState<string>('');
  const storesBoxRef = useRef<HTMLDivElement>(null);
  const currentActiveTab = useRef<string>('upload'); // upload, download, estimate, deckbox
  
  // Initialize stores based on mode
  useEffect(() => {
    loadStoresForMode(selectedMode);
  }, [selectedMode]);
  
  // Load stores for the current mode (retail or buylist)
  const loadStoresForMode = (mode: 'retail' | 'buylist') => {
    if (storesBoxRef.current) {
      if (mode === 'buylist') {
        storesBoxRef.current.innerHTML = vendorKeys.map(key => 
          `<label for='${key}'><input type='checkbox' name='stores' id='${key}' value='${key}' ${enabledVendors.includes(key) ? 'checked' : ''}>&nbsp;${getScraperName(key)}</label><br>`
        ).join('');
        
        // Show additional buttons for buylist mode
        document.querySelectorAll<HTMLElement>('.buylist-only-button').forEach(el => {
          el.style.display = 'inline-block';
        });
      } else {
        storesBoxRef.current.innerHTML = sellerKeys.map(key => 
          `<label for='${key}'><input type='checkbox' name='stores' id='${key}' value='${key}' ${enabledSellers.includes(key) ? 'checked' : ''}>&nbsp;${getScraperName(key)}</label><br>`
        ).join('');
        
        // Hide additional buttons for retail mode
        document.querySelectorAll<HTMLElement>('.buylist-only-button').forEach(el => {
          el.style.display = 'none';
        });
      }
    }
  };
  
  // Helper to get a friendly scraper name (placeholder)
  const getScraperName = (key: string) => {
    // In a real implementation, this would come from the backend or a mapping
    return key.replace(/([A-Z])/g, ' $1').trim();
  };
  
  // Handle form submission with specified action
  const handleFormSubmit = (action: string, newWindow: boolean = false) => {
    currentActiveTab.current = action;
    
    // Reset all hidden fields
    const actions = ['upload', 'download', 'estimate', 'deckbox'];
    actions.forEach(act => {
      const field = document.getElementById(act) as HTMLInputElement | null;
      if (field) {
        field.value = act === action ? 'true' : '';
      }
    });
    
    // Set target for new window if needed
    const form = document.getElementById('upload_form') as HTMLFormElement | null;
    if (form) {
      form.target = newWindow ? '_blank' : '';
      form.submit();
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileLabel(files[0].name);
      setIsButtonDisabled(false);
      
      // Clear URL and textarea
      const urlInput = document.getElementById('gdocURL') as HTMLInputElement | null;
      if (urlInput) {
        urlInput.value = '';
      }
      setUrlLabel('Load remote URL');
      setShowTextArea(false);
      setTextAreaContent('');
    }
  };
  
  // Show URL input dialog
  const askForURL = () => {
    const url = prompt('Please enter your URL here', remoteLinkURL || '');
    if (url !== null) {
      if (url === '') {
        setUrlLabel('Load remote URL');
      } else if (url.includes('docs.google.com') || url.includes('store.tcgplayer.com') || url.includes('moxfield.com')) {
        setUrlLabel('Remote URL ready');
        setShowTextArea(false);
        setTextAreaContent('');
        setFileLabel('Select local csv/xls');
        setIsButtonDisabled(false);
        
        const urlInput = document.getElementById('gdocURL') as HTMLInputElement | null;
        if (urlInput) {
          urlInput.value = url;
        }
      } else {
        alert('Invalid URL. Please enter a Google Docs, TCGplayer, or Moxfield URL.');
      }
    }
  };
  
  // Toggle textarea display
  const toggleTextArea = () => {
    setShowTextArea(true);
    setIsButtonDisabled(false);
    
    // Clear file and URL inputs
    const fileInput = document.getElementById('file') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
    setFileLabel('Select local csv/xls');
    
    const urlInput = document.getElementById('gdocURL') as HTMLInputElement | null;
    if (urlInput) {
      urlInput.value = '';
    }
    setUrlLabel('Load remote URL');
  };
  
  return (
    <div className="upload-page">
      <Navigation navItems={nav} />

      <div className="upload-content">
        {errorMessage ? (
          <h1 className="error-message">{errorMessage}</h1>
        ) : (
          <>
            <h1 className="page-title">Welcome to {title}</h1>
            
            <div className="upload-form-container">
              <form 
                encType={!cardHashes.length ? 'multipart/form-data' : undefined}
                action="/upload" 
                method="post" 
                id="upload_form" 
                className="upload-form"
              >
                <div className="mode-selector">
                  <label className="mode-option">
                    <input 
                      type="radio" 
                      id="retail" 
                      name="mode" 
                      value="false" 
                      checked={selectedMode === 'retail'} 
                      onChange={() => setSelectedMode('retail')}
                    />
                    <span>Retail</span>
                  </label>
                  
                  <label className={`mode-option ${!canBuylist ? 'disabled' : ''}`}>
                    <input 
                      type="radio" 
                      id="buylist" 
                      name="mode" 
                      value="true" 
                      checked={selectedMode === 'buylist'} 
                      onChange={() => canBuylist ? setSelectedMode('buylist') : null}
                      disabled={!canBuylist}
                    />
                    <span>
                      {canBuylist ? (
                        'Buylist'
                      ) : (
                        <div className="tooltip">
                          <span className="tooltiptext">Join Legacy and gain access to buylist prices!</span>
                          <s>Buylist</s>
                        </div>
                      )}
                    </span>
                  </label>
                </div>
                
                <div className="stores-selector">
                  <div className="stores-select" id="storesBox" ref={storesBoxRef}></div>
                </div>
                
                <input 
                  type="file" 
                  id="file" 
                  name="cardListFile" 
                  accept=".csv,text/csv,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                <input 
                  type="hidden" 
                  id="gdocURL" 
                  name="gdocURL" 
                  value={remoteLinkURL}
                />
                
                <div className="upload-options">
                  {cardHashes.length ? (
                    cardHashes.map((hash, index) => (
                      <input key={index} type="hidden" name="hashes" value={hash} />
                    ))
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="upload-option-btn" 
                        onClick={() => document.getElementById('file')?.click()}
                      >
                        {fileLabel}
                      </button>
                      <span className="separator">or</span>
                      <button 
                        type="button" 
                        className="upload-option-btn" 
                        onClick={askForURL}
                        title={remoteLinkURL}
                      >
                        {urlLabel}
                      </button>
                      <span className="separator">or</span>
                      <button 
                        type="button" 
                        className="upload-option-btn" 
                        onClick={toggleTextArea}
                      >
                        Paste freeform text
                      </button>
                    </>
                  )}
                </div>
                
                {showTextArea && (
                  <textarea 
                    id="textArea" 
                    name="textArea" 
                    rows={4} 
                    cols={40} 
                    className="text-area" 
                    value={textAreaContent}
                    onChange={(e) => setTextAreaContent(e.target.value)}
                  ></textarea>
                )}
                
                <input type="hidden" id="upload" name="upload" value="" />
                <input type="hidden" id="download" name="download" value="" />
                <input type="hidden" id="estimate" name="estimate" value="" />
                <input type="hidden" id="deckbox" name="deckbox" value="" />
                
                <div className="action-buttons">
                  <button 
                    type="button" 
                    id="submit_default" 
                    className="action-button primary" 
                    onClick={() => handleFormSubmit('upload')} 
                    disabled={isButtonDisabled && !cardHashes.length && !textAreaContent}
                  >
                    Upload
                  </button>
                  
                  {canBuylist && (
                    <>
                      <button 
                        type="button" 
                        id="submit_download" 
                        className="action-button secondary buylist-only-button" 
                        onClick={() => handleFormSubmit('download')} 
                        disabled={isButtonDisabled && !cardHashes.length && !textAreaContent}
                      >
                        Get CSV
                      </button>
                      <button 
                        type="button" 
                        id="submit_estimate" 
                        className="action-button secondary buylist-only-button" 
                        onClick={() => handleFormSubmit('estimate', true)} 
                        disabled={isButtonDisabled && !cardHashes.length && !textAreaContent}
                      >
                        CardConduit
                      </button>
                      <button 
                        type="button" 
                        id="submit_deckbox" 
                        className="action-button secondary buylist-only-button" 
                        onClick={() => handleFormSubmit('deckbox')} 
                        disabled={isButtonDisabled && !cardHashes.length && !textAreaContent}
                      >
                        Deckbox
                      </button>
                    </>
                  )}
                  
                  {optimized && (
                    <button 
                      type="button" 
                      className="action-button secondary" 
                      onClick={() => window.location.href = '#top'}
                    >
                      Optimizer
                    </button>
                  )}
                </div>
                
                <div className="advanced-options">
                  <button 
                    type="button" 
                    id="advOptsButton" 
                    className="toggle-options-btn" 
                    onClick={() => {
                      const advOpts = document.getElementById('advOpts');
                      if (advOpts) {
                        advOpts.style.display = 'block';
                      }
                      document.getElementById('advOptsButton')!.style.display = 'none';
                    }}
                  >
                    Show optimizer options
                  </button>
                  
                  <div id="advOpts" className="options-panel" style={{ display: 'none' }}>
                    {/* Advanced options would go here - simplified version */}
                    <div className="option-row">
                      <label className="option-label">
                        <input type="checkbox" id="lowval" name="lowval" defaultChecked />
                        <span>Hide low spread offers (below</span>
                        <input type="text" id="percspread" name="percspread" defaultValue="60" className="small-input" />
                        <span>% wrt loaded price)</span>
                      </label>
                    </div>
                    
                    <div className="option-row">
                      <label className="option-label">
                        <input type="checkbox" id="lowvalabs" name="lowvalabs" defaultChecked />
                        <span>Hide low value offers (buylist below $</span>
                        <input type="text" id="minval" name="minval" defaultValue="1" className="small-input" />
                        <span>)</span>
                      </label>
                    </div>
                    
                    <div className="option-row">
                      <label className="option-label">
                        <input type="checkbox" id="minmargin" name="minmargin" defaultChecked />
                        <span>Allow</span>
                        <input type="text" id="margin" name="margin" defaultValue="10" className="small-input" />
                        <span>% difference in offers for multiple selections</span>
                      </label>
                    </div>
                    
                    <div className="option-row">
                      <label className="option-label">
                        <span>Sort results by</span>
                        <select id="sorting" name="sorting" className="sort-select">
                          <option value="" selected>default</option>
                          <option value="setnum">set/name/number</option>
                          <option value="alphabetical">alphabetical</option>
                          <option value="highprice">highest offer</option>
                          <option value="highspread">highest spread</option>
                          <option value="profitability">profitability</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {warningMessage && (
              <div className="warning-message">
                <h4>There was a problem uploading your file: <i>{warningMessage}</i></h4>
              </div>
            )}

            {!searchQuery ? (
              <div className="instructions-container">
                <h2>Instructions</h2>
                <ul className="instructions-list">
                  <li>
                    <p>Upload a file and let the <i>Magic</i> begin!</p>
                    <ul className="sub-instructions">
                      <li>This tool can read data from <b>CSV</b>, <b>Excel</b> files, from a remote <b>TCG Collection</b>, or a <b>Google Spreadsheet</b>, or by <b>pasting text</b> directly on the page.</li>
                      <li>Data may be in any format, as long as the file contains a comma or tab separated header in the first row, with sensible indication on what the column contains (eg. <i>card name</i> and <i>edition</i> as a minimum).</li>
                      <li>For this reason, the most popular CSV files are supported out of the box, <b>TCG</b>, <b>Deckbox</b>, <b>BinderPOS</b>, and <b>Cardsphere</b> among others.</li>
                      <li>You can also upload a list of cards or a decklist, with just the card name only. In this case the most recent printing of the card will be used to populate prices.</li>
                    </ul>
                  </li>
                  <li>
                    <p>The result will be a page containing Retail or Buylist prices from all the available stores on BAN for each recognised card entry.</p>
                    <ul className="sub-instructions">
                      <li>Note that buylist prices are available for our <b>Legacy</b> patrons only.</li>
                      <li>You can filter out unwanted store prices by selecting/deselecting them from the list, pressing CTRL or CMD when clicking on them.</li>
                      <li>Card recognition works best when data strictly follows <b>Scryfall</b> notation. If it fails, try finding your card there and tweaking your entry accordingly.</li>
                    </ul>
                  </li>
                  <li>
                    <p>If you prefer to download a CSV of your results, instead of browsing them on BAN, you may hit the "Get CSV" button.</p>
                  </li>
                  <li>
                    <p>The CSV will contain all parsed data and pricing available, including the loaded price and condition, but also a custom <b>Notes</b> field.</p>
                  </li>
                </ul>
              </div>
            ) : (
              // Search results would be rendered here
              <div className="search-results">
                {/* This would be where the upload results are displayed */}
                {/* For brevity, I'm not implementing the full results table here */}
                <p className="results-placeholder">Search results would be displayed here</p>
              </div>
            )}
            
            {(hasReserved || hasStocks || hasSypList) && (
              <div className="legend">
                {hasReserved && <p>* = Part of the <a href="https://mtg.gamepedia.com/Reserved_List">Reserved List</a></p>}
                {hasStocks && <p>• = On <a href="https://mtgstocks.com/interests">MTGStocks Interests</a> page</p>}
                {hasSypList && <p>† = Found in the <a href="https://help.tcgplayer.com/hc/en-us/articles/360054178934-Store-Your-Products-SYP-Pull-Sheet">SYP Pull Sheet</a></p>}
              </div>
            )}
            
            {infoMessage && (
              <div className="info-message">
                <h4><i>{infoMessage}</i></h4>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;