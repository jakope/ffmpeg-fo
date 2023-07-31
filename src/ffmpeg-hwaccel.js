export const testHardwareAcceleration = async function(runFFMPEGCommandCallback, pathToStoreTestFiles = "./", fileExistsCallback){
  const inputFilePath = `${pathToStoreTestFiles}/test.mov`;
  const outputFilePath = `${pathToStoreTestFiles}/out`;
  const createTestVideoResponse = await runFFMPEGCommandCallback(`-y -f lavfi -i testsrc=duration=5:size=1920x1080:rate=30 -pix_fmt yuv420p -t 1`.split(" ").concat(inputFilePath));
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
const command = ["-y","-hwaccel",`${hardwareMethod}`,`-i`,`${inputFilePath}`,`-c:v`,`${videoCodec}_${hardwareMethod}`,`-profile:v`,`main`,`${outputFilePath}_${hardwareMethod}.mp4`];

// const start = new Date();
let response = await runFFMPEGCommandCallback(command);
response.outputFileExists  = await fileExistsCallback(`${outputFilePath}_${hardwareMethod}.mp4`);
console.log("createTestVideoResponse", response);
// if(response.success && response.all){
//   const end = new Date();
//   const elapsedTime = end - start;
//   const hardwareUsed = response.all.includes(`using ${hardwareMethod} hardware acceleration`);
//   performanceResults[hardwareMethod] = { elapsedTime, hardwareUsed };
//   console.log(`${hardwareMethod}: ${elapsedTime}ms, hardware used: ${hardwareUsed}`);
// }
return {...response, hardwareMethod : `${videoCodec}_${hardwareMethod}` };
}));
return responses.filter((response)=>{ return response.success && response.outputFileExists }).map(response => response.hardwareMethod);
}