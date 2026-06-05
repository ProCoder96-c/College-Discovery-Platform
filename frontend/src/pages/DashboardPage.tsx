import React, { useState, useEffect } from 'react';

interface SavedCollege {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  average_placement: number;
  logo_url?: string;
}

interface DashboardPageProps {
  user: any;
  token: string | null;
  onViewDetails: (id: string) => void;
  onRemoveSave: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  token,
  onViewDetails,
  onRemoveSave
}) => {
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedColleges = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch saved colleges.');
      const data = await res.json();
      setSavedColleges(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedColleges();
  }, [token]);

  // Handle remove bookmark locally
  const handleRemove = async (id: string) => {
    try {
      await onRemoveSave(id);
      // Update local state directly
      setSavedColleges(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <section className="glass-panel" style={{
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(21, 28, 44, 0.9) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Large Initial Circle */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome, {user?.name}!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Student Workspace & College Discovery Dashboard</p>
          </div>
        </div>

        {/* Quick details */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>{user?.email}</span>
          </div>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bookmarked</span>
            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
              {savedColleges.length}
            </span>
          </div>
        </div>
      </section>

      {/* Bookmarks Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Your Bookmarked Colleges</h3>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>
            Fetching bookmarked selections...
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && !error && savedColleges.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>No Bookmarks Yet</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Add colleges to your dashboard from the listings page to track placements, fees, and admission cutoffs.
            </p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Browse Colleges
            </button>
          </div>
        )}

        {!loading && !error && savedColleges.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {savedColleges.map(college => (
              <div 
                key={college.id} 
                className="glass-panel glow-hover animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden', flex: 1 }}>
                  {college.logo_url && (
                    <img 
                      src={college.logo_url} 
                      alt="Logo" 
                      style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h4 
                      onClick={() => onViewDetails(college.id)}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      className="glow-hover"
                    >
                      {college.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{college.location}, {college.state}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>₹{college.fees.toLocaleString()}/yr</span>
                      <span style={{ color: 'var(--warning)' }}>★ {college.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                  <button 
                    onClick={() => onViewDetails(college.id)}
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleRemove(college.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
