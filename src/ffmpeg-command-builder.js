import ffmpegStandardResolutions from './ffmpeg-resolutions.js';
import ffmpegStdoutHelper from './ffmpeg-stdout-helpers.js'
import { testHardwareAcceleration } from './ffmpeg-hwaccel.js';
export default class CommandBuilder{
    static findCodex;

    static videocodex = "h264";
    static profiles = ffmpegStandardResolutions;
    static folder;
    static execute(command){ console.log("static shit")};
    static createFile(){};
    static createFolder(){};
    static deleteFile(){};
    static deleteFolder(){};

    reencodeVideoIsReady = false;
    reencodeAudioIsReady = false;
    isReady = false;
    profile;
    inputPath;
    outputPath;
    
    filterComplex1 = "";
    filterComplex2 = "";
    overlayInputIndex = 0;
    
    command = [];
    
    duration;
    bitrate;
    progress;

    getFolder(){
        return CommandBuilder.folder;
    }

    async createTestVideo(filepath){
        
    }

    static async initialize(options){
        options.profiles && (this.profiles = options.profiles);
        options.videocodex && (this.videocodex = options.videocodex);
        
        options.folder && (this.folder = options.folder);
        if(this.folder && options.autoFindHwaccel){
            const filepath = this.folder + "/test.mp4";
            // const anwer = await this.execute(`-y -f lavfi -i testsrc=duration=5:size=320x240:rate=30 -pix_fmt yuv420p -t 1 ${filepath}`);
            // console.log("answer",anwer);
            const codex = await testHardwareAcceleration(this.execute,this.folder);
            console.log("codex",codex);
            if(codex.length > 0){
                this.videocodex = codex[0];
            }
        }
        options.exercute && (this.exercute = options.exercute);
        options.createFolder && (this.createFolder = options.createFolder);
        options.createFile && (this.createFile = options.createFile);
        options.deleteFolder && (this.deleteFolder = options.deleteFolder);
        options.deleteFile && (this.deleteFile = options.deleteFile);
    }
    static create(profileName = "FULLHD"){
        return new this(profileName);
    }
    constructor(profileName){
        this.setProfile(profileName);
    }
    async run(){
        !this.isReady && this.finalizeCommand();
        await this.constructor.execute(this.toArray());
        return 
    }
    finalizeCommand(){
        console.log("run",this.reencodeAudioIsReady,this.reencodeVideoIsReady,this.isReady);
        !this.reencodeVideoIsReady && this.reencodeVideo();
        !this.reencodeAudioIsReady && this.reencodeAudio();
        !this.outputPathIsReady && this.outputTo();
        this.add([this.outputPath]);
        this.isReady = true;
        return this;
    }
    processStdOut(str){
        if(!this.duration){
            const duration = ffmpegStdoutHelper.extractDuration(str);
            if(duration){
                //self.bitrate = self.extractBitrate(str);
                this.duration = duration;
            }
        }else{
            const time = ffmpegStdoutHelper.extractTime(str);
            if(time && time != "00:00:00.00"){
                console.log(ffmpegStdoutHelper.calculateProgress(time,this.duration));
            }
            
        }
    }
    setProfile(name = "FULLHD", portraitOrLandscape = "portrait"){
        console.log("name",name);
        let profile = CommandBuilder.profiles.find((profile)=>{
            console.log("profile",profile.names);
            return profile.names.includes(name)
        });
        if(!profile){
            profile = CommandBuilder.profiles[CommandBuilder.profiles.length - 1];
        }
        if(profile){
            if(portraitOrLandscape == "portrait"){
                this.profile = profile;
            }else{
                this.profile = {
                    ...profile,
                    height : profile?.width,
                    width : profile?.height,
                }
            }
        }
        
        console.log("this.profile",this.profile);
    }
    stats(){
        this.add(["-f",""]);
        return this;
    }
    add(command){
        this.command = this.command.concat(command);
    }
    addFilterComplex1(filter){
        this.filterComplex1 += filter;
    }
    addFilterComplex2(filter){
        this.filterComplex2 += filter;
    }
    addOverwriteAndWhitelist(){
        this.add(['-hide_banner', '-y', '-hwaccel', 'auto', '-protocol_whitelist', 'file,http,https,tcp,tls']);
        return this;
    }

    /* start functions */
    addImageInput(url, duration = 1){
        this.addOverwriteAndWhitelist().add(['-loop','1','-i', url,'-f','lavfi','-i',`anullsrc=channel_layout=stereo:sample_rate=48000`,'-t',duration, '-framerate','1',]);
        return this;
    }
    addVideoInput(url){
        this.inputPath = url;
        this.addOverwriteAndWhitelist().add([ '-i', url]);
        return this;
    }
    addOverlay(url, position = "lefttop", percent = 10){
        this.add(['-i',url]);
        
        this.overlayInputIndex+=1;

        let positionString = ""
        if(position.indexOf("left") > -1){
            positionString += "0:";
        }else if(position.indexOf("center") > -1){
            positionString += "(W-w)/2:";
        }else{
            positionString += "W-w:";
        }
        if(position.indexOf("top") > -1){
            positionString += "0";
        }else if(position.indexOf("middle") > -1){
            positionString += "(H-h)/2";
        }else{
            positionString += "H-h";
        }
        const width = this.profile.width * percent / 100;
        console.log("width",this.profile.width, percent, width);
        const height = this.profile.height * percent / 100;
        if(!this.filterComplex1){
            this.addFilterComplex1(`[0:v]   scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=decrease [videoinput${this.overlayInputIndex}]`);
        }
        this.addFilterComplex1(`;[${this.overlayInputIndex}:v] scale=${width}:${height}:force_original_aspect_ratio=decrease [ovrl${this.overlayInputIndex}]`)
        this.addFilterComplex2(`;[videoinput${this.overlayInputIndex}][ovrl${this.overlayInputIndex}] overlay=${positionString} [videoinput${this.overlayInputIndex+1}]`);
        return this;
    }
    cut(start,end){
        this.add(['-ss', start,'-to', end,'-avoid_negative_ts','make_zero','-copyts'])
        return this;
    }
    scale(){
        this.add(['-vf', `scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=1`]);
        // this.addFilterComplex1(`[0:v]   scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=increase [orig]`);
        // this.add([`[0:v]   scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=decrease [orig];`]);
        return this;
    }
    pad(){
        this.add(['-vf', `scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=1,pad=${this.profile.width}:${this.profile.height}:(ow-iw)/2:(oh-ih)/2`]);
        return this;
    }
    reencodeAudio(){
        this.reencodeAudioIsReady = true;
        this.add(['-c:a', 'aac', '-ar', '48000',]);
        return this;
    }
    reencodeVideo(){
        this.reencodeVideoIsReady = true;
        if(this.filterComplex1){
            this.add(['-filter_complex',`${this.filterComplex1}${this.filterComplex2}`,`-map`,`[videoinput${this.overlayInputIndex+1}]`])
        }
        this.add(this.profile[CommandBuilder.videocodex]);
        return this;
    }
    build(){
        return this.reencodeVideo().reencodeAudio();
    }
    outputTo(filepath){
        console.log("outputTo");
        if(!filepath){
            const tmp = this.inputPath.split(".");
            const ext = tmp.pop();
            filepath = tmp.join(".") + "_out." + ext;
        }
        if(filepath.indexOf(".mp4") == -1){
            filepath = filepath + ".mp4";
        }
        this.outputPath = filepath;
        this.outputPathIsReady = true;
        return this;
    }
    logCommand(){
        console.log("logCommand",this.command.join(" "));
        return this;
    }
    toString(){
        return this.command.join(" ");
    }
    toArray(){
        return this.command;
    }
    checkMerge(){
        // todo
    }
    merge(inputs, callbackToWriteConcatFile){
        let concatText = "";
        for (const input of inputs) {
            concatText += "file '" + input + "'\n";    
        }        
        const mergeTxtPath = callbackToWriteConcatFile(concatText);
        this.addOverwriteAndWhitelist().add(['-f','concat','-safe','0','-i',mergeTxtPath,'-c','copy',]);
      return this;
    }
}