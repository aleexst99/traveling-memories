import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../core/storage.service';
import { Entrada } from '../models/viajes.model';

@Component({
  selector: 'app-viaje-entrada',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './viaje-entrada.component.html',
  styleUrl: './viaje-entrada.component.scss'
})
export class ViajeEntradaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private fb = inject(FormBuilder);

  viajeId!: number;
  userId!: number;
  entradaExistente: Entrada | null = null;
  esEdicion = false;

  form = this.fb.group({
    title: ['', Validators.required],
    fecha: [''],
    dias: [null as number | null],
    description: [''],
    image: [''],
  });

  ngOnInit() {
    this.viajeId = Number(this.route.snapshot.paramMap.get('viajeId'));
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    const entradaId = Number(this.route.snapshot.queryParamMap.get('entradaId'));
    if (entradaId) {
      const entrada = this.storage.getEntradas(this.viajeId).find(e => e.id === entradaId) ?? null;
      if (entrada) {
        this.entradaExistente = entrada;
        this.esEdicion = true;
        this.form.patchValue({
          title: entrada.title,
          fecha: entrada.fecha ?? '',
          dias: entrada.dias ?? null,
          description: entrada.description ?? '',
          image: entrada.image ?? '',
        });
      }
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => this.form.controls.image.setValue(e.target?.result as string);
    reader.readAsDataURL(input.files[0]);
  }

  guardar() {
    if (this.form.invalid) return;
    const raw = this.form.value;

    const entrada: Entrada = {
      id: this.entradaExistente?.id ?? Date.now(),
      id_viaje: this.viajeId,
      title: raw.title!,
      fecha: raw.fecha || undefined,
      dias: raw.dias || undefined,
      description: raw.description || undefined,
      image: raw.image || this.entradaExistente?.image || undefined,
    };

    this.storage.saveEntrada(this.viajeId, entrada);
    this.router.navigate(['/user', this.userId, 'viaje', this.viajeId]);
  }

  cancelar() {
    this.router.navigate(['/user', this.userId, 'viaje', this.viajeId]);
  }
}
