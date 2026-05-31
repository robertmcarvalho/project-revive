// Wrapper assíncrono sobre os mocks. Trocar implementações por fetch quando o backend subir.
import {
  pipelineStages, leadsSeed, lossReasons, customFieldDefs, users,
  activitiesSeed, messagesSeed,
  type Lead, type PipelineStage, type Activity, type ChatMessage, type LossReason, type CustomFieldDef, type CommercialUser, type DealOrigin,
} from "@/data/comercialMock";

let _leads: Lead[] = [...leadsSeed];
let _activities: Activity[] = [...activitiesSeed];
let _messages: ChatMessage[] = [...messagesSeed];
let _stages: PipelineStage[] = [...pipelineStages];
let _reasons: LossReason[] = [...lossReasons];
let _fields: CustomFieldDef[] = [...customFieldDefs];

const wait = <T,>(value: T, ms = 120): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

export const comercialApi = {
  // Pipeline
  listStages: () => wait([..._stages].sort((a, b) => a.sort_order - b.sort_order)),
  updateStages: (next: PipelineStage[]) => { _stages = [...next]; return wait(true); },

  // Leads
  listLeads: (filter?: { q?: string; stageId?: string; ownerId?: string; origin?: DealOrigin }) => {
    let out = [..._leads];
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      out = out.filter((l) => l.fantasyName.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.decisorName.toLowerCase().includes(q));
    }
    if (filter?.stageId) out = out.filter((l) => l.stageId === filter.stageId);
    if (filter?.ownerId) out = out.filter((l) => l.ownerId === filter.ownerId);
    if (filter?.origin) out = out.filter((l) => l.origin === filter.origin);
    return wait(out);
  },
  getLead: (id: string) => wait(_leads.find((l) => l.id === id) ?? null),
  createLead: (data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "stageEnteredAt">) => {
    const id = `ld_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const lead: Lead = { ...data, id, createdAt: now, updatedAt: now, stageEnteredAt: now };
    _leads = [lead, ..._leads];
    _activities = [{ id: `a_${id}`, leadId: id, type: "created", text: "Lead criado manualmente", at: now }, ..._activities];
    return wait(lead);
  },
  updateLead: (id: string, patch: Partial<Lead>) => {
    _leads = _leads.map((l) => {
      if (l.id !== id) return l;
      const now = new Date().toISOString();
      const moved = patch.stageId && patch.stageId !== l.stageId;
      if (moved) {
        const stage = _stages.find((s) => s.id === patch.stageId);
        _activities = [{ id: `a_${id}_${Date.now()}`, leadId: id, type: "stage_change", text: `Movido para ${stage?.name ?? "estágio"}`, at: now }, ..._activities];
      }
      return { ...l, ...patch, updatedAt: now, stageEnteredAt: moved ? now : l.stageEnteredAt };
    });
    return wait(_leads.find((l) => l.id === id)!);
  },
  loseLead: (id: string, reasonId: string, notes?: string) => {
    const won = _stages.find((s) => s.is_lost);
    return comercialApi.updateLead(id, { stageId: won?.id, lossReasonId: reasonId, lossNotes: notes });
  },
  convertLead: (id: string) => {
    const won = _stages.find((s) => s.is_won);
    return comercialApi.updateLead(id, { stageId: won?.id }).then((l) => ({ lead: l, pharmacyId: `farm_${id}` }));
  },

  // Activities & chat
  listActivities: (leadId: string) => wait(_activities.filter((a) => a.leadId === leadId).sort((a, b) => +new Date(b.at) - +new Date(a.at))),
  listMessages: (leadId: string) => wait(_messages.filter((m) => m.leadId === leadId)),
  sendMessage: (leadId: string, text: string) => {
    const msg: ChatMessage = { id: `m_${Date.now()}`, leadId, from: "agent", text, at: new Date().toISOString() };
    _messages = [..._messages, msg];
    return wait(msg);
  },

  // Config
  listLossReasons: () => wait([..._reasons]),
  updateLossReasons: (next: LossReason[]) => { _reasons = [...next]; return wait(true); },
  listFieldDefs: () => wait([..._fields].sort((a, b) => a.sort_order - b.sort_order)),
  updateFieldDefs: (next: CustomFieldDef[]) => { _fields = [...next]; return wait(true); },

  // Users
  listUsers: () => wait(users as CommercialUser[]),

  // Dashboard
  dashboard: () => {
    const total = _leads.length;
    const novos = _leads.filter((l) => l.stageId === "s1").length;
    const qual = _leads.filter((l) => l.stageId === "s2").length;
    const props = _leads.filter((l) => l.stageId === "s4").length;
    const ganhos = _leads.filter((l) => l.stageId === "s6").length;
    const perdidos = _leads.filter((l) => l.stageId === "s7").length;
    const taxa = total ? Math.round((ganhos / total) * 100) : 0;
    const funnel = _stages.filter((s) => !s.is_lost).map((s) => ({ stage: s.name, count: _leads.filter((l) => l.stageId === s.id).length }));
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
        criados: _leads.filter((l) => l.createdAt.slice(0, 10) === key).length,
        ganhos: _leads.filter((l) => l.stageId === "s6" && l.updatedAt.slice(0, 10) === key).length,
      };
    });
    return wait({ total, novos, qual, props, ganhos, perdidos, taxa, funnel, days });
  },
};
