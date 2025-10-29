import { createContext, useContext, useMemo } from "react";
import { Container } from "./container";

/**
 * DIProvider
 * 
 * Dependency Injection Provider for the application.
 * Note: This is now a minimal provider since AuthContext handles
 * its own dependency initialization directly.
 * 
 * This provider is kept for future expansion and compatibility
 * with other features that may need DI.
 */

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    const container = useMemo(() => {
        const c = new Container();

        // Container is ready for future dependency registrations
        // Auth dependencies are now managed directly in AuthContext

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}