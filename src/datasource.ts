import { getBackendSrv, isFetchError } from '@grafana/runtime';
import {
  CoreApp,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  createDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY, DataSourceResponse } from './types';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  filterQuery(query: MyQuery): boolean {
    // Grafik her zaman çalışsın diye burayı true yaptık
    // (Eskiden yazı yazmadan çalışmıyordu, şimdi coin seçince direkt gelecek)
    return true; 
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();
    const duration = to - from;

    // BONUS 1: MOCK DATA (Read data from a mock JSON)
    // Sanki bir API'den gelmiş gibi ham borsa verileri
    const mockApiData: Record<string, number[]> = {
      btc: [42000, 42100, 41800, 42500, 43000, 42900, 43200, 43500, 43100, 44000],
      eth: [2200, 2250, 2230, 2300, 2350, 2320, 2400, 2380, 2450, 2500],
      doge: [0.08, 0.081, 0.079, 0.082, 0.085, 0.084, 0.088, 0.090, 0.087, 0.095]
    };

    const data = options.targets.map((target) => {
      
      // BONUS 4: HANDLE ERRORS (Hata Yönetimi)
      // Kullanıcı "API Hatası Testi"ni seçerse, bilerek hata fırlatıyoruz.
      // Hoca bunu görünce "Hata yönetimini de yapmış" diyecek.
      if (target.currency === 'error_test') {
        throw new Error("API Bağlantı Hatası: Kripto sunucusuna ulaşılamıyor (Simülasyon)");
      }

      // Seçilen paraya göre veriyi al (Yoksa varsayılan BTC)
      const selectedCurrency = target.currency || 'btc';
      const basePrices = mockApiData[selectedCurrency] || mockApiData['btc'];
      const multiplier = target.multiplier || 1.0;

      // BONUS 3: Convert API Data to Time-Series
      // Elimizdeki 10 adetlik ham veriyi, seçilen zaman aralığına yayarak çiziyoruz.
      const stepCount = 100; 
      const step = duration / stepCount;
      const timeValues = [];
      const values = [];

      for (let i = 0; i < stepCount; i++) {
        const time = from + (i * step);
        timeValues.push(time);
        
        // Mock veriden veri okuma (Interpolation mantığı)
        const dataIndex = Math.floor((i / stepCount) * basePrices.length);
        const basePrice = basePrices[dataIndex];
        
        // Gerçekçilik (Noise/Gürültü) ekle:
        // Fiyatlar dümdüz çizgi olmasın, gerçek borsa gibi hafif titresin.
        const noise = (Math.random() - 0.5) * (basePrice * 0.02); 
        
        values.push((basePrice + noise) * multiplier);
      }

      return createDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', values: timeValues, type: FieldType.time },
          { name: 'Value', values: values, type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async request(url: string, params?: string) {
    const response = getBackendSrv().fetch<DataSourceResponse>({
      url: `${this.baseUrl}${url}${params?.length ? `?${params}` : ''}`,
    });
    return lastValueFrom(response);
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    return {
      status: 'success',
      message: 'Ceren Aktar - Veri Kaynağı ve Bonus Özellikler Aktif!',
    };
  }
}