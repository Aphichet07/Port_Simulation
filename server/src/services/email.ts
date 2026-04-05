import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendActivationEmail = async (email: string, token: string) => {
  const activationUrl = `http://localhost:8000/auth/activate?token=${token}`;

  await resend.emails.send({
    from: 'QuantTerminal <onboarding@resend.dev>',
    to: email,
    subject: 'ยืนยันการสมัครสมาชิกของคุณ',
    html: `
      <h1>ยินดีต้อนรับ!</h1>
      <p>กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลและเปิดใช้งานบัญชีของคุณ:</p>
      <a href="${activationUrl}">คลิกที่นี่เพื่อยืนยันตัวตน</a>
    `
  });
};