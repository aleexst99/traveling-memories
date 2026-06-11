import { Component, inject, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import gsap from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private el   = inject(ElementRef);

  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  error = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // ── Yeti state ────────────────────────────────────────────
  private eyesCovered = false;
  private blinkTween: gsap.core.Tween | null = null;
  private svgCoords!: { x: number; y: number };
  private inputCoords!: { x: number; y: number };
  private screenCenter!: number;
  private inputScrollMax!: number;

  // ── SVG element refs ──────────────────────────────────────
  private q = (s: string) => this.el.nativeElement.querySelector(s);

  ngAfterViewInit() {
    // Pequeño delay para que el DOM esté completamente renderizado
    setTimeout(() => this.initYeti(), 100);
  }

  ngOnDestroy() {
    this.blinkTween?.kill();
    this.removeListeners();
  }

  // ── Inicialización ────────────────────────────────────────

  private initYeti() {
    const mySVG      = this.q('.svgContainer');
    const input      = this.usernameInput.nativeElement;
    const armL       = this.q('.armL');
    const armR       = this.q('.armR');

    if (!mySVG || !input) return;

    const svgRect   = mySVG.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    this.svgCoords   = { x: svgRect.left + window.scrollX, y: svgRect.top + window.scrollY };
    this.inputCoords = { x: inputRect.left + window.scrollX, y: inputRect.top + window.scrollY };
    this.screenCenter = this.svgCoords.x + mySVG.offsetWidth / 2;
    this.inputScrollMax = input.scrollWidth;

    // Posición inicial de los brazos (fuera de la vista, abajo)
    gsap.set(armL, { x: -93, y: 220, rotation: 105, transformOrigin: 'top left', visibility: 'hidden' });
    gsap.set(armR, { x: -93, y: 220, rotation: -105, transformOrigin: 'top right', visibility: 'hidden' });

    this.startBlinking(3);
    this.addListeners();
  }

  // ── Event listeners ───────────────────────────────────────

  private boundUsernameFocus = () => this.onUsernameFocus();
  private boundUsernameBlur  = () => this.onUsernameBlur();
  private boundUsernameInput = () => this.onUsernameInput();
  private boundPasswordFocus = () => this.onPasswordFocus();
  private boundPasswordBlur  = () => this.onPasswordBlur();

  private addListeners() {
    const u = this.usernameInput.nativeElement;
    const p = this.passwordInput.nativeElement;
    u.addEventListener('focus', this.boundUsernameFocus);
    u.addEventListener('blur',  this.boundUsernameBlur);
    u.addEventListener('input', this.boundUsernameInput);
    p.addEventListener('focus', this.boundPasswordFocus);
    p.addEventListener('blur',  this.boundPasswordBlur);
  }

  private removeListeners() {
    const u = this.usernameInput?.nativeElement;
    const p = this.passwordInput?.nativeElement;
    if (u) {
      u.removeEventListener('focus', this.boundUsernameFocus);
      u.removeEventListener('blur',  this.boundUsernameBlur);
      u.removeEventListener('input', this.boundUsernameInput);
    }
    if (p) {
      p.removeEventListener('focus', this.boundPasswordFocus);
      p.removeEventListener('blur',  this.boundPasswordBlur);
    }
  }

  // ── Handlers ──────────────────────────────────────────────

  private onUsernameFocus() {
    this.onUsernameInput();
  }

  private onUsernameBlur() {
    setTimeout(() => this.resetFace(), 100);
  }

  private onUsernameInput() {
    this.calculateFaceMove();
  }

  private onPasswordFocus() {
    if (!this.eyesCovered) this.coverEyes();
  }

  private onPasswordBlur() {
    setTimeout(() => this.uncoverEyes(), 100);
  }

  // ── Animaciones de la cara ────────────────────────────────

  private calculateFaceMove() {
    const input = this.usernameInput.nativeElement;
    const carPos = input.selectionEnd ?? input.value.length;

    // Crear div espejo para calcular posición del cursor
    const div  = document.createElement('div');
    const span = document.createElement('span');
    const style = getComputedStyle(input);

    Array.from(style).forEach(prop => (div.style as any)[prop] = (style as any)[prop]);
    div.style.position   = 'absolute';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    div.textContent  = input.value.substring(0, carPos);
    span.textContent = input.value.substring(carPos) || '.';
    div.appendChild(span);

    const spanRect  = span.getBoundingClientRect();
    const caretX    = spanRect.left + window.scrollX;
    const caretY    = this.inputCoords.y + 25;
    const targetX   = input.scrollWidth <= this.inputScrollMax
      ? caretX
      : this.inputCoords.x + this.inputScrollMax;

    document.body.removeChild(div);

    const eyeLCoords = { x: this.svgCoords.x + 84, y: this.svgCoords.y + 76 };
    const eyeRCoords = { x: this.svgCoords.x + 113, y: this.svgCoords.y + 76 };
    const noseCoords = { x: this.svgCoords.x + 97, y: this.svgCoords.y + 81 };
    const mouthCoords = { x: this.svgCoords.x + 100, y: this.svgCoords.y + 100 };

    const eyeLAngle  = Math.atan2(eyeLCoords.y - caretY, eyeLCoords.x - targetX);
    const eyeRAngle  = Math.atan2(eyeRCoords.y - caretY, eyeRCoords.x - targetX);
    const noseAngle  = Math.atan2(noseCoords.y - caretY, noseCoords.x - targetX);
    const mouthAngle = Math.atan2(mouthCoords.y - caretY, mouthCoords.x - targetX);

    const eyeLX = Math.cos(eyeLAngle) * 20;
    const eyeLY = Math.sin(eyeLAngle) * 10;
    const eyeRX = Math.cos(eyeRAngle) * 20;
    const eyeRY = Math.sin(eyeRAngle) * 10;
    const noseX = Math.cos(noseAngle) * 23;
    const noseY = Math.sin(noseAngle) * 10;
    const mouthX = Math.cos(mouthAngle) * 23;
    const mouthY = Math.sin(mouthAngle) * 10;
    const mouthR = Math.cos(mouthAngle) * 6;
    const faceX  = mouthX * 0.3;
    const faceY  = mouthY * 0.4;
    const faceSkew = Math.cos(mouthAngle) * 5;
    const outerEarX = Math.cos(mouthAngle) * 4;
    const outerEarY = Math.cos(mouthAngle) * 5;
    const hairX = Math.cos(mouthAngle) * 6;

    const opts = { duration: 1, ease: 'expo.out' };

    gsap.to(this.q('.eyeL'),   { ...opts, x: -eyeLX, y: -eyeLY });
    gsap.to(this.q('.eyeR'),   { ...opts, x: -eyeRX, y: -eyeRY });
    gsap.to(this.q('.nose'),   { ...opts, x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: 'center center' });
    gsap.to(this.q('.mouth'),  { ...opts, x: -mouthX, y: -mouthY, rotation: mouthR, transformOrigin: 'center center' });
    gsap.to(this.q('.chin'),   { ...opts, x: -mouthX * 0.8, y: -mouthY * 0.5 });
    gsap.to(this.q('.face'),   { ...opts, x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: 'center top' });
    gsap.to(this.q('.eyebrow'),{ ...opts, x: -faceX, y: -faceY, skewX: -faceSkew * 5, transformOrigin: 'center top' });
    gsap.to(this.q('.earL .outerEar'), { ...opts, x: outerEarX, y: -outerEarY });
    gsap.to(this.q('.earR .outerEar'), { ...opts, x: outerEarX, y: outerEarY });
    gsap.to(this.q('.earL .earHair'),  { ...opts, x: -outerEarX, y: -outerEarY });
    gsap.to(this.q('.earR .earHair'),  { ...opts, x: -outerEarX, y: outerEarY });
    gsap.to(this.q('.hair'), { ...opts, x: hairX, scaleY: 1.2, transformOrigin: 'center bottom' });
  }

  private resetFace() {
    const opts = { duration: 1, ease: 'expo.out' };
    gsap.to(this.q('.eyeL'),   { ...opts, x: 0, y: 0 });
    gsap.to(this.q('.eyeR'),   { ...opts, x: 0, y: 0 });
    gsap.to(this.q('.nose'),   { ...opts, x: 0, y: 0, rotation: 0 });
    gsap.to(this.q('.mouth'),  { ...opts, x: 0, y: 0, rotation: 0 });
    gsap.to(this.q('.chin'),   { ...opts, x: 0, y: 0, scaleY: 1 });
    gsap.to(this.q('.face'),   { ...opts, x: 0, y: 0, skewX: 0 });
    gsap.to(this.q('.eyebrow'),{ ...opts, x: 0, y: 0, skewX: 0 });
    gsap.to([this.q('.earL .outerEar'), this.q('.earR .outerEar'),
             this.q('.earL .earHair'),  this.q('.earR .earHair'),
             this.q('.hair')], { ...opts, x: 0, y: 0, scaleY: 1 });
  }

  private coverEyes() {
    const armL = this.q('.armL');
    const armR = this.q('.armR');
    gsap.killTweensOf([armL, armR]);
    gsap.set([armL, armR], { visibility: 'visible' });
    gsap.to(armL, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: 'quad.out' });
    gsap.to(armR, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: 'quad.out', delay: 0.1 });
    this.eyesCovered = true;
  }

  private uncoverEyes() {
    const armL = this.q('.armL');
    const armR = this.q('.armR');
    gsap.killTweensOf([armL, armR]);
    gsap.to(armL, { duration: 1.35, y: 220, ease: 'quad.out' });
    gsap.to(armL, { duration: 1.35, rotation: 105, ease: 'quad.out', delay: 0.1 });
    gsap.to(armR, { duration: 1.35, y: 220, ease: 'quad.out' });
    gsap.to(armR, {
      duration: 1.35, rotation: -105, ease: 'quad.out', delay: 0.1,
      onComplete: () => gsap.set([armL, armR], { visibility: 'hidden' })
    });
    this.eyesCovered = false;
  }

  private startBlinking(delay = 3) {
    const randomDelay = Math.random() * delay + 1;
    const eyeL = this.q('.eyeL');
    const eyeR = this.q('.eyeR');
    this.blinkTween = gsap.to([eyeL, eyeR], {
      duration: 0.1, delay: randomDelay,
      scaleY: 0, yoyo: true, repeat: 1,
      transformOrigin: 'center center',
      onComplete: () => this.startBlinking(8)
    });
  }

  // ── Login ──────────────────────────────────────────────────

  submit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;
    const ok = this.auth.login(username!, password!);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.error = true;
      // Shake animation on error
      gsap.to(this.q('.login-card'), {
        duration: 0.05, x: -8, yoyo: true, repeat: 5, ease: 'power1.inOut',
        onComplete: () => gsap.set(this.q('.login-card'), { x: 0 })
      });
    }
  }
}
