import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const TO_EMAIL = 'niklas.h112@gmail.com';
const GMAIL_USER = 'niklas.h112@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || '';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: name, email, message' },
        { status: 400 }
      );
    }

    if (!GMAIL_PASS) {
      return NextResponse.json(
        { error: 'GMAIL_APP_PASSWORD nicht konfiguriert' },
        { status: 500 }
      );
    }

    // E-Mail über Gmail-SMTP senden
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: GMAIL_USER,
      to: TO_EMAIL,
      replyTo: email,
      subject: `📩 Support-Anfrage von ${name}`,
      text: `Neue Support-Anfrage über HEP-QuickWrite:

Name: ${name}
E-Mail: ${email}

Nachricht:
${message}

---
Gesendet am ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Senden der Support-Anfrage' },
      { status: 500 }
    );
  }
}
