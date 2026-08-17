import { BrowserRouter } from "react-router-dom";

import { ToastProvider } from "@/components/common/ToastProvider";
import { AppRoutes } from "@/routes";

/* The toast stack sits outside the router, so a toast raised on the way to
   another screen is still there when that screen paints. */
const App = () => (
  <ToastProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ToastProvider>
);

export default App;
