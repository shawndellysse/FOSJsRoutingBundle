test('api definition', function() {
  expect(6);

  ok(Routing, 'Routing is defined');
  ok($.isFunction(Routing.connect), 'Routing.connect is a function');
  ok($.isFunction(Routing.path), 'Routing.path is a function');
  ok($.isFunction(Routing.asset), 'Routing.asset is a function');
  ok($.isFunction(Routing.get), 'Routing.get is a function');
  ok($.isFunction(Routing.has), 'Routing.has is a function');
  ok($.isFunction(Routing.flush), 'Routing.flush is a function');
});

test('route registration', function() {
  expect(11);

  strictEqual(Routing.connect('route_1', '/route1'), Routing,
              'connect "route_1". Routing.connect returns Routing');
  ok(Routing.has('route_1'), 'route_1 is connected');
  ok(!Routing.has('route_2'), 'route_2 is not yet connected');
  equal(Routing.get('route_1'), '/route1', 'route_1 url is correct');

  strictEqual(Routing.connect('route_2', '/route2'), Routing,
              'connect "route_2". Routing.connect returns Routing');
  ok(Routing.has('route_1'), 'route_1 is still connected');
  ok(Routing.has('route_2'), 'route_2 is connected');
  equal(Routing.get('route_1'), '/route1', 'route_1 url is still correct');
  equal(Routing.get('route_2'), '/route2', 'route_2 url is correct');

  Routing.flush();
  strictEqual(Routing.connect('route_1', '/route1'), Routing,
              'connect "route_1". Routing.connect returns Routing');
  ok(Routing.has('route_1'), 'route_1 is connected');
});

test('route generation', function() {
  expect(29);

  Routing.flush();
  Routing.prefix = '';
  Routing.variablePrefix = '{';
  Routing.variableSuffix = '}';

  equal(Routing.connect('route_1', '/route1').path('route_1'), '/route1',
      'generating url without parameters returns url');

  equal(Routing.path('route_1', { foo: 'bar' }), '/route1?foo=bar',
      'passing extra parameters happens it as query string');

  equal(Routing.connect('route_1', '/route1?a=b')
                              .path('route_1', { foo: 'bar' }),
      '/route1?a=b&foo=bar',
      'query string is extended if already started');

  equal(Routing.connect('route_1', '/route/{id}/edit')
                              .path('route_1', { id: 'bar' }),
      '/route/bar/edit',
      'basic parameter replacement is ok');

  equal(Routing.connect('route_1', '/route/{id}')
                              .path('route_1', { id: 'bar' }),
      '/route/bar',
      'end of string parameter replacement is ok');

  equal(Routing.path('route_1', { id: 'foo', foo: 'bar' }),
      '/route/foo?foo=bar',
      'passing extra parameters happens it as query string');

  equal(Routing.connect('route_1',
      '/route/{identical}/id/{id}/id/{identical}/foo'
      ).path('route_1', { id: 'bar' }),
      '/route/{identical}/id/bar/id/{identical}/foo',
      'only exact variable matches.');

  equal(Routing.connect('route_1', '{id}')
                              .path('route_1', { id: 'bar' }),
      '/bar',
      'replacement without separator is ok');

  // check for prefix
  Routing.prefix = '/baz/';
  equal(Routing.connect('route_1', '{id}')
                              .path('route_1', { id: 'bar' }),
      '/baz/bar',
      'prefix is added');
  Routing.prefix = 'baz';
  equal(Routing.connect('route_1', '{id}')
                              .path('route_1', { id: 'bar' }),
      '/baz/bar',
      'prefix is surrounded by slashes');

  // check for default parameters
  Routing.prefix = '';
  equal(Routing.connect('route_1', '/foo/{id}', { id: 120 })
                              .path('route_1'),
      '/foo/120',
      'default parameter is using if no parameter is specified');
  equal(Routing.connect('route_1', '/foo/{id}', { id: 120 })
                              .path('route_1', { id: 210 }),
      '/foo/210',
      'default parameter is overrided if a valid parameter is specified');
  equal(Routing.connect('route_1', '/foo/{id}', { id: 120 })
                              .path('route_1', { di: 210 }),
      '/foo/120?di=210',
      'default parameter is using if a wrong parameter is specified');
  equal(Routing.connect('route_1', '/foo/{id}/val/{val}', { val: 10 })
                              .path('route_1', { id: 120, val: 210 }),
      '/foo/120/val/210',
      'Default parameters work with multiple variables');
  equal(Routing.connect('route_1', '/foo/{bar}', { bar: null })
                              .path('route_1'),
      '/foo',
      'Default parameter not added if it\'s "null"');
  equal(Routing.connect('route_1', '/foo/{bar}', { bar: false })
                              .path('route_1'),
      '/foo',
      'Default parameter not added if it\'s "false"');
  equal(Routing.connect('route_1', '/foo/{bar}', { bar: true })
                              .path('route_1'),
      '/foo/1',
      'Default parameter not added if it\'s "true"');
  equal(Routing.connect('route_1', '/foo/{bar}/', { bar: null })
                              .path('route_1'),
      '/foo/',
      'Default parameter not added if it\'s "null"');
  equal(Routing.connect('route_1', '/foo/{bar}/', { bar: false })
                              .path('route_1'),
      '/foo/',
      'Default parameter not added if it\'s "false"');
  equal(Routing.connect('route_1', '/foo/{bar}/', { bar: true })
                              .path('route_1'),
      '/foo/1/',
      'Default parameter not added if it\'s "true"');
  equal(Routing.connect('route_1', '/{foo}/{bar}/{baz}', { foo: "to", bar: null, baz: null })
                              .path('route_1'),
      '/to',
      'The two last parameters are "null"');
  equal(Routing.connect('route_1', '/{foo}/{bar}/{baz}', { foo: "to", bar: "to", baz: null })
                              .path('route_1'),
      '/to/to',
      'The last parameter is "null"');
  equal(Routing.connect('route_1', '/{foo}/{bar}/{baz}', { foo: "to", bar: null, baz: "to" })
                              .path('route_1'),
      '/to//to',
      'The second parameter is "null"');

  /** sf2 testRelativeUrlWithParameter */
  equal(Routing.connect('test', '/testing/{foo}')
      .path('test', {foo: 'bar'}),
      '/testing/bar',
      'sf2 test Relative Url With Parameter');

  /** sf2 testRelativeUrlWithNullParameter */
  equal(Routing.connect('test', '/testing.{format}', {'format': null})
      .path('test'),
      '/testing',
      'sf2 test Relative Url With Null Parameter');

  /** sf2 testRelativeUrlWithOptionalZeroParameter */
  equal(Routing.connect('test', '/testing/{page}')
      .path('test', {page: 0}),
      '/testing/0',
      'sf2 test Relative Url With Optional Zero Parameter');

  /** sf2 testRelativeUrlWithNullParameterButNotOptional */
  equal(Routing.connect('test', '/testing/{foo}/bar', {'foo': null})
      .path('test', {}),
      '/testing//bar',
      'sf2 test Relative Url With Null Parameter But Not Optional');

  /** sf2 testRelativeUrlWithExtraParameters */
  equal(Routing.connect('test', '/testing')
      .path('test', {'foo': 'bar'}),
      '/testing?foo=bar',
      'sf2 test Relative Url With Extra Parameters');

  /** sf2 testNoTrailingSlashForMultipleOptionalParameters */
  equal(Routing.connect('test', '/category/{slug1}/{slug2}/{slug3}', {'slug2': null, 'slug3': null})
      .path('test', {'slug1': 'foo'}),
      '/category/foo',
      'sf2 test No Trailing Slash For Multiple Optional Parameters');
});
