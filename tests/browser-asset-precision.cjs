// Run against the built app served on 127.0.0.1:18373.
// Synthetic wallet only; external HTTP is intercepted and no real signing occurs.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const artifacts=process.env.BROWSER_ARTIFACT_DIR || '/tmp/beam-2173-browser-artifacts';
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
 for (const [legacyRatio,width] of [['2',1280],['0',768],[null,1280],['100000000',1280]]) {
 const context=await browser.newContext({viewport:{width,height:1000}});
 await context.route('**/*',route=>{
  if(route.request().url().startsWith('http://127.0.0.1:18373/')) return route.continue();
  return route.fulfill({contentType:'application/json',body:'{}'});
 });
 await context.addInitScript((legacyRatio)=>{
  window.requests=[];
  let callback;
  window.BeamApi={
   callWalletApiResult: fn=>{callback=fn;},
   callWalletApi:(id,method,params)=>{
    window.requests.push({id,method,params});
    let result={};
    if(method==='invoke_contract'){
     const args=params.args;
     let output={res:[]};
     if(args.includes('action=view_all_assets')) output={res:[{aid:123,metadata:'STD:SCH_VER=1;N=Legacy;SN=LEG;UN=Legacy;NTHUN=small;'+(legacyRatio === null ? '' : 'NTH_RATIO='+legacyRatio+';'),mintedLo:200000000,mintedHi:0,owner_pk:'test',height:1}]};
     if(args.includes('action=view_token')) output={res:{limitLo:10000000000,limitHi:0}};
     result={output:JSON.stringify(output),raw_data:'synthetic-invoke-data'};
    }
    if(method==='process_invoke_data') result={txid:'synthetic-only'};
    setTimeout(()=>callback(JSON.stringify({jsonrpc:'2.0',id,result})),0);
   }
  };
  window.addEventListener('message',e=>{
   if(e.data?.type==='create_beam_api') window.postMessage('apiInjected',window.origin);
  });
 },legacyRatio);
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18373/');
 await page.getByRole('button',{name:'create asset',exact:true}).click();
 await page.getByRole('textbox',{name:'Decimal places (fixed)'}).waitFor();
 const precision=page.locator('[name=decimal_places]');
 assert.equal(await precision.isDisabled(),true);assert.equal(await precision.inputValue(),'8');
 for(const [name,value] of Object.entries({asset_name:'Example',unit_name:'EXAMPLE',short_name:'EX',sm_unit_name:'SMALLEST',limit:'100'})) await page.locator(`[name=${name}]`).fill(value);
 await page.getByRole('button',{name:'show registration command'}).click();
 await page.getByText(/\.\/beam-wallet asset_reg/).waitFor();
 const command=await page.getByText(/\.\/beam-wallet asset_reg/).textContent();
 assert.match(command,/NTH_RATIO=100000000;/);
 await page.locator('[name=short_descr]').fill('Bad;NTH_RATIO=2');
 await page.getByText('Semicolons are not allowed in metadata values').waitFor();
 assert.equal(await page.locator('button.create-asset').isDisabled(),true);
 assert.equal(await page.getByText(/\.\/beam-wallet asset_reg/).count(),0);
 await page.locator('[name=short_descr]').fill('Good description');
 await page.waitForFunction(()=>!document.querySelector('button.create-asset').disabled);
 await page.screenshot({path:path.join(artifacts,`create-${legacyRatio}-${width}.png`),fullPage:true});
 await page.locator('button.create-asset').click();
 await page.waitForFunction(()=>window.requests.some(r=>r.method==='process_invoke_data'));
 const writes=await page.evaluate(()=>window.requests.filter(r=>r.method==='invoke_contract'&&r.params.args.includes('action=create_token')));
 assert.equal(writes.length,1);assert.match(writes[0].params.args,/NTH_RATIO=100000000;/);assert.match(writes[0].params.args,/limit=10000000000,/);
 await page.getByText('Legacy',{exact:true}).first().click();
 await page.getByText('Declared ratio (metadata only)').waitFor();
 const row=page.locator('.row').filter({has:page.getByText('Declared ratio (metadata only)',{exact:true})});
 assert.equal((await row.locator('.value').textContent()).trim().startsWith(legacyRatio ?? 'Not specified'),true);
 assert.match(await page.locator('.row').filter({has:page.getByText('Minted amount',{exact:true})}).textContent(),/2/);
 await page.screenshot({path:path.join(artifacts,`details-${legacyRatio}-${width}.png`),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pass:true,legacyRatio,width,checks:['disabled 8 decimals','fixed CLI metadata','separator injection refused','wallet request fixed ratio and unchanged supply conversion','legacy ratio retained, amounts not rescaled'],walletWrites:writes,errors},null,2));
 await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
