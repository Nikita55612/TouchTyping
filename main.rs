
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Write};


#[derive(Deserialize, Serialize, Debug)]
struct Stat {
    chars_per_sec: f64,
    typos_percent: f64,
    press_time_list: Vec<f64>,
    miss_list: Vec<i64>,
    char_list: Vec<String>,
}

#[tauri::command(rename_all = "snake_case")]
fn save_stat(data: String) {
    let file_path = "stat.json";
    let mut file = File::open(&file_path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).expect("expect");
    let mut json: Vec<Stat> = serde_json::from_str(&contents).unwrap();
    let stat = data.split(".@|'");
    let collection = stat.collect::<Vec<&str>>();
    let press_time_list: Vec<f64> = serde_json::from_str(collection[2]).unwrap();
    let miss_list: Vec<i64> = serde_json::from_str(collection[3]).unwrap();
    let char_list: Vec<String> = serde_json::from_str(collection[4]).unwrap();
    json.push(Stat {
        chars_per_sec: collection[0].parse::<f64>().unwrap(), 
        typos_percent: collection[1].parse::<f64>().unwrap(),
        press_time_list: press_time_list,
        miss_list: miss_list,
        char_list: char_list
    });
    std::fs::write(
        &file_path,
        serde_json::to_string_pretty(&json).expect("LogRocket: error parsing to JSON"),
    ).expect("LogRocket: error writing to file");
}

fn main() {
    let file_path = "stat.json";
    match File::open(&file_path) {
        Ok(file) => file,
        Err(_) => {
            let mut new_file = File::create(&file_path).expect("Не удалось создать файл");
            new_file.write(b"[]").expect("Не удалось записать в файл");
            new_file
        }
    };
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_stat])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
