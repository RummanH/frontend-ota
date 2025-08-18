import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class FileValidationService {

  constructor() { }

  validateFile(file: File, fileType: string): Promise<boolean> {
    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB in bytes
    const validFileNamePattern = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?$/;
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > maxSizeInBytes) {
        resolve(false); // Reject files larger than 1 MB
      }

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        // JPEG/JPG magic number: FF D8 FF
        const isJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
        // PNG magic number: 89 50 4E 47
        const isPng = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
        // BMP magic number: 42 4D
        const isBmp = uint8Array[0] === 0x42 && uint8Array[1] === 0x4D;
        // WEBP magic number: RIFF and WEBP (bytes 0-3 should be "RIFF", bytes 8-11 should be "WEBP")
        const isWebp = uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
                       uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
        // Disallow GIF magic number: 47 49 46 38
        const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x38;
        // Check for document formats
        // PDF magic number: 25 50 44 46 (%PDF)
        const isPdf = uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46;
        // DOC magic number: D0 CF 11 E0 A1 B1 1A E1
        const isDoc = uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF && uint8Array[2] === 0x11 && uint8Array[3] === 0xE0 &&
                      uint8Array[4] === 0xA1 && uint8Array[5] === 0xB1 && uint8Array[6] === 0x1A && uint8Array[7] === 0xE1;
        // DOCX magic number: 50 4B 03 04 (same as ZIP files)
        const isDocx = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B && uint8Array[2] === 0x03 && uint8Array[3] === 0x04;
        // Validate image
        if (fileType === 'image') {
          if (isJpeg || isPng || isBmp || isWebp) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
        // Validate document
        else if (fileType === 'doc') {
          if (isJpeg || isPng || isBmp || isWebp || isPdf || isDoc) {
            resolve(true);
          } else {
            resolve(false);
          }
        } 
        else {
          resolve(false);
        }
      };
      reader.onerror = () => {
        reject('Error reading file');
      };
      // Read the first few bytes of the file to check magic numbers
      reader.readAsArrayBuffer(file.slice(0, 12)); // Read at least the first 12 bytes for WEBP validation
    });
  }

}