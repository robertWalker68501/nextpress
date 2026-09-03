import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

import { nextPressLogoAbsoluteUrl } from '@/lib/nextpress-logo';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  appName?: string;
}

export function PasswordResetEmail({
  resetUrl,
  userName,
  appName = 'NextPress',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className='bg-white font-sans'>
          <Preview>Reset your {appName} password</Preview>
          <Container className='mx-auto py-5 pb-12'>
            <Img
              src={nextPressLogoAbsoluteUrl('light')}
              alt={appName}
              width={48}
              height={48}
            />
            <Text className='text-[16px] leading-6.5'>Hi {userName},</Text>
            <Text className='text-[16px] leading-6.5'>
              We received a request to reset your {appName} password. Use the
              button below to choose a new password.
            </Text>
            <Section className='text-center'>
              <Button
                className='block rounded-[3px] bg-[#00786f] p-3 text-center text-[16px] text-white no-underline'
                href={resetUrl}
              >
                Reset your password
              </Button>
            </Section>
            <Text className='text-[12px] text-[#8898aa]'>
              If you did not request a password reset, you can safely ignore
              this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PasswordResetEmail;
