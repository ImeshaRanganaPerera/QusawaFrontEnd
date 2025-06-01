export interface APIResponse {
    amount: string;
    message: any;
    data: any[];
}

interface SubMenuItem {
    routerLink: string;
    label: string;
    queryParams?: any;
}

interface MenuItem {
    routerLink?: string;
    icon: string;
    label: string;
    queryParams?: any;
    submenu?: SubMenuItem[];
}

export interface NavItem {
    mainlable: string;
    menu: MenuItem[];
}

export interface IType {
    id: string;
    typeName: string;
}

export interface IDiscountLevel {
    id: string;
    level: string;
}

export interface IBrand {
    id: string;
    brandName: string;
}

export interface IUser {
    id: string;
    name: string;
    nic: string;
    phoneNumber: string;
    address: string;
    dateofbirth: string;
    role: string;
}

export interface IProduct {
    date: string | number | Date;
    quantity: any;
    product: any;
    center: string;
    restockDate: string | number | Date;
    id: string;
    unit: string;
    itemCode: string;
    barcode: string;
    productName: string;
    printName: string;
    image: string;
    criticalLevel: number;
    status: Boolean;
    typeId: string;
    brandId: string;
    createdAt: Date;
    type?: IType[];
    brand?: IBrand[];
}

export interface IParty {
    id: string;
    name: string;
    nic: string;
    phoneNumber: string;
    creditValue: string;
    creditPeriod: string;
    address1: string;
    address2: string;
    city: string;
    email: string;
    isVerified: string;
    chartofAccountId: string;
    partyCategoryId: string;
    user: any
    createdBy: string;
    partyGroupId: number;
    partyCategory: any;
}

export interface IPartyCategory {
    id: string;
    category: string;
    partyGroupId: string;
}

export interface IPartyType {
    id: string;
    type: string;
}

export interface ICenter {
    id: string;
    centerName: string;
    mode: string;
}

export interface IUserCenter {
    centerId: string;
    userId: string;
    center?: ICenter;
}

export interface IVoucherProduct {
    id: String;
    cost: number;
    quantity: number;
    discount: number;
    MRP: number;
    price: number;
    productId: String;
}

export interface IVoucher {
    supplierId: any;
    id: String;
    voucherNumber: string;
    level:string;
    date: Date;
    location: String;
    returnValue: number,
    paidValue: number;
    value: number;
    amount: number;
    partyId: String;
    voucherGroupId: String;
    centerId: String;
    createdBy: String;
    expand: boolean;
    productList?: IVoucherProduct
    checked?: boolean
}

export interface IChequeBook {
    id: String;
    chequeBookNumber: string;
    totalCheques: number;
    startNumber: String;
    endNumber: String;
    remainingCheques: number;
    chartofAccountId: String;
}


export interface ITableRow {
    productName: string;
    printName: string;
    productId: string;
    currentStock: number;
    cost: any;
    quantity: number;
    sellingPrice: number;
    minPrice: number;
    MRP: number;
    discount: any;
    amount: number;
    batchNo: any;
    ExpnotifDays:number;
    expiryDate:any,
    Packsize:any,
    Manufacture:any,
    country:any,
    usdRate:any,
    mfdate:any,
}

export interface ItemData {
    id: number;
    supplier_invoice_no: string;
    date: number;
    invoice_amount: number;
    settlement_amount: number;
    due_amount: number;

}

export interface Itemdata {
    id: string;
    account: string;
    particulars: string;
    debit: number;
    credit: number;
}