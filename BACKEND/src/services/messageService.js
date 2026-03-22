const messageRepository = require('../repositories/messageRepository');

const sendMessage = async (messageData) => {
    return await messageRepository.createMessage(messageData);
};

const getMessages = async (user1Id, user2Id) => {
    // When fetching messages, we should mark any unread messages from user2Id to user1Id as READ
    await messageRepository.markMessagesAsRead(user2Id, user1Id);
    return await messageRepository.getMessagesBetweenUsers(user1Id, user2Id);
};

const getConversations = async (userId) => {
    return await messageRepository.getConversationsForUser(userId);
};

const updateStatus = async (id_mensaje, status) => {
    return await messageRepository.updateMessageStatus(id_mensaje, status);
};

const editMessage = async (id_mensaje, newContent) => {
    return await messageRepository.updateMessageContent(id_mensaje, newContent);
};

const deleteMessage = async (id_mensaje, userId) => {
    return await messageRepository.deleteMessage(id_mensaje, userId);
};

const archiveConversation = async (userId, partnerId, archive) => {
    return await messageRepository.archiveConversation(userId, partnerId, archive);
};

const deleteConversation = async (userId, partnerId) => {
    return await messageRepository.deleteConversation(userId, partnerId);
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
