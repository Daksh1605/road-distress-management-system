import axios from 'axios';

// Load base API URL from environment variables, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface RoadDistressResponse {
  id: number;
  distress_type: string;
  severity: string;
  confidence_score: number;
  latitude: number;
  longitude: number;
  image_url: string | null;
  detected_at: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface MapMarkerResponse {
  id: number;
  latitude: number;
  longitude: number;
  distress_type: string;
  severity: string;
  status: string;
}

export interface ReportResponse {
  id: number;
  report_name: string;
  report_type: string;
  filepath: string | null;
  generated_by: number | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface UploadedVideoResponse {
  id: number;
  filename: string;
  filepath: string | null;
  processing_status: string;
  uploader_id: number | null;
  upload_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTaskResponse {
  id: number;
  distress_id: number;
  recommendation: string | null;
  priority: string;
  assigned_to: number | null;
  due_date: string | null;
  status: string;
  estimated_response_time: string | null;
  maintenance_category: string | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSummaryResponse {
  total_tasks: number;
  completed_repairs: number;
  in_progress_repairs: number;
  pending_repairs: number;
  total_cost: number;
  priority_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  monthly_repairs: Array<{ month: string; repairs: number }>;
}


export const apiService = {
  /**
   * Retrieves road distress logs from backend database.
   */
  getDistressLogs: async (skip = 0, limit = 100): Promise<RoadDistressResponse[]> => {
    const response = await apiClient.get<RoadDistressResponse[]>('/distress/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Retrieves map markers for geo-spatial mapping.
   */
  getMapMarkers: async (): Promise<MapMarkerResponse[]> => {
    const response = await apiClient.get<MapMarkerResponse[]>('/gis/markers');
    return response.data;
  },

  /**
   * Retrieves system users list.
   */
  getUsers: async (skip = 0, limit = 100): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>('/users/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Retrieves generated reports history logs.
   */
  getReports: async (skip = 0, limit = 100): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ReportResponse[]>('/reports/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Uploads a road surveillance video file to the server.
   */
  uploadVideo: async (file: File, uploaderId?: number): Promise<UploadedVideoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (uploaderId !== undefined) {
      formData.append('uploader_id', uploaderId.toString());
    }
    const response = await apiClient.post<UploadedVideoResponse>('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Retrieve all uploaded video logs from backend.
   */
  getVideos: async (skip = 0, limit = 100): Promise<UploadedVideoResponse[]> => {
    const response = await apiClient.get<UploadedVideoResponse[]>('/videos/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Deletes a video log and removes the physical file from disk.
   */
  deleteVideo: async (id: number): Promise<UploadedVideoResponse> => {
    const response = await apiClient.delete<UploadedVideoResponse>(`/videos/${id}`);
    return response.data;
  },

  /**
   * Run the recommendation engine on pending distresses and return all tasks.
   */
  getMaintenanceRecommendations: async (): Promise<MaintenanceTaskResponse[]> => {
    const response = await apiClient.get<MaintenanceTaskResponse[]>('/maintenance/recommendations');
    return response.data;
  },

  /**
   * Retrieve aggregated maintenance analytics statistics.
   */
  getMaintenanceSummary: async (): Promise<MaintenanceSummaryResponse> => {
    const response = await apiClient.get<MaintenanceSummaryResponse>('/maintenance/summary');
    return response.data;
  },

  /**
   * Generate a PDF report for a processed video session.
   */
  generatePDFReport: async (videoId: number): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>(`/reports/generate/${videoId}`);
    return response.data;
  },

  /**
   * Generate an Excel report for a processed video session.
   */
  generateExcelReport: async (videoId: number): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>(`/reports/excel/${videoId}`);
    return response.data;
  },

  /**
   * Deletes a report log from the database.
   */
  deleteReport: async (id: number): Promise<ReportResponse> => {
    const response = await apiClient.delete<ReportResponse>(`/reports/${id}`);
    return response.data;
  },

  /**
   * Returns the absolute backend download URL for a report file.
   */
  getReportDownloadUrl: (reportId: number): string => {
    return `${API_BASE_URL}/api/v1/reports/download/${reportId}`;
  },

  /**
   * Returns the absolute backend download URL for an Excel report file.
   */
  getExcelReportDownloadUrl: (reportId: number): string => {
    return `${API_BASE_URL}/api/v1/reports/excel/download/${reportId}`;
  },

  /**
   * Returns the absolute backend preview URL for a report file.
   */
  getReportPreviewUrl: (reportId: number): string => {
    return `${API_BASE_URL}/api/v1/reports/preview/${reportId}`;
  },
};
export default apiService;
