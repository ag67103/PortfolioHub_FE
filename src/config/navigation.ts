export interface NavItem {
    path: string;
    label: string;
    isRoute: boolean;
}

/** Section links shown on a portfolio page (about 5, in page order). */
export const getNavigationItems = (isMe: boolean, isValidUser: boolean): NavItem[] => {
    const items: NavItem[] = [
        { path: '#projects', label: 'Projects', isRoute: false },
        { path: '#experience', label: 'Experience', isRoute: false },
        { path: '#about', label: 'About', isRoute: false },
        { path: '#skills', label: 'Skills', isRoute: false },
    ];
    if (!isMe && isValidUser) items.push({ path: '#contact', label: 'Contact', isRoute: false });
    return items;
};
