import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { processPendingPurchases } from '@/lib/stripe/process-pending-purchases'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Processa acquisti pendenti per questo utente
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user?.email) {
          // Usa service role per accedere a pending_purchases
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
