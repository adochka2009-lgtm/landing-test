export function validateContact(input) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {ok:false,errors:{contact:'invalid'}};
  for (const [field,min,max] of [['contact',3,200],['task',10,3000]]) {
    if (typeof input[field] !== 'string' || input[field].trim().length < min || input[field].trim().length > max) errors[field]='length';
  }
  if (!['unknown','website','app','agent'].includes(input.direction)) errors.direction='invalid';
  if (input.website !== undefined && input.website !== '') errors.website='invalid';
  return {ok:Object.keys(errors).length===0,errors};
}
export function createLimiter({limit=5,windowMs=60000,now=Date.now}={}) {
  const entries=new Map();
  return key=>{
    const time=now();
    for(const [id,entry] of entries) if(time-entry.start>=windowMs) entries.delete(id);
    const entry=entries.get(key)||{start:time,count:0};
    if(entries.size>=10000 && !entries.has(key)) return false;
    entries.set(key,entry);
    return ++entry.count<=limit;
  };
}
export function createContactHandler({deliver,limiter=()=>true,timeoutMs=8000}={}) {
  return async (input,key='local')=>{
    const reply=(status,code)=>({status,body:{ok:status===200,code}});
    if(!limiter(key)) return reply(429,'rate_limited');
    if(!validateContact(input).ok) return reply(400,'invalid_input');
    if(typeof deliver!=='function') return reply(503,'delivery_unavailable');
    let timer;
    try {
      await Promise.race([
        Promise.resolve().then(()=>deliver({contact:input.contact.trim(),task:input.task.trim(),direction:input.direction})),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),timeoutMs);})
      ]);
      return reply(200,'delivered');
    } catch {return reply(503,'delivery_unavailable');}
    finally {clearTimeout(timer);}
  };
}
export async function handleContactRequest(req,res,handler) {
  const send=(status,code)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({ok:status===200,code}));};
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')) return send(400,'invalid_json');
  let size=0;
  const chunks=[];
  try {
    for await(const chunk of req) {
      size+=Buffer.byteLength(chunk);
      if(size>16384) {send(413,'body_too_large');return;}
      chunks.push(Buffer.from(chunk));
    }
    let input;
    try {input=JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch {return send(400,'invalid_json');}
    const result=await handler(input,req.socket?.remoteAddress||'unknown');
    send(result.status,result.body.code);
  } catch {if(!res.headersSent) send(400,'invalid_request');}
}
