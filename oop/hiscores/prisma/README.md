# Multiple database types with Prisma

Currently there is no direct support for using multiple different database
types with Prisma. However, this is being looked into in [#2443](https://github.com/prisma/prisma/issues/2443).

In the meantime there is a workaround that utalizes the fact that the Prisma CLI
has the optional flag of `--schema` to choose which file to use when generating
and the `output` property in the `generator client` part of the schema that
changes the location of the generated files.

This means that multiple schema files can be made that are generated to different
folders and then selectively imported. An import may look like this:

```typescript
import { PrismaClient as Client1 } from "../../prisma/generated/client1";
```

This is further explained [here](https://github.com/prisma/prisma/issues/2443#issuecomment-1110434344).
