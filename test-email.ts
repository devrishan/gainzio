import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from './src/lib/mail';

async function main() {
    console.log('DEBUG ENV:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);

    console.log('Sending test email...');
    const res = await sendEmail({
        to: process.env.SMTP_FROM || 'info.rishankp@gmail.com',
        subject: 'Gainzio Test Email',
        html: '<p>This is a test email from Gainzio configuration.</p>',
    });
    console.log('Result:', res);
}

main();
