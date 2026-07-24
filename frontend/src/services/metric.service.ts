import { fetchApi } from "../lib/apiClient";
import { BaseResponse, LiveMetric } from "../types/api";

export const metricService = {
    getLiveMetrics: async (): Promise<LiveMetric> => {
        const response = await fetchApi<BaseResponse<LiveMetric>>('/metrics/live', {
            method: "GET",
        });
        
        if (!response.success || !response.data) {
            throw new Error(response.message || "Failed to fetch live metrics");
        }
        
        return response.data;
    }
};
