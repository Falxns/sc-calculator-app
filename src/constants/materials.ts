export interface Material {
  imgSrc: string;
  label: string;
  defaultPrice: number;
}

export const MATERIALS: Material[] = [
  { imgSrc: 'slastena', label: 'Slastena', defaultPrice: 9000 },
  { imgSrc: 'solevik', label: 'Solevik', defaultPrice: 2000 },
  { imgSrc: 'kub', label: 'Kub', defaultPrice: 2000 },
  { imgSrc: 'limonnik', label: 'Limonnik', defaultPrice: 2000 },
  { imgSrc: 'spirten', label: 'Spirten', defaultPrice: 400 },
  { imgSrc: 'myatnoplod', label: 'Myatnoplod', defaultPrice: 150 },
];

export const createDefaultCalculators = () =>
  MATERIALS.map((material) => ({
    id: crypto.randomUUID(),
    imgSrc: material.imgSrc,
    price: material.defaultPrice,
    quantity: 0,
  }));

export const createCalculator = (imgSrc: string = MATERIALS[0].imgSrc) => {
  const material = MATERIALS.find((m) => m.imgSrc === imgSrc) ?? MATERIALS[0];
  return {
    id: crypto.randomUUID(),
    imgSrc: material.imgSrc,
    price: material.defaultPrice,
    quantity: 0,
  };
};
