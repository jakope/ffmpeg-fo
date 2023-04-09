export const testHardwareAcceleration = async function(runFFMPEGCommandCallback, pathToStoreTestFiles = "./"){
    console.log("start testing");
    const inputFilePath = `${pathToStoreTestFiles}/test.mov`;
    const outputFilePath = `${pathToStoreTestFiles}/out`;
    //const answer = await run(`-y -f lavfi -i testsrc -t 1 -c:v prores_ks -profile:v 3 -pix_fmt yuv422p10le -vf "scale=1920:1080" ${inputFilePath}`);

    const createTestVideoResponse = await run(`-y  -f lavfi -i testsrc -t 1 -c:v prores_ks -profile:v 1 -pix_fmt yuv422p10le -vf "scale=1280:720" ${inputFilePath}`);
    console.log("createTestVideoResponse",createTestVideoResponse);
    //return;
    // Specify the video codec to use for encoding
    const videoCodec = 'h264';
    console.log("start testing");
  // Specify the hardware acceleration methods to test
const hardwareAccelerationMethods = [
  'cuda',
  'qsv',
  'vaapi',
  'dxva2',
  'amf',
  'videotoolbox',
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