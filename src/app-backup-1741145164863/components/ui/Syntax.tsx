'use client';

import React, { useState } from 'react';
import './SearchInstructions.css';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="accordion-section">
      <button 
        className={`accordion-header ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>{title}</h3>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const SearchInstructions: React.FC = () => {
  return (
    <div className="search-instructions-container">
      <h2 className="instructions-title">Search Instructions</h2>
      
      <AccordionSection title="Basic Syntax" defaultOpen={true}>
        <ul className="instruction-list">
          <li>
            <p>You can search using the Pricefall bot notation: <code>name[|code[|number]]{`&*~`}</code>.</p>
          </li>
          <li>
            <p>If you append a special character to any search, you can filter by finish: <code>&amp;</code> for nonfoil-only, <code>*</code> for foil-only, or <code>~</code> for etched-only results. Note that this syntax is disabled if you used a regular expression option to avoid aliasing.</p>
          </li>
          <li>
            <p>You can filter by <b>edition</b> using the Scryfall notation <code>s:CODE</code> and the full edition name (enclosed in quotes) <code>s:"Aether Revolt"</code>. Regular expressions are supported with the <code>se</code> option.</p>
          </li>
          <li>
            <p>You can filter by <b>collector number</b> using the Scryfall notation <code>cn:NUMBER</code>. For simple numbers (without any prefix or suffix) you may also filter with <code>cn&gt;NUMBER</code> and <code>cn&lt;NUMBER</code>, or with a range such as <code>cn:NUMBER-NUMBER</code>. Regular expressions are also supported if you use <code>cne:REGEXP</code>. If you prepend the set code like so <code>cn:CODE:NUMBER</code>, then the number pick will operate only on cards from that set, leaving the other results untouched.</p>
          </li>
        </ul>
      </AccordionSection>
      
      <AccordionSection title="Filtering Options">
        <ul className="instruction-list">
          <li>
            <p>You can filter by <b>condition</b> with <code>cond:COND</code>, accepting <code>NM</code>, <code>SP</code>, <code>MP</code>, <code>HP</code>, and <code>PO</code>. You can be selective and filter only retail or buylist prices with <code>condr:COND</code> and <code>condb:COND</code> respectively. For standard values, you can filter with <code>cond&gt;VALUE</code>, and <code>cond&lt;VALUE</code> too.</p>
          </li>
          <li>
            <p>You can filter by <b>rarity</b> with <code>r:RARITY</code>, accepting <code>mythic</code>, <code>rare</code>, <code>uncommon</code>, <code>common</code>, <code>special</code>, <code>token</code>, and <code>oversize</code>. You can also use the first letter of the rarity as shorthand. For standard values, you can also use <code>r&lt;RARITY</code> and <code>r&gt;RARITY</code>.</p>
          </li>
          <li>
            <p>You can filter by <b>color</b> and <b>color_identity</b> with <code>c:COLOR</code> and <code>ci:COLOR</code>, using standard WURGB letters, or guilds, shards, college, and quad color names.</p>
          </li>
          <li>
            <p>You can filter by <b>finish</b> with <code>f:VALUE</code>, accepting <code>nonfoil</code>, <code>foil</code>, and <code>etched</code>. Short form is available as <code>nf</code>, <code>f</code>, and <code>e</code>.</p>
          </li>
          <li>
            <p>You can filter by <b>card type</b> with <code>t:VALUE</code>, accepting any valid supertype, subtype, or type.</p>
          </li>
          <li>
            <p>The same option works on sealed product types too, with a bit of looser search: it accepts any chunk of the name, or the category and subtypes terms listed below.</p>
          </li>
          <li>
            <p>You can filter by <b>release date</b> of the card or set <code>date:VALUE</code>, <code>date&gt;VALUE</code>, and <code>date&lt;VALUE</code>. The value may be a date in the ISO format (<code>YYYY-MM-DD</code>) or a set code.</p>
          </li>
          <li>
            <p>You can filter by <b>id</b> of the card with <code>id:VALUE</code>, supports MTGBAN, MTGJSON, Scryfall, and TCGplayer Product Ids.</p>
          </li>
        </ul>
      </AccordionSection>
      
      <AccordionSection title="Card Properties and Flags">
        <div className="instruction-list">
          <p>You can filter by card properties using <code>is:VALUE</code> or <code>not:VALUE</code>, accepting these self-describing options:</p>
          
          <div className="property-section">
            <h4>Generic properties:</h4>
            <ul className="property-list">
              <li><code>reserved</code></li>
              <li><code>token</code></li>
              <li><code>oversize</code></li>
              <li><code>funny</code></li>
              <li><code>wcd</code></li>
              <li><code>commander</code></li>
              <li><code>productless</code></li>
            </ul>
          </div>
          
          <div className="property-section">
            <h4>Frame properties:</h4>
            <ul className="property-list">
              <li><code>fullart</code> (<code>fa</code>)</li>
              <li><code>extendedart</code> (<code>ea</code>)</li>
              <li><code>showcase</code> (<code>sc</code>)</li>
              <li><code>reskin</code></li>
              <li><code>borderless</code> (<code>bd</code>)</li>
              <li><code>gold</code></li>
              <li><code>retro</code></li>
              <li><code>future</code></li>
            </ul>
          </div>
          
          <div className="property-section">
            <h4>Promo properties:</h4>
            <ul className="property-list">
              <li><code>promo</code></li>
              <li><code>prerelease</code></li>
              <li><code>promopack</code></li>
              <li><code>buyabox</code></li>
              <li><code>datestamped</code></li>
              <li><code>fnm</code></li>
              <li><code>judge</code></li>
              <li><code>league</code></li>
              <li><code>playpromo</code></li>
              <li><code>setpromo</code></li>
              <li><code>playerrewards</code></li>
              <li><code>convention</code></li>
              <li><code>storechampionship</code></li>
              <li><code>textless</code></li>
            </ul>
          </div>
          
          <div className="property-section">
            <h4>Language properties:</h4>
            <ul className="property-list">
              <li><code>japanese</code> (<code>jp</code>, <code>jpn</code>)</li>
              <li><code>phyrexian</code> (<code>ph</code>)</li>
            </ul>
          </div>
          
          <div className="property-section">
            <h4>Known card sets:</h4>
            <ul className="property-list">
              <li><code>power9</code></li>
              <li><code>dual</code></li>
              <li><code>fastland</code></li>
              <li><code>fetchland</code></li>
              <li><code>painland</code></li>
              <li><code>shockland</code></li>
              <li><code>checkland</code></li>
              <li><code>surveilland</code></li>
              <li><code>filterland</code></li>
            </ul>
          </div>
          
          <div className="property-section">
            <h4>Known edition sets:</h4>
            <ul className="property-list">
              <li><code>abu4h</code></li>
            </ul>
          </div>
          
          <p className="note">Of course <code>not</code> and <code>-is</code> are equivalent.</p>
          
          <p>There is limited support for human readable tags, for example if <code>(Extended Art)</code> is appended to a card name, the search will only show cards that are Extended Art (similar to the <code>is:extendedart</code> filter). Note that this syntax will not work with regexp search mode.</p>
        </div>
      </AccordionSection>
      
      <AccordionSection title="Search Modes">
        <ul className="instruction-list">
          <li>
            <p>You can change the <b>search mode</b> with <code>sm:VALUE</code>, accepting <code>exact</code> (default), <code>prefix</code>, <code>any</code>, <code>regexp</code>, or <code>scryfall</code>:</p>
            <ul className="sub-list">
              <li>Normally a card is searched with an <b>exact</b> strategy, you will get only cards with exactly the same name as searched.<br />For example <code>Vesuva</code> will return the card named Vesuva and no other Vesuvan counterpart.</li>
              <li>If you search in <b>prefix</b> mode, you will get all the cards with the name starting with what you searched.<br />For example <code>"Dragonlord"</code> will return all the cards starting with "Dragonlord".</li>
              <li>If you search in <b>any</b> mode, you will get all the cards containing any of the text present in card names.<br />For example <code>*Draco*</code> will return the card named Draco and all the cards that have "draco" in their names.</li>
              <li>If you search in <b>regexp</b> mode, you will get all the cards names matching the regular expresion.<br />For example <code>Cluestone$</code> will return the card that end with Cluestone in their name. Note this search mode is case sensitive.</li>
              <li>If you search in <b>scryfall</b> mode, your search will be forwarded to Scryfall and will get all the resulting cards. Note that BAN card filters will be disabled to avoid conficting result between the two search syntaxes, while store and price filters will still work.<br />For example <code>art:loot f:f</code> will return all the foil cards tagged with "loot", looking up the results from Scryfall, and then filter by foil version.</li>
            </ul>
          </li>
          <li>
            <p>You can change the <b>sort mode</b> with <code>sort:VALUE</code>, accepting <code>chrono</code> (chonologically by print date, default), <code>hybrid</code> (for alphabetical order grouped by sets), <code>alpha</code> (for alphabetical order), <code>retail</code> (for TCG price order), or <code>buylist</code> (for CK buylist price order). Note that when this option is set, the sort UI will be disabled.</p>
          </li>
          <li>
            <p>You can set any option in any order, in any amount. When filtering for a group of values you can use a comma <code>,</code> to separate values.</p>
          </li>
          <li>
            <p>You can invert filter results by prepending a <code>-</code> to the option name.</p>
          </li>
        </ul>
      </AccordionSection>
      
      <AccordionSection title="Store and Price Filters">
        <ul className="instruction-list">
          <li>
            <p>You can filter by <b>seller/vendor name</b> with <code>store:shorthand</code>, or specific types of store with <code>seller:shorthand</code> and <code>vendor:shorthand</code>.</p>
            <ul className="sub-list">
              <li>These filters will drop any result where the sepcified scraper is not preset. If you want to see results from a specific scraper, you may prefix the list of stores with <code>only</code>, for example <code>store:only:shorthand</code>.</li>
              <li>You can filter results to include only retail or buylist prices with <code>skip:retail</code> and <code>skip:buylist</code>.</li>
              <li>You can also skip results that do not have retail or buylist prices, with <code>skip:emptyretail</code> and <code>skip:emptybuylist</code>, or results that do not have results at all, with <code>skip:empty</code>.</li>
              <li>You may filter by the store <b>region</b> with <code>region:VALUE</code> using <code>us</code>, <code>eu</code>, or <code>jp</code> options.</li>
              <li>Note that these options leave index results availabe - if you to hide them, you can use the <code>skip:index</code> option (or be even more specific with <code>skip:indexretail</code> and <code>skip:indexbuylist</code>).</li>
            </ul>
          </li>
          <li>
            <p>You can filter by <b>price</b> with <code>price&gt;VALUE</code>, or <code>price&lt;VALUE</code> to exclude results that are above or below your range.</p>
          </li>
          <li>
            <p>You can check if a cards is on a particular list of card with <b>on</b> supporting <code>mtgstocks</code> and <code>tcgsyp</code>.</p>
          </li>
        </ul>
      </AccordionSection>
      
      <AccordionSection title="Additional Features">
        <ul className="instruction-list">
          <li>You can access <b>historical data</b> from a few major vendors by clicking on 📊 for each card.</li>
          <li>Data is refreshed periodically over the day.</li>
          <li>Entries are formatted as <i>card name (finish) - edition (collector #) - # of prints</i>.</li>
          <li>It is possible to retrieve the source product of a card or a sealed product by pressing on the "Found in * products".</li>
          <li>Similarly, pressing on the 📖 button on a card will return every possible products containing any kind of reprint of the given card.</li>
          <li>The percentage found in buylist offers is the <b>price ratio</b>, the higher it is, the more a vendor is looking to purchase that card.</li>
          <li>This percentage is available only if the seller is selling copies of the same card at the same conditions.</li>
          <li>Inventory prices refer to the stated conditions (and their accuracy depends on the data provider).</li>
          <li>Buylist prices are always referring to NM conditions.</li>
          <li>TCG Low is a special value referring to TCG algorithms that may differ from quantity and quality of listings.</li>
          <li>If you hover on a buylist price, a small tooltip will appear displaying the corresponding trade-in price, if available.</li>
          <li>In case of mistakes or incongruities, please notify the devs in the BAN Discord.</li>
          <li>Should you find this content useful, consider clicking on one of the provided links to make a purchase on the website, and directly support BAN.</li>
        </ul>
      </AccordionSection>
    </div>
  );
};

export default SearchInstructions;