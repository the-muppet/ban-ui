// src/components/features/CardPriceDisplay.tsx
import React, { useState } from 'react';
import { useCardPrices, usePriceComparison } from '@/app/hooks/banhook';
import { CardFinish } from '@/app/types/mtgban';
import { buildRedirectUrl } from '../features/api';

interface CardPriceDisplayProps {
  cardId: string;
  cardName: string;
  setCode: string;
  setName: string;
  cardNumber: string;
  defaultFinish?: CardFinish;
}

const CardPriceDisplay: React.FC<CardPriceDisplayProps> = ({
  cardId,
  cardName,
  setCode,
  setName,
  cardNumber,
  defaultFinish = 'regular'
}) => {
  const [selectedFinish, setSelectedFinish] = useState<CardFinish>(defaultFinish);
  
  // Fetch card price data
  const { loading, error, priceData, refreshPrices } = useCardPrices(
    cardId,
    cardName,
    setCode,
    cardNumber,
    { conds: true, qty: true }
  );
  
  // Process the price data for comparison
  const priceComparison = usePriceComparison(priceData);
  
  if (loading) {
    return <div className="price-loading">Loading price data...</div>;
  }
  
  if (error) {
    return (
      <div className="price-error">
        <p>Error loading price data: {error}</p>
        <button className="retry-button" onClick={refreshPrices}>Retry</button>
      </div>
    );
  }
  
  if (!priceData) {
    return (
      <div className="price-not-found">
        <p>No price data found for {cardName}</p>
        <button className="retry-button" onClick={refreshPrices}>Retry</button>
      </div>
    );
  }
  
  // Determine if the selected finish is available
  const hasSelectedFinish = priceComparison.sortedRetail[selectedFinish]?.length > 0 ||
    priceComparison.sortedBuylist[selectedFinish]?.length > 0;
  
  // Determine available finishes
  const availableFinishes: CardFinish[] = [];
  if (priceComparison.sortedRetail.regular.length > 0 || priceComparison.sortedBuylist.regular.length > 0) {
    availableFinishes.push('regular');
  }
  if (priceComparison.sortedRetail.foil.length > 0 || priceComparison.sortedBuylist.foil.length > 0) {
    availableFinishes.push('foil');
  }
  if (priceComparison.sortedRetail.etched.length > 0 || priceComparison.sortedBuylist.etched.length > 0) {
    availableFinishes.push('etched');
  }
  
  // If the selected finish isn't available, default to the first available one
  if (!hasSelectedFinish && availableFinishes.length > 0 && !availableFinishes.includes(selectedFinish)) {
    setSelectedFinish(availableFinishes[0]);
  }
  
  return (
    <div className="card-price-display">
      <div className="card-price-header">
        <h3 className="card-price-title">{cardName}</h3>
        <div className="card-price-set">{setName} ({setCode})</div>
        
        {availableFinishes.length > 1 && (
          <div className="finish-selector">
            {availableFinishes.map(finish => (
              <button
                key={finish}
                className={`finish-button ${selectedFinish === finish ? 'selected' : ''}`}
                onClick={() => setSelectedFinish(finish)}
              >
                {finish.charAt(0).toUpperCase() + finish.slice(1)}
              </button>
            ))}
          </div>
        )}
        
        <button className="refresh-button" onClick={refreshPrices} title="Refresh prices">
          ↻
        </button>
      </div>
      
      <div className="price-summary">
        <div className="best-price-container">
          <div className="best-price-section">
            <h4>Best Buy Price</h4>
            {priceComparison.lowestRetailPrices?.[selectedFinish] ? (
              <div className="price-info">
                <span className="price-value">${priceComparison.lowestRetailPrices[selectedFinish].price.toFixed(2)}</span>
                <span className="vendor-name">{priceComparison.lowestRetailPrices[selectedFinish].vendor}</span>
              </div>
            ) : (
              <div className="price-unavailable">Not available</div>
            )}
          </div>
          
          <div className="best-price-section">
            <h4>Best Sell Price</h4>
            {priceComparison.highestBuylistPrices?.[selectedFinish] ? (
              <div className="price-info">
                <span className="price-value">${priceComparison.highestBuylistPrices[selectedFinish].price.toFixed(2)}</span>
                <span className="vendor-name">{priceComparison.highestBuylistPrices[selectedFinish]?.vendor}</span>
              </div>
            ) : (
              <div className="price-unavailable">Not available</div>
            )}
          </div>
          
          {priceComparison.bestDeal[selectedFinish] && (
            <div className="spread-info">
              <div className="spread-label">Spread:</div>
              <div className="spread-value">{priceComparison.bestDeal[selectedFinish]?.toFixed(2)}%</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="price-details">
        <div className="price-column">
          <h4 className="price-column-header">Retailers</h4>
          {priceComparison.sortedRetail[selectedFinish].length > 0 ? (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {priceComparison.sortedRetail[selectedFinish].map((vendor, index) => (
                  <tr key={`retail-${vendor.vendorId}-${index}`}>
                    <td>
                      <a
                        href={buildRedirectUrl(vendor.vendorId, cardId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vendor-link"
                      >
                        {vendor.vendorName}
                      </a>
                    </td>
                    <td className="price-cell">
                      ${getFinishPrice(vendor, selectedFinish)?.toFixed(2)}
                    </td>
                    <td className="quantity-cell">
                      {getFinishQuantity(vendor, selectedFinish) || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">No retail prices available for {selectedFinish} version</div>
          )}
        </div>
        
        <div className="price-column">
          <h4 className="price-column-header">Buylist</h4>
          {priceComparison.sortedBuylist[selectedFinish].length > 0 ? (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {priceComparison.sortedBuylist[selectedFinish].map((vendor, index) => {
                  const price = getFinishPrice(vendor, selectedFinish);
                  const lowestRetail = priceComparison.lowestRetailPrices?.[selectedFinish]?.price;
                  const percentage = price && lowestRetail ? ((price / lowestRetail) * 100).toFixed(1) : '-';
                  
                  return (
                    <tr key={`buylist-${vendor.vendorId}-${index}`}>
                      <td>
                        <a
                          href={buildRedirectUrl(vendor.vendorId, cardId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vendor-link"
                        >
                          {vendor.vendorName}
                        </a>
                      </td>
                      <td className="price-cell">
                        ${price?.toFixed(2)}
                      </td>
                      <td className="percentage-cell">
                        {percentage !== '-' ? `${percentage}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">No buylist prices available for {selectedFinish} version</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get the price for the selected finish
function getFinishPrice(vendor: any, finish: CardFinish): number | undefined {
  switch (finish) {
    case 'regular':
      return vendor.regularPrice;
    case 'foil':
      return vendor.foilPrice;
    case 'etched':
      return vendor.etchedPrice;
    default:
      return undefined;
  }
}

// Helper function to get the quantity for the selected finish
function getFinishQuantity(vendor: any, finish: CardFinish): number | undefined {
  switch (finish) {
    case 'regular':
      return vendor.quantities.regular;
    case 'foil':
      return vendor.quantities.foil;
    case 'etched':
      return vendor.quantities.etched;
    default:
      return undefined;
  }
}

export default CardPriceDisplay;