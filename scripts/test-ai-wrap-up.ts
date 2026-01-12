/**
 * Test script per verificare wrap-up AI Coach
 * Esegui con: npx ts-node scripts/test-ai-wrap-up.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testWrapUp() {
  console.log('🧪 Test Wrap-up AI Coach\n');

  // Simula conversazione con saluto finale
  const testMessages = [
    { role: 'user', content: 'Ciao Fernando, come posso migliorare la mia leadership?' },
    { role: 'assistant', content: '[risposta AI precedente]' },
    { role: 'user', content: 'Grazie mille Fernando, sei stato molto utile!' }
  ];

  console.log('📤 Invio messaggio di chiusura: "Grazie mille Fernando, sei stato molto utile!"');

  try {
    const response = await fetch(`${BASE_URL}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi auth header se necessario
      },
      body: JSON.stringify({
        messages: testMessages,
        userId: 'test-user-id',
        pathType: 'leadership'
      })
    });

    const data = await response.json();

    console.log('\n📥 Risposta AI:\n');
    console.log(data.content || data.message);

    // Verifica elementi wrap-up
    const content = (data.content || data.message || '').toLowerCase();

    console.log('\n✅ Verifica elementi wrap-up:');

    const hasRiepilogo = content.includes('abbiamo parlato') ||
                         content.includes('discusso') ||
                         content.includes('emerso') ||
                         content.includes('abbiamo esplorato');
    console.log(`  - Riepilogo conversazione: ${hasRiepilogo ? '✅' : '❌'}`);

    const hasAzione = content.includes('prossim') ||
                      content.includes('potresti') ||
                      content.includes('ti consiglio') ||
                      content.includes('prova a') ||
                      content.includes('ti invito');
    console.log(`  - Azione suggerita: ${hasAzione ? '✅' : '❌'}`);

    const hasEsercizio = content.includes('esercizio') ||
                         content.includes('pratica');
    console.log(`  - Esercizio menzionato: ${hasEsercizio ? '✅' : '❌'}`);

    const hasSaluto = content.includes('buon') ||
                      content.includes('a presto') ||
                      content.includes('in bocca al lupo') ||
                      content.includes('piacere');
    console.log(`  - Saluto caldo: ${hasSaluto ? '✅' : '❌'}`);

    const wrapUpScore = [hasRiepilogo, hasAzione, hasEsercizio, hasSaluto].filter(Boolean).length;
    console.log(`\n📊 Wrap-up Score: ${wrapUpScore}/4`);

    if (wrapUpScore >= 3) {
      console.log('✅ Wrap-up VALIDO');
    } else {
      console.log('⚠️ Wrap-up INCOMPLETO - verificare system prompt');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

testWrapUp();
