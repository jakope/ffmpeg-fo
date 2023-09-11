#!/usr/bin/env node

/**
 * ffmpeg-fo-node-cli
 * transcode videos
 *
 * @author Janos Koschwtiz <koschwitz.biz>
 */
import init from './utils/init.js';
import cli from './utils/cli.js';
import log from './utils/log.js';
import inquirer from 'inquirer';
import CommandBuilder from '../ffmpeg-command-builder-node.js';
import Spinnies from 'spinnies';
import fs from 'fs';
import path from 'path';
const dirname = path.dirname(new URL(import.meta.url).pathname) + "../output";
const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;
const filepath = "/Users/janoskoschwitz/Downloads/1_Spielaufbau.mp4";
console.log("file exsits",fs.existsSync(filepath));


(async () => {
  
	init({ clear : false });
	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
	const spinnies = new Spinnies();
	// create dirname if it does not exist
	spinnies.add('folder', { text: 'Create folder for output' });
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname);
	}
	spinnies.succeed('folder');
	spinnies.add('setup', { text: 'Initialize ffmpeg' });
	await CommandBuilder.initialize({ forceAutoFindHwaccel : true, folder : dirname });
	spinnies.succeed('setup');
	spinnies.add('hwaccell', { text: 'Search for video acceleration' });
	spinnies.succeed('hwaccell');
  console.log("Your system allows the following hardware accelereation methods");
  CommandBuilder.possibleCodex.forEach((codec) => {
    console.log(`- ${codec}`);
  });
  const { videocodex, profile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'videocodex',
      message: 'What codec do you want to use?',
      choices: CommandBuilder.possibleCodex,
    },
    {
      type: 'list',
      name: 'profile',
      message: 'What profile do you want to use?',
      choices: CommandBuilder.profiles.map((profile) => profile.names[0]),
    }
  ]);
  console.log("Chosen videocodex ",videocodex);
  let goon = true;
  let command = new CommandBuilder(profile, { videocodex });
  do{
    const choices = ["add Video","add Image"];
    if(command.hasAnyInput){
      choices.push("Export as mp4");
    }
      const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'What do you want to do?',
        choices
      }]);
      if(method == "add Video" || method == "add Image"){
        const { pathInput } = await inquirer.prompt([{
          type : "input",
          name : "pathInput",
          message : "What is the path to the file?"
        }]);
        console.log("pathInput",pathInput);

        // make pathToFile (something like /Users/janoskoschwitz/Downloads/Bildschirmaufnahme\ 2023-08-17\ um\ 15.10.44.mov ) readable for fs.existsSync with the path library
        const pathToFile = "" + path.join("" + pathInput + "") + "";
        console.log("pathToFile",pathToFile);
        const exists = fs.existsSync(`${pathToFile}`);
        console.log("exists",exists);
        if(!exists){
          console.log("File does not exist");
          continue;
        }
        // check if file is image
        const isImage = pathToFile.match(/\.(jpeg|jpg|gif|png)$/) != null;
        if(isImage){
          command = command.addImageInput(pathToFile);
        }{
          command = command.addVideoInput(pathToFile);
        }
      }
      else if(method == "Export as mp4"){
        goon = false;
        const { outputFileName } = await inquirer.prompt([{
          type : "input",
          name : "outputFileName",
          message : "What is the name of output file?",
          default : "output"
        }]);
        command = command.outputTo(`${dirname}/${outputFileName}.mp4`);
      }
    console.log("Chosen method ",method);
  }while(goon);
  spinnies.add('export', { text: 'Exporting' });
  const runPromise = command.onProgress((p)=>{
    spinnies.update('export', { text: `Exporting ${p.progress}%` });
  }).run();
  const cancelPromise = inquirer.prompt([{
    type : "list",
    name : "cancel",
    message : "Do you want to cancel?",
    choices : ["yes","no"]
  }]);
  cancelPromise.then((answer)=>{
    if(answer.cancel == "yes"){
      console.log("cancel",command.cancel);
      command.cancel();
    }
  });
  await runPromise;
  spinnies.succeed('export');

})();
