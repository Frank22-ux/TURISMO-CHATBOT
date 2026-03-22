const hostRepository = require('../repositories/hostRepository');

const getProfile = async (id_anfitrion) => {
    let profile = await hostRepository.findProfileByHostId(id_anfitrion);
    
    // If profile doesn't exist (old user), create it
    if (!profile) {
        await hostRepository.initializeProfile(id_anfitrion);
        profile = await hostRepository.findProfileByHostId(id_anfitrion);
    }
    
    return profile;
};

const updateProfile = async (id_anfitrion, profileData) => {
    return await hostRepository.updateProfile(id_anfitrion, profileData);
};

const getDashboardStats = async (id_anfitrion) => {
    return await hostRepository.getDashboardStats(id_anfitrion);
};

module.exports = {
    getProfile,
    updateProfile,
    getDashboardStats
};
