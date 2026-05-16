import { getAuditEvents } from "../ai-brain";

export const auditRepository = {
  findRecent: (limit = 80) => getAuditEvents(limit),
};
