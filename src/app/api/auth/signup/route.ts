import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Step 1: Create user with admin client (email already confirmed, no OTP sent)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (createError) {
      if (createError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = userData.user.id;

    // Step 2: Ban the user so they can't log in until admin approves
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: '876600h', // 100 years – effectively banned until admin un-bans
    });

    // Step 3: Insert profile row with pending status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: name,
        role: 'user',
        status: 'pending',
      });

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create user profile.' }, { status: 500 });
    }

    // Step 4: Send "account created" notification email via Resend
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL ?? 'noreply@netalgospace.com',
        to: email,
        subject: 'Your QuantForecast account is under review',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;padding:0;background:#9CA3AF;font-family:'Inter',sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#9CA3AF;">
                <tr><td align="center" style="padding:48px 16px;">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ffffff,#FDF8E8);border-radius:32px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
                    <tr>
                      <td style="padding:48px 48px 0;">
                        <!-- Logo -->
                        <div style="display:inline-block;border:1px solid #D1D5DB;border-radius:999px;padding:6px 20px;">
                          <span style="color:#374151;font-size:13px;font-weight:500;">QuantForecast</span>
                        </div>
                        <h1 style="margin:40px 0 8px;font-size:26px;font-weight:500;color:#111827;letter-spacing:-0.5px;">Account received ✦</h1>
                        <p style="margin:0 0 24px;color:#6B7280;font-size:14px;line-height:1.6;">
                          Hi ${name}, your account has been created and is currently <strong style="color:#374151;">under admin review</strong>.
                          You'll receive another email as soon as you're approved.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 48px 16px;">
                        <div style="background:#F0EBD8;border-radius:16px;padding:20px 24px;">
                          <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">Registered email</p>
                          <p style="margin:0;font-size:14px;color:#374151;font-weight:500;">${email}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 48px 48px;">
                        <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;line-height:1.6;">
                          If you didn't create this account, you can safely ignore this email.
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
      // Email failure is non-critical; user is still created
      console.error('Resend email error:', emailErr);
    }

    return NextResponse.json({ message: 'pending_approval' }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
