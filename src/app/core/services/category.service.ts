import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<any[]>>(this.baseUrl)
      .pipe(map((response) => response.data.map((category) => this.mapCategory(category))));
  }

  getCategoryTree(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.baseUrl}/tree`)
      .pipe(
        map((response) => response.data.map((category) => this.mapCategory(category))),
        map((categories) => categories.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)))
      );
  }

  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return this.http
      .get<ApiResponse<any>>(`${this.baseUrl}/${slug}`)
      .pipe(map((response) => this.mapCategory(response.data)));
  }

  private mapCategory(category: any): Category {
    const children = Array.isArray(category.children) 
      ? category.children.map((child: any) => this.mapCategory(child)).sort((a: Category, b: Category) => a.name.localeCompare(b.name))
      : [];
      
    return {
      id: String(category._id ?? category.id),
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ? String(category.parentId) : null,
      level: Number(category.level ?? 0),
      order: typeof category.order === 'number' ? category.order : undefined,
      isActive: Boolean(category.isActive),
      createdAt: category.createdAt,
      children: children,
    };
  }
}
