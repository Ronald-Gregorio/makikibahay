import { api } from '../../lib/api';

export interface Message {
    id: string;
    _id: string;
    roomId: string;
    senderId: any;
    receiverId: any;
    listingId: any;
    content: string;
    isRead: boolean;
    sentAt: string;
}

export const messageService = {
    getConversations: () => {
        return api.get<any[]>('/messages/conversations');
    },

    getMessagesByRoom: (roomId: string) => {
        return api.get<any[]>(`/messages/${roomId}`);
    },

    sendMessage: (content: string, receiverId: string, listingId: string, roomId?: string) => {
        return api.post<any>('/messages', { content, receiverId, listingId, roomId });
    },
    
    updateStatus: (id: string, status: { isRead?: boolean, isStarred?: boolean, isArchived?: boolean, isTrashed?: boolean }) => {
        return api.patch<any>(`/messages/${id}/status`, status);
    }
};
