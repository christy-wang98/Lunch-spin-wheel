class RateLimiter {
  private static instance: RateLimiter;
  private timestamps: Map<string, number[]>;
  private readonly WINDOW_SIZE = 60 * 1000; // 1分钟窗口
  
  private readonly LIMITS = {
    maps: 50,      // 每分钟50次地图加载
    places: 30,    // 每分钟30次地点搜索
    geocoding: 20,  // 每分钟20次地理编码
    geocode: 20     // 每分钟20次地理编码
  };

  private constructor() {
    this.timestamps = new Map();
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private cleanOldTimestamps(key: string): void {
    const now = Date.now();
    const timestamps = this.timestamps.get(key) || [];
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.WINDOW_SIZE
    );
    this.timestamps.set(key, validTimestamps);
  }

  canMakeRequest(type: keyof typeof this.LIMITS): boolean {
    this.cleanOldTimestamps(type);
    const timestamps = this.timestamps.get(type) || [];
    return timestamps.length < this.LIMITS[type];
  }

  logRequest(type: keyof typeof this.LIMITS): void {
    const timestamps = this.timestamps.get(type) || [];
    timestamps.push(Date.now());
    this.timestamps.set(type, timestamps);
  }

  getTimeToNextWindow(type: keyof typeof this.LIMITS): number {
    if (this.canMakeRequest(type)) return 0;
    
    const timestamps = this.timestamps.get(type) || [];
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    return Math.max(0, this.WINDOW_SIZE - (Date.now() - oldestTimestamp));
  }
}

export default RateLimiter.getInstance(); 