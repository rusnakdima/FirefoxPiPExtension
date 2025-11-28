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
      const window = actor.get_meta_window();
      if (window) {
        this._processPiPWindow(window);
      }
    });
  }

  _onWindowCreated(window) {
    const sourceId = window.connect("notify::title", () => {
      this._processPiPWindow(window);
      window.disconnect(sourceId);
    });

    this._processPiPWindow(window);
  }

  _processPiPWindow(window) {
    if (!window) {
      return;
    }

    let title, wmClass;
    try {
      title = window.get_title();
      wmClass = window.get_wm_class();
    } catch (error) {
      return;
    }

    const hasPictureInPictureTitle =
      title && title.includes("Picture-in-Picture");
    const hasFirefoxWmClass =
      wmClass && wmClass.toLowerCase().includes("firefox");
    const hasPipewireWmClass =
      wmClass && wmClass.toLowerCase().includes("pipewire");

    const isPiPWindow =
      hasPictureInPictureTitle && (hasFirefoxWmClass || hasPipewireWmClass);

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
