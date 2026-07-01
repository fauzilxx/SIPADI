import type { PublicFeedbackCard } from "@/components/hasil/types";

export interface HomeFeedbackResponse {
  success: boolean;
  publicCards?: PublicFeedbackCard[];
}
