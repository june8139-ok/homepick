"use client";

import BasicInfoSection from "./BasicInfoSection";
import PriceInfoSection from "./PriceInfoSection";
import ContractSection from "./ContractSection";
import ConditionHistorySection from "./ConditionHistorySection";
import LocationSection from "./LocationSection";
import ImageSection from "./ImageSection";
import RegisterButton from "./RegisterButton";
import PreviewSection from "./PreviewSection";

export default function AdminEditor({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <BasicInfoSection />

        <PriceInfoSection />

        <ContractSection />

        <ConditionHistorySection />

        <LocationSection />

        <ImageSection />

        <RegisterButton
          mode={mode}
        />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <PreviewSection />
      </aside>
    </div>
  );
}
