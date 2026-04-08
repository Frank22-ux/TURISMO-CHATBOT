const styles = `
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  }
  .header {
    background: #00BFA5;
    padding: 40px 20px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
  }
  .content {
    padding: 40px;
    color: #334155;
    line-height: 1.6;
  }
  .content h2 {
    color: #0f172a;
    font-size: 22px;
    margin-top: 0;
  }
  .highlight-box {
    background: #f0fdfa;
    border: 2px dashed #00BFA5;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    margin: 25px 0;
  }
  .password {
    font-size: 24px;
    font-weight: 900;
    color: #00BFA5;
    letter-spacing: 2px;
  }
  .btn {
    display: inline-block;
    background: #00BFA5;
    color: #ffffff;
    text-decoration: none;
    padding: 15px 30px;
    border-radius: 12px;
    font-weight: bold;
    margin-top: 20px;
  }
  .footer {
    text-align: center;
    padding: 20px;
    color: #94a3b8;
    font-size: 12px;
    border-top: 1px solid #f1f5f9;
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
                <a href="http://localhost:5173/login" class="btn">Iniciar Sesión Ahora</a>
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
        <div class="header" style="background: #1e293b;">
            <h1>ISTPET Turismo</h1>
        </div>
        <div class="content">
            <h2>Recuperación de Acceso 🔒</h2>
            <p>Hola ${nombre},</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Aquí tienes una clave temporal para ingresar a tu cuenta:</p>
            
            <div class="highlight-box" style="border-color: #1e293b; background: #f8fafc;">
                <span class="password" style="color: #1e293b;">${tempPassword}</span>
            </div>
            
            <p>Una vez ingreses al Panel, será <strong>obligatorio</strong> cambiar esta contraseña temporal por una nueva.</p>
            <p>Si no solicitaste este cambio, por favor ignora este correo y asegúrate de proteger tu cuenta.</p>
            
            <center>
                <a href="http://localhost:5173/login" class="btn" style="background: #1e293b;">Ingresar al Panel</a>
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
                <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Experiencia / Actividad</p>
                <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 10px 0;">${activityName}</p>
                <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Monto Pagado</p>
                <p class="password">$${amount}</p>
            </div>
            
            <p>Puedes ver los detalles de tu reserva, fechas y descargar tu ticket digital (QR) directamente desde tu panel de control.</p>
            
            <center>
                <a href="http://localhost:5173/dashboard-tourist?section=bookings" class="btn">Ver Mis Reservas</a>
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
                <p style="margin: 0; color: #991b1b; font-weight: bold;">Motivo del rechazo:</p>
                <p style="color: #7f1d1d;">${reason || 'Fondos insuficientes o transacción negada por tu banco.'}</p>
            </div>
            
            <p>No te preocupes, tu reserva sigue pendiente temporalmente. Por favor, intenta usar otro método de pago o comunícate con tu institución bancaria.</p>
            
            <center>
                <a href="http://localhost:5173/dashboard-tourist" class="btn" style="background: #ef4444;">Intentar de Nuevo</a>
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
                <p style="margin: 0; color: #065f46; font-weight: bold; font-size: 16px;">Monto Depositado</p>
                <p style="font-size: 32px; font-weight: 900; color: #10b981; margin: 10px 0;">$${amount}</p>
            </div>
            
            <p>Gracias por ser parte vital de la comunidad y ofrecer experiencias increíbles a los turistas. Puedes revisar el desglose de estos ingresos en tu panel de Anfitrión.</p>
            
            <center>
                <a href="http://localhost:5173/dashboard-host?section=payments" class="btn" style="background: #10b981;">Ver Detalles Financieros</a>
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
            <h1>Cuenta Suspendida por Inactividad ⚠️</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Hemos notado que no has ingresado a tu cuenta de ISTPET Turismo por más de 30 días. Por motivos de seguridad y políticas de la plataforma, tu cuenta ha sido <strong>suspendida temporalmente</strong>.</p>
            
            <p>Para restaurar el acceso de forma inmediata y volver a la app, por favor usa el siguiente código de reactivación en la pantalla de inicio de sesión:</p>
            
            <div class="highlight-box" style="border-color: #f59e0b; background: #fffbeb;">
                <span class="password" style="color: #d97706; font-size: 32px;">${activationCode}</span>
            </div>
            
            <p>Una vez ingreses el código, tu cuenta quedará Activa automáticamente.</p>
            
            <center>
                <a href="http://localhost:5173/login" class="btn" style="background: #f59e0b;">Ir a Reactivar Cuenta</a>
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
