import {backupSchema,recordSchema,type HistoryRecord} from './history.ts';
import * as browserStore from './local-storage.ts';
export type Directory=FileSystemDirectoryHandle & {queryPermission:(o:{mode:'readwrite'})=>Promise<PermissionState>;requestPermission:(o:{mode:'readwrite'})=>Promise<PermissionState>};
export const FILE_NAME='carnet-histoire.json';
let active:Directory|null=null,expected:string|null=null,records:HistoryRecord[]=[],ready=false;
let tail:Promise<unknown>=Promise.resolve();
function serial<T>(work:()=>Promise<T>){const result=tail.then(work,work);tail=result.catch(()=>{});return result;}
export function supported(){return typeof window!=='undefined'&&'showDirectoryPicker' in window;}
async function configDb(){return new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open('carnet-dossier:'+new URL('.',location.href).pathname,1);req.onupgradeneeded=()=>req.result.createObjectStore('settings');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
export async function rememberedDirectory():Promise<Directory|null>{const db=await configDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('settings');const r=tx.objectStore('settings').get('directory');tx.oncomplete=()=>resolve(r.result||null);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
async function remember(directory:Directory){const db=await configDb();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').put(directory,'directory');tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
async function readFile(directory:Directory):Promise<string|null>{try{const handle=await directory.getFileHandle(FILE_NAME);const file=await handle.getFile();if(file.size>100*1024*1024)throw new Error('Le carnet dépasse 100 Mo.');return await file.text()}catch(e){if(e instanceof DOMException&&e.name==='NotFoundError')return null;throw e}}
function parse(text:string|null){if(text===null||text==='')return [];const checked=backupSchema.safeParse(JSON.parse(text));if(!checked.success)throw new Error('Le fichier carnet-histoire.json est invalide. Aucun fichier n’a été remplacé.');return checked.data.records}
export async function openDirectory(directory:Directory,persist=true){return serial(async()=>{const text=await readFile(directory);const data=parse(text);if(persist)await remember(directory);active=directory;expected=text;records=data;ready=true;return directory.name})}
export async function chooseDirectory(){const picker=(window as unknown as {showDirectoryPicker:(o:object)=>Promise<Directory>}).showDirectoryPicker;const directory=await picker.call(window,{mode:'readwrite',id:'carnet-histoire',startIn:'documents'});return openDirectory(directory)}
export async function useBrowser(){return serial(async()=>{active=null;records=await browserStore.readRecords();ready=true})}
export async function readRecords(){await tail;if(!ready)throw new Error('Choisissez un dossier.');return structuredClone(records)}
async function persist(data:HistoryRecord[]){
 if(!ready)throw new Error('Choisissez un dossier.');
 if(!active){await browserStore.replaceRecords(data);records=data;return;}
 const directory=active;
 const work=async()=>{
  if(await directory.queryPermission({mode:'readwrite'})!=='granted')throw new Error('Accès au dossier expiré. Fermez la fiche, puis réautorisez le dossier. La saisie n’a pas été écrite.');
  if(await readFile(directory)!==expected)throw new Error('Le fichier a été modifié ailleurs. Exportez votre copie avant de rouvrir le dossier ; aucune modification externe n’a été écrasée.');
  const text=JSON.stringify({format:'carnet-histoire',version:1,records:data},null,2);
  if(new Blob([text]).size>100*1024*1024)throw new Error('Le carnet dépasse la limite de 100 Mo.');
  const file=await directory.getFileHandle(FILE_NAME,{create:true});if(expected===null)expected='';const writer=await file.createWritable();
  try{await writer.write(text);await writer.close()}catch(e){await writer.abort().catch(()=>{});throw e}
  expected=text;records=data;
 };
 if(typeof navigator!=='undefined'&&navigator.locks)await navigator.locks.request('carnet-histoire-file-write',work);else await work();
}
export function saveRecord(record:HistoryRecord){const validated=recordSchema.parse(record);return serial(()=>persist([...records.filter(r=>r.id!==validated.id),validated]))}
export function deleteRecord(id:string){return serial(()=>persist(records.filter(r=>r.id!==id)))}
export function importRecords(incoming:HistoryRecord[]){const valid=incoming.map(r=>recordSchema.parse(r));return serial(()=>{const merged=new Map(records.map(r=>[r.id,r]));for(const record of valid)merged.set(record.id,record);return persist([...merged.values()])})}
export function saveAll(){return serial(()=>persist(records))}

