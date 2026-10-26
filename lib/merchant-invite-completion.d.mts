type CompletionResult = {
  data?: unknown;
  error?: { code?: string } | null;
  status?: number;
  expectedUserId?: string;
} | null;

type MappingResult = {
  data: { user_id: string } | null;
  error: unknown;
};

export function reconcileMerchantInviteCompletion(args: {
  complete: () => Promise<CompletionResult>;
  readMapping: () => PromiseLike<MappingResult> | Promise<MappingResult>;
  cleanup: () => Promise<{ error?: unknown } | null>;
}): Promise<{ status: "success" | "failed_safely" | "unconfirmed" }>;
