import { createRouteHandlerClient } from '@supabase/ssr' // <-- เปลี่ยน import
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies() // <-- ไม่ต้อง await ตรงนี้
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore }) // <-- แก้ไขวิธีส่ง cookies
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}