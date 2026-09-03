import { Resend } from 'resend';

import VerificationEmail from '@/emails/verification-email';

type EmailProps = {
  to: string;
  verificationUrl: string;
  userName: string;
};

export const sendVerificationEmail = async ({
  to,
  verificationUrl,
  userName,
}: EmailProps) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Welcome to NextPress',
    react: (
      <VerificationEmail
        verificationUrl={verificationUrl}
        userName={userName}
      />
    ),
  });
};
