import { Router } from "express";
import {
  createConversationHandler,
  getUserConversationsHandler,
  getConversationByIdHandler,
  getConversationMessagesHandler,
  sendMessageHandler
} from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import {
  createConversationSchema,
  sendMessageSchema,
  messageQuerySchema,
  conversationQuerySchema
} from "../validators/message.validator.js";

const router = Router();

// Retrieve or create persistent conversation between actor and caster
router.post(
  "/",
  authenticate,
  validate(createConversationSchema),
  createConversationHandler
);

// List user's conversations with latest message snippet
router.get(
  "/",
  authenticate,
  validateQuery(conversationQuerySchema),
  getUserConversationsHandler
);

// Get single conversation details
router.get(
  "/:conversationId",
  authenticate,
  getConversationByIdHandler
);

// Get paginated messages for a conversation
router.get(
  "/:conversationId/messages",
  authenticate,
  validateQuery(messageQuerySchema),
  getConversationMessagesHandler
);

// Send message within conversation
router.post(
  "/:conversationId/messages",
  authenticate,
  validate(sendMessageSchema),
  sendMessageHandler
);

export default router;
