//! Main Rust backend for stealth overlay
#![cfg_attr(
  all(not(debug_assertions), target_os = "macos"),
  windows_subsystem = "transparent"
)]
use tauri::{Manager, Window, Position, PhysicalPosition, Runtime, Emitter};
use tauri_plugin_opener::init as opener_plugin;
use tauri_plugin_global_shortcut::init as shortcut_plugin;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(opener_plugin())
    .plugin(shortcut_plugin())
    .setup(|app| {
      let handle = app.handle();
      let window = handle.get_webview_window("main").unwrap();
      // position window
      window.set_position(Position::Physical(PhysicalPosition { x: 100, y: 100 })).unwrap();
      // register global shortcut Cmd+H to toggle visibility
      let mgr = handle.global_shortcut();
      mgr.register("CMD+H", move |_| toggle_visibility(window.clone())).unwrap();
      // clipboard monitor
      {
        let win = window.clone();
        let last = LAST_CLIPBOARD.clone();
        thread::spawn(move || {
          let mut cb = Clipboard::new().unwrap();
          loop {
            thread::sleep(Duration::from_millis(500));
            if let Ok(content) = cb.get_text() {
              if !content.is_empty() && *last.lock().unwrap() != content {
                *last.lock().unwrap() = content.clone();
                win.emit("clipboard-changed", content.clone()).unwrap();
                reset_timer();
                if !win.is_visible().unwrap_or(false) {
                  win.show().unwrap(); win.set_focus().unwrap();
                }
              }
            }
          }
        });
      }
      // auto-hide thread
      {
        let win = window.clone();
        thread::spawn(move || {
          loop {
            thread::sleep(Duration::from_secs(1));
            let since = AUTO_HIDE.lock().unwrap().elapsed();
            if since.as_secs() > 30 && win.is_visible().unwrap_or(false) {
              win.hide().unwrap();
            }
          }
        });
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![toggle_visibility])
    .run(tauri::generate_context!())
    .expect("error running stealth overlay");
}
