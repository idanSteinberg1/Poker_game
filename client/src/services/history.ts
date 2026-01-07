import api from './api';

export interface HandHistory {
    id: number;
    table_id: number;
    club_id: number;
    start_time: string;
    end_time: string;
    result_json: string; // We'll parse this in the component
}

export const HistoryService = {
    getTableHistory: async (tableId: number): Promise<HandHistory[]> => {
        const response = await api.get(`/history/table/${tableId}`);
        return response.data;
    },

    getClubHistory: async (clubId: number): Promise<HandHistory[]> => {
        const response = await api.get(`/history/club/${clubId}`);
        return response.data;
    }
};
