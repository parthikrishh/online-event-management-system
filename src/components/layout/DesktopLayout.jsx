import Navbar from '../Navbar';
import Footer from '../Footer';

export default function DesktopLayout({ user, setUser, children }) {
  return (
    <div className="app-shell app-shell--desktop">
      <Navbar user={user} setUser={setUser} />
      <main className="main-content main-content--desktop">{children}</main>
      <Footer />
    </div>
  );
}
