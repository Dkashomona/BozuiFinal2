import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

type RefundActionInput = {
  requestId: string;
};

export async function executeRefund({ requestId }: RefundActionInput) {
  if (!requestId) {
    throw new Error("Missing requestId");
  }

  const fn = httpsCallable<RefundActionInput>(
    functions,
    "executeRefund"
  );

  return await fn({ requestId });
}

export async function rejectRefund({ requestId }: RefundActionInput) {
  if (!requestId) {
    throw new Error("Missing requestId");
  }

  const fn = httpsCallable<RefundActionInput>(
    functions,
    "rejectRefund"
  );

  return await fn({ requestId });
}
