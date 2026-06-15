import { chatMessageService } from './chatMessageService';
import { chatSubscriptionService } from './chatSubscriptionService';

/**
 * @deprecated Use chatMessageService or chatSubscriptionService directly instead.
 * This facade is kept for backwards compatibility with existing UI components.
 */
export const chatService = {
  sendMessage: chatMessageService.sendMessage,
  sendSystemMessage: chatMessageService.sendSystemMessage,
  subscribeToChat: chatSubscriptionService.subscribeToChat
};
