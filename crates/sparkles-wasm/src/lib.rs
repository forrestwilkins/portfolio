use std::{cell::RefCell, rc::Rc};
use wasm_bindgen::{closure::Closure, prelude::*, JsCast};
use web_sys::{window, CanvasRenderingContext2d, HtmlCanvasElement, Window};

/// Kept deliberately low so the effect reads as faint texture rather than
/// decoration.
const SPARKLE_COUNT: usize = 16;

/// Opacity at the peak of a flash. Each flash is brief, so this can sit
/// higher than a steady glow would.
const PEAK_ALPHA: f64 = 0.55;

/// Portion of a sparkle's cycle spent flashing. The rest is fully dark, so
/// only a handful are lit at any moment.
const FLASH_FRACTION: f64 = 0.22;

/// How far the glare reaches past the solid arm, as a multiple of it
const RAY_SCALE: f64 = 5.0;

/// Segments used to taper each ray. More is smoother, but each one is a
/// separate fill.
const RAY_STEPS: usize = 6;

/// Opacity of the glare where it leaves the star, relative to the star itself
const RAY_ALPHA: f64 = 0.32;

/// Diagonal spikes are the secondary ones, so they stay shorter and fainter
/// than the axis-aligned pair
const DIAGONAL_SCALE: f64 = 0.6;
const DIAGONAL_ALPHA: f64 = 0.55;

/// Halo radius as a multiple of the arm, and how faint it sits
const RING_SCALE: f64 = 3.2;
const RING_ALPHA: f64 = 0.2;

/// Share of stars given diagonal spikes, and a halo
const DIAGONAL_SHARE: f64 = 0.35;
const RING_SHARE: f64 = 0.25;

/// Approximate blackbody colors across the stellar classes, hot blue through
/// to cool red. Saturated enough to read as a tint, but every entry is a
/// color a real star actually has.
const STAR_COLORS: [(u8, u8, u8); 5] = [
    (155, 176, 255), // class O/B, hottest
    (202, 215, 255), // class A
    (248, 247, 255), // class F, near white
    (255, 210, 161), // class K
    (255, 204, 111), // class M, coolest
];

/// The rAF closure has to hold a reference to itself in order to reschedule,
/// hence the nesting.
type AnimationCallback = Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>>;

struct Sparkle {
    /// Normalized [0, 1] position, so a resize redistributes rather than
    /// reseeds the field
    x: f64,
    y: f64,
    /// Arm length in CSS pixels at full brightness
    size: f64,
    /// Opacity multiplier, tied to size so the small ones stay faint
    brightness: f64,
    /// Precomputed CSS color, so rendering allocates nothing
    color: String,
    /// Whether this one also throws diagonal spikes
    diagonals: bool,
    /// Whether this one carries a faint halo
    ring: bool,
    /// Offset into the cycle, so they don't all flash together
    phase: f64,
    /// Seconds between flashes
    period: f64,
}

struct State {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    sparkles: Vec<Sparkle>,
    reduced_motion: bool,
    width: f64,
    height: f64,
}

#[wasm_bindgen]
pub struct Sparkles {
    window: Window,
    _state: Rc<RefCell<State>>,
    animation: AnimationCallback,
    resize: Closure<dyn FnMut()>,
    frame_id: Rc<RefCell<Option<i32>>>,
}

#[wasm_bindgen]
impl Sparkles {
    /// Colors are chosen per star from a stellar palette; `dark_mode` picks
    /// between the lit palette and dimmed variants of the same hues. `seed`
    /// lays the field out differently on each page load; pass a random value.
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, dark_mode: bool, seed: f64) -> Result<Sparkles, JsValue> {
        let window = window().ok_or_else(|| JsValue::from_str("window unavailable"))?;
        let ctx = canvas
            .get_context("2d")?
            .ok_or_else(|| JsValue::from_str("2d context unavailable"))?
            .dyn_into::<CanvasRenderingContext2d>()?;

        let reduced_motion = window
            .match_media("(prefers-reduced-motion: reduce)")
            .ok()
            .flatten()
            .map(|query| query.matches())
            .unwrap_or(false);

        let state = Rc::new(RefCell::new(State {
            canvas,
            ctx,
            sparkles: build_sparkles(dark_mode, seed),
            reduced_motion,
            width: 0.0,
            height: 0.0,
        }));

        resize_canvas(&state)?;

        let resize_state = Rc::clone(&state);
        let resize = Closure::wrap(Box::new(move || {
            let _ = resize_canvas(&resize_state);
        }) as Box<dyn FnMut()>);
        window.add_event_listener_with_callback("resize", resize.as_ref().unchecked_ref())?;

        let animation: AnimationCallback = Rc::new(RefCell::new(None));
        let frame_id = Rc::new(RefCell::new(None));

        // Nothing moves without motion, so paint once and skip the loop
        if reduced_motion {
            render(&state, 0.0);
            return Ok(Sparkles {
                window,
                _state: state,
                animation,
                resize,
                frame_id,
            });
        }

        let animation_state = Rc::clone(&state);
        let animation_window = window.clone();
        let animation_slot = Rc::clone(&animation);
        let frame_slot = Rc::clone(&frame_id);

        *animation.borrow_mut() = Some(Closure::wrap(Box::new(move |time: f64| {
            render(&animation_state, time);

            if let Some(callback) = animation_slot.borrow().as_ref() {
                if let Ok(id) =
                    animation_window.request_animation_frame(callback.as_ref().unchecked_ref())
                {
                    *frame_slot.borrow_mut() = Some(id);
                }
            }
        }) as Box<dyn FnMut(f64)>));

        if let Some(callback) = animation.borrow().as_ref() {
            let id = window.request_animation_frame(callback.as_ref().unchecked_ref())?;
            *frame_id.borrow_mut() = Some(id);
        }

        Ok(Sparkles {
            window,
            _state: state,
            animation,
            resize,
            frame_id,
        })
    }

    pub fn stop(&self) {
        if let Some(frame_id) = *self.frame_id.borrow() {
            let _ = self.window.cancel_animation_frame(frame_id);
        }

        let _ = self
            .window
            .remove_event_listener_with_callback("resize", self.resize.as_ref().unchecked_ref());
    }
}

impl Drop for Sparkles {
    fn drop(&mut self) {
        self.stop();
        self.animation.borrow_mut().take();
    }
}

fn build_sparkles(dark_mode: bool, seed: f64) -> Vec<Sparkle> {
    // The R2 low-discrepancy sequence. A plain hash clumps badly at this few
    // points; this covers the viewport evenly without looking like a grid.
    const PLASTIC: f64 = 1.324_717_957_244_746;
    let a1 = 1.0 / PLASTIC;
    let a2 = 1.0 / (PLASTIC * PLASTIC);

    // Offsetting the sequence relocates the whole field on each load while
    // keeping its even spacing, and the salt rerolls each star's own traits.
    // Everything is resolved once, here, so positions never move afterwards.
    let offset_x = seed.fract();
    let offset_y = (seed * 7.0).fract();
    let salt = (seed * 1_000_003.0) as i32;

    (0..SPARKLE_COUNT)
        .map(|index| {
            let step = index as f64 + 1.0;
            let index = index as i32;
            Sparkle {
                x: (offset_x + a1 * step).fract(),
                y: (offset_y + a2 * step).fract(),
                // Squared, so most stay small and only a few are large
                size: 0.9 + hash(index.wrapping_add(salt), 3).powi(2) * 2.4,
                brightness: 0.7 + hash(index.wrapping_add(salt), 3) * 0.3,
                color: css_color(
                    STAR_COLORS[(hash(index.wrapping_add(salt), 6) * STAR_COLORS.len() as f64)
                        as usize
                        % STAR_COLORS.len()],
                    dark_mode,
                ),
                diagonals: hash(index.wrapping_add(salt), 7) < DIAGONAL_SHARE,
                ring: hash(index.wrapping_add(salt), 8) < RING_SHARE,
                phase: hash(index.wrapping_add(salt), 4),
                period: 11.0 + hash(index.wrapping_add(salt), 5) * 16.0,
            }
        })
        .collect()
}

fn resize_canvas(state: &Rc<RefCell<State>>) -> Result<(), JsValue> {
    let mut state = state.borrow_mut();
    let rect = state.canvas.get_bounding_client_rect();
    let dpr = window().map(|win| win.device_pixel_ratio()).unwrap_or(1.0);

    let width = rect.width().max(1.0);
    let height = rect.height().max(1.0);

    state.canvas.set_width((width * dpr).round() as u32);
    state.canvas.set_height((height * dpr).round() as u32);

    state.width = width;
    state.height = height;

    state.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)?;
    state.ctx.scale(dpr, dpr)?;

    Ok(())
}

fn render(state: &Rc<RefCell<State>>, time: f64) {
    let state = state.borrow();
    let ctx = &state.ctx;
    let seconds = time / 1000.0;

    ctx.clear_rect(0.0, 0.0, state.width, state.height);

    for sparkle in &state.sparkles {
        let intensity = if state.reduced_motion {
            0.5
        } else {
            flash(sparkle, seconds)
        };

        if intensity <= 0.0 {
            continue;
        }

        ctx.set_fill_style_str(&sparkle.color);
        draw_star(
            ctx,
            sparkle,
            (sparkle.x * state.width).round(),
            (sparkle.y * state.height).round(),
            sparkle.size * intensity,
            PEAK_ALPHA * intensity * sparkle.brightness,
        );
    }

    ctx.set_global_alpha(1.0);
}

/// Dark for most of the cycle, then a single quick pop: fast rise, faster
/// fall. This is what separates a sparkle from a slow fade.
fn flash(sparkle: &Sparkle, seconds: f64) -> f64 {
    let cycle = (seconds / sparkle.period + sparkle.phase).fract();

    if cycle > FLASH_FRACTION {
        return 0.0;
    }

    let progress = cycle / FLASH_FRACTION;
    (progress * std::f64::consts::PI).sin().powf(1.8)
}

/// A four-point pixel star: a one pixel cross with a brighter square at the
/// center. Coordinates are pre-rounded so the arms stay crisp.
fn draw_star(
    ctx: &CanvasRenderingContext2d,
    sparkle: &Sparkle,
    x: f64,
    y: f64,
    arm: f64,
    alpha: f64,
) {
    let arm = arm.round().max(1.0);

    if sparkle.ring {
        draw_ring(ctx, sparkle, x, y, arm * RING_SCALE, alpha * RING_ALPHA);
    }

    draw_rays(ctx, x, y, arm, alpha);

    if sparkle.diagonals {
        draw_diagonal_rays(ctx, x, y, arm, alpha);
    }

    ctx.set_global_alpha(alpha);
    ctx.fill_rect(x - arm, y, arm * 2.0 + 1.0, 1.0);
    ctx.fill_rect(x, y - arm, 1.0, arm * 2.0 + 1.0);

    // The core reads as the glint, so let it run brighter than the arms
    ctx.set_global_alpha((alpha * 1.7).min(1.0));
    ctx.fill_rect(x - 1.0, y - 1.0, 2.0, 2.0);
}

/// Thin glare shooting along the same four axes, the way a bright point of
/// light streaks in a lens or a squint. Drawn as tapering one pixel segments
/// so it fades out instead of ending abruptly.
fn draw_rays(ctx: &CanvasRenderingContext2d, x: f64, y: f64, arm: f64, alpha: f64) {
    let step = (arm * RAY_SCALE) / RAY_STEPS as f64;

    for index in 0..RAY_STEPS {
        let falloff = 1.0 - (index as f64 / RAY_STEPS as f64);
        let segment_alpha = alpha * RAY_ALPHA * falloff * falloff;

        if segment_alpha < 0.002 {
            continue;
        }

        let offset = arm + step * index as f64;
        ctx.set_global_alpha(segment_alpha);
        ctx.fill_rect(x + offset, y, step, 1.0);
        ctx.fill_rect(x - offset - step, y, step, 1.0);
        ctx.fill_rect(x, y + offset, 1.0, step);
        ctx.fill_rect(x, y - offset - step, 1.0, step);
    }
}

/// Lit stars in dark mode; in light mode the same hue dropped to near-black
/// and dimmed, so it reads as faint specks rather than an inverted starfield.
fn css_color(rgb: (u8, u8, u8), dark_mode: bool) -> String {
    let (r, g, b) = rgb;

    if dark_mode {
        return format!("rgb({r}, {g}, {b})");
    }

    let dim = |channel: u8| (channel as f64 * 0.12 + 8.0).round() as u8;
    format!("rgba({}, {}, {}, 0.6)", dim(r), dim(g), dim(b))
}

/// The same glare rotated 45 degrees, for the stars that get the full eight
/// point pattern. Rotating means these are anti-aliased rather than pixel
/// crisp, which suits a secondary spike.
fn draw_diagonal_rays(ctx: &CanvasRenderingContext2d, x: f64, y: f64, arm: f64, alpha: f64) {
    ctx.save();

    if ctx.translate(x, y).is_ok() && ctx.rotate(std::f64::consts::FRAC_PI_4).is_ok() {
        draw_rays(ctx, 0.0, 0.0, arm * DIAGONAL_SCALE, alpha * DIAGONAL_ALPHA);
    }

    ctx.restore();
}

/// A single hairline halo, the way a bright light rings through a lens
fn draw_ring(
    ctx: &CanvasRenderingContext2d,
    sparkle: &Sparkle,
    x: f64,
    y: f64,
    radius: f64,
    alpha: f64,
) {
    if alpha < 0.002 {
        return;
    }

    ctx.set_global_alpha(alpha);
    ctx.set_stroke_style_str(&sparkle.color);
    ctx.set_line_width(1.0);
    ctx.begin_path();
    let _ = ctx.arc(x, y, radius, 0.0, std::f64::consts::TAU);
    ctx.stroke();
}

/// Small deterministic hash so the field is identical on every load.
fn hash(a: i32, b: i32) -> f64 {
    let mut value = (a as i64 * 374_761_393) ^ (b as i64 * 668_265_263);
    value = (value ^ (value >> 13)) * 1_274_126_177;
    let value = value ^ (value >> 16);
    (value & 1023) as f64 / 1023.0
}
