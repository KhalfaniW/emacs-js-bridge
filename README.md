# Emacs Bun Bridge

A JS bridge for interacting with Emacs server through TCP connections. Execute Emacs Lisp from JS applications.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- Emacs 26+ installed and in PATH
- Linux/macOS system

## Installation

```bash
bun add emacs-bun-bridge
```

## Quick Start

```typescript
import { EmacsServer } from "emacs-bun-bridge";

const emacs = new EmacsServer();

try {
  await emacs.startServer();
  const result = await emacs.evaluate("(+ 2 3)");
  console.log(result); // 5
  await emacs.close();
} catch (err) {
  console.error(err);
}
```

## API

### EmacsServer

- `constructor(port?: number)` - Create server instance (default port: 5999)
- `startServer(): Promise<void>` - Start Emacs server
- `evaluate(lispCode: string): Promise<any>` - Evaluate Lisp expression
- `close(): Promise<void>` - Close connection and server

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build project
bun run build
```

## License

MIT
