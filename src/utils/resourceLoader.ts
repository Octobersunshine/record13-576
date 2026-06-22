import { checkPreloadAllowed } from './preloadPolicy';

type Priority = 'critical' | 'high' | 'normal' | 'low';

interface Task<T> {
  id: string;
  priority: Priority;
  loader: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  timestamp: number;
  url?: string;
}

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

class ResourceLoader {
  private maxConcurrent: number;
  private activeCount: number = 0;
  private queue: Task<unknown>[] = [];
  private running = new Set<string>();
  private cache = new Map<string, unknown>();
  private blockedCount: number = 0;
  private mode: 'whitelist' | 'blacklist' | 'both';

  constructor(maxConcurrent: number = 4, mode: 'whitelist' | 'blacklist' | 'both' = 'blacklist') {
    this.maxConcurrent = Math.max(1, Math.min(maxConcurrent, 6));
    this.mode = mode;
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority];
      const pb = PRIORITY_ORDER[b.priority];
      if (pa !== pb) return pa - pb;
      return a.timestamp - b.timestamp;
    });
  }

  private checkUrl(url: string | undefined): boolean {
    if (!url) return true;
    const { verdict, reason } = checkPreloadAllowed(url, this.mode);
    if (verdict !== 'allowed') {
      this.blockedCount++;
      if (import.meta.env.DEV) {
        console.warn(
          `[PreloadPolicy] 已拦截: ${url}\n原因: ${reason || '未知'}`,
        );
      }
      return false;
    }
    return true;
  }

  private async processNext() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;

    this.sortQueue();
    const task = this.queue.shift()!;

    if (this.running.has(task.id)) {
      this.processNext();
      return;
    }

    if (this.cache.has(task.id)) {
      task.resolve(this.cache.get(task.id) as never);
      this.processNext();
      return;
    }

    if (task.url && !this.checkUrl(task.url)) {
      task.reject(new Error(`预加载被策略拦截: ${task.url}`));
      this.processNext();
      return;
    }

    this.activeCount++;
    this.running.add(task.id);

    try {
      const result = await task.loader();
      this.cache.set(task.id, result);
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    } finally {
      this.activeCount--;
      this.running.delete(task.id);
      this.processNext();
    }
  }

  load<T>(
    id: string,
    priority: Priority,
    loader: () => Promise<T>,
    url?: string,
  ): Promise<T> {
    if (this.cache.has(id)) {
      return Promise.resolve(this.cache.get(id) as T);
    }

    if (url && !this.checkUrl(url)) {
      return Promise.reject(new Error(`预加载被策略拦截: ${url}`));
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id,
        priority,
        loader: loader as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
        url,
      });
      this.processNext();
    });
  }

  preload<T>(
    id: string,
    priority: Priority,
    loader: () => Promise<T>,
    url?: string,
  ): void {
    if (!this.cache.has(id) && !this.running.has(id)) {
      this.load(id, priority, loader, url).catch(() => {});
    }
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getBlockedCount(): number {
    return this.blockedCount;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const resourceLoader = new ResourceLoader(4, 'blacklist');

export async function loadWithPriority<T>(
  id: string,
  priority: Priority,
  loader: () => Promise<T>,
  url?: string,
): Promise<T> {
  return resourceLoader.load(id, priority, loader, url);
}

export function prefetchResource<T>(
  id: string,
  priority: Priority,
  loader: () => Promise<T>,
  url?: string,
): void {
  resourceLoader.preload(id, priority, loader, url);
}

export async function concurrentAll<T>(
  tasks: Array<() => Promise<T>>,
  maxConcurrent: number = 4,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  let index = 0;

  async function execute(task: () => Promise<T>, pos: number) {
    results[pos] = await task();
  }

  for (const task of tasks) {
    const pos = index++;
    const p = execute(task, pos);
    executing.push(p);

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
      for (let i = executing.length - 1; i >= 0; i--) {
        try {
          await Promise.resolve(executing[i]);
          executing.splice(i, 1);
          break;
        } catch {
          executing.splice(i, 1);
          break;
        }
      }
    }
  }

  await Promise.all(executing);
  return results;
}
