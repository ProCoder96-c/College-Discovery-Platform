import React, { useState, useEffect } from 'react';

interface Course {
  name: string;
  duration: string;
  fees_per_year: number;
}

interface Cutoff {
  exam: string;
  branch: string;
  category: string;
  closing_rank: number;
}

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
  courses: Course[];
  cutoffs: Cutoff[];
}

interface ComparePageProps {
  compareIds: string[];
  onBack: () => void;
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  compareIds,
  onBack,
  onRemove,
  onViewDetails
}) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComparedColleges = async () => {
      if (compareIds.length === 0) {
        setColleges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/compare?ids=${compareIds.join(',')}`);
        if (!res.ok) throw new Error('Failed to load comparison data');
        const data = await res.json();
        setColleges(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparedColleges();
  }, [compareIds]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary)' }}>
        Compiling side-by-side comparison...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ background: 'var(--danger)', color: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
        <button onClick={onBack} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  if (colleges.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>No Colleges Selected</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Go back to listings and check the "Compare" box on at least 2 colleges.
          </p>
          <button onClick={onBack} className="btn btn-primary">Browse Colleges</button>
        </div>
      </div>
    );
  }

  // Find optimal features for comparison highlights
  const minFees = Math.min(...colleges.map(c => c.fees));
  const maxAveragePlacement = Math.max(...colleges.map(c => c.average_placement));
  const maxRating = Math.max(...colleges.map(c => c.rating));

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            &larr; Back to Listings
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Side-by-Side <span className="gradient-text">Comparison</span>
          </h1>
        </div>
        <span className="badge badge-secondary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
          Comparing {colleges.length} {colleges.length === 1 ? 'College' : 'Colleges'}
        </span>
      </div>

      {/* Grid of Colleges */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(21, 28, 44, 0.4)' }}>
                <th style={{ width: '220px', padding: '1.5rem 1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Comparison Parameter</th>
                {colleges.map(college => (
                  <th key={college.id} style={{ padding: '1.5rem 1rem', textAlign: 'center', position: 'relative' }}>
                    
                    {/* Remove button */}
                    <button 
                      onClick={() => onRemove(college.id)} 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      }}
                      title="Remove comparison"
                    >
                      &times;
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      {college.logo_url && (
                        <img 
                          src={college.logo_url} 
                          alt="Logo" 
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', display: 'block', maxWidth: '180px' }}>
                          {college.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{college.location}, {college.state}</span>
                      </div>
                      <button 
                        onClick={() => onViewDetails(college.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        View Profile
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Annual Fees */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Annual Tuition Fees</td>
                {colleges.map(college => {
                  const isLowest = college.fees === minFees && colleges.length > 1;
                  return (
                    <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isLowest ? 'var(--success)' : 'inherit',
                        padding: isLowest ? '0.2rem 0.6rem' : '0',
                        background: isLowest ? 'rgba(16, 185, 129, 0.15)' : 'none',
                        borderRadius: '6px'
                      }}>
                        ₹{college.fees.toLocaleString()}/yr
                      </span>
                      {isLowest && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--success)', marginTop: '4px' }}>Lowest Fee Value</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Average Placement */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Package (LPA)</td>
                {colleges.map(college => {
                  const isBest = college.average_placement === maxAveragePlacement && colleges.length > 1;
                  return (
                    <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isBest ? 'var(--primary)' : 'inherit',
                        padding: isBest ? '0.2rem 0.6rem' : '0',
                        background: isBest ? 'var(--primary-glow)' : 'none',
                        borderRadius: '6px'
                      }}>
                        {college.average_placement} LPA
                      </span>
                      {isBest && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--primary)', marginTop: '4px' }}>Highest Avg Package</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Highest Placement */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Highest Package (LPA)</td>
                {colleges.map(college => (
                  <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--secondary)' }}>
                    {college.highest_placement} LPA
                  </td>
                ))}
              </tr>

              {/* Row: Rating */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>User Rating</td>
                {colleges.map(college => {
                  const isBest = college.rating === maxRating && colleges.length > 1;
                  return (
                    <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--warning)',
                        padding: isBest ? '0.2rem 0.6rem' : '0',
                        background: isBest ? 'rgba(245, 158, 11, 0.15)' : 'none',
                        borderRadius: '6px'
                      }}>
                        ★ {college.rating}
                      </span>
                      {isBest && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--warning)', marginTop: '4px' }}>Top Rated</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Courses Count */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Offered Courses</td>
                {colleges.map(college => (
                  <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{college.courses.length} Courses</span>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '6px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      textAlign: 'left',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '6px'
                    }}>
                      {college.courses.map((crs, i) => (
                        <div key={i} style={{ borderBottom: i < college.courses.length - 1 ? '1px solid #1f293d' : 'none', padding: '3px 0' }}>
                          • {crs.name}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Cutoffs list summary */}
              <tr>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cutoff Details (General)</td>
                {colleges.map(college => (
                  <td key={college.id} style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    {college.cutoffs.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>No cutoff data available</span>
                    ) : (
                      <div style={{
                        textAlign: 'left',
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '6px',
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}>
                        {college.cutoffs.filter(c => c.category === 'General').map((cut, i) => (
                          <div key={i} style={{ borderBottom: '1px solid #1f293d', padding: '4px 0' }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{cut.exam}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cut.branch}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>Closing Rank: {cut.closing_rank}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
