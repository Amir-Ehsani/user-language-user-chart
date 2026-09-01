import Search from "@/components/Search";

export default function HomePage() {
  return (
    <section className="hero">
      <h1>Languages in a GitHub account</h1>
      <p>
        Look up a username. Public repos are scanned and charted by language
        size. Switch the view if you want.
      </p>
      <Search />
      <p className="samples">
        try{" "}
        <a href="/u/gaearon">gaearon</a>
        <a href="/u/torvalds">torvalds</a>
        <a href="/u/yyx990803">yyx990803</a>
      </p>
    </section>
  );
}
