import ffmpegStandardResolutions from './ffmpeg-resolutions.js';
import ffmpegStdoutHelper from './ffmpeg-stdout-helpers.js';
import { testHardwareAcceleration } from './ffmpeg-hwaccel.js';
export default class CommandBuilder {
  // Static properties for default settings and configurations.
  static findCodex;
  static videocodex = 'h264'; // Default video codec. (libx264)
  static possibleCodex = ['h264']; // List of possible codecs.
  static profiles = ffmpegStandardResolutions; // Imported standard resolutions.
  static folder; // Static folder path for file operations.

  // Static methods to override and adapt to use cases.
  // Static method to execute a given FFmpeg command.
  static execute(command) {
    console.log('static shit');
  }

  // Static methods for file and folder operations (currently empty implementations).
  static createFile() {}
  static createFolder() {}
  static deleteFile() {}
  static deleteFolder() {}

  // Instance properties for tracking the state of video and audio reencoding and general readiness.
  reencodeVideoIsReady = false;
  reencodeAudioIsReady = false;
  isReady = false;

  // Tracks if any input has been added to the command.
  hasAnyInput = false;

  videocodexToUse; // The video codec to be used for the current instance.

  // Various properties for configuring the FFmpeg command.
  profile; // The video profile (resolution, etc.).
  inputPath; // Path of the input file.
  outputPath; // Path for the output file.
  exportType = 'video'; // Type of export (video, image, etc.).
  headerLogs = ''; // Stores FFmpeg header logs.

  speedDatapoints = []; // Array to store speed data points for speed calculation.

  eventName = null; // Optional event name for tracking.

  // Filters and settings for video processing.
  videoFilter = [];
  filterComplex1 = '';
  filterComplex2 = '';
  overlayInputIndex = 0; // Index for overlay inputs.

  // Components of the FFmpeg command.
  command = []; // Main command array.
  commandBeforeInput = []; // Commands to be added before input file.
  commandAfterCodex = []; // Commands to be added after codec specification.

  // Properties for tracking the progress and quality of the encoding process.
  duration;
  bitrate;
  progress;

  constructor(profileName, options = {}) {
    this.videocodexToUse = options.videocodex || this.videocodex;

    if (options.progressEventName) {
      this.progressEventName = options.progressEventName;
    }

    if (profileName) {
      this.setProfile(profileName);
    }

    this.onProgressFn = () => {};
    this.onErrorFn = () => {};
  }

  cancel() {
    console.log('cancel execute here');
  }

  onProgress(onProgress) {
    this.onProgressFn = onProgress;
    return this;
  }

  onError(onError) {
    this.onErrorFn = onError;
    return this;
  }

  handleProgress = (event) => {
    this.onProgressFn({ percentage: event.progress });

    return this;
  };

  getFolder() {
    return CommandBuilder.folder;
  }

  static async fileExists() {}

  async createTestVideo() {}

  static async storeSettings(name, data) {}
  static async loadSettings(name) {}

  static async initialize(options = {}) {
    options.profiles && (this.profiles = options.profiles);
    options.videocodex && (this.videocodex = options.videocodex);
    options.folder && (this.folder = options.folder);
    options.folderAsync && (this.folder = await options.folderAsync);
    if (options.forceAutoFindHwaccel) {
      options.autoFindHwaccel = true;
    }
    if (this.folder && options.autoFindHwaccel) {
      if (
        !options.forceAutoFindHwaccel &&
        (await this.loadSettings('videocodex'))
      ) {
        this.videocodex = await this.loadSettings('videocodex');
        this.possibleCodex = await this.loadSettings('possibleCodex');
      } else {
        const codex = await testHardwareAcceleration(
          this.execute,
          this.folder,
          this.fileExists
        );

        this.possibleCodex = this.possibleCodex.concat(codex);
        if (codex.length > 0) {
          this.videocodex = codex[0];
          this.storeSettings('videocodex', this.videocodex);
          this.storeSettings('possibleCodex', this.possibleCodex);
        }
      }
    }
    options.execute && (this.execute = options.execute);
    options.createFolder && (this.createFolder = options.createFolder);
    options.createFile && (this.createFile = options.createFile);
    options.deleteFolder && (this.deleteFolder = options.deleteFolder);
    options.deleteFile && (this.deleteFile = options.deleteFile);
    return this.videocodex;
  }

  static create(profileName = 'FULLHD', forceCodex) {
    const codex = forceCodex || this.videocodex;
    console.log('ffmpeg CommandBuilder created with codex', codex);
    return new this(profileName, { videocodex: codex });
  }

  async run() {
    !this.isReady && this.finalizeCommand();

    try {
      let commandArray = this.toArray();
      if (this.mergeFileText) {
        console.log('mergeFileText', this.mergeFileText);
        await this.constructor.createFile(
          this.constructor.folder + '/merge.txt',
          this.mergeFileText
        );

        commandArray[
          this.toArray().findIndex((command) => {
            return command == '###MERGEPATH###';
          })
        ] = this.constructor.folder + '/merge.txt';
      }

      const answer = await this.constructor.execute(commandArray, this);

      console.log('CommandArray CB After Execute', answer, commandArray);

      const speedAverage =
        this.speedDatapoints.reduce((a, b) => a + b, 0) /
        this.speedDatapoints.length;

      this.setProgress({
        progress: 100,
        estimatedTimeRemaining: '00:00:00',
        speedAverage: speedAverage,
      });

      return answer;
    } catch (error) {
      this.onErrorFn(error);
    }
  }

  finalizeCommand() {
    if (this.exportType == 'video') {
      !this.reencodeVideoIsReady && this.reencodeVideo();
      !this.reencodeAudioIsReady && this.reencodeAudio();
    }

    !this.outputPathIsReady && this.outputTo();
    this.isReady = true;
    return this;
  }

  processStdOut(str) {
    if (!this.duration) {
      let durationResponse = ffmpegStdoutHelper.extractDuration(str);

      if (!durationResponse && this.headerLogs) {
        durationResponse = ffmpegStdoutHelper.extractDuration(this.headerLogs);
      }

      if (durationResponse) {
        //self.bitrate = self.extractBitrate(str);
        this.duration = durationResponse.duration;
        this.durationInSeconds = durationResponse.durationInSeconds;
      }
    } else {
      const time = ffmpegStdoutHelper.extractTime(str);
      if (time && time != '00:00:00.00') {
        const progressRelevantDuration = this.progressDuration || this.duration;
        const progress = ffmpegStdoutHelper.calculateProgress(
          time,
          progressRelevantDuration,
          this.speedDatapoints
        );
        this.setProgress(progress);
      }
    }

    if (str && !str.startsWith('frame=')) {
      this.headerLogs += str;
    } else {
      const currentSpeed = ffmpegStdoutHelper.extractSpeedDatapoint(str);

      if (currentSpeed.speedDatapoint) {
        this.speedDatapoints.push(currentSpeed.speedDatapoint);
      }
    }
  }

  setProgress(progress) {
    this.progress = progress;
    this.onProgressFn(this.progress);
  }

  setProfile(name = 'FULLHD', portraitOrLandscape = 'portrait') {
    console.log('name', name);
    let profile = CommandBuilder.profiles.find((profile) => {
      console.log('profile', profile.names);
      return profile.names.includes(name);
    });
    if (!profile) {
      profile = CommandBuilder.profiles[CommandBuilder.profiles.length - 1];
    }
    if (profile) {
      if (portraitOrLandscape == 'portrait') {
        this.profile = profile;
      } else {
        this.profile = {
          ...profile,
          height: profile?.width,
          width: profile?.height,
        };
      }
    }
  }

  async runStats(videoFilepath) {
    const statsFFMPEGCommand = [
      '-hide_banner',
      '-y',
      '-i',
      videoFilepath,
      '-vf',
      'select=gte(n\\,0)',
      '-vframes',
      '1',
      '-f',
      'null',
      '-',
    ];

    const response = await this.constructor.execute(statsFFMPEGCommand, this);

    let extractedStats = { successful: false };
    if (this.headerLogs) {
      extractedStats = ffmpegStdoutHelper.extractFileStats(this.headerLogs);
    }

    // this.processStdOut(response.error);

    return extractedStats;
  }

  add(command) {
    this.command = this.command.concat(command);
  }

  addSilentAudioFillerToInput() {
    this.add([
      '-f',
      'lavfi',
      '-i',
      'anullsrc=channel_layout=stereo:sample_rate=44100',
    ]);

    return this;
  }

  makeMp4Streamable() {
    this.addAfterCodex(['-movflags', '+faststart']);
    return this;
  }

  addAfterCodex(command) {
    this.commandAfterCodex = this.commandAfterCodex.concat(command);
  }

  addBeforeInput(command) {
    this.commandBeforeInput = this.commandBeforeInput.concat(command);
  }

  addFilterComplex1(filter) {
    this.filterComplex1 += filter;
  }

  addFilterComplex2(filter) {
    this.filterComplex2 += filter;
  }

  createThumbnail() {
    this.exportType = 'image';
    this.add(['-vf', 'thumbnail', '-frames:v', '1']);
    return this;
  }

  createImage(second) {
    this.exportType = 'image';
    this.addBeforeInput(['-ss', second + '']);
    this.add(['-frames:v', '1', '-q:v', '2']);
    return this;
  }

  createFreezeFrame(second = 0, duration = 1) {
    this.addBeforeInput(['-ss', second + '']);
    this.add(['-t', ffmpegStdoutHelper.formatSecondsAsTime(duration)]);
    this.videoFilter.push(`select='eq(n,${second})'`);
    this.videoFilter.push('fps=1');
    this.add(['-af', 'volume=0']);
    return this;
  }

  addOverwriteAndWhitelist() {
    this.addBeforeInput([
      '-hide_banner',
      '-y',
      '-protocol_whitelist',
      'file,http,https,tcp,tls,saf',
    ]);

    // if (this.videocodexToUse === 'h264_qsv') {
    //   this.addBeforeInput(['-init_hw_device', 'qsv=hw']);
    // }

    return this;
  }

  /* start functions */
  addImageInput(url, duration = 1) {
    !this.hasAnyInput && (this.hasAnyInput = true);
    this.addOverwriteAndWhitelist().add(['-loop', '1', '-i', url]);
    // '-f','lavfi','-i',`anullsrc=channel_layout=stereo:sample_rate=48000`
    this.addAfterCodex(['-t', duration, '-framerate', '1']);
    return this;
  }

  addVideoInput(url) {
    !this.hasAnyInput && (this.hasAnyInput = true);
    this.inputPath = url;
    this.addOverwriteAndWhitelist().add(['-i', url]);
    return this;
  }

  addEmptyVideo(duration = 1, color = 'black') {
    !this.hasAnyInput && (this.hasAnyInput = true);
    this.addOverwriteAndWhitelist().add(
      `-f lavfi -i color=${color}:duration=${duration}:size=${this.profile.width}x${this.profile.height}:rate=30,format=rgb24 -pix_fmt yuv420p -t 1`.split(
        ' '
      )
    );
    return this;
  }

  addOverlay(
    url,
    position = 'lefttop',
    percent = 10,
    overlayPaddingXPercent = 0,
    overlayPaddingYPercent = 0
  ) {
    if (
      !this.command.includes('anullsrc=channel_layout=stereo:sample_rate=44100')
    ) {
      this.add([
        '-f',
        'lavfi',
        '-i',
        'anullsrc=channel_layout=stereo:sample_rate=44100',
      ]);
      this.overlayInputIndex += 1;
    }

    this.add(['-i', url]);
    this.overlayInputIndex += 1;

    const width = (this.profile.width * percent) / 100;
    console.log('width', this.profile.width, percent, width);
    const height = (this.profile.height * percent) / 100;

    let paddingWidth = (width * overlayPaddingXPercent) / 100;
    let paddingHeight = (height * overlayPaddingYPercent) / 100;

    let positionString = '';
    if (position.indexOf('left') > -1) {
      positionString += `${paddingWidth}:`;
    } else if (position.indexOf('center') > -1) {
      positionString += '(W-w)/2:';
    } else {
      positionString += `W-w-${paddingWidth}:`;
    }
    if (position.indexOf('top') > -1) {
      positionString += `${paddingHeight}`;
    } else if (position.indexOf('middle') > -1) {
      positionString += '(H-h)/2';
    } else {
      positionString += `H-h-${paddingHeight}`;
    }

    if (!this.filterComplex1) {
      this.addFilterComplex1(
        `[0:v]   scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=decrease [videoinput${this.overlayInputIndex}]`
      );
    }

    this.addFilterComplex1(
      `;[${this.overlayInputIndex}:v] scale=${width}:${height}:force_original_aspect_ratio=decrease [ovrl${this.overlayInputIndex}]`
    );

    this.filterComplex2 = this.filterComplex2.replace(';atempo=1.0[audio]', '');
    this.filterComplex2 = this.filterComplex2.replace(
      `,pad=${this.profile.width}:${this.profile.height}:(ow-iw)/2:(oh-ih)/2`,
      ''
    );

    this.addFilterComplex2(
      `;[videoinput${this.overlayInputIndex}][ovrl${
        this.overlayInputIndex
      }] overlay=${positionString},pad=${this.profile.width}:${
        this.profile.height
      }:(ow-iw)/2:(oh-ih)/2 [videoinput${
        this.overlayInputIndex + 1
      }];atempo=1.0[audio]`
    );

    return this;
  }

  cut(start, end) {
    this.fastSeek(ffmpegStdoutHelper.parseTimeToSeconds(start));
    this.progressDuration = ffmpegStdoutHelper.formatSecondsAsTime(
      ffmpegStdoutHelper.parseTimeToSeconds(end) -
        ffmpegStdoutHelper.parseTimeToSeconds(start)
    );
    if (
      !this.command.includes('anullsrc=channel_layout=stereo:sample_rate=44100')
    ) {
      this.add([
        '-f',
        'lavfi',
        '-i',
        'anullsrc=channel_layout=stereo:sample_rate=44100',
      ]);
    }

    this.add(this.profile[this.videocodexToUse]);

    this.add([
      '-ss',
      start,
      '-to',
      end,
      '-avoid_negative_ts',
      'make_zero',
      '-copyts',
    ]);

    return this;
  }

  fastSeek(startInSeconds) {
    const seekStartInSeconds = startInSeconds - 10;
    if (seekStartInSeconds > 0) {
      this.addBeforeInput([
        '-ss',
        ffmpegStdoutHelper.formatSecondsAsTime(seekStartInSeconds),
      ]);
    }
  }

  normalizeSpeed() {
    this.videoFilter.push('fps=fps=30');
    return this;
  }

  scale(type) {
    if (type == 'pad') {
      this.videoFilter.push(
        `pad=${this.profile.width}:${this.profile.height}:(ow-iw)/2:(oh-ih)/2`
      );
    } else {
      this.videoFilter.push(
        `scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=1`
      );
    }
    return this;
  }

  pad() {
    this.scale('pad');
    return this;
  }

  reencodeAudio() {
    this.reencodeAudioIsReady = true;
    this.add(['-c:a', 'aac', '-ar', '48000']);
    return this;
  }

  reencodeVideo() {
    this.reencodeVideoIsReady = true;
    if (this.videoFilter.length > 0) {
      this.add(['-vf', this.videoFilter.join(',')]);
    }
    if (this.filterComplex1) {
      this.add([
        '-filter_complex',
        `${this.filterComplex1}${this.filterComplex2}`,
        `-map`,
        `[videoinput${this.overlayInputIndex + 1}]`,
        '-map',
        '[audio]',
      ]);
    }
    this.add(this.profile[this.videocodexToUse]);
    return this;
  }

  build() {
    return this.reencodeVideo().reencodeAudio();
  }

  outputTo(filepath, overridingFileExtenson) {
    // Set default file extension based on export type.
    let extension = '.mp4';
    if (this.exportType == 'image') {
      extension = '.png';
    }

    if (overridingFileExtenson) {
      extension = `.${overridingFileExtenson}`;
    }

    // If no filepath is provided, generate one based on the input file path.
    if (!filepath) {
      // Split the input file path to isolate the extension.
      const tmp = this.inputPath.split('.');
      const ext = tmp.pop(); // Remove the extension part.
      // Join the remaining parts and append '_out' and the original extension.
      filepath = tmp.join('.') + '_out.' + ext;
    }

    // If the provided or generated filepath does not end with the correct extension,
    // append the appropriate extension.
    if (filepath.indexOf(extension) == -1) {
      filepath = filepath + extension;
    }

    console.log('OUTPUT PATH', filepath, this.outputPath);

    // Set the instance's outputPath to the determined filepath.
    this.outputPath = filepath;
    // Mark the outputPath as ready.
    this.outputPathIsReady = true;
    // Return the current instance for method chaining.
    return this;
  }

  logCommand() {
    console.log('logCommand', this.toString());
    return this;
  }

  toString() {
    return (
      this.commandBeforeInput.join(' ') +
      ' ' +
      this.command.join(' ') +
      ' ' +
      this.commandAfterCodex.join(' ') +
      ' ' +
      this.outputPath
    );
  }

  toArray() {
    return this.commandBeforeInput.concat(
      this.command,
      this.commandAfterCodex,
      [this.outputPath]
    );
  }

  checkMerge() {
    // todo
  }

  merge(inputs) {
    let concatText = '';
    for (const input of inputs) {
      concatText += "file '" + input + "'\n";
    }
    this.mergeFileText = concatText;
    this.addOverwriteAndWhitelist().add([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      '###MERGEPATH###',
      '-c',
      'copy',
    ]);
    this.reencodeVideoIsReady = true;
    this.reencodeAudioIsReady = true;
    return this;
  }

  copyCodecToMp4() {
    this.addOverwriteAndWhitelist().add(['-c:v', 'copy', '-c:a', 'copy']);
    this.reencodeVideoIsReady = true;
    this.reencodeAudioIsReady = true;
    return this;
  }
}
