"use client";

import { useEffect, useState } from "react";

import type { PublicFeedbackCard } from "@/components/hasil/types";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import type { HomeFeedbackResponse } from "@/components/home/types";
import PublicFeedbackMarquee from "@/components/public/PublicFeedbackMarquee";
import PublicSiteNavbar from "@/components/public/PublicSiteNavbar";

export default function Home() {
  const [publicFeedbackCards, setPublicFeedbackCards] = useState<
    PublicFeedbackCard[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPublicFeedbackCards() {
      try {
        const response = await fetch("/api/feedback", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as HomeFeedbackResponse;

        if (!response.ok || !payload.success) {
          return;
        }

        setPublicFeedbackCards(payload.publicCards ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
      }
    }

    loadPublicFeedbackCards();

    return () => controller.abort();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <PublicSiteNavbar activePage="home" diagnosisHref="/pertanyaan" />
      <HeroSection />
      <FeaturesSection />
      <PublicFeedbackMarquee
        cards={publicFeedbackCards}
        title="Pengalaman Petani Bersama SIPADI"
        description="Beberapa petani membagikan pengalaman mereka setelah menggunakan SIPADI untuk membantu mengenali kondisi padi dan menentukan langkah penanganan awal di lapangan."
      />
    </div>
  );
}
