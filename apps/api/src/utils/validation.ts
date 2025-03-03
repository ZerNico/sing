import type { StandardSchemaV1 } from "@standard-schema/spec";

export function getPathSegmentKey(pathSegment: StandardSchemaV1.PathSegment | PropertyKey): PropertyKey {
  return typeof pathSegment === "object" ? pathSegment.key : pathSegment;
}

export type KeyofUnion<T> = T extends unknown ? keyof T : never;
export const isStandardSchema: {
  (schema: unknown): schema is StandardSchemaV1;
  v1(schema: unknown): schema is StandardSchemaV1;
} = Object.assign(
  function isStandardSchema(schema: unknown): schema is StandardSchemaV1 {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return typeof (schema as any)?.["~standard"] === "object";
  },
  {
    v1(schema: unknown): schema is StandardSchemaV1 {
      return isStandardSchema(schema) && schema["~standard"].version === 1;
    },
  },
);

type SchemaArgs<Args extends unknown[]> = Args | [schema: StandardSchemaV1, ...args: Args];

function _removeSchemaArg<Args extends unknown[]>(args: SchemaArgs<Args>): Args {
  const schema = args[0];
  if (isStandardSchema(schema)) {
    return args.slice(1) as Args;
  }
  return args as Args;
}

type InferFlattenedIssues<Schema extends StandardSchemaV1, MappedIssue = string> = FlattenedIssues<
  StandardSchemaV1.InferOutput<Schema>,
  MappedIssue
>;

export interface FlattenedIssues<Fields, MappedIssue = string> {
  formIssues: readonly MappedIssue[];
  fieldIssues: Partial<Record<KeyofUnion<Fields>, readonly MappedIssue[]>>;
}

export type IssueMapper<MappedIssue> = (issue: StandardSchemaV1.Issue) => MappedIssue;

export function flattenIssues(issues: readonly StandardSchemaV1.Issue[]): FlattenedIssues<unknown>;
export function flattenIssues<MappedIssue>(
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): FlattenedIssues<unknown, MappedIssue>;

export function flattenIssues<Schema extends StandardSchemaV1>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
): InferFlattenedIssues<Schema>;

export function flattenIssues<Schema extends StandardSchemaV1, MappedIssue>(
  schema: Schema,
  issues: readonly StandardSchemaV1.Issue[],
  mapIssue: IssueMapper<MappedIssue>,
): InferFlattenedIssues<Schema, MappedIssue>;
export function flattenIssues(
  ...args: SchemaArgs<[issues: readonly StandardSchemaV1.Issue[], mapIssue?: IssueMapper<unknown>]>
): FlattenedIssues<unknown, unknown> {
  const [issues, mapIssue = (issue: StandardSchemaV1.Issue) => issue.message] = _removeSchemaArg(args);
  const formIssues: unknown[] = [];
  const fieldIssues: Record<PropertyKey, unknown[]> = {};

  for (const issue of issues) {
    if (issue.path?.length) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const key = getPathSegmentKey(issue.path[0]!);
      fieldIssues[key] ??= [];
      fieldIssues[key].push(mapIssue(issue));
    } else {
      formIssues.push(mapIssue(issue));
    }
  }

  return {
    formIssues,
    fieldIssues,
  };
}
