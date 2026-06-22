import { create } from 'zustand';
import type { ApiConfig, Stats, ApiListQuery, HttpMethod, ApiStatus } from '@@/shared/types';

interface ApiState {
  configs: ApiConfig[];
  stats: Stats;
  loading: boolean;
  detailLoading: boolean;
  currentDetail: ApiConfig | null;
  filters: ApiListQuery;
  fetchConfigs: (query?: ApiListQuery) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createConfig: (data: Partial<ApiConfig>) => Promise<ApiConfig | null>;
  updateConfig: (id: string, data: Partial<ApiConfig>) => Promise<ApiConfig | null>;
  deleteConfig: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<ApiListQuery>) => void;
}

const initialStats: Stats = { total: 0, active: 0, inactive: 0, error: 0 };

export const useApiStore = create<ApiState>((set, get) => ({
  configs: [],
  stats: initialStats,
  loading: false,
  detailLoading: false,
  currentDetail: null,
  filters: { search: '', method: 'ALL', status: 'ALL' },

  fetchConfigs: async (query) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      const merged = { ...get().filters, ...query };
      if (merged.search) params.set('search', merged.search);
      if (merged.method && merged.method !== 'ALL') params.set('method', merged.method);
      if (merged.status && merged.status !== 'ALL') params.set('status', merged.status);
      const qs = params.toString();
      const res = await fetch(`/api/configs${qs ? `?${qs}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        set({ configs: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        set({ stats: data });
      }
    } catch {
      /* ignore */
    }
  },

  fetchDetail: async (id: string) => {
    set({ detailLoading: true });
    try {
      const res = await fetch(`/api/configs/${id}`);
      if (res.ok) {
        const data = await res.json();
        set({ currentDetail: data, detailLoading: false });
      } else {
        set({ detailLoading: false });
      }
    } catch {
      set({ detailLoading: false });
    }
  },

  createConfig: async (data) => {
    try {
      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        get().fetchConfigs();
        get().fetchStats();
        return created;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateConfig: async (id, data) => {
    try {
      const res = await fetch(`/api/configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        get().fetchConfigs();
        get().fetchStats();
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteConfig: async (id) => {
    try {
      const res = await fetch(`/api/configs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        get().fetchConfigs();
        get().fetchStats();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  setFilters: (filters) => {
    const merged = { ...get().filters, ...filters };
    set({ filters: merged });
  },
}));

export const getMethodBadgeClass = (method: HttpMethod): string => {
  const map: Record<HttpMethod, string> = {
    GET: 'badge-get',
    POST: 'badge-post',
    PUT: 'badge-put',
    DELETE: 'badge-delete',
    PATCH: 'badge-patch',
  };
  return map[method] || 'badge-post';
};

export const getStatusBadgeClass = (status: ApiStatus): string => {
  const map: Record<ApiStatus, string> = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    error: 'badge-error',
  };
  return map[status];
};

export const getStatusText = (status: ApiStatus): string => {
  const map: Record<ApiStatus, string> = {
    active: '运行中',
    inactive: '已停用',
    error: '异常',
  };
  return map[status];
};
