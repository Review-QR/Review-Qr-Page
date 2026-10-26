/**
 * Reconcile an invite-completion RPC with the durable merchant mapping.
 * Only a returned PostgreSQL error plus a successful no-row mapping read
 * proves that the function statement rolled back and makes Auth cleanup safe.
 */
export async function reconcileMerchantInviteCompletion({ complete, readMapping, cleanup }) {
  let completion = null;

  try {
    completion = await complete();
  } catch {
    // A transport exception does not tell us whether Postgres committed.
  }

  let mapping;
  try {
    mapping = await readMapping();
  } catch {
    return { status: "unconfirmed" };
  }

  if (!isSuccessfulMappingResponse(mapping)) return { status: "unconfirmed" };
  if (typeof completion?.expectedUserId === "string"
    && mapping?.data?.user_id === completion.expectedUserId) {
    return { status: "success" };
  }
  if (mapping.data !== null) return { status: "unconfirmed" };

  if (!isDefinitiveDatabaseFailure(completion)) {
    return { status: "unconfirmed" };
  }

  try {
    const cleanupResult = await cleanup();
    if (cleanupResult?.error) return { status: "unconfirmed" };
    return { status: "failed_safely" };
  } catch {
    return { status: "unconfirmed" };
  }
}

function isSuccessfulMappingResponse(mapping) {
  return mapping !== null
    && typeof mapping === "object"
    && !Array.isArray(mapping)
    && Object.hasOwn(mapping, "error")
    && mapping.error === null
    && Object.hasOwn(mapping, "data");
}

function isDefinitiveDatabaseFailure(completion) {
  const code = completion?.error?.code;
  const status = completion?.status;
  return typeof code === "string"
    && /^[0-9A-Z]{5}$/.test(code)
    && Number.isInteger(status)
    && status >= 400
    && status < 500;
}
