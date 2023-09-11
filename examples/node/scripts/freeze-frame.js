import ffmpegCommander from '../ffmpeg-command-builder-node.js';
const inputVideo = process.argv[2] || "path/to/input.mp4";
ffmpegCommander.initialize({ autoFindHwaccel : true}).then(async ()=>{
    const outputFilePath = process.argv[3] || ffmpegCommander.folder + "/output.mp4";
    const start = process.argv[4] || "00:00:01";
    const duration = process.argv[5] || "00:00:03";
    await ffmpegCommander.create("HDREADY").addVideoInput(inputVideo).createFreezeFrame(start,duration).outputTo(outputFilePath).run();
});