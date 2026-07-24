import {
    requireAdmin,
  } from "../../../../lib/requireAdmin";
  
  import BriefingEditor from "../../../../components/Admin/BriefingEditor";
  
  export default async function NewBriefingPage() {
    await requireAdmin();
  
    return (
      <BriefingEditor
        mode="create"
      />
    );
  }