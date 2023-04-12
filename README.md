Fluent-ffmpeg is awesome. But for beginnners it's an overhead. If you just to transcode a video to mp4 use best practices for Resolution, Bitrate, FPS, etc AND use hardware acceleration without any knowledge about encoders like videotoolbox, cuda, etc. you can use this library. 

It's plain JS, so you can also use this ffmpeg command builder to use it in hypbrid environments like capacitor, cordoa, etx. 

Examples for nodejs

Initialize with Hardware Acceleration (if possivble)

```
import ffmpegCommander from '@jakope/beginner-ffmpeg/node/ffmpeg-command-builder-node.js';
const folder = "Any/Path/To/Write/Temporary_Files";
ffmpegCommander.initialize({ folder, autoFindHwaccel : true});
```
That's it. ffmpegCommander will iterate over common hwaccel methods by testing the method. If it works, the first codec will be used.

Convert a Video to mp4 to FULLD without changing the aspect ratio
```
import ffmpegCommander from '@jakope/beginner-ffmpeg/node/ffmpeg-command-builder-node.js';
const inputVideoPath = "Any/Path/To/A/video.mov"
const outputVideoPath = "Any/Path/To/A/video_converted.mp4"

ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).scale().outputTo(outputVideoPath).run();
```

Convert a Video to mp4 to FULLD with changing the aspect ration by adding a black Line on the left and right if neccessary;
You will get a video with exactly 1920px width and 1080 pixel height;
```
import ffmpegCommander from '@jakope/beginner-ffmpeg/node/ffmpeg-command-builder-node.js';
const inputVideoPath = "Any/Path/To/A/video.mov"
const outputVideoPath = "Any/Path/To/A/video_converted.mp4"

ffmpegCommander.create("FULLHD").addVideoInput(inputVideo).pad().outputTo(outputVideoPath).run();
```
