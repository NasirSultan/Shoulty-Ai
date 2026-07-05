import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, query } = body;
    const mobile = phone ?? "";
    const subject = "Contact Form Inquiry";
    const message = query ?? "";

    // IMPORTANT: You must set these in your .env file
    // For Gmail: Use an "App Password" (not your regular password)
    // For other services: Use their provided SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_SERVER_USER}>`,
      to: 'theotheo031@gmail.com',
      subject: `[Contact Form] ${subject}`,
      replyTo: email,
      text: `
        New Message from Contact Form:
        
        Name: ${name}
        Email: ${email}
        Mobile: ${mobile}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
