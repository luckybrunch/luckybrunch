import { useClientNotes } from "@calcom/features/clients/lib/useClientNotes";

type NotesProps = {
  clientEmail?: string;
};

export default function Notes(props: NotesProps) {
  const { clientEmail } = props;
  const { notes, updateNotes } = useClientNotes(clientEmail);

  return (
    <section>
      <textarea
        onChange={(e) => {
          updateNotes(e.target.value);
        }}
        value={notes}
        className="border-brand-100 max-h-[60vh] min-h-[60vh] w-full rounded-xl border-2"
        placeholder="Write a Note..."
      />
    </section>
  );
}
