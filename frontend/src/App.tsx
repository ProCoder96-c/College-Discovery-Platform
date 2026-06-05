import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CompareDrawer } from './components/CompareDrawer';
import { AuthModal } from './components/AuthModal';
import { ListingPage } from './pages/ListingPage';
import { DetailPage } from './pages/DetailPage';
import { ComparePage } from './pages/ComparePage';
import { PredictorPage } from './pages/PredictorPage';
import { DashboardPage } from './pages/DashboardPage';

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
}

interface User {
  id: string;
  email: string;
  name: string;
}

type PageState = 'listing' | 'detail' | 'compare' | 'predictor' | 'dashboard';

function App() {
  // Navigation Routing States
  const [page, setPage] = useState<PageState>('listing');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  // Authentication States
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Comparison list
  const [compareList, setCompareList] = useState<College[]>([]);

  // Saved Colleges IDs (Bookmarks)
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Session bootstrap on app startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      verifySession(storedToken);
    }
  }, []);

  // Fetch saved bookmarks when token changes/verifies
  useEffect(() => {
    if (token) {
      fetchSavedIds();
    } else {
      setSavedIds([]);
    }
  }, [token]);

  const verifySession = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!res.ok) {
        // Session expired
        handleLogoutLocal();
      }
    } catch {
      handleLogoutLocal();
    }
  };

  const fetchSavedIds = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.map((c: any) => c.id));
      }
    } catch (err) {
      console.error('Failed to load saved college IDs:', err);
    }
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setSavedIds([]);
    if (page === 'dashboard') {
      setPage('listing');
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout error on server:', err);
      }
    }
    handleLogoutLocal();
  };

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Compare Functions
  const handleToggleCompare = (college: College) => {
    setCompareList(prev => {
      const exists = prev.some(c => c.id === college.id);
      if (exists) {
        return prev.filter(c => c.id !== college.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 colleges side-by-side.');
          return prev;
        }
        return [...prev, college];
      }
    });
  };

  const handleRemoveCompare = (id: string) => {
    setCompareList(prev => prev.filter(c => c.id !== id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Saved Colleges Bookmark Functions
  const handleToggleSave = async (id: string) => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    const isSaved = savedIds.includes(id);
    const method = isSaved ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`/api/saved/${id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSavedIds(prev => 
          isSaved ? prev.filter(savedId => savedId !== id) : [...prev, id]
        );
      }
    } catch (err) {
      console.error('Error toggling saved state:', err);
    }
  };


  // Navigation Detail Page redirect helper
  const handleViewDetails = (id: string) => {
    setSelectedCollegeId(id);
    setPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: compareList.length > 0 ? '90px' : '20px' }}>
      
      {/* Header Navigation */}
      <Navbar 
        page={page} 
        setPage={setPage} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setAuthModalOpen(true)}
        compareCount={compareList.length}
      />

      {/* Main View Router Content */}
      <main style={{ flex: 1 }}>
        {page === 'listing' && (
          <ListingPage 
            onViewDetails={handleViewDetails}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            user={user}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {page === 'detail' && selectedCollegeId && (
          <DetailPage 
            collegeId={selectedCollegeId} 
            onBack={() => setPage('listing')}
            onOpenAuth={() => setAuthModalOpen(true)}
            token={token}
          />
        )}

        {page === 'compare' && (
          <ComparePage 
            compareIds={compareList.map(c => c.id)}
            onBack={() => setPage('listing')}
            onRemove={handleRemoveCompare}
            onViewDetails={handleViewDetails}
          />
        )}

        {page === 'predictor' && (
          <PredictorPage 
            onViewDetails={handleViewDetails}
          />
        )}

        {page === 'dashboard' && user && (
          <DashboardPage 
            user={user} 
            token={token}
            onViewDetails={handleViewDetails}
            onRemoveSave={handleToggleSave}
          />
        )}
      </main>

      {/* Compare Floating bottom drawer */}
      <CompareDrawer 
        compareList={compareList} 
        onRemove={handleRemoveCompare} 
        onCompare={() => setPage('compare')} 
        onClear={handleClearCompare}
      />

      {/* Auth overlay modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
