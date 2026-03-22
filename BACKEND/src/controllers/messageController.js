const messageService = require('../services/messageService');

const sendMessage = async (req, res) => {
    try {
        const { id_receptor, contenido, es_archivo, nombre_archivo, tamano_archivo } = req.body;
        const id_emisor = req.user.id; // From authMiddleware

        if (!id_receptor) {
            return res.status(400).json({ message: 'El receptor es obligatorio' });
        }

        const message = await messageService.sendMessage({
            id_emisor,
            id_receptor,
            contenido,
            es_archivo,
            nombre_archivo,
            tamano_archivo
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getMessages = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user.id;

        if (!partnerId || partnerId === 'undefined') {
            return res.status(400).json({ message: 'ID del interlocutor es obligatorio o inválido' });
        }

        const messages = await messageService.getMessages(userId, partnerId);
        res.json(messages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await messageService.getConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error('Error in getConversations:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ message: 'ID y estado son obligatorios' });
        }

        const message = await messageService.updateStatus(id, status);
        res.json(message);
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;

        if (!id || !contenido) {
            return res.status(400).json({ message: 'ID y contenido son obligatorios' });
        }

        const message = await messageService.editMessage(id, contenido);
        res.json(message);
    } catch (error) {
        console.error('Error in editMessage:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ message: 'ID es obligatorio' });
        }

        await messageService.deleteMessage(id, userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const archiveConversation = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { archive } = req.body; // boolean
        const userId = req.user.id;

        await messageService.archiveConversation(userId, partnerId, archive);
        res.status(200).json({ message: archive ? 'Conversación archivada' : 'Conversación desarchivada' });
    } catch (error) {
        console.error('Error in archiveConversation:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user.id;

        await messageService.deleteConversation(userId, partnerId);
        res.status(200).json({ message: 'Conversación eliminada' });
    } catch (error) {
        console.error('Error in deleteConversation:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    updateStatus,
    editMessage,
    deleteMessage,
    archiveConversation,
    deleteConversation
};
