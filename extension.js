import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class PiPWindowExtension {
  constructor() {
    this._windowCreatedId = null;
  }

  enable() {
    this._windowCreatedId = global.display.connect(
      "window-created",
      (display, window) => this._onWindowCreated(window)
    );

    this._checkExistingWindows();
  }

  disable() {
    if (this._windowCreatedId) {
      global.display.disconnect(this._windowCreatedId);
      this._windowCreatedId = null;
    }
  }

  _checkExistingWindows() {
    const windows = global.get_window_actors();
    windows.forEach((actor, index) => {
      const window =
        typeof actor.get_meta_window === "function"
          ? actor.get_meta_window()
          : null;
      if (window) {
        this._processPiPWindow(window);
      }
    });
  }

  _onWindowCreated(window) {
    if (!window) {
      return;
    }

    const sourceId =
      typeof window.connect === "function"
        ? window.connect("notify::title", () => {
            this._processPiPWindow(window);
            if (typeof window.disconnect === "function") {
              window.disconnect(sourceId);
            }
          })
        : null;

    this._processPiPWindow(window);
  }

  _processPiPWindow(window) {
    if (!window) {
      return;
    }

    this._tryProcessWindow(window, 0);
  }

  _tryProcessWindow(window, attempt) {
    if (!window) return;

    let title, wmClass, appId;
    try {
      title =
        typeof window.get_title === "function" ? window.get_title() : null;

      wmClass =
        typeof window.get_wm_class === "function"
          ? window.get_wm_class()
          : null;

      appId =
        typeof window.get_gtk_application_id === "function"
          ? window.get_gtk_application_id()
          : null;

      if (!appId && typeof window.get_application === "function") {
        try {
          const app = window.get_application();
          if (app && typeof app.get_id === "function") {
            appId = app.get_id();
          }
        } catch (e) {}
      }
    } catch (error) {
      return;
    }

    if (
      (title === null || title === undefined || title === "") &&
      window &&
      attempt < 3
    ) {
      setTimeout(() => {
        this._tryProcessWindow(window, attempt + 1);
      }, 100 * (attempt + 1));
      return;
    }

    const hasPictureInPictureTitle =
      title &&
      typeof title === "string" &&
      title.includes("Picture-in-Picture");
    const hasFirefoxWmClass =
      wmClass &&
      typeof wmClass === "string" &&
      wmClass.toLowerCase &&
      wmClass.toLowerCase().includes("firefox");
    const hasFirefoxAppId =
      appId &&
      typeof appId === "string" &&
      appId.toLowerCase &&
      appId.toLowerCase().includes("firefox");
    const hasZenWmClass =
      wmClass &&
      typeof wmClass === "string" &&
      wmClass.toLowerCase &&
      wmClass.toLowerCase().includes("zen");
    const hasZenAppId =
      appId &&
      typeof appId === "string" &&
      appId.toLowerCase &&
      appId.toLowerCase().includes("zen");
    const hasPipewireWmClass =
      wmClass &&
      typeof wmClass === "string" &&
      wmClass.toLowerCase &&
      wmClass.toLowerCase().includes("pipewire");
    const hasPipewireAppId =
      appId &&
      typeof appId === "string" &&
      appId.toLowerCase &&
      appId.toLowerCase().includes("pipewire");

    const isPiPWindow =
      hasPictureInPictureTitle &&
      (hasFirefoxWmClass ||
        hasFirefoxAppId ||
        hasZenWmClass ||
        hasZenAppId ||
        hasPipewireWmClass ||
        hasPipewireAppId);

    if (isPiPWindow) {
      if (typeof window.make_above === "function") {
        window.make_above();
      }

      if (typeof window.stick === "function") {
        window.stick();
      }
    } else {
      if (
        typeof window.is_skip_taskbar === "function" &&
        window.is_skip_taskbar()
      ) {
        return;
      }
    }
  }
}
