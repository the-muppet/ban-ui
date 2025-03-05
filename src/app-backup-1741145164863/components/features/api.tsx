// src/services/mtgban-api.ts
import { 
    ApiEndpoint, 
    ApiRequestParams, 
    CardPriceData,
    MtgBanApiResponse,
    AggregatedPriceData,
    CardWithPriceData,
    CardFinish
  } from '../../types/mtgban';
  
  /**
   * Base URL for the MTG BAN API
   */
  const API_BASE_URL = 'https://www.mtgban.com/api/mtgban';
  
  /**
   * API signature required for authentication
   */
  const API_SIGNATURE = process.env.MTGBAN_API_SIGNATURE || '';
  
  /**
   * Known vendor names mapping (to be extended as needed)
   */
  const VENDOR_NAMES: Record<string, string> = {
    'CK': 'Card Kingdom',
    'TCG': 'TCGPlayer',
    'SCG': 'Star City Games',
    'CFB': 'Channel Fireball',
    'CBA': 'Cool Stuff Inc',
    'MKM': 'Cardmarket',
    // Add more vendors as needed
  };
  
  /**
   * Builds the URL for an API request
   * 
   * @param endpoint API endpoint (retail, buylist, all)
   * @param identifier Card ID or set code
   * @param params Additional parameters
   * @returns Full API URL
   */
  export function buildApiUrl(
    endpoint: ApiEndpoint,
    identifier: string,
    params: Partial<ApiRequestParams> = {}
  ): string {
    // Start with the base URL and endpoint
    let url = `${API_BASE_URL}/${endpoint}/${identifier}.json`;
    
    // Add the signature parameter
    const queryParams = new URLSearchParams();
    queryParams.append('sig', params.sig || API_SIGNATURE);
    
    // Add other optional parameters
    if (params.id) queryParams.append('id', params.id);
    if (params.qty) queryParams.append('qty', 'true');
    if (params.vendor) queryParams.append('vendor', params.vendor);
    if (params.conds) queryParams.append('conds', 'true');
    
    // Append the query string to the URL
    return `${url}?${queryParams.toString()}`;
  }
  
  /**
   * Builds a redirect URL to a vendor's card page
   * 
   * @param vendorTag Vendor tag (e.g., 'CK' for Card Kingdom)
   * @param cardId Card identifier
   * @returns Redirect URL
   */
  export function buildRedirectUrl(vendorTag: string, cardId: string): string {
    return `https://www.mtgban.com/go/${vendorTag}/${cardId}`;
  }
  
  /**
   * Fetches price data from the MTG BAN API
   * 
   * @param endpoint API endpoint (retail, buylist, all)
   * @param identifier Card ID or set code
   * @param params Additional parameters
   * @returns Promise with the API response
   */
  export async function fetchPriceData(
    endpoint: ApiEndpoint,
    identifier: string,
    params: Partial<ApiRequestParams> = {}
  ): Promise<MtgBanApiResponse> {
    const url = buildApiUrl(endpoint, identifier, params);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        switch (response.status) {
          case 301:
            throw new Error('Request must be made over HTTPS');
          case 492:
            throw new Error('Too many requests. Please perform fewer requests at the same time');
          case 502:
            throw new Error('Server bootstrap in progress. Please try again later');
          case 503:
            throw new Error('Server loading. Please try again later');
          default:
            throw new Error(`HTTP Error: ${response.status}`);
        }
      }
      
      const data: MtgBanApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(`API Error: ${data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
  }
  
  /**
   * Processes the raw API response into a more usable format
   * 
   * @param data Raw API response
   * @param endpoint Endpoint used for the request
   * @returns Processed card price data
   */
  export function processCardPriceData(
    data: MtgBanApiResponse,
    endpoint: ApiEndpoint
  ): { [cardId: string]: CardPriceData } {
    const result: { [cardId: string]: CardPriceData } = {};
    
    // Process the data based on the endpoint
    const priceData = endpoint === 'buylist' ? data.buylist : data.retail;
    
    if (!priceData) {
      return result;
    }
    
    // Process each card in the response
    Object.keys(priceData).forEach((cardId) => {
      const vendorData = priceData[cardId];
      const vendors: Array<{
        vendorId: string;
        name: string;
        prices: {
          regular?: { price: number; quantity?: number; conditions?: Record<string, number> };
          foil?: { price: number; quantity?: number; conditions?: Record<string, number> };
          etched?: { price: number; quantity?: number; conditions?: Record<string, number> };
        };
      }> = [];
      
      // Process each vendor for this card
      Object.keys(vendorData).forEach((vendorId) => {
        const priceEntry = vendorData[vendorId];
        const vendorName = VENDOR_NAMES[vendorId] || vendorId;
        
        // Create vendor price data
        const vendorPrices: CardPriceData['vendors'][0]['prices'] = {};
        
        // Process regular prices
        if ('regular' in priceEntry) {
          vendorPrices.regular = {
            price: priceEntry.regular!,
            quantity: priceEntry.qty,
            conditions: extractConditions(priceEntry, 'regular')
          };
        }
        
        // Process foil prices
        if ('foil' in priceEntry) {
          vendorPrices.foil = {
            price: priceEntry.foil!,
            quantity: priceEntry.qty_foil,
            conditions: extractConditions(priceEntry, 'foil')
          };
        }
        
        // Process etched prices
        if ('etched' in priceEntry) {
          vendorPrices.etched = {
            price: priceEntry.etched!,
            quantity: priceEntry.qty_etched,
            conditions: extractConditions(priceEntry, 'etched')
          };
        }
        
        vendors.push({
          vendorId: vendorId,
          name: vendorName,
          prices: vendorPrices
        });
      });
      
      // Store the processed data
      result[cardId] = {
        cardId,
        vendors
      };
    });
    
    return result;
  }
  
  /**
   * Extracts condition prices for a specific finish
   * 
   * @param priceEntry Price entry from the API
   * @param finish Card finish (regular, foil, etched)
   * @returns Condition prices if available
   */
  function extractConditions(priceEntry: any, finish: CardFinish) {
    if (!priceEntry.conditions) {
      return undefined;
    }
    
    const conditions: Record<string, number> = {};
    const prefix = finish === 'regular' ? '' : `_${finish}`;
    
    // Extract condition prices for the specified finish
    Object.keys(priceEntry.conditions).forEach((condition) => {
      if (finish === 'regular' && !condition.includes('_')) {
        conditions[condition] = priceEntry.conditions[condition];
      } else if (condition.endsWith(prefix)) {
        const baseCondition = condition.replace(prefix, '');
        conditions[baseCondition] = priceEntry.conditions[condition];
      }
    });
    
    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }
  
  /**
   * Calculates aggregated price data for a card
   * 
   * @param retailData Retail price data
   * @param buylistData Buylist price data
   * @returns Aggregated price metrics
   */
  export function calculateAggregatedPriceData(
    retailData: CardPriceData,
    buylistData: CardPriceData
  ): AggregatedPriceData {
    const result: AggregatedPriceData = {
      lowestRetail: {},
      highestBuylist: {},
      spread: {}
    };
    
    // Find lowest retail prices
    retailData.vendors.forEach(vendor => {
      const { prices } = vendor;
      
      // Check regular prices
      if (prices.regular && (
        !result.lowestRetail.regular || 
        prices.regular.price < result.lowestRetail.regular.price
      )) {
        result.lowestRetail.regular = {
          price: prices.regular.price,
          vendor: vendor.name
        };
      }
      
      // Check foil prices
      if (prices.foil && (
        !result.lowestRetail.foil || 
        prices.foil.price < result.lowestRetail.foil.price
      )) {
        result.lowestRetail.foil = {
          price: prices.foil.price,
          vendor: vendor.name
        };
      }
      
      // Check etched prices
      if (prices.etched && (
        !result.lowestRetail.etched || 
        prices.etched.price < result.lowestRetail.etched.price
      )) {
        result.lowestRetail.etched = {
          price: prices.etched.price,
          vendor: vendor.name
        };
      }
    });
    
    // Find highest buylist prices
    buylistData.vendors.forEach(vendor => {
      const { prices } = vendor;
      
      // Check regular prices
      if (prices.regular && (
        !result.highestBuylist.regular || 
        prices.regular.price > result.highestBuylist.regular.price
      )) {
        result.highestBuylist.regular = {
          price: prices.regular.price,
          vendor: vendor.name
        };
      }
      
      // Check foil prices
      if (prices.foil && (
        !result.highestBuylist.foil || 
        prices.foil.price > result.highestBuylist.foil.price
      )) {
        result.highestBuylist.foil = {
          price: prices.foil.price,
          vendor: vendor.name
        };
      }
      
      // Check etched prices
      if (prices.etched && (
        !result.highestBuylist.etched || 
        prices.etched.price > result.highestBuylist.etched.price
      )) {
        result.highestBuylist.etched = {
          price: prices.etched.price,
          vendor: vendor.name
        };
      }
    });
    
    // Calculate spreads (percentage of retail that the buylist represents)
    if (result.lowestRetail.regular && result.highestBuylist.regular) {
      const retail = result.lowestRetail.regular.price;
      const buylist = result.highestBuylist.regular.price;
      result.spread.regular = parseFloat(((buylist / retail) * 100).toFixed(2));
    }
    
    if (result.lowestRetail.foil && result.highestBuylist.foil) {
      const retail = result.lowestRetail.foil.price;
      const buylist = result.highestBuylist.foil.price;
      result.spread.foil = parseFloat(((buylist / retail) * 100).toFixed(2));
    }
    
    if (result.lowestRetail.etched && result.highestBuylist.etched) {
      const retail = result.lowestRetail.etched.price;
      const buylist = result.highestBuylist.etched.price;
      result.spread.etched = parseFloat(((buylist / retail) * 100).toFixed(2));
    }
    
    return result;
  }
  
  /**
   * Fetches complete price data for a card
   * 
   * @param cardId Card identifier
   * @param params Additional parameters
   * @returns Promise with the complete card price data
   */
  export async function fetchCardWithPrices(
    cardId: string,
    cardName: string,
    cardSet: string,
    cardNumber: string,
    params: Partial<ApiRequestParams> = {}
  ): Promise<CardWithPriceData> {
    // Fetch retail prices
    const retailData = await fetchPriceData('retail', cardId, {
      ...params,
      conds: true
    });
    
    // Fetch buylist prices
    const buylistData = await fetchPriceData('buylist', cardId, {
      ...params,
      conds: true
    });
    
    // Process the data
    const processedRetail = processCardPriceData(retailData, 'retail')[cardId];
    const processedBuylist = processCardPriceData(buylistData, 'buylist')[cardId];
    
    // Calculate aggregated data
    const aggregated = calculateAggregatedPriceData(processedRetail, processedBuylist);
    
    // Return the complete card data
    return {
      id: cardId,
      name: cardName,
      set: cardSet,
      number: cardNumber,
      prices: {
        retail: processedRetail,
        buylist: processedBuylist,
        aggregated
      }
    };
  }
  
  /**
   * Fetches prices for multiple cards in a set
   * 
   * @param setCode Set code (e.g., 'ZEN' for Zendikar)
   * @param params Additional parameters
   * @returns Promise with the set price data
   */
  export async function fetchSetPrices(
    setCode: string,
    params: Partial<ApiRequestParams> = {}
  ): Promise<MtgBanApiResponse> {
    return fetchPriceData('all', setCode, params);
  }
  
  /**
   * Creates a function to handle errors in API requests
   * 
   * @param fallbackValue Value to return if an error occurs
   * @returns Function that executes a callback and returns fallback on error
   */
  export function withErrorHandling<T, F>(
    callback: () => Promise<T>,
    fallbackValue: F,
    errorMessage: string = 'API request failed'
  ): Promise<T | F> {
    return callback().catch(error => {
      console.error(errorMessage, error);
      return fallbackValue;
    });
  }