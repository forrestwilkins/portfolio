use nebula::Nebula;
use std::{cell::RefCell, rc::Rc};
use wasm_bindgen::{closure::Closure, prelude::*, JsCast};
use web_sys::{window, CanvasRenderingContext2d, HtmlCanvasElement, Window};

const STAR_COUNT: usize = 8;
const PEAK_ALPHA: f64 = 0.55;
const FLASH_FRACTION: f64 = 0.6;

const RAY_SCALE: f64 = 5.0;
const RAY_SEGMENTS: usize = 6;
const RAY_ALPHA: f64 = 0.32;

const DIAGONAL_SCALE: f64 = 0.85;
const DIAGONAL_ALPHA: f64 = 0.85;

const CORE_RADIUS: f64 = 0.85;
const CORE_GROWTH: f64 = 0.12;

const GLOW_SCALE: f64 = 2.4;
const GLOW_ALPHA: f64 = 0.4;

const RING_SCALE: f64 = 3.2;
const RING_ALPHA: f64 = 0.2;

const FLICKER_SHARE: f64 = 0.4;
const FLICKER_DEPTH: f64 = 0.3;

const DIAGONAL_SHARE: f64 = 0.5;
const RING_SHARE: f64 = 0.25;

const STELLAR_CLASS_COLORS: [(u8, u8, u8); 5] = [
    (155, 176, 255),
    (202, 215, 255),
    (248, 247, 255),
    (255, 210, 161),
    (255, 204, 111),
];

type AnimationCallback = Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>>;

struct Star {
    x: f64,
    y: f64,
    arm_length: f64,
    brightness: f64,
    color: String,
    has_diagonals: bool,
    has_ring: bool,
    flicker_speed: f64,
    phase: f64,
    flash_period: f64,
}

struct State {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    nebula: Nebula,
    stars: Vec<Star>,
    reduced_motion: bool,
    width: f64,
    height: f64,
}

#[wasm_bindgen]
pub struct Stars {
    window: Window,
    _state: Rc<RefCell<State>>,
    animation: AnimationCallback,
    resize: Closure<dyn FnMut()>,
    frame_id: Rc<RefCell<Option<i32>>>,
}

#[wasm_bindgen]
impl Stars {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, dark_mode: bool, seed: f64) -> Result<Stars, JsValue> {
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

        let document = window
            .document()
            .ok_or_else(|| JsValue::from_str("document unavailable"))?;

        let state = Rc::new(RefCell::new(State {
            canvas,
            ctx,
            nebula: Nebula::new(&document, dark_mode, seed)?,
            stars: build_stars(dark_mode, seed),
            reduced_motion,
            width: 0.0,
            height: 0.0,
        }));

        resize_canvas(&state)?;

        let resize_state = Rc::clone(&state);
        let resize = Closure::wrap(Box::new(move || {
            if resize_canvas(&resize_state).is_ok() && reduced_motion {
                render(&resize_state, 0.0);
            }
        }) as Box<dyn FnMut()>);
        window.add_event_listener_with_callback("resize", resize.as_ref().unchecked_ref())?;

        let animation: AnimationCallback = Rc::new(RefCell::new(None));
        let frame_id = Rc::new(RefCell::new(None));

        if reduced_motion {
            render(&state, 0.0);
            return Ok(Stars {
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

        Ok(Stars {
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

impl Drop for Stars {
    fn drop(&mut self) {
        self.stop();
        self.animation.borrow_mut().take();
    }
}

fn build_stars(dark_mode: bool, seed: f64) -> Vec<Star> {
    const PLASTIC_NUMBER: f64 = 1.324_717_957_244_746;
    let r2_step_x = 1.0 / PLASTIC_NUMBER;
    let r2_step_y = 1.0 / (PLASTIC_NUMBER * PLASTIC_NUMBER);

    let offset_x = seed.fract();
    let offset_y = (seed * 7.0).fract();
    let salt = (seed * 1_000_003.0) as i32;

    (0..STAR_COUNT)
        .map(|index| {
            let step = index as f64 + 1.0;
            let index = index as i32;
            Star {
                x: (offset_x + r2_step_x * step).fract(),
                y: (offset_y + r2_step_y * step).fract(),
                arm_length: 0.8 + hash(index.wrapping_add(salt), 3).powi(2) * 4.4,
                brightness: 0.7 + hash(index.wrapping_add(salt), 3) * 0.3,
                color: css_color(
                    STELLAR_CLASS_COLORS[(hash(index.wrapping_add(salt), 6)
                        * STELLAR_CLASS_COLORS.len() as f64)
                        as usize
                        % STELLAR_CLASS_COLORS.len()],
                    dark_mode,
                ),
                has_diagonals: hash(index.wrapping_add(salt), 7) < DIAGONAL_SHARE,
                has_ring: hash(index.wrapping_add(salt), 8) < RING_SHARE,
                flicker_speed: if hash(index.wrapping_add(salt), 9) < FLICKER_SHARE {
                    1.5 + hash(index.wrapping_add(salt), 10) * 2.5
                } else {
                    0.0
                },
                phase: hash(index.wrapping_add(salt), 4),
                flash_period: 9.0 + hash(index.wrapping_add(salt), 5) * 13.0,
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
    state.nebula.resize(width, height);

    state.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)?;
    state.ctx.scale(dpr, dpr)?;

    Ok(())
}

fn render(state: &Rc<RefCell<State>>, time: f64) {
    let mut state = state.borrow_mut();
    let seconds = time / 1000.0;

    let nebula_seconds = if state.reduced_motion { 0.0 } else { seconds };

    if state.nebula.needs_update(time) {
        let _ = state.nebula.update(time, nebula_seconds);
    }

    let state = &*state;
    let ctx = &state.ctx;

    ctx.clear_rect(0.0, 0.0, state.width, state.height);
    state.nebula.draw(ctx, state.width, state.height);

    for star in &state.stars {
        let intensity = if state.reduced_motion {
            0.5
        } else {
            flash(star, seconds) * flicker(star, seconds)
        };

        if intensity <= 0.0 {
            continue;
        }

        ctx.set_fill_style_str(&star.color);
        draw_star(
            ctx,
            star,
            (star.x * state.width).round(),
            (star.y * state.height).round(),
            star.arm_length * intensity,
            PEAK_ALPHA * intensity * star.brightness,
        );
    }

    ctx.set_global_alpha(1.0);
}

fn flash(star: &Star, seconds: f64) -> f64 {
    let cycle = (seconds / star.flash_period + star.phase).fract();

    if cycle > FLASH_FRACTION {
        return 0.0;
    }

    let progress = cycle / FLASH_FRACTION;
    (progress * std::f64::consts::PI).sin().powf(1.8)
}

fn flicker(star: &Star, seconds: f64) -> f64 {
    if star.flicker_speed <= 0.0 {
        return 1.0;
    }

    let t = seconds * star.flicker_speed + star.phase * std::f64::consts::TAU;
    let wobble = (t * 3.1).sin() * 0.6 + (t * 7.7).sin() * 0.4;

    1.0 - FLICKER_DEPTH * (0.5 - 0.5 * wobble)
}

fn draw_star(ctx: &CanvasRenderingContext2d, star: &Star, x: f64, y: f64, arm: f64, alpha: f64) {
    let arm = arm.round().max(1.0);

    let cx = x + 0.5;
    let cy = y + 0.5;

    if star.has_ring {
        draw_ring(ctx, star, cx, cy, arm * RING_SCALE, alpha * RING_ALPHA);
    }

    draw_rays(ctx, cx, cy, arm, alpha);

    if star.has_diagonals {
        draw_diagonal_rays(ctx, cx, cy, arm, alpha);
    }

    ctx.set_global_alpha(alpha);
    ctx.fill_rect(cx - arm - 0.5, cy - 0.5, arm * 2.0 + 1.0, 1.0);
    ctx.fill_rect(cx - 0.5, cy - arm - 0.5, 1.0, arm * 2.0 + 1.0);

    draw_core(ctx, cx, cy, arm, alpha);
}

fn draw_core(ctx: &CanvasRenderingContext2d, cx: f64, cy: f64, arm: f64, alpha: f64) {
    let radius = CORE_RADIUS + arm * CORE_GROWTH;

    ctx.set_global_alpha((alpha * GLOW_ALPHA).min(1.0));
    ctx.begin_path();
    let _ = ctx.arc(cx, cy, radius * GLOW_SCALE, 0.0, std::f64::consts::TAU);
    ctx.fill();

    ctx.set_global_alpha((alpha * 1.7).min(1.0));
    ctx.begin_path();
    let _ = ctx.arc(cx, cy, radius, 0.0, std::f64::consts::TAU);
    ctx.fill();
}

fn draw_rays(ctx: &CanvasRenderingContext2d, cx: f64, cy: f64, arm: f64, alpha: f64) {
    let step = (arm * RAY_SCALE) / RAY_SEGMENTS as f64;

    for index in 0..RAY_SEGMENTS {
        let falloff = 1.0 - (index as f64 / RAY_SEGMENTS as f64);
        let segment_alpha = alpha * RAY_ALPHA * falloff * falloff;

        if segment_alpha < 0.002 {
            continue;
        }

        let near = arm + 0.5 + step * index as f64;
        let far = near + step;

        ctx.set_global_alpha(segment_alpha);
        ctx.fill_rect(cx + near, cy - 0.5, step, 1.0);
        ctx.fill_rect(cx - far, cy - 0.5, step, 1.0);
        ctx.fill_rect(cx - 0.5, cy + near, 1.0, step);
        ctx.fill_rect(cx - 0.5, cy - far, 1.0, step);
    }
}

fn css_color(rgb: (u8, u8, u8), dark_mode: bool) -> String {
    let (r, g, b) = rgb;

    if dark_mode {
        return format!("rgb({r}, {g}, {b})");
    }

    let dim = |channel: u8| (channel as f64 * 0.12 + 8.0).round() as u8;
    format!("rgba({}, {}, {}, 0.6)", dim(r), dim(g), dim(b))
}

fn draw_diagonal_rays(ctx: &CanvasRenderingContext2d, cx: f64, cy: f64, arm: f64, alpha: f64) {
    ctx.save();

    if ctx.translate(cx, cy).is_ok() && ctx.rotate(std::f64::consts::FRAC_PI_4).is_ok() {
        draw_rays(ctx, 0.0, 0.0, arm * DIAGONAL_SCALE, alpha * DIAGONAL_ALPHA);
    }

    ctx.restore();
}

fn draw_ring(
    ctx: &CanvasRenderingContext2d,
    star: &Star,
    cx: f64,
    cy: f64,
    radius: f64,
    alpha: f64,
) {
    if alpha < 0.002 {
        return;
    }

    ctx.set_global_alpha(alpha);
    ctx.set_stroke_style_str(&star.color);
    ctx.set_line_width(1.0);
    ctx.begin_path();
    let _ = ctx.arc(cx, cy, radius, 0.0, std::f64::consts::TAU);
    ctx.stroke();
}

fn hash(a: i32, b: i32) -> f64 {
    let mut value = (a as i64 * 374_761_393) ^ (b as i64 * 668_265_263);
    value = (value ^ (value >> 13)) * 1_274_126_177;
    let value = value ^ (value >> 16);
    (value & 1023) as f64 / 1023.0
}
