// API per analytics conversazioni AI Coach
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  // Verifica che l'utente sia admin
  const adminCheck = await verifyAdminFromRequest();
  if (!adminCheck.isAdmin) {
    return adminCheck.response;
  }

  try {
    const supabase = getSupabaseClient();
    const now = new Date();

    // Calcola date di riferimento
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Query tutti i dati degli ultimi 30 giorni
    const { data: allData, error } = await supabase
      .from('ai_coach_conversations')
      .select('id, user_id, session_id, created_at, user_message, ai_response')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Errore query analytics:', error);
      return NextResponse.json(
        { error: 'Errore caricamento dati' },
        { status: 500 }
      );
    }

    // Se non ci sono dati, ritorna valori vuoti
    if (!allData || allData.length === 0) {
      return NextResponse.json({
        totalConversations: 0,
        avgMessagesPerConversation: 0,
        abandonmentRate: 0,
        dau: 0,
        wau: 0,
        mau: 0,
        hourlyDistribution: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
        topUsers: [],
        dailyActiveUsers: [],
        conversationsTrend: [],
      });
    }

    // ===== DAU / WAU / MAU =====
    const uniqueUsersToday = new Set(
      allData
        .filter(d => new Date(d.created_at) >= startOfDay)
        .map(d => d.user_id)
    ).size;

    const uniqueUsersWeek = new Set(
      allData
        .filter(d => new Date(d.created_at) >= startOfWeek)
        .map(d => d.user_id)
    ).size;

    const uniqueUsersMonth = new Set(
      allData
        .filter(d => new Date(d.created_at) >= startOfMonth)
        .map(d => d.user_id)
    ).size;

    // ===== Sessioni e Messaggi =====
    // Raggruppa per session_id per calcolare metriche sessione
    const sessionGroups: Record<string, typeof allData> = {};
    allData.forEach(row => {
      const sid = row.session_id || row.id; // fallback se session_id null
      if (!sessionGroups[sid]) {
        sessionGroups[sid] = [];
      }
      sessionGroups[sid].push(row);
    });

    const totalSessions = Object.keys(sessionGroups).length;

    // Conta messaggi per sessione (ogni riga = 1 scambio utente + AI)
    const messagesPerSession = Object.values(sessionGroups).map(msgs => msgs.length);
    const avgMessagesPerSession = messagesPerSession.length > 0
      ? messagesPerSession.reduce((a, b) => a + b, 0) / messagesPerSession.length
      : 0;

    // Tasso abbandono: sessioni con solo 1 scambio
    const abandonedSessions = messagesPerSession.filter(count => count === 1).length;
    const abandonmentRate = totalSessions > 0
      ? (abandonedSessions / totalSessions) * 100
      : 0;

    // ===== Distribuzione oraria =====
    const hourlyDistribution = Array(24).fill(0);
    allData.forEach(row => {
      const hour = new Date(row.created_at).getHours();
      hourlyDistribution[hour]++;
    });

    const hourlyData = hourlyDistribution.map((count, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      count,
    }));

    // ===== Top users (ultimi 30 giorni) =====
    const userCounts: Record<string, number> = {};
    allData.forEach(row => {
      userCounts[row.user_id] = (userCounts[row.user_id] || 0) + 1;
    });

    // Ottieni info utenti
    const topUserIds = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId]) => userId);

    // Query per ottenere email utenti
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', topUserIds);

    const userMap: Record<string, { email?: string; name?: string }> = {};
    usersData?.forEach(u => {
      userMap[u.id] = { email: u.email, name: u.full_name };
    });

    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({
        userId,
        email: userMap[userId]?.email || 'N/A',
        name: userMap[userId]?.name || null,
        messageCount: count,
      }));

    // ===== Trend DAU ultimi 30 giorni =====
    const dailyUsers: Record<string, Set<string>> = {};
    const dailyConversations: Record<string, number> = {};

    allData.forEach(row => {
      const date = row.created_at.split('T')[0];
      if (!dailyUsers[date]) {
        dailyUsers[date] = new Set();
        dailyConversations[date] = 0;
      }
      dailyUsers[date].add(row.user_id);
      dailyConversations[date]++;
    });

    const dailyActiveUsers = Object.entries(dailyUsers)
      .map(([date, users]) => ({
        date,
        count: users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const conversationsTrend = Object.entries(dailyConversations)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ===== Totale conversazioni questo mese =====
    const monthData = allData.filter(d => new Date(d.created_at) >= startOfMonth);
    const monthSessionIds = new Set(monthData.map(d => d.session_id || d.id));

    return NextResponse.json({
      // Metriche principali
      totalConversations: monthSessionIds.size,
      avgMessagesPerConversation: Math.round(avgMessagesPerSession * 10) / 10,
      abandonmentRate: Math.round(abandonmentRate * 10) / 10,

      // Utenti attivi
      dau: uniqueUsersToday,
      wau: uniqueUsersWeek,
      mau: uniqueUsersMonth,

      // Distribuzione e trend
      hourlyDistribution: hourlyData,
      topUsers,
      dailyActiveUsers,
      conversationsTrend,

      // Metriche aggiuntive
      totalMessages: allData.length,
      sessionsThisMonth: monthSessionIds.size,
    });

  } catch (error) {
    console.error('Errore API analytics:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
