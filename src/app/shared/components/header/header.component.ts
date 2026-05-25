import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/app.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showHeader = true;
  private routerSub!: Subscription;
  private categoryService = inject(CategoryService);
  
  categories$: Observable<Category[]> = this.categoryService.getCategoryTree();

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkRoute(this.router.url);
    
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private checkRoute(url: string) {
    // Hide header on admin routes and splash screen
    if (url.startsWith('/admin') || url.startsWith('/splash')) {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
  }

  checkSubmenuBounds(event: MouseEvent) {
    const item = event.currentTarget as HTMLElement;
    const dropdown = item.querySelector('.nested-dropdown') as HTMLElement | null;
    
    if (!dropdown) return;

    // Use a small timeout to allow the CSS hover (display: block) to apply
    setTimeout(() => {
      // Reset styles for fresh measurement
      dropdown.style.left = '100%';
      dropdown.style.right = 'auto';
      dropdown.style.top = '0';

      const rect = dropdown.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Adjust horizontally if it flows off the right edge
      if (rect.right > windowWidth) {
        dropdown.style.left = 'auto';
        dropdown.style.right = '100%';
      }

      // Adjust vertically if it flows off the bottom edge
      if (rect.bottom > windowHeight) {
        const overflow = rect.bottom - windowHeight + 20; // 20px padding
        // Ensure it doesn't go higher than the top of the screen
        const adjustedTop = Math.max(-overflow, -rect.top + 20);
        dropdown.style.top = `${adjustedTop}px`;
      }
    }, 10);
  }
}
