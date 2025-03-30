import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Coffee, Target, Sparkles, CheckCircle2, LogOut, User } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Stats from './components/Stats';
import DailyTasks from './components/DailyTasks';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Expense, Task, UserProfile } from './types';
import { auth } from './lib/auth';
import { expensesAPI, profilesAPI } from './lib/database';

function App() {
  const [session, setSession] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'stats' | 'profile'>('expenses');
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: '',
    email: '',
    avatar_url: '',
    total_points: 750,
    streak_days: 7,
    level: 5,
    next_level_points: 1000,
    achievements: [
      {
        id: 1,
        title: 'Saving Starter',
        description: 'Save your first ₹1,000',
        icon: 'star',
        points: 100,
        unlocked: true,
        progress: 1000,
        maxProgress: 1000
      },
      {
        id: 2,
        title: 'Budget Master',
        description: 'Stay under budget for 7 consecutive days',
        icon: 'trophy',
        points: 200,
        unlocked: false,
        progress: 5,
        maxProgress: 7
      },
      {
        id: 3,
        title: 'Expense Tracker Pro',
        description: 'Log expenses for 30 days straight',
        icon: 'award',
        points: 500,
        unlocked: false,
        progress: 7,
        maxProgress: 30
      },
      {
        id: 4,
        title: 'Category Champion',
        description: 'Track expenses in all categories',
        icon: 'medal',
        points: 300,
        unlocked: true,
        progress: 6,
        maxProgress: 6
      }
    ]
  });

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current session
        const { data: { session }, error: sessionError } = await auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // Update session state
        setSession(session);

        // If we have a session, fetch user data
        if (session?.user) {
          await updateUserProfile(session.user);
          await fetchExpenses(session.user.id);
        }
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await updateUserProfile(session.user);
        await fetchExpenses(session.user.id);
      } else {
        // Clear user data when logged out
        setExpenses([]);
        setUserProfile(prev => ({
          ...prev,
          name: '',
          email: '',
          avatar_url: ''
        }));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchExpenses = async (userId: string) => {
    try {
      setLoading(true);
      const data = await expensesAPI.getExpenses(userId);

      const formattedExpenses = data.map(expense => ({
        ...expense,
        id: expense.id,
        date: new Date(expense.date)
      }));

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (user: any) => {
    try {
      // Get profile from Supabase
      const profile = await profilesAPI.getProfile(user.id);
      
      // Update local state with profile data
      setUserProfile(prev => ({
        ...prev,
        id: user.id,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        total_points: profile?.total_points || prev.total_points,
        streak_days: profile?.streak_days || prev.streak_days,
        level: profile?.level || prev.level
      }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Fallback to basic profile info if Supabase fetch fails
      setUserProfile(prev => ({
        ...prev,
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      }));
    }
  };

  // Get today's and yesterday's expenses
  const today = new Date().setHours(0, 0, 0, 0);
  const todayExpenses = expenses.filter(e => new Date(e.date).setHours(0, 0, 0, 0) === today);
  const yesterdayExpenses = expenses.filter(
    e => new Date(e.date).setHours(0, 0, 0, 0) === today - 86400000
  );

  const todayTotal = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const yesterdayTotal = yesterdayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const [tasks] = useState<Task[]>([
    { id: 1, title: 'Track all expenses', points: 10, completed: false },
    { id: 2, title: 'Stay under ₹500 today', points: 20, completed: false },
    { id: 3, title: 'No impulse purchases', points: 15, completed: false },
    { id: 4, title: 'Pack lunch from home', points: 25, completed: false },
  ]);

  useEffect(() => {
    if (todayTotal !== 0 && yesterdayTotal !== 0) {
      setShowComparison(true);
      setTimeout(() => setShowComparison(false), 5000);
    }
  }, [todayTotal, yesterdayTotal]);

  const addExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setExpenses([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-500 text-white rounded-lg py-2 hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2940')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/95 via-teal-800/95 to-cyan-900/95 backdrop-blur-sm text-white">
        {/* Comparison Toast */}
        {showComparison && (
          <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-lg p-4 rounded-lg shadow-lg animate-slide-in z-50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Daily Comparison</span>
            </div>
            <p className="text-sm">
              {todayTotal > yesterdayTotal
                ? `You're spending ${((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1)}% more than yesterday. Maybe eat the rich, not like them? 🍽️`
                : `You're spending ${((yesterdayTotal - todayTotal) / yesterdayTotal * 100).toFixed(1)}% less than yesterday. Look who's being responsible! 🎉`}
            </p>
          </div>
        )}

        {/* Header */}
        <header className="p-6 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Wallet Warden</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'expenses'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg scale-105'
                  : 'hover:bg-white/10'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg scale-105'
                  : 'hover:bg-white/10'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg scale-105'
                  : 'hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          {activeTab !== 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg transform hover:scale-105 transition-all duration-300 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold">Today's Damage</h3>
                </div>
                <p className="text-2xl font-bold">₹{todayTotal.toFixed(2)}</p>
                <p className="text-sm text-emerald-200/80 mt-2">Your daily financial choices 😅</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg transform hover:scale-105 transition-all duration-300 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold">Yesterday's Damage</h3>
                </div>
                <p className="text-2xl font-bold">₹{yesterdayTotal.toFixed(2)}</p>
                <p className="text-sm text-emerald-200/80 mt-2">Past financial regrets 💸</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-lg transform hover:scale-105 transition-all duration-300 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold">Monthly Goal</h3>
                </div>
                <p className="text-2xl font-bold">₹4,500 left</p>
                <p className="text-sm text-emerald-200/80 mt-2">Keep it together! 🎯</p>
              </div>
            </div>
          )}

          {/* Daily Tasks */}
          {activeTab === 'expenses' && <DailyTasks tasks={tasks} />}

          {activeTab === 'expenses' && (
            <div className="space-y-8">
              <ExpenseForm onAddExpense={addExpense} />
              <ExpenseList expenses={expenses} />
            </div>
          )}
          
          {activeTab === 'stats' && <Stats expenses={expenses} />}
          
          {activeTab === 'profile' && <Profile profile={userProfile} />}
        </main>
      </div>
    </div>
  );
}

export default App;