export interface UploadBase64Input {
  fileName: string;
  contentType?: string;
  base64Content: string;
}

export interface UploadFileResultDto {
  storageName?: string;
  storageUrl?: string;
}
