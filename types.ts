export interface DateIdea {
  id: string;
  text: string;
  color: string;
}

export interface SpinResult {
  winner: DateIdea | null;
  isSpinning: boolean;
}

export enum TabView {
  WHEEL = 'wheel',
  LIST = 'list',
  AI = 'ai'
}

export enum WheelMode {
  CUSTOM = 'custom',
  SYSTEM = 'system'
}