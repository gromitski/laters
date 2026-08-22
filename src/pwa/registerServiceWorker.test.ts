import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

describe("registerServiceWorker", () => {
  it("offers a waiting update and reloads after it takes control", async () => {
    const worker = new FakeWorker("installed");
    const registration = new FakeRegistration(worker);
    const serviceWorkers = new FakeServiceWorkerContainer(registration, new FakeWorker("activated"));
    const onUpdateAvailable = vi.fn();
    const reload = vi.fn();

    await registerServiceWorker(onUpdateAvailable, {
      serviceWorkers: serviceWorkers as unknown as ServiceWorkerContainer,
      reload,
    });

    expect(serviceWorkers.register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(registration.update).toHaveBeenCalledOnce();
    expect(onUpdateAvailable).toHaveBeenCalledOnce();

    const applyUpdate = onUpdateAvailable.mock.calls[0]![0] as () => void;
    applyUpdate();
    expect(worker.messages).toEqual([{ type: "SKIP_WAITING" }]);

    serviceWorkers.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledOnce();
  });

  it("does not announce the first service-worker installation as an update", async () => {
    const registration = new FakeRegistration(null);
    const serviceWorkers = new FakeServiceWorkerContainer(registration, null);
    const onUpdateAvailable = vi.fn();

    await registerServiceWorker(onUpdateAvailable, {
      serviceWorkers: serviceWorkers as unknown as ServiceWorkerContainer,
    });

    serviceWorkers.dispatchEvent(new Event("controllerchange"));
    expect(onUpdateAvailable).not.toHaveBeenCalled();
  });

  it("offers a reload when another app window activates an update", async () => {
    const registration = new FakeRegistration(null);
    const serviceWorkers = new FakeServiceWorkerContainer(registration, new FakeWorker("activated"));
    const onUpdateAvailable = vi.fn();
    const reload = vi.fn();

    await registerServiceWorker(onUpdateAvailable, {
      serviceWorkers: serviceWorkers as unknown as ServiceWorkerContainer,
      reload,
    });
    serviceWorkers.dispatchEvent(new Event("controllerchange"));

    const applyUpdate = onUpdateAvailable.mock.calls[0]![0] as () => void;
    applyUpdate();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("changes an existing update action to reload if another window activates it", async () => {
    const worker = new FakeWorker("installed");
    const registration = new FakeRegistration(worker);
    const serviceWorkers = new FakeServiceWorkerContainer(registration, new FakeWorker("activated"));
    const onUpdateAvailable = vi.fn();
    const reload = vi.fn();

    await registerServiceWorker(onUpdateAvailable, {
      serviceWorkers: serviceWorkers as unknown as ServiceWorkerContainer,
      reload,
    });
    const applyUpdate = onUpdateAvailable.mock.calls[0]![0] as () => void;

    serviceWorkers.dispatchEvent(new Event("controllerchange"));
    applyUpdate();

    expect(worker.messages).toEqual([]);
    expect(reload).toHaveBeenCalledOnce();
  });
});

class FakeWorker extends EventTarget {
  readonly messages: unknown[] = [];

  constructor(public state: ServiceWorkerState) {
    super();
  }

  postMessage(message: unknown): void {
    this.messages.push(message);
  }
}

class FakeRegistration extends EventTarget {
  readonly update = vi.fn(async () => undefined);
  installing: FakeWorker | null = null;

  constructor(public waiting: FakeWorker | null) {
    super();
  }
}

class FakeServiceWorkerContainer extends EventTarget {
  readonly register: ReturnType<typeof vi.fn>;

  constructor(
    registration: FakeRegistration,
    public controller: FakeWorker | null,
  ) {
    super();
    this.register = vi.fn(async () => registration);
  }
}
