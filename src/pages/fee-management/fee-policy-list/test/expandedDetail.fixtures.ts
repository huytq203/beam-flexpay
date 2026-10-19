/** Dữ liệu mẫu cho test dòng mở rộng của danh sách chính sách phí. */
export const policies = [
  {
    id: 'policy-one',
    name: 'Chính sách one',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 1,
    appliedTargets: [
      {
        type: 'ACCOUNT',
        code: null,
        count: 1,
        subjectCount: 1,
        subjects: [
          {
            subjectType: 'USER',
            subjectId: 'user-one',
            displayName: '0353585904',
            fullName: 'NGUYEN THI YEN NHI'
          }
        ]
      }
    ],
    configuration: {
      assignments: [
        {
          id: 'assignment-user',
          feePolicyId: 'policy-one',
          merchantId: null,
          bankCode: 'VPB',
          paymentMethod: 'ATM',
          cardType: null,
          serviceType: 'EWALLET_DEPOSIT',
          customerGroup: null,
          subjectType: 'USER',
          subjectId: 'user-one',
          status: 'ACTIVE',
          effectiveFromDate: null,
          effectiveToDate: null
        },
        {
          id: 'assignment-segment',
          feePolicyId: 'policy-one',
          merchantId: null,
          bankCode: null,
          paymentMethod: null,
          cardType: null,
          serviceType: 'EWALLET_DEPOSIT',
          customerGroup: 'VIP',
          subjectType: null,
          subjectId: null,
          status: 'ACTIVE',
          effectiveFromDate: null,
          effectiveToDate: null
        }
      ],
      components: [
        {
          id: 'component-transaction',
          feePolicyId: 'policy-one',
          componentType: 'TRANSACTION_FEE',
          baseOn: 'AMOUNT',
          baseComponentType: null,
          calculationMethod: 'FLAT_TIER',
          fixedAmount: 0,
          percentage: 0,
          roundMode: 'HALF_UP',
          minFee: 0,
          maxFee: 0,
          payerType: 'USER',
          payerObjectType: null,
          payerObjectId: null,
          beneficiaryType: 'SYSTEM',
          beneficiaryObjectType: null,
          beneficiaryObjectId: null,
          tiers: [
            {
              id: 'tier-transaction',
              feeComponentId: 'component-transaction',
              minValue: 0,
              maxValue: 100000,
              roundMode: 'HALF_UP',
              minFee: 1000,
              maxFee: 5000,
              fixedAmount: 2000,
              percentage: 1
            }
          ]
        },
        {
          id: 'component-vat',
          feePolicyId: 'policy-one',
          componentType: 'VAT',
          baseOn: 'FEE_COMPONENT',
          baseComponentType: 'TRANSACTION_FEE',
          calculationMethod: 'DIRECT',
          fixedAmount: 0,
          percentage: 10,
          roundMode: 'HALF_UP',
          minFee: 0,
          maxFee: 0,
          payerType: 'UNKNOWN_PAYER',
          payerObjectType: null,
          payerObjectId: null,
          beneficiaryType: 'MERCHANT',
          beneficiaryObjectType: null,
          beneficiaryObjectId: null,
          tiers: []
        }
      ]
    }
  },
  {
    id: 'policy-two',
    name: 'Chính sách two',
    serviceType: 'EWALLET_DEPOSIT',
    feeDomain: 'EWALLET',
    currency: 'VND',
    validFrom: '2026-09-01',
    validTo: null,
    status: 'INACTIVE',
    priority: 2,
    appliedTargets: [{ type: 'ALL', code: null, count: 0 }],
    configuration: { assignments: [], components: [] }
  }
]

export const page = {
  content: policies,
  totalElements: policies.length,
  totalPages: 1,
  size: 10,
  number: 0
}
