import React, { useState } from 'react';
import { Calendar, Tag, Share2 } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  const [shareMessage, setShareMessage] = useState<string>('');
  const [showShareToast, setShowShareToast] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const shareExpense = async (expense: Expense) => {
    const text = `${expense.roast}\n\nSpent ₹${expense.amount} on ${expense.description} 🤑\n\n#WalletWarden #BrokeLife`;
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ text })) {
        await navigator.share({
          text: text,
          title: 'Check out my questionable financial decisions 💸',
        });
        setShareMessage('Shared successfully! Spread the financial wisdom! 🌟');
      } else {
        await navigator.clipboard.writeText(text);
        setShareMessage('Copied to clipboard! Share your financial regrets! 📋');
      }
    } catch (error) {
      // Fallback for when sharing fails or is cancelled
      try {
        await navigator.clipboard.writeText(text);
        setShareMessage('Copied to clipboard! Share your financial regrets! 📋');
      } catch {
        setShareMessage('Could not share. But keep making questionable decisions! 😅');
      }
    }

    setShowShareToast(true);
    setTimeout(() => {
      setShowShareToast(false);
      setShareMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-bold">Recent Financial Regrets</h2>
      
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 z-50">
          {shareMessage}
        </div>
      )}

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg text-center">
            <p className="text-lg mb-2">No expenses yet? Sus... 🤨</p>
            <p className="text-gray-300">Either you're really good with money (doubt it) or you're not logging your expenses!</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transition hover:bg-white/20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(expense.date)}</span>
                    <Tag className="w-4 h-4 ml-2" />
                    <span className="text-sm">{expense.category}</span>
                  </div>
                  <p className="text-xl font-semibold">{expense.description}</p>
                  <p className="text-3xl font-bold text-purple-400">₹{expense.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => shareExpense(expense)}
                    className="p-2 hover:bg-white/10 rounded-lg transition group"
                    title="Share this financial mistake"
                  >
                    <Share2 className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                  </button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <p className="italic text-gray-300">{expense.roast}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;