import type {
  XtreamCredentials,
  UserInfo,
  LiveCategory,
  LiveStream,
  VodCategory,
  VodStream,
  VodInfo,
  SeriesCategory,
  Series,
  SeriesInfo,
  EPGItem,
} from '@/types/xtream';

class XtreamService {
  private credentials: XtreamCredentials | null = null;

  setCredentials(creds: XtreamCredentials) {
    this.credentials = { ...creds };
    // Normalize server URL (remove trailing slash)
    this.credentials.serverUrl = creds.serverUrl.replace(/\/$/, '');
  }

  getCredentials(): XtreamCredentials | null {
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = null;
  }

  private buildUrl(action: string, extra: Record<string, string> = {}): string {
    if (!this.credentials) throw new Error('Not authenticated');
    const { serverUrl, username, password } = this.credentials;
    const params = new URLSearchParams({ username, password, action, ...extra });
    return `${serverUrl}/player_api.php?${params.toString()}`;
  }

  private async get<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'IPTV-App/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data as T;
  }

  async authenticate(creds: XtreamCredentials): Promise<UserInfo> {
    const { serverUrl, username, password } = creds;
    const url = `${serverUrl.replace(/\/$/, '')}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'IPTV-App/1.0' },
    });
    if (!res.ok) throw new Error('Could not connect to server. Check the server URL.');
    const data = await res.json();
    if (!data.user_info || data.user_info.auth === 0) {
      throw new Error('Invalid username or password.');
    }
    return data.user_info as UserInfo;
  }

  async getLiveCategories(): Promise<LiveCategory[]> {
    const data = await this.get<LiveCategory[]>(
      this.buildUrl('get_live_categories')
    );
    return Array.isArray(data) ? data : [];
  }

  async getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    const extra = categoryId ? { category_id: categoryId } : {};
    const data = await this.get<LiveStream[]>(
      this.buildUrl('get_live_streams', extra)
    );
    return Array.isArray(data) ? data : [];
  }

  async getVodCategories(): Promise<VodCategory[]> {
    const data = await this.get<VodCategory[]>(
      this.buildUrl('get_vod_categories')
    );
    return Array.isArray(data) ? data : [];
  }

  async getVodStreams(categoryId?: string): Promise<VodStream[]> {
    const extra = categoryId ? { category_id: categoryId } : {};
    const data = await this.get<VodStream[]>(
      this.buildUrl('get_vod_streams', extra)
    );
    return Array.isArray(data) ? data : [];
  }

  async getVodInfo(vodId: number): Promise<VodInfo> {
    return this.get<VodInfo>(
      this.buildUrl('get_vod_info', { vod_id: String(vodId) })
    );
  }

  async getSeriesCategories(): Promise<SeriesCategory[]> {
    const data = await this.get<SeriesCategory[]>(
      this.buildUrl('get_series_categories')
    );
    return Array.isArray(data) ? data : [];
  }

  async getSeries(categoryId?: string): Promise<Series[]> {
    const extra = categoryId ? { category_id: categoryId } : {};
    const data = await this.get<Series[]>(
      this.buildUrl('get_series', extra)
    );
    return Array.isArray(data) ? data : [];
  }

  async getSeriesInfo(seriesId: number): Promise<SeriesInfo> {
    return this.get<SeriesInfo>(
      this.buildUrl('get_series_info', { series_id: String(seriesId) })
    );
  }

  async getShortEPG(streamId: number, limit = 6): Promise<EPGItem[]> {
    try {
      const data = await this.get<{ epg_listings: EPGItem[] }>(
        this.buildUrl('get_short_epg', {
          stream_id: String(streamId),
          limit: String(limit),
        })
      );
      return Array.isArray(data?.epg_listings) ? data.epg_listings : [];
    } catch {
      return [];
    }
  }

  getLiveStreamUrl(streamId: number, extension = 'm3u8'): string {
    if (!this.credentials) throw new Error('Not authenticated');
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/live/${username}/${password}/${streamId}.${extension}`;
  }

  getVodStreamUrl(streamId: number, extension: string): string {
    if (!this.credentials) throw new Error('Not authenticated');
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/movie/${username}/${password}/${streamId}.${extension}`;
  }

  getSeriesStreamUrl(episodeId: string, extension: string): string {
    if (!this.credentials) throw new Error('Not authenticated');
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/series/${username}/${password}/${episodeId}.${extension}`;
  }
}

export const xtreamService = new XtreamService();
