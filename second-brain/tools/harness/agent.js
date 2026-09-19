#!/usr/bin/env node
const readline=require('readline');
const {handleRequest}=require('./lib/agent-protocol');

const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',line=>{
  if(!line.trim()) return;
  let request=null;
  try{
    request=JSON.parse(line);
    const result=handleRequest(request);
    process.stdout.write(JSON.stringify({protocol_version:1,request_id:request.request_id||null,operation:request.operation,ok:true,result})+'\n');
  }catch(error){
    process.stdout.write(JSON.stringify({protocol_version:1,request_id:request&&request.request_id||null,operation:request&&request.operation||null,ok:false,error:{message:error.message}})+'\n');
  }
});
