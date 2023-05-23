const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const convertVideoToFormat = (inputPath, outputPath, format) => {
  let command;

  switch (format) {
    case 'webm':
      command = `${ffmpeg} -i ${inputPath} -c:v libvpx -crf 10 -b:v 1M -c:a libvorbis ${outputPath}`;
      break;
    case 'mp4':
      command = `${ffmpeg} -i ${inputPath} -c:v libx264 -crf 23 -c:a aac -b:a 128k ${outputPath}`;
      break;
    case 'avi':
      command = `${ffmpeg} -i ${inputPath} -c:v mpeg4 -vtag xvid -q:v 5 -c:a libmp3lame -q:a 5 ${outputPath}`;
      break;
    default:
      console.error('Invalid output format specified.');
      return;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`An error occurred during conversion of ${inputPath}:`, error);
    } else {
      console.log(`File ${inputPath} converted successfully!`);
    }

    if (stderr) {
      console.error(`FFmpeg encountered an error during conversion of ${inputPath}:`, stderr);
    }

    processNextFile();
  });
};

const inputFolder = path.join(__dirname, 'inputfolder');
const outputFolder = path.join(__dirname, 'outputfolder');

let files = [];

const processNextFile = () => {
  if (files.length === 0) {
    console.log('All files converted!');
    rl.close();
    return;
  }

  const file = files.pop();
  const inputPath = path.join(inputFolder, file);
  const outputFilename = path.parse(file).name;

  rl.question(`Enter the output format for ${inputPath}: `, (format) => {
    const outputFormat = format.toLowerCase();
    const outputPath = path.join(outputFolder, `${outputFilename}.${outputFormat}`);

    convertVideoToFormat(inputPath, outputPath, outputFormat);
  });
};

fs.readdir(inputFolder, (err, fileList) => {
  if (err) {
    console.error('Error reading input folder:', err);
    return;
  }

  files = fileList.filter((file) => fs.lstatSync(path.join(inputFolder, file)).isFile());

  if (files.length === 0) {
    console.log('Input folder does not contain any files.');
    rl.close();
    return;
  }

  processNextFile();
});

rl.on('close', () => {
  console.log('Exiting...');
});