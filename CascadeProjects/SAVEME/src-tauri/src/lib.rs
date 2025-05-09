//! Main Rust backend for stealth overlay
#![cfg_attr(
  all(not(debug_assertions), target_os = "macos"),
  windows_subsystem = "transparent"
)]
use tauri::{Manager, Window, Runtime, Emitter, PhysicalPosition, Position};
use tauri_plugin_opener::init as opener_plugin;
use arboard::Clipboard;
use once_cell::sync::Lazy;
use std::{sync::{Arc, Mutex}, thread, time::{Duration, Instant}};

// Shared state for clipboard and auto-hide timer
static LAST_CLIPBOARD: Lazy<Arc<Mutex<String>>> = Lazy::new(|| Arc::new(Mutex::new(String::new())));
static AUTO_HIDE: Lazy<Arc<Mutex<Instant>>> = Lazy::new(|| Arc::new(Mutex::new(Instant::now())));

#[tauri::command]
fn toggle_visibility<R: Runtime>(window: Window<R>) {
  if window.is_visible().unwrap_or(false) {
    window.hide().unwrap();
  } else {
    window.show().unwrap();
    window.set_focus().unwrap();
    // reset timer when shown
    let mut t = AUTO_HIDE.lock().unwrap(); *t = Instant::now();
  }
}

fn reset_timer() {
  let mut t = AUTO_HIDE.lock().unwrap(); *t = Instant::now();
}

#[tauri::command]
fn toggle_widget_cmd<R: Runtime>(window: Window<R>) {
  toggle_visibility(window);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(opener_plugin())
    .setup(|app| {
      let handle = app.handle();
      // Get handle to main window
      let main_window = app.get_webview_window("main").expect("Failed to get main window");
      
      // Create a second window for the widget
      let widget_config = tauri::WebviewWindowBuilder::new(app, "widget", tauri::WebviewUrl::default())
        .title("Clipboard Widget")
        .inner_size(400.0, 300.0)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .resizable(false)
        .visible(false);
      
      let widget = widget_config.build()
        .expect("failed to build widget window");
      widget.set_position(Position::Physical(PhysicalPosition { x: 100, y: 100 })).unwrap();
      // The widget window is now created
      // monitor clipboard and emit to widget
      {
        let w = widget.clone();
        let last = LAST_CLIPBOARD.clone();
        thread::spawn(move || {
          let mut cb = Clipboard::new().unwrap();
          loop {
            thread::sleep(Duration::from_millis(500));
            if let Ok(content) = cb.get_text() {
              if !content.is_empty() && *last.lock().unwrap() != content {
                *last.lock().unwrap() = content.clone();
                w.emit("clipboard-changed", content.clone()).unwrap();
                w.show().unwrap(); w.set_focus().unwrap();
                let mut t = AUTO_HIDE.lock().unwrap(); *t = Instant::now();
              }
            }
          }
        });
      }
      // auto-hide widget after inactivity
      {
        let w = widget.clone();
        thread::spawn(move || {
          loop {
            thread::sleep(Duration::from_secs(1));
            if AUTO_HIDE.lock().unwrap().elapsed().as_secs() > 30 && w.is_visible().unwrap_or(false) {
              w.hide().unwrap();
            }
          }
        });
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![toggle_visibility, toggle_widget_cmd])
    .run(tauri::generate_context!())
    .expect("error running stealth overlay");
}
