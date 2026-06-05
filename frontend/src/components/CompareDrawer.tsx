import React from 'react';

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  average_placement: number;
  logo_url?: string;
}

interface CompareDrawerProps {
  compareList: College[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  compareList,
  onRemove,
  onCompare,
  onClear
}) => {
  const isOpen = compareList.length > 0;

  return (
    <div className={`compare-drawer ${isOpen ? 'open' : ''}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      flexWrap: 'wrap'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          Compare Colleges 
          <span className="badge badge-secondary">{compareList.length} of 3</span>
        </h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Select up to 3 colleges to compare placements, fees, and ratings.
        </span>
      </div>

      {/* Selected Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px', overflowX: 'auto', paddingBottom: '4px' }}>
        {compareList.map(college => (
          <div 
            key={college.id} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              position: 'relative',
              flexShrink: 0,
              maxWidth: '220px'
            }}
          >
            {college.logo_url && (
              <img 
                src={college.logo_url} 
                alt="Logo" 
                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {college.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{college.location}</span>
            </div>
            <button
              onClick={() => onRemove(college.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.4rem',
                padding: '2px'
              }}
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}

        {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, i) => (
          <div 
            key={`placeholder-${i}`} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed var(--border-color)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              height: '42px',
              width: '150px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}
          >
            + Add College
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={onClear} 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Clear All
        </button>
        <button 
          onClick={onCompare} 
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
          disabled={compareList.length < 2}
        >
          Compare Side-by-Side
        </button>
      </div>
    </div>
  );
};
