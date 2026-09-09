import assert from 'node:assert/strict';
const origin='http://localhost:5173';
async function call(path,options={}){const r=await fetch(origin+path,options);return r}
assert.equal((await call('/api/records')).status,401);
const login=await call('/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=login.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
assert.ok(cookie,'Local login cookie');
const headers={cookie,origin,'Content-Type':'application/json'};
const id=crypto.randomUUID();
const item={id,kind:'person',name:'Personnage de test',start:'1700-01-01',end:'1760-12-31',description:'Notes de test',photo:'',events:[{id:crypto.randomUUID(),date:'1730-05-01',title:'Événement de test',text:'Un fait daté'}]};
try {
 let r=await call('/api/records',{method:'PUT',headers,body:JSON.stringify(item)});assert.equal(r.status,200,await r.text());
 let list=await (await call('/api/records',{headers:{cookie}})).json();assert.equal(list.find(x=>x.id===id).events.length,1);
 r=await call('/api/records',{method:'PUT',headers,body:JSON.stringify({...item,name:'Nom modifié'})});assert.equal(r.status,200);
 list=await (await call('/api/records',{headers:{cookie}})).json();assert.equal(list.find(x=>x.id===id).name,'Nom modifié');
 r=await call('/api/records',{method:'PUT',headers,body:JSON.stringify({...item,end:'1699-01-01'})});assert.equal(r.status,400);
 r=await call('/api/records',{method:'PUT',headers:{...headers,origin:'https://example.com'},body:JSON.stringify(item)});assert.equal(r.status,403);
 r=await call('/api/photo?key=other-user/test',{headers:{cookie}});assert.equal(r.status,403);
 const data=new FormData();data.append('photo',new Blob([await (await import('node:fs/promises')).readFile('public/icon-192.png')],{type:'image/png'}),'test.png');
 r=await call('/api/photo',{method:'POST',headers:{cookie,origin},body:data});assert.equal(r.status,200);const photo=await r.json();r=await call(photo.url,{headers:{cookie}});assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');
 console.log('PASS: authentication, create, reload, update, date validation, cross-origin protection, photo ownership, photo upload/read');
} finally {const r=await call('/api/records?id='+id,{method:'DELETE',headers});assert.equal(r.status,200);const list=await(await call('/api/records',{headers:{cookie}})).json();assert.ok(!list.some(x=>x.id===id));console.log('PASS: delete and read back')}
