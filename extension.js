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
    windows.forEach((actor) => {
      const window = actor.get_meta_window() ?? null;
      if (window) {
        this._processPiPWindow(window);
      }
    });
  }

  _onWindowCreated(window) {
    if (!window) {
      return;
    }

    const sourceId = window.connect("notify::title", () => {
      this._processPiPWindow(window);
      window.disconnect(sourceId);
    });

    this._processPiPWindow(window);
  }

  _processPiPWindow(window) {
    if (!window) return;

    let title = window.get_title() ?? "";
    let wmClass = window.get_wm_class() ?? "";
    let appId =
      window.get_gtk_application_id() ?? window.get_title().toString() ?? "";

    const searchTitle = "Picture-in-Picture";

    const hasPictureInPictureTitle = title.includes(searchTitle) ?? false;
    const hasFirefoxWmClass =
      wmClass.toLowerCase().includes("firefox") ?? false;
    const hasFirefoxAppId = appId.includes(searchTitle) ?? false;
    const hasZenWmClass = wmClass.toLowerCase().includes("zen") ?? false;
    const hasZenAppId = appId.includes(searchTitle) ?? false;
    const hasPipewireWmClass =
      wmClass.toLowerCase().includes("pipewire") ?? false;
    const hasPipewireAppId = appId.toLowerCase().includes("pipewire") ?? false;

    const isPiPWindow =
      hasPictureInPictureTitle &&
      (hasFirefoxWmClass ||
        hasFirefoxAppId ||
        hasZenWmClass ||
        hasZenAppId ||
        hasPipewireWmClass ||
        hasPipewireAppId);

    if (isPiPWindow) {
      window.make_above();
      window.stick();
    } else {
      if (window.is_skip_taskbar()) {
        return;
      }
    }
  }
}
