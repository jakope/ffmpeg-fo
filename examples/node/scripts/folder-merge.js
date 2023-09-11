import ffmpegCommander from '../ffmpeg-command-builder-node.js';
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
          if(file.startsWith(".")){
            continue;
          }
          const stats = await fs.promises.stat(filePath)
            if (err) {
              console.error('Error reading file:', filePath, err);
              continue;
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

const inputVideoFolder = process.argv[2] || "path/to/";
const outputPath = process.argv[3] || ffmpegCommander.folder + "/output.mp4";
const outputdirname = path.dirname(outputPath);

ffmpegCommander.initialize({ autoFindHwaccel : true}).then(async ()=>{
    const videos = await readFilesFromFolder(inputVideoFolder);
    const videoToMerge = [];
    
    for(let i = 0; i < videos.length; i++){
      let file = videos[i];
      const outputFileName = `${outputdirname}/${i}.mp4`
      await ffmpegCommander.create("FULLHD").addVideoInput(file.absolutefilepath).pad().outputTo(outputFileName).run();
      videoToMerge.push(outputFileName);
    }
    console.log("videoToMerge",videoToMerge);
    await ffmpegCommander.create("FULLHD").merge(videoToMerge).outputTo(outputPath).run();
    console.log("all done");
    
})