import { useEffect, useState } from 'react';
import { Layers, CheckCircle, PauseCircle, AlertTriangle } from 'lucide-react';
import { useApiStore } from '@/store/apiStore';
import type { Stats } from '@@/shared/types';

interface StatItem {
  label: string;
  key: keyof Stats;
  icon: React.ReactNode;
  color: string;
  shadow: string;
}

const items: StatItem[] = [
  { label: '接口总数', key: 'total', icon: <Layers className="w-5 h-5" />, color: 'text-primary-400', shadow: 'shadow-glow-primary' },
  { label: '运行中', key: 'active', icon: <CheckCircle className="w-5 h-5" />, color: 'text-success-400', shadow: 'shadow-glow-success' },
  { label: '已停用', key: 'inactive', icon: <PauseCircle className="w-5 h-5" />, color: 'text-dark-300', shadow: '' },
  { label: '异常', key: 'error', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-danger-400', shadow: '' },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 600;
    const from = 0;
    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display}</span>;
}

export default function StatsCards() {
  const { stats } = useApiStore();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {items.map((item, idx) => (
        <div
          key={item.key}
          className={`card p-5 card-hover ${item.shadow}`}
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-dark-400 font-medium">{item.label}</p>
              <p className={`font-display text-3xl font-bold mt-2 ${item.color}`}>
                <AnimatedNumber value={stats[item.key]} />
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
