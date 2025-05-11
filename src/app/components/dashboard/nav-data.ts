export const navbarData = [
    {
        mainlable: 'DASHBOARD',
        role: ['ADMIN',"SALESMAN"],
        menu: [
            {
                routerLink: './dash',
                icon: 'appstore',
                label: 'Dashboard',
            }
        ]
    },
    {
        mainlable: 'MASTER FILE',
        role: ['ADMIN',"SALESMAN"],
        menu: [
            {
                icon: 'product',
                label: 'Product',
                submenu: [
                    {
                        routerLink: './product',
                        label: 'Product List'
                    },
                    {
                        routerLink: './brand',
                        label: 'Brand List'
                    },
                    {
                        routerLink: './type',
                        label: 'Type List'
                    },
                    {
                        routerLink: './discountLevel',
                        label: 'Discount Levels'
                    }
                ]
            },
            {
                routerLink: './center',
                icon: 'home',
                label: 'Center'
            },
            {
                icon: 'user-add',
                label: 'Customer',
                submenu: [
                    {
                        label: 'Customer',
                        routerLink: './customer',
                    },
                    {
                        label: 'Category',
                        routerLink: './cutomer-category',
                    },
                ]
            },
            {
                routerLink: './supplier',
                icon: 'shop',
                label: 'Supplier'
            },
            {
                routerLink: './user',
                icon: 'user',
                label: 'User'
            }
        ]
    },
    {
        mainlable: 'TRANSACTION',
        menu: [

            {
                routerLink: '/sales',
                icon: 'shopping',
                label: 'Sales'
            },
            {
                routerLink: './manage-GRN',
                icon: 'ungroup',
                label: 'GRN',
                queryParams: { type: 'GRN' }
            },
            {
                routerLink: './purchase-order-return',
                icon: 'retweet',
                label: 'Purchase Return',
                queryParams: { type: 'Purchase Return' }
            },
            {
                routerLink: './purchase-order',
                icon: 'shopping-cart',
                label: 'Purchase Order',
                queryParams: { type: 'Purchase Order' }
            },
            {
                routerLink: './stock-transfer',
                icon: 'sync',
                label: 'Stock Transfer',
                queryParams: { type: 'Stock Transfer' }
            },            
        ]
    },
    {
        mainlable: 'ACCOUNTS',
        menu: [
            {
                icon: 'file-done',
                label: 'Chart of Accounts',
                submenu: [
                    {
                        routerLink: './chartofAcc',
                        label: 'Account List',
                        queryParams: { type: 'Account' }
                    },
                    {
                        routerLink: './accCategory',
                        label: 'Account Catergory',
                        queryParams: { type: 'Category' }
                    },
                    {
                        routerLink: './accGroup',
                        label: 'Account Group',
                        queryParams: { type: 'Group' }
                    },
                ]
            },
            {
                routerLink: './supplier-enter-bill',
                icon: 'red-envelope',
                label: 'Supplier Enter Bill'
            },
            {
                routerLink: './payment',
                icon: 'ungroup',
                label: 'Payment',
                queryParams: { type: 'Payment' }
            },
            {
                routerLink: './receipt',
                icon: 'audit',
                label: 'Receipt',
                queryParams: { type: 'Receipt' }
            },
            {
                routerLink: './create-utility',
                icon: 'reconciliation',
                label: 'Create Utility Bill',
            },
            {
                routerLink: './pay-utility',
                icon: 'delivered-procedure',
                label: 'Utility Bill Payment',
                queryParams: { type: 'UtilityBillPayment' }
            },
            {
                routerLink: './journal-entry',
                icon: 'read',
                label: 'Journal Entry',
            },
            {
                routerLink: './petty-cash',
                icon: 'book',
                label: 'Petty Cash',
            },
            {
                routerLink: './cheque',
                icon: 'idcard',
                label: 'Cheque',
            },
            {
                routerLink: './bankReconciliation',
                icon: 'bank',
                label: 'Bank Reconciliation',
            },
        ]
    },
    {
        mainlable: 'REPORTS',
        menu: [
            {
                routerLink: './transaction',
                icon: 'transaction',
                label: 'Transaction'
            },
            {
                routerLink: './allcentersproducts',
                icon: 'stock',
                label: 'Stock'
            },
            {
                routerLink: './settlement',
                icon: 'transaction',
                label: 'Settlement'
            },
            {
                routerLink: './SalesmanReport',
                icon: 'man',
                label: 'Salesman Report'
            },
            {
                routerLink: './CostOfSales',
                icon: 'man',
                label: 'Cost Of Sales'
            },
        ]
    },

];