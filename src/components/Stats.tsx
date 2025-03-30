import React, { useState, useEffect } from 'react';
import { PieChart, BarChart2, TrendingUp, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth } from '../lib/auth';
import { expensesAPI } from '../lib/database';
import { Expense } from '../types';

interface StatsProps {
  expenses: Expense[];
}

const Stats: React.FC<StatsProps> = ({ expenses: initialExpenses }) => {
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'year'>('week');
  const [rangeExpenses, setRangeExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRangeExpenses = async () => {
      try {
        setLoading(true);
        const { user } = await auth.getUser();
        if (user) {
          const data = await expensesAPI.getExpensesByDateRange(user.id, selectedRange);
          setRangeExpenses(data);
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRangeExpenses();
  }, [selectedRange]);

  // Calculate total expenses
  const totalExpenses = rangeExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate expenses by category
  const expensesByCategory = rangeExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get top spending categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Calculate daily average
  const getDaysInRange = (range: typeof selectedRange) => {
    switch (range) {
      case 'today':
      case 'yesterday':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 365;
    }
  };

  const dailyAverage = totalExpenses / getDaysInRange(selectedRange);

  // Get highest single expense
  const highestExpense = rangeExpenses.reduce(
    (max, curr) => (curr.amount > max.amount ? curr : max),
    { amount: 0 } as Expense
  );

  const ranges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Spending Analytics
        </h2>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          {ranges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedRange(value)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedRange === value
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'hover:bg-white/10 text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <h3 className="font-semibold">Total Spent</h3>
              </div>
              <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-300 mt-2">{selectedRange} expenses</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <BarChart2 className="w-6 h-6 text-emerald-400" />
                <h3 className="font-semibold">Daily Average</h3>
              </div>
              <p className="text-3xl font-bold">₹{dailyAverage.toFixed(2)}</p>
              <p className="text-sm text-gray-300 mt-2">per day</p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-6 h-6 text-emerald-400" />
                <h3 className="font-semibold">Top Category</h3>
              </div>
              <p className="text-3xl font-bold">
                {topCategories[0] ? topCategories[0][0] : 'N/A'}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {topCategories[0]
                  ? `₹${topCategories[0][1].toFixed(2)}`
                  : 'No expenses yet'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <h3 className="font-semibold">Highest Expense</h3>
              </div>
              <p className="text-3xl font-bold">
                ₹{highestExpense.amount?.toFixed(2) || '0'}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {highestExpense.description || 'No expenses yet'}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
            <h3 className="font-semibold mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="animate-slide-up">
                  <div className="flex justify-between mb-2">
                    <span>{category}</span>
                    <span>₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                      style={{
                        width: `${(amount / totalExpenses) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {rangeExpenses.length === 0 && (
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg text-center">
              <p className="text-lg mb-2">No expenses to analyze for this period! 📊</p>
              <p className="text-gray-300">
                Add some expenses and watch the magic happen! We promise to judge your
                spending habits... respectfully* 😉
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stats;