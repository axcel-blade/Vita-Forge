import type { ComponentType } from 'react';

export interface ToastApi {
  success(message: string, duration?: number): void;
  error(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
}

export function useToast(): ToastApi;

declare const Toast: ComponentType;
export default Toast;
