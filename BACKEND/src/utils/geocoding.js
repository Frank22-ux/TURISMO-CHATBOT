const axios = require('axios');

// En Render no es necesario dotenv, pero lo mantenemos para local
try {
    require('dotenv').config();
} catch (e) {}

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
console.log("[Geocoding] MAPBOX_ACCESS_TOKEN:", MAPBOX_ACCESS_TOKEN ? "DEFINIDO" : "NO DEFINIDO");

/**
 * Normaliza una ubicación usando el Reverse Geocoding de Mapbox
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<object>} - Datos normalizados { ciudad, provincia, pais }
 */
const reverseGeocode = async (lat, lng) => {
    if (!lat || !lng || lat === 0 || lng === 0) return null;
    
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
        console.warn("[Geocoding] MAPBOX_ACCESS_TOKEN no definido, saltando normalización");
        return null;
    }

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=es&types=place,region,country`;
        const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5s para no bloquear
        
        if (!response.data || !response.data.features || response.data.features.length === 0) {
            return null;
        }

        const features = response.data.features;
        const result = {
            ciudad: '',
            provincia: '',
            pais: ''
        };

        features.forEach(feature => {
            if (feature.place_type.includes('place')) result.ciudad = feature.text;
            if (feature.place_type.includes('region')) result.provincia = feature.text;
            if (feature.place_type.includes('country')) result.pais = feature.text;
        });

        // Fallback: si no hay 'place', buscar en 'context'
        if (!result.ciudad) {
            const placeFeature = features.find(f => f.place_type.includes('place'));
            if (placeFeature) result.ciudad = placeFeature.text;
        }

        return result;
    } catch (error) {
        console.error('[Geocoding] Error:', error.message);
        return null;
    }
};

/**
 * Determina si una cadena de texto parece ser una dirección o nombre de calle
 * en lugar de una ciudad o provincia.
 */
const isStreetAddress = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    
    // Palabras clave que indican una calle o dirección
    const commonStreetKeywords = [
        'avenida', 'ave.', 'calle', 'cll', 'pasaje', 'psj', 'garcia moreno', 
        'shyris', 'eloy alfaro', 'sanchez', 'antonio', 'moreno', 'chile',
        'espejo', 'venezuela', 'guayaquil', 'bolivar', 'sucre', 'mejia',
        'olmedo', 'jose', 'mariano', 'aguilera', 'belo horizonte',
        'mallorca', 'manuel samaniego', 'melchor de aymerich', 'montufar',
        'pazmiño', 'feliza', 'rumipamba', 'pita', 'la carolina', 'la ronda'
    ];

    // Indicadores de barrios o zonas específicas
    const neighborhoodIndicators = ['sector', 'barrio', 'urbanización', 'urb.', 'etapa'];

    // Si contiene números (ej: "Calle 123")
    const hasNumbers = /\d/.test(text);
    
    // Si contiene separadores típicos de direcciones
    const hasStreetSeparators = /[#\-y]/ .test(text) && text.length > 5;

    // Si coincide con alguna palabra clave
    const matchesKeyword = commonStreetKeywords.some(kw => lower.includes(kw));
    const matchesNeighborhood = neighborhoodIndicators.some(ni => lower.includes(ni));

    // Si es muy largo (las ciudades suelen ser nombres cortos)
    const isTooLong = text.length > 25;

    return matchesKeyword || matchesNeighborhood || (hasNumbers && hasStreetSeparators) || isTooLong;
};

module.exports = {
    reverseGeocode,
    isStreetAddress
};
