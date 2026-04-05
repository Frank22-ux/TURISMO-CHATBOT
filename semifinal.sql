-- =====================================================
-- LIMPIEZA PREVIA
-- =====================================================
DROP TABLE IF EXISTS valoraciones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS experiencia_guias CASCADE;
DROP TABLE IF EXISTS guias CASCADE;
DROP TABLE IF EXISTS disponibilidad_experiencia CASCADE;
DROP TABLE IF EXISTS imagenes_galeria CASCADE;
DROP TABLE IF EXISTS imagen_portada CASCADE;
DROP TABLE IF EXISTS actividades_turisticas CASCADE;
DROP TABLE IF EXISTS actividades_alimentarias CASCADE;
DROP TABLE IF EXISTS categorias_turisticas CASCADE;
DROP TABLE IF EXISTS categorias_alimentarias CASCADE;
DROP TABLE IF EXISTS clasificaciones_turisticas CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS perfil_anfitrion CASCADE;
DROP TABLE IF EXISTS perfil_turista CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =====================================================
-- USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL
        CHECK (rol IN ('TURISTA', 'ANFITRION', 'ADMIN')),
    fecha_nacimiento DATE,
    requiere_cambio_clave BOOLEAN DEFAULT false,
    estado VARCHAR(20) DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    verificado BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERFIL DEL ANFITRIÓN
-- =====================================================
CREATE TABLE perfil_anfitrion (
    id_anfitrion INT PRIMARY KEY,
    telefono VARCHAR(20),
    correo_contacto VARCHAR(150),
    biografia TEXT,
    idiomas VARCHAR(255),
    experiencia_anios INT CHECK (experiencia_anios >= 0),
    url_foto_perfil TEXT,
    url_foto_portada TEXT,
    url_documento_legal_frontal TEXT,
    url_documento_legal_posterior TEXT,
    
    banco_nombre VARCHAR(100),
    tipo_cuenta VARCHAR(50),
    numero_cuenta VARCHAR(50),
    identificacion VARCHAR(20),
    banco_swift VARCHAR(20),
    banco_direccion TEXT,
    banco_pais VARCHAR(80),
    descuento_paquete NUMERIC(5,2) DEFAULT 0,

    FOREIGN KEY (id_anfitrion)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- =====================================================
-- PERFIL DEL TURISTA
-- =====================================================
CREATE TABLE perfil_turista (
    id_turista INT PRIMARY KEY,
    telefono VARCHAR(20),
    correo_contacto VARCHAR(150),
    biografia TEXT,
    idiomas VARCHAR(255),
    experiencia_anios INT CHECK (experiencia_anios >= 0),
    url_foto_perfil TEXT,
    url_foto_portada TEXT,
    url_documento_legal_frontal TEXT,
    url_documento_legal_posterior TEXT,
    
    banco_nombre VARCHAR(100),
    tipo_cuenta VARCHAR(50),
    numero_cuenta VARCHAR(50),
    identificacion VARCHAR(20),
    banco_swift VARCHAR(20),
    banco_direccion TEXT,
    banco_pais VARCHAR(80),

    FOREIGN KEY (id_turista)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- =====================================================
-- UBICACIONES (DIRECCIÓN + COORDENADAS)
-- =====================================================
CREATE TABLE ubicaciones (
    id_ubicacion SERIAL PRIMARY KEY,
    pais VARCHAR(80) NOT NULL,
    provincia VARCHAR(80),
    ciudad VARCHAR(80) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(9,6) NOT NULL,
    longitud DECIMAL(9,6) NOT NULL
);

-- =====================================================
-- CATEGORÍAS TURÍSTICAS (10)
-- =====================================================
CREATE TABLE categorias_turisticas (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

INSERT INTO categorias_turisticas (nombre, descripcion) VALUES
('Aventura','Actividad con riesgo controlado'),
('Cultural','Historia y tradiciones'),
('Naturaleza','Contacto natural'),
('Relajación','Bienestar y descanso'),
('Familiar','Apta para familias'),
('Deportiva','Actividad física'),
('Nocturna','Experiencias nocturnas'),
('Educativa','Aprendizaje guiado'),
('Fotográfica','Enfoque visual'),
('Exploración','Descubrimiento de lugares');

-- =====================================================
-- CLASIFICACIÓN TURÍSTICA
-- =====================================================
CREATE TABLE clasificaciones_turisticas (
    id_clasificacion SERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO clasificaciones_turisticas (nombre) VALUES
('FRIENDLY'),
('RELAX'),
('MODERADA'),
('AVENTURA'),
('PELIGROSA'),
('EXTREMA'),
('INFANTIL'),
('PAREJAS'),
('GRUPOS'),
('EXCLUSIVA');

-- =====================================================
-- CATEGORÍAS ALIMENTARIAS (10)
-- =====================================================
CREATE TABLE categorias_alimentarias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

INSERT INTO categorias_alimentarias (nombre, descripcion) VALUES
('Restaurante típico/local','Comida tradicional de la zona'),
('Marisquería','Especialidades de mar'),
('Parrillada / Asados','Carnes a la brasa'),
('Cafetería','Café, snacks y desayunos'),
('Comida rápida','Servicio ágil y variado'),
('Cocina internacional','Gastronomía del mundo'),
('Panadería / Pastelería','Panes y dulces artesanales'),
('Buffet','Variedad de platos libres'),
('Comida saludable / Vegana','Opciones nutritivas y vegetales'),
('Food Truck / Comida callejera','Experiencia urbana y rápida');

-- =====================================================
-- ACTIVIDADES TURÍSTICAS
-- =====================================================
CREATE TABLE actividades_turisticas (
    id_actividad SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    precio_oferta NUMERIC(10,2) CHECK (precio_oferta > 0 AND precio_oferta < precio),
    fecha_fin_oferta TIMESTAMP,
    duracion_horas INT CHECK (duracion_horas > 0),
    capacidad INT CHECK (capacidad > 0),

    nivel_dificultad VARCHAR(20)
        CHECK (nivel_dificultad IN ('BAJO','MEDIO','ALTO')),

    hora_inicio TIME DEFAULT '08:00:00',
    hora_fin TIME DEFAULT '18:00:00',
    dias_disponibles VARCHAR(100) DEFAULT '0,1,2,3,4,5,6',

    incluye_recorrido BOOLEAN DEFAULT TRUE,
    incluye_transporte BOOLEAN DEFAULT FALSE,
    requiere_equipo BOOLEAN DEFAULT FALSE,

    porcentaje_ganancia INT NOT NULL CHECK (porcentaje_ganancia >= 1),
    tipo_reserva VARCHAR(20)
        CHECK (tipo_reserva IN ('INSTANTANEA','MANUAL')),

    estado VARCHAR(20) DEFAULT 'ACTIVA',
    vistas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_anfitrion INT NOT NULL,
    id_categoria INT NOT NULL,
    id_clasificacion INT NOT NULL,
    id_ubicacion INT NOT NULL,

    FOREIGN KEY (id_anfitrion) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias_turisticas(id_categoria),
    FOREIGN KEY (id_clasificacion) REFERENCES clasificaciones_turisticas(id_clasificacion),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion)
);

-- =====================================================
-- ACTIVIDADES ALIMENTARIAS
-- =====================================================
CREATE TABLE actividades_alimentarias (
    id_actividad SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    precio_oferta NUMERIC(10,2) CHECK (precio_oferta > 0 AND precio_oferta < precio),
    fecha_fin_oferta TIMESTAMP,
    duracion_horas INT CHECK (duracion_horas > 0),
    capacidad INT CHECK (capacidad > 0),

    hora_inicio TIME DEFAULT '08:00:00',
    hora_fin TIME DEFAULT '18:00:00',
    dias_disponibles VARCHAR(100) DEFAULT '0,1,2,3,4,5,6',

    menu_vegano BOOLEAN DEFAULT FALSE,
    menu_vegetariano BOOLEAN DEFAULT FALSE,
    menu_sin_gluten BOOLEAN DEFAULT FALSE,
    permite_mascotas BOOLEAN DEFAULT FALSE,
    wifi BOOLEAN DEFAULT FALSE,

    -- Nuevos campos solicitados
    servicio_local BOOLEAN DEFAULT TRUE,
    servicio_para_llevar BOOLEAN DEFAULT FALSE,
    servicio_delivery BOOLEAN DEFAULT FALSE,
    nivel_picante INT DEFAULT 0,
    accesibilidad_silla_ruedas BOOLEAN DEFAULT FALSE,
    accesibilidad_adultos_mayores BOOLEAN DEFAULT FALSE,
    estacionamiento BOOLEAN DEFAULT FALSE,
    metodos_pago TEXT, -- 'efectivo,tarjeta,qr,transferencia'
    descuentos_promociones TEXT,
    musica_en_vivo BOOLEAN DEFAULT FALSE,
    zona_infantil BOOLEAN DEFAULT FALSE,
    eventos_privados BOOLEAN DEFAULT FALSE,

    porcentaje_ganancia INT NOT NULL CHECK (porcentaje_ganancia >= 1),
    tipo_reserva VARCHAR(20)
        CHECK (tipo_reserva IN ('INSTANTANEA','MANUAL')),

    estado VARCHAR(20) DEFAULT 'ACTIVA',
    vistas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_anfitrion INT NOT NULL,
    id_categoria INT NOT NULL,
    id_ubicacion INT NOT NULL,

    FOREIGN KEY (id_anfitrion) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias_alimentarias(id_categoria),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion)
);

-- =====================================================
-- DISPONIBILIDAD (RANGOS + DÍAS)
-- =====================================================
CREATE TABLE disponibilidad_experiencia (
    id_disponibilidad SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,

    lunes BOOLEAN DEFAULT FALSE,
    martes BOOLEAN DEFAULT FALSE,
    miercoles BOOLEAN DEFAULT FALSE,
    jueves BOOLEAN DEFAULT FALSE,
    viernes BOOLEAN DEFAULT FALSE,
    sabado BOOLEAN DEFAULT FALSE,
    domingo BOOLEAN DEFAULT FALSE,

    cupos_por_dia INT NOT NULL CHECK (cupos_por_dia > 0),
    CHECK (fecha_fin >= fecha_inicio)
);

-- =====================================================
-- GUÍAS
-- =====================================================
CREATE TABLE guias (
    id_guia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    idiomas VARCHAR(100),
    id_anfitrion INT NOT NULL,

    FOREIGN KEY (id_anfitrion)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE experiencia_guias (
    id SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,
    id_guia INT,
    anfitrion_es_guia BOOLEAN DEFAULT FALSE,

    CHECK (
        (anfitrion_es_guia = TRUE AND id_guia IS NULL)
        OR
        (anfitrion_es_guia = FALSE AND id_guia IS NOT NULL)
    ),

    FOREIGN KEY (id_guia) REFERENCES guias(id_guia)
);

-- =====================================================
-- IMÁGENES
-- =====================================================
CREATE TABLE imagen_portada (
    id_portada SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,
    url_imagen TEXT NOT NULL
);

CREATE TABLE imagenes_galeria (
    id_imagen SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,
    url_imagen TEXT NOT NULL,
    descripcion VARCHAR(150)
);

-- =====================================================
-- RESERVAS
-- =====================================================
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,
    id_turista INT NOT NULL,
    fecha_experiencia DATE NOT NULL,
    cantidad_personas INT NOT NULL CHECK (cantidad_personas > 0),
    cantidad_adultos INT DEFAULT 1,
    cantidad_ninos INT DEFAULT 0,
    cantidad_tercera_edad INT DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    descuento_aplicado NUMERIC(5,2) DEFAULT 0,

    estado VARCHAR(20)
        CHECK (estado IN ('PENDIENTE','APROBADA','CANCELADA'))
        DEFAULT 'PENDIENTE',

    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,

    codigo_qr_turista VARCHAR(10) UNIQUE,
    codigo_verificacion_anfitrion VARCHAR(10) UNIQUE,
    estado_qr VARCHAR(20) DEFAULT 'GENERADO',

    FOREIGN KEY (id_turista)
        REFERENCES usuarios(id_usuario)
);

-- =====================================================
-- PAGOS
-- =====================================================
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL,
    monto_total NUMERIC(10,2) NOT NULL,
    monto_anfitrion NUMERIC(10,2) NOT NULL,
    monto_plataforma NUMERIC(10,2) NOT NULL,
    monto_reembolsado NUMERIC(10,2) DEFAULT 0,

    estado VARCHAR(20)
        CHECK (estado IN ('PENDIENTE','CONFIRMADO','DEVUELTO'))
        DEFAULT 'PENDIENTE',

    fecha_pago TIMESTAMP,
    fecha_devolucion TIMESTAMP,

    FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON DELETE CASCADE
);

-- =====================================================
-- VALORACIONES
-- =====================================================
CREATE TABLE valoraciones (
    id_valoracion SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(20)
        CHECK (tipo_actividad IN ('TURISTICA','ALIMENTARIA')),
    id_actividad INT NOT NULL,
    id_turista INT NOT NULL,
    puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    visible BOOLEAN DEFAULT TRUE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (id_actividad, id_turista),

    FOREIGN KEY (id_turista)
        REFERENCES usuarios(id_usuario)
);

-- =====================================================
-- MENSAJERÍA
-- =====================================================
CREATE TABLE mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_emisor INT NOT NULL,
    id_receptor INT NOT NULL,
    contenido TEXT,
    es_archivo BOOLEAN DEFAULT FALSE,
    nombre_archivo VARCHAR(255),
    tamano_archivo VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'ENVIADO'
        CHECK (estado IN ('ENVIADO', 'RECIBIDO', 'LEIDO')),
    editado BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Nuevas columnas para soporte de gestión de mensajes
    eliminado_emisor BOOLEAN DEFAULT FALSE,
    eliminado_receptor BOOLEAN DEFAULT FALSE,
    archivado_emisor BOOLEAN DEFAULT FALSE,
    archivado_receptor BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id_emisor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receptor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =====================================================
-- RESEÑAS / CALIFICACIONES MUTUAS (24H)
-- =====================================================
CREATE TABLE resenas (
    id_resena SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL,
    autor_id INTEGER NOT NULL,
    receptor_id INTEGER NOT NULL,
    rol_autor VARCHAR(20) NOT NULL CHECK (rol_autor = 'TURISTA'),

    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    visible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_reserva, autor_id),

    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
