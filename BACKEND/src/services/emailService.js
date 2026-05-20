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

/**
 * Envía correo genérico de notificación por pago congelado (reclamo).
 * @param {string} to - Email destino
 * @param {string} name - Nombre del usuario (Turista o Anfitrión)
 * @param {string} role - Rol ("Turista" o "Anfitrión") para contexto opcional
 * @param {string} activityTitle - Título de la actividad
 */
const sendPaymentFrozenNotification = async (to, name, role, activityTitle) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ef4444; margin: 0;">Aviso Importante: Pago Suspendido</h2>
        </div>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Le informamos que debido a una queja registrada, el pago relacionado a la actividad <strong>"${activityTitle}"</strong> ha sido <strong>suspendido temporalmente</strong> hasta revisión.</p>
        <p>En los próximos días, el equipo de administración se pondrá en contacto por esta vía para solicitarle que presente sus respectivas pruebas u observaciones sobre el caso.</p>
        <p style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; font-weight: bold;">
          Nota: En caso de no presentar las pruebas solicitadas en el plazo que se indique posteriormente, se dará la razón a la parte contraria y el pago se resolverá a su favor de forma definitiva.
        </p>
        <p>Agradecemos su cooperación para resolver este inconveniente lo antes posible.</p>
        <br/>
        <p>Atentamente,<br/><strong>El equipo de Resolución de ISTPET Turismo</strong></p>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject: `Notificación de Disputa: Pago Congelado - ${activityTitle}`,
      html,
    });

    if (response.error) throw new Error(response.error.message);
    console.log(`[Email] Payment Frozen Notification → ${to} | ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[Email] Error sending payment frozen notification → ${to}:`, error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRecoveryEmail,
  sendReactivationEmail,
  sendHostReservationNotification,
  sendNewMessageNotification,
  sendPaymentFrozenNotification,
};
