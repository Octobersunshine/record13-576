import { useEffect, useState } from 'react';
import {
  ArrowLeft, Save, Trash2, Plus, X, Settings, FileCode, KeyRound,
  Search as SearchIcon, Braces, Activity
} from 'lucide-react';
import { useApiStore, getMethodBadgeClass, getStatusBadgeClass, getStatusText } from '@/store/apiStore';
import { DetailSkeleton } from './Skeletons';
import type { ApiConfig, HttpMethod, ApiStatus, KeyValue } from '@@/shared/types';

interface ApiDetailProps {
  id: string | null;
  onBack: () => void;
  isNew?: boolean;
}

const methodOptions: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const statusOptions: ApiStatus[] = ['active', 'inactive', 'error'];

function emptyConfig(): ApiConfig {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    path: '/api/',
    method: 'GET',
    status: 'active',
    description: '',
    headers: [],
    queryParams: [],
    requestBody: '',
    responseExample: JSON.stringify({ code: 0, message: 'success', data: null }, null, 2),
    createdAt: now,
    updatedAt: now,
  };
}

export default function ApiDetail({ id, onBack, isNew }: ApiDetailProps) {
  const { fetchDetail, currentDetail, detailLoading, createConfig, updateConfig, deleteConfig } = useApiStore();
  const [form, setForm] = useState<ApiConfig>(emptyConfig());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setForm(emptyConfig());
    } else if (id) {
      fetchDetail(id);
    }
  }, [id, isNew, fetchDetail]);

  useEffect(() => {
    if (currentDetail && !isNew) {
      setForm(currentDetail);
    }
  }, [currentDetail, isNew]);

  const updateField = <K extends keyof ApiConfig>(key: K, value: ApiConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateKvList = (listKey: 'headers' | 'queryParams', idx: number, field: keyof KeyValue, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [listKey]: [...prev[listKey]] };
      next[listKey][idx] = { ...next[listKey][idx], [field]: value };
      return next;
    });
  };

  const addKv = (listKey: 'headers' | 'queryParams') => {
    setForm((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], { key: '', value: '', required: false }],
    }));
  };

  const removeKv = (listKey: 'headers' | 'queryParams', idx: number) => {
    setForm((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      await createConfig(form);
    } else if (id) {
      await updateConfig(id, form);
    }
    setSaving(false);
    onBack();
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    if (confirm('确定要删除这个接口配置吗？')) {
      const ok = await deleteConfig(id);
      if (ok) onBack();
    }
  };

  if (detailLoading && !isNew) {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost mb-5 text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>
        <DetailSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="btn-secondary !border-danger-500/30 text-danger-400 hover:bg-danger-500/10 text-sm">
              <Trash2 className="w-4 h-4" /> 删除
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !form.name || !form.path} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-4 h-4 text-primary-400" />
            <h2 className="font-display font-semibold text-white text-lg">基础配置</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className={getMethodBadgeClass(form.method)}>{form.method}</span>
              <span className={getStatusBadgeClass(form.status)}>{getStatusText(form.status)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">接口名称</label>
              <input
                type="text"
                className="input"
                placeholder="例如：获取用户信息"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">接口路径</label>
              <input
                type="text"
                className="input font-mono text-sm"
                placeholder="/api/v1/users"
                value={form.path}
                onChange={(e) => updateField('path', e.target.value)}
              />
            </div>
            <div>
              <label className="label">请求方法</label>
              <select
                className="input"
                value={form.method}
                onChange={(e) => updateField('method', e.target.value as HttpMethod)}
              >
                {methodOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">状态</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as ApiStatus)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{getStatusText(s)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">接口描述</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="接口功能描述..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary-400" />
              <h3 className="font-display font-semibold text-white">请求头 Headers</h3>
            </div>
            <button onClick={() => addKv('headers')} className="btn-ghost !py-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {form.headers.length === 0 && (
              <p className="text-sm text-dark-500 py-4 text-center">暂无请求头，点击"添加"创建</p>
            )}
            {form.headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input !py-1.5 text-sm flex-1"
                  placeholder="Key"
                  value={h.key}
                  onChange={(e) => updateKvList('headers', i, 'key', e.target.value)}
                />
                <input
                  className="input !py-1.5 text-sm flex-1"
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => updateKvList('headers', i, 'value', e.target.value)}
                />
                <button onClick={() => removeKv('headers', i)} className="btn-ghost !p-2 text-dark-400 hover:text-danger-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-primary-400" />
              <h3 className="font-display font-semibold text-white">查询参数 Query</h3>
            </div>
            <button onClick={() => addKv('queryParams')} className="btn-ghost !py-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {form.queryParams.length === 0 && (
              <p className="text-sm text-dark-500 py-4 text-center">暂无查询参数</p>
            )}
            {form.queryParams.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input !py-1.5 text-sm flex-1"
                  placeholder="Key"
                  value={q.key}
                  onChange={(e) => updateKvList('queryParams', i, 'key', e.target.value)}
                />
                <input
                  className="input !py-1.5 text-sm flex-1"
                  placeholder="Value"
                  value={q.value}
                  onChange={(e) => updateKvList('queryParams', i, 'value', e.target.value)}
                />
                <button onClick={() => removeKv('queryParams', i)} className="btn-ghost !p-2 text-dark-400 hover:text-danger-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Braces className="w-4 h-4 text-primary-400" />
            <h3 className="font-display font-semibold text-white">请求体 (Body)</h3>
          </div>
          <textarea
            className="input font-mono text-xs min-h-[120px] resize-y"
            placeholder='{ "key": "value" }'
            value={form.requestBody || ''}
            onChange={(e) => updateField('requestBody', e.target.value)}
          />
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-4 h-4 text-primary-400" />
            <h3 className="font-display font-semibold text-white">响应示例</h3>
          </div>
          <textarea
            className="input font-mono text-xs min-h-[160px] resize-y"
            placeholder='JSON 响应示例...'
            value={form.responseExample}
            onChange={(e) => updateField('responseExample', e.target.value)}
          />
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary-400" />
            <h3 className="font-display font-semibold text-white">时间信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-dark-400 text-xs">创建时间</span>
              <span className="font-mono text-dark-200 mt-1">
                {form.createdAt ? new Date(form.createdAt).toLocaleString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-dark-400 text-xs">更新时间</span>
              <span className="font-mono text-dark-200 mt-1">
                {form.updatedAt ? new Date(form.updatedAt).toLocaleString('zh-CN') : '-'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
