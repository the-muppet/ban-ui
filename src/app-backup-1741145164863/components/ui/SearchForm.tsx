// src/components/features/SearchForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type SearchFormProps = {
  isSealed?: boolean;
  placeholder?: string;
  initialQuery?: string;
  currentSort?: string;
  reverseMode?: boolean;
  disableSettings?: boolean;
};

export default function SearchForm({
  isSealed = false,
  placeholder,
  initialQuery = '',
  currentSort = '',
  reverseMode = false,
  disableSettings = false,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset form state when initialQuery changes
    setQuery(initialQuery);
  }, [initialQuery]);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/suggest?term=${encodeURIComponent(input)}&sealed=${isSealed}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 10)); // Limit to 10 suggestions
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
    setShowSuggestions(true);
    setActiveSuggestion(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${isSealed ? '/sealed' : '/search'}?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigate through suggestions with arrow keys
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && activeSuggestion > -1) {
      e.preventDefault();
      setQuery(suggestions[activeSuggestion]);
      setShowSuggestions(false);
      router.push(`${isSealed ? '/sealed' : '/search'}?q=${encodeURIComponent(suggestions[activeSuggestion])}`);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    router.push(`${isSealed ? '/sealed' : '/search'}?q=${encodeURIComponent(suggestion)}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const defaultPlaceholder = isSealed 
    ? "Enter a product name" 
    : "Enter a card name";

  return (
    <div className="sticky top-16 z-40 bg-background p-4">
      <form 
        className="relative w-full max-w-2xl" 
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <label className="block mb-2 text-sm font-medium">
          {!initialQuery ? (
            <>
              Search for a {isSealed ? 'product' : 'card'}, or...{' '}
              <Link 
                href={`/random${isSealed ? 'sealed' : ''}`} 
                className="text-ainfo hover:underline"
              >
                surprise me
              </Link>
            </>
          ) : (
            <>
              Sort by
              {currentSort && (
                <div className="inline-flex ml-2 space-x-2">
                  <Link
                    href={`?q=${initialQuery}&sort=`}
                    className={`${!currentSort || currentSort === 'chrono' ? 'font-bold' : ''}`}
                    title="Sort by chronological order"
                  >
                    chrono
                  </Link>
                  
                  {(!currentSort || currentSort === 'chrono') && (
                    <Link 
                      href={`?q=${initialQuery}&sort=&reverse=${!reverseMode}`}
                      title="Sort by reverse chronological order"
                    >
                      🔄
                    </Link>
                  )}

                  <Link
                    href={`?q=${initialQuery}&sort=alpha`}
                    className={`${currentSort === 'alpha' || currentSort === 'hybrid' ? 'font-bold' : ''}`}
                    title={`Sort by alphabetical order${currentSort === 'hybrid' ? ' (keeping sets grouped)' : ''}`}
                  >
                    alpha
                  </Link>
                  
                  {(currentSort === 'alpha' || currentSort === 'hybrid') && (
                    <Link 
                      href={`?q=${initialQuery}&sort=alpha&reverse=${!reverseMode}`}
                      title={`Sort by reverse alphabetical order${currentSort === 'hybrid' ? ' (keeping sets grouped)' : ''}`}
                    >
                      🔄
                    </Link>
                  )}

                  <Link
                    href={`?q=${initialQuery}&sort=retail`}
                    className={`${currentSort === 'retail' ? 'font-bold' : ''}`}
                    title="Sort by best retail price (off TCGplayer)"
                  >
                    retail
                  </Link>
                  
                  {currentSort === 'retail' && (
                    <Link 
                      href={`?q=${initialQuery}&sort=retail&reverse=${!reverseMode}`}
                      title="Sort by lowest retail price (off TCGplayer)"
                    >
                      🔄
                    </Link>
                  )}

                  <Link
                    href={`?q=${initialQuery}&sort=buylist`}
                    className={`${currentSort === 'buylist' ? 'font-bold' : ''}`}
                    title="Sort by best buylist price (off Card Kingdom)"
                  >
                    buylist
                  </Link>
                  
                  {currentSort === 'buylist' && (
                    <Link 
                      href={`?q=${initialQuery}&sort=buylist&reverse=${!reverseMode}`}
                      title="Sort by lowest buylist price (off Card Kingdom)"
                    >
                      🔄
                    </Link>
                  )}
                  
                  <Link 
                    href={`/random${isSealed ? 'sealed' : ''}`}
                    title="...more surprises"
                    className="text-ainfo"
                  >
                    🎰
                  </Link>
                </div>
              )}
              {!isSealed && !disableSettings && (
                <Link href="?page=options" title="Search settings" className="ml-2">
                  ⚙️
                </Link>
              )}
            </>
          )}
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ainfo"
            placeholder={placeholder || defaultPlaceholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionContainerRef}
              className="absolute z-50 w-full mt-1 bg-almostwhite border border-verywhite shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-2 cursor-pointer ${
                    index === activeSuggestion 
                      ? 'bg-navbackground text-white'
                      : 'hover:bg-hover'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}