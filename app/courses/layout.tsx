"use client";

import { ReactNode } from "react";
import { MobileNavbar } from "../../components/mobile-navbar";

interface CoursesLayoutProps {
  children: ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  return (
    <div>
      <MobileNavbar />
      <main>{children}</main>
    </div>
  );
}
