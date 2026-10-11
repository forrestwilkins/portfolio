use wasm_bindgen::{Clamped, JsCast, JsValue};
use web_sys::{CanvasRenderingContext2d, Document, HtmlCanvasElement, ImageData};

const MIN_CELL_SIZE: f64 = 5.0;
const MAX_CELLS: f64 = 30_000.0;

const MAX_ALPHA_DARK: f64 = 0.62;
const MAX_ALPHA_LIGHT: f64 = 0.45;

const BLOBS_ACROSS: f64 = 2.4;
const OCTAVES: usize = 3;

const WARP_STRENGTH: f64 = 0.9;
const WARP_BREATH: f64 = 0.55;
const WARP_BREATH_SPEED: f64 = 0.35;
const WARP_OCTAVES: usize = 2;

const RIDGE_MIX: f64 = 0.5;

const KALEIDO_SEGMENTS: f64 = 6.0;
const KALEIDO_SPIN: f64 = 0.05;
const ZOOM_PULSE: f64 = 0.18;
const ZOOM_SPEED: f64 = 0.21;

const BAND_FREQUENCY: f64 = 14.0;
const BAND_SPEED: f64 = 1.6;
const BAND_DENSITY_TWIST: f64 = 9.0;
const BAND_MIX: f64 = 0.45;

const HUE_SPREAD: f64 = 2.2;
const HUE_RADIAL: f64 = 0.9;
const HUE_SPEED: f64 = 0.06;

const DUST_CHANCE: f64 = 0.04;
const DUST_BOOST: f64 = 2.4;

const NOISE_FLOOR: f64 = 0.2;
const NOISE_SPAN: f64 = 0.4;
const CONTRAST: f64 = 1.2;
const BRIGHTNESS_LEVELS: f64 = 10.0;

const DRIFT_SPEED: f64 = 0.05;
const UPDATE_INTERVAL_MS: f64 = 33.0;

const SATURATION_DARK: f64 = 0.9;
const SATURATION_LIGHT: f64 = 0.85;
const VALUE_LIGHT: f64 = 0.85;

struct FieldSample {
    density: f64,
    dust: f64,
    hue: f64,
    band: f64,
}

pub struct Kaleidoscope {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    pixels: Vec<u8>,
    width: u32,
    height: u32,
    dark_mode: bool,
    alpha: f64,
    seed: i32,
    updated_at: f64,
}

impl Kaleidoscope {
    pub fn new(document: &Document, dark_mode: bool, seed: f64) -> Result<Kaleidoscope, JsValue> {
        let canvas = document
            .create_element("canvas")?
            .dyn_into::<HtmlCanvasElement>()?;

        let ctx = canvas
            .get_context("2d")?
            .ok_or_else(|| JsValue::from_str("2d context unavailable"))?
            .dyn_into::<CanvasRenderingContext2d>()?;

        Ok(Kaleidoscope {
            canvas,
            ctx,
            pixels: Vec::new(),
            width: 0,
            height: 0,
            dark_mode,
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
        // Every cell is resampled each update, so cap the count on large screens
        let cell_size = MIN_CELL_SIZE.max((width * height / MAX_CELLS).sqrt());
        self.width = ((width / cell_size).ceil() as u32).max(1);
        self.height = ((height / cell_size).ceil() as u32).max(1);

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
        let scale = BLOBS_ACROSS / width.min(height).max(1) as f64;
        let center_x = width as f64 * 0.5;
        let center_y = height as f64 * 0.5;
        let frame = Frame::at(seconds);

        for y in 0..height {
            for x in 0..width {
                let sample = sample_field(
                    (x as f64 - center_x) * scale,
                    (y as f64 - center_y) * scale,
                    self.seed,
                    &frame,
                );
                let brightness = shape_brightness(&sample);

                let (r, g, b) = if self.dark_mode {
                    hsv_to_rgb(sample.hue, SATURATION_DARK, 0.35 + 0.65 * brightness)
                } else {
                    hsv_to_rgb(sample.hue, SATURATION_LIGHT, VALUE_LIGHT)
                };
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
    let base = ((sample.density - NOISE_FLOOR) / NOISE_SPAN)
        .clamp(0.0, 1.0)
        .powf(CONTRAST);
    let brightness = base * (1.0 - BAND_MIX + BAND_MIX * sample.band);

    let is_dust = sample.dust > 1.0 - DUST_CHANCE && brightness > 0.0;
    let brightness = if is_dust {
        (brightness * DUST_BOOST).min(1.0)
    } else {
        brightness
    };

    (brightness * BRIGHTNESS_LEVELS).floor() / BRIGHTNESS_LEVELS
}

struct Frame {
    drift: f64,
    spin: f64,
    zoom: f64,
    warp: f64,
    band_phase: f64,
    hue_shift: f64,
}

impl Frame {
    fn at(seconds: f64) -> Frame {
        Frame {
            drift: seconds * DRIFT_SPEED,
            spin: seconds * KALEIDO_SPIN * std::f64::consts::TAU,
            zoom: 1.0 + ZOOM_PULSE * (seconds * ZOOM_SPEED * std::f64::consts::TAU).sin(),
            warp: WARP_STRENGTH
                * (1.0 + WARP_BREATH * (seconds * WARP_BREATH_SPEED * std::f64::consts::TAU).sin()),
            band_phase: seconds * BAND_SPEED,
            hue_shift: seconds * HUE_SPEED,
        }
    }
}

fn sample_field(x: f64, y: f64, seed: i32, frame: &Frame) -> FieldSample {
    // Fold the plane into mirrored wedges around the center, then spin them
    let radius = (x * x + y * y).sqrt();
    let wedge = std::f64::consts::TAU / KALEIDO_SEGMENTS;
    let angle = (y.atan2(x) + frame.spin).rem_euclid(wedge);
    let angle = (angle - wedge * 0.5).abs();

    let folded_radius = radius * frame.zoom;
    let x = folded_radius * angle.cos();
    let y = folded_radius * angle.sin();

    let drift = frame.drift;
    let warp_x = fbm(x, y, seed.wrapping_add(11), drift, WARP_OCTAVES);
    let warp_y = fbm(x + 5.2, y + 1.3, seed.wrapping_add(29), drift, WARP_OCTAVES);
    let warped_x = x + frame.warp * (warp_x - 0.5) * 2.0;
    let warped_y = y + frame.warp * (warp_y - 0.5) * 2.0;

    let envelope = fbm(warped_x, warped_y, seed, drift, OCTAVES);

    let detail = fbm(
        warped_x * 2.1,
        warped_y * 2.1,
        seed.wrapping_add(53),
        drift,
        2,
    );
    let ridge = 1.0 - (detail * 2.0 - 1.0).abs();
    let density = envelope * (1.0 - RIDGE_MIX + RIDGE_MIX * ridge);

    // Concentric ripples bent by the density field, like contour lines melting
    let band = 0.5
        + 0.5
            * (radius * BAND_FREQUENCY - frame.band_phase * std::f64::consts::TAU
                + density * BAND_DENSITY_TWIST)
                .sin();

    let dust = corner(
        (warped_x * 47.0) as i32,
        (warped_y * 47.0) as i32,
        seed.wrapping_add(97),
    );

    FieldSample {
        density,
        dust,
        hue: (density * HUE_SPREAD + radius * HUE_RADIAL + warp_x * 0.5 - frame.hue_shift)
            .rem_euclid(1.0),
        band,
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

fn hsv_to_rgb(hue: f64, saturation: f64, value: f64) -> (u8, u8, u8) {
    let sector = hue.rem_euclid(1.0) * 6.0;
    let index = sector.floor() as u8;
    let fraction = sector - sector.floor();

    let p = value * (1.0 - saturation);
    let q = value * (1.0 - saturation * fraction);
    let t = value * (1.0 - saturation * (1.0 - fraction));

    let (r, g, b) = match index {
        0 => (value, t, p),
        1 => (q, value, p),
        2 => (p, value, t),
        3 => (p, q, value),
        4 => (t, p, value),
        _ => (value, p, q),
    };

    ((r * 255.0) as u8, (g * 255.0) as u8, (b * 255.0) as u8)
}

fn lerp(from: f64, to: f64, t: f64) -> f64 {
    from + (to - from) * t
}
