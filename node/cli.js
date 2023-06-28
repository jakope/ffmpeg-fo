import ffmpegCommander from './ffmpeg-command-builder-node.js';
import path, { dirname } from 'path';
import fs from 'fs';

function readFilesFromFolder(folderPath) {
    console.log("readFilesFromFolder",folderPath);
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, async (err, files) => {
        if (err) {
          reject(err);
          return;
        }
  
        const fileDetails = [];
  
        for(const file of files){
          const filePath = path.join(folderPath, file);
          const stats = await fs.promises.stat(filePath)
            
            if (err) {
              console.error('Error reading file:', filePath, err);
              return;
            }
  
            if (stats.isFile()) {
                
              const fileExtension = path.extname(file).substring(1); // Remove the dot from the extension
              const fileDetail = {
                filename: path.basename(file, path.extname(file)),
                absolutefilepath: filePath,
                fileextension: fileExtension
              };
              console.log("push",fileDetail);
              fileDetails.push(fileDetail);
            }
        };
        console.log("fileDetails",fileDetails);
        resolve(fileDetails);
      });
    });
  }
//const __dirname = path.parse(inputVideo).dir;

const __dirname = "/Users/janoskoschwitz/src/testfiles";
const outputdirname = `${dirname}/output`;
console.log("__dirname",__dirname);
//const inputVideo = process.argv[2];
//console.log("inputVideo",inputVideo,__dirname);


// ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).scale().outputTo(inputVideo.replace(".mp4","_h264.mp4")).run();

// const commander = ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).stats().then((stats)=>{
//     console.log("then",stats);
//     ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).createThumbnail().outputTo(inputVideo.replace(".mp4",".png")).logCommand().run();
// });

// ffmpegCommander.initialize({ folder : __dirname, autoFindHwaccel : true}).then(()=>{
//     ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).scale().outputTo(inputVideo.replace(".mp4","_hwaccel.mp4")).run();
// })


ffmpegCommander.initialize({ folder : __dirname, autoFindHwaccel : true}).then(async ()=>{
    console.log("hwaccel",ffmpegCommander);
    const videos = await readFilesFromFolder(__dirname + "/videos");
    const images = await readFilesFromFolder(__dirname + "/images");
    
    for (const file of videos) {
        console.log(`start with ${file.filename} format= ${file.fileextension}`);
        await ffmpegCommander.create("FULLHD").addVideoInput(file.absolutefilepath).pad().outputTo(`${outputdirname}/${file.filename}.${file.fileextension}`).run();
        console.log(`end with ${file.filename} format= ${file.fileextension}`);
    }
    for (const file of images) {
        console.log(`start with ${file.filename} format= ${file.fileextension}`);
        await ffmpegCommander.create("FULLHD").addVideoInput(file.absolutefilepath).pad().outputTo(`${outputdirname}/${file.filename}.${file.fileextension}`).run();
        console.log(`end with ${file.filename} format= ${file.fileextension}`);
    }
    console.log("all done");
    //await ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).createFreezeFrame(1,2).scale().outputTo(inputVideo.replace(".mp4","_freeze.mp4")).logCommand().run();
})