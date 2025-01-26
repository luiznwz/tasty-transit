export interface ScaleAnimationOptions {
  initialScale: number;
  finalScale: number;
  duration: number;
  delay: number;
  easing: string;
  threshold: number;
}

export interface NumberAnimationOptions {
  duration: number;
  delay: number;
  easing: string;
  threshold: number;
  formatNumber: boolean;
  preserveLayout: boolean;
  textAlign?: 'left' | 'center' | 'right';
}