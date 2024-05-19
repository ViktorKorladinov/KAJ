class SettingsDialog {
  loadSettings() {
    // Selectors
    const dialog = document.querySelector("dialog");
    const showButton = document.querySelector("nav #settings");
    const closeButton = document.querySelector("dialog #close");

    // Set default values
    if (localStorage.getItem("valuesAreSet") === null) {
      localStorage.setItem('speed', 500);
      localStorage.setItem('manual', 0);
      localStorage.setItem('animation', '1');
      localStorage.setItem('history', '1');
      localStorage.setItem("valuesAreSet", 1)
      localStorage.setItem('theme', 'light');
    }
    const themeHandler = document.querySelector('link#themeHandler');
    themeHandler.setAttribute('href', `${localStorage.getItem('theme')}Theme.css`);

    // Correctly showcase current speed settings
    const manual = localStorage.getItem('manual');
    const speed_settings_parent = dialog.querySelector("fieldset#speed");
    if (manual === '1') {
      speed_settings_parent.querySelector('input#manual').checked = true
    } else {
      const animation_speed = localStorage.getItem('speed');
      switch (animation_speed) {
        case '500':
          speed_settings_parent.querySelector('input#fast').checked = true;
          break;
        case '0':
          speed_settings_parent.querySelector('input#fastest').checked = true;
          break;
        case '1000':
          speed_settings_parent.querySelector('input#slow').checked = true;
          break;
        default:
          break;
      }
    }

    // Correctly showcase current extras settings
    const extras_settings_parent = dialog.querySelector("fieldset#extras")
    const extras_settings = extras_settings_parent.querySelectorAll("input");
    for (const child of extras_settings) {
      child.checked = localStorage.getItem(child.id) === '1'
    }

    // Checkboxes for extras should change the settings in the local storage
    extras_settings_parent.addEventListener('change', event => {
      const child = event.target;
      localStorage.setItem(child.id, child.checked ? '1' : '0');
    })

    // Radio buttons for speed should change the settings in the local storage
    const fieldset_speed = dialog.querySelector('fieldset#speed');
    fieldset_speed.addEventListener('change', event => {
      const val = event.target.dataset.value;
      if (val) {
        localStorage.setItem('speed', parseInt(val));
        localStorage.setItem('manual', 0);
      } else {
        localStorage.setItem('manual', 1);
      }
    })

    // Correctly showcase current theme settings
    const theme_settings_parent = dialog.querySelector("fieldset#theme")
    const theme = localStorage.getItem('theme');
    theme_settings_parent.querySelector(`input#${theme}`).checked = true;

    // Radio buttons for theme should change the settings in the local storage
    const fieldset_theme = dialog.querySelector('fieldset#theme');
    fieldset_theme.addEventListener('change', event => {
      const val = event.target.id;
      localStorage.setItem('theme', val);
      themeHandler.setAttribute('href', `${val}Theme.css`);
    })

    // Open dialog
    showButton.addEventListener("click", () => {
      dialog.showModal();
    });

    // Close dialog
    closeButton.addEventListener("click", () => {
      dialog.close();
    });

  }
}
export default SettingsDialog