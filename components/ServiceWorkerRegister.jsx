// FILE: components/ServiceWorkerRegister.jsx
"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "../app/service-worker-registration";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null; // هذا المكون لا يعرض شيئاً، فقط ينفذ الكود
}