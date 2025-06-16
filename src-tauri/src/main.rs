// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager}; // 👈 Don't forget Manager
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Task {
    id: String,
    task: String,
    time: String,
    status: String,
}

fn get_file_path(app: &AppHandle) -> PathBuf {
    let base_dir = app
        .path()
        .app_data_dir()
        .expect("Could not get app data dir");
    base_dir.join("tasks.json")
}

#[tauri::command]
fn load_tasks(app: AppHandle) -> Vec<Task> {
    let path = get_file_path(&app);
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_else(|_| "[]".to_string());
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        vec![]
    }
}

#[tauri::command]
fn save_tasks(app: AppHandle, tasks: Vec<Task>) -> Result<(), String> {
    let content = serde_json::to_string_pretty(&tasks).map_err(|e| e.to_string())?;
    let path = get_file_path(&app);
    fs::create_dir_all(path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_tasks, save_tasks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
