import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="d-flex justify-content-between w-100">
          <ul className="d-flex mb-0">
            <li>
              <Link legacyBehavior href="#">About</Link>
            </li>
            <li>
              <Link legacyBehavior href="#">Mobile</Link>
            </li>
            <li>
              <Link legacyBehavior href="#">Terms</Link>
            </li>
            <li>
              <Link legacyBehavior href="#">Privacy</Link>
            </li>
            <li>
              <Link legacyBehavior href="#">Help</Link>
            </li>
            <li>
              <Link legacyBehavior href="#">Press</Link>
            </li>
          </ul>
          <p className="mb-0">2023 Le Society</p>
        </div>
      </div>
    </footer>
  );
}
