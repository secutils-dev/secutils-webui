export const CSP_POLICIES_USER_DATA_TYPE = 'cspPolicies';

export interface SerializedCspPolicy {
  n: string;
}

export interface CspPolicy {
  name: string;
}

export function deserializeCspPolicy(serializedCspPolicy: SerializedCspPolicy): CspPolicy {
  const cspPolicy: CspPolicy = {
    name: serializedCspPolicy.n,
  };

  return cspPolicy;
}

export function serializeCspPolicy(cspPolicy: CspPolicy): SerializedCspPolicy {
  const serializedCspPolicy: SerializedCspPolicy = {
    n: cspPolicy.name,
  };

  return serializedCspPolicy;
}
