import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SESSION_ID=/^session-[a-f0-9]{16}$/;

export class SessionStore {
  constructor(baseDir=process.env.PSB_HARNESS_STATE_DIR||path.join(os.homedir(),'.project-second-brain','harness-state')) {
    this.baseDir=path.resolve(baseDir);
    fs.mkdirSync(this.baseDir,{recursive:true,mode:0o700});
  }
  assertId(id){if(typeof id!=='string'||!SESSION_ID.test(id)) throw new Error('invalid harness session id');}
  file(id){this.assertId(id);return path.join(this.baseDir,`${id}.json`);}
  exists(id){return fs.existsSync(this.file(id));}
  load(id){
    const file=this.file(id);
    if(!fs.existsSync(file)) throw new Error(`unknown harness session: ${id}`);
    return JSON.parse(fs.readFileSync(file,'utf8'));
  }
  create(session){
    const file=this.file(session.session_id);
    if(fs.existsSync(file)) return {created:false,session:this.load(session.session_id)};
    this.atomicWrite(file,session);
    return {created:true,session};
  }
  save(session){const file=this.file(session.session_id);this.atomicWrite(file,session);return session;}
  atomicWrite(file,value){
    const tmp=`${file}.${process.pid}.${Date.now()}.tmp`;
    const data=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(tmp,data,{encoding:'utf8',mode:0o600,flag:'wx'});
    try{fs.renameSync(tmp,file);}catch(err){try{fs.unlinkSync(tmp);}catch{}throw err;}
    try{fs.chmodSync(file,0o600);}catch{}
  }
}

export function defaultStateDirectory(){return process.env.PSB_HARNESS_STATE_DIR||path.join(os.homedir(),'.project-second-brain','harness-state');}
