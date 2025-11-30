import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { User } from '../usuario-perfil/models/user.model';
import { ViajeConUsuario } from '../usuario-perfil/viajes/models/viajes.model';
import { FormsModule } from '@angular/forms';

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

  // Texturas
  private planeIconUrl = '../../../assets/icons/plane.png';
  private starIconUrl = '../../../assets/icons/star.png';
  private planeTexture!: THREE.Texture;
  private starTexture!: THREE.Texture;

  // Colores por usuario
  private userColorMap: Record<string, number> = {};
  private availableColors = [0x1976d2, 0x000000, 0xe91e63, 0x4caf50, 0xff9800, 0x9c27b0];

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
  private hoveredMarker: THREE.Object3D | null = null;

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

  constructor(private http: HttpClient) {}

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
    this.http.get<User[]>('assets/data/users.json').subscribe({
      next: (users) => {
        this.usuarios.set(users);

        const trips: ViajeConUsuario[] = [];

        users.forEach((u) => {
          u.trips.forEach((t) =>
            trips.push({
              ...t,
              userName: u.name,
              userPhoto: u.photo,
              tipo: 'realizado',
            })
          );

          u.wishlist.forEach((w) =>
            trips.push({
              ...w,
              userName: u.name,
              userPhoto: u.photo,
              tipo: 'wishlist',
            })
          );
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

    // Texturas de iconos
    const loader = new THREE.TextureLoader();
    this.planeTexture = loader.load(this.planeIconUrl);
    this.starTexture = loader.load(this.starIconUrl);

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

    this.markers.forEach((m) => this.scene.remove(m));
    this.markers = [];

    this.filteredTrips().forEach((v) => {
      if (v.lat == null || v.lng == null) return;

      const texture = v.tipo === 'wishlist' ? this.starTexture : this.planeTexture;
      const userColor = this.getColorForUser(v.userName);

      const material = new THREE.SpriteMaterial({
        map: texture,
        color: new THREE.Color(userColor),
        transparent: true,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(5, 5, 1);

      const pos = this.latLngTo3D(v.lat, v.lng, 202);
      sprite.position.copy(pos);

      sprite.userData = { viaje: v };

      this.scene.add(sprite);
      this.markers.push(sprite);
    });
  }

  private getColorForUser(userName: string): number {
    if (this.userColorMap[userName]) return this.userColorMap[userName];

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
      this.tooltipPosition.set({
        x: event.clientX,
        y: event.clientY
      });
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
    const intersects = this.raycaster.intersectObjects(this.markers, true);

    if (intersects.length > 0) {
      const marker = intersects[0].object;

      if (this.hoveredMarker !== marker) {
        // Restaurar escala del anterior
        if (this.hoveredMarker) {
          this.hoveredMarker.scale.set(5, 5, 1);
        }

        // Agrandar el actual
        marker.scale.set(7, 7, 1);
        this.hoveredMarker = marker;
        this.renderer.domElement.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredMarker) {
        this.hoveredMarker.scale.set(5, 5, 1);
        this.hoveredMarker = null;
      }
      this.renderer.domElement.style.cursor = 'default';
    }
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
        alert('¡URL copiada al portapapeles!');
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