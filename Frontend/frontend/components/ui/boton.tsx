import React from "react";

export default function Boton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "absolute group  top-0 mt-3 h-10 w-10 flex left-1 ml-2 items-center justify-center rounded-lg cursor-pointer " +
        "text-yellow-300 rotate-0 dark:text-cyan-400 hover:text-cyan-400 hover:drop-shadow-lg hover:drop-shadow-cyan-500/50 dark:hover:text-yellow-300 dark:hover:drop-shadow-lg dark:hover:drop-shadow-yellow-500/50 dark:rotate-90" +
        "hover:ease-in hover:duration-150 bg-transparent border-none outline-none " +
        (props.className || "")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      
    </button>
  );
}