export const testHardwareAcceleration = async function(runFFMPEGCommandCallback, pathToStoreTestFiles = "./"){
    console.log("start testing");
    const inputFilePath = `${pathToStoreTestFiles}/test.mov`;
    const outputFilePath = `${pathToStoreTestFiles}/out`;
    console.log("runFFMPEGCommandCallback",runFFMPEGCommandCallback);
    console.log("inputFilePath",inputFilePath,outputFilePath);
    const createTestVideoResponse = await runFFMPEGCommandCallback(`-y -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 -pix_fmt yuv420p -t 1`.split(" ").concat(inputFilePath));
    console.log("createTestVideoResponse",createTestVideoResponse);
    const videoCodec = 'h264';
  const hardwareAccelerationMethods = [
  'nvenc',
  'qsv',
  'vaapi',
  'dxva2',
  'amf',
  'videotoolbox',
  'omx', //android or rasberry py
];
const performanceResults = {};
const responses = await Promise.all(hardwareAccelerationMethods.map(async (hardwareMethod) => {
  console.log(`Test ${hardwareMethod}`);
  // Construct the FFmpeg command to test the hardware acceleration method
  const command = `-y -hwaccel ${hardwareMethod} -i ${inputFilePath} -c:v ${videoCodec}_${hardwareMethod} -profile:v main ${outputFilePath}_${hardwareMethod}.mp4`;
  const start = new Date();
  const response = await runFFMPEGCommandCallback(command);
  if(response.success){
    const end = new Date();
    const elapsedTime = end - start;
    const hardwareUsed = response.stdout.includes(`using ${hardwareMethod} hardware acceleration`);
    performanceResults[hardwareMethod] = { elapsedTime, hardwareUsed };
    console.log(`${hardwareMethod}: ${elapsedTime}ms, hardware used: ${hardwareUsed}`);
  }
  return {...response, hardwareMethod : `${videoCodec}_${hardwareMethod}` };
}));
return responses.filter((response)=>response.success).map(response => response.hardwareMethod);
}