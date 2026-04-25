import { Link } from "react-router-dom";

export function Footer(): JSX.Element {
  return (
    <footer className="ml-15 mt-20 py-20 flex h-20 flex-col items-center justify-center bg-[#3d3d43] text-[13px] text-white">
      <div>Copyright © 2025 Peter Nam.</div>
      <Link
        className="text-white no-underline hover:text-[#764cfc] hover:underline"
        to="/privacy"
        rel="noreferrer"
      >
        Privacy Policy &amp; Terms of Service
      </Link>
    </footer>
  );
}
