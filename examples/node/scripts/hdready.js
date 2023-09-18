import ffmpegCommander from '../ffmpeg-command-builder-node.js';
const inputVideo = process.argv[2] || 'path/to/input.mp4';
ffmpegCommander.initialize({ autoFindHwaccel: true }).then(async () => {
  const outputFilePath =
    process.argv[3] || ffmpegCommander.folder + '/output.mp4';
  await ffmpegCommander
    .create('HDREADY')
    .addVideoInput(inputVideo)
    .scale()
    .pad()
    .outputTo(outputFilePath)
    .run();
});
