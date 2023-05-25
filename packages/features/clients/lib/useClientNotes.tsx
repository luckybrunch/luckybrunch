import { useState, useEffect } from "react";

import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui";

let timeoutRef: NodeJS.Timeout;

export function useClientNotes(clientEmail?: string) {
  const { data: initialNotes = "" } = trpc.viewer.clients.clientNotes.useQuery(
    {
      clientEmail: clientEmail ?? "",
    },
    {
      enabled: !!clientEmail,
    }
  );
  const [notes, setNotes] = useState(initialNotes);

  const mutation = trpc.viewer.clients.setClientNotes.useMutation({
    onMutate: () => {
      showToast("Changes are being saved, please wait!", "warning");
    },
    onSuccess: () => {
      showToast("Changes saved!", "success");
    },
    onError: () => {
      showToast("An error occurred while trying save client notes!", "error");
    },
  });

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const updateNotes = (notes: string) => {
    setNotes(notes);
    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
      if (!clientEmail) {
        return;
      }

      mutation.mutate({
        clientEmail,
        content: notes,
      });
    }, 1200);
  };

  return { notes, updateNotes };
}
