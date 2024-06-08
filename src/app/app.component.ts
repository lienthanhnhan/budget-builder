import { Component } from '@angular/core';
import { BudgetTableComponent } from './budget-table/budget-table.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, BudgetTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  startMonth: string = '2024-01';
  endMonth: string = '2024-02';
}