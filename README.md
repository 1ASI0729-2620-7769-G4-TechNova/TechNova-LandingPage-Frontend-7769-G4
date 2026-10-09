# WashTrack Application (`wash-track`)

## Overview
`wash-track` is an Angular 22 client application for managing the operation of a laundry business: customer orders, payments and subscription plans, and pickups and deliveries at home. It is the frontend of the **WashTrack** project of the **TechNova** team, with the codebase organized around Domain-Driven Design (DDD) bounded contexts and layered responsibilities.

In development mode, the application consumes a local fake API exposed through `json-server`. The frontend is configured to call `http://localhost:3002` for every resource.

## Features
- Order management: list orders, register an order with its garments, confirm and complete it, and see its detail
- Business rules in the domain: order status flow (`PENDING` → `CONFIRMED` → `COMPLETED`) and total amount calculation (garment subtotals plus the delivery fee for home delivery)
- Billing: payment history, payment receipt and payment checkout
- Delivery management: list, schedule and track pickups and deliveries at home, with the history of tracking events
- Identity and access: sign in, sign up, password recovery, password change and user administration with roles
- Route protection with guards (`authGuard` for signed-in users and `adminGuard` for administrators)
- Signal-based state management and reactive UI updates (`signal`, `computed`)
- Material Design 3 (M3) styling with custom theme tokens
- Responsive layout for mobile and desktop
- Internationalization with English and Spanish resources using `@ngx-translate`
- Client-side navigation with Angular Router, standalone components and lazy-loaded routes
- HTTP communication through Angular `HttpClient` and the REST Assembler pattern
- Layered organization by bounded context:
  - `shared`
  - `iam`
  - `order-management`
  - `billing`
  - `delivery`

## Current Scope
The currently enabled application routes expose:
- `sign-in`, `sign-up`, `forgot-password` (public)
- `home`, `about`
- `orders`, `orders/new`
- `billing/payments`, `billing/payments/:id`, `billing/checkout`
- `operations/deliveries`, `operations/deliveries/new`, `operations/deliveries/:id`
- `iam/users`, `iam/users/new`, `iam/users/:id` (administrators only)

The bounded contexts `customer_management`, `laundry_operations` and `tracking_notifications` are part of the design (see the class diagram) but are not developed yet.

Authentication is simulated: the session is stored in the browser (`localStorage`) and the credentials are validated against the fake API. See ADR-011 in [`docs/adrs.md`](docs/adrs.md).

## Architecture Overview
The application structure follows Domain-Driven Design (DDD) bounded contexts and layered responsibilities:

- **`shared`**: Cross-cutting reusable technical contracts, base API infrastructure, shell layout, and internationalization components.
- **`iam`**: Identity and Access Management domain handling user accounts, roles, role assignments and the authentication session.
- **`order-management`**: Core domain managing orders, garments, order status and delivery method.
- **`billing`**: Billing and Subscriptions domain managing payments, plans and subscriptions.
- **`delivery`**: Delivery Management domain managing pickups, deliveries and their tracking events.

Each bounded context is structured into four distinct layers:
- **`domain`**: Entities, value objects and enumerations with the business rules.
- **`application`**: Signal-based state management stores (`signal`, `computed`).
- **`infrastructure`**: REST API endpoints, resources, assemblers and the API facade of the context.
- **`presentation`**: Standalone components, routed views, and forms.

The bounded contexts collaborate through identifiers and read-only store signals, not by sharing entities. See ADR-007 in [`docs/adrs.md`](docs/adrs.md).

## Project Structure
The repository layout uses the following tree structure:

```text
wash-track/
├── docs/                               # Architectural, requirement and sprint documentation
│   ├── adrs.md                         # Architectural Decision Records (ADRs)
│   ├── washtrack-class-diagram.puml    # PlantUML class diagram of the bounded contexts
│   ├── user-stories.md                 # User and technical stories & Requirements Traceability Matrix (RTM)
│   ├── openapi.yaml                    # OpenAPI documentation of the REST endpoints
│   ├── services-documentation-evidence.md  # Services documentation evidence for the Sprint Review
│   ├── software-deployment-evidence.md     # Software deployment evidence for the Sprint Review
│   └── images/                         # Screenshots used by the documentation
├── public/                             # Static public assets
│   ├── favicon.ico                     # Application favicon
│   └── i18n/                           # Translation dictionaries for @ngx-translate
│       ├── en.json                     # English locale strings
│       └── es.json                     # Spanish locale strings
├── server/                             # Fake REST API backend (json-server)
│   ├── db.json                         # Mock database resource collections
│   ├── routes.json                     # Custom route rewrite definitions
│   └── start.sh                        # Shell launcher for fake backend
├── src/                                # Application source code
│   ├── index.html                      # Single-page HTML entry point
│   ├── main.ts                         # Application bootstrap entry point
│   ├── material-theme.scss             # Material 3 theme configuration & design tokens
│   ├── styles.css                      # Global CSS stylesheet
│   ├── environments/                   # Environment settings
│   │   └── environment.ts              # API base URL, delivery fee and currency
│   └── app/                            # Application root and bounded contexts
│       ├── app.config.ts               # Application-level providers (router, i18n, http)
│       ├── app.routes.ts               # Root routing definitions
│       ├── app.ts                      # Root shell component class
│       ├── app.html                    # Root shell template
│       ├── app.css                     # Root shell styling
│       ├── app.spec.ts                 # Root component unit tests
│       ├── shared/                     # Shared Kernel & Infrastructure
│       │   ├── domain/                 # Base domain contracts (BaseEntity)
│       │   ├── infrastructure/         # Base HTTP client, base API endpoint, base assembler
│       │   └── presentation/           # Layout, footer, language switcher, base form, Home, About, Page not found
│       ├── iam/                        # Identity and Access Management Bounded Context
│       │   ├── application/            # IamStore and route guards
│       │   ├── domain/                 # Domain model (UserAccount, Role, RoleAssignment)
│       │   ├── infrastructure/         # Endpoints, assemblers, resources, IamApi
│       │   └── presentation/           # Sign in, sign up, password and user administration views
│       ├── order-management/           # Order Management Bounded Context
│       │   ├── application/            # OrderStore
│       │   ├── domain/                 # Domain model (Order, Garment, OrderStatus, DeliveryMethod, Money)
│       │   ├── infrastructure/         # OrdersApiEndpoint, OrderAssembler, OrderResource, OrderManagementApi
│       │   └── presentation/           # Order list, order form and order detail
│       ├── billing/                    # Billing and Subscriptions Bounded Context
│       │   ├── application/            # BillingStore
│       │   ├── domain/                 # Domain model (Payment, Plan, Subscription)
│       │   ├── infrastructure/         # Endpoints, assemblers, resources, BillingApi
│       │   └── presentation/           # Payment history, receipt, checkout and subscription views
│       └── delivery/                   # Delivery Management Bounded Context
│           ├── application/            # DeliveryStore
│           ├── domain/                 # Domain model (Delivery, TrackingEvent)
│           ├── infrastructure/         # Endpoints, assemblers, resources, DeliveryApi
│           └── presentation/           # Delivery list, schedule and tracking views
├── angular.json                        # Angular CLI workspace configuration
├── package.json                        # npm dependencies and project scripts
├── README.md                           # Main project documentation
├── tsconfig.json                       # Root TypeScript compiler options
├── tsconfig.app.json                   # Application compilation TypeScript options
└── tsconfig.spec.json                  # Unit testing compilation TypeScript options
```

## Technologies
- **Framework**: Angular 22 (Standalone Components, Signals, `inject()`)
- **Language**: TypeScript 6.0+
- **UI & Theming**: Angular Material 22 (Material 3 tokens, Sass theme config)
- **State & Reactivity**: Angular Signals & RxJS
- **Internationalization**: `@ngx-translate/core` & `@ngx-translate/http-loader`
- **Testing**: Jasmine & Karma
- **Mock API**: `json-server`
- **Diagrams**: PlantUML
- **API documentation**: OpenAPI 3.0

## Documentation
- **User Stories & Requirements Traceability**: [`docs/user-stories.md`](docs/user-stories.md) - User and technical stories with the RTM mapping.
- **Class Diagram**: [`docs/washtrack-class-diagram.puml`](docs/washtrack-class-diagram.puml) - PlantUML model of the bounded contexts, with a general view of how they interact.
- **Architectural Decision Records (ADRs)**: [`docs/adrs.md`](docs/adrs.md) - Key architectural and technology choices.
- **API Documentation**: [`docs/openapi.yaml`](docs/openapi.yaml) - OpenAPI description of the REST endpoints.
- **Services Documentation Evidence**: [`docs/services-documentation-evidence.md`](docs/services-documentation-evidence.md) - Endpoints, actions and screenshots for the Sprint Review.
- **Software Deployment Evidence**: [`docs/software-deployment-evidence.md`](docs/software-deployment-evidence.md) - Deployment steps and evidence for the Sprint Review.

## Prerequisites
Before running the project, make sure the environment includes:
- Node.js (v20+ recommended)
- npm

## Installation
Install project dependencies from the project root:

```bash
npm install
```

## Running the Application
Start the Angular development server from the project root:

```bash
npm start
```

This starts the application at:

- `http://localhost:4200/`

## Starting the Fake API
The application is configured to consume the fake API at:

- `http://localhost:3002`

The fake API configuration files are located in the `server` folder:
- `server/db.json`
- `server/routes.json`
- `server/start.sh`

### Option 1: Start from the project root

```bash
npm run server
```

### Option 2: Use the provided script
The provided script uses relative paths, so it should be executed from inside the `server` directory:

```bash
cd server
sh start.sh
```

## Development Workflow
For local development, start the fake API first and then start the Angular application:

```bash
# Terminal 1: Fake REST API
npm run server

# Terminal 2: Angular Dev Server
npm start
```

## Available Scripts
From the project root, the following scripts are available:

- `npm start` - Starts the development server (`ng serve`).
- `npm run server` - Starts the fake REST API (`json-server`) on port `3002`.
- `npm run build` - Compiles and builds the production bundles (`ng build`).
- `npm run watch` - Builds the application in watch mode with development configuration.
- `npm test` - Executes unit tests via Karma and Jasmine (`ng test`).

## Fake API Notes
- The fake API provides the resources `users`, `roles`, `roleAssignments`, `orders`, `payments`, `plans`, `subscriptions`, `deliveries` and `trackingEvents`.
- Every endpoint is documented in [`docs/openapi.yaml`](docs/openapi.yaml).
- The order number (`ORD-000001`) is assigned by the API layer of the frontend, because json-server only assigns the numeric `id`.
- The passwords stored in `server/db.json` are sample data for development only.

## Project Notes
- Translation files are located in `public/i18n/`.
- The API base URL, the delivery fee and the currency are defined in `src/environments/environment.ts`.
- The environment file points to `http://localhost:3002`, so it must be adjusted when the fake API is deployed (see [`docs/software-deployment-evidence.md`](docs/software-deployment-evidence.md)).
