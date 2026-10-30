import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const directory=await mkdtemp(path.join(tmpdir(),'janseva-test-'));
test('authenticated workflow, validation, returns, history and persistence',async()=>{
let child;const base='http://127.0.0.1:3197';let cookie='';
async function start(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3197',DATA_DIR:directory,DEMO_PASSWORD:'test-password',NODE_ENV:'test',OPENAI_API_KEY:''},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),8000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('error',reject);});}
async function stop(){if(child.exitCode!==null)return;await new Promise(resolve=>{child.once('exit',resolve);child.kill();});}
async function call(url,data){const r=await fetch(base+'/api/'+url,{method:data?'POST':'GET',headers:{cookie,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
async function login(){const r=await call('login',{email:'officer@janseva.demo',password:'test-password'});assert.equal(r.status,200);cookie=r.cookie.split(';')[0];}
try{await start();assert.equal((await call('applications')).status,401);await login();
const made=await call('applications',{name:'परीक्षण',village:'नमूना गाँव',category:'पीने का पानी',description:'परीक्षण हेतु पानी की शिकायत',priority:'normal'});assert.equal(made.status,201);let a=made.data;const id=a.id;
const action=async b=>call(`applications/${id}/action`,{version:a.version,...b});
assert.equal((await action({action:'approve',note:'यह पर्याप्त लंबा कारण है।'})).status,400);
assert.equal((await action({action:'next',checks:{}})).status,400);
a=(await action({action:'next',checks:{identity:true,details:true,jurisdiction:true}})).data;assert.equal(a.stage,'verification');
assert.equal((await action({action:'next',fieldNote:'छोटा'})).status,400);
const stale=a.version;
a=(await action({action:'next',fieldNote:'स्थल पर जाँच की गई और पानी की समस्या की पुष्टि हुई।'})).data;assert.equal(a.stage,'decision');
assert.equal((await action({action:'save',version:stale})).status,409);
const suggestion=await call(`applications/${id}/assist`,{});assert.equal(suggestion.data.mode,'offline');
assert.equal((await action({action:'approve',note:''})).status,400);
a=(await action({action:'return',note:'कृपया समस्या के स्थान का पूरा विवरण फिर से दें।'})).data;assert.equal(a.status,'returned');
a=(await action({action:'resubmit'})).data;assert.equal(a.stage,'scrutiny');assert.equal(a.checks.identity,false);
a=(await action({action:'next',checks:{identity:true,details:true,jurisdiction:true}})).data;
a=(await action({action:'next',fieldNote:'दोबारा स्थल सत्यापन कर समस्या दूर होने की पुष्टि हुई।'})).data;
a=(await action({action:'approve',note:'स्थल सत्यापन में समस्या दूर होने की पुष्टि हुई।'})).data;assert.equal(a.status,'approved');assert.ok(a.history.length>=8);
assert.equal((await action({action:'next'})).status,400);
await stop();await start();await login();const list=(await call('applications')).data;assert.equal(list.find(x=>x.id===id).status,'approved');
assert.equal((await fetch(base+'/')).status,200);
}finally{await stop();await rm(directory,{recursive:true,force:true});}
});
