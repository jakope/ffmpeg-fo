# ffmpeg-fo

Your the Captian on the ride to transform some videos. But you are not alone, FFMPEG-FO is you First Officier. Your "Chief Mate" will help you to reach your destination.

![ChiefMate](assets/logo.png)

ffmpeg-fo is a command builder tool for ffmpeg written in JavaScript as a class. It is designed to solve all common problems with hardware acceleration and typical export standards. You can use it to generate ffmpeg commands including progress events.

## Installation

You can install ffmpeg-fo using npm:

```
npm install ffmpeg-fo
```

## Usage

To use ffmpeg-fo, simply import the CommandBuilder class and create a new instance:

```javascript
import CommandBuilder from 'ffmpeg-fo';

const builder = new CommandBuilder('profileName', { videocodex: 'h264' });
```

You can then use the builder instance to set input and output paths, add filters, and generate the ffmpeg command:

```javascript
builder.setInputPath('/path/to/input/file.mp4');
builder.setOutputPath('/path/to/output/file.mp4');
builder.addVideoFilter('scale=1920:1080');
builder.addAudioFilter('volume=2.0');
const command = builder.buildCommand();
```

You can also listen for progress events by passing a function to the `onProgress` method:

```javascript
builder.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
});
```

## API

### `CommandBuilder(profileName, options)`

Creates a new instance of the CommandBuilder class.

- `profileName` (string): The name of the profile to use.
- `options` (object): Optional configuration options.
  - `videocodex` (string): The video codec to use. Defaults to 'h264'.
  - `progressEventName` (string): The name of the progress event to listen for. Defaults to 'progress'.

### `setInputPath(path)`

Sets the input path for the ffmpeg command.

- `path` (string): The path to the input file.

### `setOutputPath(path)`

Sets the output path for the ffmpeg command.

- `path` (string): The path to the output file.

### `addVideoFilter(filter)`

Adds a video filter to the ffmpeg command.

- `filter` (string): The filter to add.

### `addAudioFilter(filter)`

Adds an audio filter to the ffmpeg command.

- `filter` (string): The filter to add.

### `onProgress(callback)`

Listens for progress events and calls the specified callback function.

- `callback` (function): The function to call when a progress event is received.

### `buildCommand()`

Generates the ffmpeg command based on the current configuration.

Returns a string containing the ffmpeg command.

## License

ffmpeg-fo is licensed under the MIT License. See the LICENSE file for more information.