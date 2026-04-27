import { mysqlGenerate } from "drizzle-dbml-generator";

import * as schema from "./schema";

const out = "./schema.dbml";
const relational = false;

mysqlGenerate({ schema, out, relational });
