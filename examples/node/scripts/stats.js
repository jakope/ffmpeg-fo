import ffmpegCommander from '../ffmpeg-command-builder-node.js';
const inputVideo = process.argv[2] || "path/to/input.mp4";
ffmpegCommander.initialize({ autoFindHwaccel : true}).then(async ()=>{
    const stats = await ffmpegCommander.create("FULLHD").runStats(inputVideo);
    console.log("status",stats);
});


//ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).createThumbnail().outputTo(inputVideo.replace(".mp4",".png")).logCommand().run();