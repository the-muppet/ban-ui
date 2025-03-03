// src/types/mtgban-api.ts

/**
 * Available endpoints for the MTG BAN API
 */
export type ApiEndpoint = 'retail' | 'buylist' | 'all';

/**
 * Available ID systems for card identification
 */
export type IdSystem = 'tcg' | 'scryfall' | 'mtgjson' | 'mkm' | 'ck' | 'mtgban';

/**
 * Card conditions available in the API
 */
export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'PO';

/**
 * Card finishes available in the API
 */
export type CardFinish = 'regular' | 'foil' | 'etched';

/**
 * Basic price entry structure
 */
export interface PriceEntry {
  regular?: number;
  foil?: number;
  etched?: number;
  qty?: number;
  qty_foil?: number;
  qty_etched?: number;
  conditions?: {
    [K in CardCondition | `${CardCondition}_foil` | `${CardCondition}_etched`]?: number;
  };
}

/**
 * Structure of the API response
 */
export interface MtgBanApiResponse {
  error: string;
  meta: {
    date: string;
    version: string;
    base_url: string;
  };
  retail?: {
    [cardId: string]: {
      [vendorId: string]: PriceEntry;
    };
  };
  buylist?: {
    [cardId: string]: {
      [vendorId: string]: PriceEntry;
    };
  };
}

/**
 * Parameters for API requests
 */
export interface ApiRequestParams {
  sig: string;
  id?: IdSystem;
  qty?: boolean;
  vendor?: string;
  conds?: boolean;
}

/**
 * Simplified price data for a card
 */
export interface CardPriceData {
  cardId: string;
  vendors: {
    vendorId: string;
    name: string;
    prices: {
      regular?: {
        price: number;
        quantity?: number;
        conditions?: {
          [condition in CardCondition]?: number;
        };
      };
      foil?: {
        price: number;
        quantity?: number;
        conditions?: {
          [condition in CardCondition]?: number;
        };
      };
      etched?: {
        price: number;
        quantity?: number;
        conditions?: {
          [condition in CardCondition]?: number;
        };
      };
    };
  }[];
}

/**
 * Aggregated price data for a card
 */
export interface AggregatedPriceData {
  lowestRetail: {
    regular?: { price: number; vendor: string; };
    foil?: { price: number; vendor: string; };
    etched?: { price: number; vendor: string; };
  };
  highestBuylist: {
    regular?: { price: number; vendor: string; };
    foil?: { price: number; vendor: string; };
    etched?: { price: number; vendor: string; };
  };
  spread: {
    regular?: number;
    foil?: number;
    etched?: number;
  };
}

/**
 * Complete card data with pricing information
 */
export interface CardWithPriceData {
  id: string;
  name: string;
  set: string;
  number: string;
  prices: {
    retail: CardPriceData;
    buylist: CardPriceData;
    aggregated: AggregatedPriceData;
  };
}