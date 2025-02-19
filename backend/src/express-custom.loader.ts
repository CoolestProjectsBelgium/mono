import { AbstractHttpAdapter } from '@nestjs/core';
import { loadPackage } from '@nestjs/common/utils/load-package.util.js';

function reorderRoutes(app, lookup: string) {
  let jsonParser = [];
  let urlencodedParser = [];
  let admin = [];

  console.log(app._router.stack);

  // Nestjs uses bodyParser under the hood which is in conflict with adminjs setup.
  // Due to adminjs-expressjs usage of formidable we have to move body parser in layer tree after adminjs init.
  // Notice! This is not documented feature of express, so this may change in the future. We have to keep an eye on it.
  if (app && app._router && app._router.stack) {
    const jsonParserIndex = app._router.stack.findIndex(
      (layer: { name: string }) => layer.name === 'jsonParser',
    );
    if (jsonParserIndex >= 0) {
      jsonParser = app._router.stack.splice(jsonParserIndex, 1);
    }

    const urlencodedParserIndex = app._router.stack.findIndex(
      (layer: { name: string }) => layer.name === 'urlencodedParser',
    );
    if (urlencodedParserIndex >= 0) {
      urlencodedParser = app._router.stack.splice(urlencodedParserIndex, 1);
    }

    const adminIndex = app._router.stack.findIndex(
      (layer: { regexp: RegExp; name: string }) => {
        if (layer.name === 'adminRoute') {
          return layer.regexp.test(lookup);
        }
        return false;
      },
    );
    if (adminIndex >= 0) {
      admin = app._router.stack.splice(adminIndex, 1);
    }

    // if adminjs-nestjs didn't reorder the middleware
    // the body parser would have come after corsMiddleware
    const corsIndex = app._router.stack.findIndex(
      (layer: { name: string }) => layer.name === 'corsMiddleware',
    );

    // in other case if there is no corsIndex we go after expressInit, because right after that
    // there are nest endpoints.
    const expressInitIndex = app._router.stack.findIndex(
      (layer: { name: string }) => layer.name === 'expressInit',
    );

    const initIndex = (corsIndex >= 0 ? corsIndex : expressInitIndex) + 1;

    app._router.stack.splice(
      initIndex,
      0,
      ...admin,
      ...jsonParser,
      ...urlencodedParser,
    );
  }
}

export const MultipleAdminLoaderPromise = (async () => {
  const { AbstractLoader } = await import('@adminjs/nestjs');

  return class MultipleAdminLoader extends AbstractLoader {
    async register(admin: any, httpAdapter: AbstractHttpAdapter, options: any) {
      console.log('Register method called');
      console.log('Admin:', admin);
      console.log('HttpAdapter:', httpAdapter);
      console.log('Options:', options);

      const app = httpAdapter.getInstance();

      loadPackage('express', '@adminjs/nestjs');
      const adminJsExpressjs = await import('@adminjs/express');
      loadPackage('express-formidable', '@adminjs/nestjs');
      loadPackage('express-session', '@adminjs/nestjs');

      const router = adminJsExpressjs.default.buildRouter(
        admin,
        undefined,
        options.formidableOptions,
      );

      function adminRoute(req, res, next) {
        return router(req, res, next);
      }

      app.use(options.adminJsOptions.rootPath, adminRoute);

      reorderRoutes(app, options.adminJsOptions.rootPath);
    }
  };
})();
