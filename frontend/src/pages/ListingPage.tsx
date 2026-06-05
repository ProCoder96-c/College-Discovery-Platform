import React, { useState, useEffect } from 'react';

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  average_placement: number;
  highest_placement: number;
  logo_url?: string;
  banner_url?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface ListingPageProps {
  onViewDetails: (id: string) => void;
  compareList: College[];
  onToggleCompare: (college: College) => void;
  user: any | null;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenAuth: () => void;
}

export const ListingPage: React.FC<ListingPageProps> = ({
  onViewDetails,
  compareList,
  onToggleCompare,
  user,
  savedIds,
  onToggleSave,
  onOpenAuth
}) => {
  // Search and Filter States
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [minRating, setMinRating] = useState('');
  const [course, setCourse] = useState('');
  
  // Sorting and Pagination States
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  // Data States
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch function
  const fetchColleges = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        q,
        state,
        maxFees,
        minRating,
        course,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/colleges?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load colleges');
      const data = await res.json();
      setColleges(data.colleges);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when parameters or pagination changes
  useEffect(() => {
    fetchColleges();
  }, [state, maxFees, minRating, course, sortBy, sortOrder, page]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchColleges();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setQ('');
    setState('');
    setMaxFees('');
    setMinRating('');
    setCourse('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const statesList = [
    'Maharashtra',
    'Rajasthan',
    'Delhi',
    'Tamil Nadu',
    'Karnataka'
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Discover Your Dream <span className="gradient-text">College & Course</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.05rem' }}>
          Explore India's top engineering and medical institutions. Compare packages, fees, and predict admission likelihood dynamically.
        </p>

        {/* Search Input Card */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="glass-panel" 
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '700px',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginTop: '1rem'
          }}
        >
          <input 
            type="text"
            placeholder="Search by name, location, or state..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '0.6rem 1rem',
              color: 'var(--text-main)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Content Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Left Filters Sidebar */}
        <aside className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Filters</h3>
            <button 
              onClick={handleClearFilters} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear All
            </button>
          </div>

          {/* State Filter */}
          <div className="form-group">
            <label>State</label>
            <select 
              value={state} 
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="form-input"
              style={{ padding: '0.6rem' }}
            >
              <option value="">All States</option>
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="form-group">
            <label>Course Stream</label>
            <select 
              value={course} 
              onChange={(e) => { setCourse(e.target.value); setPage(1); }}
              className="form-input"
              style={{ padding: '0.6rem' }}
            >
              <option value="">All Streams</option>
              <option value="Computer Science">Computer Science / IT</option>
              <option value="Electrical">Electrical Eng</option>
              <option value="Mechanical">Mechanical Eng</option>
              <option value="MBBS">Medical / MBBS</option>
            </select>
          </div>

          {/* Fees Filter */}
          <div className="form-group">
            <label>Max Annual Fees: {maxFees ? `₹${parseInt(maxFees).toLocaleString()}` : 'Any'}</label>
            <input 
              type="range" 
              min="1000" 
              max="500000" 
              step="10000" 
              value={maxFees || '500000'} 
              onChange={(e) => { setMaxFees(e.target.value); setPage(1); }}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Ratings Filter */}
          <div className="form-group">
            <label>Minimum Rating</label>
            <select 
              value={minRating} 
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="form-input"
              style={{ padding: '0.6rem' }}
            >
              <option value="">Any Rating</option>
              <option value="4.0">4.0 & above</option>
              <option value="4.5">4.5 & above</option>
              <option value="4.8">4.8 & above</option>
            </select>
          </div>
        </aside>

        {/* Right College Listings Area */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Sort & Count header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Showing {colleges.length} of {pagination?.totalCount || 0} colleges
            </span>

            {/* Sort Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{ padding: '0.4rem 0.8rem', width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="name">Name</option>
                <option value="fees">Annual Fees</option>
                <option value="rating">User Rating</option>
                <option value="placement">Average Placement</option>
              </select>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input"
                style={{ padding: '0.4rem 0.8rem', width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Loader or Error */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
              Loading colleges...
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: 'var(--danger)', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!loading && !error && colleges.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>No Colleges Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
            </div>
          )}

          {/* College Card Grid */}
          {!loading && !error && colleges.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {colleges.map(college => {
                const isCompared = compareList.some(c => c.id === college.id);
                const isSaved = savedIds.includes(college.id);
                
                return (
                  <div 
                    key={college.id} 
                    className="glass-panel glow-hover animate-fade-in"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {/* Save Button (Heart Icon Overlay) */}
                    <button
                      onClick={() => {
                        if (!user) onOpenAuth();
                        else onToggleSave(college.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isSaved ? 'var(--danger)' : '#fff',
                        zIndex: 10,
                        transition: '0.2s ease'
                      }}
                      title={isSaved ? 'Remove from Saved' : 'Save College'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Banner Image */}
                    <div style={{ height: '140px', background: 'var(--border-color)', position: 'relative' }}>
                      {college.banner_url ? (
                        <img 
                          src={college.banner_url} 
                          alt="Banner" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a8a, #4c1d95)' }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '16px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        border: '3px solid var(--bg-card)',
                        background: '#fff',
                        overflow: 'hidden'
                      }}>
                        {college.logo_url ? (
                          <img 
                            src={college.logo_url} 
                            alt="Logo" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--primary)' }} />
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.5rem 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '10px', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{college.location}, {college.state}</span>
                        <h3 
                          onClick={() => onViewDetails(college.id)}
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.8rem',
                            lineHeight: 1.25
                          }}
                          className="glow-hover"
                        >
                          {college.name}
                        </h3>
                      </div>

                      {/* Details: Fees & Rating Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Annual Tuition</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>₹{college.fees.toLocaleString()}/yr</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Rating</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--warning)' }}>
                            ★ {college.rating}
                          </span>
                        </div>
                      </div>

                      {/* Placement Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Avg Placement</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{college.average_placement} LPA</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Max Placement</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)' }}>{college.highest_placement} LPA</span>
                        </div>
                      </div>

                      {/* Compare Checkbox & Action Button */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={isCompared}
                            onChange={() => onToggleCompare(college)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                          />
                          Compare
                        </label>
                        <button 
                          onClick={() => onViewDetails(college.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem'
            }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
