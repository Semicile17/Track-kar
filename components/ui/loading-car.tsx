"use client"

import { BeatLoader } from "react-spinners"

export function LoadingCar() {
  return (
    <div className="flex items-center justify-center w-full min-h-[200px]">
      <BeatLoader 
        color="var(--primary)"
        size={15}
        margin={2}
      />
    </div>
  );
} 