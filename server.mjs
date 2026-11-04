import {createContactHandler, createLimiter, handleContactRequest} from './lib/contact.mjs';
import http from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = await realpath(fileURLToPath(new URL('./public/', import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2'};
const contactHandler=createContactHandler({limiter:createLimiter()});
export const server=http.createServer(async(req,res)=>{
 let url;
 try {url=new URL(req.url,'http://localhost');} catch {res.writeHead(400,{'Cache-Control':'no-store'});return res.end('Invalid request target');}
 if(req.method==='POST' && url.pathname==='/api/contact') return handleContactRequest(req,res,contactHandler);
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
 try{
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('\\')||pathname.includes('\0'))throw new Error();
  const file=await realpath(path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname)));
  if(!file.startsWith(root+path.sep))throw new Error();
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Не найдено');}
});
server.listen(Number(process.env.PORT)||3000,'127.0.0.1');

