import nodemailer from "nodemailer";
import { logger } from "./utils/logger";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface LeadAlertData {
  postTitle: string;
  painScore: number;
  hardPainSummary: string;
  momTestQuestion: string;
  postUrl: string;
}

export async function sendLeadAlert(leadData: LeadAlertData) {
  const mailOptions = {
    from: `"IntentMap Bot" <${process.env.SMTP_USER}>`, // sender address
    to: process.env.NOTIFICATION_EMAIL_ADDRESS, // list of receivers
    subject: `[IntentMap] High-Intent Lead Found: ${leadData.postTitle.substring(0, 50)}...`, // Subject line
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff; color: #09090b;">
        <div style="border-bottom: 1px solid #e4e4e7; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #09090b; font-size: 20px;">🎯 High-Intent Lead Detected</h2>
          <p style="margin: 5px 0 0; color: #71717a; font-size: 14px;">Pain Score: <strong style="color: #dc2626;">${leadData.painScore}/10</strong></p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em; margin-bottom: 8px;">Original Post</h3>
          <p style="margin: 0; font-weight: 500; line-height: 1.5;">
            <a href="${leadData.postUrl}" style="color: #09090b; text-decoration: none; border-bottom: 1px dotted #09090b;">${leadData.postTitle}</a>
          </p>
        </div>

        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em; margin: 0 0 8px;">Identified Pain</h3>
          <p style="margin: 0; font-style: italic; color: #09090b;">"${leadData.hardPainSummary}"</p>
        </div>

        <div style="border: 1px solid #e4e4e7; padding: 15px; border-radius: 6px;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em; margin: 0 0 8px;">Suggested 'Mom Test' Opener</h3>
          <p style="margin: 0; font-family: monospace; color: #09090b; background-color: #f4f4f5; padding: 10px; border-radius: 4px;">"${leadData.momTestQuestion}"</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="${leadData.postUrl}" style="background-color: #09090b; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">View on Reddit</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email notification sent: ${info.messageId}`);
  } catch (error) {
    logger.error("Failed to send email notification", { error });
    // We do NOT throw here, so the scraper keeps running
  }
}
