import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GeneratorPage from "@/pages/GeneratorPage";
import SavedPage from "@/pages/SavedPage";
import GuestPage from "@/pages/GuestPage";
import WorkLogPage from "@/pages/WorkLogPage";
import LyricsPage from "@/pages/LyricsPage";
import StudyTimerPage from "@/pages/StudyTimerPage";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/generator" component={GeneratorPage} />
      <Route path="/saved" component={SavedPage} />
      <Route path="/guest" component={GuestPage} />
      <Route path="/worklog" component={WorkLogPage} />
      <Route path="/lyrics" component={LyricsPage} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <StudyTimerPage active={location === "/"} />
        {location !== "/" && <Router />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
