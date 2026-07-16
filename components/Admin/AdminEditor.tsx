"use client";

import BasicInfoSection from "./BasicInfoSection";
import ContractSection from "./ContractSection";
import LocationSection from "./LocationSection";
import LivingSection from "./LivingSection";
import FutureSection from "./FutureSection";
import DesignSection from "./DesignSection";
import ImageSection from "./ImageSection";
import RegisterButton from "./RegisterButton";

import AnalysisSummary from "./AnalysisSummary";
import PreviewSection from "./PreviewSection";
import AnalysisDetail from "./AnalysisDetail";

export default function AdminEditor({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <BasicInfoSection />
        <ContractSection />
        <LocationSection />
        <LivingSection />
        <FutureSection />
        <DesignSection />
        <ImageSection />
        <RegisterButton mode={mode} />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <AnalysisSummary />
        <PreviewSection />
        <AnalysisDetail />
      </aside>
    </div>
  );
}