declare module 'cloudinary-react' {
  import * as React from 'react';

  export interface CloudinaryContextProps {
    cloudName: string;
    uploadPreset?: string;
    children?: React.ReactNode;
  }

  export class CloudinaryContext extends React.Component<CloudinaryContextProps> {}

  export interface ImageProps {
    publicId: string;
    width?: string | number;
    height?: string | number;
    crop?: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export class Image extends React.Component<ImageProps> {}
}