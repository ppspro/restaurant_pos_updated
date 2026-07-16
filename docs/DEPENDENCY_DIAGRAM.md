# Module Dependency Diagram

```mermaid
graph TD
  subgraph Shared Core
    Logger
    Middlewares
    Errors
  end
  subgraph Modules
    Auth --> Users
    Users --> Orders
    Menu --> Orders
    Orders --> Payments
    Payments --> Printing
  end
```
