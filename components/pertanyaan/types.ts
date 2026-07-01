import type { Gejala, KnowledgeBaseData } from "@/lib/knowledge-base";

export interface PublicKnowledgeBaseResponse {
  success: boolean;
  gejala?: Gejala[];
  message?: string;
}

export interface PertanyaanDataState {
  knowledgeBaseData: KnowledgeBaseData | null;
  knowledgeBaseMessage: string | null;
}
