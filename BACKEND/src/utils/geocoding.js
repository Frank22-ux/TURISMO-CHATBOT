const axios = require('axios');
require('dotenv').config();

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

/**
 * Normaliza una ubicación usando el Reverse Geocoding de Mapbox
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<object>} - Datos normalizados { ciudad, provincia, pais }
 */
const reverseGeocode = async (lat, lng) => {
    if (!lat || !lng || lat === 0 || lng === 0) return null;
    
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&types=place,region,country`;
        const response = await axios.get(url);
        
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
 * Verifica si una cadena parece ser una dirección en lugar de una ciudad
 * @param {string} text - Texto a validar
 * @returns {boolean} - True si parece una dirección
 */
const isStreetAddress = (text) => {
    if (!text) return false;
    const commonStreetKeywords = [
        'avenida', 'ave.', 'calle', 'cll', 'pasaje', 'psj', 'garcia moreno', 
        'shyris', 'eloy alfaro', 'sanchez', 'antonio', 'moreno', 'chile'
    ];
    const lower = text.toLowerCase();
    return commonStreetKeywords.some(keyword => lower.includes(keyword));
};

module.exports = {
    reverseGeocode,
    isStreetAddress
};
