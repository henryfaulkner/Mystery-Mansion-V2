import path from 'path';

const fs = require('fs');
const Speaker = require('speaker');

export function playAudio(relativePath: string): void {
    const audioPath = path.join(__dirname, '..', 'assets', 'game-audio', relativePath);
  
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Create the Speaker instance
    const speaker = new Speaker({
        channels: 2,          // 2 channels
        bitDepth: 16,         // 16-bit samples
        sampleRate: 22050     // 44,100 Hz sample rate
    });
    
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(audioPath);
    
    // Process and pipe the PCM data to the speaker
    fileStream.on('data', chunk => {
        // Ensure the chunk is correctly handled for playback
        if (chunk.length > 0) {
        speaker.write(chunk);
        }
    });
    
    fileStream.on('end', () => {
        speaker.end(); // End the stream when file reading is complete
    });
}