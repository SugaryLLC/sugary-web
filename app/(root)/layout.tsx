import { Navbar } from "@/components/Navbar";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default layout;
