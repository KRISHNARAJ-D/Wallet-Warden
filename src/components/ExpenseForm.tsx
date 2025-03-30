import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Expense } from '../types';
import { expensesAPI } from '../lib/database';
import { auth } from '../lib/auth';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
}

const categories = [
  'Food & Drinks',
  'Shopping',
  'Entertainment',
  'Transport',
  'Bills',
  'Other'
];

const funnyRoasts = [
  (amount: number, category: string) => `Spent ₹${amount} on ${category}? Your bank account just filed for emotional damage! 💔`,
  (amount: number) => `₹${amount} gone faster than your ex! At least the ex was free... 🏃‍♂️`,
  (amount: number) => `Breaking News: Local person throws ₹${amount} into the void! More at 11! 📺`,
  (amount: number) => `Your wallet is now ₹${amount} lighter and your regrets are ₹${amount} heavier! ⚖️`,
  (amount: number) => `Plot twist: That ₹${amount} could've been invested in therapy for your shopping addiction! 🛍️`,
  (amount: number) => `Congratulations! You just contributed ₹${amount} to the 'Why Am I Always Broke?' fund! 🎉`,
  () => `Your financial advisor would need financial advice after seeing this! 😱`,
  () => `If poor decisions were an Olympic sport, you'd be taking gold! 🥇`,
  (amount: number) => `₹${amount}? Even your calculator is judging you right now! 🧮`,
  () => `Your money management skills are like a chocolate teapot - sweet but totally impractical! 🍫`,
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRoast = (amount: number, category: string): string => {
    const roast = funnyRoasts[Math.floor(Math.random() * funnyRoasts.length)];
    return roast(amount, category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);

    try {
      const { user } = await auth.getUser();
      if (!user) throw new Error('No user found');

      const expenseData = {
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        category,
        date: new Date().toISOString(),
        roast: generateRoast(parseFloat(amount), category)
      };

      // Insert the expense into Supabase
      const newExpense = await expensesAPI.addExpense(expenseData);

      // Call the onAddExpense callback with the new expense
      onAddExpense({
        id: newExpense.id,
        amount: newExpense.amount,
        description: newExpense.description,
        category: newExpense.category,
        date: new Date(newExpense.date),
        roast: newExpense.roast
      });

      // Reset form
      setAmount('');
      setDescription('');
      setCategory(categories[0]);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 rounded-xl p-6 backdrop-blur-lg transform transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-purple-900">
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-purple-600 hover:bg-purple-700 transition-all duration-300 rounded-lg px-4 py-2 flex items-center justify-center gap-2 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;