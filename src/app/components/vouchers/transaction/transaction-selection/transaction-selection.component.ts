import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../../modules/material/material.module';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-transaction-selection',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './transaction-selection.component.html',
  styleUrl: './transaction-selection.component.scss'
})
export class TransactionSelectionComponent {
  isSpinning = false;
  options = ['GRN', 'Sales', 'Purcahse Order'];

  mode: String = 'GRN';
  grpname: String = 'GRN'

  readonly #modal = inject(NzModalRef);

  selectedIndex = 0;
  handleModelChange(index: number): void {
    if (index == 0) {
      this.mode = 'GRN';
      this.grpname = 'GRN';
    }
    if (index == 1) {
      this.mode = 'Sales';
      this.grpname = 'SALES';
    }
    if (index == 2) {
      this.mode = 'Purcahse Order';
      this.grpname = 'PURCHASE-ORDER';
    }
  }

  onclick() {
    this.#modal.destroy(this.grpname);
  }




}
