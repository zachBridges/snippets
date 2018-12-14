import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Http, BaseRequestOptions, ResponseOptions, Response } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import 'rxjs/Rx';

import { RestService } from './index';
import { RestModule } from "./rest.module";
import { RestTestComponent } from "./test/rest-test.component";

describe('#restService', () => {

  let restService: RestService,
    backend: MockBackend,
    http: Http,
    fixture: ComponentFixture<RestTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RestModule.forRoot({
          clientEndpoints: {
            KEY1: {
              url: 'fakeClientURL1',
              authentication: true
            },
            KEY2: {
              url: 'fakeClientURL2',
              authentication: false
            }
          },
          endpoints: {
            KEY1: {
              url: 'fakeURL1',
              authentication: true
            },
            KEY2: {
              url: 'fakeURL2',
              authentication: false
            }
          },
          customerNumber: 'fakecustomerNumber',
          profile_id: 'fakeProfileID',
          channel: 'fakeChannel'
        })
      ],
      declarations: [
        RestTestComponent
      ],
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: ( backendInstance: MockBackend, defaultOptions: BaseRequestOptions ) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });

    fixture = TestBed.createComponent(RestTestComponent);
    restService = fixture.debugElement.injector.get(RestService);

    backend = TestBed.get(MockBackend);
    http = TestBed.get(Http);

  });


  describe('the config object', () => {
    it('should contain the endpoint data', () => {
      expect(restService.config["clientEndpoints"]).toEqual({
        KEY1: {
          url: 'fakeClientURL1',
          authentication: true
        },
        KEY2: {
          url: 'fakeClientURL2',
          authentication: false
        }
      });
      expect(restService.config["endpoints"]).toEqual({
        KEY1: {
          url: 'fakeURL1',
          authentication: true
        },
        KEY2: {
          url: 'fakeURL2',
          authentication: false
        }
      });
    });

    it('should contain parameter data', () => {
      expect(restService.config["customerNumber"]).toBe('fakecustomerNumber');
      expect(restService.config["profile_id"]).toBe('fakeProfileID');
      expect(restService.config["channel"]).toBe('fakeChannel');
    });

  });

  describe('the client call method', () => {

    it('should make an http call to a specified endpoint and return an observable', done => {

      backend.connections.subscribe(( connection: MockConnection ) => {
        let body = (connection.request.url == 'fakeClientURL1') ? JSON.stringify({ success: true }) : JSON.stringify({ success: false });
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      });

      try {
        restService.makeClientCall('KEY1').subscribe(( response ) => {
          expect(response).toEqual({ success: true });
          done();
        });
      } catch (e) {
        fail(e);
      }

    });

    it('should have the appropriate headers', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        expect(connection.request.headers.get('Accept')).toBe('application/json, text/javascript, */*; q=0.01');
        expect(connection.request.headers.get('Content-Type')).toBe('application/json; charset=UTF-8');
        expect(connection.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
        done();
      });
      restService.makeClientCall('KEY1');
    });

    describe('and its authentication options', () => {

      it('should include a URL and determine if customerNumber is needed', done => {
        backend.connections.subscribe(( connection: MockConnection ) => {
          let requestParams = JSON.parse(connection.request.text());
          expect(connection.request.url).toBe('fakeClientURL1');
          expect(requestParams.customerNumber).toBe('fakecustomerNumber');
          done();
        });
        restService.makeClientCall('KEY1');
      });

      it("should exclude customerNumber if it isn't needed", done => {
        backend.connections.subscribe(( connection: MockConnection ) => {
          let requestParams = JSON.parse(connection.request.text());
          expect(connection.request.url).toBe('fakeClientURL2');
          expect(requestParams.customerNumber).toBeUndefined();
          done();
        });
        restService.makeClientCall('KEY2');
      });

    });


    describe('and its response', () => {

      it('should return JSON', done => {
        backend.connections.subscribe(( connection: MockConnection ) => {
          let options = new ResponseOptions({
            body: { success: true }
          });
          connection.mockRespond(new Response(options));
        });
        restService.makeClientCall('KEY1').subscribe(( response ) => {
          expect(response["success"]).toBe(true);
          done();
        });
      });
    });
  });

  describe('the  call method', () => {

    it('should - by default - make a POST http call to a specified endpoint and return an observable', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        let body = (connection.request.url == 'fakeURL1') ? JSON.stringify({ success: true }) : JSON.stringify({ success: false });
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      });

      try {
        restService.makeCall('KEY1').subscribe(( response ) => {
          expect(response).toEqual({ success: true });
          done();
        });
      } catch (e) {
        fail(e);
      }
    });

    it('should - when specified - make a GET http call to a specified endpoint and return an observable', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        let body = (connection.request.url == 'fakeURL1') ? JSON.stringify({ success: true }) : JSON.stringify({ success: false });
        let options = new ResponseOptions({
          body: body
        });
        connection.mockRespond(new Response(options));
      });

      try {
        restService.makeCall('KEY1', 'GET').subscribe(( response ) => {
          expect(response).toEqual({ success: true });
          done();
        });
      } catch (e) {
        fail(e);
      }
    });

    it('should have the appropriate headers', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        expect(connection.request.headers.get('Accept')).toBe('application/json');
        expect(connection.request.headers.get('Content-Type')).toBe('application/json; charset=UTF-8');
        done();
      });
      restService.makeCall('KEY1');
    });

    it('should include default data profile_id and channel', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        let requestParams = JSON.parse(connection.request.text());
        expect(requestParams.profile_id).toBe('fakeProfileID');
        expect(requestParams.channel).toBe('fakeChannel');
        done();
      });
      restService.makeCall('KEY1');
    });

    it('should include any other parameters provided', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        let requestParams = JSON.parse(connection.request.text());
        expect(requestParams.baby_name1).toBe('Mad Dog ');
        expect(requestParams.baby_name2).toBe('Rowdy Roddy Piper');
        done();
      });
      restService.makeCall('KEY1', {
        baby_name1: 'Mad Dog ',
        baby_name2: 'Rowdy Roddy Piper'
      });
    });

    it('should be able to overload second parameter to indicate a GET method', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        expect(connection.request.method).toBe(0);
        done();
      });
      restService.makeCall('KEY1', 'GET');
    });

    it('should default to POST method', done => {
      backend.connections.subscribe(( connection: MockConnection ) => {
        expect(connection.request.method).toBe(1);
        done();
      });
      restService.makeCall('KEY1', {});
    });

    describe('and its response', () => {

      it('should return JSON', done => {
        backend.connections.subscribe(( connection: MockConnection ) => {
          let options = new ResponseOptions({
            body: { success: true }
          });
          connection.mockRespond(new Response(options));
        });
        restService.makeCall('KEY1').subscribe(( response ) => {
          expect(response["success"]).toBe(true);
          done();
        });
      });
    });
  });
});
