import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { processPendingPurchases } from '@/lib/stripe/process-pending-purchases'
import { grantAssessmentAccess, LIBRO_TO_ASSESSMENT, AssessmentType } from '@/lib/assessment-access'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const bookCode = searchParams.get('book_code') // Codice libro per attivazione
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Processa acquisti pendenti per questo utente
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user?.email) {
          // Usa service role per accedere a pending_purchases e book_codes
          const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          const result = await processPendingPurchases(
            serviceSupabase,
            user.id,
            user.email
          )

          if (result.processed > 0) {
            console.log(`✅ Processed ${result.processed} pending purchases for ${user.email}`)
            console.log(`   Grants: ${result.grants.join(', ')}`)
          }

          if (result.errors.length > 0) {
            console.error('Pending purchase errors:', result.errors)
          }

          // Processa codice libro se presente
          if (bookCode) {
            try {
              const normalizedCode = bookCode.trim().toUpperCase()

              // Verifica codice
              const { data: bookCodeData } = await serviceSupabase
                .from('book_codes')
                .select('*')
                .eq('code', normalizedCode)
                .eq('is_active', true)
                .single()

              if (bookCodeData) {
                const assessmentType = LIBRO_TO_ASSESSMENT[bookCodeData.book_slug] as AssessmentType

                if (assessmentType) {
                  // Verifica che non abbia già usato questo codice
                  const { data: existingActivation } = await serviceSupabase
                    .from('book_code_activations')
                    .select('id')
                    .eq('code_id', bookCodeData.id)
                    .eq('user_id', user.id)
                    .single()

                  if (!existingActivation) {
                    // Concedi accesso
                    await grantAssessmentAccess(
                      serviceSupabase,
                      user.id,
                      assessmentType,
                      'book_purchase',
                      `book_code:${normalizedCode}`
                    )

                    // Registra attivazione
                    await serviceSupabase.from('book_code_activations').insert({
                      code_id: bookCodeData.id,
                      user_id: user.id,
                      email: user.email,
                      ip_address: 'callback',
                    })

                    // Incrementa contatore
                    await serviceSupabase
                      .from('book_codes')
                      .update({ current_uses: bookCodeData.current_uses + 1 })
                      .eq('id', bookCodeData.id)

                    console.log(`✅ Book code ${normalizedCode} activated for ${user.email}`)
                  }
                }
              }
            } catch (err) {
              console.error('Error processing book code:', err)
            }
          }
        }
      } catch (err) {
        // Non bloccare il login se fallisce l'elaborazione pending
        console.error('Error processing pending purchases:', err)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
