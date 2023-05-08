export default function Information() {
  return (
    <article className="border-brand-100 mb-16 rounded-xl border-2 p-7">
      <section>
        <h4 className="capitilize text-lg font-semibold">Main</h4>
        <div className="mb-6">
          <p className="text-sm font-light">Most important client information</p>
        </div>

        <div className="mb-6">
          <h5 className="font-semibold capitalize text-gray-600 ">job title</h5>
          <p className="text-sm font-light">Manager</p>
        </div>

        <div className="mb-6">
          <h5 className="font-semibold capitalize text-gray-600 ">bio</h5>
          <p className="text-sm font-light">I am the best &amp; most important client</p>
        </div>
      </section>
    </article>
  );
}
