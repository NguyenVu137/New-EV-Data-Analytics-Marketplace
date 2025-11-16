export const adminMenu = [
    { // Quản lí người dùng
        name: 'menu.admin.manage-user',
        menus: [
            {
                name: 'menu.admin.crud', link: '/system/user-manage',
            },

            {
                name: 'menu.admin.crud-redux', link: '/system/user-redux',
            },

            {
                name: 'menu.admin.manage-provider', link: '/system/user-provider',
                // subMenus: [
                //     { name: 'menu.system.system-administrator.user-manage', link: '/system/user-manage' },
                //     { name: 'menu.system.system-administrator.user-redux', link: '/system/user-redux' },
                // ]
            },

            {
                name: 'menu.admin.manage-admin', link: '/system/user-admin',
            },

        ]
    },
    { // Quản lí kiểm duyệt
        name: 'menu.admin.censor',
        menus: [
            {
                name: 'menu.admin.manage-censor', link: '/system/manage-censor',
            },

        ]
    },

    { // Thống kê thị trường
        name: 'menu.admin.analyticsdashboard',
        menus: [
            {
                name: 'menu.admin.analyticsdashboard', link: '/system/analyticsdashboard',
            },

        ]
    },
    
    { // Quản lý thanh toán
        name: 'menu.admin.payout',
        menus: [
            {
                name: 'menu.admin.manage-payouts', link: '/system/manage-payouts',
            },
        ]
    },
];
export const providerMenu = [
    { // Quản lí dữ liệu
        name: 'menu.admin.data',
        menus: [
            {
                name: 'menu.admin.manage-data', link: '/system/manage-data',
            },

        ]
    },
    
    { // Thu nhập của Provider
        name: 'menu.provider.earnings',
        menus: [
            {
                name: 'menu.provider.my-payouts', link: '/system/my-payouts',
            },
        ]
    },
];

export const consumerMenu = [
    { // Lịch sử mua hàng
        name: 'menu.consumer.purchases',
        menus: [
            {
                name: 'menu.consumer.my-purchases', link: '/system/my-purchases',
            },
        ]
    },
];