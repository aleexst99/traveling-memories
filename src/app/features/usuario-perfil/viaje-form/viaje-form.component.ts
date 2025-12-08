import { Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ViajesService } from '../viajes/services/viaje.service';
import { Viaje } from '../viajes/models/viajes.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viaje-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './viaje-form.component.html',
  styleUrls: ['./viaje-form.component.scss']
})
export class ViajeFormComponent {

  @Input() idUser!: number;
  @Output() guardar = new EventEmitter<Viaje>();
  @Output() cerrar = new EventEmitter<void>();

  paises = signal<any[]>([]);
  filtrados = signal<any[]>([]);

  // 🧱 Reactivo (sin ngModel)
  form = this.fb.group({
    title: ['', Validators.required],
    continent: [''],
    image: [''],
    description: [''],
    tipo: ['wishlist', Validators.required],
    lat: [null],
    lng: [null],
  });

  constructor(private fb: FormBuilder, private paisesSrv: ViajesService) {}

  ngOnInit() {
    this.paisesSrv.getPaises().subscribe((data: any[]) => {
      this.paises.set(data);
      this.filtrados.set(data);
    });
  }

  filtrar(texto: string) {
    const result = this.paises().filter(p =>
      p.name.common.toLowerCase().includes(texto.toLowerCase())
    );
    this.filtrados.set(result);
  }

  seleccionarPais(pais: any) {
    this.form.patchValue({
      title: pais.name.common,
      continent: pais.region,
      lat: pais.latlng[0],
      lng: pais.latlng[1]
    });
  }

  guardarViaje() {
    const raw = this.form.value;

    const viaje: Viaje = {
      id: Date.now(),
      id_user: this.idUser,
      title: raw.title!,
      continent: raw.continent!,
      image: raw.image ?? '',
      description: raw.description ?? '',
      lat: raw.lat ?? undefined,
      lng: raw.lng ?? undefined,
      tipo: raw.tipo as 'wishlist' | 'realizado'
    };

    this.guardar.emit(viaje);
  }
}
