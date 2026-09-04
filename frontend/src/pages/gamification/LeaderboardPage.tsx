import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  Zap,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Crown,
} from 'lucide-react';
import { gamificationApi } from '../../api/gamification.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<'weekly' | 'alltime'>('alltime');
  const [newlyUnlockedMsg, setNewlyUnlockedMsg] = useState<string | null>(null);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => gamificationApi.getLeaderboard(period),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: gamificationApi.getAchievements,
  });

  const checkAchMutation = useMutation({
    mutationFn: gamificationApi.checkAchievements,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      if (data && data.length > 0) {
        setNewlyUnlockedMsg(`Selamat! Kamu membuka: ${data.join(', ')}`);
      } else {
        setNewlyUnlockedMsg('Semua pencapaian yang memenuhi syarat telah diklaim!');
      }
    },
  });

  const top3 = leaderboard.slice(0, 3);
  const remainingRanks = leaderboard.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-600" /> Papan Peringkat Pelajar
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Puncak Prestasi & Penghargaan
        </h1>
        <p className="text-slate-500 text-sm">
          Kumpulkan XP dari lesson dan kuis setiap hari untuk menaiki tangga juara.
        </p>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              period === 'weekly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mingguan (7 Hari)
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              period === 'alltime'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sepanjang Masa
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <Card className="p-6 text-center border-2 border-slate-200 bg-white order-2 md:order-1 relative shadow-card">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border-2 border-white shadow">
                2
              </span>
              <img
                src={
                  top3[1].avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].username}`
                }
                alt="Rank 2"
                className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-slate-50 border-2 border-slate-200"
              />
              <h3 className="font-extrabold text-slate-900 text-base">{top3[1].username}</h3>
              <p className="text-xs text-slate-400 font-semibold mb-3">Level {top3[1].level}</p>
              <Badge variant="streak" className="text-xs">
                <Zap className="w-3 h-3 fill-amber-500" /> {top3[1].xpEarned} XP
              </Badge>
            </Card>
          )}

          {/* Rank 1 (Gold - Elevated) */}
          {top3[0] && (
            <Card className="p-8 text-center border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white order-1 md:order-2 relative shadow-xl md:-translate-y-4">
              <Crown className="w-8 h-8 text-amber-500 fill-amber-400 mx-auto -mt-4 mb-2 animate-bounce" />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-black text-sm flex items-center justify-center border-2 border-white shadow-md">
                1
              </span>
              <img
                src={
                  top3[0].avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].username}`
                }
                alt="Rank 1"
                className="w-20 h-20 rounded-2xl mx-auto mb-3 bg-white p-1 border-4 border-amber-300 shadow-md"
              />
              <h3 className="font-black text-slate-900 text-lg">{top3[0].username}</h3>
              <p className="text-xs text-amber-700 font-bold mb-3">Juara Level {top3[0].level}</p>
              <Badge variant="streak" className="text-xs py-1 px-3">
                <Zap className="w-3.5 h-3.5 fill-amber-500" /> {top3[0].xpEarned} XP
              </Badge>
            </Card>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <Card className="p-6 text-center border-2 border-amber-200 bg-white order-3 relative shadow-card">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border-2 border-white shadow">
                3
              </span>
              <img
                src={
                  top3[2].avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].username}`
                }
                alt="Rank 3"
                className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-slate-50 border-2 border-amber-100"
              />
              <h3 className="font-extrabold text-slate-900 text-base">{top3[2].username}</h3>
              <p className="text-xs text-slate-400 font-semibold mb-3">Level {top3[2].level}</p>
              <Badge variant="streak" className="text-xs">
                <Zap className="w-3 h-3 fill-amber-500" /> {top3[2].xpEarned} XP
              </Badge>
            </Card>
          )}
        </div>
      )}

      {/* Ranks 4+ Table */}
      <Card className="p-0 border-2 border-slate-100 shadow-card overflow-hidden">
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
          <span>PERINGKAT & PENGGUNA</span>
          <span>PEROLEHAN XP</span>
        </div>
        <div className="divide-y divide-slate-100">
          {remainingRanks.map((r) => {
            const isCurrentUser = user?.id === r.userId;
            return (
              <div
                key={r.userId}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  isCurrentUser ? 'bg-brand-50/80 font-bold' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center font-black text-xs text-slate-400">
                    #{r.rank}
                  </span>
                  <img
                    src={
                      r.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${r.username}`
                    }
                    alt={r.username}
                    className="w-10 h-10 rounded-xl bg-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      {r.username}
                      {isCurrentUser && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white px-2 py-0.5 rounded-full">
                          Kamu
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-slate-400 font-semibold">
                      Level {r.level} • 🔥 {r.streak} Hari
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm font-black text-amber-600">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {r.xpEarned} XP
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badges & Achievements Showcase */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" /> Lencana Prestasi (Badges)
            </h2>
            <p className="text-xs text-slate-500">
              Selesaikan tantangan belajar dan dapatkan bonus XP instan.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => checkAchMutation.mutate()}
            isLoading={checkAchMutation.isPending}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Klaim Badge Baru</span>
          </Button>
        </div>

        {newlyUnlockedMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{newlyUnlockedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`p-5 border-2 transition-all flex items-start gap-4 ${
                ach.isUnlocked
                  ? 'border-brand-300 bg-brand-50/30'
                  : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl ${
                  ach.isUnlocked
                    ? 'bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-button-brand'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {ach.isUnlocked ? '🏆' : <Lock className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{ach.title}</h4>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    +{ach.xpBonus} XP
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
                {ach.isUnlocked && (
                  <span className="text-[10px] font-bold text-brand-700 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3 h-3" /> Terbuka
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
