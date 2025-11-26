import { Injectable, signal, computed } from '@angular/core';

/**
 * Loading Service for GUCE Instance
 * Manages loading state for HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal<Set<string>>(new Set());
  private requestCount = signal(0);

  /**
   * Observable loading state
   */
  readonly isLoading = computed(() => this.requestCount() > 0);

  /**
   * Get count of active requests
   */
  readonly activeCount = computed(() => this.requestCount());

  /**
   * Start tracking a request
   */
  startRequest(url: string): void {
    this.activeRequests.update(requests => {
      const newSet = new Set(requests);
      newSet.add(url);
      return newSet;
    });
    this.requestCount.update(count => count + 1);
  }

  /**
   * Stop tracking a request
   */
  endRequest(url: string): void {
    this.activeRequests.update(requests => {
      const newSet = new Set(requests);
      newSet.delete(url);
      return newSet;
    });
    this.requestCount.update(count => Math.max(0, count - 1));
  }

  /**
   * Check if a specific request is in progress
   */
  isRequestInProgress(urlPattern: string): boolean {
    return Array.from(this.activeRequests()).some(url => url.includes(urlPattern));
  }

  /**
   * Force clear all loading states
   */
  clearAll(): void {
    this.activeRequests.set(new Set());
    this.requestCount.set(0);
  }

  /**
   * Get list of active request URLs (for debugging)
   */
  getActiveUrls(): string[] {
    return Array.from(this.activeRequests());
  }
}
