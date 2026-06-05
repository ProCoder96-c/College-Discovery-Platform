import React, { useState } from 'react';

interface MatchedCollege {
  branch: string;
  closing_rank: number;
  exam: string;
  category: string;
  college_id: string;
  college_name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  average_placement: number;
  logo_url?: string;
  likelihood: 'High' | 'Medium' | 'Stretch';
  likelihoodColor: string;
}

interface PredictorPageProps {
  onViewDetails: (id: string) => void;
}

export const PredictorPage: React.FC<PredictorPageProps> = ({ onViewDetails }) => {
  // Form Inputs
  const [exam, setExam] = useState('JEE Main');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('General');
  const [branchKeyword, setBranchKeyword] = useState('');

  // Results & Loading
  const [results, setResults] = useState<MatchedCollege[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || parseInt(rank) <= 0) {
      setError('Please enter a valid positive rank.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          rank: parseInt(rank),
          category,
          branch: branchKeyword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction calculation failed.');
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const examsList = [
    'JEE Main',
    'BITSAT',
    'NEET',
    'VITEEE',
    'KCET',
    'COMEDK',
    'MHT CET'
  ];

  const categoriesList = [
    'General',
    'OBC',
    'SC',
    'ST'
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Admission <span className="gradient-text">Chance Predictor</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.05rem' }}>
          Input your entrance exam rank and category to predict your likelihood of securing admission to various college branches based on recent cutoff datasets.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <form onSubmit={handlePredict} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Exam Select */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Entrance Exam</label>
              <select 
                value={exam} 
                onChange={(e) => setExam(e.target.value)}
                className="form-input"
                style={{ padding: '0.65rem' }}
              >
                {examsList.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            {/* Rank Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Your Rank (Closing Rank Equivalent)</label>
              <input 
                type="number" 
                placeholder="Enter rank index (e.g. 5000)"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="form-input"
                style={{ padding: '0.65rem' }}
                required
              />
            </div>

            {/* Category Select */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Seat Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                style={{ padding: '0.65rem' }}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Branch Keyword Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Branch Keyword (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Computer Science, Mechanical"
                value={branchKeyword}
                onChange={(e) => setBranchKeyword(e.target.value)}
                className="form-input"
                style={{ padding: '0.65rem' }}
              />
            </div>

            {/* Submit Button Span */}
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', width: '100%', maxWidth: '300px' }}>
                Predict My Choices
              </button>
            </div>
          </form>
        </div>

        {/* Results Card list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)', fontSize: '1.2rem' }}>
              Evaluating eligibility cutoffs...
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>No Eligible Institutions Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Your rank may exceed the closing cutoffs for the selected options. Try modifying categories or input rank.
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                Eligible Branches & Likelihood
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((res, i) => (
                  <div 
                    key={i} 
                    className="glass-panel animate-fade-in glow-hover"
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                      {res.logo_url && (
                        <img 
                          src={res.logo_url} 
                          alt="Logo" 
                          style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <h4 
                          onClick={() => onViewDetails(res.college_id)} 
                          style={{ fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {res.college_name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.location}, {res.state}</span>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            Branch: {res.branch}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Cutoff: {res.closing_rank} (Closing Rank)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admission Chance</span>
                        <span 
                          className="badge" 
                          style={{
                            backgroundColor: `${res.likelihoodColor}20`,
                            color: res.likelihoodColor,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px'
                          }}
                        >
                          {res.likelihood} Chance
                        </span>
                      </div>
                      <button 
                        onClick={() => onViewDetails(res.college_id)} 
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      >
                        View College
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
