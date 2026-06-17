const GUARDIAN_SERVICE_URL = "http://127.0.0.1:8002/api";

export const GuardianService = {
  async getStatus() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/status`);
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async getPositions() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/positions`);
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async getLastClosedTrade() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/last-closed-trade`);
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async getMarketAnalysis() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/market-analysis`);
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async getLogs() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/logs`);
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async toggleAutoRun() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/toggle-auto-run`, { method: "POST" });
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async checkGuardianStatus() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/check-guardian-status`, { method: "POST" });
    if (!res.ok) {
      throw new Error(`Guardian service returned status ${res.status}`);
    }
    return await res.json();
  },

  async runGuardianClose() {
    const res = await fetch(`${GUARDIAN_SERVICE_URL}/run-guardian-close`, { method: "POST" });
    if (!res.ok) {
      const errorData: any = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Guardian service returned status ${res.status}`);
    }
    return await res.json();
  }
};
