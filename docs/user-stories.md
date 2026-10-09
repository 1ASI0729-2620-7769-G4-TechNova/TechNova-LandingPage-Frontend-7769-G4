# WashTrack Application User Stories

## Overview
This document presents the functional requirement user stories and the technical stories for the WashTrack web application. The requirements are organized around the business domains of the platform: **Identity and Access Management (IAM)**, **Order Management**, **Customer Management**, **Laundry Operations**, **Billing and Subscriptions**, **Delivery Management**, and **Tracking and Notifications**.

Roles involved:
- **Customer**: Person who requests laundry services and follows their orders.
- **Laundry Staff**: Worker of the laundry who registers orders, garments and logistics operations.
- **Laundry Owner**: Owner of the laundry business who reviews its operation, payments and subscription plan.
- **Laundry Administrator**: Person who configures the services, prices, drivers and reports of the laundry.
- **Registered User**: Any authenticated user of the platform.
- **Developer**: Member of the team who builds and consumes the RESTful API (technical stories).

---

## Requirement Traceability Matrix (RTM)

| User Story ID | Title                                        | Bounded Context           | Related Implementation Elements                                                                                                                                  |
|---------------|----------------------------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **US001**     | User Registration                            | IAM                       | `UserAccount`, `SignUpResource`, `IamApi`, `IamStore`, `SignUpForm`, `AccountTypeToggle`, `PasswordField`                                                        |
| **US002**     | User Sign In                                 | IAM                       | `UserAccount`, `IamApi`, `IamStore`, `IamGuards`, `SignInForm`, `AuthCard`                                                                                       |
| **US003**     | Order Visualization                          | Order Management          | `Order`, `OrderResource`, `OrderAssembler`, `OrdersApiEndpoint`, `OrderStore`, `OrderList`                                                                       |
| **US004**     | Order Tracking                               | Tracking and Notifications | `OrderList`, `OrderDetail` (status display); `Tracking`, `TrackingNotificationsStore`, `OrderStatusTracker` (planned)                                            |
| **US005**     | Order Management                             | Order Management          | `Order`, `OrderStatus`, `DeliveryMethod`, `OrderManagementApi`, `OrderStore`, `OrderList`, `OrderForm`, `OrderDetail`                                            |
| **US006**     | Garment Registration                         | Order Management          | `Garment`, `Order.registerGarment`, `OrderStore`, `OrderForm`, `OrderDetail`                                                                                     |
| **US009**     | Order Status Notifications                   | Tracking and Notifications | `Notification`, `TrackingNotificationsStore`, `TrackingNotificationsApi` (planned)                                                                               |
| **US010**     | Home Pickup Request                          | Delivery Management       | `Delivery`, `DeliveryType`, `DeliveryApi`, `DeliveryStore`, `DeliverySchedule`                                                                                   |
| **US011**     | Order Status Update                          | Order Management          | `Order.confirm`, `Order.complete`, `OrderStore`, `OrderDetail`; `LaundryOrder`, `OperationsBoard` (planned)                                                      |
| **US012**     | Operational Metrics                          | Order Management          | Pending implementation (dashboard on the `Home` view)                                                                                                            |
| **US014**     | Password Recovery                            | IAM                       | `ForgotPassword`, `PasswordField`, `IamValidators`, `IamStore.resetPassword`, `IamApi.resetPassword`                                                             |
| **US015**     | Pickup and Delivery Addresses                | Customer Management       | `Customer`, `CustomerStore`, `CustomerForm` (planned)                                                                                                            |
| **US016**     | Digital Payment of an Order                  | Billing and Subscriptions | `Payment`, `PaymentMethod`, `PaymentStatus`, `BillingApi`, `BillingStore`, `PaymentCheckout`, `PaymentReceipt`                                                   |
| **US017**     | Laundry Subscription Plan Management         | Billing and Subscriptions | `Subscription`, `Plan`, `PlanName`, `SubscriptionStatus`, `BillingStore`, `SubscriptionPlans`, `MySubscription`                                                  |
| **US018**     | Service Types and Prices Configuration       | Order Management          | Pending implementation (`/management/services` section)                                                                                                          |
| **US019**     | Payment History                              | Billing and Subscriptions | `Payment`, `PaymentAssembler`, `PaymentsApiEndpoint`, `BillingStore`, `PaymentHistory`                                                                           |
| **US020**     | Order Cancellation                           | Order Management          | Pending implementation (`Order` has no cancellation yet)                                                                                                         |
| **US021**     | Pickup Requests Acceptance                   | Delivery Management       | `Delivery.nextStatus`, `DeliveryStore.advance`, `DeliveryList`, `DeliveryTracking`                                                                               |
| **US022**     | Delivery Dispatch                            | Delivery Management       | `Delivery`, `DeliveryStatus`, `DeliveryStore`, `DeliverySchedule`, `DeliveryTracking`                                                                            |
| **US023**     | Drivers Registration                         | Delivery Management       | Pending implementation (`/management/drivers` section)                                                                                                           |
| **US024**     | Price Readjustment                           | Order Management          | Pending implementation (`Order` and `OrderDetail`)                                                                                                               |
| **US025**     | Price per Kilo Change                        | Order Management          | Pending implementation (`/management/services` section)                                                                                                          |
| **US026**     | Special Garment Service                      | Order Management          | Pending implementation (`/management/services` section)                                                                                                          |
| **US027**     | Pickup Rejection                             | Delivery Management       | Pending implementation (`Delivery`, `DeliveryStore`)                                                                                                             |
| **US028**     | Orders Export to Excel                       | Order Management          | Pending implementation (`OrderList`)                                                                                                                             |
| **TS001**          | Authentication Endpoint `/auth`                 | IAM                       | `IamApi`, `IamStore`, `UserAccountAssembler`, `UsersApiEndpoint`                                             |
| **TS002**          | Customers Endpoint `/customers`                 | Customer Management       | `CustomerManagementApi`, `CustomersApiEndpoint`, `CustomerAssembler` (planned)                               |
| **TS003**          | Orders Endpoint `/orders`                       | Order Management          | `OrderManagementApi`, `OrdersApiEndpoint`, `OrderAssembler`, `OrderResource`                                 |
| **TS004**          | RESTful API for Order Management                | Order Management          | `OrderManagementApi`, `OrdersApiEndpoint`, `OrderAssembler`, `OrderStore`                                    |
| **TS005**          | RESTful API for Order Status Update             | Order Management          | `OrderManagementApi.confirmOrder`, `OrderManagementApi.completeOrder`, `Order.confirm`, `Order.complete`     |
| **TS006**          | Payments Endpoint `/payments`                   | Billing and Subscriptions | `BillingApi`, `PaymentsApiEndpoint`, `PaymentAssembler`, `PaymentResource`                                   |
| **TS007**          | Notifications Endpoint `/notifications`         | Tracking and Notifications | `TrackingNotificationsApi`, `TrackingApiEndpoint`, `TrackingAssembler` (planned)                             |
| **TS008**          | Pickups and Deliveries Endpoint `/deliveries`   | Delivery Management       | `DeliveryApi`, `DeliveriesApiEndpoint`, `DeliveryAssembler`, `DeliveryResource`                              |

---

## US001: User Registration
**Title:** Register a Customer Account  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a customer, I want to register in WashTrack by providing my personal data so that I can create an account and manage my laundry services._

**Acceptance Criteria:**
- **AC1.1 – Successful Registration:** Given that the customer is in the registration form, when the customer correctly enters the name, phone, email and password and selects the register option, then the system creates the account and shows a message confirming that the registration was successful.
- **AC1.2 – Invalid Registration Data:** Given that the customer is in the registration form, when the customer enters incomplete data or an email with an invalid format, then the system shows a message indicating the fields that must be corrected and does not allow the registration to be completed.

---

## US002: User Sign In
**Title:** Sign In to WashTrack  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a registered user, I want to sign in to WashTrack so that I can access the features that correspond to my account._

**Acceptance Criteria:**
- **AC2.1 – Successful Sign In:** Given that the user has a registered account, when the user correctly enters the email and password, then the system validates the credentials and directs the user to the panel that corresponds to the user's role.
- **AC2.2 – Incorrect Credentials:** Given that the user is in the sign-in screen, when the user enters an incorrect email or password, then the system shows a message indicating that the credentials are not valid and keeps the user in the sign-in screen.

---

## US003: Order Visualization
**Title:** View Current and Previous Orders  
**Context:** Order Management  
**Description:**  
_As a customer, I want to view my current and previous orders so that I know the history of the laundry services I have used._

**Acceptance Criteria:**
- **AC3.1 – View Orders:** Given that the customer has signed in and has registered orders, when the customer enters the orders section, then the system shows the current and previous orders with basic information such as number, date, service, price and status.
- **AC3.2 – Customer Without Orders:** Given that the customer has signed in and has no registered orders, when the customer accesses the orders section, then the system shows a message indicating that there are no registered orders yet.

---

## US004: Order Tracking
**Title:** Follow the Status of an Order  
**Context:** Tracking and Notifications  
**Description:**  
_As a customer, I want to see the status of my order so that I know the stage of my garments without having to contact the laundry directly._

**Acceptance Criteria:**
- **AC4.1 – Status Query:** Given that the customer has an active order, when the customer selects that order, then the system shows the current status and the stages of the process of the garments.
- **AC4.2 – Status Update:** Given that the laundry has updated the status of an order, when the customer queries that order again, then the system shows the new registered status.

---

## US005: Order Management
**Title:** Register and Manage Customer Orders  
**Context:** Order Management  
**Description:**  
_As laundry staff, I want to register and manage the orders of the customers so that the information of the requested services is kept organized._

**Acceptance Criteria:**
- **AC5.1 – Register an Order:** Given that the laundry staff has signed in, when the staff registers a customer, the garments, the requested service and the delivery date, then the system creates the order and generates a unique identifier.
- **AC5.2 – Query an Order:** Given that there are registered orders, when the staff searches for an order, then the system shows the corresponding information of the customer, garments, service, price, status and delivery date.

---

## US006: Garment Registration
**Title:** Register the Garments of an Order  
**Context:** Order Management  
**Description:**  
_As laundry staff, I want to register the garments associated with each order so that I correctly control the received garments and avoid confusion during the service._

**Acceptance Criteria:**
- **AC6.1 – Register Garments:** Given that the staff is creating an order, when the staff registers the type and quantity of the received garments, then the system associates the garments with the corresponding order and saves the information.
- **AC6.2 – Query Garments:** Given that an order has registered garments, when the staff queries the order, then the system shows the garments and quantities associated with that order.

---

## US009: Order Status Notifications
**Title:** Receive Notifications of the Order Status  
**Context:** Tracking and Notifications  
**Description:**  
_As a customer, I want to receive notifications about the status changes of my order so that I know the progress of the service._

**Acceptance Criteria:**
- **AC9.1 – Status Change:** Given that there is an order registered in the name of the customer, when the order changes its status, then the system generates a notification with the new status.
- **AC9.2 – Update Record:** Given that the order has changed its status, when the system registers the update, then the date and time of the change are kept.

---

## US010: Home Pickup Request
**Title:** Request the Pickup of Garments at Home  
**Context:** Delivery Management  
**Description:**  
_As a customer, I want to request the pickup of my garments at home so that I can send my clothes to the laundry in a comfortable way._

**Acceptance Criteria:**
- **AC10.1 – Request Registration:** Given that the customer requires the pickup service, when the customer registers a valid address, date and time range, then the system registers the pickup request.
- **AC10.2 – Tracking Code Generation:** Given that the pickup request has been successfully registered, when the system confirms the request, then it generates a tracking code associated with the service.

---

## US011: Order Status Update
**Title:** Update the Status of an Order  
**Context:** Order Management  
**Description:**  
_As a laundry worker, I want to update the status of the orders so that the evolution of the service remains registered._

**Acceptance Criteria:**
- **AC11.1 – Valid Update:** Given that there is an order in process, when the worker registers a new valid status, then the system updates the status of the order.
- **AC11.2 – Responsible Record:** Given that the status of the order has been updated, when the system registers the change, then it keeps the date, time and responsible user of the update.

---

## US012: Operational Metrics
**Title:** Consult the Operational Metrics of the Business  
**Context:** Order Management  
**Description:**  
_As a laundry owner, I want to consult the operational metrics of the business so that I know the volume of orders, the income and the status of the operations._

**Acceptance Criteria:**
- **AC12.1 – Metrics Query:** Given that there are orders registered in the system, when the owner consults a specific period, then the system calculates the orders and income that correspond to the period.
- **AC12.2 – Orders Grouping:** Given that there are orders with different statuses, when the owner consults the metrics, then the system groups the orders according to their status.

---

## US014: Password Recovery
**Title:** Recover the Password of an Account  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a registered user, I want to recover my password when I forget it so that I can access my account again without creating a new one._

**Acceptance Criteria:**
- **AC14.1 – Recovery Request:** Given that the user is in the sign-in screen, when the user selects the "Forgot my password" option and enters a registered email, then the system sends a reset link to the indicated email and shows a confirmation message.
- **AC14.2 – Unregistered Email:** Given that the user has requested to recover the password, when the user enters an email that does not belong to any account, then the system shows a message indicating that the email is not registered and asks to verify the information.

---

## US015: Pickup and Delivery Addresses
**Title:** Register and Manage Pickup and Delivery Addresses  
**Context:** Customer Management  
**Description:**  
_As a customer, I want to register and manage my pickup and delivery addresses so that I speed up the request of home services without entering the data every time._

**Acceptance Criteria:**
- **AC15.1 – Address Registration:** Given that the customer has signed in and is in the addresses section, when the customer enters a valid address with district, reference and contact data, then the system saves the address and shows it in the list of addresses.
- **AC15.2 – Default Address:** Given that the customer has at least one registered address, when the customer marks an address as default, then the system uses it by default in the following pickup or delivery requests.

---

## US016: Digital Payment of an Order
**Title:** Pay an Order Digitally  
**Context:** Billing and Subscriptions  
**Description:**  
_As a customer, I want to pay digitally for the laundry service associated with my order so that I complete the payment without having to pay in cash in person._

**Acceptance Criteria:**
- **AC16.1 – Successful Payment:** Given that the customer has an order with a pending amount, when the customer selects the payment method, enters the requested data and confirms the operation, then the system registers the payment, updates the status of the order and shows a digital receipt.
- **AC16.2 – Rejected Payment:** Given that the customer is paying an order, when the operation is rejected by the financial institution, then the system informs that the payment could not be completed and keeps the amount as pending.

---

## US017: Subscription Plan Management
**Title:** Manage the Subscription Plans of the Laundry  
**Context:** Billing and Subscriptions  
**Description:**  
_As a laundry owner, I want to manage the subscription plan of my business so that I change the plan or renew the service according to the needs of my operation._

**Acceptance Criteria:**
- **AC17.1 – Plan Change:** Given that the owner has signed in and has an active plan, when the owner selects another available plan and confirms the change, then the system updates the contracted plan and enables the corresponding features.
- **AC17.2 – Plan Expiration:** Given that the plan contracted by the laundry has reached its expiration date, when the owner enters the platform, then the system shows an expiration notice and asks to renew in order to keep the features of the plan.

---

## US018: Service Types and Prices Configuration
**Title:** Configure Service Types and Their Prices  
**Context:** Order Management  
**Description:**  
_As a laundry administrator, I want to configure the service types and their prices so that the orders are registered with the current commercial information of my business._

**Acceptance Criteria:**
- **AC18.1 – Service Registration:** Given that the administrator has signed in and is in the configuration section, when the administrator registers the name of a service, its description and price, then the system saves the service and shows it as an available option when creating orders.
- **AC18.2 – Price Update:** Given that there is a registered service with a previous price, when the administrator modifies its price, then the system applies the new price to the orders created from that moment, without altering the orders already registered.

---

## US019: Payment History
**Title:** Consult the History of Payments  
**Context:** Billing and Subscriptions  
**Description:**  
_As a laundry owner, I want to consult the history of payments registered in the platform so that I verify the income associated with the attended orders._

**Acceptance Criteria:**
- **AC19.1 – History Query:** Given that the owner has signed in and there are registered payments, when the owner enters the payments section and selects a period, then the system shows the list of payments with date, order, customer, amount and status.
- **AC19.2 – Filter Without Results:** Given that the owner applies a search filter in the payment history, when there are no payments that match the selected criteria, then the system shows a message indicating that no results were found.

---

## US020: Order Cancellation
**Title:** Cancel a Registered Order  
**Context:** Order Management  
**Description:**  
_As a customer, I want to cancel a registered order so that I stop the service when I no longer need the washing of my garments._

**Acceptance Criteria:**
- **AC20.1 – Allowed Cancellation:** Given that the customer tries to cancel an order that has not started its processing, when the customer selects the cancel option and confirms the action, then the system changes the status of the order to "Cancelled" and shows a confirmation to the customer.
- **AC20.2 – Cancellation Not Allowed:** Given that the customer tries to cancel an order that is already in process or ready for delivery, when the customer selects the cancel option, then the system informs that the order can no longer be cancelled and suggests contacting the laundry.

---

## US021: Pickup Requests Acceptance
**Title:** Accept Pickup Requests  
**Context:** Delivery Management  
**Description:**  
_As laundry staff, I want to accept the pickup requests so that I can send a driver to pick up the garments of our customers._

**Acceptance Criteria:**
- **AC21.1 – Successful Acceptance:** Given that the staff is in the orders section and there is a pending pickup request, when the staff reviews it, presses the button with the check icon and chooses the driver, then the system updates the status of the request to "On the way" and notifies the customer.
- **AC21.2 – Driver Assignment:** Given that the pickup request was accepted, when the staff assigns a driver for the collection, then the system registers the assignment and associates it with the pickup request.

---

## US022: Delivery Dispatch
**Title:** Send the Delivery of an Order  
**Context:** Delivery Management  
**Description:**  
_As laundry staff, I want to send the delivery of an order by assigning a driver so that the garments are delivered at home and the customer knows who will bring them._

**Acceptance Criteria:**
- **AC22.1 – Driver Assignment:** Given that an order is ready for home delivery and the staff is in the deliveries section, when the staff selects the "Dispatch" option and chooses a driver, then the system registers the shipment, updates the status of the order to "On the way" and notifies the customer with the data of the driver.
- **AC22.2 – No Driver Available:** Given that the staff wants to send a delivery, when there are no drivers available, then the system shows a message indicating that there are no drivers available and keeps the order pending shipment.

---

## US023: Drivers Registration
**Title:** Register Drivers  
**Context:** Delivery Management  
**Description:**  
_As a laundry administrator, I want to register drivers so that they can be used in the pickups and deliveries._

**Acceptance Criteria:**
- **AC23.1 – Successful Registration:** Given that the administrator is in the drivers section, when the administrator enters the name, phone and vehicle of the driver, then the system saves the driver and shows the driver as an available option for the pickups and deliveries.
- **AC23.2 – Duplicate Driver:** Given that the administrator tries to register a driver with a phone that already exists, when the administrator submits the form, then the system shows an error message indicating that the driver is already registered.

---

## US024: Price Readjustment
**Title:** Readjust the Price of an Order After the Review  
**Context:** Order Management  
**Description:**  
_As laundry staff, I want to readjust the price after reviewing the garments so that the real price that will be charged to the customer can be verified._

**Acceptance Criteria:**
- **AC24.1 – Price Readjustment After the Review:** Given that the garments of an order were reviewed, when the staff presses the review button, modifies the order and the price, and confirms the change, then the system updates the price of the order and shows the final amount that will be charged to the customer.
- **AC24.2 – New Price Notification:** Given that the price of an order was readjusted, when the system registers the change, then it notifies the customer of the updated amount of the service.

---

## US025: Price per Kilo Change
**Title:** Change the Price per Kilo of the Clothes  
**Context:** Order Management  
**Description:**  
_As a laundry administrator, I want to change the price per kilo of the clothes so that I adjust it according to the needs of the business._

**Acceptance Criteria:**
- **AC25.1 – Rate Update:** Given that the administrator is in the services section, when the administrator changes the price per kilo and confirms the modification, then the system updates the current rate for the new orders.
- **AC25.2 – Invalid Price:** Given that the administrator enters an invalid or empty price, when the administrator tries to save the change, then the system shows an error message and keeps the previous price.

---

## US026: Special Garment Service
**Title:** Add a New Service for Special Garments  
**Context:** Order Management  
**Description:**  
_As a laundry administrator, I want to add new services for special garments so that we offer more types of services to our customers._

**Acceptance Criteria:**
- **AC26.1 – Service Registration:** Given that the administrator is in the services section and presses the "Add Special Garment" button, when the administrator registers the name, description and price of the service for special garments, then the system saves the service and shows it as an available option when creating orders.
- **AC26.2 – Duplicate Name:** Given that the administrator tries to add a service with a name that is already registered, when the administrator submits the form, then the system shows an error message indicating that the service already exists.

---

## US027: Pickup Rejection
**Title:** Reject Pickup Requests  
**Context:** Delivery Management  
**Description:**  
_As laundry staff, I want to reject pickup requests so that I notify the customer that the laundry is not available at that moment._

**Acceptance Criteria:**
- **AC27.1 – Request Rejection:** Given that there is a pending pickup request, when the staff rejects it and indicates a reason, then the system updates the status of the request to "Rejected".
- **AC27.2 – Customer Notification:** Given that the pickup request has been rejected, when the system registers the rejection, then it sends a notification to the customer with the reason.

---

## US028: Orders Export to Excel
**Title:** Export Orders to Excel  
**Context:** Order Management  
**Description:**  
_As a laundry administrator, I want to export the orders I need to Excel so that I can study them and take them into account for decision making._

**Acceptance Criteria:**
- **AC28.1 – Successful Export:** Given that the administrator is in the orders section and there are registered orders, when the administrator selects the export option and chooses the period or the required orders, then the system generates and downloads an Excel file with the requested information.
- **AC28.2 – No Orders in the Period:** Given that the administrator selects a period without registered orders, when the administrator tries to export, then the system shows a message indicating that there is no information to export.

---

## TS001: Authentication Endpoint
**Title:** Manage Authentication through the `/auth` Endpoint  
**Context:** IAM (Identity and Access Management)  
**Description:**  
_As a developer, I want to manage the authentication of users through the `/auth` endpoint so that credentials are validated and secure access to the platform is generated according to the role of the user._

**Acceptance Criteria:**
- **TAC1.1 – Successful Sign In:** Given that there is a registered user with valid credentials, when the developer sends a `POST` request to `/auth/login` with the corresponding email and password, then the API responds with `200 OK` and returns the data needed to keep the authenticated session, including the access token and the role of the user.
- **TAC1.2 – Invalid Credentials:** Given that the user provides incorrect credentials, when the developer sends a `POST` request to `/auth/login`, then the API responds with `401 Unauthorized` and informs that the provided credentials are not valid.

---

## TS002: Customers Endpoint
**Title:** Manage Customers through the `/customers` Endpoint  
**Context:** Customer Management  
**Description:**  
_As a developer, I want to manage customers through the `/customers` endpoint so that I can register, query, update and administer the information of the customers of the laundries._

**Acceptance Criteria:**
- **TAC2.1 – Customer Registration:** Given that the developer has the valid data of a new customer, when the developer sends a `POST` request to `/customers` with the required information, then the API responds with `201 Created` and returns the registered customer with its unique identifier.
- **TAC2.2 – Customer Query by ID:** Given that there is a customer with the provided identifier, when the developer sends a `GET` request to `/customers/{id}`, then the API responds with `200 OK` and returns the complete information of the customer.

---

## TS003: Orders Endpoint
**Title:** Manage Orders through the `/orders` Endpoint  
**Context:** Order Management  
**Description:**  
_As a developer, I want to manage orders through the `/orders` endpoint so that I can register, query and administer the service orders associated with the customers and their garments._

**Acceptance Criteria:**
- **TAC3.1 – Order Creation:** Given that there is a registered customer and valid order information is available, when the developer sends a `POST` request to `/orders` with the data of the customer, garments, service and delivery date, then the API responds with `201 Created` and returns the created order with its identifier and initial status.
- **TAC3.2 – Order Query by ID:** Given that there is an order with the provided identifier, when the developer sends a `GET` request to `/orders/{id}`, then the API responds with `200 OK` and returns the data of the order, including customer, garments, service, price, status and delivery date.

---

## TS004: RESTful API for Order Management
**Title:** Implement a RESTful API for the Management of Orders  
**Context:** Order Management  
**Description:**  
_As a developer, I want to implement RESTful endpoints to create and query orders so that the services of the platform can communicate with each other._

**Acceptance Criteria:**
- **TAC4.1 – Order Creation:** Given that a `POST` request with valid order data is received, when the server validates the request, then it registers the order and returns the HTTP code `201`.
- **TAC4.2 – Order Query:** Given that there is a registered order, when a `GET` request with a valid identifier is received, then the API returns the data of the order with the HTTP code `200`.
- **TAC4.3 – Invalid Data:** Given that a request with incomplete or invalid data is received, when the server validates the request, then it returns an HTTP error code indicating the problem.

---

## TS005: RESTful API for Order Status Update
**Title:** Implement a RESTful API to Update the Status of the Orders  
**Context:** Order Management  
**Description:**  
_As a developer, I want to implement a RESTful endpoint to update the status of the orders so that the tracking information is kept synchronized._

**Acceptance Criteria:**
- **TAC5.1 – Successful Update:** Given that there is an order and a `PATCH` request with a valid status is received, when the server validates the received data, then it updates the status of the order and returns the HTTP code `200`.
- **TAC5.2 – Nonexistent Order:** Given that a request for a nonexistent order is received, when the server looks for the order, then it returns the HTTP code `404`.
- **TAC5.3 – Invalid Status:** Given that a status that is not allowed is received, when the server validates the request, then it rejects the update and returns an HTTP error code.

---

## TS006: Payments Endpoint
**Title:** Manage Payments through the `/payments` Endpoint  
**Context:** Billing and Subscriptions  
**Description:**  
_As a developer, I want to expose a RESTful endpoint to register and query the payments of the orders so that the platform keeps the collection status synchronized with the payment gateway._

**Acceptance Criteria:**
- **TAC6.1 – Successful Payment Registration:** Given that a `POST` request to `/payments` with a valid order identifier and amount is received, when the server validates the data and confirms the transaction, then it registers the payment, updates the status of the order and returns the HTTP code `201` with the created resource.
- **TAC6.2 – Payments Query of an Order:** Given that a `GET` request to `/payments` filtered by an existing order identifier is received, when the server processes the query, then it returns the HTTP code `200` together with the list of payments associated with that order.
- **TAC6.3 – Invalid Amount:** Given that a request with a negative or missing amount is received, when the server validates the request, then it rejects the registration and returns the HTTP code `400` detailing the incorrect field.

---

## TS007: Notifications Endpoint
**Title:** Manage Notifications through the `/notifications` Endpoint  
**Context:** Tracking and Notifications  
**Description:**  
_As a developer, I want to expose a RESTful endpoint to generate and query the notifications of the users so that the status changes of an order are communicated automatically._

**Acceptance Criteria:**
- **TAC7.1 – Notification Generation:** Given that a `POST` request to `/notifications` with a valid recipient and event type is received, when the server validates the received data, then it registers the notification, queues it for delivery and returns the HTTP code `201`.
- **TAC7.2 – Notifications Query of a User:** Given that a `GET` request to `/notifications` of an authenticated user is received, when the server processes the query, then it returns the HTTP code `200` with the notifications of the user sorted from the most recent to the oldest.
- **TAC7.3 – Nonexistent Recipient:** Given that a request addressed to a user that does not exist is received, when the server looks for the recipient, then it does not generate the notification and returns the HTTP code `404`.

---

## TS008: Pickups and Deliveries Endpoint
**Title:** Manage Pickups and Deliveries through the `/deliveries` Endpoint  
**Context:** Delivery Management  
**Description:**  
_As a developer, I want to expose a RESTful endpoint to schedule and update the pickups and deliveries at home so that the logistic operation is registered and associated with each order._

**Acceptance Criteria:**
- **TAC8.1 – Pickup Scheduling:** Given that a `POST` request to `/deliveries` with a valid order, address and time slot is received, when the server validates the availability, then it registers the pickup, associates it with the order and returns the HTTP code `201`.
- **TAC8.2 – Driver Assignment:** Given that a `PATCH` request to `/deliveries` with the identifier of an available driver is received, when the server validates the data, then it assigns the driver, updates the status of the delivery and returns the HTTP code `200`.
- **TAC8.3 – Time Slot Not Available:** Given that a time slot without operational capacity is requested, when the server validates the availability, then it rejects the scheduling and returns the HTTP code `409` indicating the conflict.
