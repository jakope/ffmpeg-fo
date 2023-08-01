export const extractDuration = function(str){
    const regex = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/;
    const match = regex.exec(str);
if (match !== null) {
  const duration = match[0];
  const durationString = duration.substring(10);
  return {
    duration : durationString,
    durationInSeconds : parseTimeToSeconds(durationString)
  }
  
}
return;
}
export const extractTime = function(str){
    const regex = /time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/;
const match = regex.exec(str);
if (match !== null) {
  const duration = match[0];
  return duration.substring(5);
}
return;
}

export const parseTimeToSeconds = (timestamp) => {
  let parts = timestamp.split(':');
  let seconds = 0;
  if (parts.length === 3) {
      seconds = parseInt(parts[0]) * 60 * 60 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  } else {
      seconds = parseFloat(parts[0]);
  }
  return seconds;
}
  
  export const formatSecondsAsTime = function(secondsToFormat) {
    const totalSeconds = Math.floor(secondsToFormat);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  export const calculateProgress = function(currentTime, duration) {
    const currentSeconds = parseTimeToSeconds(currentTime);
    const durationSeconds = parseTimeToSeconds(duration);
    const progress = currentSeconds / durationSeconds;
    const estimatedTimeRemaining = (durationSeconds - currentSeconds) * (1 / progress);
    const progressPercentage = progress * 100;
    return {
      progress: progressPercentage.toFixed(2),
      estimatedTimeRemaining: formatSecondsAsTime(estimatedTimeRemaining)
    };
  }

  export default {
    extractDuration,
    extractTime,
    parseTimeToSeconds,
    formatSecondsAsTime,
    calculateProgress
  }