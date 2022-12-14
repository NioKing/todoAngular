import {Component, DoCheck, OnInit} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { plainToInstance } from 'class-transformer';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { GET_CATEGORIES, UPDATE_TODO} from 'src/app/graphql/query';
import { Category, CategoryClass } from 'src/app/models/category';
import { Todo, TodoClass } from 'src/app/models/todo';
import { RefreshService } from 'src/app/service/refresh.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor(
    private apollo: Apollo,
    private refService: RefreshService
  ) { }

  categories$: Observable<Category[]> = of([])
  open: boolean = false

  ngOnInit(): void {
    this.getAllCategories()
    this.refService.getRefresh().subscribe((_) => {
      this.getAllCategories()
    })
    
  }

  getAllCategories() {
    this.categories$ = this.apollo.watchQuery<{ categories: Category[]}>({query: GET_CATEGORIES, fetchPolicy:"no-cache"}).valueChanges.pipe(
      map((res) => plainToInstance(CategoryClass, res.data.categories as Object[]))
    )
  }

  openAdd() {
    this.open = !this.open
  }

  async changeTodoStatus($event: any) {
    const id = await $event.source.value
    this.apollo.mutate<{ updateTodo: Todo }>(
      {
        mutation: UPDATE_TODO,
        variables: {
          id: +id,
          isCompleted: $event.checked
        }
      }
    ).pipe(tap(() => {
      this.refService.setRefresh()
    }),map((res) => plainToInstance(TodoClass, res.data?.updateTodo as Object))).subscribe(( data ) => {
      console.log(data)
    })
  }
}
