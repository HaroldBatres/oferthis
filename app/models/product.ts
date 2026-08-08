export type Producto = {
  id: number;
  nombre: string;
  tienda: string;
  precio: string;
  antes: string;
  descuento: string;
  categoria: string;
  imagen: string;
  url?: string;

  // Campos opcionales
  valoracion?: number;
  opiniones?: number;
  entrega?: string;
  etiqueta?: string;
  disponible?: boolean;
  ultimaActualizacion?: string;

  historialPrecios?: {
    fecha: string;
    precio: string;
  }[];
};