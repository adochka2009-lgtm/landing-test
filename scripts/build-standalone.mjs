import fs from 'node:fs';
let html=fs.readFileSync('public/index.html','utf8');
html=html.replace('<link rel="stylesheet" href="/styles.css">',()=>'<style>'+fs.readFileSync('public/styles.css','utf8')+'</style>').replace('<script src="/app.js" defer></script>',()=>'<script>'+fs.readFileSync('public/app.js','utf8')+'</script>');
// Inline script runs after the document is parsed in file mode.
const script=html.match(/<script>[\s\S]*?<\/script>/)[0];html=html.replace(script,'').replace('</body>',script+'</body>');
html=html.replace(/<meta property="og:image"[^>]*>/g,'').replace('href="/favicon.svg"','href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ctext y=%2226%22 font-size=%2228%22%3E↗%3C/text%3E%3C/svg%3E"');
for(const name of ['expert','workspace','agent']) {
 const source=fs.readFileSync('public/cases/'+name+'.html','utf8');
 const main=source.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
 html=html.replace('href="/cases/'+name+'.html"','href="#concept-'+name+'"');
 html=html.replace('</main>','<section id="concept-'+name+'"><details><summary>Подробности концепции: '+({expert:'сайт эксперта',workspace:'рабочее пространство',agent:'ИИ-агент'}[name])+'</summary>'+main.replace(/href="\/(?:#([^"]*))?"/g,(_,id)=>'href="#'+(id||'intro')+'"')+'</details></section></main>');
}
fs.writeFileSync('index.html',html);fs.writeFileSync('portfolio.html',html);
