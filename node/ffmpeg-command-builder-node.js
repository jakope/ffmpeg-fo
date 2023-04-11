import {execa} from 'execa';
import pathToFfmpeg from 'ffmpeg-static';
import CommandBuilder from '../src/ffmpeg-command-builder.js';
import { Writable } from 'stream'
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
const __dirname = new URL('.', import.meta.url).pathname;

export default class CommandBuilderNode extends CommandBuilder{
    constructor(){
        super(...arguments);
    }
    static folder = __dirname; // overwrite me
    static async createFile(outputFilepath,data){
        await fs.promises.writeFile(outputFilepath, data);
    };
    static async createFolder(outputFilepath){
        const folder = path.dirname(outputFilepath);
        await fs.promises.mkdir(folder, { recursive: true });
        return folder;
    };
    static async deleteFile(outputFilepath){
        await fs.promises.rm(outputFilepath, { recursive: true });
    };
    static async deleteFolder(outputFilepath){
        const folder = path.dirname(outputFilepath);
        await fs.promises.rm(folder + "/*", { recursive: true });
    };
    static async execute (command, self) {
        
        let error, success;
        try {
            const myWriteStream = new Writable({
                write(data, encoding, callback) {
                    const str = data.toString();
                    if(self){
                        self.processStdOut(str);
                    }
                    callback();
                }
              });  
            const childProcess = execa(`${pathToFfmpeg}`, command, { all: true, stdout : "pipe"  }).pipeAll(myWriteStream)
            const answer = await childProcess;
                return {
                    ...answer,
                    success : true,
                    error : false
                }
            
        } catch (err) {
         error = err;   
         success = false;
        }
        return {
            success,
            error
        }
    }
}