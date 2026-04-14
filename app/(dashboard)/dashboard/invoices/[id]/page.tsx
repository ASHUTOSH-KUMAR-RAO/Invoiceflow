export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">Invoice {params.id}</h1>
    </div>
  );
}
