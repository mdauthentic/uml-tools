import Link from "next/link";
import GitHubButton from "react-github-btn";

const Header = () => (
  <header className="mx-auto flex h-12 w-full items-center bg-header px-5 text-white shadow-custom">
    <div className="flex w-full items-center justify-between">
      <Link href="/" title="Home" className="text-base font-semibold">
        UML Tools
      </Link>
      <GitHubButton
        href="https://github.com/mdauthentic/uml-tools"
        data-icon="octicon-star"
        data-size="large"
        aria-label="Star mdauthentic/uml-tools on GitHub"
      >
        Star
      </GitHubButton>
    </div>
  </header>
);

export default Header;
