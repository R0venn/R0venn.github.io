import {z} from 'zod';
export const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'Date invalide');
export const recordSchema=z.object({id:z.string().uuid(),kind:z.enum(['person','reign']),name:z.string().trim().min(1).max(150),start:date,end:date,description:z.string().max(20000),photo:z.string().max(500),events:z.array(z.object({id:z.string().uuid(),date:date,title:z.string().trim().min(1).max(300),text:z.string().max(10000)})).max(200)}).refine(v=>v.end>=v.start,'La fin doit suivre le début');
export type HistoryRecord=z.infer<typeof recordSchema>;
