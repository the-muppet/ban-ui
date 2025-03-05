'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './CardGrid.css';

// Types
export interface Card {
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
}

export interface PriceEntry {
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
}

interface CardGridProps {
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
}

const CardGrid: React.FC<CardGridProps> = ({
  cards,
  foundSellers,
  foundVendors,
  condKeys,
  indexKeys = [],
  onCardHover,
  pagination,
}) => {
  const [lastSoldCardIds, setLastSoldCardIds] = useState<Set<string>>(new Set());
  const [lastSoldData, setLastSoldData] = useState<Record<string, any[]>>({});
  const [isLoadingLastSold, setIsLoadingLastSold] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to copy:', error);
      return Promise.reject(error);
    }
  };

  const getLastSold = async (uuid: string): Promise<void> => {
    if (lastSoldCardIds.has(uuid) || isLoadingLastSold[uuid]) return;

    try {
      setIsLoadingLastSold(prev => ({ ...prev, [uuid]: true }));
      const response = await fetch(`/api/tcgplayer/lastsold/${uuid}`);
      
      if (response.ok) {
        const data = await response.json();
        setLastSoldData(prev => ({ ...prev, [uuid]: data || [] }));
        setLastSoldCardIds(prev => new Set(prev).add(uuid));
      }
    } catch (error) {
      console.error('Error fetching last sold data:', error);
    } finally {
      setIsLoadingLastSold(prev => ({ ...prev, [uuid]: false }));
    }
  };

  return (
    <div className="card-grid">
      <table className="card-grid-table">
        <tbody>
          {cards.map((card) => (
            <React.Fragment key={card.id}>
              {/* Card Header */}
              <tr
                className="card-header-row"
                onMouseOver={() => onCardHover?.(card)}
              >
                <td colSpan={3} className="card-header-cell">
                  <div className="card-header-content">
                    <Link href={`/search?q=s:${card.setCode}`} className="set-symbol-link">
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

                    <div className="card-info">
                      <Link
                        href={card.searchURL}
                        className="card-name-link"
                      >
                        {card.name}
                        {card.variant && <span className="card-variant">({card.variant})</span>}
                        {card.flag && <span className="card-flag">{card.flag}</span>}
                        {card.reserved && <span className="card-reserved">*</span>}
                        {card.stocks && <span className="card-stocks">•</span>}
                        {card.sypList && <span className="card-syp">†</span>}
                      </Link>

                      <div className="card-set">
                        <Link href={`?q=s:${card.setCode}`} className="card-set-link">
                          {card.title}
                        </Link>
                      </div>
                    </div>

                    <div className="card-tools">
                      <button
                        className="card-tool-button"
                        onClick={() => copyToClipboard(card.name)}
                        title="Copy to clipboard"
                      >
                        📝
                      </button>

                      {card.uuid && (
                        <button
                          className="card-tool-button"
                          onClick={() => getLastSold(card.uuid)}
                          title="Get last sold data"
                        >
                          💸
                        </button>
                      )}

                      <Link
                        href={`/search?chart=${card.id}`}
                        className="card-tool-button"
                        title="See price history"
                      >
                        📊
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Card Data */}
              <tr className="card-data-row">
                {/* Sellers Column */}
                <td className="card-data-cell">
                  <h4 className="column-title">Sellers</h4>
                  <div className="prices-container">
                    {condKeys.map((condition) => {
                      const entries = foundSellers[card.id]?.[condition] || [];
                      if (entries.length === 0) return null;

                      return (
                        <div key={`${card.id}-${condition}-sellers`} className="condition-group">
                          {condition !== "INDEX" && (
                            <div className="condition-label">
                              Condition: {condition}
                            </div>
                          )}

                          {entries.map((entry, idx) => (
                            <div key={`${card.id}-${condition}-seller-${idx}`} className="price-entry">
                              <Link
                                href={entry.url || '#'}
                                className={`seller-name ${entry.url ? 'has-link' : 'no-link'}`}
                                target="_blank"
                                rel="nofollow"
                              >
                                {entry.scraperName} {entry.country || ''}
                              </Link>
                              <div className="price-info">
                                <span className="price-value">${entry.price.toFixed(2)}</span>
                                {!entry.noQuantity && (
                                  <span className="quantity-value">{entry.quantity || 0}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </td>

                {/* Buyers Column */}
                <td className="card-data-cell">
                  <h4 className="column-title">Buyers</h4>
                  <div className="prices-container">
                    {condKeys.map((condition) => {
                      const entries = foundVendors[card.id]?.[condition] || [];
                      if (entries.length === 0 || condition === "INDEX") return null;

                      return (
                        <div key={`${card.id}-${condition}-vendors`} className="condition-group">
                          <div className="condition-label">
                            Condition: {condition}
                          </div>

                          {entries.map((entry, idx) => (
                            <div key={`${card.id}-${condition}-vendor-${idx}`} className="price-entry">
                              <Link
                                href={entry.url || '#'}
                                className={`seller-name ${entry.url ? 'has-link' : 'no-link'}`}
                                target="_blank"
                                rel="nofollow"
                              >
                                {entry.scraperName} {entry.country || ''}
                              </Link>
                              <div className="price-info">
                                <span 
                                  className="price-value" 
                                  title={entry.credit ? `Credit: $${entry.credit.toFixed(2)}` : ''}
                                >
                                  ${entry.price.toFixed(2)}
                                </span>
                                {entry.ratio && condition === "NM" && (
                                  <span className="ratio-value">{entry.ratio.toFixed(2)}%</span>
                                )}
                                {entry.quantity && condition === "NM" && (
                                  <span className="quantity-value">{entry.quantity}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </td>

                {/* Last Sales Column */}
                <td className="card-data-cell">
                  {lastSoldCardIds.has(card.uuid) && (
                    <div>
                      <h4 className="column-title">Last Sales</h4>
                      <div className="last-sales-container">
                        {isLoadingLastSold[card.uuid] ? (
                          <div className="loading-indicator">Loading...</div>
                        ) : lastSoldData[card.uuid]?.length > 0 ? (
                          <table className="last-sales-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Condition</th>
                                <th>Price</th>
                                <th>Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lastSoldData[card.uuid].map((sale, index) => (
                                <tr key={index}>
                                  <td>{new Date(sale.orderDate).toLocaleDateString()}</td>
                                  <td>{sale.condition?.replace(/[^A-Z]/g, '').replace('LP', 'SP')}</td>
                                  <td>${(sale.purchasePrice + (sale.shippingPrice / sale.quantity)).toFixed(2)}</td>
                                  <td>{sale.quantity}x</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="no-sales">No recent sales data available</div>
                        )}
                      </div>
                    </div>
                  )}

                  {indexKeys.length > 0 && (
                    <div className="index-prices">
                      <h4 className="column-title">Index Prices</h4>
                      <div className="index-list">
                        {indexKeys.map((indexKey) => {
                          const indexEntry = foundSellers[card.id]?.["INDEX"]?.find(e => e.shorthand === indexKey);

                          return (
                            <div key={`${card.id}-index-${indexKey}`} className="index-entry">
                              <span className="index-name">{indexKey}:</span>
                              <span className="index-value">
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
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <div className="pagination-controls">
            {pagination.currentIndex > 1 && (
              <>
                <Link
                  href={`?q=${pagination.searchQuery}&p=1&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                  className="pagination-link"
                >
                  &lt;
                </Link>
                <Link
                  href={`?q=${pagination.searchQuery}&p=${pagination.prevIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                  className="pagination-link"
                >
                  <i className="arrow left"></i>
                </Link>
              </>
            )}

            <span className="pagination-info">
              {pagination.currentIndex} / {pagination.totalIndex}
            </span>

            {pagination.currentIndex < pagination.totalIndex && (
              <>
                <Link
                  href={`?q=${pagination.searchQuery}&p=${pagination.nextIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                  className="pagination-link"
                >
                  <i className="arrow right"></i>
                </Link>
                <Link
                  href={`?q=${pagination.searchQuery}&p=${pagination.totalIndex}&sort=${pagination.searchSort}&reverse=${pagination.reverseMode}`}
                  className="pagination-link"
                >
                  &gt;
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <div className="back-to-top">
        <a href="#top" className="back-to-top-link">
          <i className="arrow up"></i> back to top
        </a>
      </div>
    </div>
  );
};

export default CardGrid;