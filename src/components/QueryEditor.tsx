import React, { ChangeEvent } from 'react';
import { InlineField, Input, Stack, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  
  // Metin değişikliği (Aynı kaldı)
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
    onRunQuery();
  };

  // Constant -> Multiplier olarak güncellendi (Fiyatı katlamak için)
  const onMultiplierChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, multiplier: parseFloat(event.target.value) });
    onRunQuery();
  };

  // WaveType -> Currency olarak güncellendi (Bonus Coin Seçimi)
  const onCurrencyChange = (value: SelectableValue<string>) => {
    onChange({ ...query, currency: value.value as any });
    onRunQuery();
  };

  // BONUS SEÇENEKLER: Coinler ve Hata Testi
  const currencyOptions: Array<SelectableValue<string>> = [
    { label: 'Bitcoin (BTC)', value: 'btc' },
    { label: 'Ethereum (ETH)', value: 'eth' },
    { label: 'Dogecoin (DOGE)', value: 'doge' },
    { label: '⚠️ SİMÜLASYON: API Hatası Testi', value: 'error_test' }, // Hata bonusu için
  ];

  const { queryText, multiplier, currency } = query;

  return (
    <Stack gap={1} direction="column">
      
      {/* ZORUNLU: İSİM GÖSTERİMİ (GEÇME ŞARTI) - DOKUNMADIM */}
      <div style={{ padding: '5px', color: '#56A6F8', fontWeight: 'bold', borderBottom: '1px solid #333', marginBottom: '10px' }}>
        🚀 Developed by: Ceren Aktar
      </div>

      {/* Coin Seçimi Menüsü */}
      <InlineField label="Coin Seçimi" labelWidth={16} tooltip="Mock API'den veri çeker">
        <Select
          options={currencyOptions}
          value={currencyOptions.find((v) => v.value === currency) || currencyOptions[0]}
          onChange={onCurrencyChange}
          width={24}
        />
      </InlineField>

      {/* Fiyat Çarpanı */}
      <InlineField label="Fiyat Çarpanı" labelWidth={16}>
        <Input
          id="query-editor-multiplier"
          onChange={onMultiplierChange}
          value={multiplier || 1.0}
          width={8}
          type="number"
          step="0.1"
        />
      </InlineField>

      <InlineField label="Not / Açıklama" labelWidth={16}>
        <Input
          id="query-editor-query-text"
          onChange={onQueryTextChange}
          value={queryText || ''}
          placeholder="Opsiyonel not..."
        />
      </InlineField>

      <div style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>
        * API Hatası Testi seçeneği 'Handle Errors' maddesi içindir.
      </div>
    </Stack>
  );
}