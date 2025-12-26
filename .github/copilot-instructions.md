You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Development Workflow

- Always use Angular CLI commands (`ng generate`) for creating components, services, guards, interceptors, and other Angular artifacts
- Use commands whenever possible instead of manually creating files
- Examples:
  - `ng generate component <name>` for components
  - `ng generate service <name>` for services
  - `ng generate guard <name>` for route guards
  - `ng generate interceptor <name>` for HTTP interceptors

## SOLID Principles

- **Single Responsibility Principle (SRP)**: Each class should have only one reason to change. Keep components, services, and classes focused on a single responsibility.
- **Open-Closed Principle (OCP)**: Software entities should be open for extension but closed for modification. Use inheritance and interfaces to extend functionality without modifying existing code.
- **Liskov Substitution Principle (LSP)**: Subtypes must be substitutable for their base types. Ensure derived classes can replace base classes without altering program correctness.
- **Interface Segregation Principle (ISP)**: Clients should not be forced to depend on interfaces they do not use. Create specific interfaces rather than general-purpose ones.
- **Dependency Inversion Principle (DIP)**: High-level modules should not depend on low-level modules. Both should depend on abstractions. Use dependency injection and interfaces to decouple dependencies.
