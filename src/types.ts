import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  queryText?: string;
  // BONUS: Dalga yerine Para Birimi seçiyoruz
  currency?: 'btc' | 'eth' | 'doge' | 'error_test'; 
  multiplier?: number; // Fiyatı katlamak veya ince ayar için
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  currency: 'btc',
  multiplier: 1.0,
  queryText: '',
};

export interface DataPoint {
  Time: number;
  Value: number;
}

export interface DataSourceResponse {
  datapoints: DataPoint[];
}

export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

export interface MySecureJsonData {
  apiKey?: string;
}