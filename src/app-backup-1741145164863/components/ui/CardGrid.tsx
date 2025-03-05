// src/components/features/CardGrid.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '@/app/styles/CardGrid.css';

// Types
export type Card = {
    id: string;
    uuid: string;
    name: string;
    setCode: string;
    setName: string;
    number: string;
    keyrune?: string; // for set symbol
    imageURL: string;
    searchURL: string;
    variant?: string;
    foil?: boolean;
    etched?: boolean;
    reserved?: boolean;
    stocks?: boolean;
    sypList?: boolean;
    title: string;
    flag?: string;
};

export type PriceEntry = {
    scraperName: string;
    shorthand: string;
    price: number;
    url: string;
    country?: string;
    quantity?: number;
    credit?: number;
    ratio?: number;
    bundleIcon?: string;
    noQuantity?: boolean;
    secondary?: number;
    extraValues?: Record<string, number>;
};

type CardGridProps = {
    cards: Card[];
    foundSellers: Record<string, Record<string, PriceEntry[]>>;
    foundVendors: Record<string, Record<string, PriceEntry[]>>;
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
};

export default function CardGrid({
    cards,
    foundSellers,
    foundVendors,
    condKeys,
    indexKeys = [],
    onCardHover,
    pagination,
}: CardGridProps) {
    const [lastSoldCard, setLastSoldCard] = useState<string | null>(null);

    const copyToClipboard = async (text: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const getLastSold = async (uuid: string): Promise<void> => {
        if (lastSoldCard === uuid) return;

        try {
            const response = await fetch(`/api/tcgplayer/lastsold/${uuid}`);
            if (response.ok) {
                setLastSoldCard(uuid);
            }
        } catch (error) {
            console.error('Error fetching last sold data:', error);
        }
    };

    return (

        <div className="w-full">
            <table className="w-full border-collapse">
                <tbody>
                    {cards.map((card) => (
                        <>
                            <tr
                                key={card.id}
                                onMouseOver={() => onCardHover?.(card)}
                                className="border-b border-gray-200"
                            >
                                <td colSpan={3} className="p-4 sticky top-32 bg-headerbackground z-10">
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/search?q=s:${card.setCode}`} className="shrink-0">
                                            {card.keyrune ? (
                                                <i className={`ss ss-${card.keyrune} ss-2x ss-fw`}></i>
                                            ) : (
                                                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                                                    <circle r="15" cx="16" cy="16" fill="var(--normal)" />
                                                    <text fontSize="20" x="50%" y="60%" textAnchor="middle" fill="var(--background)">
                                                        {card.setCode}
                                                    </text>
                                                </svg>
                                            )}
                                        </Link>

                                        <div className="flex-grow">
                                            <Link
                                                href={card.searchURL}
                                                className="text-lg font-medium hover:underline"
                                            >
                                                {card.name}
                                                {card.variant && <span className="italic ml-1">({card.variant})</span>}
                                                {card.flag && <span className="ml-1">{card.flag}</span>}
                                                {card.reserved && <span className="ml-1">*</span>}
                                                {card.stocks && <span className="ml-1">•</span>}
                                                {card.sypList && <span className="ml-1">†</span>}
                                            </Link>

                                            <div className="text-sm">
                                                <Link href={`?q=s:${card.setCode}`} className="hover:underline">
                                                    {card.title}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                onClick={() => copyToClipboard(card.name)}
                                                title="Copy to clipboard"
                                            >
                                                📝
                                            </button>

                                            {card.uuid && (
                                                <button
                                                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                    onClick={() => getLastSold(card.uuid)}
                                                    title="Get last sold data"
                                                >
                                                    💸
                                                </button>
                                            )}

                                            <Link
                                                href={`/search?chart=${card.id}`}
                                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                title="See price history"
                                            >
                                                📊
                                            </Link>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td className="p-4 align-top w-1/3">
                                    <h4 className="font-medium mb-2">Sellers</h4>
                                    <div className="space-y-2">
                                        {condKeys.map((condition) => {
                                            const entries = foundSellers[card.id]?.[condition] || [];
                                            if (entries.length === 0) return null;

                                            return (
                                                <div key={`${card.id}-${condition}-sellers`}>
                                                    {condition !== "INDEX" && (
                                                        <div className="font-medium text-sm py-1">
                                                            Condition: {condition}
                                                        </div>
                                                    )}

                                                    {entries.map((entry, idx) => (
                                                        <div key={`${card.id}-${condition}-seller-${idx}`} className="flex justify-between items-center py-1">
                                                            <Link
                                                                href={entry.url || '#'}
                                                                className={`text-sm hover:underline ${entry.url ? 'text-ainfo' : 'text-gray-500'}`}
                                                                target="_blank"
                                                                rel="nofollow"
                                                            >
                                                                {entry.scraperName} {entry.country || ''}
                                                            </Link>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="font-medium">${entry.price.toFixed(2)}</span>
                                                                {!entry.noQuantity && (
                                                                    <span className="text-sm">{entry.quantity || 0}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>

                                <td className="p-4 align-top w-1/3">
                                    <h4 className="font-medium mb-2">Buyers</h4>
                                    <div className="space-y-2">
                                        {condKeys.map((condition) => {
                                            const entries = foundVendors[card.id]?.[condition] || [];
                                            if (entries.length === 0 || condition === "INDEX") return null;

                                            return (
                                                <div key={`${card.id}-${condition}-vendors`}>
                                                    <div className="font-medium text-sm py-1">
                                                        Condition: {condition}
                                                    </div>

                                                    {entries.map((entry, idx) => (
                                                        <div key={`${card.id}-${condition}-vendor-${idx}`} className="flex justify-between items-center py-1">
                                                            <Link
                                                                href={entry.url || '#'}
                                                                className={`text-sm hover:underline ${entry.url ? 'text-ainfo' : 'text-gray-500'}`}
                                                                target="_blank"
                                                                rel="nofollow"
                                                            >
                                                                {entry.scraperName} {entry.country || ''}
                                                            </Link>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="font-medium" title={entry.credit ? `Credit: $${entry.credit.toFixed(2)}` : ''}>
                                                                    ${entry.price.toFixed(2)}
                                                                </span>
                                                                {entry.ratio && condition === "NM" && (
                                                                    <span className="text-sm">{entry.ratio.toFixed(2)}%</span>
                                                                )}
                                                                {entry.quantity && condition === "NM" && (
                                                                    <span className="text-sm">{entry.quantity}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>

                                <td className="p-4 align-top w-1/3">
                                    {lastSoldCard === card.uuid && (
                                        <div>
                                            <h4 className="font-medium mb-2">Last Sales</h4>
                                            <div id={card.uuid} className="bg-gray-50 p-2 rounded">
                                                Loading...
                                            </div>
                                        </div>
                                    )}

                                    {indexKeys.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Index Prices</h4>
                                            <div className="space-y-1">
                                                {indexKeys.map((indexKey) => {
                                                    const indexEntry = foundSellers[card.id]?.["INDEX"]?.find(e => e.shorthand === indexKey);

                                                    return (
                                                        <div key={`${card.id}-index-${indexKey}`} className="flex justify-between">
                                                            <span className="text-sm">{indexKey}:</span>
                                                            <span className="font-medium">
                                                                {indexEntry ? `$${indexEntry.price.toFixed(2)}` : 'N/A'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
            {pagination && (
                <div className="flex justify-center items-center p-4 bg-headerbackground sticky bottom-0">
                    <div className="flex items-center space-x-2">
                        {pagination.currentIndex > 1 && (
                            <>
                                <Link
                                    href={`?q=${pagination.searchQuery}&p=1&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                >
                                    &lt;
                                </Link>
                                <Link
                                    href={`?q=${pagination.searchQuery}&p=${pagination.prevIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                >
                                    <i className="arrow left"></i>
                                </Link>
                            </>
                        )}

                        <span>
                            {pagination.currentIndex} / {pagination.totalIndex}
                        </span>

                        {pagination.currentIndex < pagination.totalIndex && (
                            <>
                                <Link
                                    href={`?q=${pagination.searchQuery}&p=${pagination.nextIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                >
                                    <i className="arrow right"></i>
                                </Link>
                                <Link
                                    href={`?q=${pagination.searchQuery}&p=${pagination.totalIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                                    className="px-2 py-1 rounded hover:bg-gray-200"
                                >
                                    &gt;
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

