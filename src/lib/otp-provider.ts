import { z } from "zod";
import crypto from "crypto";
import axios from "axios";
import twilio from "twilio";

import { getRedis } from "./redis";
import { prisma } from "./prisma";

const phoneSchema = z
  .string()
  .min(10)
  .max(15)
  .regex(/^[0-9]+$/, 'Invalid phone number');

export type OtpChannel = "sms";

export interface SendOtpOptions {
  phone: string;
  channel?: OtpChannel;
  ipAddress?: string;
}

export interface VerifyOtpOptions {
  phone: string;
  code: string;
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function sendViaMsg91(phone: string, code: string): Promise<void> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "GAINZIO";

  if (!apiKey) {
    throw new Error("MSG91_API_KEY is not configured");
  }

  let formattedPhone = phone;
  if (!phone.startsWith("91") && phone.length === 10) {
    formattedPhone = `91${phone}`;
  }

  const message = `Your Gainzio verification code is ${code}. Valid for 5 minutes.`;

  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/flow/",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        sender: senderId,
        short_url: "0",
        mobiles: formattedPhone,
        message,
      },
      {
        headers: {
          authkey: apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 200) {
      await axios.get("https://api.msg91.com/api/sendhttp.php", {
        params: {
          authkey: apiKey,
          mobiles: formattedPhone,
          message,
          sender: senderId,
          route: 4,
          country: 91,
        },
      });
    }
  } catch (error) {
    console.error("[MSG91] Error sending OTP:", error);
    throw new Error("Failed to send OTP via MSG91");
  }
}

async function sendViaTwilio(phone: string, code: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials are not configured");
  }

  let formattedPhone = phone;
  if (!phone.startsWith("+")) {
    if (phone.length === 10) {
      formattedPhone = `+91${phone}`;
    } else if (phone.startsWith("91") && phone.length === 12) {
      formattedPhone = `+${phone}`;
    } else {
      formattedPhone = `+${phone}`;
    }
  }

  const client = twilio(accountSid, authToken);
  const message = `Your Gainzio verification code is ${code}. Valid for 5 minutes.`;

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });
  } catch (error) {
    console.error("[Twilio] Error sending OTP:", error);
    throw new Error("Failed to send OTP via Twilio");
  }
}

export async function sendOtp({ phone, channel = "sms", ipAddress }: SendOtpOptions): Promise<void> {
  const parsedPhone = phoneSchema.parse(phone);

  const { checkRateLimit } = await import("./rate-limit");
  const rateLimitResult = await checkRateLimit({
    identifier: parsedPhone,
    type: "otp",
    limit: 10,
    windowSeconds: 3600,
  });

  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded. Please try again after ${rateLimitResult.resetAt.toISOString()}`);
  }

  const code = generateOtpCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpRequest.create({
    data: {
      phone: parsedPhone,
      codeHash,
      expiresAt,
      ipAddress: ipAddress || null,
    },
  });

  const provider = process.env.OTP_PROVIDER || "dev";

  const redis = getRedis();
  if (redis && process.env.NODE_ENV === "development") {
    const key = `otp:last:${parsedPhone}`;
    await redis.set(key, code, "EX", 300);
  }

  if (provider === "twilio") {
    await sendViaTwilio(parsedPhone, code);
  } else if (provider === "msg91") {
    await sendViaMsg91(parsedPhone, code);
  } else {
    console.log(`[OTP][DEV] Code for ${parsedPhone}: ${code}`);
    if (process.env.NODE_ENV === "production") {
      throw new Error('OTP_PROVIDER must be set to "msg91" or "twilio" in production');
    }
  }
}

export async function verifyOtp({ phone, code }: VerifyOtpOptions): Promise<boolean> {
  const parsedPhone = phoneSchema.parse(phone);
  const codeHash = hashCode(code);

  const request = await prisma.otpRequest.findFirst({
    where: { phone: parsedPhone },
    orderBy: { createdAt: 'desc' },
  });

  if (!request) return false;
  if (request.expiresAt < new Date()) return false;
  if (request.consumedAt || request.verifiedAt) return false;
  if (request.codeHash !== codeHash) return false;

  await prisma.otpRequest.update({
    where: { id: request.id },
    data: {
      verifiedAt: new Date(),
      consumedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  return true;
}


