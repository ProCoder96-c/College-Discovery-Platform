import React from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface NavbarProps {
  page: string;
  setPage: (page: any) => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  page,
  setPage,
  user,
  onLogout,
  onOpenAuth,
  compareCount
}) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      margin: '0.75rem 1rem',
      borderRadius: '12px',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid var(--border-color)',
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setPage('listing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="url(#logoGrad)" />
          <path d="M2 14V21L16 28L30 21V14L16 21L2 14Z" fill="url(#logoGrad)" />
          <defs>
            <linearGradient id="logoGrad" x1="2" y1="2" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--primary)" />
              <stop offset="1" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em'
        }}>
          CampusSelect
        </span>
      </div>

      {/* Navigation Options */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={() => setPage('listing')} 
          className="btn btn-secondary" 
          style={{
            background: page === 'listing' || page === 'detail' ? 'var(--primary-glow)' : 'transparent',
            borderColor: page === 'listing' || page === 'detail' ? 'var(--primary)' : 'transparent',
            color: page === 'listing' || page === 'detail' ? 'var(--primary)' : 'var(--text-main)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          Colleges
        </button>

        <button 
          onClick={() => setPage('compare')} 
          className="btn btn-secondary" 
          style={{
            background: page === 'compare' ? 'var(--primary-glow)' : 'transparent',
            borderColor: page === 'compare' ? 'var(--primary)' : 'transparent',
            color: page === 'compare' ? 'var(--primary)' : 'var(--text-main)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            position: 'relative'
          }}
        >
          Compare
          {compareCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'var(--secondary)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '50%',
              lineHeight: 1
            }}>
              {compareCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setPage('predictor')} 
          className="btn btn-secondary" 
          style={{
            background: page === 'predictor' ? 'var(--primary-glow)' : 'transparent',
            borderColor: page === 'predictor' ? 'var(--primary)' : 'transparent',
            color: page === 'predictor' ? 'var(--primary)' : 'var(--text-main)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          Predictor
        </button>

        {user && (
          <button 
            onClick={() => setPage('dashboard')} 
            className="btn btn-secondary" 
            style={{
              background: page === 'dashboard' ? 'var(--primary-glow)' : 'transparent',
              borderColor: page === 'dashboard' ? 'var(--primary)' : 'transparent',
              color: page === 'dashboard' ? 'var(--primary)' : 'var(--text-main)',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem'
            }}
          >
            Dashboard
          </button>
        )}
      </nav>

      {/* Profile & Auth Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={onLogout} 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
