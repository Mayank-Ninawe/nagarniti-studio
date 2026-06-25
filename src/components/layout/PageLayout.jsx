import Navbar from "./Navbar";

export default function PageLayout({
  children,
  noNav = false,
  className = "",
  contentClassName = "",
}) {
  return (
    <>
      {!noNav && <Navbar />}

      <main
        id="main-content"
        className={`page-shell ${className}`.trim()}
        style={{ paddingTop: noNav ? 0 : undefined }}
      >
        <div className={contentClassName}>{children}</div>
      </main>
    </>
  );
}