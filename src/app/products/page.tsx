import Image from "next/image";

async function getProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {products.map((p: any) => (
        <div
          key={p._id}
          className="border rounded-lg p-4 space-y-2"
        >
          {p.images?.[0] && (
            <Image
              src={p.images[0]}
              alt={p.name}
              width={300}
              height={300}
              className="rounded"
            />
          )}

          <h2 className="font-semibold">{p.name}</h2>
          <p>₹{p.price}</p>

          {p.discount > 0 && (
            <p className="text-green-600">
              {p.discount}% OFF
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
