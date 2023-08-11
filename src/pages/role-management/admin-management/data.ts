export const fakeData = {
  data: [
    {
      id: 1,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Quản lý tài khoản Admin và phân quyền',
      groups: [
        {
          id: 1,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'admin',
          description: 'Quản lý tài khoản admin và phân quyền',
          featureId: 1,
          permissions: [
            {
              id: 1,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'admin:approve',
              description: 'User can approve',
              order: 1,
              realId: 1010
            },
            {
              id: 2,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'admin:view',
              description: 'User can view',
              order: 2,
              realId: 1050
            },
            {
              id: 3,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'admin:create',
              description: 'User can create',
              order: 3,
              realId: 1020
            },
            {
              id: 4,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'admin:update',
              description: 'User can update',
              order: 4,
              realId: 1030
            },
            {
              id: 5,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'admin:delete',
              description: 'User can delete',
              order: 5,
              realId: 1040
            }
          ]
        },
        {
          id: 2,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'group',
          description: 'Quản lý nhóm quyền',
          featureId: 2,
          permissions: [
            {
              id: 6,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'group:approve',
              order: 1,
              description: 'User can approve',
              realId: 2010
            },
            {
              id: 7,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'group:view',
              description: 'User can view',
              order: 2,
              realId: 2050
            },
            {
              id: 8,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'group:create',
              description: 'User can create',
              order: 3,
              realId: 2020
            },
            {
              id: 9,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'group:update',
              description: 'User can update',
              order: 4,
              realId: 2030
            },
            {
              id: 10,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'group:delete',
              description: 'User can delete',
              order: 5,
              realId: 2040
            }
          ]
        }
      ]
    },
    {
      id: 2,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Quản lý Tài khoản ví cá nhân',
      groups: [
        {
          id: 3,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'customer_group',
          description: 'Quản lý Nhóm tài khoản ví cá nhân',
          featureId: 3,
          permissions: [
            {
              id: 11,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'customer_group:approve',
              description: 'User can approve',
              order: 1,
              realId: 3010
            },
            {
              id: 12,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'customer_group:view',
              description: 'User can view',
              order: 2,
              realId: 3050
            },
            {
              id: 13,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'customer_group:create',
              description: 'User can create',
              order: 3,
              realId: 3020
            },
            {
              id: 14,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'customer_group:update',
              description: 'User can update',
              order: 4,
              realId: 3030
            },
            {
              id: 15,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'customer_group:delete',
              description: 'User can delete',
              order: 5,
              realId: 3040
            }
          ]
        },
        {
          id: 4,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'customer',
          description: 'Quản lý Tài khoản ví cá nhân',
          featureId: 4,
          permissions: [
            {
              id: 16,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'customer:approve',
              order: 1,
              description: 'User can approve',
              realId: 4010
            },
            {
              id: 17,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'customer:view',
              description: 'User can view',
              order: 2,
              realId: 4050
            },
            {
              id: 18,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'customer:create',
              description: 'User can create',
              order: 3,
              realId: 4020
            },
            {
              id: 19,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'customer:update',
              description: 'User can update',
              order: 4,
              realId: 4030
            },
            {
              id: 20,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'customer:delete',
              description: 'User can delete',
              order: 5,
              realId: 4040
            }
          ]
        },
        {
          id: 5,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'customer_transaction',
          description: 'Quản lý Giao dịch ví cá nhân',
          featureId: 5,
          permissions: [
            {
              id: 21,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'customer_transaction:approve',
              order: 1,
              description: 'User can approve',
              realId: 5010
            },
            {
              id: 22,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'customer_transaction:view',
              description: 'User can view',
              order: 2,
              realId: 5050
            },
            {
              id: 23,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'customer_transaction:create',
              description: 'User can create',
              order: 3,
              realId: 5020
            },
            {
              id: 24,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'customer_transaction:update',
              description: 'User can update',
              order: 4,
              realId: 5030
            },
            {
              id: 25,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'customer_transaction:delete',
              description: 'User can delete',
              order: 5,
              realId: 5040
            }
          ]
        }
      ]
    },
    // {
    //   id: 3,
    //   createdAt: '2023-01-11T04:47:44.830Z',
    //   updatedAt: '2023-01-11T04:47:44.830Z',
    //   deletedAt: null,
    //   name: 'Quản lý Sản phẩm',
    //   groups: [
    //     {
    //       id: 6,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'services',
    //       description: 'Quản lý Dịch vụ',
    //       featureId: 6,
    //       permissions: [
    //         {
    //           id: 26,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'services:approve',
    //           description: 'User can approve',
    //           order: 1,
    //           realId: 6010
    //         },
    //         {
    //           id: 27,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'services:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 6050
    //         },
    //         {
    //           id: 28,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'services:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 6020
    //         },
    //         {
    //           id: 29,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'services:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 6030
    //         },
    //         {
    //           id: 30,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'services:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 6040
    //         }
    //       ]
    //     },
    //     {
    //       id: 7,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'product_type',
    //       description: 'Quản lý Loại sản phẩm',
    //       featureId: 7,
    //       permissions: [
    //         {
    //           id: 31,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'product_type:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 7010
    //         },
    //         {
    //           id: 32,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'product_type:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 7050
    //         },
    //         {
    //           id: 33,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'product_type:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 7020
    //         },
    //         {
    //           id: 34,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'product_type:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 7030
    //         },
    //         {
    //           id: 35,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'product_type:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 7040
    //         }
    //       ]
    //     },
    //     {
    //       id: 8,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'product',
    //       description: 'Quản lý Sản phẩm (bao gồm sản phẩm con)',
    //       featureId: 8,
    //       permissions: [
    //         {
    //           id: 36,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'product:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 8010
    //         },
    //         {
    //           id: 37,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'product:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 8050
    //         },
    //         {
    //           id: 38,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'product:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 8020
    //         },
    //         {
    //           id: 39,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'product:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 8030
    //         },
    //         {
    //           id: 40,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'product:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 8040
    //         }
    //       ]
    //     },
    //     {
    //       id: 9,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'manufacturer',
    //       description: 'Quản lý Nhà cung cấp',
    //       featureId: 9,
    //       permissions: [
    //         {
    //           id: 41,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'manufacturer:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 9010
    //         },
    //         {
    //           id: 42,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'manufacturer:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 9050
    //         },
    //         {
    //           id: 43,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'manufacturer:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 9020
    //         },
    //         {
    //           id: 44,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'manufacturer:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 9030
    //         },
    //         {
    //           id: 45,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'manufacturer:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 9040
    //         }
    //       ]
    //     },
    //     {
    //       id: 10,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'input_discount',
    //       description: 'Quản lý Chiết khấu đầu vào',
    //       featureId: 10,
    //       permissions: [
    //         {
    //           id: 46,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'input_discount:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 1110
    //         },
    //         {
    //           id: 47,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'input_discount:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 1150
    //         },
    //         {
    //           id: 48,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'input_discount:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 1120
    //         },
    //         {
    //           id: 49,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'input_discount:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 1130
    //         },
    //         {
    //           id: 50,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'input_discount:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 1140
    //         }
    //       ]
    //     },
    //     {
    //       id: 11,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'product_discount',
    //       description: 'Quản lý Chiết khấu sản phẩm',
    //       featureId: 11,
    //       permissions: [
    //         {
    //           id: 51,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'product_discount:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 1210
    //         },
    //         {
    //           id: 52,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'product_discount:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 1250
    //         },
    //         {
    //           id: 53,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'product_discount:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 1220
    //         },
    //         {
    //           id: 54,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'product_discount:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 1230
    //         },
    //         {
    //           id: 55,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'product_discount:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 1240
    //         }
    //       ]
    //     },
    //     {
    //       id: 12,
    //       createdAt: '2023-01-11T04:47:57.676Z',
    //       updatedAt: '2023-01-11T04:47:57.676Z',
    //       deletedAt: null,
    //       name: 'sale_fee',
    //       description: 'Quản lý Phí bán hàng',
    //       featureId: 12,
    //       permissions: [
    //         {
    //           id: 56,
    //           createdAt: '2023-01-11T01:38:31.369Z',
    //           updatedAt: '2023-01-11T01:40:48.172Z',
    //           deletedAt: null,
    //           permission: 'sale_fee:approve',
    //           order: 1,
    //           description: 'User can approve',
    //           realId: 1310
    //         },
    //         {
    //           id: 57,
    //           createdAt: '2023-01-11T01:38:45.936Z',
    //           updatedAt: '2023-01-11T01:38:45.936Z',
    //           deletedAt: null,
    //           permission: 'sale_fee:view',
    //           description: 'User can view',
    //           order: 2,
    //           realId: 1350
    //         },
    //         {
    //           id: 58,
    //           createdAt: '2023-01-11T01:38:55.771Z',
    //           updatedAt: '2023-01-11T01:38:55.771Z',
    //           deletedAt: null,
    //           permission: 'sale_fee:create',
    //           description: 'User can create',
    //           order: 3,
    //           realId: 1320
    //         },
    //         {
    //           id: 59,
    //           createdAt: '2023-01-11T01:39:13.126Z',
    //           updatedAt: '2023-01-11T01:39:13.126Z',
    //           deletedAt: null,
    //           permission: 'sale_fee:update',
    //           description: 'User can update',
    //           order: 4,
    //           realId: 1330
    //         },
    //         {
    //           id: 60,
    //           createdAt: '2023-01-11T01:39:21.431Z',
    //           updatedAt: '2023-01-11T01:39:21.431Z',
    //           deletedAt: null,
    //           permission: 'sale_fee:delete',
    //           description: 'User can delete',
    //           order: 5,
    //           realId: 1340
    //         }
    //       ]
    //     }
    //   ]
    // },
    {
      id: 4,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Quản lý Phí hệ thống',
      groups: [
        {
          id: 13,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'direct_deposit',
          description: 'Quản lý Chính sách nạp tiền trực tiếp',
          featureId: 13,
          permissions: [
            {
              id: 61,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'direct_deposit:approve',
              description: 'User can approve',
              order: 1,
              realId: 1410
            },
            {
              id: 62,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'direct_deposit:view',
              description: 'User can view',
              order: 2,
              realId: 1450
            },
            {
              id: 63,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'direct_deposit:create',
              description: 'User can create',
              order: 3,
              realId: 1420
            },
            {
              id: 64,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'direct_deposit:update',
              description: 'User can update',
              order: 4,
              realId: 1430
            },
            {
              id: 65,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'direct_deposit:delete',
              description: 'User can delete',
              order: 5,
              realId: 1440
            }
          ]
        },
        {
          id: 14,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'wallet_transfer',
          description: 'Quản lý Chính sách chuyển tiền ví điện tử',
          featureId: 14,
          permissions: [
            {
              id: 66,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'wallet_transfer:approve',
              order: 1,
              description: 'User can approve',
              realId: 1510
            },
            {
              id: 67,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'wallet_transfer:view',
              description: 'User can view',
              order: 2,
              realId: 1550
            },
            {
              id: 68,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'wallet_transfer:create',
              description: 'User can create',
              order: 3,
              realId: 1520
            },
            {
              id: 69,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'wallet_transfer:update',
              description: 'User can update',
              order: 4,
              realId: 1530
            },
            {
              id: 70,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'wallet_transfer:delete',
              description: 'User can delete',
              order: 5,
              realId: 1540
            }
          ]
        },
        {
          id: 15,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'wallet_payment',
          description: 'Quản lý Chính sách thanh toàn bằng ví',
          featureId: 15,
          permissions: [
            {
              id: 71,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'wallet_payment:approve',
              order: 1,
              description: 'User can approve',
              realId: 1610
            },
            {
              id: 72,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'wallet_payment:view',
              description: 'User can view',
              order: 2,
              realId: 1650
            },
            {
              id: 73,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'wallet_payment:create',
              description: 'User can create',
              order: 3,
              realId: 1620
            },
            {
              id: 74,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'wallet_payment:update',
              description: 'User can update',
              order: 4,
              realId: 1630
            },
            {
              id: 75,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'wallet_payment:delete',
              description: 'User can delete',
              order: 5,
              realId: 1640
            }
          ]
        },
        {
          id: 16,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'bank_payment',
          description:
            'Quản lý Chính sách thanh toán bằng tài khoản/thẻ ngân hàng',
          featureId: 16,
          permissions: [
            {
              id: 76,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'bank_payment:approve',
              order: 1,
              description: 'User can approve',
              realId: 1710
            },
            {
              id: 77,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'bank_payment:view',
              description: 'User can view',
              order: 2,
              realId: 1750
            },
            {
              id: 78,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'bank_payment:create',
              description: 'User can create',
              order: 3,
              realId: 1720
            },
            {
              id: 79,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'bank_payment:update',
              description: 'User can update',
              order: 4,
              realId: 1730
            },
            {
              id: 80,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'bank_payment:delete',
              description: 'User can delete',
              order: 5,
              realId: 1740
            }
          ]
        },
        {
          id: 17,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'withdraw_money',
          description: 'Quản lý Chính sách rút tiền',
          featureId: 17,
          permissions: [
            {
              id: 81,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'withdraw_money:approve',
              order: 1,
              description: 'User can approve',
              realId: 1810
            },
            {
              id: 82,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'withdraw_money:view',
              description: 'User can view',
              order: 2,
              realId: 1850
            },
            {
              id: 83,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'withdraw_money:create',
              description: 'User can create',
              order: 3,
              realId: 1820
            },
            {
              id: 84,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'withdraw_money:update',
              description: 'User can update',
              order: 4,
              realId: 1830
            },
            {
              id: 85,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'withdraw_money:delete',
              description: 'User can delete',
              order: 5,
              realId: 1840
            }
          ]
        },
        {
          id: 18,
          createdAt: '2023-01-18T04:47:57.676Z',
          updatedAt: '2023-01-18T04:47:57.676Z',
          deletedAt: null,
          name: 'transaction_limit',
          description: 'Quản lý Hạn mức giao dịch',
          featureId: 18,
          permissions: [
            {
              id: 86,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'transaction_limit:approve',
              order: 1,
              description: 'User can approve',
              realId: 1910
            },
            {
              id: 87,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'transaction_limit:view',
              description: 'User can view',
              order: 2,
              realId: 1950
            },
            {
              id: 88,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'transaction_limit:create',
              description: 'User can create',
              order: 3,
              realId: 1920
            },
            {
              id: 89,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'transaction_limit:update',
              description: 'User can update',
              order: 4,
              realId: 1930
            },
            {
              id: 90,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'transaction_limit:delete',
              description: 'User can delete',
              order: 5,
              realId: 1940
            }
          ]
        },
        {
          id: 19,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'transaction_revert',
          description: 'Quản lý Phí giao dịch revert',
          featureId: 19,
          permissions: [
            {
              id: 91,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'transaction_revert:approve',
              order: 1,
              description: 'User can approve',
              realId: 2110
            },
            {
              id: 92,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'transaction_revert:view',
              description: 'User can view',
              order: 2,
              realId: 2150
            },
            {
              id: 93,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'transaction_revert:create',
              description: 'User can create',
              order: 3,
              realId: 2120
            },
            {
              id: 94,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'transaction_revert:update',
              description: 'User can update',
              order: 4,
              realId: 2130
            },
            {
              id: 95,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'transaction_revert:delete',
              description: 'User can delete',
              order: 5,
              realId: 2140
            }
          ]
        },
        {
          id: 20,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'transaction_refund',
          description: 'Quản lý Phí giao dịch refund',
          featureId: 20,
          permissions: [
            {
              id: 96,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'transaction_refund:approve',
              order: 1,
              description: 'User can approve',
              realId: 2210
            },
            {
              id: 97,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'transaction_refund:view',
              description: 'User can view',
              order: 2,
              realId: 2250
            },
            {
              id: 98,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'transaction_refund:create',
              description: 'User can create',
              order: 3,
              realId: 2220
            },
            {
              id: 99,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'transaction_refund:update',
              description: 'User can update',
              order: 4,
              realId: 2230
            },
            {
              id: 100,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'transaction_refund:delete',
              description: 'User can delete',
              order: 5,
              realId: 2240
            }
          ]
        }
      ]
    },
    {
      id: 5,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Quản lý Ngân hàng và Kết nối',
      groups: [
        {
          id: 21,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'bank_management',
          description: 'Quản lý Ngân hàng ',
          featureId: 21,
          permissions: [
            {
              id: 101,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'bank_management:approve',
              description: 'User can approve',
              order: 1,
              realId: 2320
            },
            {
              id: 102,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'bank_management:view',
              description: 'User can view',
              order: 2,
              realId: 2350
            },
            {
              id: 103,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'bank_management:create',
              description: 'User can create',
              order: 3,
              realId: 2320
            },
            {
              id: 104,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'bank_management:update',
              description: 'User can update',
              order: 4,
              realId: 2330
            },
            {
              id: 105,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'bank_management:delete',
              description: 'User can delete',
              order: 5,
              realId: 2340
            }
          ]
        },
        {
          id: 22,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'connect_management',
          description: 'Quản lý Kết nối',
          featureId: 22,
          permissions: [
            {
              id: 106,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'connect_management:approve',
              order: 1,
              description: 'User can approve',
              realId: 2410
            },
            {
              id: 107,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'connect_management:view',
              description: 'User can view',
              order: 2,
              realId: 2450
            },
            {
              id: 108,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'connect_management:create',
              description: 'User can create',
              order: 3,
              realId: 2420
            },
            {
              id: 109,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'connect_management:update',
              description: 'User can update',
              order: 4,
              realId: 2430
            },
            {
              id: 110,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'connect_management:delete',
              description: 'User can delete',
              order: 5,
              realId: 2440
            }
          ]
        }
      ]
    },
    {
      id: 6,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Báo cáo',
      groups: [
        {
          id: 23,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'internal_report',
          description: 'Báo cáo Quản trị Nội bộ',
          featureId: 23,
          permissions: [
            {
              id: 111,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'internal_report:approve',
              description: 'User can approve',
              order: 1,
              realId: 2510
            },
            {
              id: 112,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'internal_report:view',
              description: 'User can view',
              order: 2,
              realId: 2550
            },
            {
              id: 113,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'internal_report:create',
              description: 'User can create',
              order: 3,
              realId: 2520
            },
            {
              id: 114,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'internal_report:update',
              description: 'User can update',
              order: 4,
              realId: 2530
            },
            {
              id: 115,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'internal_report:delete',
              description: 'User can delete',
              order: 5,
              realId: 2540
            }
          ]
        },
        // {
        //   id: 23,
        //   createdAt: '2023-01-11T04:47:57.676Z',
        //   updatedAt: '2023-01-11T04:47:57.676Z',
        //   deletedAt: null,
        //   name: 'state_bank_report',
        //   description: 'Báo cáo NHNN',
        //   featureId: 24,
        //   permissions: [
        //     {
        //       id: 106,
        //       createdAt: '2023-01-11T01:38:31.369Z',
        //       updatedAt: '2023-01-11T01:40:48.172Z',
        //       deletedAt: null,
        //       permission: 'state_bank_report:approve',
        //       order: 1,
        //       description: 'User can approve',
        //       realId: 2610
        //     },
        //     {
        //       id: 107,
        //       createdAt: '2023-01-11T01:38:45.936Z',
        //       updatedAt: '2023-01-11T01:38:45.936Z',
        //       deletedAt: null,
        //       permission: 'state_bank_report:view',
        //       description: 'User can view',
        //       order: 2,
        //       realId: 2650
        //     },
        //     {
        //       id: 108,
        //       createdAt: '2023-01-11T01:38:55.771Z',
        //       updatedAt: '2023-01-11T01:38:55.771Z',
        //       deletedAt: null,
        //       permission: 'state_bank_report:create',
        //       description: 'User can create',
        //       order: 3,
        //       realId: 2620
        //     },
        //     {
        //       id: 109,
        //       createdAt: '2023-01-11T01:39:13.126Z',
        //       updatedAt: '2023-01-11T01:39:13.126Z',
        //       deletedAt: null,
        //       permission: 'state_bank_report:update',
        //       description: 'User can update',
        //       order: 4,
        //       realId: 2630
        //     },
        //     {
        //       id: 110,
        //       createdAt: '2023-01-11T01:39:21.431Z',
        //       updatedAt: '2023-01-11T01:39:21.431Z',
        //       deletedAt: null,
        //       permission: 'state_bank_report:delete',
        //       description: 'User can delete',
        //       order: 5,
        //       realId: 2640
        //     }
        //   ]
        // }
      ]
    },
    {
      id: 7,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Thông báo và Cấu hình hệ thống',
      groups: [
        {
          id: 24,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'notification',
          description: 'Báo cáo Quản trị Nội bộ',
          featureId: 25,
          permissions: [
            {
              id: 116,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'notification:approve',
              description: 'User can approve',
              order: 1,
              realId: 2710
            },
            {
              id: 117,
              createdAt: '2023-01-11T01:38:45.936Z',
              updatedAt: '2023-01-11T01:38:45.936Z',
              deletedAt: null,
              permission: 'notification:view',
              description: 'User can view',
              order: 2,
              realId: 2750
            },
            {
              id: 118,
              createdAt: '2023-01-11T01:38:55.771Z',
              updatedAt: '2023-01-11T01:38:55.771Z',
              deletedAt: null,
              permission: 'notification:create',
              description: 'User can create',
              order: 3,
              realId: 2720
            },
            {
              id: 119,
              createdAt: '2023-01-11T01:39:13.126Z',
              updatedAt: '2023-01-11T01:39:13.126Z',
              deletedAt: null,
              permission: 'notification:update',
              description: 'User can update',
              order: 4,
              realId: 2730
            },
            {
              id: 120,
              createdAt: '2023-01-11T01:39:21.431Z',
              updatedAt: '2023-01-11T01:39:21.431Z',
              deletedAt: null,
              permission: 'notification:delete',
              description: 'User can delete',
              order: 5,
              realId: 2740
            }
          ]
        }
      ]
    },
    {
      id: 8,
      createdAt: '2023-01-11T04:47:44.830Z',
      updatedAt: '2023-01-11T04:47:44.830Z',
      deletedAt: null,
      name: 'Quản lý thu chi',
      groups: [
        {
          id: 24,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'payment_transaction',
          description: 'Quản lý giao dịch',
          featureId: 26,
          permissions: [
            {
              id: 2760,
              permission: 'payment_transaction:view',
              description: 'Quản lý giao dịch thu chi view',
              realId: 2770,
              order: 2
            }
          ]
        },
        {
          id: 25,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'sms_stat',
          description: 'Quản lý tin nhắn',
          featureId: 28,
          permissions: [
            {
              id: 2770,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'sms_stat:view',
              description: 'Số liệu tin nhắn',
              realId: 2770,
              order: 2
            }
          ]
        },
        {
          id: 26,
          createdAt: '2023-01-11T04:47:57.676Z',
          updatedAt: '2023-01-11T04:47:57.676Z',
          deletedAt: null,
          name: 'repayment',
          description: 'Quản lý thu chi',
          featureId: 29,
          permissions: [
            {
              id: 2780,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'repayment:view',
              description: 'Thu chi view',
              realId: 2780,
              order: 2
            },
            {
              id: 2790,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'repayment:create',
              description: 'Thu chi create',
              realId: 2790,
              order: 3
            },
            {
              id: 2800,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'repayment:update',
              description: 'Thu chi update',
              realId: 2800,
              order: 4
            },
            {
              id: 2810,
              createdAt: '2023-01-11T01:38:31.369Z',
              updatedAt: '2023-01-11T01:40:48.172Z',
              deletedAt: null,
              permission: 'repayment:delete',
              description: 'Thu chi delete',
              realId: 2810,
              order: 5
            }
          ]
        }
      ]
    }
  ],
  statusCode: 200,
  message: ''
}

export const getMePermission = [1, 3, 7, 9, 4, 6]
