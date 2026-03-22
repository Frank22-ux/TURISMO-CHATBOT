const activityService = require('../services/activityService');

const getAllActivities = async (req, res) => {
    try {
        const { location, lat, lng, radius, guests, startDate, endDate, limit } = req.query;
        const activities = await activityService.getAllActivities({ 
            location, lat, lng, radius, guests, startDate, endDate, limit
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
        const activity = await activityService.getActivityDetails(id);
        if (!activity) {
            return res.status(404).json({ message: 'Experiencia no encontrada' });
        }
        res.status(200).json(activity);
    } catch (error) {
        console.error('Error in getActivityDetails:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllActivities,
    getActivityDetails
};
