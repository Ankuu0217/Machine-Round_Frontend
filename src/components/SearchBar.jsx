import React, { useCallback, useEffect, useRef, useState } from 'react';
import baseApiCall from '../api/api';
import '../index.css';

const SearchBar = () => {
    const [query, setQuery] = useState(() => localStorage.getItem('lastQuery') || '');
    const [results, setResults] = useState(() => {
        const saved = localStorage.getItem('lastResults');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(() => !!localStorage.getItem('lastQuery'));
    const [apiError, setApiError] = useState(null);
    const timerRef = useRef(null);

    // Save to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('lastQuery', query);
        localStorage.setItem('lastResults', JSON.stringify(results));
    }, [query, results]);

    // Fetch API results — async/await with axios
    const fetchApi = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setApiError(null);

        try {
            const res = await baseApiCall(searchQuery);

            if (res?.error) {
                setApiError(res.error);
                setResults([]);
            } else {
                setResults(res?.results || []);
            }
            setSearched(true);
        } catch (err) {
            // Safety net — shouldn't reach here since api.js handles errors
            setApiError(err.message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced input handler
    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (timerRef.current) clearTimeout(timerRef.current);

        if (!value.trim()) {
            setResults([]);
            setSearched(false);
            setApiError(null);
            return;
        }

        timerRef.current = setTimeout(() => {
            fetchApi(value);
        }, 400);
    };

    // Cleanup timer on unmount
    // useEffect(() => {
    //     return () => {
    //         if (timerRef.current) clearTimeout(timerRef.current);
    //     };
    // }, []);

    return (
        <div className="app-container">

            {/* ── Header ── */}
            <header className="header">
                <div className="header-badge">
                    <span className="dot"></span>
                    Powered by Unsplash API
                </div>
                <h1>SnapSearch</h1>
                <p>Explore stunning high-resolution images with real-time debounced search</p>
            </header>

            {/* ── Search Input ── */}
            <div className="searchBar">
                <div className="search-wrapper">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search photos… e.g. mountains, ocean, city"
                        onChange={handleInput}
                        value={query}
                    />
                </div>
            </div>

            {/* ── Result count + debounce tag ── */}
            {searched && !loading && (
                <div className="status-bar">
                    <span className="result-count">
                        Found <span>{results.length}</span> results for &ldquo;<em>{query}</em>&rdquo;
                    </span>
                    <span className="debounce-tag">⚡ Debounced</span>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <span className="loading-text">Searching images…</span>
                </div>
            )}

            {/* ── Initial empty state ── */}
            {!loading && !searched && (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h3>Start exploring</h3>
                    <p>Type something in the search bar to discover beautiful images from Unsplash</p>
                </div>
            )}

            {/* ── API Error ── */}
            {!loading && apiError && (
                <div className="empty-state">
                    <span className="empty-icon">⚠️</span>
                    <h3>API Error</h3>
                    <p>{apiError.includes('Rate') || apiError.includes('403')
                        ? 'Rate limit reached (50 requests/hour on free tier). Wait a few minutes and try again.'
                        : apiError}
                    </p>
                </div>
            )}

            {/* ── No results ── */}
            {!loading && searched && results.length === 0 && !apiError && (
                <div className="empty-state">
                    <span className="empty-icon">😕</span>
                    <h3>No results found</h3>
                    <p>Try a different search term to find what you&apos;re looking for</p>
                </div>
            )}

            {/* ── Masonry Image Grid ── */}
            {!loading && results.length > 0 && (
                <div className="image-grid">
                    {results.map((item) => (
                        <div className="image-card" key={item.id}>

                            {/* Photo */}
                            <div className="card-image">
                                <img
                                    src={item.urls.small}
                                    alt={item.alt_description || 'Unsplash photo'}
                                    loading="lazy"
                                />
                                {/* Hover overlay — likes count */}
                                <div className="card-overlay">
                                    <span className="likes">♥ {item.likes?.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Card info: description + author */}
                            <div className="card-info">
                                <p className="card-description">
                                    {item.alt_description
                                        ? item.alt_description.charAt(0).toUpperCase() + item.alt_description.slice(1)
                                        : item.description || 'Beautiful photograph from Unsplash'}
                                </p>
                                <div className="card-author">
                                    <img
                                        className="author-avatar"
                                        src={item.user?.profile_image?.small}
                                        alt={item.user?.name}
                                    />
                                    <div className="author-details">
                                        <span className="author-name">{item.user?.name}</span>
                                        <span className="author-handle">@{item.user?.username}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* ── Footer ── */}
            <footer className="app-footer">
                Built with React &amp; Debounce &nbsp;·&nbsp; Images by{' '}
                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
                    Unsplash
                </a>
            </footer>

        </div>
    );
};

export default SearchBar;
