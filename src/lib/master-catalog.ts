export type MasterProduct = {
  name: string;
  barcode: string;
  categoryName: string;
  unitType: 'UNIT' | 'KILOGRAM';
  suggestedCost: number;
  suggestedPrice: number;
};

export const MASTER_BODEGA_PRODUCTS: MasterProduct[] = [
  { name: 'Gaseosa Inca Kola 500ml', barcode: '7750182001018', categoryName: 'Bebidas y Gaseosas', unitType: 'UNIT', suggestedCost: 2.00, suggestedPrice: 2.70 },
  { name: 'Gaseosa Coca Cola 500ml', barcode: '7750182001025', categoryName: 'Bebidas y Gaseosas', unitType: 'UNIT', suggestedCost: 2.00, suggestedPrice: 2.70 },
  { name: 'Gaseosa Inca Kola 1.5L', barcode: '7750182001032', categoryName: 'Bebidas y Gaseosas', unitType: 'UNIT', suggestedCost: 4.50, suggestedPrice: 5.80 },
  { name: 'Gaseosa Coca Cola 1.5L', barcode: '7750182001049', categoryName: 'Bebidas y Gaseosas', unitType: 'UNIT', suggestedCost: 4.50, suggestedPrice: 5.80 },
  { name: 'Agua San Luis 625ml Sin Gas', barcode: '7750182002015', categoryName: 'Bebidas y Gaseosas', unitType: 'UNIT', suggestedCost: 1.20, suggestedPrice: 2.00 },
  { name: 'Cerveza Cristal 650ml Botella', barcode: '7750243000013', categoryName: 'Cervezas y Licores', unitType: 'UNIT', suggestedCost: 5.20, suggestedPrice: 7.00 },
  { name: 'Cerveza Pilsen Callao 630ml', barcode: '7750243000020', categoryName: 'Cervezas y Licores', unitType: 'UNIT', suggestedCost: 5.20, suggestedPrice: 7.00 },
  { name: 'Leche Gloria Evaporada Azul 400g', barcode: '7750880000011', categoryName: 'Lácteos y Huevos', unitType: 'UNIT', suggestedCost: 3.50, suggestedPrice: 4.20 },
  { name: 'Yogurt Gloria Fresa 1L', barcode: '7750880000028', categoryName: 'Lácteos y Huevos', unitType: 'UNIT', suggestedCost: 5.50, suggestedPrice: 7.00 },
  { name: 'Arroz Superior Costeño 1kg', barcode: '7750123000011', categoryName: 'Abarrotes', unitType: 'UNIT', suggestedCost: 3.80, suggestedPrice: 4.50 },
  { name: 'Arroz Criollo a Granel (x kg)', barcode: '', categoryName: 'Abarrotes', unitType: 'KILOGRAM', suggestedCost: 3.20, suggestedPrice: 3.90 },
  { name: 'Azúcar Rubia DPA 1kg', barcode: '7750123000028', categoryName: 'Abarrotes', unitType: 'UNIT', suggestedCost: 3.40, suggestedPrice: 4.00 },
  { name: 'Azúcar Rubia a Granel (x kg)', barcode: '', categoryName: 'Abarrotes', unitType: 'KILOGRAM', suggestedCost: 3.00, suggestedPrice: 3.60 },
  { name: 'Aceite Vegetal Primor 1L', barcode: '7750123000035', categoryName: 'Abarrotes', unitType: 'UNIT', suggestedCost: 7.50, suggestedPrice: 9.00 },
  { name: 'Fideos Don Vittorio Tallarín 500g', barcode: '7750123000042', categoryName: 'Abarrotes', unitType: 'UNIT', suggestedCost: 2.40, suggestedPrice: 3.20 },
  { name: 'Galletas Soda Field Paquete', barcode: '7750123000059', categoryName: 'Snacks y Golosinas', unitType: 'UNIT', suggestedCost: 0.70, suggestedPrice: 1.00 },
  { name: 'Galletas Oreo Paquete 36g', barcode: '7750123000066', categoryName: 'Snacks y Golosinas', unitType: 'UNIT', suggestedCost: 0.80, suggestedPrice: 1.20 },
  { name: 'Chocolate Sublime 30g', barcode: '7750123000073', categoryName: 'Snacks y Golosinas', unitType: 'UNIT', suggestedCost: 1.40, suggestedPrice: 2.00 },
  { name: 'Detergente Bolívar 500g', barcode: '7750123000080', categoryName: 'Limpieza e Higiene', unitType: 'UNIT', suggestedCost: 4.20, suggestedPrice: 5.50 },
  { name: 'Jabón Bolívar Blanco 210g', barcode: '7750123000097', categoryName: 'Limpieza e Higiene', unitType: 'UNIT', suggestedCost: 2.50, suggestedPrice: 3.20 },
  { name: 'Papel Higiénico Suave 4 Rollos', barcode: '7750123000103', categoryName: 'Limpieza e Higiene', unitType: 'UNIT', suggestedCost: 3.50, suggestedPrice: 4.80 },
  { name: 'Atún Primor Trozos de Atún 170g', barcode: '7750123000110', categoryName: 'Abarrotes', unitType: 'UNIT', suggestedCost: 4.50, suggestedPrice: 5.80 },
  { name: 'Huevos de Gallina Frescos (x kg)', barcode: '', categoryName: 'Lácteos y Huevos', unitType: 'KILOGRAM', suggestedCost: 7.50, suggestedPrice: 9.00 },
  { name: 'Pan Francés (x unidad)', barcode: '', categoryName: 'Panadería y Embutidos', unitType: 'UNIT', suggestedCost: 0.25, suggestedPrice: 0.40 },
];
