import ffmpegCommander from './ffmpeg-command-builder-node.js';
const inputVideo = process.argv[2];
console.log("inputVideo",inputVideo);
ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).outputTo(inputVideo.replace(".mp4","_janos.mp4")).execute();