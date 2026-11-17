import crypto from "node:crypto";
import { config } from "../config/env.js";

/**
 * Generates a unique, cryptographically random order ID.
 */
export const generateOrderId = (prefix = "order"): string => {
  const randomSuffix = crypto.randomBytes(12).toString("hex");
  return `${prefix}_${randomSuffix}`;
};

/**
 * Generates an HMAC-SHA256 signature for orderId + "|" + paymentId.
 * Used by payment gateway responses and test verification.
 */
export const generatePaymentSignature = (
  orderId: string,
  paymentId: string,
  secret = config.paymentGatewaySecret
): string => {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
};

/**
 * Verifies the payment gateway signature with timing-safe comparison.
 */
export const verifyPaymentSignature = (
  params: { orderId: string; paymentId: string; signature: string },
  secret = config.paymentGatewaySecret
): boolean => {
  const { orderId, paymentId, signature } = params;
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const expectedSignature = generatePaymentSignature(orderId, paymentId, secret);

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};

/**
 * Generates an HMAC-SHA256 signature for a raw webhook payload string or buffer.
 */
export const generateWebhookSignature = (
  rawBody: string | Buffer,
  secret = config.paymentWebhookSecret
): string => {
  return crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
};

/**
 * Verifies a webhook signature using timing-safe comparison against raw body.
 */
export const verifyWebhookSignature = (
  rawBody: string | Buffer,
  signature: string,
  secret = config.paymentWebhookSecret
): boolean => {
  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = generateWebhookSignature(rawBody, secret);

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};
