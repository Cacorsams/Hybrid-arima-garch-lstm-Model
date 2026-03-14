import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/admin/users — list all users with profile status
export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles });
}

// PATCH /api/admin/users — approve or reject a user
export async function PATCH(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, action } = await request.json(); // action: 'approve' | 'reject'

  if (!userId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  // Update profile status
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (action === 'approve') {
    // Un-ban the user in auth
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    });
    if (banError) {
      return NextResponse.json({ error: banError.message }, { status: 500 });
    }
  }

  // Fetch profile to get email for notification
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (profile) {
    const isApproved = action === 'approve';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL ?? 'noreply@netalgospace.com',
        to: profile.email,
        subject: isApproved
          ? 'Your QuantForecast account has been approved!'
          : 'Update on your QuantForecast account',
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
            <body style="margin:0;padding:0;background:#9CA3AF;font-family:'Inter',sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#9CA3AF;">
                <tr><td align="center" style="padding:48px 16px;">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ffffff,#FDF8E8);border-radius:32px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
                    <tr>
                      <td style="padding:48px 48px 0;">
                        <div style="display:inline-block;border:1px solid #D1D5DB;border-radius:999px;padding:6px 20px;">
                          <span style="color:#374151;font-size:13px;font-weight:500;">QuantForecast</span>
                        </div>
                        <h1 style="margin:40px 0 8px;font-size:26px;font-weight:500;color:#111827;letter-spacing:-0.5px;">
                          ${isApproved ? 'You\'re approved ✦' : 'Account update'}
                        </h1>
                        <p style="margin:0 0 24px;color:#6B7280;font-size:14px;line-height:1.6;">
                          Hi ${profile.full_name ?? 'there'},
                          ${isApproved
            ? ' your account has been <strong style="color:#374151;">approved</strong>. You can now sign in and access the platform.'
            : ' unfortunately your account request has not been approved at this time. Please contact support for more information.'}
                        </p>
                        ${isApproved ? `
                        <a href="${siteUrl}/auth/signin"
                           style="display:inline-block;background:#F5C842;color:#111827;font-size:14px;font-weight:500;padding:14px 32px;border-radius:999px;text-decoration:none;margin-bottom:32px;">
                          Sign In Now
                        </a>` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 48px 48px;">
                        <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;line-height:1.6;">
                          If you have questions, reply to this email or contact our support team.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (emailErr) {
      console.error('Approval email error:', emailErr);
    }
  }

  return NextResponse.json({ message: `User ${newStatus} successfully.` });
}

// Helper: check if the calling user is an admin
async function isAdmin(_request: Request): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() { },
          remove() { },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}
