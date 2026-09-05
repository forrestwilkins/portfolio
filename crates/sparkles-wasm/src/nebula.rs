//! A slow pixel-art nebula rendered behind the stars.
//!
//! The field is fractal value noise drawn into a small buffer - one buffer
//! pixel per `CELL` screen pixels - and then blitted up with image smoothing
//! off. That is what produces the chunky blocks, and it means a frame costs
//! one `drawImage` rather than thousands of per-cell fills.

use wasm_bindgen::{Clamped, JsCast, JsValue};
use web_sys::{CanvasRenderingContext2d, Document, HtmlCanvasElement, ImageData};

/// Screen pixels per nebula pixel. Larger is chunkier and cheaper.
const CELL: f64 = 7.0;

/// Peak opacity of the brightest filaments. Deliberately low - the links sit
/// on top of this, and they have to stay comfortable to read.
const ALPHA_DARK: f64 = 0.15;
const ALPHA_LIGHT: f64 = 0.09;

/// Roughly how many large blobs span the viewport width
const SCALE: f64 = 2.6;

/// Layers of noise. Each one is finer and weaker than the last.
const OCTAVES: usize = 3;

/// Noise below this is empty space, so the nebula reads as filaments in a void
/// rather than as an even wash. Stacked value noise only spans about
/// 0.25 to 0.78, so SPAN normalizes against that real range rather than
/// against 1.0 - otherwise the brightest filament lands near a third of the
/// intended opacity and the whole layer disappears.
const FLOOR: f64 = 0.44;
const SPAN: f64 = 0.3;

/// Applied after the remap, to deepen the voids without dimming the ridges
const CONTRAST: f64 = 1.8;

/// Discrete brightness bands. Smooth noise makes neighbouring cells almost the
/// same color, which hides the grid; posterizing gives the flat steps that
/// read as pixel art rather than as a soft gradient.
const LEVELS: f64 = 6.0;

/// How fast the field flows, in noise units per second
const DRIFT: f64 = 0.012;

/// Milliseconds between noise recomputes. The blit still happens every frame;
/// only the buffer is throttled, which is invisible at this speed.
const UPDATE_MS: f64 = 90.0;

/// Deep space through to a lit filament edge
const PALETTE_DARK: [(u8, u8, u8); 3] = [(34, 24, 68), (92, 50, 138), (198, 108, 172)];

/// The same progression, lightened so dark text stays readable over it
const PALETTE_LIGHT: [(u8, u8, u8); 3] = [(154, 150, 198), (178, 152, 200), (208, 160, 188)];

pub struct Nebula {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    pixels: Vec<u8>,
    width: u32,
    height: u32,
    palette: [(u8, u8, u8); 3],
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
            alpha: if dark_mode { ALPHA_DARK } else { ALPHA_LIGHT },
            seed: (seed * 1_000_003.0) as i32,
            updated_at: f64::NEG_INFINITY,
        })
    }

    pub fn resize(&mut self, width: f64, height: f64) {
        self.width = ((width / CELL).ceil() as u32).max(1);
        self.height = ((height / CELL).ceil() as u32).max(1);

        self.canvas.set_width(self.width);
        self.canvas.set_height(self.height);
        self.pixels = vec![0; (self.width * self.height * 4) as usize];

        // Force a recompute; the old buffer no longer matches the grid
        self.updated_at = f64::NEG_INFINITY;
    }

    pub fn needs_update(&self, time: f64) -> bool {
        time - self.updated_at >= UPDATE_MS
    }

    /// Rebuilds the noise buffer and uploads it to the offscreen canvas
    pub fn update(&mut self, time: f64, seconds: f64) -> Result<(), JsValue> {
        let width = self.width as usize;
        let height = self.height as usize;
        let step = SCALE / width as f64;
        let drift = seconds * DRIFT;

        for y in 0..height {
            for x in 0..width {
                let value = fbm(x as f64 * step, y as f64 * step, self.seed, drift);

                // Lift the floor away, stretch across the usable range, then
                // curve it so voids fall off faster than ridges dim
                let shaped = ((value - FLOOR) / SPAN).clamp(0.0, 1.0).powf(CONTRAST);
                let shaped = (shaped * LEVELS).floor() / LEVELS;

                let (r, g, b) = palette_at(&self.palette, shaped);
                let index = (y * width + x) * 4;
                self.pixels[index] = r;
                self.pixels[index + 1] = g;
                self.pixels[index + 2] = b;
                self.pixels[index + 3] = (self.alpha * shaped * 255.0) as u8;
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

    /// Blits the buffer across the whole canvas, unsmoothed so the cells stay
    /// as hard pixel blocks
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

/// Stacked value noise. Each octave slides at its own rate, so the field keeps
/// evolving instead of merely sliding past.
fn fbm(x: f64, y: f64, seed: i32, drift: f64) -> f64 {
    let mut total = 0.0;
    let mut amplitude = 1.0;
    let mut frequency = 1.0;
    let mut normalizer = 0.0;

    for octave in 0..OCTAVES {
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

/// Bilinear value noise with a smoothstep, which is enough structure for
/// clouds and far cheaper than gradient noise.
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

fn palette_at(stops: &[(u8, u8, u8); 3], t: f64) -> (u8, u8, u8) {
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
