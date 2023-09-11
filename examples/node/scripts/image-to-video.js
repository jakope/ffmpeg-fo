
import ffmpegCommander from '../ffmpeg-command-builder-node.js';
const inputImage = process.argv[2] || "path/to/input.jpg";
ffmpegCommander.initialize({ autoFindHwaccel : true}).then(async ()=>{
    const outputFilePath = process.argv[3] || ffmpegCommander.folder + "/output.mp4";
    await ffmpegCommander.create("FULLHD").addImageInput(inputImage).scale().outputTo(outputFilePath).run();
});