Cool — here are **copy-paste module templates** for:

* `cache.redis`
* `queue.bullmq`

They’re written to match the platform style you already established (Nest modules, ConfigService, safe defaults). I’m assuming your generated apps already have `@nestjs/config` available (they do, based on your platform baseline). If any earlier template files expired on my side, that doesn’t affect these new templates.

---

# ✅ Module: `cache.redis`

### `templates/modules/cache.redis/redis.module.ts.hbs`

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis.service";

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

### `templates/modules/cache.redis/redis.service.ts.hbs`

```ts
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { Redis as RedisClient } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>("REDIS_URL") ?? "redis://localhost:6379";
    this.client = new Redis(url, {
      // Safer defaults for platform template
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  getClient(): RedisClient {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // fallback if quit fails
      this.client.disconnect();
    }
  }
}
```

> Notes:
>
> * `ioredis` is the most common production choice.
> * Service exposes `getClient()` to keep your generators flexible.
> * Includes lifecycle cleanup.

---

# ✅ Module: `queue.bullmq`

BullMQ needs Redis — your injector already ensures redis is present first.

### `templates/modules/queue.bullmq/queue.module.ts.hbs`

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "../redis/redis.module";
import { QueueService } from "./queue.service";

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
```

### `templates/modules/queue.bullmq/queue.service.ts.hbs`

```ts
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queue: Queue;

  constructor(private readonly config: ConfigService) {
    const queueName = this.config.get<string>("QUEUE_NAME") ?? "default";
    const connectionUrl =
      this.config.get<string>("REDIS_URL") ?? "redis://localhost:6379";

    this.queue = new Queue(queueName, {
      connection: { url: connectionUrl },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    });
  }

  async add<T extends Record<string, any>>(name: string, payload: T) {
    return this.queue.add(name, payload);
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
```

### `templates/modules/queue.bullmq/worker.ts.hbs`

This is a generic worker template; your injector writes it as:
`src/workers/<queueName>.worker.ts`

```ts
import { Worker } from "bullmq";
import * as dotenv from "dotenv";

// Load env for worker runs (works in local + docker)
dotenv.config();

const queueName = process.env.QUEUE_NAME ?? "{{queueName}}";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

// Basic worker example
const worker = new Worker(
  queueName,
  async (job) => {
    // TODO: implement job processing logic
    // Example:
    // if (job.name === "send-email") { ... }
    return { ok: true };
  },
  { connection: { url: redisUrl } }
);

worker.on("completed", (job) => {
  // eslint-disable-next-line no-console
  console.log(`[worker:${queueName}] completed job`, job.id);
});

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`[worker:${queueName}] failed job`, job?.id, err);
});
```

**Important:** your injector should render `{{queueName}}` when writing this file:

* `m.config.queueName` from spec.

---

# ✅ Package deps the injector must add

When `cache.redis` or `queue.bullmq` is injected, merge into generated `package.json`:

### For Redis:

* `ioredis`

### For BullMQ:

* `bullmq`
* `dotenv` (only for worker convenience; optional if you already have it)

Minimal versions (don’t pin too hard, but keep stable):

* `"ioredis": "^5.4.0"`
* `"bullmq": "^5.10.0"`
* `"dotenv": "^16.4.0"`

---

# ✅ Docker-compose injection (redis service)

Your earlier redis block is fine. Ensure this lives under `services:` and that your `.env.docker` includes:

```bash
REDIS_URL=redis://redis:6379
QUEUE_NAME=default
```

---

# One tight fix: worker execution script (optional but valuable)

Add to generated `package.json` scripts when bullmq injected:

```json
{
  "scripts": {
    "worker": "node dist/workers/{{queueName}}.worker.js"
  }
}
```

And ensure TypeScript compilation includes `src/workers/**/*.ts`.

---

## Next action (so this becomes real)

If you paste your **`writeArtifact`/template rendering function** (from your generator), I’ll give you the exact patch to:

1. render `worker.ts.hbs` with `queueName`
2. merge `package.json` deps safely
3. ensure compose redis block is inserted deterministically (not via naive regex)

But even without that, the templates above are ready to drop into `templates/modules/...` right now.
