export const hardwareAccelerationMethods = [
  'nvenc',
  'qsv',
  'vaapi',
  'dxva2',
  'amf',
  'videotoolbox',
  'omx', //android or rasberry py
  'mediacodec', //android
];
export const testHardwareAcceleration = async function (
  runFFMPEGCommandCallback,
  pathToStoreTestFiles = './',
  fileExistsCallback
) {
  const inputFilePath = `${pathToStoreTestFiles}/test.mov`;
  const outputFilePath = `${pathToStoreTestFiles}/out`;
  const createTestVideoResponse = await runFFMPEGCommandCallback(
    `-y -f lavfi -i testsrc=duration=5:size=1920x1080:rate=30 -pix_fmt yuv420p -t 1`
      .split(' ')
      .concat(inputFilePath)
  );
  const videoCodec = 'h264';
  const performanceResults = {};
  let responses = [];
  for (let hardwareMethod of hardwareAccelerationMethods) {
    console.log(`Test ${hardwareMethod}`);
    // Construct the FFmpeg command to test the hardware acceleration method
    let command = [
      '-y',
      `-i`,
      `${inputFilePath}`,
      `-c:v`,
      `${videoCodec}_${hardwareMethod}`,
      `-profile:v`,
      `main`,
      `${outputFilePath}_${hardwareMethod}.mp4`,
    ];

    if (hardwareMethod === 'mediacodec') {
      command = [
        '-y',
        `-i`,
        `${inputFilePath}`,
        `-c:v`,
        `${videoCodec}_${hardwareMethod}`,
        `${outputFilePath}_${hardwareMethod}.mp4`,
      ];
    }

    // const start = new Date();
    let response = await runFFMPEGCommandCallback(command, null, false);
    response.outputFileExists = await fileExistsCallback(
      `${outputFilePath}_${hardwareMethod}.mp4`,
      `out_${hardwareMethod}.mp4`
    );
    responses.push({
      ...response,
      hardwareMethod: `${videoCodec}_${hardwareMethod}`,
    });
  }

  return responses
    .filter((response) => {
      return response.outputFileExists;
    })
    .map((response) => response.hardwareMethod);
};
