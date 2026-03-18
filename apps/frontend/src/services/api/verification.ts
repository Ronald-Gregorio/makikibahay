import { api } from '../../lib/api';

export interface VerificationRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    role: 'user' | 'owner';
    idUrl: string;
    selfieUrl?: string;
    proofUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
}

export const verificationService = {
    submit: (formData: FormData) => {
        return api.postForm<any>('/verification/submit', formData);
    },

    getAdminList: () => {
        return api.get<VerificationRequest[]>('/verification/admin/list');
    },

    updateStatus: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
        return api.patch<any>(`/verification/admin/update/${id}`, { status, rejectionReason });
    }
};
