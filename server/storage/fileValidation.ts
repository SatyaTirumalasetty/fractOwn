/**
 * File Validation System for fractOWN
 * Validates uploaded files against allowed types and provides user feedback
 */

import appConfig from '../../config/app.config.js';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedActions: string[];
}

export interface ValidatedFile {
  file: File;
  isValid: boolean;
  type: 'image' | 'document' | 'other';
  size: number;
  name: string;
  mimeType: string;
}

export class FileValidator {
  private static readonly allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  private static readonly allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  private static readonly maxFileSize = appConfig.uploads.maxFileSize; // 10MB
  private static readonly maxFilesPerProperty = appConfig.uploads.maxFilesPerProperty;

  /**
   * Validates a single file
   */
  static validateFile(file: File): FileValidationResult {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestedActions: []
    };

    // Check file size
    if (file.size > this.maxFileSize) {
      result.isValid = false;
      result.errors.push(`File "${file.name}" exceeds maximum size limit of ${Math.round(this.maxFileSize / 1024 / 1024)}MB`);
      result.suggestedActions.push('Please compress the file or choose a smaller file');
    }

    // Check file type
    const allAllowedTypes = [...this.allowedImageTypes, ...this.allowedDocumentTypes];
    if (!allAllowedTypes.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`File type "${file.type}" is not allowed for "${file.name}"`);
      result.suggestedActions.push('Please choose files with these formats: JPG, PNG, WebP, PDF, DOC, DOCX');
    }

    // Check file name
    if (file.name.length > 255) {
      result.isValid = false;
      result.errors.push(`File name "${file.name}" is too long (max 255 characters)`);
      result.suggestedActions.push('Please rename the file with a shorter name');
    }

    // Security checks
    if (this.containsSuspiciousExtension(file.name)) {
      result.isValid = false;
      result.errors.push(`File "${file.name}" contains suspicious extension`);
      result.suggestedActions.push('Please ensure the file is a valid document or image');
    }

    return result;
  }

  /**
   * Validates multiple files
   */
  static validateFiles(files: FileList | File[]): {
    validFiles: ValidatedFile[];
    invalidFiles: Array<{ file: File; result: FileValidationResult }>;
    overallResult: FileValidationResult;
  } {
    const fileArray = Array.from(files);
    const validFiles: ValidatedFile[] = [];
    const invalidFiles: Array<{ file: File; result: FileValidationResult }> = [];
    
    const overallResult: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestedActions: []
    };

    // Check total number of files
    if (fileArray.length > this.maxFilesPerProperty) {
      overallResult.isValid = false;
      overallResult.errors.push(`Too many files selected. Maximum ${this.maxFilesPerProperty} files allowed per property`);
      overallResult.suggestedActions.push(`Please select only ${this.maxFilesPerProperty} files or fewer`);
    }

    // Validate each file
    fileArray.forEach(file => {
      const validationResult = this.validateFile(file);
      
      if (validationResult.isValid) {
        validFiles.push({
          file,
          isValid: true,
          type: this.getFileType(file),
          size: file.size,
          name: file.name,
          mimeType: file.type
        });
      } else {
        invalidFiles.push({ file, result: validationResult });
        overallResult.isValid = false;
        overallResult.errors.push(...validationResult.errors);
        overallResult.suggestedActions.push(...validationResult.suggestedActions);
      }
    });

    // Remove duplicate suggested actions
    overallResult.suggestedActions = Array.from(new Set(overallResult.suggestedActions));

    return { validFiles, invalidFiles, overallResult };
  }

  /**
   * Gets the file type category
   */
  private static getFileType(file: File): 'image' | 'document' | 'other' {
    if (this.allowedImageTypes.includes(file.type)) {
      return 'image';
    }
    if (this.allowedDocumentTypes.includes(file.type)) {
      return 'document';
    }
    return 'other';
  }

  /**
   * Checks for suspicious file extensions
   */
  private static containsSuspiciousExtension(filename: string): boolean {
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', '.vbs', '.js',
      '.php', '.asp', '.jsp', '.pl', '.py', '.rb', '.sh', '.ps1'
    ];
    
    const lowerFilename = filename.toLowerCase();
    return suspiciousExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  /**
   * Generates user-friendly validation message
   */
  static generateValidationMessage(result: FileValidationResult): string {
    if (result.isValid) {
      return 'All files are valid and ready for upload.';
    }

    let message = 'Some files could not be uploaded:\n\n';
    
    if (result.errors.length > 0) {
      message += 'Issues found:\n';
      result.errors.forEach(error => {
        message += `• ${error}\n`;
      });
    }

    if (result.suggestedActions.length > 0) {
      message += '\nSuggested actions:\n';
      result.suggestedActions.forEach(action => {
        message += `• ${action}\n`;
      });
    }

    message += '\nAllowed file types: JPG, PNG, WebP, PDF, DOC, DOCX';
    message += `\nMaximum file size: ${Math.round(this.maxFileSize / 1024 / 1024)}MB`;
    message += `\nMaximum files per property: ${this.maxFilesPerProperty}`;

    return message;
  }
}

/**
 * Browser-side file validation (for immediate feedback)
 */
export const validateFilesForUpload = (files: FileList): {
  valid: boolean;
  message: string;
  validFiles: File[];
  invalidFiles: File[];
} => {
  const validation = FileValidator.validateFiles(files);
  
  return {
    valid: validation.overallResult.isValid,
    message: FileValidator.generateValidationMessage(validation.overallResult),
    validFiles: validation.validFiles.map(vf => vf.file),
    invalidFiles: validation.invalidFiles.map(inf => inf.file)
  };
};