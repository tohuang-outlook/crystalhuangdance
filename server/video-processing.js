import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

function sanitizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'video';
}

async function probeDurationSeconds(inputPath) {
  const { stdout } = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    inputPath,
  ]);

  const duration = Number.parseFloat(stdout.trim());

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('Unable to determine video duration.');
  }

  return duration;
}

async function encodeWithTarget({ inputPath, outputPath, scaleWidth, videoBitrateKbps }) {
  await runCommand('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    `scale='min(${scaleWidth},iw)':-2`,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-b:v',
    `${videoBitrateKbps}k`,
    '-maxrate',
    `${videoBitrateKbps}k`,
    '-bufsize',
    `${videoBitrateKbps * 2}k`,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputPath,
  ]);
}

export async function processUploadedVideo({
  inputPath,
  originalFilename,
  processedVideosDirectory,
  publicVideosBasePath,
  maxVideoDurationSeconds,
  targetVideoSizeBytes,
  maxAllowedVideoSizeBytes,
}) {
  const durationSeconds = await probeDurationSeconds(inputPath);

  if (durationSeconds > maxVideoDurationSeconds) {
    throw new Error(`Video length must be ${Math.floor(maxVideoDurationSeconds / 60)} minutes or less.`);
  }

  const baseName = `${Date.now()}-${sanitizeFilename(originalFilename)}-${crypto.randomUUID().slice(0, 8)}`;
  const outputFilename = `${baseName}.mp4`;
  const outputPath = path.join(processedVideosDirectory, outputFilename);
  const audioBitrate = 128_000;
  const targetTotalBitrate = Math.floor((targetVideoSizeBytes * 8) / Math.max(durationSeconds, 1));
  const startingVideoBitrateKbps = Math.max(350, Math.floor((targetTotalBitrate - audioBitrate) / 1000));
  const attempts = [
    { scaleWidth: 1600, bitrateKbps: startingVideoBitrateKbps },
    { scaleWidth: 1280, bitrateKbps: Math.max(300, Math.floor(startingVideoBitrateKbps * 0.85)) },
    { scaleWidth: 960, bitrateKbps: Math.max(250, Math.floor(startingVideoBitrateKbps * 0.7)) },
  ];

  for (const attempt of attempts) {
    try {
      await encodeWithTarget({
        inputPath,
        outputPath,
        scaleWidth: attempt.scaleWidth,
        videoBitrateKbps: attempt.bitrateKbps,
      });

      const outputStats = await fs.stat(outputPath);

      if (outputStats.size <= maxAllowedVideoSizeBytes) {
        return {
          filePath: `${publicVideosBasePath}/${outputFilename}`,
          durationSeconds: Math.round(durationSeconds),
          fileSizeBytes: outputStats.size,
          outputPath,
        };
      }
    } catch {
      // fall through to the next attempt with a smaller target
    }
  }

  throw new Error('Unable to compress the uploaded video below 20MB.');
}
