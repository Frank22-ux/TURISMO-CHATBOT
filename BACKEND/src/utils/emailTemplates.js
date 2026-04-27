const FRONTEND_URL = process.env.FRONTEND_URL || 'https://turismo-chatbot-frank22-uxs-projects.vercel.app';

const styles = `
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #f1f5f9;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
    border: 1px solid #e2e8f0;
  }
  .header {
    background: #1e293b;
    padding: 50px 20px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -1px;
  }
  .content {
    padding: 40px;
    color: #475569;
    line-height: 1.7;
  }
  .content h2 {
    color: #0f172a;
    font-size: 24px;
    font-weight: 900;
    margin-top: 0;
    letter-spacing: -0.5px;
  }
  .highlight-box {
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    margin: 30px 0;
  }
  .password {
    font-size: 28px;
    font-weight: 900;
    color: #1e293b;
    letter-spacing: 3px;
  }
  .btn {
    display: inline-block;
    background: #1e293b;
    color: #ffffff !important;
    text-decoration: none;
    padding: 18px 35px;
    border-radius: 16px;
    font-weight: 900;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 25px;
    box-shadow: 0 10px 20px rgba(30, 41, 59, 0.2);
  }
  .footer {
    text-align: center;
    padding: 30px;
    color: #94a3b8;
    font-size: 11px;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: bold;
  }
`;

const getWelcomeTemplate = (nombre, tempPassword) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ISTPET Turismo</h1>
        </div>
        <div class="content">
            <h2>¡Bienvenido a la aventura, ${nombre}! 🌋</h2>
            <p>Estamos muy felices de que te unas a la mayor comunidad turística del Ecuador.</p>
            <p>Para garantizar la seguridad de tu cuenta y verificar tu correo, hemos generado una contraseña temporal para tu primer acceso:</p>
            
            <div class="highlight-box">
                <span class="password">${tempPassword}</span>
            </div>
            
            <p><strong>Importante:</strong> Al iniciar sesión por primera vez, el sistema te pedirá que crees tu propia contraseña definitiva.</p>
            
            <center>
                <a href="${FRONTEND_URL}/login" class="btn">Iniciar Sesión Ahora</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
`;

const getForgotPasswordTemplate = (nombre, tempPassword) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ISTPET Turismo</h1>
        </div>
        <div class="content">
            <h2>Recuperación de Acceso 🔒</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Aquí tienes una clave temporal para ingresar a tu cuenta:</p>
            
            <div class="highlight-box">
                <span class="password">${tempPassword}</span>
            </div>
            
            <p>Una vez ingreses al Panel, será <strong>obligatorio</strong> cambiar esta contraseña temporal por una nueva.</p>
            <p>Si no solicitaste este cambio, por favor ignora este correo y asegúrate de proteger tu cuenta.</p>
            
            <center>
                <a href="${FRONTEND_URL}/login" class="btn">Ingresar al Panel</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo. Seguridad Informática.
        </div>
    </div>
</body>
</html>
`;

const getPaymentSuccessTemplate = (nombre, activityName, amount) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Reserva Confirmada! 🎉</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Tu pago ha sido procesado exitosamente. Ya tienes tu cupo asegurado para tu próxima aventura.</p>
            
            <div class="highlight-box">
                <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Experiencia / Actividad</p>
                <p style="font-size: 20px; font-weight: 900; color: #1e293b; margin: 10px 0;">${activityName}</p>
                <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Monto Pagado</p>
                <p class="password" style="margin: 5px 0 0 0;">$${amount}</p>
            </div>
            
            <p>Puedes ver los detalles de tu reserva, fechas y descargar tu ticket digital (QR) directamente desde tu panel de control.</p>
            
            <center>
                <a href="${FRONTEND_URL}/dashboard-tourist?section=bookings" class="btn">Ver Mis Reservas</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
`;

const getPaymentRejectedTemplate = (nombre, activityName, reason) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header" style="background: #ef4444;">
            <h1>Pago Rechazado ❌</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Lamentablemente no pudimos procesar el cobro para tu reserva de <strong>${activityName}</strong>.</p>
            
            <div class="highlight-box" style="border-color: #fca5a5; background: #fef2f2;">
                <p style="margin: 0; color: #991b1b; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Motivo del rechazo:</p>
                <p style="color: #7f1d1d; font-weight: 900; font-size: 16px; margin: 10px 0;">${reason || 'Fondos insuficientes o transacción negada por tu banco.'}</p>
            </div>
            
            <p>No te preocupes, tu reserva sigue pendiente temporalmente. Por favor, intenta usar otro método de pago o comunícate con tu institución bancaria.</p>
            
            <center>
                <a href="${FRONTEND_URL}/dashboard-tourist" class="btn" style="background: #ef4444;">Intentar de Nuevo</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo.
        </div>
    </div>
</body>
</html>
`;

const getFundsCreditedTemplate = (nombre, amount) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header" style="background: #10b981;">
            <h1>¡Fondos Acreditados! 💸</h1>
        </div>
        <div class="content">
            <h2>Buen trabajo, ${nombre}</h2>
            <p>Te informamos que hemos acreditado tus ingresos correspondientes al último periodo de actividad directamente en tu cuenta bancaria registrada.</p>
            
            <div class="highlight-box" style="border-color: #34d399; background: #ecfdf5;">
                <p style="margin: 0; color: #065f46; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Monto Depositado</p>
                <p style="font-size: 36px; font-weight: 900; color: #10b981; margin: 10px 0;">$${amount}</p>
            </div>
            
            <p>Gracias por ser parte vital de la comunidad y ofrecer experiencias increíbles a los turistas. Puedes revisar el desglose de estos ingresos en tu panel de Anfitrión.</p>
            
            <center>
                <a href="${FRONTEND_URL}/dashboard-host?section=payments" class="btn" style="background: #10b981;">Ver Detalles Financieros</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo.
        </div>
    </div>
</body>
</html>
`;

const getSuspensionReactivationTemplate = (nombre, activationCode) => `
<!DOCTYPE html>
<html>
<head>
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header" style="background: #f59e0b;">
            <h1>Reactivación de Cuenta ⚠️</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Hemos notado que no has ingresado a tu cuenta de ISTPET Turismo por más de 30 días. Por motivos de seguridad y políticas de la plataforma, tu cuenta ha sido <strong>suspendida temporalmente</strong>.</p>
            
            <p>Para restaurar el acceso de forma inmediata y volver a la app, por favor usa el siguiente código de reactivación en la pantalla de inicio de sesión:</p>
            
            <div class="highlight-box" style="border-color: #f59e0b; background: #fffbeb;">
                <span class="password" style="color: #d97706; font-size: 36px;">${activationCode}</span>
            </div>
            
            <p>Una vez ingreses el código, tu cuenta quedará Activa automáticamente.</p>
            
            <center>
                <a href="${FRONTEND_URL}/login" class="btn" style="background: #f59e0b;">Ir a Reactivar Cuenta</a>
            </center>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ISTPET Turismo. Seguridad Informática.
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    getWelcomeTemplate,
    getForgotPasswordTemplate,
    getPaymentSuccessTemplate,
    getPaymentRejectedTemplate,
    getFundsCreditedTemplate,
    getSuspensionReactivationTemplate
};
