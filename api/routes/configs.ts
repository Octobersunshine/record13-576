import { Router, type Request, type Response } from 'express';
import { mockConfigs } from '../data/mockData.js';
import type { ApiConfig, ApiListQuery, HttpMethod, ApiStatus } from '../../shared/types.js';

const router = Router();
let configs: ApiConfig[] = [...mockConfigs];

const getStats = () => ({
  total: configs.length,
  active: configs.filter((c) => c.status === 'active').length,
  inactive: configs.filter((c) => c.status === 'inactive').length,
  error: configs.filter((c) => c.status === 'error').length,
});

router.get('/stats', (_req: Request, res: Response) => {
  res.json(getStats());
});

router.get('/configs', (req: Request<unknown, unknown, unknown, ApiListQuery>, res: Response) => {
  const { search, method, status } = req.query;
  let result = [...configs];

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.path.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }
  if (method && method !== 'ALL') {
    result = result.filter((c) => c.method === (method as HttpMethod));
  }
  if (status && status !== 'ALL') {
    result = result.filter((c) => c.status === (status as ApiStatus));
  }

  res.json(result);
});

router.get('/configs/:id', (req: Request, res: Response) => {
  const cfg = configs.find((c) => c.id === req.params.id);
  if (!cfg) return res.status(404).json({ error: 'Not found' });
  res.json(cfg);
});

router.post('/configs', (req: Request, res: Response) => {
  const now = new Date().toISOString();
  const newCfg: ApiConfig = {
    id: String(Date.now()),
    name: req.body.name || '未命名接口',
    path: req.body.path || '/api/',
    method: req.body.method || 'GET',
    status: req.body.status || 'active',
    description: req.body.description || '',
    headers: req.body.headers || [],
    queryParams: req.body.queryParams || [],
    requestBody: req.body.requestBody,
    responseExample: req.body.responseExample || '',
    createdAt: now,
    updatedAt: now,
  };
  configs.unshift(newCfg);
  res.status(201).json(newCfg);
});

router.put('/configs/:id', (req: Request, res: Response) => {
  const idx = configs.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  configs[idx] = {
    ...configs[idx],
    ...req.body,
    id: configs[idx].id,
    createdAt: configs[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  res.json(configs[idx]);
});

router.delete('/configs/:id', (req: Request, res: Response) => {
  const before = configs.length;
  configs = configs.filter((c) => c.id !== req.params.id);
  if (configs.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
