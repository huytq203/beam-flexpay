import type { KeyConnectionRow } from '../types/keyConnection.type'

export const KEY_CONNECTION_FIXTURE: readonly KeyConnectionRow[] = [
  {
    id: 'key-master-highlands',
    scope: 'MASTER',
    merchantName: 'Highlands Coffee',
    merchantCode: 'MC000142',
    clientId: 'hlc-production',
    maskedSecret: '••••••••••••4F2A',
    ipWhitelist: ['203.113.1.10'],
    webhookUrl: 'https://merchant.highlandscoffee.vn/ipn',
    status: 'ACTIVE',
    updatedAt: '21/09/2026 09:30'
  },
  {
    id: 'key-sub-highlands-nguyen-hue',
    scope: 'SUB',
    merchantName: 'HLC Nguyễn Huệ',
    merchantCode: 'SUB-0142-01',
    clientId: 'hlc-nguyen-hue',
    maskedSecret: '••••••••••••9B1C',
    ipWhitelist: ['203.113.1.11', '203.113.1.12'],
    webhookUrl: 'https://nguyenhue.highlandscoffee.vn/ipn',
    status: 'ACTIVE',
    updatedAt: '20/09/2026 16:45'
  },
  {
    id: 'key-sub-highlands-landmark',
    scope: 'SUB',
    merchantName: 'HLC Landmark 81',
    merchantCode: 'SUB-0142-02',
    clientId: 'hlc-landmark',
    maskedSecret: '••••••••••••7D3E',
    ipWhitelist: [],
    webhookUrl: 'https://landmark.highlandscoffee.vn/ipn',
    status: 'INACTIVE',
    updatedAt: '18/09/2026 11:20'
  },
  {
    id: 'key-master-gs25',
    scope: 'MASTER',
    merchantName: 'GS25 Việt Nam',
    merchantCode: 'MC000217',
    clientId: 'gs25-production',
    maskedSecret: '••••••••••••6A8F',
    ipWhitelist: [],
    webhookUrl: 'https://merchant.gs25.com.vn/webhook/ipn',
    status: 'INACTIVE',
    updatedAt: '17/09/2026 14:10'
  }
]
