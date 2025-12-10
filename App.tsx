import React, { useState, useEffect } from 'react';
import { Generator } from './components/Generator';
import { History } from './components/History';
import { Auth } from './components/Auth';
import { Tab, GeneratedPage, User } from './types';
import { Layout, LogOut, User as UserIcon, AlertCircle } from 'lucide-react';
import { auth, db, getPublishedPage } from './services/firebase';
import { generateFullHtml } from './utils/preview';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  // Public Viewer State
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [publicPage, setPublicPage] = useState<GeneratedPage | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const [history, setHistory] = useState<GeneratedPage[]>([]);

  // Check for Public Page ID in URL on Mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicId = params.get('p');

    if (publicId) {
        setIsViewerMode(true);
        setViewerLoading(true);
        getPublishedPage(publicId)
            .then(page => {
                if (page) {
                    setPublicPage(page);
                } else {
                    setViewerError("Page not found or has been removed.");
                }
            })
            .catch(err => {
                setViewerError("Failed to load page.");
                console.error(err);
            })
            .finally(() => {
                setViewerLoading(false);
            });
    }
  }, []);

  // Initialize Session (Only if not in viewer mode)
  useEffect(() => {
    if (isViewerMode) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || ''
        });
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, [isViewerMode]);

  // Load history when user changes
  useEffect(() => {
    if (!user) {
        setHistory([]);
        return;
    }
    const saved = localStorage.getItem(`lumina_history_${user.id}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    } else {
        setHistory([]);
    }
  }, [user]);

  // Save history to local storage whenever it changes
  useEffect(() => {
    if (user) {
        localStorage.setItem(`lumina_history_${user.id}`, JSON.stringify(history));
    }
  }, [history, user]);

  const handleLogin = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignup = async (name: string, email: string, password: string): Promise<void> => {
    // 1. Create User in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Update Profile with Name
    await updateProfile(firebaseUser, {
      displayName: name
    });

    // 3. Store user data in Firestore users/{uid}
    await setDoc(doc(db, "users", firebaseUser.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      uid: firebaseUser.uid
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('generator');
  };

  const handleSavePage = (page: GeneratedPage) => {
    setHistory(prev => [page, ...prev]);
  };

  const handleUpdatePage = (updatedPage: GeneratedPage) => {
    setHistory(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const handleDeletePage = (id: string) => {
    setHistory(prev => prev.filter(p => p.id !== id));
  };

  // --- VIEWER MODE RENDER ---
  if (isViewerMode) {
    if (viewerLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading Page...</p>
            </div>
        );
    }

    if (viewerError || !publicPage) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center">
                    <div className="inline-flex p-3 bg-red-50 rounded-full mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
                    <p className="text-gray-500 mb-6">{viewerError || "This page does not exist."}</p>
                    <a href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Create your own
                    </a>
                </div>
            </div>
        );
    }

    const fullHtml = generateFullHtml(publicPage);
    return (
        <div className="w-screen h-screen overflow-hidden bg-white relative">
            <iframe 
                srcDoc={fullHtml} 
                className="w-full h-full border-0" 
                title={publicPage.title}
                sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-1.5 rounded-full shadow-lg text-xs font-medium text-gray-500 flex items-center gap-2 hover:opacity-100 transition-opacity opacity-50">
                <Layout className="w-3 h-3 text-indigo-600" />
                <span>Made with Lumina</span>
                <a href="/" className="ml-1 text-indigo-600 hover:underline">Create Yours</a>
            </div>
        </div>
    );
  }

  // --- APP MODE RENDER ---

  if (isLoadingUser) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  if (!user) {
      return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              Lumina
            </h1>
          </div>
          
          <nav className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span>Saved</span>
              {history.length > 0 && (
                <span className={`hidden sm:inline-block text-xs px-2 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                    {history.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center space-x-4 shrink-0">
             <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{user.name}</span>
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'generator' ? (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Build beautiful landing pages</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Describe your product, service, or idea, and Lumina will generate a complete, high-quality landing page for you.
                </p>
            </div>
            <Generator onSave={handleSavePage} onUpdate={handleUpdatePage} userId={user.id} />
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Saved Projects</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your generated landing pages</p>
                </div>
                {history.length > 0 && (
                    <button 
                        onClick={() => {
                            if(window.confirm('Are you sure you want to clear all history?')) {
                                setHistory([]);
                            }
                        }}
                        className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <History pages={history} onDelete={handleDeletePage} onUpdate={handleUpdatePage} userId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;