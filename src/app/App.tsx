import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppBetterPopup } from "./components/AppBetterPopup";

function App() {
  const [showAppPopup, setShowAppPopup] = useState(() => {
    const userString = localStorage.getItem("mantraUser");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        return user.showAppPopup !== false;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return false;
  });

  const handleClosePopup = () => {
    setShowAppPopup(false);
  };

  return (
    <>
      {showAppPopup && <AppBetterPopup onClose={handleClosePopup} />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
