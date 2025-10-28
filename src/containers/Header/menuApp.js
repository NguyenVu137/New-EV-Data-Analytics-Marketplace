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
    { // Quản lí dữ liệu
        name: 'menu.admin.data',
        menus: [
            {
                name: 'menu.admin.manage-data', link: '/system/manage-data',
            },

        ]
    },
    { // Quản lí bài đăng
        name: 'menu.admin.post',
        menus: [
            {
                name: 'menu.admin.manage-post', link: '/system/manage-post',
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
]; 