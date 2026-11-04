import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, createContactHandler } from '../lib/contact.mjs';
const valid = {contact:'@someone',task:'Нужен новый сайт',direction:'website',website:''};
test('contact and task boundary lengths',()=>{
 for(const [field, lengths] of Object.entries({contact:[2,3,200,201],task:[9,10,3000,3001]})) {
  for(const n of lengths) assert.equal(validateContact({...valid,[field]:'x'.repeat(n)}).ok, n>=lengths[1] && n<=lengths[2]);
 }
 assert.equal(validateContact(valid).ok,true);
 assert.equal(validateContact({...valid,direction:'bad'}).ok,false);
 assert.equal(validateContact({...valid,website:'spam'}).ok,false);
});
test('delivery statuses and confirmed payload',async()=>{
 assert.equal((await createContactHandler() (valid)).status,503);
 assert.equal((await createContactHandler({deliver:async()=>{throw Error('secret')}})(valid)).status,503);
 assert.equal((await createContactHandler({deliver:()=>new Promise(()=>{}),timeoutMs:5})(valid)).status,503);
 assert.equal((await createContactHandler({deliver:async()=>{},limiter:()=>false})(valid)).status,429);
 let received;
 const handler=createContactHandler({deliver:async data=>{received=data}});
 assert.equal((await handler({...valid,contact:'  @someone  '})).status,200);
 assert.deepEqual(received,{contact:'@someone',task:valid.task,direction:'website'});
 assert.equal((await handler({...valid,task:'x'})).status,400);
});
import { Readable } from 'node:stream';
import { createLimiter, handleContactRequest } from '../lib/contact.mjs';
test('bounded rate window',()=>{
 let now=0;
 const limiter=createLimiter({limit:1,windowMs:10,now:()=>now});
 assert.equal(limiter('a'),true);assert.equal(limiter('a'),false);
 now=10;assert.equal(limiter('a'),true);
});
test('HTTP adapter validates body, type and delivery status',async()=>{
 const run=async(body,type='application/json',handler=createContactHandler())=>{
  const req=Readable.from([Buffer.from(body)]);req.headers={'content-type':type};req.socket={remoteAddress:'test'};
  const res={writeHead(status){this.status=status;this.headersSent=true;},end(body){this.body=JSON.parse(body);}};
  await handleContactRequest(req,res,handler);return res;
 };
 assert.equal((await run('{')).status,400);
 assert.equal((await run('{}','text/plain')).status,400);
 assert.equal((await run('x'.repeat(16385))).status,413);
 assert.equal((await run(JSON.stringify(valid))).status,503);
 assert.equal((await run(JSON.stringify(valid),'application/json',createContactHandler({deliver:async()=>{}}))).status,200);
});
