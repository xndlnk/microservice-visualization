# Coding Conventions

## Nest Services

- Make a transformer an `@Injectable` when it is useful to easily mock dependencies in tests. You don't need to make every class an `@Injectable`.
- Keep transformer logic independent of the Nest framework as much as possible. Nest might be replaced but the domain logic might stay for longer.
- Each `@Injectable` transformers name **should** end with `Service`.
- A variable of a transformer service **should NOT** end with `Service`.
- The file a transformer and its Nest service are defined in **should NOT** end with `.service.ts`.