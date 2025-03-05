'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '@/app/styles/Sealed.css';

interface EditionItem {
  code: string;
  name: string;
  keyrune: string;
}

interface SealedSearchProps {
  editionSort: string[];
  editionList: Record<string, EditionItem[]>; 
}

const SealedSearch: React.FC<SealedSearchProps> = ({
  editionSort,
  editionList
}) => {
  const [filterValue, setFilterValue] = useState('');
  
  // Filter function for editions
  const filterEditions = (edition: EditionItem) => {
    if (!filterValue) return true;
    return edition.name.toLowerCase().includes(filterValue.toLowerCase()) ||
           edition.code.toLowerCase().includes(filterValue.toLowerCase());
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="sealed-search-container">
      <div className="sealed-intro">
        <p>
          Make sure to read the <a className="btn normal" href="#faq">F.A.Q.</a>
          <br />
          Jump to:
          {editionSort.map(key => (
            <button 
              key={key} 
              className="btn normal" 
              onClick={() => scrollToSection(key)}
            >
              {key}
            </button>
          ))}
        </p>
        
        <div className="filter-container">
          <label htmlFor="editionFilter">Filter by</label>
          <input 
            type="text" 
            id="editionFilter" 
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Edition..."
            className="filter-input"
          />
        </div>
      </div>
      
      {/* Edition Categories */}
      {editionSort.map(categoryKey => {
        const categoryItems = editionList[categoryKey] || [];
        const filteredItems = categoryItems.filter(filterEditions);
        
        if (filteredItems.length === 0 && filterValue) {
          return null; // Skip empty categories when filtering
        }
        
        return (
          <div key={categoryKey} className="category-section" id={categoryKey}>
            <div className="category-header">
              <h3>{categoryKey}</h3>
              <hr />
            </div>
            
            <div className="edition-grid">
              {filteredItems.map((edition, index) => (
                <div key={`${edition.code}-${index}`} className="edition-item">
                  <i className={`ss ss-${edition.keyrune} ss-2x ss-fw`}></i>
                  <Link 
                    href={`/sealed?q=s:${edition.code}`}
                    className="edition-link"
                  >
                    {edition.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* FAQ Section */}
      <div className="faq-section" id="faq">
        <h2>F.A.Q.</h2>
        
        <div className="faq-content">
          <div className="faq-item">
            <h3>Understanding EV and SIM at BAN</h3>
            <p>
              At BAN, we aim to empower our users with data-driven insight into the potential value of their sealed MTG products through two distinct but complementary methods: Expected Value (EV) and Simulated Box Openings (SIM).
            </p>
            <p>
              For any product with a static decklist, the card values are just summed up and provided as is, and there is no difference between the two methods, while for product with randomness associated with it (ie. booster packs and certain decks) there can be profound differences between predicted value and typical openings, especially at low sample sizes. Thus, we take both approaches to help the user decide the spread and likely value of opening moderate to large amount of product vs. selling it outright.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How is EV calculated?</h3>
            <p>
              EV calculates a product's average value by analyzing the distribution of cards on print sheets, using each card's drop rate and market value. This approach offers a theoretical perspective on what a product might be worth, providing a foundational understanding of its potential value. In other words the final value of the box is linearly dependent on the drop rate (or probability) for each card to appear in any given booster slot.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How is SIM calculated?</h3>
            <p>
              SIM, in contrast, brings the experience of opening booster packs and boxes closer to reality. We take the known probabilities of each card appearing in a product and use a random number generator to generate a random box from this information. This is repeated thousands of times leading to a large data set in which we can get some useful insights that the EV number alone cannot show us such as the Median and Standard Deviation.
            </p>
            <p>
              Sims are not required for pre-constructed decks and other products where the same cards appear every time.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>What are the median and standard deviation representing?</h3>
            <p>
              The Median is the middle value of a data set. For example, if we simulate 5000 boxes and organise the box values from smallest to largest, the Median value would be the value of the 2500th box. The metric in itself does not say much, but comparing the Median to the EV is useful. If the Median is a lot lower than the EV then we can assume the EV is being skewed higher by some top-heavy chase cards where a lot of the value in a product may be.
            </p>
            <p>
              The Standard Deviation measures the spread of values in a data set. The higher the Standard Deviation, the more variance you will experience opening a product. For example, if the EV of a box is $100 and all other boxes are either $99 or $101, we have Standard Deviation of 1. All values are extremely clustered and you can expect your opening to be extremely consistent and low risk.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>Is there a minimum or maximum value for a card to be considered?</h3>
            <p>
              Yes. Initially we considered every single price found and added it up, but we found out that counting up "worthless cards" and "extremely expensive cards" skew the results even on repeated runs. So we're now excluding all bulk (sub $0.30) and all serialized cards, since the odds of opening are low, but impact the result too optimistically. This is true for both EV and SIM, and in the latter case the multiple runs should take care of the variance for computation for all other cards.
            </p>
          </div>
        </div>
        
        <div className="disclaimer">
          <h3>Disclaimer</h3>
          <p>
            Information in this EV calculation is not guaranteed and should not be used solely to make financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SealedSearch;