import { Resend } from 'resend';

import PasswordResetEmail from '@/emails/password-reset-email';

const resend = new Resend(process.env.RESEND_API_KEY);

type PasswordResetEmailOptions = {
  to: string;
  resetUrl: string;
  userName: string;
};

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: PasswordResetEmailOptions) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Reset your NextPress password',
    react: (
      <PasswordResetEmail
        resetUrl={resetUrl}
        userName={userName}
      />
    ),
  });
}
