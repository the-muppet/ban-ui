'use client'

// src/hooks/useMtgPrices.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchCardWithPrices, 
  fetchSetPrices,
  withErrorHandling
} from '../components/features/api';
import type { 
  CardWithPriceData, 
  ApiRequestParams,
  MtgBanApiResponse
} from '../types/mtgban';

/**
 * Hook for fetching card price data
 * 
 * @param cardId Card identifier
 * @param cardName Card name
 * @param cardSet Card set code
 * @param cardNumber Card number in set
 * @param options Additional API request parameters
 */
export function useCardPrices(
  cardId: string,
  cardName: string,
  cardSet: string,
  cardNumber: string,
  options: Partial<ApiRequestParams> = {}
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<CardWithPriceData | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!cardId) {
      setError('Card ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCardWithPrices(cardId, cardName, cardSet, cardNumber, options);
      setPriceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price data');
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  }, [cardId, cardName, cardSet, cardNumber, options]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Function to manually refresh the data
  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { loading, error, priceData, refreshPrices };
}

/**
 * Hook for fetching set price data
 * 
 * @param setCode Set code (e.g., 'ZEN' for Zendikar)
 * @param options Additional API request parameters
 */
export function useSetPrices(
  setCode: string,
  options: Partial<ApiRequestParams> = {}
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setData, setSetData] = useState<MtgBanApiResponse | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!setCode) {
      setError('Set code is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSetPrices(setCode, options);
      setSetData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch set price data');
      setSetData(null);
    } finally {
      setLoading(false);
    }
  }, [setCode, options]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Function to manually refresh the data
  const refreshPrices = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { loading, error, setData, refreshPrices };
}

/**
 * Hook for fetching price data for multiple cards
 * 
 * @param cards Array of card details
 * @param options Additional API request parameters
 */
export function useMultipleCardPrices(
  cards: Array<{
    id: string;
    name: string;
    set: string;
    number: string;
  }>,
  options: Partial<ApiRequestParams> = {}
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardsData, setCardsData] = useState<Record<string, CardWithPriceData>>({});

  const fetchAllPrices = useCallback(async () => {
    if (!cards.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises = cards.map(card => 
        withErrorHandling(
          () => fetchCardWithPrices(card.id, card.name, card.set, card.number, options),
          null,
          `Failed to fetch price data for ${card.name}`
        )
      );

      const results = await Promise.all(promises);
      
      const newCardsData: Record<string, CardWithPriceData> = {};
      results.forEach((result, index) => {
        if (result) {
          newCardsData[cards[index].id] = result;
        }
      });

      setCardsData(newCardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices for multiple cards');
    } finally {
      setLoading(false);
    }
  }, [cards, options]);

  useEffect(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  // Function to manually refresh all data
  const refreshAllPrices = useCallback(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  return { loading, error, cardsData, refreshAllPrices };
}

/**
 * Hook for creating price comparison data between different sellers
 * 
 * @param cardPriceData Card price data from useCardPrices
 */
export function usePriceComparison(cardPriceData: CardWithPriceData | null) {
  // Extract retail price comparisons
  const retailComparison = cardPriceData?.prices.retail.vendors.map(vendor => ({
    vendorId: vendor.vendorId,
    vendorName: vendor.name,
    regularPrice: vendor.prices.regular?.price,
    foilPrice: vendor.prices.foil?.price,
    etchedPrice: vendor.prices.etched?.price,
    quantities: {
      regular: vendor.prices.regular?.quantity,
      foil: vendor.prices.foil?.quantity,
      etched: vendor.prices.etched?.quantity
    }
  })) || [];

  // Extract buylist price comparisons
  const buylistComparison = cardPriceData?.prices.buylist.vendors.map(vendor => ({
    vendorId: vendor.vendorId,
    vendorName: vendor.name,
    regularPrice: vendor.prices.regular?.price,
    foilPrice: vendor.prices.foil?.price,
    etchedPrice: vendor.prices.etched?.price,
    quantities: {
      regular: vendor.prices.regular?.quantity,
      foil: vendor.prices.foil?.quantity,
      etched: vendor.prices.etched?.quantity
    }
  })) || [];

  // Best deal calculation (highest spread)
  const bestDeal = cardPriceData?.prices.aggregated.spread || {};

  // Sort retail by lowest price
  const sortedRetail = {
    regular: [...retailComparison].filter(v => v.regularPrice !== undefined)
      .sort((a, b) => (a.regularPrice || 0) - (b.regularPrice || 0)),
    foil: [...retailComparison].filter(v => v.foilPrice !== undefined)
      .sort((a, b) => (a.foilPrice || 0) - (b.foilPrice || 0)),
    etched: [...retailComparison].filter(v => v.etchedPrice !== undefined)
      .sort((a, b) => (a.etchedPrice || 0) - (b.etchedPrice || 0))
  };

  // Sort buylist by highest price
  const sortedBuylist = {
    regular: [...buylistComparison].filter(v => v.regularPrice !== undefined)
      .sort((a, b) => (b.regularPrice || 0) - (a.regularPrice || 0)),
    foil: [...buylistComparison].filter(v => v.foilPrice !== undefined)
      .sort((a, b) => (b.foilPrice || 0) - (a.foilPrice || 0)),
    etched: [...buylistComparison].filter(v => v.etchedPrice !== undefined)
      .sort((a, b) => (b.etchedPrice || 0) - (a.etchedPrice || 0))
  };

  return {
    retailers: retailComparison,
    buylistVendors: buylistComparison,
    bestDeal,
    sortedRetail,
    sortedBuylist,
    lowestRetailPrices: cardPriceData?.prices.aggregated.lowestRetail,
    highestBuylistPrices: cardPriceData?.prices.aggregated.highestBuylist
  };
}