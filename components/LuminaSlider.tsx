"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import * as THREE from "three"

type Slide = { title: string; description: string; media: string }

interface LuminaSliderProps {
  slides: Slide[]
  autoSlideMs?: number
  transitionDuration?: number
}

// WebGL fragment-shader transition slider — atelier cinematic chapter explorer.
// Adapted from 21st.dev/r/hardikkashiyani123456788/lumina-interactive-list.
// CSS lives in app/globals.css (.lumina-* classes) and uses V0's Fraunces
// type system instead of the donor's Playfair + Inter pair.
export function LuminaSlider({ slides, autoSlideMs = 5000, transitionDuration = 2.5 }: LuminaSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const totalRef = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const titleEl = titleRef.current
    const descEl = descRef.current
    const numberEl = numberRef.current
    const totalEl = totalRef.current
    const navEl = navRef.current
    if (!root || !canvas || !titleEl || !descEl || !numberEl || !totalEl || !navEl) return

    let currentSlideIndex = 0
    let isTransitioning = false
    let texturesLoaded = false
    let sliderEnabled = false
    let progressInterval: ReturnType<typeof setInterval> | null = null
    let autoTimer: ReturnType<typeof setTimeout> | null = null
    let renderHandle = 0
    let disposed = false

    const slideTextures: THREE.Texture[] = []
    let shaderMaterial: THREE.ShaderMaterial
    let renderer: THREE.WebGLRenderer
    let scene: THREE.Scene
    let camera: THREE.OrthographicCamera

    const PROGRESS_TICK = 50

    const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
    const fragmentShader = `
      uniform sampler2D uTexture1, uTexture2;
      uniform float uProgress;
      uniform vec2 uResolution, uTexture1Size, uTexture2Size;
      varying vec2 vUv;
      vec2 getCoverUV(vec2 uv, vec2 texSize) {
        vec2 s = uResolution / texSize;
        float scale = max(s.x, s.y);
        vec2 scaledSize = texSize * scale;
        vec2 offset = (uResolution - scaledSize) * 0.5;
        return (uv * uResolution - offset) / scaledSize;
      }
      void main() {
        vec2 uv1 = getCoverUV(vUv, uTexture1Size);
        vec2 uv2 = getCoverUV(vUv, uTexture2Size);
        float maxR = length(uResolution) * 0.85;
        float br = uProgress * maxR;
        vec2 p = vUv * uResolution;
        vec2 c = uResolution * 0.5;
        float d = length(p - c);
        float nd = d / max(br, 0.001);
        float param = smoothstep(br + 3.0, br - 3.0, d);
        vec4 img;
        if (param > 0.0) {
          float ro = 0.08 * pow(smoothstep(0.3, 1.0, nd), 1.5);
          vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
          vec2 distUV = uv2 - dir * ro;
          float ca = 0.02 * pow(smoothstep(0.3, 1.0, nd), 1.2);
          img = vec4(
            texture2D(uTexture2, distUV + dir * ca * 1.2).r,
            texture2D(uTexture2, distUV + dir * ca * 0.2).g,
            texture2D(uTexture2, distUV - dir * ca * 0.8).b,
            1.0
          );
          float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
          img.rgb += rim * 0.08;
        } else {
          img = texture2D(uTexture2, uv2);
        }
        vec4 oldImg = texture2D(uTexture1, uv1);
        if (uProgress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (uProgress - 0.95) / 0.05);
        gl_FragColor = mix(oldImg, img, param);
      }
    `

    const renderSplitText = (el: HTMLElement, text: string) => {
      while (el.firstChild) el.removeChild(el.firstChild)
      for (const ch of text) {
        const span = document.createElement("span")
        span.style.display = "inline-block"
        span.style.opacity = "0"
        span.textContent = ch === " " ? " " : ch
        el.appendChild(span)
      }
    }

    const updateCounter = (idx: number) => {
      numberEl.textContent = String(idx + 1).padStart(2, "0")
      totalEl.textContent = String(slides.length).padStart(2, "0")
    }

    const setActiveNav = (idx: number) =>
      navEl.querySelectorAll(".slide-nav-item").forEach((el, i) => el.classList.toggle("active", i === idx))

    const updateProgress = (idx: number, pct: number) => {
      const fill = navEl.querySelectorAll<HTMLDivElement>(".slide-nav-item")[idx]?.querySelector<HTMLDivElement>(".slide-progress-fill")
      if (fill) {
        fill.style.width = `${pct}%`
        fill.style.opacity = "1"
      }
    }
    const fadeProgress = (idx: number) => {
      const fill = navEl.querySelectorAll<HTMLDivElement>(".slide-nav-item")[idx]?.querySelector<HTMLDivElement>(".slide-progress-fill")
      if (fill) {
        fill.style.opacity = "0"
        setTimeout(() => { if (fill) fill.style.width = "0%" }, 300)
      }
    }
    const resetProgress = (idx: number) => {
      const fill = navEl.querySelectorAll<HTMLDivElement>(".slide-nav-item")[idx]?.querySelector<HTMLDivElement>(".slide-progress-fill")
      if (fill) {
        fill.style.transition = "width 0.2s ease-out"
        fill.style.width = "0%"
        setTimeout(() => { if (fill) fill.style.transition = "width 0.1s ease, opacity 0.3s ease" }, 200)
      }
    }

    const stopTimer = () => {
      if (progressInterval) { clearInterval(progressInterval); progressInterval = null }
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null }
    }

    const startTimer = () => {
      if (!texturesLoaded || !sliderEnabled || disposed) return
      stopTimer()
      let pct = 0
      const inc = (100 / autoSlideMs) * PROGRESS_TICK
      progressInterval = setInterval(() => {
        if (!sliderEnabled || disposed) { stopTimer(); return }
        pct += inc
        updateProgress(currentSlideIndex, pct)
        if (pct >= 100) {
          if (progressInterval) clearInterval(progressInterval)
          progressInterval = null
          fadeProgress(currentSlideIndex)
          if (!isTransitioning) navigate((currentSlideIndex + 1) % slides.length)
        }
      }, PROGRESS_TICK)
    }

    const safeStart = (delay = 0) => {
      stopTimer()
      if (!sliderEnabled || !texturesLoaded || disposed) return
      if (delay > 0) autoTimer = setTimeout(startTimer, delay)
      else startTimer()
    }

    const updateContent = (idx: number) => {
      gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" })
      gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" })
      setTimeout(() => {
        if (disposed) return
        renderSplitText(titleEl, slides[idx].title)
        descEl.textContent = slides[idx].description
        gsap.set(titleEl.children, { opacity: 0, y: 20 })
        gsap.set(descEl, { y: 20, opacity: 0 })
        gsap.to(titleEl.children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" })
        gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" })
      }, 500)
    }

    const navigate = (targetIdx: number) => {
      if (isTransitioning || targetIdx === currentSlideIndex || disposed) return
      stopTimer()
      resetProgress(currentSlideIndex)
      const currentTex = slideTextures[currentSlideIndex]
      const targetTex = slideTextures[targetIdx]
      if (!currentTex || !targetTex) return
      isTransitioning = true
      shaderMaterial.uniforms.uTexture1.value = currentTex
      shaderMaterial.uniforms.uTexture2.value = targetTex
      shaderMaterial.uniforms.uTexture1Size.value = (currentTex as unknown as { userData: { size: THREE.Vector2 } }).userData.size
      shaderMaterial.uniforms.uTexture2Size.value = (targetTex as unknown as { userData: { size: THREE.Vector2 } }).userData.size
      updateContent(targetIdx)
      currentSlideIndex = targetIdx
      updateCounter(currentSlideIndex)
      setActiveNav(currentSlideIndex)
      gsap.fromTo(
        shaderMaterial.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: transitionDuration,
          ease: "power2.inOut",
          onComplete: () => {
            shaderMaterial.uniforms.uProgress.value = 0
            shaderMaterial.uniforms.uTexture1.value = targetTex
            shaderMaterial.uniforms.uTexture1Size.value = (targetTex as unknown as { userData: { size: THREE.Vector2 } }).userData.size
            isTransitioning = false
            safeStart(100)
          },
        }
      )
    }

    const buildNav = () => {
      while (navEl.firstChild) navEl.removeChild(navEl.firstChild)
      slides.forEach((slide, i) => {
        const item = document.createElement("div")
        item.className = `slide-nav-item${i === 0 ? " active" : ""}`
        item.dataset.slideIndex = String(i)
        const progressLine = document.createElement("div")
        progressLine.className = "slide-progress-line"
        const fill = document.createElement("div")
        fill.className = "slide-progress-fill"
        progressLine.appendChild(fill)
        const title = document.createElement("div")
        title.className = "slide-nav-title"
        title.textContent = slide.title
        item.appendChild(progressLine)
        item.appendChild(title)
        item.addEventListener("click", (e) => {
          e.stopPropagation()
          if (!isTransitioning && i !== currentSlideIndex) navigate(i)
        })
        navEl.appendChild(item)
      })
    }

    const loadTexture = (src: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        const loader = new THREE.TextureLoader()
        loader.load(
          src,
          (t) => {
            t.minFilter = THREE.LinearFilter
            t.magFilter = THREE.LinearFilter
            ;(t as unknown as { userData: { size: THREE.Vector2 } }).userData = {
              size: new THREE.Vector2(t.image.width, t.image.height),
            }
            resolve(t)
          },
          undefined,
          reject
        )
      })

    const init = async () => {
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
      } catch {
        root.classList.add("webgl-failed")
        return
      }
      const w0 = root.clientWidth
      const h0 = root.clientHeight
      renderer.setSize(w0, h0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture1: { value: null },
          uTexture2: { value: null },
          uProgress: { value: 0 },
          uResolution: { value: new THREE.Vector2(w0, h0) },
          uTexture1Size: { value: new THREE.Vector2(1, 1) },
          uTexture2Size: { value: new THREE.Vector2(1, 1) },
        },
        vertexShader,
        fragmentShader,
      })
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial))

      for (const s of slides) {
        try {
          slideTextures.push(await loadTexture(s.media))
        } catch {
          /* skip broken */
        }
      }
      if (slideTextures.length < 2 || disposed) return

      shaderMaterial.uniforms.uTexture1.value = slideTextures[0]
      shaderMaterial.uniforms.uTexture2.value = slideTextures[1]
      shaderMaterial.uniforms.uTexture1Size.value = (slideTextures[0] as unknown as { userData: { size: THREE.Vector2 } }).userData.size
      shaderMaterial.uniforms.uTexture2Size.value = (slideTextures[1] as unknown as { userData: { size: THREE.Vector2 } }).userData.size
      texturesLoaded = true
      sliderEnabled = true
      root.classList.add("loaded")

      renderSplitText(titleEl, slides[0].title)
      descEl.textContent = slides[0].description
      gsap.fromTo(
        titleEl.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.3 }
      )
      gsap.fromTo(descEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 })

      safeStart(500)

      const renderLoop = () => {
        if (disposed) return
        renderHandle = requestAnimationFrame(renderLoop)
        renderer.render(scene, camera)
      }
      renderLoop()
    }

    const onResize = () => {
      if (!renderer || disposed) return
      const w = root.clientWidth
      const h = root.clientHeight
      renderer.setSize(w, h)
      shaderMaterial.uniforms.uResolution.value.set(w, h)
    }
    const onVisibility = () => {
      if (document.hidden) stopTimer()
      else if (!isTransitioning) safeStart()
    }

    buildNav()
    updateCounter(0)
    setActiveNav(0)
    init()

    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      disposed = true
      stopTimer()
      cancelAnimationFrame(renderHandle)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      slideTextures.forEach((t) => t.dispose())
      try { renderer?.dispose() } catch {}
    }
  }, [slides, autoSlideMs, transitionDuration])

  return (
    <div ref={rootRef} className="lumina-slider" data-nav-theme="light">
      <canvas ref={canvasRef} className="lumina-canvas" />
      <span ref={numberRef} className="lumina-number">01</span>
      <span ref={totalRef} className="lumina-total">06</span>
      <div className="lumina-content">
        <h2 ref={titleRef} className="lumina-title" />
        <p ref={descRef} className="lumina-desc" />
      </div>
      <nav ref={navRef} className="lumina-nav" />
    </div>
  )
}
