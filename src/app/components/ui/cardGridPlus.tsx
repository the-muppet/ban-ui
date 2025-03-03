'use client'

// src/components/features/EnhancedCardGrid.tsx
import React, { useState, useEffect } from 'react';
import { useMultipleCardPrices } from '@/app/hooks/banhook';
import { CardWithPriceData } from '@/app/types/mtgban';
import CardGrid, { Card, PriceEntry } from '@/app/components/ui/Grid2';
import '@/styles/card-price-display.css';

interface PriceData {
    id: string;
    prices: {
        retail: {
            vendors: Array<{
                name: string;
                vendorId: string;
                prices: {
                    regular?: { price: number; quantity?: number };
                    foil?: { price: number; quantity?: number };
                    etched?: { price: number; quantity?: number };
                }
            }>;
        };
    };
}

interface EnhancedCardGridProps {
  cards: Card[];
  condKeys: string[];
  indexKeys?: string[];
  onCardHover?: (card: Card) => void;
  pagination?: {
    currentIndex: number;
    totalIndex: number;
    prevIndex: number;
    nextIndex: number;
    searchQuery: string;
    searchSort: string;
    reverseMode: boolean;
  };
}

const EnhancedCardGrid: React.FC<EnhancedCardGridProps> = ({
  cards,
  condKeys,
  indexKeys = [],
  onCardHover,
  pagination
}) => {
  // Transform Card objects to format needed for API requests
  const cardsForPrices = cards.map(card => ({
    id: card.uuid, // Assuming uuid is the MTGBAN identifier
    name: card.name,
    set: card.setCode,
    number: card.number
  }));
  
  // Fetch prices for all cards
  const { loading, error, cardsData, refreshAllPrices } = useMultipleCardPrices(cardsForPrices);
  
  // Prepare seller and vendor data for CardGrid
  const [foundSellers, setFoundSellers] = useState<Record<string, Record<string, PriceEntry[]>>>({});
  const [foundVendors, setFoundVendors] = useState<Record<string, Record<string, PriceEntry[]>>>({});
  
  useEffect(() => {
    if (!loading && !error && Object.keys(cardsData).length > 0) {
      const newFoundSellers: Record<string, Record<string, PriceEntry[]>> = {};
      const newFoundVendors: Record<string, Record<string, PriceEntry[]>> = {};
      
      // Process each card data
      Object.entries(cardsData).forEach(([cardId, cardPriceData]: [string, any]) => {
        // Initialize data structures for this card
        newFoundSellers[cardId] = {};
        newFoundVendors[cardId] = {};
        
        condKeys.forEach(condition => {
          newFoundSellers[cardId][condition] = [];
          newFoundVendors[cardPriceData.id][condition] = [];
        });
        
        // Add INDEX category for index prices if indexKeys is provided
        if (indexKeys.length > 0) {
          newFoundSellers[cardPriceData.id]['INDEX'] = [];
        }
        
        // Process retail data (sellers)
        cardPriceData.prices.retail.vendors.forEach((vendor: { prices: { regular: { price: any; quantity: any; }; foil: { price: any; quantity: any; }; }; name: any; vendorId: any; }) => {
          // Process regular prices
          if (vendor.prices.regular) {
            const condition = 'NM'; // Default to NM for now, could be enhanced
            
            const priceEntry: PriceEntry = {
              scraperName: vendor.name,
              shorthand: vendor.vendorId,
              price: vendor.prices.regular.price,
              url: `https://www.mtgban.com/go/${vendor.vendorId}/${cardId}`,
              quantity: vendor.prices.regular.quantity
            };
            
            newFoundSellers[cardPriceData.id][condition].push(priceEntry);
          }
          
          // Repeat for foil and etched if needed
          if (vendor.prices.foil) {
            const condition = 'NM'; // For simplicity, using NM
            
            const priceEntry: PriceEntry = {
              scraperName: `${vendor.name} (Foil)`,
              shorthand: `${vendor.vendorId}_foil`,
              price: vendor.prices.foil.price,
              url: `https://www.mtgban.com/go/${vendor.vendorId}/${cardId}`,
              quantity: vendor.prices.foil.quantity,
            };
            
            newFoundSellers[cardPriceData.id][condition].push(priceEntry);
          }
        });
        
        // Process buylist data (vendors)
        cardPriceData.prices.buylist.vendors.forEach((vendor: { prices: { regular: { price: any; quantity: any; }; foil: { price: any; quantity: any; }; }; name: any; vendorId: any; }) => {
          // Process regular prices
          if (vendor.prices.regular) {
            const condition = 'NM'; 
            
            const priceEntry: PriceEntry = {
              scraperName: `${vendor.name} Buylist`,
              shorthand: vendor.vendorId,
              price: vendor.prices.regular.price,
              url: `https://www.mtgban.com/go/${vendor.vendorId}/${cardId}`,
              quantity: vendor.prices.regular.quantity,
              ratio: cardPriceData.prices.aggregated.spread.regular
            };
            
            newFoundVendors[cardPriceData.id][condition].push(priceEntry);
          }
          
          // Repeat for foil and etched if needed
          if (vendor.prices.foil) {
            const condition = 'NM'; // For simplicity, using NM
            
            const priceEntry: PriceEntry = {
              scraperName: `${vendor.name} Buylist (Foil)`,
              shorthand: `${vendor.vendorId}_foil`,
              price: vendor.prices.foil.price,
              url: `https://www.mtgban.com/go/${vendor.vendorId}/${cardId}`,
              quantity: vendor.prices.foil.quantity,
              ratio: cardPriceData.prices.aggregated.spread.foil
            };
            
            newFoundVendors[cardPriceData.id][condition].push(priceEntry);
          }
        });
        
        // Add index prices if applicable
        if (indexKeys.length > 0) {
          // Add TCG Market as an index price
          if (cardPriceData.prices.aggregated.lowestRetail.regular) {
            const indexEntry: PriceEntry = {
              scraperName: 'TCG Market',
              shorthand: 'TCG_MARKET',
              price: cardPriceData.prices.aggregated.lowestRetail.regular.price,
              url: '',
              noQuantity: true
            };
            
            newFoundSellers[cardPriceData.id]['INDEX'].push(indexEntry);
          }
          
          // Add highest buylist as an index
          if (cardPriceData.prices.aggregated.highestBuylist.regular) {
            const indexEntry: PriceEntry = {
              scraperName: 'Best Buylist',
              shorthand: 'BEST_BUY',
              price: cardPriceData.prices.aggregated.highestBuylist.regular.price,
              url: '',
              noQuantity: true
            };
            
            newFoundSellers[cardPriceData.id]['INDEX'].push(indexEntry);
          }
        }
      });
      
      setFoundSellers(newFoundSellers);
      setFoundVendors(newFoundVendors);
    }
  }, [cardsData, loading, error, condKeys, indexKeys]);
  
  // Display loading or error state
  if (loading && Object.keys(foundSellers).length === 0) {
    return <div className="price-loading">Loading price data...</div>;
  }
  
  if (error && Object.keys(foundSellers).length === 0) {
    return (
      <div className="price-error">
        <p>Error loading price data: {error}</p>
        <button className="retry-button" onClick={refreshAllPrices}>Retry</button>
      </div>
    );
  }
  
  // Enhance the cards with price data status
  const enhancedCards = cards.map(card => ({
    ...card,
    priceDataLoaded: Object.keys(foundSellers).includes(card.id)
  }));
  
  return (
    <div className="enhanced-card-grid">
      {Object.keys(foundSellers).length > 0 ? (
        <CardGrid
          cards={enhancedCards}
          foundSellers={foundSellers}
          foundVendors={foundVendors}
          condKeys={condKeys}
          indexKeys={indexKeys}
          onCardHover={onCardHover}
          pagination={pagination}
        />
      ) : (
        <CardGrid
          cards={enhancedCards}
          foundSellers={{}}
          foundVendors={{}}
          condKeys={condKeys}
          indexKeys={indexKeys}
          onCardHover={onCardHover}
          pagination={pagination}
        />
      )}
      
      {Object.keys(foundSellers).length === 0 && Object.keys(foundVendors).length === 0 && !loading && (
        <div className="price-refresh-container">
          <button className="refresh-all-button" onClick={refreshAllPrices}>
            Load Price Data
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedCardGrid;