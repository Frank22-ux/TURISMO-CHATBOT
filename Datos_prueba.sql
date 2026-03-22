-- =====================================================
-- DATOS DE PRUEBA PARA TURISMO ISTPET
-- =====================================================

-- 1. USUARIOS (Password: Password123!)
-- Hash: $2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S
INSERT INTO usuarios (nombre, email, contraseña, telefono, rol, fecha_nacimiento) VALUES
('Juan Anfitrión', 'host@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593991111111', 'ANFITRION', '1985-05-15'),
('Maria Turista', 'turist@test.com', '$2b$10$oq7cG0NNSiMkyKfe3NO8qOrEnCmNtEEdV9IYy9o1445L/aNZ8Yr9S', '+593992222222', 'TURISTA', '1995-10-20');

-- 2. PERFILES
INSERT INTO perfil_anfitrion (id_anfitrion, telefono, correo_contacto, biografia, idiomas, experiencia_anios) VALUES
(1, '+593991111111', 'contacto.host@test.com', 'Hola, soy Juan, experto en rutas de montaña y gastronomía local.', 'Español, Inglés', 10);

INSERT INTO perfil_turista (id_turista, telefono, correo_contacto, biografia, idiomas, experiencia_anios) VALUES
(2, '+593992222222', 'turist@test.com', 'Me encanta viajar y conocer nuevas culturas.', 'Español, Francés', 5);

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

-- 4. ACTIVIDADES TURÍSTICAS (10)
INSERT INTO actividades_turisticas (titulo, descripcion, precio, duracion_horas, capacidad, nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion, porcentaje_ganancia, tipo_reserva) VALUES
('Senderismo en el Cotopaxi', 'Explora las faldas del volcán activo más alto.', 45.00, 6, 12, 'MEDIO', 1, 1, 4, 1, 10, 'INSTANTANEA'),
('Tour Histórico Quito', 'Recorrido por las iglesias y museos coloniales.', 25.00, 4, 20, 'BAJO', 1, 2, 2, 1, 10, 'MANUAL'),
('Avistamiento de Ballenas', 'Observa ballenas jorobadas en la costa de Manta.', 60.00, 3, 15, 'BAJO', 1, 3, 9, 7, 10, 'INSTANTANEA'),
('Escalada en Baños', 'Aventura extrema en las paredes de roca de Baños.', 35.00, 5, 8, 'ALTO', 1, 1, 6, 4, 10, 'MANUAL'),
('Mercado de Otavalo', 'Compras de artesanías y cultura indígena.', 20.00, 5, 30, 'BAJO', 1, 2, 7, 6, 10, 'INSTANTANEA'),
('Snorkeling en Galápagos', 'Nada con lobos marinos y tortugas gigantes.', 120.00, 4, 10, 'MEDIO', 1, 3, 10, 5, 10, 'MANUAL'),
('Ruta del Cacao en Tena', 'Aprende el proceso del chocolate desde la semilla.', 30.00, 3, 15, 'BAJO', 1, 8, 8, 10, 10, 'INSTANTANEA'),
('Tour Fotográfico Cuenca', 'Captura la mejor arquitectura de la ciudad.', 15.00, 3, 10, 'BAJO', 1, 9, 2, 2, 10, 'INSTANTANEA'),
('Camping en Vilcabamba', 'Noche bajo las estrellas en el valle sagrado.', 40.00, 24, 6, 'MEDIO', 1, 1, 4, 8, 10, 'MANUAL'),
('Rafting en el Río Napo', 'Adrenalina en las aguas blancas de la Amazonía.', 55.00, 5, 8, 'ALTO', 1, 1, 6, 10, 10, 'INSTANTANEA');

-- 5. ACTIVIDADES ALIMENTARIAS (10)
INSERT INTO actividades_alimentarias (titulo, descripcion, precio, duracion_horas, capacidad, id_anfitrion, id_categoria, id_ubicacion, porcentaje_ganancia, tipo_reserva, metodos_pago) VALUES
('Cena Romántica en el Panecillo', 'Vistas increíbles de Quito con comida gourmet.', 80.00, 3, 2, 1, 6, 1, 10, 'MANUAL', 'tarjeta,transferencia'),
('Degustación de Mariscos', 'Lo mejor del mar directo a tu mesa en Manta.', 35.00, 2, 10, 1, 2, 7, 10, 'INSTANTANEA', 'efectivo,tarjeta'),
('Parrillada Argentina', 'Cortes seleccionados y vino en Cuenca.', 45.00, 2, 15, 1, 3, 2, 10, 'INSTANTANEA', 'efectivo,qr'),
('Desayuno Típico Manabita', 'Bolón, tigrillo y café de pasar.', 12.00, 1, 20, 1, 4, 7, 10, 'INSTANTANEA', 'efectivo'),
('Taller de Pizza Artesanal', 'Haz tu propia pizza en horno de leña.', 25.00, 3, 10, 1, 5, 3, 10, 'MANUAL', 'tarjeta'),
('Buffet de Comida Amazónica', 'Maito de pescado y chontacuros.', 30.00, 2, 25, 1, 8, 9, 10, 'INSTANTANEA', 'efectivo'),
('Cata de Café de Especialidad', 'Aprende sobre el café lojano en Vilcabamba.', 18.00, 2, 8, 1, 4, 8, 10, 'INSTANTANEA', 'tarjeta,qr'),
('Almuerzo Saludable Vegano', 'Ingredientes orgánicos y locales en Quito.', 22.00, 1, 12, 1, 9, 1, 10, 'INSTANTANEA', 'tarjeta'),
('Noche de Sushi y Sake', 'Fusión japonesa en pleno Guayaquil.', 50.00, 2, 20, 1, 6, 3, 10, 'INSTANTANEA', 'tarjeta,transferencia'),
('Street Food Guayaco', 'Encebollado y guatita en el Malecón.', 10.00, 1, 30, 1, 10, 3, 10, 'INSTANTANEA', 'efectivo');

-- 6. IMÁGENES DE PORTADA (Actividades Turísticas)
INSERT INTO imagen_portada (tipo_actividad, id_actividad, url_imagen) VALUES
('TURISTICA', 1, 'https://images.unsplash.com/photo-1589802829985-817e51181b92'),
('TURISTICA', 2, 'https://images.unsplash.com/photo-1599140876225-8ede7edb02c9'),
('TURISTICA', 3, 'https://images.unsplash.com/photo-1568430460490-48580163f779'),
('TURISTICA', 4, 'https://images.unsplash.com/photo-1522163182402-834f871fd851'),
('TURISTICA', 5, 'https://images.unsplash.com/photo-1590001158193-47da7aabc46a'),
('TURISTICA', 6, 'https://images.unsplash.com/photo-1551244072-5d12893278ab'),
('TURISTICA', 7, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad'),
('TURISTICA', 8, 'https://images.unsplash.com/photo-1564507592313-2d59ca85d038'),
('TURISTICA', 9, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'),
('TURISTICA', 10, 'https://images.unsplash.com/photo-1530866495547-0b735425fe21');

-- 7. IMÁGENES DE PORTADA (Actividades Alimentarias)
INSERT INTO imagen_portada (tipo_actividad, id_actividad, url_imagen) VALUES
('ALIMENTARIA', 1, 'https://images.unsplash.com/photo-1517248135467-4c7ed9d874b7'),
('ALIMENTARIA', 2, 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab'),
('ALIMENTARIA', 3, 'https://images.unsplash.com/photo-1432139509613-5c4255815697'),
('ALIMENTARIA', 4, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929'),
('ALIMENTARIA', 5, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
('ALIMENTARIA', 6, 'https://images.unsplash.com/photo-1547592166-23ac45744acd'),
('ALIMENTARIA', 7, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),
('ALIMENTARIA', 8, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
('ALIMENTARIA', 9, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c'),
('ALIMENTARIA', 10, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38');
