interface TrendingMarketPricePercentages {
    sevenDay: string;
    thirtyDay: string;
    sixtyDay: string;
    ninetyDay: string;
}

interface PriceBucket {
    marketPrice: string;
    quantitySold: string;
    lowSalePrice: string;
    lowSalePriceWithShipping: string;
    highSalePrice: string;
    highSalePriceWithShipping: string;
    transactionCount: string;
    bucketStartDate: string;
}

interface MarketData {
    skuId: string;
    variant: string;
    language: string;
    condition: string;
    averageDailyQuantitySold: string;
    averageDailyTransactionCount: string;
    totalQuantitySold: string;
    totalTransactionCount: string;
    trendingMarketPricePercentages: TrendingMarketPricePercentages;
    buckets: PriceBucket[];
}

interface PriceHistoryResponse {
    count: number;
    result: MarketData[];
}

// Scryfall API Types
interface ScryfallCard {
    object: "card";
    id: string;
    oracle_id: string;
    multiverse_ids: number[];
    mtgo_id?: number;
    mtgo_foil_id?: number;
    tcgplayer_id?: number;
    cardmarket_id?: number;
    name: string;
    lang: string;
    released_at: string;
    uri: string;
    scryfall_uri: string;
    layout: string;
    highres_image: boolean;
    image_status: string;
    image_uris?: {
        small: string;
        normal: string;
        large: string;
        png: string;
        art_crop: string;
        border_crop: string;
    };
    mana_cost?: string;
    cmc: number;
    type_line: string;
    oracle_text: string;
    colors: string[];
    color_identity: string[];
    keywords: string[];
    legalities: {
        standard: string;
        future: string;
        historic: string;
        timeless: string;
        gladiator: string;
        pioneer: string;
        explorer: string;
        modern: string;
        legacy: string;
        pauper: string;
        vintage: string;
        penny: string;
        commander: string;
        oathbreaker: string;
        standardbrawl: string;
        brawl: string;
        alchemy: string;
        paupercommander: string;
        duel: string;
        oldschool: string;
        premodern: string;
        predh: string;
    };
    games: string[];
    reserved: boolean;
    game_changer: boolean;
    foil: boolean;
    nonfoil: boolean;
    finishes: string[];
    oversized: boolean;
    promo: boolean;
    reprint: boolean;
    variation: boolean;
    set_id: string;
    set: string;
    set_name: string;
    set_type: string;
    set_uri: string;
    set_search_uri: string;
    scryfall_set_uri: string;
    rulings_uri: string;
    prints_search_uri: string;
    collector_number: string;
    digital: boolean;
    rarity: string;
    watermark?: string;
    flavor_text?: string;
    card_back_id: string;
    artist: string;
    artist_ids: string[];
    illustration_id: string;
    border_color: string;
    frame: string;
    full_art: boolean;
    textless: boolean;
    booster: boolean;
    story_spotlight: boolean;
    edhrec_rank?: number;
    penny_rank?: number;
    prices: {
        usd?: string;
        usd_foil?: string;
        usd_etched?: string;
        eur?: string;
        eur_foil?: string;
        tix?: string;
    };
    related_uris: {
        gatherer?: string;
        tcgplayer_infinite_articles?: string;
        tcgplayer_infinite_decks?: string;
        edhrec?: string;
    };
    purchase_uris: {
        tcgplayer?: string;
        cardmarket?: string;
        cardhoarder?: string;
    };
}

interface ScryfallSearchResponse {
    data: ScryfallCard[];
    has_more: boolean;
    next_page?: string;
    total_cards: number;
}

// Summary model combining Scryfall and TCGPlayer data
interface CardSummary {
    name: string;
    setName: string;
    setCode: string;
    condition: string;
    variant: string;
    averagePrice: number;
    totalSold: number;
    totalTransactions: number;
    dailyAverageSold: number;
    dailyAverageTransactions: number;
    priceTrends: {
        sevenDay: number;
        thirtyDay: number;
        sixtyDay: number;
        ninetyDay: number;
    };
    imageUrl?: string;
    usingScryfallPrices: boolean; // Flag to indicate if we're using Scryfall prices
    scryfallPrices?: {
        usd?: string;
        usd_foil?: string;
        eur?: string;
        eur_foil?: string;
    };
}

// Type for Recharts time series data
interface PriceTimeSeriesData {
    date: string;
    marketPrice: number;
    lowPrice: number;
    highPrice: number;
    quantity: number;
    transactions: number;
}

// Utility function to transform MarketData for Recharts
function transformToTimeSeries(marketData: MarketData): PriceTimeSeriesData[] {
    return marketData.buckets.map(bucket => ({
        date: bucket.bucketStartDate,
        marketPrice: parseFloat(bucket.marketPrice),
        lowPrice: parseFloat(bucket.lowSalePrice),
        highPrice: parseFloat(bucket.highSalePrice),
        quantity: parseInt(bucket.quantitySold),
        transactions: parseInt(bucket.transactionCount)
    }));
}

// Utility function to create a card summary
function createCardSummary(scryfallCard: ScryfallCard, marketData?: MarketData): CardSummary {
    const usingScryfallPrices = !marketData;
    
    // If we have TCGPlayer data, use it
    if (marketData) {
        return {
            name: scryfallCard.name,
            setName: scryfallCard.set_name,
            setCode: scryfallCard.set,
            condition: marketData.condition,
            variant: marketData.variant,
            averagePrice: parseFloat(marketData.buckets[0]?.marketPrice || '0'),
            totalSold: parseInt(marketData.totalQuantitySold),
            totalTransactions: parseInt(marketData.totalTransactionCount),
            dailyAverageSold: parseFloat(marketData.averageDailyQuantitySold),
            dailyAverageTransactions: parseFloat(marketData.averageDailyTransactionCount),
            priceTrends: {
                sevenDay: parseFloat(marketData.trendingMarketPricePercentages.sevenDay),
                thirtyDay: parseFloat(marketData.trendingMarketPricePercentages.thirtyDay),
                sixtyDay: parseFloat(marketData.trendingMarketPricePercentages.sixtyDay),
                ninetyDay: parseFloat(marketData.trendingMarketPricePercentages.ninetyDay)
            },
            imageUrl: scryfallCard.image_uris?.normal,
            usingScryfallPrices: false
        };
    }
    
    // Fallback to Scryfall prices
    const price = scryfallCard.variant === 'Foil' 
        ? parseFloat(scryfallCard.prices.usd_foil || '0')
        : parseFloat(scryfallCard.prices.usd || '0');
        
    return {
        name: scryfallCard.name,
        setName: scryfallCard.set_name,
        setCode: scryfallCard.set,
        condition: 'Unknown', // Scryfall doesn't provide condition info
        variant: scryfallCard.variant || 'Normal',
        averagePrice: price,
        totalSold: 0,
        totalTransactions: 0,
        dailyAverageSold: 0,
        dailyAverageTransactions: 0,
        priceTrends: {
            sevenDay: 0,
            thirtyDay: 0,
            sixtyDay: 0,
            ninetyDay: 0
        },
        imageUrl: scryfallCard.image_uris?.normal,
        usingScryfallPrices: true,
        scryfallPrices: scryfallCard.prices
    };
}

async function searchScryfall(query: string): Promise<ScryfallSearchResponse> {
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Failed to search Scryfall: ${response.statusText}`);
    }
    return response.json();
}

async function fetchPriceHistory(productId: string, range: 'day' | 'week' | 'month' = 'month'): Promise<PriceHistoryResponse> {
    const response = await fetch(`https://infinite-api.tcgplayer.com/price/history/${productId}/detailed?range=${range}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch price history: ${response.statusText}`);
    }
    return response.json();
}

// Combined function to fetch card data with fallback
async function fetchCardData(query: string): Promise<CardSummary> {
    try {
        // First search Scryfall
        const scryfallResponse = await searchScryfall(query);
        const card = scryfallResponse.data[0];
        
        if (!card) {
            throw new Error('No card found');
        }

        // Try to get TCGPlayer data if we have an ID
        if (card.tcgplayer_id) {
            try {
                const priceResponse = await fetchPriceHistory(card.tcgplayer_id.toString());
                const marketData = priceResponse.result[0];
                return createCardSummary(card, marketData);
            } catch (error) {
                console.warn('TCGPlayer API failed, falling back to Scryfall prices:', error);
                return createCardSummary(card);
            }
        }

        // No TCGPlayer ID, use Scryfall prices
        return createCardSummary(card);
    } catch (error) {
        throw new Error(`Failed to fetch card data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export type { 
    MarketData, 
    TrendingMarketPricePercentages, 
    PriceBucket, 
    PriceTimeSeriesData, 
    PriceHistoryResponse,
    ScryfallCard,
    ScryfallSearchResponse,
    CardSummary 
};
export { transformToTimeSeries, fetchPriceHistory, searchScryfall, createCardSummary, fetchCardData }; 