import { sendText } from './controller.js';
import fs from 'fs';
import path from 'path';

const COMMAND_FILE = path.resolve(process.cwd(), 'scripts', 'senciencia', 'senc_command.txt');

async function test(){
  console.log('Sending test text to controller (writes command file)');
  sendText('Teste automático do daemon - mensagem de prova');
  if(fs.existsSync(COMMAND_FILE)){
    const txt = fs.readFileSync(COMMAND_FILE,'utf8');
    console.log('Command file content:', txt);
    // cleanup
    fs.unlinkSync(COMMAND_FILE);
    console.log('Cleaned command file');
  } else {
    console.log('Command file not found');
  }
}

test();
