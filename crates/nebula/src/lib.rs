use wasm_bindgen::{Clamped, JsCast, JsValue};
use web_sys::{CanvasRenderingContext2d, Document, HtmlCanvasElement, ImageData};

const CELL_SIZE: f64 = 4.0;

const MAX_ALPHA_DARK: f64 = 0.24;
const MAX_ALPHA_LIGHT: f64 = 0.22;

const BLOBS_ACROSS: f64 = 2.6;
const OCTAVES: usize = 3;
const VERTICAL_STRETCH: f64 = 2.2;

const WARP_STRENGTH: f64 = 0.55;
const WARP_OCTAVES: usize = 2;

const RIDGE_MIX: f64 = 0.6;
const POSITION_HUE_MIX: f64 = 0.45;

const DUST_CHANCE: f64 = 0.055;
const DUST_BOOST: f64 = 2.1;

const NOISE_FLOOR: f64 = 0.32;
const NOISE_SPAN: f64 = 0.28;
const CONTRAST: f64 = 1.6;
const BRIGHTNESS_LEVELS: f64 = 8.0;

const DRIFT_SPEED: f64 = 0.012;
const UPDATE_INTERVAL_MS: f64 = 120.0;

const PALETTE_DARK: [(u8, u8, u8); 5] = [
    (14, 26, 54),
    (24, 100, 118),
    (48, 156, 196),
    (150, 110, 216),
    (212, 228, 250),
];

const PALETTE_LIGHT: [(u8, u8, u8); 5] = [
    (186, 206, 212),
    (132, 184, 194),
    (92, 150, 192),
    (104, 120, 190),
    (126, 104, 178),
];

struct FieldSample {
    density: f64,
    dust: f64,
    tint: f64,
}

pub struct Nebula {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    pixels: Vec<u8>,
    width: u32,
    height: u32,
    palette: [(u8, u8, u8); 5],
    alpha: f64,
    seed: i32,
    updated_at: f64,
}

impl Nebula {
    pub fn new(document: &Document, dark_mode: bool, seed: f64) -> Result<Nebula, JsValue> {
        let canvas = document
            .create_element("canvas")?
            .dyn_into::<HtmlCanvasElement>()?;

        let ctx = canvas
            .get_context("2d")?
            .ok_or_else(|| JsValue::from_str("2d context unavailable"))?
            .dyn_into::<CanvasRenderingContext2d>()?;

        Ok(Nebula {
            canvas,
            ctx,
            pixels: Vec::new(),
            width: 0,
            height: 0,
            palette: if dark_mode {
                PALETTE_DARK
            } else {
                PALETTE_LIGHT
            },
            alpha: if dark_mode {
                MAX_ALPHA_DARK
            } else {
                MAX_ALPHA_LIGHT
            },
            seed: (seed * 1_000_003.0) as i32,
            updated_at: f64::NEG_INFINITY,
        })
    }

    pub fn resize(&mut self, width: f64, height: f64) {
        self.width = ((width / CELL_SIZE).ceil() as u32).max(1);
        self.height = ((height / CELL_SIZE).ceil() as u32).max(1);

        self.canvas.set_width(self.width);
        self.canvas.set_height(self.height);
        self.pixels = vec![0; (self.width * self.height * 4) as usize];
        self.updated_at = f64::NEG_INFINITY;
    }

    pub fn needs_update(&self, time: f64) -> bool {
        time - self.updated_at >= UPDATE_INTERVAL_MS
    }

    pub fn update(&mut self, time: f64, seconds: f64) -> Result<(), JsValue> {
        let width = self.width as usize;
        let height = self.height as usize;
        let step = BLOBS_ACROSS / width as f64;
        let drift = seconds * DRIFT_SPEED;

        for y in 0..height {
            for x in 0..width {
                let sample = sample_field(x as f64 * step, y as f64 * step, self.seed, drift);
                let brightness = shape_brightness(&sample);
                let hue = hue_for(brightness, sample.tint);

                let (r, g, b) = palette_at(&self.palette, hue);
                let index = (y * width + x) * 4;
                self.pixels[index] = r;
                self.pixels[index + 1] = g;
                self.pixels[index + 2] = b;
                self.pixels[index + 3] = (self.alpha * brightness * 255.0) as u8;
            }
        }

        let image = ImageData::new_with_u8_clamped_array_and_sh(
            Clamped(&self.pixels),
            self.width,
            self.height,
        )?;
        self.ctx.put_image_data(&image, 0.0, 0.0)?;
        self.updated_at = time;

        Ok(())
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d, width: f64, height: f64) {
        if self.pixels.is_empty() {
            return;
        }

        ctx.set_image_smoothing_enabled(false);
        let _ = ctx.draw_image_with_html_canvas_element_and_dw_and_dh(
            &self.canvas,
            0.0,
            0.0,
            width,
            height,
        );
    }
}

fn shape_brightness(sample: &FieldSample) -> f64 {
    let brightness = ((sample.density - NOISE_FLOOR) / NOISE_SPAN)
        .clamp(0.0, 1.0)
        .powf(CONTRAST);

    let is_dust = sample.dust > 1.0 - DUST_CHANCE && brightness > 0.0;
    let brightness = if is_dust {
        (brightness * DUST_BOOST).min(1.0)
    } else {
        brightness
    };

    (brightness * BRIGHTNESS_LEVELS).floor() / BRIGHTNESS_LEVELS
}

fn hue_for(brightness: f64, tint: f64) -> f64 {
    (brightness.sqrt() * (1.0 - POSITION_HUE_MIX) + tint * POSITION_HUE_MIX).clamp(0.0, 1.0)
}

fn sample_field(x: f64, y: f64, seed: i32, drift: f64) -> FieldSample {
    let y = y * VERTICAL_STRETCH;

    let warp_x = fbm(x, y, seed.wrapping_add(11), drift, WARP_OCTAVES);
    let warp_y = fbm(x + 5.2, y + 1.3, seed.wrapping_add(29), drift, WARP_OCTAVES);
    let warped_x = x + WARP_STRENGTH * (warp_x - 0.5) * 2.0;
    let warped_y = y + WARP_STRENGTH * (warp_y - 0.5) * 2.0;

    let envelope = fbm(warped_x, warped_y, seed, drift, OCTAVES);

    let detail = fbm(
        warped_x * 2.1,
        warped_y * 2.1,
        seed.wrapping_add(53),
        drift,
        2,
    );
    let ridge = 1.0 - (detail * 2.0 - 1.0).abs();

    let dust = corner(
        (warped_x * 47.0) as i32,
        (warped_y * 47.0) as i32,
        seed.wrapping_add(97),
    );

    FieldSample {
        density: envelope * (1.0 - RIDGE_MIX + RIDGE_MIX * ridge),
        dust,
        tint: warp_x,
    }
}

fn fbm(x: f64, y: f64, seed: i32, drift: f64, octaves: usize) -> f64 {
    let mut total = 0.0;
    let mut amplitude = 1.0;
    let mut frequency = 1.0;
    let mut normalizer = 0.0;

    for octave in 0..octaves {
        let offset = drift * (octave as f64 + 1.0);
        total += amplitude
            * value_noise(
                x * frequency + offset,
                y * frequency - offset * 0.6,
                seed.wrapping_add(octave as i32),
            );

        normalizer += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    total / normalizer
}

fn value_noise(x: f64, y: f64, seed: i32) -> f64 {
    let x_cell = x.floor();
    let y_cell = y.floor();
    let x_fraction = x - x_cell;
    let y_fraction = y - y_cell;

    let u = x_fraction * x_fraction * (3.0 - 2.0 * x_fraction);
    let v = y_fraction * y_fraction * (3.0 - 2.0 * y_fraction);

    let x_cell = x_cell as i32;
    let y_cell = y_cell as i32;

    let top = lerp(
        corner(x_cell, y_cell, seed),
        corner(x_cell + 1, y_cell, seed),
        u,
    );
    let bottom = lerp(
        corner(x_cell, y_cell + 1, seed),
        corner(x_cell + 1, y_cell + 1, seed),
        u,
    );

    lerp(top, bottom, v)
}

fn corner(x: i32, y: i32, seed: i32) -> f64 {
    let mut value = (x as i64).wrapping_mul(374_761_393)
        ^ (y as i64).wrapping_mul(668_265_263)
        ^ (seed as i64).wrapping_mul(362_437);

    value = (value ^ (value >> 13)).wrapping_mul(1_274_126_177);
    let value = value ^ (value >> 16);

    (value & 1023) as f64 / 1023.0
}

fn palette_at(stops: &[(u8, u8, u8)], t: f64) -> (u8, u8, u8) {
    let scaled = t.clamp(0.0, 1.0) * (stops.len() - 1) as f64;
    let index = (scaled.floor() as usize).min(stops.len() - 2);
    let fraction = scaled - index as f64;

    let from = stops[index];
    let to = stops[index + 1];

    (
        lerp(from.0 as f64, to.0 as f64, fraction) as u8,
        lerp(from.1 as f64, to.1 as f64, fraction) as u8,
        lerp(from.2 as f64, to.2 as f64, fraction) as u8,
    )
}

fn lerp(from: f64, to: f64, t: f64) -> f64 {
    from + (to - from) * t
}
