import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GeneratorPage from "@/pages/GeneratorPage";
import SavedPage from "@/pages/SavedPage";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={GeneratorPage} />
      <Route path="/saved" component={SavedPage} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
