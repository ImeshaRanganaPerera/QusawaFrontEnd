import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { navbarData } from './nav-data';
import { AuthService } from '../../services/auth/auth.service';
import { NavItem, APIResponse } from '../../shared/interface';
import { VoucherGrpService } from '../../services/voucherGroup/voucher-grp.service';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { UserProfileComponent } from '../dashboard/Profile/user-profile/user-profile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent implements OnInit {

  private drawerService = inject(NzDrawerService);

  currentDate: Date = new Date();
  vouchergrplabels: any = [];

  voucherGrpservice = inject(VoucherGrpService)
  name: any = localStorage.getItem('name');

  navData: any[] = [{
    mainlable: 'DASHBOARD',
    menu: [
      {
        routerLink: './dash',
        icon: 'appstore',
        label: 'Dashboard',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER']
      },
      {
        routerLink: './pending-transactions',
        icon: 'loading',
        label: 'Pending Approvals',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './approved-transactions',
        icon: 'loading',
        label: 'Approved Transactions',
        roles: ['SUPERVISOR'],
      },
    ]
  },
  {
    mainlable: 'MASTER FILE',
    menu: [
      {
        icon: 'product',
        label: 'Product',
        roles: ['ADMIN', 'MANAGER'],
        submenu: [
          {
            routerLink: './product',
            label: 'Product List',
            roles: ['ADMIN', 'MANAGER'],
          },
          // {
          //   routerLink: './brand',
          //   label: 'Brand List',
          //   roles: ['ADMIN', 'MANAGER'],
          // },
          {
            routerLink: './type',
            label: 'Type List',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './discountLevel',
            label: 'Discount Levels',
            roles: ['ADMIN', 'MANAGER'],
          },
        ]
      },
      {
        icon: 'user-add',
        label: 'Customer',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
        submenu: [
          {
            label: 'Customer',
            routerLink: './customer',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER']
          },
          {
            label: 'Category',
            routerLink: './cutomer-category',
            roles: ['ADMIN', 'MANAGER']
          },
          {
            label: 'Customer Type',
            routerLink: './cutomer-type',
            roles: ['ADMIN', 'MANAGER']
          },
        ]
      },
      {
        icon: 'usergroup-delete',
        label: 'Visiting Customer',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
        submenu: [
          {
            label: 'Visiting Customer',
            routerLink: './visitingCustomer',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER']
          },
          {
            label: 'Visited List',
            routerLink: './visitingCustomerlist',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER']
          },
        ]
      },
      {
        routerLink: './supplier',
        icon: 'shop',
        label: 'Supplier',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './user',
        icon: 'user',
        label: 'User',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './center',
        icon: 'home',
        label: 'Center',
        roles: ['ADMIN'],
      },
      {
        routerLink: './commissionLevel',
        icon: 'sliders',
        label: 'Commission Levels',
        roles: ['ADMIN', 'MANAGER'],
      }
    ]
  },
  {
    mainlable: 'TRANSACTION',
    menu: [
      {
        routerLink: '/sales',
        icon: 'shopping',
        label: 'Invoice',
        roles: ['ADMIN', 'MANAGER', 'SALESMEN'],
        queryParams: { type: 'Sales' }
      },
      {
        routerLink: '/salesOrder',
        icon: 'form',
        label: 'Sales Order',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER', 'SALESMEN'],
        queryParams: { type: 'Sales Order' }
      },
      {
        routerLink: '/salesReturn',
        icon: 'fall',
        label: 'Sales Return',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER', 'SALESMEN'],
        queryParams: { type: 'Sales Return' }
      },
      {
        routerLink: './manage-GRN',
        icon: 'ungroup',
        label: 'GRN',
        roles: ['ADMIN', 'MANAGER'],
        queryParams: { type: 'GRN' }
      },
      {
        routerLink: './purchase-order-return',
        icon: 'retweet',
        label: 'Purchase Return',
        roles: ['ADMIN', 'MANAGER'],
        queryParams: { type: 'Purchase Return' }
      },
      {
        routerLink: './purchase-order',
        icon: 'shopping-cart',
        label: 'Purchase Order',
        roles: ['ADMIN', 'MANAGER'],
        queryParams: { type: 'Purchase Order' }
      },
      {
        routerLink: './stock-transfer',
        icon: 'sync',
        label: 'Stock Transfer',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
        queryParams: { type: 'Stock Transfer' }
      },
      // {
      //   routerLink: './stock-verification',
      //   icon: 'sync',
      //   label: 'Stock Verification',
      //   roles: ['ADMIN', 'MANAGER'],
      //   queryParams: { type: 'Stock Verification' }
      // },
    ]
  },
  {
    mainlable: 'ACCOUNTS',
    menu: [
      {
        icon: 'file-done',
        label: 'Chart of Accounts',
        roles: ['ADMIN', 'MANAGER'],
        submenu: [
          {
            routerLink: './chartofAcc',
            label: 'Account List',
            roles: ['ADMIN', 'MANAGER'],
            queryParams: { type: 'Account' }
          },
          {
            routerLink: './accCategory',
            label: 'Account Catergory',
            roles: ['ADMIN', 'MANAGER'],
            queryParams: { type: 'Category' }
          },
          {
            routerLink: './accGroup',
            label: 'Account Group',
            roles: ['ADMIN', 'MANAGER'],
            queryParams: { type: 'Group' }
          },
        ]
      },
      {
        routerLink: './supplier-enter-bill',
        icon: 'red-envelope',
        label: 'Supplier Enter Bill',
        roles: ['ADMIN', 'MANAGER'],
      },
      // {
      //   routerLink: './DayBook',
      //   icon: 'red-envelope',
      //   label: 'Day Book',
      //   roles: ['ADMIN', 'MANAGER'],
      // },
      {
        routerLink: './payment',
        icon: 'ungroup',
        label: 'Payment',
        roles: ['ADMIN', 'MANAGER'],
        queryParams: { type: 'Payment' }
      },
      {
        routerLink: './advancePayment',
        icon: 'account-book',
        label: 'Advance Payment To Supplier',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './make-deposit',
        icon: 'schedule',
        label: 'Make Deposit',
        roles: ['ADMIN', 'MANAGER'],
      },

      // {
      //   routerLink: './directpayment',
      //   icon: 'fund',
      //   label: 'Direct Payment',
      //   roles: ['ADMIN', 'MANAGER'],
      //   queryParams: { type: 'DirectPayment' }
      // },
      {
        routerLink: './receipt',
        icon: 'audit',
        label: 'Receipt',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
        queryParams: { type: 'Receipt' }
      },
      {
        routerLink: './create-utility',
        icon: 'reconciliation',
        label: 'Record Expenses',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './pay-utility',
        icon: 'delivered-procedure',
        label: 'Expense Settlement',
        roles: ['ADMIN', 'MANAGER'],
        queryParams: { type: 'UtilityBillPayment' }
      },
      {
        routerLink: './journal-entry',
        icon: 'read',
        label: 'Journal Entry',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './petty-cash',
        icon: 'book',
        label: 'Petty Cash & IOU Manager',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './cheque',
        icon: 'idcard',
        label: 'Cheque Book',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        routerLink: './bankReconciliation',
        icon: 'bank',
        label: 'Bank Reconciliation',
        roles: ['ADMIN', 'MANAGER'],
      },
    ]
  },
  {
    mainlable: 'REPORTS',
    menu: [
      {
        icon: 'transaction',
        label: 'Account',
        roles: ['ADMIN', 'MANAGER'],
        submenu: [
          {
            routerLink: './customer-outstanding',
            icon: 'dollar-circle',
            label: 'Customer Receivables',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
            queryParams: { type: 'Customer Outstanding' }
          },
          {
            routerLink: './supplier-outstanding',
            icon: 'signature',
            label: 'Supplier Payables',
            roles: ['ADMIN', 'MANAGER'],
            queryParams: { type: 'Supplier Outstanding' }
          },
          {
            routerLink: './customer-settlement',
            icon: 'issues-close',
            label: 'Customer Payment Settlement',
            roles: ['ADMIN', 'MANAGER'],
            queryParams: { type: 'Customer Settlement' }
          },
          {
            routerLink: './chequeinhand',
            icon: 'schedule',
            label: 'Undeposited Cheques Ledger',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './trial-balance',
            icon: 'file-text',
            label: 'Trial Balance Review',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './ledger-listing',
            icon: 'folder-open',
            label: 'Ledger Transactions',
            roles: ['ADMIN', 'MANAGER'],
          },
          // {
          //   routerLink: `./transaction`,
          //   queryParams: { type: 'Direct Payment', category: 'Account', voucherName: 'DIRECT PAYMENT' },
          //   label: 'Direct Payment',
          //   roles: ['ADMIN', 'MANAGER'], 
          // },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Journal Entry', category: 'Account', voucherName: 'JOURNAL-ENTRY' },
            label: 'Journal Entry',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Make Deposit', category: 'Account', voucherName: 'MAKE-DEPOSIT' },
            label: 'Make Deposit',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Payment', category: 'Account', voucherName: 'PAYMENT' },
            label: 'Payment',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Advance Payment', category: 'Account', voucherName: 'ADVANCE-PAYMENT' },
            label: 'Advance Payment',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Petty Cash', category: 'Account', voucherName: 'PETTY-CASH' },
            label: 'Petty Cash',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Petty Cash IOU', category: 'Account', voucherName: 'PETTY-CASH-IOU' },
            label: 'Petty Cash IOU',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Receipt', category: 'Account', voucherName: 'RECEIPT' },
            label: 'Receipt',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Supplier Bill', category: 'Account', voucherName: 'SUPPLIER-BILL' },
            label: 'Supplier Bill',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Utility Bill Create', category: 'Account', voucherName: 'UTILITY-BILL-CREATE' },
            label: 'Utility Bill Create',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Utility Bill Payment', category: 'Account', voucherName: 'UTILITY-BILL-PAYMENT' },
            label: 'Utility Bill Payment',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './bankRec-Report',
            icon: 'schedule',
            label: 'Bank Reconciliation Report',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './profit-and-lost',
            icon: 'schedule',
            label: 'Profit and Lost',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './balance-sheet',
            icon: 'schedule',
            label: 'Balance Sheet',
            roles: ['ADMIN', 'MANAGER'],
          },
        ]
      },
      {
        icon: 'transaction',
        label: 'Inventory',
        roles: ['ADMIN', 'MANAGER'],
        submenu: [
          {
            routerLink: `./transaction`,
            queryParams: { type: 'GRN', category: 'Inventory', voucherName: 'GRN' },
            label: 'GRN',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Purchase Order', category: 'Inventory', voucherName: 'PURCHASE-ORDER' },
            label: 'Purchase Order',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Purchase Return', category: 'Inventory', voucherName: 'PURCHASE-RETURN' },
            label: 'Purchase Return',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Stock Transfer', category: 'Inventory', voucherName: 'STOCK-TRANSFER' },
            label: 'Stock Transfer',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './stock',
            icon: 'stock',
            label: 'Stock',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
          },
          {
            routerLink: './productDiscount',
            icon: 'box-plot',
            label: 'Product Discount Level',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
          },
        ]
      },
      {
        icon: 'transaction',
        label: 'Sales',
        roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
        submenu: [
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Invoice', category: 'Sales', voucherName: 'INVOICE' },
            label: 'Invoice Detail',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
          },
          {
            routerLink: `./reject-invoices`,
            queryParams: { type: 'Invoice', category: 'Sales', voucherName: 'INVOICE' },
            label: 'Reject Invoices',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Sales Order', category: 'Sales', voucherName: 'SALES-ORDER' },
            label: 'Sales Order',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER']
          },
          {
            routerLink: `./transaction`,
            queryParams: { type: 'Sales Return', category: 'Sales', voucherName: 'SALES-RETURN' },
            label: 'Sales Return',
            roles: ['ADMIN', 'SALESMEN', 'MANAGER'],
          },
          {
            routerLink: './CostOfSales',
            icon: 'shopping',
            label: 'Cost Of Sales',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './settlement',
            icon: 'transaction',
            label: 'Settlement',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './SalesmanReport',
            icon: 'user',
            label: 'Salesman Report',
            roles: ['ADMIN', 'MANAGER'],
          },
          {
            routerLink: './commission-report',
            icon: 'user',
            label: 'Commission Report',
            roles: ['ADMIN', 'MANAGER'],
          },
        ]
      },
    ]
  },
  ];

  isCollapsed = false;

  ngOnInit(): void {
    // this.voucherGrpservice.get().subscribe((res: APIResponse) => {
    //   this.vouchergrplabels = res.data;
    //   const groupedLabels = this.groupLabelsByCategory(this.vouchergrplabels);

    //   // Add dynamic nav items first
    //   this.addDynamicNavItems(groupedLabels);

    //   // Then call userrolesidemenu to filter based on role
    // });
    this.userrolesidemenu();
  }


  groupLabelsByCategory(labels: any[]): any {
    const groupedLabels: { [key: string]: any[] } = {}; // Change the type to store objects

    labels.forEach(labelObj => {
      const { label, category, voucherName } = labelObj; // Destructure to get voucherName
      if (!groupedLabels[category]) {
        groupedLabels[category] = [];
      }
      groupedLabels[category].push({ label, voucherName }); // Push an object with label and voucherName
    });

    return groupedLabels;
  }

  addDynamicNavItems(groupedLabels: any) {
    const reportsSection = this.navData.find(item => item.mainlable === 'REPORTS');
    if (reportsSection) {
      for (const category in groupedLabels) {
        if (groupedLabels.hasOwnProperty(category)) {
          const submenuItems = groupedLabels[category].map((item: any) => ({
            routerLink: `./transaction`,
            queryParams: { type: item.label, category, voucherName: item.voucherName },
            label: item.label,
            roles: ['ADMIN', 'MANAGER'],  // Ensure roles are correctly assigned
          }));
          reportsSection.menu.unshift({
            icon: 'transaction',
            label: category,
            submenu: submenuItems,
            roles: ['ADMIN', 'MANAGER'],  // Ensure roles are correctly assigned
          });
        }
      }
    }
  }


  role: any;
  filteredList: any[] = [];

  userrolesidemenu() {
    const role = localStorage.getItem('role');
    if (role) {
      this.role = role;
    } else {
      console.error('No role found in localStorage!');
    }

    console.log('Role:', this.role); // Check if the role is correct
    console.log('Initial navData:', this.navData); // Check if navData is populated correctly

    // Map and filter based on roles
    this.filteredList = this.navData
      .map(item => this.filterMenuByRole(item, this.role))
      .filter(item => item.menu.length > 0); // Only keep items with valid menu items

    console.log('Filtered List:', this.filteredList); // Check the filtered menu items
  }

  filterMenuByRole(item: any, role: string): any {
    // Clone the original item to avoid mutating the source
    const filteredItem = { ...item, menu: [] };

    // Loop through each menu item
    item.menu.forEach((menuItem: any) => {
      const hasValidRole = menuItem.roles?.includes(role); // Check if role is allowed for this item

      if (menuItem.submenu) {
        // If there is a submenu, recursively filter the submenu
        const filteredSubmenu = menuItem.submenu.filter((sub: any) => sub.roles?.includes(role));

        if (filteredSubmenu.length > 0) {
          // If the filtered submenu has items, add the main menu item with the filtered submenu
          filteredItem.menu.push({
            ...menuItem,
            submenu: filteredSubmenu
          });
        }
      } else if (hasValidRole) {
        // If there is no submenu and the role is valid, just add the menu item
        filteredItem.menu.push(menuItem);
      }
    });

    return filteredItem;
  }


  //services
  auth = inject(AuthService)

  openUserProfile(): void {
    const drawerRef = this.drawerService.create<UserProfileComponent>({
      // nzTitle: 'User Profile',
      nzContent: UserProfileComponent,
      nzWidth: 720,
      nzClosable: true,
      nzMaskClosable: false,
      nzData: {
        userId: 'current-user-id' // Replace with actual user ID
      }
    });

    drawerRef.afterClose.subscribe(() => {
      // Handle any post-close actions if needed
    });
  }
  logout() {
    this.auth.logout();
  }
}

