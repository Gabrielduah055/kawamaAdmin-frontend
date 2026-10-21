# Kawama Admin Frontend

Angular 19 administration console for the Kawama storefront. The interface uses Tailwind CSS 4 and connects to the Kawama API for owner authentication, commerce reporting, order and customer operations, payment visibility, product and category management, Cloudinary uploads, and review moderation.

## Local development

Start this project:

```bash
npm install
npm start -- --port 4201
```

Open `http://localhost:4201`. The Angular development server proxies all `/api` requests to the production API, so the admin can run on any local port without a CORS mismatch. The proxy target lives in `proxy.conf.json`; the production URL also lives in `src/environments/environment.production.ts` for deployed builds.

The authentication token is stored in `sessionStorage`, added to Kawama API calls through an HTTP interceptor, and removed when the browser tab closes or the API returns an unauthorized response.

## Admin routes

- `/login`
- `/dashboard`
- `/orders`
- `/orders/:id`
- `/customers`
- `/customers/:id`
- `/products`
- `/products/new`
- `/products/:id/edit`
- `/categories`
- `/reviews`

## Verification

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

The API repository also includes a Postman collection that can be used to verify the backend contract before integration testing.

## Angular CLI reference

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.25.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
