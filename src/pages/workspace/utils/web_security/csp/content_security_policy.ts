export const CONTENT_SECURITY_POLICIES_USER_DATA_TYPE = 'contentSecurityPolicies';

export type SerializedContentSecurityPolicies = Record<string, SerializedContentSecurityPolicy>;

export interface SerializedContentSecurityPolicy {
  n: string;
  d: Array<{ n: string; v: string[] }>;
}

export interface ContentSecurityPolicy {
  name: string;
  directives: Map<string, string[]>;
}

export function getContentSecurityPolicyString(policy: ContentSecurityPolicy) {
  return Array.from(policy.directives.entries())
    .map(([directiveName, directiveValues]) =>
      directiveValues.length > 0 ? `${directiveName} ${directiveValues.join(' ')}` : `${directiveName}`,
    )
    .join('; ');
}

export function deserializeContentSecurityPolicy(
  serializedPolicy: SerializedContentSecurityPolicy,
): ContentSecurityPolicy {
  return {
    name: serializedPolicy.n,
    directives: new Map(
      serializedPolicy.d.map((directive) => {
        return [directive.n, directive.v];
      }),
    ),
  };
}

export function deserializeContentSecurityPolicies(
  serializedPolicies: SerializedContentSecurityPolicies | null,
): ContentSecurityPolicy[] {
  if (!serializedPolicies) {
    return [];
  }

  try {
    return Object.values(serializedPolicies).map(deserializeContentSecurityPolicy);
  } catch {
    return [];
  }
}

export function serializeContentSecurityPolicy(policy: ContentSecurityPolicy): SerializedContentSecurityPolicy {
  return {
    n: policy.name,
    d: Array.from(policy.directives).map(([directiveName, directiveValues]) => ({
      n: directiveName,
      v: directiveValues,
    })),
  };
}
