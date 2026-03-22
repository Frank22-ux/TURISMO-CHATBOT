-- Script para eliminar todos los datos agregados por "Datos_reales.sql"
-- Este script revierte las inserciones y reinicia los contadores de las secuencias.

BEGIN;

-- 1. Eliminar actividades (registros hijos)
-- Estas tablas tienen dependencias hacia 'perfil_anfitrion' y 'ubicaciones'.
DELETE FROM actividades_alimentarias WHERE id_actividad >= 1000 AND id_actividad <= 1974;
DELETE FROM actividades_turisticas WHERE id_actividad >= 1000 AND id_actividad <= 1974;

-- 2. Eliminar ubicaciones que fueron creadas para estas actividades
DELETE FROM ubicaciones WHERE id_ubicacion >= 1000;

-- 3. Eliminar perfiles de anfitrión
DELETE FROM perfil_anfitrion WHERE id_anfitrion >= 1000;

-- 4. Eliminar usuarios
DELETE FROM usuarios WHERE id_usuario >= 1000;

-- Reajustar las secuencias al valor máximo actual (o a 1 si la tabla queda vacía)
-- Esto asegura que las nuevas inserciones no fallen por conflicto de ID.
SELECT setval('usuarios_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM usuarios), 1));
SELECT setval('ubicaciones_id_ubicacion_seq', COALESCE((SELECT MAX(id_ubicacion) FROM ubicaciones), 1));
SELECT setval('actividades_turisticas_id_actividad_seq', COALESCE((SELECT MAX(id_actividad) FROM actividades_turisticas), 1));
SELECT setval('actividades_alimentarias_id_actividad_seq', COALESCE((SELECT MAX(id_actividad) FROM actividades_alimentarias), 1));

COMMIT;

-- Nota: Este script debe ejecutarse en el mismo entorno (ej. psql, pgAdmin) donde se ejecutó Datos_reales.sql.
