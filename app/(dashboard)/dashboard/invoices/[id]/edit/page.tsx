export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">Edit Invoice {params.id}</h1>
    </div>
  );
}
