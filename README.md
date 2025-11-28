# Firefox PiP Always On Top

This GNOME Shell extension automatically ensures that Firefox Picture-in-Picture windows stay on top of other windows and are visible on all workspaces.

## Features

- Automatically detects Firefox Picture-in-Picture windows
- Sets PiP windows to always stay on top
- Makes PiP windows visible on all workspaces
- Automatically applies to new PiP windows as they are created
- Cleanly resets window properties when extension is disabled

## Installation

1. Download the extension files
2. Install in your GNOME extensions directory (usually `~/.local/share/gnome-shell/extensions/`)
3. Enable the extension using GNOME Extensions app or with the command:
   ```
   gnome-extensions enable firefox-pip-always-on-top@rusnakdima.github.com
   ```
4. Restart GNOME Shell (Alt+F2, type 'r', press Enter) or reboot

## Usage

Once enabled, the extension will automatically detect Firefox Picture-in-Picture windows and apply the "always on top" and "all workspaces" properties. No additional configuration is needed.

## Requirements

- GNOME Shell 45 or higher
- Firefox browser with Picture-in-Picture support

## How it Works

The extension listens for new window creation events and checks if the window is a Firefox Picture-in-Picture window by examining its title and window properties. When a PiP window is detected, it applies the necessary window management properties to keep it visible and on top of other windows.

## Uninstallation

To uninstall, simply disable the extension and remove the extension directory from your GNOME extensions folder.

## License

See LICENSE.MD for licensing information.