const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Base path: /api/messages
router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/:partnerId', authMiddleware, messageController.getMessages);
router.post('/', authMiddleware, messageController.sendMessage);
router.put('/:id/status', authMiddleware, messageController.updateStatus);
router.put('/:id/content', authMiddleware, messageController.editMessage);
router.delete('/:id', authMiddleware, messageController.deleteMessage);

// Conversation management
router.post('/conversations/:partnerId/archive', authMiddleware, messageController.archiveConversation);
router.delete('/conversations/:partnerId', authMiddleware, messageController.deleteConversation);

module.exports = router;
