const hostService = require('../services/hostService');
const activityService = require('../services/activityService');
const serviceService = require('../services/serviceService');

const getProfile = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const profile = await hostService.getProfile(id_anfitrion);
        if (!profile) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching PUBLIC profile for host ID:', id);
        const profile = await hostService.getProfile(id);
        if (!profile) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }
        
        // Return only non-sensitive data
        const publicProfile = {
            id_anfitrion: profile.id_anfitrion,
            nombre_negocio: profile.nombre_negocio,
            nombre_host: profile.nombre_host,
            descuento_paquete: profile.descuento_paquete
        };
        
        res.status(200).json(publicProfile);
    } catch (error) {
        console.error('Error in getPublicProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const profile = await hostService.updateProfile(id_anfitrion, req.body);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBankProfile = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais } = req.body;
        const result = await hostService.updateBankProfile(id_anfitrion, { 
            banco_nombre, tipo_cuenta, numero_cuenta, identificacion, 
            banco_swift, banco_direccion, banco_pais 
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyActivities = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const activities = await activityService.getActivitiesByHost(id_anfitrion);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createActivity = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const activityData = { ...req.body, id_anfitrion };
        const result = await activityService.createActivity(activityData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        await activityService.deleteActivity(id, id_anfitrion);
        res.status(200).json({ message: 'Experiencia eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivityStatus = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const { estado } = req.body;
        await activityService.updateActivityStatus(id, id_anfitrion, estado);
        res.status(200).json({ message: 'Estado actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActivityDetails = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const activity = await activityService.getActivityDetails(id);
        
        if (!activity || activity.id_anfitrion !== id_anfitrion) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta experiencia' });
        }
        
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivity = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const activity = await activityService.getActivityDetails(id);
        
        if (!activity || activity.id_anfitrion !== id_anfitrion) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta experiencia' });
        }
        
        const result = await activityService.updateActivity(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyServices = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const services = await serviceService.getServicesByHost(id_anfitrion);
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getServiceDetails = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const service = await serviceService.getServiceDetails(id);
        
        if (!service || service.id_anfitrion !== id_anfitrion) {
            return res.status(403).json({ message: 'No tienes permiso para ver este servicio' });
        }
        
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createService = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const serviceData = { ...req.body, id_anfitrion };
        const result = await serviceService.createService(serviceData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        await serviceService.deleteService(id, id_anfitrion);
        res.status(200).json({ message: 'Servicio eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateServiceStatus = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const { estado } = req.body;
        await serviceService.updateServiceStatus(id, id_anfitrion, estado);
        res.status(200).json({ message: 'Estado actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { id } = req.params;
        const service = await serviceService.getServiceDetails(id);
        
        if (!service || service.id_anfitrion !== id_anfitrion) {
            return res.status(403).json({ message: 'No tienes permiso para editar este servicio' });
        }
        
        const result = await serviceService.updateService(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('CONTROLLER ERROR in updateService:', error);
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const stats = await hostService.getDashboardStats(id_anfitrion);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBulkOffers = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { ids, type, offerPrice, expirationDate, percentage } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Se requieren IDs de actividades' });
        }

        const activityRepository = require('../repositories/activityRepository');
        await activityRepository.updateBulkOffers(ids, type, offerPrice, expirationDate, percentage);
        
        res.status(200).json({ message: 'Ofertas actualizadas con éxito' });
    } catch (error) {
        console.error('Error in updateBulkOffers:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateBankProfile,
    getMyActivities,
    createActivity,
    deleteActivity,
    updateActivityStatus,
    getActivityDetails,
    updateActivity,
    getMyServices,
    getServiceDetails,
    createService,
    deleteService,
    updateServiceStatus,
    updateService,
    getDashboardStats,
    updateBulkOffers,
    getPublicProfile
};
