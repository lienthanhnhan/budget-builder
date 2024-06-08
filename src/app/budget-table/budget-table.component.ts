import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Month {
  name: string;
  amount: number;
}

interface Category {
  name: string;
  months: Month[];
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss']
})
export class BudgetTableComponent implements OnChanges {
  @Input() startMonth: string = '';
  @Input() endMonth: string = '';

  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  newIncomeCategoryName: string = '';
  newExpenseCategoryName: string = '';
  newIncomeCategoryAmounts: { [key: string]: number } = {};
  newExpenseCategoryAmounts: { [key: string]: number } = {};
  showContextMenu: boolean = false;
  contextMenuStyle = {};
  months: string[] = [];
  amountApplyAll: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startMonth'] || changes['endMonth']) {
      this.generateMonthRange();
    }
  }

  generateMonthRange() {
    const start = new Date(this.startMonth);
    const end = new Date(this.endMonth);
    const months = [];
    while (start <= end) {
      const monthName = start.toLocaleString('default', { month: 'long' });
      const year = start.getFullYear();
      months.push(`${monthName} ${year}`);
      start.setMonth(start.getMonth() + 1);
    }
    this.months = months;
    this.initCategories();
  }

  initCategories() {
    this.incomeCategories = [];
    this.expenseCategories = [];
  }

  addNewIncomeCategory() {
    if (this.newIncomeCategoryName.trim()) {
      const newCategory: Category = {
        name: this.newIncomeCategoryName,
        months: this.months.map(month => ({
          name: month,
          amount: this.newIncomeCategoryAmounts[month] || 0
        }))
      };
      this.incomeCategories.push(newCategory);
      this.newIncomeCategoryName = '';
      this.newIncomeCategoryAmounts = {};
    }
  }

  addNewExpenseCategory() {
    if (this.newExpenseCategoryName.trim()) {
      const newCategory: Category = {
        name: this.newExpenseCategoryName,
        months: this.months.map(month => ({
          name: month,
          amount: this.newExpenseCategoryAmounts[month] || 0
        }))
      };
      this.expenseCategories.push(newCategory);
      this.newExpenseCategoryName = '';
      this.newExpenseCategoryAmounts = {};
    }
  }

  applyToAll() {
    if (this.newExpenseCategoryName) {
      this.months.forEach(month => {
        this.newExpenseCategoryAmounts[month] = this.amountApplyAll;
      });
    }
    if (this.newIncomeCategoryName) {
      this.months.forEach(month => {
        this.newIncomeCategoryAmounts[month] = this.amountApplyAll;
      });
    }
    this.hideContextMenu()
  }

  hideContextMenu() {
    this.showContextMenu = false;
    this.contextMenuStyle = {};
    this.amountApplyAll = 0;
  }

  onBlurInput() {
    // this.hideContextMenu();
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.showContextMenu = true;
    this.contextMenuStyle = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`
    };
    this.amountApplyAll = parseFloat((event.target as HTMLInputElement).value) || 0;
  }

  deleteIncomeCategory(index: number) {
    this.incomeCategories.splice(index, 1);
  }

  deleteExpenseCategory(index: number) {
    this.expenseCategories.splice(index, 1);
  }

  getMonthlyTotal(type: 'income' | 'expense'): number[] {
    const categories = type === 'income' ? this.incomeCategories : this.expenseCategories;
    return this.months.map((_, monthIndex) => {
      return categories.reduce((total, category) => {
        return total + category.months[monthIndex].amount;
      }, 0);
    });
  }

  getProfitOrLoss(): number[] {
    const incomeTotals = this.getMonthlyTotal('income');
    const expenseTotals = this.getMonthlyTotal('expense');
    return incomeTotals.map((income, index) => income - expenseTotals[index]);
  }

  getOpeningBalances(): number[] {
    const profitOrLoss = this.getProfitOrLoss();
    const openingBalances = [0];
    for (let i = 1; i < profitOrLoss.length; i++) {
      openingBalances.push(openingBalances[i - 1] + profitOrLoss[i - 1]);
    }
    return openingBalances;
  }

  getClosingBalances(): number[] {
    const profitOrLoss = this.getProfitOrLoss();
    const openingBalances = this.getOpeningBalances();
    return openingBalances.map((balance, index) => balance + profitOrLoss[index]);
  }

  getTotal(type: 'income' | 'expense'): number {
    const categories = type === 'income' ? this.incomeCategories : this.expenseCategories;
    return categories.reduce((total, category) => {
      return total + category.months.reduce((monthTotal, month) => monthTotal + month.amount, 0);
    }, 0);
  }
}
