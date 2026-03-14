import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Step 1: Check profile status BEFORE attempting sign-in.
    // Look up by email using the admin client so we can check pending/banned state.
    const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
    const matchedUser = authUser?.users?.find((u) => u.email === email);

    if (matchedUser) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('status, role')
        .eq('id', matchedUser.id)
        .single();

      // Only block if profile explicitly says pending or rejected.
      // If no profile row exists, fall through (admin/legacy users).
      if (profile && (profile.status === 'pending' || profile.status === 'rejected')) {
        return NextResponse.json({ error: 'not_approved' }, { status: 403 });
      }

      // If approved but still banned in auth, un-ban them now automatically.
      if (profile?.status === 'approved' && matchedUser.banned_until) {
        await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
          ban_duration: 'none',
        });
      }
    }

    // Step 2: Attempt sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    return NextResponse.json({ message: 'success' }, { status: 200 });
  } catch (err) {
    console.error('Signin error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
