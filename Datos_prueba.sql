-- =====================================================
-- DATOS DE PRUEBA PARA TURISMO ISTPET
-- =====================================================

-- 1. USUARIOS (Password: Password123!)
-- Hash: $2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S
INSERT INTO usuarios (nombre, email, contraseña, telefono, rol, fecha_nacimiento, fecha_registro, estado, ultima_conexion) VALUES
('Juan Anfitrión', 'host@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593991111111', 'ANFITRION', '1985-05-15', '2025-01-10 10:00:00', 'ACTIVO', CURRENT_TIMESTAMP),
('Maria Turista', 'turist@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593992222222', 'TURISTA', '1995-10-20', '2025-01-15 12:00:00', 'ACTIVO', CURRENT_TIMESTAMP - INTERVAL '40 days'),
('Administrador', 'admin@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593993333333', 'ADMIN', '1980-01-01', '2025-01-01 08:00:00', 'ACTIVO', CURRENT_TIMESTAMP),
('Carlos Guía', 'carlos@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593994444444', 'ANFITRION', '1990-03-25', '2025-02-05 09:30:00', 'ACTIVO', CURRENT_TIMESTAMP),
('Elena Viajera', 'elena@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593995555555', 'TURISTA', '1998-07-12', '2025-02-20 14:15:00', 'ACTIVO', CURRENT_TIMESTAMP - INTERVAL '35 days');

-- 2. PERFILES
INSERT INTO perfil_anfitrion (id_anfitrion, telefono, correo_contacto, biografia, idiomas, experiencia_anios, banco_nombre, tipo_cuenta, numero_cuenta, identificacion, descuento_paquete) VALUES
(1, '+593991111111', 'contacto.host@test.com', 'Hola, soy Juan, experto en rutas de montaña y gastronomía local.', 'Español, Inglés', 10, 'Banco Pichincha', 'AHORRO', '2201234567', '1712345678', 10.00),
(4, '+593994444444', 'carlos@test.com', 'Guía certificado con pasión por la Amazonía.', 'Español, Kichwa', 8, 'Banco Guayaquil', 'AHORRO', '3301234568', '1712345679', 5.00);

INSERT INTO perfil_turista (id_turista, telefono, correo_contacto, biografia, idiomas, experiencia_anios, banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais) VALUES
(2, '+593992222222', 'turist@test.com', 'Me encanta viajar y conocer nuevas culturas.', 'Español, Francés', 5, 'Chase Bank', 'CHECKING', '123456789012', 'ID-998877', 'CHASEUS33', '123 Park Ave, New York, NY', 'Estados Unidos'),
(5, '+593995555555', 'elena@test.com', 'Exploradora de tiempo completo.', 'Español, Alemán', 3, 'Sparkasse', 'CHECKING', '9876543210', 'ID-112233', 'SPARDE22', 'Berlin, Germany', 'Alemania');


-- 3. UBICACIONES
INSERT INTO ubicaciones (pais, provincia, ciudad, direccion, latitud, longitud) VALUES
('Ecuador', 'Pichincha', 'Quito', 'Centro Histórico', -0.220164, -78.512327),
('Ecuador', 'Azuay', 'Cuenca', 'Parque Calderón', -2.897414, -79.004481),
('Ecuador', 'Guayas', 'Guayaquil', 'Malecón 2000', -2.196160, -79.886208),
('Ecuador', 'Tungurahua', 'Baños', 'Cascada Pailón del Diablo', -1.396389, -78.424722),
('Ecuador', 'Galápagos', 'Puerto Ayora', 'Estación Darwin', -0.743167, -90.312917),
('Ecuador', 'Imbabura', 'Otavalo', 'Plaza de Ponchos', 0.233333, -78.266667),
('Ecuador', 'Manabí', 'Manta', 'Playa El Murciélago', -0.948281, -80.730335),
('Ecuador', 'Loja', 'Vilcabamba', 'Valle de la Longevidad', -4.262500, -79.222222),
('Ecuador', 'Pastaza', 'Puyo', 'Paseo Turístico del Río Puyo', -1.483333, -78.000000),
('Ecuador', 'Napo', 'Tena', 'Puerto Misahuallí', -1.033333, -77.666667);

-- 4. ACTIVIDADES TURÍSTICAS (Diferentes estados y anfitriones)
INSERT INTO actividades_turisticas (titulo, descripcion, precio, precio_oferta, fecha_fin_oferta, duracion_horas, capacidad, nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion, porcentaje_ganancia, tipo_reserva, hora_inicio, hora_fin, dias_disponibles, estado, fecha_creacion) VALUES
('Senderismo en el Cotopaxi', 'Explora las faldas del volcán activo más alto.', 45.00, 35.00, '2026-12-31 23:59:59', 6, 12, 'MEDIO', 1, 1, 4, 1, 10, 'INSTANTANEA', '08:00:00', '18:00:00', '0,1,2,3,4,5,6', 'ACTIVA', '2025-01-20'),
('Tour Histórico Quito', 'Recorrido por las iglesias y museos coloniales.', 25.00, 19.99, '2026-05-30 00:00:00', 4, 20, 'BAJO', 1, 2, 2, 1, 10, 'MANUAL', '09:00:00', '13:00:00', '1,2,3,4,5', 'ACTIVA', '2025-02-01'),
('Avistamiento de Ballenas', 'Observa ballenas jorobadas en la costa de Manta.', 60.00, 49.90, '2026-08-15 12:00:00', 3, 15, 'BAJO', 4, 3, 9, 7, 10, 'INSTANTANEA', '07:00:00', '11:00:00', '0,5,6', 'ACTIVA', '2025-02-15'),
('Escalada en Baños', 'Aventura extrema en las paredes de roca de Baños.', 35.00, NULL, NULL, 5, 8, 'ALTO', 1, 1, 6, 4, 10, 'MANUAL', '08:00:00', '14:00:00', '0,1,2,3,4,5,6', 'PAUSADA', '2025-03-05'),
('Rafting en el Río Napo', 'Adrenalina en las aguas blancas de la Amazonía.', 55.00, NULL, NULL, 5, 8, 'ALTO', 4, 1, 6, 10, 10, 'INSTANTANEA', '09:00:00', '15:00:00', '0,1,2,3,4,5,6', 'ACTIVA', '2025-03-10');

-- 5. ACTIVIDADES ALIMENTARIAS
INSERT INTO actividades_alimentarias (titulo, descripcion, precio, precio_oferta, fecha_fin_oferta, duracion_horas, capacidad, id_anfitrion, id_categoria, id_ubicacion, porcentaje_ganancia, tipo_reserva, metodos_pago, hora_inicio, hora_fin, dias_disponibles, estado, fecha_creacion) VALUES
('Cena Romántica en el Panecillo', 'Vistas increíbles de Quito con comida gourmet.', 80.00, 69.99, '2026-12-14 23:59:59', 3, 2, 1, 6, 1, 10, 'MANUAL', 'tarjeta,transferencia', '19:00:00', '22:00:00', '1,2,3,4,5,6', 'ACTIVA', '2025-01-25'),
('Desayuno Típico Manabita', 'Bolón, tigrillo y café de pasar.', 12.00, 9.99, '2026-04-10 10:00:00', 1, 20, 1, 4, 7, 10, 'INSTANTANEA', 'efectivo', '07:30:00', '11:00:00', '0,1,2,3,4,5,6', 'ACTIVA', '2025-02-10'),
('Buffet de Comida Amazónica', 'Maito de pescado y chontacuros.', 30.00, NULL, NULL, 2, 25, 4, 8, 9, 15, 'INSTANTANEA', 'efectivo', '12:00:00', '15:00:00', '0,6', 'ACTIVA', '2025-03-15');

-- 8. RESERVAS (Múltiples meses y estados)
INSERT INTO reservas (tipo_actividad, id_actividad, id_turista, fecha_experiencia, cantidad_personas, cantidad_adultos, cantidad_ninos, cantidad_tercera_edad, total, descuento_aplicado, estado, fecha_solicitud) VALUES
('TURISTICA', 1, 2, '2025-02-15', 3, 2, 1, 0, 112.50, 0, 'APROBADA', '2025-02-10 10:00:00'),
('ALIMENTARIA', 1, 2, '2025-02-20', 2, 2, 0, 0, 160.00, 0, 'APROBADA', '2025-02-15 15:30:00'),
('TURISTICA', 3, 5, '2025-03-05', 4, 4, 0, 0, 240.00, 0, 'APROBADA', '2025-02-28 09:00:00'),
('TURISTICA', 2, 2, '2025-03-15', 2, 2, 0, 0, 50.00, 0, 'APROBADA', '2025-03-10 14:00:00'),
('ALIMENTARIA', 3, 5, '2025-04-10', 5, 3, 2, 0, 150.00, 0, 'PENDIENTE', '2025-04-01 11:20:00'),
('TURISTICA', 5, 2, '2025-04-15', 2, 2, 0, 0, 110.00, 0, 'APROBADA', '2025-04-05 16:45:00');

-- 9. PAGOS (Calculados para el admin)
INSERT INTO pagos (id_reserva, monto_total, monto_anfitrion, monto_plataforma, estado, fecha_pago) VALUES
(1, 112.50, 101.25, 11.25, 'CONFIRMADO', '2025-02-10 11:00:00'),
(2, 160.00, 144.00, 16.00, 'CONFIRMADO', '2025-02-15 16:00:00'),
(3, 240.00, 216.00, 24.00, 'CONFIRMADO', '2025-02-28 10:00:00'),
(4, 50.00, 45.00, 5.00, 'CONFIRMADO', '2025-03-11 12:00:00'),
(6, 110.00, 99.00, 11.00, 'CONFIRMADO', '2025-04-06 10:30:00');

-- 10. MENSAJES
INSERT INTO mensajes (id_emisor, id_receptor, contenido, estado) VALUES
(2, 1, '¡Hola Juan! ¿El tour incluye almuerzo?', 'LEIDO'),
(1, 2, '¡Hola Maria! Sí, incluye un snack tradicional.', 'ENVIADO');

-- 11. VALORACIONES (Opiniones de turistas sobre actividades)
INSERT INTO valoraciones (id_turista, id_actividad, tipo_actividad, puntuacion, comentario, fecha, visible) VALUES
(2, 1, 'TURISTICA', 5, '¡Una experiencia increíble en el Cotopaxi! Altamente recomendado.', '2025-02-16 10:00:00', TRUE),
(5, 3, 'TURISTICA', 4, 'Muy buen avistamiento, aunque el clima no ayudó mucho.', '2025-03-06 14:00:00', TRUE),
(2, 2, 'ALIMENTARIA', 5, 'El Tigrillo estuvo espectacular, sabor auténtico.', '2025-02-21 09:00:00', TRUE);

-- 12. RESEÑAS (Opiniones de turistas sobre anfitriones)
INSERT INTO resenas (id_reserva, autor_id, receptor_id, rol_autor, puntuacion, comentario, fecha_creacion, visible) VALUES
(1, 2, 1, 'TURISTA', 5, 'Juan es un guía excepcional, conoce muchísimo la zona.', '2025-02-17 19:00:00', TRUE);


