import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.location = new URL('https://example.github.io/histoire/');
const {readRecords, saveRecord, deleteRecord, importRecords} = await import('../lib/local-storage.ts');
const {backupSchema} = await import('../lib/history.ts');
const item = {id:crypto.randomUUID(),kind:'person',name:'Test',start:'1700-01-01',end:'1760-01-01',description:'Notes',photo:'data:image/png;base64,aGVsbG8=',events:[{id:crypto.randomUUID(),date:'1730-01-01',title:'Fait daté',text:'Notes'}]};
test('Local storage: create, reopen, update, photos, backup and delete',async()=>{
 await saveRecord(item);
 assert.deepEqual(await readRecords(),[item]);
 await saveRecord({...item,name:'Modifié'});
 assert.equal((await readRecords())[0].name,'Modifié');
 const backup=backupSchema.parse(JSON.parse(JSON.stringify({format:'carnet-histoire',version:1,records:await readRecords()})));
 await deleteRecord(item.id);
 assert.deepEqual(await readRecords(),[]);
 await importRecords(backup.records);
 assert.equal((await readRecords())[0].photo,item.photo);
 const another={...item,id:crypto.randomUUID(),name:'Autre'};
 await saveRecord(another);
 await importRecords([item]);
 assert.equal((await readRecords()).length,2);
 assert.equal((await readRecords()).find(r=>r.id===item.id).name,'Test');
 const before=await readRecords();
 await assert.rejects(importRecords([{...another,name:'Ne doit pas être écrit'},{...item,end:'1600-01-01'}]));
 assert.deepEqual(await readRecords(),before,'Invalid import must not partially overwrite records');
 assert.equal(backupSchema.safeParse({format:'carnet-histoire',version:2,records:[]}).success,false);
 assert.equal(backupSchema.safeParse({format:'carnet-histoire',version:1,records:[item,item]}).success,false);
 await assert.rejects(saveRecord({...item,photo:'https://example.com/tracker.png'}));
 await deleteRecord(item.id);await deleteRecord(another.id);
});

test('Reject active and remote photo content in backups',()=>{
 for(const photo of ['javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=','data:text/html;base64,PHNjcmlwdD4=','https://example.com/image.png']) {
  assert.equal(backupSchema.safeParse({format:'carnet-histoire',version:1,records:[{...item,photo}]}).success,false);
 }
 const untrusted=JSON.parse(JSON.stringify({format:'carnet-histoire',version:1,records:[item]}));
 untrusted.records[0].__proto__={polluted:true};
 const result=backupSchema.parse(untrusted);
 assert.equal(Object.hasOwn(result.records[0],'__proto__'),false);
 assert.equal({}.polluted,undefined);
});


test('Local folders: switching, complete writes, conflicts and failed writes',async()=>{
 const vault=await import('../lib/vault-storage.ts');
 function folder(name){
  let content=null,permission='granted',fail=false;
  return {name,get content(){return content},set content(value){content=value},set permission(value){permission=value},set fail(value){fail=value},
   async queryPermission(){return permission},
   async getFileHandle(filename,options={}){assert.equal(filename,'carnet-histoire.json');if(content===null&&!options.create)throw new DOMException('Missing','NotFoundError');if(content===null&&options.create)content='';return {
    async getFile(){return new Blob([content||''])},
    async createWritable(){let pending;return {async write(value){if(fail)throw new Error('Disk full');pending=value},async close(){content=pending},async abort(){}}}
   }}
  };
 }
 const a=folder('A'),b=folder('B');
 await vault.openDirectory(a,false);assert.deepEqual(await vault.readRecords(),[]);
 await vault.saveRecord(item);assert.equal(JSON.parse(a.content).records[0].photo,item.photo);
 await vault.openDirectory(b,false);assert.deepEqual(await vault.readRecords(),[]);
 await vault.saveRecord({...item,name:'Dans B'});assert.equal(JSON.parse(a.content).records[0].name,'Test');
 await vault.openDirectory(a,false);assert.equal((await vault.readRecords())[0].name,'Test');
 a.fail=true;const before=a.content;await assert.rejects(vault.saveRecord({...item,name:'Ne pas écrire'}),/Disk full/);assert.equal(a.content,before);assert.equal((await vault.readRecords())[0].name,'Test');a.fail=false;
 a.permission='denied';await assert.rejects(vault.saveAll(),/expiré/);a.permission='granted';
 a.content=JSON.stringify({format:'carnet-histoire',version:1,records:[{...item,name:'Autre logiciel'}]});
 await assert.rejects(vault.saveRecord({...item,name:'Écrasement interdit'}),/modifié ailleurs/);assert.equal(JSON.parse(a.content).records[0].name,'Autre logiciel');
 await vault.openDirectory(a,false);await vault.deleteRecord(item.id);assert.deepEqual(JSON.parse(a.content).records,[]);
 const invalid=folder('Invalide');invalid.content='{"format":"wrong"}';await assert.rejects(vault.openDirectory(invalid,false),/invalide/);assert.deepEqual(await vault.readRecords(),[]);
 await vault.importRecords([item]);await vault.saveAll();assert.equal(JSON.parse(a.content).records.length,1);
});

