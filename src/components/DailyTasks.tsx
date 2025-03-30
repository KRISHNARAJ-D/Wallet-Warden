import React, { useState } from 'react';
import { CheckCircle2, Circle, Trophy, Star } from 'lucide-react';
import { Task } from '../types';

interface DailyTasksProps {
  tasks: Task[];
}

const DailyTasks: React.FC<DailyTasksProps> = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  const toggleTask = (taskId: number) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      // Calculate total points for completed tasks
      const totalPoints = newTasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + t.points, 0);

      // Show reward message if all tasks are completed
      const allCompleted = newTasks.every(t => t.completed);
      if (allCompleted) {
        setRewardMessage(`🎉 Financial Guru Status Achieved! +${totalPoints} points!`);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
      }

      return newTasks;
    });
  };

  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="relative">
      {/* Reward Toast */}
      {showReward && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-purple-600/90 backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-subtle">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            {rewardMessage}
          </div>
        </div>
      )}

      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg mb-8 transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Daily Money Missions</h2>
          </div>
          <div className="flex items-center gap-2 bg-purple-600/30 px-4 py-2 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{totalPoints} pts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                task.completed
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-white/5 hover:bg-white/10'
              } border border-white/10`}
            >
              <div className="flex items-start gap-3">
                <button className="mt-1">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-purple-300">+{task.points} points</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-300">
          Complete all tasks to unlock Financial Guru status! 🎯
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;