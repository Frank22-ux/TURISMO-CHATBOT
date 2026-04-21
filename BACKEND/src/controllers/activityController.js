const activityService = require('../services/activityService');

const getAllActivities = async (req, res) => {
    try {
        const { location, city, province, country, lat, lng, radius, guests, startDate, endDate, limit } = req.query;
        const activities = await activityService.getAllActivities({ 
            location, city, province, country, lat, lng, radius, guests, startDate, endDate, limit
        });
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error in getAllActivities:', error); // Log the full error
        res.status(500).json({ message: error.message });
    }
};

const getActivityDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        const activity = await activityService.getActivityDetails(id, userId);
        if (!activity) {
            return res.status(404).json({ message: 'Experiencia no encontrada' });
        }
        res.status(200).json(activity);
    } catch (error) {
        console.error('Error in getActivityDetails:', error);
        res.status(500).json({ message: error.message });
    }
};

const getActivityAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Fecha es requerida' });
        }
        const availability = await activityService.getActivityAvailability(id, date);
        res.status(200).json({ remaining: availability });
    } catch (error) {
        console.error('Error in getActivityAvailability:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllActivities,
    getActivityDetails,
    getActivityAvailability
};
