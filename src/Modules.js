import readline from 'readline';
import fs from 'fs';
import path from "path";


function support_message() {
  console.log(`
  ⭐ If you find this module useful, consider supporting me! ⭐
  💖 Patreon:       : https://patreon.com/Tgthegood52
  `);
}

function sleep_seconds(s) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
};

function sleep_miliseconds(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function input_number(message = "Ingresa un número: ") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(`${message} `, (respuesta) => {
      rl.close();
      resolve(Number(respuesta));
    });
  });
}

function divide_text_by_size(chapters, maxKB=100, flag=false) {
  let i = 1
  const chapters_divide = chapters.split("Tgthegood")
  const maxBytes = maxKB * 1024;
  const chunks = [];
  let buffer = '';

  for (const chapter of chapters_divide) {
    if(chapter.length == 0){
      continue;
    }

    if(flag){
      if (Buffer.byteLength(buffer + chapter, 'utf8') > maxBytes) {
        chunks.push(buffer);
        buffer = "\n" + `Tgthegood ${i}` + "\n" + chapter;
      } else {
        buffer += "\n" + `Tgthegood ${i}` + "\n" + chapter;
      }
      chapter.trim()!=="© WebNovel"||chapter.trim()!=="" ? i+=1 : null;
    } else {
      if (Buffer.byteLength(buffer + chapter, 'utf8') > maxBytes) {
        chunks.push(buffer);
        buffer = chapter;
      } else {
        buffer += chapter;
      }
      chapter.trim()!=="© WebNovel" ? i+=1 : null;
    }
  }
  if (buffer.length > 0) {
    chunks.push(buffer);
  }

  return chunks;
}

async function save_text(content, folderPath, fileName) {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    const fullPath = path.join(folderPath, `${fileName}`);
    await fs.promises.writeFile(fullPath, content, 'utf8');

  } catch (error) {
    console.error('File saved on:', error);
  }
};

function text_kb_size(text) {
  const bytes = Buffer.byteLength(text, 'utf8');
  return +(bytes / 1024).toFixed(2);
}

function eliminate_tgthegood(text){
  let new_text = text.split('\n');
  let return_text = ""

  new_text.forEach(element => {
    if(element == "Tgthegood"){
    } else{
      return_text+=element+"\n";
    }
  });

  return return_text;
}

export {
    sleep_seconds,
    sleep_miliseconds,
    input_number,
    divide_text_by_size,
    save_text,
    text_kb_size,
    eliminate_tgthegood,
    support_message
}