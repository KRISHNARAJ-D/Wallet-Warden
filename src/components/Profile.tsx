import React, { useState } from 'react';
import { Edit2, Award, Flame, Star, Trophy } from 'lucide-react';
import { UserProfile } from '../types';
import ProfileEdit from './ProfileEdit';

interface ProfileProps {
  profile: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const handleProfileUpdate = (name: string, avatar: string) => {
    setCurrentProfile(prev => ({
      ...prev,
      name,
      avatar_url: avatar
    }));
    setIsEditing(false);
  };

  const progressToNextLevel = (currentProfile.total_points / currentProfile.next_level_points) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white/10 rounded-xl p-8 backdrop-blur-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-emerald-500/10"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={currentProfile.avatar_url}
              alt={currentProfile.name}
              className="w-32 h-32 rounded-full border-4 border-emerald-500/50 object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-3xl font-bold">{currentProfile.name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-emerald-300 mt-1">{currentProfile.email}</p>
            <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>{currentProfile.total_points} points</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>{currentProfile.streak_days} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Level {currentProfile.level}</h2>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-emerald-500/20">
                Progress to Level {currentProfile.level + 1}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block">
                {currentProfile.total_points}/{currentProfile.next_level_points}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
            <div
              style={{ width: `${progressToNextLevel}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-teal-500"
            ></div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Achievements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentProfile.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <h3 className="font-semibold mb-1">{achievement.title}</h3>
              <p className="text-sm text-gray-300 mb-3">{achievement.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">{achievement.points} points</span>
                </div>
                <div className="text-sm">
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
        <ProfileEdit
          currentName={currentProfile.name}
          currentAvatar={currentProfile.avatar_url}
          onSave={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default Profile;