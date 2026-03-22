const touristRepository = require('../repositories/touristRepository');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await touristRepository.getTouristStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

const getMyReservations = async (req, res) => {
    try {
        const reservations = await touristRepository.getTouristReservations(req.user.id);
        res.json(reservations);
    } catch (error) {
        console.error('Error in getMyReservations:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
};

const getProfile = async (req, res) => {
    try {
        const id_turista = req.user.id;
        const profile = await touristRepository.findProfileByTouristId(id_turista);
        if (!profile) {
            // Self-healing: initialize if missing
            await touristRepository.initializeProfile(id_turista);
            const newProfile = await touristRepository.findProfileByTouristId(id_turista);
            return res.json(newProfile);
        }
        res.json(profile);
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const id_turista = req.user.id;
        const profile = await touristRepository.updateProfile(id_turista, req.body);
        res.json(profile);
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

module.exports = {
    getDashboardStats,
    getMyReservations,
    getProfile,
    updateProfile
};
