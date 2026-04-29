/**
 * emailService.js
 * Servicio modular de envío de correos usando Resend HTTP API.
 * Dominio: turismoecuadorapp.com (verificado con SPF, DKIM, DMARC en Namecheap)
 * No usa SMTP, no usa Nodemailer, no depende de Gmail.
 */

'use strict';

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Configuración de dominio ────────────────────────────────────────────────
const FROM_ADDRESS = 'Soporte Turismo <soporte@turismoecuadorapp.com>';
const REPLY_TO     = 'jose22.quezada@gmail.com';

// ─── Funciones de envío ──────────────────────────────────────────────────────

/**
 * Envía correo de bienvenida con contraseña temporal tras el registro.
 * @param {string} to          - Email destino
 * @param {string} nombre      - Nombre completo del usuario
 * @param {string} tempPassword - Contraseña temporal generada
 * @param {string} html        - HTML del template de bienvenida
 */
const sendWelcomeEmail = async (to, nombre, tempPassword, html) => {
  try {
    const response = await resend.emails.send({
      from:     FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject:  '¡Bienvenido a ISTPET Turismo! Tu acceso está listo.',
      html,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log(`[Email] Welcome → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error welcome → ${to}:`, error.message);
    throw error;
  }
};

/**
 * Envía correo de recuperación de contraseña con contraseña temporal.
 * @param {string} to          - Email destino
 * @param {string} nombre      - Nombre completo del usuario
 * @param {string} tempPassword - Contraseña temporal generada
 * @param {string} html        - HTML del template de recuperación
 */
const sendRecoveryEmail = async (to, nombre, tempPassword, html) => {
  try {
    const response = await resend.emails.send({
      from:     FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject:  'Recuperación de Contraseña - ISTPET Turismo',
      text:     `Hola ${nombre}, tu contraseña temporal es: ${tempPassword}. Inicia sesión en: https://turismo-chatbot.vercel.app/login`,
      html,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log(`[Email] Recovery → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error recovery → ${to}:`, error.message);
    throw error;
  }
};

/**
 * Envía correo de reactivación de cuenta con código de 6 dígitos.
 * @param {string} to     - Email destino
 * @param {string} nombre - Nombre completo del usuario
 * @param {string} html   - HTML del template de reactivación
 */
const sendReactivationEmail = async (to, nombre, html) => {
  try {
    const response = await resend.emails.send({
      from:     FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject:  'Reactivación de Cuenta - ISTPET Turismo',
      html,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log(`[Email] Reactivation → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error reactivation → ${to}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRecoveryEmail,
  sendReactivationEmail,
};
