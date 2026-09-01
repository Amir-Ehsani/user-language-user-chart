"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search({ initial = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function go(event) {
    event.preventDefault();
    const login = value.trim().replace(/^@/, "");
    if (!login) return;
    router.push(`/u/${encodeURIComponent(login)}`);
  }

  return (
    <form className="search" onSubmit={go}>
      <input
        name="login"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="username"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        aria-label="GitHub username"
      />
      <button type="submit">go</button>
    </form>
  );
}
