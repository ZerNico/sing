import NavItems from "./nav-items";

export default function Footer() {
  return (
    <>
      <div class="h-16" />
      <footer class="fixed right-0 bottom-0 left-0 flex h-16 items-center justify-center border-white/10 border-t md:hidden">
        <NavItems />
      </footer>
    </>
  );
}
