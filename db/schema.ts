import {sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{owner:text('owner').notNull(),id:text('id').notNull(),kind:text('kind').notNull(),data:text('data').notNull()},t=>[primaryKey({columns:[t.owner,t.id]})]);
