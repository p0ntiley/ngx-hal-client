import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ArrayInterface} from './array-interface';
import {ResourceHelper} from './resource-helper';
import {Resource} from './resource';

export class ResourceArray<T extends Resource> implements ArrayInterface<T> {
    public sortInfo: Sort[];

    public proxyUrl: string;
    public rootUrl: string;

    public self_uri: string;
    public next_uri: string;
    public prev_uri: string;
    public first_uri: string;
    public last_uri: string;

    public totalElements = 0;
    public totalPages = 1;
    public pageNumber = 1;
    public pageSize: number;

    public result: T[] = [];

    push = (el: T) => {
        this.result.push(el);
    };

    length = (): number => {
        return this.result.length;
    };

    private init = (type: { new(): T }, response: any, sortInfo: Sort[]): ResourceArray<T> => {
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();
        result.sortInfo = sortInfo;
        ResourceHelper.instantiateResourceCollection(type, response, result);
        return result;
    };

// Load next page
    next = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.next_uri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.next_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no next defined");
    };

    prev = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.prev_uri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.prev_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no prev defined");
    };

// Load first page

    first = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.first_uri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.first_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no first defined");
    };

// Load last page

    last = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.last_uri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.last_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no last defined");
    };

// Load page with given pageNumber

    page = (type: { new(): T }, id: number): Observable<ResourceArray<T>> => {
        this.self_uri = this.self_uri.replace("{&sort}", "");
        const uri = ResourceHelper.getProxy(this.self_uri).concat('?', 'size=', this.pageSize.toString(), '&page=', id.toString());
        for (const item of this.sortInfo) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, this.sortInfo))
            .catch(error => Observable.throw(error));
    };

// Sort collection based on given sort attribute


    sortElements = (type: { new(): T }, ...sort: Sort[]): Observable<ResourceArray<T>> => {
        this.self_uri = this.self_uri.replace("{&sort}", "");
        const uri = ResourceHelper.getProxy(this.self_uri).concat('?', 'size=', this.pageSize.toString(), '&page=', this.pageNumber.toString());
        for (const item of sort) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, sort))
            .catch(error => Observable.throw(error));
    };

// Load page with given size

    size = (type: { new(): T }, size: number): Observable<ResourceArray<T>> => {
        const uri = ResourceHelper.getProxy(this.self_uri).concat('?', 'size=', size.toString());
        for (const item of this.sortInfo) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, this.sortInfo))
            .catch(error => Observable.throw(error));
    };
}
