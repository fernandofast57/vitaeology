'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MiniMilestonePreview } from '@/components/milestones/MilestonesList';
import { Milestone } from '@/components/milestones/MilestoneCard';
import { Trophy, Loader2 } from 'lucide-react';

interface MilestonesWidgetProps {
  pathType?: 'leadership' | 'ostacoli' | 'microfelicita' | 'global';
}

export default function MilestonesWidget({ pathType }: MilestonesWidgetProps) {
  const router = useRouter();
  const supabase = createClient();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user milestones
        let query = supabase
          .from('user_milestones')
          .select('id, milestone_type, path_type, milestone_data, achieved_at, notified')
          .eq('user_id', user.id)
          .order('achieved_at', { ascending: false });

        // Optionally filter by path
        if (pathType && pathType !== 'global') {
          query = query.or(`path_type.eq.${pathType},path_type.eq.global`);
        }

        const { data: userMilestones, error } = await query;

        if (error) {
          console.error('Error fetching milestones:', error);
          return;
        }

        if (!userMilestones || userMilestones.length === 0) {
          setMilestones([]);
          setTotalXP(0);
          setLoading(false);
          return;
        }

        // Fetch definitions for these milestones
        const milestoneCodes = userMilestones.map(m => m.milestone_type);
        const { data: definitions } = await supabase
          .from('milestone_definitions')
          .select('code, name, description, xp_reward, icon, category, path_type, display_order')
          .in('code', milestoneCodes);

        // Map definitions by code
        const defMap = new Map(definitions?.map(d => [d.code, d]) || []);

        // Build milestone objects
        const formattedMilestones: Milestone[] = userMilestones.map(m => {
          const def = defMap.get(m.milestone_type);
          return {
            id: m.id,
            milestoneType: m.milestone_type,
            pathType: m.path_type as Milestone['pathType'],
            achievedAt: m.achieved_at,
            notified: m.notified,
            definition: def ? {
              code: def.code,
              pathType: def.path_type as Milestone['pathType'],
              category: def.category as 'assessment' | 'exercises' | 'time' | 'mastery' | 'special',
              name: def.name,
              description: def.description,
              icon: def.icon,
              xpReward: def.xp_reward,
              displayOrder: def.display_order,
            } : undefined,
          };
        });

        // Calculate total XP
        const xp = formattedMilestones.reduce(
          (sum, m) => sum + (m.definition?.xpReward || 0),
          0
        );

        setMilestones(formattedMilestones);
        setTotalXP(xp);
      } catch (error) {
        console.error('Error in fetchMilestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [supabase, pathType]);

  const handleViewAll = () => {
    router.push('/progress?tab=milestones');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-neutral-900">Milestone</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  return (
    <MiniMilestonePreview
      milestones={milestones}
      totalXP={totalXP}
      onViewAll={handleViewAll}
    />
  );
}
