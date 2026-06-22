import { Calendar, ChevronRight, Clock } from 'lucide-react';
import type { ApiConfig } from '@@/shared/types';
import { getMethodBadgeClass, getStatusBadgeClass, getStatusText, useApiStore } from '@/store/apiStore';

interface ApiCardProps {
  config: ApiConfig;
  onClick: () => void;
  index: number;
}

export default function ApiCard({ config, onClick, index }: ApiCardProps) {
  const prefetchDetail = useApiStore((s) => s.prefetchDetail);
  const handleMouseEnter = () => {
    prefetchDetail(config.id);
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className="card card-hover p-5 text-left group animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={getMethodBadgeClass(config.method)}>{config.method}</span>
          <span className={getStatusBadgeClass(config.status)}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                config.status === 'active'
                  ? 'bg-success-400 animate-pulse'
                  : config.status === 'error'
                  ? 'bg-danger-400 animate-pulse'
                  : 'bg-dark-500'
              }`}
            />
            {getStatusText(config.status)}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      <h3 className="font-display font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
        {config.name}
      </h3>

      <code className="font-mono text-xs text-primary-300/90 bg-dark-900/50 px-2 py-1 rounded inline-block mb-3 break-all">
        {config.path}
      </code>

      <p className="text-sm text-dark-400 line-clamp-2 mb-4">{config.description}</p>

      <div className="flex items-center gap-4 text-xs text-dark-500 pt-3 border-t border-dark-700/50">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>创建 {new Date(config.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>更新 {new Date(config.updatedAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </button>
  );
}
