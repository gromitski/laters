type UpdateAvailableHandler = (applyUpdate: () => void) => void;

interface RegistrationOptions {
  serviceWorkers?: ServiceWorkerContainer;
  reload?: () => void;
}

export async function registerServiceWorker(
  onUpdateAvailable: UpdateAvailableHandler,
  options: RegistrationOptions = {},
): Promise<void> {
  const serviceWorkers = options.serviceWorkers ?? getServiceWorkerContainer();

  if (!serviceWorkers) {
    return;
  }

  const reload = options.reload ?? (() => window.location.reload());
  const hadController = serviceWorkers.controller !== null;
  let reloadAfterActivation = false;
  let updateOffered = false;
  let applyAvailableUpdate = (): void => undefined;

  const offerUpdate = (applyUpdate: () => void): void => {
    applyAvailableUpdate = applyUpdate;

    if (updateOffered) {
      return;
    }

    updateOffered = true;
    onUpdateAvailable(() => applyAvailableUpdate());
  };

  serviceWorkers.addEventListener("controllerchange", () => {
    if (!hadController) {
      return;
    }

    if (reloadAfterActivation) {
      reload();
      return;
    }

    offerUpdate(reload);
  });

  try {
    const registration = await serviceWorkers.register("/sw.js", { scope: "/" });

    const offerWaitingWorker = (worker: ServiceWorker | null): void => {
      if (!worker || !serviceWorkers.controller) {
        return;
      }

      offerUpdate(() => {
        reloadAfterActivation = true;
        worker.postMessage({ type: "SKIP_WAITING" });
      });
    };

    offerWaitingWorker(registration.waiting);

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;

      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state === "installed") {
          offerWaitingWorker(registration.waiting ?? installingWorker);
        }
      });
    });

    await registration.update();
  } catch {
    // Offline or unavailable service-worker support must not break the reading list.
  }
}

function getServiceWorkerContainer(): ServiceWorkerContainer | undefined {
  return "serviceWorker" in navigator ? navigator.serviceWorker : undefined;
}
