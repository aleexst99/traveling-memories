import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { User } from '../usuario-perfil/models/user.model';
import { ViajeConUsuario } from '../usuario-perfil/viajes/models/viajes.model';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { TripStoreService } from '../../core/trip-store.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-mapa-global',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-global.component.html',
  styleUrls: ['./mapa-global.component.scss'],
})
export class MapaGlobalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: false }) globeContainer!: ElementRef;

  // THREE.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: THREE.Mesh;
  private markers: THREE.Object3D[] = [];
  private borderLines: THREE.LineSegments[] = [];
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationFrameId?: number;


  // Colores por usuario
  private userColorMap: Record<string, number> = {};
  private availableColors = [
    0x000000,  // Negro (Alejandro)
    0x1976d2,  // Azul (Arturo)
  ];

  // Datos
  usuarios = signal<User[]>([]);
  allTrips = signal<ViajeConUsuario[]>([]);

  // Filtros
  filtroUsuario = signal<string>('Todos');
  filtroContinente = signal<string>('Todos');
  filtroTipo = signal<string>('Todos');
  busquedaTexto = signal<string>('');

  continentes = ['Todos', 'Europa', 'Asia', 'África', 'América', 'Oceanía'];

  // Estados UI
  tooltipVisible = signal<boolean>(false);
  tooltipData = signal<ViajeConUsuario | null>(null);
  tooltipPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  globeReady = signal<boolean>(false);
  rotacionActiva = signal<boolean>(false);
  modoVista = signal<'3d' | 'lista'>('3d');
  mostrarEstadisticas = signal<boolean>(true);
  temaOscuro = signal<boolean>(false);

  // Configuración
  private velocidadRotacion = 0.001;
  private dataLoaded = false;

  // Viajes filtrados
  filteredTrips = computed(() => {
    return this.allTrips().filter((v) => {
      const matchUser =
        this.filtroUsuario() === 'Todos' || v.userName === this.filtroUsuario();
      const matchCont =
        this.filtroContinente() === 'Todos' || v.continent === this.filtroContinente();
      const matchTipo =
        this.filtroTipo() === 'Todos' || v.tipo === this.filtroTipo();
      const matchBusqueda =
        this.busquedaTexto() === '' ||
        v.title.toLowerCase().includes(this.busquedaTexto().toLowerCase()) ||
        v.continent.toLowerCase().includes(this.busquedaTexto().toLowerCase());

      return matchUser && matchCont && matchTipo && matchBusqueda;
    });
  });

  // Estadísticas computadas
  viajesRealizados = computed(() =>
    this.filteredTrips().filter(v => v.tipo === 'realizado').length
  );

  viajesWishlist = computed(() =>
    this.filteredTrips().filter(v => v.tipo === 'wishlist').length
  );

  continentesUnicos = computed(() => {
    const continentes = new Set(this.filteredTrips().map(v => v.continent));
    return continentes.size;
  });

  private api = inject(ApiService);
  private store = inject(TripStoreService);
  private toastSvc = inject(ToastService);

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarPreferencias();
  }

  ngAfterViewInit(): void {
    this.tryInitGlobe();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', () => this.onResize());
  }

  // =================================================================
  // CARGA DE DATOS
  // =================================================================

  private cargarDatos() {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.usuarios.set(users);
        const trips: ViajeConUsuario[] = [];

        users.forEach(u => {
          const viajesUsuario = this.store.getTripsByUser(u.id);
          viajesUsuario.forEach(v => trips.push({
            ...v,
            userName: u.name,
            userPhoto: u.photo,
            tipo: v.tipo ?? 'realizado',
          }));
        });

        this.allTrips.set(trips);
        this.dataLoaded = true;
        this.tryInitGlobe();
      },
      error: (err) => console.error('Error cargando usuarios', err),
    });
  }

  private tryInitGlobe() {
    if (this.dataLoaded && this.globeContainer) {
      this.initGlobe();
    }
  }

  // =================================================================
  // INICIALIZAR GLOBO 3D
  // =================================================================

  private initGlobe() {
    const container = this.globeContainer.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    // Globo
    const globeTexture = new THREE.TextureLoader().load('assets/earth.png');
    const geo = new THREE.SphereGeometry(200, 64, 64);
    const mat = new THREE.MeshPhongMaterial({ map: globeTexture });
    this.globe = new THREE.Mesh(geo, mat);
    this.scene.add(this.globe);


    // Cargar fronteras
    this.cargarFronteras();

    // Controles
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.minDistance = 250;
    this.controls.maxDistance = 800;
    this.controls.enablePan = false;

    // Animación
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      if (this.rotacionActiva() && this.globe) {
        this.globe.rotation.y += this.velocidadRotacion;
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    this.refrescarMarcadores();

    // Eventos
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onMarkerClick(e));
    this.renderer.domElement.addEventListener('pointermove', (e) => this.onMarkerHover(e));
    window.addEventListener('resize', () => this.onResize());

    this.globeReady.set(true);
  }

  private onResize() {
    const container = this.globeContainer.nativeElement;
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // =================================================================
  // FRONTERAS DE PAÍSES
  // =================================================================

  private cargarFronteras() {
    const geojsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

    fetch(geojsonUrl)
      .then(response => response.json())
      .then(data => this.dibujarFronteras(data))
      .catch(err => console.error('Error cargando fronteras:', err));
  }

  private dibujarFronteras(geojson: any) {
    geojson.features.forEach((feature: any) => {
      const geometry = feature.geometry;

      if (geometry.type === 'Polygon') {
        this.dibujarPoligono(geometry.coordinates);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon: any) => {
          this.dibujarPoligono(polygon);
        });
      }
    });
  }

  private dibujarPoligono(coordinates: any) {
    coordinates.forEach((ring: any) => {
      const points: THREE.Vector3[] = [];

      ring.forEach((coord: number[]) => {
        const [lng, lat] = coord;
        const point = this.latLngTo3D(lat, lng, 200.5);
        points.push(point);
      });

      if (points.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          opacity: 0.2,
          transparent: true,
          linewidth: 1
        });

        const line = new THREE.LineSegments(geometry, material);
        this.scene.add(line);
        this.borderLines.push(line);
      }
    });
  }

  // =================================================================
  // MARCADORES
  // =================================================================

  refrescarMarcadores() {
    if (!this.globe) return;

    this.markers.forEach((m) => this.globe.remove(m));
    this.markers = [];

    this.filteredTrips().forEach((v) => {
      if (v.lat == null || v.lng == null) return;

      const userColor = this.getColorForUser(v.userName);
      const emoji = v.tipo === 'wishlist' ? '⭐' : '✈️';

      // 🆕 Pasar userName para personalización
      const texture = this.createSimpleMarkerTexture(emoji, userColor, v.userName);

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        sizeAttenuation: true,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(11, 11, 1); // 🆕 Más grande para mejor visibilidad

      const pos = this.latLngTo3D(v.lat, v.lng, 203);
      sprite.position.copy(pos);

      sprite.userData = { viaje: v };

      this.globe.add(sprite);
      this.markers.push(sprite);
    });
  }
  // MÉTODO AUXILIAR para crear texturas circulares
  private createSimpleMarkerTexture(
    emoji: string,
    userColor: number,
    userName: string
  ): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const colorHex = '#' + userColor.toString(16).padStart(6, '0');

    const isAlejandro = userName === 'Alejandro';
    const isWishlist = emoji === '⭐';

    // Sombra exterior pronunciada
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // ALEJANDRO: Cuadrado redondeado | ARTURO: Círculo perfecto
    if (isAlejandro) {
      // Cuadrado con bordes redondeados
      const cornerRadius = 12;
      this.roundRect(ctx, centerX - 52, centerY - 52, 104, 104, cornerRadius);

      // Gradiente más oscuro para Alejandro (negro intenso)
      const gradient = ctx.createRadialGradient(centerX, centerY - 10, 10, centerX, centerY, 52);
      gradient.addColorStop(0, '#333333'); // Gris oscuro en el centro
      gradient.addColorStop(1, '#000000'); // Negro puro en los bordes
      ctx.fillStyle = gradient;
      ctx.fill();
    } else {
      // Círculo perfecto para Arturo
      const gradient = ctx.createRadialGradient(centerX, centerY - 10, 10, centerX, centerY, 52);
      gradient.addColorStop(0, this.lightenColorHex(colorHex, 40)); // Más claro
      gradient.addColorStop(1, colorHex);
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
      ctx.fill();
    }

    // Borde blanco MÁS GRUESO
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Anillo interior diferente según usuario
    if (isAlejandro) {
      // Anillo dorado/amarillo para Alejandro (contrasta con negro)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      const cornerRadius = 8;
      this.roundRect(ctx, centerX - 44, centerY - 44, 88, 88, cornerRadius);
      ctx.stroke();
    } else {
      // Anillo azul oscuro para Arturo
      ctx.strokeStyle = this.darkenColorHex(colorHex, 40);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 44, 0, Math.PI * 2);
      ctx.stroke();
    }

    let displayEmoji = emoji;
    let emojiSize = 70;

    if (isWishlist) {
        displayEmoji = '⭐';
        emojiSize = 70;
    } else {
        displayEmoji = '✈️';
        emojiSize = 70;
    }

    ctx.font = `bold ${emojiSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText(displayEmoji, centerX, centerY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Método auxiliar para cuadrado redondeado
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Métodos auxiliares para manipular colores hexadecimales
  private lightenColorHex(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  private darkenColorHex(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  private getColorForUser(userName: string): number {
    if (this.userColorMap[userName]) return this.userColorMap[userName];

    if (userName === 'Alejandro') {
      this.userColorMap[userName] = 0x000000; // Negro
      return 0x000000;
    } else if (userName === 'Arturo') {
      this.userColorMap[userName] = 0x1976d2; // Azul
      return 0x1976d2;
    }

    // Para otros usuarios (si los hay)
    const used = Object.keys(this.userColorMap).length;
    const color = this.availableColors[used % this.availableColors.length];
    this.userColorMap[userName] = color;
    return color;
  }

  // =================================================================
  // INTERACCIONES
  // =================================================================

  private onMarkerClick(event: PointerEvent) {
    if (!this.renderer || !this.camera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers, true);

    if (intersects.length > 0) {
      const viaje = intersects[0].object.userData?.['viaje'] as ViajeConUsuario | undefined;
      if (!viaje) return;

      this.tooltipData.set(viaje);

      // Ajustar posición del tooltip según espacio disponible
      const tooltipWidth = 320; // Ancho mínimo del tooltip
      const tooltipHeight = 400; // Alto aproximado del tooltip
      const padding = 20;

      let x = event.clientX + 15;
      let y = event.clientY + 15;

      // Si se sale por la derecha, colocar a la izquierda del cursor
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = event.clientX - tooltipWidth - 15;
      }

      // Si se sale por abajo, colocar arriba del cursor
      if (y + tooltipHeight > window.innerHeight - padding) {
        y = event.clientY - tooltipHeight - 15;
      }

      // Asegurar que no se salga por arriba o izquierda
      x = Math.max(padding, x);
      y = Math.max(padding, y);

      this.tooltipPosition.set({ x, y });
      this.tooltipVisible.set(true);
    } else {
      this.tooltipVisible.set(false);
    }
  }

  private onMarkerHover(event: PointerEvent) {
    if (!this.renderer || !this.camera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers, false);

    // Solo cambiar cursor
    this.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  }

  cerrarTooltip() {
    this.tooltipVisible.set(false);
  }

  // =================================================================
  // UTILIDADES
  // =================================================================

  private latLngTo3D(lat: number, lng: number, radius: number) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // =================================================================
  // MÉTODOS PÚBLICOS
  // =================================================================

  onFilterChange() {
    this.refrescarMarcadores();
  }

  resetearFiltros(): void {
    this.filtroUsuario.set('Todos');
    this.filtroContinente.set('Todos');
    this.filtroTipo.set('Todos');
    this.busquedaTexto.set('');
    this.refrescarMarcadores();
  }

  getColorHex(userName: string): string {
    const colorNum = this.getColorForUser(userName);
    return '#' + colorNum.toString(16).padStart(6, '0');
  }

  resetearCamara(): void {
    if (!this.camera || !this.controls) return;

    const targetPosition = new THREE.Vector3(0, 0, 500);
    const startPosition = this.camera.position.clone();
    const duration = 1000;
    const startTime = Date.now();

    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
    };

    animateCamera();
  }

  toggleRotacion(): void {
    this.rotacionActiva.update(v => !v);
  }

  toggleEstadisticas(): void {
    this.mostrarEstadisticas.update(v => !v);
  }

  toggleTema(): void {
    this.temaOscuro.update(v => !v);
    this.guardarPreferencias();
  }

  cambiarVelocidadRotacion(velocidad: 'lenta' | 'normal' | 'rapida'): void {
    const velocidades = {
      lenta: 0.0005,
      normal: 0.001,
      rapida: 0.002
    };
    this.velocidadRotacion = velocidades[velocidad];
  }

  enfocarContinente(continente: string): void {
    if (continente === 'Todos') {
      this.resetearCamara();
      return;
    }

    const viajesContinente = this.filteredTrips().filter(v => v.continent === continente);
    if (viajesContinente.length === 0) return;

    // Calcular centro promedio
    let sumLat = 0, sumLng = 0;
    viajesContinente.forEach(v => {
      if (v.lat && v.lng) {
        sumLat += v.lat;
        sumLng += v.lng;
      }
    });

    const avgLat = sumLat / viajesContinente.length;
    const avgLng = sumLng / viajesContinente.length;

    // Mover cámara al centro
    const targetPos = this.latLngTo3D(avgLat, avgLng, 400);
    const startPos = this.camera.position.clone();
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, easeProgress);
      this.controls.target.copy(this.latLngTo3D(avgLat, avgLng, 0));
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  verDetalles(viaje: ViajeConUsuario): void {
    console.log('Ver detalles de:', viaje);
    // Implementar navegación o modal
  }

  exportarDatos(): void {
    const data = {
      filtros: {
        usuario: this.filtroUsuario(),
        continente: this.filtroContinente(),
        tipo: this.filtroTipo()
      },
      viajes: this.filteredTrips(),
      estadisticas: {
        total: this.filteredTrips().length,
        realizados: this.viajesRealizados(),
        wishlist: this.viajesWishlist(),
        continentes: this.continentesUnicos()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viajes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  compartirMapa(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Mapa Global de Viajes',
        text: `¡Mira nuestro mapa de viajes! ${this.allTrips().length} destinos explorados.`,
        url: url
      }).catch(err => console.log('Error compartiendo:', err));
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        this.toastSvc.success('¡URL copiada al portapapeles!');
      });
    }
  }

  capturarPantalla(): void {
    if (!this.renderer) return;

    this.renderer.render(this.scene, this.camera);
    const screenshot = this.renderer.domElement.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = screenshot;
    a.download = `mapa-viajes-${new Date().toISOString().split('T')[0]}.png`;
    a.click();
  }

  // Preferencias (localStorage)
  private cargarPreferencias(): void {
    const prefs = localStorage.getItem('mapa-preferencias');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      this.temaOscuro.set(parsed.temaOscuro || false);
      this.mostrarEstadisticas.set(parsed.mostrarEstadisticas ?? true);
    }
  }

  private guardarPreferencias(): void {
    const prefs = {
      temaOscuro: this.temaOscuro(),
      mostrarEstadisticas: this.mostrarEstadisticas()
    };
    localStorage.setItem('mapa-preferencias', JSON.stringify(prefs));
  }

  // Estadísticas por usuario
  getViajesPorUsuario(userName: string): number {
    return this.allTrips().filter(v => v.userName === userName).length;
  }

  getContinentesMasVisitados(): { continente: string; count: number }[] {
    const counts: Record<string, number> = {};
    this.allTrips().forEach(v => {
      counts[v.continent] = (counts[v.continent] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([continente, count]) => ({ continente, count }))
      .sort((a, b) => b.count - a.count);
  }

  contarViajesPorTipo(tipo: 'realizado' | 'wishlist'): number {
    return this.allTrips().filter(v => v.tipo === tipo).length;
  }

  contarContinentesUnicos(): number {
    const continentes = new Set(this.allTrips().map(v => v.continent));
    return continentes.size;
  }
}