'use client';

// src/components/features/Newspaper.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/ui/Button';
import '@/app/styles/Newspaper.css';

export interface NewsItem {
  id: string;
  title: string;
  snippet: string;
  content: string;
  date: string;
  imageUrl?: string;
  category: 'market' | 'price-change' | 'new-release' | 'event';
  source?: string;
  links?: Array<{ text: string; url: string }>;
}

export interface PriceMovement {
  cardId: string;
  cardName: string;
  setCode: string;
  oldPrice: number;
  newPrice: number;
  percentChange: number;
  absolute: number;
  date: string;
  vendor: string;
  finish?: 'regular' | 'foil' | 'etched';
  imageURL?: string;
  searchURL?: string;
}

export interface TrendingCard {
  cardId: string;
  cardName: string;
  setCode: string;
  setName: string;
  price: number;
  dailyChange: number;
  weeklyChange: number;
  imageURL?: string;
  searchURL?: string;
}

interface NewspaperProps {
  news?: NewsItem[];
  priceMovements?: PriceMovement[];
  trendingCards?: TrendingCard[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const Newspaper: React.FC<NewspaperProps> = ({
  news = [],
  priceMovements = [],
  trendingCards = [],
  isLoading = false,
  error = null,
  onRefresh
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [showAllMovements, setShowAllMovements] = useState<boolean>(false);
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'market', name: 'Market Updates' },
    { id: 'price-change', name: 'Price Changes' },
    { id: 'new-release', name: 'New Releases' },
    { id: 'event', name: 'Events' }
  ];
  
  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);
  
  const displayedPriceMovements = showAllMovements 
    ? priceMovements 
    : priceMovements.slice(0, 5);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatPriceChange = (change: number): string => {
    return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  const toggleNewsExpand = (id: string) => {
    setExpandedNewsId(expandedNewsId === id ? null : id);
  };
  
  return (
    <div className="newspaper-container">
      <div className="newspaper-header">
        <div className="newspaper-title">
          <h1>MTG Market Chronicle</h1>
          <p className="newspaper-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            loading={isLoading}
          >
            Refresh Data
          </Button>
        )}
      </div>
      
      {error && (
        <div className="newspaper-error">
          <p>{error}</p>
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              Try Again
            </Button>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="newspaper-loading">
          <div className="loading-spinner"></div>
          <p>Loading the latest market information...</p>
        </div>
      ) : (
        <div className="newspaper-content">
          <div className="newspaper-main-section">
            <div className="newspaper-section news-section">
              <div className="section-header">
                <h2>Latest News</h2>
                <div className="category-filters">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`category-filter ${activeCategory === category.id ? 'active' : ''}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {filteredNews.length === 0 ? (
                <div className="empty-section">
                  <p>No news articles available in this category.</p>
                </div>
              ) : (
                <div className="news-articles">
                  {filteredNews.map(item => (
                    <article 
                      key={item.id} 
                      className={`news-article ${expandedNewsId === item.id ? 'expanded' : ''}`}
                    >
                      <div className="article-header">
                        <span className="article-category">{item.category.replace('-', ' ')}</span>
                        <span className="article-date">{formatDate(item.date)}</span>
                      </div>
                      <h3 className="article-title">{item.title}</h3>
                      
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="article-image" 
                        />
                      )}
                      
                      <p className="article-snippet">{item.snippet}</p>
                      
                      {expandedNewsId === item.id && (
                        <div className="article-content">
                          <p>{item.content}</p>
                          {item.source && (
                            <p className="article-source">Source: {item.source}</p>
                          )}
                          {item.links && item.links.length > 0 && (
                            <div className="article-links">
                              <p>Related Links:</p>
                              <ul>
                                {item.links.map((link, index) => (
                                  <li key={index}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                      {link.text}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button 
                        className="article-expand-btn"
                        onClick={() => toggleNewsExpand(item.id)}
                      >
                        {expandedNewsId === item.id ? 'Read Less' : 'Read More'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="newspaper-sidebar">
            <div className="newspaper-section price-movements-section">
              <h2>Notable Price Movements</h2>
              
              {displayedPriceMovements.length === 0 ? (
                <div className="empty-section">
                  <p>No significant price movements to report.</p>
                </div>
              ) : (
                <>
                  <table className="price-movements-table">
                    <thead>
                      <tr>
                        <th>Card</th>
                        <th>Old Price</th>
                        <th>New Price</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedPriceMovements.map(movement => (
                        <tr 
                          key={`${movement.cardId}-${movement.vendor}`}
                          className={movement.percentChange >= 0 ? 'positive-change' : 'negative-change'}
                        >
                          <td>
                            <Link href={movement.searchURL || `/search?q=${movement.cardName}`}>
                              <div className="card-name-cell">
                                <span>{movement.cardName}</span>
                                <span className="set-code">{movement.setCode}</span>
                                {movement.finish && movement.finish !== 'regular' && (
                                  <span className="finish-tag">{movement.finish}</span>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td>${movement.oldPrice.toFixed(2)}</td>
                          <td>${movement.newPrice.toFixed(2)}</td>
                          <td className="change-cell">
                            <span className="percent-change">
                              {formatPriceChange(movement.percentChange)}
                            </span>
                            <span className="absolute-change">
                              ${movement.absolute.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {priceMovements.length > 5 && (
                    <button 
                      className="show-more-btn"
                      onClick={() => setShowAllMovements(!showAllMovements)}
                    >
                      {showAllMovements ? 'Show Less' : `Show More (${priceMovements.length - 5} more)`}
                    </button>
                  )}
                </>
              )}
            </div>
            
            <div className="newspaper-section trending-section">
              <h2>Trending Cards</h2>
              
              {trendingCards.length === 0 ? (
                <div className="empty-section">
                  <p>No trending cards at the moment.</p>
                </div>
              ) : (
                <div className="trending-cards">
                  {trendingCards.map(card => (
                    <div key={card.cardId} className="trending-card">
                      <Link href={card.searchURL || `/search?q=${card.cardName}`}>
                        <div className="trending-card-content">
                          <div className="trending-card-info">
                            <h3 className="trending-card-name">{card.cardName}</h3>
                            <p className="trending-card-set">{card.setName} ({card.setCode})</p>
                            <p className="trending-card-price">${card.price.toFixed(2)}</p>
                          </div>
                          <div className="trending-card-changes">
                            <div className={`change-indicator ${card.dailyChange >= 0 ? 'positive' : 'negative'}`}>
                              <span>24h</span>
                              <span>{formatPriceChange(card.dailyChange)}</span>
                            </div>
                            <div className={`change-indicator ${card.weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                              <span>7d</span>
                              <span>{formatPriceChange(card.weeklyChange)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Newspaper;