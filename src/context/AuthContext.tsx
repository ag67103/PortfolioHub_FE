import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMe, getUserBySlug, getUserByUserId, incrementVisitorCount, logout as logoutApi } from "../services/api";

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    loggedInUser: any;
    setLoggedInUser: (user: any) => void;
    isMe: boolean;              // viewing own profile AND not in preview mode (controls edit UI)
    isOwner: boolean;           // viewing own profile (even in preview mode)
    setIsMe: (value: boolean) => void;
    previewMode: boolean;       // owner is looking at the page as a visitor would
    setPreviewMode: (value: boolean) => void;
    isValidUser: boolean;
    setIsValidUser: (value: boolean) => void;
    currentUser: any;
    setCurrentUser: (user: any) => void;
    logout: () => Promise<void>;

    isCurrentUserLoading: boolean;
    setIsCurrentUserLoading: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOwner, setIsMe] = useState(false);
    const [previewMode, setPreviewModeState] = useState<boolean>(() => sessionStorage.getItem('preview_as_visitor') === '1');
    const setPreviewMode = (value: boolean) => {
        sessionStorage.setItem('preview_as_visitor', value ? '1' : '0');
        setPreviewModeState(value);
    };
    const isMe = isOwner && !previewMode;
    const [isValidUser, setIsValidUser] = useState(false);

    const [isLoggedInUserLoading, setIsLoggedInUserLoading] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);

    const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);  

    const location = useLocation();
    // Profile pages: /u/<slug> (public link) or /user/<id>; anywhere else shows the logged-in user's own portfolio
    const slugMatch = location.pathname.match(/^\/u\/([^/]+)/);
    const idMatch = location.pathname.match(/^\/user\/([^/]+)/);
    const routeSlug = slugMatch ? decodeURIComponent(slugMatch[1]) : undefined;
    const currentUserId = idMatch ? idMatch[1] : undefined;
    const routeKey = routeSlug ? `s:${routeSlug}` : currentUserId ? `i:${currentUserId}` : 'me';
    const loadedKey = useRef<string | null>(null);

    const getLoggedInUser = async () => {
        const user = await getMe();
        setLoggedInUser(user);
    }

    const getCurrentUser = async (routeUserId: string | undefined) => {
        try {
            let user: any;
            if (routeSlug) {
                user = await getUserBySlug(routeSlug);
            } else {
                const id = routeUserId ?? loggedInUser?.id;
                if (!id) {
                    // Logged out on the landing page: there is no profile to load
                    setCurrentUser(null);
                    return;
                }
                user = await getUserByUserId(id);
            }
            setCurrentUser(user);

            // Count a visit once per session, only when looking at someone else's portfolio
            const isViewingOwnProfile = loggedInUser && loggedInUser.id === user.id;
            if (user.id && !isViewingOwnProfile) {
                const visitKey = `visited_${user.id}`;
                if (!sessionStorage.getItem(visitKey)) {
                    const result = await incrementVisitorCount(user.id);   // null on 429 / failure (not critical)
                    sessionStorage.setItem(visitKey, 'true');
                    if (result && result.visitor_count !== undefined) {
                        setCurrentUser({ ...user, visitor_count: result.visitor_count });
                    }
                }
            }
        } catch (error) {
            setCurrentUser(null);
        }
    }

    // Moving to another profile (e.g. /u/a -> /u/b) must load that profile
    useEffect(() => {
        if (loadedKey.current !== null && loadedKey.current !== routeKey) setIsCurrentUserLoading(true);
    }, [routeKey]);

    useEffect(() => {
        const initialize = async () => {
            if (isLoggedInUserLoading) {
                await getLoggedInUser();
                setIsLoggedInUserLoading(false);
            }

            if (isCurrentUserLoading && !isLoggedInUserLoading) {
                await getCurrentUser(currentUserId);
                loadedKey.current = routeKey;
                setIsCurrentUserLoading(false);
            }
        };
        initialize();
    }, [isCurrentUserLoading, isLoggedInUserLoading, routeKey]);

    useEffect(() => {
        setIsAuthenticated(!!(loggedInUser && loggedInUser?.id));
        setIsMe(!!(loggedInUser && currentUser && loggedInUser?.id === currentUser?.id));
        setIsValidUser(!!(currentUser && currentUser?.id));
    }, [loggedInUser, currentUser, currentUserId]);

    const logout = async () => {
        // Call logout API to blacklist the token
        await logoutApi();
        // Clear local state
        setIsAuthenticated(false);
        setIsMe(false);
        setIsValidUser(false);
        setLoggedInUser(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isMe, isOwner, setIsMe, previewMode, setPreviewMode, isValidUser, setIsValidUser, loggedInUser, setLoggedInUser, currentUser, setCurrentUser, logout, isCurrentUserLoading, setIsCurrentUserLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}