import React from "react";

export interface User {
  id: string;
  email: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyPhone2?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyId?: string;
  hasChangedPassword: boolean; 
  hasAcceptedTerms: boolean;  
  isAdmin: boolean;  
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  login: async () => {
    throw new Error("login not implemented");
  },
  register: async () => {
    throw new Error("register not implemented");
  },
  logout: () => {},
  updateUser: () => {},
});
