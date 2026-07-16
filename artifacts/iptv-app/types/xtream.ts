export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  max_connections: string;
  active_cons: string;
  created_at: string;
  is_trial: string;
  allowed_output_formats: string[];
  exp_date: string;
}

export interface LiveCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string | null;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface VodCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface VodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface VodInfo {
  info: {
    movie_image: string;
    tmdb_id: string;
    name: string;
    o_name: string;
    cover_big: string;
    description: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    release_date: string;
    releaseDate: string;
    youtube_trailer: string;
    episode_run_time: string;
    rating: string;
    backdrop_path: string[];
    age: string;
    mpaa_rating: string;
  };
  movie_data: {
    stream_id: number;
    name: string;
    added: string;
    category_id: string;
    container_extension: string;
    custom_sid: string;
    direct_source: string;
  };
}

export interface SeriesCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface Series {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface SeriesEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    releasedate: string;
    rating: string;
    duration_secs: number;
    duration: string;
  };
  custom_sid: string;
  added: string;
  season: number;
  direct_source: string;
}

export interface SeriesInfo {
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    release_date: string;
    last_modified: string;
    rating: string;
    rating_5based: number;
    backdrop_path: string[];
    youtube_trailer: string;
    episode_run_time: string;
  };
  episodes: Record<string, SeriesEpisode[]>;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    season_number: number;
    cover: string;
    cover_big: string;
  }>;
}

export interface EPGItem {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: number;
  stop_timestamp: number;
  now_playing: number;
  has_archive: number;
}

export interface FavoriteItem {
  id: string;
  type: 'live' | 'vod' | 'series';
  name: string;
  icon: string;
  streamId: number;
  containerExtension?: string;
  categoryId?: string;
}

export interface RecentlyWatched {
  id: string;
  type: 'live' | 'vod' | 'series';
  name: string;
  icon: string;
  streamId: number;
  containerExtension?: string;
  watchedAt: number;
  progress?: number;
  duration?: number;
}

export interface PlayerParams {
  url: string;
  title: string;
  type: string;
  streamId?: string;
  icon?: string;
  channelList?: string; // JSON array of {id, name, icon} for live channel switching
}
