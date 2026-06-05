import React, { useState, useEffect } from 'react';

interface Course {
  name: string;
  duration: string;
  fees_per_year: number;
}

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface CollegeDetail {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  overview: string;
  average_placement: number;
  highest_placement: number;
  logo_url?: string;
  banner_url?: string;
  courses: Course[];
  reviews: Review[];
}

interface DetailPageProps {
  collegeId: string;
  onBack: () => void;
  onOpenAuth: () => void;
  token: string | null;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  collegeId,
  onBack,
  onOpenAuth,
  token
}) => {
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Tab: 'overview' | 'courses' | 'placements' | 'reviews'
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');

  // Review Form States
  const [newRating, setNewRating] = useState('5');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch college detail
  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/colleges/${collegeId}`);
      if (!res.ok) throw new Error('Failed to load college details.');
      const data = await res.json();
      setCollege(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [collegeId]);

  // Handle submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onOpenAuth();
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/colleges/${collegeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: parseFloat(newRating),
          comment: newComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review.');

      setReviewSuccess('Thank you! Your review has been posted successfully.');
      setNewComment('');
      setNewRating('5');
      
      // Reload college data to show the new review and updated average rating
      fetchDetail();
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary)' }}>
        Loading college details...
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ background: 'var(--danger)', color: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error || 'College details could not be found.'}
        </div>
        <button onClick={onBack} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back Button */}
      <div>
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          &larr; Back to Listings
        </button>
      </div>

      {/* College Profile Banner Panel */}
      <section className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px' }}>
        {/* Banner */}
        <div style={{ height: '260px', background: 'var(--border-color)', position: 'relative' }}>
          {college.banner_url ? (
            <img 
              src={college.banner_url} 
              alt="Banner" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a8a, #4c1d95)' }} />
          )}
          {/* Gradients Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '140px',
            background: 'linear-gradient(to top, rgba(11, 15, 23, 0.95), transparent)'
          }} />

          {/* Logo overlay */}
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '30px',
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            border: '4px solid var(--bg-card)',
            background: '#fff',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
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

        {/* Profile Stats Content */}
        <div style={{ padding: '2.5rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2 }}>{college.name}</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{college.location}, {college.state}</span>
            </div>
            
            {/* Top Stats Cards */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '110px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Average Package</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{college.average_placement} LPA</span>
              </div>
              <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '110px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>User Rating</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                  ★ {college.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Tab Selection Header */}
        <div className="glass-panel" style={{
          display: 'flex',
          padding: '0.4rem',
          borderRadius: '10px',
          gap: '0.25rem',
          overflowX: 'auto'
        }}>
          {(['overview', 'courses', 'placements', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '8px',
                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'var(--text-inverse)' : 'var(--text-main)',
                fontWeight: activeTab === tab ? 600 : 500,
                whiteSpace: 'nowrap'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', minHeight: '300px' }}>
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  About the Institution
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                  {college.overview}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{college.location}, {college.state}</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Annual Fees</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>₹{college.fees.toLocaleString()} / Year</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Listed Courses</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{college.courses.length} courses</p>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Offered Courses & Fees
              </h3>
              {college.courses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No courses listed.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Course Name</th>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Duration</th>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Fees (Per Year)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {college.courses.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.duration}</td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>
                            ₹{c.fees_per_year.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Placement Statistics
              </h3>
              
              {/* Placements Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
                {/* Metric average */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Package (LPA)</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{college.average_placement}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lakhs Per Annum</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Calculated average across all engineering and IT discipline placements in the previous season.
                  </p>
                </div>

                {/* Metric highest */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--secondary)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Highest Package (LPA)</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{college.highest_placement}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lakhs Per Annum</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Highest international or domestic package secured by a student.
                  </p>
                </div>
              </div>

              {/* Recruitment Partners */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Top Recruiting Partners</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'McKinsey', 'Goldman Sachs', 'De Shaw', 'Samsung', 'L&T'].map(recruiter => (
                    <span key={recruiter} className="badge btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'default' }}>
                      {recruiter}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Reviews Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>
                  Student Reviews
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                  ★ {college.rating} out of 5 ({college.reviews.length} reviews)
                </span>
              </div>

              {/* Main Reviews Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                
                {/* Review Form */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '10px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Write a Review</h4>
                  
                  {reviewError && (
                    <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div style={{ background: 'var(--success)', color: 'white', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewSuccess}
                    </div>
                  )}

                  {!token ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                        You must be logged in to share your campus experience.
                      </p>
                      <button onClick={onOpenAuth} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                        Log In / Register
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Rating</label>
                        <select 
                          value={newRating} 
                          onChange={(e) => setNewRating(e.target.value)}
                          className="form-input"
                          style={{ width: '120px', padding: '0.5rem' }}
                        >
                          <option value="5">5 ★ (Excellent)</option>
                          <option value="4">4 ★ (Good)</option>
                          <option value="3">3 ★ (Average)</option>
                          <option value="2">2 ★ (Poor)</option>
                          <option value="1">1 ★ (Terrible)</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Campus Experience Description</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about the academics, infrastructure, placements, and campus social life..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          required
                        />
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          disabled={submittingReview} 
                          className="btn btn-primary"
                          style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                        >
                          {submittingReview ? 'Posting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {college.reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      No reviews posted yet. Be the first to share your experience!
                    </p>
                  ) : (
                    college.reviews.map(rev => (
                      <div 
                        key={rev.id} 
                        className="glass-panel" 
                        style={{ padding: '1.25rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.username}</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--warning)' }}>
                            ★ {rev.rating}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {rev.comment}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
                          {new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
