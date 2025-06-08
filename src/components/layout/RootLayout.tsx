import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div>
      <header>
        <h1>Booking Platform</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
