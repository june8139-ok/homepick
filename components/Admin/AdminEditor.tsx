"use client";
import DetailPagesSection, {AdminContentStatus} from "./DetailPagesSection";

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
    <>
    <AdminContentStatus/>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div id="edit-basic" className="scroll-mt-24"><BasicInfoSection /></div>

        <div id="edit-price" className="scroll-mt-24"><PriceInfoSection /></div>

        <div id="edit-contract" className="scroll-mt-24"><ContractSection /></div>

        <ConditionHistorySection />

        <div id="edit-location" className="scroll-mt-24"><LocationSection /></div>

        <div id="edit-images" className="scroll-mt-24"><ImageSection /></div>

        <DetailPagesSection />

        <RegisterButton
          mode={mode}
        />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <PreviewSection />
      </aside>
    </div>
    </>
  );
}
