// In app/auth/callback/route.ts

import { createClient } from '@/app/lib/supabase/server'; // << แก้ไขเป็นตัวนี้
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient(); // << เรียกใช้งาน Client ที่สร้างขึ้นใหม่
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  console.error('Authentication error: Could not exchange code for session');
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`);
}