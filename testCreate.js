const activityService = require('./BACKEND/src/services/activityService');
const db = require('./BACKEND/src/config/database');

async function test() {
    const data = {
        "titulo": "Prueba act",
        "descripcion": "desc",
        "precio": "100",
        "duracion_horas": "2",
        "capacidad": "10",
        "nivel_dificultad": "MEDIO",
        "id_categoria": "1",
        "id_clasificacion": "1",
        "ciudad": "Quito",
        "provincia": "Pichincha",
        "pais": "Ecuador",
        "direccion": "Calle Falsa",
        "latitud": -0.18,
        "longitud": -78.46,
        "punto_encuentro": "",
        "latitud_encuentro": null,
        "longitud_encuentro": null,
        "incluye_recorrido": true,
        "incluye_transporte": false,
        "requiere_equipo": false,
        "porcentaje_ganancia": 10,
        "tipo_reserva": "INSTANTANEA",
        "precio_oferta": "",
        "fecha_fin_oferta": "",
        "hora_inicio": "08:00",
        "hora_fin": "18:00",
        "dias_disponibles": "0,1,2",
        "id_anfitrion": 4
    };
    try {
        const result = await activityService.createActivity(data);
        console.log("Success:", result);
    } catch (e) {
        console.error("DB ERROR DETAILS:");
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
