(function() {
  class Zano {
    request(method: string, params: Record<string, any> = {}, timeoutParam?: number): Promise<any> {
      const id = Math.random().toString(36).slice(2);
      const timeoutMs = typeof timeoutParam === "number" ? timeoutParam : null;

      return new Promise((resolve, reject) => {
        function handleResponse(event: MessageEvent) {
          if (
            event.source === window &&
            event.data &&
            event.data.zanoResponse &&
            event.data.id === id
          ) {
            window.removeEventListener("message", handleResponse);
            if (timeout) clearTimeout(timeout);
            resolve(event.data.response);
          }
        }
        window.addEventListener("message", handleResponse);

        const timeout = timeoutMs !== null
          ? setTimeout(() => {
              window.removeEventListener("message", handleResponse);
              reject(new Error("Request timeout exceeded"));
            }, timeoutMs)
          : null;

        window.postMessage(
          {
            zanoRequest: true,
            method,
            params,
            id,
            timeout: timeoutMs,
          },
          window.origin
        );
      });
    }
  }
  (window as any).zano = new Zano();
})();
