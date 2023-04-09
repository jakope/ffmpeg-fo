import ffmpegStandardResolutions from './ffmpeg-resolutions.js';
import ffmpegStdoutHelper from './ffmpeg-stdout-helpers.js'

export default class CommandBuilder{
    static videocodex = ['-c:v','v',`-profile:v`, 'main','-sc_threshold', '0', '-g', '48'];
    static profiles = ffmpegStandardResolutions;
    static folder;
    static execute(command){};
    static createFile(){};
    static createFolder(){};
    static deleteFile(){};
    static deleteFolder(){};

    isReady = false;
    profile;
    inputPath;
    
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

    static initialize(options){
        options.profiles && (this.profiles = options.profiles);
        options.videocodex && (this.videocodex = options.videocodex);
        options.folder && (this.folder = options.folder);
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
        !this.isReady && this.build;
        await this.execute(this.toString());
        return 
    }
    processStdOut(){
        if(!this.duration){
            const duration = ffmpegStdoutHelper.extractDuration(str);
            if(duration){
                //self.bitrate = self.extractBitrate(str);
                self.duration = duration;
            }
        }else{
            const time = ffmpegStdoutHelper.extractTime(str);
            if(time && time != "00:00:00.00"){
                console.log(ffmpegStdoutHelper.calculateProgress(time,self.duration));
            }
            
        }
    }
    setProfile(name = "FULLHD", portraitOrLandscape = "portrait"){
        const profile = CommandBuilder.profiles.find((profile)=>{
            return profile.name == name
        });
        if(portraitOrLandscape == "portrait"){
            return profile;
        }
        this.profile = {
            ...profile,
            height : profile?.widht,
            width : profile?.height,
        }
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
        this.add([`[0:v]   scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=decrease [orig];`]);
        return this;
    }
    pad(){
        this.add(['-vf', `scale=w=${this.profile.width}:h=${this.profile.height}:force_original_aspect_ratio=1,pad=${this.profile.width}:${this.profile.height}:(ow-iw)/2:(oh-ih)/2`]);
        return this;
    }
    reencodeAudio(){
        this.add(['-c:a', 'aac', '-ar', '48000',]);
        return this;
    }
    reencodeVideo(){
        if(this.filterComplex1){
            this.add(['-filter_complex',`${this.filterComplex1}${this.filterComplex2}`,`-map`,`[videoinput${this.overlayInputIndex+1}]`])
        }
        if(CommandBuilder.videocodex){
            this.add(CommandBuilder.videocodex);
        }else{
            this.add(['-c:v', 'h264', `-profile:v`, 'main', '-crf', '20', '-sc_threshold', '0', '-g', '48']);
        }
        return this;
    }
    build(){
        return this.reencodeVideo().reencodeAudio();
    }
    outputTo(filepath){
        if(!filepath){
            const tmp = this.inputPath.split(".");
            const ext = tmp.pop();
            filepath = tmp.join(".") + "_out." + ext;
        }
        if(filepath.indexOf(".mp4") == -1){
            filepath = filepath + ".mp4";
        }
        this.add([filepath]);
        this.isReady = true;
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