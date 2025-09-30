import { Navbar } from "@/components/Navbar";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100">
      <Navbar />
      {children}
    </div>
  );
}

export default layout;
