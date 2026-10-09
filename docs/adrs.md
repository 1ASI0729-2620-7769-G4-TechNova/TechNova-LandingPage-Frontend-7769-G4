# Architectural Decision Records (ADRs)

This document records the principal architectural decisions made for the WashTrack frontend application (team TechNova).

---

## ADR 001: Adoption of Domain-Driven Design (DDD) and Screaming Architecture

### Status
Accepted

### Context
WashTrack covers several business capabilities of a laundry service (identity and access, order management, billing and subscriptions, delivery) and more are planned (customer management, laundry operations, tracking and notifications). The code must keep high cohesion, low coupling and clear separation of concerns while the team develops each capability in parallel.

### Decision
Structure the frontend codebase according to Domain-Driven Design (DDD) tactical patterns and bounded contexts:
- **Bounded Contexts**: `iam`, `order-management`, `billing`, `delivery` and `shared`. The remaining contexts (`customer_management`, `laundry_operations` and `tracking_notifications`) are modeled in the class diagram and will be added with the same structure.
- **Layered Architecture per Context**:
  - `domain/model`: Domain entities, enums and business rules, free from framework dependencies.
  - `infrastructure`: API facade, endpoint adapters, assemblers and HTTP resources/responses.
  - `application`: State management stores (and route guards in `iam`) that orchestrate the use cases.
  - `presentation`: Views, components, forms and routes.

### Consequences
- **Positive**: Clear boundaries between contexts, high maintainability, and folders that show the business capabilities of the product at first sight.
- **Negative**: Additional boilerplate for mapping between layers (assemblers and resources).

---

## ADR 002: Signal-Based State Management for Application Stores

### Status
Accepted

### Context
The views need fine-grained reactivity, predictable state updates and minimal boilerplate, without adding an external state management library.

### Decision
Use lightweight, context-scoped application stores (`OrderStore`, `IamStore`, `BillingStore`, `DeliveryStore`) powered by Angular Signals (`signal`, `computed` and `inject()`):
- Internal mutable state is kept private in `WritableSignal` fields (for example `ordersSignal`).
- Public state is exposed as read-only signals through `asReadonly()` (for example `orders`, `loading`, `error`).
- Stores are `providedIn: 'root'` and call the infrastructure facade (`OrderManagementApi`, `IamApi`, ...) to load and change data.
- Derived data (filters, counts, pagination, totals) is calculated in `computed` signals of the views or stores.

### Consequences
- **Positive**: Native integration with Angular reactivity, no external dependencies, and views that update automatically when the store changes.
- **Negative**: Developers must follow conventions to update state immutably inside store methods.

---

## ADR 003: Assembler Pattern and Layered REST Infrastructure

### Status
Accepted

### Context
API contracts (resources and responses) differ from the domain model in structure and data types. For example, an order travels as a resource with plain strings and embedded garments, while the domain works with enums and entities.

### Decision
Implement the Assembler pattern with generic abstractions placed in `shared/infrastructure`:
- `BaseEntity`: Marker interface for domain entities with a numeric `id`.
- `BaseResource` / `BaseResponse`: Contracts for the wire DTOs.
- `BaseAssembler<TEntity, TResource, TResponse>`: Transformation between resources and domain entities (`toEntityFromResource`, `toResourceFromEntity`, `toEntitiesFromResponse`).
- `BaseApiEndpoint`: Generic HTTP wrapper with CRUD operations and unified error handling.
- `BaseApi`: Base type of the facade of each context (`OrderManagementApi`, `IamApi`, `BillingApi`, `DeliveryApi`), which composes its endpoints and adds the operations that are not plain CRUD (for example confirming an order).

### Consequences
- **Positive**: The domain does not depend on the backend schema, and CRUD operations and error handling are the same in every context.
- **Negative**: An assembler and its resources must be written for every entity.

---

## ADR 004: Business Rules in the Domain Layer, Reported as i18n Keys

### Status
Accepted

### Context
The business rules (order lifecycle, total calculation, subscription expiration, delivery progress) must be correct, testable and independent from the UI. Rules written inside components or stores are easy to duplicate and to break.

### Decision
Keep the business rules inside the domain entities and expose them through methods:
- `Order` requires a customer and at least one garment, accepts garments only while it is pending, validates quantity (whole number greater than zero) and unit price (not negative), and calculates the total as the sum of the garment subtotals plus the delivery fee, which only applies to home delivery.
- The order status only moves `PENDING → CONFIRMED → COMPLETED` through `confirm()` and `complete()`, which return a new order and leave the original untouched.
- `Subscription` calculates `daysToExpire`, `isExpired` and `isExpiringSoon`; `Delivery` decides its `nextStatus()` and whether it `isClosed()`.
- Sensitive data (identifier, order number, status, total amount, creation date) has no setters; it changes only through domain methods.
- Monetary amounts are rounded with `roundToCurrency` (2 decimals) to avoid floating point errors such as `19.99 * 3 = 59.970000000000006`.
- Domain errors are thrown as `Error` whose message is an i18n key (for example `order-management.errors.cannot-confirm`), so the presentation layer can translate them.
- Stores call these methods before sending data to the API and the order form uses the same methods to show its live summary, so the screen and the stored order always agree.

### Consequences
- **Positive**: One source of truth for each rule, domain logic that can be tested without Angular, and translated error messages.
- **Negative**: Entities with behavior need more code than plain data classes, and creating an order requires registering its garments through the domain methods.

---

## ADR 005: Configurable Business Values in Environment Files

### Status
Accepted

### Context
Values such as the delivery fee or the currency can change and appear in several layers (the domain calculation, the store and the views). Writing them inside the code would repeat them and make a change risky.

### Decision
Store these values in `src/environments/environment.ts` (`deliveryFee`, `currencyCode`, `currencySymbol`, `apiBaseUrl`, `ordersEndpointPath`):
- The domain does not read the environment; `Order.calculateTotalAmount(deliveryFee)` receives the fee as a parameter and `OrderStore` passes `environment.deliveryFee`.
- Views display every amount with `CurrencyPipe` using `currencyCode` and `currencySymbol`.

### Consequences
- **Positive**: Each value is changed in one place, the domain stays independent from Angular, and development and production can use different values.
- **Negative**: Whoever reads an amount must know where the value comes from.

---

## ADR 006: Fake REST API with json-server

### Status
Accepted

### Context
The backend is not available yet, but the frontend needs realistic data and real HTTP calls to develop and validate the features.

### Decision
Use `json-server` as a fake REST API:
- Data lives in `server/db.json` (`users`, `roles`, `roleAssignments`, `orders`, `payments`, `plans`, `subscriptions`, `deliveries`, `trackingEvents`).
- `server/routes.json` rewrites `/api/v1/:*` to `/:$1`, and `server/start.sh` and the npm script `npm run server` start it on port 3002.
- `environment.apiBaseUrl` points to `http://localhost:3002`.
- Rules that a real backend would apply are simulated in the infrastructure facade: `OrderManagementApi` assigns the next order number (`ORD-000001`), the creation date and the `PENDING` status, and leaves the identifier empty so json-server generates it.

### Consequences
- **Positive**: The frontend works end to end without a backend, and replacing the fake API only affects the infrastructure layer.
- **Negative**: Data is not validated by a real server and some behavior (order numbers, credentials) is only a simulation.

---

## ADR 007: Cross-Context Collaboration through Application Stores and Identifiers

### Status
Accepted

### Context
Contexts need each other's data: an order shows its customer, its drivers and its payment; a payment belongs to an order; a subscription belongs to a laundry. Sharing entities or calling another context's API would couple the contexts.

### Decision
- Entities reference entities of other contexts only by identifier (`Order.customerId`, `Payment.orderId`, `Delivery.orderId`, `Subscription.laundryId`).
- When a view needs data of another context, it reads the public read-only signals of that context's store (for example `OrderDetail` reads `IamStore`, `DeliveryStore` and `BillingStore`) and never changes them.
- A context never calls the infrastructure of another one.

### Consequences
- **Positive**: Contexts remain independent, and their domain models can evolve separately.
- **Negative**: The views that combine data must load the other stores and handle data that is not available yet (for example, showing the customer number when the customer is not loaded).

---

## ADR 008: Material 3 (M3) Theming and WashTrack Design Tokens

### Status
Accepted

### Context
The application needs a modern, accessible and consistent UI that follows the Figma mockups of the team.

### Decision
Adopt Angular Material with Material 3 theming in `src/material-theme.scss`:
- Use `@use '@angular/material' as mat;` and `@include mat.theme(...)` with `$azure-palette` (primary), `$blue-palette` (tertiary) and the Poppins typography.
- Define the WashTrack colors as CSS custom properties (`--wt-primary`, `--wt-background`, `--wt-surface`, `--wt-border`, `--wt-text`, `--wt-text-muted`) and use them in the component styles instead of fixed colors.
- Customize Material components with dedicated mixins (for example `mat.toolbar-overrides`).
- Reference `src/material-theme.scss` and `src/styles.css` in the `styles` of `angular.json`.

### Consequences
- **Positive**: A consistent look aligned with the mockups, built-in accessibility, and a visual change made in one place.
- **Negative**: Requires familiarity with the Material 3 tokens and the Sass mixins.

---

## ADR 009: Standalone Components, Lazy-Loaded Routes and Guards

### Status
Accepted

### Context
Angular standalone components remove the need for `NgModule`, and each context should load only when the user visits it.

### Decision
- All components are standalone and import their dependencies directly in `@Component.imports`.
- Each context exposes its routes in its own file (`orderManagementRoutes`, `billingRoutes`, `deliveryRoutes`, `iamPublicRoutes`, `iamAccountRoutes`, `iamAdminRoutes`) and `app.routes.ts` mounts them under a path (`/orders`, `/billing`, `/operations/deliveries`, `/iam`).
- Views are loaded lazily with `loadComponent`, and every route has a title (`WashTrack - ...`).
- `authGuard` protects the private routes and `adminGuard` protects the administration routes, redirecting to `/sign-in` or `/home`.

### Consequences
- **Positive**: Tree-shakable bundles, explicit dependencies, and each context owning its routes.
- **Negative**: Every component must list its imports, and routes are spread across several files.

---

## ADR 010: Internationalization (i18n) via `@ngx-translate`

### Status
Accepted

### Context
The application must support English and Spanish with runtime language switching, and the team rule is that no text is hardcoded in views or code.

### Decision
Use `@ngx-translate/core` and `@ngx-translate/http-loader` with the files `public/i18n/en.json` and `public/i18n/es.json`:
- The loader is configured in `app.config.ts` with `en` as fallback language.
- Every label, message, validation text and error is a translation key grouped by context (`order-management.*`, `iam.*`, `billing.*`, `delivery.*`, `option.*`, ...), and dynamic values use interpolation (for example `{{count}}`).
- Domain and store errors are i18n keys, and the views translate them with `TranslatePipe`.
- The `LanguageSwitcher` shared component changes the language at runtime.
- Both files must always contain the same keys.

### Consequences
- **Positive**: Language switching without reloading the page, and centralized texts.
- **Negative**: Every new text needs a key in both files, and a missing key shows the raw key in the interface.

---

## ADR 011: Mock Authentication, Session in Local Storage and Role-Based Access

### Status
Accepted (temporary, until the real backend exists)

### Context
The application needs sign-in, sign-up, password management and role-based access, but there is no authentication backend yet.

### Decision
- `IamApi` validates the credentials against the `users` collection of the fake API and checks the status of the account (`ACTIVE`) and its account type (`CLIENT` or `LAUNDRY`).
- `IamStore` keeps the current user and a fake token in signals and saves the session in `localStorage` (`washtrack.session`), restoring it when the application starts and removing it on sign-out.
- Roles and role assignments are loaded after sign-in, and `IamStore.isAdmin()` decides the access to the administration views and menu options.
- The layout shows the menu options according to the account type and role.

### Consequences
- **Positive**: Authentication flows and permissions can be developed and demonstrated without a backend, and the session survives a page reload.
- **Negative**: It is not secure (passwords are stored and compared in the fake API and the token is not real), so it must be replaced by a real authentication service.

---

## ADR 012: Responsive Design

### Status
Accepted

### Context
Staff and customers use WashTrack from desktop and mobile devices, and every view must be usable on small screens.

### Decision
- Layouts use flexible containers (`flex`, `grid` with `auto-fit`, `flex-wrap`) and relative sizes instead of fixed widths.
- Tables become cards on small screens (for example, the order list below 720px shows one card per order with the column names taken from `data-label`).
- Dialogs limit their width to the screen (`maxWidth: '95vw'`).
- A view must not produce horizontal scrolling on a phone.

### Consequences
- **Positive**: The same views work on desktop and mobile.
- **Negative**: Each table needs an additional mobile style.

---

## ADR 013: Code Conventions

### Status
Accepted

### Context
Several students work on the same codebase and the reference project (Learning Center) defines the style expected by the course.

### Decision
- Names are written in full, without abbreviations (`product`, never `prod`).
- Public and private members, constants and functions are documented with JSDoc in English, following the Learning Center style: a short description, `@param name - Description.` and `@returns Description.`.
- No hardcoded values: texts go to the i18n files, business values to the environment file and repeated numbers to named constants.
- Domain entities use private fields (`#field`) with getters, and setters are not created for sensitive data.

### Consequences
- **Positive**: Readable, consistent code that is easy to review and to evaluate.
- **Negative**: More writing effort for documentation and for keeping the translation files updated.

---

## ADR 014: TypeScript Configuration

### Status
Accepted

### Context
The Angular build pipeline (`@angular/build`, esbuild) supports modern JavaScript, and the team wants the compiler to catch errors early.

### Decision
Configure `tsconfig.json` with `target: "ES2022"`, `module: "preserve"`, `isolatedModules`, and the checks `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noPropertyAccessFromIndexSignature`. The Angular compiler options `strictInjectionParameters` and `strictInputAccessModifiers` are enabled.

### Consequences
- **Positive**: Modern JavaScript output without polyfills, and common mistakes detected at build time.
- **Negative**: Requires modern browsers (aligned with the Angular 22 browser baseline).
