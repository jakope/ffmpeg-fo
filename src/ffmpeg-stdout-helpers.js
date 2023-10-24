export const extractDuration = function (str) {
  const whitespaceRegex = /\s*/g;
  const regex = /Duration:(\d{2}):(\d{2}):(\d{2}\.\d{2})/;
  const match = str.replace(whitespaceRegex, '').match(regex);

  if (match !== null) {
    const duration = match[0];
    const durationString = duration.substring(9);
    return {
      duration: durationString,
      durationInSeconds: parseTimeToSeconds(durationString),
    };
  }
  return;
};

export const extractSpeedDatapoint = function (str) {
  const whitespaceRegex = /\s*/g;
  const regex = /speed=(\d+).(\d+)x/;
  const match = str.replace(whitespaceRegex, '').match(regex);

  if (match !== null) {
    let speedString = match[0];

    speedString = speedString.replace('speed=', '').replace('x', '');

    return {
      speedDatapoint: Number(speedString),
    };
  }

  return {
    speedDatapoint: null,
  };
};

export const extractFileStats = function (str) {
  if (str) {
    // Check if it is the Stats Output
    // const inputLineRegex = /Input #0.+/;

    // Find the metadata lines
    const durationLineRegex = /Duration:.+/;
    const videoInputStreamRegex = /Stream #0:0.+: Video:.+/;
    //const audioInputStreamRegex = /Stream #0:1.+: Audio:.+/;
    const whitespaceRegex = /\s*/g;

    // const inputLine = str.match(inputLineRegex);
    const durationLine = str.match(durationLineRegex);
    const videoInputStream = str.match(videoInputStreamRegex);
    // const audioInputStream = str.match(audioInputStreamRegex);

    // Extract Data
    let duration;
    let bitrate;
    let codec;
    let resolution;
    let width;
    let height;
    let fps;

    if (durationLine) {
      const durationRegex = /\d{2}:\d{2}:\d{2}.\d{2}/;
      const bitrateRegex = /(?<=bitrate:)\d+(?=kb\/s)/;
      duration = durationLine[0]
        .replace(whitespaceRegex, '')
        .match(durationRegex);
      bitrate = durationLine[0]
        .replace(whitespaceRegex, '')
        .match(bitrateRegex);
    }

    if (videoInputStream) {
      const codecRegex = /(?<=Video:).+?(?=(,|\(.+\)))/;
      const resolutionRegex = /(?<=,)\d{3,4}x\d{3,4}(?= ?(,|\[.+\]))/;
      const fpsRegex = /(?<=,)\d+\.*\d*(?=fps,)/;
      codec = videoInputStream[0]
        .replace(whitespaceRegex, '')
        .match(codecRegex);
      fps = videoInputStream[0].replace(whitespaceRegex, '').match(fpsRegex);
      resolution = videoInputStream[0]
        .replace(whitespaceRegex, '')
        .match(resolutionRegex);
      if (resolution) {
        width = resolution[0].split('x')[0];
        height = resolution[0].split('x')[1];
      }
    }

    return {
      duration: duration ? parseTimeToSeconds(duration[0]) : null,
      bitrate: bitrate ? Number(bitrate[0]) : null,
      codec: codec ? codec[0] : null,
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      fps: fps ? Number(fps[0]) : null,
      successful: true,
    };
  } else {
    return { successful: false };
  }
};

export const extractTime = function (str) {
  const whitespaceRegex = /\s*/g;
  const regex = /time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/;
  const match = str.replace(whitespaceRegex, '').match(regex);
  if (match !== null) {
    const duration = match[0];
    return duration.substring(5);
  }
  return;
};

export const parseTimeToSeconds = (timestamp) => {
  if (typeof timestamp === 'number') {
    return timestamp;
  }

  let parts = timestamp.split(':');
  let seconds = 0;
  if (parts.length === 3) {
    seconds =
      parseInt(parts[0]) * 60 * 60 +
      parseInt(parts[1]) * 60 +
      parseFloat(parts[2]);
  } else if (parts.length === 2) {
    seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  } else {
    seconds = parseFloat(parts[0]);
  }
  return seconds;
};

export const formatSecondsAsTime = function (secondsToFormat) {
  const totalSeconds = Math.floor(secondsToFormat);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateProgress = function (
  currentTime,
  duration,
  speedDatapoints = []
) {
  const currentSeconds = parseTimeToSeconds(currentTime);
  const durationSeconds = parseTimeToSeconds(duration);
  const progress = currentSeconds / durationSeconds;
  const estimatedTimeRemaining =
    (durationSeconds - currentSeconds) * (1 / progress);
  const progressPercentage = progress * 100;

  const speedAverage =
    speedDatapoints.reduce((a, b) => a + b, 0) / speedDatapoints.length;

  return {
    progress: progressPercentage.toFixed(2),
    estimatedTimeRemaining: formatSecondsAsTime(estimatedTimeRemaining),
    speedAverage: speedAverage,
  };
};

export default {
  extractDuration,
  extractSpeedDatapoint,
  extractTime,
  parseTimeToSeconds,
  formatSecondsAsTime,
  calculateProgress,
  extractFileStats,
};
