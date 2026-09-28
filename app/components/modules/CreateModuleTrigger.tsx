"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "../icons";
import { CreateModuleModal } from "./CreateModuleModal";

export function CreateModuleTrigger() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-ink font-display font-semibold text-[13.5px] shrink-0 cursor-pointer"
      >
        <PlusIcon size={16} />
        Create New Module
      </button>

      {showModal && (
        <CreateModuleModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
