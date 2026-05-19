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

/**
 * Envía correo al anfitrión notificándole sobre una nueva reserva.
 * @param {string} to - Email del anfitrión
 * @param {string} hostName - Nombre del anfitrión
 * @param {string} touristName - Nombre del turista
 * @param {Array<string>} activityTitles - Títulos de las actividades reservadas
 */
const sendHostReservationNotification = async (to, hostName, touristName, activityTitles) => {
  try {
    const activitiesList = activityTitles.map(title => `<li>${title}</li>`).join('');
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">¡Tienes una nueva reserva!</h2>
        <p>Hola <strong>${hostName}</strong>,</p>
        <p>El turista <strong>${touristName}</strong> acaba de realizar una reserva para tu(s) siguiente(s) actividad(es):</p>
        <ul>
          ${activitiesList}
        </ul>
        <p>Por favor, ponte en contacto con el turista a través de la plataforma para confirmar todos los detalles adicionales y proporcionarle más información para su experiencia.</p>
        <br/>
        <a href="https://turismo-chatbot.vercel.app/dashboard-host" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ir a mi Panel de Anfitrión</a>
        <br/><br/>
        <p>Saludos,<br/>El equipo de ISTPET Turismo</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject: '¡Nueva Reserva Confirmada! - ISTPET Turismo',
      html,
    });

    if (response.error) throw new Error(response.error.message);
    console.log(`[Email] Host Reservation Notification → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error sending reservation notification → ${to}:`, error.message);
  }
};

/**
 * Envía correo al usuario notificándole sobre un nuevo mensaje.
 * @param {string} to - Email destino
 * @param {string} receiverName - Nombre de quien recibe
 * @param {string} senderName - Nombre de quien envía el mensaje
 */
const sendNewMessageNotification = async (to, receiverName, senderName) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">¡Tienes un nuevo mensaje!</h2>
        <p>Hola <strong>${receiverName}</strong>,</p>
        <p><strong>${senderName}</strong> te ha enviado un nuevo mensaje a través de la plataforma de ISTPET Turismo.</p>
        <p>Inicia sesión en tu cuenta para leer el mensaje y responder a tiempo.</p>
        <br/>
        <a href="https://turismo-chatbot.vercel.app/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Mensaje</a>
        <br/><br/>
        <p>Saludos,<br/>El equipo de ISTPET Turismo</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject: `Nuevo mensaje de ${senderName} - ISTPET Turismo`,
      html,
    });

    if (response.error) throw new Error(response.error.message);
    console.log(`[Email] New Message Notification → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error sending message notification → ${to}:`, error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRecoveryEmail,
  sendReactivationEmail,
  sendHostReservationNotification,
  sendNewMessageNotification,
};
