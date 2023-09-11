import {execa} from 'execa';
import pathToFfmpeg from 'ffmpeg-static';
import CommandBuilder from '../../src/ffmpeg-command-builder.js';
import { Writable } from 'stream'
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
const outputFolder = new URL('.', import.meta.url).pathname + "/output";

export default class CommandBuilderNode extends CommandBuilder{
    constructor(){
        super(...arguments);
    }
    static folder = outputFolder; // overwrite me
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
    static async fileExists(outputFilepath){
        return fs.existsSync(outputFilepath);
    };
    static async execute(command, self) {
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
            const abortController = new AbortController();
            const childProcess = execa(`${pathToFfmpeg}`, command, { all: true, stdout : "pipe", signal: abortController.signal }).pipeAll(myWriteStream);
            if(self){
                self.cancel = ()=>{
                    abortController.abort();
                };
            }
            const answer = await childProcess;
                return {
                    ...answer,
                    success : true,
                    error : false
                }
            
        } catch (err) {
            if(self){
                console.log("catch",err.all);
            }
         error = err;   
         success = false;
        }
        return {
            success,
            error
        }
    }
    static async storeSettings(name,data){
        console.log("storeSettings",)
        const filePath = this.folder + "/" + name + ".txt";
        await this.createFile(filePath,data);
        return true;
    }
    static async loadSettings(name){
        console.log("loadSettings",name);
        const filePath = this.folder + "/" + name + ".txt";
        if(!fs.existsSync(filePath)){
            console.log("loadSettings file does not exist");
            return false;
        }
        return await fs.promises.readFile(filePath,"utf8");
    }
}