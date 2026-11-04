import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Readable} from 'node:stream';
test('malformed POST responds 400 and subsequent valid POST stays available',async()=>{
 let source=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
 source=source.replace(/^import .*;\r?\n/gm,'').replace(/^const root =.*;$/m,"const root = '/public';").replace('export const server=','const server=').replace(/^server.listen.*$/m,'');
 let listener;
 const {createContactHandler,createLimiter,handleContactRequest}=await import('../lib/contact.mjs');
 vm.runInNewContext(source,{http:{createServer(fn){listener=fn;}},createContactHandler,createLimiter,handleContactRequest,URL});
 const run=async(url)=>{const req=Readable.from([JSON.stringify({contact:'@someone',task:'Нужен новый сайт',direction:'website'})]);Object.assign(req,{url,method:'POST',headers:{'content-type':'application/json'}});const res={writeHead(status){this.status=status;},end(){}};await listener(req,res);return res.status;};
 assert.equal(await run('//[]'),400);
 assert.equal(await run('/api/contact'),503);
});
test('public contact keeps Telegram and local demo disabled without JavaScript',async()=>{
 const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(html, /<fieldset disabled>/);
 assert.match(html, /данные никуда не отправляются и не сохраняются/);
 const js=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/);
 assert.match(js, /event.preventDefault\(\)/);
 const portable=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(portable, /(?:src|href)="\//);
 assert.doesNotMatch(portable, /<script[^>]+src=|<link[^>]+stylesheet/);
 assert.match(html,/href="https:\/\/t.me\/ChikarAK"/);
});

