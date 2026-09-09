import { z } from 'zod';
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + 'T00:00:00Z');
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === value && !value.startsWith('0000');
}, 'Date invalide');
export const recordSchema = z.object({
  id: z.string().uuid(), kind: z.enum(['person','reign']),
  name: z.string().trim().min(1).max(150), start: date, end: date,
  description: z.string().max(20000),
  photo: z.string().max(7_000_000).refine(value => value === '' || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value), 'Photo locale invalide'),
  events: z.array(z.object({id:z.string().uuid(),date,title:z.string().trim().min(1).max(300),text:z.string().max(10000)})).max(200),
}).refine(value => value.end >= value.start, 'La fin doit suivre le début');
export type HistoryRecord = z.infer<typeof recordSchema>;
export const backupSchema = z.object({format:z.literal('carnet-histoire'),version:z.literal(1),records:z.array(recordSchema).max(10000)}).refine(value=>new Set(value.records.map(r=>r.id)).size===value.records.length,'Identifiants en double');
